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
        ## 2. Arrays and hash maps

        **Motivation:** Many interview problems become linear when a set or
        dictionary remembers what has already been seen.

        **Goal:** Use a hash map to solve a one-pass lookup problem while keeping
        the original order and handling duplicates explicitly.
        """
    )
    return


@app.cell
def _(mo):
    exercise_02_description__python_algorithms_hash_maps = mo.md(
        """
        ### Exercise

        Define `first_unique(values)` to return the first value occurring exactly
        once, or `None` when every value is duplicated.
        """
    )
    exercise_02_starter__python_algorithms_hash_maps = mo.ui.code_editor(
        value='def first_unique(values):\n    counts = {}\n    for value in values:\n        counts[value] = counts.get(value, 0) + 1\n    for value in values:\n        if counts[value] == 1:\n            return value\n    return None',
        language="python",
        label="Your Python answer",
        min_height=220,
    )
    exercise_02_submit__python_algorithms_hash_maps = mo.ui.run_button(label="Submit answer")
    return exercise_02_description__python_algorithms_hash_maps, exercise_02_starter__python_algorithms_hash_maps, exercise_02_submit__python_algorithms_hash_maps


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_02_description__python_algorithms_hash_maps, exercise_02_starter__python_algorithms_hash_maps, exercise_02_submit__python_algorithms_hash_maps):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["first_unique"]
        assert _function([4, 5, 4, 6, 5]) == 6, "check first unique order"
        assert _function([1, 1, 2, 2]) is None, "return None when no value is unique"
        return _namespace

    problem(mo, exercise_02_description__python_algorithms_hash_maps, exercise_02_starter__python_algorithms_hash_maps, _submission, exercise_02_submit__python_algorithms_hash_maps)
    return


if __name__ == "__main__":
    app.run()
