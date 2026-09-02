# 🌾 AgriSense — Smart Agriculture Decision-Support System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-agrisense--ruby.vercel.app-2ea44f?style=for-the-badge&logo=vercel)](https://agrisense-ruby.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Dorthi12%2FSIH--26-181717?style=for-the-badge&logo=github)](https://github.com/Dorthi12/SIH-26)
[![FastAPI](https://img.shields.io/badge/ML%20Server-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)

> **A multi-model AI decision pipeline, disease diagnostic suite, and scheme advisory platform tailored for Indian agriculture.**  
> Combines historical district crop yield analytics, CatBoost predictive yield engines, calibrated zero-production risk assessments, deep-learning crop disease vision models, and RAG-powered scheme assistance into a single unified platform.

---

## 🔗 Quick Links

- 🌐 **Live Web Application**: [https://agrisense-ruby.vercel.app/](https://agrisense-ruby.vercel.app/)
- 🐙 **GitHub Repository**: [https://github.com/Dorthi12/SIH-26](https://github.com/Dorthi12/SIH-26)
- 🚀 **Unified ML Server Docs**: `http://localhost:8000/docs` (when running locally)

---

## 📌 Project Overview

**AgriSense (Netravaah)** is a high-performance agricultural decision-support platform designed for Indian farmers, agronomists, and policy planners. Moving beyond single-variable predictions, AgriSense delivers an end-to-end intelligence pipeline (**Input → Processing → Intelligence → Actionable Output**):

1. **Optimal Crop Selection**: Recommends top candidate crops for any district and season based on historical performance, yield stability, and local cultivation experience.
2. **Yield Forecasting**: Uses temporal CatBoost gradient boosting models to predict future crop yield (tonnes/hectare) and total harvest volume.
3. **Loss Mitigation & Risk Analysis**: Identifies critical risks of complete crop failure (zero production) using calibrated probabilistic machine learning.
4. **Instant Disease Diagnosis**: Diagnoses 38 disease classes across 14 crop species in real time using deep convolutional neural networks (`EfficientNet-B0`).
5. **AI Scheme Assistant**: Answers farmer queries regarding government schemes (e.g., KCC, PM-KISAN, crop insurance) with vector retrieval over official documents.

---

## ✨ Core Features & Intelligence Modules

### 1. 🌾 District Crop Recommendation Engine

- **District-Aware Multi-Criteria Ranking**: Analyzes over 32,400 dataset records across Indian districts to determine optimal crops.
- **Weighted Suitability Scoring**: Evaluates historical yield potential (50%), yield stability/variance over time (30%), and regional cultivation experience (20%).
- **Explainable Breakdown**: Provides suitability scores (0–100) alongside individual component metrics for full transparency.

### 2. 📈 Future Yield Forecaster 

- **CatBoost Regression Engine**: Predicts next-season crop yields (tonnes/ha) using 16 historical, environmental, and temporal lag features.
- **High Predictive Precision**: Achieves a temporal test **R² score of 0.9019**.
- **Area-Based Production Estimation**: Translates yield forecasts into estimated total crop production based on farm size (acres/hectares).

### 3. ⚠️ Zero-Production Risk Analyzer 

- **Failure Risk Assessment**: Predicts whether a specific crop/district/season combination faces a severe risk of complete crop loss.
- **Calibrated Probabilities**: Employs `CatBoostClassifier` paired with `IsotonicRegression` calibration (**ROC-AUC = 0.9438**).
- **5-Tier Risk Bands**: Classifies risk into actionable tiers (_LOW_, _MODERATE_, _HIGH_, _VERY_HIGH_, _CRITICAL_).

### 4. 🔬 Plant Leaf Disease Classifier (Model 5)

- **Vision Model**: Deep `EfficientNet-B0` convolutional neural network trained on PlantVillage.
- **Comprehensive Coverage**: Diagnoses **38 disease classes** across **14 major crop species**.
- **State-of-the-Art Accuracy**: **97.43% test accuracy** and **96.75% macro F1-score**.
- **Production Guardrails**: Automated multi-layer validation checking magic bytes, image resolution, format integrity, and blur levels.

### 5. 🤖 RAG-Powered AI Advisory Assistant

- **Retrieval-Augmented Generation**: Vector search engine trained on official government agricultural documents, schemes (PM-KISAN, KCC, PMFBY), and agricultural extension manuals.
- **Smart Guards**: Built-in eligibility verification and safety filtering to prevent misleading information.

### 6. 📊 Modern Farmer Dashboard & Web App

- **React 19 + TypeScript + Tailwind CSS**: Responsive, dark/light theme web app hosted on **Vercel** ([https://agrisense-ruby.vercel.app/](https://agrisense-ruby.vercel.app/)).
- **Interactive Tools**: Scenario simulation, side-by-side crop comparisons, district yield history, weather integration, and disease analysis uploads.

---

## 🏗️ System Architecture

```
                                👨‍🌾 FARMER / USER
                                       │
                                       ▼
                   ┌───────────────────────────────────────┐
                   │    Live Web App (Vercel Deployment)   │
                   │    React 19 + TypeScript + Tailwind    │
                   │    https://agrisense-ruby.vercel.app/ │
                   └───────────────────┬───────────────────┘
                                       │
                                       ▼
                   ┌───────────────────────────────────────┐
                   │  Node.js Backend (REST)               │
                   │  Prisma ORM + Express                 │
                   │  Auth + Community + API               │
                   └───────────────────┬───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌─────────────────────────┐  ┌────────────────────────────┐
        │  RAG Advisory Service  │  │  Unified ML Server         │
        │  Vector Search + LLM   │  │  FastAPI, port 8000       │
        │  (called via backend   │  │                            │
        │   proxy / internal API)│  │  ┌──────────────┐    ... │
        └─────────────────────────┘  │  │ Model 1      │         │
                                      │  │ Yield Predict│         │
                                      │  └──────────────┘         │
                                      │  ┌──────────────┐         │
                                      │  │ Model 2      │         │
                                      │  │ Crop Recomm. │         │
                                      │  └──────────────┘         │
                                      │  ┌──────────────┐         │
                                      │  │ Model 3 V3   │         │
                                      │  │ Zero-Prod Risk│        │
                                      │  └──────────────┘         │
                                      │  ┌──────────────┐         │
                                      │  │ Model 5      │         │
                                      │  │ Disease Diag.│         │
                                      │  └──────────────┘         │
                                      └────────────────────────────┘
```

                                        └────────────────────────────┘

```

---

## 🤖 Machine Learning Models Summary

| Model          | Task                            | Model Architecture                          | Primary Dataset                                     | Benchmark Performance                  |
| -------------- | ------------------------------- | ------------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| **Model 1**    | Future Crop Yield Prediction    | `CatBoostRegressor` (16 features)           | Indian District Agricultural Statistics (1997–2017) | Temporal Test **R² = 0.9019**          |
| **Model 2**    | District Crop Recommendation    | Multi-Factor Weighted Scoring               | 32,400 historical crop records across India         | Comprehensive district coverage        |
| **Model 3 V3** | Zero-Production Risk Prediction | `CatBoostClassifier` + `IsotonicRegression` | District historical failure dataset                 | **ROC-AUC = 0.9438**                   |
| **Model 5**    | Leaf Disease Diagnosis          | `EfficientNet-B0` (PyTorch)                 | PlantVillage (38 classes, 14 crops)                 | **Accuracy = 97.43%**, **F1 = 96.75%** |

---

## 📁 Repository Structure

```

SIH-26/
├── Frontend/ # 💻 React 19 + TypeScript + Vite + Tailwind UI (Vercel)
│ ├── src/pages/ # Dashboard, Recommendation, Disease Diagnostics, RAG Chat
│ ├── src/services/ # API integration clients
│ └── package.json # Web client dependencies
│
├── models_fastapi/ # 🚀 Unified FastAPI Model Server (Models 1, 2, 3 V3 & 5)
│ ├── main.py # Lifespan startup loading all 4 ML models
│ ├── requirements.txt # Consolidated dependencies (sklearn 1.6.1 pinned)
│ ├── core/ # App configuration & logging
│ ├── models/ # Singleton model loaders
│ ├── schemas/ # Pydantic validation schemas
│ ├── services/ # Model inference logic
│ └── api/v1/ # Endpoints (disease, crop, yield, zero_production)
│
├── backend/ # ⚙️ Node.js + Express REST Gateway
│ ├── prisma/ # Database schema & migrations
│ └── src/ # User management, auth, records storage
│
├── rag/ # 🧠 RAG Scheme Advisory Engine
│ ├── api/ # FastAPI vector query endpoints
│ ├── ingestion/ # Knowledge base vector index generation
│ └── retrieval/ # Vector retrieval & rule-based guards
│
├── ml/ # 🧪 Model Training Notebooks & Data Pipeline
│ ├── notebooks/ # Data cleaning, feature engineering, training
│ └── src/ # Shared training scripts
│
├── model_1_future_yield/ # 📦 Model 1 CatBoost binaries & metadata
├── model_2_artifacts/ # 📦 Model 2 ranking datasets & scalers
├── model_3_api/ # 📦 Model 3 V3 CatBoost model & calibrator
├── model_5_plant_disease_final/ # 📦 Model 5 EfficientNet-B0 weights & class maps
└── README.md # Project documentation

````

---

## ⚡ Quick Start & Setup Guide

### Prerequisites

- **Python**: `3.10` or higher
- **Node.js**: `18.x` or higher (`npm`)
- **Git**

---

### 1. Unified ML Server (`models_fastapi/`)

The unified server loads all 4 machine learning models in a single process on port `8000`.

```bash
# Navigate to the unified FastAPI folder
cd models_fastapi

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the unified ML server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
````

Interactive API documentation will be available at: **`http://localhost:8000/docs`**

---

### 2. Frontend Development & Deployment (`Frontend/`)

The web client is deployed live on Vercel at [https://agrisense-ruby.vercel.app/](https://agrisense-ruby.vercel.app/). To run locally:

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Access the local frontend UI at: **`http://localhost:5173`**

---

### 3. Node.js Backend Gateway Setup (`backend/`)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize Prisma database schema
npx prisma db push

# Start backend server
npm run dev
```

---

### 4. RAG Advisory Assistant Setup (`rag/`)

```bash
# Navigate to RAG engine directory
cd rag

# Install dependencies
pip install -r requirements.txt

# Start RAG API server
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🔌 API Reference — Unified ML Server (`models_fastapi`)

The unified server exposes comprehensive endpoints for all ML models under port `8000`:

### System Health & Status

| Method | Endpoint  | Description                                        |
| ------ | --------- | -------------------------------------------------- |
| `GET`  | `/`       | Root route map                                     |
| `GET`  | `/health` | Combined liveness probe across all models          |
| `GET`  | `/ready`  | Readiness probe verifying model weights are loaded |

### Plant Disease Detection — Model 5

| Method | Endpoint                           | Description                                                       |
| ------ | ---------------------------------- | ----------------------------------------------------------------- |
| `POST` | `/api/v1/plant-disease/predict`    | Predict crop disease from uploaded leaf image                     |
| `GET`  | `/api/v1/plant-disease/health`     | Disease model liveness                                            |
| `GET`  | `/api/v1/plant-disease/model/info` | Architecture, class mapping, and temperature calibration metadata |

### Crop Recommendation — Model 2

| Method | Endpoint                         | Description                                             |
| ------ | -------------------------------- | ------------------------------------------------------- |
| `POST` | `/api/v1/crop/recommend`         | Get ranked recommended crops for district & season      |
| `POST` | `/api/v1/crop/recommend/score`   | Evaluate suitability score for a single crop            |
| `POST` | `/api/v1/crop/recommend/explain` | Detailed score breakdown (yield, stability, experience) |
| `POST` | `/api/v1/crop/recommend/batch`   | Batch recommendation for multiple locations             |
| `GET`  | `/api/v1/crop/options/states`    | List supported states                                   |
| `GET`  | `/api/v1/crop/options/districts` | List supported districts for a state                    |
| `GET`  | `/api/v1/crop/options/seasons`   | List supported agricultural seasons                     |
| `GET`  | `/api/v1/crop/options/crops`     | List supported crops                                    |

### Future Yield Forecast — Model 1

| Method | Endpoint                             | Description                                       |
| ------ | ------------------------------------ | ------------------------------------------------- |
| `POST` | `/api/v1/predict-yield`              | Predict future yield using full feature vector    |
| `POST` | `/api/v1/predict-yield/from-history` | Auto-derive historical features and predict yield |
| `POST` | `/api/v1/predict-yield/batch`        | Batch yield prediction (up to 100 records)        |
| `GET`  | `/api/v1/yield/metadata`             | Model 1 metadata & R² metrics                     |
| `GET`  | `/api/v1/yield/schema`               | Feature input schema                              |

### Zero-Production Risk — Model 3 V3

| Method | Endpoint                           | Description                                           |
| ------ | ---------------------------------- | ----------------------------------------------------- |
| `POST` | `/api/v1/model-3-v3/predict`       | Predict zero-production risk & calibrated probability |
| `POST` | `/api/v1/model-3-v3/predict/batch` | Batch risk prediction (up to 5,000 records)           |
| `GET`  | `/api/v1/model-3-v3/info`          | Model metadata, ROC-AUC metrics, and risk thresholds  |

---

## 🛠️ Technology Stack

- **Web Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Deployment Platform**: Vercel ([agrisense-ruby.vercel.app](https://agrisense-ruby.vercel.app/))
- **ML Services**: FastAPI, PyTorch, Torchvision, CatBoost, Scikit-Learn (1.6.1), Pandas, NumPy, Pillow, Joblib
- **Backend API Gateway**: Node.js, Express, Prisma ORM, PostgreSQL / SQLite
- **AI & RAG Engine**: Python, SentenceTransformers, Vector Embeddings, LangChain

---

## 🤝 Project Links & Credits

- **Live Deployment**: [https://agrisense-ruby.vercel.app/](https://agrisense-ruby.vercel.app/)
- **Repository**: [https://github.com/Dorthi12/SIH-26](https://github.com/Dorthi12/SIH-26)
- **Hackathon**: Developed for **Smart India Hackathon (SIH 2026)** by Team **Netravaah / AgriSense**.
