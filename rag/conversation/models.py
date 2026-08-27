"""
rag/conversation/models.py — Data models for the conversational layer.

All models use dataclasses with .to_dict() / from_dict() for SQLite serialisation.
No Pydantic dependency — these are pure Python.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Privacy: sensitive patterns that must never be stored in active state
# ---------------------------------------------------------------------------

_SENSITIVE_PATTERNS = [
    re.compile(r"\b\d{12}\b"),                  # 12-digit Aadhaar-like numbers
    re.compile(r"\b\d{9,18}\b"),                # bank account numbers
    re.compile(r"\botp\s*[:\-=]\s*\d+", re.I), # OTP values
    re.compile(r"password\s*[:\-=]", re.I),     # password fields
]


def _redact_sensitive(text: str) -> str:
    """Replace sensitive patterns in text with [REDACTED]."""
    for pat in _SENSITIVE_PATTERNS:
        text = pat.sub("[REDACTED]", text)
    return text


# ---------------------------------------------------------------------------
# Message model
# ---------------------------------------------------------------------------

@dataclass
class ConversationMessage:
    """A single message in the conversation (user or assistant)."""
    conversation_id: str
    role: str                    # "user" | "assistant"
    content: str
    timestamp: str               # ISO-8601
    language: str = "en"
    intent: Optional[str] = None
    scheme_ids: List[str] = field(default_factory=list)
    source_ids: List[str] = field(default_factory=list)

    @classmethod
    def user(cls, conv_id: str, content: str, language: str = "en") -> "ConversationMessage":
        return cls(
            conversation_id=conv_id,
            role="user",
            content=_redact_sensitive(content),
            timestamp=datetime.now(timezone.utc).isoformat(),
            language=language,
        )

    @classmethod
    def assistant(
        cls,
        conv_id: str,
        content: str,
        language: str = "en",
        intent: Optional[str] = None,
        scheme_ids: Optional[List[str]] = None,
        source_ids: Optional[List[str]] = None,
    ) -> "ConversationMessage":
        return cls(
            conversation_id=conv_id,
            role="assistant",
            content=content,
            timestamp=datetime.now(timezone.utc).isoformat(),
            language=language,
            intent=intent,
            scheme_ids=scheme_ids or [],
            source_ids=source_ids or [],
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Conversation state model
# ---------------------------------------------------------------------------

@dataclass
class ConversationState:
    """
    Structured state persisted across conversation turns.

    farmer_profile: accumulates explicitly stated profile fields.
    current_scheme: most recently focused scheme.
    recent_schemes: last N scheme_ids discussed (for reference resolution).
    last_intent: intent of the most recent assistant turn.
    language: most recent language detected.
    conversation_summary: LLM-generated summary of older turns.
    message_count: total messages (user + assistant) in this conversation.
    """
    conversation_id: str
    user_id: Optional[str] = None

    # Farmer profile — accumulated from explicit statements only
    farmer_profile: Dict[str, Any] = field(default_factory=dict)

    # Scheme context
    current_scheme: Optional[str] = None       # scheme_id
    current_scheme_name: Optional[str] = None  # human-readable
    recent_schemes: List[str] = field(default_factory=list)      # up to 5 scheme_ids
    recent_scheme_names: Dict[str, str] = field(default_factory=dict)  # id → name

    # Turn context
    last_intent: Optional[str] = None
    language: str = "en"

    # Memory
    conversation_summary: Optional[str] = None
    message_count: int = 0

    # Timestamps
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    # ---------------------------------------------------------------------------
    # Profile update — explicit values only, recency wins
    # ---------------------------------------------------------------------------

    # Fields we never infer from context (must be explicitly stated by farmer)
    _NEVER_INFER = frozenset({
        "aadhaar_available", "bank_account", "kisan_credit_card",
        "social_category", "income", "caste",
    })

    def update_profile(self, new_fields: Dict[str, Any], inferred: bool = False) -> None:
        """
        Merge new profile fields into the active farmer profile.

        Rules:
        - inferred=False (explicit): always overrides existing value for that field.
        - inferred=True: only sets if field not already in profile.
        - Never update fields in _NEVER_INFER via inference.
        """
        for key, value in new_fields.items():
            if value is None:
                continue
            if inferred and key in self._NEVER_INFER:
                continue
            if inferred and key in self.farmer_profile:
                continue  # explicit existing data wins over inference
            self.farmer_profile[key] = value

    def add_scheme(self, scheme_id: str, scheme_name: str) -> None:
        """Add a scheme to recent context. Keeps latest 5."""
        self.current_scheme = scheme_id
        self.current_scheme_name = scheme_name
        self.recent_scheme_names[scheme_id] = scheme_name
        if scheme_id not in self.recent_schemes:
            self.recent_schemes.insert(0, scheme_id)
        else:
            self.recent_schemes.remove(scheme_id)
            self.recent_schemes.insert(0, scheme_id)
        self.recent_schemes = self.recent_schemes[:5]

    def touch(self) -> None:
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "ConversationState":
        return cls(
            conversation_id=d["conversation_id"],
            user_id=d.get("user_id"),
            farmer_profile=d.get("farmer_profile", {}),
            current_scheme=d.get("current_scheme"),
            current_scheme_name=d.get("current_scheme_name"),
            recent_schemes=d.get("recent_schemes", []),
            recent_scheme_names=d.get("recent_scheme_names", {}),
            last_intent=d.get("last_intent"),
            language=d.get("language", "en"),
            conversation_summary=d.get("conversation_summary"),
            message_count=d.get("message_count", 0),
            created_at=d.get("created_at", datetime.now(timezone.utc).isoformat()),
            updated_at=d.get("updated_at", datetime.now(timezone.utc).isoformat()),
        )


# ---------------------------------------------------------------------------
# Resolved context (output of resolver)
# ---------------------------------------------------------------------------

@dataclass
class ResolvedContext:
    """
    The output of the conversation resolver for one turn.
    Tells the service what to run and with what profile.
    """
    enriched_query: str
    pipeline: str                         # "generation" | "eligibility" | "recommendation"
    resolved_scheme_id: Optional[str]
    resolved_scheme_name: Optional[str]
    is_ambiguous: bool
    ambiguous_schemes: List[str] = field(default_factory=list)
    updated_profile: Dict[str, Any] = field(default_factory=dict)
    detected_language: str = "en"
    detected_intent: Optional[str] = None


# ---------------------------------------------------------------------------
# Chat request / response
# ---------------------------------------------------------------------------

@dataclass
class ChatRequest:
    query: str
    conversation_id: Optional[str] = None
    farmer_profile: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "ChatRequest":
        return cls(
            query=d["query"],
            conversation_id=d.get("conversation_id"),
            farmer_profile=d.get("farmer_profile"),
            user_id=d.get("user_id"),
        )


@dataclass
class ChatResponse:
    conversation_id: str
    answer: str
    language: str
    intent: Optional[str]
    farmer_profile: Dict[str, Any]
    schemes: List[Dict[str, Any]] = field(default_factory=list)
    sources: List[Dict[str, Any]] = field(default_factory=list)
    follow_up_questions: List[str] = field(default_factory=list)
    is_disambiguation: bool = False
    latency_ms: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
