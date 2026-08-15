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
    ## 6. Iteration and generators

    ### Exposition

    Iterables can produce values one at a time, and generators make that
    production lazy. `enumerate` adds positions without manual counters.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_06_description__python_iteration = mo.md(
        """
        ### Exercise

        Create `indexed` as a list of one-based `(position, item)` pairs and
        create `evens` as a lazy generator of even numbers below `limit`.
        """
    )
    exercise_06_starter__python_iteration = mo.ui.code_editor(
        value='indexed = list(enumerate(items, 1))\nevens = (n for n in range(limit) if n % 2 == 0)',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_06_submit__python_iteration = mo.ui.run_button(label="Submit answer")
    return exercise_06_description__python_iteration, exercise_06_starter__python_iteration, exercise_06_submit__python_iteration




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_06_description__python_iteration, exercise_06_starter__python_iteration, exercise_06_submit__python_iteration):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"items": ["a", "b"], "limit": 6}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("indexed") == [(1, "a"), (2, "b")], "indexed is incorrect"
        assert list(ns["evens"]) == [0, 2, 4], "evens is incorrect"
        return ns

    problem(mo, exercise_06_description__python_iteration, exercise_06_starter__python_iteration, _submission, exercise_06_submit__python_iteration)
    return


if __name__ == "__main__":
    app.run()
