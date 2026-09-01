"""
rag/ingestion/metadata.py — Metadata inference from directory structure and manifest.

Public API
----------
infer_metadata(doc_info)  →  DocumentMetadata
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from ingestion.discovery import DocumentInfo

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Slug → human-readable name mapping
# This maps directory names to display names.
# This is purely cosmetic/display data — not government scheme content.
# ---------------------------------------------------------------------------

_SCHEME_SLUG_TO_NAME: dict[str, str] = {
    "pm_kisan": "PM-KISAN",
    "pmfby": "PMFBY",
    "kcc": "Kisan Credit Card (KCC)",
    "pmksy": "PMKSY",
    "soil_health_card": "Soil Health Card",
    "agricultural_mechanization": "Sub-Mission on Agricultural Mechanization (SMAM)",
    "agriculture_infrastructure_fund": "Agriculture Infrastructure Fund (AIF)",
    "rkvy": "RKVY-RAFTAAR",
    # State-level catch-all
    "uttar_pradesh": "Uttar Pradesh Agriculture Schemes",
}

_STATE_SLUG_TO_NAME: dict[str, str] = {
    "uttar_pradesh": "Uttar Pradesh",
    "maharashtra": "Maharashtra",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "gujarat": "Gujarat",
    "rajasthan": "Rajasthan",
    "madhya_pradesh": "Madhya Pradesh",
    "karnataka": "Karnataka",
    "andhra_pradesh": "Andhra Pradesh",
    "telangana": "Telangana",
    "tamil_nadu": "Tamil Nadu",
    "west_bengal": "West Bengal",
    "bihar": "Bihar",
    "odisha": "Odisha",
    "assam": "Assam",
}

# File/folder patterns that suggest Hindi language
_HINDI_PATTERNS = re.compile(r"hindi|_hi[_.]|[_-]hin[_.]", re.IGNORECASE)

# Patterns to extract year from filename (e.g. 2023_guidelines, guidelines_2023)
_YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")

# Document type inference from filename keywords
_DOCTYPE_KEYWORDS: dict[str, str] = {
    "guideline": "Operational Guidelines",
    "guidelines": "Operational Guidelines",
    "operational": "Operational Guidelines",
    "faq": "FAQ Document",
    "circular": "Government Circular",
    "notification": "Government Notification",
    "order": "Government Order",
    "budget": "Budget Document",
    "qa": "Q&A Document",
    "features": "Scheme Features Document",
    "brochure": "Scheme Brochure",
    "handbook": "Handbook",
    "manual": "Manual",
    "report": "Report",
}


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class DocumentMetadata:
    """
    Rich metadata for a government scheme document.
    All fields that could not be inferred are None or empty string — never fabricated.
    """
    # Identity
    scheme_name: str = ""
    scheme_id: str = ""           # directory slug, e.g. "pmfby"

    # Provenance
    government_level: str = ""    # "central" or "state"
    state: Optional[str] = None   # e.g. "Uttar Pradesh" — only for state-level docs

    # Document info
    document_title: str = ""
    document_type: str = ""
    language: str = "en"          # "en", "hi", or "en+hi"

    # Source
    source_url: str = ""
    source_type: str = ""

    # Temporal (inferred from filename or manifest where possible)
    published_date: Optional[str] = None
    last_updated: Optional[str] = None
    document_version: Optional[str] = None

    # Computed
    file_path: str = ""


# ---------------------------------------------------------------------------
# Inference helpers
# ---------------------------------------------------------------------------

def _infer_government_level(folder_relative: str) -> tuple[str, Optional[str]]:
    """
    Parse the first path segment to determine government_level and state.

    "central/pmfby"          → ("central", None)
    "state/uttar_pradesh"    → ("state", "Uttar Pradesh")
    """
    parts = Path(folder_relative).parts
    if not parts:
        return ("unknown", None)

    level = parts[0].lower()
    if level == "central":
        return ("central", None)
    elif level == "state":
        state_slug = parts[1].lower() if len(parts) > 1 else ""
        state_name = _STATE_SLUG_TO_NAME.get(state_slug, _slug_to_title(state_slug))
        return ("state", state_name if state_slug else None)
    else:
        return (level, None)


def _infer_scheme_id(folder_relative: str, government_level: str) -> str:
    """
    Extract scheme_id from the directory path.

    "central/pmfby"               → "pmfby"
    "state/uttar_pradesh"         → "uttar_pradesh"
    "state/uttar_pradesh/pmfby"   → "pmfby"
    """
    parts = list(Path(folder_relative).parts)
    if not parts:
        return ""

    if government_level == "central" and len(parts) >= 2:
        return parts[1].lower()
    elif government_level == "state" and len(parts) >= 3:
        return parts[2].lower()
    elif government_level == "state" and len(parts) >= 2:
        # State-level doc without a sub-scheme folder
        return parts[1].lower()
    elif len(parts) >= 2:
        return parts[-1].lower()
    return parts[0].lower()


def _slug_to_title(slug: str) -> str:
    """Convert a snake_case slug to Title Case for display."""
    return slug.replace("_", " ").title()


def _infer_document_type(stem: str) -> str:
    """Guess document type from filename keywords."""
    stem_lower = stem.lower().replace("_", " ").replace("-", " ")
    for keyword, doc_type in _DOCTYPE_KEYWORDS.items():
        if keyword in stem_lower:
            return doc_type
    return "Government Document"


def _infer_language(stem: str, folder_relative: str) -> str:
    """Detect language from filename patterns."""
    combined = f"{stem} {folder_relative}".lower()
    if _HINDI_PATTERNS.search(combined):
        return "hi"
    return "en"


def _infer_published_date(stem: str) -> Optional[str]:
    """Extract a year from the filename as a proxy for published_date."""
    match = _YEAR_PATTERN.search(stem)
    if match:
        return match.group(0)
    return None


def _infer_document_title(stem: str, scheme_name: str) -> str:
    """
    Build a human-readable document title from the filename stem.
    E.g. "PMFBY_Revised_Operational_Guidelines_2023" → "PMFBY Revised Operational Guidelines 2023"
    """
    title = stem.replace("_", " ").replace("-", " ")
    # Collapse multiple spaces
    title = re.sub(r"\s+", " ", title).strip()
    return title


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def infer_metadata(doc_info: DocumentInfo) -> DocumentMetadata:
    """
    Infer all available metadata from a DocumentInfo.

    Priority:
      1. Sources manifest (explicit URL, source_type)
      2. Directory structure (government_level, state, scheme_id)
      3. Filename (document_title, document_type, language, published_date)

    Information that cannot be reliably inferred is left None / empty — nothing is fabricated.
    """
    folder = doc_info.folder_relative
    stem = doc_info.stem

    # Government level + state
    government_level, state = _infer_government_level(folder)

    # Scheme ID
    scheme_id = _infer_scheme_id(folder, government_level)

    # Scheme name (human readable)
    scheme_name = _SCHEME_SLUG_TO_NAME.get(scheme_id, _slug_to_title(scheme_id))

    # Document title
    document_title = _infer_document_title(stem, scheme_name)

    # Document type
    document_type = _infer_document_type(stem)

    # Language
    language = _infer_language(stem, folder)

    # Published date
    published_date = _infer_published_date(stem)

    # Source URL + type — from manifest if available
    source_url = ""
    source_type = ""
    if doc_info.manifest_entry:
        source_url = doc_info.manifest_entry.official_url
        source_type = doc_info.manifest_entry.source_type

    meta = DocumentMetadata(
        scheme_name=scheme_name,
        scheme_id=scheme_id,
        government_level=government_level,
        state=state,
        document_title=document_title,
        document_type=document_type,
        language=language,
        source_url=source_url,
        source_type=source_type,
        published_date=published_date,
        last_updated=None,       # not available from filename alone
        document_version=None,   # not available from filename alone
        file_path=str(doc_info.path),
    )

    log.debug(
        "Metadata inferred for %s: level=%s scheme=%s lang=%s",
        doc_info.filename, government_level, scheme_id, language,
    )
    return meta
