"""
router.py — Root API v1 router for the unified Agriculture ML API.
Mounts all sub-routers: plant disease, crop recommendation, yield forecast,
and zero-production risk (Model 3 V3).
"""

from fastapi import APIRouter

from api.v1.disease import health as disease_health
from api.v1.disease import routes as disease_routes
from api.v1.crop import health as crop_health
from api.v1.crop import routes as crop_routes
from api.v1.crop import options as crop_options
from api.v1.yield_forecast import health as yield_health
from api.v1.yield_forecast import routes as yield_routes
from api.v1.zero_production import routes as zero_prod_routes

router = APIRouter()

# ── Model 5: Plant Disease Detection (EfficientNet-B0) ──────────────────────
router.include_router(disease_routes.router)
router.include_router(disease_health.router)

# ── Model 2: Crop Recommendation Engine ─────────────────────────────────────
router.include_router(crop_routes.router)
router.include_router(crop_health.router)
router.include_router(crop_options.router)

# ── Model 1: CatBoost Future Yield Forecaster ───────────────────────────────
router.include_router(yield_routes.router)
router.include_router(yield_health.router)

# ── Model 3 V3: Zero-Production Risk (CatBoost + Isotonic Calibrator) ───────
router.include_router(zero_prod_routes.router)
