"""
config.py — Merged configuration for the Agriculture ML API.
Covers both Model 5 (Plant Disease / EfficientNet-B0)
and Model 2 (Crop Recommendation Engine).

All tunable constants live here. Nothing is hard-coded elsewhere.
Override device with: DEVICE=cuda (env var)
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Root paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent          # agriculture_api/
REPO_ROOT = BASE_DIR.parent                               # sih'26/

# ---------------------------------------------------------------------------
# Model 5 — Plant Disease Detection
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
MAX_FILE_SIZE_MB    = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
MIN_IMAGE_PIXELS    = 32 * 32
MAX_ASPECT_RATIO    = 20.0

# Calibration defaults (overridden by calibration.json if present)
DEFAULT_TEMPERATURE           = 1.0
DEFAULT_CONFIDENCE_THRESHOLD  = 0.70
DEFAULT_MARGIN_THRESHOLD      = 0.15

# Top-K predictions returned in the response
TOP_K_PREDICTIONS = 3

# ---------------------------------------------------------------------------
# Model 2 — Crop Recommendation Engine
# ---------------------------------------------------------------------------
CROP_ARTIFACTS_DIR        = REPO_ROOT / "model_2_artifacts"

CROP_CONFIG_PATH          = CROP_ARTIFACTS_DIR / "model_2_config.pkl"
CROP_DATA_PATH            = CROP_ARTIFACTS_DIR / "model_2_recommendation_data.csv"
YIELD_SCALER_PATH         = CROP_ARTIFACTS_DIR / "yield_scaler.pkl"
STABILITY_SCALER_PATH     = CROP_ARTIFACTS_DIR / "stability_scaler.pkl"
EXPERIENCE_SCALER_PATH    = CROP_ARTIFACTS_DIR / "experience_scaler.pkl"

DEFAULT_CROP_TOP_K        = 5
MAX_CROP_TOP_K            = 20

# ---------------------------------------------------------------------------
# Inference device — override with env var: DEVICE=cuda
# ---------------------------------------------------------------------------
DEVICE = os.getenv("DEVICE", "cpu")

# ---------------------------------------------------------------------------
# API metadata
# ---------------------------------------------------------------------------
API_TITLE   = "Agriculture ML API"
API_VERSION = "1.0.0"
API_V1      = "/api/v1"
