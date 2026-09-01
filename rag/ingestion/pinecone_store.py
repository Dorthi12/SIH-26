"""
rag/ingestion/pinecone_store.py — Pinecone upsert and query layer.

Public API
----------
PineconeStore.upsert_chunks(chunks)          →  int (vectors upserted)
PineconeStore.query_sample(embedding, top_k) →  list[dict]
PineconeStore.from_config()                  →  PineconeStore (factory)
"""

from __future__ import annotations

import logging
from dataclasses import asdict
from typing import Any, Dict, List, Optional

import config
from ingestion.chunker import Chunk

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Metadata helpers
# ---------------------------------------------------------------------------

def _chunk_to_vector(chunk: Chunk) -> Dict[str, Any]:
    """
    Build a Pinecone vector dict from a Chunk.

    Pinecone metadata values must be: str, int, float, bool, or list[str].
    None values are converted to empty string so Pinecone doesn't reject them.
    """
    def _safe(v: Any) -> Any:
        if v is None:
            return ""
        return v

    metadata: Dict[str, Any] = {
        # Chunk identity
        "chunk_id": chunk.chunk_id,
        "chunk_index": chunk.chunk_index,
        "chunk_text": chunk.chunk_text,  # stored in metadata for retrieval

        # Document location
        "section": _safe(chunk.section),
        "page_number": chunk.page_number,

        # Scheme metadata
        "scheme_name": _safe(chunk.scheme_name),
        "scheme_id": _safe(chunk.scheme_id),
        "government_level": _safe(chunk.government_level),
        "state": _safe(chunk.state),

        # Document metadata
        "document_title": _safe(chunk.document_title),
        "document_type": _safe(chunk.document_type),
        "language": _safe(chunk.language),

        # Provenance
        "source_url": _safe(chunk.source_url),
        "source_type": _safe(chunk.source_type),
        "file_path": _safe(chunk.file_path),

        # Temporal
        "published_date": _safe(chunk.published_date),
        "last_updated": _safe(chunk.last_updated),
        "document_version": _safe(chunk.document_version),
    }

    return {
        "id": chunk.chunk_id,
        "values": chunk.embedding,
        "metadata": metadata,
    }


# ---------------------------------------------------------------------------
# PineconeStore
# ---------------------------------------------------------------------------

class PineconeStore:
    """
    Thin wrapper around the Pinecone client for upsert and query operations.

    Uses the modern pinecone>=5 SDK (Pinecone class, not pinecone.init()).
    """

    def __init__(self, index_name: str, namespace: str, api_key: str) -> None:
        self._index_name = index_name
        self._namespace = namespace
        self._api_key = api_key
        self._index = None  # lazy-initialised

    def _get_index(self):
        if self._index is not None:
            return self._index

        try:
            from pinecone import Pinecone
        except ImportError as exc:
            raise ImportError(
                "pinecone is required. Install it with:\n"
                "  pip install pinecone"
            ) from exc

        log.info("Connecting to Pinecone index: %s", self._index_name)
        pc = Pinecone(api_key=self._api_key)
        self._index = pc.Index(self._index_name)
        log.info("Connected to Pinecone index: %s", self._index_name)
        return self._index

    @classmethod
    def from_config(cls) -> "PineconeStore":
        """Factory: create from environment-variable config."""
        config.require_pinecone_config()
        return cls(
            index_name=config.PINECONE_INDEX_NAME,
            namespace=config.PINECONE_NAMESPACE,
            api_key=config.PINECONE_API_KEY,
        )

    def upsert_chunks(self, chunks: List[Chunk]) -> int:
        """
        Upsert all chunks to Pinecone in batches.

        Chunks must have .embedding populated (call embedder.embed_chunks first).

        Returns the number of vectors upserted.
        """
        if not chunks:
            return 0

        missing_embeddings = [c.chunk_id for c in chunks if c.embedding is None]
        if missing_embeddings:
            raise ValueError(
                f"{len(missing_embeddings)} chunk(s) have no embedding. "
                "Call embedder.embed_chunks() before upsert_chunks()."
            )

        index = self._get_index()
        batch_size = config.PINECONE_UPSERT_BATCH_SIZE
        total_upserted = 0

        vectors = [_chunk_to_vector(c) for c in chunks]

        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            try:
                index.upsert(vectors=batch, namespace=self._namespace)
                total_upserted += len(batch)
                log.debug("Upserted batch %d-%d (%d vectors)", i, i + len(batch), len(batch))
            except Exception as exc:  # noqa: BLE001
                log.error(
                    "Pinecone upsert failed for batch %d-%d: %s",
                    i, i + len(batch), exc
                )
                raise

        log.info("Total vectors upserted to Pinecone: %d", total_upserted)
        return total_upserted

    def query_sample(
        self,
        embedding: List[float],
        top_k: int = 3,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Query Pinecone for similar vectors.

        Used by debug.py to confirm a vector was stored and is retrievable.

        Returns list of result dicts: {id, score, metadata}.
        """
        index = self._get_index()

        query_kwargs: Dict[str, Any] = {
            "vector": embedding,
            "top_k": top_k,
            "namespace": self._namespace,
            "include_metadata": True,
        }
        if filter_metadata:
            query_kwargs["filter"] = filter_metadata

        try:
            response = index.query(**query_kwargs)
        except Exception as exc:  # noqa: BLE001
            log.error("Pinecone query failed: %s", exc)
            raise

        results = []
        for match in response.matches:
            results.append({
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata,
            })

        return results

    def describe_index_stats(self) -> Dict[str, Any]:
        """Return index stats (total vector count, etc.)."""
        index = self._get_index()
        try:
            stats = index.describe_index_stats()
            return {
                "total_vector_count": stats.total_vector_count,
                "dimension": stats.dimension,
                "namespaces": {
                    ns: {"vector_count": info.vector_count}
                    for ns, info in (stats.namespaces or {}).items()
                },
            }
        except Exception as exc:  # noqa: BLE001
            log.warning("Could not fetch index stats: %s", exc)
            return {}
