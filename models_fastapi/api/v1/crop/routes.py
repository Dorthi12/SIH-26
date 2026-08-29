"""
crop/routes.py — Recommendation endpoints for the Crop Recommendation Engine.

POST /api/v1/crop/recommend            → top-K ranked crops for a location/season
POST /api/v1/crop/recommend/score      → score one specific crop
POST /api/v1/crop/recommend/explain    → weighted score breakdown
POST /api/v1/crop/recommend/batch      → multiple locations in one call
"""

import logging
import time
import uuid

from fastapi import APIRouter, HTTPException

from core.config import API_V1
from schemas.crop import (
    BatchRecommendRequest,
    BatchRecommendResponse,
    CropRecommendation,
    DataQuality,
    HistoricalFeatures,
    RecommendRequest,
    RecommendResponse,
    ScoreBreakdown,
    ScoreBreakdownItem,
    ScoreCropRequest,
    ScoreCropResponse,
)
from services.crop.artifact_loader import crop_artifacts
from services.crop.recommendation import (
    RankedCrop,
    history_quality_label,
    rank_crops,
    rank_within,
    weight_info,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}/crop/recommend", tags=["Crop Recommendation — Inference"])


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _require_ready():
    if not crop_artifacts.loaded:
        raise HTTPException(status_code=503, detail="Crop recommendation model not ready.")


def _validate_location(state: str, district: str, season: str):
    """Validate state → season chain. Raise 400/404 with meaningful errors."""
    if crop_artifacts.resolve_state(state) is None:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "INVALID_STATE",
                "message": (
                    f"State '{state}' is not available. "
                    "Call /api/v1/crop/options/states for valid values."
                ),
            },
        )
    if crop_artifacts.resolve_season(season) is None:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_SEASON",
                "message": (
                    f"Season '{season}' is not supported. "
                    "Call /api/v1/crop/options/seasons for valid values."
                ),
            },
        )


def _build_crop_recommendation(ranked: RankedCrop) -> CropRecommendation:
    bd = ranked.breakdown
    wi = weight_info()
    return CropRecommendation(
        rank=ranked.rank,
        crop=ranked.crop,
        historical_score=bd.historical_score,
        score_percent=round(bd.historical_score * 100, 2),
        yield_score=bd.yield_score,
        stability_score=bd.stability_score,
        experience_score=bd.experience_score,
        stability_label=ranked.stability_label,
        trend_label=ranked.trend_label,
        historical_features=HistoricalFeatures(
            median_yield=bd.median_yield,
            mean_yield=bd.mean_yield,
            max_yield=bd.max_yield,
            min_yield=bd.min_yield,
            yield_std=bd.yield_std,
            mean_area=bd.mean_area,
            years_cultivated=bd.years_cultivated,
            yield_cv=bd.yield_cv,
        ),
        score_breakdown=ScoreBreakdown(
            yield_score=ScoreBreakdownItem(
                score=bd.yield_score,
                weight=wi["yield"]["weight"],
                contribution=bd.yield_contribution,
                description=wi["yield"]["description"],
            ),
            stability_score=ScoreBreakdownItem(
                score=bd.stability_score,
                weight=wi["stability"]["weight"],
                contribution=bd.stability_contribution,
                description=wi["stability"]["description"],
            ),
            experience_score=ScoreBreakdownItem(
                score=bd.experience_score,
                weight=wi["experience"]["weight"],
                contribution=bd.experience_contribution,
                description=wi["experience"]["description"],
            ),
            formula=wi["formula"],
        ),
        data_quality=DataQuality(
            historical_years=bd.years_cultivated,
            history_quality=history_quality_label(bd.years_cultivated),
            has_sufficient_history=bd.years_cultivated >= 5,
        ),
    )


# ---------------------------------------------------------------------------
# POST /api/v1/crop/recommend
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=RecommendResponse,
    summary="Recommend top-K crops for a location and season",
    description=(
        "Given a state, district, and season, returns the top-K crops ranked by "
        "`historical_score = 0.50 × yield + 0.30 × stability + 0.20 × experience`.\n\n"
        "**`historical_score` is NOT a probability** — it is a composite ranking score "
        "derived from historical agricultural data. Do not present it as a success "
        "probability to farmers.\n\n"
        "Call `/api/v1/crop/options/states` and `/api/v1/crop/options/districts` "
        "to discover valid values."
    ),
)
def recommend(req: RecommendRequest):
    _require_ready()
    t_start = time.perf_counter()
    _validate_location(req.state, req.district, req.season)

    candidates = crop_artifacts.filter(req.state, req.district, req.season)
    if candidates.empty:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NO_DATA",
                "message": (
                    f"No historical crop data found for "
                    f"state='{req.state}', district='{req.district}', season='{req.season}'. "
                    "Check /api/v1/crop/options for valid combinations."
                ),
            },
        )

    ranked          = rank_crops(candidates, req.top_k)
    recommendations = [_build_crop_recommendation(r) for r in ranked]

    latency_ms = round((time.perf_counter() - t_start) * 1000, 1)
    logger.info(
        "crop/recommend | state=%s | district=%s | season=%s | "
        "candidates=%d | returned=%d | %sms",
        req.state, req.district, req.season,
        len(candidates), len(recommendations), latency_ms,
    )

    return RecommendResponse(
        model_name=crop_artifacts.config.get("model_name", "Crop Recommendation Engine"),
        model_version=crop_artifacts.config.get("model_version", "1.0"),
        request={"state": req.state, "district": req.district,
                 "season": req.season, "top_k": req.top_k},
        candidate_count=len(candidates),
        returned_count=len(recommendations),
        recommendations=recommendations,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/crop/recommend/score
# ---------------------------------------------------------------------------
@router.post(
    "/score",
    response_model=ScoreCropResponse,
    summary="Score a specific crop for a given location and season",
    description=(
        "Returns the historical score and full breakdown for one specific crop. "
        "Useful when the farmer asks: 'How does Wheat do in my district?'"
    ),
)
def score_crop(req: ScoreCropRequest):
    _require_ready()
    _validate_location(req.state, req.district, req.season)

    candidates = crop_artifacts.filter(req.state, req.district, req.season)
    if candidates.empty:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NO_DATA",
                "message": (
                    f"No data for state='{req.state}', "
                    f"district='{req.district}', season='{req.season}'."
                ),
            },
        )

    norm      = crop_artifacts.normalize(req.crop)
    crop_rows = candidates[candidates["crop"].str.lower() == norm]

    if crop_rows.empty:
        available = sorted(candidates["crop"].tolist())
        return ScoreCropResponse(
            model_name=crop_artifacts.config.get("model_name", "Crop Recommendation Engine"),
            model_version=crop_artifacts.config.get("model_version", "1.0"),
            request={"state": req.state, "district": req.district,
                     "season": req.season, "crop": req.crop},
            found=False,
            message=f"Crop '{req.crop}' has no historical data for this location/season.",
            available_crops=available,
        )

    crop_rank = rank_within(candidates, req.crop)
    ranked    = rank_crops(crop_rows, top_k=1)
    ranked[0].rank = crop_rank
    recommendation = _build_crop_recommendation(ranked[0])

    return ScoreCropResponse(
        model_name=crop_artifacts.config.get("model_name", "Crop Recommendation Engine"),
        model_version=crop_artifacts.config.get("model_version", "1.0"),
        request={"state": req.state, "district": req.district,
                 "season": req.season, "crop": req.crop},
        found=True,
        recommendation=recommendation,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/crop/recommend/explain
# ---------------------------------------------------------------------------
@router.post(
    "/explain",
    response_model=ScoreCropResponse,
    summary="Explain the recommendation score for a specific crop",
    description=(
        "Same as `/score` but emphasises the `score_breakdown` field showing "
        "how yield, stability, and experience individually contribute to the final "
        "`historical_score`. Useful for the agent to generate human-readable explanations."
    ),
)
def explain_crop(req: ScoreCropRequest):
    # explain is identical to score — the detailed breakdown is always returned
    return score_crop(req)


# ---------------------------------------------------------------------------
# POST /api/v1/crop/recommend/batch
# ---------------------------------------------------------------------------
@router.post(
    "/batch",
    response_model=BatchRecommendResponse,
    summary="Batch crop recommendations for multiple locations",
    description=(
        "Submit up to 20 location+season combinations in a single request. "
        "Each entry in `results` mirrors a single `/recommend` response. "
        "Entries with no data are included with `recommendations: []` and an error detail."
    ),
)
def batch_recommend(req: BatchRecommendRequest):
    _require_ready()
    results = []

    for sub in req.requests:
        try:
            result = recommend(sub)
            results.append(result.model_dump())
        except HTTPException as exc:
            results.append({
                "success": False,
                "request": {"state": sub.state, "district": sub.district,
                            "season": sub.season, "top_k": sub.top_k},
                "error": exc.detail,
            })

    return BatchRecommendResponse(results=results)
