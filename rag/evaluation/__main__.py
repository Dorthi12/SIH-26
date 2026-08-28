"""
rag/evaluation/__main__.py — CLI entry point for the evaluation framework.

Usage:
  python -m rag.evaluation [OPTIONS]

Options:
  --dataset PATH          Golden dataset JSON (default: built-in golden_questions.json)
  --retrieval-only        Only run retrieval evaluation (no LLM generation calls)
  --generation-only       Only run generation evaluation
  --conversation-only     Only run conversation evaluation
  --language LANG         Filter by language: en | hi | hinglish
  --limit N               Evaluate only first N questions
  --verbose               Print per-question debug for failures
  --ci                    Output machine-readable JSON, exit 1 on threshold failure
  --output-dir PATH       Directory for JSON reports (default: rag/evaluation/results/)
  --enable-llm-eval       Enable LLM-as-judge for faithfulness/relevance scoring
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from rag.evaluation.dataset import DEFAULT_DATASET_PATH, filter_dataset, load_dataset
from rag.evaluation.evaluator import RAGEvaluator
from rag.evaluation.report import ci_json, print_report, print_per_question_debug, save_json_report

logging.basicConfig(
    level=logging.WARNING,   # suppress INFO by default; verbose mode can increase
    format="%(levelname)s | %(name)s | %(message)s",
)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AgriSense RAG Evaluation Framework",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m rag.evaluation --retrieval-only --limit 10 --verbose
  python -m rag.evaluation --language hi --verbose
  python -m rag.evaluation --ci
  python -m rag.evaluation --generation-only --enable-llm-eval
        """,
    )
    parser.add_argument("--dataset", default=DEFAULT_DATASET_PATH, help="Path to golden_questions.json")
    parser.add_argument("--retrieval-only", action="store_true", help="Only run retrieval evaluation")
    parser.add_argument("--generation-only", action="store_true", help="Only run generation evaluation")
    parser.add_argument("--conversation-only", action="store_true", help="Only run conversation evaluation")
    parser.add_argument("--language", choices=["en", "hi", "hinglish"], help="Filter by language")
    parser.add_argument("--limit", type=int, default=None, help="Max questions to evaluate")
    parser.add_argument("--verbose", action="store_true", help="Print per-question debug for failures")
    parser.add_argument("--ci", action="store_true", help="CI mode: JSON output + exit 1 on failure")
    parser.add_argument(
        "--output-dir",
        default=os.path.join(os.path.dirname(__file__), "results"),
        help="Directory for saved JSON reports",
    )
    parser.add_argument("--enable-llm-eval", action="store_true", help="Enable LLM-as-judge evaluation")

    args = parser.parse_args()

    # Apply LLM eval override
    if args.enable_llm_eval:
        import rag.config as cfg
        cfg.RAG_ENABLE_LLM_EVALUATION = True

    # Increase log level in verbose mode
    if args.verbose:
        logging.getLogger("rag").setLevel(logging.INFO)

    # ── Load dataset ──────────────────────────────────────────────────
    try:
        all_questions = load_dataset(args.dataset)
    except (FileNotFoundError, ValueError) as exc:
        print(f"\n❌ Dataset error: {exc}", file=sys.stderr)
        sys.exit(2)

    questions = filter_dataset(
        all_questions,
        language=args.language,
        limit=args.limit,
        conversation_only=args.conversation_only,
    )

    if not questions:
        print("No questions match the given filters.", file=sys.stderr)
        sys.exit(2)

    if not args.ci:
        print(f"\n  ▶ Evaluating {len(questions)} question(s) from: {args.dataset}")
        if args.retrieval_only:
            print("  Mode: retrieval-only")
        elif args.generation_only:
            print("  Mode: generation-only")
        elif args.conversation_only:
            print("  Mode: conversation-only")
        else:
            print("  Mode: full (retrieval + generation)")
        print()

    # ── Run evaluation ────────────────────────────────────────────────
    evaluator = RAGEvaluator()

    try:
        report = evaluator.evaluate(
            questions=questions,
            dataset_path=args.dataset,
            retrieval_only=args.retrieval_only,
            generation_only=args.generation_only,
            conversation_only=args.conversation_only,
            verbose=args.verbose and not args.ci,
        )
    except Exception as exc:
        print(f"\n❌ Evaluation failed: {exc}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(2)

    # ── Output ────────────────────────────────────────────────────────
    if args.ci:
        # Machine-readable JSON to stdout
        ci_result = ci_json(report)
        print(json.dumps(ci_result, indent=2))

        # Also save full report
        try:
            save_json_report(report, args.output_dir)
        except Exception:
            pass  # don't fail CI because of report saving

        sys.exit(0 if ci_result["passed"] else 1)

    else:
        # Human-readable report
        print_report(report, verbose=args.verbose)

        if args.verbose and (report.retrieval_results or report.generation_results):
            print_per_question_debug(report)

        # Save JSON report
        try:
            save_json_report(report, args.output_dir)
        except Exception as exc:
            print(f"  Warning: Could not save JSON report: {exc}")

        # Exit 1 if regression thresholds failed
        if report.regression and not report.regression.passed:
            sys.exit(1)


if __name__ == "__main__":
    main()
