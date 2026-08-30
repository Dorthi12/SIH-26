"""
yield_forecast.py — Pydantic schemas for the CatBoost Yield Forecaster (Model 1).
"""

from typing import Optional
from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class YieldPredictionRequest(BaseModel):
    """
    Full 16-feature request for POST /api/v1/predict-yield.

    The 4 contextual fields are user/backend supplied.
    The 10 historical derived fields MUST be computed from actual historical
    yield records — they should never be entered manually by a farmer.
    """

    # --- Contextual ---
    state:     str   = Field(..., min_length=1, description="Indian state name")
    district:  str   = Field(..., min_length=1, description="District name")
    crop:      str   = Field(..., min_length=1, description="Crop name (e.g. Rice)")
    season:    str   = Field(..., min_length=1, description="Season (e.g. Kharif, Rabi, Whole Year)")
    crop_year: int   = Field(..., gt=0, description="Target prediction year (e.g. 2021)")
    area:      float = Field(..., gt=0, description="Area under cultivation (dataset unit)")

    # --- Historical lag features (must use prior years only) ---
    yield_lag_1: float = Field(..., ge=0, description="Yield from 1 year prior")
    yield_lag_2: float = Field(..., ge=0, description="Yield from 2 years prior")
    yield_lag_3: float = Field(..., ge=0, description="Yield from 3 years prior")

    # --- Historical aggregates ---
    historical_mean_yield:   float = Field(..., ge=0, description="Mean yield over trailing history")
    historical_median_yield: float = Field(..., ge=0, description="Median yield over trailing history")
    historical_std_yield:    float = Field(..., ge=0, description="Std dev of yield over trailing history")

    # --- Yield change / trend features ---
    yield_change_1:    float = Field(..., description="Yield delta: lag_1 - lag_2")
    yield_change_2:    float = Field(..., description="Yield delta: lag_2 - lag_3")
    yield_growth_rate: float = Field(..., description="Proportional growth rate over lag window")
    historical_cv:     float = Field(..., ge=0, description="Coefficient of variation of historical yield")

    model_config = {
        "json_schema_extra": {
            "example": {
                "state": "Bihar",
                "district": "Gaya",
                "crop": "Rice",
                "season": "Kharif",
                "crop_year": 2021,
                "area": 1200.0,
                "yield_lag_1": 2100.5,
                "yield_lag_2": 1980.2,
                "yield_lag_3": 2050.8,
                "historical_mean_yield": 2043.83,
                "historical_median_yield": 2050.8,
                "historical_std_yield": 61.34,
                "yield_change_1": 120.3,
                "yield_change_2": -70.6,
                "yield_growth_rate": 0.0242,
                "historical_cv": 0.0300
            }
        }
    }

    @model_validator(mode="after")
    def check_no_forbidden_fields(self) -> "YieldPredictionRequest":
        """Pydantic strips unknown fields by default — extra guard."""
        return self


class FromHistoryRequest(BaseModel):
    """
    High-level endpoint: provide raw historical yields and let the ML service
    compute all 10 historical features automatically.

    historical_yields: ordered OLDEST → NEWEST (at least 3 values).
    """
    state:     str   = ""
    district:  str   = ""
    crop:      str   = ""
    season:    str   = ""
    crop_year: int   = 0
    area:      float = 0.0
    historical_yields: list[float]

    model_config = {
        "json_schema_extra": {
            "example": {
                "state": "Bihar",
                "district": "Gaya",
                "crop": "Rice",
                "season": "Kharif",
                "crop_year": 2021,
                "area": 1200.0,
                "historical_yields": [1850.0, 1920.0, 2050.0, 1980.0, 2100.5]
            }
        }
    }


class YieldPredictionBatchRequest(BaseModel):
    """Batch endpoint: predict yield for multiple records at once."""
    records: list[YieldPredictionRequest] = Field(
        ..., min_length=1, max_length=100,
        description="List of prediction requests (max 100 per call)"
    )


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class YieldModelInfo(BaseModel):
    id:        str
    name:      str
    version:   str
    algorithm: str


class PredictionResult(BaseModel):
    target:                        str
    value:                         float
    unit:                          str = "dataset_yield_unit"
    non_negative_clipping_applied: bool


class PredictionContext(BaseModel):
    state:     str
    district:  str
    crop:      str
    season:    str
    crop_year: int
    area:      float


class YieldPredictionResponse(BaseModel):
    request_id: str
    model:      YieldModelInfo
    prediction: PredictionResult
    context:    PredictionContext
    warnings:   list[str] = []


class BatchPredictionItem(BaseModel):
    index:      int
    request_id: str
    prediction: Optional[PredictionResult] = None
    context:    Optional[PredictionContext] = None
    warnings:   list[str] = []
    error:      Optional[str] = None


class YieldPredictionBatchResponse(BaseModel):
    model:   YieldModelInfo
    count:   int
    results: list[BatchPredictionItem]


# ---------------------------------------------------------------------------
# Health / Metadata / Schema
# ---------------------------------------------------------------------------

class YieldHealthResponse(BaseModel):
    status:        str
    model_loaded:  bool
    model_id:      str
    model_version: str


class YieldReadyResponse(BaseModel):
    ready:        bool
    model_loaded: bool
    detail:       str


class YieldMetadataResponse(BaseModel):
    model_name:          str
    model_id:            str
    model_version:       str
    algorithm:           str
    target:              str
    training_year_start: int
    training_year_end:   int
    validation_year:     int
    test_year:           int
    best_iteration:      int
    test_metrics:        dict


class YieldSchemaResponse(BaseModel):
    features:              list[str]
    categorical_features:  list[str]
    historical_features:   list[str]
    forbidden_features:    list[str]
    prediction_constraint: str
    note:                  str


class YieldErrorDetail(BaseModel):
    code:    str
    message: str


class YieldErrorResponse(BaseModel):
    error: YieldErrorDetail
