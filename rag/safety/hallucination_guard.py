"""
rag/safety/hallucination_guard.py — Post-generation answer safety checks.

Checks applied after LLM generation:
1. Low-confidence retrieval detection (based on retrieval scores).
2. Unsupported number detection (policy numbers in answer not in context).
3. Eligibility language safety (hedging enforcement).

Public API
----------
check_low_confidence(retrieval_result)               → bool
check_unsupported_numbers(answer, context_str)       → list[str]
check_eligibility_language(answer)                   → bool (True = safe)
sanitize_eligibility_language(answer)                → str
"""

from __future__ import annotations

import logging
import re
from typing import List, Any

from rag import config

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-confidence detection
# ---------------------------------------------------------------------------

def check_low_confidence(retrieval_result: Any) -> bool:
    """
    Return True if retrieval confidence is too low to trust the answer.

    Criteria: no results, OR top semantic_score < RAG_MIN_RETRIEVAL_SCORE.
    """
    results = getattr(retrieval_result, "results", [])
    if not results:
        return True
    top_score = results[0].semantic_score if results else 0.0
    low = top_score < config.RAG_MIN_RETRIEVAL_SCORE
    if low:
        log.info(
            "Low retrieval confidence: top_score=%.4f threshold=%.2f",
            top_score, config.RAG_MIN_RETRIEVAL_SCORE,
        )
    return low


# ---------------------------------------------------------------------------
# Unsupported number detection
# ---------------------------------------------------------------------------

# Patterns that match policy-related numbers in answers
_NUMBER_PATTERNS = [
    # Indian currency amounts: ₹6000, Rs.6000, INR 6000, 6,000 rupees
    re.compile(r"(?:₹|Rs\.?|INR\s*)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lakh|crore|thousand|hundred))?", re.I),
    # Plain lakhs/crores
    re.compile(r"\d+(?:\.\d+)?\s*(?:lakh|crore|thousand)s?\b", re.I),
    # Percentages
    re.compile(r"\d+(?:\.\d+)?\s*%"),
    # Year references (2020–2030 range, policy relevant)
    re.compile(r"\b20[1-3]\d\b"),
    # Application fees / limits (bare numbers followed by context words)
    re.compile(r"\b\d{3,}\s*(?:acres?|hectares?|bigha)\b", re.I),
]


def _extract_numbers(text: str) -> List[str]:
    """Extract policy-relevant number strings from text."""
    found = []
    for pat in _NUMBER_PATTERNS:
        found.extend(m.group(0) for m in pat.finditer(text))
    return found


def check_unsupported_numbers(answer: str, context_str: str) -> List[str]:
    """
    Find policy-related numbers in the answer that are absent from context.

    Parameters
    ----------
    answer      : LLM-generated answer text.
    context_str : Full context string passed to the LLM.

    Returns
    -------
    List of number strings found in the answer but NOT found verbatim in context.
    Empty list = all numbers are grounded.
    """
    answer_numbers = _extract_numbers(answer)
    unsupported = []

    for num in answer_numbers:
        # Strip whitespace variants and check if it appears anywhere in context
        num_normalized = re.sub(r"\s+", "", num)
        ctx_normalized = re.sub(r"\s+", "", context_str)
        if num_normalized not in ctx_normalized:
            unsupported.append(num)

    if unsupported:
        log.warning(
            "Unsupported numbers in answer (not found in context): %s",
            unsupported,
        )
    return unsupported


# ---------------------------------------------------------------------------
# Eligibility language safety
# ---------------------------------------------------------------------------

# Unsafe phrasing patterns — declare definitive eligibility
_UNSAFE_ELIGIBILITY_RE = re.compile(
    r"\b(you\s+are\s+eligible|you('re|\s+are)\s+definitely\s+eligible"
    r"|guaranteed\s+eligible|confirmed\s+eligible"
    r"|definitely\s+qualif(?:y|ies|ied)"
    r"|is\s+eligible|are\s+eligible(?!\s+(?:if|when|provided|based|for)))",
    re.I,
)

# Replacement hedging phrases (used when sanitizing)
_HEDGING_REPLACEMENTS = {
    r"you are eligible": "you appear to satisfy the documented conditions",
    r"you're eligible": "you appear to satisfy the documented conditions",
    r"you are definitely eligible": "you may satisfy the documented conditions",
    r"guaranteed eligible": "potentially eligible based on the documents",
    r"confirmed eligible": "potentially eligible based on the documents",
    r"definitely qualify": "may qualify based on the documents",
    r"is eligible": "may be eligible based on the documents",
    r"are eligible": "may be eligible based on the documents",
}


def check_eligibility_language(answer: str) -> bool:
    """
    Return True (safe) if the answer uses appropriately hedged language.
    Return False (unsafe) if unqualified eligibility declarations are present.
    """
    if _UNSAFE_ELIGIBILITY_RE.search(answer):
        log.warning("Unsafe eligibility language detected in answer")
        return False
    return True


def sanitize_eligibility_language(answer: str) -> str:
    """
    Replace unsafe eligibility declarations with hedged alternatives.

    Only applied when check_eligibility_language() returns False.
    Does not alter other answer content.
    """
    result = answer
    for pattern, replacement in _HEDGING_REPLACEMENTS.items():
        result = re.sub(pattern, replacement, result, flags=re.I)
    if result != answer:
        log.info("Eligibility language sanitized in answer")
    return result
