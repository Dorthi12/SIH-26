"""
rag/generation/models.py — Data models for the generation layer.

All models use plain dataclasses with .to_dict() for JSON serialisation.
No Pydantic dependency — consistent with retrieval layer models.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Scheme info
# ---------------------------------------------------------------------------

@dataclass
class SchemeInfo:
    """A government scheme identified as relevant in the answer."""
    scheme_id: str
    scheme_name: str
    relevance: str            # "high" | "medium" | "low"
    reason: str               # grounded reason from retrieved text

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Source citation
# ---------------------------------------------------------------------------

@dataclass
class SourceCitation:
    """A traceable citation from the retrieved document metadata."""
    source_id: str            # e.g. "source_1"
    document_title: str
    scheme_name: str
    scheme_id: str
    page_number: int
    section: str
    source_url: str
    official_source: bool
    government_level: str
    published_date: Optional[str]
    document_version: Optional[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Retrieval metadata summary
# ---------------------------------------------------------------------------

@dataclass
class RetrievalMeta:
    """Summary of the retrieval phase for observability."""
    documents_considered: int
    top_score: float
    min_score_threshold: float
    used_fallback: bool         # True if LLM was not called (low confidence)
    context_chunks_used: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Final generation result
# ---------------------------------------------------------------------------

@dataclass
class GenerationResult:
    """Full structured response from the RAG generation layer."""
    answer: str
    language: str
    schemes: List[SchemeInfo] = field(default_factory=list)
    sources: List[SourceCitation] = field(default_factory=list)
    follow_up_questions: List[str] = field(default_factory=list)
    retrieval: Optional[RetrievalMeta] = None
    model_used: str = ""
    latency_ms: int = 0

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d


# ---------------------------------------------------------------------------
# Safe fallback constants
# ---------------------------------------------------------------------------

SAFE_FALLBACK_ANSWERS = {
    "en": (
        "I couldn't find sufficient information in the available official government documents "
        "to answer this reliably.\n\n"
        "Please check the official portal: https://agricoop.nic.in or "
        "https://pmkisan.gov.in for the most up-to-date information."
    ),
    "hi": (
        "उपलब्ध आधिकारिक सरकारी दस्तावेज़ों में इस प्रश्न का उत्तर देने के लिए पर्याप्त जानकारी नहीं मिली।\n\n"
        "कृपया आधिकारिक पोर्टल देखें: https://agricoop.nic.in या https://pmkisan.gov.in"
    ),
    "hinglish": (
        "Available official government documents mein is sawaal ka jawab dene ke liye "
        "kaafi information nahi mili.\n\n"
        "Kripya official portal check karein: https://agricoop.nic.in ya https://pmkisan.gov.in"
    ),
}
