"""
rag/observability/latency_tracker.py — Per-request stage latency tracking.

Usage
-----
    tracker = LatencyTracker()
    with tracker.stage("embedding"):
        embed_query(...)
    with tracker.stage("pinecone"):
        store.query(...)
    breakdown = tracker.breakdown()
    # → {"embedding_ms": 12, "pinecone_ms": 340, "total_ms": 352}

Returned in response only when RAG_DEBUG=true.
"""

from __future__ import annotations

import time
from contextlib import contextmanager
from typing import Dict, Generator


class LatencyTracker:
    """
    Tracks wall-clock time for named pipeline stages.

    Thread-safe for single-request use (one tracker per request).
    """

    def __init__(self) -> None:
        self._stages: Dict[str, int] = {}
        self._request_start: float = time.perf_counter()

    @contextmanager
    def stage(self, name: str) -> Generator[None, None, None]:
        """Context manager that measures wall time for a named stage."""
        t0 = time.perf_counter()
        try:
            yield
        finally:
            elapsed_ms = int((time.perf_counter() - t0) * 1000)
            self._stages[f"{name}_ms"] = elapsed_ms

    def breakdown(self) -> Dict[str, int]:
        """
        Return stage timings plus total elapsed time.

        Keys: <stage_name>_ms for each measured stage, plus total_ms.
        """
        total = int((time.perf_counter() - self._request_start) * 1000)
        return {**self._stages, "total_ms": total}
