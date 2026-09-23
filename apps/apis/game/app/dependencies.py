from fastapi import Request


def get_database_url(request: Request) -> str | None:
    return request.app.state.database_url
