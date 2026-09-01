"""
rag/retrieval/filters.py — Metadata filter builder for Pinecone queries.

Design rules
------------
1. Never over-filter: missing metadata ≠ exclude. Use $or to widen.
2. A farmer in UP can access both UP docs AND central (government_level=central).
3. Scheme filter is additive — only applied when scheme is explicitly named.
4. If nothing is extractable, return None (no filter = semantic search only).

Public API
----------
build_filter(qu)  →  dict | None
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from retrieval.models import QueryUnderstanding

log = logging.getLogger(__name__)


def _state_filter(state_slug: str) -> Dict[str, Any]:
    """
    Build a state-aware filter that includes:
    - Docs explicitly tagged for the requested state
    - Docs with empty/null state (central docs stored without state tag)
    - Docs tagged government_level=central

    This ensures a farmer in UP sees both UP and central scheme docs.
    """
    return {
        "$or": [
            {"state": state_slug},
            {"state": ""},               # central/all-India docs stored with empty state
            {"government_level": "central"},
        ]
    }


def _scheme_filter(scheme_id: str) -> Dict[str, Any]:
    return {"scheme_id": scheme_id}


def _combine_filters(filters: list[Dict[str, Any]]) -> Dict[str, Any]:
    """AND-combine multiple filter dicts using $and."""
    if len(filters) == 1:
        return filters[0]
    return {"$and": filters}


def build_filter(qu: QueryUnderstanding) -> Optional[Dict[str, Any]]:
    """
    Build a Pinecone metadata filter from a QueryUnderstanding.

    Returns None if no meaningful filter can be built (pure semantic search).
    """
    filters = []

    # State filter
    if qu.state_slug:
        filters.append(_state_filter(qu.state_slug))
        log.debug("Filter: state=%s (inclusive of central)", qu.state_slug)

    # Scheme filter — only when scheme is explicitly named in the query
    if qu.scheme_id:
        filters.append(_scheme_filter(qu.scheme_id))
        log.debug("Filter: scheme_id=%s", qu.scheme_id)

    if not filters:
        log.debug("No metadata filter applied — pure semantic search")
        return None

    result = _combine_filters(filters)
    log.debug("Built Pinecone filter: %s", result)
    return result


def filter_to_display(filter_dict: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Return a human-readable summary of the applied filter for API responses."""
    if filter_dict is None:
        return {}
    return filter_dict
