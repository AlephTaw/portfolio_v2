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


@app.cell(hide_code=True)
def _(mo):
    _mlphd_unit_body = True
    mo.md("""
    ## 1. Values, names, and identity

    ### Exposition

    Python programs create values such as numbers, strings, sets, and
    dictionaries, then bind names to those objects. Assignment binds a name;
    `is` checks object identity, while `==` checks value equality.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    # 1. Description
    exercise_01_description__python_values_names = mo.md(
        """
        ### Exercise

        Create `values` as the set `{1, 2, 3}`, create `label` as the formatted
        string `Price: $5.00`, and bind `same` to whether `value is None`.
        """
    )
    # 2. Interactive input area function called
    exercise_01_starter__python_values_names = mo.ui.code_editor(
        value='values = {1, 2, 3}\nlabel = f"Price: ${5:.2f}"\nsame = value is None',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_01_submit__python_values_names = mo.ui.run_button(label="Submit answer")
    # 3. Assertion-decorated _submission
    return exercise_01_description__python_values_names, exercise_01_starter__python_values_names, exercise_01_submit__python_values_names




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_01_description__python_values_names, exercise_01_starter__python_values_names, exercise_01_submit__python_values_names):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"value": None}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("values") == {1, 2, 3}, "values is incorrect"
        assert ns.get("label") == "Price: $5.00", "label is incorrect"
        assert ns.get("same") is True, "same should test identity with None"
        return ns

    problem(mo, exercise_01_description__python_values_names, exercise_01_starter__python_values_names, _submission, exercise_01_submit__python_values_names)
    return


if __name__ == "__main__":
    app.run()
