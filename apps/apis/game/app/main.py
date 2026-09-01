from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.connection import initialize_database
from app.routers.health import router as health_router


def create_app(*, database_url: str | None = None) -> FastAPI:
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
    app.include_router(health_router)
    return app


app = create_app()
