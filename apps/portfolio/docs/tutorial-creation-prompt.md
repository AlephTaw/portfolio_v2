# Prompt: Create a unit-ready interactive tutorial

Create a tutorial as both:

1. a concise Markdown reference document; and
2. a browser-executable Marimo notebook under `notebooks/`.

The tutorial should be practical, implementation-oriented, and suitable for
incorporation into the MLPHD curriculum.

Place each tutorial family in its own directory:

```text
<tutorial-family>/
├── all_in_one_<tutorial-name>.py
└── units/
```

The editable all-in-one filename must begin with `all_in_one`. Files under
`units/` are generated and must not be edited directly.

## Content and teaching structure

Organize the tutorial into coherent concepts rather than one long list of
features. For every topic:

1. Begin with a short `Motivation` explanation: why the concept matters.
2. Add a short `Goal` explanation: what the learner will be able to do.
3. Provide exposition with concise examples and important pitfalls.
4. Put one or more implementation exercises immediately after the exposition.
5. Give every exercise an answer or an automatic checker.
6. Include dedicated sections for testing the artifact and using it in
   production when those concerns apply.

Use the smallest useful example. Prefer runnable code and commands over vague
descriptions. Explain tradeoffs and failure modes where they affect real use.

## Marimo notebook structure

Use the existing Marimo tutorial conventions:

- `marimo.App(width="medium")`.
- A setup cell importing `marimo as mo` and other shared dependencies.
- Import `assertion`, `execute_submission`, and `problem` from
  `mlphd_bootcamp`; do not redefine grading infrastructure in each tutorial.
- A title and prerequisites cell.
- A separate exposition cell for each topic.
- An exercise cell immediately below its exposition cell.
- An interactive input area, usually `mo.ui.code_editor`.
- A Submit button, usually `mo.ui.run_button`.
- A reusable assertion decorator that executes the submitted answer in an
  isolated namespace and displays success, warning, or error feedback.
- Never require the learner to mutate the host machine just to complete an
  exercise; mock or inspect commands when real infrastructure is unnecessary.

Each exercise cell has three visible parts:

1. Markdown description of the problem.
2. Interactive input-area function call.
3. Assertion-decorated submission function that checks and grades the answer.

If a value does not need to cross cells, prefix its definition with an
underscore, such as `_submission` or `_namespace`. A leading underscore makes a
Marimo binding cell-local. UI elements whose values are consumed by a later cell
must remain exported; use stable `exercise_<number>_description`,
`exercise_<number>_starter`, and `exercise_<number>_submit` names in the readable
all-in-one source. The unit splitter scopes those generated cross-cell bindings
for the combined MLPHD runtime.

## Unit markers for MLPHD extraction

The source notebook is an all-in-one authoring artifact, but it must be
splittable into independently addressable MLPHD units. Place machine-readable
comments outside Marimo cells around every complete unit:

```python
# === MLPHD UNIT START ===
# id: topic-name-exposition
# title: Topic name
# kind: exposition
# difficulty: easy
# teaches: concept-id
# assesses:
# requires: prerequisite-concept-id
# ===

@app.cell
def _(mo):
    mo.md("""
    ## Topic name

    Motivation and goal...
    """)
    return

# === MLPHD UNIT END ===
```

Follow these rules:

- Markers must be ordinary top-level source comments, not text inside a
  Markdown or Python cell.
- The first cell in a unit may be a Markdown exposition cell.
- Everything between `MLPHD UNIT START` and `MLPHD UNIT END` belongs to that
  unit, including all Markdown, code, UI, and checking cells.
- Each unit must be independently executable after extraction. Repeat small
  setup code or import helpers from a shared module when necessary.
- Use stable, kebab-case IDs. Every ID must be unique.
- Use `kind: exposition` for teaching units and `kind: exercise` for assessment
  units. Concept checks may remain inside an exposition unit when they share its
  scope; use a separate exercise unit when it needs independent curriculum
  addressability.
- Keep metadata sufficient for a future `curriculum/mlphd.yaml` entry:
  `id`, `title`, `kind`, `difficulty`, `teaches`, `assesses`, and `requires`.
- Do not put unrelated topics in one unit merely to reduce the marker count.
  A unit should represent one teachable concept or tightly coupled concept
  cluster that can stand on its own.

## Unit-boundary decision rule

Create a new unit when at least one of these changes:

- the learner’s central mental model;
- the prerequisite concept required to understand the material;
- the exercise’s grading target;
- the likely curriculum placement or difficulty;
- the needed runtime dependencies or fixtures.

Keep material in the same unit when it is a short explanation, example, or
practice step for the same concept and shares the same scope.

## Quality checks

Before delivering:

1. Compile the Marimo source with Python.
2. Confirm every unit has exactly one start and end marker.
3. Confirm every unit has a unique ID and valid metadata.
4. Confirm every exposition unit is followed by its intended exercises.
5. Confirm repeated per-cell variables use underscore-prefixed names.
   Cross-cell exercise UI bindings are the intentional exception and must use
   the documented stable names.
6. Run the notebook top-to-bottom when Marimo is available.
7. Confirm exercises grade both correct and incorrect submissions.
8. Keep commands safe, deterministic, and explicit about external side effects.

## Deliverables

Return:

- the Markdown tutorial;
- the unit-marked Marimo notebook;
- a short list of units and concepts created;
- validation results and any environment limitation.
