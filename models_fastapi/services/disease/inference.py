"""
inference.py — Image preprocessing and calibrated model inference pipeline.

Preprocessing exactly matches training:
  RGB → resize 224×224 → ToTensor → ImageNet Normalize → EfficientNet-B0
  → temperature-scaled softmax → top-K predictions
"""

import logging
from dataclasses import dataclass

import torch
from PIL import Image
from torchvision import transforms

from core.config import DEVICE, IMAGE_MEAN, IMAGE_SIZE, IMAGE_STD, TOP_K_PREDICTIONS
from models.disease_model import disease_model

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Preprocessing transform — must exactly mirror the training pipeline
# ---------------------------------------------------------------------------
_PREPROCESS = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGE_MEAN, std=IMAGE_STD),
])

_DEVICE = torch.device(DEVICE)


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------
@dataclass
class TopPrediction:
    class_name: str
    crop:       str
    disease:    str
    is_healthy: bool
    confidence: float


@dataclass
class InferenceResult:
    top1:              TopPrediction
    top_k:             list[TopPrediction]
    prediction_margin: float     # top1.confidence − top2.confidence
    calibrated:        bool


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _parse_class_name(class_name: str) -> tuple[str, str, bool]:
    """
    Parse PlantVillage class-name format:
      "Tomato___Late_blight"              → ("Tomato",      "Late blight",  False)
      "Apple___healthy"                   → ("Apple",       "Healthy",       True)
      "Cherry_(including_sour)___Powdery_mildew"
                                          → ("Cherry",      "Powdery mildew", False)
      "Pepper,_bell___Bacterial_spot"     → ("Pepper, bell","Bacterial spot", False)
    """
    if "___" not in class_name:
        return class_name, "Unknown", False

    crop_raw, disease_raw = class_name.split("___", 1)

    # Clean crop name
    crop = crop_raw.replace("_", " ").strip()
    # Remove parenthetical qualifier: "Cherry (including sour)" → "Cherry"
    if "(" in crop:
        crop = crop.split("(")[0].strip()

    # Clean disease name
    disease = disease_raw.replace("_", " ").strip()
    is_healthy = disease.lower() == "healthy"
    if is_healthy:
        disease = "Healthy"

    return crop, disease, is_healthy


# ---------------------------------------------------------------------------
# Main inference function
# ---------------------------------------------------------------------------
def run_inference(image: Image.Image) -> InferenceResult:
    """
    Preprocess a PIL Image (RGB) and run calibrated inference.

    Args:
        image: RGB PIL image that has already passed validation.

    Returns:
        InferenceResult with top-1 and top-K predictions plus prediction margin.
    """
    # 1. Preprocess → [1, 3, 224, 224]
    tensor = _PREPROCESS(image).unsqueeze(0).to(_DEVICE)

    # 2. Raw logits → [1, 38]
    logits = disease_model.predict_logits(tensor)

    # 3. Calibrated probabilities → [1, 38]
    probs    = disease_model.calibrated_probs(logits)
    probs_np = probs[0].cpu().numpy()

    # 4. Top-K
    top_indices = probs_np.argsort()[::-1][:TOP_K_PREDICTIONS]
    top_k: list[TopPrediction] = []
    for idx in top_indices:
        class_name = disease_model.idx_to_class[int(idx)]
        crop, disease, is_healthy = _parse_class_name(class_name)
        top_k.append(TopPrediction(
            class_name=class_name,
            crop=crop,
            disease=disease,
            is_healthy=is_healthy,
            confidence=round(float(probs_np[idx]), 6),
        ))

    top1      = top_k[0]
    top2_conf = top_k[1].confidence if len(top_k) > 1 else 0.0
    margin    = round(top1.confidence - top2_conf, 6)

    logger.debug(
        "Inference: %s  conf=%.4f  margin=%.4f  T=%.4f",
        top1.class_name, top1.confidence, margin, disease_model.temperature,
    )

    return InferenceResult(
        top1=top1,
        top_k=top_k,
        prediction_margin=margin,
        calibrated=disease_model.temperature != 1.0,
    )
