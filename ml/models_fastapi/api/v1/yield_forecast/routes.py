"""
yield_forecast/routes.py — CatBoost Yield Prediction endpoints (Model 1).

POST /api/v1/predict-yield               — full 16-feature inference
POST /api/v1/predict-yield/from-history  — auto-derive historical features
POST /api/v1/predict-yield/batch         — batch inference (up to 100 records)
"""

import logging
import statistics
import uuid

from fastapi import APIRouter, HTTPException

from core.config import API_V1, YIELD_FEATURE_ORDER, TRAINING_END_YEAR
from models.yield_model import forecaster
from schemas.yield_forecast import (
    BatchPredictionItem,
    FromHistoryRequest,
    PredictionContext,
    PredictionResult,
    YieldErrorDetail,
    YieldModelInfo,
    YieldPredictionBatchRequest,
    YieldPredictionBatchResponse,
    YieldPredictionRequest,
    YieldPredictionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}", tags=["Yield Forecast — Inference"])


# ---------------------------------------------------------------------------
# Helper: build YieldModelInfo from loaded metadata
# ---------------------------------------------------------------------------
def _model_info() -> YieldModelInfo:
    meta = forecaster.metadata
    return YieldModelInfo(
        id=meta.get("model_id", "model_2a"),
        name=meta.get("model_name", "CatBoost Future Yield Forecaster"),
        version=meta.get("model_id", "2A").upper(),
        algorithm=meta.get("algorithm", "CatBoostRegressor"),
    )


# ---------------------------------------------------------------------------
# Helper: compute historical features from raw yield list (oldest → newest)
# ---------------------------------------------------------------------------
def _compute_historical_features(historical_yields: list[float]) -> dict:
    """
    Derive all 10 historical features from a list of raw yield values.
    historical_yields must be ordered OLDEST → NEWEST.
    """
    if len(historical_yields) < 3:
        raise ValueError(
            f"At least 3 historical yield observations are required. "
            f"Got {len(historical_yields)}."
        )

    lag_1 = float(historical_yields[-1])
    lag_2 = float(historical_yields[-2])
    lag_3 = float(historical_yields[-3])

    mean_yield   = statistics.mean(historical_yields)
    median_yield = statistics.median(historical_yields)
    std_yield    = statistics.stdev(historical_yields) if len(historical_yields) > 1 else 0.0

    change_1 = lag_1 - lag_2
    change_2 = lag_2 - lag_3

    growth_rate = (lag_1 - lag_3) / lag_3 if lag_3 != 0 else 0.0
    cv          = std_yield / mean_yield if mean_yield != 0 else 0.0

    return {
        "yield_lag_1":            round(lag_1, 4),
        "yield_lag_2":            round(lag_2, 4),
        "yield_lag_3":            round(lag_3, 4),
        "historical_mean_yield":   round(mean_yield, 4),
        "historical_median_yield": round(median_yield, 4),
        "historical_std_yield":    round(std_yield, 4),
        "yield_change_1":          round(change_1, 4),
        "yield_change_2":          round(change_2, 4),
        "yield_growth_rate":       round(growth_rate, 6),
        "historical_cv":           round(cv, 6),
    }


# ---------------------------------------------------------------------------
# POST /api/v1/predict-yield  — main inference endpoint
# ---------------------------------------------------------------------------
@router.post(
    "/predict-yield",
    response_model=YieldPredictionResponse,
    summary="Predict future crop yield (full 16-feature request)",
    description=(
        "**Main inference endpoint.**\n\n"
        "Accepts all 16 model features and returns the CatBoost predicted yield.\n\n"
        "The 10 historical features (yield lags, aggregates, trend) must be "
        "pre-computed by the calling backend from verified historical yield records. "
        "They MUST reflect years strictly prior to `crop_year` — never include the "
        "target year's actual yield (target leakage).\n\n"
        "Returns predicted yield in dataset units, with:\n"
        "- Non-negative clipping flag if raw prediction was < 0\n"
        "- Temporal extrapolation warning if crop_year > training end year (2017)"
    ),
)
def predict_yield(request: YieldPredictionRequest):
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Yield model not ready")

    request_id   = str(uuid.uuid4())
    request_dict = request.model_dump()

    try:
        predicted_yield, clipping_applied, warnings = forecaster.predict(request_dict)
    except Exception as exc:
        logger.exception("Inference error for request_id=%s: %s", request_id, exc)
        raise HTTPException(
            status_code=500,
            detail=YieldErrorDetail(
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
@router.post(
    "/predict-yield/from-history",
    response_model=YieldPredictionResponse,
    summary="Predict future yield (auto-derive historical features from raw records)",
    description=(
        "**High-level inference endpoint.**\n\n"
        "Instead of manually computing lag/aggregate features, provide a list of "
        "raw historical yield values (oldest → newest). The ML service will:\n\n"
        "1. Derive all 10 historical features automatically.\n"
        "2. Call the CatBoost model.\n"
        "3. Return the predicted yield.\n\n"
        "Requires at least 3 historical yield values."
    ),
)
def predict_yield_from_history(request: FromHistoryRequest):
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Yield model not ready")

    if len(request.historical_yields) < 3:
        raise HTTPException(
            status_code=422,
            detail=YieldErrorDetail(
                code="INSUFFICIENT_HISTORY",
                message="At least 3 historical yield values are required.",
            ).model_dump(),
        )

    try:
        hist_features = _compute_historical_features(request.historical_yields)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=YieldErrorDetail(
                code="FEATURE_ENGINEERING_ERROR",
                message=str(e),
            ).model_dump(),
        )

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
            detail=YieldErrorDetail(
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
@router.post(
    "/predict-yield/batch",
    response_model=YieldPredictionBatchResponse,
    summary="Batch yield prediction (up to 100 records)",
    description=(
        "**Batch inference endpoint.**\n\n"
        "Send up to 100 prediction requests in a single call. "
        "Useful when the agentic layer wants to evaluate multiple crops at once.\n\n"
        "Individual errors do not fail the entire batch — each record reports "
        "its own result or error independently."
    ),
)
def predict_yield_batch(request: YieldPredictionBatchRequest):
    if not forecaster.loaded:
        raise HTTPException(status_code=503, detail="Yield model not ready")

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
