# 🌾 CatBoost Future Yield Forecaster — FastAPI Service

> **Netravaah Agriculture Platform — Model 1: Future Yield Prediction API**
> Temporal CatBoostRegressor | Trained 1997–2017 | R² = 0.9019 on 2019 test set

---

## What this service does

Given district + crop + season + historical yield context, predicts the **expected future yield** using a trained CatBoostRegressor.

```
State + District + Crop + Season + crop_year + area
          +
Historical lag features (yield_lag_1/2/3, mean, std, CV, trend)
          ↓
      CatBoost
          ↓
   Predicted Yield (t or kg/ha — dataset unit)
```

---

## Project structure

```
yield_forecast_api/
├── app/
│   ├── __init__.py
│   ├── config.py      ← All paths, feature order constants
│   ├── schemas.py     ← Pydantic request/response models
│   ├── model.py       ← CatBoost loader + predict()
│   ├── predictor.py   ← Historical feature engineering
│   └── main.py        ← FastAPI app + all endpoints
├── model/
│   ├── model_2_future_yield.cbm      ← Trained CatBoost model
│   ├── model_2_metadata.json         ← Model config & test metrics
│   └── model_2_feature_config.json   ← Feature schema & constraints
├── tests/
│   ├── test_health.py
│   ├── test_prediction.py
│   └── test_validation.py
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## Quickstart (local)

```bash
cd yield_forecast_api

python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/macOS

pip install -r requirements.txt

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Swagger UI: **http://localhost:8001/docs**

---

## Docker

```bash
docker build -t yield-forecast-api .
docker run -p 8001:8001 yield-forecast-api
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Service info |
| `GET` | `/health` | Health check (backend polls this) |
| `GET` | `/ready` | Model readiness (orchestrators) |
| `GET` | `/metadata` | Model config + test metrics |
| `GET` | `/schema` | Feature schema (self-documenting) |
| `POST` | `/api/v1/predict-yield` | Full 16-feature inference |
| `POST` | `/api/v1/predict-yield/from-history` | Auto-derive features from raw yields |
| `POST` | `/api/v1/predict-yield/batch` | Batch inference (up to 100 records) |

---

## API Contract

### `POST /api/v1/predict-yield` — Full inference

**Request:**
```json
{
  "state": "Bihar",
  "district": "Gaya",
  "crop": "Rice",
  "season": "Kharif",
  "crop_year": 2021,
  "area": 1200.0,
  "yield_lag_1": 2100.5,
  "yield_lag_2": 1980.2,
  "yield_lag_3": 2050.8,
  "historical_mean_yield": 2043.83,
  "historical_median_yield": 2050.8,
  "historical_std_yield": 61.34,
  "yield_change_1": 120.3,
  "yield_change_2": -70.6,
  "yield_growth_rate": 0.0242,
  "historical_cv": 0.030
}
```

**Response:**
```json
{
  "request_id": "8a72c3d1-...",
  "model": {
    "id": "model_2a",
    "name": "CatBoost Future Yield Forecaster",
    "version": "MODEL_2A",
    "algorithm": "CatBoostRegressor"
  },
  "prediction": {
    "target": "yield",
    "value": 2134.72,
    "unit": "dataset_yield_unit",
    "non_negative_clipping_applied": false
  },
  "context": {
    "state": "Bihar",
    "district": "Gaya",
    "crop": "Rice",
    "season": "Kharif",
    "crop_year": 2021,
    "area": 1200.0
  },
  "warnings": [
    "crop_year=2021 is beyond the model training period (trained through 2017)..."
  ]
}
```

### `POST /api/v1/predict-yield/from-history` — Auto-features

If your backend has raw historical yield values, send them directly:

```json
{
  "state": "Bihar",
  "district": "Gaya",
  "crop": "Rice",
  "season": "Kharif",
  "crop_year": 2021,
  "area": 1200.0,
  "historical_yields": [1850.0, 1920.0, 2050.0, 1980.0, 2100.5]
}
```

The ML service will auto-derive all 10 historical features.

### `POST /api/v1/predict-yield/batch`

```json
{
  "records": [
    { ...full request for Rice... },
    { ...full request for Maize... },
    { ...full request for Wheat... }
  ]
}
```

Maximum 100 records per call. Individual failures don't fail the whole batch.

---

## Important Notes

1. **Historical features must strictly use prior years** — never include the target year's actual yield.
2. **`production` and `yield` are forbidden inputs** — they are target/leakage variables.
3. **Non-negative clipping** is applied at inference — if CatBoost predicts < 0, the API returns 0.
4. **Extrapolation warning** is issued for `crop_year > 2017` (model's training end).
5. **The ML service should be called by the main backend, not the frontend directly.**

---

## Running tests

```bash
# Start server first, then in a separate terminal:
pytest tests/ -v
```

---

## Model metrics (temporal test 2019)

| Metric | Value |
|---|---|
| MAE | 21.09 |
| RMSE | 299.29 |
| R² | 0.9019 |
| MedianAE | 1.097 |

> R² = 0.9019 means the model explains ~90% of yield variance on the temporal test set. It does **not** mean 90% classification accuracy.
