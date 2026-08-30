"""
config.py — Unified configuration for the Agriculture ML API (all 3 models).
=============================================================================
Covers:
  Model 1 — CatBoost Future Yield Forecaster      (yield_forecast_api/)
  Model 2 — Crop Recommendation Engine             (model_2_artifacts/)
  Model 5 — Plant Disease Detection (EfficientNet) (model_5_plant_disease_final/)

All artifact paths point to their original locations in the repo root —
no files are copied.  Override DEVICE with: DEVICE=cuda (env var).
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Repo root  (models_fastapi/ lives one level below the repo root)
# ---------------------------------------------------------------------------
BASE_DIR  = Path(__file__).resolve().parent.parent   # …/models_fastapi/
REPO_ROOT = BASE_DIR.parent                          # …/sih'26/

# ---------------------------------------------------------------------------
# Model 5 — Plant Disease Detection (EfficientNet-B0)
# ---------------------------------------------------------------------------
DISEASE_ARTIFACTS_DIR   = REPO_ROOT / "model_5_plant_disease_final"

MODEL_PTH_PATH          = DISEASE_ARTIFACTS_DIR / "plant_disease_model_efficientnet_b0.pth"
CLASS_MAPPING_PATH      = DISEASE_ARTIFACTS_DIR / "class_mapping.json"
PREPROCESSING_CFG_PATH  = DISEASE_ARTIFACTS_DIR / "preprocessing_config.json"
CALIBRATION_PATH        = DISEASE_ARTIFACTS_DIR / "calibration.json"
DISEASE_METADATA_PATH   = DISEASE_ARTIFACTS_DIR / "model_metadata.json"

# Architecture
NUM_CLASSES = 38
IMAGE_SIZE  = 224
IMAGE_MEAN  = [0.485, 0.456, 0.406]   # ImageNet mean
IMAGE_STD   = [0.229, 0.224, 0.225]   # ImageNet std

# Image validation
ALLOWED_EXTENSIONS  = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES  = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB    = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
MIN_IMAGE_PIXELS    = 32 * 32
MAX_ASPECT_RATIO    = 20.0

# Calibration defaults (overridden by calibration.json if present)
DEFAULT_TEMPERATURE           = 1.0
DEFAULT_CONFIDENCE_THRESHOLD  = 0.70
DEFAULT_MARGIN_THRESHOLD      = 0.15

# Top-K predictions returned in the disease response
TOP_K_PREDICTIONS = 3

# ---------------------------------------------------------------------------
# Model 2 — Crop Recommendation Engine
# ---------------------------------------------------------------------------
CROP_ARTIFACTS_DIR     = REPO_ROOT / "model_2_artifacts"

CROP_CONFIG_PATH       = CROP_ARTIFACTS_DIR / "model_2_config.pkl"
CROP_DATA_PATH         = CROP_ARTIFACTS_DIR / "model_2_recommendation_data.csv"
YIELD_SCALER_PATH      = CROP_ARTIFACTS_DIR / "yield_scaler.pkl"
STABILITY_SCALER_PATH  = CROP_ARTIFACTS_DIR / "stability_scaler.pkl"
EXPERIENCE_SCALER_PATH = CROP_ARTIFACTS_DIR / "experience_scaler.pkl"

DEFAULT_CROP_TOP_K = 5
MAX_CROP_TOP_K     = 20

# ---------------------------------------------------------------------------
# Model 1 — CatBoost Future Yield Forecaster
# ---------------------------------------------------------------------------
YIELD_MODEL_DIR         = (REPO_ROOT / "model_2_future_yield") if (REPO_ROOT / "model_2_future_yield").exists() else (REPO_ROOT / "yield_forecast_api" / "model")

MODEL_CBM_PATH          = YIELD_MODEL_DIR / "model_2_future_yield.cbm"
YIELD_METADATA_PATH     = YIELD_MODEL_DIR / "model_2_metadata.json"
FEATURE_CONFIG_PATH     = YIELD_MODEL_DIR / "model_2_feature_config.json"

# Feature order the CatBoost model was trained with (must NOT change)
YIELD_FEATURE_ORDER = [
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

YIELD_CATEGORICAL_FEATURES = ["state", "district", "crop", "season"]
YIELD_FORBIDDEN_FEATURES   = ["production", "yield"]

# Year the model was trained through (used for extrapolation warning)
TRAINING_END_YEAR = 2017

# ---------------------------------------------------------------------------
# Model 3 V3 — Zero-Production Risk (CatBoostClassifier + Isotonic Calibrator)
# ---------------------------------------------------------------------------
_m3_nested = REPO_ROOT / "model_3_v3_production" / "model_3_v3_production"
MODEL3_ARTIFACTS_DIR    = _m3_nested if _m3_nested.exists() else (REPO_ROOT / "model_3_v3_production")

MODEL3_CBM_PATH         = MODEL3_ARTIFACTS_DIR / "model_3_v3_catboost.cbm"
MODEL3_CALIBRATOR_PATH  = MODEL3_ARTIFACTS_DIR / "model_3_v3_isotonic_calibrator.joblib"
MODEL3_SCHEMA_PATH      = MODEL3_ARTIFACTS_DIR / "model_3_v3_feature_schema.json"

# Artifact / model version
MODEL3_VERSION           = "3.0.0"

# "calibrated" or "raw" — UNRESOLVED (see model_3_api/README.md).
# Must be confirmed against training/eval code before production use.
MODEL3_THRESHOLD_APPLIES_TO = os.getenv("THRESHOLD_APPLIES_TO", "calibrated").lower()
if MODEL3_THRESHOLD_APPLIES_TO not in ("calibrated", "raw"):
    MODEL3_THRESHOLD_APPLIES_TO = "calibrated"  # safe fallback if env var has invalid value

# Debug mode — when True, raw exception messages are returned to API callers
MODEL3_DEBUG_MODE = os.getenv("DEBUG_MODE", "0") == "1"

# ---------------------------------------------------------------------------
# Inference device — override with env var: DEVICE=cuda
# ---------------------------------------------------------------------------
DEVICE = os.getenv("DEVICE", "cpu")

# ---------------------------------------------------------------------------
# API metadata
# ---------------------------------------------------------------------------
API_TITLE   = "Agriculture ML API — Unified"
API_VERSION = "2.0.0"
API_V1      = "/api/v1"
