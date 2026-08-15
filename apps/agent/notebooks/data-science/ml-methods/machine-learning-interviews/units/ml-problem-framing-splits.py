# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo>=0.23.16", "mlphd-bootcamp"]
# ///

"""Machine-learning concepts for data scientist interviews."""

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp import assertion, execute_submission, problem

    return assertion, execute_submission, mo, problem


@app.cell
def _(mo):
    mo.md("""
    # Machine learning for data scientist interviews

    **Prerequisites:** Python, basic probability, descriptive statistics, and
    matrix/vector intuition.

    The units emphasize model choice, evaluation, leakage prevention, tradeoffs,
    and concise interview communication. Each unit runs independently.
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    ## 1. Problem framing, splits, and leakage

    **Motivation:** A sophisticated model cannot rescue a target, metric, or
    validation split that does not match the decision being made.

    **Goal:** Translate a product question into a prediction target, unit of
    observation, horizon, metric, and leakage-safe split.

    Use random splits only when observations are exchangeable. Use temporal
    splits for future prediction and grouped splits when records from one entity
    must not cross train and validation. Fit preprocessing on training data only.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_01_description = mo.md("""
    ### Exercise

    Create `split_strategy(problem)` returning `"time"` for future forecasting,
    `"group"` for repeated users, and `"random"` otherwise.
    """)
    ml_exercise_01_starter = mo.ui.code_editor(
        value='def split_strategy(problem):\n    if problem == "forecast":\n        return "time"\n    if problem == "repeated_users":\n        return "group"\n    return "random"',
        language="python", label="Your Python answer", min_height=170,
    )
    ml_exercise_01_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_01_description, ml_exercise_01_starter, ml_exercise_01_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_01_description, ml_exercise_01_starter, ml_exercise_01_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["split_strategy"]
        assert _fn("forecast") == "time", "forecasting needs a temporal split"
        assert _fn("repeated_users") == "group", "repeated entities need a group split"
        assert _fn("iid") == "random", "exchangeable observations may use a random split"
        return _ns

    problem(mo, ml_exercise_01_description, ml_exercise_01_starter, _submission, ml_exercise_01_submit)
    return


if __name__ == "__main__":
    app.run()
