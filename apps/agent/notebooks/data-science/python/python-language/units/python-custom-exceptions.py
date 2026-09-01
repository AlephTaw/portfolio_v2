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
    ## 13. Errors and custom exceptions

    ### Exposition

    Specific exceptions communicate what went wrong and let callers recover
    appropriately. Custom exception classes give an application’s failures a
    meaningful, catchable vocabulary.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_13_description__python_custom_exceptions = mo.md(
        """
        ### Exercise

        Define `ConfigError` as an `Exception` subclass and raise it when
        `host` is empty. The checker supplies `host = \"\"`.
        """
    )
    exercise_13_starter__python_custom_exceptions = mo.ui.code_editor(
        value='class ConfigError(Exception):\n    pass\n\nif not host:\n    raise ConfigError("missing host")',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_13_submit__python_custom_exceptions = mo.ui.run_button(label="Submit answer")
    return exercise_13_description__python_custom_exceptions, exercise_13_starter__python_custom_exceptions, exercise_13_submit__python_custom_exceptions




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_13_description__python_custom_exceptions, exercise_13_starter__python_custom_exceptions, exercise_13_submit__python_custom_exceptions):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"host": ""}
        try:
            exec(compile(source, "<submission>", "exec"), ns, ns)
        except Exception as error:
            assert isinstance(error, ns.get("ConfigError")), "raise ConfigError for missing host"
            assert str(error) == "missing host", "use the requested error message"
        else:
            raise AssertionError("the empty host should raise ConfigError")
        return ns

    problem(mo, exercise_13_description__python_custom_exceptions, exercise_13_starter__python_custom_exceptions, _submission, exercise_13_submit__python_custom_exceptions)
    return


if __name__ == "__main__":
    app.run()
