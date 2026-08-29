"""
recommendation.py — Core ranking and scoring logic for the crop recommendation engine.

All ML formulas live here:
  historical_score = 0.50 × yield_score + 0.30 × stability_score + 0.20 × experience_score

The CSV already contains precomputed scores (fast path).
Scalers are used only for startup validation and the /explain endpoint.
"""

import logging
from dataclasses import dataclass

import pandas as pd

from services.crop.artifact_loader import crop_artifacts

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data structures (used by routes, not Pydantic — Pydantic lives in schemas)
# ---------------------------------------------------------------------------
@dataclass
class ScoreBreakdown:
    yield_score:      float
    stability_score:  float
    experience_score: float
    historical_score: float
    # Weighted contributions
    yield_contribution:      float
    stability_contribution:  float
    experience_contribution: float
    # Raw historical features
    median_yield:     float
    mean_yield:       float
    max_yield:        float
    min_yield:        float
    yield_std:        float
    mean_area:        float
    years_cultivated: int
    yield_cv:         float


@dataclass
class RankedCrop:
    rank:           int
    crop:           str
    breakdown:      ScoreBreakdown
    stability_label: str
    trend_label:    str


# ---------------------------------------------------------------------------
# Label helpers
# ---------------------------------------------------------------------------
_YIELD_WEIGHT      = 0.50
_STABILITY_WEIGHT  = 0.30
_EXPERIENCE_WEIGHT = 0.20


def stability_label(cv: float) -> str:
    if cv < 0.15:
        return "High"
    if cv < 0.30:
        return "Medium"
    return "Low"


def trend_label(yield_score: float) -> str:
    if yield_score >= 0.65:
        return "Improving"
    if yield_score >= 0.40:
        return "Stable"
    return "Declining"


def _build_breakdown(row: pd.Series) -> ScoreBreakdown:
    ys  = float(row["yield_score"])
    ss  = float(row["stability_score"])
    es  = float(row["experience_score"])
    hs  = float(row["historical_score"])
    return ScoreBreakdown(
        yield_score=round(ys, 4),
        stability_score=round(ss, 4),
        experience_score=round(es, 4),
        historical_score=round(hs, 4),
        yield_contribution=round(ys * _YIELD_WEIGHT, 4),
        stability_contribution=round(ss * _STABILITY_WEIGHT, 4),
        experience_contribution=round(es * _EXPERIENCE_WEIGHT, 4),
        median_yield=round(float(row["median_yield"]), 4),
        mean_yield=round(float(row["mean_yield"]), 4),
        max_yield=round(float(row["max_yield"]), 4),
        min_yield=round(float(row["min_yield"]), 4),
        yield_std=round(float(row["yield_std"]), 4),
        mean_area=round(float(row["mean_area"]), 2),
        years_cultivated=int(row["years_cultivated"]),
        yield_cv=round(float(row["yield_cv"]), 4),
    )


# ---------------------------------------------------------------------------
# Core ranking function
# ---------------------------------------------------------------------------
def rank_crops(candidates: pd.DataFrame, top_k: int) -> list[RankedCrop]:
    """
    Sort candidates by historical_score descending and return top-K ranked crops.
    Uses precomputed scores from the CSV (fast path).
    """
    sorted_df = candidates.sort_values("historical_score", ascending=False)
    top = sorted_df.head(top_k)

    results: list[RankedCrop] = []
    for rank, (_, row) in enumerate(top.iterrows(), start=1):
        bd = _build_breakdown(row)
        results.append(RankedCrop(
            rank=rank,
            crop=str(row["crop"]),
            breakdown=bd,
            stability_label=stability_label(bd.yield_cv),
            trend_label=trend_label(bd.yield_score),
        ))
    return results


def rank_within(candidates: pd.DataFrame, crop_name: str) -> int:
    """Return the 1-based rank of crop_name within the sorted candidate list."""
    sorted_df = candidates.sort_values("historical_score", ascending=False).reset_index(drop=True)
    norm = crop_artifacts.normalize(crop_name)
    matches = sorted_df[sorted_df["crop"].str.lower() == norm]
    if matches.empty:
        return -1
    return int(matches.index[0]) + 1


# ---------------------------------------------------------------------------
# Explain-mode: score weights metadata for API response
# ---------------------------------------------------------------------------
def weight_info() -> dict:
    return {
        "yield":      {"weight": _YIELD_WEIGHT,      "description": "Median historical yield (normalized)"},
        "stability":  {"weight": _STABILITY_WEIGHT,  "description": "Yield consistency (1 − normalized CV)"},
        "experience": {"weight": _EXPERIENCE_WEIGHT, "description": "Years of cultivation history (normalized)"},
        "formula":    "historical_score = 0.50 × yield + 0.30 × stability + 0.20 × experience",
    }


def history_quality_label(years: int) -> str:
    if years >= 10:
        return "strong"
    if years >= 5:
        return "moderate"
    return "limited"
