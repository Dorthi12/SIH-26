# ⚙️ Backend Workflow — Smart Agriculture Decision-Support System
## End-to-End Backend Implementation Guide (FastAPI + ML + PostgreSQL)

**Scope:** This document covers **only the backend** — FastAPI service, ML serving, database, and their internal workflows. For architecture, frontend, domain model, and full API spec, see `Agriculture-MVP-Project-Schema.md` (Sections 3, 17–19, 28–30 in particular — this document expands on those with step-by-step execution detail).

**Audience:** Member 4 (Backend), Member 1 (ML — for the model-serving handoff), Member 3 (Weather/APIs — for the service contract), Member 6 (Integration — for testing/deployment hooks).

---

## 1. Backend Scope, Restated

The backend's job is exactly one thing end to end:

```
Take a farmer's request (district, season, land area)
        ↓
Gather everything needed (location, weather, historical data)
        ↓
Run it through the trained model
        ↓
Turn raw predictions into a ranked, explained, unit-correct recommendation
        ↓
Return it as JSON
```

Everything below is about building that pipeline reliably, in the right order, with the right internal boundaries — per the frozen architecture (Schema doc, Section 3) and the leakage-safe ML formulation (Schema doc, Section 14).

---

## 2. Backend Tech Stack (Recap)

| Component | Choice | Notes |
|---|---|---|
| Web framework | FastAPI | async-capable, auto-generates OpenAPI docs at `/docs` — use this for team-wide contract testing |
| Language | Python 3.11+ | |
| ORM / DB access | SQLAlchemy (or raw `psycopg2`/`asyncpg` for MVP simplicity) | start with plain CSV/Parquet reads if DB isn't ready yet (Schema doc, Section 5) |
| DB | PostgreSQL (once stable) | CSV/Parquet acceptable for early phases |
| ML serving | `pickle`/`joblib` loaded model, scikit-learn/XGBoost | loaded once at app startup, not per-request |
| Validation | Pydantic v2 | schemas double as API documentation and TypeScript-contract source of truth |
| HTTP client (for weather vendor) | `httpx` (async) | wrapped inside `WeatherService`, never called directly from route handlers |
| Testing | `pytest` + `httpx.AsyncClient` / FastAPI `TestClient` | |
| Containerization | Docker | owned by Member 6, backend just needs a working `Dockerfile` |

---

## 3. Backend Folder Structure (Canonical — matches Schema doc Section 17, expanded)

```
backend/
│
├── main.py                        # FastAPI app instance, startup/shutdown events, router registration
├── config.py                      # env var loading (WEATHER_API_KEY, DB_CONNECTION_STRING, MODEL_ARTIFACT_PATH, etc.)
│
├── api/                           # thin route handlers only — no business logic here
│   ├── __init__.py
│   ├── health.py                  # GET /health
│   ├── districts.py                # GET /districts, GET /districts/{district_id}
│   ├── crops.py                    # GET /crops
│   ├── weather.py                  # GET /weather/{district_id}
│   ├── prediction.py               # POST /predict, GET /predictions/{id}
│   └── historical.py               # GET /historical/{district_id}/{crop_id}
│
├── services/                      # all business logic lives here
│   ├── __init__.py
│   ├── weather_service.py          # WeatherService — vendor wrapper, current+forecast, cache fallback
│   ├── location_service.py         # LocationService — district → lat/long resolution
│   ├── crop_service.py             # CropService — crop master data access
│   ├── historical_service.py       # HistoricalService — fetches lagged historical records
│   ├── feature_service.py          # FeatureService — assembles ModelFeatureVector (leakage-safe)
│   ├── prediction_service.py       # PredictionService — loads model.pkl, runs inference, unit conversion
│   └── recommendation_service.py   # RecommendationService — normalizes scores, ranks, attaches evidence labels
│
├── models/                        # ML ARTIFACTS, not Pydantic models
│   ├── crop_model.pkl
│   ├── preprocessing.pkl
│   └── model_metadata.json         # version, trained_on_years, metrics — mirrors ModelVersion (Schema doc 28.21)
│
├── schemas/                       # Pydantic request/response models (source of truth for API contract)
│   ├── __init__.py
│   ├── common.py                   # shared enums: Season, StabilityLabel, TrendLabel
│   ├── district.py
│   ├── crop.py
│   ├── weather.py                  # WeatherSnapshot request/response shapes
│   └── prediction.py               # FarmerInput, Prediction, Recommendation shapes
│
├── db/
│   ├── __init__.py
│   ├── session.py                  # DB session/connection management
│   ├── models.py                   # SQLAlchemy table definitions (District, Crop, HistoricalCropRecord, etc.)
│   └── migrations/                 # Alembic migrations, once DB is stable
│
├── utils/
│   ├── __init__.py
│   ├── units.py                    # convert_acres_to_hectares(), unit-tested
│   ├── caching.py                  # simple in-memory or file-based cache for weather fallback
│   └── logging.py                  # structured logging setup
│
├── data/                          # CSV/Parquet fallback data sources (early phases)
│   ├── raw/
│   ├── processed/
│   └── district_locations.csv
│
├── tests/
│   ├── test_weather_service.py
│   ├── test_prediction_service.py
│   ├── test_recommendation_service.py
│   ├── test_units.py
│   └── test_api_integration.py     # end-to-end: hits real FastAPI routes with TestClient
│
├── requirements.txt
├── Dockerfile
└── .env.example
```

**Rule:** `api/` files should be under ~20 lines each — parse request, call one service method, return response. If a route handler has `if/else` business logic in it, that logic belongs in `services/`.

---

## 4. Backend Build Order (Do Not Skip Steps)

This mirrors the overall Phase sequence (Schema doc, Section 6) but zoomed into backend-only steps. **Do not start Step 5 (FastAPI routes) before Steps 1–4 work standalone** — a route wrapping a broken service just hides the bug behind HTTP.

```
STEP 1   Project skeleton + config loading
              ↓
STEP 2   Data access layer (CSV/Parquet first, DB later)
              ↓
STEP 3   WeatherService (standalone, testable via script — no FastAPI yet)
              ↓
STEP 4   FeatureService + PredictionService (load model.pkl, run one hardcoded example)
              ↓
STEP 5   RecommendationService (normalize + rank + label, on top of Step 4's output)
              ↓
STEP 6   Wire up FastAPI routes calling the above services
              ↓
STEP 7   Pydantic schema validation on every route
              ↓
STEP 8   Error handling + weather fallback wiring
              ↓
STEP 9   Persist predictions to DB (predictions table)
              ↓
STEP 10  Integration tests (full request → response, mocked weather vendor)
              ↓
STEP 11  Dockerize + hand off to Member 6
```

### Why this order matters
- Steps 1–5 can all be tested with plain Python scripts/`pytest` — no server running, fast iteration, and the ML/backend boundary (Step 4) gets validated before any HTTP concerns are added.
- Step 6 becomes almost mechanical once Steps 1–5 work, because each route is just: parse → call service → return. This is what keeps a 1-week backend timeline realistic for a 6-person team.

---

## 5. Step-by-Step Workflow Detail

### 5.1 Step 1 — Project Skeleton + Config

```python
# config.py
class Settings(BaseSettings):
    weather_api_key: str
    weather_api_base_url: str
    db_connection_string: str | None = None   # optional in early phases
    model_artifact_path: str = "models/crop_model.pkl"
    use_db: bool = False                      # toggles CSV/Parquet vs Postgres
```

Load via `.env` (never commit secrets — `.env.example` only, per environment-variable naming in the Schema doc Section 30.7).

**Definition of done:** `python -c "from config import settings; print(settings.weather_api_base_url)"` works.

### 5.2 Step 2 — Data Access Layer

Build a single interface both CSV/Parquet and Postgres can satisfy, so swapping storage later doesn't touch service code:

```
HistoricalService.get_lagged_records(district_id, crop_id, season, target_year)
    → returns HistoricalCropRecord[] for years < target_year only (leakage-safe, Schema Section 14)

LocationService.resolve(district_id)
    → returns {district_name, state, latitude, longitude}

CropService.list_candidates(season)
    → returns Crop[] valid for that season
```

**Definition of done:** each function returns correct data for one hardcoded example, tested via `pytest`, no FastAPI involved yet.

### 5.3 Step 3 — WeatherService

```
WeatherService.get_current_and_forecast(latitude, longitude, forecast_horizon_days)
        ↓
   Call vendor API (httpx, async, with timeout)
        ↓
   Success?
   /     \
 YES      NO
  ↓        ↓
Normalize  Read last-cached response for this district
into       (utils/caching.py) and mark source="cached"
{current, forecast, source="live"}
```

**Contract (must match Schema doc Section 10/18 exactly):**
```python
class WeatherSnapshot(BaseModel):
    current: CurrentWeather
    forecast: ForecastWeather
    source: Literal["live", "cached"]
```

**Definition of done:** a script that calls `WeatherService.get_current_and_forecast(...)` for a known district returns a well-formed `WeatherSnapshot`, and manually killing network access still returns a valid (cached) response instead of raising.

### 5.4 Step 4 — FeatureService + PredictionService

```
FeatureService.build_feature_vector(district_id, crop_id, season, weather_snapshot, target_year)
        ↓
   Pulls lagged_historical_yield, rolling_historical_yield, yield_trend
   via HistoricalService (years < target_year only — leakage check lives HERE)
        ↓
   Merges with weather_snapshot fields (temperature_avg, rainfall, humidity, wind_speed)
        ↓
   Returns ModelFeatureVector (Schema doc 28.8)

PredictionService.predict_yield(feature_vector)
        ↓
   model.predict([feature_vector]) using the loaded model.pkl
        ↓
   Returns predicted_yield_t_per_ha (float)

PredictionService.evaluate_all_candidates(district_id, season, weather_snapshot, land_area_acres)
        ↓
   For each candidate crop (CropService.list_candidates(season)):
       build feature vector → predict yield
        ↓
   Returns list of {crop, predicted_yield_t_per_ha, estimated_production_t}
   (unit conversion via utils/units.py happens HERE, not in the route handler)
```

**Model loading — do this once, at app startup, not per request:**
```python
# main.py
@app.on_event("startup")
def load_model():
    app.state.model = joblib.load(settings.model_artifact_path)
    app.state.preprocessing = joblib.load("models/preprocessing.pkl")
```

**Definition of done:** running `evaluate_all_candidates()` for one hardcoded district/season prints a sane list of `{crop, yield}` pairs with no leakage (verify manually that the historical inputs used are all from years before the "current" year in your test).

### 5.5 Step 5 — RecommendationService

```
RecommendationService.rank(candidate_predictions)
        ↓
   Extract predicted_yield_t_per_ha for all candidates
        ↓
   Suitability Score(i) = 100 × (yᵢ − min(y)) / (max(y) − min(y))
   (Schema doc Section 15 — guard divide-by-zero: if max==min, default all to 70)
        ↓
   For each candidate, attach:
     - historical_stability   (from yield variance across lagged years — High/Medium/Low)
     - weather_compatibility  (rule-based comparison of current weather to crop's optimal range, if defined)
     - yield_trend            (from lagged yield slope — Improving/Stable/Declining)
        ↓
   Sort descending by suitability_score
        ↓
   Returns Recommendation (ordered Prediction[] + request context)
```

**Definition of done:** feeding the Step 4 output through `rank()` produces a correctly ordered list where the top crop has `suitability_score == 100`.

### 5.6 Step 6 — Wire Up FastAPI Routes

Each route is now nearly mechanical:

```python
# api/prediction.py
@router.post("/predict", response_model=RecommendationResponse)
async def predict(request: FarmerInputRequest):
    location = location_service.resolve(request.district_id)
    weather = await weather_service.get_current_and_forecast(location.latitude, location.longitude)
    candidates = prediction_service.evaluate_all_candidates(
        request.district_id, request.season, weather, request.land_area_acres
    )
    recommendation = recommendation_service.rank(candidates)
    persist_prediction(recommendation)   # Step 9
    return recommendation
```

**Definition of done:** `POST /predict` via `/docs` (FastAPI's auto Swagger UI) returns a real, correctly shaped response for a valid district/season.

### 5.7 Step 7 — Pydantic Validation Everywhere

Every request and response has an explicit Pydantic model — no raw `dict` returns. This is also what keeps the TypeScript types (Schema doc Section 20) honest: Member 5/6 should be able to generate or hand-verify the TS interfaces directly against these Pydantic schemas.

```python
class FarmerInputRequest(BaseModel):
    district_id: int
    season: Literal["Kharif", "Rabi", "Zaid"]
    land_area_acres: float = Field(gt=0)
```

**Definition of done:** sending an invalid `season` value returns FastAPI's automatic `422` with a clear error message, not a `500`.

### 5.8 Step 8 — Error Handling + Weather Fallback Wiring

```
Route handler
     ↓
try:
    weather = await weather_service.get_current_and_forecast(...)
except WeatherServiceUnavailable:
    # WeatherService already tried cache internally (Step 3) —
    # this only fires if BOTH live and cache fail
    raise HTTPException(502, "Weather data temporarily unavailable")

try:
    recommendation = ... 
except InvalidDistrictError:
    raise HTTPException(404, "District not found")
except ModelInferenceError:
    raise HTTPException(500, "Prediction failed — please retry")
```

Define custom exception classes in `services/` (`WeatherServiceUnavailable`, `InvalidDistrictError`, `ModelInferenceError`) and catch them explicitly in `api/` — don't let raw exceptions leak into HTTP responses.

**Definition of done:** every documented status code in the API spec (Schema doc Section 29) is reachable with a real request that triggers it.

### 5.9 Step 9 — Persist Predictions

```
After RecommendationService.rank() returns:
        ↓
   For each Prediction in the Recommendation:
       INSERT INTO predictions (district, season, crop, land_area_acres,
                                 land_area_hectares, predicted_yield, suitability_score,
                                 historical_stability, weather_compatibility, created_at)
```

This is what makes `GET /predictions/{id}` (Schema doc Section 29.1) work, and gives Member 6 something concrete to check in integration tests without re-running the model.

### 5.10 Step 10 — Integration Tests

```python
# tests/test_api_integration.py
async def test_predict_end_to_end(mock_weather_vendor):
    response = await client.post("/predict", json={
        "district_id": 1, "season": "Kharif", "land_area_acres": 2
    })
    assert response.status_code == 200
    body = response.json()
    assert body["recommendations"][0]["suitability_score"] == 100  # top crop always normalizes to 100
    assert body["land_area_hectares"] == pytest.approx(0.809, rel=1e-2)
```

Mock the weather vendor call (`mock_weather_vendor` fixture) so tests are fast and don't depend on the live API being up — this is also your rehearsal for the "weather API fails during the demo" scenario (Schema doc Section 10).

### 5.11 Step 11 — Dockerize

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Hand off to Member 6 with a working `docker build && docker run` locally before integration — don't let Docker be the first time the backend runs outside your own machine.

---

## 6. Full Request Lifecycle — `POST /predict` (Reference Trace)

This is the exact sequence for the system's core endpoint, useful for debugging and for explaining the pipeline to judges.

```
1.  Client sends POST /predict { district_id, season, land_area_acres }
2.  FastAPI validates request against FarmerInputRequest schema (422 if invalid)
3.  api/prediction.py calls LocationService.resolve(district_id)
        → 404 if district not found
4.  api/prediction.py calls WeatherService.get_current_and_forecast(lat, long)
        → tries live vendor call
        → on failure, falls back to cached snapshot, source="cached"
        → 502 only if both live and cache are unavailable
5.  api/prediction.py calls CropService.list_candidates(season)
        → returns valid crops for this season
6.  For each candidate crop:
        a. HistoricalService.get_lagged_records(district_id, crop_id, season, current_year)
           → years < current_year ONLY (leakage guard)
        b. FeatureService.build_feature_vector(...)
        c. PredictionService.predict_yield(feature_vector)
           → uses app.state.model loaded at startup
        d. utils/units.py converts land_area_acres → hectares
        e. estimated_production_t = predicted_yield × land_area_hectares
7.  RecommendationService.rank(all candidate predictions)
        a. Normalize predicted yields → suitability_score (0-100)
        b. Attach historical_stability, weather_compatibility, yield_trend labels
        c. Sort descending by suitability_score
8.  Persist each Prediction row to the predictions table
9.  Return RecommendationResponse JSON to client
        { district, season, land_area_acres, land_area_hectares, recommendations: [...] }
```

Total external dependency in this whole flow: **one** call to the weather vendor. Everything else is local computation — this is intentional and keeps latency and failure surface small.

---

## 7. Offline vs Online Split (ML Handoff Boundary)

This is the seam between Member 1 (ML) and Member 4 (Backend) — get this contract right early.

```
OFFLINE (Member 1's world — notebooks, Schema doc Section 21)
    Historical Dataset
         ↓
    01_data_collection.ipynb → 05_model_evaluation.ipynb
         ↓
    model.pkl + preprocessing.pkl + model_metadata.json
         ↓
    Hand off: drop these 3 files into backend/models/

ONLINE (Member 4's world — this document)
    FastAPI loads model.pkl at startup
         ↓
    PredictionService.predict_yield(feature_vector) calls model.predict(...)
         ↓
    Never retrains, never touches the notebooks
```

**Contract to lock between Members 1 and 4:** the exact column order/names `PredictionService` passes into `model.predict()` must match what the model was trained on. Put this list in `model_metadata.json` and have `FeatureService` validate against it at startup — a silent column-order mismatch is a very hard bug to catch later.

```json
// model_metadata.json
{
  "version": "0.1.0",
  "algorithm": "RandomForest",
  "trained_on_years": "2021-2024",
  "feature_order": [
    "temperature_avg", "temperature_min", "temperature_max",
    "rainfall", "humidity", "wind_speed",
    "lagged_historical_yield", "rolling_historical_yield", "yield_trend"
  ],
  "metrics": { "mae": 0.31, "rmse": 0.42, "r2": 0.78 }
}
```

---

## 8. Database Workflow (Once Ready to Move Off CSV/Parquet)

```
1. Finalize schema (Schema doc Section 19: districts, crops, historical_crop_data,
   historical_weather, predictions)
2. Set up Alembic (or equivalent) for migrations — never hand-edit prod schema
3. Write a one-time seed script: CSV/Parquet → Postgres, using the SAME
   cleaning/standardization rules from data ingestion (district/crop name casing, units)
4. Point HistoricalService, LocationService, CropService at the DB instead of CSV
   — because they were built behind an interface (Section 5.2), only the
   implementation swaps, not the call sites
5. Keep the CSV/Parquet path alive as a fallback flag (settings.use_db) until the
   DB is proven stable in the actual demo environment
```

---

## 9. Backend Checklist

- [ ] Config loads from `.env`, no secrets committed
- [ ] Data access layer works standalone (no FastAPI needed to test it)
- [ ] `WeatherService` returns valid `WeatherSnapshot` on success and on simulated vendor failure
- [ ] `FeatureService` provably excludes the target year from lagged features (write a test asserting this explicitly)
- [ ] Model loaded once at startup, not per-request
- [ ] `PredictionService` output matches `model_metadata.json`'s `feature_order`
- [ ] `RecommendationService` normalizes correctly; top candidate always scores exactly 100
- [ ] Unit conversion tested independently (`2 acres → 0.809 ha`, not `2 ha`)
- [ ] Every route has a Pydantic request and response model — no raw dicts
- [ ] Every documented status code (Schema doc Section 29) is actually reachable
- [ ] Predictions persist to `predictions` table and are retrievable via `GET /predictions/{id}`
- [ ] Integration test suite runs green with a **mocked** weather vendor
- [ ] `docker build && docker run` works locally before handoff to Member 6
- [ ] `/docs` (FastAPI Swagger UI) is usable by non-backend teammates to manually test endpoints

---

## 10. Common Failure Modes to Watch For (Backend-Specific)

| Symptom | Likely Cause | Fix |
|---|---|---|
| Model predicts suspiciously well on test year | Target leakage — target year's own yield leaked into features | Re-check `HistoricalService.get_lagged_records` year filter |
| `/predict` works locally but fails in Docker | Model artifact path or `.env` not copied into image | Check `Dockerfile` COPY instructions and `.env` handling |
| Estimated production looks 2.5x too high | Acres treated as hectares | Verify `utils/units.py` is actually called, not bypassed |
| All crops get suitability_score of 0 or 100 flatly | Divide-by-zero guard not implemented, or only one candidate crop returned | Check `CropService.list_candidates(season)` returns multiple crops, and the divide-by-zero guard (Section 5.5) |
| Weather badge always shows "cached" even when API is up | Live call silently failing (bad API key, wrong base URL) and falling through to cache without logging | Add explicit logging in `WeatherService` on live-call failure |
| Frontend types don't match backend response | Pydantic schema changed without updating `types/prediction.ts` | Treat schema changes as requiring a paired frontend PR (Member 6 enforces) |
