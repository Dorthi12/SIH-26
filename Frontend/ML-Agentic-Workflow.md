# 🧠 ML Models & Agentic Workflow
## End-to-End Implementation Guide — Model Lifecycle + Agriculture Orchestrator

**Scope:** This document has two parts. **Part A** covers the ML model lifecycle in full depth (this is MVP scope — Sections 1–21 of `Agriculture-MVP-Project-Schema.md`). **Part B** covers the Agentic Orchestrator (P1 roadmap, Schema doc Section 22.3–22.4) — **not MVP scope**, build only after the core pipeline and, ideally, RAG (`RAG-Workflow.md`) are working.

**Audience:** Member 1 (ML) for Part A; whoever picks up P1 agent work for Part B — likely Member 1 or Member 4, working closely with the RAG owner.

**Naming:** every entity/field name here matches `Common-Domain-Naming-Convention.md` exactly — check there before introducing anything new.

---

# PART A — ML Model Lifecycle (MVP)

## A1. Scope, Restated

The model's job is exactly one thing:

```
Given: district, season, crop, current/forecast weather, lagged historical performance
Predict: expected yield (t/ha) for that crop under those conditions
```

Everything else (ranking, suitability score, explanations) is downstream logic in `RecommendationService` (`Backend-Workflow.md` Section 5.5) — **the model itself only predicts yield, nothing more.** Keeping the model's job this narrow is what makes it interpretable, testable, and defensible to judges.

---

## A2. Model Lifecycle — High Level

```
OFFLINE (this document)
Raw historical data
      ↓
Data cleaning & standardization
      ↓
Leakage-safe feature engineering
      ↓
Train/evaluate multiple candidate models
      ↓
Select best model (metrics + stability, not just top score)
      ↓
Export: model.pkl + preprocessing.pkl + model_metadata.json
      ↓
Handoff to backend (Backend-Workflow.md Section 7)

ONLINE (Backend-Workflow.md owns this)
FastAPI loads model.pkl at startup → PredictionService.predict_yield()
```

This document covers everything above the handoff line. `Backend-Workflow.md` Section 7 covers the handoff contract itself (`model_metadata.json`, `feature_order`) — read that section too before finalizing training.

---

## A3. Notebook Pipeline (Canonical Sequence)

```
notebooks/
├── 01_data_collection.ipynb
├── 02_data_cleaning.ipynb
├── 03_feature_engineering.ipynb
├── 04_model_training.ipynb
├── 05_model_evaluation.ipynb
└── 06_export_artifacts.ipynb        # writes model.pkl, preprocessing.pkl, model_metadata.json
```

Each notebook's output is the next notebook's input — don't let steps become entangled in one giant notebook. This also lets different notebooks be reproduced independently during a demo-day sanity check.

---

## A4. Step 1 — Data Collection (`01_data_collection.ipynb`)

```
1. Load HistoricalCropRecord source(s) — locked per Schema doc Section 27
2. Load HistoricalWeatherRecord source(s) — daily granularity (Schema doc Section 19)
3. Load district_locations.csv for coordinate resolution
4. Record exact source, coverage years, and license for EVERY dataset used
   → this becomes part of model_metadata.json AND the "source/licensing
     documentation" checklist item (Schema doc Section 24)
5. Save raw copies untouched in data/raw/ — never edit raw files in place
```

**Reminder (Schema doc Section 2):** none of the example values in the schema docs are real data. This notebook is where real, verified data enters the pipeline for the first time.

---

## A5. Step 2 — Data Cleaning (`02_data_cleaning.ipynb`)

```
1. Standardize district names (casing, whitespace) → match district_locations.csv exactly
2. Standardize crop names → match the crops master list exactly
   ("Rice" / "rice" / "Paddy" must collapse to ONE canonical crop_name)
3. Check units — area (hectares vs acres), production (tonnes vs quintals) —
   convert everything to ONE consistent unit set and document it in code comments
4. Flag and handle:
   - missing values (impute, drop, or flag — document the choice per column)
   - duplicate records
   - impossible values (negative rainfall, yield = 0 with production > 0, etc.)
   - outliers (investigate before dropping — a real extreme weather year is
     signal, not noise; don't silently remove it)
5. Save cleaned output to data/processed/
```

**Definition of done:** a data-quality report (even a simple printed summary) showing row counts before/after cleaning, and counts of each issue type found — keep this, it's useful evidence for judges that data quality was taken seriously.

---

## A6. Step 3 — Feature Engineering (`03_feature_engineering.ipynb`) — The Most Important Notebook

This is where the target-leakage fix (Schema doc Section 14) is actually implemented in code, not just described.

### A6.1 Weather alignment (Schema doc Section 12)
```
For each HistoricalCropRecord (district, crop, season, year):
    1. Determine the crop's growing-window dates for that season
       (e.g. Kharif = June–October — confirm exact per-crop windows,
       don't assume every Kharif crop shares identical dates)
    2. Filter HistoricalWeatherRecord (daily) to that district + date window
    3. Aggregate:
       - rainfall_total (sum)
       - temperature_avg / min / max (mean of daily avg / min of daily min / max of daily max)
       - humidity_avg (mean)
       - dry_spell_days (count of consecutive no-rain days, longest streak)
       - heavy_rainfall_days (count of days above a defined threshold)
```

### A6.2 Lagged historical features — THE LEAKAGE GUARD
```python
def build_lagged_features(district_id, crop_id, season, target_year, historical_records):
    """
    CRITICAL: only use records where year < target_year.
    This function is the single most important leakage guard in the whole
    system — write a dedicated unit test asserting that target_year's own
    record is NEVER included in the output of this function.
    """
    prior_records = [
        r for r in historical_records
        if r.district_id == district_id
        and r.crop_id == crop_id
        and r.season == season
        and r.year < target_year          # <-- the leakage guard, explicit
    ]
    lagged_historical_yield = mean(r.yield for r in prior_records)
    rolling_historical_yield = mean(r.yield for r in prior_records[-3:])  # trailing 3 years
    yield_trend = linear_slope([r.yield for r in sorted(prior_records, key=lambda r: r.year)])
    return lagged_historical_yield, rolling_historical_yield, yield_trend
```

**Test this explicitly** (mirrors `Backend-Workflow.md` Section 9 checklist item):
```python
def test_no_leakage():
    records = [make_record(year=y, yield_val=y) for y in range(2021, 2026)]
    lagged, rolling, trend = build_lagged_features(..., target_year=2025, historical_records=records)
    # assert the 2025 record's own yield value never appears in the computation
    assert 2025 not in [r.year for r in filtered_prior_records]
```

### A6.3 Final feature set (must match `Backend-Workflow.md` Section 7's `feature_order`)
```
district_id, crop_id, season                          (categorical/identifier)
temperature_avg, temperature_min, temperature_max      (from weather alignment, A6.1)
rainfall_total, humidity_avg                            (from weather alignment, A6.1)
dry_spell_days, heavy_rainfall_days                     (from weather alignment, A6.1)
lagged_historical_yield, rolling_historical_yield       (from A6.2 — leakage-safe)
yield_trend                                             (from A6.2 — leakage-safe)
rainfall_deviation, temperature_deviation               (vs multi-year district average)
```

**Definition of done:** a saved `feature_engineering_columns.json` listing this exact order — this file becomes the source for `model_metadata.json`'s `feature_order` field (`Backend-Workflow.md` Section 7).

---

## A7. Step 4 — Model Training (`04_model_training.ipynb`)

### A7.1 Train/test split — time-aware, not random (Schema doc Section 14)
```
Train: all records with year in [earliest_available, 2024]
Test:  all records with year == 2025 (or whatever the latest complete year is)
```
**Never use `train_test_split()` with random shuffling on this data** — it would let the model "see" a later year's conditions during training for a different district/crop, which isn't how it will actually be used, and inflates apparent performance.

### A7.2 Candidate models to train and compare
```
1. Linear Regression        — baseline, fast, fully interpretable coefficients
2. Random Forest             — handles nonlinearity, robust to small data, feature importance built-in
3. XGBoost / LightGBM        — often best raw performance, but more prone to overfitting on
                                small datasets (Schema doc Section 11 — realistic dataset is
                                small, ~1,500 observations or fewer) — use conservative
                                hyperparameters (shallow max_depth, higher min_child_weight)
```

### A7.3 Training workflow per candidate
```
For each candidate algorithm:
    1. Fit on Train split
    2. Predict on Test split
    3. Compute MAE, RMSE, R² on Test split
    4. Run 5-fold cross-validation WITHIN the Train split only (never touching Test)
       to check stability — a model that varies wildly across folds is a red flag
       even if its single Test-split score looks good
    5. Log results to a comparison table
```

### A7.4 Model comparison table (keep this, show it to judges)
```
| Model              | Test MAE | Test RMSE | Test R² | CV Std Dev (stability) |
|---------------------|----------|-----------|---------|--------------------------|
| Linear Regression    | ...      | ...       | ...     | ...                      |
| Random Forest         | ...      | ...       | ...     | ...                      |
| XGBoost              | ...      | ...       | ...     | ...                      |
```
**Select the model with the best combination of low error AND low CV variance** — not simply the lowest single Test MAE. Document the reasoning for the final pick in a markdown cell, e.g.: *"XGBoost had marginally lower MAE than Random Forest but 2x the cross-validation variance, indicating higher overfitting risk on our ~1,200-observation dataset — Random Forest selected for stability."*

---

## A8. Step 5 — Model Evaluation (`05_model_evaluation.ipynb`)

### A8.1 Beyond aggregate metrics — check per-crop and per-district performance
```
For the selected model, break down Test-split error BY crop and BY district:
    - Does the model perform much worse for a specific crop? (may indicate
      insufficient training examples for that crop)
    - Does it perform much worse for a specific district? (may indicate a
      weather-alignment issue specific to that district, A6.1)
```
This level of detail is what separates "we got an R² of 0.78" from actually understanding the model's failure modes — valuable both for demo-day Q&A and for genuinely improving the system.

### A8.2 Sanity checks (do these manually, they catch real bugs)
```
1. Feature importance / coefficients — do they make agricultural sense?
   (e.g. rainfall should generally matter for a water-intensive crop —
   if the model assigns it near-zero importance, investigate the
   weather-alignment step, A6.1, before trusting the model)
2. Prediction range check — are predicted yields within a plausible
   real-world range for each crop? (catches unit-conversion bugs early,
   before they propagate to the backend)
3. Leakage re-check — re-run the A6.2 leakage test on the FINAL feature
   set actually used for training, not just the isolated function
```

---

## A9. Step 6 — Export Artifacts (`06_export_artifacts.ipynb`)

```
1. Save the fitted model:            models/crop_model.pkl        (joblib.dump)
2. Save the preprocessing pipeline:   models/preprocessing.pkl     (scalers/encoders, if any)
3. Write metadata:                    models/model_metadata.json
```

```json
{
  "version": "0.1.0",
  "algorithm": "RandomForest",
  "trained_on_years": "2021-2024",
  "tested_on_year": "2025",
  "feature_order": [
    "temperature_avg", "temperature_min", "temperature_max",
    "rainfall_total", "humidity_avg", "dry_spell_days", "heavy_rainfall_days",
    "lagged_historical_yield", "rolling_historical_yield", "yield_trend",
    "rainfall_deviation", "temperature_deviation"
  ],
  "metrics": { "mae": 0.31, "rmse": 0.42, "r2": 0.78 },
  "cv_std_dev": 0.05,
  "data_sources": ["<documented per A4>"],
  "trained_at": "2026-08-XX"
}
```

**This file is the contract with the backend team** (`Backend-Workflow.md` Section 7) — `FeatureService` validates its output against `feature_order` at startup. Any change to the feature set requires updating this file and notifying Member 4.

---

## A10. `ModelVersion` Registry (Schema doc entity 28.21)

Even in MVP, track model versions lightly — this pays off the moment you retrain once:

```
models/
├── crop_model_v0.1.0.pkl
├── crop_model_v0.2.0.pkl          (after a retrain with more/better data)
├── model_metadata_v0.1.0.json
├── model_metadata_v0.2.0.json
└── active_model.txt                # just contains "v0.2.0" — which one FastAPI loads
```

Never overwrite a previous version's files — always version the filename. This is cheap insurance against "the model got worse after retraining and we can't get back the old one."

---

## A11. Retraining Workflow (When New Data Arrives)

```
New historical data becomes available
        ↓
Re-run 02_data_cleaning.ipynb → 05_model_evaluation.ipynb on the EXPANDED dataset
        ↓
Compare new model's Test metrics against the CURRENTLY ACTIVE model's metrics
        ↓
   Better or equal?              Worse?
        ↓                            ↓
   Export as new version        Keep current active model,
   Update active_model.txt      investigate why (data issue?
        ↓                        different Test year? bug?)
   Restart backend to load
   new model at startup
```

**Never auto-deploy a retrained model without this comparison step** — a retrain is not automatically an improvement.

---

## A12. Path to Multi-Model Decision Engine (Schema doc Section 22.21 — long-term, not MVP)

The MVP trains one model (crop suitability / yield). The long-term architecture generalizes:

```
                 Decision Engine
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
Crop Model       Weather Risk Model   Yield Model
       ↓               ↓                ↓
       └───────────────┼────────────────┘
                       ↓
                 Market Model
                       ↓
                 Final Decision
```

**Design implication for MVP:** even though only one model exists today, keep `PredictionService` structured so it calls a named model (`crop_suitability_model`) rather than assuming it's the only model that will ever exist — this is a small amount of extra structure now that avoids a rewrite later when a Risk Model (P1, Schema doc Section 22.6) or Market Model (P3, Section 22.11) needs to be added to the same serving layer.

---

# PART B — Agentic Workflow (P1 Roadmap — NOT MVP)

## B1. What This Adds, Restated

The MVP is a single request/response pipeline: farmer submits a form, gets a ranked list back. The agentic layer adds a **conversational, tool-using orchestrator** on top — the farmer can ask a free-form question, and the system figures out what data/tools it needs and assembles an answer.

```
MVP:    Farmer fills a form → /predict → ranked list
Agent:  Farmer asks a question → Orchestrator → invokes tools as needed → composed answer
```

**Critical rule, same as Part A / RAG:** the agent layer sits *on top of* the MVP pipeline and RAG layer — it does not replace or re-implement prediction, ranking, or retrieval logic. Every tool the agent calls is a thin wrapper around a service that already exists (`PredictionService`, `RecommendationService`, `KnowledgeRetriever`). The agent's job is orchestration and language, not computation.

---

## B2. Agent Architecture

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

This mirrors Schema doc Section 22.3 exactly. Each "Agent" box here is not necessarily a separate LLM call — for a hackathon-scale build, think of these as **named tool groups** the orchestrator can invoke, not independent autonomous entities each with their own reasoning loop. Keep it simple: one orchestrating LLM call that decides which tools to invoke, tools execute deterministically, results get composed into a final answer (possibly by a second LLM call for natural language).

---

## B3. Folder Structure

```
agent/
│
├── orchestrator.py                 # AgentOrchestrator — main entry point
├── intent.py                       # intent detection (what does the farmer actually need?)
│
├── tools/
│   ├── __init__.py
│   ├── weather_tool.py             # wraps WeatherService (Backend-Workflow.md)
│   ├── crop_tool.py                # wraps PredictionService + RecommendationService
│   ├── knowledge_tool.py           # wraps KnowledgeRetriever (RAG-Workflow.md)
│   ├── report_tool.py              # wraps FarmReport generation (P1, Schema doc 22.5)
│   └── risk_tool.py                # wraps RiskAssessment (P1, Schema doc 22.6, once built)
│
├── memory/
│   └── agent_memory.py             # optional — farm profile, previous queries (P3, Schema doc 22.17)
│
├── schemas/
│   ├── agent_query.py              # AgentQuery request/response shapes
│   └── tool_schemas.py             # each tool's input/output Pydantic schema
│
└── tests/
    ├── test_intent_detection.py
    ├── test_tool_calls.py
    └── test_orchestrator_integration.py
```

---

## B4. Step-by-Step Build Order

```
STEP 1   Define each tool's exact input/output schema (Section B5)
              ↓
STEP 2   Implement each tool as a thin wrapper around an EXISTING service —
         no new business logic here, just adaptation
              ↓
STEP 3   Build intent detection (Section B6) — test standalone, no orchestrator yet
              ↓
STEP 4   Build the orchestrator's tool-selection logic (Section B7)
              ↓
STEP 5   Build the Decision Agent — composes tool results into one answer (Section B8)
              ↓
STEP 6   Wire into a single API endpoint (Section B9)
              ↓
STEP 7   Test with realistic multi-need queries (Section B10)
```

---

## B5. Tool Definitions

Each tool has a name, description (used by the orchestrator/LLM to decide when to call it), and a strict input/output schema — this is what makes tool selection reliable rather than guesswork.

```python
class AgentTool(BaseModel):
    name: str
    description: str          # written for the LLM to read — be specific about WHEN to use it
    input_schema: type[BaseModel]
    output_schema: type[BaseModel]
```

```python
# tools/weather_tool.py
class WeatherToolInput(BaseModel):
    district_id: int

class WeatherToolOutput(BaseModel):
    snapshot: WeatherSnapshot   # reuses the exact type from Backend-Workflow.md

def get_current_weather(input: WeatherToolInput) -> WeatherToolOutput:
    snapshot = weather_service.get_current_and_forecast(...)   # calls the EXISTING service
    return WeatherToolOutput(snapshot=snapshot)

WEATHER_TOOL = AgentTool(
    name="get_current_weather",
    description="Fetch current and forecast weather for a district. Use when the "
                "farmer's question involves current conditions, forecasts, or "
                "whether weather is favorable for a crop.",
    input_schema=WeatherToolInput,
    output_schema=WeatherToolOutput,
)
```

```python
# tools/crop_tool.py
class CropToolInput(BaseModel):
    district_id: int
    season: Literal["Kharif", "Rabi", "Zaid"]
    land_area_acres: float

CROP_TOOL = AgentTool(
    name="predict_crop_yield",
    description="Get ranked crop recommendations with predicted yield and "
                "suitability scores for a district and season. Use when the "
                "farmer asks what to plant, which crop is best, or wants "
                "yield estimates.",
    input_schema=CropToolInput,
    output_schema=RecommendationResponse,   # exact type from Schema doc Section 18
)
```

```python
# tools/knowledge_tool.py
class KnowledgeToolInput(BaseModel):
    query: str
    crop: str | None = None
    district: str | None = None

KNOWLEDGE_TOOL = AgentTool(
    name="search_agricultural_knowledge",
    description="Search agricultural guidelines and research for supporting "
                "evidence. Use when the farmer asks WHY a crop is recommended "
                "or wants agricultural best-practice information.",
    input_schema=KnowledgeToolInput,
    output_schema=list[KnowledgeChunk],      # from RAG-Workflow.md
)
```

**Definition of done for this step:** each tool function can be called directly in a test with a hardcoded input and returns a correct, schema-valid output — completely independent of any orchestrator or LLM.

---

## B6. Intent Detection

```
Farmer Query (raw text)
        ↓
   Intent Detection
        ↓
   Structured need list, e.g.:
   {
     "needs_weather": true,
     "needs_crop_prediction": true,
     "needs_knowledge": false,
     "extracted_slots": { "district": "Prayagraj", "land_area_acres": 3, "season": null }
   }
```

**Two viable approaches — pick one based on team's LLM access and time budget:**

1. **LLM-based intent detection** — one structured-output LLM call that extracts needs + slots from the raw query. More flexible, handles varied phrasing well.
2. **Rule-based intent detection** — keyword/pattern matching (e.g. "what should I plant" → needs_crop_prediction; "why" → needs_knowledge). Faster to build, fully deterministic, easier to debug live during a demo — **recommended default for a hackathon timeline** given the team is already using a deterministic explanation engine elsewhere (Schema doc Section 16) for the same reason.

**Definition of done:** run 10 realistic farmer queries through intent detection and manually verify the extracted needs/slots are correct — same evaluation discipline as RAG retrieval (`RAG-Workflow.md` Section 9.2).

---

## B7. Orchestrator Tool-Selection Workflow

```python
class AgentOrchestrator:
    def handle_query(self, farmer_query: str, farmer_id: str | None = None) -> AgentAnswer:
        intent = detect_intent(farmer_query)          # Section B6

        tool_results = {}
        if intent.needs_weather:
            tool_results["weather"] = WEATHER_TOOL.call(
                WeatherToolInput(district_id=intent.extracted_slots.district_id)
            )
        if intent.needs_crop_prediction:
            tool_results["prediction"] = CROP_TOOL.call(
                CropToolInput(**intent.extracted_slots.dict())
            )
        if intent.needs_knowledge:
            tool_results["knowledge"] = KNOWLEDGE_TOOL.call(
                KnowledgeToolInput(query=farmer_query, ...)
            )

        return decision_agent.compose_answer(farmer_query, tool_results)   # Section B8
```

**Missing slot handling:** if `intent.extracted_slots` is missing something required (e.g. no district mentioned and none on file for this farmer), the orchestrator should ask a clarifying question rather than guessing or calling a tool with invalid input — mirrors the MVP's own validation discipline (`Backend-Workflow.md` Section 5.7, Pydantic validation).

---

## B8. Decision Agent — Composing the Final Answer

```
Tool Results (weather snapshot, prediction/recommendation, knowledge chunks)
        ↓
   Assemble into one context block (same pattern as RAG-Workflow.md Section 11.1)
        ↓
   Single LLM call: "answer the farmer's question using only this context"
        ↓
   Final Answer { answer_text, sources?, tools_used[] }
```

**This step reuses `ExplanationService`'s prompt pattern from `RAG-Workflow.md` Section 11.1 directly** where knowledge is involved — don't build a second, different grounded-generation approach. If the query only needs weather or only needs crop prediction (no knowledge retrieval), the Decision Agent can compose a simpler templated answer without an LLM call at all — **prefer deterministic templating over an LLM call whenever the tool output alone answers the question**, since it's faster, cheaper, and more predictable for a live demo.

```python
class AgentAnswer(BaseModel):
    answer_text: str
    sources: list[str] = []
    tools_used: list[str]
```

`tools_used` should always be returned and shown in the UI — this is your transparency mechanism for both the farmer and the judges: *"here's exactly what the system checked to answer this."*

---

## B9. API Integration

New endpoint, additive to the main API spec (Schema doc Section 29.2):

| Method | Path | Purpose | Request | Response |
|---|---|---|---|---|
| POST | `/agent/query` | Natural-language entry point to the orchestrator | `{ farmer_query, farmer_id? }` | `{ answer_text, sources[], tools_used[] }` |

```python
# api/agent.py
@router.post("/agent/query")
async def agent_query(request: AgentQueryRequest):
    answer = orchestrator.handle_query(request.farmer_query, request.farmer_id)
    return answer
```

---

## B10. Testing the Agent

### B10.1 Tool-level tests (fastest, do these first)
Each tool tested in isolation with a hardcoded input, exactly as in Section B5's "definition of done." No orchestrator involved.

### B10.2 Intent-detection tests
10+ realistic queries, checked against expected extracted needs/slots (Section B6).

### B10.3 End-to-end orchestrator tests
```python
def test_multi_need_query():
    answer = orchestrator.handle_query(
        "I have 3 acres in Prayagraj, what should I plant this Kharif season and why?"
    )
    assert "weather" in answer.tools_used or "get_current_weather" in answer.tools_used
    assert "predict_crop_yield" in answer.tools_used
    assert answer.answer_text  # non-empty, coherent
```

### B10.4 Deliberate edge cases to test before demo day
```
- Query with a missing required slot (no district mentioned) → should ask for
  clarification, not guess or crash
- Query needing only ONE tool (e.g. "what's the weather in Lucknow?") →
  should not unnecessarily call the crop or knowledge tools
- Weather tool failure mid-orchestration → should degrade gracefully
  (same live/cached fallback as Backend-Workflow.md Section 5.3, surfaced
  honestly in the final answer if relevant)
- Off-topic query (not agriculture-related) → should decline gracefully
  rather than forcing an agricultural answer
```

---

## B11. Agentic-Specific Checklist

- [ ] Every tool is a thin wrapper around an already-existing, already-tested service — no duplicated business logic
- [ ] Each tool has an explicit Pydantic input/output schema
- [ ] Intent detection tested on ≥10 realistic queries with recorded accuracy
- [ ] Orchestrator asks for clarification on missing required slots rather than guessing
- [ ] Orchestrator skips unnecessary tool calls (doesn't call every tool for every query)
- [ ] Decision Agent prefers deterministic templating over an LLM call when tool output alone suffices
- [ ] `tools_used` is always populated and surfaced to the UI for transparency
- [ ] Weather-tool failure inside the orchestrator degrades gracefully, doesn't crash the whole query
- [ ] Off-topic / out-of-scope queries handled gracefully, not forced into an agricultural answer
- [ ] End-to-end test covering a query that legitimately needs 2+ tools together

---

## B12. Common Failure Modes to Watch For (Agentic-Specific)

| Symptom | Likely Cause | Fix |
|---|---|---|
| Agent calls tools that aren't needed | Intent detection too permissive, or LLM-based tool selection under-constrained | Tighten tool descriptions (Section B5) to be more specific about "use when," or move to rule-based intent detection (Section B6) |
| Agent hallucinates a district/crop not in the system | No validation before calling a tool | Validate extracted slots against `District`/`Crop` master data (same services the MVP already uses) before any tool call |
| Answer contradicts what `/predict` would return directly | Decision Agent's LLM call paraphrasing/altering numeric prediction data instead of relaying it exactly | Pass numeric fields (yield, score) into the final answer as-is from tool output; only use the LLM for the explanatory prose around them, never to "restate" numbers |
| Orchestrator is slow / demo-unfriendly | Multiple sequential LLM calls (intent detection + per-tool reasoning + final composition) | Prefer rule-based intent detection (Section B6) and deterministic templating (Section B8) wherever possible — reserve LLM calls for the parts that genuinely need natural language |
| Agent can't handle a query the MVP form already handles fine | Over-engineering — trying to route even the simple "give me the top crop" case through free-form intent detection | Keep the MVP's structured `/predict` endpoint as the primary path; the agent is an alternative entry point for free-form queries, not a mandatory layer in front of everything |
