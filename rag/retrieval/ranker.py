"""
rag/retrieval/ranker.py — Weighted scoring, deduplication, and re-ranking.

Scoring formula (all weights configurable via env vars in config.py):
----------------------------------------------------------------------
  final_score =
    semantic_score                          (Pinecone cosine, 0–1)
  + scheme_match_bonus   (0.15 default)     if chunk.scheme_id matches qu.scheme_id
  + state_match_bonus    (0.10 default)     if chunk.state matches qu.state_slug
  + official_src_bonus   (0.08 default)     if source_type contains "official"
  + intent_section_bonus (0.07 default)     if section heading matches intent keywords
  + freshness_bonus      (0–0.05)           scaled by published_date year (2020=0, 2025=max)

Deduplication:
--------------
  1. Remove exact duplicate chunk IDs.
  2. Group by (document_title, section) → keep only the highest-scored chunk per group.
  3. Sort by final_score descending.
  4. Truncate to top_k.

Public API
----------
rank_and_deduplicate(candidates, qu, top_k)  →  list[RetrievalCandidate]
"""

from __future__ import annotations

import logging
import re
from typing import Dict, List, Optional, Tuple

import config
from retrieval.models import QueryUnderstanding, RetrievalCandidate

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Intent → section keyword map for intent_section_bonus
# ---------------------------------------------------------------------------

_INTENT_SECTION_KEYWORDS: Dict[str, List[str]] = {
    "eligibility":          ["eligib", "who can", "criteria", "patr", "yogya"],
    "application_process":  ["apply", "application", "process", "how to", "aavedan", "procedure"],
    "required_documents":   ["document", "papers", "proof", "kagaj", "dastavej", "kyc"],
    "benefits":             ["benefit", "labh", "amount", "payment", "payout", "incentive"],
    "crop_insurance":       ["insurance", "bima", "coverage", "claim", "premium"],
    "crop_loss_assistance": ["loss", "damage", "compensation", "relief", "muavza", "claim"],
    "financial_assistance": ["loan", "credit", "finance", "fund", "karz"],
    "subsidy":              ["subsidy", "anudan", "support price", "incentive"],
    "grievance":            ["grievance", "complaint", "redress", "status"],
    "deadline":             ["date", "deadline", "last", "validity", "period"],
}

# Current reference year for freshness calculation
_REFERENCE_YEAR = 2026
_OLDEST_YEAR = 2018  # anything older gets 0 freshness bonus


def _section_matches_intent(section: str, intent: str) -> bool:
    keywords = _INTENT_SECTION_KEYWORDS.get(intent, [])
    section_lower = section.lower()
    return any(kw in section_lower for kw in keywords)


def _freshness_score(published_date: Optional[str]) -> float:
    """Return a freshness bonus 0.0–1.0 (to be scaled by RAG_FRESHNESS_BONUS)."""
    if not published_date:
        return 0.0
    m = re.search(r"\b(20\d{2})\b", str(published_date))
    if not m:
        return 0.0
    year = int(m.group(1))
    if year <= _OLDEST_YEAR:
        return 0.0
    ratio = min(1.0, (year - _OLDEST_YEAR) / (_REFERENCE_YEAR - _OLDEST_YEAR))
    return ratio


def _is_official(source_type: str) -> bool:
    return "official" in source_type.lower()


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def _score_candidate(
    candidate: RetrievalCandidate,
    qu: QueryUnderstanding,
) -> RetrievalCandidate:
    """Compute final_score and populate score_breakdown in-place."""
    breakdown: Dict[str, float] = {}

    # Base: Pinecone semantic score (already 0–1 for cosine)
    base = candidate.semantic_score
    breakdown["semantic"] = base

    # Scheme match bonus
    scheme_bonus = 0.0
    if qu.scheme_id and candidate.scheme_id == qu.scheme_id:
        scheme_bonus = config.RAG_SCHEME_MATCH_BONUS
    breakdown["scheme_match"] = scheme_bonus

    # State match bonus
    state_bonus = 0.0
    if qu.state_slug and candidate.state:
        if candidate.state.lower().replace(" ", "_") == qu.state_slug:
            state_bonus = config.RAG_STATE_MATCH_BONUS
    breakdown["state_match"] = state_bonus

    # Official source bonus
    official_bonus = config.RAG_OFFICIAL_SOURCE_BONUS if candidate.official_source else 0.0
    breakdown["official_source"] = official_bonus

    # Intent × section bonus
    intent_bonus = 0.0
    if _section_matches_intent(candidate.section, qu.intent):
        intent_bonus = config.RAG_INTENT_SECTION_BONUS
    breakdown["intent_section"] = intent_bonus

    # Freshness bonus
    fresh_ratio = _freshness_score(candidate.published_date)
    freshness_bonus = fresh_ratio * config.RAG_FRESHNESS_BONUS
    breakdown["freshness"] = freshness_bonus

    candidate.final_score = (
        base + scheme_bonus + state_bonus + official_bonus + intent_bonus + freshness_bonus
    )
    candidate.score_breakdown = breakdown
    return candidate


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def _deduplicate(candidates: List[RetrievalCandidate]) -> List[RetrievalCandidate]:
    """
    Remove duplicates:
    1. Exact duplicate chunk IDs (keep first/highest scored).
    2. Same (document_title, section) group → keep highest-scored.
    """
    # Step 1: unique chunk IDs
    seen_ids: set[str] = set()
    unique: List[RetrievalCandidate] = []
    for c in candidates:
        if c.chunk_id not in seen_ids:
            seen_ids.add(c.chunk_id)
            unique.append(c)

    # Step 2: group by (document_title, section)
    groups: Dict[Tuple[str, str], RetrievalCandidate] = {}
    for c in unique:
        key = (c.document_title, c.section)
        if key not in groups or c.final_score > groups[key].final_score:
            groups[key] = c

    deduped = list(groups.values())
    log.debug("Dedup: %d → %d candidates", len(candidates), len(deduped))
    return deduped


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def rank_and_deduplicate(
    raw_candidates: List[RetrievalCandidate],
    qu: QueryUnderstanding,
    top_k: int,
) -> List[RetrievalCandidate]:
    """
    Score, deduplicate, and return the top-k ranked candidates.

    Parameters
    ----------
    raw_candidates : Candidates from Pinecone (already have semantic_score set).
    qu             : Structured query understanding for bonus calculations.
    top_k          : Number of results to return.

    Returns
    -------
    Sorted list of up to top_k RetrievalCandidates, highest final_score first.
    """
    if not raw_candidates:
        return []

    # Score all
    scored = [_score_candidate(c, qu) for c in raw_candidates]

    # Sort by final_score descending before dedup (so groups keep best)
    scored.sort(key=lambda c: c.final_score, reverse=True)

    # Deduplicate
    deduped = _deduplicate(scored)

    # Re-sort after dedup
    deduped.sort(key=lambda c: c.final_score, reverse=True)

    result = deduped[:top_k]
    log.info(
        "Ranked %d → deduped %d → top %d (top score=%.4f)",
        len(raw_candidates), len(deduped), len(result),
        result[0].final_score if result else 0,
    )
    return result
