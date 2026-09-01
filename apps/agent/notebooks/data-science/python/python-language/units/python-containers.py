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
    ## 5. Containers, comprehensions, and unpacking

    ### Exposition

    Lists, tuples, dictionaries, and sets organize related values. Slicing,
    comprehensions, and `*`/`**` unpacking provide concise transformations
    while preserving the underlying container semantics.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_05_description__python_containers = mo.md(
        """
        ### Exercise

        Create `squares` for positive numbers in `numbers`, and merge `defaults`
        with `overrides` so that override values win.
        """
    )
    exercise_05_starter__python_containers = mo.ui.code_editor(
        value='squares = [n * n for n in numbers if n > 0]\nmerged = {**defaults, **overrides}',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_05_submit__python_containers = mo.ui.run_button(label="Submit answer")
    return exercise_05_description__python_containers, exercise_05_starter__python_containers, exercise_05_submit__python_containers




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_05_description__python_containers, exercise_05_starter__python_containers, exercise_05_submit__python_containers):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"numbers": [-2, -1, 0, 2, 3], "defaults": {"a": 1, "b": 2}, "overrides": {"b": 9}}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("squares") == [4, 9], "squares is incorrect"
        assert ns.get("merged") == {"a": 1, "b": 9}, "merged is incorrect"
        return ns

    problem(mo, exercise_05_description__python_containers, exercise_05_starter__python_containers, _submission, exercise_05_submit__python_containers)
    return


if __name__ == "__main__":
    app.run()
