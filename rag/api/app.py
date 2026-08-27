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
    RetrieveRequest,
    RetrieveResponse,
)
from rag.retrieval.models import FarmerProfile
from rag.retrieval.retriever import get_retriever

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
