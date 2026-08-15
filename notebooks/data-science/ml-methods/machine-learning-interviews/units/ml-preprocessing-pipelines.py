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
    ## 5. Preprocessing and feature pipelines

    **Motivation:** Leakage often enters through preprocessing performed before
    splitting or through features unavailable at prediction time.

    **Goal:** Build a leakage-safe order for splitting, fitting transforms,
    transforming validation data, and fitting a model.

    Imputation, scaling, encoding, and feature selection learn parameters. Fit
    them on training data and reuse those fitted transforms everywhere else.
    Trees usually do not require scaling; distance- and penalty-based models do.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_05_description = mo.md("""
    ### Exercise

    Create `pipeline_order` listing the four leakage-safe steps in order:
    `split`, `fit_transform_train`, `transform_validation`, `fit_model`.
    """)
    ml_exercise_05_starter = mo.ui.code_editor(
        value='pipeline_order = [\n    "split",\n    "fit_transform_train",\n    "transform_validation",\n    "fit_model",\n]',
        language="python", label="Your Python answer", min_height=150,
    )
    ml_exercise_05_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_05_description, ml_exercise_05_starter, ml_exercise_05_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_05_description, ml_exercise_05_starter, ml_exercise_05_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns.get("pipeline_order") == ["split", "fit_transform_train", "transform_validation", "fit_model"], "pipeline order leaks validation information"
        return _ns

    problem(mo, ml_exercise_05_description, ml_exercise_05_starter, _submission, ml_exercise_05_submit)
    return


if __name__ == "__main__":
    app.run()
