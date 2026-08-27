"""
rag/api/app.py — FastAPI application for the RAG retrieval service.

Endpoints
---------
POST /api/rag/retrieve   — main retrieval endpoint
GET  /api/rag/health     — health check + index stats

Start with:  python -m rag.api
Or directly: uvicorn rag.api.app:app --host 0.0.0.0 --port 8001
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
    QueryRequest,
    QueryResponse,
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

log = logging.getLogger(__name__)

app = FastAPI(
    title="AgriSense RAG Retrieval API",
    description=(
        "Retrieves relevant government scheme chunks from Pinecone "
        "for a farmer's natural-language query. Does NOT generate LLM answers."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: warm up the embedding model and Pinecone connection
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def _startup() -> None:
    log.info("Warming up embedding model…")
    try:
        from rag.retrieval.query_embedder import embed_query
        embed_query("warmup")
        log.info("Embedding model ready.")
    except Exception as exc:  # noqa: BLE001
        log.error("Embedding model warmup failed: %s", exc)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/rag/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    """Health check — returns index stats if Pinecone is reachable."""
    try:
        retriever = get_retriever()
        stats = retriever._get_store().describe_index_stats()
        return HealthResponse(
            status="ok",
            index_name=config.PINECONE_INDEX_NAME,
            namespace=config.PINECONE_NAMESPACE,
            embedding_model=config.EMBEDDING_MODEL,
            total_vector_count=stats.get("total_vector_count"),
        )
    except Exception as exc:
        log.error("Health check failed: %s", exc)
        return HealthResponse(
            status="degraded",
            index_name=config.PINECONE_INDEX_NAME,
            namespace=config.PINECONE_NAMESPACE,
            embedding_model=config.EMBEDDING_MODEL,
        )


@app.post("/api/rag/query", response_model=QueryResponse, tags=["generation"])
async def query(
    req: QueryRequest,
) -> QueryResponse:
    """
    Full RAG pipeline: query understanding → retrieval → LLM generation.

    Returns a grounded answer with scheme information, source citations,
    and optional follow-up questions.

    The answer is generated ONLY from retrieved government documents.
    No general LLM knowledge is used for government-policy facts.
    """
    try:
        # Build farmer profile
        profile = None
        if req.farmer_profile:
            profile = FarmerProfile.from_dict(req.farmer_profile.model_dump(exclude_none=True))

        # Step 1: Retrieve
        retriever = get_retriever()
        retrieval_result = await retriever.aretrieve(
            query=req.query,
            farmer_profile=profile,
            top_k=req.top_k,
        )

        # Override language if explicitly provided
        if req.language:
            retrieval_result.language = req.language

        # Step 2: Generate
        generator = get_generator()
        gen_result = await generator.agenerate(
            retrieval_result=retrieval_result,
            farmer_profile=profile,
            history=req.history,
        )

        # Step 3: Map to response schema
        return QueryResponse(
            answer=gen_result.answer,
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
                for src in gen_result.sources
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
            latency_ms=gen_result.latency_ms,
        )

    except EnvironmentError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except RuntimeError as exc:
        log.exception("Generation failed for query: %r", req.query)
        raise HTTPException(status_code=500, detail=f"Generation error: {exc}")
    except Exception as exc:
        log.exception("Unexpected error for query: %r", req.query)
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")

@app.post("/api/rag/retrieve", response_model=RetrieveResponse, tags=["retrieval"])
async def retrieve(req: RetrieveRequest) -> RetrieveResponse:
    """
    Retrieve relevant government scheme chunks for a farmer query.

    - Understands the query (language, intent, entities).
    - Embeds using the same Sentence Transformer as ingestion.
    - Queries Pinecone with metadata filtering.
    - Returns ranked, deduplicated chunks with full provenance.

    Does NOT generate an LLM answer — that is the generation layer's responsibility.
    """
    try:
        # Build farmer profile from request
        profile = None
        if req.farmer_profile:
            profile = FarmerProfile.from_dict(req.farmer_profile.model_dump(exclude_none=True))

        # Run retrieval (async-safe via thread pool)
        retriever = get_retriever()
        result = await retriever.aretrieve(
            query=req.query,
            farmer_profile=profile,
            top_k=req.top_k,
        )

        # Map internal model → API schema
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

    except EnvironmentError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        log.exception("Retrieval failed for query: %r", req.query)
        raise HTTPException(status_code=500, detail=f"Retrieval error: {exc}")


# ---------------------------------------------------------------------------
# Eligibility endpoint
# ---------------------------------------------------------------------------

@app.post("/api/rag/eligibility", response_model=EligibilityResponse, tags=["eligibility"])
async def eligibility(
    req: EligibilityRequest,
) -> EligibilityResponse:
    """
    Evaluate eligibility for one or more government schemes.

    Runs: retrieval → LLM rule extraction → deterministic evaluation.
    Returns per-scheme ELIGIBLE / INELIGIBLE / INSUFFICIENT_INFORMATION.
    All rules are grounded in retrieved government documents.
    """
    import asyncio
    try:
        profile = EligibilityFarmerProfile.from_dict(
            req.farmer_profile.model_dump(exclude_none=True)
        )
        scheme_ids = set(req.scheme_ids) if req.scheme_ids else None

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: check_eligibility(
                query=req.query,
                profile=profile,
                scheme_ids=scheme_ids,
                top_k=req.top_k,
            ),
        )

        return EligibilityResponse(
            query=response.query,
            language=response.language,
            farmer_profile=response.farmer_profile,
            results=[
                EligibilityResultResponse(**r.to_dict())
                for r in response.results
            ],
            follow_up_questions=response.follow_up_questions,
            latency_ms=response.latency_ms,
        )

    except EnvironmentError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        log.exception("Eligibility check failed for query: %r", req.query)
        raise HTTPException(status_code=500, detail=f"Eligibility error: {exc}")


# ---------------------------------------------------------------------------
# Recommendation endpoint
# ---------------------------------------------------------------------------

@app.post("/api/rag/recommend", response_model=RecommendationResponse, tags=["eligibility"])
async def recommend(
    req: RecommendRequest,
) -> RecommendationResponse:
    """
    Recommend government schemes for a farmer profile.

    Returns ranked schemes (central + state) with eligibility status and
    transparent scoring breakdown.
    """
    import asyncio
    try:
        profile = EligibilityFarmerProfile.from_dict(
            req.farmer_profile.model_dump(exclude_none=True)
        )

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: recommend_schemes(
                profile=profile,
                query=req.query,
                top_k=req.top_k,
            ),
        )

        def _map_recs(recs):
            return [
                SchemeRecommendationResponse(**r.to_dict())
                for r in recs
            ]

        return RecommendationResponse(
            farmer_profile=response.farmer_profile,
            recommendations=_map_recs(response.recommendations),
            central_schemes=_map_recs(response.central_schemes),
            state_schemes=_map_recs(response.state_schemes),
            follow_up_questions=response.follow_up_questions,
            latency_ms=response.latency_ms,
        )

    except EnvironmentError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        log.exception("Recommendation failed")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {exc}")


# ---------------------------------------------------------------------------
# Conversational chat endpoints
# ---------------------------------------------------------------------------

@app.post("/api/rag/chat", response_model=ChatResponse, tags=["conversation"])
async def chat(
    req: ChatRequest,
    x_user_id: Optional[str] = None,
) -> ChatResponse:
    """
    Multi-turn conversational RAG endpoint.

    Send a query with an optional conversation_id to continue an existing
    conversation. Omit conversation_id to start a new one.

    Accumulates farmer profile across turns, resolves references to previous
    schemes, and routes to the appropriate RAG pipeline.
    """
    import asyncio
    from fastapi import Header
    try:
        # Validate query length
        if len(req.query) > config.CONV_MAX_QUERY_LENGTH:
            raise HTTPException(
                status_code=422,
                detail=f"Query too long. Maximum {config.CONV_MAX_QUERY_LENGTH} characters.",
            )

        conv_req = ConvChatRequest(
            query=req.query,
            conversation_id=req.conversation_id,
            farmer_profile=req.farmer_profile,
            user_id=req.user_id or x_user_id,
        )

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, lambda: conv_service.chat(conv_req))

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
        )

    except HTTPException:
        raise
    except Exception as exc:
        log.exception("Chat failed for conv_id=%r", req.conversation_id)
        raise HTTPException(status_code=500, detail=f"Chat error: {exc}")


@app.get("/api/rag/chat/{conversation_id}", response_model=ConversationHistoryResponse, tags=["conversation"])
async def get_conversation(
    conversation_id: str,
    limit: int = 20,
    user_id: Optional[str] = None,
) -> ConversationHistoryResponse:
    """
    Retrieve conversation history and current state.

    Returns recent messages (up to `limit`) and the structured state
    (farmer profile, current scheme, language, summary).
    Does NOT return internal system prompts.
    """
    import asyncio
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
        log.exception("get_conversation failed for %r", conversation_id)
        raise HTTPException(status_code=500, detail=f"History error: {exc}")


@app.delete("/api/rag/chat/{conversation_id}", tags=["conversation"])
async def delete_conversation(
    conversation_id: str,
    user_id: Optional[str] = None,
) -> dict:
    """
    Delete a conversation and all its messages.
    Does NOT delete the underlying government document knowledge base.
    """
    import asyncio
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
        log.exception("delete_conversation failed for %r", conversation_id)
        raise HTTPException(status_code=500, detail=f"Delete error: {exc}")
