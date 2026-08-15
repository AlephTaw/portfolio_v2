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
    ## 12. Input, output, and structured data

    ### Exposition

    Input and output connect programs to people, files, and other systems.
    JSON provides a portable representation for common nested Python data.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_12_description__python_io_json = mo.md(
        """
        ### Exercise

        Create `encoded` with indented JSON from `payload`, then decode it into
        `decoded` so the data round-trips unchanged.
        """
    )
    exercise_12_starter__python_io_json = mo.ui.code_editor(
        value='encoded = json.dumps(payload, indent=2)\ndecoded = json.loads(encoded)',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_12_submit__python_io_json = mo.ui.run_button(label="Submit answer")
    return exercise_12_description__python_io_json, exercise_12_starter__python_io_json, exercise_12_submit__python_io_json




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_12_description__python_io_json, exercise_12_starter__python_io_json, exercise_12_submit__python_io_json):
    @assertion(lambda ns: None)
    def _submission(source):
        import json

        ns = {"json": json, "payload": {"name": "Ada", "scores": [10, 12]}}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("decoded") == ns["payload"], "decoded data does not match payload"
        assert "\n" in ns.get("encoded", ""), "encoded JSON should be indented"
        return ns

    problem(mo, exercise_12_description__python_io_json, exercise_12_starter__python_io_json, _submission, exercise_12_submit__python_io_json)
    return


if __name__ == "__main__":
    app.run()
