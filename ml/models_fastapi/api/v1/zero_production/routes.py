"""
zero_production/routes.py — Prediction endpoints for Model 3 V3 (Zero-Production Risk).

POST /api/v1/model-3-v3/predict              → single record prediction
POST /api/v1/model-3-v3/predict/batch        → batch prediction (up to 5000)
POST /api/v1/model-3-v3/predict/from-context → 501 stub (requires feature store)
GET  /api/v1/model-3-v3/health               → fast liveness
GET  /api/v1/model-3-v3/ready                → model + calibrator readiness
GET  /api/v1/model-3-v3/version              → API + model version
GET  /api/v1/model-3-v3/info                 → model metadata and metrics
"""

import logging
import os
import uuid
from typing import Optional

from fastapi import APIRouter, Header, HTTPException

from core.config import API_V1
from models.zero_prod_model import zero_prod_model
from schemas.zero_production import (
    BatchZeroProductionRequest,
    BatchZeroProductionResponse,
    FromContextRequest,
    ZeroProductionRequest,
    ZeroProductionResponse,
    ZeroProdHealthResponse,
    ZeroProdModelInfoResponse,
    ZeroProdReadyResponse,
    ZeroProdVersionResponse,
)

logger    = logging.getLogger("model_3_v3")
router    = APIRouter(prefix=f"{API_V1}/model-3-v3", tags=["Zero Production Risk — Model 3 V3"])

API_VERSION = "1.2.0"
DEBUG_MODE  = os.environ.get("DEBUG_MODE", "0") == "1"


def _error_detail(exc: Exception, generic: str) -> str:
    return (generic + ": " + str(exc)) if DEBUG_MODE else generic


def _resolve_request_id(x_request_id: Optional[str]) -> str:
    return x_request_id or str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Monitoring
# ---------------------------------------------------------------------------

@router.get("/health", response_model=ZeroProdHealthResponse, summary="Liveness probe (no model touch)")
def health_check():
    """Fast liveness — does NOT touch the model. Use /ready for that."""
    return ZeroProdHealthResponse(status="ok")


@router.get("/ready", response_model=ZeroProdReadyResponse, summary="Readiness — model + calibrator loaded")
def readiness_check():
    """Confirms the CatBoost model and isotonic calibrator are both loaded."""
    if not zero_prod_model.loaded:
        raise HTTPException(status_code=503, detail="Model 3 not available")
    return ZeroProdReadyResponse(
        status="ready",
        model_loaded=True,
        calibrator_loaded=zero_prod_model.calibrator is not None,
    )


@router.get("/version", response_model=ZeroProdVersionResponse, summary="API + model version")
def version():
    return ZeroProdVersionResponse(
        api_version=API_VERSION,
        model_version=zero_prod_model.model_version,
    )


@router.get("/info", response_model=ZeroProdModelInfoResponse, summary="Model metadata, metrics, threshold info")
def model_info():
    """Returns training schema, metrics, and threshold configuration."""
    if not zero_prod_model.loaded:
        raise HTTPException(status_code=503, detail="Model 3 not available")
    s = zero_prod_model.schema
    return ZeroProdModelInfoResponse(
        model_name=s["model_name"],
        model_version=zero_prod_model.model_version,
        purpose=s["purpose"],
        model_type=s["model_type"],
        feature_count=s["feature_count"],
        categorical_features=s["categorical_features"],
        target=s["target"],
        forbidden_features=s["forbidden_features"],
        threshold=zero_prod_model.threshold,
        threshold_applies_to=zero_prod_model.threshold_applies_to,
        calibration=s["calibration"],
        metrics=s["metrics"],
    )


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

@router.post(
    "/predict",
    response_model=ZeroProductionResponse,
    summary="Predict zero-production risk for a single record",
    description=(
        "Accepts 31 base features; 4 derived features (log_area, district_crop_cv_area, "
        "area_vs_recent_3yr_mean, area_vs_recent_5yr_mean) are computed server-side.\n\n"
        "Returns both raw CatBoost probability and isotonic-calibrated probability.\n\n"
        "`zero_production_flag` is True when the decision probability (controlled by "
        "`THRESHOLD_APPLIES_TO` env var, default 'calibrated') exceeds the schema threshold (0.9).\n\n"
        "⚠️ The threshold target must be verified against training/eval code before production use."
    ),
)
def predict(
    request: ZeroProductionRequest,
    x_request_id: Optional[str] = Header(default=None),
):
    if not zero_prod_model.loaded:
        raise HTTPException(status_code=503, detail="Model 3 not ready")

    request_id = _resolve_request_id(x_request_id)
    try:
        return zero_prod_model.predict_one(request, request_id=request_id)
    except Exception as exc:
        logger.exception("Prediction failed [request_id=%s]", request_id)
        raise HTTPException(status_code=500, detail=_error_detail(exc, "Prediction failed"))


@router.post(
    "/predict/batch",
    response_model=BatchZeroProductionResponse,
    summary="Batch predict zero-production risk (up to 5000 records)",
    description=(
        "Submit 1–5000 records in a single request. "
        "Each result item carries its input `index` so results map unambiguously back. "
        "Batch size validation (1–5000) is enforced by the request schema — "
        "a 422 comes back automatically for empty or oversized batches."
    ),
)
def predict_batch(
    request: BatchZeroProductionRequest,
    x_request_id: Optional[str] = Header(default=None),
):
    if not zero_prod_model.loaded:
        raise HTTPException(status_code=503, detail="Model 3 not ready")

    request_id = _resolve_request_id(x_request_id)
    try:
        results = zero_prod_model.predict_batch(request.records, request_id=request_id)
        return BatchZeroProductionResponse(request_id=request_id, results=results)
    except Exception as exc:
        logger.exception("Batch prediction failed [request_id=%s]", request_id)
        raise HTTPException(status_code=500, detail=_error_detail(exc, "Batch prediction failed"))


@router.post(
    "/predict/from-context",
    status_code=501,
    summary="(Stub) Predict from minimal context — NOT YET IMPLEMENTED",
    description=(
        "**NOT YET IMPLEMENTED.**\n\n"
        "Intended contract: accept only farmer-facing fields "
        "(state, district, crop, season, area, prediction_year), look up the ~30 "
        "historical/rolling aggregate features from your historical yield database "
        "using **only records with year < prediction_year** (to avoid leakage), "
        "then call the same pipeline as `/predict`.\n\n"
        "This requires a feature store / database connection that isn't part of "
        "the model artifacts. Use `/predict` directly with pre-computed features "
        "until this is implemented."
    ),
)
def predict_from_context(request: FromContextRequest):
    raise HTTPException(
        status_code=501,
        detail=(
            "Not implemented: requires a time-aware feature builder wired to your "
            "historical yield data (records strictly before prediction_year). "
            "Use POST /api/v1/model-3-v3/predict with pre-computed features in the meantime."
        ),
    )
