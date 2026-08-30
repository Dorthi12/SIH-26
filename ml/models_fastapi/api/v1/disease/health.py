"""
disease/health.py — Health and model-info endpoints for the plant disease model.

GET /api/v1/plant-disease/health
GET /api/v1/plant-disease/model/info
"""

import json
import logging

from fastapi import APIRouter, HTTPException

from core.config import API_V1, API_VERSION, DEVICE, DISEASE_METADATA_PATH
from models.disease_model import disease_model
from schemas.disease import DiseaseHealthResponse, DiseaseModelInfoResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}/plant-disease", tags=["Plant Disease — Monitoring"])


@router.get(
    "/health",
    response_model=DiseaseHealthResponse,
    summary="Disease model liveness check",
    description=(
        "Returns 200 when the EfficientNet-B0 model is loaded and ready. "
        "Returns 503 if the model failed to load at startup."
    ),
)
def disease_health():
    if not disease_model.loaded:
        raise HTTPException(
            status_code=503,
            detail="Disease model not loaded — service unhealthy.",
        )
    return DiseaseHealthResponse(
        status="healthy",
        model_loaded=True,
        model_name="plant-disease-efficientnet-b0",
        version=API_VERSION,
        device=DEVICE,
    )


@router.get(
    "/model/info",
    response_model=DiseaseModelInfoResponse,
    summary="Disease model architecture and calibration metadata",
    description=(
        "Returns architecture details, dataset info, test metrics, "
        "and current calibration parameters.\n\n"
        "⚠️ Do NOT use `test_accuracy` in farmer-facing messaging as a "
        "guarantee of prediction accuracy on real-world images."
    ),
)
def disease_model_info():
    meta: dict = {}
    if DISEASE_METADATA_PATH.exists():
        with open(DISEASE_METADATA_PATH) as f:
            meta = json.load(f)

    return DiseaseModelInfoResponse(
        model_name=meta.get("model_name", "Plant Disease Detector"),
        architecture="EfficientNet-B0",
        dataset="PlantVillage",
        num_classes=38,
        input_size=224,
        model_version=API_VERSION,
        test_accuracy=meta.get("test_accuracy", 0.9743),
        test_macro_f1=meta.get("test_macro_f1", 0.9675),
        calibrated=disease_model.temperature != 1.0,
        temperature=disease_model.temperature,
        confidence_threshold=disease_model.confidence_threshold,
        margin_threshold=disease_model.margin_threshold,
    )
