"""Validate and publish canonical MLPHD SQLite databases as static web assets."""

import shutil
import sqlite3
from pathlib import Path

from . import DATABASE_BUILDERS

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIRECTORY = ROOT / "database"
PUBLIC_DIRECTORY = ROOT / "public" / "bootcamp" / "data"


def validate_database(path: Path) -> None:
    """Reject invalid or corrupt source databases before publishing them."""

    if path.read_bytes()[:16] != b"SQLite format 3\x00":
        raise RuntimeError(f"Not a SQLite database: {path}")

    connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        result = connection.execute("PRAGMA integrity_check").fetchone()
    finally:
        connection.close()

    if result != ("ok",):
        raise RuntimeError(f"SQLite integrity check failed for {path}: {result}")


def publish_databases() -> list[Path]:
    """Synchronize registered canonical databases into the public directory."""

    sources = [SOURCE_DIRECTORY / name for name in DATABASE_BUILDERS]
    missing = [path for path in sources if not path.is_file()]
    if missing:
        raise RuntimeError(f"Missing generated canonical SQLite databases: {missing}")

    PUBLIC_DIRECTORY.mkdir(parents=True, exist_ok=True)
    managed_names = set(DATABASE_BUILDERS)
    for stale in PUBLIC_DIRECTORY.glob("*.sqlite"):
        if stale.name not in managed_names:
            if stale.is_symlink() or not stale.is_file():
                raise RuntimeError(f"Refusing to remove unexpected database asset: {stale}")
            stale.unlink()

    published = []
    for source in sources:
        validate_database(source)
        destination = PUBLIC_DIRECTORY / source.name
        shutil.copy2(source, destination)
        published.append(destination)
    return published


def main() -> None:
    published = publish_databases()
    print(f"Published {len(published)} SQLite databases to {PUBLIC_DIRECTORY}.")


if __name__ == "__main__":
    main()
