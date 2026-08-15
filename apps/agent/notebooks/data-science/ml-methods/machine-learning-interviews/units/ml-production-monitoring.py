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
    ## 8. Production inference and monitoring

    **Motivation:** Offline accuracy does not guarantee reliable decisions after
    deployment when data, behavior, latency, or costs change.

    **Goal:** Distinguish data drift, concept drift, service health, and delayed
    outcome monitoring.

    Version data, code, features, model, and threshold together. Monitor input
    schema and distributions, prediction distributions, latency/errors, and
    business outcomes. Use shadow or canary releases and retain rollback paths.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_08_description = mo.md("""
    ### Exercise

    Define `drift_type(input_changed, relationship_changed)` returning
    `"concept"` when the input-to-target relationship changed, `"data"` when
    only the input distribution changed, and `"none"` otherwise.
    """)
    ml_exercise_08_starter = mo.ui.code_editor(
        value='def drift_type(input_changed, relationship_changed):\n    if relationship_changed:\n        return "concept"\n    if input_changed:\n        return "data"\n    return "none"',
        language="python", label="Your Python answer", min_height=160,
    )
    ml_exercise_08_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_08_description, ml_exercise_08_starter, ml_exercise_08_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_08_description, ml_exercise_08_starter, ml_exercise_08_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["drift_type"]
        assert _fn(True, False) == "data", "input-distribution change is data drift"
        assert _fn(False, True) == "concept", "relationship change is concept drift"
        assert _fn(False, False) == "none", "unchanged behavior means no detected drift"
        return _ns

    problem(mo, ml_exercise_08_description, ml_exercise_08_starter, _submission, ml_exercise_08_submit)
    return


if __name__ == "__main__":
    app.run()
