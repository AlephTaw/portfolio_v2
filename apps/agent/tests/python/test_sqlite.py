import sqlite3

import mlphd_bootcamp.sqlite as sqlite_helpers
from database.builders import build_aggregation_database, build_select_database
from mlphd_bootcamp import open_seed_database


def test_canonical_databases_are_valid():
    expected = {
        "database/select.sqlite": ("SELECT COUNT(*) FROM people", 3),
        "database/aggregation.sqlite": ("SELECT COUNT(*) FROM measurements", 4),
    }

    for path, (query, count) in expected.items():
        connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        try:
            assert connection.execute("PRAGMA integrity_check").fetchone() == ("ok",)
            assert connection.execute(query).fetchone() == (count,)
        finally:
            connection.close()


def test_open_seed_database_creates_an_independent_writable_copy(tmp_path, monkeypatch):
    monkeypatch.setattr(sqlite_helpers, "RUNTIME_ROOT", tmp_path / "runtime")

    connection = open_seed_database(
        "select.sqlite",
        local_seed="database/select.sqlite",
    )
    connection.execute("DELETE FROM people WHERE name = 'Ada'")
    connection.commit()
    connection.close()

    source = sqlite3.connect("file:database/select.sqlite?mode=ro", uri=True)
    try:
        assert source.execute("SELECT COUNT(*) FROM people").fetchone() == (3,)
    finally:
        source.close()


def test_database_builders_reproduce_lesson_data(tmp_path):
    select_path = build_select_database(tmp_path / "select.sqlite")
    aggregation_path = build_aggregation_database(tmp_path / "aggregation.sqlite")

    select = sqlite3.connect(select_path)
    aggregation = sqlite3.connect(aggregation_path)
    try:
        assert select.execute("SELECT id, name, field FROM people ORDER BY id").fetchall() == [
            (1, "Ada", "mathematics"),
            (2, "Grace", "computing"),
            (3, "Katherine", "physics"),
        ]
        assert aggregation.execute(
            "SELECT category, value FROM measurements ORDER BY category, value"
        ).fetchall() == [
            ("A", 10),
            ("A", 14),
            ("B", 7),
            ("B", 11),
        ]
    finally:
        select.close()
        aggregation.close()
