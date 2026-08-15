# /// script
# dependencies = ["marimo"]
# requires-python = ">=3.12"
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
    # SQL Notes
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## NOTEBOOK SETUP
    """)
    return


@app.cell
def _():
    import polars as pl
    import pandas as pd

    import sqlite3
    from pathlib import Path

    db_path = (
        Path("/Users/stevenwilcox/Desktop/swdev")
        / "database"
        / "omnichannel_ecommerce_full.sqlite"
    )

    if not db_path.is_file():
        raise FileNotFoundError(db_path)

    connection = sqlite3.connect(
        f"file:{db_path}?mode=ro",
        uri=True,
    )
    return connection, pl


@app.cell
def _(pl):
    # def query_df(sql: str, parameters=(), *, connection=connection) -> pd.DataFrame:
    #     """
    #     Execute SQL and return tabular results as a pandas DataFrame.

    #     Supports positional SQLite parameters:
    #         query_df("SELECT * FROM customers WHERE country_code = ?", ("US",))
    #     """
    #     cursor = connection.execute(sql, parameters)

    #     # Statements without returned columns, such as UPDATE without RETURNING
    #     if cursor.description is None:
    #         return pd.DataFrame()

    #     columns = [column[0] for column in cursor.description]
    #     rows = cursor.fetchall()

    #     return pd.DataFrame.from_records(rows, columns=columns)

    def query_polars(
        connection,
        sql: str,
        parameters=(),
    ) -> pl.DataFrame:
        """
        Execute SQLite SQL and return any tabular result as a Polars DataFrame.
        """

        cursor = connection.execute(sql, parameters)

        # For statements without returned columns, such as UPDATE without RETURNING
        if cursor.description is None:
            return pl.DataFrame()

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()

        return pl.DataFrame(
            rows,
            schema=columns,
            orient="row",
        )

    return (query_polars,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## SQL Essentials
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## NOTEBOOK CONTENT
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    1. Core SQL Syntax
       * Creating a db
       * Creating tables
           * Schemas
           * Create table from schema
           * Alter table
           * Create table from query
           * Indices and constrataints
           * Bulk loading and exporting
       * Views
       * Materialized Views

       * Table Row CRUD
           * Create, Read, Update, Delete
           * Upsert
           * Update
           * Truncate
           * Merge
           * Transactions - UPDATE, SET, COMMIT, ROLLBACK, SAVEPOINT, ROLLBACK TO SAVEPOINT, RELEASE SAVEPOINT
       * Populating tables with data
       * Querying tables
       *    * Ur Query Motivation
                * Execution order vs. written order
                * Composing queries with CTEs
            * Query syntax
                * SELECT, FROM
                * WHERE
                * GROUP BY
                * HAVING
                * Aggregation
                * Joins - INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, LATERAL JOIN
                * DISTINCT
                * OFFSET
                * WINDOW FUNCTIONS - ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE(), SUM() OVER(), AVG() OVER)()
                * Subqueries
                * CTEs
                * Recursive CTEs
                * In Postgres, filter a window result with a subquery to "QUALIFY"
                * Set Operations
                * Conditional and Null Handling
                * Type conversion
                * Dates and times
                * Text, arrays, and JSON
                *
       * Query Plans and Performance
           * EXPLAIN
           * EXPLAIN ANALYZE
           * VACUUM
           * VACUUM (ANALYZE)
           * REINDEX TABLE
       * Permissions
       * Table and Row Locking
       * PostgreSQL utility syntax
       * Pivot: rows into columns
           * Preferredd: conditional aggregation
           * crosstab()
       * Unpivot: coluns into rows
           * Preferred: CROSS JOINT LATERAL with VALUES
           * Unpivot with UNION ALL
           * Dynamic unpivot with JSONB

    3. ...
    4. ...
    5. ...
    6. ...
    7. ...
    8. ...
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    _multi_channel_ecommerce_db = mo.mermaid(
        """
        erDiagram
            CUSTOMERS ||--o{ ORDERS : places
            ORDERS ||--|{ ORDER_ITEMS : contains
            PRODUCTS ||--o{ ORDER_ITEMS : appears_in
            CATEGORIES ||--o{ PRODUCTS : classifies
            CATEGORIES ||--o{ CATEGORIES : parent_of
            ORDERS ||--o{ PAYMENTS : receives
            ORDERS ||--o{ SHIPMENTS : fulfilled_by
            PRODUCTS ||--o{ INVENTORY_SNAPSHOTS : measured_in
            LOCATIONS ||--o{ INVENTORY_SNAPSHOTS : holds
            CUSTOMERS ||--o{ EVENTS : generates
        """
    )

    _multi_channel_ecommerce_db
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Customers Table
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Design brief:** Store one row per recognized customer.

    **Important fields:**
    customer_id
    email
    first_name
    last_name
    country_code
    acquisition_channel
    signup_at
    birth_date
    status
    marketing_opt_in
    attributes JSONB

    **Constraints:**
    customer_id is the primary key.
    email is required and unique, preferably case-insensitively.
    signup_at is required.
    birth_date must precede signup_at.
    status and acquisition_channel must use controlled values.
    JSONB attributes may contain loyalty tier, preferred store, or campaign metadata.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Synthetic-data method:** Use a seeded fake-data generator for names and unique emails. Draw countries, channels, and statuses from weighted distributions. Generate signup dates first, then generate birth dates and all subsequent customer activity relative to those dates. Include customers with no orders to support anti-join questions.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Create the Tables
    """)
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Populate the Tables
    """)
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Exploratore the Database
    """)
    return


@app.cell
def _(connection, query_polars):
    query_polars(
        connection,
        """
        SELECT
            type,
            name,
            tbl_name
        FROM sqlite_master
        WHERE name NOT LIKE 'sqlite_%'
        ORDER BY type, name
        """,
    )
    return


@app.cell
def _(connection, query_polars):
    query_polars(
        connection,
        """
        SELECT
            m.name AS table_name,
            p.cid AS column_number,
            p.name AS column_name,
            p.type AS data_type,
            p."notnull" AS not_null,
            p.dflt_value AS default_value,
            p.pk AS primary_key_position
        FROM sqlite_master AS m
        JOIN pragma_table_info(m.name) AS p
          ON TRUE
        WHERE m.type = 'table'
          AND m.name NOT LIKE 'sqlite_%'
        ORDER BY m.name, p.cid
        """,
    )
    return


@app.cell
def _(connection, pl, query_polars):
    _tables = query_polars(
        connection,
        """
        SELECT name AS table_name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        """,
    )

    _table_counts = pl.concat(
        [
            query_polars(
                connection,
                f'SELECT {table_name!r} AS table_name, COUNT(*) AS row_count '
                f'FROM "{table_name}"',
            )
            for table_name in _tables["table_name"].to_list()
        ]
    )

    _table_counts
    return


@app.cell
def _(connection, query_polars):
    query_polars(
        connection,
        """
        SELECT
            name AS table_name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        """,
    )
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM categories
            LIMIT 20
        """
    _categories = pl.read_database(
        query=_query,
        connection=connection,
    )
    _categories
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM customer_metrics
            LIMIT 2
        """
    _customer_metrics = pl.read_database(
        query=_query,
        connection=connection,
    )
    _customer_metrics
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM customers
            LIMIT 2
        """
    _customers = pl.read_database(
        query=_query,
        connection=connection,
    )
    _customers
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM daily_product_sales
            LIMIT 2
        """
    _daily_product_sales = pl.read_database(
        query=_query,
        connection=connection,
    )
    _daily_product_sales
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM events
            LIMIT 2
        """
    _events = pl.read_database(
        query=_query,
        connection=connection,
    )
    _events
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM inventory_snapshots
            LIMIT 2
        """
    _inventory_snapshots = pl.read_database(
        query=_query,
        connection=connection,
    )
    _inventory_snapshots
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM locations
            LIMIT 2
        """
    _locations = pl.read_database(
        query=_query,
        connection=connection,
    )
    _locations
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM order_items
            LIMIT 2
        """
    _order_items = pl.read_database(
        query=_query,
        connection=connection,
    )
    _order_items
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM orders
            LIMIT 2
        """
    _customers = pl.read_database(
        query=_query,
        connection=connection,
    )
    _customers
    return


@app.cell
def _(connection, pl):
    _query = """
            SELECT *
            FROM payments
            LIMIT 2
        """
    _payments = pl.read_database(
        query=_query,
        connection=connection,
    )
    _payments
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Illustrate Core Language Syntax
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    SELECT, FROM
        WHERE
        GROUP BY
        HAVING
        Aggregation
        Joins - INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, LATERAL JOIN
        DISTINCT
        OFFSET
        WINDOW FUNCTIONS - ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE(), SUM() OVER(), AVG() OVER)()
        Subqueries
        CTEs
        Recursive CTEs
        In Postgres, filter a window result with a subquery to "QUALIFY"
        Set Operations
        Conditional and Null Handling
        Type conversion
        Dates and times
        Text, arrays, and JSON
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Query Composition and Recursion
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Permissions
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    * Permissions
       * Table and Row Locking
       * PostgreSQL utility syntax
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Other Table Transformations - (Un)Pivot
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    *(Un)Pivot
        * Pivot: rows into columns
           * Preferredd: conditional aggregation
           * crosstab()
        * Unpivot: coluns into rows
           * Preferred: CROSS JOINT LATERAL with VALUES
           * Unpivot with UNION ALL
           * Dynamic unpivot with JSONB
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Query Plans and Performance
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    Query Plans and Performance
       * EXPLAIN
       * EXPLAIN ANALYZE
       * VACUUM
       * VACUUM (ANALYZE)
       * REINDEX TABLE
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Omnichannel Ecommerce SQL Challenge
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Good interview questions using this database

    1. Find the latest order for every customer.
    2. Calculate monthly revenue and month-over-month growth.
    3. Find customers who ordered in January but not February.
    4. Calculate seven-day rolling revenue.
    5. Find the three best-selling products in each category.
    6. Identify customers whose spending exceeds their country’s average.
    7. Calculate conversion from `product_view` to `purchase`.
    8. Deduplicate events received more than once.
    9. Find orders where payments do not equal the order total.
    10. Calculate median delivery time by carrier.
    11. Build a customer cohort-retention table.
    12. Incrementally update daily product sales.
    13. Traverse each product’s complete category path.
    14. Detect products that were out of stock for three consecutive days.
    15. Pivot monthly revenue into one column per sales channel.

    This model is broad enough to demonstrate nearly all practical PostgreSQL syntax while remaining coherent and believable.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    No. The 15 questions test most high-value **analytical query syntax**, but not all PostgreSQL concepts previously listed.

    ### Coverage of the current questions

    | Concept | Coverage | Questions |
    |---|---:|---|
    | Basic filtering, sorting, joins | Strong | 1–15 |
    | Aggregation and `HAVING` | Strong | 2, 5, 9, 10 |
    | Window functions | Strong | 1, 2, 4, 5, 10, 14 |
    | CTEs and subqueries | Strong | Several |
    | Set operations | Explicit | 3 |
    | Dates and intervals | Strong | 2, 4, 10, 11, 14 |
    | Conditional aggregation | Strong | 7, 11, 15 |
    | Pivot | Explicit | 15 |
    | Recursive CTEs | Explicit | 13 |
    | Incremental upsert | Explicit | 12 |
    | Event deduplication | Explicit | 8 |
    | Cohort and funnel analysis | Strong | 7, 11 |
    | Null handling | Implicit | Several |
    | JSONB | Not explicit | — |
    | Arrays | Not covered | — |
    | Unpivot | Not covered | — |
    | `LATERAL` joins | Not explicit | — |
    | DDL and constraints | Not covered | — |
    | `INSERT`, `UPDATE`, `DELETE` | Mostly not covered | — |
    | `MERGE` | Not covered | — |
    | Transactions and locking | Not covered | — |
    | Views/materialized views | Not covered | — |
    | Indexes and query plans | Not covered | — |
    | Bulk loading with `COPY` | Not covered | — |
    | Permissions and maintenance | Not covered | — |

    They are an excellent **data analyst SQL set**, a good start for **data science**, but incomplete for a **data engineer or PostgreSQL-focused role**.

    ### Questions to add

    #### Advanced querying

    16. Extract device, campaign, experiment name, and experiment variant from the event `properties` JSONB column.

    17. Find all products tagged both `"wireless"` and `"premium"` using PostgreSQL array operators.

    18. For each customer, use a `LATERAL` join to return their most recent completed order.

    19. Convert `staging.quarterly_targets` from `q1_target`–`q4_target` columns into quarter rows.

    20. Produce subtotals by country and category, country totals, category totals, and a grand total using `GROUPING SETS`.

    21. Generate a complete calendar and report revenue for every day, including days with no orders, using `generate_series()`.

    22. Find gaps between consecutive customer orders using `LAG()` and calculate the median gap with `PERCENTILE_CONT()`.

    #### Data quality and transformation

    23. Standardize email addresses, convert blank strings to `NULL`, safely avoid division by zero, and classify invalid records.

    24. Reconcile internal payments with provider transactions using a `FULL OUTER JOIN`, returning missing and mismatched records.

    25. Combine web and store order feeds with `UNION ALL`, identify duplicate source records, and produce one canonical record.

    26. Validate that every completed order has at least one successful payment using `EXISTS` or `NOT EXISTS`.

    #### Data manipulation

    27. Insert a customer, order, and order items atomically. Roll back everything if any item fails.

    28. Upsert daily product sales with `INSERT ... ON CONFLICT`, updating existing date-product combinations.

    29. Synchronize incoming product records with `core.products` using `MERGE`.

    30. Update overdue shipments from a carrier staging table using `UPDATE ... FROM`.

    31. Delete duplicate staging events while retaining the earliest received row, using a CTE and `ROW_NUMBER()`.

    32. Delete old events and return the deleted IDs using `DELETE ... RETURNING`.

    #### Database design

    33. Create the orders and order-items tables with primary keys, foreign keys, defaults, `NOT NULL`, unique constraints, and `CHECK` constraints.

    34. Alter a large table to add a new nullable column safely, backfill it, and then enforce `NOT NULL`.

    35. Create a temporary table from a query using `CREATE TEMP TABLE ... AS`.

    36. Create a reusable view for order totals and a materialized view for monthly category sales.

    37. Refresh the materialized view concurrently and explain its unique-index requirement.

    #### Performance

    38. Given a slow query filtering by `customer_id` and sorting by `order_at DESC`, design the appropriate multicolumn index.

    39. Create a partial index for pending orders and a GIN index for event JSONB properties.

    40. Interpret an `EXPLAIN (ANALYZE, BUFFERS)` plan and identify sequential scans, inaccurate estimates, expensive sorts, and nested-loop problems.

    41. Explain why wrapping an indexed timestamp in a function may prevent efficient index use, then rewrite the filter.

    42. Compare a CTE declared `MATERIALIZED` with one declared `NOT MATERIALIZED`.

    ### Concurrency and operations

    43. Implement a worker that safely claims pending shipments using:

    ```sql
    FOR UPDATE SKIP LOCKED
    ```

    44. Demonstrate a transaction with a savepoint and roll back only one failed processing step.

    45. Explain and demonstrate `READ COMMITTED`, `REPEATABLE READ`, and `SERIALIZABLE` behavior.

    46. Bulk-load CSV orders into a staging table with `COPY`, validate them, and insert valid rows into core tables.

    47. Grant analysts read access to the analytics schema while preventing modifications; configure default privileges for future tables.

    48. Explain when to use `VACUUM`, `ANALYZE`, `REINDEX`, and `VACUUM ANALYZE`.

    ### Best practical organization

    A complete interview-prep set should have three tracks:

    | Track | Focus | Most relevant questions |
    |---|---|---|
    | Data analyst | Joins, aggregation, windows, dates, business metrics | 1–15, 19–22 |
    | Data scientist | Cohorts, funnels, feature construction, distributions | 2, 4, 7, 10, 11, 21–23 |
    | Data engineer | DML, DDL, pipelines, performance, transactions | 23–48 |

    Together, the original 15 plus these additions cover the major PostgreSQL syntax and working concepts relevant to those jobs. They still would not cover literally every PostgreSQL feature—such as stored procedures, triggers, partition administration, replication, extensions, and custom types—but they cover the practical interview core.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    No. The 15 questions test most high-value **analytical query syntax**, but not all PostgreSQL concepts previously listed.

    ### Coverage of the current questions

    | Concept | Coverage | Questions |
    |---|---:|---|
    | Basic filtering, sorting, joins | Strong | 1–15 |
    | Aggregation and `HAVING` | Strong | 2, 5, 9, 10 |
    | Window functions | Strong | 1, 2, 4, 5, 10, 14 |
    | CTEs and subqueries | Strong | Several |
    | Set operations | Explicit | 3 |
    | Dates and intervals | Strong | 2, 4, 10, 11, 14 |
    | Conditional aggregation | Strong | 7, 11, 15 |
    | Pivot | Explicit | 15 |
    | Recursive CTEs | Explicit | 13 |
    | Incremental upsert | Explicit | 12 |
    | Event deduplication | Explicit | 8 |
    | Cohort and funnel analysis | Strong | 7, 11 |
    | Null handling | Implicit | Several |
    | JSONB | Not explicit | — |
    | Arrays | Not covered | — |
    | Unpivot | Not covered | — |
    | `LATERAL` joins | Not explicit | — |
    | DDL and constraints | Not covered | — |
    | `INSERT`, `UPDATE`, `DELETE` | Mostly not covered | — |
    | `MERGE` | Not covered | — |
    | Transactions and locking | Not covered | — |
    | Views/materialized views | Not covered | — |
    | Indexes and query plans | Not covered | — |
    | Bulk loading with `COPY` | Not covered | — |
    | Permissions and maintenance | Not covered | — |

    They are an excellent **data analyst SQL set**, a good start for **data science**, but incomplete for a **data engineer or PostgreSQL-focused role**.

    ### Questions to add

    #### Advanced querying

    16. Extract device, campaign, experiment name, and experiment variant from the event `properties` JSONB column.

    17. Find all products tagged both `"wireless"` and `"premium"` using PostgreSQL array operators.

    18. For each customer, use a `LATERAL` join to return their most recent completed order.

    19. Convert `staging.quarterly_targets` from `q1_target`–`q4_target` columns into quarter rows.

    20. Produce subtotals by country and category, country totals, category totals, and a grand total using `GROUPING SETS`.

    21. Generate a complete calendar and report revenue for every day, including days with no orders, using `generate_series()`.

    22. Find gaps between consecutive customer orders using `LAG()` and calculate the median gap with `PERCENTILE_CONT()`.

    #### Data quality and transformation

    23. Standardize email addresses, convert blank strings to `NULL`, safely avoid division by zero, and classify invalid records.

    24. Reconcile internal payments with provider transactions using a `FULL OUTER JOIN`, returning missing and mismatched records.

    25. Combine web and store order feeds with `UNION ALL`, identify duplicate source records, and produce one canonical record.

    26. Validate that every completed order has at least one successful payment using `EXISTS` or `NOT EXISTS`.

    #### Data manipulation

    27. Insert a customer, order, and order items atomically. Roll back everything if any item fails.

    28. Upsert daily product sales with `INSERT ... ON CONFLICT`, updating existing date-product combinations.

    29. Synchronize incoming product records with `core.products` using `MERGE`.

    30. Update overdue shipments from a carrier staging table using `UPDATE ... FROM`.

    31. Delete duplicate staging events while retaining the earliest received row, using a CTE and `ROW_NUMBER()`.

    32. Delete old events and return the deleted IDs using `DELETE ... RETURNING`.

    #### Database design

    33. Create the orders and order-items tables with primary keys, foreign keys, defaults, `NOT NULL`, unique constraints, and `CHECK` constraints.

    34. Alter a large table to add a new nullable column safely, backfill it, and then enforce `NOT NULL`.

    35. Create a temporary table from a query using `CREATE TEMP TABLE ... AS`.

    36. Create a reusable view for order totals and a materialized view for monthly category sales.

    37. Refresh the materialized view concurrently and explain its unique-index requirement.

    #### Performance

    38. Given a slow query filtering by `customer_id` and sorting by `order_at DESC`, design the appropriate multicolumn index.

    39. Create a partial index for pending orders and a GIN index for event JSONB properties.

    40. Interpret an `EXPLAIN (ANALYZE, BUFFERS)` plan and identify sequential scans, inaccurate estimates, expensive sorts, and nested-loop problems.

    41. Explain why wrapping an indexed timestamp in a function may prevent efficient index use, then rewrite the filter.

    42. Compare a CTE declared `MATERIALIZED` with one declared `NOT MATERIALIZED`.

    ### Concurrency and operations

    43. Implement a worker that safely claims pending shipments using:

    ```sql
    FOR UPDATE SKIP LOCKED
    ```

    44. Demonstrate a transaction with a savepoint and roll back only one failed processing step.

    45. Explain and demonstrate `READ COMMITTED`, `REPEATABLE READ`, and `SERIALIZABLE` behavior.

    46. Bulk-load CSV orders into a staging table with `COPY`, validate them, and insert valid rows into core tables.

    47. Grant analysts read access to the analytics schema while preventing modifications; configure default privileges for future tables.

    48. Explain when to use `VACUUM`, `ANALYZE`, `REINDEX`, and `VACUUM ANALYZE`.

    ### Best practical organization

    A complete interview-prep set should have three tracks:

    | Track | Focus | Most relevant questions |
    |---|---|---|
    | Data analyst | Joins, aggregation, windows, dates, business metrics | 1–15, 19–22 |
    | Data scientist | Cohorts, funnels, feature construction, distributions | 2, 4, 7, 10, 11, 21–23 |
    | Data engineer | DML, DDL, pipelines, performance, transactions | 23–48 |

    Together, the original 15 plus these additions cover the major PostgreSQL syntax and working concepts relevant to those jobs. They still would not cover literally every PostgreSQL feature—such as stored procedures, triggers, partition administration, replication, extensions, and custom types—but they cover the practical interview core.
    """)
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # SQL Real World Interview Problem Set
    """)
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
