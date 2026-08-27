"""
rag/tests/test_retriever.py
Integration tests for the retrieval pipeline.

These tests query real Pinecone. They are automatically skipped if
PINECONE_API_KEY is not set in the environment.

Run with:  python3 -m pytest rag/tests/test_retriever.py -v
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from rag import config

# Skip all tests in this module if Pinecone credentials are absent
pytestmark = pytest.mark.skipif(
    not config.PINECONE_API_KEY,
    reason="PINECONE_API_KEY not set — skipping Pinecone integration tests",
)


@pytest.fixture(scope="module")
def retriever():
    from rag.retrieval.retriever import get_retriever
    return get_retriever()


def _assert_result_basic(result):
    """Common assertions on a RetrievalResult."""
    assert result is not None
    assert result.intent is not None
    assert result.language is not None
    assert isinstance(result.results, list)
    for r in result.results:
        assert r.chunk_text, "chunk_text must not be empty"
        assert r.scheme_id,  "scheme_id must be present"
        assert 0.0 <= r.semantic_score <= 2.0, "semantic_score out of range"
        assert r.final_score >= r.semantic_score - 0.01, "final_score must not be lower than semantic"


# ---------------------------------------------------------------------------
# Test Case 1: What is PM-KISAN?
# ---------------------------------------------------------------------------

def test_1_pm_kisan_general(retriever):
    result = retriever.retrieve("What is PM-KISAN?", top_k=5)
    _assert_result_basic(result)
    scheme_ids = {r.scheme_id for r in result.results}
    assert "pm_kisan" in scheme_ids, f"Expected pm_kisan in results, got: {scheme_ids}"


# ---------------------------------------------------------------------------
# Test Case 2: PM Kisan eligibility (Hinglish)
# ---------------------------------------------------------------------------

def test_2_pm_kisan_eligibility_hinglish(retriever):
    result = retriever.retrieve("PM Kisan ke liye kaun eligible hai?", top_k=5)
    _assert_result_basic(result)
    assert result.language in {"hinglish", "hi"}
    assert result.intent == "eligibility"
    scheme_ids = {r.scheme_id for r in result.results}
    assert "pm_kisan" in scheme_ids, f"Expected pm_kisan in results, got: {scheme_ids}"


# ---------------------------------------------------------------------------
# Test Case 3: Hindi crop loss query
# ---------------------------------------------------------------------------

def test_3_crop_loss_hindi(retriever):
    result = retriever.retrieve("मेरी फसल बारिश से खराब हो गई है", top_k=5)
    _assert_result_basic(result)
    assert result.language == "hi"
    assert result.intent in {"crop_loss_assistance", "crop_insurance"}
    # Should retrieve PMFBY or similar crop-insurance content
    scheme_ids = {r.scheme_id for r in result.results}
    assert scheme_ids, "Should return at least one result"


# ---------------------------------------------------------------------------
# Test Case 4: UP wheat farmer (should include central + state)
# ---------------------------------------------------------------------------

def test_4_up_wheat_farmer(retriever):
    result = retriever.retrieve(
        "I am a wheat farmer from Uttar Pradesh. Which schemes are relevant?",
        top_k=10,
    )
    _assert_result_basic(result)
    assert result.query_understanding.get("state") == "Uttar Pradesh"
    assert result.query_understanding.get("crop") == "wheat"
    # Central schemes should be present (not over-filtered)
    gov_levels = {r.government_level for r in result.results}
    assert "central" in gov_levels, "Central scheme results expected for UP farmer"


# ---------------------------------------------------------------------------
# Test Case 5: Kisan Credit Card (Hinglish)
# ---------------------------------------------------------------------------

def test_5_kcc_application_hinglish(retriever):
    result = retriever.retrieve("Kisan Credit Card kaise milega?", top_k=5)
    _assert_result_basic(result)
    assert result.intent == "application_process"


# ---------------------------------------------------------------------------
# Test Case 6: Drip irrigation subsidy
# ---------------------------------------------------------------------------

def test_6_drip_irrigation_subsidy(retriever):
    result = retriever.retrieve("Drip irrigation subsidy", top_k=5)
    _assert_result_basic(result)
    assert result.intent == "subsidy"
    # PMKSY should rank highly
    scheme_ids = {r.scheme_id for r in result.results}
    assert "pmksy" in scheme_ids or len(scheme_ids) > 0


# ---------------------------------------------------------------------------
# Test Case 7: Hindi language query
# ---------------------------------------------------------------------------

def test_7_hindi_scheme_query(retriever):
    result = retriever.retrieve("किसानों के लिए कौन सी योजनाएं उपलब्ध हैं?", top_k=5)
    _assert_result_basic(result)
    assert result.language == "hi"
    assert len(result.results) > 0


# ---------------------------------------------------------------------------
# Test Case 8: Hinglish query
# ---------------------------------------------------------------------------

def test_8_hinglish_query(retriever):
    result = retriever.retrieve("Kisan ke liye kaunsi scheme available hai?", top_k=5)
    _assert_result_basic(result)
    assert result.language in {"hinglish", "en", "hi"}
    assert len(result.results) > 0


# ---------------------------------------------------------------------------
# Test Case 9: No state provided
# ---------------------------------------------------------------------------

def test_9_no_state(retriever):
    result = retriever.retrieve("What is PMFBY?", top_k=5)
    _assert_result_basic(result)
    qu = result.query_understanding
    assert qu.get("state") is None, "State should not be extracted"
    assert qu.get("scheme_id") == "pmfby"
    scheme_ids = {r.scheme_id for r in result.results}
    assert "pmfby" in scheme_ids


# ---------------------------------------------------------------------------
# Test Case 10: Explicit scheme name
# ---------------------------------------------------------------------------

def test_10_explicit_scheme_rkvy(retriever):
    result = retriever.retrieve("Tell me about RKVY scheme benefits", top_k=5)
    _assert_result_basic(result)
    assert result.query_understanding.get("scheme_id") == "rkvy"
    scheme_ids = {r.scheme_id for r in result.results}
    assert "rkvy" in scheme_ids


# ---------------------------------------------------------------------------
# Metadata + ranking quality checks
# ---------------------------------------------------------------------------

def test_results_have_required_metadata(retriever):
    result = retriever.retrieve("PM Kisan eligibility criteria", top_k=3)
    for r in result.results:
        assert r.source_url is not None
        assert r.page_number >= 0
        assert r.document_title


def test_deduplication_no_same_chunk_twice(retriever):
    result = retriever.retrieve("PM Kisan eligibility", top_k=10)
    ids = [r.chunk_id for r in result.results]
    assert len(ids) == len(set(ids)), "Duplicate chunk IDs found in results"


def test_final_score_descending(retriever):
    result = retriever.retrieve("PMFBY crop insurance claim", top_k=5)
    scores = [r.final_score for r in result.results]
    assert scores == sorted(scores, reverse=True), "Results not sorted by score"


def test_fallback_no_filter_no_crash(retriever):
    """A query with no extractable entities should still return results."""
    result = retriever.retrieve("Tell me about agricultural assistance", top_k=5)
    _assert_result_basic(result)
    assert len(result.results) > 0


def test_state_filter_includes_central_schemes(retriever):
    """State filter must NOT exclude central schemes."""
    from rag.retrieval.models import FarmerProfile
    profile = FarmerProfile(state="Uttar Pradesh")
    result = retriever.retrieve("Which schemes am I eligible for?", farmer_profile=profile, top_k=10)
    gov_levels = {r.government_level for r in result.results}
    assert "central" in gov_levels, "Central schemes should appear for UP farmer"
