# 🚀 Action Plan: AgriSense Frontend & Backend Integration Roadmap
> **Document Purpose:** Comprehensive audit of Frontend routes, hardcoded data states, backend API availability, and ML model (`models_fastapi` & `rag`) connection status.  
> **Status:** Planning phase (No implementations made yet).
---
## 1. Executive Overview
* **Frontend Framework:** React + Vite (Port `5173`)
* **Node.js Backend:** Express + Prisma PostgreSQL (Port `5000`)
* **Unified ML FastAPI Backend:** Python / CatBoost / EfficientNet (Port `8000`) — Located in `models_fastapi/`
* **RAG AI Assistant Backend:** Python FastAPI (Port `8001`) — Located in `rag/`
Currently, **most frontend pages run on hardcoded mock data or throwing service stubs**, while the unified ML service (`models_fastapi`) is built on port 8000 but **not yet wired to the frontend or Node backend**.
---
## 2. Frontend Routes & Data Integration Audit
| Frontend Route / Page | Current Data Source | Existing Backend/ML Endpoint | Missing / Required Endpoints | Integration Status |
|---|---|---|---|---|
| **`/login` & `/signup`** | `authService.ts` | **Node (Port 5000):**<br>`POST /auth/login`<br>`POST /auth/register`<br>`GET /auth/google` | None (Routes exist in Node backend) | 🟡 **Partially Connected** (Needs testing & token storage) |
| **`/dashboard`** | `dashboardService.ts`<br>*(Returns `MOCK_TOP_CROP`, `MOCK_RANKINGS`, `MOCK_WEATHER`)* | **None** | `GET /api/v1/dashboard` or Node `GET /dashboard` (Aggregating latest recommendations + weather + historical metrics) | 🔴 **Hardcoded Mock Data** |
| **`/recommendation`**, **`/analyzing`**, **`/results`** | `predictionApi.ts`<br>*(Tries `POST :8000/api/v1/predict`, falls back to mock)* | **FastAPI (Port 8000):**<br>`POST /api/v1/crop/recommend`<br>`POST /api/v1/crop/recommend/score` | Node backend wrapper/proxy `POST /api/v1/predict` (to persist farmer queries in PostgreSQL) | 🔴 **Endpoint Name Mismatch / Hardcoded Fallback** |
| **`/explain`** | `explainService.ts` (mock) & `explainabilityService.ts` (stub error) | **FastAPI (Port 8000):**<br>`POST /api/v1/crop/recommend/explain` | `GET /predictions/:id/explain` (Node backend or FastAPI endpoint) | 🔴 **Hardcoded Mock / Stub Error** |
| **`/district-intelligence`** | `districtIntelligenceService.ts`<br>*(Throws `STUB` error)* | **FastAPI (Port 8000):**<br>`GET /api/v1/crop/options/districts`<br>`GET /api/v1/crop/options/states` | `GET /districts/:id/intelligence` (District soil profile, climate stats, top historical crops) | 🔴 **Unconnected Stub (Throws Error)** |
| **`/scenario-simulator`** & **`/comparison`** | `scenarioService.ts`<br>*(Throws `STUB` error)* | **FastAPI (Port 8000):**<br>`POST /api/v1/crop/recommend/batch`<br>`POST /api/v1/predict-yield` | `POST /scenario/simulate` (Accepts delta adjustments: temp +2°C, rainfall -20%, etc.) | 🔴 **Unconnected Stub (Throws Error)** |
| **`/weather`** | `weatherService.ts` & `weatherApi.ts`<br>*(Uses `MOCK_WEATHER_DATA`)* | **None** | `GET /api/v1/weather/current`<br>`GET /api/v1/weather/forecast` (Integration with Open-Meteo or IMD API) | 🔴 **Hardcoded Mock Data** |
| **`/history`** | Local State / Mock Data | **None** | Node Backend: `GET /users/me/history` (Prisma schema needs `PredictionHistory` model) | 🔴 **Hardcoded Mock Data** |
| **`/assistant`** | `assistantService.ts` & Node `/ai` | **RAG Service (Port 8001):**<br>`POST /api/rag/chat`<br>**Node (Port 5000):**<br>`POST /ai/` (prisma.conversation) | Alignment between Frontend `assistantService.ts` (Port 8001) and Node `/ai` (Port 5000) | 🟡 **Contract Ready / Dual Route Choice** |
---
## 3. ML Models Connection Status (`models_fastapi`)
The ML models are hosted inside `models_fastapi/main.py` on **Port 8000**:
1. **Model 1: CatBoost Yield Forecaster**
   * **Endpoints Available:**
     * `POST /api/v1/predict-yield`
     * `POST /api/v1/predict-yield/from-history`
     * `POST /api/v1/predict-yield/batch`
   * **Connection Status:** ❌ Not connected to Frontend or Node backend.
2. **Model 2: Crop Recommendation Engine**
   * **Endpoints Available:**
     * `POST /api/v1/crop/recommend` (Top-K ranked crops)
     * `POST /api/v1/crop/recommend/score`
     * `POST /api/v1/crop/recommend/explain` (Feature attribution)
     * `GET /api/v1/crop/options/districts`, `/states`, `/seasons`, `/crops`
   * **Connection Status:** ❌ Frontend `predictionApi.ts` currently tries `/api/v1/predict` instead of `/api/v1/crop/recommend`.
3. **Model 5: Plant Disease Detection (EfficientNet-B0)**
   * **Endpoints Available:**
     * `POST /api/v1/plant-disease/predict`
   * **Connection Status:** ❌ No UI component currently wired to plant disease upload.
4. **RAG Scheme AI Assistant (`rag/`, Port 8001)**
   * **Endpoints Available:**
     * `POST /api/rag/chat`
   * **Connection Status:** 🟡 Frontend `assistantService.ts` is configured for port 8001; needs end-to-end testing with RAG server active.
---
## 4. Phased Action Plan for Full System Integration
### Phase 1: Connect Core ML Recommendation & Prediction Flow
1. **Fix `predictionApi.ts`**:
   * Update API route in `Frontend/src/api/predictionApi.ts` from `/api/v1/predict` to point to `http://localhost:8000/api/v1/crop/recommend`.
   * Align `FarmerInput` TypeScript payload with `CropRecommendationRequest` Pydantic schema expected by FastAPI.
2. **Wire `/analyzing` and `/results`**:
   * Ensure recommendation response flows directly into `Results.tsx` without triggering mock fallback.
### Phase 2: Wire Model Explainability & Options API
1. **Connect `explainabilityService.ts`**:
   * Replace stub error in `explainabilityService.ts` to call `POST http://localhost:8000/api/v1/crop/recommend/explain`.
2. **Dynamic District Selector**:
   * Replace static `DISTRICTS` list in `districtIntelligenceService.ts` with `GET http://localhost:8000/api/v1/crop/options/districts`.
### Phase 3: Create Missing FastAPI & Node Backend Endpoints
1. **Scenario Simulator Endpoint (`POST /scenario/simulate`)**:
   * Add a scenario endpoint in `models_fastapi/api/v1/` or Node backend that takes modified climate parameters (delta temp/rainfall) and runs batch predictions against Model 1/Model 2.
2. **District Intelligence Endpoint (`GET /districts/:id/intelligence`)**:
   * Add endpoint returning district historical yield, dominant soil NPK averages, and climate risks.
3. **Weather API Service (`/api/v1/weather/*`)**:
   * Implement real weather fetching using Open-Meteo or IMD weather API in FastAPI or Node backend.
### Phase 4: Node Backend Persistence & History
1. **Database Schema Update (`prisma/schema.prisma`)**:
   * Add `PredictionHistory` model linked to `User`.
2. **History & Dashboard API**:
   * Add `GET /users/me/history` and `GET /dashboard` endpoints in Node backend to store and serve personalized farmer history.
