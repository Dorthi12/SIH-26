"""
main.py — Agriculture ML API
=============================
Hosts two ML models on a single FastAPI server:

  Model 5 — Plant Disease Detection (EfficientNet-B0, 38-class PlantVillage)
  Model 2 — Crop Recommendation Engine (historical ranking, 32,400 rows)

Endpoints
---------
System
  GET  /                          → service root / route map
  GET  /health                    → combined liveness (both models)
  GET  /ready                     → readiness (artifacts loaded)

Plant Disease (Model 5)
  POST /api/v1/plant-disease/predict      → disease inference
  GET  /api/v1/plant-disease/health       → model liveness
  GET  /api/v1/plant-disease/model/info   → architecture + calibration metadata

Crop Recommendation (Model 2)
  POST /api/v1/crop/recommend             → top-K ranked crops
  POST /api/v1/crop/recommend/score       → score one specific crop
  POST /api/v1/crop/recommend/explain     → weighted breakdown
  POST /api/v1/crop/recommend/batch       → multi-location batch
  GET  /api/v1/crop/health                → model liveness
  GET  /api/v1/crop/model/info            → config + scoring weights
  GET  /api/v1/crop/options/states        → all supported states
  GET  /api/v1/crop/options/districts     → districts for a state
  GET  /api/v1/crop/options/seasons       → all supported seasons
  GET  /api/v1/crop/options/crops         → crops (optionally filtered)

Run
---
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.v1.router import router
from core.config import API_TITLE, API_VERSION
from core.logging_config import configure_logging
from models.disease_model import disease_model
from services.crop.artifact_loader import crop_artifacts

# ---------------------------------------------------------------------------
# Logging (must be configured before any logger is created)
# ---------------------------------------------------------------------------
configure_logging(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — both models load once at startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("Agriculture ML API starting up…")
    logger.info("=" * 60)

    # ── Model 5: Plant Disease ──────────────────────────────────────
    logger.info("[Model 5] Loading EfficientNet-B0 plant disease model…")
    try:
        disease_model.load()
        logger.info(
            "[Model 5] Ready  device=%s | T=%.4f | conf_thresh=%.2f | margin_thresh=%.2f",
            disease_model._device,
            disease_model.temperature,
            disease_model.confidence_threshold,
            disease_model.margin_threshold,
        )
    except Exception as exc:
        logger.error("[Model 5] FAILED to load: %s", exc, exc_info=True)
        # Don't crash the whole server — crop model can still serve

    # ── Model 2: Crop Recommendation ───────────────────────────────
    logger.info("[Model 2] Loading crop recommendation artifacts…")
    try:
        crop_artifacts.load()
        logger.info(
            "[Model 2] Ready  records=%d | states=%d | seasons=%d",
            crop_artifacts.records_loaded,
            len(crop_artifacts.states),
            len(crop_artifacts.seasons),
        )
    except Exception as exc:
        logger.error("[Model 2] FAILED to load: %s", exc, exc_info=True)

    logger.info("=" * 60)
    logger.info("Agriculture ML API is ready. Docs -> http://localhost:8000/docs")
    logger.info("=" * 60)

    yield  # <- server handles requests here

    logger.info("Agriculture ML API shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title=API_TITLE,
    description=(
        "**Agriculture ML API** for the Netravaah Agriculture Platform.\n\n"
        "Provides two inference services on a single host:\n\n"
        "**Model 5 — Plant Disease Detection**\n"
        "EfficientNet-B0 trained on PlantVillage (38 classes, 14 crops).\n"
        "Test accuracy: 97.43% | Macro F1: 96.75%.\n\n"
        "**Model 2 — Crop Recommendation Engine**\n"
        "District-aware historical crop ranking based on yield, stability, "
        "and cultivation experience (32,400 records across India).\n\n"
        "---\n"
        "Both models are loaded once at startup and kept in memory. "
        "All ML logic is isolated to model-specific service modules.\n\n"
        "⚠️ Model 5 is a closed-set classifier — images outside the 14 "
        "supported crops may receive an incorrect confident prediction. "
        "Model 2 `historical_score` is a ranking metric, **not a probability**."
    ),
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — restrict `allow_origins` to actual backend domains in production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global exception handler — never expose raw stack traces
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def _global_exception_handler(request: Request, exc: Exception):
    import uuid
    request_id = str(uuid.uuid4())
    logger.exception("Unhandled exception [request_id=%s]: %s", request_id, exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "request_id": request_id,
            "status": "error",
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again.",
            },
        },
    )


# ---------------------------------------------------------------------------
# Include all API routes
# ---------------------------------------------------------------------------
app.include_router(router)


# ---------------------------------------------------------------------------
# System-level routes (no prefix)
# ---------------------------------------------------------------------------

@app.get("/", tags=["System"], summary="Service root")
def root():
    """Confirm the server is alive and list all major endpoints."""
    return {
        "service":  "Agriculture ML API",
        "version":  API_VERSION,
        "status":   "running",
        "docs":     "/docs",
        "redoc":    "/redoc",
        "endpoints": {
            "system": {
                "health":   "GET /health",
                "ready":    "GET /ready",
            },
            "plant_disease": {
                "predict":      "POST /api/v1/plant-disease/predict",
                "health":       "GET  /api/v1/plant-disease/health",
                "model_info":   "GET  /api/v1/plant-disease/model/info",
            },
            "crop_recommendation": {
                "recommend":    "POST /api/v1/crop/recommend",
                "score":        "POST /api/v1/crop/recommend/score",
                "explain":      "POST /api/v1/crop/recommend/explain",
                "batch":        "POST /api/v1/crop/recommend/batch",
                "health":       "GET  /api/v1/crop/health",
                "model_info":   "GET  /api/v1/crop/model/info",
                "states":       "GET  /api/v1/crop/options/states",
                "districts":    "GET  /api/v1/crop/options/districts?state=Bihar",
                "seasons":      "GET  /api/v1/crop/options/seasons",
                "crops":        "GET  /api/v1/crop/options/crops",
            },
        },
    }


@app.get("/health", tags=["System"], summary="Combined liveness check")
def health():
    """
    Combined health check for both models.
    Returns 200 if at least one model is ready.
    Returns 503 if neither model is loaded.
    """
    disease_ok = disease_model.loaded
    crop_ok    = crop_artifacts.loaded

    if not disease_ok and not crop_ok:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "disease_model": {"loaded": False},
                "crop_model":    {"loaded": False},
                "message": "No models loaded — service is not ready.",
            },
        )

    return {
        "status":        "healthy",
        "disease_model": {
            "loaded":    disease_ok,
            "calibrated": disease_model.temperature != 1.0 if disease_ok else None,
            "device":    str(disease_model._device) if disease_ok else None,
        },
        "crop_model": {
            "loaded":         crop_ok,
            "records_loaded": crop_artifacts.records_loaded if crop_ok else None,
        },
    }


@app.get("/ready", tags=["System"], summary="Readiness check")
def ready():
    """
    Readiness probe — confirms all artifacts are loaded and the server
    can serve requests. Distinct from /health (liveness).
    Returns 503 if any artifact is missing.
    """
    disease_ok = disease_model.loaded
    crop_ok    = crop_artifacts.loaded

    response = {
        "status":            "ready" if (disease_ok and crop_ok) else "degraded",
        "disease_model_ready": disease_ok,
        "crop_model_ready":    crop_ok,
        "disease_artifact":    str(disease_model._device) if disease_ok else "not_loaded",
        "crop_dataset_rows":   crop_artifacts.records_loaded if crop_ok else 0,
    }

    if not disease_ok or not crop_ok:
        return JSONResponse(status_code=503, content=response)

    return response
