# Game API

Minimal FastAPI service template for the game domain. It intentionally includes
only service infrastructure and a health endpoint; game resources and database
contracts can be added once their boundaries are defined.

## Development

From this directory:

```sh
uv sync --dev
uv run fastapi dev app/main.py
```

FastAPI serves interactive documentation at `/docs` and the OpenAPI schema at
`/openapi.json`.

The service creates its local SQLite database at `data/game.sqlite3` during
application startup. Override the location when needed:

```sh
GAME_DATABASE_URL=sqlite:///./data/game.sqlite3 uv run fastapi dev app/main.py
```

Generated database, journal, and WAL files inside `data/` are ignored by Git.
The directory itself remains versioned.

## Checks

```sh
uv run ruff check .
uv run pytest
```

## Structure

```text
app/
  main.py           Application factory and ASGI application
  db/               SQLite connection and initialization helpers
  routers/          HTTP route modules
data/               Ignored local SQLite runtime files
tests/              API tests
```
