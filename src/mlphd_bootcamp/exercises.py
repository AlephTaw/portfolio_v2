"""Small exercise primitives that work in CPython and Pyodide."""

from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from functools import wraps
from typing import Any

import marimo as mo


@dataclass(frozen=True)
class CheckResult:
    """Structured feedback returned by a browser-local exercise check."""

    correct: bool
    message: str


NamespaceTest = Callable[[Mapping[str, Any]], None]


def execute_submission(
    source: str, namespace: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Execute learner code in a browser-local namespace and return that namespace."""
    submission_namespace = namespace if namespace is not None else {}
    submission_namespace.setdefault("__name__", "__submission__")
    exec(
        compile(source, "<submission>", "exec"),
        submission_namespace,
        submission_namespace,
    )
    return submission_namespace


def assertion(checker: Callable[[Any], None]) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Decorate a submission function with consistent learner-facing feedback."""

    def decorate(submission: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(submission)
        def wrapped(source: str) -> Any:
            try:
                checker(submission(source))
            except AssertionError as error:
                message = str(error) or "The result did not pass this exercise."
                return mo.callout(f"Not yet: {message}", kind="warn")
            except Exception as error:  # noqa: BLE001 - learner failures become feedback.
                return mo.callout(
                    f"Not yet: {type(error).__name__}: {error}", kind="danger"
                )
            return mo.callout("Correct — the assertions passed.", kind="success")

        return wrapped

    return decorate


def problem(
    marimo_module: Any,
    description: Any,
    starter: Any,
    submission: Callable[[str], Any],
    submit: Any,
) -> Any:
    """Render a code exercise and its feedback with one consistent layout."""
    if not submit.value:
        feedback = marimo_module.callout(
            "Edit the answer, then click Submit answer.", kind="neutral"
        )
    else:
        feedback = submission(starter.value)
    return marimo_module.vstack([description, starter, submit, feedback], gap=1)


def run_python_tests(source: str, tests: Sequence[NamespaceTest]) -> CheckResult:
    """Execute submitted source and run lesson-owned assertions against its namespace.

    The caller is responsible for executing this only in an appropriate runtime. Published
    MLPHD exercises call it inside the visitor's browser-hosted Pyodide worker, never on the
    website server.
    """

    try:
        namespace = execute_submission(source)
        for test in tests:
            test(namespace)
    except AssertionError as error:
        return CheckResult(False, str(error) or "The result did not pass this exercise.")
    except Exception as error:  # noqa: BLE001 - learner exceptions are returned as feedback.
        return CheckResult(False, f"{type(error).__name__}: {error}")

    return CheckResult(True, "Correct.")
