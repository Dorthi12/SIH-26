"""
rag/conversation/summarizer.py — Conversation summarizer for token management.

When message_count reaches CONV_SUMMARY_THRESHOLD, calls the LLM to summarize
older messages into a compact state.conversation_summary string.

Rules:
- Only summarize facts explicitly stated in the conversation.
- Never add information not present in the messages.
- Never include Aadhaar, bank account, OTP, or other sensitive data.
- Temperature 0 for determinism.

Public API
----------
should_summarize(state)          → bool
summarize(state, messages)       → str    (new summary text)
"""

from __future__ import annotations

import logging
from typing import List

import config
from conversation.models import ConversationMessage, ConversationState

log = logging.getLogger(__name__)

_SUMMARY_SYSTEM_PROMPT = """You are summarizing a farmer assistance conversation.

Write a 2-3 sentence summary containing ONLY:
- The farmer's location (state, district) if mentioned
- The crops they grow, if mentioned
- Their land size and unit, if mentioned
- The government schemes they asked about, if mentioned
- Any key eligibility information they provided

STRICT RULES:
1. Do NOT add any information not in the messages.
2. Do NOT mention Aadhaar numbers, bank account numbers, OTPs, or passwords.
3. Do NOT fabricate scheme names, amounts, or eligibility criteria.
4. Keep it factual and brief.

Write the summary in the third person (e.g., "The farmer is from...")."""


def should_summarize(state: ConversationState) -> bool:
    """Return True if the conversation is long enough to warrant summarization."""
    return state.message_count >= config.CONV_SUMMARY_THRESHOLD


def summarize(
    state: ConversationState,
    messages: List[ConversationMessage],
) -> str:
    """
    Generate a compact summary of the conversation using the LLM.
    Falls back to the existing summary (or empty string) on failure.
    """
    if not messages:
        return state.conversation_summary or ""

    # Build a clean transcript of the messages to summarize
    # Only include user and assistant content — not system prompts
    lines = []
    existing = state.conversation_summary
    if existing:
        lines.append(f"[Previous summary]: {existing}")
        lines.append("")

    lines.append("Conversation:")
    for msg in messages:
        role_label = "Farmer" if msg.role == "user" else "Assistant"
        lines.append(f"{role_label}: {msg.content}")

    transcript = "\n".join(lines)

    try:
        from groq import Groq
        client = Groq(api_key=config.LLM_API_KEY)
        response = client.chat.completions.create(
            model=config.LLM_MODEL,
            messages=[
                {"role": "system", "content": _SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": f"Summarize this conversation:\n\n{transcript}"},
            ],
            temperature=0.0,
            max_tokens=200,
        )
        summary = (response.choices[0].message.content or "").strip()
        log.info("Generated conversation summary (%d chars)", len(summary))
        return summary
    except Exception as exc:
        log.warning("Summarization failed: %s — keeping existing summary", exc)
        return state.conversation_summary or ""
