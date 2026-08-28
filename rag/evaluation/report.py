"""
rag/evaluation/report.py — Report generation for the evaluation framework.

Supports:
  - Human-readable terminal report
  - Machine-readable JSON report (for CI)
  - Per-question debug output for failed questions

Public API
----------
print_report(report, verbose=False)
save_json_report(report, output_dir)   → str (path of saved file)
print_per_question_debug(report)
ci_json(report)                        → dict
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from rag.evaluation.models import EvalReport, MetricSet


# ---------------------------------------------------------------------------
# ANSI colors
# ---------------------------------------------------------------------------

_GREEN = "\033[32m"
_RED = "\033[31m"
_YELLOW = "\033[33m"
_CYAN = "\033[36m"
_BOLD = "\033[1m"
_DIM = "\033[2m"
_RESET = "\033[0m"


def _bar(value: float, width: int = 20) -> str:
    """ASCII progress bar for a 0–1 value."""
    filled = int(value * width)
    bar = "█" * filled + "░" * (width - filled)
    return f"[{bar}] {value:.2%}"


def _fmt(value, threshold=None) -> str:
    """Format a metric value with colour coding against threshold."""
    if value is None:
        return f"{_DIM}N/A{_RESET}"
    formatted = f"{value:.4f}"
    if threshold is not None:
        if value >= threshold:
            return f"{_GREEN}{formatted}{_RESET}"
        else:
            return f"{_RED}{formatted}{_RESET}"
    return formatted


def print_report(report: EvalReport, verbose: bool = False) -> None:
    """Print a human-readable evaluation report to stdout."""
    m = report.metrics
    reg = report.regression

    border = "═" * 60
    print(f"\n{_BOLD}{_CYAN}{border}{_RESET}")
    print(f"{_BOLD}{_CYAN}  AgriSense RAG Evaluation Report{_RESET}")
    print(f"{_BOLD}{_CYAN}{border}{_RESET}")
    print(f"\n  Questions evaluated : {report.questions_evaluated}")
    print(f"  Dataset            : {report.dataset_path}")
    print(f"  LLM judge          : {'✓ enabled' if report.llm_evaluation_enabled else '✗ disabled (retrieval-only)'}")
    print(f"  Total latency      : {report.total_latency_ms:,}ms")

    if not m:
        print("\n  (No metrics computed)")
        return

    # ── Retrieval Metrics ──────────────────────────────────────────────
    if report.retrieval_results:
        print(f"\n  {_BOLD}── Retrieval Metrics ──────────────────────────────{_RESET}")
        print(f"  Recall@1         : {_fmt(m.recall_at_1,  threshold=None)}")
        print(f"  Recall@3         : {_fmt(m.recall_at_3,  threshold=None)}")
        print(f"  Recall@5         : {_fmt(m.recall_at_5,  threshold=0.75)}")
        print(f"  Recall@10        : {_fmt(m.recall_at_10, threshold=None)}")
        print()
        print(f"  Precision@5      : {_fmt(m.precision_at_5,  threshold=None)}")
        print(f"  Precision@10     : {_fmt(m.precision_at_10, threshold=None)}")
        print()
        print(f"  MRR              : {_fmt(m.mrr)}")
        print(f"  Hit Rate@5       : {_fmt(m.hit_rate_at_5, threshold=0.80)}")
        print(f"  Scheme Hit Rate  : {_fmt(m.scheme_hit_rate)}")

        # ── Per Language ──────────────────────────────────────────────
        if m.by_language:
            print(f"\n  {_BOLD}── By Language ─────────────────────────────────────{_RESET}")
            for lang, lm in m.by_language.items():
                flag = {"en": "🇬🇧", "hi": "🇮🇳", "hinglish": "🔤"}.get(lang, "  ")
                r5 = lm.get("recall_at_5", 0.0)
                hr = lm.get("hit_rate_at_5", 0.0)
                sch = lm.get("scheme_hit_rate", 0.0)
                n = lm.get("question_count", 0)
                print(f"  {flag} {lang.upper():10s} ({n:2d} q) │ Recall@5={r5:.3f}  Hit@5={hr:.3f}  Scheme={sch:.3f}")

        # ── Per Difficulty ────────────────────────────────────────────
        if m.by_difficulty:
            print(f"\n  {_BOLD}── By Difficulty ────────────────────────────────────{_RESET}")
            for diff, dm in m.by_difficulty.items():
                r5 = dm.get("recall_at_5", 0.0)
                hr = dm.get("hit_rate_at_5", 0.0)
                n = dm.get("question_count", 0)
                print(f"  {diff.capitalize():8s} ({n:2d} q) │ Recall@5={r5:.3f}  Hit@5={hr:.3f}")

    # ── Generation Metrics ─────────────────────────────────────────────
    if report.generation_results:
        print(f"\n  {_BOLD}── Generation Metrics ──────────────────────────────{_RESET}")
        print(f"  Faithfulness     : {_fmt(m.faithfulness,     threshold=0.85 if report.llm_evaluation_enabled else None)}")
        print(f"  Answer Relevance : {_fmt(m.answer_relevance, threshold=None)}")
        print(f"  Citation Validity: {_fmt(m.citation_validity, threshold=0.90)}")

        if m.hallucination_trap_accuracy > 0:
            traps = [g for g in report.generation_results if g.is_hallucination_trap]
            correct = sum(1 for g in traps if g.correctly_expressed_uncertainty)
            col = _GREEN if m.hallucination_trap_accuracy >= 0.9 else _YELLOW
            print(f"  Hallucination    : {col}{correct}/{len(traps)} traps correctly rejected{_RESET}  "
                  f"({m.hallucination_trap_accuracy:.0%})")

    # ── Conversation Metrics ───────────────────────────────────────────
    if report.conversation_results:
        print(f"\n  {_BOLD}── Conversation Metrics ─────────────────────────────{_RESET}")
        passed = sum(1 for c in report.conversation_results if c.passed)
        total_conv = len(report.conversation_results)
        acc = sum(c.profile_accuracy for c in report.conversation_results) / total_conv
        print(f"  Scenarios        : {passed}/{total_conv} passed")
        print(f"  Profile Accuracy : {_fmt(acc)}")

    # ── Regression Check ───────────────────────────────────────────────
    if reg:
        print(f"\n  {_BOLD}── Regression Check ─────────────────────────────────{_RESET}")
        if reg.passed:
            print(f"  {_GREEN}✓ All thresholds passed{_RESET}")
        else:
            print(f"  {_RED}✗ {len(reg.failures)} threshold(s) failed:{_RESET}")
            for f in reg.failures:
                print(f"    {_RED}• {f}{_RESET}")

    # ── Failed Questions ───────────────────────────────────────────────
    failures = [r for r in report.retrieval_results if not r.passed]
    gen_failures = [g for g in report.generation_results if not g.passed]

    if (failures or gen_failures) and verbose:
        print_per_question_debug(report)

    elif failures or gen_failures:
        total_failed = len(failures) + len(gen_failures)
        print(f"\n  {_YELLOW}ℹ {total_failed} question(s) failed. Use --verbose to see details.{_RESET}")

    print(f"\n{_BOLD}{_CYAN}{border}{_RESET}\n")


def print_per_question_debug(report: EvalReport) -> None:
    """Print detailed debug information for each failed question."""
    ret_failures = {r.question_id: r for r in report.retrieval_results if not r.passed}
    gen_failures = {g.question_id: g for g in report.generation_results if not g.passed}

    all_ids = sorted(set(list(ret_failures.keys()) + list(gen_failures.keys())))
    if not all_ids:
        print(f"\n  {_GREEN}✓ No failures to debug{_RESET}")
        return

    print(f"\n{_BOLD}{'─' * 60}{_RESET}")
    print(f"{_BOLD}  Per-Question Debug ({len(all_ids)} failures){_RESET}")
    print(f"{'─' * 60}{_RESET}")

    for qid in all_ids:
        r = ret_failures.get(qid)
        g = gen_failures.get(qid)

        print(f"\n  {_RED}FAILED: {qid}{_RESET}")

        if r:
            print(f"  Query      : {r.query[:80]}")
            print(f"  Language   : {r.language} / {r.difficulty}")
            print(f"  Expected   : {r.expected_schemes}")
            print(f"  Retrieved  : {r.retrieved_scheme_ids[:5]}")
            print(f"  Recall@5   : {r.recall_at_k.get(5, 0.0):.3f}")
            print(f"  Hit@5      : {r.hit_rate_at_5}")
            print(f"  Reason     : {r.failure_reason}")

        if g:
            print(f"  Gen Reason : {g.failure_reason}")
            if g.is_hallucination_trap:
                status = _GREEN + "✓ uncertainty expressed" if g.correctly_expressed_uncertainty else _RED + "✗ hallucinated"
                print(f"  Trap check : {status}{_RESET}")
            print(f"  Answer     : {g.answer[:150]}...")
            if g.citation_validations:
                invalid = [v for v in g.citation_validations if not v.is_valid]
                if invalid:
                    print(f"  Bad cites  : {[v.document_title for v in invalid]}")


def save_json_report(report: EvalReport, output_dir: str) -> str:
    """
    Save the full evaluation report as a JSON file.
    Returns the path of the saved file.
    """
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    fname = os.path.join(output_dir, f"eval_{timestamp}.json")

    with open(fname, "w", encoding="utf-8") as f:
        json.dump(report.to_dict(), f, indent=2, ensure_ascii=False)

    print(f"\n  Report saved: {fname}")
    return fname


def ci_json(report: EvalReport) -> Dict[str, Any]:
    """
    Generate a machine-readable CI summary dict.

    Structure:
    {
      "passed": bool,
      "metrics": {...},
      "failures": [...]
    }
    """
    m = report.metrics
    reg = report.regression

    metrics_out: Dict[str, Any] = {}
    if m:
        metrics_out = {
            "recall_at_1": round(m.recall_at_1, 4),
            "recall_at_3": round(m.recall_at_3, 4),
            "recall_at_5": round(m.recall_at_5, 4),
            "recall_at_10": round(m.recall_at_10, 4),
            "precision_at_5": round(m.precision_at_5, 4),
            "precision_at_10": round(m.precision_at_10, 4),
            "mrr": round(m.mrr, 4),
            "hit_rate_at_5": round(m.hit_rate_at_5, 4),
            "scheme_hit_rate": round(m.scheme_hit_rate, 4),
            "citation_validity": round(m.citation_validity, 4),
        }
        if m.faithfulness is not None:
            metrics_out["faithfulness"] = round(m.faithfulness, 4)
        if m.answer_relevance is not None:
            metrics_out["answer_relevance"] = round(m.answer_relevance, 4)

    return {
        "passed": reg.passed if reg else True,
        "metrics": metrics_out,
        "failures": reg.failures if reg else [],
        "questions_evaluated": report.questions_evaluated,
    }
