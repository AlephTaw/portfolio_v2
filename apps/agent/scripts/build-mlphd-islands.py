"""Build a static MLPHD document and its lazy, shared interactive layer."""

import asyncio
import contextlib
import hashlib
import html
import io
import json
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import marimo
from marimo import MarimoIslandGenerator

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "app" / "generated" / "curriculum-catalog.json"
MANIFEST_PATH = ROOT / "app" / "generated" / "mlphd-islands-manifest.json"
STATIC_DOCUMENT_PATH = ROOT / "app" / "generated" / "mlphd-static-document.json"
LAYERS_PATH = ROOT / "public" / "bootcamp" / "islands"
ERROR_MARKERS = (
    "MarimoExceptionRaisedError",
    "MultipleDefinitionError",
    "Traceback (most recent call last)",
)
SHARED_SETUP = (
    "import sys as _sys\n"
    "if _sys.platform == 'emscripten':\n"
    "    from pathlib import Path as _Path\n"
    "    from js import location as _location\n"
    "    from pyodide.http import pyfetch as _pyfetch\n"
    "    _wheel_url = (\n"
    "        f'{_location.origin}/bootcamp/public/wheels/'\n"
    "        'mlphd_bootcamp-0.1.0-py3-none-any.whl'\n"
    "    )\n"
    "    _wheel_path = '/tmp/mlphd_bootcamp-0.1.0-py3-none-any.whl'\n"
    "    _wheel_response = await _pyfetch(_wheel_url)\n"
    "    _Path(_wheel_path).write_bytes(await _wheel_response.bytes())\n"
    "    _sys.path.insert(0, _wheel_path)\n"
    "import marimo as mo\n"
    "from mlphd_bootcamp import (\n"
    "    assertion,\n"
    "    execute_submission,\n"
    "    open_seed_database,\n"
    "    problem,\n"
    ")"
)
CELL_OUTPUT = re.compile(
    r"<marimo-cell-output>\s*(.*?)\s*</marimo-cell-output>", re.DOTALL
)
MIME_RENDERER = re.compile(
    r"<marimo-mime-renderer\b(?P<attributes>[^>]*)>.*?</marimo-mime-renderer>",
    re.DOTALL,
)
DATA_ATTRIBUTE = re.compile(r"\bdata-data=(?P<quote>['\"])(?P<data>.*?)(?P=quote)")
PROSE_ROOT = re.compile(
    r'^<span class="markdown prose dark:prose-invert contents">(?P<body>.*)</span>$',
    re.DOTALL,
)
CELL_OUTPUT_OPEN = re.compile(r"(<marimo-cell-output>)", re.DOTALL)
SOURCE_EDITOR_BLOCK = re.compile(
    r"</marimo-cell-output>\s*(?P<editor><marimo-ui-element\b.*?"
    r"</marimo-ui-element>)\s*</marimo-island>",
    re.DOTALL,
)
SOURCE_GUARD_BLOCK = re.compile(
    r"(?P<guard><marimo-ui-element data-mlphd-island-source-guard hidden\b.*?"
    r"</marimo-ui-element>)",
    re.DOTALL,
)


@dataclass(frozen=True)
class Layer:
    id: str
    title: str
    order: int
    unit_ids: list[str]


def descendant_unit_ids(items: list[dict]) -> list[str]:
    unit_ids: list[str] = []
    for item in sorted(items, key=lambda candidate: candidate["order"]):
        if item["type"] == "unit":
            unit_ids.append(item["unit"])
        else:
            unit_ids.extend(descendant_unit_ids(item["children"]))
    return unit_ids


def subject_layers(catalog: dict) -> list[Layer]:
    """Use second-level curriculum sections as interactive loading boundaries."""
    layers: list[Layer] = []
    for domain in sorted(
        catalog["views"]["default"]["items"], key=lambda item: item["order"]
    ):
        if domain["type"] == "unit":
            layers.append(
                Layer(
                    id=f"unit-{domain['unit']}",
                    title=domain["unit"],
                    order=domain["order"],
                    unit_ids=[domain["unit"]],
                )
            )
            continue

        for subject in sorted(domain["children"], key=lambda item: item["order"]):
            if subject["type"] == "unit":
                layers.append(
                    Layer(
                        id=f"{domain['id']}-{subject['unit']}",
                        title=subject["unit"],
                        order=subject["order"],
                        unit_ids=[subject["unit"]],
                    )
                )
                continue
            layers.append(
                Layer(
                    id=subject["id"],
                    title=subject["title"],
                    order=subject["order"],
                    unit_ids=descendant_unit_ids(subject["children"]),
                )
            )

    seen_units: set[str] = set()
    for layer in layers:
        duplicates = seen_units.intersection(layer.unit_ids)
        if duplicates:
            raise ValueError(
                f"Units occur in more than one interactive layer: {sorted(duplicates)}"
            )
        seen_units.update(layer.unit_ids)

    catalog_units = {unit["id"] for unit in catalog["units"]}
    missing = catalog_units - seen_units
    if missing:
        raise ValueError(f"Registered units are absent from the default view: {sorted(missing)}")
    return layers


def decode_mime_renderer(match: re.Match[str]) -> str:
    data_match = DATA_ATTRIBUTE.search(match.group("attributes"))
    if data_match is None:
        return ""
    encoded = html.unescape(data_match.group("data"))
    try:
        decoded = json.loads(encoded)
    except json.JSONDecodeError:
        return ""
    return decoded if isinstance(decoded, str) else ""


def static_output(rendered: str) -> str:
    """Extract browser-readable build output without requiring Marimo JavaScript."""
    output_match = CELL_OUTPUT.search(rendered)
    if output_match is None:
        return ""
    output = MIME_RENDERER.sub(decode_mime_renderer, output_match.group(1))
    output = re.sub(r"<script\b.*?</script>", "", output, flags=re.DOTALL)
    output = re.sub(
        r"<marimo-(?:ui-element|callout-output)\b.*?</marimo-(?:ui-element|callout-output)>",
        "",
        output,
        flags=re.DOTALL,
    )
    prose_match = PROSE_ROOT.match(output.strip())
    if prose_match is not None:
        output = f'<div class="mlphd-prose">{prose_match.group("body")}</div>'
    visible_text = html.unescape(re.sub(r"<[^>]+>", " ", output))
    if not visible_text.strip():
        return ""
    return f'<div class="mlphd-static-cell">{output}</div>'


def render_static_math(static_units: list[dict]) -> None:
    """Replace Marimo runtime math elements with build-time KaTeX HTML."""
    blocks = [
        block
        for unit in static_units
        for block in unit["blocks"]
        if block["kind"] == "static"
    ]
    if not blocks:
        return
    helper = ROOT / "scripts" / "render-static-katex.mjs"
    node = shutil.which("node")
    if node is None:
        raise RuntimeError("Node.js is required to render static tutorial math")
    result = subprocess.run(  # noqa: S603 - runs a repository-owned build helper.
        [node, str(helper)],
        input=json.dumps([block["html"] for block in blocks]),
        capture_output=True,
        check=False,
        cwd=ROOT,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Static KaTeX rendering failed:\n{result.stderr}")
    rendered = json.loads(result.stdout)
    if len(rendered) != len(blocks):
        raise RuntimeError("Static KaTeX renderer returned the wrong number of blocks")
    for block, rendered_html in zip(blocks, rendered, strict=True):
        block["html"] = rendered_html


def is_interactive(code: str, rendered: str) -> bool:
    """Detect generic Marimo interaction cells, not only exercise cells."""
    return any(
        marker in code or marker in rendered
        for marker in (
            "mo.ui.",
            "problem(",
            "<marimo-ui-element",
            "# MLPHD INTERACTIVE",
        )
    )


def contains_error(rendered: str) -> list[str]:
    return [marker for marker in ERROR_MARKERS if marker in rendered]


def guard_nested_code_editor(rendered: str, rendered_with_source: str) -> str:
    """Prevent an output editor from being mistaken for island source code.

    Marimo Islands 0.23.x locates its optional source editor with a descendant
    selector. Exercise output also contains a code editor, so payload hydration
    otherwise duplicates the learner editor's object ID and breaks UI events.
    """
    if "<marimo-code-editor" not in rendered:
        return rendered
    source_match = SOURCE_EDITOR_BLOCK.search(rendered_with_source)
    if source_match is None:
        raise RuntimeError("Marimo did not render the expected island source editor")
    source_editor = source_match.group("editor").replace(
        "<marimo-ui-element",
        '<marimo-ui-element data-mlphd-island-source-guard hidden',
        1,
    )
    return CELL_OUTPUT_OPEN.sub(rf"\1{source_editor}", rendered, count=1)


def render_runtime_payload(
    generator: MarimoIslandGenerator,
    source_guards: dict[str, str],
) -> str:
    """Add the same source boundary to payload output used for materialization."""
    rendered = generator.render_payload_script()
    opening, payload_text = rendered.split(">", 1)
    payload_text, closing = payload_text.rsplit("</script>", 1)
    payload = json.loads(payload_text)
    for cell in payload["cells"]:
        guard = source_guards.get(cell["cellId"])
        if guard:
            cell["outputHtml"] = guard + cell["outputHtml"]
    safe_json = (
        json.dumps(payload)
        .replace("&", r"\u0026")
        .replace("<", r"\u003C")
        .replace(">", r"\u003E")
    )
    return f"{opening}>{safe_json}</script>{closing}"


async def build() -> None:
    catalog = json.loads(CATALOG_PATH.read_text())
    units_by_id = {unit["id"]: unit for unit in catalog["units"]}
    layers = subject_layers(catalog)
    generator = MarimoIslandGenerator(app_id="mlphd")
    generator.add_code(SHARED_SETUP, display_code=False)
    unit_ranges: dict[str, tuple[int, int]] = {}

    with tempfile.TemporaryDirectory(prefix="mlphd-islands-") as directory:
        temp_dir = Path(directory)
        for layer in layers:
            for unit_id in layer.unit_ids:
                unit = units_by_id[unit_id]
                notebook = ROOT / unit["notebook"]
                staged_notebook = temp_dir / f"{unit_id}.py"
                shutil.copy2(notebook, staged_notebook)
                source = MarimoIslandGenerator.from_file(
                    str(staged_notebook), display_code=False
                )
                start = len(generator.stubs)
                for stub in source.stubs[1:]:
                    generator.add_code(stub.code, display_code=False)
                unit_ranges[unit_id] = (start, len(generator.stubs))

        diagnostics = io.StringIO()
        with contextlib.redirect_stderr(diagnostics):
            await generator.build()
        diagnostic_text = diagnostics.getvalue()
        if diagnostic_text.strip():
            raise RuntimeError(
                "Marimo emitted diagnostics while building the shared interactive layer:\n"
                f"{diagnostic_text}"
            )

    static_units: list[dict] = []
    interactive_units: dict[str, list[dict]] = {}
    source_guards: dict[str, str] = {}
    for layer in layers:
        seen_static_outputs: set[str] = set()
        for unit_id in layer.unit_ids:
            start, end = unit_ranges[unit_id]
            static_blocks: list[dict] = []
            interactive_blocks: list[dict] = []
            for block_index, stub in enumerate(generator.stubs[start:end], start=1):
                block_id = f"{unit_id}-block-{block_index}"
                rendered = stub.render()
                rendered_errors = contains_error(rendered)
                if rendered_errors:
                    raise RuntimeError(
                        f"Unit {unit_id} contains uncaught errors: "
                        + ", ".join(rendered_errors)
                    )
                if is_interactive(stub.code, rendered):
                    interactive_output = CELL_OUTPUT.search(rendered)
                    interactive_output_html = (
                        interactive_output.group(1) if interactive_output is not None else ""
                    )
                    has_visible_output = bool(
                        html.unescape(
                            re.sub(r"<[^>]+>", " ", interactive_output_html)
                        ).strip()
                        or "<marimo-ui-element" in interactive_output_html
                        or "<marimo-callout-output" in interactive_output_html
                    )
                    static_blocks.append(
                        {
                            "id": block_id,
                            "kind": "interactive",
                            "placeholder": "<marimo-ui-element" in rendered,
                        }
                    )
                    guarded_rendered = guard_nested_code_editor(
                        rendered,
                        stub.render(display_code=True),
                    )
                    guard_match = SOURCE_GUARD_BLOCK.search(guarded_rendered)
                    if guard_match is not None:
                        cell_id_match = re.search(r'data-cell-id="([^"]+)"', rendered)
                        if cell_id_match is None:
                            raise RuntimeError("Interactive island is missing its cell ID")
                        source_guards[cell_id_match.group(1)] = guard_match.group("guard")
                    interactive_blocks.append(
                        {
                            "id": block_id,
                            "html": guarded_rendered,
                            "visible": has_visible_output,
                        }
                    )
                    continue
                extracted = static_output(rendered)
                if extracted and extracted not in seen_static_outputs:
                    seen_static_outputs.add(extracted)
                    static_blocks.append(
                        {"id": block_id, "kind": "static", "html": extracted}
                    )
            static_units.append({"id": unit_id, "blocks": static_blocks})
            interactive_units[unit_id] = interactive_blocks

    render_static_math(static_units)

    rendered_layers: dict[str, str] = {}
    for layer in layers:
        payload = {
            "schemaVersion": 1,
            "id": layer.id,
            "title": layer.title,
            "units": [
                {"id": unit_id, "blocks": interactive_units[unit_id]}
                for unit_id in layer.unit_ids
            ],
        }
        rendered = json.dumps(payload, indent=2) + "\n"
        rendered_errors = contains_error(rendered)
        if rendered_errors:
            raise RuntimeError(
                f"Interactive layer {layer.id} contains uncaught errors: "
                + ", ".join(rendered_errors)
            )
        rendered_layers[layer.id] = rendered

    runtime_payload = json.dumps(
        {
            "schemaVersion": 1,
            "html": render_runtime_payload(generator, source_guards),
        },
        indent=2,
    ) + "\n"
    static_document = {
        "schemaVersion": 1,
        "units": static_units,
    }
    version = marimo.__version__
    manifest = {
        "schemaVersion": 1,
        "runtime": {
            "script": (
                "https://cdn.jsdelivr.net/npm/"
                f"@marimo-team/islands@{version}/dist/main.js"
            ),
            "payloadUrl": (
                "/bootcamp/islands/runtime.json?v="
                f"{hashlib.sha256(runtime_payload.encode()).hexdigest()[:12]}"
            ),
        },
        "layers": [
            {
                "id": layer.id,
                "title": layer.title,
                "order": index * 10,
                "unitIds": layer.unit_ids,
                "url": (
                    f"/bootcamp/islands/{layer.id}.json?v="
                    f"{hashlib.sha256(rendered_layers[layer.id].encode()).hexdigest()[:12]}"
                ),
            }
            for index, layer in enumerate(layers, start=1)
        ],
    }

    LAYERS_PATH.mkdir(parents=True, exist_ok=True)
    expected_paths = {
        LAYERS_PATH / "runtime.json",
        *(LAYERS_PATH / f"{layer_id}.json" for layer_id in rendered_layers),
    }
    for old_file in LAYERS_PATH.glob("*.json"):
        if old_file not in expected_paths:
            old_file.unlink()
    for layer_id, rendered in rendered_layers.items():
        (LAYERS_PATH / f"{layer_id}.json").write_text(rendered)
    (LAYERS_PATH / "runtime.json").write_text(runtime_payload)
    STATIC_DOCUMENT_PATH.write_text(json.dumps(static_document, indent=2) + "\n")
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")
    print(
        f"Built {len(static_units)} static units and {len(layers)} lazy interactive "
        "layers sharing one Marimo application."
    )


if __name__ == "__main__":
    asyncio.run(build())
