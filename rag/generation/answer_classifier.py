"""
rag/generation/answer_classifier.py — Pre-generation query status classification.

Determines response status BEFORE calling the LLM, using retrieval metadata only.
No LLM calls are made here.

Public API
----------
classify_query_status(query, retrieval_result) → str

Returns one of:
  "success"                  — proceed to generation
  "clarification_required"   — ambiguous query; ask for more info
  "unsupported_scheme"       — query mentions a specific scheme not in corpus
  "insufficient_information" — no qualifying chunks retrieved
"""

from __future__ import annotations

import re
from typing import Any

from rag.generation.models import (
    GENERATION_STATUS_CLARIFICATION,
    GENERATION_STATUS_INSUFFICIENT,
    GENERATION_STATUS_SUCCESS,
    GENERATION_STATUS_UNSUPPORTED,
)
from rag import config

# ---------------------------------------------------------------------------
# Ambiguous query signals
# ---------------------------------------------------------------------------

_AMBIGUOUS_PATTERNS = [
    re.compile(r"^am i eligible\s*\??\s*$", re.I),
    re.compile(r"^am i eligible for\s*\??\s*$", re.I),
    re.compile(r"^how (do|can) i apply\s*\??\s*$", re.I),
    re.compile(r"^what is this\s*\??\s*$", re.I),
    re.compile(r"^(what|kya) (scheme|yojana)\s*\??\s*$", re.I),
    re.compile(r"^kya main eligible hoon\s*\??\s*$", re.I),
    re.compile(r"^how (can|do) i get (this|it)\s*\??\s*$", re.I),
    re.compile(r"^which (scheme|yojana)\s*\??\s*$", re.I),
    re.compile(r"^mujhe kya milega\s*\??\s*$", re.I),
]

# Score threshold below which we consider retrieval insufficient
_INSUFFICIENT_TOP_SCORE = 0.25

# Score threshold below which + no clear scheme → ambiguous
_AMBIGUOUS_TOP_SCORE = 0.30

# Known corpus scheme IDs — checked against retrieval results
_CORPUS_SCHEME_IDS = frozenset({
    "pm_kisan", "pmfby", "pmksy", "kcc", "smam", "aif", "rkvy",
    "soil_health_card", "agricultural_mechanization", "fassal_bima",
    "pm_fasal_bima_yojana", "pradhan_mantri_krishi_sinchai_yojana",
})

# Patterns that look like a specific (possibly unknown) scheme name
_SCHEME_NAME_RE = re.compile(
    r"\b([A-Z][A-Z0-9\-]{2,}(?:\s+[A-Z][A-Z0-9\-]+)*|"   # ALL-CAPS acronym
    r"\"[^\"]{5,}\")\b"                                      # quoted name
)


# Pattern for scheme-like entities (ALL-CAPS acronym or quoted name)
_ENTITY_RE = re.compile(
    r"\b[A-Z][A-Z0-9\-]{2,}(?:\s+[A-Z][A-Z0-9\-]+)*\b|"  # PM-KISAN, PMFBY, KCC...
    r"\b(?:pm[- ]kisan|pmfby|pmksy|rkvy|smam|kcc)\b",        # lowercase forms
    re.I,
)


def _has_scheme_entity(query: str) -> bool:
    """Return True if the query contains a recognizable scheme-like entity."""
    return bool(_ENTITY_RE.search(query))


def _is_ambiguous_query(query: str) -> bool:
    """Return True if the query is too vague to answer without clarification."""
    q = query.strip()
    for pat in _AMBIGUOUS_PATTERNS:
        if pat.match(q):
            return True
    # Very short query with no recognized entity
    if len(q.split()) <= 4 and not _has_scheme_entity(q):
        return True
    return False


def _mentions_unknown_scheme(query: str, retrieval_result: Any) -> bool:
    """
    Return True if the query mentions a specific scheme name that produced
    zero matching chunks in the corpus.

    Only triggers when:
    1. The query contains an ALL-CAPS scheme-like term or quoted name.
    2. None of the retrieved chunks match that scheme.
    """
    matches = _SCHEME_NAME_RE.findall(query)
    if not matches:
        return False

    # Flatten any match tuples
    candidate_names = []
    for m in matches:
        if isinstance(m, tuple):
            candidate_names.extend(s for s in m if s)
        else:
            candidate_names.append(m)

    if not candidate_names:
        return False

    # Check whether retrieved chunks mention any of the candidate names
    results = getattr(retrieval_result, "results", [])
    retrieved_scheme_ids = {getattr(r, "scheme_id", "") for r in results}
    retrieved_scheme_names = {
        getattr(r, "scheme_name", "").upper() for r in results
    }

    for name in candidate_names:
        name_upper = name.upper().strip('"')
        # Skip if it matches a known corpus scheme
        if any(name_upper in sid.upper() for sid in _CORPUS_SCHEME_IDS):
            continue
        if any(name_upper in sname for sname in retrieved_scheme_names):
            continue
        # Query mentions a scheme name, but nothing was retrieved for it
        if not results or retrieved_scheme_ids.isdisjoint(_CORPUS_SCHEME_IDS):
            return True

    return False


def classify_query_status(query: str, retrieval_result: Any) -> str:
    """
    Classify query status from retrieval metadata — no LLM calls.

    Parameters
    ----------
    query            : Original farmer query string.
    retrieval_result : RetrievalResult from the retrieval layer.

    Returns
    -------
    One of the GENERATION_STATUS_* constants.
    """
    results = getattr(retrieval_result, "results", [])
    top_score = results[0].semantic_score if results else 0.0

    # 1. No qualifying chunks at all
    qualified = [r for r in results if r.semantic_score >= config.RAG_MIN_RETRIEVAL_SCORE]
    if not qualified:
        # Check if ambiguous first (gives better UX message)
        if _is_ambiguous_query(query):
            return GENERATION_STATUS_CLARIFICATION
        return GENERATION_STATUS_INSUFFICIENT

    # 2. Ambiguous / vague query
    if _is_ambiguous_query(query):
        return GENERATION_STATUS_CLARIFICATION

    # 3. Unknown scheme (specific name mentioned, zero corpus matches)
    if _mentions_unknown_scheme(query, retrieval_result):
        return GENERATION_STATUS_UNSUPPORTED

    # 4. All good — proceed to generation
    return GENERATION_STATUS_SUCCESS
