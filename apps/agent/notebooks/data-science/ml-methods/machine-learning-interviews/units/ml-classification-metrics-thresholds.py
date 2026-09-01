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
    _mlphd_unit_body = True
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


if __name__ == "__main__":
    app.run()
