import json
import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from uuid import uuid4

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = "sqlite:///./data/game.sqlite3"
SQLITE_URL_PREFIX = "sqlite:///"

COLLECTION_ITEMS_MIGRATION = "0001_collection_items"
DEFAULT_ACHIEVEMENTS_MIGRATION = "0002_default_achievements"
ARC_ROWS_MIGRATION = "0003_arc_rows"
ARC_PANELS_MIGRATION = "0004_arc_panels"
COLLECTION_ITEMS_SCHEMA = """
CREATE TABLE IF NOT EXISTS collection_items (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL CHECK (collection IN ('inventory', 'achievements', 'store')),
    name TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT,
    image_url TEXT,
    details_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_updated_at
ON collection_items(collection, updated_at DESC);
"""
ARC_ROWS_SCHEMA = """
CREATE TABLE IF NOT EXISTS arc_rows (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    video_json TEXT,
    thumbnails_json TEXT NOT NULL DEFAULT '[]',
    panels_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_arc_rows_position
ON arc_rows(position);
"""

DEFAULT_ACHIEVEMENTS = [
    (
        "achievement-sql",
        "SQL",
        "Authored tutorial mastery",
        "Complete the SQL curriculum and demonstrate accurate query construction.",
        ["SELECT and filtering", "Query exercises", "Grouping and aggregation"],
    ),
    (
        "achievement-python",
        "Python",
        "Authored tutorial mastery",
        "Complete the Python Language curriculum and demonstrate clear, typed, testable programs.",
        ["Control flow", "Functions", "Containers", "Iteration", "Classes", "Type hints"],
    ),
    (
        "achievement-machine-learning",
        "Machine Learning",
        "Authored tutorial mastery",
        "Frame, validate, tune, and evaluate a model for a realistic problem.",
        ["Problem framing", "Model evaluation", "Pipelines", "Production monitoring"],
    ),
    (
        "achievement-deployments",
        "Deployments",
        "Authored tutorial mastery",
        "Ship a reproducible, tested service that can be operated safely in production.",
        ["Containers", "Dockerfiles", "Compose", "Testing", "Production operations"],
    ),
    (
        "achievement-portfolio",
        "Portfolio",
        "Build mastery",
        "Publish work demonstrating technical depth, clear communication, and reproducibility.",
        ["Project framing", "Documentation", "Testing", "Deployment", "Presentation"],
    ),
]


def resolve_database_target(database_url: str | None = None) -> str:
    configured_url = database_url or os.getenv("GAME_DATABASE_URL", DEFAULT_DATABASE_URL)
    if not configured_url.startswith(SQLITE_URL_PREFIX):
        raise ValueError("GAME_DATABASE_URL must begin with sqlite:///")

    configured_path = configured_url.removeprefix(SQLITE_URL_PREFIX)
    if configured_path == ":memory:":
        return configured_path

    path = Path(configured_path).expanduser()
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return str(path.resolve())


@contextmanager
def connect(database_url: str | None = None) -> Iterator[sqlite3.Connection]:
    target = resolve_database_target(database_url)
    if target != ":memory:":
        Path(target).parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(target)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(database_url: str | None = None) -> None:
    """Create the SQLite file and apply pending schema migrations."""
    with connect(database_url) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        migration_exists = connection.execute(
            "SELECT 1 FROM schema_migrations WHERE version = ?",
            (COLLECTION_ITEMS_MIGRATION,),
        ).fetchone()
        if migration_exists is None:
            connection.executescript(COLLECTION_ITEMS_SCHEMA)
            connection.execute(
                "INSERT INTO schema_migrations (version) VALUES (?)",
                (COLLECTION_ITEMS_MIGRATION,),
            )
        seed_exists = connection.execute(
            "SELECT 1 FROM schema_migrations WHERE version = ?",
            (DEFAULT_ACHIEVEMENTS_MIGRATION,),
        ).fetchone()
        if seed_exists is None:
            connection.executemany(
                """
                INSERT OR IGNORE INTO collection_items (
                    id, collection, name, summary, description, details_json
                ) VALUES (?, 'achievements', ?, ?, ?, ?)
                """,
                [
                    (
                        item_id,
                        name,
                        summary,
                        requirement,
                        json.dumps(
                            {
                                "requirement": requirement,
                                "status": "in-progress",
                                "topics": topics,
                            },
                            separators=(",", ":"),
                            sort_keys=True,
                        ),
                    )
                    for item_id, name, summary, requirement, topics in DEFAULT_ACHIEVEMENTS
                ],
            )
            connection.execute(
                "INSERT INTO schema_migrations (version) VALUES (?)",
                (DEFAULT_ACHIEVEMENTS_MIGRATION,),
            )
        arc_rows_exists = connection.execute(
            "SELECT 1 FROM schema_migrations WHERE version = ?",
            (ARC_ROWS_MIGRATION,),
        ).fetchone()
        if arc_rows_exists is None:
            connection.executescript(ARC_ROWS_SCHEMA)
            connection.execute(
                "INSERT INTO schema_migrations (version) VALUES (?)",
                (ARC_ROWS_MIGRATION,),
            )
        arc_panels_exists = connection.execute(
            "SELECT 1 FROM schema_migrations WHERE version = ?",
            (ARC_PANELS_MIGRATION,),
        ).fetchone()
        if arc_panels_exists is None:
            arc_columns = {
                row["name"] for row in connection.execute("PRAGMA table_info(arc_rows)")
            }
            if "panels_json" not in arc_columns:
                connection.execute(
                    "ALTER TABLE arc_rows ADD COLUMN panels_json TEXT NOT NULL DEFAULT '[]'"
                )
            for row in connection.execute(
                "SELECT id, position, video_json, thumbnails_json FROM arc_rows"
            ):
                template = row["position"] % 3
                panel_count = (2, 3, 2)[template]
                video_index = (0, 1, 1)[template]
                thumbnails = json.loads(row["thumbnails_json"] or "[]")
                video = json.loads(row["video_json"]) if row["video_json"] else None
                panels = [
                    {"id": str(uuid4()), "thumbnail": None, "video": None}
                    for _ in range(max(panel_count, len(thumbnails)))
                ]
                if video:
                    panels[video_index]["video"] = video
                for index, thumbnail in enumerate(thumbnails):
                    panels[index]["thumbnail"] = thumbnail
                connection.execute(
                    "UPDATE arc_rows SET panels_json = ? WHERE id = ?",
                    (json.dumps(panels, separators=(",", ":"), sort_keys=True), row["id"]),
                )
            connection.execute(
                "INSERT INTO schema_migrations (version) VALUES (?)",
                (ARC_PANELS_MIGRATION,),
            )
        connection.execute("PRAGMA optimize")
