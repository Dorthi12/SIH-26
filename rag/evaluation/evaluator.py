"""
rag/evaluation/evaluator.py — Main evaluation orchestrator.

Runs the full evaluation pipeline:
  1. Load dataset questions
  2. For each question: run retrieval and/or generation
  3. Compute metrics
  4. Check regression thresholds
  5. Return EvalReport

Public API
----------
RAGEvaluator.evaluate(questions, ...)  → EvalReport
check_thresholds(metrics)             → RegressionCheckResult
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any, Dict, List, Optional

import config
from evaluation.citation_metrics import (
    citation_precision,
    citation_validity,
    validate_citations,
)
from evaluation.generation_metrics import (
    evaluate_answer_relevance,
    evaluate_faithfulness,
    is_uncertainty_expressed,
)
from evaluation.models import (
    ConversationEvalResult,
    EvalQuestion,
    EvalReport,
    GenerationEvalResult,
    MetricSet,
    RegressionCheckResult,
    RetrievalEvalResult,
)
from evaluation.retrieval_metrics import (
    aggregate_retrieval_metrics,
    compute_retrieval_result,
    extract_scheme_ids_from_candidates,
)
from retrieval.models import FarmerProfile
from retrieval.retriever import get_retriever

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Regression threshold checking
# ---------------------------------------------------------------------------

def check_thresholds(
    metrics: MetricSet,
    has_generation: bool = True,
) -> RegressionCheckResult:
    """
    Compare actual metrics against configured minimum thresholds.
    Returns a RegressionCheckResult with pass/fail and list of failures.

    has_generation: if False (retrieval-only mode), citation thresholds are skipped.
    """
    thresholds: Dict[str, float] = {}
    actual: Dict[str, float] = {}

    # Retrieval thresholds — always applied when retrieval data is present
    if metrics.total_questions > 0:
        thresholds["recall_at_5"] = config.RAG_MIN_RECALL_AT_5
        thresholds["hit_rate_at_5"] = config.RAG_MIN_HIT_RATE
        actual["recall_at_5"] = metrics.recall_at_5
        actual["hit_rate_at_5"] = metrics.hit_rate_at_5

    # Citation threshold — only apply when generation was run
    if has_generation:
        thresholds["citation_validity"] = config.RAG_MIN_CITATION_VALIDITY
        actual["citation_validity"] = metrics.citation_validity

    # Faithfulness — only when LLM eval is enabled and ran
    if config.RAG_ENABLE_LLM_EVALUATION and metrics.faithfulness is not None:
        thresholds["faithfulness"] = config.RAG_MIN_FAITHFULNESS
        actual["faithfulness"] = metrics.faithfulness

    failures: List[str] = []
    for key, min_val in thresholds.items():
        if key not in actual:
            continue
        if actual[key] < min_val:
            failures.append(
                f"{key}: {actual[key]:.4f} < threshold {min_val:.4f}"
            )

    return RegressionCheckResult(
        passed=len(failures) == 0,
        failures=failures,
        thresholds=thresholds,
        actual=actual,
    )


# ---------------------------------------------------------------------------
# Context builder for LLM evaluation
# ---------------------------------------------------------------------------

def _build_eval_context(candidates: List[Any], max_chars: int = 3000) -> str:
    """Build a compact context string from retrieval candidates for LLM judge."""
    parts = []
    total = 0
    for c in candidates:
        text = getattr(c, "chunk_text", None) or (c.get("chunk_text", "") if isinstance(c, dict) else "")
        title = getattr(c, "document_title", "") or (c.get("document_title", "") if isinstance(c, dict) else "")
        page = getattr(c, "page_number", None) or (c.get("page_number") if isinstance(c, dict) else None)
        snippet = f"[{title}, p.{page}]: {text}"
        if total + len(snippet) > max_chars:
            break
        parts.append(snippet)
        total += len(snippet)
    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Main evaluator
# ---------------------------------------------------------------------------

class RAGEvaluator:
    """
    Evaluates the AgriSense RAG system against a golden dataset.

    Reuses the existing retriever, generator, and eligibility service
    without modification.
    """

    def __init__(self) -> None:
        self._retriever = None  # lazy-loaded

    def _get_retriever(self):
        if self._retriever is None:
            self._retriever = get_retriever()
        return self._retriever

    # ------------------------------------------------------------------
    # Retrieval evaluation
    # ------------------------------------------------------------------

    def evaluate_retrieval(
        self, question: EvalQuestion, top_k: int = 10
    ) -> RetrievalEvalResult:
        """Run retrieval for one question and compute retrieval metrics."""
        profile = FarmerProfile.from_dict(question.farmer_profile)
        t_start = time.perf_counter()

        try:
            retriever = self._get_retriever()
            result = retriever.retrieve(query=question.query, farmer_profile=profile)
            candidates = result.results
        except Exception as exc:
            log.error("Retrieval failed for %s: %s", question.id, exc)
            candidates = []

        latency_ms = int((time.perf_counter() - t_start) * 1000)
        return compute_retrieval_result(question, candidates, latency_ms, top_k)

    # ------------------------------------------------------------------
    # Generation evaluation
    # ------------------------------------------------------------------

    def evaluate_generation(
        self,
        question: EvalQuestion,
        retrieval_candidates: Optional[List[Any]] = None,
    ) -> GenerationEvalResult:
        """
        Run generation for one question and evaluate quality.

        If retrieval_candidates is provided, skips retrieval.
        Otherwise runs retrieval first (avoids double retrieval when called after evaluate_retrieval).
        """
        from generation.generator import get_generator
        from retrieval.models import FarmerProfile

        profile = FarmerProfile.from_dict(question.farmer_profile)
        t_start = time.perf_counter()

        # Run retrieval if candidates not provided
        if retrieval_candidates is None:
            try:
                retriever = self._get_retriever()
                ret_result = retriever.retrieve(query=question.query, farmer_profile=profile)
                retrieval_candidates = ret_result.results
            except Exception as exc:
                log.error("Retrieval for generation failed for %s: %s", question.id, exc)
                retrieval_candidates = []

        # Run generation
        try:
            from retrieval.models import RetrievalResult
            if hasattr(retrieval_candidates, "results"):
                # already a RetrievalResult
                ret_obj = retrieval_candidates
            else:
                ret_obj = type("FakeResult", (), {
                    "results": retrieval_candidates,
                    "query": question.query,
                    "intent": question.intent,
                    "language": question.language,
                    "applied_filters": {},
                    "query_understanding": {},
                    "candidate_count": len(retrieval_candidates),
                    "final_count": len(retrieval_candidates),
                })()

            # Construct a proper RetrievalResult
            ret_result_obj = RetrievalResult(
                query=question.query,
                intent=question.intent,
                language=question.language,
                applied_filters={},
                query_understanding={},
                results=retrieval_candidates,
                candidate_count=len(retrieval_candidates),
                final_count=len(retrieval_candidates),
            )

            generator = get_generator()
            gen_result = generator.generate(
                retrieval_result=ret_result_obj,
                farmer_profile=profile,
            )
            answer = gen_result.answer
            sources = gen_result.sources

        except Exception as exc:
            log.error("Generation failed for %s: %s", question.id, exc)
            answer = ""
            sources = []

        latency_ms = int((time.perf_counter() - t_start) * 1000)

        # Citation validation
        validated_citations = validate_citations(
            sources=sources,
            retrieval_candidates=retrieval_candidates,
            expected_schemes=question.expected_schemes,
        )
        cit_prec = citation_precision(validated_citations)
        cit_val = citation_validity(validated_citations)
        cit_cov = 1.0  # Placeholder; coverage computed separately if needed

        # Hallucination trap check
        uncertainty_ok = False
        if question.is_hallucination_trap:
            uncertainty_ok = is_uncertainty_expressed(answer)

        # LLM-as-judge (optional)
        context_text = _build_eval_context(retrieval_candidates)
        faith = evaluate_faithfulness(question.query, context_text, answer)
        relevance = evaluate_answer_relevance(question.query, answer)

        # Determine pass/fail
        passed = True
        failure_reason = None

        if question.is_hallucination_trap and not uncertainty_ok:
            passed = False
            failure_reason = "Hallucination trap: answer did not express uncertainty"
        elif cit_val < config.RAG_MIN_CITATION_VALIDITY and sources:
            passed = False
            failure_reason = f"Citation validity {cit_val:.2f} below threshold {config.RAG_MIN_CITATION_VALIDITY}"

        return GenerationEvalResult(
            question_id=question.id,
            query=question.query,
            answer=answer,
            language=question.language,
            difficulty=question.difficulty,
            faithfulness=faith,
            answer_relevance=relevance,
            citation_precision=cit_prec,
            citation_coverage=cit_cov,
            citation_validity=cit_val,
            citation_validations=validated_citations,
            is_hallucination_trap=question.is_hallucination_trap,
            correctly_expressed_uncertainty=uncertainty_ok if question.is_hallucination_trap else False,
            latency_ms=latency_ms,
            passed=passed,
            failure_reason=failure_reason,
        )

    # ------------------------------------------------------------------
    # Conversation evaluation
    # ------------------------------------------------------------------

    def evaluate_conversation(
        self, question: EvalQuestion
    ) -> ConversationEvalResult:
        """
        Evaluate a multi-turn conversation question by running it through
        the conversation service and checking the accumulated farmer profile.
        """
        if not question.conversation_turns:
            return ConversationEvalResult(
                question_id=question.id,
                turns_evaluated=0,
                profile_after_final_turn={},
                expected_profile=question.farmer_profile,
                profile_fields_correct=0,
                profile_fields_total=len(question.farmer_profile),
                profile_accuracy=0.0,
                passed=True,
                failure_reason=None,
            )

        try:
            from conversation.service import chat
            from conversation.models import ChatRequest

            conv_id = None
            final_profile: Dict[str, Any] = {}

            for turn in question.conversation_turns:
                if turn.role != "user":
                    continue
                req = ChatRequest(
                    query=turn.content,
                    conversation_id=conv_id,
                )
                resp = chat(req)
                conv_id = resp.conversation_id
                final_profile = resp.farmer_profile

                # Check profile at this turn if expected_profile set
                if turn.expected_profile:
                    for field_key, expected_val in turn.expected_profile.items():
                        actual_val = final_profile.get(field_key, "")
                        if str(actual_val).lower() != str(expected_val).lower():
                            log.debug(
                                "Conv %s turn mismatch: %s expected=%s actual=%s",
                                question.id, field_key, expected_val, actual_val
                            )

            # Evaluate final profile
            expected = question.farmer_profile
            correct = 0
            for k, v in expected.items():
                if str(final_profile.get(k, "")).lower() == str(v).lower():
                    correct += 1
            total = len(expected) or 1
            accuracy = correct / total

            # Clean up test conversation
            if conv_id:
                try:
                    from conversation.service import delete_conversation
                    delete_conversation(conv_id)
                except Exception:
                    pass

            passed = accuracy >= 0.8
            failure_reason = None if passed else (
                f"Profile accuracy {accuracy:.2f} < 0.8 — "
                f"expected={expected}, got={final_profile}"
            )

            return ConversationEvalResult(
                question_id=question.id,
                turns_evaluated=len([t for t in question.conversation_turns if t.role == "user"]),
                profile_after_final_turn=final_profile,
                expected_profile=expected,
                profile_fields_correct=correct,
                profile_fields_total=total,
                profile_accuracy=accuracy,
                passed=passed,
                failure_reason=failure_reason,
            )

        except Exception as exc:
            log.error("Conversation eval failed for %s: %s", question.id, exc)
            return ConversationEvalResult(
                question_id=question.id,
                turns_evaluated=0,
                profile_after_final_turn={},
                expected_profile=question.farmer_profile,
                profile_fields_correct=0,
                profile_fields_total=len(question.farmer_profile),
                profile_accuracy=0.0,
                passed=False,
                failure_reason=str(exc),
            )

    # ------------------------------------------------------------------
    # Full evaluation run
    # ------------------------------------------------------------------

    def evaluate(
        self,
        questions: List[EvalQuestion],
        dataset_path: str = "golden_questions.json",
        retrieval_only: bool = False,
        generation_only: bool = False,
        conversation_only: bool = False,
        verbose: bool = False,
    ) -> EvalReport:
        """
        Run a full evaluation across all provided questions.
        """
        request_id = str(uuid.uuid4())[:8]
        t_start = time.perf_counter()

        log.info(
            "[%s] Starting evaluation: %d questions | retrieval_only=%s generation_only=%s",
            request_id, len(questions), retrieval_only, generation_only,
        )

        report = EvalReport(
            dataset_path=dataset_path,
            questions_evaluated=len(questions),
            llm_evaluation_enabled=config.RAG_ENABLE_LLM_EVALUATION,
        )

        # Separate conversation questions
        conv_questions = [q for q in questions if q.conversation_turns]
        non_conv = [q for q in questions if not q.conversation_turns]

        if conversation_only:
            non_conv = []
            questions = conv_questions

        # ---- Retrieval evaluation ----
        if not generation_only and not conversation_only:
            log.info("[%s] Running retrieval evaluation...", request_id)
            for q in non_conv:
                if verbose:
                    print(f"  → Retrieval: [{q.id}] {q.query[:60]}...")
                r = self.evaluate_retrieval(q)
                report.retrieval_results.append(r)
                if verbose and not r.passed:
                    print(f"    ✗ FAILED: {r.failure_reason}")

        # ---- Generation evaluation ----
        if not retrieval_only and not conversation_only:
            log.info("[%s] Running generation evaluation...", request_id)
            for q in non_conv:
                if verbose:
                    print(f"  → Generation: [{q.id}] {q.query[:60]}...")
                g = self.evaluate_generation(q)
                report.generation_results.append(g)
                if verbose and not g.passed:
                    print(f"    ✗ FAILED: {g.failure_reason}")

        # ---- Conversation evaluation ----
        if conv_questions and not retrieval_only and not generation_only:
            log.info("[%s] Running conversation evaluation...", request_id)
            for q in conv_questions:
                if verbose:
                    print(f"  → Conversation: [{q.id}]")
                c = self.evaluate_conversation(q)
                report.conversation_results.append(c)

        # ---- Aggregate metrics ----
        if report.retrieval_results:
            metrics = aggregate_retrieval_metrics(report.retrieval_results, questions)
        else:
            metrics = MetricSet(total_questions=len(questions))

        # Add generation metrics to MetricSet
        if report.generation_results:
            gen_results = report.generation_results
            n = len(gen_results) or 1

            faith_scores = [g.faithfulness for g in gen_results if g.faithfulness is not None]
            rel_scores = [g.answer_relevance for g in gen_results if g.answer_relevance is not None]
            cit_vals = [g.citation_validity for g in gen_results]

            metrics.faithfulness = sum(faith_scores) / len(faith_scores) if faith_scores else None
            metrics.answer_relevance = sum(rel_scores) / len(rel_scores) if rel_scores else None
            metrics.citation_validity = sum(cit_vals) / n

            # Hallucination trap accuracy
            traps = [g for g in gen_results if g.is_hallucination_trap]
            if traps:
                metrics.hallucination_trap_accuracy = (
                    sum(1 for g in traps if g.correctly_expressed_uncertainty) / len(traps)
                )

        # ---- Regression check ----
        report.metrics = metrics
        has_gen = bool(report.generation_results)
        report.regression = check_thresholds(metrics, has_generation=has_gen)
        report.total_latency_ms = int((time.perf_counter() - t_start) * 1000)

        log.info(
            "[%s] Evaluation complete in %dms | Recall@5=%.3f HitRate=%.3f CitValidity=%.3f",
            request_id,
            report.total_latency_ms,
            metrics.recall_at_5,
            metrics.hit_rate_at_5,
            metrics.citation_validity,
        )

        return report
