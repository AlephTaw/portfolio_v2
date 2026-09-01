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
    ## 14. Standard-library tools

    ### Exposition

    Python’s standard library supplies tested building blocks for collections,
    dates, files, testing, logging, debugging, concurrency, and numeric work.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_14_description__python_standard_library = mo.md(
        """
        ### Exercise

        Use `Counter` to create `counts` for the items in `words`, and use
        `math.isclose` to set `close` for the classic floating-point comparison.
        """
    )
    exercise_14_starter__python_standard_library = mo.ui.code_editor(
        value='from collections import Counter\nimport math\n\ncounts = Counter(words)\nclose = math.isclose(0.1 + 0.2, 0.3)',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_14_submit__python_standard_library = mo.ui.run_button(label="Submit answer")
    return exercise_14_description__python_standard_library, exercise_14_starter__python_standard_library, exercise_14_submit__python_standard_library




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_14_description__python_standard_library, exercise_14_starter__python_standard_library, exercise_14_submit__python_standard_library):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"words": ["python", "data", "python"]}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns["counts"]["python"] == 2, "Counter result is incorrect"
        assert ns["close"] is True, "use an approximate floating-point comparison"
        return ns

    problem(mo, exercise_14_description__python_standard_library, exercise_14_starter__python_standard_library, _submission, exercise_14_submit__python_standard_library)
    return


if __name__ == "__main__":
    app.run()
