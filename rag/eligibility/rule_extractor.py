"""
rag/eligibility/rule_extractor.py — LLM-based eligibility rule extraction.

Receives retrieved government document chunks and uses the Groq LLM to extract
structured eligibility conditions. Every condition retains a reference to the
original chunk as evidence.

Public API
----------
extract_rules(retrieved_chunks, scheme_ids=None)  →  list[EligibilityRule]
"""

from __future__ import annotations

import json
import logging
import re
import time
import uuid
from typing import Dict, List, Optional, Set

import config
from eligibility.models import (
    EligibilityCondition,
    EligibilityRule,
    RuleEvidence,
    SUPPORTED_OPERATORS,
)
from retrieval.models import RetrievalCandidate

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Extraction prompt
# ---------------------------------------------------------------------------

_EXTRACTION_SYSTEM_PROMPT = """You are a government document analyst extracting structured eligibility conditions.

RULES:
1. Extract ONLY conditions explicitly stated in the provided text.
2. Do NOT invent conditions not present in the text.
3. Do NOT use your general knowledge about government schemes.
4. Do NOT assume standard or typical eligibility rules.
5. If no clear eligibility condition exists in the text, return an empty conditions list.
6. Every condition must reference the SOURCE number it came from.

SUPPORTED FIELD NAMES (use exactly these):
- state                 (string)
- district              (string)
- land_size_acres       (numeric, in acres)
- land_ownership        (string: "owned", "leased", "sharecropping")
- crop                  (string)
- farmer_type           (string: "small_farmer", "marginal_farmer", "large_farmer")
- social_category       (string: "SC", "ST", "OBC", "general")
- gender                (string: "male", "female")
- age                   (numeric, in years)
- bank_account          (boolean)
- aadhaar_available     (boolean)
- kisan_credit_card     (boolean)
- crop_insurance_status (string: "insured", "not_insured")
- irrigation_type       (string)

SUPPORTED OPERATORS:
equals, not_equals, greater_than, greater_than_or_equal, less_than, less_than_or_equal,
contains, one_of, exists, not_exists

CONFIDENCE: 0.0 (very uncertain) to 1.0 (clearly stated in text)
Use lower confidence if the condition is implied but not explicitly stated.

OUTPUT FORMAT (strict JSON only, no markdown):
{
  "scheme_id": "...",
  "scheme_name": "...",
  "logic": "AND",
  "confidence": 0.9,
  "conditions": [
    {
      "field": "land_size_acres",
      "operator": "less_than_or_equal",
      "value": 5.0,
      "unit": "acre",
      "logic": "AND",
      "confidence": 0.95,
      "human_readable": "Land size must be 5 acres or less",
      "source_number": 1
    }
  ]
}"""


def _build_extraction_prompt(chunks: List[RetrievalCandidate], scheme_id: str) -> str:
    """Build the user-turn prompt for rule extraction."""
    lines = [
        f"Extract eligibility conditions for scheme '{scheme_id}' from the following government document excerpts.",
        "",
        "GOVERNMENT DOCUMENT EXCERPTS:",
        "------------------------------",
    ]
    for i, chunk in enumerate(chunks):
        lines += [
            f"SOURCE {i + 1}",
            f"Scheme: {chunk.scheme_name}",
            f"Document: {chunk.document_title}",
            f"Section: {chunk.section or 'General'}",
            f"Page: {chunk.page_number}",
            f"Text: {chunk.chunk_text}",
            "---",
        ]
    lines += [
        "",
        f"Extract structured eligibility conditions for scheme_id='{scheme_id}'.",
        "Return ONLY valid JSON. No markdown, no explanation.",
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# JSON parsing with fallback
# ---------------------------------------------------------------------------

def _parse_llm_json(raw: str) -> Optional[Dict]:
    """Parse LLM JSON output, stripping markdown fences if present."""
    # Strip ```json ... ``` fences
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract first JSON object
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return None


# ---------------------------------------------------------------------------
# Rule extractor
# ---------------------------------------------------------------------------

def _build_condition(cond_data: Dict, chunks: List[RetrievalCandidate]) -> Optional[EligibilityCondition]:
    """Convert a raw LLM-produced condition dict into an EligibilityCondition."""
    field = cond_data.get("field", "")
    operator = cond_data.get("operator", "")

    if operator not in SUPPORTED_OPERATORS:
        log.debug("Skipping condition with unsupported operator: %r", operator)
        return None

    # Attach evidence from the source chunk
    source_num = cond_data.get("source_number", 1)
    chunk_idx = max(0, min(source_num - 1, len(chunks) - 1))
    chunk = chunks[chunk_idx] if chunks else None
    evidence = None
    if chunk:
        evidence = RuleEvidence(
            chunk_id=chunk.chunk_id,
            page_number=chunk.page_number,
            source_url=chunk.source_url or "",
            document_title=chunk.document_title,
            section=chunk.section or "General",
            raw_text=chunk.chunk_text[:300],
        )

    return EligibilityCondition(
        field=field,
        operator=operator,
        value=cond_data.get("value"),
        unit=cond_data.get("unit"),
        logic=cond_data.get("logic", "AND"),
        confidence=float(cond_data.get("confidence", 0.8)),
        evidence=evidence,
        human_readable=cond_data.get("human_readable", f"{field} {operator} {cond_data.get('value')}"),
    )


def extract_rules(
    retrieved_chunks: List[RetrievalCandidate],
    scheme_ids: Optional[Set[str]] = None,
    min_confidence: Optional[float] = None,
) -> List[EligibilityRule]:
    """
    Extract eligibility rules from retrieved document chunks using the LLM.

    Parameters
    ----------
    retrieved_chunks : Chunks from the retrieval layer.
    scheme_ids       : If set, only extract rules for these scheme IDs.
    min_confidence   : Minimum rule confidence threshold (default: config value).

    Returns
    -------
    list[EligibilityRule] — one per scheme, with conditions and evidence.
    """
    threshold = min_confidence if min_confidence is not None else config.ELIGIBILITY_MIN_RULE_CONFIDENCE
    request_id = str(uuid.uuid4())[:8]
    t_start = time.perf_counter()

    # Group chunks by scheme_id
    chunks_by_scheme: Dict[str, List[RetrievalCandidate]] = {}
    for chunk in retrieved_chunks:
        sid = chunk.scheme_id
        if scheme_ids and sid not in scheme_ids:
            continue
        chunks_by_scheme.setdefault(sid, []).append(chunk)

    if not chunks_by_scheme:
        log.info("[%s] No chunks to extract rules from", request_id)
        return []

    # Build Groq client
    try:
        from groq import Groq
        client = Groq(api_key=config.LLM_API_KEY)
    except Exception as exc:
        log.error("[%s] Could not build Groq client for rule extraction: %s", request_id, exc)
        return []

    rules: List[EligibilityRule] = []

    for scheme_id, chunks in chunks_by_scheme.items():
        # Use top N chunks for this scheme
        top_chunks = chunks[:config.ELIGIBILITY_MAX_RULES_PER_SCHEME]
        scheme_name = top_chunks[0].scheme_name if top_chunks else scheme_id

        log.info("[%s] Extracting rules for %s from %d chunks", request_id, scheme_id, len(top_chunks))

        prompt = _build_extraction_prompt(top_chunks, scheme_id)

        try:
            response = client.chat.completions.create(
                model=config.LLM_MODEL,
                messages=[
                    {"role": "system", "content": _EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,   # deterministic extraction
                max_tokens=1000,
            )
            raw = response.choices[0].message.content or ""
        except Exception as exc:
            log.error("[%s] LLM rule extraction failed for %s: %s", request_id, scheme_id, exc)
            continue

        parsed = _parse_llm_json(raw)
        if not parsed:
            log.warning("[%s] Could not parse LLM response for %s: %r", request_id, scheme_id, raw[:200])
            continue

        # Build conditions
        conditions = []
        for cond_data in parsed.get("conditions", []):
            cond = _build_condition(cond_data, top_chunks)
            if cond and cond.confidence >= threshold:
                conditions.append(cond)
            elif cond:
                log.debug("Dropped low-confidence condition: %s (%.2f < %.2f)", cond.field, cond.confidence, threshold)

        # Detect document version conflicts (multiple contradictory values for same field)
        conflict_warning = _detect_conflicts(conditions, top_chunks)

        rule = EligibilityRule(
            scheme_id=scheme_id,
            scheme_name=parsed.get("scheme_name", scheme_name),
            conditions=conditions,
            logic=parsed.get("logic", "AND"),
            confidence=float(parsed.get("confidence", 0.8)),
            conflict_warning=conflict_warning,
        )
        rules.append(rule)

    latency = int((time.perf_counter() - t_start) * 1000)
    log.info(
        "[%s] Rule extraction done: %d schemes, %d total conditions, %dms",
        request_id,
        len(rules),
        sum(len(r.conditions) for r in rules),
        latency,
    )
    return rules


def _detect_conflicts(
    conditions: List[EligibilityCondition],
    chunks: List[RetrievalCandidate],
) -> Optional[str]:
    """
    Detect if multiple document versions provide contradictory rules for the same field.
    Returns a warning string if conflict detected, else None.
    """
    # Group conditions by field
    field_values: Dict[str, List] = {}
    for cond in conditions:
        field_values.setdefault(cond.field, []).append(cond.value)

    conflicts = []
    for f, values in field_values.items():
        unique_vals = {str(v) for v in values}
        if len(unique_vals) > 1:
            conflicts.append(f"Field '{f}' has conflicting values: {', '.join(unique_vals)}")

    if conflicts:
        return (
            "Different versions of the government document contain different conditions. "
            "Please verify the latest official notification. Conflicts: " + "; ".join(conflicts)
        )
    return None
