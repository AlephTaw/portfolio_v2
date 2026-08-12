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
        # Aggregation

        ## Learning objectives

        Group observations and calculate summary statistics with aggregate functions.

        If a group contains $N$ observations, its arithmetic mean is

        $$\bar{x} = \frac{1}{N}\sum_{i=1}^{N}x_i.$$
        """
    )
    return


@app.cell
def _(mo):
    summary = mo.sql(
        f"""
        SELECT category, COUNT(*) AS observations, AVG(value) AS mean_value
        FROM (
          VALUES ('A', 10), ('A', 14), ('B', 7), ('B', 11)
        ) AS measurements(category, value)
        GROUP BY category
        ORDER BY category
        """
    )
    summary
    return


@app.cell
def _(mo):
    mo.md(
        """
        ## Exercise

        Extend the query with `MIN` and `MAX`, then compare the spread of the two groups.
        """
    )
    return


if __name__ == "__main__":
    app.run()
