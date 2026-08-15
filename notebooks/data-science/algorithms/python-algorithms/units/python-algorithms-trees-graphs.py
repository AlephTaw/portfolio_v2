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
        ## 6. Trees and graph traversal

        **Motivation:** Hierarchical and network-shaped data appears in feature
        relationships, dependency graphs, and search problems.

        **Goal:** Traverse a graph with breadth-first search while tracking
        visited nodes so cycles do not cause infinite work.
        """
    )
    return


@app.cell
def _(mo):
    exercise_06_description__python_algorithms_trees_graphs = mo.md(
        """
        ### Exercise

        Define `shortest_path(graph, start, goal)` returning the number of edges
        in the shortest unweighted path, or `None` when unreachable.
        """
    )
    exercise_06_starter__python_algorithms_trees_graphs = mo.ui.code_editor(
        value='from collections import deque\n\ndef shortest_path(graph, start, goal):\n    queue = deque([(start, 0)])\n    visited = {start}\n    while queue:\n        node, distance = queue.popleft()\n        if node == goal:\n            return distance\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append((neighbor, distance + 1))\n    return None',
        language="python",
        label="Your Python answer",
        min_height=270,
    )
    exercise_06_submit__python_algorithms_trees_graphs = mo.ui.run_button(label="Submit answer")
    return exercise_06_description__python_algorithms_trees_graphs, exercise_06_starter__python_algorithms_trees_graphs, exercise_06_submit__python_algorithms_trees_graphs


@app.cell
def _(assertion, execute_submission, mo, problem, exercise_06_description__python_algorithms_trees_graphs, exercise_06_starter__python_algorithms_trees_graphs, exercise_06_submit__python_algorithms_trees_graphs):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
        _function = _namespace["shortest_path"]
        assert _function(_graph, "a", "d") == 2, "shortest path length is incorrect"
        assert _function(_graph, "a", "x") is None, "unreachable goal should return None"
        return _namespace

    problem(mo, exercise_06_description__python_algorithms_trees_graphs, exercise_06_starter__python_algorithms_trees_graphs, _submission, exercise_06_submit__python_algorithms_trees_graphs)
    return


if __name__ == "__main__":
    app.run()
