"""
rag/retrieval/query_understanding.py — Rule-based query understanding.

Converts a natural-language farmer query into a structured QueryUnderstanding.

Design principles
-----------------
- Pure rule-based NLP: regex + keyword matching. No LLM, no API calls.
- Never fabricates information not present in the query or profile.
- Profile fields always win over query-inferred fields.
- New intents can be added to INTENT_PATTERNS without touching other code.

Public API
----------
understand(query, farmer_profile=None)  →  QueryUnderstanding
"""

from __future__ import annotations

import logging
import re
import unicodedata
from typing import Dict, List, Optional, Tuple

from retrieval.models import FarmerProfile, QueryUnderstanding

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

# Devanagari Unicode block: U+0900–U+097F
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")

# Common Hindi-origin words written in Latin script (Hinglish markers)
_HINGLISH_MARKERS = re.compile(
    r"\b(kisan|kee|ke|ka|mein|hai|hain|kaunsi|kaise|kyun|kya|liye|milega|"
    r"yojana|sarkar|fasal|baarish|kharab|eligible|scheme|subsidy|anudan|"
    r"krishi|khet|aavedan|paisa|rupaye|labh|suvidha|sarkari|pradhan|mantri)\b",
    re.IGNORECASE,
)


def detect_language(text: str) -> str:
    """
    Detect whether text is English, Hindi, or Hinglish.

    Returns "hi" | "hinglish" | "en"
    """
    devanagari_chars = len(_DEVANAGARI_RE.findall(text))
    total_chars = max(len(text.strip()), 1)
    devanagari_ratio = devanagari_chars / total_chars

    if devanagari_ratio > 0.15:
        return "hi"

    hinglish_matches = len(_HINGLISH_MARKERS.findall(text))
    if hinglish_matches >= 2 or (hinglish_matches >= 1 and devanagari_chars > 0):
        return "hinglish"

    # Try langdetect if available (gracefully degrade if absent)
    try:
        from langdetect import detect as _ld_detect
        lang = _ld_detect(text)
        if lang == "hi":
            return "hi"
    except Exception:  # noqa: BLE001
        pass

    return "en"


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

# Each intent maps to a list of regex patterns (case-insensitive).
# Patterns are checked in order; first match wins.
# To add a new intent: add a key + list of patterns here.
INTENT_PATTERNS: Dict[str, List[str]] = {
    "eligibility": [
        r"\beligib",
        r"\bpatr",                        # Hindi: patrata
        r"\bwho (can|should|is eligible)",
        r"\bkaun (eligible|patr|apply)",
        r"\byogya",
        r"\bqualif",
        r"\bcriteria",
        r"\bcondition",
    ],
    "application_process": [
        r"\bhow to apply",
        r"\bapplication process",
        r"\bapply (kar|kaise|karna|online)",
        r"\baavedan",
        r"\bregister",
        r"\bregistration",
        r"\bkaise milega",
        r"\bkaise lete",
        r"\bapply karna",
        r"\bform",
        r"\bportal",
        r"\bonline apply",
    ],
    "required_documents": [
        r"\bdocument",
        r"\bdastavej",
        r"\bkagaj",
        r"\bwhat (papers|documents)",
        r"\bproof",
        r"\baadhar",
        r"\bkyc",
        r"\bbank account",
    ],
    "benefits": [
        r"\bbenefit",
        r"\blabh",
        r"\bfaida",
        r"\badvantage",
        r"\bwhat (will|do) (i|farmer) get",
        r"\bhow much",
        r"\bkitna",
        r"\bkitni rashi",
        r"\bamount",
        r"\bpayout",
        r"\bincentive",
    ],
    "crop_insurance": [
        r"\binsurance",
        r"\bbima",
        r"\bfasal bima",
        r"\bpmfby",
        r"\bcrop (loss|damage|fail)",
        r"\bkharab",
        r"\bnuqsan",
        r"\bnatural disaster",
        r"\bbaarish",
        r"\bflood",
        r"\bdrought",
        r"\bpest",
    ],
    "crop_loss_assistance": [
        r"\bfasal (kharab|barbaad|nuksan|loss|damage)",
        r"\bcrop (loss|damage|destroy|fail|ruin)",
        r"\bbaarish se kharab",
        r"\bflood (damage|loss)",
        r"\bdrought (relief|help|assist)",
        r"\bdisaster (relief|fund)",
        r"\bcompensation",
        r"\brelief",
        r"\bmuavza",
        r"\bsahayata",
        # Devanagari patterns
        r"\u092b\u0938\u0932.*\u0916\u0930\u093e\u092c",   # फसल.*खराब
        r"\u0916\u0930\u093e\u092c.*\u092b\u0938\u0932",   # खराब.*फसल
        r"\u092c\u093e\u0930\u093f\u0936.*\u0916\u0930\u093e\u092c",  # बारिश.*खराब
        r"\u0928\u0941\u0915\u0938\u093e\u0928",            # नुकसान
        r"\u092c\u0930\u092c\u093e\u0926",                  # बरबाद
        r"\u0938\u0939\u093e\u092f\u0924\u093e",            # सहायता
    ],
    "financial_assistance": [
        r"\bloan",
        r"\bkarz",
        r"\brin",
        r"\bkcc",
        r"\bkisan credit",
        r"\bcredit card",
        r"\bfinancial (help|assist|support)",
        r"\bfund",
        r"\bgrant",
    ],
    "subsidy": [
        r"\bsubsidy",
        r"\banudan",
        r"\bsubsidi",
        r"\bdrip irrigation",
        r"\bsprinkler",
        r"\birrigation (subsid|support)",
        r"\bequipment (subsid|support)",
        r"\btractor",
        r"\bmachinery",
        r"\bsmam",
    ],
    "scheme_recommendation": [
        r"\bwhich scheme",
        r"\bkaunsi scheme",
        r"\bavailable scheme",
        r"\bsuitable scheme",
        r"\brecommend",
        r"\blist of scheme",
        r"\bsarkari yojana",
        r"\bgovernment scheme",
        r"\bkisan yojana",
    ],
    "grievance": [
        r"\bcomplaint",
        r"\bshikayat",
        r"\bgrievance",
        r"\bproblem (with|in) scheme",
        r"\bnot received",
        r"\bnahi mila",
        r"\brejected",
        r"\bstatus",
        r"\btracking",
    ],
    "deadline": [
        r"\bdeadline",
        r"\blast date",
        r"\bexpiry",
        r"\bwhen (to apply|is last)",
        r"\bkab tak",
        r"\btimeframe",
        r"\bdate",
    ],
}

_COMPILED_INTENT_PATTERNS: Dict[str, List[re.Pattern]] = {
    intent: [re.compile(p, re.IGNORECASE) for p in patterns]
    for intent, patterns in INTENT_PATTERNS.items()
}

# Intent priority order — more specific intents before general ones
_INTENT_PRIORITY = [
    "crop_insurance",
    "crop_loss_assistance",
    "eligibility",
    "application_process",
    "required_documents",
    "benefits",
    "financial_assistance",
    "subsidy",
    "grievance",
    "deadline",
    "scheme_recommendation",
    "general_information",
]


def detect_intent(text: str) -> str:
    """Classify the query into one of the supported intent types."""
    for intent in _INTENT_PRIORITY:
        patterns = _COMPILED_INTENT_PATTERNS.get(intent, [])
        if any(p.search(text) for p in patterns):
            return intent
    return "general_information"


# ---------------------------------------------------------------------------
# Entity extraction
# ---------------------------------------------------------------------------

# Indian states + common abbreviations
_STATE_MAP: Dict[str, Tuple[str, str]] = {
    # pattern_key: (human_name, slug)
    r"\buttar pradesh\b|\bup\b": ("Uttar Pradesh", "uttar_pradesh"),
    r"\bmaharashtra\b": ("Maharashtra", "maharashtra"),
    r"\bpunjab\b": ("Punjab", "punjab"),
    r"\bharyana\b": ("Haryana", "haryana"),
    r"\bgujarat\b": ("Gujarat", "gujarat"),
    r"\brajasthan\b": ("Rajasthan", "rajasthan"),
    r"\bmadhya pradesh\b|\bmp\b": ("Madhya Pradesh", "madhya_pradesh"),
    r"\bkarnataka\b": ("Karnataka", "karnataka"),
    r"\bandhra pradesh\b|\bap\b": ("Andhra Pradesh", "andhra_pradesh"),
    r"\btelangana\b": ("Telangana", "telangana"),
    r"\btamil nadu\b|\btn\b": ("Tamil Nadu", "tamil_nadu"),
    r"\bwest bengal\b|\bwb\b": ("West Bengal", "west_bengal"),
    r"\bbihar\b": ("Bihar", "bihar"),
    r"\bodisha\b|\borissa\b": ("Odisha", "odisha"),
    r"\bassam\b": ("Assam", "assam"),
    r"\bkerala\b": ("Kerala", "kerala"),
    r"\bjharkhand\b": ("Jharkhand", "jharkhand"),
    r"\bchhattisgarh\b": ("Chhattisgarh", "chhattisgarh"),
    r"\buttarakhand\b": ("Uttarakhand", "uttarakhand"),
    r"\bhimachal pradesh\b|\bhp\b": ("Himachal Pradesh", "himachal_pradesh"),
    r"\bgoa\b": ("Goa", "goa"),
    r"\btripura\b": ("Tripura", "tripura"),
    r"\bmanipur\b": ("Manipur", "manipur"),
    r"\bmeghalaya\b": ("Meghalaya", "meghalaya"),
    r"\bnagaland\b": ("Nagaland", "nagaland"),
    r"\barunachal pradesh\b": ("Arunachal Pradesh", "arunachal_pradesh"),
    r"\bmizoram\b": ("Mizoram", "mizoram"),
    r"\bsikkim\b": ("Sikkim", "sikkim"),
}
_COMPILED_STATE_MAP = {
    re.compile(k, re.IGNORECASE): v for k, v in _STATE_MAP.items()
}

# Government scheme name → (human_name, scheme_id)
_SCHEME_MAP: Dict[str, Tuple[str, str]] = {
    r"\bpm.?kisan\b|\bpm kisan\b|\bpradhan mantri kisan\b": ("PM-KISAN", "pm_kisan"),
    r"\bpmfby\b|\bfasal bima\b|\bcrop insurance\b|\bpradhan mantri fasal\b": ("PMFBY", "pmfby"),
    r"\bkcc\b|\bkisan credit card\b": ("Kisan Credit Card (KCC)", "kcc"),
    r"\bpmksy\b|\birrigation\b|\bper drop more crop\b|\bdrip irrigation\b|\bsprinkler\b": ("PMKSY", "pmksy"),
    r"\bsoil health card\b|\bmrida swasthya\b": ("Soil Health Card", "soil_health_card"),
    r"\bsmam\b|\bagricultural mechanization\b|\btractor subsid\b|\bfarm equipment\b": ("SMAM", "agricultural_mechanization"),
    r"\baif\b|\bagriculture infrastructure fund\b|\binfrastructure fund\b": ("Agriculture Infrastructure Fund (AIF)", "agriculture_infrastructure_fund"),
    r"\brkvy\b|\brashtriya krishi vikas\b": ("RKVY-RAFTAAR", "rkvy"),
}
_COMPILED_SCHEME_MAP = {
    re.compile(k, re.IGNORECASE): v for k, v in _SCHEME_MAP.items()
}

# Common crops
_CROP_PATTERNS = re.compile(
    r"\b(wheat|gehun|rice|paddy|dhan|maize|makka|cotton|kapas|sugarcane|"
    r"ganna|soybean|soya|mustard|sarson|groundnut|mungfali|pulses|dal|"
    r"lentil|chickpea|chana|potato|aloo|onion|pyaz|tomato|tamatar|"
    r"vegetables|sabzi|fruits|phal|mango|aam|banana|kela|turmeric|haldi|"
    r"ginger|adrak|garlic|lahsun|jowar|bajra|ragi|arhar|moong|urad)\b",
    re.IGNORECASE,
)

# Land size: "3 acres", "2 hectares", "5 bigha"
_LAND_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*(acre|hectare|bigha|guntha|biswa|kanal|marla)s?",
    re.IGNORECASE,
)

# Farmer type
_FARMER_TYPE_PATTERNS = {
    r"\bsmall farmer\b|\bchhota kisan\b": "small_farmer",
    r"\bmarginal farmer\b|\bsimant kisan\b": "marginal_farmer",
    r"\blarge farmer\b|\bbada kisan\b": "large_farmer",
    r"\btenant farmer\b|\bbargadar\b": "tenant_farmer",
    r"\blandless\b|\bkrishi mazdoor\b": "landless_farmer",
}
_COMPILED_FARMER_TYPE = {
    re.compile(k, re.IGNORECASE): v for k, v in _FARMER_TYPE_PATTERNS.items()
}

# Cause of crop loss
_CAUSE_PATTERNS = {
    r"\bbaarish\b|\bheavy rain\b|\bexcessive rain\b|\bflood\b|\u092c\u093e\u0930\u093f\u0936": "heavy_rain",
    r"\bdrought\b|\bsookha\b|\bwater scarcit|\u0938\u0942\u0916\u093e": "drought",
    r"\bpest\b|\bkeeда\b|\binsect\b|\bdisease\b|\bblight\b": "pest_disease",
    r"\bhailstorm\b|\bole\b|\bhail\b": "hailstorm",
    r"\bcyclone\b|\btyphoon\b": "cyclone",
    r"\bfire\b|\bag\b": "fire",
    r"\bfrost\b|\bpala\b|\bcold wave\b": "frost",
}
_COMPILED_CAUSE = {
    re.compile(k, re.IGNORECASE): v for k, v in _CAUSE_PATTERNS.items()
}


def _extract_state(text: str) -> Tuple[Optional[str], Optional[str]]:
    for pattern, (name, slug) in _COMPILED_STATE_MAP.items():
        if pattern.search(text):
            return name, slug
    return None, None


def _extract_scheme(text: str) -> Tuple[Optional[str], Optional[str]]:
    for pattern, (name, sid) in _COMPILED_SCHEME_MAP.items():
        if pattern.search(text):
            return name, sid
    return None, None


def _extract_crop(text: str) -> Optional[str]:
    m = _CROP_PATTERNS.search(text)
    return m.group(0).lower() if m else None


def _extract_land(text: str) -> Tuple[Optional[float], Optional[str]]:
    m = _LAND_PATTERN.search(text)
    if m:
        return float(m.group(1)), m.group(2).lower()
    return None, None


def _extract_farmer_type(text: str) -> Optional[str]:
    for pattern, ftype in _COMPILED_FARMER_TYPE.items():
        if pattern.search(text):
            return ftype
    return None


def _extract_cause(text: str) -> Optional[str]:
    for pattern, cause in _COMPILED_CAUSE.items():
        if pattern.search(text):
            return cause
    return None


# ---------------------------------------------------------------------------
# Profile merging
# ---------------------------------------------------------------------------

def _merge_profile(qu: QueryUnderstanding, profile: Optional[FarmerProfile]) -> QueryUnderstanding:
    """
    Merge explicit farmer profile into query understanding.
    Profile values always win — we never overwrite profile data with
    uncertain query inferences.
    """
    if profile is None:
        return qu

    if profile.state:
        qu.state = profile.state
        # Also update slug
        for pattern, (name, slug) in _COMPILED_STATE_MAP.items():
            if pattern.search(profile.state):
                qu.state_slug = slug
                break
        if not qu.state_slug:
            qu.state_slug = profile.state.lower().replace(" ", "_")

    if profile.district:
        qu.district = profile.district

    if profile.crop:
        qu.crop = profile.crop

    if profile.land_size is not None:
        qu.land_size = profile.land_size

    if profile.land_unit:
        qu.land_unit = profile.land_unit

    if profile.farmer_type:
        qu.farmer_type = profile.farmer_type

    return qu


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def understand(
    query: str,
    farmer_profile: Optional[FarmerProfile] = None,
) -> QueryUnderstanding:
    """
    Convert a natural-language query into a structured QueryUnderstanding.

    Parameters
    ----------
    query          : Raw farmer query (any language).
    farmer_profile : Optional explicit profile — its fields take precedence.

    Returns
    -------
    QueryUnderstanding with all extractable fields populated; missing = None.
    """
    text = query.strip()

    language = detect_language(text)
    intent = detect_intent(text)

    state_name, state_slug = _extract_state(text)
    scheme_name, scheme_id = _extract_scheme(text)
    crop = _extract_crop(text)
    land_size, land_unit = _extract_land(text)
    farmer_type = _extract_farmer_type(text)
    cause = _extract_cause(text)

    qu = QueryUnderstanding(
        raw_query=text,
        language=language,
        intent=intent,
        state=state_name,
        state_slug=state_slug,
        crop=crop,
        scheme_name=scheme_name,
        scheme_id=scheme_id,
        land_size=land_size,
        land_unit=land_unit,
        farmer_type=farmer_type,
        cause=cause,
    )

    qu = _merge_profile(qu, farmer_profile)

    log.debug(
        "QU: lang=%s intent=%s state=%s scheme=%s crop=%s",
        qu.language, qu.intent, qu.state, qu.scheme_id, qu.crop,
    )
    return qu
