"""
zero_production.py — Pydantic schemas for the Model 3 V3 Zero-Production Risk API.

Base field list from model_3_v3_feature_schema.json (35 features).
4 features are derived server-side — callers must NOT send them:
  log_area                   ← derived from area
  district_crop_cv_area      ← derived from district_crop_std_area / district_crop_mean_area
  area_vs_recent_3yr_mean    ← derived from area / recent_3yr_area_mean
  area_vs_recent_5yr_mean    ← derived from area / recent_5yr_area_mean

NOTE: production, yield, current_crop_year are FORBIDDEN (target leakage).
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional


class ZeroProductionRequest(BaseModel):
    # ── Categorical identifiers ─────────────────────────────────────────────
    state:    str
    district: str
    crop:     str
    season:   str

    # ── Area ────────────────────────────────────────────────────────────────
    area: float = Field(..., gt=0, description="Sown area; log_area is derived server-side")

    # ── Historical zero-production rates ─────────────────────────────────────
    historical_zero_rate_global:                 float = Field(..., ge=0, le=1)
    historical_crop_zero_rate:                   float = Field(..., ge=0, le=1)
    historical_state_zero_rate:                  float = Field(..., ge=0, le=1)
    historical_district_zero_rate:               float = Field(..., ge=0, le=1)
    historical_state_crop_zero_rate:             float = Field(..., ge=0, le=1)
    historical_district_crop_zero_rate:          float = Field(..., ge=0, le=1)
    historical_crop_season_zero_rate:            float = Field(..., ge=0, le=1)
    historical_district_crop_season_zero_rate:   float = Field(..., ge=0, le=1)

    recent_3yr_zero_rate:  float = Field(..., ge=0, le=1)
    recent_5yr_zero_rate:  float = Field(..., ge=0, le=1)
    recent_10yr_zero_rate: float = Field(..., ge=0, le=1)

    # ── History record counts ────────────────────────────────────────────────
    crop_history_count:                  int = Field(..., ge=0)
    state_history_count:                 int = Field(..., ge=0)
    district_history_count:              int = Field(..., ge=0)
    state_crop_history_count:            int = Field(..., ge=0)
    district_crop_history_count:         int = Field(..., ge=0)
    district_crop_season_history_count:  int = Field(..., ge=0)

    # ── Yield aggregates ─────────────────────────────────────────────────────
    district_crop_mean_yield:   float = Field(..., ge=0)
    district_crop_median_yield: float = Field(..., ge=0)
    district_crop_std_yield:    float = Field(..., ge=0)
    district_crop_min_yield:    float = Field(..., ge=0)
    district_crop_max_yield:    float = Field(..., ge=0)

    # ── Area aggregates ──────────────────────────────────────────────────────
    district_crop_mean_area: float = Field(..., ge=0)
    district_crop_std_area:  float = Field(..., ge=0)

    recent_3yr_area_mean: float = Field(..., ge=0)
    recent_5yr_area_mean: float = Field(..., ge=0)

    @field_validator("state", "district", "crop", "season")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be empty or whitespace-only")
        return v

    @model_validator(mode="after")
    def check_yield_ordering(self):
        if not (self.district_crop_min_yield <= self.district_crop_median_yield <= self.district_crop_max_yield):
            raise ValueError(
                "district_crop_min_yield <= district_crop_median_yield <= district_crop_max_yield must hold "
                "(got min={}, median={}, max={})".format(
                    self.district_crop_min_yield,
                    self.district_crop_median_yield,
                    self.district_crop_max_yield,
                )
            )
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "state": "Bihar",
                "district": "Patna",
                "crop": "Rice",
                "season": "Kharif",
                "area": 120.5,
                "historical_zero_rate_global": 0.04,
                "historical_crop_zero_rate": 0.03,
                "historical_state_zero_rate": 0.05,
                "historical_district_zero_rate": 0.06,
                "historical_state_crop_zero_rate": 0.04,
                "historical_district_crop_zero_rate": 0.05,
                "historical_crop_season_zero_rate": 0.03,
                "historical_district_crop_season_zero_rate": 0.05,
                "recent_3yr_zero_rate": 0.0,
                "recent_5yr_zero_rate": 0.2,
                "recent_10yr_zero_rate": 0.1,
                "crop_history_count": 25,
                "state_history_count": 400,
                "district_history_count": 60,
                "state_crop_history_count": 120,
                "district_crop_history_count": 20,
                "district_crop_season_history_count": 10,
                "district_crop_mean_yield": 2.3,
                "district_crop_median_yield": 2.1,
                "district_crop_std_yield": 0.6,
                "district_crop_min_yield": 0.0,
                "district_crop_max_yield": 4.5,
                "district_crop_mean_area": 110.0,
                "district_crop_std_area": 30.0,
                "recent_3yr_area_mean": 118.0,
                "recent_5yr_area_mean": 115.0,
            }
        }
    }


class ZeroProductionResponse(BaseModel):
    request_id:             str
    model_version:          str
    raw_probability:        float = Field(..., description="Uncalibrated CatBoost predict_proba output")
    calibrated_probability: float = Field(..., description="Isotonic-calibrated probability of zero production")
    zero_production_flag:   bool  = Field(..., description="Decision flag — see threshold_applies_to for what it's measured against")
    threshold_used:         float
    threshold_applies_to:   str   = Field(..., description="'calibrated' or 'raw'")
    risk_level:             str   = Field(
        ...,
        description=(
            "Product-level interpretation band, NOT a validated risk category: "
            "LOW <0.20, MODERATE <0.50, HIGH <0.75, VERY_HIGH <0.90, CRITICAL >=0.90 "
            "(measured on calibrated_probability)."
        ),
    )


class BatchZeroProductionRequest(BaseModel):
    records: List[ZeroProductionRequest] = Field(..., min_length=1, max_length=5000)


class BatchResultItem(ZeroProductionResponse):
    index: int = Field(..., description="Position of this record in the submitted records list")


class BatchZeroProductionResponse(BaseModel):
    request_id: str
    results:    List[BatchResultItem]


class ZeroProdModelInfoResponse(BaseModel):
    model_name:           str
    model_version:        str
    purpose:              str
    model_type:           str
    feature_count:        int
    categorical_features: List[str]
    target:               str
    forbidden_features:   List[str]
    threshold:            float
    threshold_applies_to: str
    calibration:          dict
    metrics:              dict


class ZeroProdHealthResponse(BaseModel):
    status: str


class ZeroProdReadyResponse(BaseModel):
    status:            str
    model_loaded:      bool
    calibrator_loaded: bool


class ZeroProdVersionResponse(BaseModel):
    api_version:   str
    model_version: str


class FromContextRequest(BaseModel):
    state:           str
    district:        str
    crop:            str
    season:          str
    area:            float
    prediction_year: int
