"""
Crop Recommendation Engine — FastAPI Service
=============================================
Model      : Crop Recommendation Engine v1.0
Artifacts  : model_2_config.pkl, model_2_recommendation_data.csv,
             yield_scaler.pkl, stability_scaler.pkl, experience_scaler.pkl
Author     : Netravaah Agriculture Team — ML Member
"""

import logging
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

# ---------------------------------------------------------------------------
# Global model state — loaded ONCE at startup, reused for every request
# ---------------------------------------------------------------------------
class ModelState:
    config: dict = {}
    df: pd.DataFrame = pd.DataFrame()
    yield_scaler = None
    stability_scaler = None
    experience_scaler = None
    records_loaded: int = 0
    states: list[str] = []
    seasons: list[str] = []


state = ModelState()


# ---------------------------------------------------------------------------
# Lifespan — replaces on_event("startup")
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all artifacts once at server startup."""
    logger.info("Loading model artifacts from: %s", ARTIFACTS_DIR)

    # Config
    state.config = joblib.load(ARTIFACTS_DIR / "model_2_config.pkl")
    logger.info("Config loaded: %s", state.config.get("model_name"))

    # Scalers (loaded for metadata/transparency — scoring already baked into CSV)
    state.yield_scaler = joblib.load(ARTIFACTS_DIR / "yield_scaler.pkl")
    state.stability_scaler = joblib.load(ARTIFACTS_DIR / "stability_scaler.pkl")
    state.experience_scaler = joblib.load(ARTIFACTS_DIR / "experience_scaler.pkl")
    logger.info("Scalers loaded")

    # Recommendation data
    state.df = pd.read_csv(ARTIFACTS_DIR / "model_2_recommendation_data.csv")

    # Strip trailing whitespace from season column (artifact quirk)
    state.df["season"] = state.df["season"].str.strip()
    state.df["state"] = state.df["state"].str.strip()
    state.df["district"] = state.df["district"].str.strip()
    state.df["crop"] = state.df["crop"].str.strip()

    state.records_loaded = len(state.df)
    state.states = sorted(state.df["state"].unique().tolist())
    state.seasons = sorted(state.df["season"].unique().tolist())

    logger.info(
        "Recommendation dataset loaded: %d records | %d states | %d districts | %d crops | %d seasons",
        state.records_loaded,
        state.df["state"].nunique(),
        state.df["district"].nunique(),
        state.df["crop"].nunique(),
        state.df["season"].nunique(),
    )

    yield  # ← server runs here

    logger.info("Shutting down — releasing model state")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Crop Recommendation Engine",
    description=(
        "District-Aware Crop Recommendation API for the Netravaah Agriculture Platform.\n\n"
        "Given a state, district and season, returns the top-K crops ranked by "
        "historical yield performance, production stability, and cultivation experience."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict to actual origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_TOP_K = 5
MAX_TOP_K = 20


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _normalize(text: str) -> str:
    """Strip, collapse internal whitespace, lowercase for matching."""
    return re.sub(r"\s+", " ", text.strip()).lower()


def _lookup(col: str, value: str) -> pd.Series:
    """Case-insensitive match for a column value."""
    return state.df[col].str.strip().str.lower() == _normalize(value)


def _filter_df(state_val: str, district: str, season: str) -> pd.DataFrame:
    mask = _lookup("state", state_val) & _lookup("district", district) & _lookup("season", season)
    return state.df[mask].copy()


def _stability_label(cv: float) -> str:
    if cv < 0.15:
        return "High"
    elif cv < 0.30:
        return "Medium"
    return "Low"


def _trend_label(score: float) -> str:
    if score >= 0.65:
        return "Improving"
    elif score >= 0.40:
        return "Stable"
    return "Declining"


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class RecommendationRequest(BaseModel):
    state: str = Field(..., min_length=1, description="Indian state name (e.g. Bihar)")
    district: str = Field(..., min_length=1, description="District name (e.g. Gaya)")
    season: str = Field(..., min_length=1, description="Crop season (e.g. Kharif, Rabi, Whole Year)")
    top_k: int = Field(DEFAULT_TOP_K, ge=1, le=MAX_TOP_K, description="Number of top crops to return")

    model_config = {"json_schema_extra": {"example": {"state": "Bihar", "district": "Gaya", "season": "Kharif", "top_k": 5}}}


class ScoreCropRequest(BaseModel):
    state: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    season: str = Field(..., min_length=1)
    crop: str = Field(..., min_length=1, description="Crop name to score (e.g. Rice)")

    model_config = {"json_schema_extra": {"example": {"state": "Bihar", "district": "Gaya", "season": "Kharif", "crop": "Rice"}}}


class HistoricalFeatures(BaseModel):
    median_yield: float
    mean_yield: float
    max_yield: float
    min_yield: float
    yield_std: float
    mean_area: float
    years_cultivated: int
    yield_cv: float


class CropRecommendation(BaseModel):
    rank: int
    crop: str
    historical_score: float = Field(..., description="Final composite score: 0.5×yield + 0.3×stability + 0.2×experience")
    yield_score: float = Field(..., description="Normalized median yield score (0–1)")
    stability_score: float = Field(..., description="Production stability score based on CV (0–1)")
    experience_score: float = Field(..., description="Historical cultivation experience score (0–1)")
    stability_label: str = Field(..., description="Human-readable stability: High / Medium / Low")
    trend_label: str = Field(..., description="Yield trend: Improving / Stable / Declining")
    historical_features: HistoricalFeatures


class RecommendationResponse(BaseModel):
    model: str
    version: str
    input: dict
    total_candidates: int
    recommendations: list[CropRecommendation]


class CropScoreResponse(BaseModel):
    model: str
    version: str
    input: dict
    found: bool
    crop_score: Optional[CropRecommendation] = None
    message: Optional[str] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Root"])
def root():
    """Service root — confirms the API is alive."""
    return {
        "service": "Crop Recommendation Engine",
        "version": state.config.get("model_version", "1.0"),
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Monitoring"])
def health():
    """
    Health check endpoint.
    Your friend's main backend should poll this to confirm the ML service is alive.
    Returns 200 when healthy, 503 if model artifacts are not loaded.
    """
    if state.df.empty:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded — service unhealthy")
    return {
        "status": "healthy",
        "model": state.config.get("model_name"),
        "version": state.config.get("model_version"),
        "records_loaded": state.records_loaded,
    }


@app.get("/metadata", tags=["Monitoring"])
def metadata():
    """
    Expose model configuration and scoring weights.
    Useful for frontend information panels, debugging, and model versioning.
    """
    return {
        "model_name": state.config.get("model_name"),
        "model_version": state.config.get("model_version"),
        "default_top_k": state.config.get("default_top_k", DEFAULT_TOP_K),
        "max_top_k": MAX_TOP_K,
        "score_weights": state.config.get("score_components", {}),
        "scoring_formula": "historical_score = 0.5 × yield_score + 0.3 × stability_score + 0.2 × experience_score",
        "features": state.config.get("features", []),
        "historical_features": state.config.get("historical_features", []),
        "total_records": state.records_loaded,
        "unique_states": len(state.states),
    }


@app.get("/options", tags=["Discovery"])
def options(
    state_name: Optional[str] = Query(None, alias="state", description="Filter districts and crops by state"),
    district: Optional[str] = Query(None, description="Filter crops by district (requires state)"),
):
    """
    Discover available filter options — powers dropdowns in the frontend.

    - No params  → list of all states + seasons
    - ?state=X   → list of districts in that state
    - ?state=X&district=Y → list of crops in that state+district
    """
    if state_name is None:
        return {
            "states": state.states,
            "seasons": state.seasons,
        }

    state_mask = _lookup("state", state_name)
    if not state_mask.any():
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found in dataset")

    if district is None:
        districts = sorted(state.df[state_mask]["district"].unique().tolist())
        return {"state": state_name, "districts": districts}

    filtered = state.df[state_mask & _lookup("district", district)]
    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"District '{district}' not found in state '{state_name}'")

    crops = sorted(filtered["crop"].unique().tolist())
    seasons_available = sorted(filtered["season"].unique().tolist())
    return {"state": state_name, "district": district, "crops": crops, "seasons": seasons_available}


@app.post("/recommend", response_model=RecommendationResponse, tags=["Inference"])
def recommend(request: RecommendationRequest):
    """
    **Main inference endpoint.**

    Given a state, district and season, returns the top-K crops ranked by
    historical_score = 0.5 × yield_score + 0.3 × stability_score + 0.2 × experience_score.

    Your friend's main backend should call this endpoint via:
        POST http://<ml-service-host>:8000/recommend

    The main backend is responsible for auth, farmer identity, and enriching
    this response with other services (weather, market, soil).
    """
    candidates = _filter_df(request.state, request.district, request.season)

    if candidates.empty:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No historical data found for "
                f"state='{request.state}', district='{request.district}', season='{request.season}'. "
                f"Check /options for valid combinations."
            ),
        )

    candidates = candidates.sort_values("historical_score", ascending=False)
    top_candidates = candidates.head(request.top_k)

    recommendations: list[CropRecommendation] = []
    for rank, (_, row) in enumerate(top_candidates.iterrows(), start=1):
        recommendations.append(
            CropRecommendation(
                rank=rank,
                crop=row["crop"],
                historical_score=round(float(row["historical_score"]), 4),
                yield_score=round(float(row["yield_score"]), 4),
                stability_score=round(float(row["stability_score"]), 4),
                experience_score=round(float(row["experience_score"]), 4),
                stability_label=_stability_label(float(row["yield_cv"])),
                trend_label=_trend_label(float(row["yield_score"])),
                historical_features=HistoricalFeatures(
                    median_yield=round(float(row["median_yield"]), 4),
                    mean_yield=round(float(row["mean_yield"]), 4),
                    max_yield=round(float(row["max_yield"]), 4),
                    min_yield=round(float(row["min_yield"]), 4),
                    yield_std=round(float(row["yield_std"]), 4),
                    mean_area=round(float(row["mean_area"]), 2),
                    years_cultivated=int(row["years_cultivated"]),
                    yield_cv=round(float(row["yield_cv"]), 4),
                ),
            )
        )

    return RecommendationResponse(
        model=state.config.get("model_name", "Crop Recommendation Engine"),
        version=state.config.get("model_version", "1.0"),
        input={
            "state": request.state,
            "district": request.district,
            "season": request.season,
            "top_k": request.top_k,
        },
        total_candidates=len(candidates),
        recommendations=recommendations,
    )


@app.post("/score-crop", response_model=CropScoreResponse, tags=["Inference"])
def score_crop(request: ScoreCropRequest):
    """
    Score a **specific crop** for a given state, district and season.

    Use this when the frontend allows the farmer to ask:
        "How does Wheat score for my location?"
    rather than asking for a ranked list.
    """
    candidates = _filter_df(request.state, request.district, request.season)

    if candidates.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data for state='{request.state}', district='{request.district}', season='{request.season}'",
        )

    crop_mask = candidates["crop"].str.strip().str.lower() == _normalize(request.crop)
    crop_data = candidates[crop_mask]

    if crop_data.empty:
        available = sorted(candidates["crop"].tolist())
        return CropScoreResponse(
            model=state.config.get("model_name", "Crop Recommendation Engine"),
            version=state.config.get("model_version", "1.0"),
            input={"state": request.state, "district": request.district, "season": request.season, "crop": request.crop},
            found=False,
            message=f"Crop '{request.crop}' has no historical data for this location/season. "
                    f"Available crops: {available}",
        )

    row = crop_data.iloc[0]

    # Rank the crop within all candidates
    all_sorted = candidates.sort_values("historical_score", ascending=False).reset_index(drop=True)
    crop_rank = all_sorted[all_sorted["crop"].str.strip().str.lower() == _normalize(request.crop)].index[0] + 1

    return CropScoreResponse(
        model=state.config.get("model_name", "Crop Recommendation Engine"),
        version=state.config.get("model_version", "1.0"),
        input={"state": request.state, "district": request.district, "season": request.season, "crop": request.crop},
        found=True,
        crop_score=CropRecommendation(
            rank=int(crop_rank),
            crop=row["crop"],
            historical_score=round(float(row["historical_score"]), 4),
            yield_score=round(float(row["yield_score"]), 4),
            stability_score=round(float(row["stability_score"]), 4),
            experience_score=round(float(row["experience_score"]), 4),
            stability_label=_stability_label(float(row["yield_cv"])),
            trend_label=_trend_label(float(row["yield_score"])),
            historical_features=HistoricalFeatures(
                median_yield=round(float(row["median_yield"]), 4),
                mean_yield=round(float(row["mean_yield"]), 4),
                max_yield=round(float(row["max_yield"]), 4),
                min_yield=round(float(row["min_yield"]), 4),
                yield_std=round(float(row["yield_std"]), 4),
                mean_area=round(float(row["mean_area"]), 2),
                years_cultivated=int(row["years_cultivated"]),
                yield_cv=round(float(row["yield_cv"]), 4),
            ),
        ),
    )
