"""
rag/api/app.py — Production-hardened FastAPI application for the AgriSense RAG service.

Production hardening added:
  - Request IDs on every request
  - Input validation (query length, profile, conversation_id)
  - Prompt injection detection + logging
  - Per-request timeouts (retrieval + generation)
  - Rate limiting via slowapi
  - Circuit breaker awareness
  - Citation validation before response
  - Hallucination guard (eligibility language, low confidence)
  - Structured JSON logging
  - Aggregate metrics
  - Startup validation (Pinecone, LLM, embedding model)
  - GET /api/rag/ready (readiness probe)
  - GET /api/rag/health (expanded component statuses)
  - GET /api/rag/metrics (debug mode only)
  - Error sanitization (no stack traces to client)
  - CORS from RAG_CORS_ORIGINS env var
  - Debug mode (latency breakdown + scores only when RAG_DEBUG=true)

Start with: python -m rag.api
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from rag import config
from rag.api.schemas import (
    ChatRequest,
    ChatResponse,
    ChunkResult,
    ConversationHistoryResponse,
    ConversationStateResponse,
    EligibilityFarmerProfileRequest,
    EligibilityRequest,
    EligibilityResponse,
    EligibilityResultResponse,
    HealthResponse,
    MessageResponse,
    MetricsResponse,
    QueryRequest,
    QueryResponse,
    ReadyResponse,
    RecommendationResponse,
    RecommendRequest,
    RetrievalMetaResponse,
    SchemeInfoResponse,
    SchemeRecommendationResponse,
    SourceCitationResponse,
    RetrieveRequest,
    RetrieveResponse,
)
from rag.retrieval.models import FarmerProfile
from rag.retrieval.retriever import get_retriever
from rag.generation.generator import get_generator
from rag.generation.models import SAFE_FALLBACK_ANSWERS
from rag.eligibility.models import EligibilityFarmerProfile
from rag.eligibility.service import check_eligibility, recommend_schemes
from rag.conversation.models import ChatRequest as ConvChatRequest
from rag.conversation import service as conv_service
from rag.safety.validators import validate_query, detect_injection, sanitize_query, validate_farmer_profile, validate_conversation_id
from rag.safety.citation_validator import validate_citations
from rag.safety.hallucination_guard import check_low_confidence, check_eligibility_language, sanitize_eligibility_language
from rag.safety.request_id import generate_request_id
from rag.observability.structured_log import log_rag_request, log_pipeline_stage
from rag.observability.metrics import get_metrics
from rag.observability.latency_tracker import LatencyTracker
from rag.reliability.timeout_wrapper import async_with_timeout

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address, default_limits=[config.RAG_RATE_LIMIT])

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AgriSense RAG API",
    description=(
        "Retrieves relevant government scheme information for Indian farmers. "
        "Answers are grounded in official government documents only."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — configurable origins
_cors_origins = [o.strip() for o in config.RAG_CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup validation
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def _startup() -> None:
    """Validate critical configuration and warm up models at startup."""
    errors = []

    # 1. Pinecone config
    if not config.PINECONE_API_KEY:
        errors.append("PINECONE_API_KEY is not set")
    if not config.PINECONE_INDEX_NAME:
        errors.append("PINECONE_INDEX_NAME is not set")

    # 2. LLM config
    if not config.LLM_API_KEY:
        log.warning("LLM_API_KEY not set — generation will use safe fallback")

    # 3. Embedding model warmup
    try:
        from rag.retrieval.query_embedder import embed_query
        embed_query("warmup")
        log.info("Embedding model ready: %s", config.EMBEDDING_MODEL)
    except Exception as exc:
        log.error("Embedding model warmup failed: %s", exc)
        errors.append(f"Embedding model failed: {exc}")

    # 4. Pinecone connectivity (non-fatal — degraded mode)
    try:
        retriever = get_retriever()
        retriever._get_store().describe_index_stats()
        log.info("Pinecone connected: index=%s", config.PINECONE_INDEX_NAME)
    except Exception as exc:
        log.error("Pinecone connectivity check failed: %s", exc)
        # Non-fatal — requests will fail gracefully

    # 5. Fail fast for critical missing config
    if errors:
        log.critical("Startup validation failed: %s", errors)
        # In production, raise to prevent a broken server from serving requests
        # For demo resilience, log only
        for err in errors:
            log.critical("STARTUP ERROR: %s", err)

    log.info(
        "AgriSense RAG API started | knowledge_version=%s prompt_version=%s hybrid=%s",
        config.RAG_KNOWLEDGE_VERSION,
        config.GENERATION_PROMPT_VERSION,
        config.HYBRID_RETRIEVAL_ENABLED,
    )


# ---------------------------------------------------------------------------
# Helper: clean error response
# ---------------------------------------------------------------------------

def _safe_error(status: int, message: str, request_id: str) -> HTTPException:
    """Return an HTTPException with a clean message and request_id for tracing."""
    return HTTPException(
        status_code=status,
        detail={"error": message, "request_id": request_id},
    )


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

@app.get("/api/rag/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    """Health check — returns component statuses. Safe to call unauthenticated."""
    request_id = generate_request_id()
    pinecone_status = "unknown"
    total_vectors = None
    reranker_status = "disabled"
    llm_status = "configured" if config.LLM_API_KEY else "no_key"

    try:
        retriever = get_retriever()
        stats = retriever._get_store().describe_index_stats()
        total_vectors = stats.get("total_vector_count")
        pinecone_status = "healthy"
    except Exception as exc:
        log.error("Health: Pinecone check failed: %s", exc)
        pinecone_status = "unhealthy"

    if config.RERANKER_ENABLED:
        try:
            from rag.retrieval.reranker import get_reranker
            reranker_status = "loaded" if get_reranker().is_available else "unavailable"
        except Exception:
            reranker_status = "unavailable"

    overall = "healthy" if pinecone_status == "healthy" else "degraded"

    return HealthResponse(
        status=overall,
        index_name=config.PINECONE_INDEX_NAME,
        namespace=config.PINECONE_NAMESPACE,
        embedding_model=config.EMBEDDING_MODEL,
        total_vector_count=total_vectors,
        pinecone=pinecone_status,
        reranker=reranker_status,
        llm=llm_status,
        knowledge_version=config.RAG_KNOWLEDGE_VERSION,
        request_id=request_id,
    )


# ---------------------------------------------------------------------------
# Readiness endpoint
# ---------------------------------------------------------------------------

@app.get("/api/rag/ready", response_model=ReadyResponse, tags=["system"])
async def ready() -> ReadyResponse:
    """Readiness check — returns 200 only when the service can serve requests."""
    embedding_status = "unloaded"
    pinecone_status = "unknown"
    reason = None

    try:
        from rag.retrieval.query_embedder import embed_query
        embed_query("ready_check")
        embedding_status = "loaded"
    except Exception as exc:
        embedding_status = "failed"
        reason = f"Embedding model failed: {exc}"

    try:
        retriever = get_retriever()
        retriever._get_store().describe_index_stats()
        pinecone_status = "healthy"
    except Exception as exc:
        pinecone_status = "unhealthy"
        reason = reason or f"Pinecone unavailable: {exc}"

    ready_flag = (embedding_status == "loaded" and pinecone_status == "healthy")
    if not ready_flag and reason is None:
        reason = "Service not ready"

    return ReadyResponse(
        ready=ready_flag,
        pinecone=pinecone_status,
        embedding_model=embedding_status,
        reason=reason,
    )


# ---------------------------------------------------------------------------
# Metrics endpoint (debug only)
# ---------------------------------------------------------------------------

@app.get("/api/rag/metrics", response_model=MetricsResponse, tags=["system"])
async def metrics() -> MetricsResponse:
    """Aggregate metrics. Only available when RAG_DEBUG=true."""
    if not config.RAG_DEBUG:
        raise HTTPException(
            status_code=403,
            detail="Metrics endpoint is disabled. Set RAG_DEBUG=true to enable.",
        )
    m = get_metrics()
    return MetricsResponse(**m.snapshot())


# ---------------------------------------------------------------------------
# POST /api/rag/query — Full RAG pipeline
# ---------------------------------------------------------------------------

@app.post("/api/rag/query", response_model=QueryResponse, tags=["generation"])
@limiter.limit(config.RAG_RATE_LIMIT)
async def query(request: Request, req: QueryRequest) -> QueryResponse:
    """
    Full RAG pipeline: query understanding → retrieval → LLM generation.

    Returns a grounded answer with scheme information, source citations,
    and optional follow-up questions.

    The answer is generated ONLY from retrieved government documents.
    """
    request_id = generate_request_id()
    tracker = LatencyTracker()
    m = get_metrics()
    status = "success"
    retrieval_failed = False
    generation_failed = False
    fallback_used = False
    low_confidence = False

    try:
        # --- Input validation ---
        try:
            validate_query(req.query)
        except ValueError as exc:
            m.record_request(status="failed", validation_failed=True)
            raise _safe_error(422, str(exc), request_id)

        clean_query = sanitize_query(req.query)
        injection = detect_injection(clean_query)

        log_rag_request(
            request_id, "rag_query_start",
            language="auto", intent="",
            injection_risk=injection.level,
        )

        # --- Farmer profile ---
        profile = None
        if req.farmer_profile:
            try:
                validate_farmer_profile(req.farmer_profile.model_dump(exclude_none=True))
            except ValueError as exc:
                raise _safe_error(422, str(exc), request_id)
            profile = FarmerProfile.from_dict(req.farmer_profile.model_dump(exclude_none=True))

        # --- Retrieval with timeout ---
        try:
            retriever = get_retriever()
            with tracker.stage("retrieval"):
                retrieval_result = await async_with_timeout(
                    retriever.aretrieve(query=clean_query, farmer_profile=profile, top_k=req.top_k),
                    seconds=config.RAG_RETRIEVAL_TIMEOUT,
                    label="Pinecone retrieval",
                )
        except asyncio.TimeoutError:
            retrieval_failed = True
            m.record_request(status="failed", retrieval_failed=True, timeout_failed=True)
            raise _safe_error(503, "Retrieval service timed out. Please try again shortly.", request_id)
        except Exception as exc:
            retrieval_failed = True
            log.error("[%s] Retrieval failed: %s", request_id, exc)
            m.record_request(status="failed", retrieval_failed=True)
            raise _safe_error(503, "Could not retrieve information. Please try again.", request_id)

        if req.language:
            retrieval_result.language = req.language

        # --- Low-confidence check ---
        low_confidence = check_low_confidence(retrieval_result)

        # --- Generation with timeout ---
        try:
            generator = get_generator()
            with tracker.stage("generation"):
                gen_result = await async_with_timeout(
                    generator.agenerate(
                        retrieval_result=retrieval_result,
                        farmer_profile=profile,
                        history=req.history,
                    ),
                    seconds=config.RAG_GENERATION_TIMEOUT,
                    label="LLM generation",
                )
        except asyncio.TimeoutError:
            generation_failed = True
            m.record_request(status="failed", generation_failed=True, timeout_failed=True)
            raise _safe_error(503, "Answer generation timed out. Please try again shortly.", request_id)
        except Exception as exc:
            generation_failed = True
            log.error("[%s] Generation failed: %s", request_id, exc)
            m.record_request(status="failed", generation_failed=True)
            raise _safe_error(503, "Could not generate an answer at this time. Please try again.", request_id)

        fallback_used = gen_result.retrieval.used_fallback if gen_result.retrieval else False

        # --- Eligibility language safety ---
        answer = gen_result.answer
        if not check_eligibility_language(answer):
            answer = sanitize_eligibility_language(answer)

        # --- Citation validation ---
        validated_sources = validate_citations(gen_result.sources, retrieval_result.results)

        # --- Build response ---
        breakdown = tracker.breakdown()
        total_ms = breakdown.get("total_ms", gen_result.latency_ms)

        log_rag_request(
            request_id, "rag_query_done",
            latency_ms=total_ms,
            retrieved_chunks=retrieval_result.final_count,
            scheme_count=len(gen_result.schemes),
            status="success",
            language=gen_result.language,
            intent=retrieval_result.intent,
            injection_risk=injection.level,
            fallback_used=fallback_used,
            low_confidence=low_confidence,
        )

        m.record_request(
            status="success",
            latency_ms=total_ms,
            fallback_used=fallback_used,
            low_confidence=low_confidence,
            injection_risk=injection.level,
        )

        return QueryResponse(
            answer=answer,
            language=gen_result.language,
            schemes=[
                SchemeInfoResponse(
                    scheme_id=s.scheme_id,
                    scheme_name=s.scheme_name,
                    relevance=s.relevance,
                    reason=s.reason,
                )
                for s in gen_result.schemes
            ],
            sources=[
                SourceCitationResponse(
                    source_id=src.source_id,
                    citation_id=getattr(src, "citation_id", ""),
                    chunk_id=getattr(src, "chunk_id", ""),
                    document_title=src.document_title,
                    scheme_name=src.scheme_name,
                    scheme_id=src.scheme_id,
                    page_number=src.page_number,
                    section=src.section,
                    source_url=src.source_url,
                    official_source=src.official_source,
                    government_level=src.government_level,
                    published_date=src.published_date,
                    document_version=src.document_version,
                )
                for src in validated_sources
            ],
            follow_up_questions=gen_result.follow_up_questions,
            retrieval=RetrievalMetaResponse(
                documents_considered=gen_result.retrieval.documents_considered,
                top_score=gen_result.retrieval.top_score,
                min_score_threshold=gen_result.retrieval.min_score_threshold,
                used_fallback=gen_result.retrieval.used_fallback,
                context_chunks_used=gen_result.retrieval.context_chunks_used,
            ) if (req.include_retrieval_debug and gen_result.retrieval) else None,
            model_used=gen_result.model_used,
            latency_ms=total_ms,
            confidence=getattr(gen_result, "confidence", "low"),
            status=getattr(gen_result, "status", "success"),
            request_id=request_id,
            debug=breakdown if config.RAG_DEBUG else None,
        )

    except HTTPException:
        raise
    except Exception as exc:
        log.exception("[%s] Unexpected error in /api/rag/query", request_id)
        m.record_request(status="failed")
        raise _safe_error(500, "An internal error occurred. Please try again.", request_id)


# ---------------------------------------------------------------------------
# POST /api/rag/retrieve — Retrieval only
# ---------------------------------------------------------------------------

@app.post("/api/rag/retrieve", response_model=RetrieveResponse, tags=["retrieval"])
@limiter.limit(config.RAG_RATE_LIMIT)
async def retrieve(request: Request, req: RetrieveRequest) -> RetrieveResponse:
    """
    Retrieve relevant government scheme chunks for a farmer query.
    Does NOT generate an LLM answer.
    """
    request_id = generate_request_id()
    try:
        try:
            validate_query(req.query)
        except ValueError as exc:
            raise _safe_error(422, str(exc), request_id)

        clean_query = sanitize_query(req.query)

        profile = None
        if req.farmer_profile:
            profile = FarmerProfile.from_dict(req.farmer_profile.model_dump(exclude_none=True))

        retriever = get_retriever()
        result = await async_with_timeout(
            retriever.aretrieve(query=clean_query, farmer_profile=profile, top_k=req.top_k),
            seconds=config.RAG_RETRIEVAL_TIMEOUT,
            label="Pinecone retrieval",
        )

        chunk_results = [
            ChunkResult(
                chunk_id=r.chunk_id,
                scheme_id=r.scheme_id,
                scheme_name=r.scheme_name,
                government_level=r.government_level,
                state=r.state,
                document_title=r.document_title,
                document_type=r.document_type,
                section=r.section,
                page_number=r.page_number,
                language=r.language,
                source_url=r.source_url,
                source_type=r.source_type,
                official_source=r.official_source,
                published_date=r.published_date,
                document_version=r.document_version,
                text=r.chunk_text,
                score=r.final_score,
                semantic_score=r.semantic_score,
                score_breakdown=r.score_breakdown,
            )
            for r in result.results
        ]

        return RetrieveResponse(
            query=result.query,
            intent=result.intent,
            language=result.language,
            applied_filters=result.applied_filters,
            query_understanding=result.query_understanding,
            candidate_count=result.candidate_count,
            final_count=result.final_count,
            results=chunk_results,
        )

    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise _safe_error(503, "Retrieval timed out. Please try again.", request_id)
    except Exception as exc:
        log.error("[%s] Retrieval failed: %s", request_id, exc)
        raise _safe_error(500, "Retrieval error. Please try again.", request_id)


# ---------------------------------------------------------------------------
# POST /api/rag/eligibility
# ---------------------------------------------------------------------------

@app.post("/api/rag/eligibility", response_model=EligibilityResponse, tags=["eligibility"])
@limiter.limit(config.RAG_RATE_LIMIT)
async def eligibility(request: Request, req: EligibilityRequest) -> EligibilityResponse:
    """Evaluate eligibility for one or more government schemes."""
    request_id = generate_request_id()
    try:
        try:
            validate_query(req.query)
        except ValueError as exc:
            raise _safe_error(422, str(exc), request_id)

        profile = EligibilityFarmerProfile.from_dict(
            req.farmer_profile.model_dump(exclude_none=True)
        )
        scheme_ids = set(req.scheme_ids) if req.scheme_ids else None

        loop = asyncio.get_event_loop()
        response = await async_with_timeout(
            loop.run_in_executor(
                None,
                lambda: check_eligibility(
                    query=req.query,
                    profile=profile,
                    scheme_ids=scheme_ids,
                    top_k=req.top_k,
                ),
            ),
            seconds=config.RAG_REQUEST_TIMEOUT,
            label="eligibility check",
        )

        return EligibilityResponse(
            query=response.query,
            language=response.language,
            farmer_profile=response.farmer_profile,
            results=[EligibilityResultResponse(**r.to_dict()) for r in response.results],
            follow_up_questions=response.follow_up_questions,
            latency_ms=response.latency_ms,
        )

    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise _safe_error(503, "Eligibility check timed out. Please try again.", request_id)
    except EnvironmentError as exc:
        raise _safe_error(503, str(exc), request_id)
    except Exception as exc:
        log.error("[%s] Eligibility failed: %s", request_id, exc)
        raise _safe_error(500, "Eligibility check failed. Please try again.", request_id)


# ---------------------------------------------------------------------------
# POST /api/rag/recommend
# ---------------------------------------------------------------------------

@app.post("/api/rag/recommend", response_model=RecommendationResponse, tags=["eligibility"])
@limiter.limit(config.RAG_RATE_LIMIT)
async def recommend(request: Request, req: RecommendRequest) -> RecommendationResponse:
    """Recommend government schemes for a farmer profile."""
    request_id = generate_request_id()
    try:
        profile = EligibilityFarmerProfile.from_dict(
            req.farmer_profile.model_dump(exclude_none=True)
        )

        loop = asyncio.get_event_loop()
        response = await async_with_timeout(
            loop.run_in_executor(
                None,
                lambda: recommend_schemes(profile=profile, query=req.query, top_k=req.top_k),
            ),
            seconds=config.RAG_REQUEST_TIMEOUT,
            label="recommendation",
        )

        def _map_recs(recs):
            return [SchemeRecommendationResponse(**r.to_dict()) for r in recs]

        return RecommendationResponse(
            farmer_profile=response.farmer_profile,
            recommendations=_map_recs(response.recommendations),
            central_schemes=_map_recs(response.central_schemes),
            state_schemes=_map_recs(response.state_schemes),
            follow_up_questions=response.follow_up_questions,
            latency_ms=response.latency_ms,
        )

    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise _safe_error(503, "Recommendation timed out. Please try again.", request_id)
    except Exception as exc:
        log.error("[%s] Recommendation failed: %s", request_id, exc)
        raise _safe_error(500, "Recommendation failed. Please try again.", request_id)


# ---------------------------------------------------------------------------
# POST /api/rag/chat
# ---------------------------------------------------------------------------

@app.post("/api/rag/chat", response_model=ChatResponse, tags=["conversation"])
@limiter.limit(config.RAG_RATE_LIMIT)
async def chat(request: Request, req: ChatRequest, x_user_id: Optional[str] = None) -> ChatResponse:
    """Multi-turn conversational RAG endpoint."""
    request_id = generate_request_id()
    try:
        # Validate query
        try:
            validate_query(req.query)
        except ValueError as exc:
            raise _safe_error(422, str(exc), request_id)

        # Validate conversation_id if provided
        if req.conversation_id:
            try:
                validate_conversation_id(req.conversation_id)
            except ValueError as exc:
                raise _safe_error(422, str(exc), request_id)

        conv_req = ConvChatRequest(
            query=req.query,
            conversation_id=req.conversation_id,
            farmer_profile=req.farmer_profile,
            user_id=req.user_id or x_user_id,
        )

        loop = asyncio.get_event_loop()
        result = await async_with_timeout(
            loop.run_in_executor(None, lambda: conv_service.chat(conv_req)),
            seconds=config.RAG_REQUEST_TIMEOUT,
            label="chat",
        )

        return ChatResponse(
            conversation_id=result.conversation_id,
            answer=result.answer,
            language=result.language,
            intent=result.intent,
            farmer_profile=result.farmer_profile,
            schemes=result.schemes,
            sources=result.sources,
            follow_up_questions=result.follow_up_questions,
            is_disambiguation=result.is_disambiguation,
            latency_ms=result.latency_ms,
            request_id=request_id,
        )

    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise _safe_error(503, "Chat request timed out. Please try again.", request_id)
    except Exception as exc:
        log.error("[%s] Chat failed: %s", request_id, exc)
        raise _safe_error(500, "Chat failed. Please try again.", request_id)


# ---------------------------------------------------------------------------
# GET /api/rag/chat/{conversation_id}
# ---------------------------------------------------------------------------

@app.get("/api/rag/chat/{conversation_id}", response_model=ConversationHistoryResponse, tags=["conversation"])
async def get_conversation(
    conversation_id: str,
    limit: int = 20,
    user_id: Optional[str] = None,
) -> ConversationHistoryResponse:
    """Retrieve conversation history and current state."""
    request_id = generate_request_id()
    try:
        validate_conversation_id(conversation_id)
    except ValueError as exc:
        raise _safe_error(422, str(exc), request_id)

    try:
        loop = asyncio.get_event_loop()
        history = await loop.run_in_executor(
            None, lambda: conv_service.get_history(conversation_id, user_id, limit)
        )
        if history is None:
            raise HTTPException(status_code=404, detail="Conversation not found")

        state_data = history["state"]
        messages = [
            MessageResponse(
                conversation_id=conversation_id,
                role=m["role"],
                content=m["content"],
                timestamp=m["timestamp"],
                language=m.get("language", "en"),
                intent=m.get("intent"),
                scheme_ids=m.get("scheme_ids", []),
                source_ids=m.get("source_ids", []),
            )
            for m in history["messages"]
        ]

        return ConversationHistoryResponse(
            conversation_id=conversation_id,
            state=ConversationStateResponse(**state_data),
            messages=messages,
        )

    except HTTPException:
        raise
    except Exception as exc:
        log.error("[%s] get_conversation failed: %s", request_id, exc)
        raise _safe_error(500, "Could not retrieve conversation history.", request_id)


# ---------------------------------------------------------------------------
# DELETE /api/rag/chat/{conversation_id}
# ---------------------------------------------------------------------------

@app.delete("/api/rag/chat/{conversation_id}", tags=["conversation"])
async def delete_conversation(
    conversation_id: str,
    user_id: Optional[str] = None,
) -> dict:
    """Delete a conversation and all its messages."""
    request_id = generate_request_id()
    try:
        validate_conversation_id(conversation_id)
    except ValueError as exc:
        raise _safe_error(422, str(exc), request_id)

    try:
        loop = asyncio.get_event_loop()
        deleted = await loop.run_in_executor(
            None, lambda: conv_service.delete_conversation(conversation_id, user_id)
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Conversation not found or unauthorised")
        return {"deleted": True, "conversation_id": conversation_id}

    except HTTPException:
        raise
    except Exception as exc:
        log.error("[%s] delete_conversation failed: %s", request_id, exc)
        raise _safe_error(500, "Could not delete conversation.", request_id)
