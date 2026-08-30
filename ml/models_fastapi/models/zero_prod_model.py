"""
zero_prod_model.py — CatBoost + Isotonic Calibrator singleton for Model 3 V3.

Loads the model and calibrator once at lifespan startup.
Exposes predict_one() and predict_batch() used by the API routes.
"""

import json
import logging
import os
import uuid

import joblib
import pandas as pd
from catboost import CatBoostClassifier

from core.config import (
    MODEL3_CBM_PATH,
    MODEL3_CALIBRATOR_PATH,
    MODEL3_SCHEMA_PATH,
    MODEL3_THRESHOLD_APPLIES_TO,
    MODEL3_VERSION,
)
from schemas.zero_production import BatchResultItem, ZeroProductionRequest, ZeroProductionResponse
from services.zero_production.feature_derivation import derive_all

logger = logging.getLogger("model_3_v3")


def _risk_level(calibrated_prob: float) -> str:
    """Product-level interpretation band — NOT a validated risk category."""
    if calibrated_prob < 0.20:
        return "LOW"
    if calibrated_prob < 0.50:
        return "MODERATE"
    if calibrated_prob < 0.75:
        return "HIGH"
    if calibrated_prob < 0.90:
        return "VERY_HIGH"
    return "CRITICAL"


class ZeroProductionModel:
    """
    Wraps the trained CatBoostClassifier and its isotonic calibrator.
    Loaded once at startup via the unified lifespan() in main.py.
    """

    def __init__(self) -> None:
        self.schema:               dict = {}
        self.feature_order:        list[str] = []
        self.categorical_features: list[str] = []
        self.threshold:            float = 0.9
        self.threshold_applies_to: str = MODEL3_THRESHOLD_APPLIES_TO
        self.model_version:        str = MODEL3_VERSION
        self._model:               CatBoostClassifier | None = None
        self._calibrator                                       = None
        self.loaded:               bool = False

    def load(self) -> None:
        """Load model, calibrator, and feature schema from disk."""
        logger.info("[Model 3] Loading feature schema from: %s", MODEL3_SCHEMA_PATH)
        with open(MODEL3_SCHEMA_PATH, "r") as f:
            self.schema = json.load(f)

        self.feature_order        = self.schema["features"]
        self.categorical_features = self.schema["categorical_features"]
        self.threshold            = self.schema["raw_classification_threshold"]

        logger.info("[Model 3] Loading CatBoost classifier from: %s", MODEL3_CBM_PATH)
        self._model = CatBoostClassifier()
        self._model.load_model(str(MODEL3_CBM_PATH))

        logger.info("[Model 3] Loading isotonic calibrator from: %s", MODEL3_CALIBRATOR_PATH)
        self._calibrator = joblib.load(str(MODEL3_CALIBRATOR_PATH))

        # Safety: prefer the model's own feature name list if present
        model_features = list(getattr(self._model, "feature_names_", []) or [])
        if model_features and model_features != self.feature_order:
            logger.warning(
                "[Model 3] Model's internal feature order differs from schema; "
                "using model's own order for safe inference."
            )
            self.feature_order = model_features

        logger.info(
            "[Model 3] Ready  threshold=%.3f  applies_to=%s  model_version=%s",
            self.threshold, self.threshold_applies_to, self.model_version,
        )
        self.loaded = True

    @property
    def calibrator(self):
        return self._calibrator

    def _enrich(self, record: ZeroProductionRequest) -> dict:
        return derive_all(record.model_dump())

    def _to_frame(self, row: dict) -> pd.DataFrame:
        ordered = {col: row[col] for col in self.feature_order}
        df = pd.DataFrame([ordered])
        for col in self.categorical_features:
            df[col] = df[col].astype(str)
        return df

    def _decide(self, raw_prob: float, calibrated_prob: float) -> tuple[bool, str]:
        decision_prob = calibrated_prob if self.threshold_applies_to == "calibrated" else raw_prob
        return decision_prob >= self.threshold, _risk_level(calibrated_prob)

    def predict_one(
        self, record: ZeroProductionRequest, request_id: str | None = None
    ) -> ZeroProductionResponse:
        if not self.loaded:
            raise RuntimeError("Model 3 not loaded — call load() first.")

        row           = self._enrich(record)
        df            = self._to_frame(row)
        raw_prob      = float(self._model.predict_proba(df)[:, 1][0])
        calibrated    = float(self._calibrator.predict([raw_prob])[0])
        flag, risk    = self._decide(raw_prob, calibrated)

        return ZeroProductionResponse(
            request_id=request_id or str(uuid.uuid4()),
            model_version=self.model_version,
            raw_probability=raw_prob,
            calibrated_probability=calibrated,
            zero_production_flag=flag,
            threshold_used=self.threshold,
            threshold_applies_to=self.threshold_applies_to,
            risk_level=risk,
        )

    def predict_batch(
        self, records: list[ZeroProductionRequest], request_id: str | None = None
    ) -> list[BatchResultItem]:
        if not self.loaded:
            raise RuntimeError("Model 3 not loaded — call load() first.")
        if not records:
            return []

        rows         = [self._enrich(r) for r in records]
        ordered_rows = [{col: row[col] for col in self.feature_order} for row in rows]
        df           = pd.DataFrame(ordered_rows)
        for col in self.categorical_features:
            df[col] = df[col].astype(str)

        raw_probs        = self._model.predict_proba(df)[:, 1]
        calibrated_probs = self._calibrator.predict(raw_probs)

        results: list[BatchResultItem] = []
        for i, (rp, cp) in enumerate(zip(raw_probs, calibrated_probs)):
            flag, risk = self._decide(float(rp), float(cp))
            results.append(BatchResultItem(
                index=i,
                request_id=request_id or str(uuid.uuid4()),
                model_version=self.model_version,
                raw_probability=float(rp),
                calibrated_probability=float(cp),
                zero_production_flag=flag,
                threshold_used=self.threshold,
                threshold_applies_to=self.threshold_applies_to,
                risk_level=risk,
            ))
        return results


# Single global instance
zero_prod_model = ZeroProductionModel()
