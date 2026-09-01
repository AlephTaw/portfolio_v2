# Notebook-to-MLPHD integration workflow

This is the operational source of truth for authoring an all-in-one Marimo
tutorial, splitting it into independently executable units, registering those
units, and publishing them in the MLPHD Quest web app.

## The artifact model

Each tutorial family lives in its own directory:

```text
notebooks/<domain>/<tutorial-family>/
├── all_in_one_<tutorial-name>.py   # editable authoring source
└── units/
    ├── <unit-id>.py                # generated standalone Marimo unit
    └── units.json                  # generated ordered unit manifest
```

Every all-in-one filename starts with `all_in_one`. The all-in-one notebook is
the source of truth. Files under `units/` are generated artifacts: do not edit
them directly because the next split overwrites generated content.

The family directory provides ownership and avoids collisions between tutorials
that happen to teach similarly named concepts. Empty notebook scaffolds are not
all-in-one tutorials until they contain substantive, unit-marked content.

## How unit boundaries are represented

Unit boundaries are explicit comments inside the first cell owned by each unit:

```python
@app.cell
def _(mo):
    # === MLPHD UNIT START ===
    # id: binary-search
    # title: Sorting and binary search
    # kind: exposition
    # difficulty: medium
    # teaches: binary-search
    # assesses: binary-search
    # requires: arrays-and-hash-maps
    # ===
    mo.md("""
    ## Sorting and binary search

    Exposition may be the first cell in a unit.
    """)
    return

@app.cell
def _(mo):
    # Demonstration or concept check.
    return

```

Keeping the marker inside the cell is important: Marimo may discard standalone
comments between cells when it saves a notebook from the browser editor. The
unit continues until the next marked cell, so source order is its implicit
ordering. The legacy top-level `MLPHD UNIT START/END` format remains supported
for existing tutorials, but new or actively edited tutorials should use the
in-cell start format.

Metadata fields are mandatory:

| Field | Meaning |
| --- | --- |
| `id` | Unique, stable, kebab-case unit ID and generated filename stem |
| `title` | Human-readable curriculum title |
| `kind` | `exposition` or `exercise` |
| `difficulty` | `easy`, `medium`, or `hard` |
| `teaches` | Comma-separated concept IDs taught by the unit |
| `assesses` | Comma-separated concept IDs checked by the unit |
| `requires` | Comma-separated prerequisite concept IDs |

An empty list is written as an empty value, for example `# requires:`.

## Source order is curriculum order

Unit order is implicit in the order of marked cells in the source
file. The splitter assigns orders `10`, `20`, `30`, and so on and writes them to
`units/units.json`. Moving a complete marked block changes the generated order.

This means authors do not maintain a second order list while drafting. When the
units are registered in a curated MLPHD view, preserve the manifest order unless
there is an explicit editorial reason to diverge. Prerequisites remain a concept
graph, independent of display order; `requires` does not itself place a unit in a
view.

## Choosing a unit boundary

Start a new unit when one of these changes:

- the central mental model;
- prerequisites;
- the exercise or grading target;
- difficulty or likely curriculum placement;
- runtime dependencies or fixtures.

Keep short examples, demonstrations, pitfalls, and concept checks in the same
unit when they share the same concept and dependencies. A concept check can stay
inside an exposition unit. Create a separate `exercise` unit only when the
assessment needs an independent deep link, ordering, reuse, or difficulty.

Every extracted unit must execute independently. A unit must not depend on state
created only by an earlier marked unit. Put reusable browser-safe helpers in
`src/mlphd_bootcamp/`, import them in the source preamble, or repeat a small
fixture inside the unit. The splitter includes the source preamble before the
first marked cell in every generated notebook.

Independence is an execution requirement, not only a content requirement. Test
every generated notebook as its own Marimo application. Imports, fixtures,
widgets, grading callbacks, and defaults needed by a unit must exist in that
unit or its copied preamble. Concept prerequisites control learning order but
must never be treated as runtime dependencies on an earlier unit.

Registered units are combined into one shared Marimo application whose interaction payload is
split into lazy interactive layers by subject. Exported global names must therefore be unique
across the registered curriculum. Shared grading behavior belongs in
`mlphd_bootcamp.exercises` and is imported by the shared runtime. The
splitter scopes only generated `exercise_<number>_*` UI bindings with the unit
ID because those values must cross Marimo cells. Any other reusable global must
move into `mlphd_bootcamp`, use an equivalent unit-specific strategy, or be made
cell-local with an underscore when it does not need to cross cells.

## Authoring conventions

Within a topic, use this order:

1. Markdown exposition with separate Motivation and Goal statements.
2. Small runnable demonstrations.
3. A nested `### Exercise` immediately after its exposition.
4. Interactive input such as `mo.ui.code_editor`.
5. A submit control such as `mo.ui.run_button`.
6. An assertion-decorated submission function that reports correct or incorrect.

Prefix definitions with `_` when they are local to one Marimo cell:

```python
@assertion(lambda _namespace: None)
def _submission(source):
    ...
```

An underscore prevents Marimo from exporting the binding, so it cannot be used
for UI values consumed by the next reactive cell. Name those exported bindings
`exercise_<number>_description`, `exercise_<number>_starter`, and
`exercise_<number>_submit`; the splitter scopes them in generated units. Import
`assertion`, `execute_submission`, and `problem` from `mlphd_bootcamp` rather
than redefining grading behavior. This gives standalone lessons and the combined
Quest consistent feedback and one place to troubleshoot grading. Exercises
should avoid mutating the host or requiring external infrastructure when parsing,
mocking, or checking the learner’s answer is sufficient.

## Splitting an all-in-one notebook

Register each extractable family in `FAMILIES` inside
`scripts/split_all_in_one_notebooks.py`, then generate every family:

```sh
npm run curriculum:units
```

To split one family while authoring:

```sh
uv run python scripts/split_all_in_one_notebook.py \
  notebooks/data-science/algorithms/python-algorithms/all_in_one_python_algorithms.py \
  --output-dir notebooks/data-science/algorithms/python-algorithms/units
```

The splitter validates balanced markers, required metadata, allowed kinds and
difficulties, unique kebab-case IDs, and the presence of a Marimo cell. It emits
one standalone `.py` notebook per unit plus `units.json`.

Check that generated files match their sources without writing:

```sh
npm run curriculum:units:check
```

A failure means the source was changed without regenerating units, a generated
file was edited manually, or marker metadata is invalid.

## Registering concepts

Unit markers provide extraction metadata, but `curriculum/mlphd.yaml` remains
the human-reviewed curriculum graph and catalog source.

For every concept named in `teaches`, `assesses`, or `requires`, add one entry:

```yaml
concepts:
  - id: binary-search
    title: Binary Search
    requires:
      - arrays-and-hash-maps
```

Concept requirements form a directed acyclic graph. They express knowledge
dependencies, not display nesting. Keep concept IDs stable because units and
future personalized paths refer to them.

## Registering generated unit notebooks

For every selected entry in `units/units.json`, add a catalog unit:

```yaml
units:
  - id: binary-search
    title: Sorting and Binary Search
    notebook: notebooks/data-science/algorithms/python-algorithms/units/binary-search.py
    outputPath: /bootcamp/binary-search.html
    kind: exposition
    difficulty: medium
    teaches:
      - binary-search
    assesses:
      - binary-search
    topics:
      - algorithms
      - interviewing
    roles:
      - data-scientist
    goals:
      - prepare-for-interviews
```

Copy `id`, `title`, `kind`, `difficulty`, `teaches`, and `assesses` from the
manifest. `requires` belongs on the corresponding concept entry rather than the
unit schema. Add editorial `topics`, `roles`, and `goals` during registration.
Choose a unique `outputPath`.

Not every generated unit must be registered immediately. Generation proves the
source can be decomposed; registration determines what appears in the product.

## Adding units to the MLPHD Quest view

Add registered unit IDs under the desired hierarchy in `views.default.items`:

```yaml
- type: section
  id: algorithms
  title: Algorithms
  order: 30
  children:
    - type: unit
      unit: python-algorithms-complexity
      order: 10
    - type: unit
      unit: python-algorithms-hash-maps
      order: 20
```

Use the implicit source order from `units.json` as the default sibling order.
The catalog validator rejects duplicate units, unknown concepts, missing files,
cycles, invalid metadata, and views that place units before concept prerequisites.

## Databases and other browser assets

For SQL units, editable database builders live under `database/builders/` and
canonical databases live under `database/`. Browser units open published copies
through `mlphd_bootcamp`; they must not depend on an author’s local database.

For other static assets, place browser-served generated copies under
`public/bootcamp/` and keep the editable source in its domain directory. Verify
that dependencies are compatible with the shared Pyodide/Marimo Islands runtime.

## Build and validation sequence

Run the complete workflow:

```sh
npm run curriculum:units
npm run curriculum:catalog
npm run curriculum:export
npm run curriculum:test
npm run dev
```

`curriculum:export` already regenerates units before catalog validation. It then
exports registered notebooks and builds the static document, shared Marimo runtime payload,
and subject-grouped lazy interactive layers.
Inspect the MLPHD page for ordering, headings, typography, mathematical symbols, spacing,
interaction, grading feedback, deep-link stability during hydration, and browser-runtime errors.

An uncaught notebook exception must never be published. The export and shared
Islands builders fail when Marimo writes diagnostics or when rendered output
contains known exception markers. Expected learner mistakes belong inside the
assertion/submission boundary and must render concise feedback or a deliberate
notice instead of a traceback. Never suppress an authoring or runtime defect
just to make a build pass; correct the unit and rerun the complete workflow.

The minimum completion checklist is:

- all-in-one source uses the family directory and `all_in_one` naming convention;
- markers are balanced and metadata is complete;
- source order matches intended unit order;
- each unit is independently executable;
- expected learner errors are caught and shown as feedback, with no traceback;
- standalone exports, static document, shared runtime, and interactive layers contain no
  error markers;
- static exposition contains build-time KaTeX and no `marimo-tex` runtime elements;
- dependency-only interactive cells are hidden and do not reserve visible layout space;
- code-editor exercises retain distinct learner and island-source object IDs, and Submit answer
  produces learner-facing grading feedback in a browser test;
- generated units and `units.json` are current;
- concepts and prerequisites are registered;
- catalog units point to generated notebooks;
- view items preserve valid prerequisite order;
- catalog, export, lint, tests, and browser inspection pass.

## Legacy all-in-one notebooks

A legacy source without markers may coexist temporarily with hand-maintained
unit notebooks, as the SQL tutorial currently does. It is not eligible for the
automated splitter until its cells are reorganized into independently executable
blocks and marked. Name legacy monoliths with the `all_in_one` prefix so they are
discoverable, and do not add them to `FAMILIES` until extraction is deterministic.

Migration steps are:

1. Identify existing standalone units and the source cells that own them.
2. Move shared setup into browser-safe helpers or the common preamble.
3. Remove hidden state between candidate units.
4. Add metadata markers in the intended source order.
5. Generate into `units/` and compare behavior with the existing units.
6. Update catalog paths only after generated replacements pass validation.
