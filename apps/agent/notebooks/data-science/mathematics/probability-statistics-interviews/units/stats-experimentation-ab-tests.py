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
    mo.md("""
    ## 8. Experimentation and A/B tests

    **Motivation:** Product data scientists must connect causal identification,
    experimental design, and business decisions—not merely calculate p-values.

    **Goal:** Explain randomization, units of assignment and analysis, guardrails,
    sample-ratio mismatch, practical significance, and common experiment threats.

    Randomization balances confounders in expectation. Analyze at a level that
    respects assignment and dependence. Define one primary metric and guardrails
    before launch, check instrumentation and sample-ratio mismatch, and report
    effect sizes with uncertainty. Peeking or testing many metrics needs correction.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_08_description = mo.md("""
    ### Exercise

    Implement `absolute_and_relative_lift(control, treatment)` returning both
    lifts, and raise `ValueError` when the control rate is zero.
    """)
    stats_exercise_08_starter = mo.ui.code_editor(
        value='def absolute_and_relative_lift(control, treatment):\n    if control == 0:\n        raise ValueError("relative lift is undefined")\n    absolute = treatment - control\n    return absolute, absolute / control',
        language="python", label="Your Python answer", min_height=170,
    )
    stats_exercise_08_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_08_description, stats_exercise_08_starter, stats_exercise_08_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_08_description, stats_exercise_08_starter, stats_exercise_08_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _absolute, _relative = _ns["absolute_and_relative_lift"](0.10, 0.12)
        assert abs(_absolute - 0.02) < 1e-12 and abs(_relative - 0.20) < 1e-12
        try:
            _ns["absolute_and_relative_lift"](0, 0.1)
        except ValueError:
            pass
        else:
            raise AssertionError("zero control must raise ValueError")
        return _ns

    problem(mo, stats_exercise_08_description, stats_exercise_08_starter, _submission, stats_exercise_08_submit)
    return


if __name__ == "__main__":
    app.run()
