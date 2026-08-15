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


# === MLPHD UNIT START ===
# id: ml-problem-framing-splits
# title: Problem framing, splits, and leakage
# kind: exposition
# difficulty: easy
# teaches: ml-problem-framing-splits
# assesses: ml-problem-framing-splits
# requires:
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 1. Problem framing, splits, and leakage

    **Motivation:** A sophisticated model cannot rescue a target, metric, or
    validation split that does not match the decision being made.

    **Goal:** Translate a product question into a prediction target, unit of
    observation, horizon, metric, and leakage-safe split.

    Use random splits only when observations are exchangeable. Use temporal
    splits for future prediction and grouped splits when records from one entity
    must not cross train and validation. Fit preprocessing on training data only.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_01_description = mo.md("""
    ### Exercise

    Create `split_strategy(problem)` returning `"time"` for future forecasting,
    `"group"` for repeated users, and `"random"` otherwise.
    """)
    ml_exercise_01_starter = mo.ui.code_editor(
        value='def split_strategy(problem):\n    if problem == "forecast":\n        return "time"\n    if problem == "repeated_users":\n        return "group"\n    return "random"',
        language="python", label="Your Python answer", min_height=170,
    )
    ml_exercise_01_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_01_description, ml_exercise_01_starter, ml_exercise_01_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_01_description, ml_exercise_01_starter, ml_exercise_01_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["split_strategy"]
        assert _fn("forecast") == "time", "forecasting needs a temporal split"
        assert _fn("repeated_users") == "group", "repeated entities need a group split"
        assert _fn("iid") == "random", "exchangeable observations may use a random split"
        return _ns

    problem(mo, ml_exercise_01_description, ml_exercise_01_starter, _submission, ml_exercise_01_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-linear-logistic-regularization
# title: Linear models and regularization
# kind: exposition
# difficulty: medium
# teaches: ml-linear-logistic-regularization
# assesses: ml-linear-logistic-regularization
# requires: ml-problem-framing-splits
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 2. Linear models and regularization

    **Motivation:** Linear and logistic models are strong interpretable baselines
    and reveal whether added model complexity is actually useful.

    **Goal:** Explain coefficients, logistic probabilities, and the difference
    between L1 and L2 regularization.

    Linear regression predicts a continuous response. Logistic regression models
    log-odds for classification. L1 can produce sparse coefficients; L2 shrinks
    correlated coefficients smoothly. Scale features when penalty size should be
    comparable across coefficients.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_02_description = mo.md("""
    ### Exercise

    Define `sigmoid(score)` without external libraries and `penalty(use_sparse)`
    returning `"l1"` when sparsity is desired and `"l2"` otherwise.
    """)
    ml_exercise_02_starter = mo.ui.code_editor(
        value='import math\n\ndef sigmoid(score):\n    return 1 / (1 + math.exp(-score))\n\ndef penalty(use_sparse):\n    return "l1" if use_sparse else "l2"',
        language="python", label="Your Python answer", min_height=180,
    )
    ml_exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_02_description, ml_exercise_02_starter, ml_exercise_02_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_02_description, ml_exercise_02_starter, ml_exercise_02_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["sigmoid"](0) - 0.5) < 1e-12, "sigmoid(0) should be 0.5"
        assert _ns["sigmoid"](3) > _ns["sigmoid"](-3), "sigmoid must be increasing"
        assert _ns["penalty"](True) == "l1" and _ns["penalty"](False) == "l2", "penalty choice is incorrect"
        return _ns

    problem(mo, ml_exercise_02_description, ml_exercise_02_starter, _submission, ml_exercise_02_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-trees-ensembles
# title: Decision trees and ensembles
# kind: exposition
# difficulty: medium
# teaches: ml-trees-ensembles
# assesses: ml-trees-ensembles
# requires: ml-linear-logistic-regularization
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 3. Decision trees and ensembles

    **Motivation:** Trees capture nonlinear effects and interactions with little
    preprocessing, while ensembles stabilize or strengthen individual trees.

    **Goal:** Contrast decision trees, random forests, and gradient boosting.

    Deep trees have low bias and high variance. Random forests reduce variance by
    averaging decorrelated trees. Gradient boosting sequentially fits residual
    errors and often offers stronger accuracy but more tuning sensitivity.
    """)
    return


@app.cell
def _(mo):
    ml_exercise_03_description = mo.md("""
    ### Exercise

    Define `choose_ensemble(priority)` returning `"random_forest"` for
    `"robust_default"` and `"gradient_boosting"` for `"maximum_accuracy"`.
    """)
    ml_exercise_03_starter = mo.ui.code_editor(
        value='def choose_ensemble(priority):\n    if priority == "robust_default":\n        return "random_forest"\n    if priority == "maximum_accuracy":\n        return "gradient_boosting"\n    return "decision_tree"',
        language="python", label="Your Python answer", min_height=170,
    )
    ml_exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return ml_exercise_03_description, ml_exercise_03_starter, ml_exercise_03_submit


@app.cell
def _(assertion, execute_submission, ml_exercise_03_description, ml_exercise_03_starter, ml_exercise_03_submit, mo, problem):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["choose_ensemble"]
        assert _fn("robust_default") == "random_forest", "use bagging for the robust default"
        assert _fn("maximum_accuracy") == "gradient_boosting", "use boosting for tuned predictive power"
        return _ns

    problem(mo, ml_exercise_03_description, ml_exercise_03_starter, _submission, ml_exercise_03_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-classification-metrics-thresholds
# title: Classification metrics and thresholds
# kind: exposition
# difficulty: medium
# teaches: ml-classification-metrics-thresholds
# assesses: ml-classification-metrics-thresholds
# requires: ml-problem-framing-splits
# ===

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

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-preprocessing-pipelines
# title: Preprocessing and feature pipelines
# kind: exposition
# difficulty: medium
# teaches: ml-preprocessing-pipelines
# assesses: ml-preprocessing-pipelines
# requires: ml-problem-framing-splits
# ===

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

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-cross-validation-tuning
# title: Cross-validation and hyperparameter tuning
# kind: exposition
# difficulty: hard
# teaches: ml-cross-validation-tuning
# assesses: ml-cross-validation-tuning
# requires: ml-preprocessing-pipelines, ml-classification-metrics-thresholds
# ===

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

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-unsupervised-dimensionality
# title: Clustering and dimensionality reduction
# kind: exposition
# difficulty: medium
# teaches: ml-unsupervised-dimensionality
# assesses: ml-unsupervised-dimensionality
# requires: ml-preprocessing-pipelines
# ===

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

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: ml-production-monitoring
# title: Production inference and monitoring
# kind: exposition
# difficulty: hard
# teaches: ml-production-monitoring
# assesses: ml-production-monitoring
# requires: ml-cross-validation-tuning
# ===

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

# === MLPHD UNIT END ===


if __name__ == "__main__":
    app.run()
