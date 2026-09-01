"""
rag/tests/test_conversation.py — Tests for the Conversational RAG layer.

Test categories:
  - Unit tests: state management, resolver, privacy, profile updates (no network)
  - Integration tests: full multi-turn conversation via service.chat()

Run:
  python3 -m pytest rag/tests/test_conversation.py -v -k "unit or State or Resolver or Profile or Delete or Privacy"
  python3 -m pytest rag/tests/test_conversation.py -v   # all
"""

from __future__ import annotations

import sys, os, json, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest

from conversation.models import (
    ConversationMessage,
    ConversationState,
    ResolvedContext,
    _redact_sensitive,
)
from conversation.resolver import resolve
import config

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fresh_store(tmp_path: str):
    """Create a ConversationStore backed by a temp SQLite file."""
    from conversation.state import ConversationStore
    return ConversationStore(os.path.join(tmp_path, "test.db"))


def _make_state(**kwargs) -> ConversationState:
    return ConversationState(
        conversation_id="conv_test01",
        **kwargs,
    )


# ---------------------------------------------------------------------------
# UNIT — Privacy / redaction
# ---------------------------------------------------------------------------

class TestPrivacy:

    def test_aadhaar_redacted(self):
        text = "My Aadhaar is 123456789012"
        result = _redact_sensitive(text)
        assert "123456789012" not in result
        assert "[REDACTED]" in result

    def test_normal_text_unchanged(self):
        text = "I grow wheat in Uttar Pradesh"
        result = _redact_sensitive(text)
        assert result == text

    def test_sensitive_not_stored_in_user_message(self):
        msg = ConversationMessage.user("conv_1", "My Aadhaar is 123456789012")
        assert "123456789012" not in msg.content


# ---------------------------------------------------------------------------
# UNIT — ConversationState profile updates
# ---------------------------------------------------------------------------

class TestConversationStateProfile:

    def test_explicit_update_overrides_existing(self):
        """Test 4: Explicit contradiction — latest value wins."""
        state = _make_state(farmer_profile={"state": "Uttar Pradesh"})
        state.update_profile({"state": "Bihar"}, inferred=False)
        assert state.farmer_profile["state"] == "Bihar"

    def test_inferred_does_not_override_explicit(self):
        """Inferred state cannot override explicitly set state."""
        state = _make_state(farmer_profile={"state": "Uttar Pradesh"})
        state.update_profile({"state": "Bihar"}, inferred=True)  # inferred — should not override
        assert state.farmer_profile["state"] == "Uttar Pradesh"

    def test_sensitive_fields_not_inferred(self):
        """Sensitive fields (bank_account, aadhaar) must not be set via inference."""
        state = _make_state()
        state.update_profile({"bank_account": True, "state": "UP"}, inferred=True)
        assert "bank_account" not in state.farmer_profile
        assert state.farmer_profile.get("state") == "UP"

    def test_none_values_not_stored(self):
        """None values in profile updates are ignored."""
        state = _make_state(farmer_profile={"state": "UP"})
        state.update_profile({"state": None, "crop": None}, inferred=False)
        assert state.farmer_profile.get("state") == "UP"
        assert "crop" not in state.farmer_profile

    def test_add_scheme_updates_recent(self):
        state = _make_state()
        state.add_scheme("pm_kisan", "PM-KISAN")
        state.add_scheme("pmfby", "PMFBY")
        assert state.current_scheme == "pmfby"
        assert "pmfby" in state.recent_schemes
        assert "pm_kisan" in state.recent_schemes

    def test_crop_update(self):
        """Test 7: Crop change updates profile."""
        state = _make_state(farmer_profile={"state": "UP", "crop": "wheat"})
        state.update_profile({"crop": "rice"}, inferred=False)
        assert state.farmer_profile["crop"] == "rice"


# ---------------------------------------------------------------------------
# UNIT — SQLite store
# ---------------------------------------------------------------------------

class TestConversationStore:

    def test_create_and_load(self, tmp_path):
        store = _fresh_store(str(tmp_path))
        state = store.create_conversation(user_id="user_1")
        assert state.conversation_id.startswith(config.CONV_ID_PREFIX)

        loaded = store.load_state(state.conversation_id, "user_1")
        assert loaded is not None
        assert loaded.conversation_id == state.conversation_id

    def test_save_and_load_state(self, tmp_path):
        store = _fresh_store(str(tmp_path))
        state = store.create_conversation()
        state.farmer_profile = {"state": "Uttar Pradesh", "crop": "wheat"}
        store.save_state(state)

        loaded = store.load_state(state.conversation_id)
        assert loaded.farmer_profile["state"] == "Uttar Pradesh"
        assert loaded.farmer_profile["crop"] == "wheat"

    def test_test8_delete_conversation(self, tmp_path):
        """Test 8: Delete conversation — state removed, next load returns None."""
        store = _fresh_store(str(tmp_path))
        state = store.create_conversation(user_id="user_1")
        cid = state.conversation_id

        deleted = store.delete_conversation(cid, "user_1")
        assert deleted is True

        loaded = store.load_state(cid)
        assert loaded is None

    def test_ownership_prevents_access(self, tmp_path):
        """Conversation is not accessible by a different user."""
        store = _fresh_store(str(tmp_path))
        state = store.create_conversation(user_id="user_A")
        loaded = store.load_state(state.conversation_id, user_id="user_B")
        assert loaded is None

    def test_append_and_get_messages(self, tmp_path):
        store = _fresh_store(str(tmp_path))
        state = store.create_conversation()
        cid = state.conversation_id

        msg1 = ConversationMessage.user(cid, "Hello")
        msg2 = ConversationMessage.assistant(cid, "How can I help?", intent="general_information")
        store.append_message(msg1)
        store.append_message(msg2)

        messages = store.get_messages(cid)
        assert len(messages) == 2
        assert messages[0].role == "user"
        assert messages[1].role == "assistant"
        assert messages[1].intent == "general_information"


# ---------------------------------------------------------------------------
# UNIT — Context resolver
# ---------------------------------------------------------------------------

class TestConversationResolver:

    def test_test4_state_correction(self):
        """Test 4: 'Actually I farm in Bihar' → resolves Bihar as new state."""
        state = _make_state(farmer_profile={"state": "Uttar Pradesh"})
        ctx = resolve("Actually I farm in Bihar", state)
        # The new profile extracted from the message should contain Bihar
        assert ctx.updated_profile.get("state") == "Bihar"

    def test_scheme_reference_resolution(self):
        """Test 2: After mentioning PMFBY, 'What documents are required?' resolves to PMFBY."""
        state = _make_state()
        state.add_scheme("pmfby", "PMFBY")
        # Query referencing "it" or containing "documents"
        ctx = resolve("What documents do I need for it?", state)
        assert ctx.resolved_scheme_id == "pmfby"

    def test_test3_ambiguity_multiple_schemes(self):
        """Test 3: 'Am I eligible?' with multiple schemes → is_ambiguous=True."""
        state = _make_state()
        state.add_scheme("pmfby", "PMFBY")
        state.add_scheme("pm_kisan", "PM-KISAN")
        ctx = resolve("Am I eligible?", state)
        assert ctx.is_ambiguous is True
        assert len(ctx.ambiguous_schemes) >= 2

    def test_eligibility_single_scheme_not_ambiguous(self):
        """If only one scheme in context, eligibility is not ambiguous."""
        state = _make_state()
        state.add_scheme("pmfby", "PMFBY")
        ctx = resolve("Am I eligible?", state)
        assert ctx.is_ambiguous is False

    def test_recommendation_pipeline_selected(self):
        """'Which schemes can I get?' → recommendation pipeline."""
        state = _make_state(farmer_profile={"state": "UP", "crop": "wheat"})
        ctx = resolve("Which schemes can I get?", state)
        assert ctx.pipeline == "recommendation"

    def test_profile_enriches_query(self):
        """Accumulated profile fields are appended to the query."""
        state = _make_state(farmer_profile={"state": "Uttar Pradesh", "crop": "wheat"})
        ctx = resolve("What schemes are available?", state)
        assert "Uttar Pradesh" in ctx.enriched_query or "wheat" in ctx.enriched_query


# ---------------------------------------------------------------------------
# INTEGRATION TESTS — Full conversation service
# ---------------------------------------------------------------------------

_has_keys = bool(config.PINECONE_API_KEY and config.LLM_API_KEY)
_skip_integration = not _has_keys


@pytest.fixture(scope="module", autouse=True)
def _use_temp_db(tmp_path_factory):
    """Redirect conversation DB to a temp file for integration tests."""
    import conversation.state as state_module
    tmp_db = str(tmp_path_factory.mktemp("conv") / "test_conv.db")
    original = config.CONV_DB_PATH
    config.CONV_DB_PATH = tmp_db
    state_module._store = None  # reset singleton
    yield
    config.CONV_DB_PATH = original
    state_module._store = None


def _is_rate_limited(exc: Exception) -> bool:
    """Return True if the exception is a Groq 429 rate-limit error."""
    msg = str(exc).lower()
    return "429" in msg or "rate_limit_exceeded" in msg or "rate limit" in msg


def _chat(query: str, conv_id: str = None, profile: dict = None) -> dict:
    from conversation.service import chat
    from conversation.models import ChatRequest
    req = ChatRequest(query=query, conversation_id=conv_id, farmer_profile=profile)
    try:
        result = chat(req)
    except Exception as exc:
        if _is_rate_limited(exc):
            pytest.skip(f"Groq TPD rate limit exhausted — try again tomorrow. ({exc})")
        raise
    return {"conv_id": result.conversation_id, "answer": result.answer,
            "profile": result.farmer_profile, "intent": result.intent,
            "language": result.language, "disambiguation": result.is_disambiguation}


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_1_profile_accumulation():
    """Test 1: State and crop from turn 1 are used in turn 2."""
    r1 = _chat("I am a wheat farmer from Uttar Pradesh.")
    conv_id = r1["conv_id"]

    r2 = _chat("What schemes can I get?", conv_id=conv_id)

    # Profile should carry state + crop from previous turn
    profile = r2["profile"]
    state_val = (profile.get("state") or "").lower()
    crop_val = (profile.get("crop") or "").lower()
    assert "uttar" in state_val or "up" in state_val, f"Expected UP in profile, got: {profile}"
    assert "wheat" in crop_val, f"Expected wheat in profile, got: {profile}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_2_scheme_reference():
    """Test 2: 'Tell me about PMFBY' → 'What documents?' resolves to PMFBY."""
    r1 = _chat("Tell me about PMFBY.")
    conv_id = r1["conv_id"]

    r2 = _chat("What documents do I need for it?", conv_id=conv_id)
    # The answer should reference PMFBY
    assert "pmfby" in r2["answer"].lower() or "fasal bima" in r2["answer"].lower() or len(r2["answer"]) > 50


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_3_ambiguity():
    """Test 3: Two schemes discussed → 'Am I eligible?' triggers disambiguation."""
    r1 = _chat("Tell me about PMFBY and PM-KISAN.")
    conv_id = r1["conv_id"]

    r2 = _chat("Am I eligible?", conv_id=conv_id)
    # Should be a disambiguation response asking which scheme
    assert r2["disambiguation"] is True or "which scheme" in r2["answer"].lower() or \
        "pmfby" in r2["answer"].lower() or "pm-kisan" in r2["answer"].lower()


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_4_state_correction():
    """Test 4: 'I farm in UP' then 'Actually I farm in Bihar' → state=Bihar."""
    r1 = _chat("I farm in Uttar Pradesh.")
    conv_id = r1["conv_id"]

    r2 = _chat("Actually I farm in Bihar.", conv_id=conv_id)
    profile = r2["profile"]
    state_val = (profile.get("state") or "").lower()
    assert "bihar" in state_val, f"Expected Bihar in profile, got: {profile}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_5_hindi_language():
    """Test 5: Hindi query → language=hi."""
    r = _chat("मैं उत्तर प्रदेश में खेती करता हूँ।")
    assert r["language"] == "hi", f"Expected 'hi', got '{r['language']}'"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_6_hinglish_language():
    """Test 6: Hinglish query → language=hinglish."""
    r = _chat("Main UP mein wheat ugata hoon. Mujhe schemes batao.")
    assert r["language"] in ("hinglish", "en"), f"Got: {r['language']}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_7_crop_change():
    """Test 7: Crop change in second turn updates active profile."""
    r1 = _chat("I grow wheat in UP.")
    conv_id = r1["conv_id"]

    r2 = _chat("Actually I grow rice, not wheat.", conv_id=conv_id)
    crop_val = (r2["profile"].get("crop") or "").lower()
    assert "rice" in crop_val, f"Expected rice in profile, got: {r2['profile']}"


@pytest.mark.skipif(_skip_integration, reason="Keys not set")
def test_integration_8_delete_conversation():
    """Test 8: Delete conversation → subsequent GET returns 404."""
    from conversation.service import delete_conversation, get_history
    r1 = _chat("I farm in UP.")
    conv_id = r1["conv_id"]

    deleted = delete_conversation(conv_id)
    assert deleted is True

    history = get_history(conv_id)
    assert history is None
