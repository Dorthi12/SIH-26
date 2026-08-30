"""
options.py — Discovery helpers for the crop recommendation options endpoints.
Returns sorted unique values from the in-memory DataFrame.
"""

import logging

from fastapi import HTTPException

from services.crop.artifact_loader import crop_artifacts

logger = logging.getLogger(__name__)


def get_states() -> list[str]:
    return crop_artifacts.states


def get_seasons() -> list[str]:
    return crop_artifacts.seasons


def get_districts(state: str) -> list[str]:
    """Return sorted districts for a given state (case-insensitive). 404 if state unknown."""
    canonical = crop_artifacts.resolve_state(state)
    if canonical is None:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "INVALID_STATE",
                "message": (
                    f"State '{state}' is not available in the dataset. "
                    "Call /api/v1/crop/options/states for the full list."
                ),
            },
        )
    mask = crop_artifacts._col_mask("state", canonical)
    return sorted(crop_artifacts.df[mask]["district"].unique().tolist())


def get_crops(
    state:    str | None,
    district: str | None,
    season:   str | None,
) -> dict:
    """
    Return available crops, optionally filtered by state / district / season.
    If no filters: return all crops in the dataset.
    """
    df = crop_artifacts.df

    if state:
        canonical_state = crop_artifacts.resolve_state(state)
        if canonical_state is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "INVALID_STATE", "message": f"State '{state}' not found."},
            )
        df = df[df["state"].str.lower() == canonical_state.lower()]

    if district:
        resolved_district = crop_artifacts.resolve_district(district)
        df = df[df["district"].str.lower() == resolved_district.lower()]
        if df.empty:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "INVALID_DISTRICT",
                    "message": f"District '{district}' not found for the given state.",
                },
            )

    if season:
        canonical_season = crop_artifacts.resolve_season(season)
        if canonical_season is None:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "INVALID_SEASON",
                    "message": (
                        f"Season '{season}' is not supported. "
                        "Call /api/v1/crop/options/seasons for valid values."
                    ),
                },
            )
        df = df[df["season"].str.lower() == canonical_season.lower()]

    crops = sorted(df["crop"].unique().tolist())
    return {
        "state":    state,
        "district": district,
        "season":   season,
        "crops":    crops,
    }
