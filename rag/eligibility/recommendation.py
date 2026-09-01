"""
rag/eligibility/recommendation.py — Scheme recommendation ranking.

Scores retrieved schemes against the farmer profile using configurable weights.
Produces transparent, evidence-grounded SchemeRecommendation objects.

No LLM calls — scoring is deterministic and auditable.

Public API
----------
rank_schemes(profile, eligibility_results, retrieval_result)  →  list[SchemeRecommendation]
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Tuple

import config
from eligibility.models import (
    EligibilityFarmerProfile,
    EligibilityResult,
    EligibilityStatus,
    SchemeRecommendation,
)
from retrieval.models import RetrievalCandidate, RetrievalResult

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Score weights (configurable via env vars in config.py)
# ---------------------------------------------------------------------------

def _get_weights() -> Dict[str, float]:
    return {
        "semantic_relevance": config.ELIGIBILITY_WEIGHT_SEMANTIC,
        "state_match":        config.ELIGIBILITY_WEIGHT_STATE,
        "crop_match":         config.ELIGIBILITY_WEIGHT_CROP,
        "eligibility_match":  config.ELIGIBILITY_WEIGHT_ELIGIBILITY,
        "official_source":    config.ELIGIBILITY_WEIGHT_OFFICIAL,
        "document_freshness": config.ELIGIBILITY_WEIGHT_FRESHNESS,
    }


# ---------------------------------------------------------------------------
# Individual score components
# ---------------------------------------------------------------------------

def _score_semantic(chunks: List[RetrievalCandidate]) -> float:
    """Best semantic score among retrieved chunks for this scheme (already normalised 0–1)."""
    if not chunks:
        return 0.0
    return max(c.semantic_score for c in chunks)


def _score_state(profile: EligibilityFarmerProfile, chunks: List[RetrievalCandidate]) -> float:
    """
    1.0 if scheme is central (always applicable),
    0.8 if scheme's state matches farmer's state,
    0.0 if scheme is state-specific and doesn't match.
    """
    if not profile.state:
        return 0.5   # unknown state → moderate score
    state_slug = profile.state.lower().replace(" ", "_")

    for chunk in chunks:
        gov = chunk.government_level.lower()
        if gov == "central":
            return 1.0
        cs = (chunk.state or "").lower().replace(" ", "_")
        if cs == state_slug or cs == "":
            return 0.8
    return 0.2


def _score_crop(profile: EligibilityFarmerProfile, chunks: List[RetrievalCandidate]) -> float:
    """1.0 if farmer's crop(s) appear in retrieved text, else 0.0."""
    if not profile.crops:
        return 0.5   # unknown crop → neutral

    crops_lower = {c.lower() for c in profile.crops}
    for chunk in chunks:
        text_lower = chunk.chunk_text.lower()
        if any(crop in text_lower for crop in crops_lower):
            return 1.0
    return 0.0


def _score_eligibility_match(result: Optional[EligibilityResult]) -> float:
    """Convert eligibility status to a continuous score component."""
    if result is None:
        return 0.3   # no evaluation → neutral
    status_scores = {
        EligibilityStatus.ELIGIBLE: 1.0,
        EligibilityStatus.INSUFFICIENT_INFORMATION: 0.5,
        EligibilityStatus.INELIGIBLE: 0.0,
    }
    return status_scores.get(result.status, 0.3)


def _score_official_source(chunks: List[RetrievalCandidate]) -> float:
    """1.0 if any chunk is from an official source."""
    return 1.0 if any(c.official_source for c in chunks) else 0.4


def _score_freshness(chunks: List[RetrievalCandidate]) -> float:
    """Simple freshness score based on published_date year."""
    import datetime
    current_year = datetime.date.today().year
    max_score = 0.0
    for chunk in chunks:
        if chunk.published_date:
            try:
                year = int(str(chunk.published_date)[:4])
                age = max(0, current_year - year)
                score = max(0.0, 1.0 - age * 0.1)  # -10% per year old
                max_score = max(max_score, score)
            except (ValueError, TypeError):
                pass
    return max_score if max_score > 0 else 0.5


# ---------------------------------------------------------------------------
# Reason builder
# ---------------------------------------------------------------------------

def _build_reasons(
    profile: EligibilityFarmerProfile,
    chunks: List[RetrievalCandidate],
    result: Optional[EligibilityResult],
    score_breakdown: Dict[str, float],
) -> List[str]:
    """Build evidence-grounded human-readable reasons for the recommendation."""
    reasons = []

    if chunks:
        scheme_name = chunks[0].scheme_name
        doc_title = chunks[0].document_title
        reasons.append(f"Retrieved from official documents: '{doc_title}'")

    gov_level = chunks[0].government_level.capitalize() if chunks else "Central"
    reasons.append(f"{gov_level} Government scheme")

    if profile.state and score_breakdown.get("state_match", 0) >= 0.8:
        reasons.append(f"Applicable to farmers in {profile.state}")

    if profile.crop and score_breakdown.get("crop_match", 0) >= 0.8:
        reasons.append(f"Relevant to {profile.crop} cultivation based on retrieved text")

    if result:
        if result.matched_conditions:
            n = len(result.matched_conditions)
            reasons.append(f"{n} eligibility condition(s) appear to match your profile")
        if result.missing_information:
            reasons.append("Some eligibility conditions could not be verified — more information needed")
        if result.failed_conditions:
            reasons.append("One or more documented eligibility conditions were not met")

    return reasons[:5]  # cap at 5 reasons


# ---------------------------------------------------------------------------
# Main ranking function
# ---------------------------------------------------------------------------

def rank_schemes(
    profile: EligibilityFarmerProfile,
    eligibility_results: List[EligibilityResult],
    retrieval_result: RetrievalResult,
) -> List[SchemeRecommendation]:
    """
    Rank retrieved schemes for the farmer profile.

    Returns a sorted list of SchemeRecommendation (highest score first).
    Separates into central_schemes and state_schemes within the result.
    """
    weights = _get_weights()

    # Map scheme_id → eligibility result
    elig_by_scheme: Dict[str, EligibilityResult] = {
        r.scheme_id: r for r in eligibility_results
    }

    # Map scheme_id → chunks
    chunks_by_scheme: Dict[str, List[RetrievalCandidate]] = {}
    for chunk in retrieval_result.results:
        chunks_by_scheme.setdefault(chunk.scheme_id, []).append(chunk)

    recommendations: List[SchemeRecommendation] = []

    for scheme_id, chunks in chunks_by_scheme.items():
        elig_result = elig_by_scheme.get(scheme_id)
        gov_level = chunks[0].government_level if chunks else "central"
        state = chunks[0].state if chunks else None
        scheme_name = chunks[0].scheme_name if chunks else scheme_id

        # Compute score components
        score_breakdown = {
            "semantic_relevance": _score_semantic(chunks),
            "state_match":        _score_state(profile, chunks),
            "crop_match":         _score_crop(profile, chunks),
            "eligibility_match":  _score_eligibility_match(elig_result),
            "official_source":    _score_official_source(chunks),
            "document_freshness": _score_freshness(chunks),
        }

        # Weighted total
        total = sum(score_breakdown[k] * weights[k] for k in weights)
        total = min(1.0, max(0.0, total))

        reasons = _build_reasons(profile, chunks, elig_result, score_breakdown)

        # Build source citations
        sources = _build_sources(chunks[:3])

        elig_status = elig_result.status if elig_result else EligibilityStatus.INSUFFICIENT_INFORMATION

        rec = SchemeRecommendation(
            scheme_id=scheme_id,
            scheme_name=scheme_name,
            government_level=gov_level,
            state=state,
            relevance_score=total,
            eligibility_status=elig_status,
            reasons=reasons,
            sources=sources,
            score_breakdown=score_breakdown,
        )
        recommendations.append(rec)

    # Sort by relevance score descending
    recommendations.sort(key=lambda r: r.relevance_score, reverse=True)

    log.info(
        "Ranked %d scheme recommendations for profile state=%s crop=%s",
        len(recommendations), profile.state, profile.crop,
    )
    return recommendations


def _build_sources(chunks: List[RetrievalCandidate]) -> List[Dict]:
    """Build citation info from top chunks for a scheme."""
    seen = set()
    sources = []
    for chunk in chunks:
        key = (chunk.document_title, chunk.page_number)
        if key in seen:
            continue
        seen.add(key)
        sources.append({
            "document_title": chunk.document_title,
            "page_number": chunk.page_number,
            "section": chunk.section or "General",
            "source_url": chunk.source_url or "",
            "official_source": chunk.official_source,
            "government_level": chunk.government_level,
        })
    return sources


def split_by_level(
    recommendations: List[SchemeRecommendation],
) -> Tuple[List[SchemeRecommendation], List[SchemeRecommendation]]:
    """Split recommendations into (central_schemes, state_schemes)."""
    central = [r for r in recommendations if r.government_level == "central"]
    state = [r for r in recommendations if r.government_level != "central"]
    return central, state
