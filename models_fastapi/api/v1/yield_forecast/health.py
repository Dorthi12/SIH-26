"""
yield_forecast/health.py — Monitoring endpoints for the Yield Forecaster (Model 1).

GET /api/v1/yield/health     — model liveness
GET /api/v1/yield/ready      — model readiness
GET /api/v1/yield/metadata   — model config & test metrics
GET /api/v1/yield/schema     — feature schema (self-documenting)
"""

import logging

from fastapi import APIRouter, HTTPException

from core.config import API_V1, YIELD_FEATURE_ORDER, TRAINING_END_YEAR
from models.yield_model import forecaster
from schemas.yield_forecast import (
    YieldErrorDetail,
    YieldHealthResponse,
    YieldMetadataResponse,
    YieldReadyResponse,
    YieldSchemaResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}/yield", tags=["Yield Forecast — Monitoring"])


@router.get(
    "/health",
    response_model=YieldHealthResponse,
    summary="Yield model liveness check",
    description=(
        "Returns 200 when the CatBoost model is loaded and ready. "
        "Returns 503 if the model failed to load at startup."
    ),
)
def yield_health():
    meta = forecaster.metadata
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Yield model not loaded — service unhealthy")
    return YieldHealthResponse(
        status="healthy",
        model_loaded=True,
        model_id=meta.get("model_id", "model_2a"),
        model_version=meta.get("model_id", "2A"),
    )


@router.get(
    "/ready",
    response_model=YieldReadyResponse,
    summary="Yield model readiness probe",
    description=(
        "Returns 503 until the CatBoost model is fully loaded and ready to predict. "
        "Useful for Kubernetes/Docker health checks and orchestrators."
    ),
)
def yield_ready():
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Yield model not yet loaded")
    return YieldReadyResponse(
        ready=True,
        model_loaded=True,
        detail="CatBoost model is loaded and ready for inference",
    )


@router.get(
    "/metadata",
    response_model=YieldMetadataResponse,
    summary="Yield model configuration and test metrics",
    description=(
        "Model configuration and test metrics. "
        "Useful for debugging, auditing, and model versioning.\n\n"
        "Do NOT use R² from here to claim 'accuracy' — it is a regression metric."
    ),
)
def yield_metadata():
    meta = forecaster.metadata
    return YieldMetadataResponse(
        model_name=meta.get("model_name", ""),
        model_id=meta.get("model_id", ""),
        model_version=meta.get("model_id", ""),
        algorithm=meta.get("algorithm", ""),
        target=meta.get("target", "yield"),
        training_year_start=meta.get("training_year_start", 1997),
        training_year_end=meta.get("training_year_end", 2017),
        validation_year=meta.get("validation_year", 2018),
        test_year=meta.get("test_year", 2019),
        best_iteration=meta.get("best_iteration", 376),
        test_metrics=meta.get("test_metrics", {}),
    )


@router.get(
    "/schema",
    response_model=YieldSchemaResponse,
    summary="Yield feature schema (self-documenting)",
    description=(
        "Tells integrators exactly what features this model expects and which are forbidden. "
        "Use this to validate your feature construction pipeline."
    ),
)
def yield_schema():
    cfg = forecaster.feature_config
    return YieldSchemaResponse(
        features=cfg.get("features", YIELD_FEATURE_ORDER),
        categorical_features=cfg.get("categorical_features", []),
        historical_features=cfg.get("historical_features", []),
        forbidden_features=cfg.get("forbidden_features", []),
        prediction_constraint=cfg.get("prediction_constraint", "non_negative"),
        note=(
            "Historical features (yield_lag_*, historical_*) must be computed from "
            "yield records of years strictly prior to crop_year. "
            "Never supply 'production' or 'yield' (target leakage forbidden)."
        ),
    )
