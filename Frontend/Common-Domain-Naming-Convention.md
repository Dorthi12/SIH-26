# 🏷️ Common Domain Name List — Canonical Naming Convention
## Shared Vocabulary for Every Team Member (ML, Backend, Frontend, RAG, Integration)

**Purpose:** One list, one set of names. Every member — regardless of which document (`Agriculture-MVP-Project-Schema.md`, `Backend-Workflow.md`, `RAG-Workflow.md`) or which module they're working from — uses the exact names in this file. No synonyms, no personal shorthand, no per-module renaming. This is what keeps six people's independently-built pieces mergeable without an integration nightmare.

**Rule of thumb:** if you're about to name something and it already appears in this document, use the name exactly as written here — including casing.

---

## 1. Casing Rules by Layer

| Layer | Casing | Example |
|---|---|---|
| Database columns | `snake_case` | `land_area_acres` |
| Python (FastAPI, ML, RAG) | `snake_case` | `land_area_acres` |
| JSON (API request/response) | `snake_case` | `"land_area_acres": 2` |
| TypeScript type names | `PascalCase` | `interface CropRecommendation` |
| TypeScript field names | `snake_case` (mirrors JSON exactly — never `camelCase` the API payload) | `suitability_score: number` |
| React component files | `PascalCase.tsx` | `WeatherPanel.tsx` |
| Python service/class files | `snake_case.py` → `PascalCase` class | `weather_service.py` → `WeatherService` |
| Enum values (as strings) | `PascalCase` | `"Kharif"`, `"High"`, `"Improving"` |
| API paths | lowercase, plural nouns, hyphens only if unavoidable | `/districts`, `/predictions/{prediction_id}` |
| Environment variables | `UPPER_SNAKE_CASE` | `WEATHER_API_KEY` |

---

## 2. Core Domain Entities (MVP)

| Concept | Canonical Name | Do NOT use |
|---|---|---|
| A geographic district | `District` / `district` | Location, Area, Region |
| Growing season | `Season` / `season` | Term, Cycle, Period |
| A crop type | `Crop` / `crop` | CropType, Item |
| One year's crop+yield record | `HistoricalCropRecord` | CropData, YieldRecord, HistData |
| One day's weather record | `HistoricalWeatherRecord` | WeatherData, DailyWeather |
| A live/forecast weather pull | `WeatherSnapshot` | WeatherResponse, WeatherPayload |
| The farmer's submitted form | `FarmerInput` | UserInput, RequestData |
| Assembled model input | `ModelFeatureVector` | Features, X, InputVector |
| One model output for one crop | `Prediction` | Result, Output, ModelResult |
| The ranked list returned to the farmer | `Recommendation` | Response, ResultSet |
| A trained model artifact | `ModelVersion` | Model, MLModel |

---

## 3. Core Field Names (MVP)

| Field | Canonical Name | Notes |
|---|---|---|
| Primary key suffix | `_id` | `district_id`, `crop_id`, `prediction_id` — never `Id`, `_ID`, or bare `id` outside the entity's own table |
| Foreign key | same name as the referenced entity's PK | `district_id` inside `HistoricalCropRecord`, never `districtRef`/`district_fk` |
| Timestamps | `created_at`, `fetched_at`, `triggered_at`, `recorded_at`, `submitted_at` | always `_at` suffix, always UTC |
| Temperature | `temperature_avg`, `temperature_min`, `temperature_max` | never `temp`, `avgTemp`, `tempC` |
| Rainfall | `rainfall` (historical/current), `rainfall_total` (forecast window), `rainfall_deviation` (feature) | never `precip`, `precipitation`, `rain` |
| Humidity | `humidity` | never `hum`, `rh` |
| Wind | `wind_speed` | never `wind`, `windSpd` |
| Data source flag | `source` — values `"live"` \| `"cached"` | never a bare boolean `is_live` |
| Suitability score | `suitability_score` | never `score`, `confidence`, `probability`, `rank_score` |
| Predicted yield | `predicted_yield_t_per_ha` | never `yield`, `expected_yield`, `yieldPred` |
| Estimated production | `estimated_production_t` | never `production`, `output_t` |
| Farmer's land size input | `land_area_acres` | never `area`, `land`, `farmSize` |
| Converted land size | `land_area_hectares` | never `area_ha`, `landHa` |
| Stability label | `historical_stability` — values `High`/`Medium`/`Low` | never `consistency`, `stability_score` |
| Weather-match label | `weather_compatibility` — values `High`/`Medium`/`Low` | never `weather_match`, `weatherFit` |
| Trend label | `yield_trend` — values `Improving`/`Stable`/`Declining` | never `trend`, `direction` |
| Lagged historical yield feature | `lagged_historical_yield` | never `historical_yield` alone (ambiguous — implies no lag, risks leakage confusion) |
| Rolling historical yield feature | `rolling_historical_yield` | never `avg_yield`, `rollingYield` |

---

## 4. Backend Service / Module Names

| Responsibility | Canonical Name |
|---|---|
| Weather vendor wrapper | `weather_service.py` → `WeatherService` |
| District → coordinates resolution | `location_service.py` → `LocationService` |
| Crop/district master data access | `crop_service.py` → `CropService` |
| Lagged historical record access | `historical_service.py` → `HistoricalService` |
| Builds the leakage-safe feature vector | `feature_service.py` → `FeatureService` |
| Loads model, runs inference | `prediction_service.py` → `PredictionService` |
| Normalizes scores, ranks, labels | `recommendation_service.py` → `RecommendationService` |
| Unit conversion | `utils/units.py` → `convert_acres_to_hectares()` |
| Weather cache fallback | `utils/caching.py` | |

---

## 5. Roadmap Entity Names (P1–P4 — lock now, build later)

Keep these names fixed even though these features aren't built yet, so nobody invents a conflicting name when Phase 2 starts.

| Concept | Canonical Name | Phase |
|---|---|---|
| Knowledge base source document | `KnowledgeDocument` | P1 (RAG) |
| Retrieved text chunk | `KnowledgeChunk` | P1 (RAG) |
| Orchestrator's tool definition | `AgentTool` | P1 |
| A farmer's natural-language ask | `AgentQuery` | P1 |
| Generated PDF/HTML/JSON output | `FarmReport` | P1 |
| Weather/crop risk output | `RiskAssessment` | P1 |
| A what-if run | `ScenarioSimulation` | P2 |
| A triggered warning | `WeatherAlert` | P2 |
| Crop price data | `MarketPrice` | P3 |
| N-P-K/pH/moisture data | `SoilProfile` | P3 |
| Stored farmer identity + history | `FarmerProfile` | P3 |
| Post-season actual result | `FeedbackOutcome` | P3 |

---

## 6. RAG-Specific Names (P1)

Carried over from `RAG-Workflow.md` — keep identical when this module is built.

| Concept | Canonical Name | Notes |
|---|---|---|
| Retrieval component | `KnowledgeRetriever` | never `Searcher`, `VectorSearch` |
| LLM provider wrapper | `LLMClient` | swappable, same pattern as `WeatherService` |
| Combines prediction + retrieval + LLM | `ExplanationService` | distinct from the deterministic rule-based explanation engine in the MVP — don't merge names |
| Retrieved chunk's originating source | `source_name` field on every chunk | never `origin`, `doc_source` |
| Query embedding step | `query_embedding` (variable name) | |
| Number of chunks retrieved | `top_k` (parameter name) | never `n`, `limit` (limit is reserved for pagination, Section 8) |
| Grounded, cited answer | `answer_text` + `sources` fields | never `response`, `output` |

---

## 7. API Path Naming

- Resource-plural nouns: `/districts`, `/crops`, `/predictions` — never `/getDistricts`, `/district-list`
- Path params always `{entity}_id`: `/districts/{district_id}` — never `/districts/{id}`
- Action-style (non-pure-REST) endpoints use a verb **suffix**, not prefix: `/scenario/simulate`, `/reports/generate` — never `/simulateScenario`, `/generate_reports`
- Nested resource actions read left to right as the sentence they represent: `/predictions/{prediction_id}/explain-grounded` — never `/explain-grounded-prediction`

---

## 8. Cross-Cutting Naming Rules

- **Pagination params** (once needed): `limit`, `offset` — reserved names, don't reuse `limit` for anything else (see Section 6, `top_k` note)
- **Enum-style label fields** are always a labeled string (`"High"`/`"Medium"`/`"Low"`, `"Improving"`/`"Stable"`/`"Declining"`), never a raw numeric score standing in for a category — this preserves the terminology rule that `suitability_score` is the only numeric "score" in the system
- **Never call anything "confidence" or "probability"** unless it's explicitly the P4 calibrated-uncertainty endpoint (`/predictions/{id}/uncertainty`) — everywhere else, it's `suitability_score`
- **File names for ML/RAG artifacts**: `model.pkl`, `preprocessing.pkl`, `model_metadata.json` for the core model; `knowledge_manifest.csv` for the RAG knowledge base index — don't rename these per-branch or per-member

---

## 9. Environment Variable Naming

`UPPER_SNAKE_CASE`, prefixed by concern:

```
WEATHER_API_KEY
WEATHER_API_BASE_URL
DB_CONNECTION_STRING
MODEL_ARTIFACT_PATH
FRONTEND_API_BASE_URL
LLM_API_KEY            (P1, RAG)
VECTOR_DB_PATH         (P1, RAG)
```

---

## 10. Quick Reference — One-Line Cheat Sheet

```
District, Season, Crop                       → core reference entities
HistoricalCropRecord, HistoricalWeatherRecord → training data
WeatherSnapshot { current, forecast, source } → live/cached weather
FarmerInput { district_id, season, land_area_acres } → the request
ModelFeatureVector                            → internal model input, never exposed via API
Prediction { crop, predicted_yield_t_per_ha, suitability_score,
             historical_stability, weather_compatibility, yield_trend,
             estimated_production_t }          → one crop's evaluated output
Recommendation                                → ranked list of Predictions, the API response
KnowledgeChunk, KnowledgeRetriever, LLMClient,
ExplanationService                            → RAG layer (P1, don't touch MVP ranking)
```

---

**Enforcement:** every member skims this file once before writing their first line of code for their module. Any pull request introducing a name not on this list — or renaming something already here — is a blocking review comment, not a nitpick. If a genuinely new concept needs a name that isn't covered, add it here first, in a shared PR everyone can see, before using it in code.
