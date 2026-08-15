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
        ## 4. Two pointers and sliding windows

        **Motivation:** Recomputing every subarray often creates quadratic work;
        maintaining a moving window can reduce it to one pass.

        **Goal:** Maintain the sum of a fixed-size window as it moves across a
        sequence.
        """
    )
    return


@app.cell
def _(mo):
    exercise_04_description__python_algorithms_sliding_window = mo.md(
        """
        ### Exercise

        Define `max_window_sum(values, size)` returning the largest sum of any
        contiguous window of length `size`. Return `None` for invalid sizes.
        """
    )
    exercise_04_starter__python_algorithms_sliding_window = mo.ui.code_editor(
        value='def max_window_sum(values, size):\n    if size <= 0 or size > len(values):\n        return None\n    current = sum(values[:size])\n    best = current\n    for index in range(size, len(values)):\n        current += values[index] - values[index - size]\n        best = max(best, current)\n    return best',
        language="python",
        label="Your Python answer",
        min_height=240,
    )
    exercise_04_submit__python_algorithms_sliding_window = mo.ui.run_button(label="Submit answer")
    return exercise_04_description__python_algorithms_sliding_window, exercise_04_starter__python_algorithms_sliding_window, exercise_04_submit__python_algorithms_sliding_window


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_04_description__python_algorithms_sliding_window, exercise_04_starter__python_algorithms_sliding_window, exercise_04_submit__python_algorithms_sliding_window):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["max_window_sum"]
        assert _function([2, 1, 5, 1, 3, 2], 3) == 9, "window maximum is incorrect"
        assert _function([1, 2], 0) is None, "handle invalid sizes"
        return _namespace

    problem(mo, exercise_04_description__python_algorithms_sliding_window, exercise_04_starter__python_algorithms_sliding_window, _submission, exercise_04_submit__python_algorithms_sliding_window)
    return


if __name__ == "__main__":
    app.run()
