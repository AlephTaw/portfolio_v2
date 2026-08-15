# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo>=0.23.16", "mlphd-bootcamp"]
# ///

"""Probability and statistics concepts for data scientist interviews."""

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
    mo.md(r"""
    # Probability and statistics for data scientist interviews

    **Prerequisites:** Python arithmetic and basic algebra.

    These units focus on the reasoning, calculations, assumptions, and concise
    explanations commonly expected in data scientist interviews. Every unit is
    independently executable.
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    ## 4. Expectation, variance, and covariance

    **Motivation:** These quantities summarize center, uncertainty, and linear
    co-movement and underpin estimation and modeling.

    **Goal:** Compute population mean, variance, covariance, and distinguish
    covariance from correlation.

    Expectation is linear even for dependent variables. Variance is expected
    squared deviation. Covariance has units; correlation standardizes covariance
    to $[-1,1]$. Neither correlation nor zero covariance generally proves
    independence or causation.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_04_description = mo.md("""
    ### Exercise

    Implement population `mean(values)` and `variance(values)`.
    """)
    stats_exercise_04_starter = mo.ui.code_editor(
        value='def mean(values):\n    return sum(values) / len(values)\n\ndef variance(values):\n    center = mean(values)\n    return sum((value - center) ** 2 for value in values) / len(values)',
        language="python", label="Your Python answer", min_height=190,
    )
    stats_exercise_04_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_04_description, stats_exercise_04_starter, stats_exercise_04_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_04_description, stats_exercise_04_starter, stats_exercise_04_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["mean"]([1, 2, 3, 4]) - 2.5) < 1e-12
        assert abs(_ns["variance"]([1, 2, 3, 4]) - 1.25) < 1e-12
        assert abs(_ns["variance"]([7, 7, 7])) < 1e-12
        return _ns

    problem(mo, stats_exercise_04_description, stats_exercise_04_starter, _submission, stats_exercise_04_submit)
    return


if __name__ == "__main__":
    app.run()
