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
    ## 7. Exceptions and resource handling

    ### Exposition

    Exceptions separate normal logic from failure paths. Context managers
    guarantee cleanup for files and other resources, even when code fails.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_07_description__python_exceptions_resources = mo.md(
        """
        ### Exercise

        Convert invalid integer input to `0` and read a UTF-8 file through a
        context manager. The checker supplies `raw` and a temporary file path.
        """
    )
    exercise_07_starter__python_exceptions_resources = mo.ui.code_editor(
        value='try:\n    value = int(raw)\nexcept ValueError:\n    value = 0\n\nwith open(path, encoding="utf-8") as file:\n    text = file.read()',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    exercise_07_submit__python_exceptions_resources = mo.ui.run_button(label="Submit answer")
    return exercise_07_description__python_exceptions_resources, exercise_07_starter__python_exceptions_resources, exercise_07_submit__python_exceptions_resources




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_07_description__python_exceptions_resources, exercise_07_starter__python_exceptions_resources, exercise_07_submit__python_exceptions_resources):
    @assertion(lambda ns: None)
    def _submission(source):
        import tempfile

        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", delete=False) as file:
            file.write("hello")
            path = file.name
        ns = {"raw": "not a number", "path": path}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("value") == 0, "invalid input should become 0"
        assert ns.get("text") == "hello", "file text is incorrect"
        return ns

    problem(mo, exercise_07_description__python_exceptions_resources, exercise_07_starter__python_exceptions_resources, _submission, exercise_07_submit__python_exceptions_resources)
    return


if __name__ == "__main__":
    app.run()
