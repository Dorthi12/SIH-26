"""
rag/retrieval/retriever.py — Main orchestrator for the retrieval pipeline.

Routing
-------
When HYBRID_RETRIEVAL_ENABLED=false (default):
  query → embed → Pinecone → rank_and_deduplicate → RetrievalResult

When HYBRID_RETRIEVAL_ENABLED=true:
  query → dense + keyword → RRF fusion → reranker → RetrievalResult
  (via rag.retrieval.service.HybridRetrievalService)

Public API
----------
get_retriever()                    →  KnowledgeRetriever  (singleton)
retriever.retrieve(query, ...)     →  RetrievalResult
retriever.aretrieve(query, ...)    →  RetrievalResult  (async)
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List, Optional

import config
from ingestion.pinecone_store import PineconeStore
from retrieval.dense import dense_retrieve, parse_pinecone_results
from retrieval.filters import build_filter, filter_to_display
from retrieval.models import FarmerProfile, QueryUnderstanding, RetrievalCandidate, RetrievalResult
from retrieval.query_embedder import embed_query, embed_query_async
from retrieval.query_understanding import understand
from retrieval.ranker import rank_and_deduplicate

log = logging.getLogger(__name__)


# _parse_pinecone_results is now canonical in dense.py
# Re-export for any callers that import from retriever.py directly
_parse_pinecone_results = parse_pinecone_results


# ---------------------------------------------------------------------------
# KnowledgeRetriever
# ---------------------------------------------------------------------------

class KnowledgeRetriever:
    """
    Main retrieval orchestrator.

    Holds a shared PineconeStore connection — use get_retriever() to obtain
    the singleton instance rather than instantiating directly.
    """

    def __init__(self) -> None:
        self._store: Optional[PineconeStore] = None

    def _get_store(self) -> PineconeStore:
        if self._store is None:
            self._store = PineconeStore.from_config()
        return self._store

    def retrieve(
        self,
        query: str,
        farmer_profile: Optional[FarmerProfile] = None,
        top_k: Optional[int] = None,
    ) -> RetrievalResult:
        """
        Run the full retrieval pipeline synchronously.

        Routes to hybrid pipeline when HYBRID_RETRIEVAL_ENABLED=True,
        otherwise uses the original dense-only pipeline.

        Parameters
        ----------
        query          : Raw natural-language farmer query.
        farmer_profile : Optional explicit profile (fields override query inferences).
        top_k          : Number of final results to return.

        Returns
        -------
        RetrievalResult with ranked, deduplicated chunks.
        """
        if config.HYBRID_RETRIEVAL_ENABLED:
            return self._hybrid_retrieve(query, farmer_profile, top_k)
        return self._dense_retrieve(query, farmer_profile, top_k)

    def _dense_retrieve(
        self,
        query: str,
        farmer_profile: Optional[FarmerProfile] = None,
        top_k: Optional[int] = None,
    ) -> RetrievalResult:
        """Original dense-only retrieval pipeline (unchanged)."""
        final_top_k = top_k or config.RAG_FINAL_TOP_K
        candidate_top_k = config.RAG_RETRIEVAL_TOP_K

        # Step 1: Query understanding
        qu = understand(query, farmer_profile)

        # Step 2: Embed query
        embedding = embed_query(qu.raw_query)

        # Step 3: Build filter
        metadata_filter = build_filter(qu)

        # Step 4: Pinecone query
        store = self._get_store()
        raw = store.query_sample(
            embedding=embedding,
            top_k=candidate_top_k,
            filter_metadata=metadata_filter,
        )
        log.info("Pinecone returned %d candidate(s) for: %r", len(raw), query[:60])

        # If filter returned nothing, fall back to unfiltered search
        if not raw and metadata_filter:
            log.info("No results with filter — falling back to unfiltered semantic search")
            raw = store.query_sample(embedding=embedding, top_k=candidate_top_k)

        # Step 5: Parse
        candidates = _parse_pinecone_results(raw)

        # Step 6: Rank + deduplicate
        ranked = rank_and_deduplicate(candidates, qu, final_top_k)

        return RetrievalResult(
            query=query,
            intent=qu.intent,
            language=qu.language,
            applied_filters=filter_to_display(metadata_filter),
            query_understanding=qu.to_dict(),
            results=ranked,
            candidate_count=len(candidates),
            final_count=len(ranked),
        )

    def _hybrid_retrieve(
        self,
        query: str,
        farmer_profile: Optional[FarmerProfile] = None,
        top_k: Optional[int] = None,
    ) -> RetrievalResult:
        """Hybrid dense + keyword + RRF + reranking pipeline."""
        from retrieval.service import get_hybrid_service
        return get_hybrid_service().search(
            query=query,
            farmer_profile=farmer_profile,
            top_k=top_k,
        )

    async def aretrieve(
        self,
        query: str,
        farmer_profile: Optional[FarmerProfile] = None,
        top_k: Optional[int] = None,
    ) -> RetrievalResult:
        """Async wrapper — runs the synchronous pipeline in a thread pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: self.retrieve(query, farmer_profile, top_k),
        )


# ---------------------------------------------------------------------------
# Singleton accessor
# ---------------------------------------------------------------------------

_retriever_instance: Optional[KnowledgeRetriever] = None


def get_retriever() -> KnowledgeRetriever:
    """Return the shared KnowledgeRetriever instance."""
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = KnowledgeRetriever()
    return _retriever_instance
