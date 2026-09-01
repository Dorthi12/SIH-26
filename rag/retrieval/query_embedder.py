"""
rag/retrieval/query_embedder.py — Query embedding using the shared model singleton.

Critical: this MUST use the same model and singleton as ingestion/embedder.py
so that query vectors exist in the same vector space as document vectors.

Public API
----------
embed_query(text)        →  list[float]
embed_query_async(text)  →  list[float]  (runs in thread pool — safe for async)
validate_dimension(emb)  →  None (raises if wrong)
"""

from __future__ import annotations

import asyncio
import logging
from typing import List

import config
from ingestion.embedder import get_embedder

log = logging.getLogger(__name__)

# Expected dimension from the configured model (set on first call)
_expected_dimension: int | None = None


def embed_query(text: str) -> List[float]:
    """
    Embed a query string using the shared Sentence Transformer singleton.

    The model is the same instance used by the ingestion pipeline —
    guaranteed same vector space as all indexed document chunks.
    """
    global _expected_dimension
    embedder = get_embedder()
    embedding = embedder.embed_text(text)

    if _expected_dimension is None:
        _expected_dimension = len(embedding)
        log.debug("Query embedder: dimension=%d, model=%s", _expected_dimension, config.EMBEDDING_MODEL)

    validate_dimension(embedding)
    return embedding


async def embed_query_async(text: str) -> List[float]:
    """
    Async-safe wrapper: runs embed_query in the default thread pool.
    Use this inside async FastAPI endpoints to avoid blocking the event loop.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, embed_query, text)


def validate_dimension(embedding: List[float]) -> None:
    """
    Verify the embedding dimension is consistent.
    Raises ValueError if dimension changes mid-run (should never happen
    since the model is a singleton, but guards against misconfiguration).
    """
    global _expected_dimension
    dim = len(embedding)
    if _expected_dimension is not None and dim != _expected_dimension:
        raise ValueError(
            f"Embedding dimension mismatch: got {dim}, expected {_expected_dimension}. "
            f"Ensure EMBEDDING_MODEL is consistent between ingestion and retrieval. "
            f"Current model: {config.EMBEDDING_MODEL}"
        )
