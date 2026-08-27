"""
rag/tests/test_query_understanding.py
Unit tests for query understanding — no Pinecone, no network, no LLM.

All 10 test cases from the spec plus edge cases.
Run with:  python3 -m pytest rag/tests/test_query_understanding.py -v
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from rag.retrieval.query_understanding import understand, detect_language, detect_intent
from rag.retrieval.models import FarmerProfile


# ---------------------------------------------------------------------------
# Language detection tests
# ---------------------------------------------------------------------------

class TestLanguageDetection:
    def test_english(self):
        assert detect_language("What schemes are available for farmers?") == "en"

    def test_hindi_devanagari(self):
        lang = detect_language("किसानों के लिए कौन सी योजनाएं उपलब्ध हैं?")
        assert lang == "hi"

    def test_hinglish(self):
        lang = detect_language("Kisan ke liye kaunsi scheme available hai?")
        assert lang == "hinglish"

    def test_hinglish_pm_kisan(self):
        lang = detect_language("PM Kisan ke liye kaun eligible hai?")
        assert lang == "hinglish"

    def test_hindi_crop_loss(self):
        lang = detect_language("मेरी फसल बारिश से खराब हो गई है, मुझे क्या सहायता मिल सकती है?")
        assert lang == "hi"

    def test_mixed_hinglish(self):
        lang = detect_language("UP mein wheat farmer ke liye kaunsi government schemes hain?")
        assert lang in {"hinglish", "en"}  # acceptable either way for this query


# ---------------------------------------------------------------------------
# Intent detection tests
# ---------------------------------------------------------------------------

class TestIntentDetection:
    def test_general_information(self):
        assert detect_intent("What is PM-KISAN?") == "general_information"

    def test_eligibility_english(self):
        assert detect_intent("Who is eligible for PM Kisan?") == "eligibility"

    def test_eligibility_hinglish(self):
        assert detect_intent("PM Kisan ke liye kaun eligible hai?") == "eligibility"

    def test_crop_loss_hindi(self):
        assert detect_intent("मेरी फसल बारिश से खराब हो गई है") == "crop_loss_assistance"

    def test_crop_insurance(self):
        intent = detect_intent("I need crop insurance for my wheat field")
        assert intent in {"crop_insurance", "crop_loss_assistance"}

    def test_application_process(self):
        assert detect_intent("Kisan Credit Card kaise milega?") == "application_process"

    def test_subsidy(self):
        intent = detect_intent("Drip irrigation subsidy kaise milegi?")
        assert intent == "subsidy"

    def test_scheme_recommendation(self):
        intent = detect_intent("Which government schemes are available for farmers?")
        assert intent == "scheme_recommendation"

    def test_benefits(self):
        intent = detect_intent("How much money do I get from PM Kisan?")
        assert intent == "benefits"

    def test_financial_assistance(self):
        intent = detect_intent("Kisan Credit Card loan kaise milega?")
        assert intent in {"application_process", "financial_assistance"}


# ---------------------------------------------------------------------------
# Full query understanding tests (10 spec cases)
# ---------------------------------------------------------------------------

class TestQueryUnderstanding:

    def test_1_what_is_pm_kisan(self):
        """Case 1: 'What is PM-KISAN?' """
        qu = understand("What is PM-KISAN?")
        assert qu.language == "en"
        assert qu.scheme_id == "pm_kisan"
        assert qu.scheme_name == "PM-KISAN"
        assert qu.intent == "general_information"

    def test_2_pm_kisan_eligibility_hinglish(self):
        """Case 2: 'PM Kisan ke liye kaun eligible hai?' """
        qu = understand("PM Kisan ke liye kaun eligible hai?")
        assert qu.language in {"hinglish", "hi"}
        assert qu.scheme_id == "pm_kisan"
        assert qu.intent == "eligibility"

    def test_3_crop_loss_hindi(self):
        """Case 3: Hindi crop-loss query """
        qu = understand("मेरी फसल बारिश से खराब हो गई है")
        assert qu.language == "hi"
        assert qu.intent in {"crop_loss_assistance", "crop_insurance"}
        assert qu.cause == "heavy_rain"

    def test_4_up_wheat_farmer_schemes(self):
        """Case 4: State + crop query — should extract both """
        qu = understand("I am a wheat farmer from Uttar Pradesh. Which schemes are relevant?")
        assert qu.state == "Uttar Pradesh"
        assert qu.state_slug == "uttar_pradesh"
        assert qu.crop == "wheat"
        assert qu.intent == "scheme_recommendation"

    def test_5_kcc_application(self):
        """Case 5: 'Kisan Credit Card kaise milega?' """
        qu = understand("Kisan Credit Card kaise milega?")
        assert qu.scheme_id == "kcc"
        assert qu.intent == "application_process"

    def test_6_drip_irrigation_subsidy(self):
        """Case 6: 'Drip irrigation subsidy' """
        qu = understand("Drip irrigation subsidy kaise milegi?")
        assert qu.scheme_id in {"pmksy", None}  # may extract pmksy from drip irrigation
        assert qu.intent == "subsidy"

    def test_7_hindi_query(self):
        """Case 7: Hindi language query """
        qu = understand("किसानों के लिए कौन सी योजनाएं उपलब्ध हैं?")
        assert qu.language == "hi"

    def test_8_hinglish_query(self):
        """Case 8: Hinglish language query """
        qu = understand("Kisan ke liye kaunsi scheme available hai?")
        assert qu.language in {"hinglish", "en"}

    def test_9_no_state_provided(self):
        """Case 9: No state in query → state should be None """
        qu = understand("What is PMFBY?")
        assert qu.state is None
        assert qu.state_slug is None
        assert qu.scheme_id == "pmfby"

    def test_10_explicit_scheme_name(self):
        """Case 10: Explicit scheme name extraction """
        qu = understand("Tell me about RKVY scheme benefits")
        assert qu.scheme_id == "rkvy"
        assert qu.intent == "benefits"


# ---------------------------------------------------------------------------
# Profile merging tests
# ---------------------------------------------------------------------------

class TestProfileMerging:

    def test_profile_state_wins(self):
        """Profile state overrides query-inferred state."""
        profile = FarmerProfile(state="Maharashtra")
        qu = understand("Uttar Pradesh mein kaunsi scheme hai?", farmer_profile=profile)
        # Profile wins — state should be Maharashtra, not UP
        assert qu.state == "Maharashtra"

    def test_profile_adds_missing_fields(self):
        """Profile fills in fields not in query."""
        profile = FarmerProfile(crop="rice", land_size=2.5, land_unit="acre")
        qu = understand("Which schemes are available?", farmer_profile=profile)
        assert qu.crop == "rice"
        assert qu.land_size == 2.5
        assert qu.land_unit == "acre"

    def test_profile_none_no_error(self):
        """No profile → should work fine."""
        qu = understand("What is PM Kisan?", farmer_profile=None)
        assert qu.scheme_id == "pm_kisan"

    def test_profile_empty_no_override(self):
        """Empty profile → query-inferred values preserved."""
        profile = FarmerProfile()
        qu = understand("I am from Uttar Pradesh", farmer_profile=profile)
        assert qu.state == "Uttar Pradesh"


# ---------------------------------------------------------------------------
# Land size extraction
# ---------------------------------------------------------------------------

class TestEntityExtraction:

    def test_land_size_acres(self):
        qu = understand("I have 3 acres of land")
        assert qu.land_size == 3.0
        assert qu.land_unit == "acre"

    def test_land_size_hectares(self):
        qu = understand("My farm is 1.5 hectares")
        assert qu.land_size == 1.5
        assert qu.land_unit == "hectare"

    def test_crop_wheat(self):
        qu = understand("I grow wheat")
        assert qu.crop == "wheat"

    def test_crop_rice(self):
        qu = understand("I am a rice farmer")
        assert qu.crop == "rice"

    def test_state_up_abbreviation(self):
        qu = understand("UP mein koi scheme hai?")
        assert qu.state == "Uttar Pradesh"
        assert qu.state_slug == "uttar_pradesh"

    def test_cause_drought(self):
        qu = understand("Drought has damaged my crop this year")
        assert qu.cause == "drought"
