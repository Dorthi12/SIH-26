"""
prediction.py — Confidence decision layer for plant disease inference.

Applies uncertainty thresholds to produce a final prediction status:
  "prediction" — model is confident and the top-1/top-2 margin is wide
  "uncertain"  — confidence or margin is below threshold

Thresholds are read from calibration.json at startup via DiseaseModel.
They can be updated without touching this file.
"""

import logging

from models.disease_model import disease_model
from services.disease.inference import InferenceResult

logger = logging.getLogger(__name__)


class PredictionStatus:
    PREDICTION = "prediction"
    UNCERTAIN  = "uncertain"


def decide(result: InferenceResult) -> tuple[str, str | None]:
    """
    Apply confidence + margin thresholds to determine prediction status.

    Returns:
        (status, message | None)
        - status:  PredictionStatus.PREDICTION or PredictionStatus.UNCERTAIN
        - message: farmer-facing explanation when uncertain, else None
    """
    conf   = result.top1.confidence
    margin = result.prediction_margin

    conf_ok   = conf   >= disease_model.confidence_threshold
    margin_ok = margin >= disease_model.margin_threshold

    if conf_ok and margin_ok:
        logger.debug(
            "Decision: PREDICTION  conf=%.4f>=%.2f  margin=%.4f>=%.2f",
            conf, disease_model.confidence_threshold,
            margin, disease_model.margin_threshold,
        )
        return PredictionStatus.PREDICTION, None

    # Build a helpful uncertain message
    if not conf_ok and not margin_ok:
        msg = (
            f"The model could not classify this image with sufficient confidence "
            f"(confidence: {conf:.0%}, margin: {margin:.0%}). "
            "Please upload a clearer, well-lit photograph of the affected leaf."
        )
    elif not conf_ok:
        msg = (
            f"Confidence too low ({conf:.0%}) for a reliable prediction. "
            "Please upload a closer or better-lit image of the leaf."
        )
    else:
        # Margin too low — model is torn between two diseases
        top2_disease = result.top_k[1].disease if len(result.top_k) > 1 else "another class"
        msg = (
            f"The model is uncertain between '{result.top1.disease}' and "
            f"'{top2_disease}' (margin: {margin:.0%}). "
            "Please upload a higher-quality image or show the underside of the leaf."
        )

    logger.debug("Decision: UNCERTAIN  conf=%.4f  margin=%.4f — %s", conf, margin, msg)
    return PredictionStatus.UNCERTAIN, msg
