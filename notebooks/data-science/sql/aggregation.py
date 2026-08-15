# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo[sql]>=0.23.16", "mlphd-bootcamp"]
# [tool.uv.sources]
# mlphd-bootcamp = { path = "../../../dist/mlphd_bootcamp-0.1.0-py3-none-any.whl" }
# ///

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp import open_seed_database

    return mo, open_seed_database


@app.cell
def _(mo):
    mo.md(r"""
    # Aggregation

    ## Learning objectives

    Group observations and calculate summary statistics with aggregate functions.

    If a group contains $N$ observations, its arithmetic mean is

    $$\bar{x} = \frac{1}{N}\sum_{i=1}^{N}x_i.$$
    """)
    return


@app.cell
def _(open_seed_database):
    aggregation_database = open_seed_database(
        "aggregation.sqlite",
        seed_url="/bootcamp/data/aggregation.sqlite",
        local_seed="database/aggregation.sqlite",
    )
    return (aggregation_database,)


@app.cell
def _(aggregation_database, mo):
    aggregation_summary_rows = aggregation_database.execute(
        """
        SELECT category, COUNT(*) AS observations, AVG(value) AS mean_value
        FROM measurements
        GROUP BY category
        ORDER BY category
        """
    ).fetchall()
    aggregation_summary_body = "\n".join(
        f"| {category} | {observations} | {mean_value:.1f} |"
        for category, observations, mean_value in aggregation_summary_rows
    )
    mo.md(
        "| Category | Observations | Mean value |\n"
        "|:--|--:|--:|\n"
        f"{aggregation_summary_body}"
    )
    return


@app.cell
def _(mo):
    mo.md("""
    ## Concept check

    Extend the query so that it also returns `min_value` and `max_value` for each
    category. Edit the starter SQL and select **Run and check**. The checker evaluates
    the result rather than looking for specific query text.
    """)
    return


@app.cell
def _(mo):
    aggregation_query_editor = mo.ui.code_editor(
        value="""SELECT
      category,
      COUNT(*) AS observations,
      AVG(value) AS mean_value
      -- , MIN(value) AS min_value
      -- , MAX(value) AS max_value
    FROM measurements
    GROUP BY category
    ORDER BY category;""",
        language="sql",
        label="SQL query",
        min_height=220,
    )
    mo.vstack([aggregation_query_editor], gap=1)
    return (aggregation_query_editor,)


@app.cell
def _(aggregation_database, aggregation_query_editor, mo):
    try:
        aggregation_cursor = aggregation_database.execute(aggregation_query_editor.value)
        aggregation_result_rows = aggregation_cursor.fetchall()
        aggregation_result_columns = [
            description[0] for description in aggregation_cursor.description
        ]
    except Exception as error:
        mo.stop(
            True,
            mo.callout(
                f"The query could not run: {type(error).__name__}: {error}",
                kind="danger",
            ),
        )

    aggregation_expected_columns = [
        "category",
        "observations",
        "mean_value",
        "min_value",
        "max_value",
    ]
    aggregation_expected_rows = [
        ("A", 2, 12.0, 10, 14),
        ("B", 2, 9.0, 7, 11),
    ]
    aggregation_is_correct = (
        aggregation_result_columns == aggregation_expected_columns
        and aggregation_result_rows == aggregation_expected_rows
    )

    if aggregation_is_correct:
        aggregation_feedback = mo.callout(
            "Correct. Both groups span four units: A spans 10–14 and B spans 7–11.",
            kind="success",
        )
    else:
        aggregation_feedback = mo.callout(
            "Not yet. Return MIN(value) as min_value and MAX(value) as max_value while "
            "preserving the existing grouped columns and ordering.",
            kind="warn",
        )

    aggregation_preview = mo.md(
        f"""
        **Columns:** `{aggregation_result_columns}`

        **Rows:** `{aggregation_result_rows}`
        """
    )
    mo.vstack([aggregation_feedback, aggregation_preview], gap=1)
    return


if __name__ == "__main__":
    app.run()
