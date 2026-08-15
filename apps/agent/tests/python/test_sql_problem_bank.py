import re
import sqlite3

from database.builders.build_sql_problem_bank import build_sql_problem_bank


def _scoped_sql(connection: sqlite3.Connection, question_id: str, sql: str) -> str:
    mappings = connection.execute(
        "SELECT logical_name, physical_name FROM question_tables WHERE question_id = ?",
        (question_id,),
    ).fetchall()
    for logical_name, physical_name in sorted(mappings, key=lambda row: -len(row[0])):
        sql = re.sub(
            rf"(?<![\w]){re.escape(logical_name)}(?![\w])",
            f'"{physical_name}"',
            sql,
            flags=re.IGNORECASE,
        )
    return sql


def test_sql_problem_bank_inventory_and_answers(tmp_path):
    database = build_sql_problem_bank(tmp_path / "sql_problem_bank.sqlite")
    connection = sqlite3.connect(database)

    assert connection.execute("PRAGMA integrity_check").fetchone() == ("ok",)
    assert connection.execute("SELECT COUNT(*) FROM questions").fetchone() == (35,)
    assert connection.execute(
        "SELECT COUNT(*) FROM questions WHERE answer_type = 'sql'"
    ).fetchone() == (25,)
    assert connection.execute("SELECT COUNT(*) FROM question_tables").fetchone() == (30,)

    identifiers = [
        row[0]
        for row in connection.execute(
            "SELECT question_id FROM questions ORDER BY question_id"
        )
    ]
    assert identifiers == [f"q{number:02d}" for number in range(1, 36)]
    assert connection.execute("SELECT question_id FROM q01").fetchone() == ("q01",)
    assert connection.execute("SELECT question_id FROM q35").fetchone() == ("q35",)

    for question_id, answer in connection.execute(
        "SELECT question_id, answer FROM questions WHERE answer_type = 'sql'"
    ):
        cursor = connection.execute(_scoped_sql(connection, question_id, answer))
        assert cursor.description, question_id
        assert cursor.fetchall(), question_id


def test_each_physical_table_is_owned_by_its_question(tmp_path):
    database = build_sql_problem_bank(tmp_path / "sql_problem_bank.sqlite")
    connection = sqlite3.connect(database)

    for question_id, logical_name, physical_name in connection.execute(
        "SELECT question_id, logical_name, physical_name FROM question_tables"
    ):
        assert physical_name == f"{question_id}__{logical_name}"
        assert connection.execute(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?",
            (physical_name,),
        ).fetchone() == (1,)
