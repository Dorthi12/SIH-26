"""
api_key.py — API key dependency for protecting ML endpoints.

The backend must send `X-API-Key: <key>` in every request.
The ML service validates it against the ML_API_KEY environment variable.
"""

import os
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

_API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)
_ML_API_KEY = os.getenv("ML_API_KEY", "")


async def verify_api_key(api_key: str | None = Security(_API_KEY_HEADER)):
    """Dependency that rejects requests without a valid API key."""
    if not _ML_API_KEY:
        # If no key is configured, skip validation (dev mode)
        return
    if api_key != _ML_API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API key.",
        )
