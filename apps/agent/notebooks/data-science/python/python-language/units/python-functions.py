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
    ## 4. Functions and parameter forms

    ### Exposition

    Functions package behavior for reuse and testing. Defaults, keyword-only
    parameters, positional-only parameters, `*args`, and `**kwargs` let a
    function express a precise calling interface.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_04_description__python_functions = mo.md(
        """
        ### Exercise

        Define `greet(name=\"world\")` and `total(*numbers)`. The first returns a
        greeting; the second returns the sum of all positional numbers.
        """
    )
    exercise_04_starter__python_functions = mo.ui.code_editor(
        value='def greet(name="world"):\n    return f"Hello, {name}!"\n\ndef total(*numbers):\n    return sum(numbers)',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_04_submit__python_functions = mo.ui.run_button(label="Submit answer")
    return exercise_04_description__python_functions, exercise_04_starter__python_functions, exercise_04_submit__python_functions




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_04_description__python_functions, exercise_04_starter__python_functions, exercise_04_submit__python_functions):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["greet"]() == "Hello, world!", "greet default is incorrect"
        assert ns["greet"]("Ada") == "Hello, Ada!", "greet argument is incorrect"
        assert ns["total"](1, 2, 3) == 6, "total is incorrect"
        return ns

    problem(mo, exercise_04_description__python_functions, exercise_04_starter__python_functions, _submission, exercise_04_submit__python_functions)
    return


if __name__ == "__main__":
    app.run()
