import asyncio

from httpx import ASGITransport, AsyncClient

from app.main import create_app


def test_upload_and_read_image(tmp_path) -> None:
    app = create_app(upload_dir=tmp_path / "uploads")
    image_content = b"\x89PNG\r\n\x1a\nmock-image-content"

    async def exercise_upload():
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            uploaded = await client.post(
                "/uploads",
                files={"image": ("sample.png", image_content, "image/png")},
            )
            fetched = await client.get(uploaded.json()["url"].replace("/api/game", ""))
            return uploaded, fetched

    uploaded, fetched = asyncio.run(exercise_upload())

    assert uploaded.status_code == 201
    assert uploaded.json()["original_name"] == "sample.png"
    assert uploaded.json()["url"].startswith("/api/game/uploads/")
    assert fetched.status_code == 200
    assert fetched.content == image_content


def test_rejects_non_image_upload(tmp_path) -> None:
    app = create_app(upload_dir=tmp_path / "uploads")

    async def upload_text():
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            return await client.post(
                "/uploads",
                files={"image": ("notes.txt", b"hello", "text/plain")},
            )

    response = asyncio.run(upload_text())
    assert response.status_code == 415


def test_upload_read_and_delete_video(tmp_path) -> None:
    app = create_app(upload_dir=tmp_path / "uploads")
    video_content = b"\x00\x00\x00\x18ftypmp42mock-video-content"

    async def exercise_video():
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            uploaded = await client.post(
                "/uploads",
                files={"image": ("arc.mp4", video_content, "video/mp4")},
            )
            asset_path = uploaded.json()["url"].replace("/api/game", "")
            fetched = await client.get(asset_path)
            deleted = await client.delete(asset_path)
            missing = await client.get(asset_path)
            return uploaded, fetched, deleted, missing

    uploaded, fetched, deleted, missing = asyncio.run(exercise_video())

    assert uploaded.status_code == 201
    assert fetched.content == video_content
    assert deleted.status_code == 204
    assert missing.status_code == 404
