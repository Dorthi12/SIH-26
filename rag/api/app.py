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

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from rag import config
from rag.api.schemas import (
    ChunkResult,
    HealthResponse,
    QueryRequest,
    QueryResponse,
    RetrievalMetaResponse,
    SchemeInfoResponse,
    SourceCitationResponse,
    RetrieveRequest,
    RetrieveResponse,
)
from rag.retrieval.models import FarmerProfile
from rag.retrieval.retriever import get_retriever
from rag.generation.generator import get_generator
from rag.generation.models import SAFE_FALLBACK_ANSWERS

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
