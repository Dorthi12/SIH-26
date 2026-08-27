"""
rag/conversation/state.py — SQLite-backed conversation persistence.

Thread-safe. Uses Python stdlib sqlite3 — zero new dependencies.
Database file: config.CONV_DB_PATH (default: rag/data/conversations.db)

Public API
----------
ConversationStore.create_conversation(user_id)         → ConversationState
ConversationStore.load_state(conv_id, user_id)         → ConversationState | None
ConversationStore.save_state(state)                    → None
ConversationStore.append_message(conv_id, msg)         → None
ConversationStore.get_messages(conv_id, limit)         → list[ConversationMessage]
ConversationStore.delete_conversation(conv_id, user_id)→ bool
get_store()                                            → ConversationStore singleton
"""

from __future__ import annotations

import json
import logging
import os
import random
import sqlite3
import string
import threading
from pathlib import Path
from typing import List, Optional

from rag import config
from rag.conversation.models import ConversationMessage, ConversationState

log = logging.getLogger(__name__)

_DDL = """
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id TEXT PRIMARY KEY,
    user_id         TEXT,
    state_json      TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role            TEXT NOT NULL,
    content         TEXT NOT NULL,
    timestamp       TEXT NOT NULL,
    metadata_json   TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (conversation_id)
        REFERENCES conversations (conversation_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conv
    ON conversation_messages (conversation_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_conversations_user
    ON conversations (user_id);
"""


def _new_conversation_id() -> str:
    """Generate a collision-resistant conversation ID like conv_a1b2c3d4."""
    chars = string.ascii_lowercase + string.digits
    suffix = "".join(random.choices(chars, k=8))
    return f"{config.CONV_ID_PREFIX}{suffix}"


class ConversationStore:
    """
    Thread-safe SQLite store for conversation state and messages.
    A single connection is held per thread via threading.local.
    """

    def __init__(self, db_path: str) -> None:
        self._db_path = db_path
        self._local = threading.local()
        self._init_lock = threading.Lock()
        self._ensure_db()

    def _ensure_db(self) -> None:
        """Create the database file and tables if they don't exist."""
        Path(self._db_path).parent.mkdir(parents=True, exist_ok=True)
        conn = self._connect()
        conn.executescript(_DDL)
        conn.commit()
        log.info("ConversationStore ready at %s", self._db_path)

    def _connect(self) -> sqlite3.Connection:
        """Return a per-thread connection, creating it if needed."""
        if not hasattr(self._local, "conn") or self._local.conn is None:
            self._local.conn = sqlite3.connect(
                self._db_path,
                check_same_thread=False,
                timeout=10,
            )
            self._local.conn.row_factory = sqlite3.Row
            self._local.conn.execute("PRAGMA journal_mode=WAL")
            self._local.conn.execute("PRAGMA foreign_keys=ON")
        return self._local.conn

    # ------------------------------------------------------------------
    # Conversation lifecycle
    # ------------------------------------------------------------------

    def create_conversation(self, user_id: Optional[str] = None) -> ConversationState:
        """Create and persist a new conversation. Returns the initial state."""
        state = ConversationState(
            conversation_id=_new_conversation_id(),
            user_id=user_id,
        )
        self.save_state(state)
        log.info("Created conversation %s for user=%s", state.conversation_id, user_id)
        return state

    def load_state(
        self,
        conversation_id: str,
        user_id: Optional[str] = None,
    ) -> Optional[ConversationState]:
        """
        Load conversation state. Returns None if not found.
        If user_id is provided, verifies ownership.
        """
        conn = self._connect()
        row = conn.execute(
            "SELECT state_json, user_id FROM conversations WHERE conversation_id = ?",
            (conversation_id,),
        ).fetchone()

        if row is None:
            return None

        # Ownership check — only enforce if user_id is provided
        if user_id and row["user_id"] and row["user_id"] != user_id:
            log.warning("Conversation %s ownership mismatch", conversation_id)
            return None

        state = ConversationState.from_dict(json.loads(row["state_json"]))
        return state

    def save_state(self, state: ConversationState) -> None:
        """Persist (upsert) the conversation state."""
        state.touch()
        conn = self._connect()
        conn.execute(
            """
            INSERT INTO conversations (conversation_id, user_id, state_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(conversation_id) DO UPDATE SET
                state_json = excluded.state_json,
                user_id    = excluded.user_id,
                updated_at = excluded.updated_at
            """,
            (
                state.conversation_id,
                state.user_id,
                json.dumps(state.to_dict()),
                state.created_at,
                state.updated_at,
            ),
        )
        conn.commit()

    def delete_conversation(
        self,
        conversation_id: str,
        user_id: Optional[str] = None,
    ) -> bool:
        """
        Delete a conversation and all its messages.
        Returns True if deleted, False if not found or unauthorised.
        """
        # Verify ownership before delete
        state = self.load_state(conversation_id, user_id)
        if state is None:
            return False

        conn = self._connect()
        conn.execute(
            "DELETE FROM conversations WHERE conversation_id = ?",
            (conversation_id,),
        )
        conn.commit()
        log.info("Deleted conversation %s", conversation_id)
        return True

    def list_conversations(self, user_id: str) -> List[str]:
        """Return all conversation_ids for a user (most recent first)."""
        conn = self._connect()
        rows = conn.execute(
            "SELECT conversation_id FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,),
        ).fetchall()
        return [r["conversation_id"] for r in rows]

    # ------------------------------------------------------------------
    # Message management
    # ------------------------------------------------------------------

    def append_message(self, msg: ConversationMessage) -> None:
        """Append a message to the conversation."""
        metadata = {
            "language": msg.language,
            "intent": msg.intent,
            "scheme_ids": msg.scheme_ids,
            "source_ids": msg.source_ids,
        }
        conn = self._connect()
        conn.execute(
            """
            INSERT INTO conversation_messages
                (conversation_id, role, content, timestamp, metadata_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                msg.conversation_id,
                msg.role,
                msg.content,
                msg.timestamp,
                json.dumps(metadata),
            ),
        )
        conn.commit()

    def get_messages(
        self,
        conversation_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> List[ConversationMessage]:
        """Return the most recent `limit` messages for a conversation."""
        conn = self._connect()
        rows = conn.execute(
            """
            SELECT role, content, timestamp, metadata_json
            FROM conversation_messages
            WHERE conversation_id = ?
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
            """,
            (conversation_id, limit, offset),
        ).fetchall()

        messages = []
        for row in reversed(rows):  # oldest first
            meta = json.loads(row["metadata_json"])
            messages.append(
                ConversationMessage(
                    conversation_id=conversation_id,
                    role=row["role"],
                    content=row["content"],
                    timestamp=row["timestamp"],
                    language=meta.get("language", "en"),
                    intent=meta.get("intent"),
                    scheme_ids=meta.get("scheme_ids", []),
                    source_ids=meta.get("source_ids", []),
                )
            )
        return messages

    def message_count(self, conversation_id: str) -> int:
        """Return total message count for a conversation."""
        conn = self._connect()
        row = conn.execute(
            "SELECT COUNT(*) as n FROM conversation_messages WHERE conversation_id = ?",
            (conversation_id,),
        ).fetchone()
        return row["n"] if row else 0


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_store: Optional[ConversationStore] = None
_store_lock = threading.Lock()


def get_store() -> ConversationStore:
    """Return the singleton ConversationStore (created on first call)."""
    global _store
    if _store is None:
        with _store_lock:
            if _store is None:
                _store = ConversationStore(config.CONV_DB_PATH)
    return _store
