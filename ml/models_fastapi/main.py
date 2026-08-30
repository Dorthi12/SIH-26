"""
main.py — Unified Agriculture ML API
======================================
Single FastAPI server hosting all three ML models:

  Model 1 — CatBoost Future Yield Forecaster
  Model 2 — Crop Recommendation Engine
  Model 5 — Plant Disease Detection (EfficientNet-B0)

All endpoints:
--------------
System
  GET  /                                    → service root / route map
  GET  /health                              → combined liveness (all 3 models)
  GET  /ready                               → readiness probe (all artifacts)

Plant Disease (Model 5)
  POST /api/v1/plant-disease/predict        → disease inference from leaf image
  GET  /api/v1/plant-disease/health         → model liveness
  GET  /api/v1/plant-disease/model/info     → architecture + calibration metadata

Crop Recommendation (Model 2)
  POST /api/v1/crop/recommend               → top-K ranked crops
  POST /api/v1/crop/recommend/score         → score one specific crop
  POST /api/v1/crop/recommend/explain       → weighted breakdown
  POST /api/v1/crop/recommend/batch         → multi-location batch
  GET  /api/v1/crop/health                  → model liveness
  GET  /api/v1/crop/model/info              → config + scoring weights
  GET  /api/v1/crop/options/states          → all supported states
  GET  /api/v1/crop/options/districts       → districts for a state
  GET  /api/v1/crop/options/seasons         → all supported seasons
  GET  /api/v1/crop/options/crops           → crops (optionally filtered)

Yield Forecast (Model 1)
  POST /api/v1/predict-yield                → full 16-feature inference
  POST /api/v1/predict-yield/from-history   → auto-derive historical features
  POST /api/v1/predict-yield/batch          → batch inference (up to 100)
  GET  /api/v1/yield/health                 → model liveness
  GET  /api/v1/yield/ready                  → model readiness
  GET  /api/v1/yield/metadata               → model config & test metrics
  GET  /api/v1/yield/schema                 → feature schema

Run
---
  cd models_fastapi
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging
import os
import uuid
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.v1.router import router
from core.config import API_TITLE, API_VERSION
from core.logging_config import configure_logging
from models.disease_model import disease_model
from models.yield_model import forecaster
from models.zero_prod_model import zero_prod_model
from services.crop.artifact_loader import crop_artifacts

# ---------------------------------------------------------------------------
# Logging (configure before any logger is created)
# ---------------------------------------------------------------------------
configure_logging(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — all three models load once at startup, fail gracefully
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("Agriculture ML API (Unified) starting up…")
    logger.info("=" * 60)

    # ── Model 5: Plant Disease (EfficientNet-B0) ────────────────────
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
        # Don't crash — other models can still serve

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

    # ── Model 1: CatBoost Yield Forecaster ─────────────────────────
    logger.info("[Model 1] Loading CatBoost future yield forecaster…")
    try:
        forecaster.load()
        logger.info(
            "[Model 1] Ready  model_id=%s | algorithm=%s",
            forecaster.metadata.get("model_id", "model_2a"),
            forecaster.metadata.get("algorithm", "CatBoostRegressor"),
        )
    except Exception as exc:
        logger.error("[Model 1] FAILED to load: %s", exc, exc_info=True)

    # ── Model 3 V3: Zero-Production Risk (CatBoost + Isotonic Calibrator) ─
    logger.info("[Model 3] Loading zero-production risk model (CatBoost + isotonic calibrator)…")
    try:
        zero_prod_model.load()
        logger.info(
            "[Model 3] Ready  threshold=%.3f  applies_to=%s  model_version=%s",
            zero_prod_model.threshold,
            zero_prod_model.threshold_applies_to,
            zero_prod_model.model_version,
        )
    except Exception as exc:
        logger.error("[Model 3] FAILED to load: %s", exc, exc_info=True)

    logger.info("=" * 60)
    logger.info("Agriculture ML API is ready → http://localhost:8000/docs")
    logger.info("=" * 60)

    yield  # ← server handles requests here

    logger.info("Agriculture ML API (Unified) shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title=API_TITLE,
    description=(
        "**Unified Agriculture ML API** for the Netravaah Agriculture Platform.\n\n"
        "Hosts four ML models on a single server:\n\n"
        "**Model 1 — Future Yield Forecaster**\n"
        "CatBoostRegressor trained on 1997–2017 district-level data. "
        "Predicts next-year crop yield from 16 historical/contextual features. "
        "Temporal test R²: **0.9019**.\n\n"
        "**Model 2 — Crop Recommendation Engine**\n"
        "District-aware historical crop ranking based on yield, stability, "
        "and cultivation experience (32,400 records across India).\n\n"
        "**Model 3 V3 — Zero-Production Risk**\n"
        "CatBoostClassifier + isotonic calibrator predicting whether a crop/district/season "
        "combination will report zero production. ROC-AUC: **0.9438**.\n\n"
        "**Model 5 — Plant Disease Detection**\n"
        "EfficientNet-B0 trained on PlantVillage (38 classes, 14 crops). "
        "Test accuracy: **97.43%** | Macro F1: **96.75%**.\n\n"
        "---\n"
        "All models are loaded once at startup and kept in memory. "
        "Each model fails gracefully without crashing the others.\n\n"
        "⚠️ Model 5 is a closed-set classifier — images outside the 14 "
        "supported crops may receive an incorrect confident prediction. "
        "Model 2 `historical_score` is a ranking metric, **not a probability**. "
        "Model 1 R² is a regression metric, **not a classification accuracy**. "
        "Model 3 threshold semantics must be verified against training code before production use."
    ),
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — restrict allow_origins in production
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
        "service":  "Agriculture ML API — Unified",
        "version":  API_VERSION,
        "status":   "running",
        "docs":     "/docs",
        "redoc":    "/redoc",
        "models": {
            "model_1_yield_forecast":    {"loaded": forecaster.loaded},
            "model_2_crop_recommend":    {"loaded": crop_artifacts.loaded},
            "model_3_v3_zero_prod":      {"loaded": zero_prod_model.loaded},
            "model_5_plant_disease":     {"loaded": disease_model.loaded},
        },
        "endpoints": {
            "system": {
                "health":   "GET /health",
                "ready":    "GET /ready",
            },
            "plant_disease": {
                "predict":    "POST /api/v1/plant-disease/predict",
                "health":     "GET  /api/v1/plant-disease/health",
                "model_info": "GET  /api/v1/plant-disease/model/info",
            },
            "crop_recommendation": {
                "recommend":  "POST /api/v1/crop/recommend",
                "score":      "POST /api/v1/crop/recommend/score",
                "explain":    "POST /api/v1/crop/recommend/explain",
                "batch":      "POST /api/v1/crop/recommend/batch",
                "health":     "GET  /api/v1/crop/health",
                "model_info": "GET  /api/v1/crop/model/info",
                "states":     "GET  /api/v1/crop/options/states",
                "districts":  "GET  /api/v1/crop/options/districts?state=Bihar",
                "seasons":    "GET  /api/v1/crop/options/seasons",
                "crops":      "GET  /api/v1/crop/options/crops",
            },
            "yield_forecast": {
                "predict":       "POST /api/v1/predict-yield",
                "from_history":  "POST /api/v1/predict-yield/from-history",
                "batch":         "POST /api/v1/predict-yield/batch",
                "health":        "GET  /api/v1/yield/health",
                "ready":         "GET  /api/v1/yield/ready",
                "metadata":      "GET  /api/v1/yield/metadata",
                "schema":        "GET  /api/v1/yield/schema",
            },
            "zero_production": {
                "predict":       "POST /api/v1/model-3-v3/predict",
                "batch":         "POST /api/v1/model-3-v3/predict/batch",
                "from_context":  "POST /api/v1/model-3-v3/predict/from-context (501 stub)",
                "health":        "GET  /api/v1/model-3-v3/health",
                "ready":         "GET  /api/v1/model-3-v3/ready",
                "version":       "GET  /api/v1/model-3-v3/version",
                "info":          "GET  /api/v1/model-3-v3/info",
            },
        },
    }


@app.get("/health", tags=["System"], summary="Combined liveness check (all 3 models)")
def health():
    """
    Combined health check for all three models.
    Returns 200 if at least one model is ready.
    Returns 503 if no models are loaded.
    """
    disease_ok   = disease_model.loaded
    crop_ok      = crop_artifacts.loaded
    yield_ok     = forecaster.loaded
    zero_prod_ok = zero_prod_model.loaded

    if not disease_ok and not crop_ok and not yield_ok and not zero_prod_ok:
        return JSONResponse(
            status_code=503,
            content={
                "status":        "unhealthy",
                "disease_model": {"loaded": False},
                "crop_model":    {"loaded": False},
                "yield_model":   {"loaded": False},
                "zero_prod_model": {"loaded": False},
                "message": "No models loaded — service is not ready.",
            },
        )

    return {
        "status": "healthy",
        "disease_model": {
            "loaded":     disease_ok,
            "calibrated": disease_model.temperature != 1.0 if disease_ok else None,
            "device":     str(disease_model._device) if disease_ok else None,
        },
        "crop_model": {
            "loaded":         crop_ok,
            "records_loaded": crop_artifacts.records_loaded if crop_ok else None,
        },
        "yield_model": {
            "loaded":    yield_ok,
            "model_id":  forecaster.metadata.get("model_id") if yield_ok else None,
            "algorithm": forecaster.metadata.get("algorithm") if yield_ok else None,
        },
        "zero_prod_model": {
            "loaded":           zero_prod_ok,
            "model_version":    zero_prod_model.model_version if zero_prod_ok else None,
            "threshold":        zero_prod_model.threshold if zero_prod_ok else None,
            "threshold_applies_to": zero_prod_model.threshold_applies_to if zero_prod_ok else None,
        },
    }


@app.get("/ready", tags=["System"], summary="Readiness probe (all 3 models)")
def ready():
    """
    Readiness probe — confirms all three model artifacts are loaded and the
    server can serve requests. Returns 503 if any model is missing.
    """
    disease_ok   = disease_model.loaded
    crop_ok      = crop_artifacts.loaded
    yield_ok     = forecaster.loaded
    zero_prod_ok = zero_prod_model.loaded

    all_ready = disease_ok and crop_ok and yield_ok and zero_prod_ok
    response  = {
        "status":                  "ready" if all_ready else "degraded",
        "disease_model_ready":     disease_ok,
        "crop_model_ready":        crop_ok,
        "yield_model_ready":       yield_ok,
        "zero_prod_model_ready":   zero_prod_ok,
        "disease_device":          str(disease_model._device) if disease_ok else "not_loaded",
        "crop_dataset_rows":       crop_artifacts.records_loaded if crop_ok else 0,
        "yield_model_id":          forecaster.metadata.get("model_id", "not_loaded") if yield_ok else "not_loaded",
        "zero_prod_model_version": zero_prod_model.model_version if zero_prod_ok else "not_loaded",
    }

    if not all_ready:
        return JSONResponse(status_code=503, content=response)

    return response
