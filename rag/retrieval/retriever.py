"""
rag/retrieval/retriever.py — Main orchestrator for the retrieval pipeline.

Pipeline:
  query (str)  +  FarmerProfile (optional)
        ↓
  query_understanding.understand()
        ↓
  query_embedder.embed_query()
        ↓
  filters.build_filter()
        ↓
  PineconeStore.query_sample()   (top_k × 2 candidates)
        ↓
  _parse_pinecone_results()      →  list[RetrievalCandidate]
        ↓
  ranker.rank_and_deduplicate()
        ↓
  RetrievalResult

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

from rag import config
from rag.ingestion.pinecone_store import PineconeStore
from rag.retrieval.filters import build_filter, filter_to_display
from rag.retrieval.models import FarmerProfile, QueryUnderstanding, RetrievalCandidate, RetrievalResult
from rag.retrieval.query_embedder import embed_query, embed_query_async
from rag.retrieval.query_understanding import understand
from rag.retrieval.ranker import rank_and_deduplicate

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pinecone → RetrievalCandidate conversion
# ---------------------------------------------------------------------------

def _is_official(source_type: str) -> bool:
    return "official" in (source_type or "").lower()


def _parse_pinecone_results(raw: List[Dict[str, Any]]) -> List[RetrievalCandidate]:
    """Convert raw Pinecone query matches into RetrievalCandidate objects."""
    candidates: List[RetrievalCandidate] = []
    for match in raw:
        meta = match.get("metadata", {})
        score = float(match.get("score", 0.0))
        source_type = meta.get("source_type", "")

        c = RetrievalCandidate(
            chunk_id=meta.get("chunk_id", match.get("id", "")),
            chunk_text=meta.get("chunk_text", ""),
            scheme_id=meta.get("scheme_id", ""),
            scheme_name=meta.get("scheme_name", ""),
            government_level=meta.get("government_level", ""),
            state=meta.get("state") or None,
            document_title=meta.get("document_title", ""),
            document_type=meta.get("document_type", ""),
            section=meta.get("section", ""),
            page_number=int(meta.get("page_number", 0)),
            language=meta.get("language", "en"),
            source_url=meta.get("source_url", ""),
            source_type=source_type,
            published_date=meta.get("published_date") or None,
            last_updated=meta.get("last_updated") or None,
            document_version=meta.get("document_version") or None,
            file_path=meta.get("file_path", ""),
            semantic_score=score,
            official_source=_is_official(source_type),
        )
        candidates.append(c)
    return candidates


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

        Parameters
        ----------
        query          : Raw natural-language farmer query.
        farmer_profile : Optional explicit profile (fields override query inferences).
        top_k          : Number of final results to return (default: config.RAG_FINAL_TOP_K).

        Returns
        -------
        RetrievalResult with ranked, deduplicated chunks.
        """
        final_top_k = top_k or config.RAG_FINAL_TOP_K
        candidate_top_k = config.RAG_RETRIEVAL_TOP_K  # fetch more than needed

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
