"""
rag/tests/test_evaluation.py — Unit tests for the evaluation framework.

12 test cases — all pure/deterministic, no network calls:
  1.  recall_at_k calculation
  2.  precision_at_k calculation
  3.  reciprocal_rank (MRR component)
  4.  hit_rate (boolean)
  5.  scheme_hit (scheme-level matching)
  6.  citation validation — valid, invalid, missing page
  7.  eligibility 3-state decision extraction
  8.  hallucination trap uncertainty detection
  9.  language-specific metric aggregation
  10. regression threshold detection
  11. CI exit code logic (mock)
  12. malformed dataset raises ValueError

Run:
  python3 -m pytest rag/tests/test_evaluation.py -v
"""

from __future__ import annotations

import json
import sys
import os
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest

from evaluation.retrieval_metrics import (
    hit_rate,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
    scheme_hit,
    aggregate_retrieval_metrics,
    compute_retrieval_result,
)
from evaluation.citation_metrics import (
    validate_citations,
    citation_precision,
    citation_validity,
)
from evaluation.generation_metrics import (
    is_uncertainty_expressed,
    extract_eligibility_decision,
)
from evaluation.models import (
    EvalQuestion,
    ConversationTurn,
    RetrievalEvalResult,
    MetricSet,
    RegressionCheckResult,
)
from evaluation.dataset import load_dataset, validate_dataset
from evaluation.evaluator import check_thresholds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_question(**kwargs) -> EvalQuestion:
    defaults = dict(
        id="q_test",
        query="Test query",
        language="en",
        intent="general_information",
        farmer_profile={},
        expected_schemes=["pm_kisan"],
        expected_topics=["test"],
        difficulty="easy",
    )
    defaults.update(kwargs)
    return EvalQuestion(**defaults)


def _make_retrieval_result(
    question_id="q_test",
    expected=None,
    retrieved_schemes=None,
    recall_5=0.8,
    hit=True,
    language="en",
    difficulty="easy",
) -> RetrievalEvalResult:
    return RetrievalEvalResult(
        question_id=question_id,
        query="test",
        expected_schemes=expected or ["pm_kisan"],
        retrieved_scheme_ids=retrieved_schemes or ["pm_kisan", "pmfby"],
        retrieved_chunk_ids=["chunk_1", "chunk_2"],
        scheme_hit=hit,
        recall_at_k={1: 1.0, 3: 1.0, 5: recall_5, 10: recall_5},
        precision_at_k={5: 0.4, 10: 0.3},
        reciprocal_rank=1.0,
        hit_rate_at_5=hit,
        language=language,
        difficulty=difficulty,
        latency_ms=100,
        passed=hit,
        failure_reason=None if hit else "not found",
    )


# ---------------------------------------------------------------------------
# Test 1: recall_at_k
# ---------------------------------------------------------------------------

class TestRecallAtK:

    def test_perfect_recall(self):
        retrieved = ["pm_kisan", "pmfby", "kcc"]
        relevant = ["pm_kisan"]
        assert recall_at_k(retrieved, relevant, k=1) == 1.0
        assert recall_at_k(retrieved, relevant, k=3) == 1.0

    def test_zero_recall_miss(self):
        retrieved = ["pmfby", "kcc"]
        relevant = ["pm_kisan"]
        assert recall_at_k(retrieved, relevant, k=5) == 0.0

    def test_partial_recall(self):
        retrieved = ["pmfby", "pm_kisan"]
        relevant = ["pm_kisan", "kcc"]
        # Only pm_kisan found in top 5; kcc missing
        assert recall_at_k(retrieved, relevant, k=5) == 0.5

    def test_empty_relevant(self):
        assert recall_at_k(["pm_kisan"], [], k=5) == 0.0

    def test_k_boundary(self):
        """Item at position exactly k should be included (0-indexed slicing)."""
        retrieved = ["x", "y", "pm_kisan"]  # position 2 (k=3 → slice[:3])
        relevant = ["pm_kisan"]
        assert recall_at_k(retrieved, relevant, k=3) == 1.0
        assert recall_at_k(retrieved, relevant, k=2) == 0.0


# ---------------------------------------------------------------------------
# Test 2: precision_at_k
# ---------------------------------------------------------------------------

class TestPrecisionAtK:

    def test_all_relevant(self):
        retrieved = ["pm_kisan", "pm_kisan", "pm_kisan"]
        relevant = ["pm_kisan"]
        assert precision_at_k(retrieved, relevant, k=3) == 1.0

    def test_none_relevant(self):
        retrieved = ["kcc", "rkvy", "pmksy"]
        relevant = ["pm_kisan"]
        assert precision_at_k(retrieved, relevant, k=3) == 0.0

    def test_partial_precision(self):
        retrieved = ["pm_kisan", "kcc", "pmfby", "rkvy", "pmksy"]
        relevant = ["pm_kisan", "pmfby"]
        # 2 out of 5 relevant
        assert precision_at_k(retrieved, relevant, k=5) == pytest.approx(2 / 5)

    def test_empty_retrieved(self):
        assert precision_at_k([], ["pm_kisan"], k=5) == 0.0


# ---------------------------------------------------------------------------
# Test 3: reciprocal_rank (MRR component)
# ---------------------------------------------------------------------------

class TestReciprocalRank:

    def test_first_position(self):
        assert reciprocal_rank(["pm_kisan", "pmfby"], ["pm_kisan"]) == pytest.approx(1.0)

    def test_third_position(self):
        assert reciprocal_rank(["kcc", "rkvy", "pm_kisan"], ["pm_kisan"]) == pytest.approx(1 / 3)

    def test_not_found(self):
        assert reciprocal_rank(["kcc", "rkvy"], ["pm_kisan"]) == 0.0

    def test_empty_relevant(self):
        assert reciprocal_rank(["pm_kisan"], []) == 0.0

    def test_first_of_multiple(self):
        """First match is position 2, even if second expected item is at position 1."""
        assert reciprocal_rank(["pmfby", "pm_kisan"], ["pm_kisan"]) == pytest.approx(0.5)


# ---------------------------------------------------------------------------
# Test 4: hit_rate
# ---------------------------------------------------------------------------

class TestHitRate:

    def test_hit_within_k(self):
        assert hit_rate(["x", "y", "pm_kisan"], ["pm_kisan"], k=5) is True

    def test_miss_outside_k(self):
        assert hit_rate(["x", "y", "z", "w", "v", "pm_kisan"], ["pm_kisan"], k=5) is False

    def test_empty_relevant(self):
        assert hit_rate(["pm_kisan"], [], k=5) is False

    def test_empty_retrieved(self):
        assert hit_rate([], ["pm_kisan"], k=5) is False


# ---------------------------------------------------------------------------
# Test 5: scheme_hit (scheme-level matching)
# ---------------------------------------------------------------------------

class TestSchemeHit:

    def test_hit(self):
        assert scheme_hit(["pm_kisan", "pmfby"], ["pm_kisan"]) is True

    def test_miss(self):
        assert scheme_hit(["kcc", "rkvy"], ["pm_kisan"]) is False

    def test_empty_expected(self):
        """Vacuously true — no expected scheme to miss."""
        assert scheme_hit(["pm_kisan"], []) is True

    def test_multiple_expected_partial(self):
        """At least one expected scheme found → True."""
        assert scheme_hit(["pm_kisan"], ["pm_kisan", "pmfby"]) is True

    def test_multiple_expected_none(self):
        assert scheme_hit(["kcc"], ["pm_kisan", "pmfby"]) is False


# ---------------------------------------------------------------------------
# Test 6: citation validation
# ---------------------------------------------------------------------------

class TestCitationValidation:

    def _make_candidate(self, scheme_id="pm_kisan", title="PM-KISAN Guidelines"):
        from dataclasses import dataclass, field
        from typing import Optional
        @dataclass
        class FakeCandidate:
            document_title: str
            scheme_id: str
            page_number: int
            source_url: str
        return FakeCandidate(
            document_title=title,
            scheme_id=scheme_id,
            page_number=3,
            source_url="https://pmkisan.gov.in/docs/guidelines.pdf",
        )

    def test_valid_citation(self):
        candidates = [self._make_candidate()]
        sources = [{"source_id": "s1", "document_title": "PM-KISAN Guidelines",
                    "scheme_id": "pm_kisan", "page_number": 3,
                    "source_url": "https://pmkisan.gov.in/docs/guidelines.pdf"}]
        validated = validate_citations(sources, candidates, ["pm_kisan"])
        assert validated[0].is_valid is True
        assert citation_precision(validated) == 1.0

    def test_invalid_citation_not_in_retrieval(self):
        candidates = [self._make_candidate("pmfby", "PMFBY Operational Guidelines")]
        sources = [{"source_id": "s1", "document_title": "INVENTED DOCUMENT",
                    "scheme_id": "pm_kisan", "page_number": 1, "source_url": ""}]
        validated = validate_citations(sources, candidates, ["pm_kisan"])
        assert validated[0].in_retrieval_results is False
        assert validated[0].is_valid is False

    def test_missing_page_number(self):
        candidates = [self._make_candidate()]
        sources = [{"source_id": "s1", "document_title": "PM-KISAN Guidelines",
                    "scheme_id": "pm_kisan", "page_number": None, "source_url": "https://x.com"}]
        validated = validate_citations(sources, candidates, ["pm_kisan"])
        assert validated[0].page_number_present is False
        # Still valid if in retrieval and scheme matches
        assert validated[0].is_valid is True

    def test_no_citations_is_perfect_precision(self):
        """Zero citations → citation_precision = 1.0 (no false citations)."""
        assert citation_precision([]) == 1.0

    def test_mixed_citations(self):
        candidates = [self._make_candidate("pm_kisan", "PM-KISAN Guidelines")]
        sources = [
            {"source_id": "s1", "document_title": "PM-KISAN Guidelines",
             "scheme_id": "pm_kisan", "page_number": 1, "source_url": "https://x"},
            {"source_id": "s2", "document_title": "Invented Doc",
             "scheme_id": "made_up", "page_number": 0, "source_url": ""},
        ]
        validated = validate_citations(sources, candidates, ["pm_kisan"])
        prec = citation_precision(validated)
        assert prec == pytest.approx(0.5)  # 1 valid out of 2


# ---------------------------------------------------------------------------
# Test 7: Eligibility 3-state decision extraction
# ---------------------------------------------------------------------------

class TestEligibilityDecision:

    def test_eligible(self):
        assert extract_eligibility_decision("You are ELIGIBLE for PM-KISAN.") == "ELIGIBLE"

    def test_ineligible(self):
        assert extract_eligibility_decision("You are INELIGIBLE because you pay income tax.") == "INELIGIBLE"

    def test_insufficient(self):
        assert extract_eligibility_decision("INSUFFICIENT_INFORMATION to determine eligibility.") == "INSUFFICIENT_INFORMATION"

    def test_natural_language_eligible(self):
        """Natural language 'eligible' → ELIGIBLE."""
        result = extract_eligibility_decision("Based on the documents, you appear to be eligible for the scheme.")
        assert result == "ELIGIBLE"

    def test_natural_language_ineligible(self):
        result = extract_eligibility_decision("You are not eligible because you own more than 2 hectares.")
        assert result == "INELIGIBLE"

    def test_insufficient_missing_info(self):
        result = extract_eligibility_decision("There is insufficient information to make a determination.")
        assert result == "INSUFFICIENT_INFORMATION"

    def test_no_decision_returns_none(self):
        """Irrelevant text → None."""
        result = extract_eligibility_decision("The sun is bright today.")
        assert result is None

    def test_missing_info_not_ineligible(self):
        """
        Missing land size info should produce INSUFFICIENT_INFORMATION,
        not INELIGIBLE. This is a critical correctness requirement.
        """
        answer = "More information is needed. Please provide land size."
        decision = extract_eligibility_decision(answer)
        # Should be INSUFFICIENT_INFORMATION, not INELIGIBLE
        assert decision != "INELIGIBLE"


# ---------------------------------------------------------------------------
# Test 8: Hallucination trap / uncertainty detection
# ---------------------------------------------------------------------------

class TestHallucinationTrap:

    def test_uncertainty_phrase_detected(self):
        answer = "I could not find any information about ₹87,543 in the available documents."
        assert is_uncertainty_expressed(answer) is True

    def test_hallucination_not_detected(self):
        answer = "The government gives ₹87,543 exactly to every wheat farmer per year."
        assert is_uncertainty_expressed(answer) is False

    def test_hindi_uncertainty(self):
        answer = "Yeh jankari documents mein nahi mil rahi. Please confirm karo."
        assert is_uncertainty_expressed(answer) is True

    def test_consult_official(self):
        answer = "Please consult the official PM-KISAN portal for this information."
        assert is_uncertainty_expressed(answer) is True

    def test_factual_answer_no_uncertainty(self):
        answer = "PM-KISAN provides ₹6,000 per year in three equal installments."
        assert is_uncertainty_expressed(answer) is False


# ---------------------------------------------------------------------------
# Test 9: Language-specific metric aggregation
# ---------------------------------------------------------------------------

class TestLanguageMetrics:

    def test_language_breakdown(self):
        results = [
            _make_retrieval_result(question_id="q1", language="en", recall_5=1.0, hit=True),
            _make_retrieval_result(question_id="q2", language="hi", recall_5=0.0, hit=False),
            _make_retrieval_result(question_id="q3", language="hinglish", recall_5=1.0, hit=True),
        ]
        metrics = aggregate_retrieval_metrics(results)

        assert "en" in metrics.by_language
        assert "hi" in metrics.by_language
        assert "hinglish" in metrics.by_language

        assert metrics.by_language["en"]["recall_at_5"] == pytest.approx(1.0)
        assert metrics.by_language["hi"]["recall_at_5"] == pytest.approx(0.0)
        assert metrics.by_language["hinglish"]["recall_at_5"] == pytest.approx(1.0)

    def test_aggregate_mrr(self):
        results = [
            _make_retrieval_result(question_id="q1"),
            _make_retrieval_result(question_id="q2"),
        ]
        metrics = aggregate_retrieval_metrics(results)
        assert 0.0 <= metrics.mrr <= 1.0


# ---------------------------------------------------------------------------
# Test 10: Regression threshold detection
# ---------------------------------------------------------------------------

class TestRegressionThresholds:

    def _make_metrics(self, recall_5=0.9, hit_rate=0.9, citation_val=0.95) -> MetricSet:
        m = MetricSet(
            total_questions=10,
            recall_at_5=recall_5,
            hit_rate_at_5=hit_rate,
            citation_validity=citation_val,
        )
        return m

    def test_all_pass(self):
        import config as cfg
        cfg.RAG_MIN_RECALL_AT_5 = 0.75
        cfg.RAG_MIN_HIT_RATE = 0.80
        cfg.RAG_MIN_CITATION_VALIDITY = 0.90
        cfg.RAG_ENABLE_LLM_EVALUATION = False

        result = check_thresholds(self._make_metrics(0.9, 0.9, 0.95))
        assert result.passed is True
        assert result.failures == []

    def test_recall_fails(self):
        import config as cfg
        cfg.RAG_MIN_RECALL_AT_5 = 0.85
        cfg.RAG_MIN_HIT_RATE = 0.80
        cfg.RAG_MIN_CITATION_VALIDITY = 0.90
        cfg.RAG_ENABLE_LLM_EVALUATION = False

        result = check_thresholds(self._make_metrics(recall_5=0.70))
        assert result.passed is False
        assert any("recall_at_5" in f for f in result.failures)

    def test_citation_fails(self):
        import config as cfg
        cfg.RAG_MIN_CITATION_VALIDITY = 0.95
        cfg.RAG_ENABLE_LLM_EVALUATION = False

        result = check_thresholds(self._make_metrics(citation_val=0.80))
        assert result.passed is False
        assert any("citation_validity" in f for f in result.failures)

    def test_threshold_boundary(self):
        """Exactly at threshold → should pass (>=)."""
        import config as cfg
        cfg.RAG_MIN_RECALL_AT_5 = 0.75
        cfg.RAG_ENABLE_LLM_EVALUATION = False

        result = check_thresholds(self._make_metrics(recall_5=0.75))
        assert result.passed is True


# ---------------------------------------------------------------------------
# Test 11: CI exit code logic
# ---------------------------------------------------------------------------

class TestCIExitCode:

    def test_ci_json_passed(self):
        from evaluation.report import ci_json
        from evaluation.models import EvalReport

        report = EvalReport(
            dataset_path="test.json",
            questions_evaluated=5,
            metrics=MetricSet(
                total_questions=5,
                recall_at_5=0.9,
                hit_rate_at_5=0.9,
                citation_validity=0.95,
            ),
            regression=RegressionCheckResult(passed=True, failures=[]),
        )
        result = ci_json(report)
        assert result["passed"] is True
        assert result["failures"] == []
        assert "recall_at_5" in result["metrics"]

    def test_ci_json_failed(self):
        from evaluation.report import ci_json
        from evaluation.models import EvalReport

        report = EvalReport(
            dataset_path="test.json",
            questions_evaluated=5,
            metrics=MetricSet(total_questions=5, recall_at_5=0.5),
            regression=RegressionCheckResult(
                passed=False,
                failures=["recall_at_5: 0.5000 < threshold 0.7500"],
            ),
        )
        result = ci_json(report)
        assert result["passed"] is False
        assert len(result["failures"]) == 1


# ---------------------------------------------------------------------------
# Test 12: Malformed dataset raises ValueError
# ---------------------------------------------------------------------------

class TestDatasetValidation:

    def test_valid_dataset_loads(self):
        """The bundled golden dataset must load without errors."""
        from evaluation.dataset import DEFAULT_DATASET_PATH
        questions = load_dataset(DEFAULT_DATASET_PATH)
        assert len(questions) >= 30
        assert all(hasattr(q, "id") for q in questions)

    def test_missing_id_raises(self, tmp_path):
        bad_data = [{"query": "test", "language": "en"}]  # no id
        path = str(tmp_path / "bad.json")
        with open(path, "w") as f:
            json.dump(bad_data, f)
        with pytest.raises(ValueError, match="missing required field"):
            load_dataset(path)

    def test_missing_query_raises(self, tmp_path):
        bad_data = [{"id": "q001", "language": "en"}]  # no query
        path = str(tmp_path / "bad2.json")
        with open(path, "w") as f:
            json.dump(bad_data, f)
        with pytest.raises(ValueError, match="missing required field"):
            load_dataset(path)

    def test_not_a_list_raises(self, tmp_path):
        path = str(tmp_path / "notlist.json")
        with open(path, "w") as f:
            json.dump({"key": "value"}, f)
        with pytest.raises(ValueError, match="JSON array"):
            load_dataset(path)

    def test_file_not_found_raises(self):
        with pytest.raises(FileNotFoundError):
            load_dataset("/nonexistent/path/to/dataset.json")

    def test_dataset_no_duplicate_ids(self):
        from evaluation.dataset import DEFAULT_DATASET_PATH
        questions = load_dataset(DEFAULT_DATASET_PATH)
        ids = [q.id for q in questions]
        assert len(ids) == len(set(ids)), "Dataset contains duplicate IDs"

    def test_hallucination_traps_have_empty_expected_schemes(self):
        from evaluation.dataset import DEFAULT_DATASET_PATH
        questions = load_dataset(DEFAULT_DATASET_PATH)
        traps = [q for q in questions if q.is_hallucination_trap]
        for trap in traps:
            assert trap.expected_schemes == [], (
                f"Trap {trap.id} should have empty expected_schemes"
            )
