"""
rag/ingestion/discovery.py — Recursive document discovery + sources_manifest.csv lookup.

Public API
----------
discover_documents(source_dir)  →  list[DocumentInfo]
load_manifest(source_dir)       →  ManifestLookup
"""

from __future__ import annotations

import csv
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

log = logging.getLogger(__name__)

# File extensions treated as "supported documents"
SUPPORTED_EXTENSIONS: frozenset[str] = frozenset({".pdf"})


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class ManifestEntry:
    """A single row from sources_manifest.csv."""
    scheme: str
    folder: str            # e.g. "central/pmfby"
    document: str          # partial document title / stem from manifest
    source_type: str
    official_url: str
    notes: str


# Key: (folder_path_relative, document_stem_lower)
ManifestLookup = Dict[Tuple[str, str], ManifestEntry]


@dataclass
class DocumentInfo:
    """Everything we know about a discovered document before parsing it."""
    path: Path                          # absolute path to file
    relative_path: str                  # relative to source_dir, e.g. "central/pmfby/2023_guidelines.pdf"
    filename: str                       # "2023_guidelines.pdf"
    stem: str                           # "2023_guidelines"
    extension: str                      # ".pdf"
    folder_relative: str                # "central/pmfby"
    manifest_entry: Optional[ManifestEntry] = field(default=None)


# ---------------------------------------------------------------------------
# Manifest loading
# ---------------------------------------------------------------------------

def load_manifest(source_dir: Path) -> ManifestLookup:
    """
    Parse sources_manifest.csv and return a lookup dictionary.

    The manifest CSV has columns:
        scheme, folder, document, source_type, official_url, notes

    The lookup key is (folder_normalised, document_stem_lower) where
    folder_normalised strips trailing slashes and document_stem_lower is the
    document column lowercased and stripped.
    """
    manifest_path = source_dir / "sources_manifest.csv"
    lookup: ManifestLookup = {}

    if not manifest_path.exists():
        log.warning("sources_manifest.csv not found at %s — URL metadata will be empty.", manifest_path)
        return lookup

    with open(manifest_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                entry = ManifestEntry(
                    scheme=row.get("scheme", "").strip(),
                    folder=row.get("folder", "").strip().rstrip("/"),
                    document=row.get("document", "").strip(),
                    source_type=row.get("source_type", "").strip(),
                    official_url=row.get("official_url", "").strip(),
                    notes=row.get("notes", "").strip(),
                )
                if not entry.folder:
                    continue

                # Build lookup keys: exact document title + variants
                doc_stem_lower = entry.document.lower().strip()
                lookup[(entry.folder, doc_stem_lower)] = entry

            except Exception as exc:  # noqa: BLE001
                log.warning("Skipping malformed manifest row %s: %s", row, exc)

    log.info("Loaded %d manifest entries from %s", len(lookup), manifest_path)
    return lookup


def _find_manifest_entry(
    folder_relative: str,
    stem: str,
    manifest: ManifestLookup,
) -> Optional[ManifestEntry]:
    """
    Attempt to match a discovered file against the manifest.

    Matching is fuzzy: we check if the manifest document key is a substring
    of the filename stem (case-insensitive) or vice versa.
    """
    folder_norm = folder_relative.rstrip("/")
    stem_lower = stem.lower().replace("_", " ").replace("-", " ")

    for (folder_key, doc_key), entry in manifest.items():
        if folder_key != folder_norm:
            continue
        doc_key_norm = doc_key.replace("_", " ").replace("-", " ")
        # Either the manifest doc title is a substring of the filename or vice versa
        if doc_key_norm in stem_lower or stem_lower in doc_key_norm:
            return entry

    return None


# ---------------------------------------------------------------------------
# Discovery
# ---------------------------------------------------------------------------

def discover_documents(source_dir: Path, manifest: Optional[ManifestLookup] = None) -> List[DocumentInfo]:
    """
    Recursively find all supported documents under source_dir.

    Parameters
    ----------
    source_dir  : Root directory to search (the government_documents folder).
    manifest    : Pre-loaded manifest lookup. If None, loads it automatically.

    Returns
    -------
    Sorted list of DocumentInfo, ordered by relative path.
    """
    source_dir = source_dir.resolve()

    if not source_dir.exists():
        raise FileNotFoundError(f"Source directory not found: {source_dir}")

    if manifest is None:
        manifest = load_manifest(source_dir)

    docs: List[DocumentInfo] = []

    for file_path in sorted(source_dir.rglob("*")):
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        relative = file_path.relative_to(source_dir)
        # folder_relative: everything except the filename
        folder_relative = str(relative.parent)
        if folder_relative == ".":
            folder_relative = ""

        manifest_entry = _find_manifest_entry(folder_relative, file_path.stem, manifest)

        doc = DocumentInfo(
            path=file_path,
            relative_path=str(relative),
            filename=file_path.name,
            stem=file_path.stem,
            extension=file_path.suffix.lower(),
            folder_relative=folder_relative,
            manifest_entry=manifest_entry,
        )
        docs.append(doc)
        log.debug("Discovered: %s", relative)

    log.info("Discovered %d document(s) in %s", len(docs), source_dir)
    return docs
