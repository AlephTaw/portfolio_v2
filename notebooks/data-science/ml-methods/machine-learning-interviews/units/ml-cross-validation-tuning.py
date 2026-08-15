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
    ## 6. Cross-validation and hyperparameter tuning

    **Motivation:** Reusing a test set during tuning turns it into training data
    and produces an optimistic performance estimate.

    **Goal:** Separate training/tuning from final evaluation and summarize
    cross-validation results with uncertainty.

    Tune preprocessing and model hyperparameters inside each fold. Keep one final
    test set untouched. Prefer randomized or informed search when the parameter
    space is large, and compare against a simple baseline.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_06_description = mo.md("""
    ### Exercise

    Define `cv_summary(scores)` returning `(mean, population_standard_deviation)`
    without external libraries.
    """)
    ml_exercise_06_starter = mo.ui.code_editor(
        value='def cv_summary(scores):\n    mean = sum(scores) / len(scores)\n    variance = sum((score - mean) ** 2 for score in scores) / len(scores)\n    return mean, variance ** 0.5',
        language="python", label="Your Python answer", min_height=170,
    )
    ml_exercise_06_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_06_description, ml_exercise_06_starter, ml_exercise_06_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_06_description, ml_exercise_06_starter, ml_exercise_06_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _mean, _std = _ns["cv_summary"]([0.7, 0.8, 0.9])
        assert abs(_mean - 0.8) < 1e-12, "mean is incorrect"
        assert abs(_std - (0.02 / 3) ** 0.5) < 1e-12, "population standard deviation is incorrect"
        return _ns

    problem(mo, ml_exercise_06_description, ml_exercise_06_starter, _submission, ml_exercise_06_submit)
    return


if __name__ == "__main__":
    app.run()
