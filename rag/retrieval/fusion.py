"""
rag/retrieval/fusion.py — Reciprocal Rank Fusion (RRF) for hybrid retrieval.

Merges dense and keyword candidate lists into a single unified ranking
using Reciprocal Rank Fusion, then deduplicates by chunk_id.

RRF formula:
  rrf_score(d) = Σ_r  1 / (k + rank_r(d))

where rank_r(d) is the rank of document d in result list r, and k is a
smoothing constant (default 60, configurable via RRF_K).

Design notes
------------
- If a chunk appears only in dense results: rrf_score = 1/(k + dense_rank)
- If a chunk appears only in keyword results: rrf_score = 1/(k + keyword_rank)
- If a chunk appears in both: scores are summed (maximum fusion benefit)
- Source diversity is applied as a post-processing step:
  no more than MAX_PER_PAGE chunks from the same (scheme_id, page_number).

Public API
----------
rrf_fusion(dense, keyword, k, max_per_page)  →  list[RetrievalCandidate]
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional

from rag.retrieval.models import RetrievalCandidate

log = logging.getLogger(__name__)

# Maximum chunks from same (scheme_id, page_number) before diversity enforcement
_MAX_PER_PAGE = 2


def rrf_fusion(
    dense_results: List[RetrievalCandidate],
    keyword_results: List[RetrievalCandidate],
    k: int = 60,
    max_candidates: Optional[int] = None,
    max_per_page: int = _MAX_PER_PAGE,
) -> List[RetrievalCandidate]:
    """
    Merge dense and keyword results using Reciprocal Rank Fusion.

    Parameters
    ----------
    dense_results   : Candidates from dense retrieval (dense_rank already set).
    keyword_results : Candidates from keyword retrieval (keyword_rank already set).
    k               : RRF smoothing constant (default 60).
    max_candidates  : If set, truncate output to this many candidates.
    max_per_page    : Source diversity limit per (scheme_id, page_number).

    Returns
    -------
    Merged list of RetrievalCandidate sorted by rrf_score descending,
    with rrf_score, dense_rank, keyword_rank populated.
    Exact duplicate chunk_ids removed.
    """
    # Build lookup maps by chunk_id
    dense_by_id: Dict[str, RetrievalCandidate] = {}
    for rank, c in enumerate(dense_results, start=1):
        c.dense_rank = rank
        dense_by_id[c.chunk_id] = c

    keyword_by_id: Dict[str, RetrievalCandidate] = {}
    for rank, c in enumerate(keyword_results, start=1):
        c.keyword_rank = rank
        keyword_by_id[c.chunk_id] = c

    # Union of all chunk_ids
    all_ids = set(dense_by_id.keys()) | set(keyword_by_id.keys())

    fused: List[RetrievalCandidate] = []

    for chunk_id in all_ids:
        d_cand = dense_by_id.get(chunk_id)
        k_cand = keyword_by_id.get(chunk_id)

        # Base candidate: prefer dense (more metadata), fall back to keyword
        base = d_cand if d_cand is not None else k_cand
        assert base is not None  # always one of the two

        # RRF score: sum contributions from each present list
        rrf = 0.0
        d_rank = 0
        kw_rank = 0

        if d_cand is not None:
            d_rank = d_cand.dense_rank
            rrf += 1.0 / (k + d_rank)

        if k_cand is not None:
            kw_rank = k_cand.keyword_rank
            rrf += 1.0 / (k + kw_rank)
            # Take keyword_score from keyword candidate
            keyword_score = k_cand.keyword_score
        else:
            keyword_score = 0.0

        from dataclasses import replace
        merged = replace(
            base,
            dense_rank=d_rank,
            keyword_rank=kw_rank,
            keyword_score=keyword_score,
            rrf_score=rrf,
        )
        fused.append(merged)

    # Sort by RRF score descending
    fused.sort(key=lambda c: c.rrf_score, reverse=True)

    log.info(
        "RRF fusion: %d dense + %d keyword → %d unique (top rrf=%.5f)",
        len(dense_results),
        len(keyword_results),
        len(fused),
        fused[0].rrf_score if fused else 0,
    )

    # Source diversity: limit per (scheme_id, page_number)
    fused = _apply_source_diversity(fused, max_per_page=max_per_page)

    if max_candidates:
        fused = fused[:max_candidates]

    return fused


def _apply_source_diversity(
    candidates: List[RetrievalCandidate],
    max_per_page: int,
) -> List[RetrievalCandidate]:
    """
    Enforce a per-(scheme_id, page_number) limit while preserving relevance order.

    Highly relevant chunks are still included first; this only clips
    excessive repetition of the same page when lower-ranked alternatives exist.

    Relevance remains the primary criterion: chunks are only moved to the end
    if the page limit is reached AND there are other candidates available.
    """
    page_counts: Dict[tuple, int] = {}
    primary: List[RetrievalCandidate] = []
    overflow: List[RetrievalCandidate] = []

    for c in candidates:
        key = (c.scheme_id, c.page_number)
        count = page_counts.get(key, 0)
        if count < max_per_page:
            page_counts[key] = count + 1
            primary.append(c)
        else:
            overflow.append(c)

    return primary + overflow
