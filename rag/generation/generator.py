"""
rag/generation/generator.py — LLM generation orchestrator.

Pipeline:
  RetrievalResult
        ↓
  context_builder.build_context()   — structured SOURCE blocks
        ↓
  prompts.build_system_prompt()     — 17-rule strict system prompt
  prompts.build_user_message()      — query + context user turn
        ↓
  Groq API (llama-3.3-70b-versatile) — configurable provider
        ↓
  citation_builder.build_citations() — metadata-only citations
  citation_builder.extract_schemes() — scheme info
  citation_builder.build_follow_ups()
        ↓
  GenerationResult

Design decisions
----------------
- Provider is configurable via LLM_PROVIDER env var. Currently 'groq' is the
  only fully-implemented provider (same as the Node backend). Adding 'openai'
  or 'anthropic' means adding a new _call_<provider>() method below.
- LLM is NOT called when context is insufficient — safe fallback is returned.
- Temperature 0.2 — biased toward factual, deterministic outputs.
- Retry on transient errors (max 2 retries with 2s backoff).
- Logging: request ID, latency, chunk count, model — NO sensitive farmer data.

Public API
----------
get_generator()                      →  SchemeRAGGenerator (singleton)
generator.generate(...)              →  GenerationResult
generator.agenerate(...)             →  GenerationResult (async)
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Dict, List, Optional

from rag import config
from rag.generation.answer_classifier import classify_query_status
from rag.generation.citation_builder import build_citations, build_follow_ups, extract_schemes
from rag.generation.context_builder import build_context
from rag.generation.models import (
    GenerationResult,
    RetrievalMeta,
    SAFE_FALLBACK_ANSWERS,
    GENERATION_STATUS_SUCCESS,
    GENERATION_STATUS_INSUFFICIENT,
    GENERATION_STATUS_CLARIFICATION,
    GENERATION_STATUS_UNSUPPORTED,
    GENERATION_STATUS_ERROR,
    CONFIDENCE_HIGH, CONFIDENCE_MEDIUM, CONFIDENCE_LOW,
    compute_confidence,
)
from rag.generation.prompts import build_system_prompt, build_user_message, PROMPT_VERSION
from rag.retrieval.models import FarmerProfile, RetrievalResult
from rag.retrieval.query_understanding import understand

log = logging.getLogger(__name__)

_MAX_RETRIES = 2
_RETRY_DELAY = 2.0  # seconds


# ---------------------------------------------------------------------------
# Groq client factory
# ---------------------------------------------------------------------------

def _build_groq_client():
    """Build and return a Groq client. Raises if key is absent."""
    try:
        from groq import Groq
    except ImportError as exc:
        raise ImportError(
            "groq package not installed. Run: pip3 install groq"
        ) from exc

    if not config.LLM_API_KEY:
        raise EnvironmentError(
            "GROQ_API_KEY not set in rag/.env. "
            "Add your Groq API key to use the generation layer."
        )
    return Groq(api_key=config.LLM_API_KEY)


# ---------------------------------------------------------------------------
# LLM call dispatch
# ---------------------------------------------------------------------------

def _call_groq(
    client,
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    max_tokens: int,
) -> str:
    """Call Groq API and return the text response."""
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    content = response.choices[0].message.content
    return content.strip() if content else ""


def _call_llm_with_retry(
    client,
    messages: List[Dict[str, str]],
) -> str:
    """Call the LLM with exponential backoff on transient errors."""
    last_exc: Optional[Exception] = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            if config.LLM_PROVIDER == "groq":
                return _call_groq(
                    client, messages,
                    model=config.LLM_MODEL,
                    temperature=config.LLM_TEMPERATURE,
                    max_tokens=config.LLM_MAX_TOKENS,
                )
            else:
                raise ValueError(
                    f"Unsupported LLM_PROVIDER: {config.LLM_PROVIDER!r}. "
                    "Supported: 'groq'"
                )
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            if attempt < _MAX_RETRIES:
                log.warning(
                    "LLM call failed (attempt %d/%d): %s — retrying in %.1fs",
                    attempt + 1, _MAX_RETRIES + 1, exc, _RETRY_DELAY,
                )
                time.sleep(_RETRY_DELAY)
            else:
                log.error("LLM call failed after %d attempts: %s", _MAX_RETRIES + 1, exc)

    raise RuntimeError(f"LLM generation failed after {_MAX_RETRIES + 1} attempts: {last_exc}") from last_exc


# ---------------------------------------------------------------------------
# SchemeRAGGenerator
# ---------------------------------------------------------------------------

class SchemeRAGGenerator:
    """
    Orchestrates the generation step of the RAG pipeline.

    Use get_generator() to obtain the singleton instance.
    """

    def __init__(self) -> None:
        self._client = None  # lazy-initialised on first call

    def _get_client(self):
        if self._client is None:
            self._client = _build_groq_client()
        return self._client

    def generate(
        self,
        retrieval_result: RetrievalResult,
        farmer_profile: Optional[FarmerProfile] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> GenerationResult:
        """
        Generate a grounded answer from the retrieval result.

        Parameters
        ----------
        retrieval_result : Full RetrievalResult from the retrieval layer.
        farmer_profile   : Optional farmer profile for contextual personalisation.
        history          : Optional conversation history (list of {role, content}).

        Returns
        -------
        GenerationResult with structured answer, citations, and schemes.
        """
        request_id = str(uuid.uuid4())[:8]
        t_start = time.perf_counter()
        language = retrieval_result.language
        intent = retrieval_result.intent

        log.info(
            "[%s] Generating answer | intent=%s lang=%s prompt_version=%s",
            request_id, intent, language, PROMPT_VERSION,
        )

        # Step 0: Pre-generation status classification (no LLM)
        pre_status = classify_query_status(retrieval_result.query, retrieval_result)

        # Step 1: Build context
        context_str, included_chunks = build_context(retrieval_result)

        retrieval_meta = RetrievalMeta(
            documents_considered=retrieval_result.final_count,
            top_score=retrieval_result.results[0].semantic_score if retrieval_result.results else 0.0,
            min_score_threshold=config.RAG_MIN_RETRIEVAL_SCORE,
            used_fallback=len(included_chunks) == 0,
            context_chunks_used=len(included_chunks),
        )

        # Compute deterministic confidence from retrieval quality
        top_score = retrieval_result.results[0].semantic_score if retrieval_result.results else 0.0
        confidence = compute_confidence(top_score, len(included_chunks))

        # Step 2a: Clarification required — return without calling LLM
        if pre_status == GENERATION_STATUS_CLARIFICATION:
            log.info("[%s] Clarification required — returning disambiguation response", request_id)
            clarification_answers = {
                "en": (
                    "Could you please provide more details? For example:\n"
                    "- Which scheme are you asking about?\n"
                    "- What is your state and crop?\n"
                    "- How much land do you farm?"
                ),
                "hi": (
                    "कृपया अधिक जानकारी दें। उदाहरण के लिए:\n"
                    "- आप किस योजना के बारे में पूछ रहे हैं?\n"
                    "- आपका राज्य और फसल क्या है?\n"
                    "- आपके पास कितनी जमीन है?"
                ),
                "hinglish": (
                    "Thodi aur jankari dijiye. Jaise ki:\n"
                    "- Aap kaun si scheme ke baare mein pooch rahe hain?\n"
                    "- Aapka state aur fasal kya hai?\n"
                    "- Kitni zameen hai aapke paas?"
                ),
            }
            clarification_text = clarification_answers.get(language, clarification_answers["en"])
            latency_ms = int((time.perf_counter() - t_start) * 1000)
            return GenerationResult(
                answer=clarification_text,
                language=language,
                schemes=[],
                sources=[],
                follow_up_questions=[],
                retrieval=retrieval_meta,
                model_used="none (clarification)",
                latency_ms=latency_ms,
                confidence=CONFIDENCE_LOW,
                status=GENERATION_STATUS_CLARIFICATION,
            )

        # Step 2b: Unsupported scheme — return without calling LLM
        if pre_status == GENERATION_STATUS_UNSUPPORTED:
            log.info("[%s] Unsupported scheme — returning not-found response", request_id)
            unsupported_answers = {
                "en": (
                    "I couldn't find sufficient information about this scheme in the "
                    "government documents currently available to me. "
                    "Please check the official portal: https://agricoop.nic.in"
                ),
                "hi": (
                    "वर्तमान में उपलब्ध सरकारी दस्तावेज़ों में इस योजना के बारे में "
                    "पर्याप्त जानकारी नहीं मिली। "
                    "कृपया आधिकारिक पोर्टल देखें: https://agricoop.nic.in"
                ),
                "hinglish": (
                    "Is scheme ke baare mein available government documents mein "
                    "kaafi information nahi mili. "
                    "Kripya official portal check karein: https://agricoop.nic.in"
                ),
            }
            unsupported_text = unsupported_answers.get(language, unsupported_answers["en"])
            latency_ms = int((time.perf_counter() - t_start) * 1000)
            return GenerationResult(
                answer=unsupported_text,
                language=language,
                schemes=[],
                sources=[],
                follow_up_questions=[],
                retrieval=retrieval_meta,
                model_used="none (unsupported scheme)",
                latency_ms=latency_ms,
                confidence=CONFIDENCE_LOW,
                status=GENERATION_STATUS_UNSUPPORTED,
            )

        # Step 2c: No qualifying context — safe fallback without LLM call
        if not included_chunks:
            log.info("[%s] No qualifying context — returning safe fallback", request_id)
            fallback_answer = SAFE_FALLBACK_ANSWERS.get(language, SAFE_FALLBACK_ANSWERS["en"])
            latency_ms = int((time.perf_counter() - t_start) * 1000)
            return GenerationResult(
                answer=fallback_answer,
                language=language,
                schemes=[],
                sources=[],
                follow_up_questions=[],
                retrieval=retrieval_meta,
                model_used="none (safe fallback)",
                latency_ms=latency_ms,
                confidence=CONFIDENCE_LOW,
                status=GENERATION_STATUS_INSUFFICIENT,
            )

        # Step 3: Build prompt messages
        system_prompt = build_system_prompt(language, farmer_profile)
        user_message = build_user_message(
            query=retrieval_result.query,
            context_str=context_str,
            language=language,
            farmer_profile=farmer_profile,
        )

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

        # Inject conversation history (if any)
        if history:
            messages.extend(history)

        messages.append({"role": "user", "content": user_message})

        # Step 4: Call LLM
        try:
            client = self._get_client()
            answer_text = _call_llm_with_retry(client, messages)
        except EnvironmentError as exc:
            # No API key — return graceful degradation
            log.warning("[%s] LLM credentials unavailable: %s", request_id, exc)
            fallback = SAFE_FALLBACK_ANSWERS.get(language, SAFE_FALLBACK_ANSWERS["en"])
            latency_ms = int((time.perf_counter() - t_start) * 1000)
            return GenerationResult(
                answer=fallback,
                language=language,
                schemes=[],
                sources=build_citations(included_chunks),
                follow_up_questions=[],
                retrieval=retrieval_meta,
                model_used="none (no credentials)",
                latency_ms=latency_ms,
                confidence=CONFIDENCE_LOW,
                status=GENERATION_STATUS_INSUFFICIENT,
            )
        except RuntimeError as exc:
            log.error("[%s] LLM generation failed: %s", request_id, exc)
            raise

        # Step 5: Build citations and scheme info from retrieved metadata
        citations = build_citations(included_chunks)
        schemes = extract_schemes(included_chunks, intent, language)

        # Step 6: Build follow-up questions
        qu = understand(retrieval_result.query, farmer_profile)
        follow_ups = build_follow_ups(qu, retrieval_result, language)

        latency_ms = int((time.perf_counter() - t_start) * 1000)
        log.info(
            "[%s] Done | model=%s chunks=%d citations=%d confidence=%s latency=%dms",
            request_id, config.LLM_MODEL, len(included_chunks), len(citations),
            confidence, latency_ms,
        )

        return GenerationResult(
            answer=answer_text,
            language=language,
            schemes=schemes,
            sources=citations,
            follow_up_questions=follow_ups,
            retrieval=retrieval_meta,
            model_used=f"{config.LLM_PROVIDER}/{config.LLM_MODEL}",
            latency_ms=latency_ms,
            confidence=confidence,
            status=GENERATION_STATUS_SUCCESS,
        )

    async def agenerate(
        self,
        retrieval_result: RetrievalResult,
        farmer_profile: Optional[FarmerProfile] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> GenerationResult:
        """Async-safe wrapper — runs the synchronous pipeline in a thread pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: self.generate(retrieval_result, farmer_profile, history),
        )


# ---------------------------------------------------------------------------
# Singleton accessor
# ---------------------------------------------------------------------------

_generator_instance: Optional[SchemeRAGGenerator] = None


def get_generator() -> SchemeRAGGenerator:
    """Return the shared SchemeRAGGenerator instance."""
    global _generator_instance
    if _generator_instance is None:
        _generator_instance = SchemeRAGGenerator()
    return _generator_instance
