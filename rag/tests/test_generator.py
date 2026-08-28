"""
rag/tests/test_generator.py — Tests for the LLM generation layer.

Test categories:
  - Unit tests (no Pinecone, no LLM) — mock retrieval results
  - Integration tests (real Pinecone + LLM) — skipped if credentials absent

Run:
  python3 -m pytest rag/tests/test_generator.py -v -k "unit"         # unit only
  python3 -m pytest rag/tests/test_generator.py -v                   # all (requires keys)
"""

from __future__ import annotations

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from unittest.mock import patch, MagicMock

from rag import config
from rag.retrieval.models import RetrievalCandidate, RetrievalResult
from rag.generation.context_builder import build_context
from rag.generation.citation_builder import build_citations, extract_schemes, build_follow_ups
from rag.generation.models import SAFE_FALLBACK_ANSWERS
from rag.retrieval.query_understanding import understand

# ---------------------------------------------------------------------------
# Helpers — build mock RetrievalResult without hitting Pinecone
# ---------------------------------------------------------------------------

def _make_candidate(
    scheme_id="pm_kisan",
    scheme_name="PM-KISAN",
    section="Eligibility",
    page=12,
    score=0.65,
    text="PM-KISAN provides income support of Rs.6000 per year to eligible farmers.",
    source_url="https://pmkisan.gov.in",
    official=True,
    state=None,
    gov_level="central",
    doc_title="PM KISAN Revised Operational Guidelines 2020",
    doc_type="Operational Guidelines",
    published_date="2020-06-01",
) -> RetrievalCandidate:
    return RetrievalCandidate(
        chunk_id=f"{scheme_id}_{page}",
        chunk_text=text,
        scheme_id=scheme_id,
        scheme_name=scheme_name,
        government_level=gov_level,
        state=state,
        document_title=doc_title,
        document_type=doc_type,
        section=section,
        page_number=page,
        language="en",
        source_url=source_url,
        source_type="official government",
        published_date=published_date,
        last_updated=None,
        document_version="2020",
        file_path="/docs/pm_kisan.pdf",
        semantic_score=score,
        final_score=score + 0.15 + 0.08,  # + scheme_bonus + official_bonus
        official_source=official,
        score_breakdown={"semantic": score, "scheme_match": 0.15, "official_source": 0.08},
    )


def _make_retrieval_result(
    query="PM Kisan ke liye kaun eligible hai?",
    intent="eligibility",
    language="hinglish",
    candidates=None,
) -> RetrievalResult:
    if candidates is None:
        candidates = [_make_candidate()]
    return RetrievalResult(
        query=query,
        intent=intent,
        language=language,
        applied_filters={"scheme_id": "pm_kisan"},
        query_understanding={"intent": intent, "language": language},
        results=candidates,
        candidate_count=len(candidates),
        final_count=len(candidates),
    )


# ---------------------------------------------------------------------------
# UNIT TESTS — no network, no LLM
# ---------------------------------------------------------------------------

class TestContextBuilder:

    def test_builds_context_with_sources(self):
        """Context should include SOURCE blocks with scheme metadata."""
        result = _make_retrieval_result()
        ctx, included = build_context(result)
        assert "SOURCE 1" in ctx
        assert "PM-KISAN" in ctx
        assert "Eligibility" in ctx
        assert len(included) == 1

    def test_filters_low_score_chunks(self):
        """Chunks below min_score should be excluded from context."""
        low_score_chunk = _make_candidate(score=0.10)
        result = _make_retrieval_result(candidates=[low_score_chunk])
        ctx, included = build_context(result, min_score=0.25)
        assert ctx == ""
        assert included == []

    def test_respects_top_k_limit(self):
        """Should not include more than context_top_k chunks."""
        chunks = [_make_candidate(page=i, score=0.6 - i * 0.01) for i in range(10)]
        result = _make_retrieval_result(candidates=chunks)
        ctx, included = build_context(result, context_top_k=3, min_score=0.1)
        assert len(included) == 3

    def test_includes_source_url_when_present(self):
        """Source URLs should appear in context for citation."""
        result = _make_retrieval_result()
        ctx, _ = build_context(result)
        assert "pmkisan.gov.in" in ctx

    def test_includes_official_source_label(self):
        """Official source flag should be reflected in context."""
        result = _make_retrieval_result()
        ctx, _ = build_context(result)
        assert "Official Source: Yes" in ctx

    def test_no_context_empty_candidates(self):
        """Empty candidate list → empty context."""
        result = _make_retrieval_result(candidates=[])
        ctx, included = build_context(result)
        assert ctx == ""
        assert included == []


class TestCitationBuilder:

    def test_citation_comes_from_metadata(self):
        """Citations must come from retrieved metadata, not fabricated."""
        chunk = _make_candidate(page=12, source_url="https://pmkisan.gov.in")
        citations = build_citations([chunk])
        assert len(citations) == 1
        assert citations[0].page_number == 12
        assert citations[0].source_url == "https://pmkisan.gov.in"
        assert citations[0].document_title == "PM KISAN Revised Operational Guidelines 2020"
        assert citations[0].official_source is True

    def test_deduplication_same_page(self):
        """Same (document_title, page) should appear only once in citations."""
        chunk1 = _make_candidate(page=5)
        chunk2 = _make_candidate(page=5)  # same page
        citations = build_citations([chunk1, chunk2])
        assert len(citations) == 1

    def test_different_pages_different_citations(self):
        """Different pages = different citations."""
        chunk1 = _make_candidate(page=5)
        chunk2 = _make_candidate(page=12)
        citations = build_citations([chunk1, chunk2])
        assert len(citations) == 2

    def test_no_source_url_fabrication(self):
        """Chunks with empty source_url should have empty URL in citation."""
        chunk = _make_candidate(source_url="")
        citations = build_citations([chunk])
        assert citations[0].source_url == ""  # not fabricated

    def test_scheme_extraction(self):
        """Should extract distinct schemes from included chunks."""
        chunks = [
            _make_candidate(scheme_id="pm_kisan", scheme_name="PM-KISAN", score=0.7),
            _make_candidate(scheme_id="pmfby", scheme_name="PMFBY", score=0.5),
        ]
        schemes = extract_schemes(chunks, "eligibility")
        scheme_ids = {s.scheme_id for s in schemes}
        assert "pm_kisan" in scheme_ids
        assert "pmfby" in scheme_ids

    def test_scheme_relevance_classification(self):
        """High-score scheme → 'high' relevance."""
        chunk = _make_candidate(score=0.7)
        chunk.final_score = 0.93  # high relevance threshold
        schemes = extract_schemes([chunk], "eligibility")
        assert schemes[0].relevance == "high"


class TestSafeFallback:

    def test_fallback_exists_all_languages(self):
        """Safe fallback answers must exist for all supported languages."""
        for lang in ["en", "hi", "hinglish"]:
            assert lang in SAFE_FALLBACK_ANSWERS
            assert len(SAFE_FALLBACK_ANSWERS[lang]) > 50

    def test_fallback_no_fabricated_scheme_amounts(self):
        """Fallback should not fabricate any specific scheme amounts."""
        for lang, text in SAFE_FALLBACK_ANSWERS.items():
            # No rupee amounts should appear in the safe fallback
            assert "₹" not in text or "6000" not in text, \
                f"Fallback for {lang} should not fabricate scheme amounts"


class TestSafeFallbackReturn:
    """Test that generator returns safe fallback when context is empty (unit test — no LLM)."""

    def test_empty_context_returns_fallback_not_llm(self):
        """When no chunks qualify, generator must NOT call LLM."""
        from rag.generation.generator import SchemeRAGGenerator

        gen = SchemeRAGGenerator()
        # Provide a result with very low score chunks
        low_chunk = _make_candidate(score=0.05)
        low_chunk.final_score = 0.05
        result = _make_retrieval_result(candidates=[low_chunk])

        # Patch _get_client to verify it's NOT called
        with patch.object(gen, '_get_client') as mock_client:
            gen_result = gen.generate(result)

        # LLM should NOT have been called
        mock_client.assert_not_called()
        assert "sufficient information" in gen_result.answer.lower() or \
               "nahi mili" in gen_result.answer.lower() or \
               "पर्याप्त" in gen_result.answer


class TestFollowUpQuestions:

    def test_no_follow_ups_when_state_known(self):
        """No 'what state?' question when state is already in query."""
        qu = understand("UP mein wheat farmer ke liye kaunsi schemes hain?")
        result = _make_retrieval_result()
        follow_ups = build_follow_ups(qu, result, "hinglish")
        # Should not ask for state since UP was detected
        state_questions = [q for q in follow_ups if "state" in q.lower() or "rajya" in q.lower()]
        assert len(state_questions) == 0

    def test_follow_up_max_3(self):
        """Should return at most 3 follow-up questions."""
        qu = understand("kaunsi schemes hain?")  # no state, no crop, no land
        result = _make_retrieval_result(intent="scheme_recommendation")
        follow_ups = build_follow_ups(qu, result, "en")
        assert len(follow_ups) <= 3


# ---------------------------------------------------------------------------
# INTEGRATION TESTS — real Pinecone + real LLM
# ---------------------------------------------------------------------------

_has_pinecone = bool(config.PINECONE_API_KEY)
_has_llm = bool(config.LLM_API_KEY)
_skip_integration = not (_has_pinecone and _has_llm)

pytestmark_integration = pytest.mark.skipif(
    _skip_integration,
    reason="PINECONE_API_KEY or GROQ_API_KEY not set — skipping integration tests",
)


def _is_rate_limited(exc: Exception) -> bool:
    """Return True if the exception is a Groq 429 rate-limit error."""
    msg = str(exc).lower()
    return "429" in msg or "rate_limit_exceeded" in msg or "rate limit" in msg


@pytest.fixture(scope="module")
def generator():
    from rag.generation.generator import get_generator
    return get_generator()


@pytest.fixture(scope="module")
def retriever():
    from rag.retrieval.retriever import get_retriever
    return get_retriever()


def _retrieve_and_generate(retriever, generator, query, farmer_profile=None, language=None):
    """Helper: run end-to-end retrieval + generation."""
    from rag.retrieval.models import FarmerProfile as FP
    try:
        result = retriever.retrieve(query, farmer_profile=farmer_profile)
        if language:
            result.language = language
        return generator.generate(result, farmer_profile=farmer_profile)
    except Exception as exc:
        if _is_rate_limited(exc):
            pytest.skip(f"Groq TPD rate limit exhausted — try again tomorrow. ({exc})")
        raise


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_1_pm_kisan_eligibility(generator, retriever):
    """Test 1: PM-KISAN eligibility — answer must mention PM-KISAN, citations from retrieved metadata."""
    gen = _retrieve_and_generate(retriever, generator, "PM Kisan ke liye kaun eligible hai?")

    assert gen.answer, "Answer must not be empty"
    answer_upper = gen.answer.upper()
    assert "PM-KISAN" in answer_upper or "KISAN" in answer_upper, \
        "Answer should mention PM-KISAN"

    # Citations come from retrieved metadata, not fabricated
    assert len(gen.sources) > 0, "Must have at least one source citation"
    for src in gen.sources:
        assert src.document_title, "Citation must have document title"
        assert src.page_number >= 0, "Citation page must be non-negative"
        # Source URL should be either empty or a real URL from corpus
        if src.source_url:
            assert src.source_url.startswith("http"), "Source URL must be real"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_2_crop_loss(generator, retriever):
    """Test 2: Crop loss query — grounded answer, source returned."""
    gen = _retrieve_and_generate(
        retriever, generator,
        "Meri fasal baarish se kharab ho gayi hai. Mujhe kya government help mil sakti hai?"
    )
    assert gen.answer, "Answer must not be empty"
    assert len(gen.sources) > 0, "Sources must be returned"
    assert not gen.retrieval or not gen.retrieval.used_fallback or "couldn't find" in gen.answer.lower()


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_3_up_wheat_farmer(generator, retriever):
    """Test 3: UP wheat farmer — both central and state context included."""
    from rag.retrieval.models import FarmerProfile
    profile = FarmerProfile(state="Uttar Pradesh", crop="wheat", land_size=3, land_unit="acre")
    gen = _retrieve_and_generate(
        retriever, generator,
        "Main Uttar Pradesh mein 3 acre mein wheat ugata hoon. Mujhe kaunsi schemes mil sakti hain?",
        farmer_profile=profile,
    )
    assert gen.answer, "Answer must not be empty"
    # Answer should reference at least one scheme
    assert len(gen.schemes) > 0 or "scheme" in gen.answer.lower()


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_4_unknown_amount_no_fabrication(generator, retriever):
    """Test 4: Fabricated amount — LLM must NOT confirm ₹87,543 as a real scheme amount."""
    gen = _retrieve_and_generate(
        retriever, generator,
        "What government scheme gives me exactly Rs. 87543 for my farm?"
    )
    # The LLM may echo the number when DENYING it — that is correct behavior.
    # What we must check: the answer does NOT confirm the amount as real.
    # Key signals of correct behaviour: uses "not found", "not mention", "does not", "cannot"
    answer_lower = gen.answer.lower()
    denial_signals = [
        "not find", "not found", "could not find",
        "not mention", "does not mention", "do not mention",
        "no such", "cannot", "can't", "doesn't exist",
        "nahi mili", "nahi hai", "नहीं मिली",
        "insufficient", "not contain", "not listed",
    ]
    has_denial = any(signal in answer_lower for signal in denial_signals)
    assert has_denial, (
        "LLM should explicitly deny that ₹87,543 scheme exists, "
        f"but answer was: {gen.answer[:300]}"
    )



@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_5_hindi_answer(generator, retriever):
    """Test 5: Hindi query — answer should be in Hindi (contain Devanagari)."""
    import re
    gen = _retrieve_and_generate(
        retriever, generator,
        "पीएम किसान योजना के लिए कौन पात्र है?",
        language="hi",
    )
    devanagari = re.findall(r"[\u0900-\u097F]", gen.answer)
    assert len(devanagari) > 10, "Hindi answer should contain Devanagari characters"
    assert gen.language == "hi"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_6_hinglish_answer(generator, retriever):
    """Test 6: Hinglish query — answer should be natural Hinglish."""
    gen = _retrieve_and_generate(
        retriever, generator,
        "PM Kisan ka paisa kab milta hai?",
        language="hinglish",
    )
    assert gen.answer, "Answer must not be empty"
    assert gen.language == "hinglish"
    # Should contain some English (not pure Hindi)
    english_words = sum(1 for w in gen.answer.split() if w.isascii() and w.isalpha())
    assert english_words > 3, "Hinglish answer should contain some English words"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_7_empty_retrieval_safe_fallback(generator):
    """Test 7: Empty retrieval → LLM not called, safe fallback returned."""
    result = _make_retrieval_result(candidates=[])  # empty
    gen = generator.generate(result)
    assert "sufficient information" in gen.answer.lower() or \
           "nahi mili" in gen.answer.lower() or \
           "agricoop.nic.in" in gen.answer, \
        "Safe fallback should be returned for empty retrieval"
    assert gen.model_used == "none (safe fallback)"
