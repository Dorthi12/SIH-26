# 🌾 Smart Agriculture Decision-Support System
## Complete Project Schema & Team Implementation Blueprint — SIH MVP

**Version:** 1.5 — Core MVP architecture remains frozen (see Section 3). This revision adds a canonical naming glossary for the whole team.
**Purpose:** Single source of truth for the team. Covers architecture, tech stack, data schema, API contracts, ML pipeline, folder structure, task ownership, the long-term platform roadmap, the full domain model, the complete API specification, and the canonical naming glossary.

### What changed in v1.5
- **Added Section 30 — Common Domain Naming Convention**: a single glossary every member follows exactly — casing rules per layer, canonical names for every entity and field (with explicit "do NOT use" columns to head off drift like `dist`/`score`/`temp` shorthand), roadmap-phase entity names locked in advance, service/module naming, API path conventions, and environment variable naming

### What changed in v1.4
- **Added Section 28 — Common Domain List**: every domain entity in the system (MVP and roadmap), with fields, relationships, and which module/phase owns it, so the whole team works off the same vocabulary
- **Added Section 29 — Full API Specification**: every endpoint across MVP (Level 1) and roadmap phases (P1–P4), with method, path, purpose, request/response shape, and status codes — the `/weather` and `/predict` contracts from Section 18 are the canonical detail; this section is the complete map of the surface area

### What changed in v1.3
- **Added a full post-MVP upgrade roadmap** (Section 22, expanded): RAG knowledge base, agentic orchestrator + tools, farm decision reports, risk prediction, what-if scenario simulator, model explainability, historical crop intelligence, weather alerts, market intelligence, soil intelligence, feedback learning loop, agent memory, voice/multilingual assistant, uncertainty layer, Farmer/Officer dual modes, and a multi-model decision engine
- **Added a priority ranking (P1–P4)** across all roadmap upgrades, so the team knows what to build first once the MVP is stable
- **Added a 4-phase platform evolution view** (MVP → Intelligence → Agent → Copilot) to use in the SIH pitch narrative
- Nothing in Sections 1–21 (core MVP architecture, data schema, API contract, frontend, checklist) has changed — all Phase-2+ content is explicitly separated so it cannot be mistaken for MVP scope

### What changed in v1.2 (carried forward)
- **Frontend switched from Streamlit to React + TypeScript** across the whole document (architecture diagram, tech stack, folder structure, API consumption, team roles, checklist, demo script)
- **Suitability Score formula defined precisely**: normalize predicted yields across candidate crops → 0–100 score, derived directly from the model's relative output, not a separate arbitrary system
- **Explicit dataset disclaimer added**: every numeric example in this document (yields, rainfall, scores) is illustrative only — not real training data. The team must not start ML work on invented values from this doc.
- **Unit conversion utility called out explicitly**: `land_area` must be converted acres → hectares before multiplying by predicted yield (t/ha), to prevent a silent unit bug
- **Architecture flow frozen and restated as the canonical diagram** (Section 3) — no further structural changes expected before implementation
- **Prediction horizon leaning noted**: pre-season crop-selection is the likely default given the stated goal, pending SIH problem statement confirmation

---

## 1. One-Line Pitch

> A dynamic crop decision-support system that combines recent district-level agricultural history with real-time and forecast weather conditions to rank crop suitability for a farmer's current situation — not a static "predict one crop" model, but a full **Input → Processing → Output** decision pipeline.

**What we are NOT saying:** "Our model guarantees the best crop."
**What we ARE saying:** "The system provides a data-driven crop suitability recommendation based on historical performance and current/forecast environmental conditions." (Soil, irrigation, seed variety, pests, and market conditions are real factors we explicitly do not model in the MVP.)

---

## 2. ⚠️ Dataset Disclaimer — Read Before Touching the ML Code

**Every table, number, and example in this document (district names, yields, rainfall figures, scores) is illustrative only.** They exist to make the schema concrete, not to serve as real training data. Do not:

- Hardcode any of these example values into the model or database
- Start feature engineering or model training before the actual dataset (source, districts, crops, years, licensing) is locked per Section 26
- Assume `Lucknow → Rice → 2.4 t/ha` reflects real agricultural statistics

The team should treat this schema as a **template to populate with verified data**, not a dataset itself.

---

## 3. Frozen Architecture Flow (Canonical — do not restructure)

```
Farmer
  ↓
District + Season + Land Area
  ↓
Location
  ↓
Current + Forecast Weather
  ↓
Recent Historical Agriculture (lagged, leakage-safe)
  ↓
Leakage-safe Feature Engineering
  ↓
Yield Prediction Model
  ↓
Candidate Crop Ranking
  ↓
Suitability Score (normalized from predicted yield)
  ↓
Evidence + Explanation
  ↓
Expected Yield + Estimated Production
  ↓
Farmer Recommendation
```

This is a legitimate operational MVP — Input → Processing → Output — not a static concept or UI mockup, which is exactly what the internal SIH guideline requires. **Architecture changes stop here.** Remaining work is locking data/decisions (Section 26) and building.

---

## 4. Full Architecture Diagram

```
                     👨‍🌾 FARMER
                         │
                         ▼
                ┌─────────────────┐
                │  React + TS UI  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    FastAPI      │
                │   API Gateway   │
                └────────┬────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌──────────────┐
   │  Location  │ │  Weather   │ │ Historical   │
   │  Service   │ │  Service   │ │ Data Service │
   └────────────┘ └─────┬──────┘ └──────┬───────┘
                         │               │
                         ▼               ▼
                    Weather API     PostgreSQL / CSV
                         │               │
                         └───────┬───────┘
                                 ▼
                       ┌──────────────────┐
                       │ Feature          │
                       │ Engineering      │
                       └────────┬─────────┘
                                ▼
                       ┌──────────────────┐
                       │ Crop Suitability │
                       │ ML Model         │
                       └────────┬─────────┘
                                ▼
                       ┌──────────────────┐
                       │ Recommendation   │
                       │ Engine           │
                       └────────┬─────────┘
                                ▼
                       ┌──────────────────┐
                       │ Explanation      │
                       │ Engine           │
                       └────────┬─────────┘
                                ▼
                       ┌──────────────────┐
                       │ Top Crop         │
                       │ Recommendations  │
                       │ + Estimated      │
                       │ Production       │
                       └──────────────────┘
```

The React frontend talks to FastAPI purely over the REST contract in Section 18 — it has no knowledge of the model, database, or weather vendor behind it.

---

## 5. Tech Stack Summary

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React + TypeScript** | Component-based UI; typed API responses (see Section 20 for shared types); built **after** the pipeline works, not first |
| Backend / API Gateway | FastAPI | All business logic lives in `services/`, not in route handlers |
| Storage (MVP) | CSV/Parquet + model artifact | Sufficient to start — don't burn hackathon time on DB infra early |
| Storage (once stable) | PostgreSQL | districts, crops, historical crop data, historical weather (daily), predictions |
| ML | scikit-learn (Linear Regression, Random Forest) → XGBoost/LightGBM/CatBoost | Start simple, compare, justify final choice with metrics |
| Weather Source | External Weather API (TBD by team) | Wrapped behind an internal `WeatherService`; must expose **both** current and forecast data |
| Model Serving | `model.pkl` loaded by FastAPI at startup | Model is trained OFFLINE, never retrained per-request |
| Explanation Layer | Deterministic rule-based engine | No GenAI needed for MVP — more defensible to judges |
| Deployment | Docker (backend + React build) | Owned by Member 6, set up from Day 1 |
| Notebooks | Jupyter (`01_...` to `05_...`) | ML team's experimentation-to-production pipeline |

**Explicitly out of scope for MVP:** disease detection, fertilizer recommendation, market/price prediction, government schemes, voice assistant, chatbot, marketplace, IoT, generative AI.

---

## 6. Development Sequence — Follow This Order

**Do not start with frontend or database infrastructure. Data availability determines everything else.**

```
PHASE 0   Exact SIH Problem Statement
              ↓
PHASE 1   Data Source Audit
              ↓
PHASE 2   Data Availability + Quality Check
              ↓
PHASE 3   Finalize ML Formulation (leakage-safe, horizon-defined)
              ↓
PHASE 4   Build Baseline Model
              ↓
PHASE 5   Weather Integration (current + forecast)
              ↓
PHASE 6   Recommendation Engine + Suitability Score
              ↓
PHASE 7   FastAPI
              ↓
PHASE 8   React + TypeScript Frontend
              ↓
PHASE 9   Integration
              ↓
PHASE 10  Deployment
              ↓
PHASE 11  Testing + Judge Q&A Prep
```

Member 6 (Integration/Deployment) works in parallel from **Phase 0** — setting up Git conventions, Docker skeleton, API contracts, environment variables, and integration tests — rather than waiting until Phase 9.

---

## 7. Module Breakdown

| # | Module | Owns |
|---|---|---|
| 1 | Farmer Input | District, Season, Land Area (all required — land area now feeds the output) |
| 2 | Weather Engine | Current weather **and** forecast weather, normalized into separate, clearly labeled feature blocks |
| 3 | Historical Agriculture Dataset | Recent, source-documented years of crop + weather + yield records, lagged relative to prediction target |
| 4 | Crop Suitability ML Model | Predicts expected yield per candidate crop, given location + season + weather, using only *prior* years' performance as input |
| 5 | Recommendation + Explanation Engine | Ranks by predicted yield; normalizes to a Suitability Score; uses stability/weather-match as supporting evidence |

---

## 8. Module 1 — Farmer Input

```
District   (dropdown, from district_locations.csv)
Season     (Kharif / Rabi / Zaid)
Land Area  (numeric, acres) — REQUIRED, feeds estimated production

Optional:
Soil type
Irrigation availability
```

Example (illustrative — see Section 2):
```
District: Lucknow
Season: Kharif
Land Area: 2 acres
```

`land_area` is not a model input feature — it's a **post-processing multiplier**, and it requires a unit conversion (see Section 8a).

### 8a. Unit conversion utility — required, not optional

`land_area` is collected in **acres** (farmer-facing unit) but yield is predicted in **tonnes/hectare**. These must not be multiplied directly.

```
1 acre ≈ 0.4047 hectares

Estimated Production (t) = Predicted Yield (t/ha) × (Land Area (acres) × 0.4047)
```

Example: `2.8 t/ha × (2 acres × 0.4047 ha/acre) = 2.8 × 0.8094 ≈ 2.27 tonnes`

Build this as a single shared utility function (e.g. `convert_acres_to_hectares()`), called from `prediction_service.py`, and **unit-test it explicitly**. The failure mode to guard against is a silent bug like:
```
2.8 × 2 = 5.6 tonnes  ❌  (unit mismatch — acres treated as hectares)
```

---

## 9. Module — Location Resolution

District name → coordinates, because the weather API needs lat/long, not district names.

**`district_locations.csv`** (illustrative rows — see Section 2)

| District | State | Latitude | Longitude |
|---|---|---|---|
| Lucknow | UP | 26.8467 | 80.9462 |
| Kanpur Nagar | UP | 26.4499 | 80.3319 |
| Prayagraj | UP | 25.4358 | 81.8463 |

```
District → District Database → Latitude + Longitude → Weather API
```

```json
{
    "district": "Lucknow",
    "state": "Uttar Pradesh",
    "latitude": 26.8467,
    "longitude": 80.9462
}
```

---

## 10. Module 2 — Weather Engine

**Core reframe:** we are not just "predicting crops using historical data." We are using historical agricultural behavior **+** current/forecast weather to make a *present* recommendation.

### Current vs forecast — explicit, separate blocks

```json
{
  "current": {
    "temperature_avg": 29.4,
    "rainfall": 12.4,
    "humidity": 68.2,
    "wind_speed": 9.3
  },
  "forecast": {
    "horizon_days": 7,
    "forecast_avg_temperature": 30.1,
    "forecast_max_temperature": 35.0,
    "forecast_min_temperature": 25.0,
    "next_7_days_rainfall": 40.2
  }
}
```

The forecast horizon must match Section 13 (Prediction Horizon) and the training data window — see that section before building this.

### Weather API resilience — build this, don't skip it

```
Weather API Call
     ↓
   Success?
   /     \
 YES      NO
 ↓        ↓
Live     Cached / Last-known
Weather  Weather (clearly labeled
  \       "cached" in UI)
   \     /
    ↓
Feature Pipeline
```

Don't fake live data — make the system resilient and label the fallback state honestly in the React UI (a small "live"/"cached" badge is enough).

---

## 11. Historical Dataset — The Core Asset

### Honest framing for judges
Don't say: *"We have five years of data, therefore we have a huge dataset."*
Say instead: *"We use the most recent five-year window to prioritize recency, while using multiple district–crop–season observations as training samples."*

**Reality check on scale:** 10 districts × 10 crops × 3 seasons × 5 years ≈ 1,500 observations *before* missing/mismatched records — likely fewer in practice. This informs model choice (Section 15): favor well-regularized tabular models over anything data-hungry.

**If the dataset is too small:** expand **geography** before expanding the historical time window — the pitch is specifically about *recent* data.

**Coverage wording:** *"Latest five complete and consistently available agricultural years, documented per source"* — don't assume 2021–2025 applies uniformly across every source.

### One historical record should contain (illustrative — see Section 2)
```
District, Year, Season, Crop, Area cultivated, Production, Yield,
Rainfall, Average temperature, Humidity
```

| District | Year | Season | Crop | Area | Production | Yield | Rainfall | Temp |
|---|---|---|---|---|---|---|---|---|
| Lucknow | 2021 | Kharif | Rice | 1000 | 2400 | 2.4 | 820 | 29 |
| Lucknow | 2021 | Kharif | Maize | 600 | 1500 | 2.5 | 820 | 29 |
| Lucknow | 2022 | Kharif | Rice | 1100 | 2700 | 2.45 | 760 | 30 |
| Lucknow | 2022 | Kharif | Maize | 650 | 1700 | 2.61 | 760 | 30 |

### Why yield, not raw production
```
Crop A: Area = 100 ha, Production = 200 t  → Yield = 2.0 t/ha
Crop B: Area = 500 ha, Production = 700 t  → Yield = 1.4 t/ha
```
Raw production makes Crop B look better; yield reveals Crop A is actually more productive per unit land.

---

## 12. Weather Alignment — Explicit Data Contract

For every historical record, define **all** of the following before writing feature-engineering code:

| Question | Must be answered as |
|---|---|
| What dates? | Exact start/end date of the crop's growing window for that season |
| What aggregation? | Sum (rainfall), mean (temperature/humidity), or derived (dry-spell count) |
| Which growing period? | Per-crop, per-season — Kharif ≠ Rabi ≠ Zaid windows |
| Which rainfall window? | Full season total *and* distribution (heavy-rain days, dry-spell length) |
| Which forecast horizon (for live prediction)? | Must match the horizon used in Section 13 |

Example — fully specified record (illustrative):
```
Rice, Lucknow, Kharif 2024
  Rainfall during crop-growing window
  Average / max / min temperature during crop-growing window
  Humidity during crop-growing window
  Dry-spell days
  Heavy-rainfall days
```

This is the single most important spec document for Data Engineering + Weather owners to lock together before ingestion starts.

---

## 13. Prediction Horizon — Must Be Decided Before Data Collection

**Current lean:** given the stated goal — *"which crop is more suited to grow given the weather conditions?"* — **pre-season crop-selection (Option A)** is the likely default, pending confirmation that it matches the exact SIH problem statement (Section 26).

**Option A — Pre-season recommendation (leaning default)**
```
Historical seasonal conditions + seasonal/current forecast indicators → recommendation before the season starts
```
Use when the farmer is deciding *what to plant* ahead of the season.

**Option B — Short-term / in-season recommendation**
```
Historical crop response to weather + current 7/14/30-day weather conditions → recommendation during the season
```
Use when the farmer is deciding *something actionable now* mid-season.

**Whichever is chosen, training data must use the same kind of window as live prediction.** This is the #1 risk to resolve in Phase 3.

---

## 14. ML Model Design — Leakage-Safe Formulation

### Leakage-safe feature design
For a **2025** prediction, the input must only use **2021–2024** data:
```
2021–2024 historical crop performance (lagged)
+
2025 weather (current/forecast, per Section 13)
+
crop, district, season
              ↓
        2025 yield (target)
```

```
lagged_historical_yield   — mean yield over the N prior years, target year excluded
rolling_historical_yield  — e.g. 3-year rolling average, also lagged
yield_trend               — slope over the prior years only
```

Document the exact window (e.g., "trailing 4 years, target year excluded") in the feature-engineering notebook.

### What NOT to do
Don't build a simple classifier that outputs one crop name (`Rice`). Less interpretable, less defensible.

### Ranking via yield prediction
```
Weather + Location + Crop + Season → Expected Yield
```
Evaluate every candidate crop for the given conditions and rank by predicted yield.

### Model candidates
1. **Baseline:** Linear Regression
2. **Random Forest**
3. **XGBoost / LightGBM / CatBoost**

Given the realistic dataset size (~1,500 observations or fewer), favor models that handle small tabular data well; justify the final pick with validation metrics.

**Metrics:** MAE, RMSE, R². Select based on validation performance *and* stability.

### Train/test split — time-aware, not random
```
Train: 2021–2024
Test:  2025
```

### Acknowledge the data-size limitation openly
Don't use neural networks just because it's a hackathon — a well-engineered tabular model (RF/XGBoost) is more appropriate for this data volume.

---

## 15. Recommendation Engine — Suitability Score, Precisely Defined

### The remaining gap this section fixes
Predicted yield is the primary ranking signal (v1.1), but the *exact* method for turning yield into a 0–100 "Suitability Score" wasn't defined. Fixed here.

### Suitability Score formula
```
Candidate crops for the given district/season/weather
      ↓
Predicted yield for each candidate crop (from the model)
      ↓
Normalize predicted yields across the candidate set
      ↓
Suitability Score (0–100)
      ↓
Rank
```

Concretely, for a candidate set with predicted yields `y₁, y₂, ..., yₙ`:
```
Suitability Score(i) = 100 × (yᵢ − min(y)) / (max(y) − min(y))
```
The crop with the highest predicted yield in the candidate set scores 100; the lowest scores 0; everything else scales proportionally in between. **This makes the score fully derived from the model's own output** — nothing arbitrary is added on top, and it's trivial to explain to a judge: *"the score reflects each crop's predicted yield relative to the other candidates evaluated for this location and season."*

(Edge case: if all candidates have near-identical predicted yield, guard against divide-by-zero — e.g. default all scores to a neutral value like 70 in that case, and note this in code comments.)

### Layered signals — unchanged from v1.1, still correct
```
Predicted Yield          → drives the Suitability Score directly (see formula above)
Historical Stability     → shown as a labeled Risk Indicator (High/Medium/Low), not blended in
Weather Compatibility    → shown as Validation/Explanation text, not blended in
Yield Trend               → shown as Supporting Evidence, not blended in
```

### Historical consistency (label, not hidden weight)
```
Rice yields:  2.1, 2.5, 2.2, 2.4, 2.3   → stable   → "High" stability
Other crop:   2.8, 1.2, 3.0, 1.1, 2.9   → variable → "Low" stability
```

### Terminology rule — enforce everywhere (UI, API, slides)
Always: **"Suitability Score: 87/100"**
Never: "87% confidence" or "Probability: 87%" unless the model is explicitly probabilistically calibrated (it isn't in the MVP).

---

## 16. Explanation Engine

Deterministic, rule-based — not GenAI.

```
IF predicted_yield = high (within candidate set)
   AND historical_stability = high
   AND weather_match = high
THEN generate:
"Rice is recommended because it has demonstrated consistently strong
yields in this district over the historical period and the current
forecast conditions are favorable for its seasonal requirements."
```

### Farmer-facing output example (illustrative — see Section 2)
```
🌾 Recommended Crop: Rice
Suitability Score: 87/100

Why?
✓ Current temperature is favorable
✓ Forecast rainfall is compatible
✓ Strong historical performance in this district
✓ Stable yield over the last 5 years (High stability)
✓ Highest predicted yield among evaluated candidates

Expected Yield: 2.8 t/ha
Farm Area: 2 acres (≈0.81 ha)
Estimated Production: ≈ 2.27 tonnes

Alternatives:
2. Maize  — 78/100
3. Millet — 69/100
```

---

## 17. Backend Structure (FastAPI)

```
backend/
│
├── main.py
│
├── api/
│   ├── weather.py
│   ├── prediction.py
│   └── recommendation.py
│
├── services/
│   ├── weather_service.py      # returns {current, forecast}
│   ├── crop_service.py         # reads crops master table
│   ├── prediction_service.py   # loads model.pkl, leakage-safe feature prep,
│   │                           # calls unit-conversion utility (Section 8a)
│   └── recommendation_service.py  # normalizes predicted yields → Suitability Score
│
├── models/
│   ├── crop_model.pkl
│   └── preprocessing.pkl
│
├── schemas/
│   ├── prediction.py
│   └── weather.py
│
├── utils/
│   └── units.py                # convert_acres_to_hectares(), tested explicitly
│
└── data/
```

Routes in `api/` stay thin; all logic lives in `services/`. Never call the weather vendor directly from prediction code — always go through `WeatherService`.

---

## 18. API Contract

### `GET /weather/{district}`
```json
{
  "current": {
    "temperature": 29.4,
    "rainfall": 12.4,
    "humidity": 68
  },
  "forecast": {
    "horizon_days": 7,
    "avg_temperature": 30.1,
    "rainfall_total": 40.2
  },
  "source": "live"
}
```
`source` is `"live"` or `"cached"`.

### `POST /predict`
Request:
```json
{
  "district": "Lucknow",
  "season": "Kharif",
  "land_area_acres": 2
}
```

Response:
```json
{
  "district": "Lucknow",
  "season": "Kharif",
  "land_area_acres": 2,
  "land_area_hectares": 0.81,
  "recommendations": [
    {
      "crop": "Rice",
      "suitability_score": 87,
      "predicted_yield_t_per_ha": 2.8,
      "estimated_production_t": 2.27,
      "historical_stability": "High",
      "weather_compatibility": "High",
      "yield_trend": "Improving"
    },
    {
      "crop": "Maize",
      "suitability_score": 78,
      "predicted_yield_t_per_ha": 2.4,
      "estimated_production_t": 1.94,
      "historical_stability": "Medium",
      "weather_compatibility": "High",
      "yield_trend": "Stable"
    }
  ]
}
```

Note `land_area_acres` is explicit in the field name to prevent unit ambiguity on the frontend too (Section 8a).

---

## 19. Database Schema

Don't stand up PostgreSQL before the data pipeline and model exist. CSV/Parquet is enough early on; migrate once the schema below is stable.

### `districts`
| Column | Type | Notes |
|---|---|---|
| district_id | PK | |
| district_name | text | |
| state | text | |
| latitude | float | |
| longitude | float | |

### `crops`
| Column | Type | Notes |
|---|---|---|
| crop_id | PK | |
| crop_name | text | canonical name — prevents `Rice`/`rice`/`Paddy` becoming separate categories |
| season | text | Kharif / Rabi / Zaid |
| optimal_temperature_min | float | *optional — only if backed by a credible source* |
| optimal_temperature_max | float | *optional, same caveat* |
| rainfall_min | float | *optional, same caveat* |
| rainfall_max | float | *optional, same caveat* |

### `historical_crop_data`
| Column | Type | Notes |
|---|---|---|
| id | PK | |
| district_id | FK → districts | |
| crop_id | FK → crops | |
| year | int | |
| season | text | |
| area | float | pick one unit (hectares or acres) and document it everywhere |
| production | float | |
| yield | float | production / area |

### `historical_weather` (daily granularity)
| Column | Type | Notes |
|---|---|---|
| id | PK | |
| district_id | FK → districts | |
| date | date | daily — seasonal/crop-window aggregates computed at feature-engineering time |
| temperature_avg | float | |
| temperature_min | float | |
| temperature_max | float | |
| rainfall | float | |
| humidity | float | |
| wind_speed | float | |

### `predictions`
| Column | Type | Notes |
|---|---|---|
| id | PK | |
| district | text | |
| season | text | |
| crop | text | |
| land_area_acres | float | |
| land_area_hectares | float | *(stored converted, so it never needs recomputing)* |
| predicted_yield | float | |
| suitability_score | float | normalized per Section 15 |
| historical_stability | text | |
| weather_compatibility | text | |
| created_at | timestamp | |

---

## 20. React + TypeScript Frontend

### Structure
```
frontend/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   │
│   ├── components/
│   │   ├── FarmerInputForm.tsx        # district, season, land area
│   │   ├── WeatherPanel.tsx           # shows live/cached badge (Section 10)
│   │   ├── RecommendationList.tsx     # ranked crop cards
│   │   ├── CropDetailPanel.tsx        # "why this crop" explanation view
│   │   └── ScoreBadge.tsx             # renders "Suitability Score: 87/100" — never "confidence"
│   │
│   ├── api/
│   │   └── client.ts                  # typed fetch wrapper for FastAPI endpoints
│   │
│   ├── types/
│   │   └── prediction.ts              # shared TS types mirroring the FastAPI schemas (Section 18)
│   │
│   └── styles/
│
├── package.json
└── tsconfig.json
```

### Shared type example (`types/prediction.ts`)
```typescript
export interface CropRecommendation {
  crop: string;
  suitability_score: number;       // 0-100, never call this "confidence"
  predicted_yield_t_per_ha: number;
  estimated_production_t: number;
  historical_stability: "High" | "Medium" | "Low";
  weather_compatibility: "High" | "Medium" | "Low";
  yield_trend: "Improving" | "Stable" | "Declining";
}

export interface PredictionResponse {
  district: string;
  season: "Kharif" | "Rabi" | "Zaid";
  land_area_acres: number;
  land_area_hectares: number;
  recommendations: CropRecommendation[];
}
```

Keeping these types in sync with the actual FastAPI Pydantic schemas (Section 18) is Member 6's responsibility as part of the API contract (Section 6, Phase 0).

### UI layout (conceptual — same content as before, now a component tree, not Streamlit widgets)
```
----------------------------------
        🌾 Smart Agriculture
----------------------------------
<FarmerInputForm>
  District   [ Lucknow ▼ ]
  Season     [ Kharif ▼ ]
  Land Area  [ 2 acres ]
             [ ANALYZE ]
----------------------------------
<WeatherPanel source="live">
  29°C · Rainfall: 12 mm · Humidity: 68%
----------------------------------
<RecommendationList>
  🥇 Rice   87/100   ≈2.27 t
  🥈 Maize  78/100   ≈1.94 t
  🥉 Millet 69/100   ≈1.52 t
----------------------------------
<CropDetailPanel> (on click)
  WHY RICE?
  Historical stability: High
  Weather compatibility: High
  Expected yield: 2.8 t/ha
  Estimated production: ≈2.27 t
```

Built in **Phase 8**, after the pipeline works — not first. UI stays simple and functional; the engineering judges evaluate is the pipeline behind it.

---

## 21. ML Pipeline (Notebook Sequence)

```
01_data_collection.ipynb
        ↓
02_data_cleaning.ipynb
        ↓
03_feature_engineering.ipynb   ← lagged/rolling features built here, leakage checks live here
        ↓
04_model_training.ipynb
        ↓
05_model_evaluation.ipynb
        ↓
model.pkl
```

### Model serving separation
```
OFFLINE                          ONLINE
Historical Dataset                Farmer Request
      ↓                                 ↓
  Training                        Weather API (current + forecast)
      ↓                                 ↓
  Evaluation                    Feature Preparation (same horizon as training)
      ↓                                 ↓
  Best Model                        model.pkl
      ↓                                 ↓
  model.pkl                        Prediction → Suitability Score normalization → API response
```
Never retrain on a farmer's click.

---

## 22. Future Expansion — Upgrade Roadmap (Phase 2+, explicitly NOT MVP scope)

**None of this section is required for the SIH internal hackathon submission.** It exists so the team has a credible, pre-thought-out answer when judges ask "where does this go next?" — and so nobody accidentally starts building Phase 2 features before the MVP (Sections 1–21) is done. The pitch line to use:

> "We built the core decision engine first, and designed a modular intelligence layer around it that can progressively add knowledge retrieval, autonomous agents, risk analysis, scenario simulation, market intelligence, and continuous learning."

### 22.1 Roadmap shape

```
                    CORE MVP
                       │
          Crop Suitability Engine
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   RAG Knowledge    Agentic AI    Reports
        │              │              │
        └──────────────┼──────────────┘
                       ↓
              AGRICULTURE COPILOT
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Risk Engine    Market Intelligence  Alerts
        │              │              │
        └──────────────┼──────────────┘
                       ↓
              FARM DECISION ENGINE
```

### 22.2 Upgrade 1 — RAG Agricultural Knowledge Engine (P1)

The MVP answers *"what crop should I consider?"*. RAG answers *"why — what agricultural knowledge supports this?"*

**Knowledge base sources:** government agricultural guidelines, ICAR publications, state agricultural university documents, crop cultivation guides, government schemes, soil/crop management documents, pest management guidelines, weather advisories, crop calendars, agricultural research papers.

```
Documents → Chunking → Embeddings → Vector DB → Retriever
    → Relevant agricultural knowledge → LLM → Grounded answer
```

Example — combining ML prediction + historical evidence + weather + retrieved knowledge, the system can explain *why* maize is ranked highly by citing both the model's predicted yield and agricultural guidance on suitable temperature/rainfall ranges — grounded, not a generic chatbot answer.

### 22.3 Upgrade 2 — Agentic Agriculture Orchestrator (P1)

Instead of a single LLM call, use an orchestrator that routes a farmer's query to specialized agents:

```
                  Farmer Query
                       ↓
                Intent Detection
                       ↓
              Agriculture Orchestrator
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
 Weather Agent    Crop Agent       Knowledge Agent
       ↓               ↓                ↓
  Weather API       ML Model          RAG
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 Decision Agent
                       ↓
                  Final Answer
```

Example: *"I have 3 acres in Prayagraj, what should I plant this season?"* → orchestrator determines it needs location, season, weather, crop predictions, agricultural knowledge, and farm area, then invokes the right tools automatically. This is genuine agentic behavior, not just "we call an LLM."

### 22.4 Upgrade 3 — Tool-Using Agents (P1, pairs with 22.3)

```
Agent
 ├── Weather Tool     — get_current_weather(), get_forecast()
 ├── Crop Tool        — predict_crop_yield(), rank_crops()
 ├── Knowledge Tool   — search_agricultural_knowledge()
 ├── Report Tool      — generate_farmer_report()
 ├── Risk Tool        — assess_weather_risk()
 └── Alert Tool       — create_weather_alert()
```

### 22.5 Upgrade 4 — Farm Decision Report (P1)

Instead of returning "Rice — 87/100," generate a full report:

```
FARM DECISION REPORT
────────────────────────────
Farmer/Farm Details — Location — Season — Farm Area
1. Current Weather
2. Forecast
3. Historical Agricultural Performance
4. Top Crop Recommendations
5. Expected Yield
6. Estimated Production
7. Risk Analysis
8. Why These Crops?
9. Alternative Crops
10. Weather Risks
11. Recommended Actions
12. Data Sources
13. Model Information
```

Output formats: PDF, HTML, JSON. A downloadable PDF report is a strong, tangible hackathon demo feature.

### 22.6 Upgrade 5 — Agricultural Risk Prediction (P1)

The MVP answers "which crop is suitable?" — the natural next question is "what could go wrong?"

```
Weather + Historical variability + Forecast anomalies + Crop sensitivity
       ↓
   Risk Engine
       ↓
   Risk Score
```

Possible outputs: 🌧 Excess Rainfall Risk, 🔥 Heat Stress Risk, 🌵 Dry Spell Risk, 🌪 Extreme Weather Risk — shown alongside the Suitability Score (e.g. "Rice — 87/100, ⚠ High rainfall risk, ⚠ Moderate flooding risk, ✓ Low heat risk").

### 22.7 Upgrade 6 — What-If Scenario Simulator (P2)

Let the farmer ask *"what if rainfall is 20% lower?"* or *"what if temperature increases by 2°C?"* — re-run the model with modified weather inputs:

```
Baseline → Predicted Yield
Scenario → Modified Weather → Model → New Yield → Difference
```

Example: `Rice baseline 2.8 t/ha → Rainfall −20% → 2.3 t/ha (−17.9%)`. This shifts the system from prediction to decision-support under uncertainty.

### 22.8 Upgrade 7 — Smart Weather Alert System (P2)

```
Weather API → Risk Engine → Threshold / Model → Alert
```
e.g. *"⚠ Heavy rainfall expected in the next 48 hours. Your selected crop may be exposed to excess-water risk."* Turns the system from a one-time query tool into a continuous decision-support platform.

### 22.9 Upgrade 8 — Historical Crop Intelligence (P2)

Turn the existing historical dataset into an analytics module per crop: 5-year yield trend, average yield, yield variability, best/worst year, weather relationship, district performance — giving the farmer visible evidence behind a recommendation (e.g. a simple yield-by-year bar chart with a trend label like "↑ Improving, Stability: High").

### 22.10 Upgrade 9 — Model Explainability (P2)

Instead of "Model says Rice," show relative feature contribution (e.g. rainfall, temperature, historical yield, yield trend, each as a bar). For tree-based models: feature importance, SHAP, or partial dependence where appropriate. Gives the farmer a simple explanation and the judge a technically rigorous one.

### 22.11 Upgrade 10 — Market Intelligence (P3)

```
Crop Recommendation + Expected Yield + Current Market Price → Revenue Estimate
```
e.g. Rice: yield 2.8 t/ha, farm area 2 acres, production 2.27 t, market price ₹X/kg → estimated gross revenue ₹Y. Compare crops on yield, revenue, and risk together. **Important distinction to keep in any pitch:** revenue ≠ profit — profit requires input-cost data, which is out of scope until this is built.

### 22.12 Upgrade 11 — Soil Intelligence (P3)

The MVP explicitly excludes soil/irrigation from the model (Section 7). Phase 2 can add:
```
Soil Data (N, P, K, pH, Organic Carbon, Moisture, Soil Type) + Weather + Historical Crop Performance + Crop → Yield Prediction
```
Makes recommendations meaningfully more personalized.

### 22.13 Upgrade 12 — Irrigation Recommendation (P4)

Once soil moisture + weather + crop data exist: `Crop + Weather + Soil + Rainfall forecast → Irrigation Recommendation` (e.g. "38mm forecast over next 3 days — additional irrigation may not be necessary immediately").

### 22.14 Upgrade 13 — District-Level Agriculture Intelligence Map (P3)

A geographic dashboard (India → State → District → Crop) showing suitability, average yield, weather risk, and trends per district — useful beyond individual farmers, to agricultural officers, district administrations, NGOs, and policymakers.

### 22.15 Upgrade 14 — Farmer Profile + Personalization (P3)

Store farm area, location, soil, irrigation, previously grown crops, and preferences per farmer so recommendations become increasingly personalized rather than identical for every farmer in a district.

### 22.16 Upgrade 15 — Feedback Learning Loop (P3, high long-term value)

```
System recommendation → Farmer grows crop → Actual yield →
Farmer submits outcome → System stores outcome →
Model evaluation → Future model improvement
```
Turns the system from a static model into a closed-loop learning system: Prediction → Real-world outcome → Feedback → Learning → Better prediction.

### 22.17 Upgrade 16 — Agent Memory (P3)

If the agentic orchestrator (22.3) is built, give it memory of the farm profile, previous crops, previous recommendations, and historical outcomes — enabling things like *"Last season you grew wheat on this farm — want to compare this year's recommendation with last year's crop?"*

### 22.18 Upgrade 17 — Multilingual / Voice Assistant (P4, high UX value)

```
Speech → Speech-to-Text → Agent → Agriculture Intelligence → Response → Text-to-Speech
```
Lets a farmer ask in Hindi or a regional language instead of navigating dropdowns. Build only after the core intelligence layer works — this is a UX layer on top, not a substitute for it.

### 22.19 Upgrade 18 — Confidence / Uncertainty Layer (P4, advanced ML)

Instead of a single point prediction, show a range and reliability label: *"Predicted yield: 2.8 ± 0.4 t/ha, Prediction reliability: Medium"* — via prediction intervals, quantile regression, ensembles, or conformal prediction. Makes the system more scientifically responsible, but is genuinely advanced — don't attempt before the MVP and P1/P2 items are solid.

### 22.20 Upgrade 19 — Two Interface Modes (P3)

Same backend, two frontends:
```
                 Agriculture Intelligence
                          │
                ┌─────────┴─────────┐
                ↓                   ↓
          Farmer Portal       Officer Dashboard
```
**Farmer Mode:** what should I grow / why / expected yield / risks — kept simple.
**Officer Mode:** district crop trends, suitability maps, weather anomalies, yield forecasts, risk distribution, historical analysis, reports — full detail. This is what makes the system scalable beyond a single-farmer tool.

### 22.21 Upgrade 20 — Multi-Model Decision Engine (long-term architecture)

```
                 Decision Engine
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
Crop Model       Weather Risk       Yield Model
       ↓               ↓                ↓
       └───────────────┼────────────────┘
                       ↓
                 Market Model
                       ↓
                 Final Decision
```
Evolves the single crop-suitability model into a registry of independently updatable models, orchestrated by the agent layer (22.3) — the long-term realization of "other models get added over time and the farmer's decision keeps getting better supported."

### 22.22 Priority Ranking

| Priority | Upgrade | Value |
|---|---|---|
| 🔥 P1 | RAG Agricultural Knowledge Base | Very High |
| 🔥 P1 | Agentic Orchestrator + Tools | Very High |
| 🔥 P1 | Detailed Farm Report | Very High |
| 🔥 P1 | Risk Prediction | Very High |
| 🔥 P2 | What-if Scenario Simulator | Very High |
| 🔥 P2 | Model Explainability | High |
| 🔥 P2 | Historical Crop Intelligence | High |
| 🔥 P2 | Weather Alerts | High |
| P3 | Market Intelligence | High |
| P3 | Soil Intelligence | High |
| P3 | Feedback Learning Loop | Very High (long-term) |
| P3 | Agent Memory | High |
| P3 | Officer Dashboard | High |
| P4 | Voice / Multilingual | High UX |
| P4 | Irrigation Recommendation | High |
| P4 | Uncertainty / Confidence Layer | Advanced |

### 22.23 Platform Evolution — 4 Phases

**Phase 1 — MVP (this document, Sections 1–21):**
```
Crop Suitability + Weather + Historical Agriculture + Yield Prediction + Recommendation
```

**Phase 2 — Intelligence:**
```
        Agriculture Intelligence
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
      RAG      Risk      Explainability
       │         │         │
       └─────────┼─────────┘
                 ↓
          Scenario Simulator
```

**Phase 3 — Agent:**
```
                Farmer
                   ↓
             AI Orchestrator
                   │
      ┌────────────┼────────────┐
      ↓            ↓            ↓
   Weather       Crop          RAG
    Tool         Tool          Tool
      ↓            ↓            ↓
      └────────────┼────────────┘
                   ↓
             Decision Agent
                   ↓
              Report Agent
```

**Phase 4 — Full Agriculture Copilot:**
```
                  🌾 AGRI AI
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
Crop Intelligence  Risk Engine  Market Intelligence
      │              │              │
      └──────────────┼──────────────┘
                     ↓
               Decision Engine
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Farmer App    Officer Portal   Reports
       │
       ↓
  Voice / Hindi
       │
       ↓
 Feedback Loop
       │
       ↓
 Continuous Learning
```

This reads as a platform vision during judge Q&A, not just a single ML project — while the actual hackathon deliverable stays scoped to Sections 1–21.

---

## 23. Team Roles (6-Person Split)

| Member | Role | Responsibilities |
|---|---|---|
| 1 | ML / Crop Suitability | Dataset, leakage-safe feature engineering, model training, evaluation, model export |
| 2 | Data Engineering | Historical datasets, weather datasets (daily granularity), cleaning, district + crop master mapping, ingestion |
| 3 | Weather + External APIs | Weather API integration (current **and** forecast blocks), location service, caching/fallback, error handling |
| 4 | Backend | FastAPI, endpoints, business logic, unit-conversion utility, database, model serving |
| 5 | Frontend | **React + TypeScript** UI, typed API client, weather panel with live/cached indicator, recommendation cards, explanation view |
| 6 | **Integration Lead** — starts Day 1, not last | Git conventions, Docker skeleton, shared TS/Pydantic API contracts, environment variables, integration tests, CI/basic testing, deployment |

**Everyone must understand the full architecture** — every member should be able to defend the system end-to-end.

---

## 24. Build Checklist

### Level 1 — Mandatory before internal hackathon
- [ ] Historical dataset (source-documented, per Section 11 — real data, not the illustrative examples in this doc)
- [ ] Data cleaning
- [ ] Weather API integration (current + forecast, per Section 10)
- [ ] Crop suitability model (leakage-checked, per Section 14)
- [ ] Model evaluation
- [ ] FastAPI backend
- [ ] Working `/predict` endpoint (Section 18)
- [ ] Suitability Score normalization implemented (Section 15)
- [ ] Unit-conversion utility, unit-tested (Section 8a)
- [ ] React + TypeScript frontend
- [ ] Full Input → Processing → Output workflow
- [ ] Recommendation explanation

### Level 1.5 — Resilience additions
- [ ] End-to-end integration test
- [ ] Fallback when weather API fails (cached weather, clearly labeled in UI)
- [ ] Model input validation
- [ ] Prediction latency test
- [ ] Demo dataset / cached weather fallback ready before demo day
- [ ] Reproducible model training (fixed seeds, documented pipeline)
- [ ] Source/licensing documentation for every dataset used

### Level 2 — Strong additions
- [ ] Top-3 crop recommendations
- [ ] Expected yield + estimated production display
- [ ] Historical performance chart
- [ ] Weather dashboard with live/cached source indicator
- [ ] Historical stability / weather compatibility labels (not blended into one score)
- [ ] Model comparison (LR vs RF vs XGBoost)
- [ ] Error handling
- [ ] API caching

### Level 3 — Do not prioritize until MVP fully works
- [ ] Disease detection
- [ ] Fertilizer recommendation
- [ ] Market/price prediction
- [ ] Government schemes
- [ ] Voice assistant / chatbot
- [ ] Marketplace
- [ ] IoT
- [ ] Generative AI

---

## 25. Demo Script (What to Show Judges)

1. Select **District → Lucknow**, **Season → Kharif**, **Land Area → 2 acres** in the React UI
2. System fetches current weather + forecast (React UI shows "live" or "cached" honestly)
3. System retrieves recent historical agricultural performance for the district (lagged, not same-period)
4. Model evaluates candidate crops: Rice, Maize, Millet, Soybean, etc.
5. Model produces expected yield per crop
6. Recommendation engine normalizes predicted yields into Suitability Scores and ranks
7. UI displays: 🥇 Rice — 87/100 (≈2.27 t), 🥈 Maize — 78/100 (≈1.94 t), 🥉 Millet — 69/100
8. Click "Rice" → explanation panel:
   ```
   WHY RICE?
   Historical stability: High
   Weather compatibility: High
   Expected yield: 2.8 t/ha
   Estimated production (2 acres ≈ 0.81 ha): ≈2.27 t
   Suitability Score: 87/100
   ```

If asked how the 87 was derived: *"It's the crop's predicted yield normalized against the other candidate crops evaluated for this district and season — highest predicted yield scores 100, lowest scores 0."*

---

## 26. What Makes This SIH-Worthy

**Weak pitch (avoid):** "We use machine learning to predict crops."

**Our actual pitch:**
> A dynamic crop decision-support system that combines recent district-level agricultural history with real-time and forecast weather conditions to rank crop suitability for the farmer's current situation.

```
Traditional:  Historical data → Static recommendation

Ours:         Historical agricultural behavior (lagged, leakage-safe)
                        +
              Current weather
                        +
              Forecast weather (defined horizon)
                        +
              Crop-specific performance
                        ↓
              Predicted-yield-based, normalized ranking
                        ↓
              Actionable recommendation + estimated production
```

---

## 27. Open Decisions — Lock These Before Anyone Codes (Phase 0–1)

1. **Exact SIH Problem Statement** the team is targeting — verify this architecture genuinely maps to it
2. **Prediction horizon** (Section 13): pre-season is the current lean — confirm against the SIH problem statement
3. **Exact agricultural dataset(s)**: source, districts, crops, years per source, licensing — everything in this document is illustrative (Section 2) until this is locked
4. **Exact weather source/API**: must support both current and forecast data with a usable forecast horizon

Once these four are locked, the schema is ready to turn directly into the actual project folder structure and implementation tasks — architecture itself is frozen (Section 3) and should not need further structural revision.

---

## 28. Common Domain List

This is the shared vocabulary for the whole team — ML, backend, frontend, and integration should all refer to these entities by these names. Each entity is tagged **MVP** (build now, Sections 1–21) or its roadmap priority (**P1–P4**, Section 22) so nobody accidentally scopes roadmap entities into the hackathon build.

### 28.1 `District` — MVP
Core geographic unit everything else attaches to.
| Field | Type | Notes |
|---|---|---|
| district_id | PK | |
| district_name | string | canonical, standardized casing |
| state | string | |
| latitude | float | |
| longitude | float | |

**Relationships:** parent of `HistoricalCropRecord`, `HistoricalWeatherRecord`, `Prediction`; referenced by `WeatherSnapshot`.

### 28.2 `Season` — MVP
Enum, not a table: `Kharif | Rabi | Zaid`. Defines the growing window used to align historical weather (Section 12) and to scope `Crop` records.

### 28.3 `Crop` — MVP
Master reference for every crop the model evaluates.
| Field | Type | Notes |
|---|---|---|
| crop_id | PK | |
| crop_name | string | canonical — prevents `Rice`/`rice`/`Paddy` duplication |
| season | Season | which season(s) this crop is grown in |
| optimal_temperature_min/max | float | optional, only with a credible source |
| rainfall_min/max | float | optional, only with a credible source |

**Relationships:** referenced by `HistoricalCropRecord`, `Prediction`, and (roadmap) `MarketPrice`, `RiskAssessment`.

### 28.4 `HistoricalCropRecord` — MVP
One row = one district–crop–season–year observation. This is the ML training unit (Section 11).
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| district_id | FK → District | |
| crop_id | FK → Crop | |
| year | int | |
| season | Season | |
| area | float | one unit, documented globally |
| production | float | |
| yield | float | production / area |

### 28.5 `HistoricalWeatherRecord` — MVP
Daily granularity (Section 19), aggregated into seasonal/crop-window features at training time.
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| district_id | FK → District | |
| date | date | |
| temperature_avg/min/max | float | |
| rainfall | float | |
| humidity | float | |
| wind_speed | float | |

### 28.6 `WeatherSnapshot` — MVP
Not persisted long-term (or persisted only as a cache) — represents a live API response, split into current and forecast blocks (Section 10).
| Field | Type | Notes |
|---|---|---|
| district_id | FK → District | |
| current | object | temperature_avg, rainfall, humidity, wind_speed |
| forecast | object | horizon_days, forecast_avg/max/min_temperature, rainfall_total |
| source | enum | `live` \| `cached` |
| fetched_at | timestamp | |

### 28.7 `FarmerInput` — MVP
Not persisted as its own table necessarily, but the canonical request shape (Section 8).
| Field | Type | Notes |
|---|---|---|
| district_id | FK → District | |
| season | Season | |
| land_area_acres | float | converted to hectares via the unit utility (Section 8a) before use |
| soil_type | string | optional, unused by model in MVP |
| irrigation_available | bool | optional, unused by model in MVP |

### 28.8 `ModelFeatureVector` — MVP
The leakage-safe, assembled input actually passed to `model.pkl` (Section 14) — internal, not exposed via API.
```
district_id, crop_id, season,
lagged_historical_yield, rolling_historical_yield, yield_trend,
temperature_avg/min/max, rainfall, humidity, wind_speed,
rainfall_deviation, temperature_deviation
```

### 28.9 `Prediction` — MVP
Persisted output of one `/predict` call, one row per candidate crop evaluated (Section 19).
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| district_id | FK → District | |
| crop_id | FK → Crop | |
| season | Season | |
| land_area_acres / land_area_hectares | float | |
| predicted_yield_t_per_ha | float | raw model output |
| suitability_score | float | normalized 0–100 (Section 15) |
| historical_stability | enum | High \| Medium \| Low |
| weather_compatibility | enum | High \| Medium \| Low |
| yield_trend | enum | Improving \| Stable \| Declining |
| estimated_production_t | float | derived, land_area_hectares × predicted_yield |
| created_at | timestamp | |

### 28.10 `Recommendation` — MVP
The ranked, farmer-facing view over a set of `Prediction` rows for one request — not necessarily its own table, but the response shape of `/predict` (Section 18): an ordered list of `Prediction`s plus the request context.

### 28.11 `KnowledgeDocument` / `KnowledgeChunk` — P1 (RAG, Section 22.2)
| Field | Type | Notes |
|---|---|---|
| document_id | PK | |
| source | string | e.g. ICAR, state agri university |
| title | string | |
| chunk_id | PK (child) | |
| chunk_text | text | |
| embedding | vector | stored in vector DB, not relational DB |

### 28.12 `AgentTool` / `AgentQuery` — P1 (Orchestrator, Section 22.3–22.4)
`AgentTool`: name, description, input schema, output schema (weather tool, crop tool, knowledge tool, report tool, risk tool, alert tool).
`AgentQuery`: farmer's raw query text, detected intent, tools invoked, final composed answer.

### 28.13 `FarmReport` — P1 (Section 22.5)
| Field | Type | Notes |
|---|---|---|
| report_id | PK | |
| prediction_ids | FK list | which `Prediction` rows this report covers |
| format | enum | PDF \| HTML \| JSON |
| generated_at | timestamp | |
| sections | object | maps to the 13-section report structure in 22.5 |

### 28.14 `RiskAssessment` — P1 (Section 22.6)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| prediction_id | FK → Prediction | |
| rainfall_risk | enum | Low \| Moderate \| High |
| heat_stress_risk | enum | Low \| Moderate \| High |
| dry_spell_risk | enum | Low \| Moderate \| High |
| extreme_weather_risk | enum | Low \| Moderate \| High |
| risk_score | float | composite, method to be defined when this phase is built |

### 28.15 `ScenarioSimulation` — P2 (Section 22.7)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| base_prediction_id | FK → Prediction | |
| modified_weather | object | e.g. rainfall_delta_pct, temperature_delta_c |
| resulting_yield | float | |
| yield_change_pct | float | |

### 28.16 `WeatherAlert` — P2 (Section 22.8)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| district_id | FK → District | |
| alert_type | enum | heavy_rainfall \| heat \| dry_spell \| extreme_weather |
| message | text | |
| triggered_at | timestamp | |

### 28.17 `MarketPrice` — P3 (Section 22.11)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| crop_id | FK → Crop | |
| price_per_kg | float | |
| market_region | string | |
| recorded_at | date | |

### 28.18 `SoilProfile` — P3 (Section 22.12)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| district_id or farm_id | FK | |
| nitrogen, phosphorus, potassium | float | N-P-K |
| ph | float | |
| organic_carbon | float | |
| moisture | float | |
| soil_type | string | |

### 28.19 `FarmerProfile` — P3 (Section 22.14–22.15)
| Field | Type | Notes |
|---|---|---|
| farmer_id | PK | |
| name / contact | string | |
| farm_area_acres | float | |
| default_district_id | FK → District | |
| soil_profile_id | FK → SoilProfile | optional |
| previously_grown_crops | FK list → Crop | |
| preferences | object | free-form |

### 28.20 `FeedbackOutcome` — P3 (Section 22.16)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| prediction_id | FK → Prediction | |
| farmer_id | FK → FarmerProfile | |
| actual_yield | float | |
| submitted_at | timestamp | |
| notes | text | |

### 28.21 `ModelVersion` — MVP (light) → P4 (full registry, Section 22.21)
| Field | Type | Notes |
|---|---|---|
| model_id | PK | |
| version | string | |
| algorithm | enum | LinearRegression \| RandomForest \| XGBoost \| LightGBM \| CatBoost |
| trained_on_years | string | e.g. "2021-2024" |
| metrics | object | MAE, RMSE, R² |
| artifact_path | string | path to `.pkl` |
| is_active | bool | which model FastAPI currently loads |

---

## 29. Full API Specification

Covers every endpoint across MVP and roadmap. **Build only the MVP (Level 1) rows for the hackathon** — the rest is here so the API surface is planned coherently instead of improvised phase-by-phase. All request/response bodies are JSON; all endpoints are versioned under `/api/v1/` in practice even though shown bare below for readability.

### 29.1 MVP Endpoints — Build These Now

| Method | Path | Purpose | Request | Response (key fields) | Status codes |
|---|---|---|---|---|---|
| GET | `/health` | Liveness check for deployment/integration testing | — | `{ "status": "ok" }` | 200 |
| GET | `/districts` | List all districts for the farmer-input dropdown | — | `[{ district_id, district_name, state }]` | 200 |
| GET | `/districts/{district_id}` | Full district detail incl. coordinates | — | `District` object (28.1) | 200, 404 |
| GET | `/crops` | List all crops, optionally filtered by season | query: `season?` | `[{ crop_id, crop_name, season }]` | 200 |
| GET | `/weather/{district_id}` | Current + forecast weather for a district | — | `WeatherSnapshot` (28.6), see Section 18 for exact shape | 200, 404, 502 (vendor failure → falls back to cached, see 29.4) |
| POST | `/predict` | Core MVP endpoint — ranked crop recommendations | `FarmerInput` (28.7): `district_id, season, land_area_acres` | `Recommendation`: list of `Prediction` (28.9), see Section 18 for exact shape | 200, 400 (invalid district/season), 500 |
| GET | `/predictions/{prediction_id}` | Retrieve a previously generated prediction (for demo replay / integration tests) | — | `Prediction` object | 200, 404 |
| GET | `/historical/{district_id}/{crop_id}` | Historical yield series for charting (Section 22.9 groundwork, but useful even in MVP demo) | — | `[{ year, yield, rainfall, temperature_avg }]` | 200, 404 |
| GET | `/models/active` | Which model version is currently loaded (integration/debug use) | — | `ModelVersion` (28.21), minus `artifact_path` | 200 |

### 29.2 P1 Endpoints — RAG, Agent, Reports, Risk (Section 22.2–22.6)

| Method | Path | Purpose | Request | Response (key fields) |
|---|---|---|---|---|
| POST | `/knowledge/search` | Retrieve relevant agricultural knowledge chunks | `{ query, crop_id?, district_id? }` | `[{ chunk_text, source, score }]` |
| POST | `/agent/query` | Natural-language entry point to the orchestrator | `{ farmer_query, farmer_id? }` | `{ answer, tools_used[], recommendation? }` |
| POST | `/reports/generate` | Generate a Farm Decision Report | `{ prediction_id, format: "pdf"|"html"|"json" }` | `{ report_id, download_url }` (async: `202` + poll, or sync for small reports) |
| GET | `/reports/{report_id}` | Fetch a generated report | — | `FarmReport` (28.13) or binary (PDF) |
| GET | `/risk/{prediction_id}` | Risk assessment for a given prediction | — | `RiskAssessment` (28.14) |

### 29.3 P2 Endpoints — Scenarios, Alerts, Explainability (Section 22.7–22.10)

| Method | Path | Purpose | Request | Response (key fields) |
|---|---|---|---|---|
| POST | `/scenario/simulate` | Re-run prediction under modified weather | `{ base_prediction_id, rainfall_delta_pct?, temperature_delta_c? }` | `ScenarioSimulation` (28.15) |
| GET | `/alerts/{district_id}` | Active weather alerts for a district | — | `[WeatherAlert]` (28.16) |
| GET | `/predictions/{prediction_id}/explain` | Feature-level explanation (importance/SHAP) | — | `{ feature_contributions: [{ feature, importance, direction }] }` |

### 29.4 P3 Endpoints — Market, Soil, Personalization, Feedback (Section 22.11–22.16, 22.20)

| Method | Path | Purpose | Request | Response (key fields) |
|---|---|---|---|---|
| GET | `/market/{crop_id}` | Current market price for a crop | query: `region?` | `MarketPrice` (28.17) list |
| POST | `/predict/revenue` | Yield + market price → revenue estimate | `{ prediction_id }` | `{ estimated_revenue, price_per_kg, price_date }` |
| POST | `/soil-profile` | Submit soil data for a district/farm | `SoilProfile` (28.18) | `{ soil_profile_id }` |
| GET/POST | `/farmers/{farmer_id}` | Get/create farmer profile | `FarmerProfile` (28.19) | `FarmerProfile` object |
| POST | `/feedback` | Farmer submits actual post-season outcome | `FeedbackOutcome` (28.20) minus id | `{ feedback_id }` |
| GET | `/districts/{district_id}/intelligence` | District-level aggregated intelligence (map view) | — | `{ crops: [{ crop_id, avg_suitability, avg_yield, weather_risk }] }` |

### 29.5 P4 Endpoints — Voice, Irrigation, Uncertainty (Section 22.13, 22.18–22.19)

| Method | Path | Purpose | Request | Response (key fields) |
|---|---|---|---|---|
| POST | `/voice/query` | Speech-to-text → agent → text-to-speech pipeline entry | audio blob + `language` | audio blob or `{ text_answer, audio_url }` |
| GET | `/irrigation/{prediction_id}` | Irrigation recommendation given forecast + soil | — | `{ recommendation_text, next_rainfall_mm, action }` |
| GET | `/predictions/{prediction_id}/uncertainty` | Prediction interval / reliability | — | `{ predicted_yield, lower_bound, upper_bound, reliability }` |

### 29.6 Cross-Cutting API Rules

- **Weather API failure handling (Section 10) applies to every endpoint that touches live weather** (`/weather/*`, `/predict`, `/scenario/simulate`, `/alerts/*`) — always attempt live, fall back to cached, and always return a `source: "live" | "cached"` field so the frontend can render the badge honestly.
- **Unit conversion (Section 8a)** happens server-side only, inside `prediction_service.py` — never trust a client-supplied `land_area_hectares` without also validating it against `land_area_acres`.
- **Suitability Score (Section 15)** is only ever computed relative to the candidate set returned in the *same* `/predict` call — it is not a globally comparable number across different districts/seasons/requests, and no endpoint should imply otherwise.
- **Terminology enforcement (Section 15)** applies to every response field and every roadmap endpoint too: `suitability_score`, never `confidence` or `probability`, unless an endpoint is explicitly under the uncertainty layer (29.5), where calibrated intervals are the whole point.
- All list endpoints should support basic pagination (`limit`, `offset`) once real data volume justifies it — not required for MVP demo data.

---

## 30. Common Domain Naming Convention (Canonical Glossary)

**Rule for the whole team: use the exact name in the "Canonical Name" column, everywhere — DB columns, Python variables, JSON fields, TypeScript types, notebook variables, and slide decks.** No synonyms, no per-member shorthand (no `dist`, `sc`, `pred`, `wthr`). This is what prevents the classic hackathon failure of "everyone's module works alone, nothing lines up when connected" (Section 6).

### 30.1 Casing rules by layer
| Layer | Casing | Example |
|---|---|---|
| Database columns | `snake_case` | `land_area_acres` |
| Python (FastAPI, ML) | `snake_case` | `land_area_acres` |
| JSON (API request/response) | `snake_case` | `"land_area_acres": 2` |
| TypeScript types/interfaces | `PascalCase` for type names, `snake_case` for fields (mirrors JSON exactly — see Section 20) | `interface CropRecommendation { suitability_score: number }` |
| React components | `PascalCase` | `RecommendationList.tsx` |
| Enum values | `PascalCase` string values | `"Kharif"`, `"High"`, `"Improving"` |
| File/folder names | `snake_case` (Python), `PascalCase` (React components) | `weather_service.py`, `WeatherPanel.tsx` |

### 30.2 Canonical entity names
| Concept | Canonical Name | Do NOT use |
|---|---|---|
| A geographic district | `District` / `district` | Location, Area, Region (Region is reserved for market region, 30.4) |
| Growing season | `Season` / `season` | Term, Cycle |
| A crop type | `Crop` / `crop` | CropType, Item |
| One year's crop+yield record | `HistoricalCropRecord` | CropData, YieldRecord, HistData |
| One day's weather record | `HistoricalWeatherRecord` | WeatherData, DailyWeather |
| A live/forecast weather pull | `WeatherSnapshot` | WeatherResponse, WeatherPayload |
| The farmer's submitted form | `FarmerInput` | UserInput, RequestData |
| Assembled model input | `ModelFeatureVector` | Features, X, InputVector |
| One model output for one crop | `Prediction` | Result, Output, ModelResult |
| The ranked list returned to the farmer | `Recommendation` | Response, ResultSet |
| The 0–100 score | `suitability_score` | score, confidence, probability, rank_score |
| Predicted yield | `predicted_yield_t_per_ha` | yield, expected_yield, yieldPred |
| Converted production estimate | `estimated_production_t` | production, output_t |
| Farmer's land size input | `land_area_acres` | area, land, farmSize |
| Converted land size | `land_area_hectares` | area_ha, landHa |
| A trained model artifact | `ModelVersion` | Model, MLModel |

### 30.3 Canonical field names used across multiple entities
| Field | Canonical Name | Notes |
|---|---|---|
| Primary key suffix | `_id` | e.g. `district_id`, `crop_id`, `prediction_id` — never `_ID`, `Id`, or bare `id` except on the entity's own table |
| Foreign key | same as the referenced entity's PK | `district_id` inside `HistoricalCropRecord`, not `districtRef` or `district_fk` |
| Timestamps | `created_at`, `fetched_at`, `triggered_at`, `recorded_at`, `submitted_at` | always `_at` suffix, always UTC |
| Temperature fields | `temperature_avg`, `temperature_min`, `temperature_max` | never `temp`, `avgTemp`, `tempC` |
| Rainfall | `rainfall` (historical/current), `rainfall_total` (forecast window), `rainfall_deviation` (feature) | never `precip`, `precipitation`, `rain` |
| Humidity | `humidity` | never `hum`, `rh` |
| Wind | `wind_speed` | never `wind`, `windSpd` |
| Data source flag | `source` with values `"live"` / `"cached"` | never `is_live` (boolean loses the "why" for judges) |
| Stability label | `historical_stability` with values `High`/`Medium`/`Low` | never `consistency`, `stability_score` |
| Weather-match label | `weather_compatibility` with values `High`/`Medium`/`Low` | never `weather_match`, `weatherFit` |
| Trend label | `yield_trend` with values `Improving`/`Stable`/`Declining` | never `trend`, `direction` |

### 30.4 Roadmap-phase entity names (lock these now even if built later, Section 22/28)
| Concept | Canonical Name |
|---|---|
| Knowledge base source doc | `KnowledgeDocument` |
| Retrieved chunk | `KnowledgeChunk` |
| Orchestrator's tool definition | `AgentTool` |
| A farmer's natural-language ask | `AgentQuery` |
| Generated PDF/HTML/JSON output | `FarmReport` |
| Weather/crop risk output | `RiskAssessment` |
| A what-if run | `ScenarioSimulation` |
| A triggered warning | `WeatherAlert` |
| Crop price data | `MarketPrice` |
| N-P-K/pH/moisture data | `SoilProfile` |
| Stored farmer identity + history | `FarmerProfile` |
| Post-season actual result | `FeedbackOutcome` |

### 30.5 Service / module naming (backend)
| Responsibility | Canonical File/Class Name |
|---|---|
| Weather vendor wrapper | `weather_service.py` → `WeatherService` |
| Crop/district master data access | `crop_service.py` → `CropService` |
| Model loading + inference | `prediction_service.py` → `PredictionService` |
| Ranking + score normalization | `recommendation_service.py` → `RecommendationService` |
| Unit conversion | `utils/units.py` → `convert_acres_to_hectares()` |

### 30.6 API path naming
- Resource-plural nouns, `snake_case` only when a path segment has multiple words: `/districts`, `/historical`, not `/getDistricts` or `/district-list`
- Path params always `{entity}_id`: `/districts/{district_id}`, never `/districts/{id}`
- Action-style endpoints (not pure REST resources) use a verb suffix, not a verb prefix: `/scenario/simulate`, `/reports/generate`, not `/simulateScenario` or `/generate_reports`

### 30.7 Environment variable naming (for Member 6 / deployment)
`UPPER_SNAKE_CASE`, prefixed by concern: `WEATHER_API_KEY`, `WEATHER_API_BASE_URL`, `DB_CONNECTION_STRING`, `MODEL_ARTIFACT_PATH`, `FRONTEND_API_BASE_URL`.

---

**Action for the team:** every member should skim Section 30 once before writing their first line of code for their module, and Member 6 should treat any pull request using a non-canonical name as a blocking review comment, not a nitpick — this is what keeps six people's work mergeable.
