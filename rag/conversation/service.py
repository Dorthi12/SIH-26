"""
rag/conversation/service.py — Conversational RAG orchestrator.

Implements the full multi-turn conversation pipeline:

  load state → resolve context → route pipeline → run RAG → update state → persist

Public API
----------
chat(request)                       → ChatResponse
get_history(conv_id, user_id, limit)→ dict
delete_conversation(conv_id, user_id)→ bool
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Any, Dict, List, Optional

from rag import config
from rag.conversation.models import (
    ChatRequest,
    ChatResponse,
    ConversationMessage,
    ConversationState,
    ResolvedContext,
)
from rag.conversation.resolver import resolve
from rag.conversation.state import get_store
from rag.conversation.summarizer import should_summarize, summarize
from rag.eligibility.models import EligibilityFarmerProfile
from rag.eligibility.service import check_eligibility, recommend_schemes
from rag.generation.generator import get_generator
from rag.retrieval.models import FarmerProfile
from rag.retrieval.retriever import get_retriever

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Disambiguation responses
# ---------------------------------------------------------------------------

_DISAMBIGUATION_TEMPLATES = {
    "en": "I'd be happy to check your eligibility. You've recently discussed: {schemes}. Which scheme would you like me to evaluate?",
    "hi": "मैं पात्रता जाँचने में मदद करूँगा। आपने हाल ही में इन योजनाओं के बारे में पूछा: {schemes}। आप किस योजना के लिए जाँचना चाहते हैं?",
    "hinglish": "Main eligibility check karne mein madad karoonga. Aapne recently {schemes} ke baare mein baat ki. Aap kis scheme ke liye check karna chahte hain?",
}


def _disambiguation_answer(schemes: List[str], language: str) -> str:
    template = _DISAMBIGUATION_TEMPLATES.get(language, _DISAMBIGUATION_TEMPLATES["en"])
    scheme_list = ", ".join(schemes)
    return template.format(schemes=scheme_list)


# ---------------------------------------------------------------------------
# Context window builder
# ---------------------------------------------------------------------------

def _build_llm_context(
    state: ConversationState,
    recent_messages: List[ConversationMessage],
    current_query: str,
) -> str:
    """
    Build the conversation context to pass alongside the query.
    Uses: [summary] + recent N messages (not the full history).
    """
    parts = []

    if state.conversation_summary:
        parts.append(f"[Conversation so far]: {state.conversation_summary}")

    for msg in recent_messages:
        role = "Farmer" if msg.role == "user" else "Assistant"
        parts.append(f"{role}: {msg.content}")

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Profile helpers
# ---------------------------------------------------------------------------

def _profile_dict_to_eligibility(profile_dict: Dict) -> EligibilityFarmerProfile:
    return EligibilityFarmerProfile.from_dict(profile_dict)


def _profile_dict_to_base(profile_dict: Dict) -> FarmerProfile:
    return FarmerProfile(
        state=profile_dict.get("state"),
        district=profile_dict.get("district"),
        crop=profile_dict.get("crop"),
        land_size=profile_dict.get("land_size"),
        land_unit=profile_dict.get("land_unit"),
        farmer_type=profile_dict.get("farmer_type"),
    )


# ---------------------------------------------------------------------------
# State updater after a pipeline response
# ---------------------------------------------------------------------------

def _update_state_from_response(
    state: ConversationState,
    ctx: ResolvedContext,
    response_schemes: List[Dict],
    language: str,
    intent: Optional[str],
) -> None:
    """
    Apply the results of a pipeline response to the conversation state.
    """
    # Update language (latest wins)
    state.language = language

    # Update intent
    state.last_intent = intent or ctx.detected_intent

    # Update profile from resolved context (explicit fields from current message)
    state.update_profile(ctx.updated_profile, inferred=False)

    # Register schemes from response
    for scheme in response_schemes:
        sid = scheme.get("scheme_id", "")
        sname = scheme.get("scheme_name", sid)
        if sid:
            state.add_scheme(sid, sname)

    # If resolver already identified a scheme, ensure it's registered
    if ctx.resolved_scheme_id and ctx.resolved_scheme_name:
        state.add_scheme(ctx.resolved_scheme_id, ctx.resolved_scheme_name)

    state.message_count += 2  # user + assistant


# ---------------------------------------------------------------------------
# Main service functions
# ---------------------------------------------------------------------------

def chat(request: ChatRequest) -> ChatResponse:
    """
    Process one conversational turn. Full pipeline:

    1. Load / create conversation state
    2. Merge explicit farmer_profile from request
    3. Resolve context (references, profile updates, pipeline selection)
    4. Return disambiguation immediately if ambiguous
    5. Run appropriate pipeline (generation / eligibility / recommendation)
    6. Update state, persist messages, run summarizer if needed
    7. Return ChatResponse
    """
    request_id = str(uuid.uuid4())[:8]
    t_start = time.perf_counter()
    store = get_store()

    log.info(
        "[%s] Chat | conv=%s query=%r",
        request_id, request.conversation_id, request.query[:60],
    )

    # ------------------------------------------------------------------
    # Step 1: Load or create conversation
    # ------------------------------------------------------------------
    if request.conversation_id:
        state = store.load_state(request.conversation_id, request.user_id)
        if state is None:
            # Not found — create new (don't error; allow conversation_id to seed a new one)
            log.warning("[%s] Conversation %s not found — creating new", request_id, request.conversation_id)
            state = store.create_conversation(request.user_id)
            # Use the requested ID if it matches our prefix format
            if request.conversation_id.startswith(config.CONV_ID_PREFIX):
                state.conversation_id = request.conversation_id
                store.save_state(state)
    else:
        state = store.create_conversation(request.user_id)

    conv_id = state.conversation_id

    # ------------------------------------------------------------------
    # Step 2: Merge explicit farmer_profile override from request
    # ------------------------------------------------------------------
    if request.farmer_profile:
        state.update_profile(request.farmer_profile, inferred=False)

    # ------------------------------------------------------------------
    # Step 3: Load recent messages for context window
    # ------------------------------------------------------------------
    recent_messages = store.get_messages(conv_id, limit=config.CONV_RECENT_MESSAGE_WINDOW)

    # ------------------------------------------------------------------
    # Step 4: Resolve context
    # ------------------------------------------------------------------
    ctx = resolve(request.query, state, recent_messages)

    # ------------------------------------------------------------------
    # Step 5: Disambiguation
    # ------------------------------------------------------------------
    if ctx.is_ambiguous:
        answer = _disambiguation_answer(ctx.ambiguous_schemes, ctx.detected_language)
        _persist_turn(store, state, request, answer, ctx, [], [], ctx.detected_language)
        latency = int((time.perf_counter() - t_start) * 1000)
        return ChatResponse(
            conversation_id=conv_id,
            answer=answer,
            language=ctx.detected_language,
            intent="eligibility",
            farmer_profile=state.farmer_profile,
            is_disambiguation=True,
            latency_ms=latency,
        )

    # ------------------------------------------------------------------
    # Step 6: Run pipeline
    # ------------------------------------------------------------------
    schemes_out: List[Dict] = []
    sources_out: List[Dict] = []
    follow_ups: List[str] = []
    answer = ""
    intent_out = ctx.detected_intent
    lang_out = ctx.detected_language

    profile_elig = _profile_dict_to_eligibility(ctx.updated_profile)

    if ctx.pipeline == "eligibility":
        scheme_ids = {ctx.resolved_scheme_id} if ctx.resolved_scheme_id else None
        resp = check_eligibility(
            query=ctx.enriched_query,
            profile=profile_elig,
            scheme_ids=scheme_ids,
        )
        follow_ups = resp.follow_up_questions
        lang_out = resp.language

        # Build a readable answer from eligibility results
        answer_parts = []
        for r in resp.results:
            answer_parts.append(f"**{r.scheme_name}**: {r.explanation}")
            schemes_out.append({
                "scheme_id": r.scheme_id,
                "scheme_name": r.scheme_name,
                "status": r.status.value if hasattr(r.status, "value") else r.status,
            })
            for ev in r.evidence:
                if hasattr(ev, "to_dict"):
                    sources_out.append(ev.to_dict())
        answer = "\n\n".join(answer_parts) if answer_parts else (
            "I could not find sufficient eligibility information in the available documents."
        )
        intent_out = "eligibility"

    elif ctx.pipeline == "recommendation":
        resp = recommend_schemes(profile=profile_elig, query=ctx.enriched_query)
        follow_ups = resp.follow_up_questions
        lang_out = ctx.detected_language

        answer_parts = []
        for rec in resp.recommendations[:5]:
            status = rec.eligibility_status.value if hasattr(rec.eligibility_status, "value") else rec.eligibility_status
            reasons = "; ".join(rec.reasons[:2])
            answer_parts.append(f"**{rec.scheme_name}** ({rec.government_level.capitalize()}) — {status}. {reasons}")
            schemes_out.append(rec.to_dict())
            sources_out.extend(rec.sources[:1])
        answer = "\n\n".join(answer_parts) if answer_parts else (
            "No specific scheme recommendations could be found for your profile."
        )
        intent_out = "scheme_recommendation"

    else:  # generation
        retriever = get_retriever()
        retrieval = retriever.retrieve(
            query=ctx.enriched_query,
            farmer_profile=_profile_dict_to_base(ctx.updated_profile),
        )

        # Build lightweight history for the generator (role + content only)
        history_for_gen = [
            {"role": m.role, "content": m.content}
            for m in recent_messages
        ]

        generator = get_generator()
        gen_result = generator.generate(
            retrieval_result=retrieval,
            farmer_profile=_profile_dict_to_base(ctx.updated_profile),
            history=history_for_gen or None,
        )
        answer = gen_result.answer
        lang_out = gen_result.language
        follow_ups = gen_result.follow_up_questions
        schemes_out = [s.__dict__ if hasattr(s, "__dict__") else s for s in gen_result.schemes]
        sources_out = [c.__dict__ if hasattr(c, "__dict__") else c for c in gen_result.sources]
        intent_out = ctx.detected_intent

    # ------------------------------------------------------------------
    # Step 7: Update state + persist
    # ------------------------------------------------------------------
    _update_state_from_response(state, ctx, schemes_out, lang_out, intent_out)
    _persist_turn(store, state, request, answer, ctx, schemes_out, sources_out, lang_out, follow_ups)

    # Summarize if threshold reached
    if should_summarize(state):
        all_messages = store.get_messages(conv_id, limit=state.message_count)
        state.conversation_summary = summarize(state, all_messages)
        store.save_state(state)

    latency = int((time.perf_counter() - t_start) * 1000)
    log.info(
        "[%s] Chat done | conv=%s pipeline=%s latency=%dms",
        request_id, conv_id, ctx.pipeline, latency,
    )

    return ChatResponse(
        conversation_id=conv_id,
        answer=answer,
        language=lang_out,
        intent=intent_out,
        farmer_profile=state.farmer_profile,
        schemes=schemes_out,
        sources=sources_out,
        follow_up_questions=follow_ups,
        is_disambiguation=False,
        latency_ms=latency,
    )


def _persist_turn(
    store,
    state: ConversationState,
    request: ChatRequest,
    answer: str,
    ctx: ResolvedContext,
    schemes: List[Dict],
    sources: List[Dict],
    language: str,
    follow_ups: Optional[List[str]] = None,
) -> None:
    """Persist the user message, assistant message, and updated state."""
    user_msg = ConversationMessage.user(state.conversation_id, request.query, language)
    asst_msg = ConversationMessage.assistant(
        state.conversation_id,
        answer,
        language=language,
        intent=ctx.detected_intent,
        scheme_ids=[s.get("scheme_id", "") for s in schemes if s.get("scheme_id")],
        source_ids=[],
    )
    store.append_message(user_msg)
    store.append_message(asst_msg)
    store.save_state(state)


def get_history(
    conversation_id: str,
    user_id: Optional[str] = None,
    limit: int = 20,
) -> Optional[Dict]:
    """
    Return conversation history and current state.
    Returns None if conversation not found.
    """
    store = get_store()
    state = store.load_state(conversation_id, user_id)
    if state is None:
        return None

    messages = store.get_messages(conversation_id, limit=limit)

    return {
        "conversation_id": conversation_id,
        "state": {
            "farmer_profile": state.farmer_profile,
            "current_scheme": state.current_scheme,
            "current_scheme_name": state.current_scheme_name,
            "recent_schemes": state.recent_schemes,
            "last_intent": state.last_intent,
            "language": state.language,
            "message_count": state.message_count,
            "conversation_summary": state.conversation_summary,
            "created_at": state.created_at,
            "updated_at": state.updated_at,
        },
        "messages": [m.to_dict() for m in messages],
    }


def delete_conversation(
    conversation_id: str,
    user_id: Optional[str] = None,
) -> bool:
    """Delete a conversation and all its messages. Returns True if deleted."""
    store = get_store()
    return store.delete_conversation(conversation_id, user_id)
