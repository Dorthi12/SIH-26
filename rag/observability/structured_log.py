"""
rag/observability/structured_log.py — Structured JSON logging for the RAG pipeline.

Emits JSON log lines for key pipeline events. Never logs API keys,
Aadhaar numbers, bank account numbers, OTPs, or passwords.

Public API
----------
log_rag_request(request_id, event, latency_ms, ...)  → None
log_pipeline_stage(request_id, stage, latency_ms)    → None
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

log = logging.getLogger("rag.observability")

# Fields that must never appear in logs
_SENSITIVE_FIELDS = frozenset({
    "api_key", "apikey", "secret", "password", "passwd",
    "aadhaar", "aadhar", "bank_account", "account_number",
    "otp", "pin", "token", "auth",
})


def _scrub(data: dict) -> dict:
    """Remove sensitive keys recursively."""
    cleaned = {}
    for k, v in data.items():
        if k.lower() in _SENSITIVE_FIELDS:
            cleaned[k] = "***REDACTED***"
        elif isinstance(v, dict):
            cleaned[k] = _scrub(v)
        else:
            cleaned[k] = v
    return cleaned


def log_rag_request(
    request_id: str,
    event: str,
    *,
    latency_ms: int = 0,
    retrieved_chunks: int = 0,
    scheme_count: int = 0,
    status: str = "success",
    language: str = "en",
    intent: str = "",
    injection_risk: str = "none",
    fallback_used: bool = False,
    low_confidence: bool = False,
    **extra: Any,
) -> None:
    """
    Emit a structured log line for a RAG request event.

    Parameters are safe for production logging (no sensitive data).
    """
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "request_id": request_id,
        "event": event,
        "latency_ms": latency_ms,
        "retrieved_chunks": retrieved_chunks,
        "scheme_count": scheme_count,
        "status": status,
        "language": language,
        "intent": intent,
        "injection_risk": injection_risk,
        "fallback_used": fallback_used,
        "low_confidence": low_confidence,
    }
    if extra:
        record.update(_scrub({k: v for k, v in extra.items()}))

    log.info(json.dumps(record, ensure_ascii=False))


def log_pipeline_stage(
    request_id: str,
    stage: str,
    latency_ms: int,
    **extra: Any,
) -> None:
    """Emit a structured log line for an individual pipeline stage."""
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "request_id": request_id,
        "event": "pipeline_stage",
        "stage": stage,
        "latency_ms": latency_ms,
    }
    if extra:
        record.update(_scrub(extra))
    log.debug(json.dumps(record, ensure_ascii=False))
