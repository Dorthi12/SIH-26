"""
rag/ingestion/state_store.py — SQLite-backed ingestion state tracking.

Tracks which documents have been indexed and their content hash,
so re-runs can skip unchanged files.

Public API
----------
StateStore.should_reprocess(path, current_hash)  →  bool
StateStore.mark_processed(path, hash, chunk_count)
StateStore.get_record(path)                       →  dict | None
StateStore.from_config()                          →  StateStore (factory)
"""

from __future__ import annotations

import hashlib
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import config

log = logging.getLogger(__name__)

_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS ingestion_state (
    file_path       TEXT PRIMARY KEY,
    file_hash       TEXT NOT NULL,
    chunk_count     INTEGER NOT NULL DEFAULT 0,
    last_indexed_at TEXT NOT NULL
);
"""

_UPSERT_SQL = """
INSERT INTO ingestion_state (file_path, file_hash, chunk_count, last_indexed_at)
VALUES (?, ?, ?, ?)
ON CONFLICT(file_path) DO UPDATE SET
    file_hash       = excluded.file_hash,
    chunk_count     = excluded.chunk_count,
    last_indexed_at = excluded.last_indexed_at;
"""

_SELECT_SQL = """
SELECT file_path, file_hash, chunk_count, last_indexed_at
FROM ingestion_state
WHERE file_path = ?;
"""


# ---------------------------------------------------------------------------
# File hashing
# ---------------------------------------------------------------------------

def compute_file_hash(path: Path, algorithm: str = "md5") -> str:
    """
    Compute a hex digest of a file's contents.

    MD5 is used for speed — we only need change detection, not cryptographic
    security. The hash is reproducible for the same file content.
    """
    h = hashlib.new(algorithm)
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ---------------------------------------------------------------------------
# StateStore
# ---------------------------------------------------------------------------

class StateStore:
    """
    Persistent tracker of indexed documents.

    Uses SQLite so the state survives between pipeline runs without requiring
    an additional service. The DB file is created automatically if absent.
    """

    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        self._conn: Optional[sqlite3.Connection] = None

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is not None:
            return self._conn
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self._db_path))
        self._conn.row_factory = sqlite3.Row
        self._conn.execute(_CREATE_TABLE_SQL)
        self._conn.commit()
        log.debug("State DB opened: %s", self._db_path)
        return self._conn

    @classmethod
    def from_config(cls) -> "StateStore":
        return cls(config.STATE_DB_PATH)

    def should_reprocess(self, path: Path, current_hash: str) -> bool:
        """
        Return True if the document should be (re-)ingested.

        Returns True when:
        - The document has never been indexed.
        - The stored hash differs from current_hash (file has changed).

        Returns False when:
        - The stored hash matches current_hash (file is unchanged).
        """
        record = self.get_record(path)
        if record is None:
            log.debug("%s: not previously indexed — will process.", path.name)
            return True
        if record["file_hash"] != current_hash:
            log.debug(
                "%s: hash changed (%s → %s) — will reprocess.",
                path.name, record["file_hash"][:8], current_hash[:8],
            )
            return True
        log.debug("%s: unchanged (hash=%s) — skipping.", path.name, current_hash[:8])
        return False

    def mark_processed(self, path: Path, file_hash: str, chunk_count: int) -> None:
        """Record that a document has been successfully indexed."""
        conn = self._get_conn()
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(_UPSERT_SQL, (str(path), file_hash, chunk_count, now))
        conn.commit()
        log.debug("Marked processed: %s (%d chunks)", path.name, chunk_count)

    def get_record(self, path: Path) -> Optional[Dict[str, Any]]:
        """Return the stored state record for a path, or None if not found."""
        conn = self._get_conn()
        row = conn.execute(_SELECT_SQL, (str(path),)).fetchone()
        if row is None:
            return None
        return dict(row)

    def close(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None
