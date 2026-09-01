"""
rag/eligibility/debug.py — CLI debugger for eligibility decisions.

Usage:
  python -m rag.eligibility.debug --scheme pm_kisan \
    --profile '{"state":"Uttar Pradesh","land_size":3,"land_unit":"acre","crop":"wheat"}'

  python -m rag.eligibility.debug \
    --query "Am I eligible for PM Kisan?" \
    --profile '{"state":"Uttar Pradesh","land_size":3,"land_unit":"acre"}'

Prints a full audit trail:
  - Farmer profile
  - Retrieved documents
  - Extracted rules (with confidence)
  - Condition-by-condition evaluation
  - Matched / failed / missing
  - Final status + explanation
  - Evidence sources
  - Document version conflicts
"""

from __future__ import annotations

import argparse
import json
import sys
import os

# Ensure the project root is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from eligibility.models import EligibilityFarmerProfile, EligibilityStatus
from eligibility.service import check_eligibility, recommend_schemes


# ---------------------------------------------------------------------------
# ANSI color helpers
# ---------------------------------------------------------------------------

GREEN = "\033[32m"
RED   = "\033[31m"
YELLOW = "\033[33m"
CYAN  = "\033[36m"
BOLD  = "\033[1m"
RESET = "\033[0m"


def _status_color(status: str) -> str:
    colors = {
        "ELIGIBLE": GREEN,
        "INELIGIBLE": RED,
        "INSUFFICIENT_INFORMATION": YELLOW,
    }
    c = colors.get(status, RESET)
    return f"{c}{BOLD}{status}{RESET}"


def _section(title: str) -> None:
    print(f"\n{BOLD}{CYAN}{'━' * 60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'━' * 60}{RESET}")


def _sub(title: str) -> None:
    print(f"\n{BOLD}  ▶ {title}{RESET}")


def run_debug(
    profile_dict: dict,
    scheme_id: str = None,
    query: str = None,
    mode: str = "eligibility",
) -> None:
    """Run the debug pipeline and print an auditable report."""
    profile = EligibilityFarmerProfile.from_dict(profile_dict)

    _section("FARMER PROFILE")
    for k, v in profile.to_dict().items():
        print(f"  {k:30s}: {v}")
    if profile.land_size_acres:
        print(f"  {'land_size_acres (computed)':30s}: {profile.land_size_acres:.3f}")

    scheme_ids = {scheme_id} if scheme_id else None
    eff_query = query or (f"Am I eligible for {scheme_id}?" if scheme_id else "Which government schemes can I get?")

    if mode == "recommend":
        _run_recommend_debug(profile, eff_query)
    else:
        _run_eligibility_debug(profile, eff_query, scheme_ids)


def _run_eligibility_debug(profile, query, scheme_ids):
    _section(f"ELIGIBILITY CHECK — {query}")
    print(f"  Running retrieval + rule extraction + evaluation...")

    response = check_eligibility(query, profile, scheme_ids=scheme_ids)

    print(f"\n  Language detected : {response.language}")
    print(f"  Total latency     : {response.latency_ms}ms")
    print(f"  Schemes evaluated : {len(response.results)}")

    for result in response.results:
        _section(f"SCHEME: {result.scheme_name} ({result.scheme_id})")

        print(f"  Government level  : {result.government_level.upper()}")
        print(f"  Status            : {_status_color(result.status)}")
        print(f"  Rules used        : {result.rules_used}")

        if result.conflict_warning:
            print(f"\n  {YELLOW}{BOLD}⚠ CONFLICT WARNING:{RESET} {result.conflict_warning}")

        if result.matched_conditions:
            _sub(f"MATCHED CONDITIONS ({len(result.matched_conditions)})")
            for c in result.matched_conditions:
                ev = c.get('evidence') if isinstance(c, dict) else getattr(c, 'evidence', None)
                cd = c if isinstance(c, dict) else c.to_dict()
                print(f"    {GREEN}✓{RESET} {cd['condition']}")
                print(f"      Farmer value: {cd['farmer_value']}  |  {cd['reason']}")
                if ev and ev.get('page_number'):
                    print(f"      Evidence: {ev.get('document_title', '')} p.{ev.get('page_number', '')}")

        if result.failed_conditions:
            _sub(f"FAILED CONDITIONS ({len(result.failed_conditions)})")
            for c in result.failed_conditions:
                cd = c if isinstance(c, dict) else c.to_dict()
                ev = cd.get('evidence')
                print(f"    {RED}✗{RESET} {cd['condition']}")
                print(f"      Farmer value: {cd['farmer_value']}  |  {cd['reason']}")
                if ev and ev.get('page_number'):
                    print(f"      Evidence: {ev.get('document_title', '')} p.{ev.get('page_number', '')}")

        if result.missing_information:
            _sub(f"MISSING INFORMATION ({len(result.missing_information)})")
            for m in result.missing_information:
                print(f"    {YELLOW}?{RESET} {m}")

        if result.evidence:
            _sub("EVIDENCE SOURCES")
            seen = set()
            for ev in result.evidence:
                ed = ev if isinstance(ev, dict) else ev.to_dict()
                key = (ed.get('document_title', ''), ed.get('page_number', ''))
                if key in seen:
                    continue
                seen.add(key)
                print(f"    📄 {ed.get('document_title', 'Unknown')} — Page {ed.get('page_number', '?')}")
                if ed.get('source_url'):
                    print(f"       {ed['source_url']}")
                if ed.get('raw_text'):
                    print(f"       Excerpt: {ed['raw_text'][:120]}...")

        _sub("EXPLANATION")
        print(f"  {result.explanation}")

    if response.follow_up_questions:
        _section("FOLLOW-UP QUESTIONS")
        for i, q in enumerate(response.follow_up_questions, 1):
            print(f"  {i}. {q}")


def _run_recommend_debug(profile, query):
    _section(f"SCHEME RECOMMENDATION — {query}")
    print("  Running retrieval + rule extraction + ranking...")

    response = recommend_schemes(profile, query=query)

    print(f"\n  Total latency   : {response.latency_ms}ms")
    print(f"  Recommendations : {len(response.recommendations)}")
    print(f"  Central schemes : {len(response.central_schemes)}")
    print(f"  State schemes   : {len(response.state_schemes)}")

    _section("RANKED RECOMMENDATIONS")
    for i, rec in enumerate(response.recommendations, 1):
        status_str = _status_color(rec.eligibility_status)
        print(f"\n  [{i}] {BOLD}{rec.scheme_name}{RESET}  ({rec.government_level.upper()})")
        print(f"       Score     : {rec.relevance_score:.4f}")
        print(f"       Status    : {status_str}")
        print(f"       Breakdown : {rec.score_breakdown}")
        print(f"       Reasons   :")
        for r in rec.reasons:
            print(f"         • {r}")
        if rec.sources:
            src = rec.sources[0]
            print(f"       Source    : {src.get('document_title', '')} p.{src.get('page_number', '')}")

    if response.follow_up_questions:
        _section("FOLLOW-UP QUESTIONS")
        for i, q in enumerate(response.follow_up_questions, 1):
            print(f"  {i}. {q}")


def main():
    parser = argparse.ArgumentParser(
        description="AgriSense Eligibility Debugger",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m rag.eligibility.debug --scheme pm_kisan --profile '{"state":"Uttar Pradesh","land_size":3,"land_unit":"acre","crop":"wheat"}'
  python -m rag.eligibility.debug --query "Am I eligible for PM Kisan?" --profile '{"state":"Uttar Pradesh","land_size":3}'
  python -m rag.eligibility.debug --recommend --profile '{"state":"Uttar Pradesh","crop":"wheat","land_size":3,"land_unit":"acre"}'
        """,
    )
    parser.add_argument("--scheme", help="Scheme ID to check (e.g. pm_kisan)")
    parser.add_argument("--query", help="Natural language eligibility query")
    parser.add_argument("--profile", required=True, help="JSON farmer profile string")
    parser.add_argument("--recommend", action="store_true", help="Run scheme recommendation instead")

    args = parser.parse_args()

    try:
        profile_dict = json.loads(args.profile)
    except json.JSONDecodeError as exc:
        print(f"Error: invalid --profile JSON: {exc}", file=sys.stderr)
        sys.exit(1)

    mode = "recommend" if args.recommend else "eligibility"
    run_debug(profile_dict, scheme_id=args.scheme, query=args.query, mode=mode)


if __name__ == "__main__":
    main()
