"""Shared utilities for replacing canonical SQLite databases safely."""

import os
import sqlite3
import tempfile
from collections.abc import Callable
from pathlib import Path

SeedDatabase = Callable[[sqlite3.Connection], None]


def rebuild_database(target: Path, seed: SeedDatabase) -> Path:
    """Build a database in a temporary file and atomically replace its target."""

    target = target.resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{target.stem}-",
        suffix=".sqlite.tmp",
        dir=target.parent,
    )
    os.close(descriptor)
    temporary = Path(temporary_name)

    try:
        connection = sqlite3.connect(temporary)
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            seed(connection)
            connection.commit()
            integrity = connection.execute("PRAGMA integrity_check").fetchone()
            if integrity != ("ok",):
                raise RuntimeError(f"SQLite integrity check failed: {integrity}")
        finally:
            connection.close()

        os.replace(temporary, target)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise

    return target
