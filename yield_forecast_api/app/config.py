"""
config.py — Central configuration for the Yield Forecast API.
All paths and constants in one place so nothing is hardcoded elsewhere.
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = Path(__file__).resolve().parent.parent   # yield_forecast_api/
MODEL_DIR  = BASE_DIR / "model"

MODEL_CBM_PATH      = MODEL_DIR / "model_2_future_yield.cbm"
METADATA_PATH       = MODEL_DIR / "model_2_metadata.json"
FEATURE_CONFIG_PATH = MODEL_DIR / "model_2_feature_config.json"

# ---------------------------------------------------------------------------
# API versioning
# ---------------------------------------------------------------------------
API_V1_PREFIX = "/api/v1"

# ---------------------------------------------------------------------------
# Model constants (mirrors feature_config.json — kept here for fast access)
# ---------------------------------------------------------------------------
FEATURE_ORDER = [
    "state",
    "district",
    "crop",
    "season",
    "crop_year",
    "area",
    "yield_lag_1",
    "yield_lag_2",
    "yield_lag_3",
    "historical_mean_yield",
    "historical_median_yield",
    "historical_std_yield",
    "yield_change_1",
    "yield_change_2",
    "yield_growth_rate",
    "historical_cv",
]

CATEGORICAL_FEATURES = ["state", "district", "crop", "season"]
FORBIDDEN_FEATURES   = ["production", "yield"]

# Year the model was trained through (extrapolation warning threshold)
TRAINING_END_YEAR = 2017
