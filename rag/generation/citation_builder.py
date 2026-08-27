"""
rag/generation/citation_builder.py — Build citations, scheme info, and follow-up questions.

All citation data comes directly from retrieved chunk metadata — nothing fabricated.

Public API
----------
build_citations(included_chunks)                          →  list[SourceCitation]
extract_schemes(included_chunks, intent, language)        →  list[SchemeInfo]
build_follow_ups(qu, retrieval_result, language)          →  list[str]
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional

from rag.retrieval.models import QueryUnderstanding, RetrievalCandidate, RetrievalResult
from rag.generation.models import SchemeInfo, SourceCitation

log = logging.getLogger(__name__)

# Maximum follow-up questions to return
_MAX_FOLLOW_UPS = 3

# Relevance thresholds
_HIGH_RELEVANCE = 0.55
_MEDIUM_RELEVANCE = 0.40


def build_citations(
    included_chunks: List[RetrievalCandidate],
) -> List[SourceCitation]:
    """
    Build source citations from the chunks that were included in the LLM context.

    Citations come ONLY from retrieved metadata — no invention allowed.
    De-duplicated by (document_title, page_number) to avoid listing the same page twice.
    """
    citations: List[SourceCitation] = []
    seen: set[tuple] = set()

    for i, chunk in enumerate(included_chunks):
        key = (chunk.document_title, chunk.page_number)
        if key in seen:
            continue
        seen.add(key)

        citations.append(SourceCitation(
            source_id=f"source_{i + 1}",
            document_title=chunk.document_title,
            scheme_name=chunk.scheme_name,
            scheme_id=chunk.scheme_id,
            page_number=chunk.page_number,
            section=chunk.section or "General",
            source_url=chunk.source_url or "",
            official_source=chunk.official_source,
            government_level=chunk.government_level,
            published_date=chunk.published_date,
            document_version=chunk.document_version,
        ))

    log.debug("Built %d citations from %d chunks", len(citations), len(included_chunks))
    return citations


def extract_schemes(
    included_chunks: List[RetrievalCandidate],
    intent: str,
    language: str = "en",
) -> List[SchemeInfo]:
    """
    Extract distinct government schemes from the included chunks.

    Relevance is based on retrieval score; reason is derived from section/intent.
    De-duplicated by scheme_id — one SchemeInfo per scheme.
    """
    # Collect best chunk per scheme_id
    best_by_scheme: Dict[str, RetrievalCandidate] = {}
    for chunk in included_chunks:
        sid = chunk.scheme_id
        if sid not in best_by_scheme or chunk.final_score > best_by_scheme[sid].final_score:
            best_by_scheme[sid] = chunk

    schemes: List[SchemeInfo] = []
    for sid, chunk in sorted(best_by_scheme.items(), key=lambda x: -x[1].final_score):
        score = chunk.final_score
        if score >= _HIGH_RELEVANCE:
            relevance = "high"
        elif score >= _MEDIUM_RELEVANCE:
            relevance = "medium"
        else:
            relevance = "low"

        reason = _build_reason(chunk, intent, language)

        schemes.append(SchemeInfo(
            scheme_id=sid,
            scheme_name=chunk.scheme_name,
            relevance=relevance,
            reason=reason,
        ))

    return schemes


def _build_reason(chunk: RetrievalCandidate, intent: str, language: str) -> str:
    """Derive a grounded reason from chunk metadata + intent."""
    section = chunk.section or ""
    gov = chunk.government_level.capitalize()
    doc = chunk.document_title

    reason_map = {
        "eligibility": f"Contains eligibility information from {doc} ({gov} scheme)",
        "application_process": f"Contains application process from {doc}",
        "benefits": f"Contains benefit details from {doc}",
        "required_documents": f"Lists required documents in {doc}",
        "crop_insurance": f"Contains crop insurance information from {doc}",
        "crop_loss_assistance": f"Contains crop loss assistance details from {doc}",
        "financial_assistance": f"Contains financial assistance details from {doc}",
        "subsidy": f"Contains subsidy information from {doc}",
        "scheme_recommendation": f"Retrieved from {doc} — {gov} scheme relevant to your query",
        "deadline": f"Contains deadline/date information from {doc}",
        "grievance": f"Contains grievance process from {doc}",
        "general_information": f"Contains general information from {doc}",
    }
    return reason_map.get(intent, f"Retrieved from {doc} ({gov} scheme)")


# ---------------------------------------------------------------------------
# Follow-up questions
# ---------------------------------------------------------------------------

# Language-aware follow-up templates
_FOLLOW_UP_TEMPLATES = {
    "en": {
        "need_state": "Which state are you farming in? This will help identify relevant state-specific schemes.",
        "need_crop": "What crop do you grow? Scheme eligibility often depends on the crop.",
        "need_land": "How much land do you own or cultivate? Some schemes have land-size requirements.",
        "need_farmer_type": "Are you a small, marginal, or large farmer? Eligibility criteria often depend on this.",
        "need_crop_type": "Is the crop you grow notified under PMFBY in your district? This affects insurance eligibility.",
    },
    "hi": {
        "need_state": "आप किस राज्य में खेती करते हैं? इससे राज्य-विशिष्ट योजनाओं की पहचान करने में मदद मिलेगी।",
        "need_crop": "आप कौन सी फसल उगाते हैं? कई योजनाओं की पात्रता फसल पर निर्भर करती है।",
        "need_land": "आपके पास कितनी जमीन है? कुछ योजनाओं में भूमि के आकार की आवश्यकता होती है।",
        "need_farmer_type": "क्या आप छोटे, सीमांत या बड़े किसान हैं?",
        "need_crop_type": "क्या आपकी फसल आपके जिले में PMFBY के तहत अधिसूचित है?",
    },
    "hinglish": {
        "need_state": "Aap kis state mein kheti karte hain? State-specific schemes ke liye yeh jaroori hai.",
        "need_crop": "Aap kaunsi fasal ugate hain? Kai schemes ki eligibility fasal pe depend karti hai.",
        "need_land": "Aapke paas kitni zameen hai? Kuch schemes mein land size ka criteria hota hai.",
        "need_farmer_type": "Aap chhote, seemaant ya bade kisan hain?",
        "need_crop_type": "Kya aapki fasal aapke district mein PMFBY ke under notified hai?",
    },
}


def build_follow_ups(
    qu: QueryUnderstanding,
    retrieval_result: RetrievalResult,
    language: str = "en",
) -> List[str]:
    """
    Build up to _MAX_FOLLOW_UPS relevant follow-up questions.

    Questions are only asked when information is genuinely missing and useful.
    Do NOT ask unnecessary questions when enough context is available.
    """
    templates = _FOLLOW_UP_TEMPLATES.get(language, _FOLLOW_UP_TEMPLATES["en"])
    follow_ups: List[str] = []

    # If state is unknown and there are multiple gov_levels, ask for state
    if not qu.state:
        gov_levels = {r.government_level for r in retrieval_result.results}
        if "state" in gov_levels or len(gov_levels) > 1:
            follow_ups.append(templates["need_state"])

    # If crop is unknown and intent is crop-related
    crop_intents = {"crop_insurance", "crop_loss_assistance", "scheme_recommendation"}
    if not qu.crop and qu.intent in crop_intents:
        follow_ups.append(templates["need_crop"])

    # If land size unknown and eligibility is the intent
    if not qu.land_size and qu.intent == "eligibility":
        follow_ups.append(templates["need_land"])

    # If farmer type unknown and scheme_recommendation intent
    if not qu.farmer_type and qu.intent == "scheme_recommendation":
        follow_ups.append(templates["need_farmer_type"])

    return follow_ups[:_MAX_FOLLOW_UPS]
