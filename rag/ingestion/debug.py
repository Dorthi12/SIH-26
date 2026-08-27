"""
rag/ingestion/debug.py — Smoke-test / debug command for the ingestion pipeline.

Verifies all 6 stages of the pipeline with clear PASS/FAIL output.

Usage:
    python -m rag.ingestion.debug [--source DIR] [--verbose]

Checks:
    1. PDF discovery  — finds at least one PDF in source_dir
    2. Text extraction — extracts non-empty text from the first PDF found
    3. Chunk generation — produces at least one chunk
    4. Embedding dimension — embedding has expected length
    5. Pinecone upsert — single vector upserted without error
    6. Pinecone query-back — the upserted vector is retrievable
"""

from __future__ import annotations

import argparse
import logging
import sys
import textwrap
from pathlib import Path
from typing import List, Optional

from rag import config

log = logging.getLogger(__name__)

# ANSI colours
_BOLD  = "\033[1m"   if sys.stdout.isatty() else ""
_GREEN = "\033[32m"  if sys.stdout.isatty() else ""
_RED   = "\033[31m"  if sys.stdout.isatty() else ""
_CYAN  = "\033[36m"  if sys.stdout.isatty() else ""
_RESET = "\033[0m"   if sys.stdout.isatty() else ""


def _p(msg: str = "") -> None:
    print(msg, flush=True)


def _pass(label: str, detail: str = "") -> None:
    suffix = f"  {detail}" if detail else ""
    _p(f"  {_GREEN}✅ PASS{_RESET}  {label}{suffix}")


def _fail(label: str, detail: str = "") -> None:
    suffix = f"\n         {detail}" if detail else ""
    _p(f"  {_RED}❌ FAIL{_RESET}  {label}{suffix}")


def _info(msg: str) -> None:
    _p(f"  {_CYAN}ℹ{_RESET}  {msg}")


def _section(title: str) -> None:
    _p(f"\n{_BOLD}── {title} ──{_RESET}")


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------

def check_discovery(source_dir: Path) -> Optional[Path]:
    """Check 1: PDF discovery."""
    _section("Check 1 — PDF Discovery")
    try:
        from rag.ingestion.discovery import discover_documents, load_manifest
        manifest = load_manifest(source_dir)
        docs = discover_documents(source_dir, manifest)
        if not docs:
            _fail(
                "No PDFs found",
                f"Place PDFs in {source_dir} sub-folders,\n"
                f"         then run:  bash {source_dir}/download_sources.sh",
            )
            return None
        _pass(f"Found {len(docs)} document(s)")
        for d in docs[:5]:
            _info(d.relative_path)
        if len(docs) > 5:
            _info(f"… and {len(docs) - 5} more")
        return docs[0].path
    except Exception as exc:
        _fail("Discovery raised an exception", str(exc))
        log.exception("Discovery error")
        return None


def check_extraction(pdf_path: Path) -> Optional[list]:
    """Check 2: Text extraction."""
    _section("Check 2 — Text Extraction")
    try:
        from rag.ingestion.extractor import extract_pages
        pages = extract_pages(pdf_path)
        if not pages:
            _fail("No pages extracted", "PDF may be corrupt or encrypted.")
            return None
        total_chars = sum(p.char_count for p in pages)
        if total_chars == 0:
            _fail(
                "Zero characters extracted",
                "PDF may be image-only (scanned). Run OCR (ocrmypdf) first.",
            )
            return None
        _pass(f"{len(pages)} page(s), {total_chars:,} characters")
        sample = pages[0].raw_text[:200].replace("\n", " ")
        _info(f"Page 1 sample: {sample!r}")
        return pages
    except ImportError as exc:
        _fail("pypdf not installed", "Run: pip install pypdf")
        return None
    except Exception as exc:
        _fail("Extraction raised an exception", str(exc))
        log.exception("Extraction error")
        return None


def check_chunking(pages: list, pdf_path: Path) -> Optional[list]:
    """Check 3: Chunk generation."""
    _section("Check 3 — Chunk Generation")
    try:
        from rag.ingestion.cleaner import clean_pages
        from rag.ingestion.chunker import chunk_document
        from rag.ingestion.metadata import infer_metadata
        from rag.ingestion.discovery import discover_documents, load_manifest, DocumentInfo
        from rag.ingestion.state_store import compute_file_hash

        # Build a minimal DocumentInfo for the PDF
        source_dir = pdf_path.parent.parent.parent  # go up to root
        manifest = load_manifest(source_dir)
        docs = discover_documents(source_dir, manifest)
        doc_info = next((d for d in docs if d.path == pdf_path), None)

        if doc_info is None:
            _fail("Could not re-discover PDF in document list")
            return None

        cleaned = clean_pages(pages)
        meta = infer_metadata(doc_info)
        file_hash = compute_file_hash(pdf_path)
        chunks = chunk_document(cleaned, meta, file_hash)

        if not chunks:
            _fail("Zero chunks generated", "Check that the PDF has extractable text.")
            return None

        _pass(f"{len(chunks)} chunk(s) generated")
        sample_text = textwrap.shorten(chunks[0].chunk_text, width=120, placeholder="…")
        _info(f"Chunk 0: section={chunks[0].section!r}, page={chunks[0].page_number}")
        _info(f"  Text:  {sample_text!r}")
        return chunks
    except Exception as exc:
        _fail("Chunking raised an exception", str(exc))
        log.exception("Chunking error")
        return None


def check_embedding(chunks: list) -> Optional[list]:
    """Check 4: Embedding dimension."""
    _section("Check 4 — Embedding Dimension")
    try:
        from rag.ingestion.embedder import get_embedder
        embedder = get_embedder()
        # Embed only the first chunk for speed
        sample = chunks[:1]
        embedded = embedder.embed_chunks(sample)
        emb = embedded[0].embedding
        if emb is None:
            _fail("Embedding is None")
            return None
        dim = len(emb)
        expected_min = 100
        if dim < expected_min:
            _fail(f"Embedding dimension {dim} seems too small (expected ≥ {expected_min})")
            return None
        _pass(f"Embedding dimension: {dim}")
        _info(f"Model: {config.EMBEDDING_MODEL}")
        _info(f"First 5 values: {[round(v, 4) for v in emb[:5]]}")
        return embedded
    except ImportError as exc:
        _fail("sentence-transformers not installed", "Run: pip install sentence-transformers")
        return None
    except Exception as exc:
        _fail("Embedding raised an exception", str(exc))
        log.exception("Embedding error")
        return None


def check_pinecone_upsert(chunks: list) -> bool:
    """Check 5: Pinecone upsert."""
    _section("Check 5 — Pinecone Upsert")
    try:
        from rag.ingestion.pinecone_store import PineconeStore
        config.require_pinecone_config()
        store = PineconeStore.from_config()
        upserted = store.upsert_chunks(chunks)
        if upserted != len(chunks):
            _fail(f"Expected {len(chunks)} vectors upserted, got {upserted}")
            return False
        _pass(f"Upserted {upserted} vector(s) to index '{config.PINECONE_INDEX_NAME}'")
        _info(f"Namespace: {config.PINECONE_NAMESPACE}")
        return True
    except EnvironmentError as exc:
        _fail("Pinecone credentials not configured", str(exc))
        return False
    except ImportError:
        _fail("pinecone not installed", "Run: pip install pinecone")
        return False
    except Exception as exc:
        _fail("Upsert raised an exception", str(exc))
        log.exception("Pinecone upsert error")
        return False


def check_pinecone_query(chunks: list) -> bool:
    """Check 6: Pinecone query-back."""
    _section("Check 6 — Pinecone Query-Back")
    try:
        from rag.ingestion.pinecone_store import PineconeStore
        from rag.ingestion.embedder import get_embedder

        config.require_pinecone_config()
        store = PineconeStore.from_config()

        query_text = chunks[0].chunk_text[:200]
        embedder = get_embedder()
        query_emb = embedder.embed_text(query_text)

        results = store.query_sample(query_emb, top_k=3)
        if not results:
            _fail("Query returned no results — vector may not be visible yet (Pinecone propagation delay)")
            _info("Wait a few seconds and retry.")
            return False

        top = results[0]
        _pass(f"Query returned {len(results)} result(s)")
        _info(f"Top match ID:    {top['id']}")
        _info(f"Score:           {top['score']:.4f}")
        _info(f"scheme_id:       {top['metadata'].get('scheme_id', '(none)')}")
        _info(f"document_title:  {top['metadata'].get('document_title', '(none)')[:60]}")
        chunk_preview = str(top["metadata"].get("chunk_text", ""))[:120]
        _info(f"chunk_text:      {chunk_preview!r}")
        return True
    except EnvironmentError as exc:
        _fail("Pinecone credentials not configured", str(exc))
        return False
    except Exception as exc:
        _fail("Query raised an exception", str(exc))
        log.exception("Pinecone query error")
        return False


# ---------------------------------------------------------------------------
# Main debug runner
# ---------------------------------------------------------------------------

def run_debug(source_dir: Path, skip_pinecone: bool = False) -> None:
    _p(f"\n{_BOLD}{_CYAN}AgriSense RAG — Pipeline Smoke Test{_RESET}")
    _p(f"Source: {source_dir}")
    _p(f"Model:  {config.EMBEDDING_MODEL}")

    passed = 0
    total = 6 if not skip_pinecone else 4

    # Check 1
    pdf_path = check_discovery(source_dir)
    if pdf_path:
        passed += 1

        # Check 2
        pages = check_extraction(pdf_path)
        if pages:
            passed += 1

            # Check 3
            chunks = check_chunking(pages, pdf_path)
            if chunks:
                passed += 1

                # Check 4
                embedded_chunks = check_embedding(chunks)
                if embedded_chunks:
                    passed += 1

                    if not skip_pinecone:
                        # Check 5
                        upsert_ok = check_pinecone_upsert(embedded_chunks)
                        if upsert_ok:
                            passed += 1

                            # Check 6
                            query_ok = check_pinecone_query(embedded_chunks)
                            if query_ok:
                                passed += 1

    # Summary
    _p()
    colour = _GREEN if passed == total else _RED
    _p(f"{colour}{_BOLD}Result: {passed}/{total} checks passed{_RESET}")
    _p()

    if passed < total:
        sys.exit(1)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m rag.ingestion.debug",
        description="Smoke-test all 6 stages of the ingestion pipeline.",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=config.DEFAULT_SOURCE_DIR,
        help="Root directory containing government_documents sub-folders.",
    )
    parser.add_argument(
        "--skip-pinecone",
        action="store_true",
        help="Only run checks 1-4 (skip Pinecone upsert and query-back).",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging.",
    )
    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)

    level = logging.DEBUG if args.verbose else logging.WARNING
    logging.basicConfig(level=level, format="%(levelname)s | %(name)s | %(message)s", stream=sys.stderr)

    run_debug(
        source_dir=args.source.resolve(),
        skip_pinecone=args.skip_pinecone,
    )


if __name__ == "__main__":
    main()
