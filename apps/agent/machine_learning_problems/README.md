# Machine-learning screenshot-to-notebook pipeline

This directory is the immutable source-capture area for the machine-learning interview
problem set. The PNG files are preserved as uploaded. Generated problem-bank assets and
notebooks live elsewhere in the app; this folder retains the audit trail used to reconstruct
them.

## Status

Conversion is complete. The canonical reconciliation record is
`question_inventory.md`: 22 screenshots were reconciled into 35 unique questions (`7.1`
through `7.35`, canonical IDs `q01` through `q35`). Captured solutions cover `7.1` through
`7.30`. The source contains no solutions for `7.31` through `7.35`; complete canonical
answers were authored for those five and are marked `source_solution_status = 'missing'`.

## Pipeline

1. Enumerate every PNG and read its filesystem creation metadata with `find` and `stat`.
   Sort by creation time because adjacent captures may be continuations.
2. Run Tesseract over each image as a transcription aid. OCR output is never canonical by
   itself, especially for equations, Greek letters, subscripts, punctuation, or printed
   problem numbers.
3. Visually inspect every image. Record its filename, printed source number, role
   (question, solution, or continuation), fragment order, and canonical problem ID in
   `question_inventory.md`.
4. Join sequential fragments by printed numbering, headings, prose/formula continuity, and
   creation order. Consolidate overlapping captures and document duplicates or missing
   fragments explicitly.
5. Produce contiguous canonical IDs (`q01`, `q02`, ...). Preserve source intent while
   repairing OCR damage and recording any absent or incomplete source solution.
6. Store deterministic problem metadata, canonical explanations, semantic rubric groups,
   source-image mappings, and reconciliation notes in a reproducible SQLite problem-bank
   builder under `database/builders/`.
7. Grade explanations by required concept groups with synonyms and original wording allowed;
   do not require verbatim source text. Conceptual questions receive grader feedback only—no
   execution-console panel.
8. Add the reconciled set to the machine-learning interview Marimo authoring notebook. Each
   exercise contains a statement, written-answer input and explicit submission control,
   automatic grading, and a collapsed reference-answer disclosure.
9. Split/register curriculum units through the repository's source-driven MLPHD workflow,
   regenerate derived catalog/island assets, and avoid hand-editing generated output.
10. Validate inventory coverage, canonical ID continuity, answer/rubric pairing, accepted and
    rejected submissions, Python compilation, Ruff, focused tests, isolated Marimo export,
    rendered formulas and controls, and absence of raw tracebacks or ancestor errors.

## Commands used during extraction

Run from `/Users/stevenwilcox/Desktop/swdev`:

```sh
find apps/agent/machine_learning_problems -type f -exec stat -f '%m %SB %z %N' -t '%Y-%m-%d %H:%M:%S' {} \; | sort -n
for screenshot_file in apps/agent/machine_learning_problems/*.png; do
  basename "$screenshot_file"
  tesseract "$screenshot_file" stdout
done
```

## Produced assets

- Reproducible bank builder: `database/builders/build_machine_learning_problem_bank.py`
- Canonical database: `database/machine_learning_problem_bank.sqlite`
- Browser copy: `public/bootcamp/data/machine_learning_problem_bank.sqlite`
- All-in-one notebook: `notebooks/data-science/ml-methods/machine-learning-interviews/all_in_one_machine_learning_interviews.py`
- Generated units: `notebooks/data-science/ml-methods/machine-learning-interviews/units/ml-interview-problem-set-{easy,medium,hard}.py`
- Focused tests: `tests/python/test_interview_problem_banks.py`

The bank contains eleven easy, fifteen medium, and nine hard exercises. Canonical answers
are checked against the same required-concept rubric groups used by the notebook grader.
The five authored replacements disclose their provenance in both the database and learner UI.

## Build and validation commands used

Run from `/Users/stevenwilcox/Desktop/swdev/apps/agent`:

```sh
.venv/bin/python -m database.builders.build_all
.venv/bin/python -m database.builders.publish
.venv/bin/python scripts/split_all_in_one_notebooks.py
npm run curriculum:catalog
.venv/bin/python scripts/build-mlphd-islands.py
.venv/bin/pytest -q tests/python/test_interview_problem_banks.py tests/python/test_sql_problem_bank.py
.venv/bin/ruff check database/builders/build_machine_learning_problem_bank.py tests/python/test_interview_problem_banks.py scripts/split_all_in_one_notebook.py scripts/build-mlphd-islands.py notebooks/data-science/ml-methods/machine-learning-interviews/all_in_one_machine_learning_interviews.py
```

Final result: all four focused bank tests passed, Ruff passed, all 56 generated tutorial
units were current, and the shared MLPHD build completed with 60 registered units and no
uncaught Marimo diagnostics.
