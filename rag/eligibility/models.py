"""
rag/eligibility/models.py — Data models for the eligibility and recommendation engine.

Design:
- EligibilityFarmerProfile extends the retrieval FarmerProfile with 9 additional fields.
- All models use dataclasses with .to_dict() — no Pydantic dependency.
- Unit normalization is built in (acre ↔ hectare). Bigha raises UnitConversionError.
- Three eligibility states: ELIGIBLE | INELIGIBLE | INSUFFICIENT_INFORMATION.
- Every rule condition carries evidence (chunk_id, page, source_url).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Eligibility status
# ---------------------------------------------------------------------------

class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"
    INSUFFICIENT_INFORMATION = "INSUFFICIENT_INFORMATION"


# ---------------------------------------------------------------------------
# Unit conversion
# ---------------------------------------------------------------------------

HECTARE_TO_ACRE = 2.47105

# Bigha varies by region — we never assume a universal conversion.
# State-specific bigha rates can be configured here if added later.
_BIGHA_TO_ACRE: Dict[str, float] = {
    # Example: "uttar_pradesh": 0.625  — add when officially confirmed
}


class UnitConversionError(ValueError):
    """Raised when a unit cannot be reliably converted."""


def to_acres(size: float, unit: str, state: Optional[str] = None) -> float:
    """Convert land size to acres. Raises UnitConversionError for bigha without known rate."""
    u = (unit or "").lower().rstrip("s")  # "acres" → "acre", "hectares" → "hectare"
    if u in ("acre",):
        return size
    if u in ("hectare",):
        return size * HECTARE_TO_ACRE
    if u in ("bigha",):
        state_key = (state or "").lower().replace(" ", "_")
        rate = _BIGHA_TO_ACRE.get(state_key)
        if rate is None:
            raise UnitConversionError(
                f"Bigha conversion for state '{state}' is not configured. "
                "Please provide land size in acres or hectares."
            )
        return size * rate
    raise UnitConversionError(f"Unknown land unit: '{unit}'. Supported: acre, hectare.")


def to_hectares(size: float, unit: str, state: Optional[str] = None) -> float:
    return to_acres(size, unit, state) / HECTARE_TO_ACRE


# ---------------------------------------------------------------------------
# Extended farmer profile for eligibility
# ---------------------------------------------------------------------------

@dataclass
class EligibilityFarmerProfile:
    """
    Full farmer profile for eligibility evaluation.

    All fields are optional — the system works with whatever is provided.
    Never infer sensitive information that wasn't explicitly stated.
    """
    # Location
    state: Optional[str] = None
    district: Optional[str] = None

    # Land
    land_size: Optional[float] = None
    land_unit: Optional[str] = None          # "acre" | "hectare" | "bigha"
    land_ownership: Optional[str] = None     # "owned" | "leased" | "sharecropping"
    land_size_acres: Optional[float] = None  # computed, if convertible

    # Crops
    crop: Optional[str] = None               # primary crop
    crops: Optional[List[str]] = None        # all crops

    # Farmer classification
    farmer_type: Optional[str] = None        # "small_farmer" | "marginal_farmer" | "large_farmer"
    irrigation_type: Optional[str] = None    # "irrigated" | "rainfed" | "drip" | etc.

    # Social
    social_category: Optional[str] = None    # "SC" | "ST" | "OBC" | "general"
    gender: Optional[str] = None
    age: Optional[int] = None

    # Documents / eligibility markers
    bank_account: Optional[bool] = None      # has linked bank account
    aadhaar_available: Optional[bool] = None
    kisan_credit_card: Optional[bool] = None
    crop_insurance_status: Optional[str] = None  # "insured" | "not_insured"

    def __post_init__(self) -> None:
        # Auto-compute land_size_acres from land_size + land_unit if possible
        if self.land_size and self.land_unit and self.land_size_acres is None:
            try:
                self.land_size_acres = to_acres(self.land_size, self.land_unit, self.state)
            except UnitConversionError:
                pass  # bigha without known rate — leave as None

        # Normalise crops list
        if self.crop and not self.crops:
            self.crops = [self.crop]
        elif self.crops and not self.crop:
            self.crop = self.crops[0]

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "EligibilityFarmerProfile":
        return cls(
            state=d.get("state"),
            district=d.get("district"),
            land_size=d.get("land_size"),
            land_unit=d.get("land_unit"),
            land_ownership=d.get("land_ownership"),
            crop=d.get("crop"),
            crops=d.get("crops"),
            farmer_type=d.get("farmer_type"),
            irrigation_type=d.get("irrigation_type"),
            social_category=d.get("social_category"),
            gender=d.get("gender"),
            age=d.get("age"),
            bank_account=d.get("bank_account"),
            aadhaar_available=d.get("aadhaar_available"),
            kisan_credit_card=d.get("kisan_credit_card"),
            crop_insurance_status=d.get("crop_insurance_status"),
        )

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}

    def to_base_profile(self):
        """Convert to retrieval-layer FarmerProfile for existing retriever compatibility."""
        from rag.retrieval.models import FarmerProfile
        return FarmerProfile(
            state=self.state,
            district=self.district,
            crop=self.crop,
            land_size=self.land_size,
            land_unit=self.land_unit,
            farmer_type=self.farmer_type,
        )


# ---------------------------------------------------------------------------
# Eligibility rule models
# ---------------------------------------------------------------------------

@dataclass
class RuleEvidence:
    """Traceable evidence for a single extracted rule."""
    chunk_id: str
    page_number: int
    source_url: str
    document_title: str
    section: str
    raw_text: str  # the exact text from which this rule was extracted

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class EligibilityCondition:
    """
    A single testable eligibility condition extracted from a government document.

    field:    the FarmerProfile field to test (e.g. "land_size_acres", "state")
    operator: one of the SUPPORTED_OPERATORS
    value:    the threshold / reference value from the document
    unit:     unit for numeric comparisons (already normalised to acres/hectares)
    logic:    "AND" or "OR" with sibling conditions
    confidence: how confident the LLM was in extracting this condition (0–1)
    evidence: traceable chunk/page/url
    """
    field: str
    operator: str
    value: Any
    unit: Optional[str] = None
    logic: str = "AND"   # how this condition combines with its siblings
    confidence: float = 1.0
    evidence: Optional[RuleEvidence] = None
    human_readable: str = ""  # e.g. "land_size <= 5 acres"

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d


SUPPORTED_OPERATORS = {
    "equals", "not_equals",
    "greater_than", "greater_than_or_equal",
    "less_than", "less_than_or_equal",
    "contains", "one_of",
    "exists", "not_exists",
}


@dataclass
class EligibilityRule:
    """
    Complete eligibility rule for one scheme, extracted from retrieved documents.
    """
    scheme_id: str
    scheme_name: str
    conditions: List[EligibilityCondition] = field(default_factory=list)
    logic: str = "AND"           # top-level: how conditions combine
    confidence: float = 1.0      # overall rule confidence
    conflict_warning: Optional[str] = None  # set if conflicting versions found

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Evaluation result models
# ---------------------------------------------------------------------------

@dataclass
class ConditionResult:
    """Result of evaluating a single condition against a farmer profile."""
    condition: EligibilityCondition
    status: EligibilityStatus
    farmer_value: Optional[Any]  # what the farmer's profile had
    reason: str  # human-readable explanation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "condition": self.condition.human_readable or str(self.condition.field),
            "operator": self.condition.operator,
            "expected": self.condition.value,
            "farmer_value": self.farmer_value,
            "status": self.status.value,
            "reason": self.reason,
            "evidence": self.condition.evidence.to_dict() if self.condition.evidence else None,
        }


@dataclass
class EligibilityResult:
    """
    Eligibility evaluation result for one scheme.

    status values:
      ELIGIBLE              — all conditions verified
      INELIGIBLE            — at least one condition definitively failed
      INSUFFICIENT_INFORMATION — at least one required field is missing
    """
    scheme_id: str
    scheme_name: str
    government_level: str
    status: EligibilityStatus
    matched_conditions: List[ConditionResult] = field(default_factory=list)
    failed_conditions: List[ConditionResult] = field(default_factory=list)
    missing_information: List[str] = field(default_factory=list)
    evidence: List[RuleEvidence] = field(default_factory=list)
    conflict_warning: Optional[str] = None
    rules_used: int = 0
    explanation: str = ""  # farmer-friendly summary

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "government_level": self.government_level,
            "status": self.status.value,
            "matched_conditions": [c.to_dict() for c in self.matched_conditions],
            "failed_conditions": [c.to_dict() for c in self.failed_conditions],
            "missing_information": self.missing_information,
            "evidence": [e.to_dict() for e in self.evidence],
            "conflict_warning": self.conflict_warning,
            "rules_used": self.rules_used,
            "explanation": self.explanation,
        }


# ---------------------------------------------------------------------------
# Recommendation models
# ---------------------------------------------------------------------------

@dataclass
class SchemeRecommendation:
    """A recommended scheme with scoring transparency."""
    scheme_id: str
    scheme_name: str
    government_level: str          # "central" | "state"
    state: Optional[str]           # relevant state (None for central)
    relevance_score: float         # 0.0 – 1.0
    eligibility_status: EligibilityStatus
    reasons: List[str] = field(default_factory=list)   # evidence-grounded reasons
    sources: List[Dict[str, Any]] = field(default_factory=list)  # citation info
    score_breakdown: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "government_level": self.government_level,
            "state": self.state,
            "relevance_score": round(self.relevance_score, 4),
            "eligibility_status": self.eligibility_status.value,
            "reasons": self.reasons,
            "sources": self.sources,
            "score_breakdown": {k: round(v, 4) for k, v in self.score_breakdown.items()},
        }


@dataclass
class EligibilityResponse:
    """Full response for POST /api/rag/eligibility."""
    query: str
    language: str
    farmer_profile: Dict[str, Any]
    results: List[EligibilityResult] = field(default_factory=list)
    follow_up_questions: List[str] = field(default_factory=list)
    latency_ms: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "language": self.language,
            "farmer_profile": self.farmer_profile,
            "results": [r.to_dict() for r in self.results],
            "follow_up_questions": self.follow_up_questions,
            "latency_ms": self.latency_ms,
        }


@dataclass
class RecommendationResponse:
    """Full response for POST /api/rag/recommend."""
    farmer_profile: Dict[str, Any]
    recommendations: List[SchemeRecommendation] = field(default_factory=list)
    central_schemes: List[SchemeRecommendation] = field(default_factory=list)
    state_schemes: List[SchemeRecommendation] = field(default_factory=list)
    follow_up_questions: List[str] = field(default_factory=list)
    latency_ms: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "farmer_profile": self.farmer_profile,
            "recommendations": [r.to_dict() for r in self.recommendations],
            "central_schemes": [r.to_dict() for r in self.central_schemes],
            "state_schemes": [r.to_dict() for r in self.state_schemes],
            "follow_up_questions": self.follow_up_questions,
            "latency_ms": self.latency_ms,
        }
