# Python algorithm screenshot-to-notebook pipeline

This directory is the immutable source-capture area for the Python algorithm interview
problem set. The PNG files are preserved as uploaded. Generated problem-bank assets and
notebooks live elsewhere in the app; this folder retains the audit trail used to reconstruct
them.

## Status

Conversion is complete. The canonical reconciliation record is
`question_inventory.md`: 29 screenshots were reconciled into 30 unique questions (`9.1`
through `9.30`, canonical IDs `q01` through `q30`) with no duplicate or missing solutions.

## Pipeline

1. Enumerate every PNG and read its filesystem creation metadata with `find` and `stat`.
   Sort by creation time because adjacent captures may be continuations.
2. Run Tesseract over each image as a transcription aid. OCR output is never canonical by
   itself, especially for Python indentation, punctuation, subscripts, formulas, or printed
   problem numbers.
3. Visually inspect every image. Record its filename, printed source number, role
   (question, solution, or continuation), fragment order, and canonical problem ID in
   `question_inventory.md`.
4. Join sequential fragments by printed numbering, headings, sentence/code continuity, and
   creation order. Consolidate overlapping captures and document duplicates or missing
   fragments explicitly.
5. Produce contiguous canonical IDs (`q01`, `q02`, ...). Preserve source wording while
   correcting obvious OCR damage and invalid source code. Record substantive corrections.
6. Store deterministic problem metadata, reference implementations, starter signatures,
   tests, grading specifications, source-image mappings, and notes in a reproducible SQLite
   problem-bank builder under `database/builders/`.
7. Execute every reference implementation against its complete test specification. Grade
   learner code semantically in an isolated namespace; display grader feedback first and
   captured return values or exceptions underneath as a Python-console-style panel.
8. Add the reconciled set to the Python algorithms Marimo authoring notebook. Each exercise
   contains a statement, code input and explicit submission control, automatic grading, and
   a collapsed reference-answer disclosure.
9. Split/register curriculum units through the repository's source-driven MLPHD workflow,
   regenerate derived catalog/island assets, and avoid hand-editing generated output.
10. Validate inventory coverage, canonical ID continuity, reference answers, accepted and
    rejected submissions, Python compilation, Ruff, focused tests, isolated Marimo export,
    rendered controls, and absence of raw tracebacks or ancestor errors.

## Commands used during extraction

Run from `/Users/stevenwilcox/Desktop/swdev`:

```sh
find apps/agent/python_algorithm_problems -type f -exec stat -f '%m %SB %z %N' -t '%Y-%m-%d %H:%M:%S' {} \; | sort -n
for screenshot_file in apps/agent/python_algorithm_problems/*.png; do
  basename "$screenshot_file"
  tesseract "$screenshot_file" stdout
done
```

## Produced assets

- Reproducible bank builder: `database/builders/build_python_algorithm_problem_bank.py`
- Canonical database: `database/python_algorithm_problem_bank.sqlite`
- Browser copy: `public/bootcamp/data/python_algorithm_problem_bank.sqlite`
- All-in-one notebook: `notebooks/data-science/algorithms/python-algorithms/all_in_one_python_algorithms.py`
- Generated units: `notebooks/data-science/algorithms/python-algorithms/units/python-algorithm-interview-{easy,medium,hard}.py`
- Focused tests: `tests/python/test_interview_problem_banks.py`

The bank contains six easy, eighteen medium, and six hard exercises. Every canonical
reference implementation is executed against its stored tests before the database can be
built. The grader catches syntax and runtime errors, shows assertion feedback first, then
shows stdout and per-test actual values in a console-style panel.

## Build and validation commands used

Run from `/Users/stevenwilcox/Desktop/swdev/apps/agent`:

```sh
.venv/bin/python -m database.builders.build_all
.venv/bin/python -m database.builders.publish
.venv/bin/python scripts/split_all_in_one_notebooks.py
npm run curriculum:catalog
.venv/bin/python scripts/build-mlphd-islands.py
.venv/bin/pytest -q tests/python/test_interview_problem_banks.py tests/python/test_sql_problem_bank.py
.venv/bin/ruff check database/builders/build_python_algorithm_problem_bank.py tests/python/test_interview_problem_banks.py scripts/split_all_in_one_notebook.py scripts/build-mlphd-islands.py notebooks/data-science/algorithms/python-algorithms/all_in_one_python_algorithms.py
```

Final result: all four focused bank tests passed, Ruff passed, all 56 generated tutorial
units were current, and the shared MLPHD build completed with 60 registered units and no
uncaught Marimo diagnostics.
