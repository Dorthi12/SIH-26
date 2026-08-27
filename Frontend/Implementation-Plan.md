# 🗺️ Master Implementation Plan
## End-to-End Build & Integration Guide — Smart Agriculture Decision-Support System

**Purpose:** This is the execution plan that ties every other document together — what gets built, in what order, by whom, and exactly how the pieces connect. Read this first to understand the whole project; use the linked documents for implementation depth on each piece.

---

## 0. Document Map

| Document | Covers | Use it for |
|---|---|---|
| `Agriculture-MVP-Project-Schema.md` | Architecture, tech stack, data schema, API contract, domain model, full API spec, roadmap | The "what" and "why" — architecture decisions, frozen flow (Section 3), open decisions (Section 27) |
| `Backend-Workflow.md` | FastAPI service internals, step-by-step build order | The "how" for backend — Member 4's primary reference |
| `RAG-Workflow.md` | Knowledge engine (P1 roadmap) | The "how" for RAG — built after MVP is stable |
| `ML-Agentic-Workflow.md` | Model training lifecycle (MVP) + Orchestrator (P1 roadmap) | The "how" for Member 1's ML work, and later the agent layer |
| `Common-Domain-Naming-Convention.md` | Canonical names for every entity/field/service | Cross-cutting reference — check before naming anything |
| **This document** | End-to-end execution and integration plan | The "when" and "who," and how every piece plugs into every other piece |

---

## 1. Guiding Principles (Read This Before Planning Sprints)

1. **Data before code.** Nobody writes a line of model or feature-engineering code until the real dataset is sourced, cleaned, and verified (Schema doc Section 27, Item 3). Everything in the schema docs using example data is illustrative only (Schema doc Section 2).
2. **Each module works standalone before it's wired together.** Every workflow doc enforces this ("definition of done" before integration) — a service that only works inside a running FastAPI server, with no isolated test, is not actually verified.
3. **The MVP is frozen (Schema doc Section 3).** RAG and the agentic layer are P1 roadmap — build them only after the MVP is demo-ready end to end. Don't let roadmap work starve MVP work.
4. **Naming discipline is non-negotiable.** `Common-Domain-Naming-Convention.md` is checked before anything new is named — this is what makes six people's parallel work mergeable.
5. **Integration starts Day 1, not at the end.** Member 6 sets up the scaffolding (repo structure, contracts, CI, Docker) before anyone's individual module is finished, so integration is continuous, not a single terrifying merge at the end.

---

## 2. Master Timeline — Phases and Ownership

This expands the Phase 0–11 sequence from the Schema doc (Section 6) into a full execution plan with entry/exit criteria and explicit hand-off points.

```
PHASE 0   Problem Lock              (Whole team, Day 1)
PHASE 1   Data Source Audit          (Member 2 + Member 1)
PHASE 2   Data Quality + Cleaning    (Member 2)
PHASE 3   ML Formulation Lock        (Member 1, reviewed by whole team)
PHASE 4   Baseline Model             (Member 1)
PHASE 5   Weather Integration        (Member 3)
PHASE 6   Recommendation Engine      (Member 1 + Member 4)
PHASE 7   FastAPI Backend            (Member 4)
PHASE 8   React + TypeScript Frontend (Member 5)
PHASE 9   Integration                (Member 6 + everyone)
PHASE 10  Deployment                 (Member 6)
PHASE 11  Testing + Demo Rehearsal   (Whole team)

── MVP FREEZE / DEMO-READY CHECKPOINT ──

PHASE 12  RAG Knowledge Engine        (P1 — RAG-Workflow.md)
PHASE 13  Agentic Orchestrator        (P1 — ML-Agentic-Workflow.md Part B)
PHASE 14  Farm Reports + Risk Engine  (P1 — Schema doc Section 22.5–22.6)
```

**Hard rule:** Phases 12–14 do not start until Phase 11 (MVP freeze checkpoint) is genuinely reached — a working, demoable, end-to-end system. This is what Schema doc Section 22's framing ("none of this is required for the hackathon") means in practice.

---

## 3. Phase-by-Phase Execution Detail

### PHASE 0 — Problem Lock (Day 1, whole team, ~2–3 hours)

**Entry criteria:** none — this is the starting point.

```
1. Confirm exact SIH Problem Statement text (Schema doc Section 27, Item 1)
2. Confirm prediction horizon: pre-season vs short-term (Schema doc Section 13)
   — current lean is pre-season; verify against the PS wording
3. Agree on the exact crop/district/geography scope for the MVP demo
   (Schema doc Section 27, Item 2) — pick a SMALL scope (e.g. 5–10 districts,
   4–6 crops) rather than trying to cover a whole state
4. Assign the six roles (Schema doc Section 23) and confirm everyone has
   read this plan + the domain naming doc before writing code
```

**Exit criteria:** a one-paragraph written problem statement + locked scope, shared with the whole team (pin it in the team channel).

**Blocks:** everything else. Do not proceed to Phase 1 without this.

---

### PHASE 1 — Data Source Audit (Member 2 + Member 1, Day 1–2)

```
1. Identify candidate sources for historical crop data (govt open data portals,
   ICAR datasets, state agriculture department releases) matching the locked
   scope from Phase 0
2. Identify candidate weather API/data sources — must support BOTH current/forecast
   (live) AND historical daily data for the training years (Schema doc Section 27, Item 4)
3. For each candidate source, record: coverage years, geographic granularity,
   crop granularity, units used, license terms, API rate limits (if live API)
4. Pick ONE crop dataset source and ONE weather source — resist the urge to
   merge many partial sources for the MVP, that multiplies cleaning work
```

**Exit criteria:** one locked crop-data source, one locked weather source, both documented with coverage/license info — this becomes the first entries in `model_metadata.json`'s `data_sources` field (`ML-Agentic-Workflow.md` Section A9).

**Hands off to:** Phase 2 (Member 2 starts cleaning), Phase 3 (Member 1 starts formulation against confirmed data shape).

---

### PHASE 2 — Data Quality + Cleaning (Member 2, Day 2–4)

Follow `ML-Agentic-Workflow.md` Section A5 exactly: standardize names/units, handle missing/duplicate/impossible values, produce a data-quality report.

**Exit criteria:** cleaned `HistoricalCropRecord` and `HistoricalWeatherRecord` data sitting in `data/processed/`, matching the schema in the main Schema doc Section 19.

**Hands off to:** Phase 3 (feature engineering can now use real, clean data).

---

### PHASE 3 — ML Formulation Lock (Member 1, reviewed by whole team, Day 3–4)

```
1. Confirm the exact feature list (ML-Agentic-Workflow.md Section A6.3)
2. Confirm the crop growing-window dates per season/crop (Schema doc Section 12) —
   this needs input from whoever is most familiar with the actual agriculture
   domain, don't guess
3. Implement and TEST the leakage guard (ML-Agentic-Workflow.md Section A6.2)
   before writing any more feature engineering code
4. Get a 15-minute team review of the formulation before full training begins —
   cheap to catch a formulation mistake now, expensive after Phase 4 is done
```

**Exit criteria:** `feature_engineering_columns.json` finalized and reviewed; leakage-guard unit test passing.

**Hands off to:** Phase 4 (training can begin), and this is also the point Member 4 can start Phase 7 groundwork (folder skeleton, config) in parallel since the feature contract is now stable enough to build against.

---

### PHASE 4 — Baseline Model (Member 1, Day 4–6)

Follow `ML-Agentic-Workflow.md` Sections A7–A9 fully: train candidates, compare, select, evaluate, export artifacts.

**Exit criteria:** `models/crop_model.pkl`, `models/preprocessing.pkl`, `models/model_metadata.json` all present and versioned (`ML-Agentic-Workflow.md` Section A10).

**Hands off to:** Phase 6 (Member 4 needs these three files to build `PredictionService`) — this is the single most important cross-team handoff in the whole project. **Schedule a explicit 30-minute handoff sync between Member 1 and Member 4** to walk through `model_metadata.json`'s `feature_order` together.

---

### PHASE 5 — Weather Integration (Member 3, Day 3–6, parallel to Phases 3–4)

Follow `Backend-Workflow.md` Section 5.3 (`WeatherService`) exactly: current + forecast blocks, live/cached fallback, tested standalone.

**Exit criteria:** `WeatherService.get_current_and_forecast()` callable from a plain script, returns correct `WeatherSnapshot` shape, degrades gracefully when the vendor is unreachable.

**Runs in parallel with Phases 3–4** — weather integration doesn't depend on the model being ready, so this should not be sequenced after ML work; it's independent until Phase 7 wires everything together.

**Hands off to:** Phase 7 (backend imports `WeatherService` directly).

---

### PHASE 6 — Recommendation Engine (Member 1 + Member 4 jointly, Day 6–7)

Follow `Backend-Workflow.md` Section 5.4–5.5 (`FeatureService`, `PredictionService`, `RecommendationService`) and the Schema doc Section 15 normalization formula exactly.

**Exit criteria:** feeding a hardcoded district/season through the full chain (feature assembly → model inference → normalization → ranking) produces a correctly ordered list where the top crop scores exactly 100 — verified by a `pytest` test, no FastAPI server needed yet.

**This phase is explicitly joint** because it's where ML output meets backend logic — Member 1 validates the model's raw output is sane, Member 4 validates the scoring/ranking math is correct. Don't split this across two unsynced work streams.

---

### PHASE 7 — FastAPI Backend (Member 4, Day 6–9)

Follow `Backend-Workflow.md` Sections 5.6–5.11 fully — routes, validation, error handling, persistence, integration tests, Dockerfile.

**Depends on:** Phase 4 (model artifacts), Phase 5 (`WeatherService`), Phase 6 (`RecommendationService`) all being individually done — Phase 7 is mostly wiring, per the backend doc's explicit design intent (Section 4: "steps 1–5 can all be tested with plain scripts... Step 6 becomes almost mechanical").

**Exit criteria:** `POST /predict` works correctly via `/docs` (FastAPI's Swagger UI) for at least 3 different district/season combinations, all documented status codes reachable, `docker build && docker run` works locally.

**Hands off to:** Phase 8 (frontend needs a live, documented API to build against — share the `/docs` link with Member 5 the moment this phase's exit criteria are met, don't wait for full polish).

---

### PHASE 8 — React + TypeScript Frontend (Member 5, Day 7–10, starts once Phase 7's `/predict` is live)

```
1. Build FarmerInputForm.tsx against the ACTUAL Pydantic schema (not the
   illustrative examples in the schema docs) — pull the real request shape
   from FastAPI's /docs or from Member 4 directly
2. Build types/prediction.ts to exactly mirror the backend's Pydantic
   response models (Schema doc Section 20, Common-Domain-Naming-Convention.md
   Section 1) — this is Member 6's job to double-check, not just Member 5's
3. Build WeatherPanel.tsx with the live/cached badge (Backend-Workflow.md
   Section 5.3's source field)
4. Build RecommendationList.tsx and CropDetailPanel.tsx per the Schema doc
   Section 20 layout
5. Point the frontend at a LOCAL running backend first, not a deployed one —
   faster iteration, catches contract mismatches immediately
```

**Exit criteria:** a farmer can fill the form, submit, and see a ranked recommendation with correct suitability scores, estimated production, and an explanation panel — all against the real backend, not mocked data.

**Hands off to:** Phase 9.

---

### PHASE 9 — Integration (Member 6 leads, whole team, Day 9–11)

**This phase should be short if Phases 0–8 were done with standalone testing at each step** — integration failures are a symptom of skipped "definition of done" checks earlier, not something to budget heavy time for by default.

```
1. Run the full end-to-end integration test suite (Backend-Workflow.md
   Section 5.10) against the actual frontend, not just API calls
2. Verify the naming contract held (Common-Domain-Naming-Convention.md) —
   spot-check that no field got silently renamed between backend and frontend
3. Verify weather API failure handling actually works when triggered
   deliberately (disconnect network / use an invalid API key temporarily)
4. Verify the unit-conversion bug class is actually absent — manually check
   estimated_production_t against a hand-calculated value for at least 2 cases
5. Run through the full demo script (Schema doc Section 25) at least twice,
   end to end, exactly as it will be presented to judges
```

**Exit criteria:** the demo script runs cleanly, twice in a row, without manual intervention.

---

### PHASE 10 — Deployment (Member 6, Day 10–11, overlaps with Phase 9)

```
1. Dockerize backend (already built in Phase 7) + build the React frontend
   for production (npm run build)
2. Decide hosting: local machine for demo day (simplest, zero network
   dependency risk) vs a cloud deployment (more impressive but adds a
   failure point — weigh this against how reliable your venue's network is)
3. If cloud-deploying: set environment variables per
   Common-Domain-Naming-Convention.md Section 9, verify the weather vendor
   API key works in the deployed environment specifically (a common silent
   failure: works locally, fails in prod due to IP allowlisting or a
   different env var not being set)
4. Prepare a LOCAL fallback even if cloud-deploying — demo day network
   failure should not be able to kill the whole presentation
```

**Exit criteria:** the system runs reliably in whatever environment will actually be used for the demo, with a tested fallback plan.

---

### PHASE 11 — Testing + Demo Rehearsal (Whole team, Day 11–12)

```
1. Full run-through of the demo script (Schema doc Section 25) with the
   actual presenting team member driving, not the person who built the feature
   (catches "it only works if you know exactly which buttons to click")
2. Prepare answers for the anticipated judge questions already flagged
   throughout the docs:
   - "Why 87? How is suitability score calculated?" → Schema doc Section 15
   - "How do you prevent the model from cheating with future data?" →
     ML-Agentic-Workflow.md Section A6.2 (leakage guard)
   - "What happens if the weather API is down right now?" → demonstrate the
     cached fallback live, don't just claim it exists
   - "Why not deep learning?" → Schema doc Section 14, dataset size honesty
   - "Is this real data?" → confirm sources per Phase 1, cite them plainly
3. Time the demo — trim to fit whatever slot SIH gives you
4. Assign who says what — the whole team should be able to defend any part
   (Schema doc Section 23's "everyone must understand the full architecture")
```

**Exit criteria:** ✅ **MVP FREEZE CHECKPOINT REACHED.** The system is demo-ready, the team can defend it, and the group can now decide whether to invest remaining time in Phase 12+ (roadmap features) or in hardening/polishing the MVP further.

---

### PHASE 12 — RAG Knowledge Engine (P1, only after Phase 11, `RAG-Workflow.md`)

Follow `RAG-Workflow.md` Sections 4–14 in order. Key integration point: `ExplanationService` calls into the **already-existing, already-frozen** `Prediction` object — it must not require any change to `RecommendationService`'s ranking logic. Verify this explicitly: run the MVP's existing test suite (`Backend-Workflow.md` Section 5.10) after RAG is added and confirm nothing regressed.

**Exit criteria:** `/knowledge/search` and `/predictions/{id}/explain-grounded` work, with the RAG evaluation checklist (`RAG-Workflow.md` Section 14) passed.

---

### PHASE 13 — Agentic Orchestrator (P1, only after Phase 12, `ML-Agentic-Workflow.md` Part B)

Depends on Phase 12 for the `KNOWLEDGE_TOOL` wrapper. Follow `ML-Agentic-Workflow.md` Sections B3–B10 in order.

**Exit criteria:** `POST /agent/query` handles a multi-need query correctly (Section B10.3's test), and all deliberate edge cases (Section B10.4) are verified.

---

### PHASE 14 — Farm Reports + Risk Engine (P1, parallel to Phase 13 if team capacity allows)

Follow Schema doc Sections 22.5–22.6 for the spec; implement `report_tool.py` and `risk_tool.py` (`ML-Agentic-Workflow.md` Section B3's folder structure) as new tools the orchestrator can call once Phase 13 exists, or as standalone endpoints if Phase 13 isn't reached.

---

## 4. Integration Map — How Every Piece Actually Connects

```
┌─────────────────────────────────────────────────────────────────┐
│                     React + TypeScript UI                        │
│   types/prediction.ts  ◄── MUST mirror ──►  backend Pydantic     │
└───────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / JSON (Schema doc Section 18)
┌───────────────────────────▼────────────────────────────────────┐
│                          FastAPI (api/)                          │
│   routes call services/, never business logic directly           │
└──┬─────────────┬──────────────┬───────────────┬─────────────────┘
   │              │              │               │
   ▼              ▼              ▼               ▼
WeatherService  FeatureService  PredictionService  RecommendationService
(Phase 5)       (Phase 3/6)      (Phase 4/6)         (Phase 6)
   │              │              │               │
   ▼              ▼              ▼               ▼
Weather Vendor  HistoricalService  model.pkl      Suitability Score
API             (lagged, leakage-  (Phase 4's       normalization
                 safe, Phase 2/3)   export)          (Schema Section 15)

── P1 additions plug into the SAME backend, not a separate system ──

              ┌─────────────────────────────┐
              │   AgentOrchestrator          │
              │   (ML-Agentic-Workflow.md B) │
              └──┬──────────┬──────────┬─────┘
                 ▼          ▼          ▼
          WeatherTool   CropTool   KnowledgeTool
          (wraps        (wraps     (wraps
           WeatherService) PredictionService  KnowledgeRetriever
                            + RecommendationService) RAG-Workflow.md)
```

**The one rule that keeps this whole map coherent:** every new capability (RAG, agent, risk, reports) is built as a *new tool/service that calls existing services*, never a parallel reimplementation. If a P1 feature seems to require duplicating logic that already exists in `PredictionService` or `RecommendationService`, that's a signal to refactor the existing service to be reusable, not to fork it.

---

## 5. Git & Collaboration Workflow (Member 6 sets this up Day 1)

```
main                    — always deployable, protected, merge via PR only
├── feature/ml-training       (Member 1)
├── feature/data-pipeline     (Member 2)
├── feature/weather-service   (Member 3)
├── feature/backend-api       (Member 4)
├── feature/frontend-ui       (Member 5)
└── feature/integration       (Member 6 — CI, Docker, contract tests)
```

**Rules:**
- Every PR into `main` requires: passing tests (module-level, per the "definition of done" in each workflow doc) + no naming-convention violations (`Common-Domain-Naming-Convention.md`)
- Contract-changing PRs (any change to a Pydantic schema, API path, or field name) require a paired note to whoever owns the consuming side (backend↔frontend, ML↔backend) — don't let a schema change land silently
- Daily 10-minute sync (even async, in the team channel) covering: what phase you're in, what you're blocked on, any contract changes made

---

## 6. Risk Register — What's Most Likely to Go Wrong, and the Mitigation Already Built In

| Risk | Where it's mitigated |
|---|---|
| Target leakage silently inflating model performance | `ML-Agentic-Workflow.md` Section A6.2 — explicit unit test |
| Backend/frontend field-name drift | `Common-Domain-Naming-Convention.md` + PR review discipline (Section 5 above) |
| Weather API failure during live demo | `Backend-Workflow.md` Section 5.3 cached fallback — **rehearse this failure deliberately in Phase 9/11, don't just trust it exists** |
| Unit conversion bug (acres treated as hectares) | `Backend-Workflow.md` Section 5.4/8a, tested independently |
| Dataset too small / not locked in time | Phase 1 deadline discipline — don't let data sourcing slip past Day 2 |
| ML/Backend feature-order mismatch | `model_metadata.json` contract (`ML-Agentic-Workflow.md` Section A9) + explicit handoff sync (Phase 4 exit) |
| Team can't defend the full system to judges | Schema doc Section 23 ("everyone must understand the architecture") + Phase 11's rehearsal with rotating presenters |
| Scope creep into P1 features before MVP is solid | The explicit Phase 11 freeze checkpoint (Section 2/3 above) — P1 work literally cannot start before this gate |
| Suitability score / confidence terminology slip | `Common-Domain-Naming-Convention.md` Section 8 — enforced in PR review |

---

## 7. Definition of "Done" for the Whole Project

Use this as the final gate before considering the MVP submission-ready:

- [ ] Real, sourced, licensed dataset used throughout — no illustrative example values remain anywhere in the running system
- [ ] Leakage guard tested and verified on the actual final feature set
- [ ] Model comparison documented with a defensible selection reasoning
- [ ] `POST /predict` works correctly for every district/crop/season combination in the locked MVP scope
- [ ] Suitability score always normalizes correctly, top candidate always scores 100
- [ ] Unit conversion verified against hand-calculated values
- [ ] Weather API failure handled gracefully and demonstrated live at least once in rehearsal
- [ ] Frontend and backend contracts match exactly, verified by an actual integration test, not just visual inspection
- [ ] Full demo script runs twice in a row without manual intervention
- [ ] Every team member can explain the leakage guard, the suitability score formula, and the weather fallback without notes
- [ ] Deployment (or local fallback) tested in the actual environment that will be used on demo day
