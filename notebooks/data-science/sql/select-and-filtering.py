import marimo

__generated_with = "0.19.7"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp.theme import lesson_style

    lesson_style()
    return (mo,)


@app.cell
def _(mo):
    mo.md(
        r"""
        # SELECT and Filtering

        ## Learning objectives

        Use `SELECT`, `FROM`, and `WHERE` to retrieve a precise subset of a table.

        ### Query shape

        A query names the columns to return, the relation to read, and any conditions
        a row must satisfy.
        """
    )
    return


@app.cell
def _(mo):
    sample_people = mo.sql(
        f"""
        SELECT *
        FROM (
          VALUES
            (1, 'Ada', 'mathematics'),
            (2, 'Grace', 'computing'),
            (3, 'Katherine', 'physics')
        ) AS people(id, name, field)
        WHERE field <> 'physics'
        """
    )
    sample_people
    return


@app.cell
def _(mo):
    mo.md(
        """
        ## Exercise

        Change the predicate and rerun the SQL cell. The published exercise framework will
        add guided checks as this unit is developed.
        """
    )
    return


if __name__ == "__main__":
    app.run()
