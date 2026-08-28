"""
predictor.py — Feature engineering for the /predict-yield/from-history endpoint.

When the backend only has raw historical yield records (not pre-computed lag
features), this module derives all 10 historical features from those records
so the CatBoost model can be called without manual feature construction.
"""

import statistics
from typing import Any


def compute_historical_features(
    historical_yields: list[float],
) -> dict[str, float]:
    """
    Derive all 10 historical features from a list of raw yield values.

    historical_yields must be ordered OLDEST → NEWEST.
    The last entry is yield_lag_1 (most recent prior year),
    the second-to-last is yield_lag_2, etc.

    Args:
        historical_yields: At least 3 prior-year yield values (oldest first).

    Returns:
        Dict with all 10 historical feature keys.

    Raises:
        ValueError: If fewer than 3 prior observations are provided.
    """
    if len(historical_yields) < 3:
        raise ValueError(
            f"At least 3 historical yield observations are required. "
            f"Got {len(historical_yields)}."
        )

    # Lag features: most recent = lag_1
    lag_1 = float(historical_yields[-1])
    lag_2 = float(historical_yields[-2])
    lag_3 = float(historical_yields[-3])

    # Aggregates over the full provided history
    mean_yield   = statistics.mean(historical_yields)
    median_yield = statistics.median(historical_yields)
    std_yield    = statistics.stdev(historical_yields) if len(historical_yields) > 1 else 0.0

    # Yield changes
    change_1 = lag_1 - lag_2    # most recent delta
    change_2 = lag_2 - lag_3    # one step older delta

    # Growth rate: (lag_1 - lag_3) / lag_3  — guard zero division
    growth_rate = (lag_1 - lag_3) / lag_3 if lag_3 != 0 else 0.0

    # Coefficient of variation: std / mean — guard zero division
    cv = std_yield / mean_yield if mean_yield != 0 else 0.0

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
