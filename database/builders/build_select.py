"""Build the canonical database for the SELECT and filtering lesson."""

import sqlite3
from pathlib import Path

from .common import rebuild_database

DATABASE_PATH = Path(__file__).resolve().parents[1] / "select.sqlite"

PEOPLE = [
    (1, "Ada", "mathematics"),
    (2, "Grace", "computing"),
    (3, "Katherine", "physics"),
]


def seed_select_database(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE people (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          field TEXT NOT NULL
        );
        """
    )
    connection.executemany(
        "INSERT INTO people (id, name, field) VALUES (?, ?, ?)",
        PEOPLE,
    )


def build_select_database(target: Path = DATABASE_PATH) -> Path:
    return rebuild_database(target, seed_select_database)


if __name__ == "__main__":
    print(f"Built {build_select_database()}.")
