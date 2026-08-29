"""
logging_config.py — Structured logging setup for the Agriculture ML API.
Call configure_logging() once at startup (done in main.py).
"""

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """
    Set up a single root logger with a consistent format.
    Both the disease model and crop model share the same log stream.
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    datefmt = "%Y-%m-%dT%H:%M:%S"

    logging.basicConfig(
        level=numeric_level,
        format=fmt,
        datefmt=datefmt,
        stream=sys.stdout,
        force=True,
    )

    # Silence noisy third-party loggers
    for noisy in ("urllib3", "httpx", "asyncio", "PIL", "uvicorn.access"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
