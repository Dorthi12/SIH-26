"""
rag/retrieval/debug.py — Debug CLI for the retrieval pipeline.

Usage:
    python -m rag.retrieval.debug --query "PM Kisan ke liye kaun eligible hai?"
    python -m rag.retrieval.debug --query "..." --top-k 10 --profile-state "Uttar Pradesh"
    python -m rag.retrieval.debug --query "..." --verbose
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from typing import Optional

import config

# ANSI colours (tty-aware)
_B  = "\033[1m"    if sys.stdout.isatty() else ""
_C  = "\033[36m"   if sys.stdout.isatty() else ""
_G  = "\033[32m"   if sys.stdout.isatty() else ""
_Y  = "\033[33m"   if sys.stdout.isatty() else ""
_DIM= "\033[2m"    if sys.stdout.isatty() else ""
_R  = "\033[0m"    if sys.stdout.isatty() else ""


def _p(msg: str = "") -> None:
    print(msg, flush=True)


def _section(title: str) -> None:
    _p(f"\n{_B}{_C}── {title} ──{_R}")


def _kv(label: str, value: object) -> None:
    _p(f"  {label:<32} {_B}{value}{_R}")


def run_debug(
    query: str,
    top_k: int,
    profile_state: Optional[str] = None,
    profile_crop: Optional[str] = None,
    verbose: bool = False,
) -> None:
    from retrieval.models import FarmerProfile
    from retrieval.query_understanding import understand, detect_language, detect_intent
    from retrieval.filters import build_filter
    from retrieval.retriever import get_retriever

    _p(f"\n{_B}{_C}AgriSense RAG — Retrieval Debug{_R}")
    _p(f"Query: {_B}{query}{_R}")
    _p(f"Top-K: {top_k}  |  Model: {config.EMBEDDING_MODEL}")

    # Build optional profile
    profile = None
    if profile_state or profile_crop:
        profile = FarmerProfile(state=profile_state, crop=profile_crop)
        _p(f"Profile: {profile.to_dict()}")

    # ── Query Understanding ──
    _section("Query Understanding")
    qu = understand(query, profile)
    _kv("Language detected:", qu.language)
    _kv("Intent detected:", qu.intent)
    _kv("State extracted:", qu.state or "(none)")
    _kv("State slug:", qu.state_slug or "(none)")
    _kv("Crop extracted:", qu.crop or "(none)")
    _kv("Scheme extracted:", f"{qu.scheme_name} ({qu.scheme_id})" if qu.scheme_id else "(none)")
    _kv("Farmer type:", qu.farmer_type or "(none)")
    _kv("Land size:", f"{qu.land_size} {qu.land_unit}" if qu.land_size else "(none)")
    _kv("Cause:", qu.cause or "(none)")

    # ── Metadata Filter ──
    _section("Metadata Filter")
    filt = build_filter(qu)
    if filt:
        _p(f"  {json.dumps(filt, indent=4)}")
    else:
        _p(f"  {_Y}No filter — pure semantic search{_R}")

    # ── Embedding ──
    _section("Query Embedding")
    from retrieval.query_embedder import embed_query
    embedding = embed_query(qu.raw_query)
    _kv("Dimension:", len(embedding))
    _kv("First 5 values:", [round(v, 4) for v in embedding[:5]])

    # ── Retrieval ──
    _section("Pinecone Retrieval + Ranking")
    retriever = get_retriever()
    result = retriever.retrieve(query, farmer_profile=profile, top_k=top_k)

    _kv("Candidates from Pinecone:", result.candidate_count)
    _kv("After ranking + dedup:", result.final_count)

    if not result.results:
        _p(f"\n  {_Y}⚠  No results returned.{_R}")
        _p("  Check that documents are indexed and Pinecone is reachable.")
        return

    # ── Results ──
    _section(f"Top {result.final_count} Results")
    for i, r in enumerate(result.results, start=1):
        _p(f"\n  {_B}#{i}{_R}  score={_G}{r.final_score:.4f}{_R}  (semantic={r.semantic_score:.4f})")
        _kv("  scheme:", f"{r.scheme_name} [{r.scheme_id}]")
        _kv("  gov_level:", r.government_level)
        _kv("  state:", r.state or "(central/all)")
        _kv("  document:", r.document_title)
        _kv("  section:", r.section or "(none)")
        _kv("  page:", r.page_number)
        _kv("  official:", "✓" if r.official_source else "✗")
        _kv("  source_url:", r.source_url[:70] + "…" if len(r.source_url) > 70 else r.source_url)
        if verbose:
            _kv("  score_breakdown:", r.score_breakdown)
        # Text preview
        preview = r.chunk_text[:200].replace("\n", " ")
        if len(r.chunk_text) > 200:
            preview += "…"
        _p(f"  {_DIM}Text: {preview!r}{_R}")

    _p()


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m rag.retrieval.debug",
        description="Debug the RAG retrieval pipeline for a given query.",
    )
    parser.add_argument(
        "--query", "-q",
        required=True,
        help="The farmer query to debug.",
    )
    parser.add_argument(
        "--top-k", "-k",
        type=int,
        default=config.RAG_FINAL_TOP_K,
        help=f"Number of results to return (default: {config.RAG_FINAL_TOP_K}).",
    )
    parser.add_argument(
        "--profile-state",
        default=None,
        help="Override farmer state (e.g. 'Uttar Pradesh').",
    )
    parser.add_argument(
        "--profile-crop",
        default=None,
        help="Override farmer crop (e.g. 'wheat').",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed score breakdowns.",
    )
    return parser


def main(argv=None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)

    level = logging.DEBUG if args.verbose else logging.WARNING
    logging.basicConfig(level=level, format="%(levelname)s | %(name)s | %(message)s", stream=sys.stderr)

    run_debug(
        query=args.query,
        top_k=args.top_k,
        profile_state=args.profile_state,
        profile_crop=args.profile_crop,
        verbose=args.verbose,
    )


if __name__ == "__main__":
    main()
