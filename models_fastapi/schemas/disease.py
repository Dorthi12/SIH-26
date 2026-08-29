"""
disease.py — Pydantic schemas for the Plant Disease Detection API (Model 5).
"""

from typing import Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Sub-schemas
# ---------------------------------------------------------------------------

class ModelInfo(BaseModel):
    name:         str
    version:      str
    architecture: str
    calibrated:   bool


class TopKPrediction(BaseModel):
    rank:       int
    crop:       str
    disease:    str
    is_healthy: bool
    confidence: float


# ---------------------------------------------------------------------------
# Main prediction response
# ---------------------------------------------------------------------------

class DiseasePredictionResponse(BaseModel):
    """
    Returned for both 'prediction' and 'uncertain' statuses.
    Backend must branch on the `status` field.
    """
    success:           bool
    request_id:        str
    status:            str          # "prediction" | "uncertain"
    model:             ModelInfo

    # Populated when status == "prediction"
    crop:              Optional[str]   = None
    disease:           Optional[str]   = None
    is_healthy:        Optional[bool]  = None
    confidence:        Optional[float] = None
    prediction_margin: Optional[float] = None
    top_predictions:   Optional[list[TopKPrediction]] = None

    # Populated when status == "uncertain"
    message:           Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "request_id": "a3f2c891-...",
                    "status": "prediction",
                    "model": {
                        "name": "plant-disease-efficientnet-b0",
                        "version": "1.0.0",
                        "architecture": "EfficientNet-B0",
                        "calibrated": False,
                    },
                    "crop": "Tomato",
                    "disease": "Late blight",
                    "is_healthy": False,
                    "confidence": 0.9412,
                    "prediction_margin": 0.8801,
                    "top_predictions": [
                        {"rank": 1, "crop": "Tomato", "disease": "Late blight",
                         "is_healthy": False, "confidence": 0.9412},
                        {"rank": 2, "crop": "Tomato", "disease": "Early blight",
                         "is_healthy": False, "confidence": 0.0411},
                        {"rank": 3, "crop": "Tomato", "disease": "Septoria leaf spot",
                         "is_healthy": False, "confidence": 0.0099},
                    ],
                },
                {
                    "success": True,
                    "request_id": "b9c1d452-...",
                    "status": "uncertain",
                    "model": {
                        "name": "plant-disease-efficientnet-b0",
                        "version": "1.0.0",
                        "architecture": "EfficientNet-B0",
                        "calibrated": False,
                    },
                    "message": (
                        "The model is uncertain between 'Target Spot' and "
                        "'Spider mites'. Please upload a higher-quality image."
                    ),
                    "confidence": 0.54,
                    "prediction_margin": 0.07,
                }
            ]
        }
    }


# ---------------------------------------------------------------------------
# Error responses
# ---------------------------------------------------------------------------

class ErrorDetail(BaseModel):
    code:    str
    message: str


class ErrorResponse(BaseModel):
    success:    bool = False
    request_id: str
    status:     str
    error:      ErrorDetail


# ---------------------------------------------------------------------------
# Health / Info
# ---------------------------------------------------------------------------

class DiseaseHealthResponse(BaseModel):
    status:       str
    model_loaded: bool
    model_name:   str
    version:      str
    device:       str


class DiseaseModelInfoResponse(BaseModel):
    model_name:           str
    architecture:         str
    dataset:              str
    num_classes:          int
    input_size:           int
    model_version:        str
    test_accuracy:        float
    test_macro_f1:        float
    calibrated:           bool
    temperature:          float
    confidence_threshold: float
    margin_threshold:     float
