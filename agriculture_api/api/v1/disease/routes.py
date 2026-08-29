"""
disease_routes.py — POST /api/v1/plant-disease/predict

Full pipeline:
  upload → validate → preprocess → infer → calibrate → decide → respond
"""

import logging
import time
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from core.config import API_V1, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB
from models.disease_model import disease_model
from schemas.disease import (
    DiseasePredictionResponse,
    ErrorDetail,
    ErrorResponse,
    ModelInfo,
    TopKPrediction,
)
from services.disease.image_validation import validate_image
from services.disease.inference import run_inference
from services.disease.prediction import PredictionStatus, decide

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}/plant-disease", tags=["Plant Disease — Inference"])


def _model_info() -> ModelInfo:
    return ModelInfo(
        name="plant-disease-efficientnet-b0",
        version="1.0.0",
        architecture="EfficientNet-B0",
        calibrated=disease_model.temperature != 1.0,
    )


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    summary="Detect plant disease from a leaf image",
    description=(
        "Upload a JPG, JPEG, PNG, or WebP leaf photograph (max 10 MB).\n\n"
        "Returns a structured prediction including crop, disease name, confidence, "
        "and top-3 alternative predictions.\n\n"
        "**Status field**:\n"
        "- `prediction` — model is confident; use `crop` and `disease` fields.\n"
        "- `uncertain` — confidence or margin too low; show `message` to the farmer.\n\n"
        "⚠️ This is a closed-set classifier (14 crops, 38 classes). "
        "Images outside PlantVillage's supported crops may still produce "
        "a confident-looking but incorrect prediction."
    ),
)
async def predict_disease(
    image: UploadFile = File(..., description="Leaf image — JPG, JPEG, PNG, or WebP, max 10 MB"),
):
    request_id = str(uuid.uuid4())
    t_start = time.perf_counter()

    # Guard — model must be loaded
    if not disease_model.loaded:
        raise HTTPException(status_code=503, detail="Disease model not ready. Try again shortly.")

    # ----------------------------------------------------------------
    # 1. Read file bytes
    # ----------------------------------------------------------------
    file_bytes = await image.read()

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return JSONResponse(
            status_code=413,
            content=ErrorResponse(
                request_id=request_id,
                status="invalid_image",
                error=ErrorDetail(
                    code="FILE_TOO_LARGE",
                    message=f"File exceeds the {MAX_FILE_SIZE_MB} MB limit.",
                ),
            ).model_dump(),
        )

    # ----------------------------------------------------------------
    # 2. Image validation (extension → decode → resolution → quality)
    # ----------------------------------------------------------------
    validation = validate_image(image.filename or "upload", file_bytes)
    if not validation.valid:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                request_id=request_id,
                status="invalid_image",
                error=ErrorDetail(
                    code=validation.error_code,
                    message=validation.message,
                ),
            ).model_dump(),
        )

    pil_image = validation.image  # RGB PIL Image

    # ----------------------------------------------------------------
    # 3. Inference
    # ----------------------------------------------------------------
    try:
        inference_result = run_inference(pil_image)
    except Exception as exc:
        logger.exception("Inference error for request_id=%s: %s", request_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorDetail(
                code="MODEL_INFERENCE_ERROR",
                message="Disease prediction failed. Please try again.",
            ).model_dump(),
        )

    # ----------------------------------------------------------------
    # 4. Confidence decision
    # ----------------------------------------------------------------
    status, uncertain_message = decide(inference_result)

    latency_ms = round((time.perf_counter() - t_start) * 1000, 1)
    logger.info(
        "request_id=%s | status=%s | class=%s | conf=%.4f | margin=%.4f | %sms",
        request_id, status,
        inference_result.top1.class_name,
        inference_result.top1.confidence,
        inference_result.prediction_margin,
        latency_ms,
    )

    # ----------------------------------------------------------------
    # 5. Build response
    # ----------------------------------------------------------------
    top_k_resp = [
        TopKPrediction(
            rank=i + 1,
            crop=p.crop,
            disease=p.disease,
            is_healthy=p.is_healthy,
            confidence=round(p.confidence, 4),
        )
        for i, p in enumerate(inference_result.top_k)
    ]

    if status == PredictionStatus.PREDICTION:
        return DiseasePredictionResponse(
            success=True,
            request_id=request_id,
            status=status,
            model=_model_info(),
            crop=inference_result.top1.crop,
            disease=inference_result.top1.disease,
            is_healthy=inference_result.top1.is_healthy,
            confidence=round(inference_result.top1.confidence, 4),
            prediction_margin=round(inference_result.prediction_margin, 4),
            top_predictions=top_k_resp,
        )
    else:
        return DiseasePredictionResponse(
            success=True,
            request_id=request_id,
            status=status,
            model=_model_info(),
            message=uncertain_message,
            confidence=round(inference_result.top1.confidence, 4),
            prediction_margin=round(inference_result.prediction_margin, 4),
            top_predictions=top_k_resp,   # still useful for the agent/backend
        )
