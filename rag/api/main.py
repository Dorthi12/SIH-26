"""
rag/api/main.py — Uvicorn entry point.
Run: python -m rag.api
"""

import logging
import uvicorn
from rag import config

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s | %(name)s | %(message)s",
)

if __name__ == "__main__":
    uvicorn.run(
        "rag.api.app:app",
        host=config.RAG_API_HOST,
        port=config.RAG_API_PORT,
        reload=False,
        log_level="info",
    )
