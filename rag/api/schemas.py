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
