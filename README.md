# 🌾 Netravaah — Smart Agriculture Decision-Support System

> **A comprehensive data-driven decision pipeline and AI advisory platform for Indian agriculture.**  
> Combines district-level historical agricultural data, climate forecasts, deep-learning crop disease diagnostics, CatBoost predictive yield engines, and a RAG-powered agricultural scheme assistant into an integrated, farmer-first web application.

---

## 📌 Project Overview

**Netravaah** is a dynamic decision-support platform designed to address critical challenges in modern Indian agriculture. Rather than relying on static single-crop predictions, Netravaah provides a multi-model decision pipeline (**Input → Processing → Intelligence → Output**) that ranks crop suitability, forecasts future crop yields, quantifies zero-production risks, diagnoses leaf diseases from photos, and answers queries regarding government schemes (e.g., KCC, PM-KISAN).

---

## ✨ Core Features & Modules

### 1. 🌾 Crop Recommendation Engine (Model 2)
- **District-Aware Ranking**: Ranks top candidate crops based on historical district performance across India (32,400 dataset records).
- **Multi-Factor Scoring**: Evaluates historical yield (50%), yield stability (30%), and regional cultivation experience (20%).
- **Explainable Scores**: Generates suitability scores (0–100) and weighted breakdowns per crop.

### 2. 📈 Future Yield Forecaster (Model 1)
- **CatBoost Regression**: Predicts next-year crop yield (tonnes/hectare) using 16 historical, environmental, and temporal lag features.
- **High Accuracy**: Temporal test **R² = 0.9019**.
- **Production Estimation**: Calculates estimated total harvest output based on farm area inputs (acres converted to hectares).

### 3. ⚠️ Zero-Production Risk Analyzer (Model 3 V3)
- **Failure Risk Assessment**: Predicts whether a specific crop/district/season combination faces critical risk of total crop loss (zero production).
- **Calibrated Machine Learning**: Uses `CatBoostClassifier` paired with `IsotonicRegression` calibration (**ROC-AUC = 0.9438**).
- **Risk Categorization**: Assigns risk bands (*LOW*, *MODERATE*, *HIGH*, *VERY_HIGH*, *CRITICAL*).

### 4. 🔬 Plant Disease Classifier (Model 5)
- **Vision Model**: `EfficientNet-B0` deep convolutional neural network trained on PlantVillage.
- **Coverage**: Diagnoses **38 disease classes** across **14 major crops**.
- **Performance**: **97.43% test accuracy** | **96.75% macro F1**.
- **Multi-Layer Input Validation**: Validates image format, magic bytes, resolution, and blurs before processing.

### 5. 🤖 RAG-Powered AI Advisory Assistant
- **Retrieval-Augmented Generation**: Vector search over official government agricultural documents, schemes (PM-KISAN, KCC), and best practices.
- **Safety & Eligibility Guards**: Evaluates eligibility criteria and filters harmful or unverified advice.

### 6. 📊 Interactive Farmer & District Dashboard
- **React + TypeScript + Tailwind**: Modern web application featuring scenario simulation, side-by-side crop comparison, district intelligence, weather trends, and prediction history.

---

## 🏗️ System Architecture

```
                                👨‍🌾 FARMER / USER
                                       │
                                       ▼
                   ┌───────────────────────────────────────┐
                   │        React + TypeScript UI          │
                   │        (Vite + TailwindCSS)           │
                   └───────────────────┬───────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │  Node.js Backend (REST) │         │  RAG Advisory Assistant │
        │  Prisma + PostgreSQL    │         │  Vector Search & LLM    │
        └────────────┬────────────┘         └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                 Unified ML Server (FastAPI)                 │
        │                       port 8000                             │
        │                                                             │
        │   ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐   │
        │   │   Model 1    │ │   Model 2    │ │     Model 3 V3     │   │
        │   │ Yield Predict│ │ Crop Recomm. │ │ Zero-Prod Risk     │   │
        │   └──────────────┘ └──────────────┘ └────────────────────┘   │
        │                     ┌──────────────┐                        │
        │                     │   Model 5    │                        │
        │                     │ Disease Diag.│                        │
        │                     └──────────────┘                        │
        └─────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
.
├── models_fastapi/              # 🚀 Unified FastAPI Server (Hosts Models 1, 2, 3 V3, & 5)
│   ├── main.py                  # Single lifespan entry point for all 4 models
│   ├── requirements.txt         # Consolidated dependencies (sklearn 1.6.1 pinned)
│   ├── core/                    # Unified configuration & logging
│   ├── models/                  # Singleton model loaders
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── services/                # Business logic & pre-processing
│   └── api/v1/                  # API routers (disease, crop, yield, zero_production)
│
├── Frontend/                    # 💻 React 18 + TypeScript + Vite + Tailwind UI
│   ├── src/pages/               # Dashboard, Recommendation, Disease Analysis, RAG Assistant
│   ├── src/services/            # API integration clients
│   └── package.json             # Frontend dependencies
│
├── backend/                     # ⚙️ Node.js + Express API Gateway
│   ├── prisma/                  # Database schema & migrations (PostgreSQL/SQLite)
│   └── src/                     # Authentication, user profiles, and record storage
│
├── rag/                         # 🧠 RAG & AI Assistant Engine
│   ├── api/                     # FastAPI endpoints for advisory chat
│   ├── ingestion/               # Knowledge base ingestion (KCC, schemes)
│   └── retrieval/               # Vector search & eligibility checking
│
├── ml/                          # 🧪 Machine Learning Pipeline & Notebooks
│   ├── notebooks/               # 01_data_collection through 06_export_artifacts
│   └── src/                     # Modular cleaning, feature engineering & training scripts
│
├── model_1_future_yield/        # 📦 Model 1 CatBoost model files (.cbm & metadata)
├── model_2_artifacts/           # 📦 Model 2 recommendation dataset & scaler pkls
├── model_3_api/                 # 📦 Model 3 V3 CatBoost model, calibrator & schema
├── model_5_plant_disease_final/ # 📦 Model 5 PyTorch EfficientNet-B0 (.pth & class maps)
│
├── plant_disease_api/           # (Optional) Standalone dedicated server for Model 5
├── yield_forecast_api/          # (Optional) Standalone dedicated server for Model 1
├── crop_recommendation_api/     # (Optional) Standalone dedicated server for Model 2
└── README.md                    # Root project documentation
```

---

## 🤖 Machine Learning Model Summary

| Model | Task | Model Architecture | Key Dataset | Benchmark Metric |
|-------|------|--------------------|-------------|------------------|
| **Model 1** | Future Crop Yield Prediction | `CatBoostRegressor` | District-level agricultural statistics (1997–2017) | Temporal Test **R² = 0.9019** |
| **Model 2** | District Crop Recommendation | Weighted Scoring Pipeline | 32,400 historical records across Indian districts | Comprehensive ranking coverage |
| **Model 3 V3** | Zero-Production Risk Prediction | `CatBoostClassifier` + `IsotonicRegression` | Historical zero-yield district records | **ROC-AUC = 0.9438** |
| **Model 5** | Leaf Disease Diagnosis | `EfficientNet-B0` (PyTorch) | PlantVillage (38 disease classes, 14 crops) | **Accuracy = 97.43%**, **F1 = 96.75%** |

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.x` or higher (`npm`)
- **Git**

---

### 1. Unified ML Server (`models_fastapi/`)

The unified server loads all 4 ML models in a single process on port `8000`.

```bash
# Navigate to the unified FastAPI folder
cd models_fastapi

# Create & activate a virtual environment (recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
View interactive documentation at: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup (`Frontend/`)

```bash
# Navigate to Frontend
cd Frontend

# Install packages
npm install

# Run Vite development server
npm run dev
```
Access UI at: **`http://localhost:5173`**

---

### 3. Node.js Backend Setup (`backend/`)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Initialize Prisma database schema
npx prisma db push

# Start the server
npm run dev
```

---

### 4. RAG Assistant Setup (`rag/`)

```bash
# Navigate to rag
cd rag

# Install dependencies
pip install -r requirements.txt

# Start RAG API service
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🔌 Unified ML Server API Endpoints (`models_fastapi`)

The unified server exposes **30 endpoints** under port `8000`:

### System Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service root and route map |
| `GET` | `/health` | Combined liveness check across all 4 models |
| `GET` | `/ready` | Combined readiness probe verifying all model weights are in memory |

### Plant Disease Detection — Model 5
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/plant-disease/predict` | Predict plant disease from uploaded image file |
| `GET` | `/api/v1/plant-disease/health` | Disease model liveness |
| `GET` | `/api/v1/plant-disease/model/info` | Architecture, classes, and temperature calibration metadata |

### Crop Recommendation — Model 2
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/crop/recommend` | Get ranked list of recommended crops for district + season |
| `POST` | `/api/v1/crop/recommend/score` | Score suitability for a single specific crop |
| `POST` | `/api/v1/crop/recommend/explain` | Detailed score breakdown (yield, stability, experience) |
| `POST` | `/api/v1/crop/recommend/batch` | Batch recommendation for multiple locations |
| `GET` | `/api/v1/crop/options/states` | List all supported states |
| `GET` | `/api/v1/crop/options/districts` | List supported districts for a state |
| `GET` | `/api/v1/crop/options/seasons` | List supported seasons |
| `GET` | `/api/v1/crop/options/crops` | List supported crop names |

### Future Yield Forecast — Model 1
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/predict-yield` | Predict future yield using full 16-feature vector |
| `POST` | `/api/v1/predict-yield/from-history` | Predict yield by auto-deriving historical features |
| `POST` | `/api/v1/predict-yield/batch` | Batch yield prediction (up to 100 records) |
| `GET` | `/api/v1/yield/metadata` | Model 1 configuration & test R² metrics |
| `GET` | `/api/v1/yield/schema` | Self-documenting feature schema |

### Zero-Production Risk — Model 3 V3
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/model-3-v3/predict` | Single zero-production risk prediction & calibrated probability |
| `POST` | `/api/v1/model-3-v3/predict/batch` | Batch zero-production risk prediction (up to 5,000 records) |
| `POST` | `/api/v1/model-3-v3/predict/from-context` | Time-aware feature lookup prediction (501 stub) |
| `GET` | `/api/v1/model-3-v3/info` | Model schema, ROC-AUC metrics, and threshold settings |
| `GET` | `/api/v1/model-3-v3/version` | API & model version tracking |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in `models_fastapi/`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEVICE` | `cpu` | PyTorch execution device (`cpu` or `cuda`) |
| `LOG_LEVEL` | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `THRESHOLD_APPLIES_TO` | `calibrated` | Probability scale for Model 3 decision threshold (`calibrated` or `raw`) |
| `DEBUG_MODE` | `0` | Set to `1` during development to receive raw exception traces |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Recharts
- **ML Services**: FastAPI, PyTorch, Torchvision, CatBoost, Scikit-Learn, Pandas, NumPy, Pillow, Joblib
- **Backend API**: Node.js, Express, Prisma ORM, PostgreSQL / SQLite
- **AI & RAG**: Python, SentenceTransformers, Vector Embeddings, LangChain / LlamaIndex

---

## 🤝 License & Acknowledgments

Built for the **Smart India Hackathon (SIH)**. Developed by Team **Netravaah**.
