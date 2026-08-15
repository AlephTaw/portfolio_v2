# Prompt: Convert screenshot problem sets into an interactive notebook

Copy this prompt and replace the bracketed values. It is intentionally domain-neutral: the
source may contain programming exercises, mathematics, SQL, statistics, systems questions,
or another mixture of executable and written problems.

---

Convert the problem-set screenshots in `[SCREENSHOT_DIRECTORY]` into a standalone,
browser-executable Marimo notebook at `[NOTEBOOK_PATH]`.

The finished notebook must contain every unique problem exactly once, preserve multipart
questions, provide the supporting information required to solve each problem, and grade
submissions automatically. Implement the complete conversion; do not stop after extracting
or summarizing the screenshots.

## 1. Reconcile the screenshots before building

Inventory every source file and visually inspect it. OCR may accelerate transcription, but
do not trust OCR alone for numbering, code, formulas, table names, punctuation, or answer
matching.

Create a human-reviewable canonical inventory in
`[SCREENSHOT_DIRECTORY]/problem_inventory.md` or a structured JSON file. For every image,
record:

- its filename;
- its printed problem number, when present;
- whether it is a question, answer, schema/context image, or continuation;
- the canonical problem ID to which it belongs (`q01`, `q02`, ...);
- its part order within that problem;
- whether it is a duplicate and, if so, which capture supersedes it;
- any ambiguity or correction made during reconciliation.

Use printed numbering, repeated colored labels, headings, content continuity, and capture
order together to associate split images. Consolidate overlapping captures. Preserve the
original printed number as metadata while assigning contiguous stable IDs `q01`, `q02`, ...
to the unique problems.

Verify these invariants before notebook implementation:

1. Every screenshot is accounted for exactly once in the inventory.
2. Every unique question has its matching answer or an explicitly documented missing answer.
3. Every continuation belongs to one and only one question or answer.
4. Duplicate captures do not create duplicate exercises.
5. The canonical IDs are contiguous and deterministically ordered.

## 2. Create canonical problem objects

Represent every canonical problem with at least:

- `question_id` (`q01`, `q02`, ...);
- original source number;
- title and optional organization/category;
- complete question statement;
- reference answer;
- answer type, such as executable code, numeric value, structured result, multiple choice,
  or written explanation;
- supporting tables, fixtures, diagrams, constants, or files;
- grading specification;
- source-image mapping;
- notes describing source defects or deliberate corrections.

Keep this representation deterministic and inspectable. If the exercise needs substantial
structured data, create a reproducible asset builder rather than embedding ad hoc state in
many notebook cells. Use the repository's established asset conventions when they exist.
For example, relational problems may use one SQLite file with central question metadata and
question-scoped physical tables such as `q01__events`. Register and publish generated assets
only when the repository workflow requires it.

Correct obvious OCR damage and syntax errors. If a provided reference answer is invalid,
dialect-specific, nondeterministic, or logically incorrect, preserve the intended problem,
write a correct executable reference answer, and record the correction in the inventory and
problem metadata. Do not silently change the learning objective.

## 3. Build one self-contained Marimo notebook

The notebook must run independently from other problem notebooks. Put shared imports,
grading helpers, and any database or fixture connection in its first setup cells. Do not
depend on variables created by another notebook or another problem.

Use repository-relative development paths and browser-safe published asset URLs. Never bake
in a developer's absolute machine path. Pin time-sensitive fixtures to a documented reference
date so results do not change with the current clock.

For every problem, place the exercise immediately after any necessary exposition. Each
exercise must visibly contain, in this order:

1. A concise Markdown problem statement.
2. An interactive answer input, such as `mo.ui.code_editor`, `mo.ui.text_area`, a number
   input, or a choice control.
3. A submission control whose value is checked by an assertion-decorated submission
   function and reported as correct or incorrect.

Use a form or Submit button so unfinished edits do not grade continuously. Before submission,
show a neutral instruction. After submission, show a success callout or actionable
learner-facing feedback.

For executable exercises, render the grader feedback first and then a console-style execution
panel. Show the complete submitted output with its column names and rows, including when the
semantic grader marks the answer incorrect. If execution fails, show the caught exception type
and full message in that panel. This should feel like a language-appropriate sandbox—such as a
SQL client result grid beneath SQL grading—without exposing a raw notebook exception.
Do not render this execution panel for written, conceptual, multiple-choice, or other
non-executable exercises; those receive grader feedback only.

Add a **Reveal reference answer** control to each exercise. Keep the answer hidden initially,
allow it to be revealed before or after submission, and format it appropriately for its answer
type. Revealing an answer is a learner-requested hint and must not alter the submitted answer or
automatically mark the exercise correct. Its revealed state must persist after the control is
selected so the answer does not immediately disappear during reactive re-execution.

Catch syntax errors, runtime errors, malformed results, and failed assertions. Expected
learner mistakes must become concise feedback callouts and must never appear as raw Marimo
cell exceptions, tracebacks, or ancestor errors.

## 4. Render supporting context inline

Keep the information needed to solve a problem inline within that problem's exposition.
Choose the smallest clear representation:

- Render tabular schemas and sample records as real Markdown or HTML tables—not Python tuple
  reprs, JSON blobs, or comma-separated prose.
- Label every table and show column names, declared types when relevant, and a small set of
  representative rows.
- When multiple tables participate, render each separately in logical join order.
- Render formulas with Markdown/LaTeX and preserve all symbols and subscripts.
- Render diagrams or source images only when converting them to prose or tables would lose
  information.
- Keep large datasets in the backing asset and show only enough rows to understand the task.

Inline context is the default because it minimizes navigation and memory burden. Use a
collapsible detail panel only when the supporting material is unusually large; do not move
essential schema or constraints to a distant appendix.

## 5. Grade meaning, not formatting

Use the strongest applicable semantic checker:

- Executable code: run it in an isolated learner namespace and test behavior, outputs, edge
  cases, and required interfaces.
- SQL or query languages: execute read-only submissions against problem-scoped fixtures and
  compare normalized result columns and rows with the canonical result. Accept equivalent
  query text.
- Numeric answers: compare with an explicitly chosen tolerance and units.
- Structured answers: validate the schema and normalized values.
- Multiple choice: compare stable option IDs rather than display text.
- Written explanations: use a concise rubric of required concept groups or manually
  reviewable criteria. Allow synonyms and original wording; do not require verbatim matching.

Do not reveal the reference answer through the browser UI, source comments adjacent to the
exercise, starter content, error messages, or fixture names. Keep canonical answers available
to the trusted local checker in the manner supported by the notebook runtime. If client-side
execution makes true answer secrecy impossible, avoid displaying it and document that
limitation rather than claiming secrecy.

For query or code exercises, reject destructive operations unless mutation is the explicit
learning objective. Use disposable per-session data when mutation is required.

## 6. Follow Marimo scoping practices

Prefix cell-local temporary values and helper implementations with `_`. A leading underscore
makes a Marimo binding local to its cell. Values intentionally consumed by later cells—such
as a form, submit button, shared fixture connection, or reusable grading function—must have a
stable unique exported name and must not be reassigned later.

Avoid copying large helper implementations into every exercise. Prefer a small reusable
problem renderer and grading adapter, while keeping each problem's visible statement, input,
and feedback together. The resulting notebook source should remain understandable without
executing a generator mentally.

## 7. Validate the complete artifact

Before reporting completion:

1. Validate that the screenshot inventory covers every source image exactly once.
2. Validate canonical ID continuity and question/answer pairing.
3. Build every generated fixture or data asset from source.
4. Run every canonical executable answer against its fixture.
5. Test at least one accepted and one rejected submission for every grading strategy.
6. Compile the notebook source.
7. Run repository lint and focused tests.
8. Export or execute the notebook top-to-bottom in an isolated environment.
9. Inspect the rendered artifact and confirm that supporting tables, formulas, inputs, and
   feedback display correctly.
10. Search the export for raw tracebacks, ancestor errors, missing modules, and leaked answers.

Preserve unrelated working-tree changes. Do not edit generated public artifacts directly;
update their source builders and regenerate them through the established workflow.

## Deliverables

Return:

- the canonical screenshot inventory;
- the standalone Marimo notebook;
- canonical fixture/data source and its deterministic builder, when required;
- generated local/published assets required by the repository;
- focused regression tests;
- a concise reconciliation summary giving screenshot count, unique-problem count, duplicate
  count, continuation count, executable versus written exercise counts, and any corrections;
- exact validation commands and outcomes.

Do not claim completion if any screenshot is unaccounted for, a reference answer cannot run,
an exercise exposes raw errors, or essential supporting context is not readable inline.

---

## Recommended placeholder values

For a repository following the MLPHD conventions, a typical invocation is:

```text
[SCREENSHOT_DIRECTORY] = sql_problems
[NOTEBOOK_PATH] = notebooks/<subject>/<problem-family>/<problem-set>.py
```

Keep a standalone problem-set notebook named for the set itself. Use an `all_in_one_` prefix
and MLPHD unit markers only when the notebook is intentionally an all-in-one authoring source
that will later be split into curriculum units.
