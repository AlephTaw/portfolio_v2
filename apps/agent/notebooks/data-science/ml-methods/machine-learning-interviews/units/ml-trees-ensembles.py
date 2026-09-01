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


if __name__ == "__main__":
    app.run()
