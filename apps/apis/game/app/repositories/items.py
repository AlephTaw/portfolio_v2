import json
from typing import Any
from uuid import uuid4

from app.db.connection import connect
from app.models.items import CollectionItem, CollectionItemCreate, CollectionItemUpdate


def _to_item(row: Any) -> CollectionItem:
    values = dict(row)
    values["details"] = json.loads(values.pop("details_json"))
    return CollectionItem.model_validate(values)


def list_items(
    database_url: str | None,
    *,
    collection: str | None = None,
) -> list[CollectionItem]:
    query = "SELECT * FROM collection_items"
    parameters: tuple[str, ...] = ()
    if collection is not None:
        query += " WHERE collection = ?"
        parameters = (collection,)
    query += " ORDER BY updated_at DESC, name COLLATE NOCASE"

    with connect(database_url) as connection:
        rows = connection.execute(query, parameters).fetchall()
    return [_to_item(row) for row in rows]


def get_item(database_url: str | None, item_id: str) -> CollectionItem | None:
    with connect(database_url) as connection:
        row = connection.execute(
            "SELECT * FROM collection_items WHERE id = ?",
            (item_id,),
        ).fetchone()
    return _to_item(row) if row is not None else None


def create_item(
    database_url: str | None,
    payload: CollectionItemCreate,
) -> CollectionItem:
    item_id = str(uuid4())
    with connect(database_url) as connection:
        connection.execute(
            """
            INSERT INTO collection_items (
                id, collection, name, summary, description,
                thumbnail_url, image_url, details_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item_id,
                payload.collection,
                payload.name,
                payload.summary,
                payload.description,
                payload.thumbnail_url,
                payload.image_url,
                json.dumps(payload.details, separators=(",", ":"), sort_keys=True),
            ),
        )
    item = get_item(database_url, item_id)
    if item is None:  # pragma: no cover - defensive invariant
        raise RuntimeError("Created item could not be read back")
    return item


def update_item(
    database_url: str | None,
    item_id: str,
    payload: CollectionItemUpdate,
) -> CollectionItem | None:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return get_item(database_url, item_id)

    assignments: list[str] = []
    values: list[Any] = []
    for field, value in changes.items():
        column = "details_json" if field == "details" else field
        assignments.append(f"{column} = ?")
        values.append(
            json.dumps(value, separators=(",", ":"), sort_keys=True)
            if field == "details"
            else value
        )
    assignments.append("updated_at = CURRENT_TIMESTAMP")
    values.append(item_id)

    with connect(database_url) as connection:
        cursor = connection.execute(
            f"UPDATE collection_items SET {', '.join(assignments)} WHERE id = ?",
            values,
        )
        if cursor.rowcount == 0:
            return None
    return get_item(database_url, item_id)


def delete_item(database_url: str | None, item_id: str) -> bool:
    with connect(database_url) as connection:
        cursor = connection.execute(
            "DELETE FROM collection_items WHERE id = ?",
            (item_id,),
        )
    return cursor.rowcount > 0
