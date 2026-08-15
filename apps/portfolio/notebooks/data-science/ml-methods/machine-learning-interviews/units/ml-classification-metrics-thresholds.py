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
    ## 4. Classification metrics and thresholds

    **Motivation:** Accuracy can hide failure on rare classes, and the best
    probability threshold depends on business costs.

    **Goal:** Compute precision, recall, and F1 and explain ROC-AUC versus PR-AUC.

    Precision asks how many predicted positives were correct; recall asks how
    many actual positives were found. PR-AUC is especially informative with rare
    positives. Choose a threshold using validation data and explicit error costs.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_04_description = mo.md("""
    ### Exercise

    Define `classification_metrics(tp, fp, fn)` returning a dictionary with
    `precision`, `recall`, and `f1`. Return `0.0` when a denominator is zero.
    """)
    ml_exercise_04_starter = mo.ui.code_editor(
        value='def classification_metrics(tp, fp, fn):\n    precision = tp / (tp + fp) if tp + fp else 0.0\n    recall = tp / (tp + fn) if tp + fn else 0.0\n    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0\n    return {"precision": precision, "recall": recall, "f1": f1}',
        language="python", label="Your Python answer", min_height=190,
    )
    ml_exercise_04_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_04_description, ml_exercise_04_starter, ml_exercise_04_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_04_description, ml_exercise_04_starter, ml_exercise_04_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _metrics = _ns["classification_metrics"](8, 2, 4)
        assert abs(_metrics["precision"] - 0.8) < 1e-12, "precision is incorrect"
        assert abs(_metrics["recall"] - 2 / 3) < 1e-12, "recall is incorrect"
        assert abs(_metrics["f1"] - 8 / 11) < 1e-12, "F1 is incorrect"
        return _ns

    problem(mo, ml_exercise_04_description, ml_exercise_04_starter, _submission, ml_exercise_04_submit)
    return


if __name__ == "__main__":
    app.run()
