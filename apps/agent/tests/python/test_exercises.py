from mlphd_bootcamp import run_python_tests


def test_run_python_tests_accepts_a_correct_submission() -> None:
    def check(namespace):
        assert namespace["square"](4) == 16, "square(4) should return 16"

    result = run_python_tests("def square(value):\n    return value * value", [check])

    assert result.correct is True
    assert result.message == "Correct."


def test_run_python_tests_returns_learner_feedback() -> None:
    def check(namespace):
        assert namespace["square"](4) == 16, "square(4) should return 16"

    result = run_python_tests("def square(value):\n    return value + value", [check])

    assert result.correct is False
    assert result.message.startswith("square(4) should return 16")
