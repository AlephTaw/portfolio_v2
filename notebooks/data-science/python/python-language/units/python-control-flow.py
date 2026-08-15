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
    ## 3. Control flow and pattern matching

    ### Exposition

    Branches select a path, loops repeat work, and `break` or `continue`
    refine iteration. `match` makes structural cases readable when values
    have several possible shapes.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_03_description__python_control_flow = mo.md(
        """
        ### Exercise

        Given `command = (\"move\", \"north\")`, set `direction` to `\"north\"`
        using a `match` statement; set it to `None` for any other command.
        """
    )
    exercise_03_starter__python_control_flow = mo.ui.code_editor(
        value='command = ("move", "north")\nmatch command:\n    case ("move", value):\n        direction = value\n    case _:\n        direction = None',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_03_submit__python_control_flow = mo.ui.run_button(label="Submit answer")
    return exercise_03_description__python_control_flow, exercise_03_starter__python_control_flow, exercise_03_submit__python_control_flow




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_03_description__python_control_flow, exercise_03_starter__python_control_flow, exercise_03_submit__python_control_flow):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"command": ("move", "north")}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("direction") == "north", "direction is incorrect"
        return ns

    problem(mo, exercise_03_description__python_control_flow, exercise_03_starter__python_control_flow, _submission, exercise_03_submit__python_control_flow)
    return


if __name__ == "__main__":
    app.run()
