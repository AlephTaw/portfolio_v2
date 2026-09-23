from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from app.db.connection import initialize_database
from app.routers.arc import router as arc_router
from app.routers.health import router as health_router
from app.routers.items import router as items_router
from app.routers.uploads import resolve_upload_directory
from app.routers.uploads import router as uploads_router


def create_app(
    *,
    database_url: str | None = None,
    upload_dir: str | Path | None = None,
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        initialize_database(database_url)
        yield

    app = FastAPI(
        title="Game API",
        description="HTTP API for game services.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.state.database_url = database_url
    app.state.upload_dir = resolve_upload_directory(upload_dir)
    app.include_router(health_router)
    app.include_router(arc_router)
    app.include_router(items_router)
    app.include_router(uploads_router)
    return app


app = create_app()
