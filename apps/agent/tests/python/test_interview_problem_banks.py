import json
import re
import sqlite3

from database.builders.build_machine_learning_problem_bank import (
    build_machine_learning_problem_bank,
)
from database.builders.build_python_algorithm_problem_bank import (
    build_python_algorithm_problem_bank,
)


def test_python_algorithm_problem_bank(tmp_path):
    database = build_python_algorithm_problem_bank(
        tmp_path / "python_algorithm_problem_bank.sqlite"
    )
    connection = sqlite3.connect(database)

    assert connection.execute("PRAGMA integrity_check").fetchone() == ("ok",)
    assert connection.execute("SELECT COUNT(*) FROM questions").fetchone() == (30,)
    assert connection.execute(
        "SELECT difficulty, COUNT(*) FROM questions GROUP BY difficulty ORDER BY difficulty"
    ).fetchall() == [("easy", 6), ("hard", 6), ("medium", 18)]
    assert [
        row[0]
        for row in connection.execute(
            "SELECT question_id FROM questions ORDER BY question_id"
        )
    ] == [f"q{number:02d}" for number in range(1, 31)]
    assert connection.execute("SELECT question_id FROM q01").fetchone() == ("q01",)
    assert connection.execute("SELECT question_id FROM q30").fetchone() == ("q30",)
    for checker_spec, in connection.execute("SELECT checker_spec FROM questions"):
        tests = json.loads(checker_spec)
        assert tests
        assert all(test["expression"] and test["label"] for test in tests)


def test_machine_learning_problem_bank(tmp_path):
    database = build_machine_learning_problem_bank(
        tmp_path / "machine_learning_problem_bank.sqlite"
    )
    connection = sqlite3.connect(database)

    assert connection.execute("PRAGMA integrity_check").fetchone() == ("ok",)
    assert connection.execute("SELECT COUNT(*) FROM questions").fetchone() == (35,)
    assert connection.execute(
        "SELECT difficulty, COUNT(*) FROM questions GROUP BY difficulty ORDER BY difficulty"
    ).fetchall() == [("easy", 11), ("hard", 9), ("medium", 15)]
    assert connection.execute(
        "SELECT source_solution_status, COUNT(*) FROM questions "
        "GROUP BY source_solution_status ORDER BY source_solution_status"
    ).fetchall() == [("captured", 30), ("missing", 5)]
    assert [
        row[0]
        for row in connection.execute(
            "SELECT question_id FROM questions ORDER BY question_id"
        )
    ] == [f"q{number:02d}" for number in range(1, 36)]
    assert connection.execute("SELECT question_id FROM q01").fetchone() == ("q01",)
    assert connection.execute("SELECT question_id FROM q35").fetchone() == ("q35",)
    for answer, checker_spec in connection.execute(
        "SELECT answer, checker_spec FROM questions"
    ):
        groups = json.loads(checker_spec)["required_concept_groups"]
        assert len(groups) >= 4
        assert all(group for group in groups)
        normalized = re.sub(r"[^a-z0-9+^-]+", " ", answer.casefold())
        assert all(
            any(term.casefold() in normalized for term in group) for group in groups
        )
