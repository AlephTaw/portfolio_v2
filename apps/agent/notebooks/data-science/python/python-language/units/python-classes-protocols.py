# /// script
# dependencies = ["marimo"]
# requires-python = ">=3.12"
# ///

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp import assertion, execute_submission, problem

    return assertion, execute_submission, mo, problem


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # Python tutorial

    This notebook turns the Python tutorial cheat sheet into short,
    auto-graded implementation exercises. Each exercise has three parts:

    1. a description of the task;
    2. an interactive Python code input area;
    3. an assertion-decorated submission that reports **Correct** or **Not yet**.

    Submit code that creates the names requested by each prompt. Your code is
    executed in an isolated namespace for that exercise.
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    ## 8. Classes and protocols

    ### Exposition

    Classes combine state and behavior, while protocols focus on what an
    object can do. Special methods such as `__len__` let custom objects work
    with ordinary Python syntax.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_08_description__python_classes_protocols = mo.md(
        """
        ### Exercise

        Define `User(name)` with a `greet()` method returning `Hi, <name>`.
        The class must support `len(user)` by returning the name length.
        """
    )
    exercise_08_starter__python_classes_protocols = mo.ui.code_editor(
        value='class User:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        return f"Hi, {self.name}"\n\n    def __len__(self):\n        return len(self.name)',
        language="python",
        label="Your Python answer",
        min_height=220,
    )
    exercise_08_submit__python_classes_protocols = mo.ui.run_button(label="Submit answer")
    return exercise_08_description__python_classes_protocols, exercise_08_starter__python_classes_protocols, exercise_08_submit__python_classes_protocols




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_08_description__python_classes_protocols, exercise_08_starter__python_classes_protocols, exercise_08_submit__python_classes_protocols):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        user = ns["User"]("Ada")
        assert user.greet() == "Hi, Ada", "greet is incorrect"
        assert len(user) == 3, "__len__ is incorrect"
        return ns

    problem(mo, exercise_08_description__python_classes_protocols, exercise_08_starter__python_classes_protocols, _submission, exercise_08_submit__python_classes_protocols)
    return


if __name__ == "__main__":
    app.run()
