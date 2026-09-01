"""
rag/ingestion/chunker.py — Semantic text chunking with section detection.

Public API
----------
chunk_document(pages, doc_metadata, doc_hash)  →  list[Chunk]
"""

from __future__ import annotations

import hashlib
import logging
import re
from dataclasses import dataclass, field
from typing import List, Optional

from ingestion.extractor import PageData
from ingestion.metadata import DocumentMetadata
import config

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class Chunk:
    """A single semantically-coherent chunk ready for embedding and indexing."""
    # Identity
    chunk_id: str               # deterministic SHA-256 based on doc_hash + chunk_index
    chunk_index: int            # 0-based index within the document
    chunk_text: str

    # Location in source document
    section: str                # detected section heading, or "" if none detected
    page_number: int            # page where this chunk begins

    # Full document metadata (inherited)
    scheme_name: str
    scheme_id: str
    government_level: str
    state: Optional[str]
    document_title: str
    document_type: str
    language: str
    source_url: str
    source_type: str
    published_date: Optional[str]
    last_updated: Optional[str]
    document_version: Optional[str]
    file_path: str

    # Embedding — populated by embedder.py
    embedding: Optional[List[float]] = field(default=None, repr=False)


# ---------------------------------------------------------------------------
# Section detection
# ---------------------------------------------------------------------------

# Regex patterns that indicate a section heading.
# These fire on the STRIPPED line.
_SECTION_PATTERNS = [
    # Numbered headings: "1.", "1.1", "1.1.1", optionally followed by title
    re.compile(r"^\d+(\.\d+)*\.?\s+[A-Z\u0900-\u097F]"),
    # ALL-CAPS lines of at least 4 alphabetic characters
    re.compile(r"^[A-Z][A-Z\s\-:]{3,}$"),
    # Roman numerals: "I.", "II.", "III.", "IV." …
    re.compile(r"^[IVXLCDM]+\.\s+[A-Z\u0900-\u097F]"),
    # Lines that start with a keyword like "CHAPTER", "SECTION", "PART", "ANNEX"
    re.compile(r"^(CHAPTER|SECTION|PART|ANNEX|SCHEDULE|APPENDIX)\s", re.IGNORECASE),
]


def _is_section_heading(line: str) -> bool:
    stripped = line.strip()
    if not stripped or len(stripped) < 4:
        return False
    return any(p.match(stripped) for p in _SECTION_PATTERNS)


# ---------------------------------------------------------------------------
# Token approximation
# ---------------------------------------------------------------------------

def _approx_tokens(text: str) -> int:
    """Approximate token count: 1 token ≈ 4 characters (multilingual average)."""
    return max(1, len(text) // 4)


# ---------------------------------------------------------------------------
# Sliding-window chunking
# ---------------------------------------------------------------------------

def _split_into_windows(
    text: str,
    page_number: int,
    section: str,
    chunk_size_tokens: int,
    overlap_tokens: int,
) -> List[tuple[str, int, str]]:
    """
    Split text into overlapping windows.

    Returns list of (chunk_text, page_number, section) tuples.
    """
    chunk_size_chars = chunk_size_tokens * 4
    overlap_chars = overlap_tokens * 4
    step = chunk_size_chars - overlap_chars

    if step <= 0:
        step = chunk_size_chars

    results = []
    start = 0
    while start < len(text):
        end = start + chunk_size_chars
        chunk_text = text[start:end].strip()
        if chunk_text:
            results.append((chunk_text, page_number, section))
        start += step

    return results


# ---------------------------------------------------------------------------
# Deterministic chunk ID
# ---------------------------------------------------------------------------

def _make_chunk_id(doc_hash: str, chunk_index: int) -> str:
    """
    Generate a stable, deterministic vector ID.

    Format: sha256(doc_hash + ":" + chunk_index)[:32]
    This ensures the same document always produces the same IDs — running the
    pipeline twice will upsert (overwrite) rather than duplicate vectors.
    """
    raw = f"{doc_hash}:{chunk_index}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def chunk_document(
    pages: List[PageData],
    doc_metadata: DocumentMetadata,
    doc_hash: str,
) -> List[Chunk]:
    """
    Chunk all pages of a document into semantically useful units.

    Strategy
    --------
    1. Walk pages in order, line by line.
    2. Detect section headers — when found, flush the current buffer and
       start a new section.
    3. Within each section, accumulate text until it exceeds the target token
       budget, then emit a chunk with a trailing overlap.
    4. At end-of-document, flush any remaining buffer.

    Parameters
    ----------
    pages        : Cleaned pages from cleaner.clean_pages().
    doc_metadata : Document-level metadata from metadata.infer_metadata().
    doc_hash     : MD5 hex of the source file (from state_store).

    Returns
    -------
    List of Chunk objects with all metadata attached, ready for embedding.
    """
    chunk_size_tokens = config.CHUNK_TOKEN_SIZE
    overlap_tokens = config.CHUNK_OVERLAP_TOKENS

    # Accumulate (text_fragment, page_number, section) triples
    window_inputs: List[tuple[str, int, str]] = []

    current_section = ""
    current_buffer: List[str] = []
    current_page = 1

    def _flush_buffer(page_num: int, section: str) -> None:
        nonlocal current_buffer
        text = "\n".join(current_buffer).strip()
        if not text:
            current_buffer = []
            return
        windows = _split_into_windows(
            text, page_num, section, chunk_size_tokens, overlap_tokens
        )
        window_inputs.extend(windows)
        current_buffer = []

    for page in pages:
        lines = page.raw_text.split("\n")
        for line in lines:
            if _is_section_heading(line):
                # Flush current buffer before starting new section
                _flush_buffer(current_page, current_section)
                current_section = line.strip()
                current_page = page.page_number
                # Don't skip the heading line — include it in next chunk
                current_buffer.append(line)
            else:
                current_buffer.append(line)
                # Check if buffer has grown large enough to flush
                buffer_text = "\n".join(current_buffer)
                if _approx_tokens(buffer_text) >= chunk_size_tokens:
                    _flush_buffer(page.page_number, current_section)
                    # Keep overlap: re-add last `overlap_tokens` worth of text
                    overlap_chars = overlap_tokens * 4
                    if len(buffer_text) > overlap_chars:
                        overlap_text = buffer_text[-overlap_chars:]
                        current_buffer = [overlap_text]
                    current_page = page.page_number

        current_page = page.page_number

    # Flush final buffer
    _flush_buffer(current_page, current_section)

    # Build Chunk objects
    chunks: List[Chunk] = []
    for idx, (text, page_num, section) in enumerate(window_inputs):
        if not text.strip():
            continue
        chunk = Chunk(
            chunk_id=_make_chunk_id(doc_hash, idx),
            chunk_index=idx,
            chunk_text=text,
            section=section,
            page_number=page_num,
            scheme_name=doc_metadata.scheme_name,
            scheme_id=doc_metadata.scheme_id,
            government_level=doc_metadata.government_level,
            state=doc_metadata.state,
            document_title=doc_metadata.document_title,
            document_type=doc_metadata.document_type,
            language=doc_metadata.language,
            source_url=doc_metadata.source_url,
            source_type=doc_metadata.source_type,
            published_date=doc_metadata.published_date,
            last_updated=doc_metadata.last_updated,
            document_version=doc_metadata.document_version,
            file_path=doc_metadata.file_path,
        )
        chunks.append(chunk)

    log.info(
        "%s: %d chunks generated (target %d tokens, %d overlap)",
        doc_metadata.document_title,
        len(chunks),
        chunk_size_tokens,
        overlap_tokens,
    )
    return chunks
