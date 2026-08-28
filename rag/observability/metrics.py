"""
rag/observability/metrics.py — In-memory aggregate metrics for the RAG pipeline.

Thread-safe counters and latency tracking. No external infrastructure required.
Exposed via GET /api/rag/metrics (debug mode only — never to farmers).

Public API
----------
get_metrics()           → Metrics (singleton)
metrics.record_request(status, latency_ms, ...)
metrics.snapshot()      → dict
metrics.reset()         → None  (for testing)
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class Metrics:
    """Thread-safe in-memory metrics store."""

    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    # Request counters
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0

    # Failure type counters
    retrieval_failures: int = 0
    generation_failures: int = 0
    citation_failures: int = 0
    validation_failures: int = 0
    timeout_failures: int = 0

    # Quality counters
    fallback_count: int = 0
    low_confidence_count: int = 0
    injection_risk_count: int = 0
    rate_limit_count: int = 0

    # Latency tracking (milliseconds)
    _latencies: List[int] = field(default_factory=list, repr=False)

    # Token tracking
    input_tokens: int = 0
    output_tokens: int = 0
    llm_calls: int = 0

    def record_request(
        self,
        *,
        status: str = "success",
        latency_ms: int = 0,
        retrieval_failed: bool = False,
        generation_failed: bool = False,
        citation_failed: bool = False,
        validation_failed: bool = False,
        timeout_failed: bool = False,
        fallback_used: bool = False,
        low_confidence: bool = False,
        injection_risk: str = "none",
        input_tokens: int = 0,
        output_tokens: int = 0,
        llm_calls: int = 0,
    ) -> None:
        with self._lock:
            self.total_requests += 1
            if status == "success":
                self.successful_requests += 1
            else:
                self.failed_requests += 1

            if retrieval_failed:
                self.retrieval_failures += 1
            if generation_failed:
                self.generation_failures += 1
            if citation_failed:
                self.citation_failures += 1
            if validation_failed:
                self.validation_failures += 1
            if timeout_failed:
                self.timeout_failures += 1
            if fallback_used:
                self.fallback_count += 1
            if low_confidence:
                self.low_confidence_count += 1
            if injection_risk != "none":
                self.injection_risk_count += 1

            if latency_ms > 0:
                self._latencies.append(latency_ms)
                # Keep only last 1000 for memory safety
                if len(self._latencies) > 1000:
                    self._latencies = self._latencies[-1000:]

            self.input_tokens += input_tokens
            self.output_tokens += output_tokens
            self.llm_calls += llm_calls

    def record_rate_limit(self) -> None:
        with self._lock:
            self.rate_limit_count += 1

    def snapshot(self) -> dict:
        """Return a snapshot of all metrics. Safe to serialize to JSON."""
        with self._lock:
            lats = sorted(self._latencies)
            n = len(lats)
            avg = int(sum(lats) / n) if n else 0
            p95 = lats[int(n * 0.95)] if n >= 20 else (lats[-1] if lats else 0)

            return {
                "total_requests": self.total_requests,
                "successful_requests": self.successful_requests,
                "failed_requests": self.failed_requests,
                "retrieval_failures": self.retrieval_failures,
                "generation_failures": self.generation_failures,
                "citation_failures": self.citation_failures,
                "validation_failures": self.validation_failures,
                "timeout_failures": self.timeout_failures,
                "fallback_count": self.fallback_count,
                "low_confidence_count": self.low_confidence_count,
                "injection_risk_count": self.injection_risk_count,
                "rate_limit_count": self.rate_limit_count,
                "avg_latency_ms": avg,
                "p95_latency_ms": p95,
                "latency_samples": n,
                "input_tokens": self.input_tokens,
                "output_tokens": self.output_tokens,
                "llm_calls": self.llm_calls,
            }

    def reset(self) -> None:
        """Reset all metrics. Use in tests only."""
        with self._lock:
            self.total_requests = 0
            self.successful_requests = 0
            self.failed_requests = 0
            self.retrieval_failures = 0
            self.generation_failures = 0
            self.citation_failures = 0
            self.validation_failures = 0
            self.timeout_failures = 0
            self.fallback_count = 0
            self.low_confidence_count = 0
            self.injection_risk_count = 0
            self.rate_limit_count = 0
            self._latencies = []
            self.input_tokens = 0
            self.output_tokens = 0
            self.llm_calls = 0


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_metrics_instance: Optional[Metrics] = None


def get_metrics() -> Metrics:
    """Return the shared Metrics instance."""
    global _metrics_instance
    if _metrics_instance is None:
        _metrics_instance = Metrics()
    return _metrics_instance
