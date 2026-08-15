# /// script
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
    mo.md(
        """
        # SELECT and Filtering: Exercise

        ## Task

        Write a query that returns one column named `name` containing everyone whose
        `field` is not `physics`. Sort the result alphabetically by `name`.

        The browser-local table contains:

        | id | name | field |
        |---:|:-----|:------|
        | 1 | Ada | mathematics |
        | 2 | Grace | computing |
        | 3 | Katherine | physics |

        Edit the starter query, then select **Run and check**. Equivalent SQL solutions are
        accepted because the result—not the query text—is assessed.
        """
    )
    return


@app.cell
def _(open_seed_database):
    select_database = open_seed_database(
        "select.sqlite",
        seed_url="/bootcamp/data/select.sqlite",
        local_seed="database/select.sqlite",
    )
    return (select_database,)


@app.cell
def _(mo):
    select_query_editor = mo.ui.code_editor(
        value="""SELECT name
FROM people
-- Add the filtering clause here.
ORDER BY name;""",
        language="sql",
        label="SQL query",
        min_height=140,
    )
    mo.vstack([select_query_editor], gap=1)
    return (select_query_editor,)


@app.cell
def _(mo, select_database, select_query_editor):
    try:
        select_cursor = select_database.execute(select_query_editor.value)
        select_result_rows = select_cursor.fetchall()
        select_result_columns = [description[0] for description in select_cursor.description]
    except Exception as error:
        mo.stop(
            True,
            mo.callout(
                f"The query could not run: {type(error).__name__}: {error}",
                kind="danger",
            ),
        )

    select_expected_rows = [("Ada",), ("Grace",)]
    select_is_correct = (
        select_result_columns == ["name"]
        and select_result_rows == select_expected_rows
    )

    if select_is_correct:
        select_feedback = mo.callout(
            "Correct. Your query returns the expected column and ordered rows.",
            kind="success",
        )
    else:
        select_feedback = mo.callout(
            "Not yet. Check the selected column, the filtering predicate, and the sort order.",
            kind="warn",
        )

    select_preview = mo.md(
        f"""
        **Columns:** `{select_result_columns}`

        **Rows:** `{select_result_rows}`
        """
    )
    mo.vstack([select_feedback, select_preview], gap=1)
    return


@app.cell
def _(mo):
    mo.md(
        """
        ## Review

        A valid solution projects `name`, filters rows using `WHERE`, and establishes a
        deterministic result order with `ORDER BY`. The checker intentionally accepts any
        SQL text that produces the required result.
        """
    )
    return


if __name__ == "__main__":
    app.run()
