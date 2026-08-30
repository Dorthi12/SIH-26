"""
image_validation.py — Multi-layer image validation before disease inference.

Validation order:
  1. File size
  2. File extension
  3. Actual decode (magic bytes / Pillow) — catches renamed executables
  4. Minimum resolution
  5. Maximum aspect ratio
  6. Near-blank / uniform quality gate
"""

import io
import logging
import statistics
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

from core.config import (
    ALLOWED_EXTENSIONS,
    MAX_ASPECT_RATIO,
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_MB,
    MIN_IMAGE_PIXELS,
)

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    valid:      bool
    error_code: str | None = None
    message:    str | None = None
    image:      Image.Image | None = None   # populated on success (RGB PIL Image)


def validate_image(filename: str, file_bytes: bytes) -> ValidationResult:
    """
    Run all validation checks and return a ValidationResult.
    On success, result.image contains the decoded RGB PIL Image.
    """
    # 1 — File size (belt-and-suspenders; nginx/load-balancer should also limit)
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return ValidationResult(
            valid=False,
            error_code="FILE_TOO_LARGE",
            message=f"File exceeds the maximum allowed size of {MAX_FILE_SIZE_MB} MB.",
        )

    # 2 — Extension whitelist
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return ValidationResult(
            valid=False,
            error_code="UNSUPPORTED_FORMAT",
            message=(
                f"Unsupported file type '{ext}'. "
                "Please upload a JPG, JPEG, PNG, or WebP image."
            ),
        )

    # 3 & 4 — Actual image decode (catches renamed non-images and corrupt files)
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()                              # detects truncated/corrupt data
        img = Image.open(io.BytesIO(file_bytes))  # re-open after verify()
        img = img.convert("RGB")                  # ensure 3-channel for inference
    except Exception as exc:
        logger.warning("Image decode failed for '%s': %s", filename, exc)
        return ValidationResult(
            valid=False,
            error_code="INVALID_IMAGE",
            message=(
                "The file could not be decoded as a valid image. "
                "Please upload a JPG, PNG, or WebP file."
            ),
        )

    # 5 — Minimum resolution
    w, h = img.size
    if w * h < MIN_IMAGE_PIXELS:
        return ValidationResult(
            valid=False,
            error_code="IMAGE_TOO_SMALL",
            message=(
                f"Image is too small ({w}×{h}). "
                "Please upload a higher-resolution photograph."
            ),
        )

    # 6 — Extreme aspect ratio (banners, strips, etc.)
    aspect = max(w, h) / min(w, h)
    if aspect > MAX_ASPECT_RATIO:
        return ValidationResult(
            valid=False,
            error_code="INVALID_ASPECT_RATIO",
            message=(
                f"Image has an unusual aspect ratio ({w}×{h}). "
                "Please upload a standard leaf photograph."
            ),
        )

    # 7 — Near-blank / solid-colour quality gate (very low pixel variance)
    pixels = list(img.convert("L").getdata())   # grayscale values
    if pixels:
        try:
            std = statistics.stdev(pixels)
        except statistics.StatisticsError:
            std = 0.0
        if std < 5.0:
            return ValidationResult(
                valid=False,
                error_code="IMAGE_TOO_UNIFORM",
                message=(
                    "The image appears to be blank or nearly uniform. "
                    "Please upload a clear photograph of the plant leaf."
                ),
            )

    return ValidationResult(valid=True, image=img)
