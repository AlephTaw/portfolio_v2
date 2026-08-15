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
    ## 3. Random variables and distributions

    **Motivation:** Choosing a distribution encodes the data-generating process
    and determines which summaries and likelihoods are appropriate.

    **Goal:** Match Bernoulli, binomial, Poisson, exponential, and normal models
    to common interview scenarios.

    Bernoulli models one binary trial; binomial counts successes in fixed
    independent trials; Poisson counts events in an interval; exponential models
    waiting time under a constant event rate; normal models symmetric continuous
    variation and often approximates aggregate noise.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_03_description = mo.md("""
    ### Exercise

    Implement `distribution_for(scenario)` for `"binary"`, `"fixed_trials"`,
    `"event_count"`, `"waiting_time"`, and `"symmetric_measurement"`.
    """)
    stats_exercise_03_starter = mo.ui.code_editor(
        value='def distribution_for(scenario):\n    choices = {\n        "binary": "bernoulli",\n        "fixed_trials": "binomial",\n        "event_count": "poisson",\n        "waiting_time": "exponential",\n        "symmetric_measurement": "normal",\n    }\n    return choices[scenario]',
        language="python", label="Your Python answer", min_height=210,
    )
    stats_exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_03_description, stats_exercise_03_starter, stats_exercise_03_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_03_description, stats_exercise_03_starter, stats_exercise_03_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["distribution_for"]
        _expected = {"binary": "bernoulli", "fixed_trials": "binomial", "event_count": "poisson", "waiting_time": "exponential", "symmetric_measurement": "normal"}
        assert all(_fn(_key) == _value for _key, _value in _expected.items())
        return _ns

    problem(mo, stats_exercise_03_description, stats_exercise_03_starter, _submission, stats_exercise_03_submit)
    return


if __name__ == "__main__":
    app.run()
