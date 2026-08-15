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
    ## 3. Decision trees and ensembles

    **Motivation:** Trees capture nonlinear effects and interactions with little
    preprocessing, while ensembles stabilize or strengthen individual trees.

    **Goal:** Contrast decision trees, random forests, and gradient boosting.

    Deep trees have low bias and high variance. Random forests reduce variance by
    averaging decorrelated trees. Gradient boosting sequentially fits residual
    errors and often offers stronger accuracy but more tuning sensitivity.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_03_description = mo.md("""
    ### Exercise

    Define `choose_ensemble(priority)` returning `"random_forest"` for
    `"robust_default"` and `"gradient_boosting"` for `"maximum_accuracy"`.
    """)
    ml_exercise_03_starter = mo.ui.code_editor(
        value='def choose_ensemble(priority):\n    if priority == "robust_default":\n        return "random_forest"\n    if priority == "maximum_accuracy":\n        return "gradient_boosting"\n    return "decision_tree"',
        language="python", label="Your Python answer", min_height=170,
    )
    ml_exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_03_description, ml_exercise_03_starter, ml_exercise_03_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_03_description, ml_exercise_03_starter, ml_exercise_03_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["choose_ensemble"]
        assert _fn("robust_default") == "random_forest", "use bagging for the robust default"
        assert _fn("maximum_accuracy") == "gradient_boosting", "use boosting for tuned predictive power"
        return _ns

    problem(mo, ml_exercise_03_description, ml_exercise_03_starter, _submission, ml_exercise_03_submit)
    return


if __name__ == "__main__":
    app.run()
