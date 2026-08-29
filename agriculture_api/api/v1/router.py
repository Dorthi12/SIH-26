"""
router.py — Root API v1 router.
Mounts all sub-routers for disease and crop models.
"""

from fastapi import APIRouter

from api.v1.disease import health as disease_health
from api.v1.disease import routes as disease_routes
from api.v1.crop import health as crop_health
from api.v1.crop import routes as crop_routes
from api.v1.crop import options as crop_options

router = APIRouter()

# Plant Disease (Model 5)
router.include_router(disease_routes.router)
router.include_router(disease_health.router)

# Crop Recommendation (Model 2)
router.include_router(crop_routes.router)
router.include_router(crop_health.router)
router.include_router(crop_options.router)
