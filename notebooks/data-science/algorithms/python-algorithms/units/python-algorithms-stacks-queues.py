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
        ## 5. Stacks and queues

        **Motivation:** LIFO and FIFO behavior model parsing, task scheduling,
        breadth-first search, and many streaming workflows.

        **Goal:** Use a stack to validate nested delimiters in one pass.
        """
    )
    return


@app.cell
def _(mo):
    exercise_05_description__python_algorithms_stacks_queues = mo.md(
        """
        ### Exercise

        Define `is_valid_parentheses(text)` for `()`, `[]`, and `{}`. Ignore no
        characters: any non-bracket character should make the input invalid.
        """
    )
    exercise_05_starter__python_algorithms_stacks_queues = mo.ui.code_editor(
        value='def is_valid_parentheses(text):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for character in text:\n        if character in "([{":\n            stack.append(character)\n        elif character in pairs:\n            if not stack or stack.pop() != pairs[character]:\n                return False\n        else:\n            return False\n    return not stack',
        language="python",
        label="Your Python answer",
        min_height=250,
    )
    exercise_05_submit__python_algorithms_stacks_queues = mo.ui.run_button(label="Submit answer")
    return exercise_05_description__python_algorithms_stacks_queues, exercise_05_starter__python_algorithms_stacks_queues, exercise_05_submit__python_algorithms_stacks_queues


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_05_description__python_algorithms_stacks_queues, exercise_05_starter__python_algorithms_stacks_queues, exercise_05_submit__python_algorithms_stacks_queues):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["is_valid_parentheses"]
        assert _function("([]{})") is True, "valid nesting was rejected"
        assert _function("([)]") is False, "crossed nesting was accepted"
        assert _function("abc") is False, "non-bracket characters should be invalid"
        return _namespace

    problem(mo, exercise_05_description__python_algorithms_stacks_queues, exercise_05_starter__python_algorithms_stacks_queues, _submission, exercise_05_submit__python_algorithms_stacks_queues)
    return


if __name__ == "__main__":
    app.run()
