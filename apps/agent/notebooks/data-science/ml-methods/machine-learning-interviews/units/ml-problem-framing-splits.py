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


if __name__ == "__main__":
    app.run()
