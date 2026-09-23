import asyncio

from httpx import ASGITransport, AsyncClient

from app.db.connection import initialize_database
from app.main import create_app


def test_arc_row_crud(tmp_path) -> None:
    database_url = f"sqlite:///{tmp_path / 'game.sqlite3'}"
    initialize_database(database_url)
    app = create_app(database_url=database_url)
    thumbnail = {
        "content_type": "image/png",
        "file_name": "thumb.png",
        "original_name": "thumb.png",
        "size": 42,
        "url": "/api/game/uploads/thumb.png",
    }
    video = {
        "content_type": "video/mp4",
        "file_name": "arc.mp4",
        "original_name": "arc.mp4",
        "size": 84,
        "url": "/api/game/uploads/arc.mp4",
    }

    async def exercise_crud():
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            first = await client.post("/arc/rows", json={"title": "Origin"})
            second = await client.post("/arc/rows", json={"title": "Arrival"})
            panels = first.json()["panels"]
            panels[0]["thumbnail"] = thumbnail
            panels[0]["video"] = video
            updated = await client.patch(
                f"/arc/rows/{first.json()['id']}",
                json={"title": "First signal", "panels": panels},
            )
            listed = await client.get("/arc/rows")
            deleted = await client.delete(f"/arc/rows/{second.json()['id']}")
            return first, second, updated, listed, deleted

    first, second, updated, listed, deleted = asyncio.run(exercise_crud())

    assert first.status_code == 201
    assert len(first.json()["panels"]) == 2
    assert second.json()["position"] == 1
    assert len(second.json()["panels"]) == 3
    assert updated.json()["title"] == "First signal"
    assert updated.json()["panels"][0]["thumbnail"] == thumbnail
    assert updated.json()["panels"][0]["video"] == video
    assert [row["id"] for row in listed.json()] == [first.json()["id"], second.json()["id"]]
    assert deleted.status_code == 204
