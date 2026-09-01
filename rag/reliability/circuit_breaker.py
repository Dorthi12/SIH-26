"""
rag/reliability/circuit_breaker.py — Lightweight circuit breaker for Pinecone and LLM.

States: CLOSED → OPEN → HALF-OPEN

- CLOSED: normal operation; failures are counted.
- OPEN: circuit is tripped; all calls raise CircuitOpenError immediately.
- HALF-OPEN: one probe request is allowed; success → CLOSED, failure → OPEN.

Configuration
-------------
CIRCUIT_BREAKER_FAILURE_THRESHOLD : consecutive failures before opening (default 3)
CIRCUIT_BREAKER_RESET_TIMEOUT     : seconds to stay OPEN before half-open probe (default 30)

Public API
----------
get_pinecone_breaker()   → CircuitBreaker
get_llm_breaker()        → CircuitBreaker
breaker.call(fn, *args)  → result (or raises CircuitOpenError / original exception)
"""

from __future__ import annotations

import logging
import threading
import time
from enum import Enum
from typing import Any, Callable, Optional

import config

log = logging.getLogger(__name__)


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitOpenError(RuntimeError):
    """Raised when a circuit is open and a call is rejected."""


class CircuitBreaker:
    """
    Thread-safe lightweight circuit breaker.

    Parameters
    ----------
    name              : Human-readable label for logging (e.g. "pinecone", "llm").
    failure_threshold : Consecutive failures before opening.
    reset_timeout     : Seconds to stay open before half-open probe.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 3,
        reset_timeout: int = 30,
    ) -> None:
        self._name = name
        self._failure_threshold = failure_threshold
        self._reset_timeout = reset_timeout
        self._lock = threading.Lock()
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: Optional[float] = None

    @property
    def state(self) -> CircuitState:
        return self._state

    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to try a half-open probe."""
        if self._last_failure_time is None:
            return True
        return (time.monotonic() - self._last_failure_time) >= self._reset_timeout

    def call(self, fn: Callable, *args: Any, **kwargs: Any) -> Any:
        """
        Execute fn(*args, **kwargs) through the circuit breaker.

        Raises
        ------
        CircuitOpenError : If the circuit is open and not ready for probe.
        Original exception: If fn raises and circuit trips or probe fails.
        """
        with self._lock:
            if self._state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self._state = CircuitState.HALF_OPEN
                    log.info("Circuit %r → HALF_OPEN (probe attempt)", self._name)
                else:
                    raise CircuitOpenError(
                        f"Circuit '{self._name}' is OPEN — service unavailable. "
                        f"Retry after {self._reset_timeout}s."
                    )

        try:
            result = fn(*args, **kwargs)
            with self._lock:
                if self._state in (CircuitState.HALF_OPEN, CircuitState.CLOSED):
                    if self._failure_count > 0:
                        log.info("Circuit %r: success after failures — resetting", self._name)
                    self._failure_count = 0
                    self._state = CircuitState.CLOSED
            return result

        except CircuitOpenError:
            raise  # already a circuit error, don't double-wrap

        except Exception as exc:
            with self._lock:
                self._failure_count += 1
                self._last_failure_time = time.monotonic()

                if (
                    self._state == CircuitState.HALF_OPEN
                    or self._failure_count >= self._failure_threshold
                ):
                    self._state = CircuitState.OPEN
                    log.error(
                        "Circuit %r → OPEN after %d failure(s): %s",
                        self._name, self._failure_count, exc,
                    )
                else:
                    log.warning(
                        "Circuit %r: failure %d/%d: %s",
                        self._name, self._failure_count, self._failure_threshold, exc,
                    )
            raise


# ---------------------------------------------------------------------------
# Singletons
# ---------------------------------------------------------------------------

_pinecone_breaker: Optional[CircuitBreaker] = None
_llm_breaker: Optional[CircuitBreaker] = None


def get_pinecone_breaker() -> CircuitBreaker:
    """Return the shared Pinecone circuit breaker."""
    global _pinecone_breaker
    if _pinecone_breaker is None:
        _pinecone_breaker = CircuitBreaker(
            name="pinecone",
            failure_threshold=config.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
            reset_timeout=config.CIRCUIT_BREAKER_RESET_TIMEOUT,
        )
    return _pinecone_breaker


def get_llm_breaker() -> CircuitBreaker:
    """Return the shared LLM circuit breaker."""
    global _llm_breaker
    if _llm_breaker is None:
        _llm_breaker = CircuitBreaker(
            name="llm",
            failure_threshold=config.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
            reset_timeout=config.CIRCUIT_BREAKER_RESET_TIMEOUT,
        )
    return _llm_breaker
