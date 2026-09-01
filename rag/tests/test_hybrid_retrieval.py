"""
rag/tests/test_hybrid_retrieval.py — Unit tests for the hybrid retrieval layer.

12 test cases — all mocked, no Pinecone or model calls:
  1.  Dense score normalization (semantic_score set correctly)
  2.  Keyword BM25 returns ranked matches
  3.  Hindi synonym normalization (patrata → eligibility)
  4.  Hinglish normalization (fasal bima → crop insurance)
  5.  Duplicate removal by chunk_id in RRF fusion
  6.  RRF score calculation correctness
  7.  Candidate fusion preserves all metadata fields
  8.  Reranker orders by score descending
  9.  Reranker fallback when model raises exception
  10. Dense-only path when HYBRID_RETRIEVAL_ENABLED=false
  11. Hybrid path produces rrf_score and rerank_score fields
  12. Source diversity: no more than 2 chunks from same (scheme_id, page_number)

Run:
  python3 -m pytest rag/tests/test_hybrid_retrieval.py -v
"""

from __future__ import annotations

import sys
import os
from dataclasses import replace
from typing import List
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest

from retrieval.models import RetrievalCandidate, RetrievalResult
from retrieval.keyword import normalize_query, _tokenize, KeywordRetriever
from retrieval.fusion import rrf_fusion, _apply_source_diversity
from retrieval.dense import parse_pinecone_results


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_candidate(
    chunk_id: str = "c1",
    scheme_id: str = "pm_kisan",
    page: int = 1,
    text: str = "PM-KISAN provides income support to farmers",
    semantic_score: float = 0.75,
) -> RetrievalCandidate:
    return RetrievalCandidate(
        chunk_id=chunk_id,
        chunk_text=text,
        scheme_id=scheme_id,
        scheme_name="PM-KISAN",
        government_level="central",
        state=None,
        document_title="PM-KISAN Guidelines",
        document_type="Operational Guidelines",
        section="Eligibility",
        page_number=page,
        language="en",
        source_url="https://pmkisan.gov.in/docs",
        source_type="official_government",
        published_date="2023",
        last_updated=None,
        document_version=None,
        file_path="/docs/pm_kisan.pdf",
        semantic_score=semantic_score,
        official_source=True,
    )


# ---------------------------------------------------------------------------
# Test 1: Dense score normalization
# ---------------------------------------------------------------------------

class TestDenseScoreNormalization:

    def test_semantic_score_parsed_from_pinecone(self):
        """parse_pinecone_results correctly extracts score from Pinecone match."""
        raw = [{
            "id": "vec_1",
            "score": 0.82,
            "metadata": {
                "chunk_id": "c1",
                "chunk_text": "PM-KISAN eligibility criteria",
                "scheme_id": "pm_kisan",
                "scheme_name": "PM-KISAN",
                "government_level": "central",
                "document_title": "PM-KISAN Guidelines",
                "document_type": "Operational Guidelines",
                "section": "Eligibility",
                "page_number": 3,
                "language": "en",
                "source_url": "https://pmkisan.gov.in",
                "source_type": "official_government",
            },
        }]
        candidates = parse_pinecone_results(raw)
        assert len(candidates) == 1
        assert candidates[0].semantic_score == pytest.approx(0.82)
        assert candidates[0].chunk_id == "c1"
        assert candidates[0].scheme_id == "pm_kisan"
        assert candidates[0].official_source is True

    def test_missing_score_defaults_to_zero(self):
        raw = [{"id": "vec_2", "metadata": {"chunk_id": "c2", "chunk_text": ""}}]
        candidates = parse_pinecone_results(raw)
        assert candidates[0].semantic_score == 0.0


# ---------------------------------------------------------------------------
# Test 2: Keyword BM25 returns ranked matches
# ---------------------------------------------------------------------------

class TestKeywordRetrieval:

    def _make_index(self) -> KeywordRetriever:
        kr = KeywordRetriever()
        corpus = [
            _make_candidate("c1", text="PM-KISAN provides income support eligibility criteria"),
            _make_candidate("c2", text="PMFBY crop insurance premium payment farmers"),
            _make_candidate("c3", text="Kisan Credit Card loan interest subsidy"),
        ]
        kr.build_index(corpus)
        return kr

    def test_keyword_search_returns_results(self):
        kr = self._make_index()
        results = kr.search("PM-KISAN eligibility", top_k=3)
        assert len(results) > 0

    def test_keyword_score_normalized_to_1(self):
        """Top result keyword_score should be 1.0 (normalized)."""
        kr = self._make_index()
        results = kr.search("PM-KISAN eligibility", top_k=3)
        assert results[0].keyword_score == pytest.approx(1.0)

    def test_keyword_rank_set(self):
        kr = self._make_index()
        results = kr.search("PM-KISAN eligibility", top_k=3)
        assert results[0].keyword_rank == 1
        if len(results) > 1:
            assert results[1].keyword_rank == 2

    def test_empty_corpus_returns_empty(self):
        kr = KeywordRetriever()
        results = kr.search("anything", top_k=5)
        assert results == []

    def test_no_matching_query_returns_empty(self):
        kr = self._make_index()
        results = kr.search("xyzzy completely unrelated garbage", top_k=5)
        assert results == []


# ---------------------------------------------------------------------------
# Test 3: Hindi synonym normalization
# ---------------------------------------------------------------------------

class TestHindiSynonymNormalization:

    def test_patrata_maps_to_eligibility(self):
        normalized = normalize_query("PM Kisan ke liye patrata kya hai?")
        assert "eligibility" in normalized.lower()

    def test_labh_maps_to_benefit(self):
        normalized = normalize_query("PM Kisan labh kya hai?")
        assert "benefit" in normalized.lower()

    def test_yojana_maps_to_scheme(self):
        normalized = normalize_query("sarkar ki yojana")
        assert "scheme" in normalized.lower()

    def test_anudan_maps_to_subsidy(self):
        normalized = normalize_query("drip sinchai ke liye anudan")
        assert "subsidy" in normalized.lower()


# ---------------------------------------------------------------------------
# Test 4: Hinglish normalization
# ---------------------------------------------------------------------------

class TestHinglishNormalization:

    def test_fasal_bima_maps_to_crop_insurance(self):
        normalized = normalize_query("fasal bima ke liye kya documents chahiye")
        assert "crop insurance" in normalized.lower()

    def test_beema_maps_to_insurance(self):
        normalized = normalize_query("beema claim kaise milega")
        assert "insurance" in normalized.lower()

    def test_kisan_maps_to_farmer(self):
        normalized = normalize_query("kisan credit card ke liye kaun eligible hai")
        assert "farmer" in normalized.lower()

    def test_scheme_abbreviation_kcc_expanded(self):
        normalized = normalize_query("kcc documents required")
        assert "kisan credit card" in normalized.lower()

    def test_scheme_abbreviation_pmfby_expanded(self):
        normalized = normalize_query("pmfby ke liye apply karo")
        assert "crop insurance" in normalized.lower()


# ---------------------------------------------------------------------------
# Test 5: Duplicate removal by chunk_id in RRF fusion
# ---------------------------------------------------------------------------

class TestDuplicateRemoval:

    def test_same_chunk_id_in_both_appears_once(self):
        """chunk 'c1' appears in both dense and keyword — should appear once in output."""
        dense = [_make_candidate("c1", semantic_score=0.9),
                 _make_candidate("c2", semantic_score=0.8)]
        keyword = [_make_candidate("c1", semantic_score=0.0),
                   _make_candidate("c3", semantic_score=0.0)]
        result = rrf_fusion(dense, keyword, k=60)
        ids = [c.chunk_id for c in result]
        assert ids.count("c1") == 1

    def test_total_unique_candidates(self):
        """3 unique chunk IDs → 3 unique results."""
        dense = [_make_candidate("c1"), _make_candidate("c2")]
        keyword = [_make_candidate("c2"), _make_candidate("c3")]
        result = rrf_fusion(dense, keyword, k=60)
        assert len(result) == 3


# ---------------------------------------------------------------------------
# Test 6: RRF score calculation correctness
# ---------------------------------------------------------------------------

class TestRRFCalculation:

    def test_rrf_score_both_lists(self):
        """Chunk in both lists: rrf = 1/(k+1) + 1/(k+1) = 2/(k+1)"""
        dense = [_make_candidate("c1")]
        keyword = [_make_candidate("c1")]
        result = rrf_fusion(dense, keyword, k=60)
        expected = 1 / (60 + 1) + 1 / (60 + 1)
        assert result[0].rrf_score == pytest.approx(expected, rel=1e-4)

    def test_rrf_score_dense_only(self):
        """Chunk in dense only at rank 2: rrf = 1/(k+2)"""
        dense = [_make_candidate("c0"), _make_candidate("c1")]  # c1 at rank 2
        keyword = []
        result = rrf_fusion(dense, keyword, k=60)
        c1 = next(c for c in result if c.chunk_id == "c1")
        expected = 1 / (60 + 2)
        assert c1.rrf_score == pytest.approx(expected, rel=1e-4)

    def test_chunk_in_both_ranks_higher_than_dense_only(self):
        """Chunk in both lists outranks chunk in only one."""
        dense = [_make_candidate("both"), _make_candidate("dense_only")]
        keyword = [_make_candidate("both")]
        result = rrf_fusion(dense, keyword, k=60)
        ids = [c.chunk_id for c in result]
        assert ids.index("both") < ids.index("dense_only")

    def test_rrf_k_configurable(self):
        """Lower k → higher score differences."""
        dense = [_make_candidate("c1")]
        keyword = [_make_candidate("c1")]
        result_k60 = rrf_fusion(dense, keyword, k=60)
        result_k10 = rrf_fusion(dense, keyword, k=10)
        assert result_k10[0].rrf_score > result_k60[0].rrf_score


# ---------------------------------------------------------------------------
# Test 7: Candidate fusion preserves metadata fields
# ---------------------------------------------------------------------------

class TestMetadataPreservation:

    def test_all_metadata_fields_preserved(self):
        """After fusion, all original metadata fields must be intact."""
        c = _make_candidate("c1", scheme_id="pmfby", page=7, text="PMFBY insurance premium")
        result = rrf_fusion([c], [], k=60)
        assert len(result) == 1
        out = result[0]
        assert out.chunk_id == "c1"
        assert out.scheme_id == "pmfby"
        assert out.page_number == 7
        assert out.chunk_text == "PMFBY insurance premium"
        assert out.document_title == "PM-KISAN Guidelines"
        assert out.source_url == "https://pmkisan.gov.in/docs"
        assert out.government_level == "central"
        assert out.official_source is True

    def test_keyword_score_merged_from_keyword_candidate(self):
        """keyword_score comes from the keyword retriever result."""
        dense_c = _make_candidate("c1")
        keyword_c = replace(_make_candidate("c1"), keyword_score=0.88, keyword_rank=1)
        result = rrf_fusion([dense_c], [keyword_c], k=60)
        assert result[0].keyword_score == pytest.approx(0.88)


# ---------------------------------------------------------------------------
# Test 8: Reranker orders by score descending
# ---------------------------------------------------------------------------

class TestRerankerOrdering:

    def _make_reranker_with_scores(self, scores):
        """Create a CrossEncoderReranker with a mocked model returning given scores."""
        from retrieval.reranker import CrossEncoderReranker
        reranker = CrossEncoderReranker.__new__(CrossEncoderReranker)
        reranker._model_name = "mock"
        reranker._available = True
        mock_model = MagicMock()
        mock_model.predict.return_value = scores
        reranker._model = mock_model
        return reranker

    def test_reranker_sorts_by_score_descending(self):
        import config as cfg
        old = cfg.RERANKER_ENABLED
        try:
            cfg.RERANKER_ENABLED = True
            candidates = [
                _make_candidate("c1"),
                _make_candidate("c2"),
                _make_candidate("c3"),
            ]
            reranker = self._make_reranker_with_scores([0.3, 0.9, 0.6])
            result = reranker.rerank("test query", candidates, top_k=3)
            assert result[0].chunk_id == "c2"
            assert result[1].chunk_id == "c3"
            assert result[2].chunk_id == "c1"
        finally:
            cfg.RERANKER_ENABLED = old

    def test_reranker_sets_final_rank(self):
        import config as cfg
        old = cfg.RERANKER_ENABLED
        try:
            cfg.RERANKER_ENABLED = True
            candidates = [_make_candidate("c1"), _make_candidate("c2")]
            reranker = self._make_reranker_with_scores([0.4, 0.8])
            result = reranker.rerank("test", candidates, top_k=2)
            assert result[0].final_rank == 1
            assert result[1].final_rank == 2
        finally:
            cfg.RERANKER_ENABLED = old

    def test_reranker_truncates_to_top_k(self):
        import config as cfg
        old = cfg.RERANKER_ENABLED
        try:
            cfg.RERANKER_ENABLED = True
            candidates = [_make_candidate(f"c{i}") for i in range(5)]
            reranker = self._make_reranker_with_scores([0.1, 0.2, 0.9, 0.5, 0.3])
            result = reranker.rerank("test", candidates, top_k=3)
            assert len(result) == 3
        finally:
            cfg.RERANKER_ENABLED = old


# ---------------------------------------------------------------------------
# Test 9: Reranker fallback when model raises exception
# ---------------------------------------------------------------------------

class TestRerankerFallback:

    def test_fallback_to_rrf_order_on_exception(self):
        """When scoring raises, return candidates sorted by rrf_score."""
        from retrieval.reranker import CrossEncoderReranker
        reranker = CrossEncoderReranker.__new__(CrossEncoderReranker)
        reranker._model_name = "mock"
        reranker._available = True
        mock_model = MagicMock()
        mock_model.predict.side_effect = RuntimeError("GPU OOM")
        reranker._model = mock_model

        with patch.object(reranker, "_model", mock_model):
            candidates = [
                replace(_make_candidate("c1"), rrf_score=0.9),
                replace(_make_candidate("c2"), rrf_score=0.5),
                replace(_make_candidate("c3"), rrf_score=0.7),
            ]
            result = reranker.rerank("test", candidates, top_k=3)

        # Should return sorted by rrf_score: c1 > c3 > c2
        assert result[0].chunk_id == "c1"
        assert result[1].chunk_id == "c3"
        assert result[2].chunk_id == "c2"

    def test_unavailable_reranker_returns_rrf_order(self):
        """If _available=False, return RRF-sorted candidates."""
        from retrieval.reranker import CrossEncoderReranker
        import config as cfg
        old = cfg.RERANKER_ENABLED
        try:
            cfg.RERANKER_ENABLED = True
            reranker = CrossEncoderReranker.__new__(CrossEncoderReranker)
            reranker._available = False
            reranker._model = None

            candidates = [
                replace(_make_candidate("c1"), rrf_score=0.1),
                replace(_make_candidate("c2"), rrf_score=0.9),
            ]
            result = reranker.rerank("test", candidates, top_k=2)
            assert result[0].chunk_id == "c2"
        finally:
            cfg.RERANKER_ENABLED = old


# ---------------------------------------------------------------------------
# Test 10: Dense-only path when HYBRID_RETRIEVAL_ENABLED=false
# ---------------------------------------------------------------------------

class TestDenseOnlyBackwardCompat:

    def test_dense_only_path_calls_dense_retrieve(self):
        """When HYBRID_RETRIEVAL_ENABLED=False, _hybrid_retrieve is NOT called."""
        import config as cfg
        from retrieval.retriever import KnowledgeRetriever

        old = cfg.HYBRID_RETRIEVAL_ENABLED
        try:
            cfg.HYBRID_RETRIEVAL_ENABLED = False
            retriever = KnowledgeRetriever()

            # Mock the dense path
            mock_result = RetrievalResult(
                query="test", intent="general_information", language="en",
                applied_filters={}, query_understanding={},
                results=[], candidate_count=0, final_count=0,
            )

            with patch.object(retriever, "_dense_retrieve", return_value=mock_result) as mock_dense, \
                 patch.object(retriever, "_hybrid_retrieve") as mock_hybrid:

                retriever.retrieve("test query")
                mock_dense.assert_called_once()
                mock_hybrid.assert_not_called()
        finally:
            cfg.HYBRID_RETRIEVAL_ENABLED = old


# ---------------------------------------------------------------------------
# Test 11: Hybrid path produces rrf_score and rerank_score fields
# ---------------------------------------------------------------------------

class TestHybridScoreFields:

    def test_rrf_score_set_after_fusion(self):
        """After rrf_fusion, all candidates have rrf_score > 0."""
        dense = [_make_candidate("c1"), _make_candidate("c2")]
        keyword = [_make_candidate("c2"), _make_candidate("c3")]
        result = rrf_fusion(dense, keyword, k=60)
        for c in result:
            assert c.rrf_score > 0.0

    def test_rerank_score_set_after_reranking(self):
        """After reranking, rerank_score is set on each candidate."""
        import config as cfg
        old = cfg.RERANKER_ENABLED
        try:
            cfg.RERANKER_ENABLED = True
            from retrieval.reranker import CrossEncoderReranker
            reranker = CrossEncoderReranker.__new__(CrossEncoderReranker)
            reranker._model_name = "mock"
            reranker._available = True
            mock_model = MagicMock()
            mock_model.predict.return_value = [0.7, 0.4]
            reranker._model = mock_model

            candidates = [_make_candidate("c1"), _make_candidate("c2")]
            result = reranker.rerank("test", candidates, top_k=2)
            assert all(c.rerank_score != 0.0 for c in result)
        finally:
            cfg.RERANKER_ENABLED = old


# ---------------------------------------------------------------------------
# Test 12: Source diversity behavior
# ---------------------------------------------------------------------------

class TestSourceDiversity:

    def test_no_more_than_2_chunks_from_same_page(self):
        """_apply_source_diversity limits (scheme_id, page_number) to max_per_page=2."""
        candidates = [
            _make_candidate("c1", scheme_id="pm_kisan", page=1),
            _make_candidate("c2", scheme_id="pm_kisan", page=1),
            _make_candidate("c3", scheme_id="pm_kisan", page=1),  # 3rd on same page → overflow
            _make_candidate("c4", scheme_id="pmfby", page=1),
        ]
        result = _apply_source_diversity(candidates, max_per_page=2)
        # c1 and c2 from (pm_kisan, page1) in primary; c3 moved to end
        primary_ids = [c.chunk_id for c in result[:3]]
        assert "c1" in primary_ids
        assert "c2" in primary_ids
        assert "c4" in primary_ids
        # c3 is last (overflow)
        assert result[-1].chunk_id == "c3"

    def test_different_pages_not_limited(self):
        """Chunks from the same scheme but different pages are NOT capped."""
        candidates = [
            _make_candidate("c1", scheme_id="pm_kisan", page=1),
            _make_candidate("c2", scheme_id="pm_kisan", page=2),
            _make_candidate("c3", scheme_id="pm_kisan", page=3),
        ]
        result = _apply_source_diversity(candidates, max_per_page=2)
        # All 3 are on different pages → all in primary
        assert len(result) == 3
        primary_ids = [c.chunk_id for c in result]
        assert "c1" in primary_ids
        assert "c2" in primary_ids
        assert "c3" in primary_ids

    def test_relevance_preserved_in_overflow(self):
        """The overflow candidates are appended after primary, not discarded."""
        candidates = [
            _make_candidate("c1", scheme_id="pm_kisan", page=1),
            _make_candidate("c2", scheme_id="pm_kisan", page=1),
            _make_candidate("c3", scheme_id="pm_kisan", page=1),
        ]
        result = _apply_source_diversity(candidates, max_per_page=2)
        assert len(result) == 3  # overflow appended, not dropped
        assert result[-1].chunk_id == "c3"
