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
    ## 2. Bayes' theorem and base rates

    **Motivation:** A seemingly accurate detector may produce mostly false alarms
    when the event it detects is rare.

    **Goal:** Update a prior probability using evidence and explain why prevalence
    matters to precision.

    For a binary test, posterior precision is
    $P(D|+)=P(+|D)P(D)/(P(+|D)P(D)+P(+|D^c)P(D^c))$. Sensitivity supplies the
    first likelihood; the false-positive rate is one minus specificity.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_02_description = mo.md("""
    ### Exercise

    Implement `positive_predictive_value(prevalence, sensitivity, specificity)`.
    """)
    stats_exercise_02_starter = mo.ui.code_editor(
        value='def positive_predictive_value(prevalence, sensitivity, specificity):\n    true_positive = sensitivity * prevalence\n    false_positive = (1 - specificity) * (1 - prevalence)\n    return true_positive / (true_positive + false_positive)',
        language="python", label="Your Python answer", min_height=170,
    )
    stats_exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_02_description, stats_exercise_02_starter, stats_exercise_02_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_02_description, stats_exercise_02_starter, stats_exercise_02_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["positive_predictive_value"]
        assert abs(_fn(0.01, 0.99, 0.95) - (0.0099 / 0.0594)) < 1e-12
        assert abs(_fn(0.5, 1.0, 1.0) - 1.0) < 1e-12
        return _ns

    problem(mo, stats_exercise_02_description, stats_exercise_02_starter, _submission, stats_exercise_02_submit)
    return


if __name__ == "__main__":
    app.run()
