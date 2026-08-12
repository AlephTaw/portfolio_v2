"""Small exercise primitives that work in CPython and Pyodide."""

from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CheckResult:
    """Structured feedback returned by a browser-local exercise check."""

    correct: bool
    message: str


NamespaceTest = Callable[[Mapping[str, Any]], None]


def run_python_tests(source: str, tests: Sequence[NamespaceTest]) -> CheckResult:
    """Execute submitted source and run lesson-owned assertions against its namespace.

    The caller is responsible for executing this only in an appropriate runtime. Published
    MLPHD exercises call it inside the visitor's browser-hosted Pyodide worker, never on the
    website server.
    """

    namespace: dict[str, Any] = {"__name__": "__submission__"}

    try:
        compiled = compile(source, "<submission>", "exec")
        exec(compiled, namespace)
        for test in tests:
            test(namespace)
    except AssertionError as error:
        return CheckResult(False, str(error) or "The result did not pass this exercise.")
    except Exception as error:  # noqa: BLE001 - learner exceptions are returned as feedback.
        return CheckResult(False, f"{type(error).__name__}: {error}")

    return CheckResult(True, "Correct.")
