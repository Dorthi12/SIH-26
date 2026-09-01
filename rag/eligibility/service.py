"""
rag/eligibility/service.py — Eligibility and recommendation orchestrator.

Ties together retrieval → rule extraction → evaluation → recommendation.

Public API
----------
check_eligibility(query, profile, scheme_ids)  →  EligibilityResponse
recommend_schemes(profile, query)              →  RecommendationResponse
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Dict, List, Optional, Set

import config
from eligibility.evaluator import evaluate_all
from eligibility.models import (
    EligibilityFarmerProfile,
    EligibilityResponse,
    EligibilityResult,
    EligibilityStatus,
    RecommendationResponse,
)
from eligibility.recommendation import rank_schemes, split_by_level
from eligibility.rule_extractor import extract_rules
from retrieval.models import FarmerProfile, RetrievalResult
from retrieval.retriever import get_retriever
from retrieval.query_understanding import understand
from generation.citation_builder import build_follow_ups

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Follow-up questions for eligibility context
# ---------------------------------------------------------------------------

_FOLLOW_UP_TEMPLATES = {
    "en": {
        "need_state": "Which state are you farming in?",
        "need_crop": "What crop do you primarily grow?",
        "need_land": "How much land do you own or cultivate (in acres or hectares)?",
        "need_land_ownership": "Is the land registered in your name (owned), or is it leased/sharecropped?",
        "need_bank": "Do you have a bank account linked for receiving direct benefit transfers?",
        "need_farmer_type": "Are you classified as a small farmer (up to 2 hectares) or marginal farmer (up to 1 hectare)?",
    },
    "hi": {
        "need_state": "आप किस राज्य में खेती करते हैं?",
        "need_crop": "आप मुख्य रूप से कौन सी फसल उगाते हैं?",
        "need_land": "आपके पास कितनी जमीन है (एकड़ या हेक्टेयर में)?",
        "need_land_ownership": "क्या जमीन आपके नाम पर है, या पट्टे/बटाई पर है?",
        "need_bank": "क्या आपके पास सीधे लाभ हस्तांतरण के लिए बैंक खाता है?",
        "need_farmer_type": "क्या आप छोटे किसान (2 हेक्टेयर तक) या सीमांत किसान (1 हेक्टेयर तक) हैं?",
    },
    "hinglish": {
        "need_state": "Aap kis state mein kheti karte hain?",
        "need_crop": "Aap mainly kaunsi fasal ugate hain?",
        "need_land": "Aapke paas kitni zameen hai (acre ya hectare mein)?",
        "need_land_ownership": "Kya zameen aapke naam pe registered hai, ya leased/bataai pe hai?",
        "need_bank": "Kya aapke paas DBT ke liye bank account hai?",
        "need_farmer_type": "Aap chhote kisan (2 hectare tak) ya seemaant kisan (1 hectare tak) hain?",
    },
}

MAX_FOLLOW_UPS = 3


def _build_eligibility_follow_ups(
    profile: EligibilityFarmerProfile,
    results: List[EligibilityResult],
    language: str,
) -> List[str]:
    """Build the most relevant follow-up questions based on missing profile fields."""
    templates = _FOLLOW_UP_TEMPLATES.get(language, _FOLLOW_UP_TEMPLATES["en"])
    questions: List[str] = []

    # Collect all unique missing_information strings from results
    all_missing = set()
    for r in results:
        all_missing.update(r.missing_information)

    # Priority order for follow-up questions
    if not profile.state:
        questions.append(templates["need_state"])
    if not profile.crop:
        questions.append(templates["need_crop"])
    if not profile.land_size:
        questions.append(templates["need_land"])
    elif not profile.land_ownership and any("ownership" in m.lower() or "registered" in m.lower() for m in all_missing):
        questions.append(templates["need_land_ownership"])
    if not profile.bank_account and any("bank" in m.lower() for m in all_missing):
        questions.append(templates["need_bank"])
    if not profile.farmer_type and any("farmer type" in m.lower() or "marginal" in m.lower() for m in all_missing):
        questions.append(templates["need_farmer_type"])

    return questions[:MAX_FOLLOW_UPS]


# ---------------------------------------------------------------------------
# Query augmentation
# ---------------------------------------------------------------------------

def _augment_query(query: str, profile: EligibilityFarmerProfile, intent_override: str = "eligibility") -> str:
    """
    Augment the user query with profile information to improve retrieval signal.
    Appends state/crop/land information if not already in the query.
    """
    additions = []
    query_lower = query.lower()

    if profile.state and profile.state.lower() not in query_lower:
        additions.append(profile.state)
    if profile.crop and profile.crop.lower() not in query_lower:
        additions.append(f"{profile.crop} farmer")
    if profile.land_size and profile.land_unit:
        additions.append(f"{profile.land_size} {profile.land_unit}")

    if additions:
        return f"{query} {' '.join(additions)}"
    return query


# ---------------------------------------------------------------------------
# Main service functions
# ---------------------------------------------------------------------------

def check_eligibility(
    query: str,
    profile: EligibilityFarmerProfile,
    scheme_ids: Optional[Set[str]] = None,
    top_k: Optional[int] = None,
) -> EligibilityResponse:
    """
    Run the full eligibility pipeline for a farmer query.

    1. Augment query with profile info for better retrieval
    2. Retrieve relevant government document chunks
    3. Extract eligibility rules (LLM)
    4. Evaluate rules against profile (pure Python)
    5. Build follow-up questions
    """
    request_id = str(uuid.uuid4())[:8]
    t_start = time.perf_counter()

    log.info("[%s] Eligibility check | query=%r state=%s crop=%s", request_id, query[:60], profile.state, profile.crop)

    # Step 1: Query understanding for language detection
    qu = understand(query, profile.to_base_profile())
    language = qu.language

    # Step 2: Retrieve (augmented query for better retrieval signal)
    augmented_query = _augment_query(query, profile)
    retriever = get_retriever()
    retrieval_result: RetrievalResult = retriever.retrieve(
        query=augmented_query,
        farmer_profile=profile.to_base_profile(),
        top_k=top_k or 15,  # get more candidates for rule extraction
    )

    log.info("[%s] Retrieved %d chunks", request_id, len(retrieval_result.results))

    # Step 3: Extract rules (LLM)
    t_extract = time.perf_counter()
    rules = extract_rules(
        retrieved_chunks=retrieval_result.results,
        scheme_ids=scheme_ids,
    )
    extract_ms = int((time.perf_counter() - t_extract) * 1000)
    log.info("[%s] Extracted %d rules in %dms", request_id, len(rules), extract_ms)

    # Build gov_level map from retrieved chunks
    gov_level_map = {}
    for chunk in retrieval_result.results:
        gov_level_map[chunk.scheme_id] = chunk.government_level

    # Step 4: Evaluate (pure Python)
    results = evaluate_all(rules, profile, gov_level_map)

    # Step 5: If no rules extracted, add INSUFFICIENT_INFORMATION results for retrieved schemes
    evaluated_ids = {r.scheme_id for r in results}
    for chunk in retrieval_result.results:
        if chunk.scheme_id not in evaluated_ids:
            results.append(EligibilityResult(
                scheme_id=chunk.scheme_id,
                scheme_name=chunk.scheme_name,
                government_level=chunk.government_level,
                status=EligibilityStatus.INSUFFICIENT_INFORMATION,
                missing_information=["No structured eligibility conditions could be extracted from the retrieved documents."],
                rules_used=0,
                explanation=(
                    f"The documents retrieved for {chunk.scheme_name} did not contain "
                    "clear eligibility conditions that could be automatically evaluated."
                ),
            ))
            evaluated_ids.add(chunk.scheme_id)

    # Step 6: Follow-up questions
    follow_ups = _build_eligibility_follow_ups(profile, results, language)

    latency_ms = int((time.perf_counter() - t_start) * 1000)
    log.info("[%s] Eligibility done in %dms | %d results", request_id, latency_ms, len(results))

    return EligibilityResponse(
        query=query,
        language=language,
        farmer_profile=profile.to_dict(),
        results=results,
        follow_up_questions=follow_ups,
        latency_ms=latency_ms,
    )


def recommend_schemes(
    profile: EligibilityFarmerProfile,
    query: Optional[str] = None,
    top_k: Optional[int] = None,
) -> RecommendationResponse:
    """
    Recommend relevant government schemes for a farmer profile.

    Returns ranked schemes with eligibility status and scoring transparency.
    """
    request_id = str(uuid.uuid4())[:8]
    t_start = time.perf_counter()

    log.info("[%s] Scheme recommendation | state=%s crop=%s land=%s %s",
             request_id, profile.state, profile.crop, profile.land_size, profile.land_unit)

    # Build a recommendation-focused query if none provided
    if not query:
        parts = ["government agricultural schemes"]
        if profile.crop:
            parts.append(f"for {profile.crop} farmers")
        if profile.state:
            parts.append(f"in {profile.state}")
        if profile.land_size and profile.land_unit:
            parts.append(f"{profile.land_size} {profile.land_unit} land")
        query = " ".join(parts)
    else:
        query = _augment_query(query, profile)

    # Retrieve
    retriever = get_retriever()
    retrieval_result = retriever.retrieve(
        query=query,
        farmer_profile=profile.to_base_profile(),
        top_k=top_k or 20,
    )

    # Extract rules
    rules = extract_rules(retrieved_chunks=retrieval_result.results)

    # Evaluate
    gov_level_map = {chunk.scheme_id: chunk.government_level for chunk in retrieval_result.results}
    eligibility_results = evaluate_all(rules, profile, gov_level_map)

    # Rank
    recommendations = rank_schemes(profile, eligibility_results, retrieval_result)

    # Language detection
    qu = understand(query, profile.to_base_profile())
    language = qu.language

    # Follow-ups
    follow_ups = _build_eligibility_follow_ups(profile, eligibility_results, language)

    # Split by government level
    central, state_recs = split_by_level(recommendations)

    latency_ms = int((time.perf_counter() - t_start) * 1000)
    log.info("[%s] Recommend done in %dms | %d recommendations", request_id, latency_ms, len(recommendations))

    return RecommendationResponse(
        farmer_profile=profile.to_dict(),
        recommendations=recommendations,
        central_schemes=central,
        state_schemes=state_recs,
        follow_up_questions=follow_ups,
        latency_ms=latency_ms,
    )
