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
    ## 7. Clustering and dimensionality reduction

    **Motivation:** Unsupervised methods help explore structure when labels are
    absent, but their outputs are sensitive to scale and assumptions.

    **Goal:** State when to use k-means or PCA and identify their main caveats.

    K-means minimizes within-cluster squared Euclidean distance, favoring roughly
    spherical clusters. PCA finds orthogonal directions of maximum variance.
    Standardize features when units differ, and validate usefulness downstream.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_07_description = mo.md("""
    ### Exercise

    Define `unsupervised_tool(goal)` returning `"kmeans"` for segmentation and
    `"pca"` for linear dimensionality reduction.
    """)
    ml_exercise_07_starter = mo.ui.code_editor(
        value='def unsupervised_tool(goal):\n    if goal == "segmentation":\n        return "kmeans"\n    if goal == "dimensionality_reduction":\n        return "pca"\n    return None',
        language="python", label="Your Python answer", min_height=170,
    )
    ml_exercise_07_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_07_description, ml_exercise_07_starter, ml_exercise_07_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_07_description, ml_exercise_07_starter, ml_exercise_07_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["unsupervised_tool"]
        assert _fn("segmentation") == "kmeans", "segmentation choice is incorrect"
        assert _fn("dimensionality_reduction") == "pca", "dimensionality choice is incorrect"
        return _ns

    problem(mo, ml_exercise_07_description, ml_exercise_07_starter, _submission, ml_exercise_07_submit)
    return


if __name__ == "__main__":
    app.run()
