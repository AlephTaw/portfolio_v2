import asyncio

from httpx import ASGITransport, AsyncClient

from app.db.connection import initialize_database
from app.main import create_app


def test_collection_item_crud(tmp_path) -> None:
    database_url = f"sqlite:///{tmp_path / 'game.sqlite3'}"
    initialize_database(database_url)
    app = create_app(database_url=database_url)

    async def exercise_crud():
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            created = await client.post(
                "/items",
                json={
                    "collection": "inventory",
                    "name": "Field notebook",
                    "summary": "A durable notebook",
                    "description": "Used for observations and field notes.",
                    "thumbnail_url": "/items/notebook-thumb.webp",
                    "image_url": "/items/notebook.webp",
                    "details": {"category": "office", "quantity": 1},
                },
            )
            item_id = created.json()["id"]
            listed = await client.get("/items", params={"collection": "inventory"})
            fetched = await client.get(f"/items/{item_id}")
            updated = await client.patch(
                f"/items/{item_id}",
                json={"name": "Field journal", "details": {"category": "office", "quantity": 2}},
            )
            deleted = await client.delete(f"/items/{item_id}")
            missing = await client.get(f"/items/{item_id}")
            return created, listed, fetched, updated, deleted, missing

    created, listed, fetched, updated, deleted, missing = asyncio.run(exercise_crud())

    assert created.status_code == 201
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [created.json()["id"]]
    assert fetched.json()["name"] == "Field notebook"
    assert updated.status_code == 200
    assert updated.json()["name"] == "Field journal"
    assert updated.json()["details"]["quantity"] == 2
    assert deleted.status_code == 204
    assert missing.status_code == 404


def test_rejects_unknown_collection(tmp_path) -> None:
    database_url = f"sqlite:///{tmp_path / 'game.sqlite3'}"
    initialize_database(database_url)
    app = create_app(database_url=database_url)

    async def create_invalid_item():
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            return await client.post(
                "/items",
                json={"collection": "unknown", "name": "Invalid"},
            )

    response = asyncio.run(create_invalid_item())
    assert response.status_code == 422
