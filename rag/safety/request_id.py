"""
rag/safety/request_id.py — Request ID generation and logging context.

Public API
----------
generate_request_id()   → str   e.g. "req_8f31ab2c"
"""

from __future__ import annotations

import secrets


def generate_request_id() -> str:
    """
    Generate a unique request ID.

    Format: req_<8 lowercase hex characters>
    Example: req_8f31ab2c

    Uses cryptographically secure random bytes (secrets module).
    Suitable for logging, debugging, and error tracing.
    """
    return "req_" + secrets.token_hex(4)
