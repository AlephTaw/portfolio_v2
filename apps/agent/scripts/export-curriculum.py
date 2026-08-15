"""Export every curriculum unit to a browser-executable Marimo application."""

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "app" / "generated" / "curriculum-catalog.json"
ERROR_MARKERS = (
    "MarimoExceptionRaisedError",
    "MultipleDefinitionError",
    "Traceback (most recent call last)",
)
GLOBAL_STYLES_PATH = ROOT / "app" / "globals.css"
BACKGROUND_PATTERN = re.compile(r"--background:\s*([^;]+);")


def site_background() -> str:
    match = BACKGROUND_PATTERN.search(GLOBAL_STYLES_PATH.read_text())
    if match is None:
        raise RuntimeError(f"Could not find --background in {GLOBAL_STYLES_PATH}")
    return match.group(1).strip()


def style_embedded_notebook(output: Path, background: str) -> None:
    html = output.read_text()
    style = f"""
    <style data-mlphd-embed-style>
      :root, html, body, #root, marimo-app {{
        color-scheme: light;
        --background: {background} !important;
        --card: {background} !important;
        --popover: {background} !important;
        --foreground: #191714 !important;
        --card-foreground: #191714 !important;
        --popover-foreground: #191714 !important;
        --primary: #191714 !important;
        --primary-foreground: {background} !important;
        --muted: #f3ecde !important;
        --muted-foreground: #766b5d !important;
        --accent: #f3ecde !important;
        --accent-foreground: #191714 !important;
        --border: #d8d0c1 !important;
        --input: #d8d0c1 !important;
        --ring: #8d7a70 !important;
        background: {background} !important;
        background-color: {background} !important;
        color: #191714;
      }}
      #root svg.animate-spin {{
        color: #8d7a70 !important;
        stroke-width: 1.5;
      }}
      #root p.text-center.text-sm.text-muted-foreground {{
        color: #766b5d !important;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 0.62rem !important;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }}
      [data-testid="watermark"] {{ display: none !important; }}
    </style>
    """.strip()
    html_tag = re.search(r"<html\b[^>]*>", html)
    head_tag = re.search(r"<head\b[^>]*>", html)
    if html_tag is None or head_tag is None:
        raise RuntimeError(f"Could not find document roots in exported notebook {output}")

    root = html_tag.group(0)
    styled_root = root[:-1] + f' style="background: {background}">'
    html = html[: html_tag.start()] + styled_root + html[html_tag.end() :]

    head_tag = re.search(r"<head\b[^>]*>", html)
    if head_tag is None:
        raise RuntimeError(f"Could not find <head> in exported notebook {output}")
    html = html[: head_tag.end()] + f"\n    {style}" + html[head_tag.end() :]
    output.write_text(html)


def main() -> None:
    subprocess.run(
        ["uv", "run", "python", "-m", "database.builders.build_all"],
        check=True,
        cwd=ROOT,
    )
    subprocess.run(
        ["uv", "run", "python", "-m", "database.builders.publish"],
        check=True,
        cwd=ROOT,
    )
    catalog = json.loads(CATALOG_PATH.read_text())
    background = site_background()

    subprocess.run(
        ["uv", "build", "--wheel", "--out-dir", "dist"],
        check=True,
        cwd=ROOT,
    )

    wheel = ROOT / "dist" / "mlphd_bootcamp-0.1.0-py3-none-any.whl"
    public_wheel = ROOT / "public" / "bootcamp" / "public" / "wheels" / wheel.name

    for unit in catalog["units"]:
        notebook = ROOT / unit["notebook"]
        output = ROOT / "public" / unit["outputPath"].lstrip("/")
        output.parent.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(
            [
                "marimo",
                "export",
                "html-wasm",
                str(notebook),
                "--output",
                str(output),
                "--mode",
                "run",
            ],
            check=False,
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0 or result.stderr.strip():
            raise RuntimeError(
                f"Failed to export {unit['id']} ({notebook}):\n"
                f"{result.stdout}{result.stderr}"
            )
        rendered = output.read_text()
        rendered_errors = [marker for marker in ERROR_MARKERS if marker in rendered]
        if rendered_errors:
            raise RuntimeError(
                f"Exported unit {unit['id']} contains uncaught errors: "
                + ", ".join(rendered_errors)
            )
        style_embedded_notebook(output, background)

    # Marimo's WASM exporter refreshes its shared public assets while exporting,
    # so publish the local package wheel only after every notebook is complete.
    public_wheel.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(wheel, public_wheel)

    print(f"Exported {len(catalog['units'])} curriculum units.")


if __name__ == "__main__":
    main()
