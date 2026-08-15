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
    ## 10. Decorators

    ### Exposition

    A decorator wraps or modifies a function or class. `functools.wraps`
    preserves metadata so decorated functions remain discoverable and
    debuggable.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_10_description__python_decorators = mo.md(
        """
        ### Exercise

        Define `logged` so that it returns a wrapped function preserving the
        original metadata with `functools.wraps` and returning the original result.
        """
    )
    exercise_10_starter__python_decorators = mo.ui.code_editor(
        value='from functools import wraps\n\ndef logged(function):\n    @wraps(function)\n    def wrapper(*args, **kwargs):\n        return function(*args, **kwargs)\n    return wrapper',
        language="python",
        label="Your Python answer",
        min_height=220,
    )
    exercise_10_submit__python_decorators = mo.ui.run_button(label="Submit answer")
    return exercise_10_description__python_decorators, exercise_10_starter__python_decorators, exercise_10_submit__python_decorators




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_10_description__python_decorators, exercise_10_starter__python_decorators, exercise_10_submit__python_decorators):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        @ns["logged"]
        def add(a, b):
            """Add two values."""
            return a + b

        assert add(2, 3) == 5, "wrapped result is incorrect"
        assert add.__name__ == "add", "wrapper did not preserve __name__"
        assert add.__doc__ == "Add two values.", "wrapper did not preserve __doc__"
        return ns

    problem(mo, exercise_10_description__python_decorators, exercise_10_starter__python_decorators, _submission, exercise_10_submit__python_decorators)
    return


if __name__ == "__main__":
    app.run()
