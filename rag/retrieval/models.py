"""
rag/retrieval/models.py — Data models for the retrieval layer.

All models use dataclasses so they work without Pydantic installed,
but also expose a .to_dict() for easy JSON serialisation in the API.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Intent type registry
# ---------------------------------------------------------------------------

# Extensible: add new intents here without touching detection logic.
SUPPORTED_INTENTS = {
    "scheme_recommendation",
    "eligibility",
    "benefits",
    "application_process",
    "required_documents",
    "crop_insurance",
    "financial_assistance",
    "subsidy",
    "crop_loss_assistance",
    "grievance",
    "deadline",
    "general_information",
}

LANGUAGE_CODES = {"en", "hi", "hinglish"}


# ---------------------------------------------------------------------------
# Farmer Profile
# ---------------------------------------------------------------------------

@dataclass
class FarmerProfile:
    """
    Optional structured profile provided by the caller.
    Fields here take precedence over query-inferred values.
    """
    state: Optional[str] = None          # e.g. "Uttar Pradesh"
    district: Optional[str] = None       # e.g. "Prayagraj"
    crop: Optional[str] = None           # e.g. "wheat"
    land_size: Optional[float] = None    # numeric value
    land_unit: Optional[str] = None      # "acre" | "hectare" | "bigha"
    farmer_type: Optional[str] = None    # "small_farmer" | "marginal_farmer" | ...

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "FarmerProfile":
        return cls(
            state=d.get("state"),
            district=d.get("district"),
            crop=d.get("crop"),
            land_size=d.get("land_size"),
            land_unit=d.get("land_unit"),
            farmer_type=d.get("farmer_type"),
        )

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


# ---------------------------------------------------------------------------
# Query Understanding
# ---------------------------------------------------------------------------

@dataclass
class QueryUnderstanding:
    """
    Structured output from the query-understanding component.
    All fields that could not be reliably extracted are None.
    Nothing is fabricated.
    """
    raw_query: str
    language: str = "en"              # "en" | "hi" | "hinglish"
    intent: str = "general_information"

    # Extracted entities (None = not found in query)
    state: Optional[str] = None           # human-readable, e.g. "Uttar Pradesh"
    state_slug: Optional[str] = None      # slug for filtering, e.g. "uttar_pradesh"
    district: Optional[str] = None
    crop: Optional[str] = None
    scheme_name: Optional[str] = None     # human-readable
    scheme_id: Optional[str] = None       # slug, e.g. "pm_kisan"
    land_size: Optional[float] = None
    land_unit: Optional[str] = None
    farmer_type: Optional[str] = None
    cause: Optional[str] = None           # e.g. "heavy_rain", "drought"

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


# ---------------------------------------------------------------------------
# Retrieval Result
# ---------------------------------------------------------------------------

@dataclass
class RetrievalCandidate:
    """A single ranked chunk from Pinecone with computed score."""
    chunk_id: str
    chunk_text: str
    scheme_id: str
    scheme_name: str
    government_level: str
    state: Optional[str]
    document_title: str
    document_type: str
    section: str
    page_number: int
    language: str
    source_url: str
    source_type: str
    published_date: Optional[str]
    last_updated: Optional[str]
    document_version: Optional[str]
    file_path: str

    # Scores
    semantic_score: float = 0.0      # raw Pinecone cosine score
    final_score: float = 0.0         # after bonus adjustments
    score_breakdown: Dict[str, float] = field(default_factory=dict)

    # Convenience
    official_source: bool = False

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d


@dataclass
class RetrievalResult:
    """Full response from the retrieval layer."""
    query: str
    intent: str
    language: str
    applied_filters: Dict[str, Any]
    query_understanding: Dict[str, Any]
    results: List[RetrievalCandidate]
    candidate_count: int   # how many Pinecone candidates were fetched before ranking
    final_count: int       # how many results after ranking + deduplication

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "intent": self.intent,
            "language": self.language,
            "applied_filters": self.applied_filters,
            "query_understanding": self.query_understanding,
            "candidate_count": self.candidate_count,
            "final_count": self.final_count,
            "results": [r.to_dict() for r in self.results],
        }
