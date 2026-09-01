import asyncio

from httpx import ASGITransport, AsyncClient

from app.db.connection import connect, initialize_database, resolve_database_target
from app.main import create_app


def test_health() -> None:
    async def request_health():
        async with AsyncClient(
            transport=ASGITransport(app=create_app()),
            base_url="http://test",
        ) as client:
            return await client.get("/health")

    response = asyncio.run(request_health())

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_initialize_database(tmp_path) -> None:
    database_path = tmp_path / "game.sqlite3"
    database_url = f"sqlite:///{database_path}"

    initialize_database(database_url)

    assert database_path.is_file()
    assert resolve_database_target(database_url) == str(database_path)
    with connect(database_url) as connection:
        foreign_keys_enabled = connection.execute("PRAGMA foreign_keys").fetchone()[0]
        metadata_table = connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'"
        ).fetchone()
    assert foreign_keys_enabled == 1
    assert metadata_table[0] == "schema_migrations"
