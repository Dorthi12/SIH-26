"""
rag/api/schemas.py — Pydantic request/response schemas for the FastAPI endpoint.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from rag import config


class FarmerProfileRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    crop: Optional[str] = None
    land_size: Optional[float] = None
    land_unit: Optional[str] = None
    farmer_type: Optional[str] = None

    model_config = {"extra": "ignore"}


class RetrieveRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=config.RAG_MAX_QUERY_LENGTH, description="Farmer's natural-language query")
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
    # Component statuses
    pinecone: str = "unknown"
    reranker: str = "unknown"
    llm: str = "unknown"
    knowledge_version: str = config.RAG_KNOWLEDGE_VERSION
    request_id: Optional[str] = None


class ReadyResponse(BaseModel):
    ready: bool
    pinecone: str
    embedding_model: str
    reason: Optional[str] = None


class MetricsResponse(BaseModel):
    """Debug-only: aggregate metrics. Never exposed to farmers."""
    total_requests: int
    successful_requests: int
    failed_requests: int
    retrieval_failures: int
    generation_failures: int
    citation_failures: int
    validation_failures: int
    timeout_failures: int
    fallback_count: int
    low_confidence_count: int
    injection_risk_count: int
    rate_limit_count: int
    avg_latency_ms: int
    p95_latency_ms: int
    latency_samples: int
    input_tokens: int
    output_tokens: int
    llm_calls: int


# ---------------------------------------------------------------------------
# Generation layer schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    """Request body for POST /api/rag/query."""
    query: str = Field(..., min_length=1, max_length=config.RAG_MAX_QUERY_LENGTH, description="Farmer's natural-language query")
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
    request_id: Optional[str] = None
    debug: Optional[Dict[str, Any]] = None  # latency breakdown, only when RAG_DEBUG=true

# ---------------------------------------------------------------------------
# Eligibility + Recommendation schemas
# ---------------------------------------------------------------------------

class EligibilityFarmerProfileRequest(BaseModel):
    """Full farmer profile for eligibility checks (14 fields, all optional)."""
    state: Optional[str] = None
    district: Optional[str] = None
    land_size: Optional[float] = None
    land_unit: Optional[str] = None
    land_ownership: Optional[str] = None
    crop: Optional[str] = None
    crops: Optional[List[str]] = None
    farmer_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    social_category: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    bank_account: Optional[bool] = None
    aadhaar_available: Optional[bool] = None
    kisan_credit_card: Optional[bool] = None
    crop_insurance_status: Optional[str] = None

    model_config = {"extra": "ignore"}


class EligibilityRequest(BaseModel):
    """Request body for POST /api/rag/eligibility."""
    query: str = Field(..., min_length=1, max_length=500)
    farmer_profile: EligibilityFarmerProfileRequest = Field(...)
    scheme_ids: Optional[List[str]] = Field(
        default=None,
        description="Optional: limit evaluation to specific scheme IDs",
    )
    top_k: Optional[int] = Field(default=None, ge=1, le=30)

    model_config = {"extra": "ignore"}


class ConditionResultResponse(BaseModel):
    condition: str
    operator: str
    expected: Any
    farmer_value: Any
    status: str
    reason: str
    evidence: Optional[Dict[str, Any]] = None


class EligibilityResultResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    government_level: str
    status: str
    matched_conditions: List[Dict[str, Any]]
    failed_conditions: List[Dict[str, Any]]
    missing_information: List[str]
    evidence: List[Dict[str, Any]]
    conflict_warning: Optional[str]
    rules_used: int
    explanation: str


class EligibilityResponse(BaseModel):
    """Response body for POST /api/rag/eligibility."""
    query: str
    language: str
    farmer_profile: Dict[str, Any]
    results: List[EligibilityResultResponse]
    follow_up_questions: List[str]
    latency_ms: int


class RecommendRequest(BaseModel):
    """Request body for POST /api/rag/recommend."""
    farmer_profile: EligibilityFarmerProfileRequest = Field(...)
    query: Optional[str] = Field(
        default=None,
        description="Optional natural-language query to improve retrieval signal",
    )
    top_k: Optional[int] = Field(default=None, ge=1, le=30)

    model_config = {"extra": "ignore"}


class SchemeRecommendationResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    government_level: str
    state: Optional[str]
    relevance_score: float
    eligibility_status: str
    reasons: List[str]
    sources: List[Dict[str, Any]]
    score_breakdown: Dict[str, float]


class RecommendationResponse(BaseModel):
    """Response body for POST /api/rag/recommend."""
    farmer_profile: Dict[str, Any]
    recommendations: List[SchemeRecommendationResponse]
    central_schemes: List[SchemeRecommendationResponse]
    state_schemes: List[SchemeRecommendationResponse]
    follow_up_questions: List[str]
    latency_ms: int


# ---------------------------------------------------------------------------
# Conversation / Chat schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Request body for POST /api/rag/chat."""
    query: str = Field(..., min_length=1, max_length=1000, description="The farmer's message")
    conversation_id: Optional[str] = Field(
        default=None,
        description="Existing conversation ID. Omit to start a new conversation.",
    )
    farmer_profile: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional explicit profile override for this turn.",
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional user ID for conversation scoping.",
    )

    model_config = {"extra": "ignore"}


class ChatSchemeResponse(BaseModel):
    scheme_id: Optional[str] = None
    scheme_name: Optional[str] = None
    status: Optional[str] = None
    relevance_score: Optional[float] = None
    eligibility_status: Optional[str] = None
    government_level: Optional[str] = None
    reasons: Optional[List[str]] = None
    score_breakdown: Optional[Dict[str, float]] = None

    model_config = {"extra": "allow"}


class ChatResponse(BaseModel):
    """Response body for POST /api/rag/chat."""
    conversation_id: str
    answer: str
    language: str
    intent: Optional[str] = None
    farmer_profile: Dict[str, Any]
    schemes: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    follow_up_questions: List[str] = []
    is_disambiguation: bool = False
    latency_ms: int = 0
    request_id: Optional[str] = None


class MessageResponse(BaseModel):
    conversation_id: str
    role: str
    content: str
    timestamp: str
    language: str = "en"
    intent: Optional[str] = None
    scheme_ids: List[str] = []
    source_ids: List[str] = []

    model_config = {"extra": "allow"}


class ConversationStateResponse(BaseModel):
    farmer_profile: Dict[str, Any]
    current_scheme: Optional[str] = None
    current_scheme_name: Optional[str] = None
    recent_schemes: List[str] = []
    last_intent: Optional[str] = None
    language: str = "en"
    message_count: int = 0
    conversation_summary: Optional[str] = None
    created_at: str
    updated_at: str


class ConversationHistoryResponse(BaseModel):
    """Response body for GET /api/rag/chat/{conversation_id}."""
    conversation_id: str
    state: ConversationStateResponse
    messages: List[MessageResponse]
