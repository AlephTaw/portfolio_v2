# /// script
# dependencies = ["marimo"]
# requires-python = ">=3.12"
# ///

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
    # Python tutorial

    This notebook turns the Python tutorial cheat sheet into short,
    auto-graded implementation exercises. Each exercise has three parts:

    1. a description of the task;
    2. an interactive Python code input area;
    3. an assertion-decorated submission that reports **Correct** or **Not yet**.

    Submit code that creates the names requested by each prompt. Your code is
    executed in an isolated namespace for that exercise.
    """)
    return


@app.cell
def _(mo):
    _mlphd_unit_body = True
    mo.md("""
    ## 2. Expressions, truthiness, and built-ins

    ### Exposition

    Expressions produce values using arithmetic, comparison, Boolean, and
    conditional operators. Empty containers and zero are falsey; `any`,
    `all`, and conversion built-ins make common checks explicit.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_02_description__python_expressions_truthiness = mo.md(
        """
        ### Exercise

        Create `parity` as `even` or `odd`, call `load()` only when `cached` is
        falsey, and set `passed` to whether every score is at least `60`.
        """
    )
    exercise_02_starter__python_expressions_truthiness = mo.ui.code_editor(
        value='parity = "even" if n % 2 == 0 else "odd"\nresult = cached or load()\npassed = all(score >= 60 for score in scores)',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_02_submit__python_expressions_truthiness = mo.ui.run_button(label="Submit answer")
    return exercise_02_description__python_expressions_truthiness, exercise_02_starter__python_expressions_truthiness, exercise_02_submit__python_expressions_truthiness




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_02_description__python_expressions_truthiness, exercise_02_starter__python_expressions_truthiness, exercise_02_submit__python_expressions_truthiness):
    @assertion(lambda ns: ns)
    def _submission(source):
        calls = []

        def load():
            calls.append("loaded")
            return "fresh"

        ns = {"n": 4, "cached": "", "scores": [60, 80], "load": load}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("parity") == "even", "parity is incorrect"
        assert ns.get("result") == "fresh" and calls == ["loaded"], "short-circuit load is incorrect"
        assert ns.get("passed") is True, "passed is incorrect"
        return ns

    problem(mo, exercise_02_description__python_expressions_truthiness, exercise_02_starter__python_expressions_truthiness, _submission, exercise_02_submit__python_expressions_truthiness)
    return


if __name__ == "__main__":
    app.run()
