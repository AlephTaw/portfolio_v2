"""Export every curriculum unit to a browser-executable Marimo application."""

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "app" / "generated" / "curriculum-catalog.json"


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text())

    for unit in catalog["units"]:
        notebook = ROOT / unit["notebook"]
        output = ROOT / "public" / unit["outputPath"].lstrip("/")
        output.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [
                "marimo",
                "export",
                "html-wasm",
                str(notebook),
                "--output",
                str(output),
                "--mode",
                "run",
                "--show-code",
            ],
            check=True,
            cwd=ROOT,
        )

    print(f"Exported {len(catalog['units'])} curriculum units.")


if __name__ == "__main__":
    main()
