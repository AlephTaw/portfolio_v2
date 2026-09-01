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
    ## 15. Virtual environments and interpreter commands

    ### Exposition

    Virtual environments isolate dependencies between projects. Using
    `python -m` ties package installation and module execution to a specific
    interpreter.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_15_description__python_environments_cli = mo.md(
        """
        ### Exercise

        Create `commands` as the three shell commands needed to create a `.venv`,
        install a package with the active interpreter, and run a module.
        """
    )
    exercise_15_starter__python_environments_cli = mo.ui.code_editor(
        value='commands = [\n    "python -m venv .venv",\n    "python -m pip install package-name",\n    "python -m package.module",\n]',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_15_submit__python_environments_cli = mo.ui.run_button(label="Submit answer")
    return exercise_15_description__python_environments_cli, exercise_15_starter__python_environments_cli, exercise_15_submit__python_environments_cli




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_15_description__python_environments_cli, exercise_15_starter__python_environments_cli, exercise_15_submit__python_environments_cli):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns.get("commands") == [
            "python -m venv .venv",
            "python -m pip install package-name",
            "python -m package.module",
        ], "one or more interpreter commands are incorrect"
        return ns

    problem(mo, exercise_15_description__python_environments_cli, exercise_15_starter__python_environments_cli, _submission, exercise_15_submit__python_environments_cli)
    return


if __name__ == "__main__":
    app.run()
