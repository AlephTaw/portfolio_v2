#!/usr/bin/env python3
"""Generate every MLPHD unit family from its all-in-one Marimo source."""

from pathlib import Path

from split_all_in_one_notebook import split

FAMILIES = (
    (
        Path("notebooks/data-science/algorithms/python-algorithms/all_in_one_python_algorithms.py"),
        Path("notebooks/data-science/algorithms/python-algorithms/units"),
    ),
    (
        Path("notebooks/data-science/python/python-language/all_in_one_python_tutorial.py"),
        Path("notebooks/data-science/python/python-language/units"),
    ),
    (
        Path("notebooks/data-science/ml-engineering/docker-compose/all_in_one_docker_compose.py"),
        Path("notebooks/data-science/ml-engineering/docker-compose/units"),
    ),
    (
        Path("notebooks/data-science/ml-methods/machine-learning-interviews/all_in_one_machine_learning_interviews.py"),
        Path("notebooks/data-science/ml-methods/machine-learning-interviews/units"),
    ),
    (
        Path("notebooks/data-science/mathematics/probability-statistics-interviews/all_in_one_probability_and_statistics.py"),
        Path("notebooks/data-science/mathematics/probability-statistics-interviews/units"),
    ),
)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    total = 0
    for source, output_dir in FAMILIES:
        units = split(source, output_dir, check=args.check)
        total += len(units)
        action = "validated" if args.check else "generated"
        print(f"{action}: {source} -> {len(units)} units")
    print(f"{'Validated' if args.check else 'Generated'} {total} units total.")


if __name__ == "__main__":
    main()
