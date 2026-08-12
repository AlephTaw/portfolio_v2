# MLPHD Curriculum Architecture

The MLPHD page is a curriculum reader assembled from small browser-executable Marimo
notebooks. Each notebook is one independently addressable learning unit.

## Why this shape

- Authors keep prose, LaTeX, Python, SQL, demonstrations, and exercises together in Marimo.
- Units can be reused in multiple learning paths without copying cells or prose.
- The concept dependency graph and the visible curriculum hierarchy remain independent.
- Only the selected unit is mounted, keeping browser memory and startup work bounded.

## Component choices

- `notebooks/`
  Contains one Marimo notebook per curriculum unit.
- `src/mlphd_bootcamp/`
  Provides pure-Python, WASM-compatible exercise and presentation helpers shared by units.
- `curriculum/mlphd.yaml`
  Is the human-edited catalog containing concepts, units, and curated views.
- `concepts`
  Form a directed acyclic graph through their `requires` edges.
- `units`
  Map notebook files to the concepts they teach or assess and use only `easy`, `medium`,
  or `hard` difficulty values.
- `views`
  Define display hierarchy and editorial order without owning prerequisite relationships.
- `scripts/build-curriculum.mjs`
  Validates IDs, paths, graph cycles, view ordering, and prerequisite order, then emits the
  browser catalog.
- `app/components/CurriculumReader.tsx`
  Renders the curated sidebar and loads only the active unit export.

## Publishing workflow

1. Create or edit a unit under `notebooks/` with Marimo.
2. Register its concepts and unit metadata in `curriculum/mlphd.yaml`.
3. Place the unit in one or more curated views with an explicit sibling order.
4. Build the catalog to validate the graph and produce `catalog.json`.
5. Export the registered notebooks to WebAssembly applications under `public/bootcamp/`.

## Personalized paths later

The initial page displays the curated `default` view. A future path builder can select target
concepts from role, goal, topic, difficulty, and existing-skill constraints; compute their
prerequisite closure; select eligible units; topologically sort them; and create a temporary
display view. It will reorder existing static units rather than rebuild notebook code.
