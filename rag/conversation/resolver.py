"""
rag/conversation/resolver.py — Context resolution for multi-turn conversations.

Given the current query and conversation state, determines:
  - What the farmer is actually asking (resolving "it", "that scheme", "am I eligible?")
  - Which pipeline to run (generation / eligibility / recommendation)
  - Whether the query is ambiguous (multiple schemes, unclear which one)
  - The updated farmer profile (merging current-turn extractions into state)

No LLM calls — fully deterministic rule-based resolution.

Public API
----------
resolve(query, state, recent_messages)  →  ResolvedContext
"""

from __future__ import annotations

import logging
import re
from typing import Dict, List, Optional, Set

from conversation.models import ConversationMessage, ConversationState, ResolvedContext
from retrieval.query_understanding import understand
from retrieval.models import FarmerProfile

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Intent → Pipeline mapping
# ---------------------------------------------------------------------------

_ELIGIBILITY_INTENTS = {"eligibility"}
_RECOMMENDATION_INTENTS = {"scheme_recommendation", "subsidy"}
_GENERATION_INTENTS = {
    "benefits", "application_process", "required_documents",
    "crop_insurance", "financial_assistance", "crop_loss_assistance",
    "deadline", "general_information", "grievance",
}

# Phrases that signal reference to a previous scheme
_REFERENCE_PHRASES = [
    r"\b(this|that|the) scheme\b",
    r"\b(it|its)\b",
    r"\bthe (above|previous|mentioned) (scheme|program|yojana)\b",
    r"\bwahi\b",           # Hindi "same one"
    r"\bus (scheme|yojana)\b",  # Hinglish
    r"\biske\b", r"\buske\b",   # Hindi pronouns
]
_REFERENCE_RE = re.compile("|".join(_REFERENCE_PHRASES), re.I)

# Eligibility trigger phrases
_ELIGIBILITY_PHRASES = [
    r"\bam i eligible\b",
    r"\bkya main eligible\b",
    r"\bkya mujhe mil sakta\b",
    r"\bkya main le sakta\b",
    r"\bpatra hoon\b",
    r"\beligible hoon\b",
    r"\bkya main.*ke liye\b",
]
_ELIGIBILITY_RE = re.compile("|".join(_ELIGIBILITY_PHRASES), re.I)

# Recommendation trigger phrases
_RECOMMEND_PHRASES = [
    r"\bwhich schemes?\b",
    r"\bkaunsi scheme\b",
    r"\bkaunse schemes?\b",
    r"\bkya schemes?\b",
    r"\bsuggest\b",
    r"\brecommend\b",
    r"\bkonsi yojana\b",
    r"\bkoi scheme\b",
    r"\bschemes? (can|could|would|should) i\b",
    r"\bschemes? (ke liye|mil sakti|milegi)\b",
]
_RECOMMEND_RE = re.compile("|".join(_RECOMMEND_PHRASES), re.I)

# Fields we must NOT infer from vague context
_NEVER_INFER_FIELDS = {
    "aadhaar_available", "bank_account", "kisan_credit_card",
    "social_category", "income", "caste", "gender",
}


# ---------------------------------------------------------------------------
# Profile extractor from query understanding
# ---------------------------------------------------------------------------

def _extract_profile_from_query(
    query: str,
    current_profile: Dict,
) -> Dict:
    """
    Run query_understanding on the current message and extract new profile fields.
    Returns only the fields that were explicitly mentioned in THIS message.

    Critically: we run QU with an EMPTY profile so that it extracts only what
    the current message says, not what was carried over from a prior turn.
    """
    # Run QU with no prior profile — extract what THIS message explicitly says
    qu_fresh = understand(query, FarmerProfile())

    new_fields: Dict = {}

    # QueryUnderstanding exposes flat fields directly (no nested farmer_profile)
    for key in ("state", "district", "crop", "land_size", "land_unit", "farmer_type"):
        val = getattr(qu_fresh, key, None)
        if val is not None:
            new_fields[key] = val

    # Build crops list from crop
    if new_fields.get("crop"):
        new_fields["crops"] = [new_fields["crop"]]

    return new_fields


# ---------------------------------------------------------------------------
# Scheme reference resolver
# ---------------------------------------------------------------------------

def _resolve_scheme_reference(
    query: str,
    state: ConversationState,
) -> tuple[Optional[str], Optional[str]]:
    """
    Detect if the query references a previous scheme and resolve it.
    Returns (scheme_id, scheme_name) or (None, None).
    """
    q_lower = query.lower()

    # Direct name match in recent schemes
    for sid, sname in state.recent_scheme_names.items():
        if sname.lower() in q_lower or sid.replace("_", " ") in q_lower:
            return sid, sname

    # Pronoun / implicit reference → use current_scheme
    if _REFERENCE_RE.search(q_lower) and state.current_scheme:
        return state.current_scheme, state.current_scheme_name

    return None, None


# ---------------------------------------------------------------------------
# Pipeline selector
# ---------------------------------------------------------------------------

def _select_pipeline(
    intent: Optional[str],
    query: str,
    state: ConversationState,
) -> str:
    """
    Select which RAG pipeline to run based on intent + query signals.
    """
    q_lower = query.lower()

    # Explicit eligibility signals in query text (may override QU intent)
    if _ELIGIBILITY_RE.search(q_lower):
        return "eligibility"

    # Explicit recommendation signals
    if _RECOMMEND_RE.search(q_lower):
        return "recommendation"

    if intent in _ELIGIBILITY_INTENTS:
        return "eligibility"
    if intent in _RECOMMENDATION_INTENTS:
        return "recommendation"

    # If conversation has no profile at all yet, recommend
    if not state.farmer_profile and not intent:
        return "recommendation"

    return "generation"


# ---------------------------------------------------------------------------
# Ambiguity checker
# ---------------------------------------------------------------------------

def _check_ambiguity(
    pipeline: str,
    resolved_scheme_id: Optional[str],
    state: ConversationState,
) -> tuple[bool, List[str]]:
    """
    Check if the eligibility request is ambiguous (multiple schemes, none resolved).
    Returns (is_ambiguous, ambiguous_scheme_names).
    """
    if pipeline != "eligibility":
        return False, []

    # Single scheme resolved → not ambiguous
    if resolved_scheme_id:
        return False, []

    # Multiple recent schemes with no clear focus → ask
    if len(state.recent_schemes) > 1:
        names = [
            state.recent_scheme_names.get(sid, sid)
            for sid in state.recent_schemes[:5]
        ]
        return True, names

    return False, []


# ---------------------------------------------------------------------------
# Query enrichment
# ---------------------------------------------------------------------------

def _enrich_query(
    query: str,
    profile: Dict,
    resolved_scheme_name: Optional[str],
) -> str:
    """
    Append profile facts and resolved scheme to improve retrieval signal.
    Only appends facts not already in the query text.
    """
    q_lower = query.lower()
    additions = []

    state_val = profile.get("state")
    if state_val and state_val.lower() not in q_lower:
        additions.append(state_val)

    crop_val = profile.get("crop")
    if crop_val and crop_val.lower() not in q_lower:
        additions.append(f"{crop_val} farmer")

    land = profile.get("land_size")
    unit = profile.get("land_unit", "acre")
    if land and str(land) not in q_lower:
        additions.append(f"{land} {unit}")

    if resolved_scheme_name and resolved_scheme_name.lower() not in q_lower:
        additions.append(resolved_scheme_name)

    if additions:
        return f"{query} {' '.join(additions)}"
    return query


# ---------------------------------------------------------------------------
# Main resolver
# ---------------------------------------------------------------------------

def resolve(
    query: str,
    state: ConversationState,
    recent_messages: Optional[List[ConversationMessage]] = None,
) -> ResolvedContext:
    """
    Resolve the current query in the context of the conversation state.

    Steps:
    1. Extract profile fields from current query (explicit only)
    2. Build working profile (state + current-turn additions; current wins)
    3. Resolve scheme reference
    4. Detect intent and select pipeline
    5. Check for eligibility ambiguity
    6. Enrich query with profile context
    """
    # Step 1: Extract from current query
    new_profile_fields = _extract_profile_from_query(query, state.farmer_profile)

    # Run QU to get intent and language
    base_fp = FarmerProfile.from_dict(state.farmer_profile)
    qu = understand(query, base_fp)
    language = qu.language
    intent = qu.intent

    # Step 2: Working profile = state profile + current-turn explicit fields
    # Current message fields always override prior state
    working_profile = {**state.farmer_profile, **new_profile_fields}

    # Step 3: Resolve scheme reference
    resolved_scheme_id, resolved_scheme_name = _resolve_scheme_reference(query, state)

    # Step 4: Select pipeline
    pipeline = _select_pipeline(intent, query, state)

    # Step 5: Check ambiguity
    is_ambiguous, ambiguous_names = _check_ambiguity(pipeline, resolved_scheme_id, state)

    # Step 6: Enrich query
    enriched = _enrich_query(query, working_profile, resolved_scheme_name)

    log.debug(
        "Resolved: pipeline=%s scheme=%s ambiguous=%s intent=%s lang=%s new_profile_fields=%s",
        pipeline, resolved_scheme_id, is_ambiguous, intent, language, list(new_profile_fields.keys()),
    )

    return ResolvedContext(
        enriched_query=enriched,
        pipeline=pipeline,
        resolved_scheme_id=resolved_scheme_id,
        resolved_scheme_name=resolved_scheme_name,
        is_ambiguous=is_ambiguous,
        ambiguous_schemes=ambiguous_names,
        updated_profile=working_profile,
        detected_language=language,
        detected_intent=intent,
    )
