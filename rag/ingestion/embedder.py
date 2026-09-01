"""
rag/ingestion/embedder.py — Sentence Transformer embedding wrapper.

Public API
----------
get_embedder()             →  Embedder (singleton)
embedder.embed_chunks(chunks)  →  list[Chunk]  (with .embedding populated)
"""

from __future__ import annotations

import logging
from typing import List, Optional

import config
from ingestion.chunker import Chunk

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Embedder class
# ---------------------------------------------------------------------------

class Embedder:
    """
    Thin wrapper around a SentenceTransformer model.

    The model is loaded once on first use and reused for the entire ingestion
    session. Do not call this per-document — call get_embedder() once.

    The model is NEVER fine-tuned or trained here — we only call .encode().
    """

    def __init__(self, model_name: str) -> None:
        self._model_name = model_name
        self._model = None  # lazy-loaded

    def _load_model(self) -> None:
        if self._model is not None:
            return
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as exc:
            raise ImportError(
                "sentence-transformers is required for embedding. Install it with:\n"
                "  pip install sentence-transformers"
            ) from exc

        log.info("Loading embedding model: %s (this may take a moment on first run)…", self._model_name)
        self._model = SentenceTransformer(self._model_name)
        dim = self._model.get_sentence_embedding_dimension()
        log.info("Model loaded. Embedding dimension: %d", dim)

    @property
    def dimension(self) -> int:
        """Return the embedding dimension (loads model if not yet loaded)."""
        self._load_model()
        return self._model.get_sentence_embedding_dimension()

    def embed_chunks(self, chunks: List[Chunk], batch_size: Optional[int] = None) -> List[Chunk]:
        """
        Generate embeddings for all chunks and attach them in-place.

        Parameters
        ----------
        chunks     : List of Chunk objects with populated chunk_text.
        batch_size : Override config.EMBEDDING_BATCH_SIZE if needed.

        Returns
        -------
        The same list with .embedding populated on every Chunk.
        """
        if not chunks:
            return chunks

        self._load_model()
        bs = batch_size or config.EMBEDDING_BATCH_SIZE

        texts = [c.chunk_text for c in chunks]
        log.debug("Encoding %d chunks in batches of %d…", len(texts), bs)

        # SentenceTransformer.encode returns a numpy array; convert to Python list
        embeddings = self._model.encode(
            texts,
            batch_size=bs,
            show_progress_bar=False,   # pipeline handles its own progress output
            convert_to_numpy=True,
        )

        for chunk, emb in zip(chunks, embeddings):
            chunk.embedding = emb.tolist()

        log.info("Generated %d embeddings (dim=%d)", len(chunks), len(chunks[0].embedding))
        return chunks

    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string. Used by debug.py for query testing."""
        self._load_model()
        emb = self._model.encode([text], show_progress_bar=False, convert_to_numpy=True)
        return emb[0].tolist()


# ---------------------------------------------------------------------------
# Singleton accessor
# ---------------------------------------------------------------------------

_embedder_instance: Optional[Embedder] = None


def get_embedder() -> Embedder:
    """
    Return the shared Embedder instance, creating it on first call.

    The model name comes from config.EMBEDDING_MODEL (env var: EMBEDDING_MODEL).
    Override before first call by setting the env var; changing it mid-run has no effect.
    """
    global _embedder_instance
    if _embedder_instance is None:
        _embedder_instance = Embedder(config.EMBEDDING_MODEL)
    return _embedder_instance
