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
    _mlphd_unit_body = True
    mo.md(r"""
    ## 5. Sampling distributions and the central limit theorem

    **Motivation:** Statistical uncertainty concerns how an estimator changes
    across repeated samples, not merely how individual observations vary.

    **Goal:** Explain sampling distributions, standard error, and when the CLT
    justifies a normal approximation for a sample mean.

    For iid observations with finite variance, the sample mean has standard error
    $\\sigma/\\sqrt{n}$ and becomes approximately normal as sample size grows.
    Dependence, heavy tails, and selection bias can invalidate naive conclusions.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_05_description = mo.md("""
    ### Exercise

    Implement `standard_error(std_dev, sample_size)`.
    """)
    stats_exercise_05_starter = mo.ui.code_editor(
        value='import math\n\ndef standard_error(std_dev, sample_size):\n    return std_dev / math.sqrt(sample_size)',
        language="python", label="Your Python answer", min_height=150,
    )
    stats_exercise_05_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_05_description, stats_exercise_05_starter, stats_exercise_05_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_05_description, stats_exercise_05_starter, stats_exercise_05_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["standard_error"]
        assert abs(_fn(10, 100) - 1) < 1e-12
        assert abs(_fn(10, 400) - 0.5) < 1e-12
        return _ns

    problem(mo, stats_exercise_05_description, stats_exercise_05_starter, _submission, stats_exercise_05_submit)
    return


if __name__ == "__main__":
    app.run()
