"""
rag/reliability/timeout_wrapper.py — Timeout wrappers for external calls.

Applies a wall-clock timeout to synchronous and async functions.
A failed or hung external dependency never blocks the request indefinitely.

Public API
----------
with_timeout(fn, seconds, label)          → result (sync; raises TimeoutError)
async_with_timeout(coro, seconds, label)  → result (async; raises asyncio.TimeoutError)
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import logging
from typing import Any, Callable, Coroutine, TypeVar

log = logging.getLogger(__name__)

T = TypeVar("T")

# Shared executor for sync timeout calls
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4, thread_name_prefix="rag-timeout")


def with_timeout(fn: Callable[..., T], seconds: int, label: str, *args: Any, **kwargs: Any) -> T:
    """
    Call fn(*args, **kwargs) synchronously with a timeout.

    Parameters
    ----------
    fn      : Callable to execute.
    seconds : Wall-clock timeout in seconds.
    label   : Human-readable label for logging and error messages.
    *args, **kwargs: Forwarded to fn.

    Raises
    ------
    TimeoutError : If fn does not complete within `seconds`.
    Any exception raised by fn is re-raised as-is.
    """
    future = _executor.submit(fn, *args, **kwargs)
    try:
        return future.result(timeout=seconds)
    except concurrent.futures.TimeoutError:
        log.error("Timeout: %s did not complete within %ds", label, seconds)
        raise TimeoutError(f"{label} timed out after {seconds}s")


async def async_with_timeout(
    coro: Coroutine[Any, Any, T],
    seconds: int,
    label: str,
) -> T:
    """
    Await coro with a timeout.

    Parameters
    ----------
    coro    : Awaitable coroutine.
    seconds : Wall-clock timeout in seconds.
    label   : Human-readable label for error messages.

    Raises
    ------
    asyncio.TimeoutError : If coro does not complete within `seconds`.
    """
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError:
        log.error("Async timeout: %s did not complete within %ds", label, seconds)
        raise
