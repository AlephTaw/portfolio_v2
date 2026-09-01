import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

from split_all_in_one_notebook import parse_units  # noqa: E402


def _unit_ids(path: Path) -> list[str]:
    _preamble, blocks = parse_units(path)
    return [metadata["id"] for metadata, _body in blocks]


def test_in_cell_markers_survive_for_problem_set_notebooks():
    algorithm_ids = _unit_ids(
        ROOT
        / "notebooks/data-science/algorithms/python-algorithms/all_in_one_python_algorithms.py"
    )
    machine_learning_ids = _unit_ids(
        ROOT
        / "notebooks/data-science/ml-methods/machine-learning-interviews"
        / "all_in_one_machine_learning_interviews.py"
    )

    assert len(algorithm_ids) == 11
    assert algorithm_ids[-3:] == [
        "python-algorithm-interview-easy",
        "python-algorithm-interview-medium",
        "python-algorithm-interview-hard",
    ]
    assert len(machine_learning_ids) == 11
    assert machine_learning_ids[-3:] == [
        "ml-interview-problem-set-easy",
        "ml-interview-problem-set-medium",
        "ml-interview-problem-set-hard",
    ]


def test_legacy_start_end_markers_remain_supported():
    ids = _unit_ids(
        ROOT
        / "notebooks/data-science/python/python-language/all_in_one_python_tutorial.py"
    )
    assert len(ids) == 15
    assert ids[0] == "python-values-names"
    assert ids[-1] == "python-environments-cli"
