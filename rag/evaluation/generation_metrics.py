"""
rag/evaluation/generation_metrics.py — Generation quality evaluation.

Two modes:
  1. Deterministic (always available):
     - Citation validity (via citation_metrics.py)
     - Hallucination trap detection (checks for uncertainty phrases)
     - Eligibility 3-state accuracy

  2. LLM-as-judge (gated by config.RAG_ENABLE_LLM_EVALUATION):
     - Faithfulness (are claims supported by context?)
     - Answer relevance (does the answer address the question?)

Public API
----------
evaluate_faithfulness(question, context, answer)  → float | None
evaluate_answer_relevance(question, answer)        → float | None
is_uncertainty_expressed(answer)                   → bool
"""

from __future__ import annotations

import json
import logging
import re
from typing import List, Optional

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Uncertainty / Hedging phrase detection
# ---------------------------------------------------------------------------

_UNCERTAINTY_PATTERNS = [
    r"\bnot (found|available|mentioned|covered|stated|documented|specified)\b",
    r"\bunable to (confirm|verify|find)\b",
    r"\binsufficient (information|data|evidence)\b",
    r"\bI (cannot|can't|could not|couldn't) (find|confirm|verify)\b",
    r"\bno (information|data|evidence|details?) (found|available)\b",
    r"\bnot in (the|my|our) (document|corpus|database|knowledge)\b",
    r"\bcannot (confirm|verify|guarantee)\b",
    r"\bunclear\b",
    r"\bdo not have enough\b",
    r"\bconsult (the|an?) (official|government)\b",
    r"\bplease (check|verify|confirm)\b",
    r"\bnahi mil\b",      # Hindi: not found
    r"\bpata nahi\b",    # Hindi: don't know
    r"\bjankari nahi\b", # Hindi: no information
    r"\bsampark (karein|karo)\b",  # Hindi: contact
]
_UNCERTAINTY_RE = re.compile("|".join(_UNCERTAINTY_PATTERNS), re.IGNORECASE)


def is_uncertainty_expressed(answer: str) -> bool:
    """
    Returns True if the answer expresses uncertainty or inability to answer.
    Used to check hallucination traps — the system should express uncertainty
    when no corpus evidence exists.
    """
    return bool(_UNCERTAINTY_RE.search(answer))


# ---------------------------------------------------------------------------
# Eligibility accuracy helpers
# ---------------------------------------------------------------------------

_ELIGIBILITY_STATUS_RE = re.compile(
    # Match INELIGIBLE and INSUFFICIENT_INFORMATION first (they contain ELIGIBLE as substring)
    r"\b(INELIGIBLE|INSUFFICIENT_INFORMATION)\b"
    r"|"
    # Only match standalone ELIGIBLE when NOT preceded by 'in', 'not ', 'un'
    r"(?<!\bin)(?<!not )(?<!un)\b(ELIGIBLE)\b",
    re.IGNORECASE,
)


def extract_eligibility_decision(text: str) -> Optional[str]:
    """
    Extract an eligibility decision label from an answer or eligibility result.
    Returns "ELIGIBLE", "INELIGIBLE", "INSUFFICIENT_INFORMATION", or None.
    """
    # Fuzzy natural language first (most reliable for 'not eligible' patterns)
    t = text.lower()
    if "ineligible" in t or "not eligible" in t or "cannot avail" in t or "not qualify" in t:
        return "INELIGIBLE"
    if any(p in t for p in ["insufficient_information", "insufficient information",
                             "not enough information", "more information needed", "need more"]):
        return "INSUFFICIENT_INFORMATION"

    # Regex for explicit labels in structured output
    m = _ELIGIBILITY_STATUS_RE.search(text)
    if m:
        label = (m.group(1) or m.group(2)).upper()
        return label

    # Remaining fuzzy patterns
    if "insufficient" in t or "missing" in t or "not enough" in t:
        return "INSUFFICIENT_INFORMATION"
    if re.search(r"(?<!not )(?<!in)eligible", t):
        return "ELIGIBLE"
    return None


# ---------------------------------------------------------------------------
# LLM-as-judge (optional, gated behind RAG_ENABLE_LLM_EVALUATION)
# ---------------------------------------------------------------------------

_FAITHFULNESS_SYSTEM_PROMPT = """You are an expert evaluator for an AI assistant that answers questions about Indian government agricultural schemes.

Your task is to evaluate whether the GENERATED ANSWER is faithful to the RETRIEVED CONTEXT.

RULES:
1. Only evaluate based on the RETRIEVED CONTEXT provided — do NOT use your own knowledge about government policies.
2. A claim is faithful if it is directly stated or clearly implied by the Retrieved Context.
3. A claim is unfaithful if it is not found in or contradicts the Retrieved Context.
4. Ignore stylistic differences, only evaluate factual faithfulness.
5. If the answer correctly expresses uncertainty when the context is insufficient, rate faithfulness as 1.0.

Respond with a JSON object only:
{"faithfulness": 0.0-1.0, "reason": "brief explanation"}"""

_RELEVANCE_SYSTEM_PROMPT = """You are an expert evaluator for an AI assistant.

Your task is to evaluate whether the GENERATED ANSWER is relevant to the QUESTION.

RULES:
1. Rate relevance 0.0 to 1.0 based on how well the answer addresses what the farmer asked.
2. An answer that says "I don't know" when appropriate is still relevant (1.0).
3. An answer that changes the subject or ignores the question is irrelevant (0.0).

Respond with a JSON object only:
{"answer_relevance": 0.0-1.0, "reason": "brief explanation"}"""


def evaluate_faithfulness(
    question: str,
    context: str,
    answer: str,
) -> Optional[float]:
    """
    Use LLM to evaluate faithfulness of answer to retrieved context.
    Returns None if LLM evaluation is disabled or fails.
    """
    try:
        from rag import config
        if not config.RAG_ENABLE_LLM_EVALUATION:
            return None
        if not config.LLM_API_KEY:
            return None

        from groq import Groq
        client = Groq(api_key=config.LLM_API_KEY)

        user_content = (
            f"QUESTION:\n{question}\n\n"
            f"RETRIEVED CONTEXT:\n{context[:3000]}\n\n"
            f"GENERATED ANSWER:\n{answer}"
        )

        resp = client.chat.completions.create(
            model=config.LLM_MODEL,
            messages=[
                {"role": "system", "content": _FAITHFULNESS_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.0,
            max_tokens=200,
        )
        raw = (resp.choices[0].message.content or "").strip()
        parsed = json.loads(raw)
        score = float(parsed.get("faithfulness", 0.0))
        return max(0.0, min(1.0, score))

    except Exception as exc:
        log.warning("Faithfulness LLM eval failed: %s", exc)
        return None


def evaluate_answer_relevance(
    question: str,
    answer: str,
) -> Optional[float]:
    """
    Use LLM to evaluate whether the answer is relevant to the question.
    Returns None if LLM evaluation is disabled or fails.
    """
    try:
        from rag import config
        if not config.RAG_ENABLE_LLM_EVALUATION:
            return None
        if not config.LLM_API_KEY:
            return None

        from groq import Groq
        client = Groq(api_key=config.LLM_API_KEY)

        user_content = (
            f"QUESTION:\n{question}\n\n"
            f"GENERATED ANSWER:\n{answer}"
        )

        resp = client.chat.completions.create(
            model=config.LLM_MODEL,
            messages=[
                {"role": "system", "content": _RELEVANCE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.0,
            max_tokens=200,
        )
        raw = (resp.choices[0].message.content or "").strip()
        parsed = json.loads(raw)
        score = float(parsed.get("answer_relevance", 0.0))
        return max(0.0, min(1.0, score))

    except Exception as exc:
        log.warning("Answer relevance LLM eval failed: %s", exc)
        return None
