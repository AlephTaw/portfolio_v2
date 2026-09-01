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


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # Python algorithms for data science interviews

    **Prerequisites:** Python functions, lists, dictionaries, sets, loops,
    and basic complexity notation.

    This notebook focuses on reusable algorithmic patterns rather than
    memorizing isolated solutions. Exercises are automatically graded and
    run only in an isolated Python namespace; no external services are used.
    """)
    return


@app.cell(hide_code=True)
def _(assertion, mo):
    import contextlib as _contextlib
    import io as _io
    import json as _json
    import math as _math

    from mlphd_bootcamp import open_seed_database as _open_seed_database

    _algorithm_bank = _open_seed_database(
        "python_algorithm_problem_bank.sqlite",
        seed_url="/bootcamp/data/python_algorithm_problem_bank.sqlite",
        local_seed="database/python_algorithm_problem_bank.sqlite",
    )

    def _algo_record(question_id):
        return _algorithm_bank.execute(
            """
            SELECT source_number, company, title, difficulty, question, starter,
                   answer, checker_spec, notes
            FROM questions WHERE question_id = ?
            """,
            (question_id,),
        ).fetchone()

    def _algo_canonical(value):
        if isinstance(value, tuple):
            return [_algo_canonical(item) for item in value]
        if isinstance(value, list):
            return [_algo_canonical(item) for item in value]
        return value

    def _algo_approx(actual, expected, tolerance):
        if isinstance(expected, list):
            return isinstance(actual, (list, tuple)) and len(actual) == len(expected) and all(
                _algo_approx(left, right, tolerance)
                for left, right in zip(actual, expected)
            )
        return _math.isclose(float(actual), float(expected), rel_tol=tolerance, abs_tol=tolerance)

    def _algo_matches(actual, test):
        expected = test["expected"]
        comparison = test["comparison"]
        if comparison == "approx":
            return _algo_approx(actual, expected, test.get("tolerance") or 1e-8)
        if comparison == "unordered":
            return sorted(map(repr, _algo_canonical(actual))) == sorted(map(repr, expected))
        if comparison == "nested_unordered":
            actual_groups = [sorted(map(repr, group)) for group in _algo_canonical(actual)]
            expected_groups = [sorted(map(repr, group)) for group in expected]
            return sorted(map(repr, actual_groups)) == sorted(map(repr, expected_groups))
        return _algo_canonical(actual) == expected

    def _algo_execute(question_id, source):
        if not isinstance(source, str) or not source.strip():
            raise AssertionError("Enter Python code before submitting.")
        tests = _json.loads(_algo_record(question_id)[7])
        namespace = {"__name__": "__submission__"}
        output = _io.StringIO()
        results = []
        with _contextlib.redirect_stdout(output):
            exec(compile(source, f"<{question_id}-submission>", "exec"), namespace, namespace)
            for test in tests:
                test_namespace = dict(namespace)
                if test.get("setup"):
                    exec(test["setup"], test_namespace, test_namespace)
                actual = eval(  # noqa: S307 - bank-owned tests grade learner code.
                    test["expression"], test_namespace, test_namespace
                )
                passed = _algo_matches(actual, test)
                results.append({**test, "actual": actual, "passed": passed})
        return {"tests": results, "stdout": output.getvalue()}

    def _algo_assert(result):
        failures = [test["label"] for test in result["tests"] if not test["passed"]]
        assert not failures, "Failing checks: " + ", ".join(failures)

    def _algo_console(result=None, error=None):
        if error is not None:
            safe_error = str(error).replace("```", "''' ")
            return mo.md(f"### Python output\n\n```text\n{type(error).__name__}: {safe_error}\n```")
        lines = []
        if result["stdout"]:
            lines.extend(["stdout:", result["stdout"].rstrip(), ""])
        for test in result["tests"]:
            status = "PASS" if test["passed"] else "FAIL"
            lines.append(f"[{status}] {test['label']}: {test['actual']!r}")
            if not test["passed"]:
                lines.append(f"       expected: {test['expected']!r}")
        safe_output = "\n".join(lines).replace("```", "''' ")
        return mo.md(f"### Python output\n\n```text\n{safe_output}\n```")

    def algo_make_problem(question_id):
        source_number, company, title, difficulty, question, starter, answer, _spec, notes = _algo_record(question_id)
        text = (
            f"### {question_id.upper()} · {company}: {title}\n\n"
            f"**Exercise:** {question}\n\n"
            f"**Difficulty:** {difficulty.title()} · **Source:** {source_number}"
        )
        if notes:
            text += f"\n\n**Reconciliation note:** {notes}"
        editor = mo.ui.code_editor(
            value=starter,
            language="python",
            label=f"{question_id.upper()} Python answer",
            min_height=220,
        )
        form = editor.form(
            submit_button_label="Submit answer", clear_on_submit=False, bordered=False
        )
        reveal = mo.accordion({"Reveal reference answer": mo.md(f"```python\n{answer}\n```")})
        return mo.vstack([mo.md(text), form, reveal], gap=1), form

    def algo_grade_problem(question_id, source):
        if source is None:
            return mo.callout("Write your answer, then select **Submit answer**.", kind="neutral")
        execution = {}

        @assertion(_algo_assert)
        def _submission(submitted_source):
            try:
                result = _algo_execute(question_id, submitted_source)
            except Exception as error:
                execution["error"] = error
                raise
            execution["result"] = result
            return result

        return mo.vstack([
            _submission(source),
            _algo_console(result=execution.get("result"), error=execution.get("error")),
        ], gap=1)

    return algo_grade_problem, algo_make_problem


@app.cell(hide_code=True)
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-complexity
    # title: Complexity and algorithmic patterns
    # kind: exposition
    # difficulty: easy
    # teaches: python-algorithmic-complexity
    # assesses: python-algorithmic-complexity
    # requires:
    # ===
    mo.md("""
    ## 1. Complexity and algorithmic patterns

    **Motivation:** Interview solutions must be correct and practical at the
    scale of the input, not merely correct for a toy example.

    **Goal:** Estimate time and space complexity and identify whether a
    solution is linear, logarithmic, quadratic, or exponential.

    A single pass is usually `O(n)`. Nested independent passes are still
    `O(n)` when they do not nest; nested loops over the same input are often
    `O(n²)`. Hash lookup is typically `O(1)` average-case, while sorting is
    commonly `O(n log n)`. State the assumptions behind your estimate.
    """)
    return


@app.cell
def _(mo):
    exercise_01_description = mo.md(
        """
        ### Exercise

        Create `complexities` mapping these patterns to their usual time
        complexity: `single_pass`, `nested_passes`, `sort`, and `binary_search`.
        Use values `O(n)`, `O(n^2)`, `O(n log n)`, and `O(log n)` respectively.
        """
    )
    exercise_01_starter = mo.ui.code_editor(
        value='complexities = {\n    "single_pass": "O(n)",\n    "nested_passes": "O(n^2)",\n    "sort": "O(n log n)",\n    "binary_search": "O(log n)",\n}',
        language="python",
        label="Your Python answer",
        min_height=170,
    )
    exercise_01_submit = mo.ui.run_button(label="Submit answer")
    return exercise_01_description, exercise_01_starter, exercise_01_submit


@app.cell(hide_code=True)
def _(
    assertion,
    execute_submission,
    exercise_01_description,
    exercise_01_starter,
    exercise_01_submit,
    mo,
    problem,
):
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

    problem(mo, exercise_01_description, exercise_01_starter, _submission, exercise_01_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-hash-maps
    # title: Arrays and hash maps
    # kind: exposition
    # difficulty: easy
    # teaches: python-algorithms-hash-maps
    # assesses: python-algorithms-hash-maps
    # requires: python-algorithmic-complexity
    # ===
    mo.md("""
    ## 2. Arrays and hash maps

    **Motivation:** Many interview problems become linear when a set or
    dictionary remembers what has already been seen.

    **Goal:** Use a hash map to solve a one-pass lookup problem while keeping
    the original order and handling duplicates explicitly.
    """)
    return


@app.cell
def _(mo):
    exercise_02_description = mo.md(
        """
        ### Exercise

        Define `first_unique(values)` to return the first value occurring exactly
        once, or `None` when every value is duplicated.
        """
    )
    exercise_02_starter = mo.ui.code_editor(
        value='def first_unique(values):\n    counts = {}\n    for value in values:\n        counts[value] = counts.get(value, 0) + 1\n    for value in values:\n        if counts[value] == 1:\n            return value\n    return None',
        language="python",
        label="Your Python answer",
        min_height=220,
    )
    exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return exercise_02_description, exercise_02_starter, exercise_02_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_02_description,
    exercise_02_starter,
    exercise_02_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["first_unique"]
        assert _function([4, 5, 4, 6, 5]) == 6, "check first unique order"
        assert _function([1, 1, 2, 2]) is None, "return None when no value is unique"
        return _namespace

    problem(mo, exercise_02_description, exercise_02_starter, _submission, exercise_02_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-searching
    # title: Sorting and binary search
    # kind: exposition
    # difficulty: medium
    # teaches: python-algorithms-searching
    # assesses: python-algorithms-searching
    # requires: python-algorithms-hash-maps
    # ===
    mo.md("""
    ## 3. Sorting and binary search

    **Motivation:** Sorting creates order that enables fast searching and
    simplifies downstream comparisons.

    **Goal:** Implement binary search with a shrinking inclusive interval.

    Binary search requires sorted input. At each step compare the midpoint,
    then discard half the remaining interval. The loop invariant is that a
    matching value, if present, remains inside `[left, right]`.
    """)
    return


@app.cell
def _(mo):
    exercise_03_description = mo.md(
        """
        ### Exercise

        Define `binary_search(values, target)` returning the target index or
        `-1`. Assume `values` is sorted in ascending order.
        """
    )
    exercise_03_starter = mo.ui.code_editor(
        value='def binary_search(values, target):\n    left, right = 0, len(values) - 1\n    while left <= right:\n        middle = (left + right) // 2\n        if values[middle] == target:\n            return middle\n        if values[middle] < target:\n            left = middle + 1\n        else:\n            right = middle - 1\n    return -1',
        language="python",
        label="Your Python answer",
        min_height=250,
    )
    exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return exercise_03_description, exercise_03_starter, exercise_03_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_03_description,
    exercise_03_starter,
    exercise_03_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["binary_search"]
        assert _function([1, 3, 5, 7, 9], 7) == 3, "found index is incorrect"
        assert _function([1, 3, 5, 7, 9], 4) == -1, "missing values should return -1"
        assert _function([], 4) == -1, "handle an empty list"
        return _namespace

    problem(mo, exercise_03_description, exercise_03_starter, _submission, exercise_03_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-sliding-window
    # title: Two pointers and sliding windows
    # kind: exposition
    # difficulty: medium
    # teaches: python-algorithms-sliding-window
    # assesses: python-algorithms-sliding-window
    # requires: python-algorithms-searching
    # ===
    mo.md("""
    ## 4. Two pointers and sliding windows

    **Motivation:** Recomputing every subarray often creates quadratic work;
    maintaining a moving window can reduce it to one pass.

    **Goal:** Maintain the sum of a fixed-size window as it moves across a
    sequence.
    """)
    return


@app.cell
def _(mo):
    exercise_04_description = mo.md(
        """
        ### Exercise

        Define `max_window_sum(values, size)` returning the largest sum of any
        contiguous window of length `size`. Return `None` for invalid sizes.
        """
    )
    exercise_04_starter = mo.ui.code_editor(
        value='def max_window_sum(values, size):\n    if size <= 0 or size > len(values):\n        return None\n    current = sum(values[:size])\n    best = current\n    for index in range(size, len(values)):\n        current += values[index] - values[index - size]\n        best = max(best, current)\n    return best',
        language="python",
        label="Your Python answer",
        min_height=240,
    )
    exercise_04_submit = mo.ui.run_button(label="Submit answer")
    return exercise_04_description, exercise_04_starter, exercise_04_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_04_description,
    exercise_04_starter,
    exercise_04_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["max_window_sum"]
        assert _function([2, 1, 5, 1, 3, 2], 3) == 9, "window maximum is incorrect"
        assert _function([1, 2], 0) is None, "handle invalid sizes"
        return _namespace

    problem(mo, exercise_04_description, exercise_04_starter, _submission, exercise_04_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-stacks-queues
    # title: Stacks and queues
    # kind: exposition
    # difficulty: medium
    # teaches: python-algorithms-stacks-queues
    # assesses: python-algorithms-stacks-queues
    # requires: python-algorithms-sliding-window
    # ===
    mo.md("""
    ## 5. Stacks and queues

    **Motivation:** LIFO and FIFO behavior model parsing, task scheduling,
    breadth-first search, and many streaming workflows.

    **Goal:** Use a stack to validate nested delimiters in one pass.
    """)
    return


@app.cell
def _(mo):
    exercise_05_description = mo.md(
        """
        ### Exercise

        Define `is_valid_parentheses(text)` for `()`, `[]`, and `{}`. Ignore no
        characters: any non-bracket character should make the input invalid.
        """
    )
    exercise_05_starter = mo.ui.code_editor(
        value='def is_valid_parentheses(text):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for character in text:\n        if character in "([{":\n            stack.append(character)\n        elif character in pairs:\n            if not stack or stack.pop() != pairs[character]:\n                return False\n        else:\n            return False\n    return not stack',
        language="python",
        label="Your Python answer",
        min_height=250,
    )
    exercise_05_submit = mo.ui.run_button(label="Submit answer")
    return exercise_05_description, exercise_05_starter, exercise_05_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_05_description,
    exercise_05_starter,
    exercise_05_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["is_valid_parentheses"]
        assert _function("([]{})") is True, "valid nesting was rejected"
        assert _function("([)]") is False, "crossed nesting was accepted"
        assert _function("abc") is False, "non-bracket characters should be invalid"
        return _namespace

    problem(mo, exercise_05_description, exercise_05_starter, _submission, exercise_05_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-trees-graphs
    # title: Trees and graph traversal
    # kind: exposition
    # difficulty: medium
    # teaches: python-algorithms-trees-graphs
    # assesses: python-algorithms-trees-graphs
    # requires: python-algorithms-stacks-queues
    # ===
    mo.md("""
    ## 6. Trees and graph traversal

    **Motivation:** Hierarchical and network-shaped data appears in feature
    relationships, dependency graphs, and search problems.

    **Goal:** Traverse a graph with breadth-first search while tracking
    visited nodes so cycles do not cause infinite work.
    """)
    return


@app.cell
def _(mo):
    exercise_06_description = mo.md(
        """
        ### Exercise

        Define `shortest_path(graph, start, goal)` returning the number of edges
        in the shortest unweighted path, or `None` when unreachable.
        """
    )
    exercise_06_starter = mo.ui.code_editor(
        value='from collections import deque\n\ndef shortest_path(graph, start, goal):\n    queue = deque([(start, 0)])\n    visited = {start}\n    while queue:\n        node, distance = queue.popleft()\n        if node == goal:\n            return distance\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append((neighbor, distance + 1))\n    return None',
        language="python",
        label="Your Python answer",
        min_height=270,
    )
    exercise_06_submit = mo.ui.run_button(label="Submit answer")
    return exercise_06_description, exercise_06_starter, exercise_06_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_06_description,
    exercise_06_starter,
    exercise_06_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
        _function = _namespace["shortest_path"]
        assert _function(_graph, "a", "d") == 2, "shortest path length is incorrect"
        assert _function(_graph, "a", "x") is None, "unreachable goal should return None"
        return _namespace

    problem(mo, exercise_06_description, exercise_06_starter, _submission, exercise_06_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-heaps-top-k
    # title: Heaps and top-k patterns
    # kind: exposition
    # difficulty: hard
    # teaches: python-algorithms-heaps-top-k
    # assesses: python-algorithms-heaps-top-k
    # requires: python-algorithms-trees-graphs
    # ===
    mo.md("""
    ## 7. Heaps and top-k patterns

    **Motivation:** Data science workloads often need the largest, smallest,
    or most frequent few items without fully sorting a huge collection.

    **Goal:** Use a heap or equivalent bounded structure to solve a top-k
    problem and state its space tradeoff.
    """)
    return


@app.cell
def _(mo):
    exercise_07_description = mo.md(
        """
        ### Exercise

        Define `top_k_frequent(values, k)` returning the `k` most frequent values
        in descending frequency order. Ties may be resolved lexicographically.
        """
    )
    exercise_07_starter = mo.ui.code_editor(
        value='from collections import Counter\n\ndef top_k_frequent(values, k):\n    counts = Counter(values)\n    return [value for value, _count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:k]]',
        language="python",
        label="Your Python answer",
        min_height=190,
    )
    exercise_07_submit = mo.ui.run_button(label="Submit answer")
    return exercise_07_description, exercise_07_starter, exercise_07_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_07_description,
    exercise_07_starter,
    exercise_07_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        _function = _namespace["top_k_frequent"]
        assert _function(["a", "b", "a", "c", "b", "a"], 2) == ["a", "b"], "top-k result is incorrect"
        assert _function([1, 1, 2], 5) == [1, 2], "handle k larger than unique values"
        return _namespace

    problem(mo, exercise_07_description, exercise_07_starter, _submission, exercise_07_submit)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithms-interview-testing
    # title: Testing and explaining algorithm solutions
    # kind: exposition
    # difficulty: easy
    # teaches: python-algorithms-testing
    # assesses: python-algorithms-testing
    # requires: python-algorithms-heaps-top-k
    # ===
    mo.md("""
    ## 8. Testing and explaining solutions

    **Motivation:** Interviewers assess reasoning as well as output: edge
    cases, invariants, complexity, and communication distinguish a robust
    solution from a lucky example.

    **Goal:** Produce a compact test plan that covers normal, boundary, and
    failure cases, then state the algorithm’s complexity.
    """)
    return


@app.cell
def _(mo):
    exercise_08_description = mo.md(
        """
        ### Exercise

        Create `test_plan` with entries for `normal`, `empty`, `boundary`, and
        `invalid`, plus `complexity` equal to `O(n)`. Each test entry may be a
        short description.
        """
    )
    exercise_08_starter = mo.ui.code_editor(
        value='test_plan = {\n    "normal": "representative input",\n    "empty": "empty input",\n    "boundary": "one item or smallest valid size",\n    "invalid": "invalid parameter",\n}\ncomplexity = "O(n)"',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    exercise_08_submit = mo.ui.run_button(label="Submit answer")
    return exercise_08_description, exercise_08_starter, exercise_08_submit


@app.cell
def _(
    assertion,
    execute_submission,
    exercise_08_description,
    exercise_08_starter,
    exercise_08_submit,
    mo,
    problem,
):
    @assertion(lambda _namespace: None)
    def _submission(source):
        _namespace = execute_submission(source)
        assert set(_namespace.get("test_plan", {})) == {"normal", "empty", "boundary", "invalid"}, "include all four test categories"
        assert _namespace.get("complexity") == "O(n)", "complexity is incorrect"
        return _namespace

    problem(mo, exercise_08_description, exercise_08_starter, _submission, exercise_08_submit)
    return


@app.cell
def _(mo):
    mo.md("""
    ## Interview checklist

    Before coding, clarify inputs and outputs. State a brute-force approach,
    improve it with the right data structure, name the invariant, test edge
    cases, and explain time and space complexity.
    """)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithm-interview-easy
    # title: Algorithm interview problem set: easy
    # kind: exercise
    # difficulty: easy
    # teaches: python-algorithms-testing
    # assesses: python-algorithms-testing
    # requires: python-algorithms-testing
    # ===
    mo.md("""
    ## Screenshot problem set · Easy

    **Motivation:** Short interview problems reveal whether core data structures and boundary cases have become automatic.

    **Goal:** Implement and test the six foundational problems reconstructed from source questions 9.1–9.6.

    Each exercise is independent. Submit an answer for automatic feedback, and use
    the disclosure only when you want to inspect the reference solution.
    """)
    return


@app.cell
def _(algo_make_problem):
    _q01_problem, algorithm_q01_form = algo_make_problem("q01")
    _q01_problem
    return (algorithm_q01_form,)


@app.cell
def _(algo_grade_problem, algorithm_q01_form):
    algo_grade_problem("q01", algorithm_q01_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q02_problem, algorithm_q02_form = algo_make_problem("q02")
    _q02_problem
    return (algorithm_q02_form,)


@app.cell
def _(algo_grade_problem, algorithm_q02_form):
    algo_grade_problem("q02", algorithm_q02_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q03_problem, algorithm_q03_form = algo_make_problem("q03")
    _q03_problem
    return (algorithm_q03_form,)


@app.cell
def _(algo_grade_problem, algorithm_q03_form):
    algo_grade_problem("q03", algorithm_q03_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q04_problem, algorithm_q04_form = algo_make_problem("q04")
    _q04_problem
    return (algorithm_q04_form,)


@app.cell
def _(algo_grade_problem, algorithm_q04_form):
    algo_grade_problem("q04", algorithm_q04_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q05_problem, algorithm_q05_form = algo_make_problem("q05")
    _q05_problem
    return (algorithm_q05_form,)


@app.cell
def _(algo_grade_problem, algorithm_q05_form):
    algo_grade_problem("q05", algorithm_q05_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q06_problem, algorithm_q06_form = algo_make_problem("q06")
    _q06_problem
    return (algorithm_q06_form,)


@app.cell
def _(algo_grade_problem, algorithm_q06_form):
    algo_grade_problem("q06", algorithm_q06_form.value)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithm-interview-medium
    # title: Algorithm interview problem set: medium
    # kind: exercise
    # difficulty: medium
    # teaches: python-algorithms-testing
    # assesses: python-algorithms-testing
    # requires: python-algorithm-interview-easy
    # ===
    mo.md("""
    ## Screenshot problem set · Medium

    **Motivation:** Medium problems require selecting and combining patterns instead of applying a single memorized operation.

    **Goal:** Implement problems 9.7–9.24 and explain correctness through code that passes normal and edge-case checks.

    Each exercise is independent. Submit an answer for automatic feedback, and use
    the disclosure only when you want to inspect the reference solution.
    """)
    return


@app.cell
def _(algo_make_problem):
    _q07_problem, algorithm_q07_form = algo_make_problem("q07")
    _q07_problem
    return (algorithm_q07_form,)


@app.cell
def _(algo_grade_problem, algorithm_q07_form):
    algo_grade_problem("q07", algorithm_q07_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q08_problem, algorithm_q08_form = algo_make_problem("q08")
    _q08_problem
    return (algorithm_q08_form,)


@app.cell
def _(algo_grade_problem, algorithm_q08_form):
    algo_grade_problem("q08", algorithm_q08_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q09_problem, algorithm_q09_form = algo_make_problem("q09")
    _q09_problem
    return (algorithm_q09_form,)


@app.cell
def _(algo_grade_problem, algorithm_q09_form):
    algo_grade_problem("q09", algorithm_q09_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q10_problem, algorithm_q10_form = algo_make_problem("q10")
    _q10_problem
    return (algorithm_q10_form,)


@app.cell
def _(algo_grade_problem, algorithm_q10_form):
    algo_grade_problem("q10", algorithm_q10_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q11_problem, algorithm_q11_form = algo_make_problem("q11")
    _q11_problem
    return (algorithm_q11_form,)


@app.cell
def _(algo_grade_problem, algorithm_q11_form):
    algo_grade_problem("q11", algorithm_q11_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q12_problem, algorithm_q12_form = algo_make_problem("q12")
    _q12_problem
    return (algorithm_q12_form,)


@app.cell
def _(algo_grade_problem, algorithm_q12_form):
    algo_grade_problem("q12", algorithm_q12_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q13_problem, algorithm_q13_form = algo_make_problem("q13")
    _q13_problem
    return (algorithm_q13_form,)


@app.cell
def _(algo_grade_problem, algorithm_q13_form):
    algo_grade_problem("q13", algorithm_q13_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q14_problem, algorithm_q14_form = algo_make_problem("q14")
    _q14_problem
    return (algorithm_q14_form,)


@app.cell
def _(algo_grade_problem, algorithm_q14_form):
    algo_grade_problem("q14", algorithm_q14_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q15_problem, algorithm_q15_form = algo_make_problem("q15")
    _q15_problem
    return (algorithm_q15_form,)


@app.cell
def _(algo_grade_problem, algorithm_q15_form):
    algo_grade_problem("q15", algorithm_q15_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q16_problem, algorithm_q16_form = algo_make_problem("q16")
    _q16_problem
    return (algorithm_q16_form,)


@app.cell
def _(algo_grade_problem, algorithm_q16_form):
    algo_grade_problem("q16", algorithm_q16_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q17_problem, algorithm_q17_form = algo_make_problem("q17")
    _q17_problem
    return (algorithm_q17_form,)


@app.cell
def _(algo_grade_problem, algorithm_q17_form):
    algo_grade_problem("q17", algorithm_q17_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q18_problem, algorithm_q18_form = algo_make_problem("q18")
    _q18_problem
    return (algorithm_q18_form,)


@app.cell
def _(algo_grade_problem, algorithm_q18_form):
    algo_grade_problem("q18", algorithm_q18_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q19_problem, algorithm_q19_form = algo_make_problem("q19")
    _q19_problem
    return (algorithm_q19_form,)


@app.cell
def _(algo_grade_problem, algorithm_q19_form):
    algo_grade_problem("q19", algorithm_q19_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q20_problem, algorithm_q20_form = algo_make_problem("q20")
    _q20_problem
    return (algorithm_q20_form,)


@app.cell
def _(algo_grade_problem, algorithm_q20_form):
    algo_grade_problem("q20", algorithm_q20_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q21_problem, algorithm_q21_form = algo_make_problem("q21")
    _q21_problem
    return (algorithm_q21_form,)


@app.cell
def _(algo_grade_problem, algorithm_q21_form):
    algo_grade_problem("q21", algorithm_q21_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q22_problem, algorithm_q22_form = algo_make_problem("q22")
    _q22_problem
    return (algorithm_q22_form,)


@app.cell
def _(algo_grade_problem, algorithm_q22_form):
    algo_grade_problem("q22", algorithm_q22_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q23_problem, algorithm_q23_form = algo_make_problem("q23")
    _q23_problem
    return (algorithm_q23_form,)


@app.cell
def _(algo_grade_problem, algorithm_q23_form):
    algo_grade_problem("q23", algorithm_q23_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q24_problem, algorithm_q24_form = algo_make_problem("q24")
    _q24_problem
    return (algorithm_q24_form,)


@app.cell
def _(algo_grade_problem, algorithm_q24_form):
    algo_grade_problem("q24", algorithm_q24_form.value)
    return


@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: python-algorithm-interview-hard
    # title: Algorithm interview problem set: hard
    # kind: exercise
    # difficulty: hard
    # teaches: python-algorithms-testing
    # assesses: python-algorithms-testing
    # requires: python-algorithm-interview-medium
    # ===
    mo.md("""
    ## Screenshot problem set · Hard

    **Motivation:** Hard interview questions test state design, dynamic programming, streaming invariants, and numerical reasoning under constraints.

    **Goal:** Complete problems 9.25–9.30 with robust implementations that satisfy all executable checks.

    Each exercise is independent. Submit an answer for automatic feedback, and use
    the disclosure only when you want to inspect the reference solution.
    """)
    return


@app.cell
def _(algo_make_problem):
    _q25_problem, algorithm_q25_form = algo_make_problem("q25")
    _q25_problem
    return (algorithm_q25_form,)


@app.cell
def _(algo_grade_problem, algorithm_q25_form):
    algo_grade_problem("q25", algorithm_q25_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q26_problem, algorithm_q26_form = algo_make_problem("q26")
    _q26_problem
    return (algorithm_q26_form,)


@app.cell
def _(algo_grade_problem, algorithm_q26_form):
    algo_grade_problem("q26", algorithm_q26_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q27_problem, algorithm_q27_form = algo_make_problem("q27")
    _q27_problem
    return (algorithm_q27_form,)


@app.cell
def _(algo_grade_problem, algorithm_q27_form):
    algo_grade_problem("q27", algorithm_q27_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q28_problem, algorithm_q28_form = algo_make_problem("q28")
    _q28_problem
    return (algorithm_q28_form,)


@app.cell
def _(algo_grade_problem, algorithm_q28_form):
    algo_grade_problem("q28", algorithm_q28_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q29_problem, algorithm_q29_form = algo_make_problem("q29")
    _q29_problem
    return (algorithm_q29_form,)


@app.cell
def _(algo_grade_problem, algorithm_q29_form):
    algo_grade_problem("q29", algorithm_q29_form.value)
    return


@app.cell
def _(algo_make_problem):
    _q30_problem, algorithm_q30_form = algo_make_problem("q30")
    _q30_problem
    return (algorithm_q30_form,)


@app.cell
def _(algo_grade_problem, algorithm_q30_form):
    algo_grade_problem("q30", algorithm_q30_form.value)
    return


if __name__ == "__main__":
    app.run()
