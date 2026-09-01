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


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # ALGORITHMS
    """)
    return


@app.cell
def _():
    from pydantic import validate_call

    return (validate_call,)


@app.cell
def _():
    # Use uv for pyenv (python versions), pip (10-100x package manager), virtualenv, pipx (install on demand), poetry/pip-tools (reproducible app dependency tree, a lock file)
    # Use pydantic for runtime data validation
    # Use Ruff for linter and formatter (replaces flake8/pylint, black, isort, mypy)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Python Tutorial
    """)
    return


app._unparsable_cell(
    """
    # patterns
    ## finite state machine - just wrapp a match-case statement (or if/elif/else statements with a while loop that waits for true / termination state to be reached, and initalize with some state in the set of states.)
    ## factory patterns - ...
    ## ...
    ## object oriented
    ## functional
    ## data oriented



    # variables
    # control flow
    ## conditional, case
    if (condition):
        #do stuff
    elif(condition):
        #do stuff
    else:
        #do stuff

    match condition:
        case value1:
            #do stuff
            case value2:
            #do stuff
            #...
        default:
            #do stuff

    ## for, while
    for i in [iterable]:
        #do stuff

    while a < b:
        #do stuff
        a+=increment

    ## range(), break, else (clauses in loops), pass, match, enumerate, zip(*iterables, strict=True)
    range(0,10) -> iterable 0,1, ...,9
    for i in range(0,10):
        if i > 12:
            break
    else:
        print(\"i is in range\")

    zip(*iterables, strict=True)

    ## function definitions, arguments, kwarg, special parameters (positional or kawg, positional only, kwarg only), type hints
    def func(*, kwarg: type -> default,.., kwargn: typen -> defaultn, **kwarg_dict:??) -> return_type:
    ## arbitrary argument list

    ## assignment (swapping / permutations)
    a, b, c  = c, a, b

    ## unpacking arguement lists
    head,*tail = [1,2,3,4]
    a, b, c = [1,2,3]

    ## throw away variables
    for _ i range(0,10):
        print(f\"{_}\")

    for index, value in enumerate(my_list):
        print(index, value)

    for name, score in zip(name, score):
        print(f\"{name}: {score}\")

    ## Comprehensions
    ### list
    [for i in zip(a,b) f\"{a} and {b}}\"]
    ### dictionary
    square_dict = {x: x**2 for x in range(5)}
    ### set
    unique_lengths = {len(word) for word in [\"apple\", \"banana\", \"pear\"]}
    ### expressions
    sum(x**2 for x in range(0,10))

    ## Misc
    ### safe dictionary fetches
    value - my_dict.get(\"missing_key\", \"defaut_value\")
    ### initialize default dictionary
    from collections import defaultdict
    word_counts = defaultdict(int)
    word_counts[\"apple\"] += 1

    ### count frequencies with Counter
    from collectinos import Counter
    counts = Counter([\"apple\", \"banana\", \"apple\"])

    ### extract unique elements with set()

    ### slicing to copy or reverse collectinons

    reversed = my_list[::-1]
    shallow_copy = my_list[:]

    ## Conditional and truth value testing
    if my_list:
        pass

    if value is None:
        pass

    if 250<=age:
        print(\"old\")

    ### ternary conditional expressions
    status = \"old\" if age >= 250 else \"child\"

    ### test membership
    if color in {\"red\", \"green\", \"blue\"}:
        # primary color test
        pass

    ### Error Handling & Resource Management
    try:
        # do something
    except NameOfError:
        # do something else

    ### shallow copy vs. deep copy distinction and usage

    # f strings - idiom
    name = 'Alice'
    age = '12'
    print(f\"hello, {name}. You are {age}.}\")

    str1.join(current_str)
    # instead of
    str1 = str1 + current_str # (since string is immutable this creates a new string)
    # del statement
    del i[10:]
    ### instead of ...
    i = i[0:10]

    # tuples, lists, sets, looping techniques, dictionaries
    my_tuple = (a, b, c, d)
    # IO
    with open(\"text_file_name.txt\", \"rw\") as file:
        contents = file.read()
        contents = file.write(\"..text to add to the file...\")

    # Erors and Exceptions - Handling, raising, chainging, defining exceptions
    from exceptions import NameOfException
    if (condition):
        raise NameOfException
    try:
        # do something
    catch:
        # do something else, possibly raise a specific exception
        raise SpecificException

    # Classes - class definitions, class objects, class methods, constructors
    class MyClass:
        \"\"\"
        \"\"\"
        def __init__(self, *, kwarg1:type =kwarg1_default, ...):
            \"\"\"
            \"\"\"
            self.kwarg1 = karg1

        @getter
        def my_getter():
            \"\"\"
            \"\"\"

        @setter
        def my_setter:
            \"\"\"
            \"\"\"

    # Decorators - @property, @classmethod, @staticmethod, @dataclasses.dataclass, @setter?, @getter?, @YourCustomDecoratorOrWrapper
    ### Decorators are just syntactic sugar for function wrappers? ... they return and modify functions??

    from dataclass import dataclass

    @dataclass
    class User:
        first_name: str
        last_name: str

        @property
        def full_name(self):
            return f\"{self.first_name} {self.last_name}\"

    ### @property

    # Iterators, generators

    # Data Structures - linkedlist, stack, queue, dictionary, tree, heap, bst, graph

    # Algorithms - create, retrieve, update, delete
    # logging

    # main script execution guard - idiom
    if __name__ == \"__main__\":
        main()

    # modules
    ## create and import your own module 101

    # packaging
    ## your own toml
    """,
    name="_"
)


@app.cell
def _():
    ## Manual vs. Pydantic Data validation

    ### MANUAL

    from dataclasses import dataclass
    import re

    @dataclass
    class User:
        id: int
        email: str

        def __post_init__(self):
            # 1. Manual type checking (since Python ignores the hints)
            if not isinstance(self.id, int):
                # Try to force it, otherwise crash
                try:
                    self.id = int(self.id)
                except (ValueError, TypeError):
                    raise TypeError("id must be an integer")

            # 2. Manual business logic validation
            if self.id <= 0:
                raise ValueError("id must be positive")

            # 3. Complex manual string parsing
            email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
            if not re.match(email_regex, self.email):
                raise ValueError("Invalid email format")

    ### Pydantic
    from pydantic import BaseModel, Field, EmailStr

    class User(BaseModel):
        id: int = Field(gt=0) # Automatically guarantees integers > 0
        email: EmailStr       # Automatically guarantees valid email structure

    return


@app.cell
def _(validate_call):
    # @validate_call # infers and converts types automatically
    # pydantic auto converts type if it can
    @validate_call(config={"strict": True}) # forces an error instead of converting types automatically
    def test_function(*, arg1: int | None = None, arg2: str | None = None) -> None:
        '''
        '''
        print(arg1)
        print(arg2)

    test_function(arg1='1', arg2='fsd')
    # apparently type hints are not enforced.
    return


@app.cell
def _():
    return


app._unparsable_cell(
    r"""
    # Linked List

    class Node():
        def __init__(self, value: any, next) -> None:
            self.value = None
            self.next = None

        def setValue(self, value: any) -> None:
            self.value = value

        def getValue(self, value) -> any:
            return self.value

        def setNext(self, next: Node()) -> None:
            self.next = next

        def setNext(self, next: Node()) -> None:
            return self.next

    class LinkedList(Node()):
        def __init__(self, head: Node) -> None:
            self.head = Node()

        def peek() -> Node:
            '''
            '''
            return self.head.value

        def isEmpty() -> bool:
            '''
            '''
            return self.head is None

        def size() -> int:
            '''
            '''
            i = 1
            while self.next is not None:
                i+=1
            return i

        def isFull()
            '''
            '''

        def clear() -> bool:
            '''
            '''
            if self.head = None:
                return True
            current = self.head
            while current.next is not None:
                next = current.next
                current.next = None
                current = next
            return True
    """,
    name="_"
)


@app.cell
def _():
    # Doubly Linked List
    return


app._unparsable_cell(
    r"""
    # Stack

    class Stack():
        def __init__():
            '''
            '''
            self.base = LinkedList()
            self.top = self.base


        def push():
            '''
            '''
            self.top.next = ...
            self.top = self.top.next


        def pop():
            '''
            '''
            self.top.


        def peek():
            '''
            '''
    """,
    name="_"
)


@app.cell
def _():
    # Queue
    return


@app.cell
def _():
    # Heap
    return


@app.cell
def _():
    # BST
    return


@app.cell
def _():
    # Graph
    return


@app.cell
def _():
    # BFS
    return


@app.cell
def _():
    # DFS
    return


@app.cell
def _():
    # Others...
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # THE PYTHON TUTORIAL TOPICS
    """)
    return


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
def _(
    assertion,
    exercise_01_description,
    exercise_01_starter,
    exercise_01_submit,
    mo,
    problem,
):
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


@app.cell(hide_code=True)
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
def _(
    assertion,
    exercise_02_description,
    exercise_02_starter,
    exercise_02_submit,
    mo,
    problem,
):
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
def _(
    assertion,
    exercise_03_description,
    exercise_03_starter,
    exercise_03_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"command": ("move", "north")}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("direction") == "north", "direction is incorrect"
        return ns

    problem(mo, exercise_03_description, exercise_03_starter, _submission, exercise_03_submit)
    return


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
def _(
    assertion,
    execute_submission,
    exercise_04_description,
    exercise_04_starter,
    exercise_04_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["greet"]() == "Hello, world!", "greet default is incorrect"
        assert ns["greet"]("Ada") == "Hello, Ada!", "greet argument is incorrect"
        assert ns["total"](1, 2, 3) == 6, "total is incorrect"
        return ns

    problem(mo, exercise_04_description, exercise_04_starter, _submission, exercise_04_submit)
    return


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
def _(
    assertion,
    exercise_05_description,
    exercise_05_starter,
    exercise_05_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"numbers": [-2, -1, 0, 2, 3], "defaults": {"a": 1, "b": 2}, "overrides": {"b": 9}}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("squares") == [4, 9], "squares is incorrect"
        assert ns.get("merged") == {"a": 1, "b": 9}, "merged is incorrect"
        return ns

    problem(mo, exercise_05_description, exercise_05_starter, _submission, exercise_05_submit)
    return


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
def _(
    assertion,
    exercise_06_description,
    exercise_06_starter,
    exercise_06_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"items": ["a", "b"], "limit": 6}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns.get("indexed") == [(1, "a"), (2, "b")], "indexed is incorrect"
        assert list(ns["evens"]) == [0, 2, 4], "evens is incorrect"
        return ns

    problem(mo, exercise_06_description, exercise_06_starter, _submission, exercise_06_submit)
    return


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
def _(
    assertion,
    exercise_07_description,
    exercise_07_starter,
    exercise_07_submit,
    mo,
    problem,
):
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
def _(
    assertion,
    execute_submission,
    exercise_08_description,
    exercise_08_starter,
    exercise_08_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        user = ns["User"]("Ada")
        assert user.greet() == "Hi, Ada", "greet is incorrect"
        assert len(user) == 3, "__len__ is incorrect"
        return ns

    problem(mo, exercise_08_description, exercise_08_starter, _submission, exercise_08_submit)
    return


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
def _(
    assertion,
    execute_submission,
    exercise_09_description,
    exercise_09_starter,
    exercise_09_submit,
    mo,
    problem,
):
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
def _(
    assertion,
    execute_submission,
    exercise_10_description,
    exercise_10_starter,
    exercise_10_submit,
    mo,
    problem,
):
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
def _(
    assertion,
    execute_submission,
    exercise_11_description,
    exercise_11_starter,
    exercise_11_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = execute_submission(source)
        assert ns["Path"]("data.txt").name == "data.txt", "Path was not imported correctly"
        assert callable(ns["main"]), "main is missing"
        return ns

    problem(mo, exercise_11_description, exercise_11_starter, _submission, exercise_11_submit)
    return


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
def _(
    assertion,
    exercise_12_description,
    exercise_12_starter,
    exercise_12_submit,
    mo,
    problem,
):
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
def _(
    assertion,
    exercise_13_description,
    exercise_13_starter,
    exercise_13_submit,
    mo,
    problem,
):
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
def _(
    assertion,
    exercise_14_description,
    exercise_14_starter,
    exercise_14_submit,
    mo,
    problem,
):
    @assertion(lambda ns: None)
    def _submission(source):
        ns = {"words": ["python", "data", "python"]}
        exec(compile(source, "<submission>", "exec"), ns, ns)
        assert ns["counts"]["python"] == 2, "Counter result is incorrect"
        assert ns["close"] is True, "use an approximate floating-point comparison"
        return ns

    problem(mo, exercise_14_description, exercise_14_starter, _submission, exercise_14_submit)
    return


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
def _(
    assertion,
    execute_submission,
    exercise_15_description,
    exercise_15_starter,
    exercise_15_submit,
    mo,
    problem,
):
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


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Practice
    """)
    return


app._unparsable_cell(
    r"""
    _a = 5
    _b = 6

    _a, _b = _b, _a

    print('a is {a} and b is {}'.format(_b, a=_a))

    ##

    for _i in range(0,10):
        print(_i)

    ##

    _i = 0
    while _i<10:
        print(_i)
        _i+=1

    if elif else

    if():
        # do stuff
    elif():
        # do stuff
    else:
        # do stuff

    match():
        case:

    # Python functions
    # Function arguments
            - default values
            - keyword arguments
            - positional
            keyword only
            functional
            arbutrary argument lists
            unpacking
            lamda expressions
            doc strings
            function annotation
    # Keyword arguments
    # Data structyres
    ## lists
    ## stacks
    ## queues
    ## list comprehensions
    ## nested list comprehensions
    ## dictionaries

    # Modules
    # Packages
    # IO
    # errors and exception handling
    # Classes
    # polymorphism
    # single/multiple dispatch
    # decorators
    # iterators
    # generators
    # regular expression / pattern matching
    # logging
    # virtual env (UV and Rust thingy)

    # PYTHON IDIOMS
    """,
    name="_"
)


@app.cell
def _():
    return


@app.cell
def _():
    # list comprehensions
    print([2*_i + 1 for _i in {1,2,3}])
    print([2*_i + 1 for _i in range(1,4)])
    return


app._unparsable_cell(
    r"""
    try
        with open(file: example.txt):
            ...
    except
    """,
    name="_"
)


@app.cell
def _():
    # Custom exception define

    Exception
    return


@app.cell
def _():
    # Idioms
    return


@app.cell
def _():
    # Type hints...
    return


@app.cell
def _():
    # linting rules
    # formatting rules
    return


@app.cell
def _():
    # REST api: fast api, flask
    return


@app.cell
def _():
    # Cloud functions
    return


@app.cell
def _():
    # Schema validation
    return


@app.cell
def _():
    # Logging
    return


@app.cell
def _():
    # Packaging
    return


@app.cell
def _():
    # Model implementations
    return


app._unparsable_cell(
    r"""
    # MLOps Example System - DS/ML Learning App
    # # ...

    # Data Science
    # # Imbalanced Data Sets
    # # # Evaluation Metrics
    # # # Over and Undersampling
    # # # Ensemble Menthods
    # # # Cost Sensitive Learning

    # # Machine Learning Identifiability and Interpetability
    # # # Identifiable models
    # # # Interpretable models
    # # # White boxed models
    # # # Post Hoc Methods
    # # # Surrogates

    # # Feature Engineering
    # # # Variable Types and Characteristics
    # # # Missing Data Imputation (Single and Multivariate)
    # # # Categorical Encoding
    # # # Variable Transformation (Normalization/Feature Scaling, etc.)
    # # # Discretization
    # # # Outlier Handling
    # # # Date Time Variables
    # # # Mixed Variables and Tabular Data Consideration
    # # # Feature Engineering Pipeline Considerations

    # # Feature Selection
    # # # Filter
    # # # Wrapper
    # # # Embedded Methods
    # # # Hybrid Feature Selection Methods

    # # Hyperparameter Optimization
    # # # Performance Metrics
    # # # Cross-Validation
    # # # Basic Search Algorithms
    # # # Bayesian Optimization
    # # # SMBO Algorithims

    # # # (Omit) Libraries (Scikit-Opimize, Optuna, etc.)

    # Task Specific DL
    # # Evals, etc.

    # Traditional ML Models
    # # Classification
    # # Regression
    # # Time-Series Forcasting and Simulation (Dynamical Systems)
    # # Hypothesis Testing
    # # Clustering
    # # Anomaly Detection

    # LLM System Engineering
    # # Vector Databases
    # # Fine-Tuning
    # # Model Compression (Quantization, etc.)

    # ML Model Development Life Cycle & QA
    # # Value Proposition and Evaluation Criteria: Business Use Case, KPIs, etc.
    # # System Requirements & Solution Design (Is ML a good fit?)
    # # Initial Feasability Study, POC
    # # Data Acquisition (Engineering)
    # # Lab Environment
    # # # Exploratory Data Analysis (EDA)
    # # # Feature Engineering*
    # # # Feature Selection*
    # # # Model Development & and Training
    # # # Local Model Pipeline Testing
    # # Integration Environement
    # # # Integration Testing
    # # Production Environment
    # # # Testing Prod - Smoke testing, User Acceptance Testing, End-to-End Testing
    # # # Release System (w/ Shadow, Canary, A/B or Bandits, Graceful Degradation, Rollbacks, etc.)
    # # Continue System Development and Automation
    # # # Deployment Requirements
    # # # MLOps Automation Levels

    # MLOPS System Design
    # # Dependency Tracking (Versioned Containers, Versioned Model Package, Data Versioning)

    # # Experiment Tracking
    # # Full Model / Data Provenance (Versioning)
    # # Meta Data
    # # Logging, Performance Monitoring & Alerting
    # # ReGraceful Degredation, Rollbacks
    # # Data
    # # # Data Validation
    # # # Schema Validation
    # Automation / CX
    # # CI/CD
    # # CT
    # # ...

    # Testing

    # # ML Pipeline
    # # # Model
    # # # Model Config
    # # # Model Performance (Unit Tests)
    # # # Differential Testing


    # # UI
    # # # Unit Tests
    # # # Service Tests
    # # # UI Tests

    # # Backend
    # # Unit Tests

    # # Development Workflow
    # # # Dev
    # # # Integration (# 1)
    # # # Integration (# 2)
    # # # Production


    # Basic SDLC:

    ### AGILE + QA WRAPPER ###
    # # Requirements: Application, Security, Data, and Governance Considerations
    # # Secure design and threat modeling
    # # Code and Code reviews
    # # Testing
    # # Secure deployment and Configuration
    # # Observability and Maintenance
    # # Vulnerability managment, patch / release lifecycle tracking.
    # # Retirement / Transition

    # DevSec Ops Deployment Scoring Rubric

    # # Security Checks & Scans - Sonar Cube (Vuln DB, )
    # # Code Quality
    # # Data Governance
    # # Observability: Monitoring, Alerting, Metrics, Traces, etc.
    # # Test Coverage
    # # Secret / Key Management
    # # QA Integration / Plan
    # # Infrastructure as Code
    # # Networking??

    # Enterprise Specific Standards and Pattern Checklist

    ### ~ In Summary ~ ###
    # Principles and Best Practices Checklist
    # # Experiment Tracking
    # # Metadata Management
    # # # The Whys?
    # # # # Reproducibility

    # Machine Learning Test Score
    # # Two
    # # ...

    ** References**
    The machine learning test score
    The hidden credit card of machine learning technical debt
    mlops continuous integration and delivery google architecture
    mlops practitioners guide
    ml-ops.org
    martin fowler
    whatver that noobie LLM eval / llm as a judge guy's blog is...
    langchain training content - rag, agents, etc. from scratch
    """,
    name="_"
)


@app.cell
def _():
    # Docker Kubernetes...
    return


@app.cell
def _():
    # Data Science and Machine Learning
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
