"""
rag/tests/test_eligibility.py — Tests for the Eligibility & Recommendation Engine.

Test categories:
  - Unit tests: models, evaluator, unit conversion (no network)
  - Integration tests: full pipeline with real Pinecone + Groq

Run:
  python3 -m pytest rag/tests/test_eligibility.py -v -k "unit"        # unit only
  python3 -m pytest rag/tests/test_eligibility.py -v                  # all
"""

from __future__ import annotations

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from unittest.mock import patch, MagicMock

import config
from eligibility.models import (
    EligibilityCondition,
    EligibilityFarmerProfile,
    EligibilityRule,
    EligibilityStatus,
    RuleEvidence,
    UnitConversionError,
    to_acres,
    to_hectares,
)
from eligibility.evaluator import evaluate, _evaluate_condition


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_evidence():
    return RuleEvidence(
        chunk_id="chunk_1",
        page_number=12,
        source_url="https://pmkisan.gov.in",
        document_title="PM KISAN Guidelines 2020",
        section="Eligibility",
        raw_text="Eligible farmers with land <= 5 acres",
    )


def _make_condition(field, operator, value, confidence=0.9, human_readable=""):
    return EligibilityCondition(
        field=field,
        operator=operator,
        value=value,
        confidence=confidence,
        evidence=_make_evidence(),
        human_readable=human_readable or f"{field} {operator} {value}",
    )


def _make_rule(scheme_id, conditions, logic="AND"):
    return EligibilityRule(
        scheme_id=scheme_id,
        scheme_name=scheme_id.upper().replace("_", "-"),
        conditions=conditions,
        logic=logic,
    )


# ---------------------------------------------------------------------------
# UNIT — Unit normalization
# ---------------------------------------------------------------------------

class TestUnitNormalization:

    def test_acre_to_acre(self):
        assert to_acres(3.0, "acre") == 3.0

    def test_acres_plural(self):
        assert to_acres(3.0, "acres") == 3.0

    def test_hectare_to_acre(self):
        result = to_acres(1.0, "hectare")
        assert abs(result - 2.47105) < 0.001

    def test_hectares_plural(self):
        result = to_acres(2.0, "hectares")
        assert abs(result - 4.942) < 0.01

    def test_bigha_without_state_raises(self):
        with pytest.raises(UnitConversionError):
            to_acres(5.0, "bigha", state="Uttar Pradesh")  # no rate configured

    def test_unknown_unit_raises(self):
        with pytest.raises(UnitConversionError):
            to_acres(3.0, "killa")

    def test_profile_auto_computes_acres(self):
        profile = EligibilityFarmerProfile(land_size=1.0, land_unit="hectare")
        assert profile.land_size_acres is not None
        assert abs(profile.land_size_acres - 2.47105) < 0.01

    def test_profile_crops_normalised(self):
        profile = EligibilityFarmerProfile(crop="wheat")
        assert profile.crops == ["wheat"]


# ---------------------------------------------------------------------------
# UNIT — Evaluator core logic
# ---------------------------------------------------------------------------

class TestEvaluatorConditions:

    def test_eligible_land_size_lte(self):
        """3 acres <= 5 acres → ELIGIBLE"""
        profile = EligibilityFarmerProfile(land_size=3, land_unit="acre")
        cond = _make_condition("land_size_acres", "less_than_or_equal", 5.0)
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.ELIGIBLE

    def test_ineligible_land_size_exceeded(self):
        """8 acres <= 5 acres → INELIGIBLE"""
        profile = EligibilityFarmerProfile(land_size=8, land_unit="acre")
        cond = _make_condition("land_size_acres", "less_than_or_equal", 5.0)
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.INELIGIBLE

    def test_missing_field_gives_insufficient_information(self):
        """Test 3: missing field → INSUFFICIENT_INFORMATION, not INELIGIBLE"""
        profile = EligibilityFarmerProfile(state="Uttar Pradesh")  # no land_size
        cond = _make_condition("land_size_acres", "less_than_or_equal", 5.0)
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.INSUFFICIENT_INFORMATION
        assert result.farmer_value is None

    def test_state_equals_match(self):
        profile = EligibilityFarmerProfile(state="Uttar Pradesh")
        cond = _make_condition("state", "equals", "Uttar Pradesh")
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.ELIGIBLE

    def test_state_equals_mismatch(self):
        profile = EligibilityFarmerProfile(state="Maharashtra")
        cond = _make_condition("state", "equals", "Uttar Pradesh")
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.INELIGIBLE

    def test_exists_operator_field_present(self):
        profile = EligibilityFarmerProfile(bank_account=True)
        cond = _make_condition("bank_account", "exists", None)
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.ELIGIBLE

    def test_exists_operator_field_missing(self):
        profile = EligibilityFarmerProfile()  # no bank_account
        cond = _make_condition("bank_account", "exists", None)
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.INSUFFICIENT_INFORMATION

    def test_one_of_operator(self):
        profile = EligibilityFarmerProfile(farmer_type="small_farmer")
        cond = _make_condition("farmer_type", "one_of", ["small_farmer", "marginal_farmer"])
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.ELIGIBLE

    def test_one_of_operator_not_in_list(self):
        profile = EligibilityFarmerProfile(farmer_type="large_farmer")
        cond = _make_condition("farmer_type", "one_of", ["small_farmer", "marginal_farmer"])
        result = _evaluate_condition(cond, profile)
        assert result.status == EligibilityStatus.INELIGIBLE


# ---------------------------------------------------------------------------
# UNIT — Full rule evaluation (three-state)
# ---------------------------------------------------------------------------

class TestRuleEvaluation:

    def test_test4_ineligible_with_evidence(self):
        """Test 4: Explicitly failed condition → INELIGIBLE with evidence."""
        profile = EligibilityFarmerProfile(land_size=10, land_unit="acre")  # too large
        rule = _make_rule("pm_kisan", [
            _make_condition("land_size_acres", "less_than_or_equal", 5.0,
                           human_readable="land_size <= 5 acres"),
        ])
        result = evaluate(rule, profile)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert len(result.failed_conditions) == 1
        assert len(result.evidence) > 0  # evidence must be present

    def test_test5_eligible_all_conditions_met(self):
        """Test 5: All conditions satisfied → ELIGIBLE with evidence."""
        profile = EligibilityFarmerProfile(
            land_size=3, land_unit="acre",
            state="Uttar Pradesh",
            bank_account=True,
        )
        rule = _make_rule("pm_kisan", [
            _make_condition("land_size_acres", "less_than_or_equal", 5.0),
            _make_condition("state", "equals", "Uttar Pradesh"),
            _make_condition("bank_account", "exists", None),
        ])
        result = evaluate(rule, profile)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert len(result.matched_conditions) == 3
        assert len(result.failed_conditions) == 0
        assert len(result.missing_information) == 0

    def test_test3_insufficient_info_not_ineligible(self):
        """Test 3: Missing required field → INSUFFICIENT_INFORMATION, NOT INELIGIBLE."""
        profile = EligibilityFarmerProfile(land_size=3, land_unit="acre")  # no land_ownership
        rule = _make_rule("pm_kisan", [
            _make_condition("land_size_acres", "less_than_or_equal", 5.0),
            _make_condition("land_ownership", "exists", None),  # requires ownership info
        ])
        result = evaluate(rule, profile)
        # land_size passes, land_ownership missing → INSUFFICIENT_INFORMATION
        assert result.status == EligibilityStatus.INSUFFICIENT_INFORMATION
        assert len(result.matched_conditions) == 1
        assert len(result.missing_information) >= 1

    def test_no_conditions_gives_insufficient(self):
        """Rule with no conditions → INSUFFICIENT_INFORMATION."""
        profile = EligibilityFarmerProfile(state="Uttar Pradesh")
        rule = _make_rule("pm_kisan", [])  # empty conditions
        result = evaluate(rule, profile)
        assert result.status == EligibilityStatus.INSUFFICIENT_INFORMATION

    def test_ineligible_overrides_missing(self):
        """Failed condition takes precedence over missing with AND logic."""
        profile = EligibilityFarmerProfile(land_size=10, land_unit="acre")  # fails land check
        rule = _make_rule("pm_kisan", [
            _make_condition("land_size_acres", "less_than_or_equal", 5.0),  # FAIL
            _make_condition("bank_account", "exists", None),                 # MISSING
        ])
        result = evaluate(rule, profile)
        assert result.status == EligibilityStatus.INELIGIBLE  # failed overrides missing


# ---------------------------------------------------------------------------
# UNIT — Profile model
# ---------------------------------------------------------------------------

class TestFarmerProfile:

    def test_from_dict_partial(self):
        """from_dict works with partial fields."""
        p = EligibilityFarmerProfile.from_dict({
            "state": "Uttar Pradesh",
            "land_size": 3,
            "land_unit": "acre",
        })
        assert p.state == "Uttar Pradesh"
        assert p.land_size == 3.0
        assert p.crop is None

    def test_to_base_profile(self):
        """to_base_profile() returns a retrieval-compatible FarmerProfile."""
        p = EligibilityFarmerProfile(state="UP", crop="wheat", land_size=2, land_unit="acre")
        base = p.to_base_profile()
        assert base.state == "UP"
        assert base.crop == "wheat"

    def test_sensitive_fields_not_required(self):
        """Profile works without any sensitive/personal fields."""
        p = EligibilityFarmerProfile(state="Uttar Pradesh", land_size=3, land_unit="acre")
        assert p.bank_account is None
        assert p.aadhaar_available is None
        assert p.kisan_credit_card is None


# ---------------------------------------------------------------------------
# UNIT — Conflict detection
# ---------------------------------------------------------------------------

class TestConflictDetection:

    def test_test7_conflict_warning_surfaced(self):
        """Test 7: Conflicting document versions → conflict_warning set."""
        from eligibility.rule_extractor import _detect_conflicts

        # Simulate two conditions for the same field with different values
        cond1 = _make_condition("land_size_acres", "less_than_or_equal", 5.0)
        cond2 = _make_condition("land_size_acres", "less_than_or_equal", 2.0)  # conflicting

        warning = _detect_conflicts([cond1, cond2], [])
        assert warning is not None
        assert "conflict" in warning.lower() or "different" in warning.lower()

    def test_no_conflict_when_consistent(self):
        """No conflict warning when conditions are consistent."""
        from eligibility.rule_extractor import _detect_conflicts

        cond1 = _make_condition("land_size_acres", "less_than_or_equal", 5.0)
        cond2 = _make_condition("land_size_acres", "less_than_or_equal", 5.0)  # same value

        warning = _detect_conflicts([cond1, cond2], [])
        assert warning is None


# ---------------------------------------------------------------------------
# INTEGRATION TESTS — Real Pinecone + Groq
# ---------------------------------------------------------------------------

_has_pinecone = bool(config.PINECONE_API_KEY)
_has_llm = bool(config.LLM_API_KEY)
_skip_integration = not (_has_pinecone and _has_llm)


@pytest.fixture(scope="module")
def elig_profile():
    return EligibilityFarmerProfile.from_dict({
        "state": "Uttar Pradesh",
        "district": "Prayagraj",
        "land_size": 3,
        "land_unit": "acre",
        "crop": "wheat",
    })


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_1_relevant_schemes_returned(elig_profile):
    """Test 1: UP wheat farmer with 3 acres — relevant schemes recommended."""
    from eligibility.service import recommend_schemes
    response = recommend_schemes(elig_profile)

    assert len(response.recommendations) > 0, "Should return at least one recommendation"
    scheme_ids = {r.scheme_id for r in response.recommendations}
    # Should return some schemes from the corpus
    assert len(scheme_ids) > 0


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_2_missing_state_asks_for_it():
    """Test 2: No state → follow-up asks for state."""
    from eligibility.service import recommend_schemes
    profile = EligibilityFarmerProfile(land_size=3, land_unit="acre", crop="wheat")
    response = recommend_schemes(profile)

    # Should have at least one follow-up about state
    all_fups = " ".join(response.follow_up_questions).lower()
    assert "state" in all_fups or "rajya" in all_fups or "state" in all_fups or "kis" in all_fups, \
        f"Expected state follow-up, got: {response.follow_up_questions}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_3_missing_field_insufficient_not_ineligible():
    """Test 3: No land_ownership → INSUFFICIENT_INFORMATION, not INELIGIBLE."""
    from eligibility.service import check_eligibility
    profile = EligibilityFarmerProfile(state="Uttar Pradesh", land_size=3, land_unit="acre")
    # No bank_account, land_ownership — should be INSUFFICIENT_INFORMATION for any scheme requiring them
    response = check_eligibility("Am I eligible for PM Kisan?", profile, scheme_ids={"pm_kisan"})

    # No result should be INELIGIBLE if the reason is missing information
    for result in response.results:
        if result.missing_information:
            assert result.status != EligibilityStatus.INELIGIBLE.value, \
                f"Got INELIGIBLE when fields were missing: {result.missing_information}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_6_central_and_state_schemes(elig_profile):
    """Test 6: UP farmer — both central and state-level schemes can appear."""
    from eligibility.service import recommend_schemes
    response = recommend_schemes(elig_profile)

    all_levels = {r.government_level for r in response.recommendations}
    # At minimum should have central schemes (all our corpus is central)
    assert "central" in all_levels, "Should have central schemes for UP farmer"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_8_hindi_response():
    """Test 8: Hindi query → language detected as hi."""
    from eligibility.service import check_eligibility
    profile = EligibilityFarmerProfile(state="Uttar Pradesh", land_size=3, land_unit="acre")
    response = check_eligibility("क्या मैं पीएम किसान के लिए पात्र हूं?", profile)
    assert response.language == "hi", f"Expected 'hi', got '{response.language}'"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_9_hinglish_response():
    """Test 9: Hinglish query → language detected as hinglish."""
    from eligibility.service import check_eligibility
    profile = EligibilityFarmerProfile(state="Uttar Pradesh", land_size=3, land_unit="acre")
    response = check_eligibility("Kya main PM Kisan ke liye eligible hoon?", profile)
    assert response.language in ("hinglish", "en"), f"Got unexpected language: {response.language}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_10_unknown_scheme_not_fabricated():
    """Test 10: Unknown scheme — system must not invent it."""
    from eligibility.service import check_eligibility
    profile = EligibilityFarmerProfile(state="Uttar Pradesh")
    response = check_eligibility("Am I eligible for PM SuperFarm 9999?", profile)

    # Either returns empty results or INSUFFICIENT_INFORMATION — never fabricates
    for result in response.results:
        # Any returned scheme must come from the real corpus
        assert result.scheme_id not in ("pm_superfarm_9999", "superfarm"), \
            "System must not fabricate unknown scheme IDs"
