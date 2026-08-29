"""
crop_health.py — Health and model-info endpoints for the Crop Recommendation Engine.

GET /api/v1/crop/health
GET /api/v1/crop/model/info
"""

import logging

from fastapi import APIRouter, HTTPException

from core.config import API_V1, DEFAULT_CROP_TOP_K, MAX_CROP_TOP_K
from schemas.crop import CropHealthResponse, CropModelInfoResponse
from services.crop.artifact_loader import crop_artifacts

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}/crop", tags=["Crop Recommendation — Monitoring"])


@router.get(
    "/health",
    response_model=CropHealthResponse,
    summary="Crop model liveness check",
    description=(
        "Returns 200 when the crop recommendation dataset and scalers are loaded. "
        "Returns 503 if artifacts failed to load at startup."
    ),
)
def crop_health():
    if not crop_artifacts.loaded:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation artifacts not loaded — service unhealthy.",
        )
    return CropHealthResponse(
        status="healthy",
        model_name=crop_artifacts.config.get("model_name", "Crop Recommendation Engine"),
        model_version=crop_artifacts.config.get("model_version", "1.0"),
        records_loaded=crop_artifacts.records_loaded,
        artifacts_ready=True,
    )


@router.get(
    "/model/info",
    response_model=CropModelInfoResponse,
    summary="Crop model configuration and scoring metadata",
    description=(
        "Returns dataset size, scoring weights, supported features, and model version. "
        "Useful during integration to confirm which model version is running."
    ),
)
def crop_model_info():
    cfg = crop_artifacts.config
    return CropModelInfoResponse(
        model_name=cfg.get("model_name", "Crop Recommendation Engine"),
        model_version=cfg.get("model_version", "1.0"),
        model_type="historical_crop_ranking",
        default_top_k=cfg.get("default_top_k", DEFAULT_CROP_TOP_K),
        max_top_k=MAX_CROP_TOP_K,
        score_weights=cfg.get("score_components", {
            "yield_score": 0.5,
            "stability_score": 0.3,
            "experience_score": 0.2,
        }),
        scoring_formula=(
            "historical_score = 0.50 × yield_score "
            "+ 0.30 × stability_score + 0.20 × experience_score"
        ),
        features=cfg.get("features", ["state", "district", "season", "crop"]),
        historical_features=cfg.get(
            "historical_features", ["median_yield", "yield_cv", "years_cultivated"]
        ),
        dataset_rows=crop_artifacts.records_loaded,
        unique_states=len(crop_artifacts.states),
        unique_seasons=len(crop_artifacts.seasons),
    )
