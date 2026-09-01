"""
rag/retrieval/dense.py — Dense (Pinecone) retrieval step extracted from retriever.py.

This module owns the dense retrieval step only, keeping it independently
callable for hybrid pipeline composition and testing.

Public API
----------
dense_retrieve(query, qu, store, top_k, metadata_filter)  →  list[RetrievalCandidate]
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from ingestion.pinecone_store import PineconeStore
from retrieval.models import QueryUnderstanding, RetrievalCandidate
from retrieval.query_embedder import embed_query

log = logging.getLogger(__name__)


def _is_official(source_type: str) -> bool:
    return "official" in (source_type or "").lower()


def parse_pinecone_results(raw: List[Dict[str, Any]]) -> List[RetrievalCandidate]:
    """
    Convert raw Pinecone query matches into RetrievalCandidate objects.
    This is the canonical parser — shared by retriever.py and dense.py.
    """
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


def dense_retrieve(
    query: str,
    qu: QueryUnderstanding,
    store: PineconeStore,
    top_k: int,
    metadata_filter: Optional[Dict[str, Any]] = None,
) -> List[RetrievalCandidate]:
    """
    Run dense retrieval for a query and return RetrievalCandidate objects
    with their dense rank populated.

    Parameters
    ----------
    query           : Raw farmer query string.
    qu              : Structured query understanding (for logging).
    store           : Connected PineconeStore instance.
    top_k           : Number of candidates to retrieve.
    metadata_filter : Optional Pinecone metadata filter dict.

    Returns
    -------
    list[RetrievalCandidate] in dense score order (descending), dense_rank set.
    """
    embedding = embed_query(qu.raw_query)

    raw = store.query_sample(
        embedding=embedding,
        top_k=top_k,
        filter_metadata=metadata_filter,
    )
    log.info("Dense: Pinecone returned %d candidate(s) for: %r", len(raw), query[:60])

    # Fallback to unfiltered if filter returns nothing
    if not raw and metadata_filter:
        log.info("Dense: no results with filter — falling back to unfiltered search")
        raw = store.query_sample(embedding=embedding, top_k=top_k)

    candidates = parse_pinecone_results(raw)

    # Set dense rank (1-indexed)
    for i, c in enumerate(candidates):
        c.dense_rank = i + 1

    return candidates
