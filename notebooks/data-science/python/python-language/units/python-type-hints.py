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
    mo.md("""
    ## 9. Type hints

    ### Exposition

    Type hints document intended interfaces and enable editor and static
    checker feedback. They describe runtime values but are not enforced by
    Python automatically.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_09_description__python_type_hints = mo.md(
        """
        ### Exercise

        Define `average(values: list[int]) -> float` and annotate `maybe_user`
        as a value that can be a string or `None`.
        """
    )
    exercise_09_starter__python_type_hints = mo.ui.code_editor(
        value='def average(values: list[int]) -> float:\n    return sum(values) / len(values)\n\nmaybe_user: str | None = None',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_09_submit__python_type_hints = mo.ui.run_button(label="Submit answer")
    return exercise_09_description__python_type_hints, exercise_09_starter__python_type_hints, exercise_09_submit__python_type_hints




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_09_description__python_type_hints, exercise_09_starter__python_type_hints, exercise_09_submit__python_type_hints):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["average"]([2, 4, 6]) == 4.0, "average is incorrect"
        assert ns["average"].__annotations__["values"] == list[int], "values hint is incorrect"
        assert ns["average"].__annotations__["return"] is float, "return hint is incorrect"
        assert ns["maybe_user"] is None, "maybe_user should start as None"
        return ns

    problem(mo, exercise_09_description__python_type_hints, exercise_09_starter__python_type_hints, _submission, exercise_09_submit__python_type_hints)
    return


if __name__ == "__main__":
    app.run()
