"""
rag/api/schemas.py — Pydantic request/response schemas for the FastAPI endpoint.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FarmerProfileRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    crop: Optional[str] = None
    land_size: Optional[float] = None
    land_unit: Optional[str] = None
    farmer_type: Optional[str] = None

    model_config = {"extra": "ignore"}


class RetrieveRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="Farmer's natural-language query")
    farmer_profile: Optional[FarmerProfileRequest] = None
    top_k: Optional[int] = Field(default=None, ge=1, le=20)

    model_config = {"extra": "ignore"}


class ChunkResult(BaseModel):
    chunk_id: str
    scheme_id: str
    scheme_name: str
    government_level: str
    state: Optional[str]
    document_title: str
    document_type: str
    section: str
    page_number: int
    language: str
    source_url: str
    source_type: str
    official_source: bool
    published_date: Optional[str]
    document_version: Optional[str]
    text: str                    # chunk_text — renamed for API consumers
    score: float                 # final_score
    semantic_score: float
    score_breakdown: Dict[str, float]


class RetrieveResponse(BaseModel):
    query: str
    intent: str
    language: str
    applied_filters: Dict[str, Any]
    query_understanding: Dict[str, Any]
    candidate_count: int
    final_count: int
    results: List[ChunkResult]


class HealthResponse(BaseModel):
    status: str
    index_name: str
    namespace: str
    embedding_model: str
    total_vector_count: Optional[int] = None


# ---------------------------------------------------------------------------
# Generation layer schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    """Request body for POST /api/rag/query."""
    query: str = Field(..., min_length=1, max_length=500, description="Farmer's natural-language query")
    language: Optional[str] = Field(
        default=None,
        description="Override detected language: 'en' | 'hi' | 'hinglish'",
    )
    farmer_profile: Optional[FarmerProfileRequest] = None
    top_k: Optional[int] = Field(default=None, ge=1, le=20)
    context_top_k: Optional[int] = Field(
        default=None, ge=1, le=10,
        description="Max chunks to include in LLM context (default: RAG_CONTEXT_TOP_K)",
    )
    include_retrieval_debug: bool = Field(
        default=False,
        description="If true, include retrieval metadata in the response",
    )
    history: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Optional conversation history: list of {role, content}",
    )

    model_config = {"extra": "ignore"}


class SchemeInfoResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    relevance: str
    reason: str


class SourceCitationResponse(BaseModel):
    source_id: str
    document_title: str
    scheme_name: str
    scheme_id: str
    page_number: int
    section: str
    source_url: str
    official_source: bool
    government_level: str
    published_date: Optional[str]
    document_version: Optional[str]


class RetrievalMetaResponse(BaseModel):
    documents_considered: int
    top_score: float
    min_score_threshold: float
    used_fallback: bool
    context_chunks_used: int


class QueryResponse(BaseModel):
    """Response body for POST /api/rag/query."""
    answer: str
    language: str
    schemes: List[SchemeInfoResponse]
    sources: List[SourceCitationResponse]
    follow_up_questions: List[str]
    retrieval: Optional[RetrievalMetaResponse] = None
    model_used: str
    latency_ms: int
