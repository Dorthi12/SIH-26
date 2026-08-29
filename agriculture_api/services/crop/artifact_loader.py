"""
artifact_loader.py — Loads and holds Model 2 (Crop Recommendation) artifacts.

Artifacts loaded once at startup and kept in memory:
  - model_2_config.pkl        → scoring weights, metadata
  - model_2_recommendation_data.csv → 32,400 rows of historical crop data
  - yield_scaler.pkl          → MinMaxScaler fitted on median_yield
  - stability_scaler.pkl      → MinMaxScaler fitted on yield_cv
  - experience_scaler.pkl     → MinMaxScaler fitted on years_cultivated

The DataFrame is stripped and kept in memory for fast filtering.
Because the dataset is static, recommendations for a given
(state, district, season) are always identical — no DB required.
"""

import logging
import re
import warnings

import joblib
import pandas as pd

# MinMaxScaler is stable across sklearn minor versions.
# The pkl was serialized on 1.6.1; newer sklearn raises a harmless warning.
warnings.filterwarnings(
    "ignore",
    message=".*Trying to unpickle estimator.*",
    category=UserWarning,
)

from core.config import (
    CROP_CONFIG_PATH,
    CROP_DATA_PATH,
    EXPERIENCE_SCALER_PATH,
    STABILITY_SCALER_PATH,
    YIELD_SCALER_PATH,
)

logger = logging.getLogger(__name__)


class CropArtifacts:
    """
    Container for all Model 2 artifacts.
    Access via the module-level `crop_artifacts` singleton.
    """

    def __init__(self) -> None:
        self.config:             dict        = {}
        self.df:                 pd.DataFrame = pd.DataFrame()
        self.yield_scaler                    = None
        self.stability_scaler                = None
        self.experience_scaler               = None
        self.records_loaded:     int         = 0
        self.states:             list[str]   = []
        self.seasons:            list[str]   = []
        self.loaded:             bool        = False

    # ------------------------------------------------------------------
    # Startup
    # ------------------------------------------------------------------
    def load(self) -> None:
        """Load all artifacts once.  Call this from the FastAPI lifespan."""
        logger.info("Loading crop artifacts from: %s", CROP_DATA_PATH.parent)

        # Config
        self.config = joblib.load(CROP_CONFIG_PATH)
        logger.info("Crop config loaded: %s v%s",
                    self.config.get("model_name"),
                    self.config.get("model_version"))

        # Scalers
        self.yield_scaler      = joblib.load(YIELD_SCALER_PATH)
        self.stability_scaler  = joblib.load(STABILITY_SCALER_PATH)
        self.experience_scaler = joblib.load(EXPERIENCE_SCALER_PATH)
        logger.info("Crop scalers loaded (yield, stability, experience)")

        # Dataset
        df = pd.read_csv(CROP_DATA_PATH)

        # Normalise whitespace in key columns
        for col in ("state", "district", "season", "crop"):
            df[col] = df[col].str.strip()

        self.df             = df
        self.records_loaded = len(df)
        self.states         = sorted(df["state"].unique().tolist())
        self.seasons        = sorted(df["season"].unique().tolist())

        logger.info(
            "Crop dataset loaded: %d records | %d states | %d districts | "
            "%d crops | %d seasons",
            self.records_loaded,
            df["state"].nunique(),
            df["district"].nunique(),
            df["crop"].nunique(),
            df["season"].nunique(),
        )
        self.loaded = True

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @staticmethod
    def normalize(text: str) -> str:
        """Strip, collapse whitespace, lowercase — used for case-insensitive lookup."""
        return re.sub(r"\s+", " ", text.strip()).lower()

    def _col_mask(self, col: str, value: str) -> pd.Series:
        return self.df[col].str.strip().str.lower() == self.normalize(value)

    def filter(self, state: str, district: str, season: str) -> pd.DataFrame:
        """Return all rows matching state + district + season (case-insensitive)."""
        mask = (
            self._col_mask("state", state)
            & self._col_mask("district", district)
            & self._col_mask("season", season)
        )
        return self.df[mask].copy()

    def resolve_state(self, value: str) -> str | None:
        """Return canonical state name or None if not found."""
        key = self.normalize(value)
        for s in self.states:
            if s.lower() == key:
                return s
        return None

    def resolve_season(self, value: str) -> str | None:
        """Return canonical season name or None if not found."""
        key = self.normalize(value)
        for s in self.seasons:
            if s.lower() == key:
                return s
        return None


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
crop_artifacts = CropArtifacts()
