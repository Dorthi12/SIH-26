"""
rag/evaluation/dataset.py — Load, validate and filter the golden evaluation dataset.

Public API
----------
load_dataset(path)                                  → list[EvalQuestion]
filter_dataset(questions, **kwargs)                 → list[EvalQuestion]
validate_dataset(questions)                         → list[str]  (errors)
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from evaluation.models import EvalQuestion

log = logging.getLogger(__name__)

# Corpus schemes — used to flag unknown scheme_ids in the dataset
_KNOWN_SCHEMES = {
    "pm_kisan", "pmfby", "kcc", "pmksy", "soil_health_card",
    "agricultural_mechanization", "agriculture_infrastructure_fund",
    "rkvy", "uttar_pradesh",
}

_VALID_LANGUAGES = {"en", "hi", "hinglish"}
_VALID_DIFFICULTIES = {"easy", "medium", "hard"}

DEFAULT_DATASET_PATH = str(
    Path(__file__).parent / "data" / "golden_questions.json"
)


def load_dataset(path: str = DEFAULT_DATASET_PATH) -> List[EvalQuestion]:
    """
    Load and parse the golden evaluation dataset from a JSON file.

    Raises:
        FileNotFoundError   : if path does not exist.
        ValueError          : if JSON is malformed or schema validation fails.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    with open(p, "r", encoding="utf-8") as f:
        try:
            raw = json.load(f)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Malformed JSON in dataset {path}: {exc}") from exc

    if not isinstance(raw, list):
        raise ValueError(f"Dataset must be a JSON array, got: {type(raw).__name__}")

    questions: List[EvalQuestion] = []
    errors: List[str] = []

    for i, item in enumerate(raw):
        if not isinstance(item, dict):
            errors.append(f"Item {i}: must be a JSON object, got {type(item).__name__}")
            continue
        if "id" not in item:
            errors.append(f"Item {i}: missing required field 'id'")
            continue
        if "query" not in item:
            errors.append(f"Item {i}: missing required field 'query'")
            continue

        try:
            q = EvalQuestion.from_dict(item)
            questions.append(q)
        except Exception as exc:
            errors.append(f"Item {i} ({item.get('id', '?')}): parse error — {exc}")

    if errors:
        raise ValueError(f"Dataset validation failed with {len(errors)} error(s):\n" + "\n".join(errors))

    # Soft warnings (log, don't raise)
    schema_warnings = validate_dataset(questions)
    for w in schema_warnings:
        log.warning("Dataset warning: %s", w)

    log.info("Loaded %d questions from %s", len(questions), path)
    return questions


def validate_dataset(questions: List[EvalQuestion]) -> List[str]:
    """
    Validate dataset integrity. Returns list of warning strings.
    Does NOT raise — used for soft validation.
    """
    warnings: List[str] = []
    seen_ids: set = set()

    for q in questions:
        # Duplicate ID check
        if q.id in seen_ids:
            warnings.append(f"{q.id}: duplicate ID")
        seen_ids.add(q.id)

        # Language check
        if q.language not in _VALID_LANGUAGES:
            warnings.append(f"{q.id}: unknown language '{q.language}' (expected: {_VALID_LANGUAGES})")

        # Difficulty check
        if q.difficulty not in _VALID_DIFFICULTIES:
            warnings.append(f"{q.id}: unknown difficulty '{q.difficulty}'")

        # Scheme ID check
        for sid in q.expected_schemes:
            if sid not in _KNOWN_SCHEMES:
                warnings.append(f"{q.id}: unknown scheme_id '{sid}' not in corpus")

        # Hallucination traps should have empty expected_schemes
        if q.is_hallucination_trap and q.expected_schemes:
            warnings.append(
                f"{q.id}: hallucination trap should have empty expected_schemes, got: {q.expected_schemes}"
            )

    return warnings


def filter_dataset(
    questions: List[EvalQuestion],
    language: Optional[str] = None,
    difficulty: Optional[str] = None,
    intent: Optional[str] = None,
    limit: Optional[int] = None,
    hallucination_traps: Optional[bool] = None,
    conversation_only: bool = False,
) -> List[EvalQuestion]:
    """
    Filter the dataset by various criteria.

    language           : "en" | "hi" | "hinglish"
    difficulty         : "easy" | "medium" | "hard"
    intent             : filter by intent label
    limit              : maximum number of questions to return
    hallucination_traps: if True, include only traps; if False, exclude traps
    conversation_only  : if True, include only multi-turn questions
    """
    filtered = questions

    if language:
        filtered = [q for q in filtered if q.language == language]
    if difficulty:
        filtered = [q for q in filtered if q.difficulty == difficulty]
    if intent:
        filtered = [q for q in filtered if q.intent == intent]
    if hallucination_traps is True:
        filtered = [q for q in filtered if q.is_hallucination_trap]
    elif hallucination_traps is False:
        filtered = [q for q in filtered if not q.is_hallucination_trap]
    if conversation_only:
        filtered = [q for q in filtered if q.conversation_turns]

    if limit is not None:
        filtered = filtered[:limit]

    return filtered
