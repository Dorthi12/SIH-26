"""
yield_model.py — CatBoost Yield Forecaster singleton loader (Model 1).

Loads the trained .cbm file ONCE at startup and holds it in memory.
Never retrained per request.
"""

import json
import logging
from pathlib import Path

import pandas as pd
from catboost import CatBoostRegressor

from core.config import (
    FEATURE_CONFIG_PATH,
    YIELD_FEATURE_ORDER,
    YIELD_METADATA_PATH,
    MODEL_CBM_PATH,
    TRAINING_END_YEAR,
)

logger = logging.getLogger(__name__)


class YieldForecaster:
    """
    Wraps the trained CatBoostRegressor and exposes a clean predict() interface.
    Loaded once at lifespan startup — never re-instantiated per request.
    """

    def __init__(self) -> None:
        self._model: CatBoostRegressor | None = None
        self._metadata: dict = {}
        self._feature_config: dict = {}
        self.loaded: bool = False

    def load(self) -> None:
        """Load model and config files from disk."""
        logger.info("Loading CatBoost model from: %s", MODEL_CBM_PATH)

        if not MODEL_CBM_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_CBM_PATH}")

        self._model = CatBoostRegressor()
        self._model.load_model(str(MODEL_CBM_PATH))
        logger.info("CatBoost model loaded successfully")

        with open(YIELD_METADATA_PATH, "r") as f:
            self._metadata = json.load(f)
        logger.info(
            "Yield metadata loaded: %s v%s",
            self._metadata.get("model_name"),
            self._metadata.get("model_id"),
        )

        with open(FEATURE_CONFIG_PATH, "r") as f:
            self._feature_config = json.load(f)
        logger.info(
            "Yield feature config loaded: %d features",
            len(self._feature_config.get("features", [])),
        )

        self.loaded = True

    @property
    def metadata(self) -> dict:
        return self._metadata

    @property
    def feature_config(self) -> dict:
        return self._feature_config

    def predict(self, request_data: dict) -> tuple[float, bool, list[str]]:
        """
        Run inference for a single prediction request.

        Args:
            request_data: dict with the 16 model features.

        Returns:
            (predicted_yield, clipping_applied, warnings)
        """
        if not self.loaded or self._model is None:
            raise RuntimeError("Yield model is not loaded. Call load() first.")

        warnings: list[str] = []

        # Temporal extrapolation warning
        crop_year = request_data.get("crop_year", 0)
        if crop_year > TRAINING_END_YEAR:
            warnings.append(
                f"crop_year={crop_year} is beyond the model training period "
                f"(trained through {TRAINING_END_YEAR}). "
                "Predictions may be less reliable for years far outside the training range."
            )

        # Build DataFrame in the exact feature order the model was trained with
        row = {col: [request_data[col]] for col in YIELD_FEATURE_ORDER}
        df = pd.DataFrame(row)

        # Run CatBoost inference
        raw_prediction = float(self._model.predict(df)[0])

        # Enforce non-negative constraint
        clipping_applied = raw_prediction < 0
        predicted_yield = max(0.0, raw_prediction)

        if clipping_applied:
            logger.warning(
                "Negative prediction (%.4f) clipped to 0 for crop=%s district=%s year=%d",
                raw_prediction,
                request_data.get("crop"),
                request_data.get("district"),
                crop_year,
            )

        return round(predicted_yield, 4), clipping_applied, warnings


# Single global instance — loaded once in lifespan
forecaster = YieldForecaster()
