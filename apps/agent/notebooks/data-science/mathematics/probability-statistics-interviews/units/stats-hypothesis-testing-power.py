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
    mo.md(r"""
    ## 7. Hypothesis tests, errors, and power

    **Motivation:** Interviews often probe whether you can separate statistical
    evidence from practical importance and avoid common p-value mistakes.

    **Goal:** Interpret p-values, Type I and Type II errors, power, and multiple
    testing tradeoffs.

    A p-value is the probability, assuming the null and model are true, of a test
    statistic at least as extreme as observed. Alpha controls the Type I error
    rate; beta is the Type II error rate; power is $1-\\beta$. Larger samples,
    larger effects, lower noise, or a larger alpha usually increase power.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_07_description = mo.md("""
    ### Exercise

    Implement `decision(p_value, alpha=0.05)` returning `"reject"` or
    `"fail_to_reject"`, and `bonferroni_alpha(alpha, tests)`.
    """)
    stats_exercise_07_starter = mo.ui.code_editor(
        value='def decision(p_value, alpha=0.05):\n    return "reject" if p_value < alpha else "fail_to_reject"\n\ndef bonferroni_alpha(alpha, tests):\n    return alpha / tests',
        language="python", label="Your Python answer", min_height=180,
    )
    stats_exercise_07_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_07_description, stats_exercise_07_starter, stats_exercise_07_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_07_description, stats_exercise_07_starter, stats_exercise_07_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns["decision"](0.01) == "reject"
        assert _ns["decision"](0.05) == "fail_to_reject"
        assert abs(_ns["bonferroni_alpha"](0.05, 10) - 0.005) < 1e-12
        return _ns

    problem(mo, stats_exercise_07_description, stats_exercise_07_starter, _submission, stats_exercise_07_submit)
    return


if __name__ == "__main__":
    app.run()
