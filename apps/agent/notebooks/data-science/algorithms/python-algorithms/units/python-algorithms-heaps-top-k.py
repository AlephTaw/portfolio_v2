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
        ## 7. Heaps and top-k patterns

        **Motivation:** Data science workloads often need the largest, smallest,
        or most frequent few items without fully sorting a huge collection.

        **Goal:** Use a heap or equivalent bounded structure to solve a top-k
        problem and state its space tradeoff.
        """
    )
    return


@app.cell
def _(mo):
    exercise_07_description__python_algorithms_heaps_top_k = mo.md(
        """
        ### Exercise

        Define `top_k_frequent(values, k)` returning the `k` most frequent values
        in descending frequency order. Ties may be resolved lexicographically.
        """
    )
    exercise_07_starter__python_algorithms_heaps_top_k = mo.ui.code_editor(
        value='from collections import Counter\n\ndef top_k_frequent(values, k):\n    counts = Counter(values)\n    return [value for value, _count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:k]]',
        language="python",
        label="Your Python answer",
        min_height=190,
    )
    exercise_07_submit__python_algorithms_heaps_top_k = mo.ui.run_button(label="Submit answer")
    return exercise_07_description__python_algorithms_heaps_top_k, exercise_07_starter__python_algorithms_heaps_top_k, exercise_07_submit__python_algorithms_heaps_top_k


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_07_description__python_algorithms_heaps_top_k, exercise_07_starter__python_algorithms_heaps_top_k, exercise_07_submit__python_algorithms_heaps_top_k):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["top_k_frequent"]
        assert _function(["a", "b", "a", "c", "b", "a"], 2) == ["a", "b"], "top-k result is incorrect"
        assert _function([1, 1, 2], 5) == [1, 2], "handle k larger than unique values"
        return _namespace

    problem(mo, exercise_07_description__python_algorithms_heaps_top_k, exercise_07_starter__python_algorithms_heaps_top_k, _submission, exercise_07_submit__python_algorithms_heaps_top_k)
    return


if __name__ == "__main__":
    app.run()
