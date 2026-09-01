# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo[sql]>=0.23.16"]
# ///

"""Interview-focused Python algorithms tutorial for data scientists."""

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp import assertion, execute_submission, problem

    return assertion, execute_submission, mo, problem


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # Python algorithms for data science interviews

    **Prerequisites:** Python functions, lists, dictionaries, sets, loops,
    and basic complexity notation.

    This notebook focuses on reusable algorithmic patterns rather than
    memorizing isolated solutions. Exercises are automatically graded and
    run only in an isolated Python namespace; no external services are used.
    """)
    return


@app.cell(hide_code=True)
def _(assertion, mo):
    import contextlib as _contextlib
    import io as _io
    import json as _json
    import math as _math

    from mlphd_bootcamp import open_seed_database as _open_seed_database

    _algorithm_bank = _open_seed_database(
        "python_algorithm_problem_bank.sqlite",
        seed_url="/bootcamp/data/python_algorithm_problem_bank.sqlite",
        local_seed="database/python_algorithm_problem_bank.sqlite",
    )

    def _algo_record(question_id):
        return _algorithm_bank.execute(
            """
            SELECT source_number, company, title, difficulty, question, starter,
                   answer, checker_spec, notes
            FROM questions WHERE question_id = ?
            """,
            (question_id,),
        ).fetchone()

    def _algo_canonical(value):
        if isinstance(value, tuple):
            return [_algo_canonical(item) for item in value]
        if isinstance(value, list):
            return [_algo_canonical(item) for item in value]
        return value

    def _algo_approx(actual, expected, tolerance):
        if isinstance(expected, list):
            return isinstance(actual, (list, tuple)) and len(actual) == len(expected) and all(
                _algo_approx(left, right, tolerance)
                for left, right in zip(actual, expected)
            )
        return _math.isclose(float(actual), float(expected), rel_tol=tolerance, abs_tol=tolerance)

    def _algo_matches(actual, test):
        expected = test["expected"]
        comparison = test["comparison"]
        if comparison == "approx":
            return _algo_approx(actual, expected, test.get("tolerance") or 1e-8)
        if comparison == "unordered":
            return sorted(map(repr, _algo_canonical(actual))) == sorted(map(repr, expected))
        if comparison == "nested_unordered":
            actual_groups = [sorted(map(repr, group)) for group in _algo_canonical(actual)]
            expected_groups = [sorted(map(repr, group)) for group in expected]
            return sorted(map(repr, actual_groups)) == sorted(map(repr, expected_groups))
        return _algo_canonical(actual) == expected

    def _algo_execute(question_id, source):
        if not isinstance(source, str) or not source.strip():
            raise AssertionError("Enter Python code before submitting.")
        tests = _json.loads(_algo_record(question_id)[7])
        namespace = {"__name__": "__submission__"}
        output = _io.StringIO()
        results = []
        with _contextlib.redirect_stdout(output):
            exec(compile(source, f"<{question_id}-submission>", "exec"), namespace, namespace)
            for test in tests:
                test_namespace = dict(namespace)
                if test.get("setup"):
                    exec(test["setup"], test_namespace, test_namespace)
                actual = eval(  # noqa: S307 - bank-owned tests grade learner code.
                    test["expression"], test_namespace, test_namespace
                )
                passed = _algo_matches(actual, test)
                results.append({**test, "actual": actual, "passed": passed})
        return {"tests": results, "stdout": output.getvalue()}

    def _algo_assert(result):
        failures = [test["label"] for test in result["tests"] if not test["passed"]]
        assert not failures, "Failing checks: " + ", ".join(failures)

    def _algo_console(result=None, error=None):
        if error is not None:
            safe_error = str(error).replace("```", "''' ")
            return mo.md(f"### Python output\n\n```text\n{type(error).__name__}: {safe_error}\n```")
        lines = []
        if result["stdout"]:
            lines.extend(["stdout:", result["stdout"].rstrip(), ""])
        for test in result["tests"]:
            status = "PASS" if test["passed"] else "FAIL"
            lines.append(f"[{status}] {test['label']}: {test['actual']!r}")
            if not test["passed"]:
                lines.append(f"       expected: {test['expected']!r}")
        safe_output = "\n".join(lines).replace("```", "''' ")
        return mo.md(f"### Python output\n\n```text\n{safe_output}\n```")

    def algo_make_problem(question_id):
        source_number, company, title, difficulty, question, starter, answer, _spec, notes = _algo_record(question_id)
        text = (
            f"### {question_id.upper()} · {company}: {title}\n\n"
            f"**Exercise:** {question}\n\n"
            f"**Difficulty:** {difficulty.title()} · **Source:** {source_number}"
        )
        if notes:
            text += f"\n\n**Reconciliation note:** {notes}"
        editor = mo.ui.code_editor(
            value=starter,
            language="python",
            label=f"{question_id.upper()} Python answer",
            min_height=220,
        )
        form = editor.form(
            submit_button_label="Submit answer", clear_on_submit=False, bordered=False
        )
        reveal = mo.accordion({"Reveal reference answer": mo.md(f"```python\n{answer}\n```")})
        return mo.vstack([mo.md(text), form, reveal], gap=1), form

    def algo_grade_problem(question_id, source):
        if source is None:
            return mo.callout("Write your answer, then select **Submit answer**.", kind="neutral")
        execution = {}

        @assertion(_algo_assert)
        def _submission(submitted_source):
            try:
                result = _algo_execute(question_id, submitted_source)
            except Exception as error:
                execution["error"] = error
                raise
            execution["result"] = result
            return result

        return mo.vstack([
            _submission(source),
            _algo_console(result=execution.get("result"), error=execution.get("error")),
        ], gap=1)

    return algo_grade_problem, algo_make_problem


@app.cell
def _(mo):
    _mlphd_unit_body = True
    # === MLPHD UNIT START ===
    # id: python-algorithms-sliding-window
    # title: Two pointers and sliding windows
    # kind: exposition
    # difficulty: medium
    # teaches: python-algorithms-sliding-window
    # assesses: python-algorithms-sliding-window
    # requires: python-algorithms-searching
    # ===
    mo.md("""
    ## 4. Two pointers and sliding windows

    **Motivation:** Recomputing every subarray often creates quadratic work;
    maintaining a moving window can reduce it to one pass.

    **Goal:** Maintain the sum of a fixed-size window as it moves across a
    sequence.
    """)
    return


@app.cell
def _(mo):
    exercise_04_description__python_algorithms_sliding_window = mo.md(
        """
        ### Exercise

        Define `max_window_sum(values, size)` returning the largest sum of any
        contiguous window of length `size`. Return `None` for invalid sizes.
        """
    )
    exercise_04_starter__python_algorithms_sliding_window = mo.ui.code_editor(
        value='def max_window_sum(values, size):\n    if size <= 0 or size > len(values):\n        return None\n    current = sum(values[:size])\n    best = current\n    for index in range(size, len(values)):\n        current += values[index] - values[index - size]\n        best = max(best, current)\n    return best',
        language="python",
        label="Your Python answer",
        min_height=240,
    )
    exercise_04_submit__python_algorithms_sliding_window = mo.ui.run_button(label="Submit answer")
    return exercise_04_description__python_algorithms_sliding_window, exercise_04_starter__python_algorithms_sliding_window, exercise_04_submit__python_algorithms_sliding_window


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_04_description__python_algorithms_sliding_window,
    exercise_04_starter__python_algorithms_sliding_window,
    exercise_04_submit__python_algorithms_sliding_window,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["max_window_sum"]
        assert _function([2, 1, 5, 1, 3, 2], 3) == 9, "window maximum is incorrect"
        assert _function([1, 2], 0) is None, "handle invalid sizes"
        return _namespace

    problem(mo, exercise_04_description__python_algorithms_sliding_window, exercise_04_starter__python_algorithms_sliding_window, _submission, exercise_04_submit__python_algorithms_sliding_window)
    return


if __name__ == "__main__":
    app.run()
