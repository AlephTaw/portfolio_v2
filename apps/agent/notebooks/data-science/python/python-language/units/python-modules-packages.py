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
    ## 11. Modules and packages

    ### Exposition

    Modules divide a program into reusable namespaces, and packages organize
    modules into a larger project. The `__main__` guard keeps imports from
    accidentally running a script.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_11_description__python_modules_packages = mo.md(
        """
        ### Exercise

        Import `Path` from `pathlib` and expose a `main()` call only when the
        module runs as a script by using the `__name__` guard.
        """
    )
    exercise_11_starter__python_modules_packages = mo.ui.code_editor(
        value='from pathlib import Path\n\ndef main():\n    return Path(".").name\n\nif __name__ == "__main__":\n    main()',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    exercise_11_submit__python_modules_packages = mo.ui.run_button(label="Submit answer")
    return exercise_11_description__python_modules_packages, exercise_11_starter__python_modules_packages, exercise_11_submit__python_modules_packages




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_11_description__python_modules_packages, exercise_11_starter__python_modules_packages, exercise_11_submit__python_modules_packages):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["Path"]("data.txt").name == "data.txt", "Path was not imported correctly"
        assert callable(ns["main"]), "main is missing"
        return ns

    problem(mo, exercise_11_description__python_modules_packages, exercise_11_starter__python_modules_packages, _submission, exercise_11_submit__python_modules_packages)
    return


if __name__ == "__main__":
    app.run()
