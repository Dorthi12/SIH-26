"""
disease_model.py — EfficientNet-B0 model loader singleton.

Loads the trained .pth checkpoint ONCE at startup.
model.eval() + torch.inference_mode() — no gradients, no training state.
Never retrain, never modify weights inside this file.
"""

import json
import logging

import torch
import torch.nn as nn
from torchvision import models

from core.config import (
    CALIBRATION_PATH,
    CLASS_MAPPING_PATH,
    DEFAULT_CONFIDENCE_THRESHOLD,
    DEFAULT_MARGIN_THRESHOLD,
    DEFAULT_TEMPERATURE,
    DEVICE,
    NUM_CLASSES,
    MODEL_PTH_PATH,
)

logger = logging.getLogger(__name__)


class DiseaseModel:
    """
    Singleton wrapper around EfficientNet-B0 (38-class PlantVillage classifier).

    Usage:
        disease_model.load()          # once at startup
        disease_model.predict_logits(tensor)  # per request
        disease_model.calibrated_probs(logits)
    """

    def __init__(self) -> None:
        self._model: nn.Module | None = None
        self._device: torch.device = torch.device(DEVICE)
        self._idx_to_class: dict[int, str] = {}
        self._class_to_idx: dict[str, int] = {}
        self._temperature: float = DEFAULT_TEMPERATURE
        self._confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD
        self._margin_threshold: float = DEFAULT_MARGIN_THRESHOLD
        self.loaded: bool = False

    # ------------------------------------------------------------------
    # Startup
    # ------------------------------------------------------------------
    def load(self) -> None:
        """Load weights, class mapping, and calibration config from disk."""
        logger.info("Building EfficientNet-B0 architecture (%d classes)…", NUM_CLASSES)
        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, NUM_CLASSES)

        logger.info("Loading weights from: %s", MODEL_PTH_PATH)
        checkpoint = torch.load(
            str(MODEL_PTH_PATH), map_location=self._device, weights_only=True
        )
        # Support both bare state-dict and {"model_state_dict": …} wrappers
        state_dict = checkpoint.get("model_state_dict", checkpoint)
        model.load_state_dict(state_dict)
        model.to(self._device)
        model.eval()
        self._model = model
        logger.info("EfficientNet-B0 loaded on device=%s", self._device)

        # Class mapping
        with open(CLASS_MAPPING_PATH) as f:
            mapping = json.load(f)
        self._idx_to_class = {int(k): v for k, v in mapping["idx_to_class"].items()}
        self._class_to_idx = mapping["class_to_idx"]
        logger.info("Class mapping loaded: %d classes", len(self._idx_to_class))

        # Calibration (optional — uses safe defaults if calibration.json absent)
        if CALIBRATION_PATH.exists():
            with open(CALIBRATION_PATH) as f:
                cal = json.load(f)
            self._temperature          = float(cal.get("temperature", DEFAULT_TEMPERATURE))
            self._confidence_threshold = float(cal.get("confidence_threshold", DEFAULT_CONFIDENCE_THRESHOLD))
            self._margin_threshold     = float(cal.get("margin_threshold", DEFAULT_MARGIN_THRESHOLD))
            logger.info(
                "Calibration loaded: T=%.4f  conf_thresh=%.2f  margin_thresh=%.2f",
                self._temperature, self._confidence_threshold, self._margin_threshold,
            )
        else:
            logger.warning(
                "calibration.json not found — using uncalibrated defaults "
                "(T=%.1f, conf_thresh=%.2f, margin_thresh=%.2f). "
                "Run the calibration notebook to fit temperature scaling.",
                self._temperature, self._confidence_threshold, self._margin_threshold,
            )

        self.loaded = True

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------
    @property
    def temperature(self) -> float:
        return self._temperature

    @property
    def confidence_threshold(self) -> float:
        return self._confidence_threshold

    @property
    def margin_threshold(self) -> float:
        return self._margin_threshold

    @property
    def idx_to_class(self) -> dict[int, str]:
        return self._idx_to_class

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict_logits(self, tensor: torch.Tensor) -> torch.Tensor:
        """
        Run the model and return raw logits.
        tensor: shape [1, 3, 224, 224] on the correct device.
        """
        if not self.loaded or self._model is None:
            raise RuntimeError("Disease model not loaded — call load() first.")
        with torch.inference_mode():
            return self._model(tensor)

    def calibrated_probs(self, logits: torch.Tensor) -> torch.Tensor:
        """Apply temperature scaling then softmax → calibrated probabilities."""
        return torch.softmax(logits / self._temperature, dim=1)


# ---------------------------------------------------------------------------
# Single global instance — imported by routes and services
# ---------------------------------------------------------------------------
disease_model = DiseaseModel()
