# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "fastapi[standard]>=0.115,<1.0",
#   "httpx>=0.28,<1.0",
#   "marimo>=0.23.16",
# ]
# ///

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Tutorial: Boilerplate Python Backend

    This notebook explains the minimal FastAPI and SQLite backend in `apps/apis/game`. It focuses on infrastructure only; it does not invent game endpoints or domain tables.

    **Audience**
    - Python developers who want a small local API service they can extend deliberately.

    **Prerequisites**
    - Python 3.10 or newer and `uv`.
    - Run `uv sync --dev` from `apps/apis/game` before executing the notebook.

    **Learning goals**
    - Understand the service directory and dependency configuration.
    - Create a FastAPI application with an application factory.
    - Configure and initialize a local SQLite database safely.
    - Exercise the API in memory without starting a network server.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Outline

    1. Locate the service and inspect its structure.
    2. Review dependencies and development commands.
    3. Understand the FastAPI application factory and router.
    4. Initialize and query a disposable SQLite database.
    5. Call the health endpoint without opening a port.
    6. Practice with a small database exercise.
    """)
    return


@app.cell
def _():
    import sys
    import tomllib
    from pathlib import Path
    from tempfile import TemporaryDirectory


    def find_repo_root(start: Path) -> Path:
        for candidate in (start, *start.parents):
            if (candidate / ".git").exists():
                return candidate
        raise FileNotFoundError("Run this notebook from inside the swdev repository.")


    REPO_ROOT = find_repo_root(Path.cwd().resolve())
    GAME_API_ROOT = REPO_ROOT / "apps" / "apis" / "game"
    sys.path.insert(0, str(GAME_API_ROOT))

    print(f"Repository: {REPO_ROOT}")
    print(f"Game API:   {GAME_API_ROOT}")
    return GAME_API_ROOT, Path, TemporaryDirectory, tomllib


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 1. Service structure

    The API is independently runnable and owns its runtime data. Generated SQLite files live under `data/` and are ignored by Git. Source code, tests, dependency metadata, and the lockfile remain versioned.
    """)
    return


@app.cell
def _(GAME_API_ROOT):
    required_files = ['pyproject.toml', 'uv.lock', 'app/main.py', 'app/routers/health.py', 'app/db/connection.py', 'data/.gitignore', 'tests/test_health.py']
    for relative_path in required_files:
        _path = GAME_API_ROOT / relative_path
        print(f"{('OK' if _path.exists() else 'MISSING'):7} {relative_path}")
    assert all(((GAME_API_ROOT / _path).exists() for _path in required_files))
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 2. Dependencies and commands

    `pyproject.toml` declares FastAPI as the runtime dependency and keeps HTTP testing, Pytest, and Ruff in the development group. The lockfile makes installations reproducible.

    From `apps/apis/game`:

    ```bash
    uv sync --dev
    uv run fastapi dev app/main.py
    uv run ruff check .
    uv run pytest
    ```
    """)
    return


@app.cell
def _(GAME_API_ROOT, tomllib):
    with (GAME_API_ROOT / "pyproject.toml").open("rb") as file:
        project_config = tomllib.load(file)

    print("Project:", project_config["project"]["name"])
    print("Python: ", project_config["project"]["requires-python"])
    print("Runtime dependencies:")
    for dependency in project_config["project"]["dependencies"]:
        print(" -", dependency)
    print("Development dependencies:")
    for dependency in project_config["dependency-groups"]["dev"]:
        print(" -", dependency)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 3. FastAPI application factory

    `create_app()` constructs the application, attaches startup behavior, and includes routers. Keeping construction inside a function makes tests and future configuration easier. `app` remains available at module level for ASGI servers.

    The initial `/health` router is intentionally infrastructure-only. Domain routers should be added only after their contracts are defined.
    """)
    return


@app.cell
def _(GAME_API_ROOT):
    from app.main import create_app
    _ = GAME_API_ROOT
    api = create_app(database_url='sqlite:///:memory:')
    routes = sorted((_path for route in api.routes if (_path := getattr(route, 'path', None)) and (not _path.startswith('/docs'))))
    routes
    return (api,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 4. SQLite connection and initialization

    The connection helper resolves `GAME_DATABASE_URL`, creates parent directories, enables foreign keys, commits successful work, rolls back failures, and always closes the connection.

    The default URL is `sqlite:///./data/game.sqlite3`. This walkthrough uses a temporary database so running the notebook never changes the real local service data. Initialization creates only `schema_migrations`; game-domain tables remain undefined.
    """)
    return


@app.cell
def _(GAME_API_ROOT, Path, TemporaryDirectory):
    from app.db.connection import connect, initialize_database
    _ = GAME_API_ROOT

    scratch_directory = TemporaryDirectory(prefix="game-api-notebook-")
    scratch_database = Path(scratch_directory.name) / "game.sqlite3"
    scratch_database_url = f"sqlite:///{scratch_database}"

    initialize_database(scratch_database_url)
    print(f"Created: {scratch_database}")
    print(f"Size:    {scratch_database.stat().st_size:,} bytes")
    return connect, scratch_database_url, scratch_directory


@app.cell
def _(connect, scratch_database_url):
    with connect(scratch_database_url) as _connection:
        foreign_keys = _connection.execute('PRAGMA foreign_keys').fetchone()[0]
        tables = [row[0] for row in _connection.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").fetchall()]
    print('Foreign keys enabled:', bool(foreign_keys))
    print('Tables:', tables)
    assert tables == ['schema_migrations']
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 5. Exercise the API without a server

    HTTPX can send a request directly to the ASGI application. This is fast, deterministic, and does not occupy a local port.
    """)
    return


@app.cell
async def _(api):
    from httpx import ASGITransport, AsyncClient

    async with AsyncClient(
        transport=ASGITransport(app=api),
        base_url="http://test",
    ) as client:
        health_response = await client.get("/health")

    print(health_response.status_code, health_response.json())
    assert health_response.status_code == 200
    assert health_response.json() == {"status": "ok"}
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Exercise: inspect infrastructure safely

    Write a reusable `table_exists` helper. It should use a parameterized query rather than interpolating a table name into SQL. Predict the result for `schema_migrations` and a table that has not been created.
    """)
    return


@app.cell
def _(connect, scratch_database_url):
    def table_exists(connection, table_name: str) -> bool:
        row = connection.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", (table_name,)).fetchone()
        return row is not None
    with connect(scratch_database_url) as _connection:
        results = {'schema_migrations': table_exists(_connection, 'schema_migrations'), 'game_entities': table_exists(_connection, 'game_entities')}
    results
    return (results,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Pitfalls and extensions

    - **Working-directory assumptions:** resolve the default database path from the service root, not whichever directory launched the process.
    - **Committed runtime data:** keep `data/*.sqlite*`, journal files, and WAL files ignored.
    - **Disabled foreign keys:** SQLite requires `PRAGMA foreign_keys = ON` for each connection.
    - **Shared global connections:** open a connection for a bounded unit of work and close it afterward.
    - **Premature domain design:** define resources, tables, and migrations only after agreeing on their contracts.

    A sensible next extension is a small migration runner that records applied versions in `schema_migrations`. Add an ORM only if model complexity makes it valuable.
    """)
    return


@app.cell
def _(results, scratch_directory):
    _ = results
    scratch_directory.cleanup()
    print("Temporary tutorial database removed.")
    return


if __name__ == "__main__":
    app.run()
