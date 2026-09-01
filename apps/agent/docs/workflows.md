# Project workflows

This guide is the operational source of truth for developing, testing, publishing, and
deploying the site and its MLPHD tutorials. Architecture and implementation rationale live
in `docs/mlphd-document-layout.md`; this document describes the repeatable day-to-day steps.

## Source files and generated files

Keep editable source and generated output separate. Never make a lasting change only in a
generated file.

| Concern | Editable source | Generated output |
|---|---|---|
| Site UI | `app/`, `content/`, `public/assets/` | `.vinext/`, `dist/` |
| Curriculum graph | `curriculum/mlphd.yaml` | `app/generated/curriculum-catalog.json`, `public/bootcamp/catalog.json` |
| Tutorial notebooks | `notebooks/` | `public/bootcamp/*.html`, `public/bootcamp/islands/*.json`, `app/generated/mlphd-static-document.json`, `app/generated/mlphd-islands-manifest.json` |
| Shared tutorial Python | `src/mlphd_bootcamp/` | `dist/*.whl`, `public/bootcamp/public/wheels/*.whl` |
| SQLite schema and seed data | `database/builders/*.py` | `database/*.sqlite`, `public/bootcamp/data/*.sqlite` |

Generated SQLite files in `public/bootcamp/data/` are ignored by Git and recreated before
local development and production builds. Canonical development copies in `database/` are
useful for inspection and local tools, but their Python builders remain the source of truth.

## Initial setup

The project requires Node.js 22.13 or newer, Python managed through `uv`, a Cloudflare
account for deployment, and a Resend account for contact-form delivery.

```bash
npm install
uv sync
```

Confirm the active runtimes before diagnosing build failures:

```bash
node --version
uv python find
```

An older Node runtime can fail when Vinext imports newer Node APIs such as
`node:fs/promises.glob`.

Useful top-level commands are:

```bash
npm run dev                         # local development server
npm run build                       # production build
npm run start                       # local production preview
npm test                            # production build and SSR regressions
npm run bootcamp:databases:build    # recreate canonical SQLite files
npm run bootcamp:databases:publish  # validate and publish SQLite files
npm run bootcamp:databases          # rebuild and publish SQLite files
```

## Local site development

Start the application with:

```bash
npm run dev
```

The `predev` hook rebuilds every registered tutorial database, publishes the validated
database assets, regenerates extracted curriculum units, and builds the static and lazy
interactive preview artifacts before the development server starts.

While the server is running, Vite watches editable Python notebooks under `notebooks/`.
Saving a notebook automatically runs the lightweight `curriculum:preview` pipeline:

```text
split all-in-one sources -> rebuild catalog -> rebuild static document and islands
```

Changes are debounced and rebuilds are serialized. The splitter writes only changed unit
artifacts, and generated files inside `units/` are excluded from the watcher, so splitting
an all-in-one notebook cannot trigger a rebuild loop or unnecessary HMR bursts.
After a successful build, Vite reloads `/mlphd`; if generation fails, the error remains in
the terminal and the dev server continues serving the last successful preview.

Run the same incremental preview build manually with:

```bash
npm run curriculum:preview
```

Ordinary React, CSS, and content files continue to use the normal Vite development loop.

### Direct Marimo notebook watching

Marimo's native `--watch` mode is preferable when previewing one notebook directly rather
than viewing the combined MLPHD document:

```bash
# External-editor changes are synchronized into the editable Marimo UI.
uv run marimo edit notebooks/path/to/notebook.py --watch

# External-editor changes refresh the read-only app from a clean state.
uv run marimo run notebooks/path/to/notebook.py --watch
```

The repository sets `watcher_on_save = "autorun"` under `[tool.marimo.runtime]`, so a watched
edit session runs affected cells automatically instead of only marking them stale. Marimo
also supports `marimo export html-wasm ... --watch` for a single WASM export, but that command
does not perform this project's unit splitting or rebuild the combined static document and
lazy islands. Use the Vite-integrated watcher for `/mlphd` and native Marimo watching for an
individual notebook. See Marimo's
[Using your own editor](https://docs.marimo.io/guides/editor_features/watching/) guide.

After changing a database builder while the server is already running, rerun:

```bash
npm run bootcamp:databases
```

Reload the lesson so Marimo creates a new browser-local runtime copy from the new seed.

## Creating or updating an MLPHD tutorial

The complete family layout, marker contract, implicit source ordering, extraction,
registration, and legacy migration process is documented in
[Notebook-to-MLPHD integration](notebook-to-mlphd-workflow.md). Use it as the
authoritative conversion checklist.

For a problem set whose source material is a directory of screenshots, use
[Screenshot problem set to notebook prompt](screenshot-problem-set-to-notebook-prompt.md)
for the reconciliation, canonical-data, inline-context, grading, and validation workflow.

1. Create a tutorial-family directory with an `all_in_one_*.py` source under `notebooks/`.
2. Use the notebook script header to declare Python and wheel dependencies.
3. Edit interactively with `uv run marimo edit <notebook-path>`.
4. Put an `MLPHD UNIT START` metadata block inside the first cell of every independently
   executable unit; the next marked cell starts the next unit, and source order becomes
   generated unit order. In-cell comments survive Marimo browser-editor saves.
5. Run `npm run curriculum:units` and inspect `units/units.json`.
6. Register selected generated units and concepts in `curriculum/mlphd.yaml`.
7. Add units to the intended view in manifest order unless editorial order intentionally
   differs.
8. Add or update any generated lesson assets through their source generators, never by
   editing the generated artifact alone.
9. Run `npm run curriculum:export`.
10. Run `npm run curriculum:test` and inspect the lesson through `npm run dev`.

Use `teaches` for concepts introduced by a unit, `assesses` for concepts checked by it, and
`requires` for prerequisite concepts. Concept checks that share an exposition's scope stay
inside that exposition notebook rather than becoming separate units.

## Tutorial assets

Every generated tutorial asset must have checked-in source code capable of recreating it.
The update order is always:

1. Edit the generator or source data.
2. Regenerate the development artifact.
3. Validate the artifact.
4. Copy or export it to its public build location.
5. Regenerate notebook, static-document, runtime, and lazy-interactive-layer output that
   references it.
6. Commit source code and any canonical artifacts required by the workflow; do not commit
   ignored public build copies.

For a new asset type, place the generator close to its canonical source, provide one command
that rebuilds it, integrate that command into development and production prebuilds, and add
an automated integrity or content test.

## SQLite tutorial assets

SQLite lessons use a four-stage lifecycle:

```text
database/builders/build_<lesson>.py
    -> database/<lesson>.sqlite
    -> public/bootcamp/data/<lesson>.sqlite
    -> /tmp/mlphd-bootcamp/<lesson>.sqlite in Pyodide
```

The first stage is authoritative. The canonical database is a reproducible development
artifact. The public database is a validated static copy. The Pyodide file is a private,
writable learner copy that lasts only for the current browser worker.

### Adding a database

1. Add `database/builders/build_<lesson>.py` with a public build function accepting an
   optional target `Path`.
2. Define schemas, indexes, triggers, and deterministic seed rows in that module. Seed any
   pseudo-random generator explicitly.
3. Build through `database/builders/common.py` so creation uses a temporary database,
   `PRAGMA integrity_check`, and atomic replacement.
4. Register the output filename and function in `DATABASE_BUILDERS` inside
   `database/builders/__init__.py`. Unregistered databases are not published.
5. Add a test that builds into `tmp_path` and verifies important schema and data invariants.
6. In the notebook, call `open_seed_database()` with both locations:

   ```python
   lesson_database = open_seed_database(
       "lesson.sqlite",
       seed_url="/bootcamp/data/lesson.sqlite",
       local_seed="database/lesson.sqlite",
   )
   ```

7. Run the complete rebuild and publication command:

   ```bash
   npm run bootcamp:databases
   ```

### Database commands

```bash
# Recreate canonical database files from Python builders
npm run bootcamp:databases:build

# Validate canonical files and synchronize registered public copies
npm run bootcamp:databases:publish

# Perform both operations in order
npm run bootcamp:databases
```

Do not edit `public/bootcamp/data/*.sqlite`. Direct edits to `database/*.sqlite` are also
temporary because the next rebuild replaces them. Make durable schema and data changes in
`database/builders/*.py`.

## Curriculum generation

Run the full curriculum pipeline with:

```bash
npm run curriculum:export
```

The pipeline validates the curriculum graph, rebuilds and publishes registered SQLite
databases, builds the `mlphd-bootcamp` wheel, exports standalone Marimo WebAssembly pages,
and rebuilds the static-first curriculum document, shared Marimo runtime payload, and lazy
interactive layers used by `/mlphd`.

Files under `app/generated/` and generated files under `public/bootcamp/` should not be
edited manually. If output is wrong, fix its notebook, builder, catalog, or export script and
run the pipeline again.

## Validation and testing

Use focused checks while iterating:

```bash
npm run curriculum:test
npm run lint
```

Before handing off a site change, run the production regression suite:

```bash
npm test
```

`npm test` runs the production build and rendered HTML tests. Database builder tests create
temporary files and verify that source databases remain unchanged by learner mutations.
Warnings about unresolved KaTeX font URLs may appear during the build; distinguish warnings
from a nonzero build exit or a failing test.

For an MLPHD rendering change, automated DOM checks are not sufficient. Open a representative
prose-and-math unit and a fully hydrated interaction in the production preview. Verify font
scale, line height, symbols such as `∪` and `∩`, unit spacing, absence of Marimo cell chrome,
anchor position after hydration, grading feedback, and console/visible errors.

## Git workflow

Start by inspecting the existing worktree and preserve unrelated user changes:

```bash
git status --short
git branch --show-current
```

For a focused change:

1. Create or switch to an appropriately named branch. Codex-created branches use the
   `codex/` prefix unless another convention is requested.
2. Update editable sources first.
3. Regenerate required artifacts through project commands.
4. Review `git diff` and `git diff --check`.
5. Run tests proportional to the change, using `npm test` before merging broad site changes.
6. Stage only files belonging to the change.
7. Commit with a concise message describing the user-visible or architectural outcome.
8. Push the branch and open a pull request when review is required.

Never commit secrets, `.env*`, local caches, Pyodide runtime files, or ignored public SQLite
copies. Do commit database builders, tests, documentation, and canonical database artifacts
when the repository uses those artifacts for developer inspection.

## Production build and local preview

Create a production build with:

```bash
npm run build
```

The `prebuild` hook validates the curriculum and rebuilds/publishes registered databases
before Vinext packages the site. Preview the completed build with:

```bash
npm run start
```

## Contact form configuration

The contact workflow posts to `app/api/contact/route.ts` and sends mail through Resend. For
local development, copy the checked-in `.env.example` conventions into `.env.local` and set:

- `RESEND_API_KEY`
- `CONTACT_DESTINATION_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_PUBLIC_EMAIL` when a public address should appear on the contact page

Use a private inbox for the destination, a verified-domain address such as
`contact@swilcox.dev` for the sender, and expose only an address suitable for public display.
The form uses the visitor's address as `Reply-To`. The server accepts `CONTACT_TO_EMAIL` for
backward compatibility, but `CONTACT_DESTINATION_EMAIL` is preferred because its private
delivery purpose is explicit.

Never commit `.env.local` or secret values. Production values belong in Wrangler secrets.

## Cloudflare deployment

The production runtime is Cloudflare Workers. Relevant configuration lives in
`wrangler.jsonc`, `worker/index.ts`, and `vite.config.ts`. The repository intentionally has
no Netlify deployment configuration. `.openai/hosting.json` is Codex/Sites metadata, not the
production deployment target.

Authenticate and confirm the configured account before the first deployment:

```bash
npx wrangler login
npx wrangler whoami
```

Copy the reported Cloudflare `account_id` into `wrangler.jsonc`, then configure production
contact secrets:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_DESTINATION_EMAIL
npx wrangler secret put CONTACT_FROM_EMAIL
npx wrangler secret put CONTACT_PUBLIC_EMAIL
```

Set required contact-form secrets with `wrangler secret put`; do not place production secrets
in tracked files. Deploy with:

```bash
npm run cf:deploy
```

That command runs the production build first, including database generation and publication,
then deploys the Worker. After deployment, verify the main site, `/mlphd`, one interactive SQL
lesson, contact routing, and any changed deep links. Tail production logs when needed:

```bash
npm run cf:tail
```

Production database hosting is not part of this workflow; tutorial SQLite databases remain
static seeds with browser-local writable copies.

## Domain and DNS configuration

The recommended production hostnames are `swilcox.dev` as the primary site and
`www.swilcox.dev` as a redirect alias.

When Cloudflare manages authoritative DNS:

1. Add `swilcox.dev` as a Cloudflare zone.
2. Update the registrar to use the assigned Cloudflare nameservers.
3. Deploy the Worker.
4. In Workers & Pages, open `steven-wilcox-cv`, select **Settings**, then **Domains &
   Routes**, and add `swilcox.dev` as a custom domain.
5. Enable **Always Use HTTPS** in the zone's SSL/TLS settings.

The Worker custom-domain flow creates the apex DNS record and TLS certificate, so it does
not require a manually created apex `A` or `CNAME` record.

Because Worker custom domains match exact hostnames, configure `www` separately. Create a
proxied placeholder record:

- Type: `AAAA`
- Name: `www`
- Value: `100::`
- Proxy: enabled

Then create a Cloudflare **Single Redirect** named `www to apex` with:

- Incoming request URL: `https://www.swilcox.dev/*`
- Target URL: `https://swilcox.dev/${1}`
- Status: `301`
- Preserve query string: enabled

This preserves paths and query strings when redirecting from `www`. If the hostname does not
resolve, confirm that the zone is active, the apex hostname appears under the Worker's custom
domains and routes, and nameserver changes have propagated.

The Worker can still be deployed if authoritative DNS remains elsewhere, but moving DNS to
Cloudflare lets the custom-domain flow manage records and certificates automatically.
