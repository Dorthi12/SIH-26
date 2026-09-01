"""
rag/retrieval/keyword.py — BM25 keyword retrieval with Hindi/Hinglish normalization.

Architecture
------------
1. At startup, build an in-memory BM25 index over all corpus chunks.
   Chunks are loaded from Pinecone by fetching stored metadata.
2. For each query, normalize Hindi/Hinglish terms to English equivalents,
   then run BM25Okapi.get_scores() to rank all chunks.
3. Return top-K candidates with keyword_score populated.

Design decisions
----------------
- BM25Okapi (Robertson BM25) — standard, no tuning needed for this corpus.
- Synonym map is small and hardcoded; it is NOT a translation engine.
  The dense retriever handles deep multilingual understanding.
- Index is built once per process and cached as a module-level singleton.
- Tokenization: simple whitespace + punctuation split, lowercase.

Public API
----------
get_keyword_retriever()                          → KeywordRetriever (singleton)
retriever.search(query, top_k)                   → list[RetrievalCandidate]
retriever.build_index(candidates)                → None (rebuild from list)
retriever.corpus_size                            → int
"""

from __future__ import annotations

import logging
import re
import time
from typing import List, Optional

from rank_bm25 import BM25Okapi

from retrieval.models import RetrievalCandidate

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Hindi / Hinglish synonym normalization
# ---------------------------------------------------------------------------

# Maps common Hindi/Hinglish terms to their English equivalents in the corpus.
# This is intentionally small — dense retrieval handles deep semantics.
# Add entries freely; order does not matter.
_HINDI_SYNONYMS: dict[str, str] = {
    # Eligibility
    "patrata": "eligibility",
    "patra": "eligible",
    "yogya": "eligible",
    "yogyata": "eligibility",
    "adhikar": "entitled",

    # Farmer / land
    "kisan": "farmer",
    "krishak": "farmer",
    "bhoomi": "land",
    "bhumi": "land",
    "zameen": "land",
    "jamin": "land",
    "kheti": "agriculture farming",
    "khata": "account",

    # Benefits
    "labh": "benefit",
    "laabh": "benefit",
    "fayda": "benefit",
    "rakam": "amount",
    "rashi": "amount",
    "paisa": "money payment",
    "dhan": "money",

    # Insurance / crop
    "bima": "insurance",
    "beema": "insurance",
    "fasal bima": "crop insurance",
    "fasal": "crop",
    "phasal": "crop",
    "annadata": "farmer",

    # Compensation / claims
    "muawza": "compensation",
    "muavza": "compensation",
    "nuksaan": "loss damage",
    "nuksaan bhaarpai": "compensation",
    "dawa": "claim",
    "dawaa": "claim",

    # Application / documents
    "avedan": "application",
    "aavedan": "application",
    "apply karo": "application",
    "apply karein": "application",
    "dastavej": "document",
    "kagaj": "document",
    "praman": "proof certificate",
    "pramaan patra": "certificate",
    "adhaar": "aadhaar identity",

    # Subsidy / support
    "anudan": "subsidy",
    "sahayata": "assistance support",
    "madad": "help assistance",
    "vittiiya": "financial",
    "artik": "financial",

    # Schemes / government
    "yojana": "scheme",
    "sarkar": "government",
    "sarkari": "government",
    "kendriya": "central",
    "rajya": "state",
    "vibhag": "department ministry",

    # Water / irrigation
    "sinchai": "irrigation",
    "paani": "water",
    "jal": "water",

    # Soil / health
    "mitti": "soil",
    "mittti jaanch": "soil health testing",

    # States (Hindi names)
    "uttar pradesh": "uttar pradesh up",
    "maharashtra": "maharashtra",
    "punjab": "punjab",
    "haryana": "haryana",
    "rajasthan": "rajasthan",

    # Common query particles (map to empty to avoid noise)
    "kya": "",
    "kaise": "",
    "kab": "",
    "kaun": "",
    "kyun": "",
    "kitna": "",
    "ke liye": "",
    "mein": "",
    "aur": "",
    "bhi": "",
    "hai": "",
    "hain": "",
    "ho": "",
    "kar": "",
}

# Scheme name aliases — exact matching for abbreviations
_SCHEME_ALIASES: dict[str, str] = {
    "pmkisan": "pm-kisan pm kisan",
    "pm kisan": "pm-kisan",
    "pmfby": "pradhan mantri fasal bima yojana crop insurance",
    "fasal bima yojana": "pmfby crop insurance",
    "kcc": "kisan credit card",
    "kisan credit": "kisan credit card kcc",
    "pmksy": "pradhan mantri krishi sinchai yojana irrigation",
    "smam": "sub-mission agricultural mechanization tractor",
    "aif": "agriculture infrastructure fund",
    "rkvy": "rashtriya krishi vikas yojana agriculture development",
    "soil health card": "soil health card mitti jaanch",
    "shc": "soil health card",
}


def _tokenize(text: str) -> List[str]:
    """Lowercase, remove punctuation, split on whitespace."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    tokens = text.split()
    return [t for t in tokens if len(t) > 1]


def normalize_query(query: str) -> str:
    """
    Normalize a farmer query for BM25 keyword matching.

    1. Apply Hindi/Hinglish → English synonym substitution.
    2. Apply scheme abbreviation expansion.
    3. Return the normalized string (original terms preserved + expansions appended).

    The dense retriever handles deep multilingual semantics; this layer
    only ensures common Hindi/Hinglish terms map to indexed English vocabulary.
    """
    normalized = query.lower()

    # Multi-word synonyms first (longer matches take priority)
    sorted_synonyms = sorted(_HINDI_SYNONYMS.items(), key=lambda x: -len(x[0]))
    for hindi, english in sorted_synonyms:
        if hindi and english and hindi in normalized:
            normalized = normalized.replace(hindi, " " + english + " ")

    # Scheme aliases
    for alias, expansion in _SCHEME_ALIASES.items():
        if alias in normalized:
            normalized = normalized + " " + expansion

    # Collapse whitespace
    normalized = re.sub(r"\s+", " ", normalized).strip()
    log.debug("Keyword query normalized: %r → %r", query[:40], normalized[:80])
    return normalized


# ---------------------------------------------------------------------------
# BM25 keyword retriever
# ---------------------------------------------------------------------------

class KeywordRetriever:
    """
    In-memory BM25 retriever over the full corpus of indexed chunks.

    The index is built from a list of RetrievalCandidate objects.
    Chunk texts are tokenized and indexed. BM25 scores are normalized
    to [0, 1] by dividing by the maximum score in the result set.
    """

    def __init__(self) -> None:
        self._index: Optional[BM25Okapi] = None
        self._corpus: List[RetrievalCandidate] = []
        self._tokenized_corpus: List[List[str]] = []

    @property
    def corpus_size(self) -> int:
        return len(self._corpus)

    def build_index(self, candidates: List[RetrievalCandidate]) -> None:
        """
        Build or rebuild the BM25 index from a list of RetrievalCandidates.

        Called once at startup after fetching all chunks from Pinecone.
        May be called again if corpus changes (e.g. after re-ingestion).
        """
        if not candidates:
            log.warning("KeywordRetriever.build_index: empty corpus — keyword retrieval disabled")
            self._index = None
            self._corpus = []
            return

        t_start = time.perf_counter()
        self._corpus = candidates
        self._tokenized_corpus = [_tokenize(c.chunk_text) for c in candidates]
        self._index = BM25Okapi(self._tokenized_corpus)
        elapsed_ms = int((time.perf_counter() - t_start) * 1000)
        log.info(
            "KeywordRetriever: indexed %d chunks in %dms",
            len(candidates), elapsed_ms,
        )

    def search(
        self,
        query: str,
        top_k: int = 20,
    ) -> List[RetrievalCandidate]:
        """
        Return top-K candidates ranked by BM25 score.

        Parameters
        ----------
        query  : Raw query (Hindi/Hinglish/English). Normalization applied internally.
        top_k  : Maximum number of results to return.

        Returns
        -------
        list[RetrievalCandidate] with keyword_score and keyword_rank set.
        Returns [] if index is not built or BM25 scores all zero.
        """
        if self._index is None or not self._corpus:
            log.debug("KeywordRetriever: no index — returning empty results")
            return []

        normalized = normalize_query(query)
        tokens = _tokenize(normalized)
        if not tokens:
            return []

        t_start = time.perf_counter()
        scores = self._index.get_scores(tokens)
        elapsed_ms = int((time.perf_counter() - t_start) * 1000)
        log.debug("BM25 scoring: %dms for %d chunks", elapsed_ms, len(self._corpus))

        # Get indices sorted by score descending
        indexed = sorted(enumerate(scores), key=lambda x: -x[1])

        # Filter zero scores (no keyword overlap)
        nonzero = [(idx, score) for idx, score in indexed if score > 0]

        if not nonzero:
            return []

        # Normalize scores to [0, 1]
        max_score = nonzero[0][1]
        if max_score == 0:
            return []

        results: List[RetrievalCandidate] = []
        for rank, (idx, raw_score) in enumerate(nonzero[:top_k], start=1):
            c = self._corpus[idx]
            # Return a copy with keyword scores populated
            from dataclasses import replace
            c_copy = replace(
                c,
                keyword_score=raw_score / max_score,
                keyword_rank=rank,
            )
            results.append(c_copy)

        log.info(
            "Keyword: BM25 returned %d results (top score=%.4f) for: %r",
            len(results), nonzero[0][1] if nonzero else 0, query[:60],
        )
        return results


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_keyword_retriever_instance: Optional[KeywordRetriever] = None


def get_keyword_retriever() -> KeywordRetriever:
    """Return the shared KeywordRetriever instance."""
    global _keyword_retriever_instance
    if _keyword_retriever_instance is None:
        _keyword_retriever_instance = KeywordRetriever()
    return _keyword_retriever_instance
