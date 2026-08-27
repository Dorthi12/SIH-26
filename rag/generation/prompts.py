"""
rag/generation/prompts.py — System and user prompts for the AgriSense RAG generator.

Design principles
-----------------
- System prompt establishes strict grounding rules (no hallucination).
- User message includes structured SOURCE blocks + original farmer query.
- Language-specific instructions are embedded in the prompt.
- All 17 anti-hallucination rules from the spec are included.
- Prompt asks the LLM to return answer in a consistent markdown format.

Public API
----------
build_system_prompt(language, farmer_profile)          →  str
build_user_message(query, context_str, language, ...)  →  str
"""

from __future__ import annotations

from typing import Optional

from rag.retrieval.models import FarmerProfile


# ---------------------------------------------------------------------------
# Language instruction blocks
# ---------------------------------------------------------------------------

_LANG_INSTRUCTIONS = {
    "en": (
        "Answer in clear, simple English. Use short sentences. "
        "Avoid jargon. Keep government scheme names in their official form."
    ),
    "hi": (
        "उत्तर सरल, स्पष्ट हिंदी में दें। छोटे वाक्य उपयोग करें। "
        "सरकारी योजनाओं के नाम उनके आधिकारिक रूप में रखें। "
        "तकनीकी शब्दों को सरल भाषा में समझाएं।"
    ),
    "hinglish": (
        "Answer in natural Hinglish — a friendly mix of Hindi and English as spoken in India. "
        "Do NOT mechanically translate every English term. "
        "Government scheme names (PM-KISAN, PMFBY, etc.) should stay recognizable. "
        "Use simple words that a village farmer would understand."
    ),
}


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT_TEMPLATE = """You are AgriSense Assistant — an AI helping Indian farmers understand government agricultural schemes and policies.

You answer questions ONLY using the government-source documents provided in the context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT RULES — NEVER VIOLATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NEVER invent a government scheme that is not in the context.
2. NEVER invent eligibility requirements not stated in the context.
3. NEVER invent benefit amounts, monetary figures, or subsidies not stated in the context.
4. NEVER invent deadlines or application windows not stated in the context.
5. NEVER invent required documents not stated in the context.
6. NEVER invent application procedures not stated in the context.
7. NEVER fabricate URLs, portal links, or contact information.
8. NEVER say a farmer is "definitely eligible" — only say they "may be eligible" or "appear to qualify based on the documents."
9. If the context does not contain enough information, explicitly say: "I could not find sufficient information in the available official documents."
10. When multiple document versions exist for the same topic, prefer the latest and mention that older versions may differ.
11. Clearly distinguish between Central Government schemes and State Government schemes.
12. Explain government and legal terminology in simple language.
13. {lang_instruction}
14. Preserve official scheme names exactly as they appear (PM-KISAN, PMFBY, PMKSY, KCC, SMAM, AIF, RKVY, Soil Health Card).
15. When making an important factual claim, reference the SOURCE number it came from (e.g., [Source 1]).
16. Do NOT use your general world knowledge about government policies — answer only from the provided context.
17. Do NOT treat your training data as a government source.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Structure your answer with clear sections when relevant:

### [Scheme Name]
**What it provides:** ...
**Who may qualify:** ...
**How to apply:** ...
**Documents needed:** ...
**Important:** ...
**Source:** [Source N]

For general questions, use plain paragraphs with source references.
Keep answers concise and actionable for a farmer.
{profile_context}"""


def build_system_prompt(
    language: str,
    farmer_profile: Optional[FarmerProfile] = None,
) -> str:
    """Build the system prompt with language and profile context."""
    lang_instruction = _LANG_INSTRUCTIONS.get(language, _LANG_INSTRUCTIONS["en"])

    profile_lines = []
    if farmer_profile:
        profile_lines.append("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        profile_lines.append("FARMER PROFILE (use for context, NOT for definitive eligibility)")
        profile_lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        if farmer_profile.state:
            profile_lines.append(f"State: {farmer_profile.state}")
        if farmer_profile.district:
            profile_lines.append(f"District: {farmer_profile.district}")
        if farmer_profile.crop:
            profile_lines.append(f"Crop: {farmer_profile.crop}")
        if farmer_profile.land_size and farmer_profile.land_unit:
            profile_lines.append(f"Land: {farmer_profile.land_size} {farmer_profile.land_unit}")
        if farmer_profile.farmer_type:
            profile_lines.append(f"Farmer type: {farmer_profile.farmer_type}")
        profile_lines.append(
            "Use this profile to make the answer contextually relevant. "
            "Do NOT declare definitive eligibility based on profile alone."
        )

    profile_context = "\n".join(profile_lines)

    return _SYSTEM_PROMPT_TEMPLATE.format(
        lang_instruction=lang_instruction,
        profile_context=profile_context,
    )


# ---------------------------------------------------------------------------
# User message
# ---------------------------------------------------------------------------

def build_user_message(
    query: str,
    context_str: str,
    language: str,
    farmer_profile: Optional[FarmerProfile] = None,
) -> str:
    """
    Build the user turn message with the context + query.

    The original query is preserved exactly — never translated or paraphrased.
    """
    lang_name = {"en": "English", "hi": "Hindi", "hinglish": "Hinglish"}.get(language, "English")

    lines = [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "GOVERNMENT DOCUMENT CONTEXT",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        context_str,
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "FARMER QUESTION",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"Language: {lang_name}",
        f"Question: {query}",
        "",
        f"Answer in {lang_name} based ONLY on the government documents above. "
        "Reference source numbers where relevant. "
        "If the documents do not contain enough information, say so clearly.",
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# No-context message (when retrieval confidence is too low)
# ---------------------------------------------------------------------------

def build_no_context_message(query: str, language: str) -> str:
    """Message to send when no qualifying context was retrieved (for logging only — LLM not called)."""
    return (
        f"[No qualifying context available for query: {query!r} | language: {language}]"
    )
