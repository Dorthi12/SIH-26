"""
rag/retrieval/reranker.py — Cross-encoder reranking for hybrid retrieval.

Uses a HuggingFace cross-encoder (sentence-transformers CrossEncoder)
to score (query, chunk_text) pairs and rerank the fused candidates.

Default model: cross-encoder/ms-marco-MiniLM-L-6-v2
  - Small (22M params), fast, good English relevance ranking
  - Reasonable Hinglish support (mixed English vocabulary)
  - Limited Hindi support: dense retrieval remains primary for Hindi
  - Documented limitation: see docstring

Fallback: if the model fails to load or scoring raises an exception,
  candidates are returned sorted by rrf_score (no exception propagated).

Public API
----------
get_reranker()                                          → CrossEncoderReranker
reranker.rerank(query, candidates, top_k)              → list[RetrievalCandidate]
reranker.is_available                                  → bool
"""

from __future__ import annotations

import logging
import time
from typing import List, Optional

from rag import config
from rag.retrieval.models import RetrievalCandidate

log = logging.getLogger(__name__)


class CrossEncoderReranker:
    """
    Cross-encoder reranker using sentence-transformers.

    Multilingual note
    -----------------
    The default model (ms-marco-MiniLM-L-6-v2) was trained on English MS MARCO.
    It works well for English and reasonably for Hinglish (mixed English terms),
    but should not be relied on for pure Hindi queries. The dense retriever
    (paraphrase-multilingual-MiniLM-L12-v2) remains the primary multilingual
    component. Reranking adds value on top of dense for English/Hinglish.
    """

    def __init__(self, model_name: Optional[str] = None) -> None:
        self._model_name = model_name or config.RERANKER_MODEL
        self._model = None
        self._available = False
        self._load_model()

    def _load_model(self) -> None:
        """Load the cross-encoder model. Sets _available=False on any failure."""
        try:
            from sentence_transformers import CrossEncoder
            log.info("Loading reranker model: %s", self._model_name)
            t_start = time.perf_counter()
            self._model = CrossEncoder(self._model_name, max_length=512)
            elapsed_ms = int((time.perf_counter() - t_start) * 1000)
            self._available = True
            log.info("Reranker model loaded in %dms", elapsed_ms)
        except Exception as exc:
            log.warning(
                "Reranker model %r failed to load: %s — reranking disabled, using RRF order",
                self._model_name, exc,
            )
            self._available = False

    @property
    def is_available(self) -> bool:
        return self._available and self._model is not None

    def rerank(
        self,
        query: str,
        candidates: List[RetrievalCandidate],
        top_k: int,
    ) -> List[RetrievalCandidate]:
        """
        Rerank candidates using the cross-encoder.

        Parameters
        ----------
        query      : The farmer's query.
        candidates : Fused candidates with rrf_score set.
        top_k      : Number of final results to return.

        Returns
        -------
        list[RetrievalCandidate] sorted by rerank_score descending, top_k max.
        rerank_score and final_rank are set on each returned candidate.

        Fallback: on any error, returns candidates[:top_k] sorted by rrf_score.
        """
        if not candidates:
            return []

        if not self.is_available or not config.RERANKER_ENABLED:
            log.debug("Reranker not available/disabled — using RRF order")
            result = sorted(candidates, key=lambda c: c.rrf_score, reverse=True)[:top_k]
            for i, c in enumerate(result):
                c.final_rank = i + 1
            return result

        try:
            t_start = time.perf_counter()

            # Build (query, text) pairs — truncate very long texts
            pairs = [(query, c.chunk_text[:1000]) for c in candidates]
            scores = self._model.predict(pairs, show_progress_bar=False)

            elapsed_ms = int((time.perf_counter() - t_start) * 1000)
            log.info(
                "Reranker: scored %d pairs in %dms (top raw score=%.4f)",
                len(candidates), elapsed_ms, max(scores) if len(scores) > 0 else 0,
            )

            # Attach rerank_score to each candidate
            from dataclasses import replace
            scored = []
            for c, score in zip(candidates, scores):
                scored.append(replace(c, rerank_score=float(score)))

            # Sort by rerank_score descending
            scored.sort(key=lambda c: c.rerank_score, reverse=True)

            # Set final_rank and truncate
            result = scored[:top_k]
            for i, c in enumerate(result):
                c.final_rank = i + 1

            return result

        except Exception as exc:
            log.warning(
                "Reranker scoring failed: %s — falling back to RRF order", exc
            )
            fallback = sorted(candidates, key=lambda c: c.rrf_score, reverse=True)[:top_k]
            for i, c in enumerate(fallback):
                c.final_rank = i + 1
            return fallback


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_reranker_instance: Optional[CrossEncoderReranker] = None


def get_reranker() -> CrossEncoderReranker:
    """Return the shared CrossEncoderReranker instance (lazy load)."""
    global _reranker_instance
    if _reranker_instance is None:
        _reranker_instance = CrossEncoderReranker()
    return _reranker_instance
