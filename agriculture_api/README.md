# Agriculture ML API

Single FastAPI server hosting two ML inference services for the **Netravaah Agriculture Platform**.

| Model | Endpoint prefix | Description |
|-------|----------------|-------------|
| Model 5 — Plant Disease | `/api/v1/plant-disease/` | EfficientNet-B0, 38-class PlantVillage classifier |
| Model 2 — Crop Recommendation | `/api/v1/crop/` | Historical crop ranking engine, 32,400 records |

---

## Quick Start

```powershell
# 1. Create virtual environment
python -m venv .venv
.venv\Scripts\activate

# 2. Install dependencies
# ⚠️  scikit-learn must be 1.6.1 — matches artifact serialization
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Interactive API docs**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc

---

## Artifact locations

The server resolves artifacts **relative to the repository root** (`sih'26/`).  
No copying required — point directly at the existing artifact directories.

| Artifact | Path |
|----------|------|
| Model 5 `.pth` + JSON | `../model_5_plant_disease_final/` |
| Model 2 CSV + scalers | `../model_2_artifacts/` |
| Calibration (optional) | `../model_5_plant_disease_final/calibration.json` |

> **calibration.json** is optional. If absent, the model uses safe defaults  
> (T=1.0, confidence threshold=0.70, margin threshold=0.15).  
> Run the calibration notebook to generate it and drop it into the artifacts folder.

---

## Complete Route Table

### System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Service root — lists all endpoints |
| `GET` | `/health` | Combined liveness check (both models) |
| `GET` | `/ready` | Readiness — confirms artifacts loaded |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc |

### Plant Disease Detection (Model 5)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/plant-disease/predict` | ⭐ Main inference — upload leaf image |
| `GET` | `/api/v1/plant-disease/health` | Model liveness |
| `GET` | `/api/v1/plant-disease/model/info` | Architecture, calibration params |

#### Predict request
```
POST /api/v1/plant-disease/predict
Content-Type: multipart/form-data

image=<leaf_photo.jpg>
```

#### Predict response — confident
```json
{
  "success": true,
  "request_id": "a3f2c891-...",
  "status": "prediction",
  "model": { "name": "plant-disease-efficientnet-b0", "calibrated": false },
  "crop": "Tomato",
  "disease": "Late blight",
  "is_healthy": false,
  "confidence": 0.9412,
  "prediction_margin": 0.8801,
  "top_predictions": [
    { "rank": 1, "crop": "Tomato", "disease": "Late blight", "confidence": 0.9412 },
    { "rank": 2, "crop": "Tomato", "disease": "Early blight", "confidence": 0.0411 },
    { "rank": 3, "crop": "Tomato", "disease": "Septoria leaf spot", "confidence": 0.0099 }
  ]
}
```

#### Predict response — uncertain
```json
{
  "success": true,
  "status": "uncertain",
  "message": "The model is uncertain between 'Target Spot' and 'Spider mites'. Please upload a higher-quality image."
}
```

---

### Crop Recommendation Engine (Model 2)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/crop/recommend` | ⭐ Top-K crop recommendation |
| `POST` | `/api/v1/crop/recommend/score` | Score one specific crop |
| `POST` | `/api/v1/crop/recommend/explain` | Weighted score breakdown |
| `POST` | `/api/v1/crop/recommend/batch` | Multiple locations, one call |
| `GET` | `/api/v1/crop/health` | Model liveness |
| `GET` | `/api/v1/crop/model/info` | Scoring config + dataset size |
| `GET` | `/api/v1/crop/options/states` | All supported states |
| `GET` | `/api/v1/crop/options/districts?state=Bihar` | Districts in a state |
| `GET` | `/api/v1/crop/options/seasons` | All seasons |
| `GET` | `/api/v1/crop/options/crops` | Crops (optionally filtered) |

#### Recommend request
```json
POST /api/v1/crop/recommend
{
  "state": "Bihar",
  "district": "Gaya",
  "season": "Kharif",
  "top_k": 5
}
```

#### Recommend response (truncated)
```json
{
  "success": true,
  "candidate_count": 14,
  "returned_count": 5,
  "recommendations": [
    {
      "rank": 1,
      "crop": "Rice",
      "historical_score": 0.8421,
      "score_percent": 84.21,
      "stability_label": "High",
      "trend_label": "Improving",
      "score_breakdown": {
        "yield_score":      { "score": 0.9012, "weight": 0.5, "contribution": 0.4506 },
        "stability_score":  { "score": 0.7934, "weight": 0.3, "contribution": 0.2380 },
        "experience_score": { "score": 0.8123, "weight": 0.2, "contribution": 0.1625 }
      },
      "data_quality": { "historical_years": 18, "history_quality": "strong" }
    }
  ]
}
```

> ⚠️ `historical_score` is a **ranking metric**, not a probability. Do not show it to farmers as "84% chance of success."

---

## Architecture

```
FRONTEND / APP
      │
      ▼
MAIN BACKEND
      │
      │ HTTP  (single host, port 8000)
      ▼
┌─────────────────────────────────────────┐
│         Agriculture ML API              │
│         FastAPI  /  main.py             │
│                                         │
│  /api/v1/plant-disease/*  ←─ Model 5   │
│  /api/v1/crop/*           ←─ Model 2   │
│                                         │
│  Startup lifespan loads both models     │
│  once; all requests reuse memory state  │
└─────────────────────────────────────────┘
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEVICE` | `cpu` | PyTorch device: `cpu` or `cuda` |
| `LOG_LEVEL` | `INFO` | Log verbosity |
| `PORT` | `8000` | Uvicorn port (used in run script) |

---

## Security notes

- File uploads are validated for extension, actual MIME type (via Pillow decode), size (≤ 10 MB), resolution, aspect ratio, and pixel variance.
- Uploaded files are never executed or written to disk permanently.
- CORS is set to `*` for development — **restrict `allow_origins` to your backend domain in production**.
- scikit-learn scalers are loaded from pickled `.pkl` files — only load artifacts from trusted sources.
