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
