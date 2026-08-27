"""
rag/ingestion/extractor.py — PDF text extraction using pypdf.

Public API
----------
extract_pages(pdf_path)  →  list[PageData]
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class PageData:
    """Raw extracted text from a single PDF page."""
    page_number: int    # 1-indexed
    raw_text: str
    char_count: int


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def extract_pages(pdf_path: Path) -> List[PageData]:
    """
    Extract raw text from every page of a PDF using pypdf.

    Parameters
    ----------
    pdf_path : Absolute path to the PDF file.

    Returns
    -------
    List of PageData, one per page, in document order.
    Empty list if the PDF cannot be opened or has no extractable text.

    Notes
    -----
    - pypdf is pure-Python and handles most text-layer PDFs well.
    - Scanned (image-only) PDFs will return empty strings per page —
      the caller (pipeline.py) will log a warning for these.
    - Encrypted PDFs with unknown passwords are skipped gracefully.
    """
    try:
        import pypdf  # deferred import — keeps startup fast if not installed
    except ImportError as exc:
        raise ImportError(
            "pypdf is required for PDF extraction. Install it with:\n"
            "  pip install pypdf"
        ) from exc

    pages: List[PageData] = []

    try:
        reader = pypdf.PdfReader(str(pdf_path))

        if reader.is_encrypted:
            # Attempt decryption with an empty password (handles some gov PDFs)
            try:
                reader.decrypt("")
            except Exception:  # noqa: BLE001
                log.warning("Encrypted PDF (password protected), skipping: %s", pdf_path.name)
                return []

        total_pages = len(reader.pages)
        log.debug("Opening %s (%d pages)", pdf_path.name, total_pages)

        for i, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text() or ""
            except Exception as exc:  # noqa: BLE001
                log.warning("Failed to extract page %d of %s: %s", i, pdf_path.name, exc)
                text = ""

            pages.append(PageData(
                page_number=i,
                raw_text=text,
                char_count=len(text),
            ))

    except pypdf.errors.PdfReadError as exc:
        log.error("Cannot read PDF %s: %s — skipping.", pdf_path.name, exc)
        return []
    except Exception as exc:  # noqa: BLE001
        log.error("Unexpected error reading %s: %s — skipping.", pdf_path.name, exc)
        return []

    extractable = sum(1 for p in pages if p.char_count > 0)
    log.info(
        "%s: %d pages, %d extractable, %d total chars",
        pdf_path.name,
        len(pages),
        extractable,
        sum(p.char_count for p in pages),
    )

    if pages and extractable == 0:
        log.warning(
            "%s appears to be a scanned/image-only PDF — no text extracted. "
            "Consider running OCR (e.g. ocrmypdf) on this file first.",
            pdf_path.name,
        )

    return pages


def total_char_count(pages: List[PageData]) -> int:
    """Convenience: sum of characters across all pages."""
    return sum(p.char_count for p in pages)
