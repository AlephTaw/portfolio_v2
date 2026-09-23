from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.dependencies import get_database_url
from app.models.items import (
    CollectionItem,
    CollectionItemCreate,
    CollectionItemUpdate,
    CollectionName,
)
from app.repositories import items as item_repository

router = APIRouter(prefix="/items", tags=["items"])
DatabaseUrl = Annotated[str | None, Depends(get_database_url)]


@router.get("")
def list_collection_items(
    database_url: DatabaseUrl,
    collection: CollectionName | None = None,
) -> list[CollectionItem]:
    return item_repository.list_items(database_url, collection=collection)


@router.get("/{item_id}")
def get_collection_item(item_id: str, database_url: DatabaseUrl) -> CollectionItem:
    item = item_repository.get_item(database_url, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.post("", status_code=status.HTTP_201_CREATED)
def create_collection_item(
    payload: CollectionItemCreate,
    database_url: DatabaseUrl,
) -> CollectionItem:
    return item_repository.create_item(database_url, payload)


@router.patch("/{item_id}")
def update_collection_item(
    item_id: str,
    payload: CollectionItemUpdate,
    database_url: DatabaseUrl,
) -> CollectionItem:
    item = item_repository.update_item(database_url, item_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection_item(item_id: str, database_url: DatabaseUrl) -> Response:
    if not item_repository.delete_item(database_url, item_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
