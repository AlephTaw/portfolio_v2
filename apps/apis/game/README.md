# Game API

FastAPI service for the game domain. It owns the SQLite-backed inventory,
achievement, and store records consumed by the agent app.

## Development

From this directory:

```sh
uv sync --dev
uv run fastapi dev app/main.py
```

FastAPI serves interactive documentation at `/docs` and the OpenAPI schema at
`/openapi.json`.

The collection API is available at:

```text
GET    /items?collection=inventory|achievements|store
GET    /items/{id}
POST   /items
PATCH  /items/{id}
DELETE /items/{id}
GET    /arc/rows
POST   /arc/rows
PATCH  /arc/rows/{id}
DELETE /arc/rows/{id}
POST   /uploads
GET    /uploads/{file_name}
DELETE /uploads/{file_name}
```

Records store image URLs or agent-public paths in `thumbnail_url` and
`image_url`. Image bytes do not belong in SQLite.

Local image uploads are limited to 10 MB and Arc videos are limited to 100 MB.
Both are signature-validated and stored in the ignored `data/uploads/`
directory. A hosted deployment should replace this local filesystem storage
with durable object storage.

The service creates its local SQLite database at `data/game.sqlite3` during
application startup. Override the location when needed:

```sh
GAME_DATABASE_URL=sqlite:///./data/game.sqlite3 uv run fastapi dev app/main.py
```

Generated database, journal, and WAL files inside `data/` are ignored by Git.
The directory itself remains versioned.

For local agent integration, run the API from the repository root with
`npm run dev:game-api`. The agent proxies browser requests to this service using
`GAME_API_URL`, which defaults to `http://127.0.0.1:8000`.

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
  models/           Request and response contracts
  repositories/     Parameterized SQLite access
  routers/          HTTP route modules
data/               Ignored local SQLite runtime files
tests/              API tests
```
