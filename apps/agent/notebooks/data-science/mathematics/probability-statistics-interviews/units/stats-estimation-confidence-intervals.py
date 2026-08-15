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
    mo.md(r"""
    ## 6. Estimation and confidence intervals

    **Motivation:** A point estimate without uncertainty can make small, noisy
    differences look decisive.

    **Goal:** Distinguish estimators from estimates and correctly interpret a
    frequentist confidence interval.

    A 95% confidence procedure covers the fixed true parameter in 95% of repeated
    samples under its assumptions. It does not assign a 95% probability to the
    parameter after this one interval is observed. Approximate mean intervals use
    estimate $\\pm$ critical value $\\times$ standard error.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_06_description = mo.md("""
    ### Exercise

    Implement `confidence_interval(estimate, standard_error, critical=1.96)`.
    """)
    stats_exercise_06_starter = mo.ui.code_editor(
        value='def confidence_interval(estimate, standard_error, critical=1.96):\n    margin = critical * standard_error\n    return estimate - margin, estimate + margin',
        language="python", label="Your Python answer", min_height=160,
    )
    stats_exercise_06_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_06_description, stats_exercise_06_starter, stats_exercise_06_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_06_description, stats_exercise_06_starter, stats_exercise_06_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _low, _high = _ns["confidence_interval"](10, 2)
        assert abs(_low - 6.08) < 1e-12 and abs(_high - 13.92) < 1e-12
        assert _ns["confidence_interval"](5, 1, 2) == (3, 7)
        return _ns

    problem(mo, stats_exercise_06_description, stats_exercise_06_starter, _submission, stats_exercise_06_submit)
    return


if __name__ == "__main__":
    app.run()
