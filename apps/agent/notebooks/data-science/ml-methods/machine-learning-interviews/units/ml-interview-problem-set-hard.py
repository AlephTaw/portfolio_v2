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


@app.cell
def _(mo):
    _mlphd_unit_body = True
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
