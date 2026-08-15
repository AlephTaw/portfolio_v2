"""Deterministic builders for canonical MLPHD SQLite databases."""

from .build_aggregation import build_aggregation_database
from .build_select import build_select_database
from .build_sql_problem_bank import build_sql_problem_bank

DATABASE_BUILDERS = {
    "aggregation.sqlite": build_aggregation_database,
    "select.sqlite": build_select_database,
    "sql_problem_bank.sqlite": build_sql_problem_bank,
}

__all__ = [
    "DATABASE_BUILDERS",
    "build_aggregation_database",
    "build_select_database",
    "build_sql_problem_bank",
]
