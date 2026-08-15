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
        ## 3. Sorting and binary search

        **Motivation:** Sorting creates order that enables fast searching and
        simplifies downstream comparisons.

        **Goal:** Implement binary search with a shrinking inclusive interval.

        Binary search requires sorted input. At each step compare the midpoint,
        then discard half the remaining interval. The loop invariant is that a
        matching value, if present, remains inside `[left, right]`.
        """
    )
    return


@app.cell
def _(mo):
    exercise_03_description__python_algorithms_searching = mo.md(
        """
        ### Exercise

        Define `binary_search(values, target)` returning the target index or
        `-1`. Assume `values` is sorted in ascending order.
        """
    )
    exercise_03_starter__python_algorithms_searching = mo.ui.code_editor(
        value='def binary_search(values, target):\n    left, right = 0, len(values) - 1\n    while left <= right:\n        middle = (left + right) // 2\n        if values[middle] == target:\n            return middle\n        if values[middle] < target:\n            left = middle + 1\n        else:\n            right = middle - 1\n    return -1',
        language="python",
        label="Your Python answer",
        min_height=250,
    )
    exercise_03_submit__python_algorithms_searching = mo.ui.run_button(label="Submit answer")
    return exercise_03_description__python_algorithms_searching, exercise_03_starter__python_algorithms_searching, exercise_03_submit__python_algorithms_searching


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_03_description__python_algorithms_searching, exercise_03_starter__python_algorithms_searching, exercise_03_submit__python_algorithms_searching):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["binary_search"]
        assert _function([1, 3, 5, 7, 9], 7) == 3, "found index is incorrect"
        assert _function([1, 3, 5, 7, 9], 4) == -1, "missing values should return -1"
        assert _function([], 4) == -1, "handle an empty list"
        return _namespace

    problem(mo, exercise_03_description__python_algorithms_searching, exercise_03_starter__python_algorithms_searching, _submission, exercise_03_submit__python_algorithms_searching)
    return


if __name__ == "__main__":
    app.run()
