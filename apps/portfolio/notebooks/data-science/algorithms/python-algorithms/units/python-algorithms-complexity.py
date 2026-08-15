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
        ## 1. Complexity and algorithmic patterns

        **Motivation:** Interview solutions must be correct and practical at the
        scale of the input, not merely correct for a toy example.

        **Goal:** Estimate time and space complexity and identify whether a
        solution is linear, logarithmic, quadratic, or exponential.

        A single pass is usually `O(n)`. Nested independent passes are still
        `O(n)` when they do not nest; nested loops over the same input are often
        `O(n²)`. Hash lookup is typically `O(1)` average-case, while sorting is
        commonly `O(n log n)`. State the assumptions behind your estimate.
        """
    )
    return


@app.cell
def _(mo):
    exercise_01_description__python_algorithms_complexity = mo.md(
        """
        ### Exercise

        Create `complexities` mapping these patterns to their usual time
        complexity: `single_pass`, `nested_passes`, `sort`, and `binary_search`.
        Use values `O(n)`, `O(n^2)`, `O(n log n)`, and `O(log n)` respectively.
        """
    )
    exercise_01_starter__python_algorithms_complexity = mo.ui.code_editor(
        value='complexities = {\n    "single_pass": "O(n)",\n    "nested_passes": "O(n^2)",\n    "sort": "O(n log n)",\n    "binary_search": "O(log n)",\n}',
        language="python",
        label="Your Python answer",
        min_height=170,
    )
    exercise_01_submit__python_algorithms_complexity = mo.ui.run_button(label="Submit answer")
    return exercise_01_description__python_algorithms_complexity, exercise_01_starter__python_algorithms_complexity, exercise_01_submit__python_algorithms_complexity


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_01_description__python_algorithms_complexity, exercise_01_starter__python_algorithms_complexity, exercise_01_submit__python_algorithms_complexity):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        assert _namespace.get("complexities") == {
            "single_pass": "O(n)",
            "nested_passes": "O(n^2)",
            "sort": "O(n log n)",
            "binary_search": "O(log n)",
        }, "check each complexity label"
        return _namespace

    problem(mo, exercise_01_description__python_algorithms_complexity, exercise_01_starter__python_algorithms_complexity, _submission, exercise_01_submit__python_algorithms_complexity)
    return


if __name__ == "__main__":
    app.run()
