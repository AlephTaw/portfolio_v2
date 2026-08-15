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


# === MLPHD UNIT START ===
# id: python-values-names
# title: Values, names, and identity
# kind: exposition
# difficulty: easy
# teaches: python-values-names
# assesses: python-values-names
# requires: 
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 1. Values, names, and identity

    ### Exposition

    Python programs create values such as numbers, strings, sets, and
    dictionaries, then bind names to those objects. Assignment binds a name;
    `is` checks object identity, while `==` checks value equality.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    # 1. Description
    exercise_01_description = mo.md(
        """
        ### Exercise

        Create `values` as the set `{1, 2, 3}`, create `label` as the formatted
        string `Price: $5.00`, and bind `same` to whether `value is None`.
        """
    )
    # 2. Interactive input area function called
    exercise_01_starter = mo.ui.code_editor(
        value='values = {1, 2, 3}\nlabel = f"Price: ${5:.2f}"\nsame = value is None',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_01_submit = mo.ui.run_button(label="Submit answer")
    # 3. Assertion-decorated _submission
    return exercise_01_description, exercise_01_starter, exercise_01_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_01_description, exercise_01_starter, exercise_01_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"value": None}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("values") == {1, 2, 3}, "values is incorrect"
        assert ns.get("label") == "Price: $5.00", "label is incorrect"
        assert ns.get("same") is True, "same should test identity with None"
        return ns

    problem(mo, exercise_01_description, exercise_01_starter, _submission, exercise_01_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-expressions-truthiness
# title: Expressions, truthiness, and built-ins
# kind: exposition
# difficulty: easy
# teaches: python-expressions-truthiness
# assesses: python-expressions-truthiness
# requires: python-values-names
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 2. Expressions, truthiness, and built-ins

    ### Exposition

    Expressions produce values using arithmetic, comparison, Boolean, and
    conditional operators. Empty containers and zero are falsey; `any`,
    `all`, and conversion built-ins make common checks explicit.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_02_description = mo.md(
        """
        ### Exercise

        Create `parity` as `even` or `odd`, call `load()` only when `cached` is
        falsey, and set `passed` to whether every score is at least `60`.
        """
    )
    exercise_02_starter = mo.ui.code_editor(
        value='parity = "even" if n % 2 == 0 else "odd"\nresult = cached or load()\npassed = all(score >= 60 for score in scores)',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return exercise_02_description, exercise_02_starter, exercise_02_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_02_description, exercise_02_starter, exercise_02_submit):
    @assertion(lambda ns: ns)
    def _submission(source):
        calls = []

        def load():
            calls.append("loaded")
            return "fresh"

        ns = {"n": 4, "cached": "", "scores": [60, 80], "load": load}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("parity") == "even", "parity is incorrect"
        assert ns.get("result") == "fresh" and calls == ["loaded"], "short-circuit load is incorrect"
        assert ns.get("passed") is True, "passed is incorrect"
        return ns

    problem(mo, exercise_02_description, exercise_02_starter, _submission, exercise_02_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-control-flow
# title: Control flow and pattern matching
# kind: exposition
# difficulty: easy
# teaches: python-control-flow
# assesses: python-control-flow
# requires: python-expressions-truthiness
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 3. Control flow and pattern matching

    ### Exposition

    Branches select a path, loops repeat work, and `break` or `continue`
    refine iteration. `match` makes structural cases readable when values
    have several possible shapes.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_03_description = mo.md(
        """
        ### Exercise

        Given `command = (\"move\", \"north\")`, set `direction` to `\"north\"`
        using a `match` statement; set it to `None` for any other command.
        """
    )
    exercise_03_starter = mo.ui.code_editor(
        value='command = ("move", "north")\nmatch command:\n    case ("move", value):\n        direction = value\n    case _:\n        direction = None',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return exercise_03_description, exercise_03_starter, exercise_03_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_03_description, exercise_03_starter, exercise_03_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"command": ("move", "north")}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("direction") == "north", "direction is incorrect"
        return ns

    problem(mo, exercise_03_description, exercise_03_starter, _submission, exercise_03_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-functions
# title: Functions and parameter forms
# kind: exposition
# difficulty: easy
# teaches: python-functions
# assesses: python-functions
# requires: python-control-flow
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 4. Functions and parameter forms

    ### Exposition

    Functions package behavior for reuse and testing. Defaults, keyword-only
    parameters, positional-only parameters, `*args`, and `**kwargs` let a
    function express a precise calling interface.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_04_description = mo.md(
        """
        ### Exercise

        Define `greet(name=\"world\")` and `total(*numbers)`. The first returns a
        greeting; the second returns the sum of all positional numbers.
        """
    )
    exercise_04_starter = mo.ui.code_editor(
        value='def greet(name="world"):\n    return f"Hello, {name}!"\n\ndef total(*numbers):\n    return sum(numbers)',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_04_submit = mo.ui.run_button(label="Submit answer")
    return exercise_04_description, exercise_04_starter, exercise_04_submit




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_04_description, exercise_04_starter, exercise_04_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["greet"]() == "Hello, world!", "greet default is incorrect"
        assert ns["greet"]("Ada") == "Hello, Ada!", "greet argument is incorrect"
        assert ns["total"](1, 2, 3) == 6, "total is incorrect"
        return ns

    problem(mo, exercise_04_description, exercise_04_starter, _submission, exercise_04_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-containers
# title: Containers, comprehensions, and unpacking
# kind: exposition
# difficulty: easy
# teaches: python-containers
# assesses: python-containers
# requires: python-functions
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 5. Containers, comprehensions, and unpacking

    ### Exposition

    Lists, tuples, dictionaries, and sets organize related values. Slicing,
    comprehensions, and `*`/`**` unpacking provide concise transformations
    while preserving the underlying container semantics.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_05_description = mo.md(
        """
        ### Exercise

        Create `squares` for positive numbers in `numbers`, and merge `defaults`
        with `overrides` so that override values win.
        """
    )
    exercise_05_starter = mo.ui.code_editor(
        value='squares = [n * n for n in numbers if n > 0]\nmerged = {**defaults, **overrides}',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_05_submit = mo.ui.run_button(label="Submit answer")
    return exercise_05_description, exercise_05_starter, exercise_05_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_05_description, exercise_05_starter, exercise_05_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"numbers": [-2, -1, 0, 2, 3], "defaults": {"a": 1, "b": 2}, "overrides": {"b": 9}}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("squares") == [4, 9], "squares is incorrect"
        assert ns.get("merged") == {"a": 1, "b": 9}, "merged is incorrect"
        return ns

    problem(mo, exercise_05_description, exercise_05_starter, _submission, exercise_05_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-iteration
# title: Iteration and generators
# kind: exposition
# difficulty: medium
# teaches: python-iteration
# assesses: python-iteration
# requires: python-containers
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 6. Iteration and generators

    ### Exposition

    Iterables can produce values one at a time, and generators make that
    production lazy. `enumerate` adds positions without manual counters.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_06_description = mo.md(
        """
        ### Exercise

        Create `indexed` as a list of one-based `(position, item)` pairs and
        create `evens` as a lazy generator of even numbers below `limit`.
        """
    )
    exercise_06_starter = mo.ui.code_editor(
        value='indexed = list(enumerate(items, 1))\nevens = (n for n in range(limit) if n % 2 == 0)',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_06_submit = mo.ui.run_button(label="Submit answer")
    return exercise_06_description, exercise_06_starter, exercise_06_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_06_description, exercise_06_starter, exercise_06_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"items": ["a", "b"], "limit": 6}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("indexed") == [(1, "a"), (2, "b")], "indexed is incorrect"
        assert list(ns["evens"]) == [0, 2, 4], "evens is incorrect"
        return ns

    problem(mo, exercise_06_description, exercise_06_starter, _submission, exercise_06_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-exceptions-resources
# title: Exceptions and resource handling
# kind: exposition
# difficulty: medium
# teaches: python-exceptions-resources
# assesses: python-exceptions-resources
# requires: python-functions
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 7. Exceptions and resource handling

    ### Exposition

    Exceptions separate normal logic from failure paths. Context managers
    guarantee cleanup for files and other resources, even when code fails.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_07_description = mo.md(
        """
        ### Exercise

        Convert invalid integer input to `0` and read a UTF-8 file through a
        context manager. The checker supplies `raw` and a temporary file path.
        """
    )
    exercise_07_starter = mo.ui.code_editor(
        value='try:\n    value = int(raw)\nexcept ValueError:\n    value = 0\n\nwith open(path, encoding="utf-8") as file:\n    text = file.read()',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    exercise_07_submit = mo.ui.run_button(label="Submit answer")
    return exercise_07_description, exercise_07_starter, exercise_07_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_07_description, exercise_07_starter, exercise_07_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        import tempfile

        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", delete=False) as file:
            file.write("hello")
            path = file.name
        ns = {"raw": "not a number", "path": path}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("value") == 0, "invalid input should become 0"
        assert ns.get("text") == "hello", "file text is incorrect"
        return ns

    problem(mo, exercise_07_description, exercise_07_starter, _submission, exercise_07_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-classes-protocols
# title: Classes and protocols
# kind: exposition
# difficulty: medium
# teaches: python-classes-protocols
# assesses: python-classes-protocols
# requires: python-functions
# ===

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
    exercise_08_description = mo.md(
        """
        ### Exercise

        Define `User(name)` with a `greet()` method returning `Hi, <name>`.
        The class must support `len(user)` by returning the name length.
        """
    )
    exercise_08_starter = mo.ui.code_editor(
        value='class User:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        return f"Hi, {self.name}"\n\n    def __len__(self):\n        return len(self.name)',
        language="python",
        label="Your Python answer",
        min_height=220,
    )
    exercise_08_submit = mo.ui.run_button(label="Submit answer")
    return exercise_08_description, exercise_08_starter, exercise_08_submit




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_08_description, exercise_08_starter, exercise_08_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        user = ns["User"]("Ada")
        assert user.greet() == "Hi, Ada", "greet is incorrect"
        assert len(user) == 3, "__len__ is incorrect"
        return ns

    problem(mo, exercise_08_description, exercise_08_starter, _submission, exercise_08_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-type-hints
# title: Type hints
# kind: exposition
# difficulty: medium
# teaches: python-type-hints
# assesses: python-type-hints
# requires: python-functions
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 9. Type hints

    ### Exposition

    Type hints document intended interfaces and enable editor and static
    checker feedback. They describe runtime values but are not enforced by
    Python automatically.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_09_description = mo.md(
        """
        ### Exercise

        Define `average(values: list[int]) -> float` and annotate `maybe_user`
        as a value that can be a string or `None`.
        """
    )
    exercise_09_starter = mo.ui.code_editor(
        value='def average(values: list[int]) -> float:\n    return sum(values) / len(values)\n\nmaybe_user: str | None = None',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_09_submit = mo.ui.run_button(label="Submit answer")
    return exercise_09_description, exercise_09_starter, exercise_09_submit




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_09_description, exercise_09_starter, exercise_09_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["average"]([2, 4, 6]) == 4.0, "average is incorrect"
        assert ns["average"].__annotations__["values"] == list[int], "values hint is incorrect"
        assert ns["average"].__annotations__["return"] is float, "return hint is incorrect"
        assert ns["maybe_user"] is None, "maybe_user should start as None"
        return ns

    problem(mo, exercise_09_description, exercise_09_starter, _submission, exercise_09_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-decorators
# title: Decorators
# kind: exposition
# difficulty: hard
# teaches: python-decorators
# assesses: python-decorators
# requires: python-functions
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 10. Decorators

    ### Exposition

    A decorator wraps or modifies a function or class. `functools.wraps`
    preserves metadata so decorated functions remain discoverable and
    debuggable.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_10_description = mo.md(
        """
        ### Exercise

        Define `logged` so that it returns a wrapped function preserving the
        original metadata with `functools.wraps` and returning the original result.
        """
    )
    exercise_10_starter = mo.ui.code_editor(
        value='from functools import wraps\n\ndef logged(function):\n    @wraps(function)\n    def wrapper(*args, **kwargs):\n        return function(*args, **kwargs)\n    return wrapper',
        language="python",
        label="Your Python answer",
        min_height=220,
    )
    exercise_10_submit = mo.ui.run_button(label="Submit answer")
    return exercise_10_description, exercise_10_starter, exercise_10_submit




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_10_description, exercise_10_starter, exercise_10_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        @ns["logged"]
        def add(a, b):
            """Add two values."""
            return a + b

        assert add(2, 3) == 5, "wrapped result is incorrect"
        assert add.__name__ == "add", "wrapper did not preserve __name__"
        assert add.__doc__ == "Add two values.", "wrapper did not preserve __doc__"
        return ns

    problem(mo, exercise_10_description, exercise_10_starter, _submission, exercise_10_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-modules-packages
# title: Modules and packages
# kind: exposition
# difficulty: medium
# teaches: python-modules-packages
# assesses: python-modules-packages
# requires: python-functions
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 11. Modules and packages

    ### Exposition

    Modules divide a program into reusable namespaces, and packages organize
    modules into a larger project. The `__main__` guard keeps imports from
    accidentally running a script.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_11_description = mo.md(
        """
        ### Exercise

        Import `Path` from `pathlib` and expose a `main()` call only when the
        module runs as a script by using the `__name__` guard.
        """
    )
    exercise_11_starter = mo.ui.code_editor(
        value='from pathlib import Path\n\ndef main():\n    return Path(".").name\n\nif __name__ == "__main__":\n    main()',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    exercise_11_submit = mo.ui.run_button(label="Submit answer")
    return exercise_11_description, exercise_11_starter, exercise_11_submit




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_11_description, exercise_11_starter, exercise_11_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["Path"]("data.txt").name == "data.txt", "Path was not imported correctly"
        assert callable(ns["main"]), "main is missing"
        return ns

    problem(mo, exercise_11_description, exercise_11_starter, _submission, exercise_11_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-io-json
# title: Input, output, and structured data
# kind: exposition
# difficulty: easy
# teaches: python-io-json
# assesses: python-io-json
# requires: python-containers
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 12. Input, output, and structured data

    ### Exposition

    Input and output connect programs to people, files, and other systems.
    JSON provides a portable representation for common nested Python data.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_12_description = mo.md(
        """
        ### Exercise

        Create `encoded` with indented JSON from `payload`, then decode it into
        `decoded` so the data round-trips unchanged.
        """
    )
    exercise_12_starter = mo.ui.code_editor(
        value='encoded = json.dumps(payload, indent=2)\ndecoded = json.loads(encoded)',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    exercise_12_submit = mo.ui.run_button(label="Submit answer")
    return exercise_12_description, exercise_12_starter, exercise_12_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_12_description, exercise_12_starter, exercise_12_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        import json

        ns = {"json": json, "payload": {"name": "Ada", "scores": [10, 12]}}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("decoded") == ns["payload"], "decoded data does not match payload"
        assert "\n" in ns.get("encoded", ""), "encoded JSON should be indented"
        return ns

    problem(mo, exercise_12_description, exercise_12_starter, _submission, exercise_12_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-custom-exceptions
# title: Errors and custom exceptions
# kind: exposition
# difficulty: medium
# teaches: python-custom-exceptions
# assesses: python-custom-exceptions
# requires: python-exceptions-resources
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 13. Errors and custom exceptions

    ### Exposition

    Specific exceptions communicate what went wrong and let callers recover
    appropriately. Custom exception classes give an application’s failures a
    meaningful, catchable vocabulary.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_13_description = mo.md(
        """
        ### Exercise

        Define `ConfigError` as an `Exception` subclass and raise it when
        `host` is empty. The checker supplies `host = \"\"`.
        """
    )
    exercise_13_starter = mo.ui.code_editor(
        value='class ConfigError(Exception):\n    pass\n\nif not host:\n    raise ConfigError("missing host")',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_13_submit = mo.ui.run_button(label="Submit answer")
    return exercise_13_description, exercise_13_starter, exercise_13_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_13_description, exercise_13_starter, exercise_13_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"host": ""}
        try:
            exec(compile(source, "<submission>", "exec"), ns, ns)
        except Exception as error:
            assert isinstance(error, ns.get("ConfigError")), "raise ConfigError for missing host"
            assert str(error) == "missing host", "use the requested error message"
        else:
            raise AssertionError("the empty host should raise ConfigError")
        return ns

    problem(mo, exercise_13_description, exercise_13_starter, _submission, exercise_13_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-standard-library
# title: Standard-library tools
# kind: exposition
# difficulty: medium
# teaches: python-standard-library
# assesses: python-standard-library
# requires: python-modules-packages
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 14. Standard-library tools

    ### Exposition

    Python’s standard library supplies tested building blocks for collections,
    dates, files, testing, logging, debugging, concurrency, and numeric work.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_14_description = mo.md(
        """
        ### Exercise

        Use `Counter` to create `counts` for the items in `words`, and use
        `math.isclose` to set `close` for the classic floating-point comparison.
        """
    )
    exercise_14_starter = mo.ui.code_editor(
        value='from collections import Counter\nimport math\n\ncounts = Counter(words)\nclose = math.isclose(0.1 + 0.2, 0.3)',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_14_submit = mo.ui.run_button(label="Submit answer")
    return exercise_14_description, exercise_14_starter, exercise_14_submit




@app.cell(hide_code=True)
def _(assertion, mo, problem, exercise_14_description, exercise_14_starter, exercise_14_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"words": ["python", "data", "python"]}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns["counts"]["python"] == 2, "Counter result is incorrect"
        assert ns["close"] is True, "use an approximate floating-point comparison"
        return ns

    problem(mo, exercise_14_description, exercise_14_starter, _submission, exercise_14_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: python-environments-cli
# title: Virtual environments and interpreter commands
# kind: exposition
# difficulty: easy
# teaches: python-environments-cli
# assesses: python-environments-cli
# requires: python-modules-packages
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 15. Virtual environments and interpreter commands

    ### Exposition

    Virtual environments isolate dependencies between projects. Using
    `python -m` ties package installation and module execution to a specific
    interpreter.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    exercise_15_description = mo.md(
        """
        ### Exercise

        Create `commands` as the three shell commands needed to create a `.venv`,
        install a package with the active interpreter, and run a module.
        """
    )
    exercise_15_starter = mo.ui.code_editor(
        value='commands = [\n    "python -m venv .venv",\n    "python -m pip install package-name",\n    "python -m package.module",\n]',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    exercise_15_submit = mo.ui.run_button(label="Submit answer")
    return exercise_15_description, exercise_15_starter, exercise_15_submit




@app.cell(hide_code=True)
def _(assertion, execute_submission, mo, problem, exercise_15_description, exercise_15_starter, exercise_15_submit):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns.get("commands") == [
            "python -m venv .venv",
            "python -m pip install package-name",
            "python -m package.module",
        ], "one or more interpreter commands are incorrect"
        return ns

    problem(mo, exercise_15_description, exercise_15_starter, _submission, exercise_15_submit)
    return

# === MLPHD UNIT END ===


@app.cell
def _(mo):
    mo.md("""
    ## Next steps

    Revisit any exercise marked **Not yet**, then continue with the official
    [Language Reference](https://docs.python.org/3/reference/),
    [Standard Library](https://docs.python.org/3/library/), and
    [Glossary](https://docs.python.org/3/glossary.html).
    """)
    return


if __name__ == "__main__":
    app.run()
