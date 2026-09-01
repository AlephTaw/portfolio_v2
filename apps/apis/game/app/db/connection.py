import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = "sqlite:///./data/game.sqlite3"
SQLITE_URL_PREFIX = "sqlite:///"


def resolve_database_target(database_url: str | None = None) -> str:
    configured_url = database_url or os.getenv("GAME_DATABASE_URL", DEFAULT_DATABASE_URL)
    if not configured_url.startswith(SQLITE_URL_PREFIX):
        raise ValueError("GAME_DATABASE_URL must begin with sqlite:///")

    configured_path = configured_url.removeprefix(SQLITE_URL_PREFIX)
    if configured_path == ":memory:":
        return configured_path

    path = Path(configured_path).expanduser()
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return str(path.resolve())


@contextmanager
def connect(database_url: str | None = None) -> Iterator[sqlite3.Connection]:
    target = resolve_database_target(database_url)
    if target != ":memory:":
        Path(target).parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(target)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(database_url: str | None = None) -> None:
    """Create the SQLite file and its infrastructure metadata table."""
    with connect(database_url) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
