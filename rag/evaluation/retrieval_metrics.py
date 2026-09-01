"""
rag/evaluation/retrieval_metrics.py — Pure retrieval metric functions.

All functions are deterministic, network-free, and fully unit-testable.

Metrics implemented:
  recall_at_k(retrieved, relevant, k)
  precision_at_k(retrieved, relevant, k)
  reciprocal_rank(retrieved, relevant)
  hit_rate(retrieved, relevant, k)
  scheme_hit(retrieved_scheme_ids, expected_scheme_ids)
  aggregate_retrieval_metrics(results)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Set

from evaluation.models import (
    EvalQuestion,
    LanguageMetrics,
    MetricSet,
    RetrievalEvalResult,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Core metric functions — pure, unit-testable, no dependencies
# ---------------------------------------------------------------------------

def recall_at_k(
    retrieved_ids: List[str],
    relevant_ids: List[str],
    k: int,
) -> float:
    """
    Recall@K: fraction of relevant items found in the top-K retrieved results.

    = |relevant ∩ top-K retrieved| / |relevant|

    Returns 0.0 if relevant_ids is empty (vacuously safe — not counted in aggregates).
    Returns 1.0 if retrieved_ids[:k] contains ALL relevant items.
    """
    if not relevant_ids:
        return 0.0
    top_k = set(retrieved_ids[:k])
    hits = sum(1 for r in relevant_ids if r in top_k)
    return hits / len(relevant_ids)


def precision_at_k(
    retrieved_ids: List[str],
    relevant_ids: List[str],
    k: int,
) -> float:
    """
    Precision@K: fraction of top-K retrieved items that are relevant.

    = |relevant ∩ top-K retrieved| / K

    Returns 0.0 if retrieved_ids is empty.
    """
    if not retrieved_ids or k == 0:
        return 0.0
    top_k = retrieved_ids[:k]
    relevant_set = set(relevant_ids)
    hits = sum(1 for r in top_k if r in relevant_set)
    return hits / min(k, len(top_k))


def reciprocal_rank(
    retrieved_ids: List[str],
    relevant_ids: List[str],
) -> float:
    """
    Reciprocal Rank: 1/rank of the first relevant item in retrieved list.

    Returns 0.0 if no relevant item is found.

    Example:
      retrieved = ["a", "b", "pm_kisan_chunk_1", "c"]
      relevant  = ["pm_kisan_chunk_1"]
      → rank 3 → RR = 1/3 ≈ 0.333
    """
    if not relevant_ids:
        return 0.0
    relevant_set = set(relevant_ids)
    for rank, item in enumerate(retrieved_ids, start=1):
        if item in relevant_set:
            return 1.0 / rank
    return 0.0


def hit_rate(
    retrieved_ids: List[str],
    relevant_ids: List[str],
    k: int = 5,
) -> bool:
    """
    Hit Rate@K: True if at least one relevant item appears in the top-K.

    Binary version of Recall@K.
    """
    if not relevant_ids:
        return False
    top_k = set(retrieved_ids[:k])
    return any(r in top_k for r in relevant_ids)


def scheme_hit(
    retrieved_scheme_ids: List[str],
    expected_scheme_ids: List[str],
) -> bool:
    """
    Scheme-level Hit Rate: True if at least one expected scheme appears
    anywhere in the retrieved scheme IDs.

    This is the primary metric for AgriSense — we care most about whether
    the correct government scheme document was surfaced.
    """
    if not expected_scheme_ids:
        return True  # vacuously true — no expected scheme to miss
    retrieved_set = set(retrieved_scheme_ids)
    return any(s in retrieved_set for s in expected_scheme_ids)


# ---------------------------------------------------------------------------
# Scheme-level extraction from retrieval candidates
# ---------------------------------------------------------------------------

def extract_scheme_ids_from_candidates(candidates: List[Any], top_k: int = 10) -> List[str]:
    """
    Extract scheme_ids from retrieval candidates in rank order.
    Candidates may be RetrievalCandidate dataclasses or dicts.
    """
    ids = []
    for c in candidates[:top_k]:
        if hasattr(c, "scheme_id"):
            ids.append(c.scheme_id)
        elif isinstance(c, dict):
            ids.append(c.get("scheme_id", ""))
    return ids


def extract_chunk_ids_from_candidates(candidates: List[Any], top_k: int = 10) -> List[str]:
    """Extract chunk_ids from retrieval candidates in rank order."""
    ids = []
    for c in candidates[:top_k]:
        if hasattr(c, "chunk_id"):
            ids.append(c.chunk_id)
        elif isinstance(c, dict):
            ids.append(c.get("chunk_id", ""))
    return ids


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------

_K_VALUES = (1, 3, 5, 10)


def aggregate_retrieval_metrics(
    results: List[RetrievalEvalResult],
    questions: Optional[List[EvalQuestion]] = None,
) -> MetricSet:
    """
    Compute aggregate metrics from a list of per-question retrieval results.

    Also breaks down by language and difficulty.
    """
    if not results:
        return MetricSet()

    # Filter to questions that have expected_schemes (skip ambiguous / trap)
    scored = [r for r in results if r.expected_schemes]
    total = len(results)
    n = len(scored) or 1  # avoid division by zero

    def _mean(vals):
        return sum(vals) / len(vals) if vals else 0.0

    metrics = MetricSet(
        total_questions=total,
        recall_at_1=_mean([r.recall_at_k.get(1, 0.0) for r in scored]),
        recall_at_3=_mean([r.recall_at_k.get(3, 0.0) for r in scored]),
        recall_at_5=_mean([r.recall_at_k.get(5, 0.0) for r in scored]),
        recall_at_10=_mean([r.recall_at_k.get(10, 0.0) for r in scored]),
        precision_at_5=_mean([r.precision_at_k.get(5, 0.0) for r in scored]),
        precision_at_10=_mean([r.precision_at_k.get(10, 0.0) for r in scored]),
        mrr=_mean([r.reciprocal_rank for r in scored]),
        hit_rate_at_5=_mean([1.0 if r.hit_rate_at_5 else 0.0 for r in scored]),
        scheme_hit_rate=_mean([1.0 if r.scheme_hit else 0.0 for r in scored]),
    )

    # Per-language breakdown
    langs = sorted({r.language for r in results})
    for lang in langs:
        lang_results = [r for r in scored if r.language == lang]
        if not lang_results:
            continue
        metrics.by_language[lang] = {
            "question_count": len(lang_results),
            "recall_at_5": _mean([r.recall_at_k.get(5, 0.0) for r in lang_results]),
            "precision_at_5": _mean([r.precision_at_k.get(5, 0.0) for r in lang_results]),
            "hit_rate_at_5": _mean([1.0 if r.hit_rate_at_5 else 0.0 for r in lang_results]),
            "scheme_hit_rate": _mean([1.0 if r.scheme_hit else 0.0 for r in lang_results]),
            "mrr": _mean([r.reciprocal_rank for r in lang_results]),
        }

    # Per-difficulty breakdown
    diffs = sorted({r.difficulty for r in results})
    for diff in diffs:
        diff_results = [r for r in scored if r.difficulty == diff]
        if not diff_results:
            continue
        metrics.by_difficulty[diff] = {
            "question_count": len(diff_results),
            "recall_at_5": _mean([r.recall_at_k.get(5, 0.0) for r in diff_results]),
            "hit_rate_at_5": _mean([1.0 if r.hit_rate_at_5 else 0.0 for r in diff_results]),
        }

    return metrics


def compute_retrieval_result(
    question: EvalQuestion,
    candidates: List[Any],
    latency_ms: int,
    top_k: int = 10,
) -> RetrievalEvalResult:
    """
    Compute a full RetrievalEvalResult for one question given its ranked candidates.

    candidates: list of RetrievalCandidate objects (in rank order, already re-ranked).
    """
    retrieved_scheme_ids = extract_scheme_ids_from_candidates(candidates, top_k)
    retrieved_chunk_ids = extract_chunk_ids_from_candidates(candidates, top_k)

    # For recall/precision, we use scheme_ids as the "relevant item" identifier
    # (chunk-level IDs would require ground-truth annotations per chunk)
    relevant = question.expected_schemes

    r_at_k = {k: recall_at_k(retrieved_scheme_ids, relevant, k) for k in _K_VALUES}
    p_at_k = {k: precision_at_k(retrieved_scheme_ids, relevant, k) for k in (5, 10)}
    rr = reciprocal_rank(retrieved_scheme_ids, relevant)
    ht = hit_rate(retrieved_scheme_ids, relevant, k=5)
    sh = scheme_hit(retrieved_scheme_ids, relevant)

    passed = sh or not relevant  # pass if no expected scheme (ambiguous/trap questions)
    failure_reason = None
    if not passed:
        failure_reason = (
            f"Expected schemes {relevant} not found in top-{top_k} retrieved: {retrieved_scheme_ids}"
        )

    return RetrievalEvalResult(
        question_id=question.id,
        query=question.query,
        expected_schemes=relevant,
        retrieved_scheme_ids=retrieved_scheme_ids,
        retrieved_chunk_ids=retrieved_chunk_ids,
        scheme_hit=sh,
        recall_at_k=r_at_k,
        precision_at_k=p_at_k,
        reciprocal_rank=rr,
        hit_rate_at_5=ht,
        language=question.language,
        difficulty=question.difficulty,
        latency_ms=latency_ms,
        passed=passed,
        failure_reason=failure_reason,
    )
