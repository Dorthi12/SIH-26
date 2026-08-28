"""
rag/config.py — Centralised configuration for the RAG pipeline.

All settings are read from environment variables (or a .env file via python-dotenv).
Nothing is hardcoded here — callers import from this module.
"""

import os
from pathlib import Path

# Load .env if present (development convenience — production should inject env vars directly)
try:
    from dotenv import load_dotenv
    _env_file = Path(__file__).parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file)
except ImportError:
    pass  # python-dotenv is optional; env vars may be set by the OS/CI


# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------

EMBEDDING_MODEL: str = os.environ.get(
    "EMBEDDING_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
"""
Sentence Transformer model name or local path.
Default: paraphrase-multilingual-MiniLM-L12-v2
  - 384-dimensional embeddings
  - Handles English, Hindi, Hinglish and 50+ other languages
  - ~120 MB download; runs on CPU
Override with:  EMBEDDING_MODEL=intfloat/multilingual-e5-small
"""

EMBEDDING_BATCH_SIZE: int = int(os.environ.get("EMBEDDING_BATCH_SIZE", "64"))
"""Number of chunks to encode in a single SentenceTransformer batch."""


# ---------------------------------------------------------------------------
# Pinecone
# ---------------------------------------------------------------------------

PINECONE_API_KEY: str = os.environ.get("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME: str = os.environ.get("PINECONE_INDEX_NAME", "agrisense-govschemes")
PINECONE_NAMESPACE: str = os.environ.get("PINECONE_NAMESPACE", "government_schemes")
PINECONE_UPSERT_BATCH_SIZE: int = int(os.environ.get("PINECONE_UPSERT_BATCH_SIZE", "100"))


def require_pinecone_config() -> None:
    """Raise a clear error if Pinecone credentials are missing."""
    if not PINECONE_API_KEY:
        raise EnvironmentError(
            "PINECONE_API_KEY is not set.\n"
            "Copy rag/.env.example to rag/.env and fill in your credentials,\n"
            "or export PINECONE_API_KEY=<your-key> in your shell."
        )


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

CHUNK_TOKEN_SIZE: int = int(os.environ.get("CHUNK_TOKEN_SIZE", "400"))
"""Target chunk size in approximate tokens (1 token ≈ 4 characters)."""

CHUNK_OVERLAP_TOKENS: int = int(os.environ.get("CHUNK_OVERLAP_TOKENS", "75"))
"""Overlap between adjacent chunks in approximate tokens."""


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

# Default source directory — can be overridden via --source CLI flag
DEFAULT_SOURCE_DIR: Path = Path(__file__).parent.parent / "frontend" / "agrisense_government_documents"

# State database (SQLite) for re-ingestion tracking
STATE_DB_PATH: Path = Path(__file__).parent / "data" / "ingestion_state.db"


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

RAG_RETRIEVAL_TOP_K: int = int(os.environ.get("RAG_RETRIEVAL_TOP_K", "10"))
"""Number of candidates to fetch from Pinecone before re-ranking."""

RAG_FINAL_TOP_K: int = int(os.environ.get("RAG_FINAL_TOP_K", "5"))
"""Number of results returned to the caller after ranking + deduplication."""

RAG_SCHEME_MATCH_BONUS: float = float(os.environ.get("RAG_SCHEME_MATCH_BONUS", "0.15"))
"""Ranking bonus when a chunk's scheme_id matches the query's extracted scheme."""

RAG_STATE_MATCH_BONUS: float = float(os.environ.get("RAG_STATE_MATCH_BONUS", "0.10"))
"""Ranking bonus when a chunk's state matches the query's extracted state."""

RAG_OFFICIAL_SOURCE_BONUS: float = float(os.environ.get("RAG_OFFICIAL_SOURCE_BONUS", "0.08"))
"""Ranking bonus for chunks from official government sources."""

RAG_INTENT_SECTION_BONUS: float = float(os.environ.get("RAG_INTENT_SECTION_BONUS", "0.07"))
"""Ranking bonus when a chunk's section heading matches the detected intent."""

RAG_FRESHNESS_BONUS: float = float(os.environ.get("RAG_FRESHNESS_BONUS", "0.05"))
"""Max ranking bonus for document recency (scaled by published_date year)."""

RAG_API_HOST: str = os.environ.get("RAG_API_HOST", "0.0.0.0")
RAG_API_PORT: int = int(os.environ.get("RAG_API_PORT", "8001"))


# ---------------------------------------------------------------------------
# LLM / Generation
# ---------------------------------------------------------------------------

LLM_PROVIDER: str = os.environ.get("LLM_PROVIDER", "groq")
"""
LLM backend. Supported: 'groq' (default — same as Node backend).
Extensible: set LLM_PROVIDER=openai or LLM_PROVIDER=anthropic later.
"""

LLM_MODEL: str = os.environ.get("LLM_MODEL", "openai/gpt-oss-120b")
"""Model name within the chosen provider. Default: llama-3.3-70b-versatile (Groq)."""

LLM_API_KEY: str = os.environ.get("GROQ_API_KEY", os.environ.get("LLM_API_KEY", ""))
"""API key — reads GROQ_API_KEY first, falls back to LLM_API_KEY."""

LLM_TEMPERATURE: float = float(os.environ.get("LLM_TEMPERATURE", "0.2"))
"""Generation temperature. Low (0.2) = more deterministic, factual responses."""

LLM_MAX_TOKENS: int = int(os.environ.get("LLM_MAX_TOKENS", "1500"))
"""Maximum output tokens from the LLM."""

RAG_CONTEXT_TOP_K: int = int(os.environ.get("RAG_CONTEXT_TOP_K", "6"))
"""Number of top-ranked retrieval chunks to send to the LLM as context."""

RAG_MIN_RETRIEVAL_SCORE: float = float(os.environ.get("RAG_MIN_RETRIEVAL_SCORE", "0.25"))
"""
Minimum semantic similarity score for a chunk to be included in LLM context.
Chunks below this threshold are not sent to the LLM.
If no chunks meet this threshold, a safe no-context response is returned.
"""


def require_llm_config() -> None:
    """Raise a clear error if LLM credentials are missing."""
    if not LLM_API_KEY:
        raise EnvironmentError(
            "LLM API key is not set.\n"
            "Set GROQ_API_KEY in rag/.env or export it in your shell."
        )


# ---------------------------------------------------------------------------
# Eligibility Engine
# ---------------------------------------------------------------------------

ELIGIBILITY_MIN_RULE_CONFIDENCE: float = float(
    os.environ.get("ELIGIBILITY_MIN_RULE_CONFIDENCE", "0.70")
)
"""
Minimum confidence for an extracted eligibility rule condition to be used.
Conditions with confidence below this threshold are silently discarded.
"""

ELIGIBILITY_MAX_RULES_PER_SCHEME: int = int(
    os.environ.get("ELIGIBILITY_MAX_RULES_PER_SCHEME", "10")
)
"""Maximum number of retrieved chunks sent to the LLM for rule extraction per scheme."""

# Recommendation scoring weights (must sum to ≤ 1.0; remainder is unweighted)
ELIGIBILITY_WEIGHT_SEMANTIC:    float = float(os.environ.get("ELIGIBILITY_WEIGHT_SEMANTIC",    "0.30"))
ELIGIBILITY_WEIGHT_STATE:       float = float(os.environ.get("ELIGIBILITY_WEIGHT_STATE",       "0.20"))
ELIGIBILITY_WEIGHT_CROP:        float = float(os.environ.get("ELIGIBILITY_WEIGHT_CROP",        "0.15"))
ELIGIBILITY_WEIGHT_ELIGIBILITY: float = float(os.environ.get("ELIGIBILITY_WEIGHT_ELIGIBILITY", "0.20"))
ELIGIBILITY_WEIGHT_OFFICIAL:    float = float(os.environ.get("ELIGIBILITY_WEIGHT_OFFICIAL",    "0.10"))
ELIGIBILITY_WEIGHT_FRESHNESS:   float = float(os.environ.get("ELIGIBILITY_WEIGHT_FRESHNESS",   "0.05"))


# ---------------------------------------------------------------------------
# Conversational Layer
# ---------------------------------------------------------------------------

import os as _os
CONV_DB_PATH: str = _os.environ.get(
    "CONV_DB_PATH",
    str(Path(__file__).parent / "data" / "conversations.db"),
)
"""SQLite database file for conversation persistence."""

CONV_SUMMARY_THRESHOLD: int = int(_os.environ.get("CONV_SUMMARY_THRESHOLD", "10"))
"""Number of messages (user + assistant) before a summary is generated."""

CONV_RECENT_MESSAGE_WINDOW: int = int(_os.environ.get("CONV_RECENT_MESSAGE_WINDOW", "6"))
"""Number of recent messages included in every LLM context window."""

CONV_MAX_QUERY_LENGTH: int = int(_os.environ.get("CONV_MAX_QUERY_LENGTH", "1000"))
"""Maximum allowed query length in characters."""

CONV_ID_PREFIX: str = _os.environ.get("CONV_ID_PREFIX", "conv_")
"""Prefix for generated conversation IDs."""


# ---------------------------------------------------------------------------
# Evaluation Framework
# ---------------------------------------------------------------------------

RAG_ENABLE_LLM_EVALUATION: bool = _os.environ.get("RAG_ENABLE_LLM_EVALUATION", "false").lower() == "true"
"""Whether to use LLM-as-judge for faithfulness and answer relevance scoring."""

RAG_MIN_RECALL_AT_5: float = float(_os.environ.get("RAG_MIN_RECALL_AT_5", "0.75"))
"""Minimum Recall@5 threshold for regression testing."""

RAG_MIN_HIT_RATE: float = float(_os.environ.get("RAG_MIN_HIT_RATE", "0.80"))
"""Minimum Hit Rate@5 threshold for regression testing."""

RAG_MIN_CITATION_VALIDITY: float = float(_os.environ.get("RAG_MIN_CITATION_VALIDITY", "0.90"))
"""Minimum citation validity threshold for regression testing."""

RAG_MIN_FAITHFULNESS: float = float(_os.environ.get("RAG_MIN_FAITHFULNESS", "0.85"))
"""Minimum faithfulness threshold (only checked when LLM evaluation is enabled)."""

EVAL_RESULTS_DIR: str = _os.environ.get(
    "EVAL_RESULTS_DIR",
    str(Path(__file__).parent / "evaluation" / "results"),
)
"""Directory to store evaluation result JSON reports."""


# ---------------------------------------------------------------------------
# Hybrid Retrieval
# ---------------------------------------------------------------------------

HYBRID_RETRIEVAL_ENABLED: bool = _os.environ.get("HYBRID_RETRIEVAL_ENABLED", "false").lower() == "true"
"""Route through keyword+dense+rerank pipeline when True; dense-only when False."""

DENSE_TOP_K: int = int(_os.environ.get("DENSE_TOP_K", "20"))
"""Number of candidates to fetch from Pinecone in the dense retrieval step."""

KEYWORD_TOP_K: int = int(_os.environ.get("KEYWORD_TOP_K", "20"))
"""Number of candidates returned by the BM25 keyword retriever."""

RERANK_TOP_K: int = int(_os.environ.get("RERANK_TOP_K", "20"))
"""Number of fused candidates passed to the cross-encoder reranker."""

FINAL_CONTEXT_K: int = int(_os.environ.get("FINAL_CONTEXT_K", "6"))
"""Number of final chunks returned to the generation layer."""

RRF_K: int = int(_os.environ.get("RRF_K", "60"))
"""RRF smoothing constant k. Higher = less rank sensitivity."""

RERANKER_MODEL: str = _os.environ.get("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
"""HuggingFace model name for the cross-encoder reranker."""

RERANKER_ENABLED: bool = _os.environ.get("RERANKER_ENABLED", "true").lower() == "true"
"""If False, skip reranking and return RRF-fused candidates directly."""


# ---------------------------------------------------------------------------
# Production Safety & Observability
# ---------------------------------------------------------------------------

import os as _os2

RAG_REQUEST_TIMEOUT: int = int(_os2.environ.get("RAG_REQUEST_TIMEOUT", "30"))
"""Total per-request timeout in seconds."""

RAG_MAX_QUERY_LENGTH: int = int(_os2.environ.get("RAG_MAX_QUERY_LENGTH", "2000"))
"""Maximum allowed query length in characters."""

RAG_MAX_CONTEXT_CHUNKS: int = int(_os2.environ.get("RAG_MAX_CONTEXT_CHUNKS", "10"))
"""Hard ceiling on chunks passed to LLM context."""

RAG_LOG_LEVEL: str = _os2.environ.get("RAG_LOG_LEVEL", "INFO")
"""Python logging level string."""

RAG_RATE_LIMIT: str = _os2.environ.get("RAG_RATE_LIMIT", "60/minute")
"""Rate limit spec for RAG endpoints. Format: '<count>/<period>'."""

RAG_RETRIEVAL_TIMEOUT: int = int(_os2.environ.get("RAG_RETRIEVAL_TIMEOUT", "10"))
"""Pinecone retrieval timeout in seconds."""

RAG_GENERATION_TIMEOUT: int = int(_os2.environ.get("RAG_GENERATION_TIMEOUT", "25"))
"""LLM generation timeout in seconds."""

RAG_DEBUG: bool = _os2.environ.get("RAG_DEBUG", "false").lower() == "true"
"""If True, include latency breakdown and retrieval scores in responses."""

RAG_KNOWLEDGE_VERSION: str = _os2.environ.get("RAG_KNOWLEDGE_VERSION", "2026-08")
"""Knowledge-base version identifier included in eval reports and debug responses."""

RAG_MAX_LLM_CALLS_PER_REQUEST: int = int(_os2.environ.get("RAG_MAX_LLM_CALLS_PER_REQUEST", "2"))
"""Maximum LLM calls allowed per single request."""

RAG_CORS_ORIGINS: str = _os2.environ.get("RAG_CORS_ORIGINS", "*")
"""Comma-separated CORS origins, or '*' for development."""

GENERATION_PROMPT_VERSION: str = _os2.environ.get("GENERATION_PROMPT_VERSION", "v1")
"""Prompt version tag for generation prompts — included in debug logs."""

ELIGIBILITY_PROMPT_VERSION: str = _os2.environ.get("ELIGIBILITY_PROMPT_VERSION", "v1")
"""Prompt version tag for eligibility prompts."""

EVALUATION_PROMPT_VERSION: str = _os2.environ.get("EVALUATION_PROMPT_VERSION", "v1")
"""Prompt version tag for evaluation/judge prompts."""

CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = int(_os2.environ.get("CIRCUIT_BREAKER_FAILURE_THRESHOLD", "3"))
"""Consecutive failures before circuit opens."""

CIRCUIT_BREAKER_RESET_TIMEOUT: int = int(_os2.environ.get("CIRCUIT_BREAKER_RESET_TIMEOUT", "30"))
"""Seconds the circuit stays open before attempting half-open probe."""
