"""
feature_derivation.py — Server-side derivation of 4 features for Model 3 V3.

CatBoost expects 35 features; callers send 31 base fields. The 4 remaining
are computed here from the base fields, so client values can never contradict them.

⚠️ UNVERIFIED AGAINST TRAINING CODE — see comments below.
These formulas are best-guess reconstructions from field names alone.
log_area might be log(area) or log1p(area*unit_conversion).
Zero-denominator handling may differ from training. Verify before production.
"""

import logging

import numpy as np

logger = logging.getLogger("model_3_v3.feature_derivation")

CV_AREA_ZERO_MEAN_DEFAULT    = 0.0
AREA_VS_MEAN_ZERO_MEAN_DEFAULT = 1.0


def _safe_ratio(numerator: float, denominator: float, default: float, feature_name: str) -> float:
    if denominator == 0:
        logger.warning(
            "%s: zero denominator (numerator=%s) — using fallback default=%s. "
            "This fallback is unverified against training; see feature_derivation.py.",
            feature_name, numerator, default,
        )
        return default
    return numerator / denominator


def derive_log_area(area: float) -> float:
    """UNVERIFIED formula: log1p(area). Confirm against training code."""
    return float(np.log1p(area))


def derive_district_crop_cv_area(district_crop_std_area: float, district_crop_mean_area: float) -> float:
    """UNVERIFIED formula: std_area / mean_area, 0.0 if mean_area == 0."""
    return _safe_ratio(
        district_crop_std_area, district_crop_mean_area,
        default=CV_AREA_ZERO_MEAN_DEFAULT, feature_name="district_crop_cv_area",
    )


def derive_area_vs_recent_3yr_mean(area: float, recent_3yr_area_mean: float) -> float:
    """UNVERIFIED formula: area / recent_3yr_area_mean, 1.0 if mean == 0."""
    return _safe_ratio(
        area, recent_3yr_area_mean,
        default=AREA_VS_MEAN_ZERO_MEAN_DEFAULT, feature_name="area_vs_recent_3yr_mean",
    )


def derive_area_vs_recent_5yr_mean(area: float, recent_5yr_area_mean: float) -> float:
    """UNVERIFIED formula: area / recent_5yr_area_mean, 1.0 if mean == 0."""
    return _safe_ratio(
        area, recent_5yr_area_mean,
        default=AREA_VS_MEAN_ZERO_MEAN_DEFAULT, feature_name="area_vs_recent_5yr_mean",
    )


def derive_all(row: dict) -> dict:
    """Takes a validated request field dict, returns it enriched with the 4 derived features."""
    row = dict(row)
    row["log_area"] = derive_log_area(row["area"])
    row["district_crop_cv_area"] = derive_district_crop_cv_area(
        row["district_crop_std_area"], row["district_crop_mean_area"]
    )
    row["area_vs_recent_3yr_mean"] = derive_area_vs_recent_3yr_mean(row["area"], row["recent_3yr_area_mean"])
    row["area_vs_recent_5yr_mean"] = derive_area_vs_recent_5yr_mean(row["area"], row["recent_5yr_area_mean"])
    return row
