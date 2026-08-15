# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo[sql]>=0.23.16"]
# ///

"""Interview-focused Python algorithms tutorial for data scientists."""

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
    mo.md(
        """
        # Python algorithms for data science interviews

        **Prerequisites:** Python functions, lists, dictionaries, sets, loops,
        and basic complexity notation.

        This notebook focuses on reusable algorithmic patterns rather than
        memorizing isolated solutions. Exercises are automatically graded and
        run only in an isolated Python namespace; no external services are used.
        """
    )
    return


@app.cell
def _(mo):
    mo.md(
        """
        ## 8. Testing and explaining solutions

        **Motivation:** Interviewers assess reasoning as well as output: edge
        cases, invariants, complexity, and communication distinguish a robust
        solution from a lucky example.

        **Goal:** Produce a compact test plan that covers normal, boundary, and
        failure cases, then state the algorithm’s complexity.
        """
    )
    return


@app.cell
def _(mo):
    exercise_08_description__python_algorithms_interview_testing = mo.md(
        """
        ### Exercise

        Create `test_plan` with entries for `normal`, `empty`, `boundary`, and
        `invalid`, plus `complexity` equal to `O(n)`. Each test entry may be a
        short description.
        """
    )
    exercise_08_starter__python_algorithms_interview_testing = mo.ui.code_editor(
        value='test_plan = {\n    "normal": "representative input",\n    "empty": "empty input",\n    "boundary": "one item or smallest valid size",\n    "invalid": "invalid parameter",\n}\ncomplexity = "O(n)"',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    exercise_08_submit__python_algorithms_interview_testing = mo.ui.run_button(label="Submit answer")
    return exercise_08_description__python_algorithms_interview_testing, exercise_08_starter__python_algorithms_interview_testing, exercise_08_submit__python_algorithms_interview_testing


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_08_description__python_algorithms_interview_testing, exercise_08_starter__python_algorithms_interview_testing, exercise_08_submit__python_algorithms_interview_testing):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        assert set(_namespace.get("test_plan", {})) == {"normal", "empty", "boundary", "invalid"}, "include all four test categories"
        assert _namespace.get("complexity") == "O(n)", "complexity is incorrect"
        return _namespace

    problem(mo, exercise_08_description__python_algorithms_interview_testing, exercise_08_starter__python_algorithms_interview_testing, _submission, exercise_08_submit__python_algorithms_interview_testing)
    return


if __name__ == "__main__":
    app.run()
