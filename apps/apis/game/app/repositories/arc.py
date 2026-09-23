import json
from typing import Any
from uuid import uuid4

from app.db.connection import connect
from app.models.arc import ArcRow, ArcRowCreate, ArcRowUpdate


def _to_arc_row(row: Any) -> ArcRow:
    values = dict(row)
    values["panels"] = json.loads(values.pop("panels_json"))
    values["video"] = json.loads(values.pop("video_json")) if values["video_json"] else None
    values["thumbnails"] = json.loads(values.pop("thumbnails_json"))
    return ArcRow.model_validate(values)


def list_rows(database_url: str | None) -> list[ArcRow]:
    with connect(database_url) as connection:
        rows = connection.execute("SELECT * FROM arc_rows ORDER BY position").fetchall()
    return [_to_arc_row(row) for row in rows]


def get_row(database_url: str | None, row_id: str) -> ArcRow | None:
    with connect(database_url) as connection:
        row = connection.execute("SELECT * FROM arc_rows WHERE id = ?", (row_id,)).fetchone()
    return _to_arc_row(row) if row is not None else None


def create_row(database_url: str | None, payload: ArcRowCreate) -> ArcRow:
    row_id = str(uuid4())
    with connect(database_url) as connection:
        next_position = connection.execute(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM arc_rows"
        ).fetchone()[0]
        panel_count = (2, 3, 2)[next_position % 3]
        panels = [
            {"id": str(uuid4()), "thumbnail": None, "video": None}
            for _ in range(panel_count)
        ]
        connection.execute(
            "INSERT INTO arc_rows (id, title, position, panels_json) VALUES (?, ?, ?, ?)",
            (
                row_id,
                payload.title,
                next_position,
                json.dumps(panels, separators=(",", ":"), sort_keys=True),
            ),
        )
    row = get_row(database_url, row_id)
    if row is None:  # pragma: no cover - defensive invariant
        raise RuntimeError("Created Arc row could not be read back")
    return row


def update_row(
    database_url: str | None,
    row_id: str,
    payload: ArcRowUpdate,
) -> ArcRow | None:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return get_row(database_url, row_id)

    assignments: list[str] = []
    values: list[Any] = []
    for field, value in changes.items():
        column = f"{field}_json" if field in {"panels", "video", "thumbnails"} else field
        assignments.append(f"{column} = ?")
        values.append(
            json.dumps(value, separators=(",", ":"), sort_keys=True)
            if field in {"panels", "video", "thumbnails"} and value is not None
            else value
        )
    assignments.append("updated_at = CURRENT_TIMESTAMP")
    values.append(row_id)

    with connect(database_url) as connection:
        cursor = connection.execute(
            f"UPDATE arc_rows SET {', '.join(assignments)} WHERE id = ?",
            values,
        )
        if cursor.rowcount == 0:
            return None
    return get_row(database_url, row_id)


def delete_row(database_url: str | None, row_id: str) -> bool:
    with connect(database_url) as connection:
        cursor = connection.execute("DELETE FROM arc_rows WHERE id = ?", (row_id,))
    return cursor.rowcount > 0
