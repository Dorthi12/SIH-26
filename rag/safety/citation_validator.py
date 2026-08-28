"""
rag/safety/citation_validator.py — Source and citation validation.

Validates citations against the actual retrieved chunks before returning
them to the caller. Prevents the LLM from inventing citation metadata.

Public API
----------
validate_citations(citations, retrieved_chunks) → list[SourceCitation]
validate_official_source(citation)              → bool
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Set

log = logging.getLogger(__name__)


def _chunk_id_set(retrieved_chunks: List[Any]) -> Set[str]:
    """Build a set of chunk_ids from the retrieved chunk list."""
    return {c.chunk_id for c in retrieved_chunks if hasattr(c, "chunk_id")}


def _chunk_by_id(retrieved_chunks: List[Any]) -> Dict[str, Any]:
    """Build a lookup map: chunk_id → RetrievalCandidate."""
    return {c.chunk_id: c for c in retrieved_chunks if hasattr(c, "chunk_id")}


def validate_citations(
    citations: List[Any],
    retrieved_chunks: List[Any],
) -> List[Any]:
    """
    Validate citations against the set of actually-retrieved chunks.

    Rules applied:
    1. citation.source_id must correspond to a chunk_id in retrieved_chunks.
    2. citation.scheme_id must match the chunk's scheme_id.
    3. citation.document_title must be non-empty.
    4. page_number must be ≥ 0 (0 is allowed — means unknown page).
    5. source_url must be a non-empty string (empty URL → kept, but logged).

    Invalid citations are dropped and logged. The answer is never modified.

    Parameters
    ----------
    citations       : List of SourceCitation (or any object with source_id etc.)
    retrieved_chunks: List of RetrievalCandidate from the retrieval layer.

    Returns
    -------
    Filtered list of valid citations.
    """
    if not citations:
        return []

    chunk_map = _chunk_by_id(retrieved_chunks)
    valid: List[Any] = []
    dropped = 0

    for cit in citations:
        source_id = getattr(cit, "source_id", None) or ""
        scheme_id = getattr(cit, "scheme_id", None) or ""
        doc_title = getattr(cit, "document_title", None) or ""
        page_num = getattr(cit, "page_number", 0) or 0
        source_url = getattr(cit, "source_url", None) or ""

        # Rule 1: source_id must exist in retrieved set
        if source_id not in chunk_map:
            log.warning(
                "Citation dropped: source_id=%r not in retrieved chunks", source_id
            )
            dropped += 1
            continue

        chunk = chunk_map[source_id]

        # Rule 2: scheme_id must match
        chunk_scheme = getattr(chunk, "scheme_id", "")
        if scheme_id and chunk_scheme and scheme_id != chunk_scheme:
            log.warning(
                "Citation dropped: scheme_id mismatch citation=%r chunk=%r",
                scheme_id, chunk_scheme,
            )
            dropped += 1
            continue

        # Rule 3: document_title must be non-empty
        if not doc_title:
            log.warning(
                "Citation dropped: empty document_title for source_id=%r", source_id
            )
            dropped += 1
            continue

        # Rule 4: page_number must be non-negative
        if page_num < 0:
            log.warning(
                "Citation dropped: negative page_number=%d for source_id=%r",
                page_num, source_id,
            )
            dropped += 1
            continue

        # Rule 5: source_url empty → keep but warn
        if not source_url:
            log.debug("Citation source_url empty for source_id=%r", source_id)

        valid.append(cit)

    if dropped:
        log.info(
            "Citation validation: %d/%d valid, %d dropped",
            len(valid), len(citations), dropped,
        )
    return valid


def validate_official_source(citation: Any) -> bool:
    """
    Return True only if the citation's metadata explicitly marks it as official.

    NEVER infers official status from document title or URL.
    Returns the metadata value directly.
    """
    return bool(getattr(citation, "official_source", False))
