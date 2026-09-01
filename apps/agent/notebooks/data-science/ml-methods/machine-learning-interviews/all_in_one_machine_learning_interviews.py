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


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # Machine learning for data scientist interviews

    **Prerequisites:** Python, basic probability, descriptive statistics, and
    matrix/vector intuition.

    The units emphasize model choice, evaluation, leakage prevention, tradeoffs,
    and concise interview communication. Each unit runs independently.
    """)
    return


@app.cell(hide_code=True)
def _(assertion, mo):
    import json as _json
    import re as _re

    from mlphd_bootcamp import open_seed_database as _open_seed_database

    _ml_bank = _open_seed_database(
        "machine_learning_problem_bank.sqlite",
        seed_url="/bootcamp/data/machine_learning_problem_bank.sqlite",
        local_seed="database/machine_learning_problem_bank.sqlite",
    )

    def _ml_record(question_id):
        return _ml_bank.execute(
            """
            SELECT source_number, company, title, difficulty, question, answer,
                   checker_spec, notes, source_solution_status
            FROM questions WHERE question_id = ?
            """,
            (question_id,),
        ).fetchone()

    def _ml_evaluate(question_id, source):
        if not isinstance(source, str) or len(source.strip()) < 40:
            raise AssertionError("Give a concise explanation of at least 40 characters.")
        groups = _json.loads(_ml_record(question_id)[6])["required_concept_groups"]
        normalized = _re.sub(r"[^a-z0-9+^-]+", " ", source.casefold())
        return [group for group in groups if not any(term.casefold() in normalized for term in group)]

    def _ml_assert(missing):
        assert not missing, "Address these missing ideas: " + "; ".join(" / ".join(group) for group in missing)

    def ml_make_problem(question_id):
        source_number, company, title, difficulty, question, answer, _spec, notes, status = _ml_record(question_id)
        text = (
            f"### {question_id.upper()} · {company}: {title}\n\n"
            f"**Exercise:** {question}\n\n"
            f"**Difficulty:** {difficulty.title()} · **Source:** {source_number}"
        )
        if notes:
            text += f"\n\n**Reconciliation note:** {notes}"
        if status == "missing":
            text += "\n\n*The source screenshots did not include a solution; the reference answer was authored during reconciliation.*"
        editor = mo.ui.text_area(
            value="", label=f"{question_id.upper()} written answer", full_width=True, rows=8
        )
        form = editor.form(
            submit_button_label="Submit answer", clear_on_submit=False, bordered=False
        )
        reveal = mo.accordion({"Reveal reference answer": mo.md(answer)})
        return mo.vstack([mo.md(text), form, reveal], gap=1), form

    def ml_grade_problem(question_id, source):
        if source is None:
            return mo.callout("Write your answer, then select **Submit answer**.", kind="neutral")

        @assertion(_ml_assert)
        def _submission(submitted_source):
            return _ml_evaluate(question_id, submitted_source)

        return _submission(source)

    return ml_grade_problem, ml_make_problem


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-problem-framing-splits
    # title: Problem framing, splits, and leakage
    # kind: exposition
    # difficulty: easy
    # teaches: ml-problem-framing-splits
    # assesses: ml-problem-framing-splits
    # requires:
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_01_description,
        ml_exercise_01_starter,
        ml_exercise_01_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_01_description,
    ml_exercise_01_starter,
    ml_exercise_01_submit,
    mo,
    problem,
):
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


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-linear-logistic-regularization
    # title: Linear models and regularization
    # kind: exposition
    # difficulty: medium
    # teaches: ml-linear-logistic-regularization
    # assesses: ml-linear-logistic-regularization
    # requires: ml-problem-framing-splits
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_02_description,
        ml_exercise_02_starter,
        ml_exercise_02_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_02_description,
    ml_exercise_02_starter,
    ml_exercise_02_submit,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["sigmoid"](0) - 0.5) < 1e-12, "sigmoid(0) should be 0.5"
        assert _ns["sigmoid"](3) > _ns["sigmoid"](-3), "sigmoid must be increasing"
        assert _ns["penalty"](True) == "l1" and _ns["penalty"](False) == "l2", "penalty choice is incorrect"
        return _ns

    problem(mo, ml_exercise_02_description, ml_exercise_02_starter, _submission, ml_exercise_02_submit)
    return


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-trees-ensembles
    # title: Decision trees and ensembles
    # kind: exposition
    # difficulty: medium
    # teaches: ml-trees-ensembles
    # assesses: ml-trees-ensembles
    # requires: ml-linear-logistic-regularization
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_03_description,
        ml_exercise_03_starter,
        ml_exercise_03_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_03_description,
    ml_exercise_03_starter,
    ml_exercise_03_submit,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["choose_ensemble"]
        assert _fn("robust_default") == "random_forest", "use bagging for the robust default"
        assert _fn("maximum_accuracy") == "gradient_boosting", "use boosting for tuned predictive power"
        return _ns

    problem(mo, ml_exercise_03_description, ml_exercise_03_starter, _submission, ml_exercise_03_submit)
    return


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-classification-metrics-thresholds
    # title: Classification metrics and thresholds
    # kind: exposition
    # difficulty: medium
    # teaches: ml-classification-metrics-thresholds
    # assesses: ml-classification-metrics-thresholds
    # requires: ml-problem-framing-splits
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_04_description,
        ml_exercise_04_starter,
        ml_exercise_04_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_04_description,
    ml_exercise_04_starter,
    ml_exercise_04_submit,
    mo,
    problem,
):
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


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-preprocessing-pipelines
    # title: Preprocessing and feature pipelines
    # kind: exposition
    # difficulty: medium
    # teaches: ml-preprocessing-pipelines
    # assesses: ml-preprocessing-pipelines
    # requires: ml-problem-framing-splits
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_05_description,
        ml_exercise_05_starter,
        ml_exercise_05_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_05_description,
    ml_exercise_05_starter,
    ml_exercise_05_submit,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns.get("pipeline_order") == ["split", "fit_transform_train", "transform_validation", "fit_model"], "pipeline order leaks validation information"
        return _ns

    problem(mo, ml_exercise_05_description, ml_exercise_05_starter, _submission, ml_exercise_05_submit)
    return


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-cross-validation-tuning
    # title: Cross-validation and hyperparameter tuning
    # kind: exposition
    # difficulty: hard
    # teaches: ml-cross-validation-tuning
    # assesses: ml-cross-validation-tuning
    # requires: ml-preprocessing-pipelines, ml-classification-metrics-thresholds
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_06_description,
        ml_exercise_06_starter,
        ml_exercise_06_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_06_description,
    ml_exercise_06_starter,
    ml_exercise_06_submit,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _mean, _std = _ns["cv_summary"]([0.7, 0.8, 0.9])
        assert abs(_mean - 0.8) < 1e-12, "mean is incorrect"
        assert abs(_std - (0.02 / 3) ** 0.5) < 1e-12, "population standard deviation is incorrect"
        return _ns

    problem(mo, ml_exercise_06_description, ml_exercise_06_starter, _submission, ml_exercise_06_submit)
    return


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-unsupervised-dimensionality
    # title: Clustering and dimensionality reduction
    # kind: exposition
    # difficulty: medium
    # teaches: ml-unsupervised-dimensionality
    # assesses: ml-unsupervised-dimensionality
    # requires: ml-preprocessing-pipelines
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_07_description,
        ml_exercise_07_starter,
        ml_exercise_07_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_07_description,
    ml_exercise_07_starter,
    ml_exercise_07_submit,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["unsupervised_tool"]
        assert _fn("segmentation") == "kmeans", "segmentation choice is incorrect"
        assert _fn("dimensionality_reduction") == "pca", "dimensionality choice is incorrect"
        return _ns

    problem(mo, ml_exercise_07_description, ml_exercise_07_starter, _submission, ml_exercise_07_submit)
    return


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-production-monitoring
    # title: Production inference and monitoring
    # kind: exposition
    # difficulty: hard
    # teaches: ml-production-monitoring
    # assesses: ml-production-monitoring
    # requires: ml-cross-validation-tuning
    # ===
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


@app.cell(hide_code=True)
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
    return (
        ml_exercise_08_description,
        ml_exercise_08_starter,
        ml_exercise_08_submit,
    )


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    ml_exercise_08_description,
    ml_exercise_08_starter,
    ml_exercise_08_submit,
    mo,
    problem,
):
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


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-interview-problem-set-easy
    # title: Machine-learning interview problem set: easy
    # kind: exercise
    # difficulty: easy
    # teaches: ml-problem-framing-splits
    # assesses: ml-problem-framing-splits
    # requires: ml-production-monitoring
    # ===
    mo.md("""
    ## Screenshot problem set · Easy

    **Motivation:** Foundational questions test whether model behavior can be explained accurately and connected to practical decisions.

    **Goal:** Answer source questions 7.1–7.11 with concise explanations covering every essential concept.

    Each exercise is independent. Submit an answer for automatic feedback, and use
    the disclosure only when you want to inspect the reference solution.
    """)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q01_problem, ml_interview_q01_form = ml_make_problem("q01")
    _q01_problem
    return (ml_interview_q01_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q01_form):
    ml_grade_problem("q01", ml_interview_q01_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q02_problem, ml_interview_q02_form = ml_make_problem("q02")
    _q02_problem
    return (ml_interview_q02_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q02_form):
    ml_grade_problem("q02", ml_interview_q02_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q03_problem, ml_interview_q03_form = ml_make_problem("q03")
    _q03_problem
    return (ml_interview_q03_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q03_form):
    ml_grade_problem("q03", ml_interview_q03_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q04_problem, ml_interview_q04_form = ml_make_problem("q04")
    _q04_problem
    return (ml_interview_q04_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q04_form):
    ml_grade_problem("q04", ml_interview_q04_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q05_problem, ml_interview_q05_form = ml_make_problem("q05")
    _q05_problem
    return (ml_interview_q05_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q05_form):
    ml_grade_problem("q05", ml_interview_q05_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q06_problem, ml_interview_q06_form = ml_make_problem("q06")
    _q06_problem
    return (ml_interview_q06_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q06_form):
    ml_grade_problem("q06", ml_interview_q06_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q07_problem, ml_interview_q07_form = ml_make_problem("q07")
    _q07_problem
    return (ml_interview_q07_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q07_form):
    ml_grade_problem("q07", ml_interview_q07_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q08_problem, ml_interview_q08_form = ml_make_problem("q08")
    _q08_problem
    return (ml_interview_q08_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q08_form):
    ml_grade_problem("q08", ml_interview_q08_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q09_problem, ml_interview_q09_form = ml_make_problem("q09")
    _q09_problem
    return (ml_interview_q09_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q09_form):
    ml_grade_problem("q09", ml_interview_q09_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q10_problem, ml_interview_q10_form = ml_make_problem("q10")
    _q10_problem
    return (ml_interview_q10_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q10_form):
    ml_grade_problem("q10", ml_interview_q10_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q11_problem, ml_interview_q11_form = ml_make_problem("q11")
    _q11_problem
    return (ml_interview_q11_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q11_form):
    ml_grade_problem("q11", ml_interview_q11_form.value)
    return


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-interview-problem-set-medium
    # title: Machine-learning interview problem set: medium
    # kind: exercise
    # difficulty: medium
    # teaches: ml-trees-ensembles
    # assesses: ml-trees-ensembles
    # requires: ml-interview-problem-set-easy
    # ===
    mo.md("""
    ## Screenshot problem set · Medium

    **Motivation:** Applied interview questions require joining statistical principles, validation discipline, and product constraints.

    **Goal:** Answer source questions 7.12–7.25 with technically complete, decision-oriented reasoning.

    Each exercise is independent. Submit an answer for automatic feedback, and use
    the disclosure only when you want to inspect the reference solution.
    """)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q12_problem, ml_interview_q12_form = ml_make_problem("q12")
    _q12_problem
    return (ml_interview_q12_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q12_form):
    ml_grade_problem("q12", ml_interview_q12_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q13_problem, ml_interview_q13_form = ml_make_problem("q13")
    _q13_problem
    return (ml_interview_q13_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q13_form):
    ml_grade_problem("q13", ml_interview_q13_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q14_problem, ml_interview_q14_form = ml_make_problem("q14")
    _q14_problem
    return (ml_interview_q14_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q14_form):
    ml_grade_problem("q14", ml_interview_q14_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q15_problem, ml_interview_q15_form = ml_make_problem("q15")
    _q15_problem
    return (ml_interview_q15_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q15_form):
    ml_grade_problem("q15", ml_interview_q15_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q16_problem, ml_interview_q16_form = ml_make_problem("q16")
    _q16_problem
    return (ml_interview_q16_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q16_form):
    ml_grade_problem("q16", ml_interview_q16_form.value)
    return


@app.cell(hide_code=True)
def _(ml_make_problem):
    _q17_problem, ml_interview_q17_form = ml_make_problem("q17")
    _q17_problem
    return (ml_interview_q17_form,)


@app.cell(hide_code=True)
def _(ml_grade_problem, ml_interview_q17_form):
    ml_grade_problem("q17", ml_interview_q17_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q18_problem, ml_interview_q18_form = ml_make_problem("q18")
    _q18_problem
    return (ml_interview_q18_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q18_form):
    ml_grade_problem("q18", ml_interview_q18_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q19_problem, ml_interview_q19_form = ml_make_problem("q19")
    _q19_problem
    return (ml_interview_q19_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q19_form):
    ml_grade_problem("q19", ml_interview_q19_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q20_problem, ml_interview_q20_form = ml_make_problem("q20")
    _q20_problem
    return (ml_interview_q20_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q20_form):
    ml_grade_problem("q20", ml_interview_q20_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q21_problem, ml_interview_q21_form = ml_make_problem("q21")
    _q21_problem
    return (ml_interview_q21_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q21_form):
    ml_grade_problem("q21", ml_interview_q21_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q22_problem, ml_interview_q22_form = ml_make_problem("q22")
    _q22_problem
    return (ml_interview_q22_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q22_form):
    ml_grade_problem("q22", ml_interview_q22_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q23_problem, ml_interview_q23_form = ml_make_problem("q23")
    _q23_problem
    return (ml_interview_q23_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q23_form):
    ml_grade_problem("q23", ml_interview_q23_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q24_problem, ml_interview_q24_form = ml_make_problem("q24")
    _q24_problem
    return (ml_interview_q24_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q24_form):
    ml_grade_problem("q24", ml_interview_q24_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q25_problem, ml_interview_q25_form = ml_make_problem("q25")
    _q25_problem
    return (ml_interview_q25_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q25_form):
    ml_grade_problem("q25", ml_interview_q25_form.value)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: ml-interview-problem-set-hard
    # title: Machine-learning interview problem set: hard
    # kind: exercise
    # difficulty: hard
    # teaches: ml-production-monitoring
    # assesses: ml-production-monitoring
    # requires: ml-interview-problem-set-medium
    # ===
    mo.md("""
    ## Screenshot problem set · Hard

    **Motivation:** Advanced interviews combine mathematical derivation with end-to-end system design and operational judgment.

    **Goal:** Answer source questions 7.26–7.35, including the five transparently authored solutions missing from the captured source.

    Each exercise is independent. Submit an answer for automatic feedback, and use
    the disclosure only when you want to inspect the reference solution.
    """)
    return


@app.cell
def _(ml_make_problem):
    _q26_problem, ml_interview_q26_form = ml_make_problem("q26")
    _q26_problem
    return (ml_interview_q26_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q26_form):
    ml_grade_problem("q26", ml_interview_q26_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q27_problem, ml_interview_q27_form = ml_make_problem("q27")
    _q27_problem
    return (ml_interview_q27_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q27_form):
    ml_grade_problem("q27", ml_interview_q27_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q28_problem, ml_interview_q28_form = ml_make_problem("q28")
    _q28_problem
    return (ml_interview_q28_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q28_form):
    ml_grade_problem("q28", ml_interview_q28_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q29_problem, ml_interview_q29_form = ml_make_problem("q29")
    _q29_problem
    return (ml_interview_q29_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q29_form):
    ml_grade_problem("q29", ml_interview_q29_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q30_problem, ml_interview_q30_form = ml_make_problem("q30")
    _q30_problem
    return (ml_interview_q30_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q30_form):
    ml_grade_problem("q30", ml_interview_q30_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q31_problem, ml_interview_q31_form = ml_make_problem("q31")
    _q31_problem
    return (ml_interview_q31_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q31_form):
    ml_grade_problem("q31", ml_interview_q31_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q32_problem, ml_interview_q32_form = ml_make_problem("q32")
    _q32_problem
    return (ml_interview_q32_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q32_form):
    ml_grade_problem("q32", ml_interview_q32_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q33_problem, ml_interview_q33_form = ml_make_problem("q33")
    _q33_problem
    return (ml_interview_q33_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q33_form):
    ml_grade_problem("q33", ml_interview_q33_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q34_problem, ml_interview_q34_form = ml_make_problem("q34")
    _q34_problem
    return (ml_interview_q34_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q34_form):
    ml_grade_problem("q34", ml_interview_q34_form.value)
    return


@app.cell
def _(ml_make_problem):
    _q35_problem, ml_interview_q35_form = ml_make_problem("q35")
    _q35_problem
    return (ml_interview_q35_form,)


@app.cell
def _(ml_grade_problem, ml_interview_q35_form):
    ml_grade_problem("q35", ml_interview_q35_form.value)
    return


if __name__ == "__main__":
    app.run()
