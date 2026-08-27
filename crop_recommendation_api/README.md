# 🌾 Crop Recommendation Engine — FastAPI Service

> **Netravaah Agriculture Platform — ML Microservice**
> Part of the Smart Agriculture Decision-Support System.

---

## What this service does

Given a **State + District + Season**, this API returns the top-K crops ranked by:

```
historical_score = 0.5 × yield_score
                 + 0.3 × stability_score
                 + 0.2 × experience_score
```

It is a **network-accessible ML microservice** — your friend's main backend calls this over HTTP. They do not need to install scikit-learn, pandas, or joblib.

---

## Folder structure

```
crop_recommendation_api/
├── app.py                  ← FastAPI application
├── requirements.txt        ← Python dependencies
├── Dockerfile              ← Container packaging
├── smoke_test.py           ← Sanity checks after startup
├── README.md               ← This file
└── artifacts/
    ├── model_2_config.pkl
    ├── model_2_recommendation_data.csv
    ├── yield_scaler.pkl
    ├── stability_scaler.pkl
    └── experience_scaler.pkl
```

---

## Quickstart (local)

```bash
cd crop_recommendation_api

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux / macOS)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Then open: **http://localhost:8000/docs**

---

## Docker

```bash
docker build -t crop-recommendation-api .
docker run -p 8000:8000 crop-recommendation-api
```

---

## Smoke test

With the server running:

```bash
python smoke_test.py

# Or against another machine:
python smoke_test.py --host http://192.168.1.10:8000
```

---

## API Contract (for your friend's backend)

### `POST /recommend` — Main endpoint

**Request:**
```json
{
  "state": "Bihar",
  "district": "Gaya",
  "season": "Kharif",
  "top_k": 5
}
```

**Response:**
```json
{
  "model": "Crop Recommendation Engine",
  "version": "1.0",
  "input": { "state": "Bihar", "district": "Gaya", "season": "Kharif", "top_k": 5 },
  "total_candidates": 18,
  "recommendations": [
    {
      "rank": 1,
      "crop": "Rice",
      "historical_score": 0.8143,
      "yield_score": 0.7912,
      "stability_score": 0.8432,
      "experience_score": 0.8333,
      "stability_label": "High",
      "trend_label": "Improving",
      "historical_features": {
        "median_yield": 1845.5,
        "mean_yield": 1823.4,
        "max_yield": 2100.0,
        "min_yield": 1450.0,
        "yield_std": 183.2,
        "mean_area": 54230.0,
        "years_cultivated": 15,
        "yield_cv": 0.1005
      }
    }
  ]
}
```

### `POST /score-crop` — Score a specific crop

**Request:**
```json
{
  "state": "Bihar",
  "district": "Gaya",
  "season": "Kharif",
  "crop": "Rice"
}
```

### `GET /health` — Health check

```json
{ "status": "healthy", "model": "Crop Recommendation Engine", "version": "1.0", "records_loaded": 32400 }
```

### `GET /metadata` — Model config

```json
{
  "model_name": "Crop Recommendation Engine",
  "model_version": "1.0",
  "score_weights": { "yield_score": 0.5, "stability_score": 0.3, "experience_score": 0.2 },
  "scoring_formula": "historical_score = 0.5 × yield_score + 0.3 × stability_score + 0.2 × experience_score"
}
```

### `GET /options` — Discover valid inputs (for dropdowns)

| Query | Returns |
|---|---|
| `/options` | All states + all seasons |
| `/options?state=Bihar` | All districts in Bihar |
| `/options?state=Bihar&district=Gaya` | Crops + seasons for Gaya |

---

## Available seasons

`Kharif` · `Rabi` · `Whole Year` · `Summer` · `Winter` · `Autumn`

---

## Dataset stats

| Metric | Value |
|---|---|
| Total records | 32,400 |
| States | 35 |
| Districts | 685 |
| Crops | 55 |
| Seasons | 6 |

---

## Important notes

1. **Your friend's backend should call this service** — not the frontend directly.
2. The main backend handles auth, farmer identity, and can enrich this response with weather, market, or soil data.
3. Never retrain the model on a farmer's request — artifacts are loaded once at startup.
4. `scikit-learn==1.6.1` is pinned because artifacts were serialized with that version.
5. CORS is currently set to `*` — restrict to your actual domains in production.
