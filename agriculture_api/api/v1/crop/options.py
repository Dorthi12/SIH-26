"""
crop_options.py — Discovery endpoints for the Crop Recommendation Engine.

GET /api/v1/crop/options/states
GET /api/v1/crop/options/districts?state=Bihar
GET /api/v1/crop/options/seasons
GET /api/v1/crop/options/crops
GET /api/v1/crop/options/crops?state=Bihar&district=Gaya&season=Kharif
"""

import logging
from typing import Optional

from fastapi import APIRouter, Query

from core.config import API_V1
from schemas.crop import CropsResponse, DistrictsResponse, SeasonsResponse, StatesResponse
from services.crop import options as options_svc

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{API_V1}/crop/options", tags=["Crop Recommendation — Discovery"])


@router.get(
    "/states",
    response_model=StatesResponse,
    summary="List all supported states",
    description=(
        "Returns every state that has historical crop data in the dataset. "
        "Use this to populate state dropdowns in the frontend."
    ),
)
def list_states():
    states = options_svc.get_states()
    return StatesResponse(count=len(states), states=states)


@router.get(
    "/districts",
    response_model=DistrictsResponse,
    summary="List districts for a given state",
    description=(
        "Returns all districts within a state that have historical data. "
        "?state= is required. Returns 404 if the state is not found."
    ),
)
def list_districts(
    state: str = Query(..., description="State name (e.g. Bihar)"),
):
    districts = options_svc.get_districts(state)
    return DistrictsResponse(state=state, count=len(districts), districts=districts)


@router.get(
    "/seasons",
    response_model=SeasonsResponse,
    summary="List all supported crop seasons",
    description=(
        "Returns every season present in the dataset "
        "(e.g. Kharif, Rabi, Whole Year, Summer, Winter)."
    ),
)
def list_seasons():
    seasons = options_svc.get_seasons()
    return SeasonsResponse(count=len(seasons), seasons=seasons)


@router.get(
    "/crops",
    response_model=CropsResponse,
    summary="List available crops (optionally filtered)",
    description=(
        "Without query params: returns all crops in the dataset.\n\n"
        "With `state` + `district` + `season`: returns only crops that have "
        "historical records for that exact combination — ideal for context-aware dropdowns.\n\n"
        "Any combination of filters is valid; missing params are treated as 'all'."
    ),
)
def list_crops(
    state:    Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district (requires state)"),
    season:   Optional[str] = Query(None, description="Filter by season"),
):
    result = options_svc.get_crops(state, district, season)
    return CropsResponse(
        state=result["state"],
        district=result["district"],
        season=result["season"],
        count=len(result["crops"]),
        crops=result["crops"],
    )
