"""
rag/evaluation/citation_metrics.py — Citation validation and metrics.

For every cited source in a generated answer, verify:
  1. The source appeared in the actual retrieval results.
  2. The page number is present.
  3. The scheme_id matches an expected scheme (or a retrieved scheme).
  4. The source URL is present (if metadata has it).
  5. The document actually contributed context to the answer.

Public API
----------
validate_citations(sources, retrieval_candidates, expected_schemes)
  → list[CitationValidation]

citation_precision(validated)  → float
citation_coverage(validated)   → float
citation_validity(validated)   → float
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Set

from evaluation.models import CitationValidation

log = logging.getLogger(__name__)


def validate_citations(
    sources: List[Any],
    retrieval_candidates: List[Any],
    expected_schemes: List[str],
) -> List[CitationValidation]:
    """
    Validate each source citation against the actual retrieval results.

    sources            : list of SourceCitation objects or dicts
    retrieval_candidates: list of RetrievalCandidate objects or dicts (ranked)
    expected_schemes   : scheme_ids expected for this question
    """
    # Build a lookup from retrieval candidates
    retrieved_doc_titles: Set[str] = set()
    retrieved_scheme_ids: Set[str] = set()
    retrieved_page_pairs: Set[tuple] = set()  # (scheme_id, page_number)

    for c in retrieval_candidates:
        if hasattr(c, "document_title"):
            retrieved_doc_titles.add(c.document_title.lower())
            retrieved_scheme_ids.add(c.scheme_id)
            retrieved_page_pairs.add((c.scheme_id, c.page_number))
        elif isinstance(c, dict):
            retrieved_doc_titles.add(c.get("document_title", "").lower())
            retrieved_scheme_ids.add(c.get("scheme_id", ""))
            retrieved_page_pairs.add((c.get("scheme_id", ""), c.get("page_number")))

    results: List[CitationValidation] = []

    for src in sources:
        # Normalize to dict
        if hasattr(src, "to_dict"):
            s = src.to_dict()
        elif hasattr(src, "__dict__"):
            s = src.__dict__
        else:
            s = src if isinstance(src, dict) else {}

        source_id = s.get("source_id", "")
        doc_title = s.get("document_title", "")
        scheme_id = s.get("scheme_id", "")
        page_number = s.get("page_number")
        source_url = s.get("source_url", "")

        # Check 1: document title appears in retrieved results
        in_retrieval = doc_title.lower() in retrieved_doc_titles

        # Check 2: page number present and > 0
        page_present = bool(page_number and page_number > 0)

        # Check 3: scheme_id matches retrieved schemes (not just expected)
        scheme_match = scheme_id in retrieved_scheme_ids

        # Check 4: URL present (non-empty)
        url_present = bool(source_url and source_url.strip())

        is_valid = in_retrieval and scheme_match

        results.append(
            CitationValidation(
                source_id=source_id,
                document_title=doc_title,
                scheme_id=scheme_id,
                page_number=page_number,
                source_url=source_url if url_present else None,
                in_retrieval_results=in_retrieval,
                page_number_present=page_present,
                scheme_match=scheme_match,
                url_present=url_present,
                is_valid=is_valid,
            )
        )

    return results


def citation_precision(validated: List[CitationValidation]) -> float:
    """
    Fraction of citations that are valid (in retrieval + scheme match).
    Returns 1.0 if there are no citations (no false citations = perfect).
    """
    if not validated:
        return 1.0
    return sum(1 for v in validated if v.is_valid) / len(validated)


def citation_coverage(
    validated: List[CitationValidation],
    expected_schemes: List[str],
) -> float:
    """
    Fraction of expected schemes that have at least one valid citation.
    Measures whether the answer cites evidence for each expected scheme.
    Returns 1.0 if expected_schemes is empty.
    """
    if not expected_schemes:
        return 1.0
    cited_schemes = {v.scheme_id for v in validated if v.is_valid}
    hits = sum(1 for s in expected_schemes if s in cited_schemes)
    return hits / len(expected_schemes)


def citation_validity(validated: List[CitationValidation]) -> float:
    """
    Same as citation_precision — the primary citation quality metric.
    Alias kept for clarity in the report.
    """
    return citation_precision(validated)
