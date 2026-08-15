"""Build the canonical database for the aggregation lesson."""

import sqlite3
from pathlib import Path

from .common import rebuild_database

DATABASE_PATH = Path(__file__).resolve().parents[1] / "aggregation.sqlite"

MEASUREMENTS = [
    ("A", 10),
    ("A", 14),
    ("B", 7),
    ("B", 11),
]


def seed_aggregation_database(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE measurements (
          category TEXT NOT NULL,
          value INTEGER NOT NULL
        );
        """
    )
    connection.executemany(
        "INSERT INTO measurements (category, value) VALUES (?, ?)",
        MEASUREMENTS,
    )


def build_aggregation_database(target: Path = DATABASE_PATH) -> Path:
    return rebuild_database(target, seed_aggregation_database)


if __name__ == "__main__":
    print(f"Built {build_aggregation_database()}.")
