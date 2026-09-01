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


if __name__ == "__main__":
    app.run()
