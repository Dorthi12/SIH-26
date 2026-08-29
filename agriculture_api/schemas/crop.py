"""
crop.py — Pydantic schemas for the Crop Recommendation Engine (Model 2).
"""

from typing import Optional
from pydantic import BaseModel, Field

from core.config import DEFAULT_CROP_TOP_K, MAX_CROP_TOP_K


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class RecommendRequest(BaseModel):
    state:    str = Field(..., min_length=1, description="Indian state name (e.g. Bihar)")
    district: str = Field(..., min_length=1, description="District name (e.g. Gaya)")
    season:   str = Field(..., min_length=1, description="Crop season (e.g. Kharif, Rabi, Whole Year)")
    top_k:    int = Field(DEFAULT_CROP_TOP_K, ge=1, le=MAX_CROP_TOP_K,
                          description="Number of top crops to return (1–20)")

    model_config = {
        "json_schema_extra": {
            "example": {"state": "Bihar", "district": "Gaya", "season": "Kharif", "top_k": 5}
        }
    }


class ScoreCropRequest(BaseModel):
    state:    str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    season:   str = Field(..., min_length=1)
    crop:     str = Field(..., min_length=1, description="Specific crop to score (e.g. Rice)")

    model_config = {
        "json_schema_extra": {
            "example": {"state": "Bihar", "district": "Gaya", "season": "Kharif", "crop": "Rice"}
        }
    }


class BatchRecommendRequest(BaseModel):
    requests: list[RecommendRequest] = Field(
        ..., min_length=1, max_length=20,
        description="List of recommendation requests (max 20)"
    )


# ---------------------------------------------------------------------------
# Sub-schemas
# ---------------------------------------------------------------------------

class HistoricalFeatures(BaseModel):
    median_yield:     float
    mean_yield:       float
    max_yield:        float
    min_yield:        float
    yield_std:        float
    mean_area:        float
    years_cultivated: int
    yield_cv:         float


class ScoreBreakdownItem(BaseModel):
    score:        float
    weight:       float
    contribution: float
    description:  str


class ScoreBreakdown(BaseModel):
    yield_score:      ScoreBreakdownItem
    stability_score:  ScoreBreakdownItem
    experience_score: ScoreBreakdownItem
    formula:          str


class DataQuality(BaseModel):
    historical_years:     int
    history_quality:      str   # "strong" | "moderate" | "limited"
    has_sufficient_history: bool


class CropRecommendation(BaseModel):
    rank:               int
    crop:               str
    historical_score:   float = Field(..., description="Composite score: 0.5×yield + 0.3×stability + 0.2×experience")
    score_percent:      float = Field(..., description="historical_score × 100 — display only, not a probability")
    yield_score:        float
    stability_score:    float
    experience_score:   float
    stability_label:    str   = Field(..., description="High / Medium / Low")
    trend_label:        str   = Field(..., description="Improving / Stable / Declining")
    historical_features: HistoricalFeatures
    score_breakdown:    ScoreBreakdown
    data_quality:       DataQuality


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class RecommendResponse(BaseModel):
    success:          bool = True
    model_name:       str
    model_version:    str
    request:          dict
    candidate_count:  int
    returned_count:   int
    recommendations:  list[CropRecommendation]


class ScoreCropResponse(BaseModel):
    success:     bool = True
    model_name:  str
    model_version: str
    request:     dict
    found:       bool
    recommendation: Optional[CropRecommendation] = None
    message:     Optional[str] = None
    available_crops: Optional[list[str]] = None


class BatchRecommendResponse(BaseModel):
    success: bool = True
    results: list[dict]   # list of RecommendResponse dicts


class CropHealthResponse(BaseModel):
    status:          str
    model_name:      str
    model_version:   str
    records_loaded:  int
    artifacts_ready: bool


class CropModelInfoResponse(BaseModel):
    model_name:       str
    model_version:    str
    model_type:       str
    default_top_k:    int
    max_top_k:        int
    score_weights:    dict
    scoring_formula:  str
    features:         list[str]
    historical_features: list[str]
    dataset_rows:     int
    unique_states:    int
    unique_seasons:   int


class StatesResponse(BaseModel):
    count:  int
    states: list[str]


class DistrictsResponse(BaseModel):
    state:     str
    count:     int
    districts: list[str]


class SeasonsResponse(BaseModel):
    count:   int
    seasons: list[str]


class CropsResponse(BaseModel):
    state:    Optional[str]
    district: Optional[str]
    season:   Optional[str]
    count:    int
    crops:    list[str]
