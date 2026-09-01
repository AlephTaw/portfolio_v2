# MLPHD SQLite database builders

This directory receives the local SQLite databases used by MLPHD lessons.
Database files are reproducible and ignored by Git. Their schemas and seed rows
are defined in `database/builders/`, which is the editable source of truth.
Rebuild the local files with:

```bash
npm run bootcamp:databases:build
```

Each lesson has a focused builder module:

- `builders/build_select.py` creates `select.sqlite`.
- `builders/build_aggregation.py` creates `aggregation.sqlite`.
- `builders/build_all.py` runs every builder.

Edit the relevant builder when changing a schema or seed dataset, then rebuild
the canonical files. The builders create temporary databases, run SQLite's
integrity checker, and atomically replace the corresponding canonical files.

Do not edit `public/bootcamp/data/*.sqlite` directly. Publish validated static
copies with the following command. The public copies are ignored by Git because
they are reproducible build artifacts.

```bash
npm run bootcamp:databases
```

That command rebuilds the canonical databases and then publishes them.
`npm run curriculum:export`, local development startup, and the production
`prebuild` run the same rebuild-and-publish sequence automatically. Browser
lessons copy the published seed into Pyodide's writable
`/tmp/mlphd-bootcamp/` filesystem before opening it, so learner SQL cannot
mutate these canonical files.

See the [project workflow guide](../docs/workflows.md) for the complete procedure
for adding a builder, registering its output, testing it, integrating it into a
notebook, and publishing it with the site.
