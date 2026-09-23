from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.dependencies import get_database_url
from app.models.arc import ArcRow, ArcRowCreate, ArcRowUpdate
from app.repositories import arc as arc_repository

router = APIRouter(prefix="/arc/rows", tags=["arc"])
DatabaseUrl = Annotated[str | None, Depends(get_database_url)]


@router.get("")
def list_arc_rows(database_url: DatabaseUrl) -> list[ArcRow]:
    return arc_repository.list_rows(database_url)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_arc_row(payload: ArcRowCreate, database_url: DatabaseUrl) -> ArcRow:
    return arc_repository.create_row(database_url, payload)


@router.patch("/{row_id}")
def update_arc_row(
    row_id: str,
    payload: ArcRowUpdate,
    database_url: DatabaseUrl,
) -> ArcRow:
    row = arc_repository.update_row(database_url, row_id, payload)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arc row not found")
    return row


@router.delete("/{row_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_arc_row(row_id: str, database_url: DatabaseUrl) -> Response:
    if not arc_repository.delete_row(database_url, row_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arc row not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
