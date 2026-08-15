# Python tutorial cheat sheet

An all-topic reference aligned with the [official Python tutorial](https://docs.python.org/3/tutorial/).
It is a compact map of the tutorial’s syntax, concepts, and everyday tools
rather than a replacement for its explanations. Examples target Python 3.10+.

## Tutorial map

**Motivation:** A clear sequence prevents the language’s features and tools from
feeling like an unrelated collection of facts.

**Goal:** Use this map to navigate the tutorial and identify the concepts needed
for writing complete Python programs.

1. Interpreter usage and an informal language introduction
2. Control-flow tools and functions
3. Data structures
4. Modules and packages
5. Input and output
6. Errors, exceptions, and classes
7. Standard-library tour
8. Virtual environments and packages
9. Interactive editing, floating-point limits, and next steps

## Values and literals

**Motivation:** Every Python program manipulates values, and literal syntax is
the fastest way to create those values directly.

**Goal:** Recognize and construct Python’s built-in value types from source code.

```python
None                         # absence of a value
True, False                  # booleans
42, -3, 2_000_000            # integers
3.14, 1e-3                   # floating-point numbers
1 + 2j                       # complex number
"hello", 'hello'            # strings
"""multi-line text"""
b"raw bytes"                # bytes
[1, 2, 3]                    # list
(1, 2, 3)                    # tuple
{"a": 1}                    # dictionary
{1, 2, 3}                    # set
...
```

```python
f"{name=}, total={price * quantity:.2f}"  # formatted string
r"C:\new\file.txt"                        # raw string
0b1010, 0o12, 0xFF                         # binary, octal, hexadecimal
```

## Names, assignment, and identity

**Motivation:** Understanding names and object identity prevents accidental
aliasing and confusion about what assignment changes.

**Goal:** Bind, unpack, compare, and delete names deliberately.

```python
count = 0
a = b = []                  # both names refer to the same list
first, second = pair        # unpacking
head, *middle, tail = items # starred unpacking
a, b = b, a                 # swap

total += 1                  # augmented assignment
del temporary               # remove a name or item

value is None               # identity: same object
value == other              # equality: same value
```

Assignment binds a name; it does not copy the object. Use `copy.copy()` or
`copy.deepcopy()` when an actual copy is needed.

## Expressions and operators

**Motivation:** Expressions are the smallest units that compute results and
combine values into useful decisions and transformations.

**Goal:** Choose the appropriate arithmetic, comparison, Boolean, membership,
bitwise, and conditional operators.

```python
# Arithmetic
a + b; a - b; a * b; a / b       # true division
a // b; a % b; a ** b             # floor division, remainder, exponent

# Comparisons (can be chained)
x < y <= z
a == b; a != b; a is b; a is not b

# Boolean logic (short-circuiting)
ready and authorized
cached or compute()
not enabled

# Membership
item in collection
key not in mapping

# Bitwise operations on integers
x & mask; x | flags; x ^ other; ~x; x << n; x >> n

# Conditional expression
label = "yes" if approved else "no"
```

Use parentheses when precedence is not obvious. `not` binds more tightly than
`and`, and `and` binds more tightly than `or`.

## Truthiness and common built-ins

**Motivation:** Python’s truth-testing and built-in functions let ordinary code
express common checks and conversions with little ceremony.

**Goal:** Test values idiomatically and use core built-ins to inspect or convert
objects.

Falsey values include `None`, `False`, numeric zero, and empty strings,
collections, and containers. Everything else is truthy unless a class defines
different behavior.

```python
if items:
    process(items)

len(items)
type(value)
isinstance(value, ExpectedType)
str(value)       # human-readable text
repr(value)      # debugging representation
int("42")
float("3.5")
bool(value)
any(iterable)    # at least one truthy item
all(iterable)    # every item truthy; true for an empty iterable
```

## Control flow

**Motivation:** Programs need to choose between paths and repeat work based on
conditions and sequences.

**Goal:** Write readable branches, loops, loop controls, and pattern matches.

```python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"

for item in iterable:
    if should_skip(item):
        continue
    if is_done(item):
        break
else:
    print("loop completed without break")

while condition:
    update()
else:
    print("condition became false")
```

`pass` is a no-op placeholder. `...` is an expression commonly used in stubs.

## Functions

**Motivation:** Functions package behavior so it can be named, reused, tested,
and passed around as data.

**Goal:** Define and call functions with defaults, keyword arguments, variadic
arguments, closures, and appropriate return values.

```python
def add(a: int, b: int = 0) -> int:
    """Return the sum of two values."""
    return a + b

add(2, 3)                  # positional arguments
add(a=2, b=3)              # keyword arguments

def configure(*args, debug=False, **options):
    """*args collects positional values; **options collects keyword values."""
    ...

double = lambda n: n * 2  # small expression-only function
```

Default arguments are evaluated once, when the function is defined. Avoid
mutable defaults:

```python
def append_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

Functions are objects: they can be stored, passed to other functions, and
returned. A closure retains names from its defining scope.

## Core containers

**Motivation:** Most programs organize groups of values rather than handling
isolated objects one at a time.

**Goal:** Select and manipulate lists, tuples, dictionaries, sets, strings, and
their shared sequence operations.

```python
items = ["a", "b", "c"]
items.append("d"); items.pop(); items[0]; items[-1]; items[1:]

point = (10, 20)            # immutable sequence
coords = (*point, 30)       # tuple unpacking

user = {"name": "Ada", "active": True}
user["name"]
user.get("email", "unknown")
user["role"] = "admin"
for key, value in user.items():
    print(key, value)

unique = {1, 2, 2, 3}
unique.add(4)
unique | {4, 5}             # union
unique & {2, 4}             # intersection
unique - {1}                # difference
```

Strings and sequences support indexing and slicing: `sequence[start:stop:step]`.
The stop index is exclusive, and omitted bounds default to the sequence ends.

## Comprehensions and unpacking

**Motivation:** Python provides compact syntax for transforming, filtering, and
combining iterable data.

**Goal:** Use comprehensions and unpacking when they improve clarity without
concealing complex logic.

```python
squares = [n * n for n in range(10)]
odd_squares = {n: n * n for n in range(10) if n % 2}
unique_lengths = {len(word) for word in words}
lines = (line.strip() for line in source.splitlines())  # generator expression

combined = [*first, *second]
merged = {**defaults, **overrides}
```

Prefer a regular loop when a comprehension becomes difficult to read.

## Iteration

**Motivation:** Lazy and explicit iteration lets programs process data uniformly
without requiring every value to be stored in memory at once.

**Goal:** Work with iterables, iterators, enumeration, parallel iteration, and
generators.

```python
for index, value in enumerate(items, start=1):
    print(index, value)

for left, right in zip(names, scores, strict=True):
    print(left, right)

iterator = iter(items)
next(iterator)
next(iterator, "finished")   # default instead of StopIteration
```

An iterable can produce an iterator. A generator is a compact, lazy iterator:

```python
def countdown(start):
    while start:
        yield start
        start -= 1
```

## Exceptions and resource handling

**Motivation:** Real programs encounter invalid input, failures, and resources
that must be released reliably.

**Goal:** Handle failures predictably and use context managers for safe setup and
cleanup.

```python
try:
    result = parse(text)
except ValueError as error:
    log(error)
except (TypeError, KeyError):
    recover()
else:
    validate(result)         # runs only if no exception occurred
finally:
    cleanup()                # runs either way

raise ValueError("invalid input")
```

Use `with` for objects that manage setup and cleanup:

```python
with open("data.txt", encoding="utf-8") as file:
    text = file.read()
```

## Classes and protocols

**Motivation:** Classes bundle state and behavior, while protocols let code work
with any object that supports the required operations.

**Goal:** Define simple classes and write behavior-oriented code using Python’s
object model.

```python
class User:
    kind = "person"         # class attribute

    def __init__(self, name):
        self.name = name      # instance attribute

    def greet(self):
        return f"Hi, {self.name}"

    def __repr__(self):
        return f"User({self.name!r})"

user = User("Ada")
user.greet()
```

```python
class Admin(User):
    def greet(self):
        return super().greet() + " (admin)"
```

Python favors protocols (what an object can do) over exact types. For example,
`for item in value` works with any object implementing iteration, and
`len(value)` works with any object implementing `__len__`.

## Imports and modules

**Motivation:** Splitting code into modules makes programs easier to reuse,
test, navigate, and maintain.

**Goal:** Import names, understand module execution, and recognize package-level
organization.

```python
import math
from pathlib import Path
from package import function as alias

if __name__ == "__main__":
    main()                   # only when run as a script
```

Keep imports at module scope unless a deliberate lazy import is needed.

## Additional official-tutorial topics

**Motivation:** The tutorial also introduces several features that do not fit
neatly into the initial primitives but are essential in modern Python code.

**Goal:** Connect advanced syntax, tooling, and runtime practices to the core
language concepts above.

Pattern matching (Python 3.10+):

```python
match command:
    case ["quit"]:
        stop()
    case ["move", direction, distance] if distance > 0:
        move(direction, distance)
    case _:
        print("unknown command")
```

Parameter forms and function metadata:

```python
def f(pos_only, /, normal, *args, keyword_only=True, **kwargs):
    return pos_only, normal, args, keyword_only, kwargs

def area(width: float, height: float) -> float:
    """Return the area of a rectangle."""
    return width * height
```

Annotations are documentation and tooling hints; Python does not enforce them
at runtime. `*args` collects extra positional arguments and `**kwargs` collects
extra keyword arguments. Use a named `def` when a function needs a name,
documentation, or more than one expression.

### Type hints

**Motivation:** Explicit type information makes interfaces easier to understand
and enables useful editor and static-analysis feedback.

**Goal:** Annotate values and callable interfaces, model structured data, and
describe supported behavior without changing runtime semantics.

Type hints describe intended interfaces for readers, IDEs, and static type
checkers. They do not change Python’s runtime behavior by themselves.

```python
from collections.abc import Iterable, Sequence

def total(values: Iterable[float]) -> float:
    return sum(values)

def first(values: Sequence[str]) -> str | None:
    return values[0] if values else None

def lookup(table: dict[str, int], key: str, default: int = 0) -> int:
    return table.get(key, default)
```

Common forms include aliases, constrained string values, and dictionary-shaped
records:

```python
from typing import Literal, TypeAlias, TypedDict

UserId: TypeAlias = int | str
Status = Literal["pending", "done"]

class UserRecord(TypedDict):
    name: str
    active: bool

users: list[UserRecord] = []
maybe_user: UserRecord | None = None
```

Use `Protocol` when describing behavior rather than requiring inheritance:

```python
from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def finish(resource: SupportsClose) -> None:
    resource.close()
```

`Any` disables checking for a value, while `object` means “some value” without
assuming which operations it supports. Prefer precise types when practical.

### Decorators

**Motivation:** Cross-cutting behavior such as logging, caching, and registration
is easier to reuse when it can wrap existing callables.

**Goal:** Read and write decorators while preserving the wrapped callable’s
metadata and type intent.

A decorator receives a function or class and returns a replacement or modified
version. The `@name` syntax is equivalent to rebinding the decorated object:

```python
@decorator
def work():
    ...

# Equivalent to: work = decorator(work)
```

Preserve the wrapped function’s name and docstring with `functools.wraps`:

```python
from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar

ReturnT = TypeVar("ReturnT")

def logged(function: Callable[..., ReturnT]) -> Callable[..., ReturnT]:
    @wraps(function)
    def wrapper(*args: Any, **kwargs: Any) -> ReturnT:
        print(f"calling {function.__name__}")
        return function(*args, **kwargs)
    return wrapper

@logged
def add(a: int, b: int) -> int:
    return a + b
```

Decorators can accept configuration by adding another function layer:

```python
def repeat(times: int):
    def decorate(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = function(*args, **kwargs)
            return result
        return wrapper
    return decorate

@repeat(3)
def greet(name):
    print(f"Hi, {name}")
```

Built-in decorator examples include `@property`, `@classmethod`,
`@staticmethod`, and `@dataclass` from the standard library.

### Modules and packages

**Motivation:** Larger programs need a predictable namespace and import structure
that scales beyond one source file.

**Goal:** Organize modules into packages and understand search paths, relative
imports, and script entry points.

Modules are `.py` files. A package is a directory of modules, commonly marked
by `__init__.py`:

```python
from . import helpers
from .models import User

import sys
import module_name
sys.path                  # module search path
dir(module_name)          # available names
module_name.__file__
```

Keep executable entry-point code behind `if __name__ == "__main__":` so that
importing a module does not run the program. The module search path, `dir()`,
and `__name__` are the tutorial’s basic tools for understanding imports.

### Input, output, and files

**Motivation:** Programs become useful when they can communicate with users and
persist or exchange data.

**Goal:** Format output, read input, manage text and binary files, and serialize
structured data as JSON.

```python
name = input("Name: ")
print(f"Hello, {name}!", end="\n", sep=" ")
print(f"{value!r:>12.3f}")
print("{} scored {:.1%}".format(name, ratio))

from pathlib import Path
path = Path("data.txt")
path.write_text("hello\n", encoding="utf-8")
text = path.read_text(encoding="utf-8")
```

File modes include `"r"` (read), `"w"` (replace), `"a"` (append), and
`"b"` (binary). Use `with` so the file closes on every path. JSON provides a
simple bridge for structured data:

```python
import json

payload = {"name": "Ada", "scores": [10, 12]}
encoded = json.dumps(payload, indent=2)
decoded = json.loads(encoded)
```

### Errors and exceptions

**Motivation:** Clear error boundaries make failures diagnosable without hiding
bugs or losing the original cause.

**Goal:** Distinguish syntax errors from runtime exceptions, raise meaningful
errors, chain causes, and define application-specific exceptions.

Syntax errors prevent parsing; exceptions occur while valid code runs. Catch
specific exceptions and preserve context when translating them:

```python
try:
    value = int(raw)
except ValueError as error:
    raise RuntimeError("bad numeric input") from error
```

`assert condition, message` is for internal invariants, not user-input
validation. Define application exceptions by subclassing `Exception`:

```python
class ConfigError(Exception):
    """Configuration cannot be loaded."""
```

### Class details

**Motivation:** Understanding attribute lookup and method varieties prevents
subtle bugs when modeling stateful objects and inheritance.

**Goal:** Use instance, class, static, and inherited behavior appropriately.

```python
class Animal:
    count = 0

    def __init__(self, name):
        self.name = name
        Animal.count += 1

    @classmethod
    def total(cls):
        return cls.count

    @staticmethod
    def category():
        return "animal"
```

Instance attributes belong to each object; class attributes are shared. Name
lookup follows the instance, class, and base-class chain. Inheritance is useful
when a subtype satisfies the parent’s interface; composition is often simpler
when it does not.

### Standard-library tour

**Motivation:** Python’s standard library supplies reliable building blocks for
common tasks before custom infrastructure is necessary.

**Goal:** Recognize the right standard modules for files, data, dates, testing,
logging, concurrency, debugging, and numeric work.

The tutorial’s tour is a starter kit, not an exhaustive API reference:

```python
import os, shutil, glob, sys, argparse, re
import math, random, statistics
from datetime import date, datetime, timedelta
from collections import Counter, deque, defaultdict
from itertools import chain, islice
from functools import reduce, lru_cache
from timeit import timeit
```

Also recognize `urllib` (web access), `smtplib` (email), `doctest` and
`unittest` (testing), `logging` (diagnostics), `string.Template` (templating),
`struct` (binary layouts), `threading` (threads), `weakref` (non-owning
references), `decimal` (decimal arithmetic), and `pdb` (debugging).

### Virtual environments and packages

**Motivation:** Isolated environments prevent projects with different dependency
requirements from interfering with one another.

**Goal:** Create an environment, install dependencies with the matching Python,
and capture a reproducible dependency set.

```sh
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# .venv\\Scripts\\activate      # Windows PowerShell
python -m pip install package-name
python -m pip freeze > requirements.txt
deactivate
```

Use `python -m pip` to ensure `pip` belongs to the interpreter you intend.
Modern projects may use a `pyproject.toml`-based build tool instead of a
handwritten requirements file.

### Interpreter, interactive mode, and next steps

**Motivation:** Fast experimentation and correct command-line execution shorten
the feedback loop while learning and debugging Python.

**Goal:** Use the REPL, run scripts and modules, inspect runtime state, and know
which references to consult next.

```sh
python                     # start the REPL
python script.py arg1      # run a script
python -m package.module   # run a module as a script
python -c "print(2 + 2)"   # run a command
```

In the REPL, `>>>` is the primary prompt and `...` continues a block. Tab
completion and history are usually available; `help()` opens built-in help,
and `exit()` leaves the interpreter. Use `sys.argv` for command-line arguments.

Binary floating point stores approximations, so `0.1 + 0.2 == 0.3` may be
false. Use `math.isclose()` for tolerant comparisons, `decimal.Decimal` for
decimal rounding rules, and `fractions.Fraction` for exact rational arithmetic.

The tutorial’s style guidance: use four spaces, descriptive names, readable
lines, docstrings for public code, and blank lines to group logic. Continue
with the [Language Reference](https://docs.python.org/3/reference/),
[Standard Library](https://docs.python.org/3/library/), and
[Glossary](https://docs.python.org/3/glossary.html).

## A compact mental model

**Motivation:** A small set of durable principles helps organize the many syntax
forms and library tools introduced in the tutorial.

**Goal:** Retain a practical model of how Python evaluates, binds, composes, and
executes code.

1. An expression produces a value.
2. A statement performs an action or controls execution.
3. Assignment binds a name to an object.
4. Objects expose behavior through protocols and special methods.
5. Iterables, context managers, and exceptions let ordinary syntax compose.

## Comprehension checks

Each check is intentionally small: predict the result or write the smallest
working implementation before revealing the answer.

### Tutorial map

1. **Check:** Which area covers `json.dump()`? **Answer:** Input and output.
2. **Check:** Which area explains `venv` and `pip`? **Answer:** Virtual environments and packages.

### Values and literals

1. **Check:** Create a set containing `1`, `2`, and `3`. **Answer:** `values = {1, 2, 3}`.
2. **Check:** Create `Price: $5.00` with an f-string. **Answer:** `f"Price: ${5:.2f}"`.

### Names, assignment, and identity

1. **Check:** Swap `left` and `right` without a temporary name. **Answer:** `left, right = right, left`.
2. **Check:** Test whether `value` is `None`. **Answer:** `value is None`.

### Expressions and operators

1. **Check:** Return `"even"` or `"odd"` for `n`. **Answer:** `"even" if n % 2 == 0 else "odd"`.
2. **Check:** Call `load()` only when `cached` is falsey. **Answer:** `cached or load()`.

### Truthiness and common built-ins

1. **Check:** Process only a non-empty `items`. **Answer:** `if items: process(items)`.
2. **Check:** Test whether every score is at least `60`. **Answer:** `all(score >= 60 for score in scores)`.

### Control flow

1. **Check:** Sum integers from `1` through `n`. **Answer:** `total = sum(range(1, n + 1))`.
2. **Check:** Match `("move", direction)`. **Answer:**
   ```python
   match command:
       case ("move", direction): move(direction)
       case _: pass
   ```

### Functions

1. **Check:** Define `greet(name="world")`. **Answer:** `def greet(name="world"): return f"Hello, {name}!"`.
2. **Check:** Sum any number of positional numbers. **Answer:** `def total(*numbers): return sum(numbers)`.

### Core containers

1. **Check:** Retrieve `"Ada"` from `user = {"name": "Ada"}`. **Answer:** `user["name"]`.
2. **Check:** Remove duplicates without preserving order. **Answer:** `set(values)`.

### Comprehensions and unpacking

1. **Check:** Build squares for positive numbers. **Answer:** `[n * n for n in numbers if n > 0]`.
2. **Check:** Merge `defaults`, letting `overrides` win. **Answer:** `{**defaults, **overrides}`.

### Iteration

1. **Check:** Print one-based positions with items. **Answer:** `for position, item in enumerate(items, 1): print(position, item)`.
2. **Check:** Create a lazy generator of even numbers below `limit`. **Answer:** `(n for n in range(limit) if n % 2 == 0)`.

### Exceptions and resource handling

1. **Check:** Convert invalid integer input into `0`. **Answer:**
   ```python
   try: value = int(raw)
   except ValueError: value = 0
   ```
2. **Check:** Read UTF-8 text and guarantee the file closes. **Answer:** `with open(path, encoding="utf-8") as file: text = file.read()`.

### Classes and protocols

1. **Check:** What makes an object usable by `len(value)`? **Answer:** It supplies `__len__`.
2. **Check:** What makes `for item in value` work? **Answer:** The iterable/iterator protocol, usually `__iter__()`.

### Imports and modules

1. **Check:** Import `Path` normally. **Answer:** `from pathlib import Path`.
2. **Check:** Prevent `main()` from running on import. **Answer:** `if __name__ == "__main__": main()`.

### Additional official-tutorial topics

1. **Check:** Name two topics beyond basic syntax. **Answer:** For example, exceptions and virtual environments.
2. **Check:** Where is the full `decimal` API documented? **Answer:** The Python Standard Library reference.

### Type hints

1. **Check:** Annotate a function taking `list[int]` and returning `float`. **Answer:** `def average(values: list[int]) -> float: ...`.
2. **Check:** Annotate a value that may be a string or `None`. **Answer:** `value: str | None`.

### Decorators

1. **Check:** Rewrite `@decorator` as an assignment. **Answer:** `work = decorator(work)` after defining `work`.
2. **Check:** Preserve a wrapped function’s metadata. **Answer:** Use `@functools.wraps(function)`.

### Modules and packages

1. **Check:** Import `helpers` from the current package. **Answer:** `from . import helpers`.
2. **Check:** What does `sys.path` control? **Answer:** The locations searched for imports.

### Input, output, and files

1. **Check:** Serialize `payload` as indented JSON. **Answer:** `json.dumps(payload, indent=2)`.
2. **Check:** Which mode appends rather than replaces? **Answer:** `"a"`.

### Errors and exceptions

1. **Check:** Raise `ConfigError` with a message. **Answer:** `raise ConfigError("missing host")`.
2. **Check:** Preserve an original exception as the cause. **Answer:** `raise ConfigError("invalid config") from error`.

### Class details

1. **Check:** Which decorator supplies `cls`? **Answer:** `@classmethod`.
2. **Check:** Which decorator supplies neither `self` nor `cls`? **Answer:** `@staticmethod`.

### Standard-library tour

1. **Check:** Which module provides `Counter`? **Answer:** `collections`.
2. **Check:** Which module is for application diagnostics? **Answer:** `logging`.

### Virtual environments and packages

1. **Check:** Create `.venv`. **Answer:** `python -m venv .venv`.
2. **Check:** Install with the active interpreter’s pip. **Answer:** `python -m pip install package-name`.

### Interpreter, interactive mode, and next steps

1. **Check:** Run a module as a script. **Answer:** `python -m package.module`.
2. **Check:** Compare floating-point values approximately. **Answer:** `math.isclose(a, b)`.

### A compact mental model

1. **Check:** What does assignment do? **Answer:** It binds a name to an object; it does not inherently copy it.
2. **Check:** What does an expression produce? **Answer:** A value.
