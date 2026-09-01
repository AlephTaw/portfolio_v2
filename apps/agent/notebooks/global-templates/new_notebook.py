# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo[sql]>=0.23.16", "your_custom_package"]
# [tool.uv.sources]
# your_custom_package = { path = "../../../dist/your_custom_package-0.1.0-py3-none-any.whl" }
# ///

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _(mo):
    mo.md("""
    # Header
    """)
    return


if __name__ == "__main__":
    app.run()
