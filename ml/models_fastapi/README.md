# Agriculture ML API — Unified Server

Single FastAPI server hosting all four Netravaah ML models on **port 8000**.

## Models

| Model | Description | Key Metric / Detail |
|-------|-------------|---------------------|
| **Model 1** — CatBoost Future Yield Forecaster | Predicts next-year crop yield from 16 historical/contextual features | R² = 0.9019 |
| **Model 2** — Crop Recommendation Engine | Ranks crops for a district+season by historical yield, stability & experience | 32,400 records |
| **Model 3 V3** — Zero-Production Risk | Predicts whether a crop/district/season combination will report zero production | ROC-AUC = 0.9438 |
| **Model 5** — Plant Disease Detection (EfficientNet-B0) | Classifies 38 plant diseases from leaf images | Accuracy 97.43%, F1 96.75% |

## Quick Start

```bash
cd models_fastapi

# Install dependencies (use your existing venv or create a new one)
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive docs → **http://localhost:8000/docs**

## Artifact Paths (read-only, nothing is copied)

| Model | Artifacts Location |
|-------|--------------------|
| Model 1 | `../yield_forecast_api/model/` |
| Model 2 | `../model_2_artifacts/` |
| Model 3 V3 | `../model_3_api/artifacts/` |
| Model 5 | `../model_5_plant_disease_final/` |

## All Endpoints (30 total)

### System
```
GET  /          → service root + route map
GET  /health    → combined liveness (all 4 models)
GET  /ready     → readiness probe (all artifacts)
```

### Plant Disease — Model 5
```
POST /api/v1/plant-disease/predict      → disease inference from leaf image
GET  /api/v1/plant-disease/health       → model liveness
GET  /api/v1/plant-disease/model/info   → architecture + calibration metadata
```

### Crop Recommendation — Model 2
```
POST /api/v1/crop/recommend             → top-K ranked crops
POST /api/v1/crop/recommend/score       → score one specific crop
POST /api/v1/crop/recommend/explain     → weighted breakdown
POST /api/v1/crop/recommend/batch       → multi-location batch
GET  /api/v1/crop/health                → model liveness
GET  /api/v1/crop/model/info            → config + scoring weights
GET  /api/v1/crop/options/states        → all supported states
GET  /api/v1/crop/options/districts     → districts for a state
GET  /api/v1/crop/options/seasons       → all supported seasons
GET  /api/v1/crop/options/crops         → crops (optionally filtered)
```

### Yield Forecast — Model 1
```
POST /api/v1/predict-yield              → full 16-feature inference
POST /api/v1/predict-yield/from-history → auto-derive historical features
POST /api/v1/predict-yield/batch        → batch inference (up to 100)
GET  /api/v1/yield/health               → model liveness
GET  /api/v1/yield/ready                → model readiness
GET  /api/v1/yield/metadata             → model config & test metrics
GET  /api/v1/yield/schema               → feature schema (self-documenting)
```

### Zero-Production Risk — Model 3 V3
```
POST /api/v1/model-3-v3/predict         → zero-production risk prediction (single)
POST /api/v1/model-3-v3/predict/batch   → batch prediction (up to 5000)
POST /api/v1/model-3-v3/predict/from-context → 501 stub (requires time-aware DB)
GET  /api/v1/model-3-v3/health          → fast liveness
GET  /api/v1/model-3-v3/ready           → model + calibrator readiness
GET  /api/v1/model-3-v3/version         → API + model version
GET  /api/v1/model-3-v3/info            → model metadata, metrics & schema
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEVICE` | `cpu` | PyTorch inference device (`cpu` or `cuda`) |
| `LOG_LEVEL` | `INFO` | Log verbosity (`DEBUG`, `INFO`, `WARNING`) |
| `THRESHOLD_APPLIES_TO` | `calibrated` | Probability scale for Model 3 decision threshold (`calibrated` or `raw`) |
| `DEBUG_MODE` | `0` | Set `1` to return detailed stack traces in API errors (development only) |

Copy `.env.example` → `.env` to override defaults.

## Graceful Degradation

Each model loads independently during server startup. If any model's artifacts are missing or fail to load, the server will log an error for that specific model but will continue running and serve requests for all other operational models. You can check `/health` or `/ready` at any time to inspect individual model statuses.
