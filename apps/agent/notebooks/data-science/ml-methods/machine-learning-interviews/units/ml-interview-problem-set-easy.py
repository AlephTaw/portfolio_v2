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


if __name__ == "__main__":
    app.run()
