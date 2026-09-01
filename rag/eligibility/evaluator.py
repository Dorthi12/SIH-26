"""
rag/eligibility/evaluator.py — Deterministic eligibility evaluation engine.

This module contains NO LLM calls. It applies extracted EligibilityRules
against a FarmerProfile using pure Python comparison logic.

Three-state output:
  ELIGIBLE              — every condition verified against profile
  INELIGIBLE            — at least one condition definitively failed
  INSUFFICIENT_INFORMATION — at least one required field missing from profile

Public API
----------
evaluate(rule, profile)                    →  EligibilityResult
evaluate_all(rules, profile, gov_level)    →  list[EligibilityResult]
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from eligibility.models import (
    ConditionResult,
    EligibilityCondition,
    EligibilityFarmerProfile,
    EligibilityResult,
    EligibilityRule,
    EligibilityStatus,
    RuleEvidence,
    UnitConversionError,
    to_acres,
)

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Profile field accessor
# ---------------------------------------------------------------------------

def _get_profile_field(profile: EligibilityFarmerProfile, field: str) -> Optional[Any]:
    """
    Retrieve a field value from the farmer profile.

    Returns None if the field is not set (→ INSUFFICIENT_INFORMATION).
    Never raises on missing fields.
    """
    return getattr(profile, field, None)


def _normalize_numeric(
    profile_value: Any,
    condition_value: Any,
    field: str,
    unit: Optional[str],
    profile: EligibilityFarmerProfile,
) -> tuple[Optional[float], Optional[float], Optional[str]]:
    """
    Normalize numeric values to a common unit for comparison.

    Returns (normalized_profile_value, normalized_condition_value, error_message).
    error_message is non-None when normalization fails (→ INSUFFICIENT_INFORMATION).
    """
    if field == "land_size_acres":
        # Profile already has land_size_acres computed; condition value is in acres
        try:
            pv = float(profile_value)
            cv = float(condition_value)
            return pv, cv, None
        except (TypeError, ValueError):
            return None, None, "Cannot compare land size — value not numeric"

    # For age, direct numeric comparison
    try:
        return float(profile_value), float(condition_value), None
    except (TypeError, ValueError):
        return None, None, f"Cannot compare {field} — non-numeric value"


# ---------------------------------------------------------------------------
# Single condition evaluation
# ---------------------------------------------------------------------------

def _evaluate_condition(
    condition: EligibilityCondition,
    profile: EligibilityFarmerProfile,
) -> ConditionResult:
    """
    Evaluate a single EligibilityCondition against the farmer profile.

    Returns a ConditionResult with ELIGIBLE/INELIGIBLE/INSUFFICIENT_INFORMATION.
    """
    field = condition.field
    operator = condition.operator
    condition_value = condition.value

    # Step 1: Get profile field value
    profile_value = _get_profile_field(profile, field)

    # Step 2: Handle "exists" / "not_exists" specially
    if operator == "exists":
        if profile_value is None:
            return ConditionResult(
                condition=condition,
                status=EligibilityStatus.INSUFFICIENT_INFORMATION,
                farmer_value=None,
                reason=f"'{field}' information not provided.",
            )
        return ConditionResult(
            condition=condition,
            status=EligibilityStatus.ELIGIBLE,
            farmer_value=profile_value,
            reason=f"'{field}' is present: {profile_value}",
        )

    if operator == "not_exists":
        if profile_value is not None:
            return ConditionResult(
                condition=condition,
                status=EligibilityStatus.INELIGIBLE,
                farmer_value=profile_value,
                reason=f"'{field}' must not be set, but farmer has: {profile_value}",
            )
        return ConditionResult(
            condition=condition,
            status=EligibilityStatus.ELIGIBLE,
            farmer_value=None,
            reason=f"'{field}' is not set — condition satisfied",
        )

    # Step 3: Missing value → INSUFFICIENT_INFORMATION
    if profile_value is None:
        return ConditionResult(
            condition=condition,
            status=EligibilityStatus.INSUFFICIENT_INFORMATION,
            farmer_value=None,
            reason=f"Information about '{field}' not provided by the farmer.",
        )

    # Step 4: Normalize and compare
    numeric_fields = {"land_size_acres", "age", "land_size"}
    if field in numeric_fields:
        pv, cv, err = _normalize_numeric(profile_value, condition_value, field, condition.unit, profile)
        if err:
            return ConditionResult(
                condition=condition,
                status=EligibilityStatus.INSUFFICIENT_INFORMATION,
                farmer_value=profile_value,
                reason=err,
            )
        passed = _compare_numeric(pv, operator, cv)
        status = EligibilityStatus.ELIGIBLE if passed else EligibilityStatus.INELIGIBLE
        reason = (
            f"{condition.human_readable}: farmer has {pv:.2f} "
            f"({'satisfies' if passed else 'does not satisfy'} condition)"
        )
        return ConditionResult(condition=condition, status=status, farmer_value=pv, reason=reason)

    # Step 5: String / categorical comparison
    passed, reason = _compare_string(str(profile_value), operator, condition_value, field)
    status = EligibilityStatus.ELIGIBLE if passed else EligibilityStatus.INELIGIBLE
    return ConditionResult(condition=condition, status=status, farmer_value=profile_value, reason=reason)


def _compare_numeric(pv: float, operator: str, cv: float) -> bool:
    ops = {
        "equals": lambda a, b: math.isclose(a, b, rel_tol=1e-4),
        "not_equals": lambda a, b: not math.isclose(a, b, rel_tol=1e-4),
        "greater_than": lambda a, b: a > b,
        "greater_than_or_equal": lambda a, b: a >= b,
        "less_than": lambda a, b: a < b,
        "less_than_or_equal": lambda a, b: a <= b,
    }
    fn = ops.get(operator)
    if fn is None:
        return False
    return fn(pv, cv)


import math

def _compare_string(pv: str, operator: str, cv: Any, field: str) -> tuple[bool, str]:
    pv_l = pv.lower().strip()

    if operator == "equals":
        target = str(cv).lower().strip()
        passed = pv_l == target
        return passed, f"{field}: '{pv}' {'==' if passed else '!='} '{cv}'"

    if operator == "not_equals":
        target = str(cv).lower().strip()
        passed = pv_l != target
        return passed, f"{field}: '{pv}' {'!=' if passed else '=='} '{cv}'"

    if operator == "contains":
        target = str(cv).lower().strip()
        passed = target in pv_l
        return passed, f"{field}: '{pv}' {'contains' if passed else 'does not contain'} '{cv}'"

    if operator == "one_of":
        targets = [str(x).lower().strip() for x in (cv if isinstance(cv, list) else [cv])]
        passed = pv_l in targets
        return passed, f"{field}: '{pv}' {'is' if passed else 'is not'} one of {cv}"

    # Fallback — unknown operator for string
    return False, f"Cannot apply operator '{operator}' to string field '{field}'"


# ---------------------------------------------------------------------------
# Full rule evaluation
# ---------------------------------------------------------------------------

def evaluate(
    rule: EligibilityRule,
    profile: EligibilityFarmerProfile,
    government_level: str = "central",
) -> EligibilityResult:
    """
    Evaluate a complete EligibilityRule against a farmer profile.

    Applies all conditions and determines the three-state status.
    No LLM calls — purely deterministic.
    """
    if not rule.conditions:
        # No conditions extracted — cannot make any determination
        return EligibilityResult(
            scheme_id=rule.scheme_id,
            scheme_name=rule.scheme_name,
            government_level=government_level,
            status=EligibilityStatus.INSUFFICIENT_INFORMATION,
            missing_information=["No eligibility conditions were found in the retrieved documents."],
            conflict_warning=rule.conflict_warning,
            rules_used=0,
            explanation=(
                f"The retrieved documents for {rule.scheme_name} did not contain "
                "clear eligibility conditions that could be evaluated."
            ),
        )

    matched: List[ConditionResult] = []
    failed: List[ConditionResult] = []
    missing: List[str] = []
    evidence: List[RuleEvidence] = []

    for condition in rule.conditions:
        result = _evaluate_condition(condition, profile)

        if result.status == EligibilityStatus.ELIGIBLE:
            matched.append(result)
        elif result.status == EligibilityStatus.INELIGIBLE:
            failed.append(result)
        else:  # INSUFFICIENT_INFORMATION
            missing.append(result.reason)

        if condition.evidence:
            evidence.append(condition.evidence)

    # Determine final status
    # Logic: with AND (default) — any failure → INELIGIBLE; any missing → INSUFFICIENT_INFORMATION
    if rule.logic == "OR":
        # OR logic: if any condition matched, consider ELIGIBLE (simplified)
        if matched:
            final_status = EligibilityStatus.ELIGIBLE
        elif failed and not missing:
            final_status = EligibilityStatus.INELIGIBLE
        else:
            final_status = EligibilityStatus.INSUFFICIENT_INFORMATION
    else:
        # AND logic (default)
        if failed:
            final_status = EligibilityStatus.INELIGIBLE
        elif missing:
            final_status = EligibilityStatus.INSUFFICIENT_INFORMATION
        else:
            final_status = EligibilityStatus.ELIGIBLE

    explanation = _build_explanation(rule.scheme_name, final_status, matched, failed, missing)

    return EligibilityResult(
        scheme_id=rule.scheme_id,
        scheme_name=rule.scheme_name,
        government_level=government_level,
        status=final_status,
        matched_conditions=matched,
        failed_conditions=failed,
        missing_information=missing,
        evidence=list({e.chunk_id: e for e in evidence}.values()),  # deduplicate by chunk_id
        conflict_warning=rule.conflict_warning,
        rules_used=len(rule.conditions),
        explanation=explanation,
    )


def evaluate_all(
    rules: List[EligibilityRule],
    profile: EligibilityFarmerProfile,
    gov_level_map: Optional[Dict[str, str]] = None,
) -> List[EligibilityResult]:
    """
    Evaluate all rules and return a result for each scheme.

    gov_level_map: {scheme_id → "central" | "state"} for labelling.
    """
    results = []
    for rule in rules:
        gov_level = (gov_level_map or {}).get(rule.scheme_id, "central")
        result = evaluate(rule, profile, government_level=gov_level)
        results.append(result)
    return results


def _build_explanation(
    scheme_name: str,
    status: EligibilityStatus,
    matched: List[ConditionResult],
    failed: List[ConditionResult],
    missing: List[str],
) -> str:
    """Generate a farmer-friendly explanation of the evaluation result."""
    if status == EligibilityStatus.ELIGIBLE:
        return (
            f"Based on the available government documents, you appear to meet all the "
            f"documented eligibility conditions for {scheme_name}. "
            f"Please verify with the official portal before applying."
        )
    elif status == EligibilityStatus.INELIGIBLE:
        reasons = "; ".join(c.reason for c in failed[:2])
        return (
            f"Based on the available documents, you do not appear to satisfy one or more "
            f"conditions for {scheme_name}: {reasons}. "
            f"Please check the latest official notification in case rules have changed."
        )
    else:  # INSUFFICIENT_INFORMATION
        matched_str = (
            f"You appear to meet {len(matched)} condition(s). " if matched else ""
        )
        return (
            f"{matched_str}However, some required information is missing to complete "
            f"the eligibility check for {scheme_name}. "
            + (f"Missing: {missing[0]}." if missing else "")
        )
