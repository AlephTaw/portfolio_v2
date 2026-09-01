#!/usr/bin/env python3
"""Split a unit-marked Marimo all-in-one source into standalone notebooks."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

START = "# === MLPHD UNIT START ==="
INLINE_START = f"    {START}"
END = "# === MLPHD UNIT END ==="
METADATA_END = "# ==="
MAIN_GUARD = 'if __name__ == "__main__":\n    app.run()'
UNIT_BODY = "_mlphd_unit_body = True"
REQUIRED_FIELDS = {
    "id",
    "title",
    "kind",
    "difficulty",
    "teaches",
    "assesses",
    "requires",
}


@dataclass(frozen=True)
class Unit:
    id: str
    title: str
    kind: str
    difficulty: str
    teaches: list[str]
    assesses: list[str]
    requires: list[str]
    order: int
    notebook: str


def parse_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def parse_metadata(lines: list[str], source: Path) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for line in lines:
        match = re.fullmatch(r"# ([a-z]+):\s*(.*)", line)
        if match:
            metadata[match.group(1)] = match.group(2).strip()
    missing = REQUIRED_FIELDS - metadata.keys()
    if missing:
        raise ValueError(f"{source}: unit metadata missing {sorted(missing)}")
    if metadata["kind"] not in {"exposition", "exercise"}:
        raise ValueError(f"{source}: invalid unit kind {metadata['kind']!r}")
    if metadata["difficulty"] not in {"easy", "medium", "hard"}:
        raise ValueError(
            f"{source}: invalid difficulty {metadata['difficulty']!r}"
        )
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", metadata["id"]):
        raise ValueError(f"{source}: unit id must be stable kebab-case")
    return metadata


def parse_inline_units(
    text: str, source: Path
) -> tuple[str, list[tuple[dict[str, str], str]]]:
    """Parse unit metadata kept inside cells, where Marimo preserves comments."""
    marker_offsets = [
        match.start() for match in re.finditer(re.escape(INLINE_START), text)
    ]
    cell_starts: list[int] = []
    for marker_offset in marker_offsets:
        cell_start = text.rfind("\n@app.cell", 0, marker_offset)
        if cell_start < 0:
            raise ValueError(f"{source}: inline unit marker is not inside a cell")
        cell_starts.append(cell_start + 1)
    if len(cell_starts) != len(set(cell_starts)):
        raise ValueError(f"{source}: a cell contains more than one unit marker")

    guard_start = text.find("\n\nif __name__ == \"__main__\":", cell_starts[-1])
    document_end = guard_start if guard_start >= 0 else len(text)
    blocks: list[tuple[dict[str, str], str]] = []
    for index, (marker_offset, cell_start) in enumerate(
        zip(marker_offsets, cell_starts, strict=True)
    ):
        metadata_start = marker_offset + len(INLINE_START)
        metadata_end = text.find(f"    {METADATA_END}", metadata_start)
        if metadata_end < 0:
            raise ValueError(f"{source}: incomplete inline unit metadata")
        metadata_lines = [
            line.strip()
            for line in text[metadata_start:metadata_end].strip().splitlines()
        ]
        metadata = parse_metadata(metadata_lines, source)
        body_end = (
            cell_starts[index + 1]
            if index + 1 < len(cell_starts)
            else document_end
        )
        body = text[cell_start:body_end].strip()
        if "@app.cell" not in body:
            raise ValueError(f"{source}: unit {metadata['id']} has no Marimo cell")
        blocks.append((metadata, body))

    return text[: cell_starts[0]].rstrip(), blocks


def parse_units(source: Path) -> tuple[str, list[tuple[dict[str, str], str]]]:
    text = source.read_text(encoding="utf-8")
    if INLINE_START in text:
        return parse_inline_units(text, source)
    if text.count(START) != text.count(END):
        raise ValueError(f"{source}: unbalanced unit markers")
    if START not in text:
        raise ValueError(f"{source}: no unit markers found")

    preamble = text.split(START, 1)[0].rstrip()
    # The title and shared helpers deliberately stay in the preamble so every
    # extracted notebook remains understandable and independently executable.
    blocks: list[tuple[dict[str, str], str]] = []
    cursor = 0
    while True:
        start = text.find(START, cursor)
        if start < 0:
            break
        metadata_start = start + len(START)
        metadata_end = text.find(METADATA_END, metadata_start)
        end = text.find(END, metadata_end)
        if metadata_end < 0 or end < 0:
            raise ValueError(f"{source}: incomplete unit marker block")
        metadata_lines = text[metadata_start:metadata_end].strip().splitlines()
        metadata = parse_metadata(metadata_lines, source)
        body = text[metadata_end + len(METADATA_END) : end].strip()
        if "@app.cell" not in body:
            raise ValueError(f"{source}: unit {metadata['id']} has no Marimo cell")
        blocks.append((metadata, body))
        cursor = end + len(END)

    ids = [metadata["id"] for metadata, _body in blocks]
    if len(ids) != len(set(ids)):
        raise ValueError(f"{source}: unit ids are not unique")
    return preamble, blocks


def namespace_cross_cell_bindings(source: str, unit_id: str) -> str:
    """Scope reactive UI bindings when units share one Marimo Islands app."""
    suffix = unit_id.replace("-", "_")
    source = re.sub(
        r"\b(exercise_\d+_(?:description|starter|submit))\b",
        rf"\1__{suffix}",
        source,
    )
    return source


def mark_unit_body(source: str) -> str:
    """Mark the first unit-owned cell so merged-island builds can skip repeated preambles."""
    marked, count = re.subn(
        r"(@app\.cell[^\n]*\ndef _\([^\n]*\):\n)",
        rf"\1    {UNIT_BODY}\n",
        source,
        count=1,
    )
    if count != 1:
        raise ValueError("Unit body does not contain a recognizable first Marimo cell")
    return marked


def split(source: Path, output_dir: Path, *, check: bool) -> list[Unit]:
    preamble, blocks = parse_units(source)
    units: list[Unit] = []
    rendered: dict[Path, str] = {}

    for index, (metadata, body) in enumerate(blocks, start=1):
        output = output_dir / f"{metadata['id']}.py"
        namespaced_body = namespace_cross_cell_bindings(body, metadata["id"])
        namespaced_body = mark_unit_body(namespaced_body)
        rendered[output] = (
            f"{preamble}\n\n\n{namespaced_body}\n\n\n{MAIN_GUARD}\n"
        )
        units.append(
            Unit(
                id=metadata["id"],
                title=metadata["title"],
                kind=metadata["kind"],
                difficulty=metadata["difficulty"],
                teaches=parse_list(metadata["teaches"]),
                assesses=parse_list(metadata["assesses"]),
                requires=parse_list(metadata["requires"]),
                order=index * 10,
                notebook=output.as_posix(),
            )
        )

    manifest_path = output_dir / "units.json"
    manifest = {
        "source": source.as_posix(),
        "units": [asdict(unit) for unit in units],
    }
    rendered[manifest_path] = json.dumps(manifest, indent=2) + "\n"

    if check:
        mismatches = [
            path
            for path, expected in rendered.items()
            if not path.exists() or path.read_text(encoding="utf-8") != expected
        ]
        if mismatches:
            names = ", ".join(path.as_posix() for path in mismatches)
            raise SystemExit(f"Generated unit files are stale or missing: {names}")
        return units

    output_dir.mkdir(parents=True, exist_ok=True)
    expected_paths = set(rendered)
    for existing in output_dir.glob("*.py"):
        if existing not in expected_paths:
            raise ValueError(
                f"Refusing to overwrite output with unexpected file present: {existing}"
            )
    for path, content in rendered.items():
        if path.exists() and path.read_text(encoding="utf-8") == content:
            continue
        path.write_text(content, encoding="utf-8")
    return units


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    units = split(args.source, args.output_dir, check=args.check)
    action = "Validated" if args.check else "Generated"
    print(f"{action} {len(units)} units from {args.source}")


if __name__ == "__main__":
    main()
