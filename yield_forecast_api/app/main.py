"""
main.py — CatBoost Future Yield Forecaster — FastAPI Service
=============================================================
Model      : CatBoost Future Yield Forecaster (model_2a / v2A)
Trained    : 1997–2017  |  Validated: 2018  |  Tested: 2019
Target     : yield (non-negative enforced at inference)
Author     : Netravaah Agriculture Team — ML Member

Endpoints
---------
GET  /                             — Service info
GET  /health                       — Service health (for backend polling)
GET  /ready                        — Model readiness (for orchestrators)
GET  /metadata                     — Model config & test metrics
GET  /schema                       — Feature schema (self-documenting)
POST /api/v1/predict-yield         — Full 16-feature inference
POST /api/v1/predict-yield/from-history  — Auto-derive historical features
POST /api/v1/predict-yield/batch   — Batch inference (up to 100 records)
"""

import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import API_V1_PREFIX, FEATURE_ORDER, TRAINING_END_YEAR
from app.model import forecaster
from app.predictor import compute_historical_features
from app.schemas import (
    BatchPredictionItem,
    ErrorDetail,
    ErrorResponse,
    HealthResponse,
    MetadataResponse,
    PredictionContext,
    PredictionResult,
    ReadyResponse,
    SchemaResponse,
    YieldPredictionBatchRequest,
    YieldPredictionBatchResponse,
    YieldPredictionRequest,
    YieldPredictionResponse,
    ModelInfo,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — load model once at startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — loading CatBoost model artifacts...")
    forecaster.load()
    logger.info("Model ready. Service is accepting requests.")
    yield
    logger.info("Shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CatBoost Future Yield Forecaster",
    description=(
        "**Model 1 — Future Yield Prediction API** for the Netravaah Agriculture Platform.\n\n"
        "Predicts future crop yield using historical district-level agricultural data "
        "and a trained CatBoostRegressor (trained 1997–2017, validated 2018, tested 2019).\n\n"
        "**Important**: Historical lag/aggregate features must reflect *prior years only*. "
        "Never supply actual future yield values as input features (target leakage).\n\n"
        f"R² on temporal test set: **0.9019**"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to actual origin domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Exception handler — structured error responses
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=ErrorDetail(code=f"HTTP_{exc.status_code}", message=str(exc.detail))
        ).model_dump(),
    )


# ---------------------------------------------------------------------------
# Helper: build ModelInfo from loaded metadata
# ---------------------------------------------------------------------------
def _model_info() -> ModelInfo:
    meta = forecaster.metadata
    return ModelInfo(
        id=meta.get("model_id", "model_2a"),
        name=meta.get("model_name", "CatBoost Future Yield Forecaster"),
        version=meta.get("model_id", "2A").upper(),
        algorithm=meta.get("algorithm", "CatBoostRegressor"),
    )


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
@app.get("/", tags=["Root"])
def root():
    """Service root — confirms the API is alive."""
    return {
        "service": "CatBoost Future Yield Forecaster",
        "model_id": "model_2a",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health():
    """
    Health check endpoint.
    Your friend's main backend should poll this to confirm the ML service is alive.
    Returns 503 if the model failed to load.
    """
    meta = forecaster.metadata
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Model not loaded — service unhealthy")
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        model_id=meta.get("model_id", "model_2a"),
        model_version=meta.get("model_id", "2A"),
    )


# ---------------------------------------------------------------------------
# Readiness
# ---------------------------------------------------------------------------
@app.get("/ready", response_model=ReadyResponse, tags=["Monitoring"])
def ready():
    """
    Readiness probe — distinct from health.
    Returns 503 until the CatBoost model is fully loaded and ready to predict.
    Useful for Kubernetes/Docker health checks and orchestrators.
    """
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Model not yet loaded")
    return ReadyResponse(
        ready=True,
        model_loaded=True,
        detail="CatBoost model is loaded and ready for inference",
    )


# ---------------------------------------------------------------------------
# Metadata
# ---------------------------------------------------------------------------
@app.get("/metadata", response_model=MetadataResponse, tags=["Monitoring"])
def metadata():
    """
    Model configuration and test metrics.
    Useful for debugging, auditing, and model versioning.
    Do NOT use R² from here to claim 'accuracy' — it is a regression metric.
    """
    meta = forecaster.metadata
    return MetadataResponse(
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


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
@app.get("/schema", response_model=SchemaResponse, tags=["Discovery"])
def schema():
    """
    Feature schema — self-documenting endpoint.
    Tells integrators exactly what features this model expects and which are forbidden.
    """
    cfg = forecaster.feature_config
    return SchemaResponse(
        features=cfg.get("features", FEATURE_ORDER),
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


# ---------------------------------------------------------------------------
# POST /api/v1/predict-yield  — main inference endpoint
# ---------------------------------------------------------------------------
@app.post(
    f"{API_V1_PREFIX}/predict-yield",
    response_model=YieldPredictionResponse,
    tags=["Inference"],
    summary="Predict future yield (full 16-feature request)",
)
def predict_yield(request: YieldPredictionRequest):
    """
    **Main inference endpoint.**

    Accepts all 16 model features and returns the CatBoost predicted yield.

    The 10 historical features (yield lags, aggregates, trend) must be
    pre-computed by the calling backend from verified historical yield records.
    They MUST reflect years strictly prior to `crop_year` — never include the
    target year's actual yield.

    Returns predicted yield in dataset units, with:
    - Non-negative clipping flag if raw prediction was < 0
    - Temporal extrapolation warning if crop_year > training end year (2017)
    """
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    request_id = str(uuid.uuid4())
    request_dict = request.model_dump()

    try:
        predicted_yield, clipping_applied, warnings = forecaster.predict(request_dict)
    except Exception as exc:
        logger.exception("Inference error for request_id=%s: %s", request_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorDetail(
                code="MODEL_INFERENCE_ERROR",
                message="Yield prediction could not be generated. Check server logs.",
            ).model_dump(),
        )

    logger.info(
        "request_id=%s | crop=%s | district=%s | year=%d | pred=%.4f | clipped=%s",
        request_id, request.crop, request.district, request.crop_year,
        predicted_yield, clipping_applied,
    )

    return YieldPredictionResponse(
        request_id=request_id,
        model=_model_info(),
        prediction=PredictionResult(
            target="yield",
            value=predicted_yield,
            non_negative_clipping_applied=clipping_applied,
        ),
        context=PredictionContext(
            state=request.state,
            district=request.district,
            crop=request.crop,
            season=request.season,
            crop_year=request.crop_year,
            area=request.area,
        ),
        warnings=warnings,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/predict-yield/from-history  — high-level endpoint
# ---------------------------------------------------------------------------
class FromHistoryRequest(YieldPredictionRequest.__bases__[0] if False else object):
    pass


from pydantic import BaseModel as _BaseModel

class FromHistoryRequest(_BaseModel):
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


@app.post(
    f"{API_V1_PREFIX}/predict-yield/from-history",
    response_model=YieldPredictionResponse,
    tags=["Inference"],
    summary="Predict future yield (auto-derive historical features from raw records)",
)
def predict_yield_from_history(request: FromHistoryRequest):
    """
    **High-level inference endpoint.**

    Instead of manually computing lag/aggregate features, provide a list of
    raw historical yield values (oldest → newest). The ML service will:

    1. Derive all 10 historical features automatically.
    2. Call the CatBoost model.
    3. Return the predicted yield.

    Requires at least 3 historical yield values.
    """
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    if len(request.historical_yields) < 3:
        raise HTTPException(
            status_code=422,
            detail=ErrorDetail(
                code="INSUFFICIENT_HISTORY",
                message="At least 3 historical yield values are required.",
            ).model_dump(),
        )

    # Derive the 10 historical features
    try:
        hist_features = compute_historical_features(request.historical_yields)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=ErrorDetail(code="FEATURE_ENGINEERING_ERROR", message=str(e)).model_dump(),
        )

    # Build the full 16-feature dict
    request_dict = {
        "state":     request.state,
        "district":  request.district,
        "crop":      request.crop,
        "season":    request.season,
        "crop_year": request.crop_year,
        "area":      request.area,
        **hist_features,
    }

    request_id = str(uuid.uuid4())

    try:
        predicted_yield, clipping_applied, warnings = forecaster.predict(request_dict)
    except Exception as exc:
        logger.exception("Inference error (from-history) request_id=%s: %s", request_id, exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorDetail(
                code="MODEL_INFERENCE_ERROR",
                message="Yield prediction could not be generated.",
            ).model_dump(),
        )

    logger.info(
        "request_id=%s (from-history) | crop=%s | district=%s | year=%d | pred=%.4f",
        request_id, request.crop, request.district, request.crop_year, predicted_yield,
    )

    return YieldPredictionResponse(
        request_id=request_id,
        model=_model_info(),
        prediction=PredictionResult(
            target="yield",
            value=predicted_yield,
            non_negative_clipping_applied=clipping_applied,
        ),
        context=PredictionContext(
            state=request.state,
            district=request.district,
            crop=request.crop,
            season=request.season,
            crop_year=request.crop_year,
            area=request.area,
        ),
        warnings=warnings,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/predict-yield/batch  — batch inference
# ---------------------------------------------------------------------------
@app.post(
    f"{API_V1_PREFIX}/predict-yield/batch",
    response_model=YieldPredictionBatchResponse,
    tags=["Inference"],
    summary="Batch yield prediction (up to 100 records)",
)
def predict_yield_batch(request: YieldPredictionBatchRequest):
    """
    **Batch inference endpoint.**

    Send up to 100 prediction requests in a single call.
    Useful when the agentic layer wants to evaluate multiple crops at once.

    Individual errors do not fail the entire batch — each record reports
    its own result or error independently.
    """
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    results: list[BatchPredictionItem] = []

    for idx, record in enumerate(request.records):
        item_request_id = str(uuid.uuid4())
        try:
            record_dict = record.model_dump()
            predicted_yield, clipping_applied, warnings = forecaster.predict(record_dict)
            results.append(
                BatchPredictionItem(
                    index=idx,
                    request_id=item_request_id,
                    prediction=PredictionResult(
                        target="yield",
                        value=predicted_yield,
                        non_negative_clipping_applied=clipping_applied,
                    ),
                    context=PredictionContext(
                        state=record.state,
                        district=record.district,
                        crop=record.crop,
                        season=record.season,
                        crop_year=record.crop_year,
                        area=record.area,
                    ),
                    warnings=warnings,
                )
            )
        except Exception as exc:
            logger.exception("Batch item %d error: %s", idx, exc)
            results.append(
                BatchPredictionItem(
                    index=idx,
                    request_id=item_request_id,
                    error=str(exc),
                )
            )

    return YieldPredictionBatchResponse(
        model=_model_info(),
        count=len(results),
        results=results,
    )
