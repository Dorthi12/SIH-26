"""
rag/evaluation/models.py — Data models for the evaluation framework.

All models are pure Python dataclasses with .to_dict() for JSON serialisation.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Input: an evaluation question from the golden dataset
# ---------------------------------------------------------------------------

@dataclass
class ConversationTurn:
    """A single turn in a multi-turn conversation evaluation."""
    role: str           # "user" | "assistant"
    content: str
    expected_profile: Optional[Dict[str, Any]] = None  # profile after this turn

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class EvalQuestion:
    """
    One question in the golden evaluation dataset.

    id                   : unique identifier, e.g. "q001"
    query                : the farmer's question
    language             : "en" | "hi" | "hinglish"
    intent               : expected intent label
    farmer_profile       : optional profile context for this question
    expected_schemes     : scheme_ids that should appear in retrieval top-K
    expected_topics      : topics that must appear in the answer
    difficulty           : "easy" | "medium" | "hard"
    expected_source_docs : filenames or titles of authoritative docs (optional)
    is_hallucination_trap: if True, the answer should express uncertainty
    conversation_turns   : multi-turn scenario (empty = single-turn)
    """
    id: str
    query: str
    language: str
    intent: str
    farmer_profile: Dict[str, Any] = field(default_factory=dict)
    expected_schemes: List[str] = field(default_factory=list)
    expected_topics: List[str] = field(default_factory=list)
    difficulty: str = "medium"
    expected_source_docs: List[str] = field(default_factory=list)
    is_hallucination_trap: bool = False
    conversation_turns: List[ConversationTurn] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "EvalQuestion":
        turns = [
            ConversationTurn(**t) for t in d.get("conversation_turns", [])
        ]
        return cls(
            id=d["id"],
            query=d["query"],
            language=d.get("language", "en"),
            intent=d.get("intent", "general_information"),
            farmer_profile=d.get("farmer_profile", {}),
            expected_schemes=d.get("expected_schemes", []),
            expected_topics=d.get("expected_topics", []),
            difficulty=d.get("difficulty", "medium"),
            expected_source_docs=d.get("expected_source_docs", []),
            is_hallucination_trap=d.get("is_hallucination_trap", False),
            conversation_turns=turns,
        )


# ---------------------------------------------------------------------------
# Output: per-question evaluation results
# ---------------------------------------------------------------------------

@dataclass
class RetrievalEvalResult:
    """Retrieval evaluation result for a single question."""
    question_id: str
    query: str
    expected_schemes: List[str]
    retrieved_scheme_ids: List[str]    # scheme_ids from top-K chunks
    retrieved_chunk_ids: List[str]     # chunk_ids in rank order
    scheme_hit: bool                   # any expected scheme in top-5
    recall_at_k: Dict[int, float]      # {1: 0.0, 3: 1.0, 5: 1.0, 10: 1.0}
    precision_at_k: Dict[int, float]   # {5: 0.4, 10: 0.3}
    reciprocal_rank: float             # MRR component
    hit_rate_at_5: bool
    language: str
    difficulty: str
    latency_ms: int
    passed: bool
    failure_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CitationValidation:
    """Validation result for a single citation."""
    source_id: str
    document_title: str
    scheme_id: str
    page_number: Optional[int]
    source_url: Optional[str]
    in_retrieval_results: bool    # was this chunk actually retrieved?
    page_number_present: bool
    scheme_match: bool            # scheme_id in expected_schemes
    url_present: bool
    is_valid: bool                # all checks pass

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class GenerationEvalResult:
    """Generation evaluation result for a single question."""
    question_id: str
    query: str
    answer: str
    language: str
    difficulty: str
    faithfulness: Optional[float]         # None if LLM eval disabled
    answer_relevance: Optional[float]     # None if LLM eval disabled
    citation_precision: float
    citation_coverage: float
    citation_validity: float
    citation_validations: List[CitationValidation] = field(default_factory=list)
    is_hallucination_trap: bool = False
    correctly_expressed_uncertainty: bool = False
    latency_ms: int = 0
    passed: bool = True
    failure_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ConversationEvalResult:
    """Evaluation result for a multi-turn conversation scenario."""
    question_id: str
    turns_evaluated: int
    profile_after_final_turn: Dict[str, Any]
    expected_profile: Dict[str, Any]
    profile_fields_correct: int
    profile_fields_total: int
    profile_accuracy: float
    passed: bool
    failure_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Aggregate metrics
# ---------------------------------------------------------------------------

@dataclass
class LanguageMetrics:
    language: str
    question_count: int
    recall_at_5: float
    precision_at_5: float
    hit_rate_at_5: float
    scheme_hit_rate: float
    mrr: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class MetricSet:
    """Aggregated evaluation metrics across all questions."""
    total_questions: int = 0

    # Retrieval
    recall_at_1: float = 0.0
    recall_at_3: float = 0.0
    recall_at_5: float = 0.0
    recall_at_10: float = 0.0
    precision_at_5: float = 0.0
    precision_at_10: float = 0.0
    mrr: float = 0.0
    hit_rate_at_5: float = 0.0
    scheme_hit_rate: float = 0.0

    # Generation (None if LLM eval disabled)
    faithfulness: Optional[float] = None
    answer_relevance: Optional[float] = None

    # Citation
    citation_precision: float = 0.0
    citation_validity: float = 0.0

    # Hallucination trap accuracy
    hallucination_trap_accuracy: float = 0.0

    # Eligibility accuracy (fraction with correct 3-state decision)
    eligibility_accuracy: Optional[float] = None

    # Per-language breakdown
    by_language: Dict[str, Any] = field(default_factory=dict)

    # Per-difficulty breakdown
    by_difficulty: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RegressionCheckResult:
    """Result of regression threshold checks."""
    passed: bool
    failures: List[str] = field(default_factory=list)
    thresholds: Dict[str, float] = field(default_factory=dict)
    actual: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class EvalReport:
    """Complete evaluation report."""
    dataset_path: str
    questions_evaluated: int
    retrieval_results: List[RetrievalEvalResult] = field(default_factory=list)
    generation_results: List[GenerationEvalResult] = field(default_factory=list)
    conversation_results: List[ConversationEvalResult] = field(default_factory=list)
    metrics: Optional[MetricSet] = None
    regression: Optional[RegressionCheckResult] = None
    llm_evaluation_enabled: bool = False
    total_latency_ms: int = 0

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d
