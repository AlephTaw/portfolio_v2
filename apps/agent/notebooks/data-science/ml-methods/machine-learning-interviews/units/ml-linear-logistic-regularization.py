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
    ## 2. Linear models and regularization

    **Motivation:** Linear and logistic models are strong interpretable baselines
    and reveal whether added model complexity is actually useful.

    **Goal:** Explain coefficients, logistic probabilities, and the difference
    between L1 and L2 regularization.

    Linear regression predicts a continuous response. Logistic regression models
    log-odds for classification. L1 can produce sparse coefficients; L2 shrinks
    correlated coefficients smoothly. Scale features when penalty size should be
    comparable across coefficients.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_02_description = mo.md("""
    ### Exercise

    Define `sigmoid(score)` without external libraries and `penalty(use_sparse)`
    returning `"l1"` when sparsity is desired and `"l2"` otherwise.
    """)
    ml_exercise_02_starter = mo.ui.code_editor(
        value='import math\n\ndef sigmoid(score):\n    return 1 / (1 + math.exp(-score))\n\ndef penalty(use_sparse):\n    return "l1" if use_sparse else "l2"',
        language="python", label="Your Python answer", min_height=180,
    )
    ml_exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_02_description, ml_exercise_02_starter, ml_exercise_02_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_02_description, ml_exercise_02_starter, ml_exercise_02_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["sigmoid"](0) - 0.5) < 1e-12, "sigmoid(0) should be 0.5"
        assert _ns["sigmoid"](3) > _ns["sigmoid"](-3), "sigmoid must be increasing"
        assert _ns["penalty"](True) == "l1" and _ns["penalty"](False) == "l2", "penalty choice is incorrect"
        return _ns

    problem(mo, ml_exercise_02_description, ml_exercise_02_starter, _submission, ml_exercise_02_submit)
    return


if __name__ == "__main__":
    app.run()
