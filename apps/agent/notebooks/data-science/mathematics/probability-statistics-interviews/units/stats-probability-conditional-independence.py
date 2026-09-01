# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo>=0.23.16", "mlphd-bootcamp"]
# ///

"""Probability and statistics concepts for data scientist interviews."""

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
    mo.md(r"""
    # Probability and statistics for data scientist interviews

    **Prerequisites:** Python arithmetic and basic algebra.

    These units focus on the reasoning, calculations, assumptions, and concise
    explanations commonly expected in data scientist interviews. Every unit is
    independently executable.
    """)
    return


@app.cell
def _(mo):
    _mlphd_unit_body = True
    mo.md(r"""
    ## 1. Probability, conditioning, and independence

    **Motivation:** Interview probability questions test whether you can reason
    correctly when events overlap or new information changes the sample space.

    **Goal:** Apply complements, unions, conditional probability, and the formal
    test for independence.

    Use $P(A^c)=1-P(A)$, $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$, and
    $P(A|B)=P(A\\cap B)/P(B)$. Events are independent exactly when
    $P(A\\cap B)=P(A)P(B)$; mutually exclusive nonempty events are not independent.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_01_description = mo.md("""
    ### Exercise

    Implement `conditional(intersection, given)` and
    `are_independent(p_a, p_b, p_both)`.
    """)
    stats_exercise_01_starter = mo.ui.code_editor(
        value='def conditional(intersection, given):\n    return intersection / given\n\ndef are_independent(p_a, p_b, p_both):\n    return abs(p_both - p_a * p_b) < 1e-12',
        language="python", label="Your Python answer", min_height=180,
    )
    stats_exercise_01_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_01_description, stats_exercise_01_starter, stats_exercise_01_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_01_description, stats_exercise_01_starter, stats_exercise_01_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["conditional"](0.2, 0.5) - 0.4) < 1e-12
        assert _ns["are_independent"](0.5, 0.4, 0.2) is True
        assert _ns["are_independent"](0.5, 0.4, 0.1) is False
        return _ns

    problem(mo, stats_exercise_01_description, stats_exercise_01_starter, _submission, stats_exercise_01_submit)
    return


if __name__ == "__main__":
    app.run()
