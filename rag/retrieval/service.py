"""
rag/retrieval/service.py — HybridRetrievalService: the new top-level entry point
for hybrid dense + keyword + RRF + reranking retrieval.

Pipeline
--------
Query
  ├─ Dense: embed → Pinecone (DENSE_TOP_K candidates)
  └─ Keyword: BM25 over in-memory corpus (KEYWORD_TOP_K candidates)
          ↓
    RRF Fusion → unique merged candidates
          ↓
    Score bonuses (existing ranker._score_candidate)
          ↓
    Cross-Encoder Reranker → top FINAL_CONTEXT_K
          ↓
    RetrievalResult

Public API
----------
get_hybrid_service()                   → HybridRetrievalService (singleton)
service.search(query, profile, top_k)  → RetrievalResult
service.rebuild_keyword_index()        → None  (call after re-ingestion)
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

import config
from ingestion.pinecone_store import PineconeStore
from retrieval.dense import dense_retrieve, parse_pinecone_results
from retrieval.filters import build_filter, filter_to_display
from retrieval.fusion import rrf_fusion
from retrieval.keyword import get_keyword_retriever
from retrieval.models import FarmerProfile, QueryUnderstanding, RetrievalCandidate, RetrievalResult
from retrieval.query_understanding import understand
from retrieval.ranker import _score_candidate
from retrieval.reranker import get_reranker

log = logging.getLogger(__name__)


def _fetch_full_corpus(store: PineconeStore) -> List[RetrievalCandidate]:
    """
    Fetch all chunk texts from Pinecone to build the BM25 index.

    Strategy: query Pinecone with a zero-vector (or arbitrary vector) and
    fetch as many results as possible. Pinecone caps at 10,000 per query,
    which covers our corpus comfortably.

    Returns parsed RetrievalCandidate objects with chunk_text populated.
    """
    try:
        import numpy as np
        # Use a zero embedding to fetch by metadata/IDs broadly
        # We use a tiny positive vector to avoid Pinecone rejection of all-zeros
        dim = 384  # paraphrase-multilingual-MiniLM-L12-v2 dimension
        zero_vec = [1e-9] * dim
        raw = store.query_sample(embedding=zero_vec, top_k=10000)
        candidates = parse_pinecone_results(raw)
        log.info("Corpus fetch: %d chunks loaded from Pinecone for BM25 index", len(candidates))
        return candidates
    except Exception as exc:
        log.warning("Could not fetch full corpus for BM25 index: %s", exc)
        return []


class HybridRetrievalService:
    """
    Orchestrates the full hybrid retrieval pipeline.

    All models (embedder, cross-encoder) and stores (Pinecone, BM25) are
    loaded once and reused across queries.
    """

    def __init__(self) -> None:
        self._store: Optional[PineconeStore] = None
        self._keyword_index_built = False

    def _get_store(self) -> PineconeStore:
        if self._store is None:
            self._store = PineconeStore.from_config()
        return self._store

    def _ensure_keyword_index(self) -> None:
        """Build the BM25 index if not already done."""
        kw = get_keyword_retriever()
        if kw.corpus_size == 0:
            log.info("Building BM25 keyword index from Pinecone corpus...")
            corpus = _fetch_full_corpus(self._get_store())
            kw.build_index(corpus)
            self._keyword_index_built = True

    def rebuild_keyword_index(self) -> None:
        """Force-rebuild the BM25 index (call after re-ingestion)."""
        log.info("Force-rebuilding BM25 keyword index...")
        corpus = _fetch_full_corpus(self._get_store())
        get_keyword_retriever().build_index(corpus)
        self._keyword_index_built = True

    def search(
        self,
        query: str,
        farmer_profile: Optional[FarmerProfile] = None,
        top_k: Optional[int] = None,
    ) -> RetrievalResult:
        """
        Run the full hybrid retrieval pipeline.

        Stages and timing are logged at INFO level for observability.
        Any stage failure falls back gracefully (see reranker.py fallback logic).

        Parameters
        ----------
        query          : Raw farmer query.
        farmer_profile : Optional profile context.
        top_k          : Final number of results (default: config.FINAL_CONTEXT_K).

        Returns
        -------
        RetrievalResult with hybrid score fields populated.
        """
        final_top_k = top_k or config.FINAL_CONTEXT_K
        t_pipeline_start = time.perf_counter()
        timings: Dict[str, int] = {}

        # ── Step 1: Query understanding ──────────────────────────────────
        qu = understand(query, farmer_profile)
        metadata_filter = build_filter(qu)

        store = self._get_store()

        # ── Step 2: Dense retrieval ─────────────────────────────────────
        t0 = time.perf_counter()
        dense_candidates = dense_retrieve(
            query=query,
            qu=qu,
            store=store,
            top_k=config.DENSE_TOP_K,
            metadata_filter=metadata_filter,
        )
        timings["dense_ms"] = int((time.perf_counter() - t0) * 1000)

        # ── Step 3: Keyword retrieval ───────────────────────────────────
        t0 = time.perf_counter()
        try:
            self._ensure_keyword_index()
            keyword_candidates = get_keyword_retriever().search(
                query=query,
                top_k=config.KEYWORD_TOP_K,
            )
        except Exception as exc:
            log.warning("Keyword retrieval failed: %s — using dense only", exc)
            keyword_candidates = []
        timings["keyword_ms"] = int((time.perf_counter() - t0) * 1000)

        # ── Step 4: RRF Fusion ──────────────────────────────────────────
        t0 = time.perf_counter()
        fused = rrf_fusion(
            dense_results=dense_candidates,
            keyword_results=keyword_candidates,
            k=config.RRF_K,
            max_candidates=config.RERANK_TOP_K,
        )
        timings["fusion_ms"] = int((time.perf_counter() - t0) * 1000)

        # ── Step 5: Score bonuses (existing ranker logic) ────────────────
        t0 = time.perf_counter()
        scored = [_score_candidate(c, qu) for c in fused]
        scored.sort(key=lambda c: c.rrf_score, reverse=True)  # RRF is primary sort in hybrid
        timings["bonus_ms"] = int((time.perf_counter() - t0) * 1000)

        # ── Step 6: Reranking ────────────────────────────────────────────
        t0 = time.perf_counter()
        reranked = get_reranker().rerank(
            query=query,
            candidates=scored,
            top_k=final_top_k,
        )
        timings["rerank_ms"] = int((time.perf_counter() - t0) * 1000)

        total_ms = int((time.perf_counter() - t_pipeline_start) * 1000)
        timings["total_ms"] = total_ms

        log.info(
            "Hybrid retrieval complete: dense=%dms keyword=%dms fusion=%dms rerank=%dms total=%dms | "
            "%d→%d→%d→%d candidates",
            timings["dense_ms"], timings["keyword_ms"],
            timings["fusion_ms"], timings["rerank_ms"], total_ms,
            len(dense_candidates), len(keyword_candidates),
            len(fused), len(reranked),
        )

        # Attach timing breakdown to first result's score_breakdown for observability
        if reranked:
            reranked[0].score_breakdown["_timings"] = timings  # type: ignore[assignment]

        return RetrievalResult(
            query=query,
            intent=qu.intent,
            language=qu.language,
            applied_filters=filter_to_display(metadata_filter),
            query_understanding=qu.to_dict(),
            results=reranked,
            candidate_count=len(dense_candidates) + len(keyword_candidates),
            final_count=len(reranked),
        )


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_hybrid_service_instance: Optional[HybridRetrievalService] = None


def get_hybrid_service() -> HybridRetrievalService:
    """Return the shared HybridRetrievalService instance."""
    global _hybrid_service_instance
    if _hybrid_service_instance is None:
        _hybrid_service_instance = HybridRetrievalService()
    return _hybrid_service_instance
