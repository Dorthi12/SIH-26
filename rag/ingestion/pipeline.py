"""
rag/ingestion/pipeline.py — Orchestrator for the full ingestion pipeline.

This module wires together discovery → extraction → cleaning → chunking →
embedding → Pinecone upsert, with per-document progress output and a final
summary.

Entry point:  python -m rag.ingestion.pipeline [--source DIR] [--dry-run] [--force]
"""

from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path
from typing import List, Optional

# ---------------------------------------------------------------------------
# Logging setup — configure before importing sub-modules so their loggers
# pick up the level set here.
# ---------------------------------------------------------------------------

def _configure_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.WARNING
    logging.basicConfig(
        level=level,
        format="%(levelname)s | %(name)s | %(message)s",
        stream=sys.stderr,
    )
    # Always show our pipeline progress on stderr at WARNING+ regardless of verbose
    logging.getLogger("rag.ingestion.pipeline").setLevel(logging.INFO)


# ---------------------------------------------------------------------------
# Imports (after logging is configured)
# ---------------------------------------------------------------------------

import config
from ingestion.discovery import discover_documents, load_manifest
from ingestion.extractor import extract_pages
from ingestion.cleaner import clean_pages
from ingestion.chunker import chunk_document
from ingestion.embedder import get_embedder
from ingestion.metadata import infer_metadata
from ingestion.pinecone_store import PineconeStore
from ingestion.state_store import StateStore, compute_file_hash

log = logging.getLogger(__name__)

# ANSI colours — disabled on non-tty
_BOLD   = "\033[1m"   if sys.stdout.isatty() else ""
_GREEN  = "\033[32m"  if sys.stdout.isatty() else ""
_YELLOW = "\033[33m"  if sys.stdout.isatty() else ""
_RED    = "\033[31m"  if sys.stdout.isatty() else ""
_CYAN   = "\033[36m"  if sys.stdout.isatty() else ""
_RESET  = "\033[0m"   if sys.stdout.isatty() else ""


# ---------------------------------------------------------------------------
# Progress helpers
# ---------------------------------------------------------------------------

def _print(msg: str = "") -> None:
    print(msg, flush=True)


def _header(title: str) -> None:
    _print(f"\n{_BOLD}{_CYAN}{title}{_RESET}")


def _ok(msg: str) -> None:
    _print(f"  {_GREEN}✓{_RESET} {msg}")


def _warn(msg: str) -> None:
    _print(f"  {_YELLOW}⚠{_RESET}  {msg}", )


def _error(msg: str) -> None:
    _print(f"  {_RED}✗{_RESET} {msg}")


def _kv(label: str, value) -> None:
    _print(f"  {label:<30} {_BOLD}{value}{_RESET}")


# ---------------------------------------------------------------------------
# Per-document processing
# ---------------------------------------------------------------------------

def _process_document(
    doc_info,
    state_store: StateStore,
    store: Optional[PineconeStore],
    dry_run: bool,
    force: bool,
) -> dict:
    """
    Process a single document end-to-end.

    Returns a result dict with keys:
      status  : "ok" | "skipped" | "failed" | "empty"
      pages   : int
      chunks  : int
      vectors : int
      error   : str | None
    """
    result = {
        "status": "ok",
        "pages": 0,
        "chunks": 0,
        "vectors": 0,
        "error": None,
    }

    try:
        path = doc_info.path

        # ------------------------------------------------------------------
        # 1. Re-ingestion check
        # ------------------------------------------------------------------
        file_hash = compute_file_hash(path)

        if not force and not state_store.should_reprocess(path, file_hash):
            result["status"] = "skipped"
            return result

        # ------------------------------------------------------------------
        # 2. Extract
        # ------------------------------------------------------------------
        pages = extract_pages(path)
        if not pages:
            _warn(f"No pages extracted — skipping (possibly corrupt or encrypted).")
            result["status"] = "empty"
            return result

        total_chars = sum(p.char_count for p in pages)
        if total_chars == 0:
            _warn("No text extracted — PDF may be image-only (needs OCR). Skipping.")
            result["status"] = "empty"
            return result

        result["pages"] = len(pages)
        _kv("Pages:", len(pages))

        # ------------------------------------------------------------------
        # 3. Clean
        # ------------------------------------------------------------------
        cleaned_pages = clean_pages(pages)

        # ------------------------------------------------------------------
        # 4. Metadata inference
        # ------------------------------------------------------------------
        doc_metadata = infer_metadata(doc_info)

        # ------------------------------------------------------------------
        # 5. Chunk
        # ------------------------------------------------------------------
        chunks = chunk_document(cleaned_pages, doc_metadata, file_hash)
        result["chunks"] = len(chunks)
        _kv("Chunks:", len(chunks))

        if dry_run:
            _ok("Dry-run: skipping embedding and Pinecone upsert.")
            state_store.mark_processed(path, file_hash, len(chunks))
            return result

        # ------------------------------------------------------------------
        # 6. Embed
        # ------------------------------------------------------------------
        embedder = get_embedder()
        chunks = embedder.embed_chunks(chunks)
        _kv("Embeddings generated:", len(chunks))

        # ------------------------------------------------------------------
        # 7. Upsert
        # ------------------------------------------------------------------
        upserted = store.upsert_chunks(chunks)
        result["vectors"] = upserted
        _kv("Pinecone vectors upserted:", upserted)

        # ------------------------------------------------------------------
        # 8. Mark state
        # ------------------------------------------------------------------
        state_store.mark_processed(path, file_hash, len(chunks))

    except Exception as exc:  # noqa: BLE001
        result["status"] = "failed"
        result["error"] = str(exc)
        _error(f"FAILED: {exc}")
        log.exception("Document processing failed for %s", doc_info.path)

    return result


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_pipeline(
    source_dir: Path,
    dry_run: bool = False,
    force: bool = False,
) -> None:
    """
    Run the full ingestion pipeline over all documents in source_dir.
    """
    t_start = time.monotonic()

    # ------------------------------------------------------------------
    # Discovery
    # ------------------------------------------------------------------
    _header("Government Scheme RAG — Document Ingestion")

    manifest = load_manifest(source_dir)
    documents = discover_documents(source_dir, manifest)

    if not documents:
        _print(f"\n{_YELLOW}No supported documents found in:{_RESET} {source_dir}")
        _print(
            "\nMake sure PDFs are downloaded into the scheme sub-folders.\n"
            f"Run:  bash {source_dir}/download_sources.sh\n"
            "or place PDFs manually into the appropriate folders."
        )
        return

    _print(f"\nFound {_BOLD}{len(documents)}{_RESET} document(s) in {source_dir}\n")

    # ------------------------------------------------------------------
    # Setup stores
    # ------------------------------------------------------------------
    state_store = StateStore.from_config()
    pinecone_store: Optional[PineconeStore] = None

    if not dry_run:
        try:
            pinecone_store = PineconeStore.from_config()
        except EnvironmentError as exc:
            _error(str(exc))
            _print("\nRe-run with --dry-run to test discovery/chunking without Pinecone.")
            sys.exit(1)

    if dry_run:
        _print(f"{_YELLOW}Dry-run mode — embedding and Pinecone upsert are skipped.{_RESET}\n")

    # ------------------------------------------------------------------
    # Per-document loop
    # ------------------------------------------------------------------
    total_pages = 0
    total_chunks = 0
    total_vectors = 0
    skipped = 0
    failed = 0
    empty = 0

    for i, doc_info in enumerate(documents, start=1):
        _header(f"[{i}/{len(documents)}] {doc_info.filename}")
        _kv("Path:", doc_info.relative_path)

        result = _process_document(
            doc_info,
            state_store=state_store,
            store=pinecone_store,
            dry_run=dry_run,
            force=force,
        )

        if result["status"] == "skipped":
            _ok("Skipped — unchanged since last ingestion.")
            skipped += 1
        elif result["status"] == "empty":
            _warn("Empty document (no extractable text).")
            empty += 1
        elif result["status"] == "failed":
            failed += 1
        else:
            total_pages += result["pages"]
            total_chunks += result["chunks"]
            total_vectors += result["vectors"]
            _ok("Done.")

    state_store.close()

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    elapsed = time.monotonic() - t_start
    _header("Ingestion Complete")
    _print()
    _kv("Total documents processed:", len(documents) - skipped - failed - empty)
    _kv("Total pages processed:", total_pages)
    _kv("Total chunks created:", total_chunks)
    _kv("Total embeddings generated:", total_chunks if not dry_run else 0)
    _kv("Total vectors upserted:", total_vectors)
    _kv("Skipped (unchanged):", skipped)
    _kv("Empty (no text / OCR needed):", empty)
    _kv("Failed:", failed)
    _kv("Elapsed:", f"{elapsed:.1f}s")
    _print()

    if failed:
        _error(f"{failed} document(s) failed. Check logs above for details.")
        sys.exit(2)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m rag.ingestion.pipeline",
        description="Ingest government scheme PDFs into Pinecone via Sentence Transformers.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Discover and chunk without hitting Pinecone
  python -m rag.ingestion.pipeline --dry-run

  # Full ingestion from the default source directory
  python -m rag.ingestion.pipeline

  # Custom source directory
  python -m rag.ingestion.pipeline --source ./government_documents

  # Force re-ingest all documents (ignore hash check)
  python -m rag.ingestion.pipeline --force

  # Verbose logging (useful for debugging)
  python -m rag.ingestion.pipeline --verbose --dry-run
""",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=config.DEFAULT_SOURCE_DIR,
        help=(
            "Root directory containing government_documents/ subfolders. "
            f"Default: {config.DEFAULT_SOURCE_DIR}"
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Discover, extract, and chunk documents but skip embedding and Pinecone.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-ingest all documents even if their hash hasn't changed.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging output.",
    )
    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)
    _configure_logging(args.verbose)
    run_pipeline(
        source_dir=args.source.resolve(),
        dry_run=args.dry_run,
        force=args.force,
    )


if __name__ == "__main__":
    main()
