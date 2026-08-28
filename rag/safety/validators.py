"""
rag/safety/validators.py — Request validation and prompt-injection detection.

Public API
----------
validate_query(query)                 → None (raises ValueError on failure)
detect_injection(query)               → InjectionRisk
sanitize_query(query)                 → str (trimmed/normalized)
validate_farmer_profile(profile_dict) → None (raises ValueError on failure)
validate_conversation_id(conv_id)     → None (raises ValueError on failure)
"""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from rag import config

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Injection patterns
# ---------------------------------------------------------------------------

_INJECTION_PATTERNS = [
    (re.compile(r"ignore\s+(your\s+)?(previous|all|above|prior)\s+(instructions?|rules?|context|system)", re.I), "high"),
    (re.compile(r"disregard\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|rules?)", re.I), "high"),
    (re.compile(r"forget\s+(everything|all|your|the)\s+(above|previous|instructions?|rules?|context)", re.I), "high"),
    (re.compile(r"you\s+are\s+now\s+a\s+", re.I), "high"),
    (re.compile(r"new\s+(persona|role|identity|instructions?)\s*:", re.I), "medium"),
    (re.compile(r"system\s+prompt\s*:", re.I), "medium"),
    (re.compile(r"<\s*system\s*>", re.I), "medium"),
    (re.compile(r"\[INST\]|\[SYS\]|###\s*instruction", re.I), "medium"),
    (re.compile(r"override\s+(all\s+)?(safety|rules?|instructions?|guidelines?)", re.I), "high"),
    (re.compile(r"pretend\s+(you\s+are|to\s+be)\s+", re.I), "low"),
    (re.compile(r"act\s+as\s+(if\s+you\s+(are|were)\s+)?a?\s*", re.I), "low"),
]


@dataclass
class InjectionRisk:
    """Result of prompt-injection detection."""
    detected: bool = False
    level: str = "none"   # "none" | "low" | "medium" | "high"
    reason: str = ""
    matched_pattern: str = ""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_query(query: str) -> None:
    """
    Validate a farmer query string.

    Raises
    ------
    ValueError with a user-friendly message on any violation.
    """
    if not query or not query.strip():
        raise ValueError("Query cannot be empty. Please enter your question.")

    if len(query) > config.RAG_MAX_QUERY_LENGTH:
        raise ValueError(
            f"Your question is too long. Please shorten it to under "
            f"{config.RAG_MAX_QUERY_LENGTH} characters and try again."
        )

    # Reject null bytes or control characters (except normal whitespace)
    cleaned = query.replace("\n", " ").replace("\t", " ").replace("\r", " ")
    for ch in cleaned:
        cat = unicodedata.category(ch)
        if cat == "Cc":  # control characters
            raise ValueError("Query contains invalid characters. Please remove special control characters.")


def detect_injection(query: str) -> InjectionRisk:
    """
    Scan query for prompt-injection patterns.

    Note: This does NOT block the request. The prompt architecture
    (System / User / Document separation) is the primary defence.
    This function only provides a risk signal for logging.
    """
    for pattern, level in _INJECTION_PATTERNS:
        m = pattern.search(query)
        if m:
            risk = InjectionRisk(
                detected=True,
                level=level,
                reason=f"Matched injection pattern: {pattern.pattern[:60]}",
                matched_pattern=m.group(0),
            )
            log.warning(
                "Prompt injection risk detected | level=%s pattern=%r snippet=%r",
                level, pattern.pattern[:40], m.group(0),
            )
            return risk

    return InjectionRisk(detected=False, level="none")


def sanitize_query(query: str) -> str:
    """
    Normalize whitespace and Unicode in query.

    Does NOT alter content or meaning — only trims and normalizes.
    """
    # Normalize Unicode (NFC form)
    q = unicodedata.normalize("NFC", query)
    # Normalize whitespace
    q = re.sub(r"[ \t\r]+", " ", q)
    q = re.sub(r"\n{3,}", "\n\n", q)
    return q.strip()


_VALID_LAND_UNITS = {"acres", "hectares", "bigha", "guntha", "cents", "sq_ft", "sq_m"}
_VALID_FARMER_TYPES = {"small", "marginal", "medium", "large", "tenant", "landless", "sharecropper"}
_VALID_GENDERS = {"male", "female", "other"}


def validate_farmer_profile(profile: Dict[str, Any]) -> None:
    """
    Validate a farmer profile dictionary.

    Raises ValueError with a user-friendly message on any violation.
    Accepts extra/unknown fields (they are ignored).
    """
    if not isinstance(profile, dict):
        raise ValueError("farmer_profile must be an object.")

    land_size = profile.get("land_size")
    if land_size is not None:
        try:
            ls = float(land_size)
            if ls < 0 or ls > 10000:
                raise ValueError("land_size must be between 0 and 10000.")
        except (TypeError, ValueError):
            raise ValueError("land_size must be a positive number.")

    land_unit = profile.get("land_unit")
    if land_unit and land_unit.lower() not in _VALID_LAND_UNITS:
        raise ValueError(
            f"Invalid land_unit '{land_unit}'. "
            f"Must be one of: {', '.join(sorted(_VALID_LAND_UNITS))}."
        )

    farmer_type = profile.get("farmer_type")
    if farmer_type and farmer_type.lower() not in _VALID_FARMER_TYPES:
        log.debug("Unknown farmer_type %r — accepted but not validated", farmer_type)

    age = profile.get("age")
    if age is not None:
        try:
            a = int(age)
            if a < 0 or a > 130:
                raise ValueError("age must be between 0 and 130.")
        except (TypeError, ValueError):
            raise ValueError("age must be a positive integer.")

    gender = profile.get("gender")
    if gender and gender.lower() not in _VALID_GENDERS:
        log.debug("Unknown gender %r — accepted but not validated", gender)


_CONV_ID_RE = re.compile(r"^conv_[a-zA-Z0-9_\-]{4,64}$")


def validate_conversation_id(conv_id: str) -> None:
    """
    Validate a conversation ID format.

    Valid: conv_<4-64 alphanumeric/underscore/hyphen chars>
    Raises ValueError if invalid.
    """
    if not conv_id or not isinstance(conv_id, str):
        raise ValueError("conversation_id must be a non-empty string.")

    if not _CONV_ID_RE.match(conv_id):
        raise ValueError(
            f"Invalid conversation_id format: {conv_id!r}. "
            "Expected format: conv_<identifier>."
        )
