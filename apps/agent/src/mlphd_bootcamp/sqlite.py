"""File-backed SQLite helpers for browser-hosted MLPHD notebooks."""

from __future__ import annotations

import hashlib
import sqlite3
from pathlib import Path
from urllib.request import urlopen

RUNTIME_ROOT = Path("/tmp/mlphd-bootcamp")  # noqa: S108 - Pyodide's writable filesystem.


def _absolute_seed_url(seed_url: str) -> str:
    """Turn a site-relative URL into an absolute URL when running in Pyodide."""

    if not seed_url.startswith("/"):
        return seed_url

    try:
        from js import globalThis  # type: ignore[import-not-found]

        return f"{globalThis.location.origin}{seed_url}"
    except (ImportError, AttributeError):
        return seed_url


def _read_seed(seed_url: str, local_seed: str | Path | None) -> bytes:
    """Read a published seed URL, falling back to a local development file."""

    if seed_url:
        try:
            with urlopen(  # noqa: S310 - lesson-owned same-origin URL.
                _absolute_seed_url(seed_url)
            ) as response:
                return response.read()
        except Exception:
            if local_seed is None:
                raise

    if local_seed is None:
        raise FileNotFoundError("No SQLite seed URL or local seed path was provided.")
    return Path(local_seed).read_bytes()


def open_seed_database(
    database_name: str,
    *,
    seed_url: str | None = None,
    local_seed: str | Path | None = None,
) -> sqlite3.Connection:
    """Open a writable copy of a published SQLite seed database.

    The published seed is immutable. The copy lives in the writable Pyodide filesystem
    for the current notebook worker, so SQL mutations use a real file-backed connection
    while keeping the source database intact.
    """

    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)
    safe_name = Path(database_name).name
    target = RUNTIME_ROOT / safe_name

    if not target.exists():
        seed_bytes = _read_seed(seed_url or "", local_seed)
        target.write_bytes(seed_bytes)

    connection = sqlite3.connect(str(target))
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def database_fingerprint(path: str | Path) -> str:
    """Return a stable fingerprint useful for checking a generated seed file."""

    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
