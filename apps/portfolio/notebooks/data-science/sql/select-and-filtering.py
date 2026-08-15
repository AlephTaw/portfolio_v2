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
    return (mo,)


@app.cell
def _(mo):
    mo.md(
        r"""
        # SELECT and Filtering

        ## Learning objective

        Retrieve a precise subset of a relation by combining `SELECT`, `FROM`, and
        `WHERE`.

        ## Exposition

        A query answers three separate questions:

        1. **What columns should be returned?** `SELECT` defines the output shape.
        2. **Where does the data come from?** `FROM` names the relation.
        3. **Which rows qualify?** `WHERE` evaluates a condition for each input row.

        Conceptually, filtering happens before the final projection is presented:

        $$R' = \{r \in R \mid P(r)\}.$$

        Here, $R$ is the source relation, $P$ is the predicate in `WHERE`, and $R'$ is
        the set of rows that satisfy that predicate.
        """
    )
    return


@app.cell
def _(mo):
    mo.md(
        """
        | Name | Field |
        |:--|:--|
        | Ada | mathematics |
        | Grace | computing |
        """
    )
    return


@app.cell
def _(mo):
    mo.md(
        """
        The predicate `field <> 'physics'` is evaluated once for each row. Ada and Grace
        satisfy it; Katherine does not. `SELECT name, field` then determines which columns
        appear in the result.

        ## Concept check

        This check has exactly the same scope as the exposition above. It is part of this
        unit rather than a separate curriculum unit.

        Which clause decides whether an individual input row qualifies for the result?
        """
    )
    return


@app.cell
def _(mo):
    concept_answer = mo.ui.radio(
        options=["SELECT", "FROM", "WHERE", "ORDER BY"],
        label="Choose one clause",
    )
    concept_answer
    return (concept_answer,)


@app.cell
def _(concept_answer, mo):
    if concept_answer.value is None:
        mo.callout("Choose an answer to check your understanding.", kind="neutral")
    elif concept_answer.value == "WHERE":
        mo.callout(
            "Correct. WHERE evaluates its predicate for each input row.",
            kind="success",
        )
    else:
        mo.callout(
            f"Not quite. {concept_answer.value} has a different responsibility. "
            "Review the three questions above and try again.",
            kind="warn",
        )
    return


if __name__ == "__main__":
    app.run()
