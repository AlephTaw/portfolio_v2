# MLPHD Curriculum Architecture

For repeatable development, asset-generation, Git, testing, and deployment procedures, see
the [project workflow guide](workflows.md).
For all-in-one authoring, source markers, unit extraction, registration, and Quest
integration, see the [notebook-to-MLPHD workflow](notebook-to-mlphd-workflow.md).

The MLPHD page is a continuous curriculum reader assembled from small browser-executable
Marimo notebooks. Each notebook is one independently addressable learning unit. The server
renders the complete readable document and every navigation anchor as ordinary HTML. A
lazy interactive layer adds editors, controls, visualizations, and grading near the reading
cursor without dividing the reader into visible pages.

## Why this shape

- Authors keep prose, LaTeX, Python, SQL, demonstrations, and exercises together in Marimo.
- Units can be reused in multiple learning paths without copying cells or prose.
- The concept dependency graph and the visible curriculum hierarchy remain independent.
- TOC clicks and deep links target static anchors immediately; they never wait for Python,
  Pyodide, Marimo, or a subject payload.
- One shared runtime is warmed in the background, while interaction payloads for nearby
  subjects are fetched and mounted on demand.
- Loaded interactive layers remain mounted, preserving editor input and grading state while the
  learner continues through one uninterrupted document.

## Component choices

- `notebooks/`
  Contains tutorial-family directories. Each family may have one editable
  `all_in_one_*.py` source and a generated `units/` directory containing one Marimo
  notebook per independently addressable curriculum unit.
- `src/mlphd_bootcamp/`
  Provides pure-Python, WASM-compatible exercise and presentation helpers shared by units.
- `database/`
  Contains canonical SQLite databases and their deterministic Python builders. The builder
  modules are the editable source of truth for schemas and seed rows.
- `public/bootcamp/data/`
  Contains generated static copies of the canonical databases for browser delivery. These
  files are ignored build artifacts and should not be edited or committed directly.
- `curriculum/mlphd.yaml`
  Is the human-edited catalog containing concepts, units, and curated views.
- `concepts`
  Form a directed acyclic graph through their `requires` edges.
- `units`
  Map notebook files to the concepts they teach or assess. A unit is either an
  `exposition` or an `exercise` and uses only `easy`, `medium`, or `hard` difficulty values.
- Concept checks
  Live inside their exposition notebook because they share its scope and dependencies.
  They are interactive blocks, not separately addressable curriculum units.
- `views`
  Define display hierarchy and editorial order without owning prerequisite relationships.
- `scripts/build-curriculum.mjs`
  Validates IDs, paths, graph cycles, view ordering, and prerequisite order, then emits the
  browser catalog.
- `scripts/export-curriculum.py`
  Publishes the canonical databases and retains standalone unit exports as a temporary
  compatibility and rollback path.
- `database/builders/publish.py`
  Checks each canonical database with SQLite's integrity checker and copies it from
  `database/` to `public/bootcamp/data/`.
- `scripts/build-mlphd-islands.py`
  Executes all registered units in one Marimo application and emits three artifact classes:
  the complete static document, one shared runtime payload, and error-checked lazy interactive
  layers grouped by subject. SQL units open writable, file-backed copies of their published
  seed databases in Pyodide's virtual filesystem.
- `app/mlphd/_components/CurriculumReader.tsx`
  Maintains the reading cursor, resolves TOC and deep-link navigation against already-present
  static anchors, prefetches interaction payloads on intent, and keeps mounted layers alive.

## Static-first delivery contract

The static document is the navigation and reading plane. It must contain all unit section IDs,
headings, prose, code examples, and other meaningful non-interactive output in source order.
This makes initial rendering, browser find, accessibility traversal, TOC clicks, and deep links
independent of the notebook runtime.

Static output must also be independent of Marimo presentation internals. The builder replaces
Marimo prose wrappers with MLPHD-owned semantic classes and renders `marimo-tex` to ordinary
KaTeX HTML at build time. Runtime-only custom elements, Marimo typography classes, and the
Marimo stylesheet must not be required to read or correctly lay out static exposition.

The lazy interactive layer is an enhancement plane. A cell belongs there when it contains a
Marimo UI element, an assertion/submission interaction, or an explicit `# MLPHD INTERACTIVE`
marker. It is intentionally broader than exercises: future controls, simulations,
visualizations, and other interaction types use the same layer. Subject boundaries are fetch,
cache, and mount boundaries only; they are not pages or separate Python runtimes.

The client follows this order:

1. Render the complete static document and anchors in the initial response.
2. On TOC activation, update the cursor and scroll immediately in the same event turn.
3. Prefetch a subject layer on pointer or keyboard intent and near-viewport observation.
4. Warm the single shared Marimo/Pyodide runtime during idle time or when interaction is near.
5. Mount the requested layer into reserved slots and retain it for the session.

Reactive cells that define widgets but have no visible output remain mounted in hidden slots so
the Marimo dependency graph works without adding whitespace or cell chrome. During a TOC or
deep-link jump, the reader temporarily preserves the selected anchor while nearby interactions
hydrate; wheel, touch, pointer, or navigation-key input releases that anchor immediately. Do not
preserve layout by locking units to their largest observed height.

Marimo Islands 0.23.x also treats the first descendant `marimo-code-editor` as an island source
editor. Because an exercise output can contain a learner editor, the islands builder emits a
hidden, uniquely identified source editor before that output in both the lazy block and shared
payload. Keep this export guard and its regression assertion until the upstream descendant
selector is narrowed; without it, duplicate learner-editor object IDs silently disconnect UI
events such as Submit answer.

The navigation performance contract is under 100 ms from TOC activation to the next painted
static target on a warm application page. Interactive readiness is measured separately; a
warm layer should become usable within one second when practical, while a cold Pyodide download
is network- and device-dependent and must never delay document navigation.

## Publishing workflow

1. Create or edit an `all_in_one_*.py` source in its tutorial-family directory.
2. Mark independent units in source order and run `npm run curriculum:units`.
3. Register concepts and selected generated units in `curriculum/mlphd.yaml`.
4. Place units in curated views, normally preserving their implicit source order.
5. Edit the appropriate Python module under `database/builders/` when a SQL unit's schema or
   seed data changes.
6. Run `npm run curriculum:export`. This validates and publishes the SQLite seeds, builds
   the catalog, and generates the static document, shared runtime, lazy interactive layers,
   and compatibility exports.

## SQLite database lifecycle

The database lifecycle deliberately separates authoring, publication, and learner state:

1. Authors define schemas and seed rows in `database/builders/build_<name>.py`.
2. `python -m database.builders.build_all` creates a temporary database, verifies it, and
   atomically replaces `database/<name>.sqlite`.
3. The database publishing step verifies `PRAGMA integrity_check` again and copies the file to
   `public/bootcamp/data/<name>.sqlite`.
4. A browser lesson fetches `/bootcamp/data/<name>.sqlite` and writes it to
   `/tmp/mlphd-bootcamp/<name>.sqlite` inside the Pyodide worker.
5. Python's standard `sqlite3` module opens that runtime file. Learner writes never modify
   the canonical or published seed.
6. The runtime file lasts for that worker only. Reload persistence can later be added with
   IndexedDB or OPFS without changing the canonical-to-public build boundary.

## Personalized paths later

The initial page displays the curated `default` view. A future path builder can select target
concepts from role, goal, topic, difficulty, and existing-skill constraints; compute their
prerequisite closure; select eligible units; topologically sort them; and create a temporary
display view. It will reorder existing static units rather than rebuild notebook code.
