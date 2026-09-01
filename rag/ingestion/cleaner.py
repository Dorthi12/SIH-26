"""
rag/ingestion/cleaner.py — Text cleaning and normalisation for extracted PDF text.

Public API
----------
clean_pages(pages)       →  list[PageData]   (operates on PageData objects)
clean_text(raw_text)     →  str              (single string — used by chunker)
"""

from __future__ import annotations

import logging
import re
import unicodedata
from collections import Counter
from typing import List

from ingestion.extractor import PageData

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# A line is considered a header/footer candidate if it appears on at least
# this fraction of total pages.
HEADER_FOOTER_FREQUENCY_THRESHOLD = 0.60

# Minimum pages a document needs before we attempt header/footer detection.
MIN_PAGES_FOR_HF_DETECTION = 3


# ---------------------------------------------------------------------------
# Individual text transforms
# ---------------------------------------------------------------------------

def _unicode_normalise(text: str) -> str:
    """NFC normalise and replace common special characters."""
    text = unicodedata.normalize("NFC", text)
    # Collapse various dash/hyphen Unicode variants to ASCII hyphen
    text = re.sub(r"[\u2010-\u2015\u2212]", "-", text)
    # Replace smart quotes
    text = re.sub(r"[\u2018\u2019]", "'", text)
    text = re.sub(r"[\u201c\u201d]", '"', text)
    # Replace non-breaking spaces
    text = text.replace("\xa0", " ")
    return text


def _remove_null_bytes(text: str) -> str:
    return text.replace("\x00", "")


def _collapse_whitespace(text: str) -> str:
    """
    Collapse runs of spaces/tabs on each line, then collapse runs of blank
    lines (>2 consecutive newlines) to a single blank line.
    """
    # Collapse horizontal whitespace on each line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
    text = "\n".join(lines)
    # Collapse 3+ consecutive newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _remove_page_number_lines(text: str) -> str:
    """
    Remove standalone page-number lines such as:
        "Page 1 of 42", "1", "- 1 -", "Page 1"
    These are typically isolated short lines.
    """
    patterns = [
        r"^\s*[Pp]age\s+\d+\s*(of\s+\d+)?\s*$",
        r"^\s*-\s*\d+\s*-\s*$",
        r"^\s*\d+\s*$",
        r"^\s*\|\s*\d+\s*\|\s*$",
    ]
    combined = re.compile("|".join(patterns), re.MULTILINE)
    return combined.sub("", text)


def _remove_extraction_artifacts(text: str) -> str:
    """
    Remove common PDF extraction artifacts:
    - Strings of repeated punctuation (e.g. "...............") beyond 4 chars
    - Lines that are purely non-alpha (e.g. "============================")
    """
    # Repeated dots / dashes / underscores / equals (table-of-contents leaders)
    text = re.sub(r"([.\-_=|])\1{4,}", "", text)
    # Lines that contain only punctuation / numbers (likely table borders)
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if stripped and re.fullmatch(r"[^A-Za-z\u0900-\u097F]+", stripped):
            # Line has no alphabetic characters (Latin or Devanagari) — skip
            continue
        cleaned.append(line)
    return "\n".join(cleaned)


def clean_text(raw_text: str) -> str:
    """
    Apply all cleaning transforms to a single page's raw text.
    This is the primary single-text entry point used by the chunker.
    """
    text = _remove_null_bytes(raw_text)
    text = _unicode_normalise(text)
    text = _remove_page_number_lines(text)
    text = _remove_extraction_artifacts(text)
    text = _collapse_whitespace(text)
    return text


# ---------------------------------------------------------------------------
# Header / footer detection across pages
# ---------------------------------------------------------------------------

def _extract_candidate_lines(text: str, n: int = 3) -> List[str]:
    """Return the first and last n non-empty lines of a page (likely header/footer)."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    candidates = lines[:n] + lines[-n:]
    return [l for l in candidates if len(l) > 4]  # skip very short lines


def _detect_repeated_lines(pages: List[PageData], threshold: float) -> set[str]:
    """
    Identify lines that appear on a high fraction of pages.
    These are likely headers, footers, or watermarks.
    """
    if len(pages) < MIN_PAGES_FOR_HF_DETECTION:
        return set()

    line_counter: Counter[str] = Counter()
    for page in pages:
        candidates = _extract_candidate_lines(page.raw_text)
        # Use a set per page so a line repeated within one page isn't counted twice
        for line in set(candidates):
            line_counter[line] += 1

    total = len(pages)
    repeated = {
        line
        for line, count in line_counter.items()
        if count / total >= threshold
    }
    if repeated:
        log.debug("Detected %d repeated header/footer line(s)", len(repeated))
    return repeated


def _strip_repeated_lines(text: str, repeated_lines: set[str]) -> str:
    """Remove occurrences of detected header/footer lines from text."""
    if not repeated_lines:
        return text
    lines = text.split("\n")
    cleaned = [line for line in lines if line.strip() not in repeated_lines]
    return "\n".join(cleaned)


# ---------------------------------------------------------------------------
# Public page-level cleaner
# ---------------------------------------------------------------------------

def clean_pages(pages: List[PageData]) -> List[PageData]:
    """
    Clean all pages in a document.

    Steps:
    1. Detect repeated header/footer lines across the page set.
    2. For each page: strip headers/footers, then apply all text transforms.

    Returns a new list of PageData with cleaned text (raw_text replaced).
    """
    repeated_lines = _detect_repeated_lines(pages, HEADER_FOOTER_FREQUENCY_THRESHOLD)

    cleaned: List[PageData] = []
    for page in pages:
        text = _strip_repeated_lines(page.raw_text, repeated_lines)
        text = clean_text(text)
        cleaned.append(PageData(
            page_number=page.page_number,
            raw_text=text,
            char_count=len(text),
        ))
    return cleaned
