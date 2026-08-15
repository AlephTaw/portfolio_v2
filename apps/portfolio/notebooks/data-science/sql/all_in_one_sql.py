# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "marimo[sql]>=0.23.16",
#     "mlphd-bootcamp",
#     "polars>=1.43.2",
# ]
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


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ```sql
    CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        first_name TEXT NOT NULL CHECK (length(trim(first_name)) > 0),
        last_name TEXT NOT NULL CHECK (length(trim(last_name)) > 0),
        country_code TEXT NOT NULL CHECK (
            country_code IN ('US', 'CA', 'GB', 'DE', 'FR', 'AU', 'MX', 'JP')
        ),
        acquisition_channel TEXT NOT NULL CHECK (
            acquisition_channel IN (
                'organic', 'paid_search', 'social', 'referral', 'email',
                'affiliate', 'store', 'marketplace'
            )
        ),
        signup_at TEXT NOT NULL CHECK (
            signup_at = strftime('%Y-%m-%dT%H:%M:%SZ', signup_at)
        ),
        birth_date TEXT CHECK (
            birth_date IS NULL
            OR (
                birth_date = date(birth_date)
                AND date(birth_date) < date(signup_at)
            )
        ),
        status TEXT NOT NULL DEFAULT 'active' CHECK (
            status IN ('active', 'inactive', 'suspended', 'deleted')
        ),
        marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (
            marketing_opt_in IN (0, 1)
        ),
        attributes TEXT NOT NULL DEFAULT '{}' CHECK (
            json_valid(attributes) AND json_type(attributes) = 'object'
        ),
        CHECK (length(trim(email)) > 3 AND instr(email, '@') > 1)
    );
    ```
    """)
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
    ## SQL Real World Interview Problem Set

    Work through 35 screenshot-derived interview questions. Each SQL problem runs against
    its own isolated tables inside one browser-local SQLite database. Equivalent queries are
    accepted by comparing results rather than query text. Conceptual answers are checked for
    the essential ideas while allowing your own wording.
    """)
    return


@app.cell(hide_code=True)
def _():
    from mlphd_bootcamp import assertion, open_seed_database

    sql_problem_connection = open_seed_database(
        "sql_problem_bank.sqlite",
        seed_url="/bootcamp/data/sql_problem_bank.sqlite",
        local_seed="database/sql_problem_bank.sqlite",
    )
    return assertion, sql_problem_connection


@app.cell(hide_code=True)
def _(assertion, mo, sql_problem_connection):
    import json
    import re

    def _question_record(question_id):
        return sql_problem_connection.execute(
            """
            SELECT source_number, company, title, question, answer, answer_type,
                   checker_spec, notes
            FROM questions
            WHERE question_id = ?
            """,
            (question_id,),
        ).fetchone()

    def _table_mappings(question_id):
        return sql_problem_connection.execute(
            """
            SELECT logical_name, physical_name
            FROM question_tables
            WHERE question_id = ?
            ORDER BY ordinal
            """,
            (question_id,),
        ).fetchall()

    def _scoped_sql(question_id, source):
        scoped = source
        for logical_name, physical_name in sorted(
            _table_mappings(question_id), key=lambda row: -len(row[0])
        ):
            scoped = re.sub(
                rf"(?<![\w]){re.escape(logical_name)}(?![\w])",
                f'"{physical_name}"',
                scoped,
                flags=re.IGNORECASE,
            )
        return scoped

    def _markdown_cell(value):
        if value is None:
            return "*NULL*"
        return str(value).replace("|", "\\|").replace("\n", " ")

    def _schema_markdown(question_id):
        tables = _table_mappings(question_id)
        if not tables:
            return "_No database tables are required for this conceptual question._"

        sections = [
            "*The italic first row shows declared SQL types; subsequent rows are sample data.*"
        ]
        for logical_name, physical_name in tables:
            columns = sql_problem_connection.execute(
                """
                SELECT column_name, declared_type
                FROM question_columns
                WHERE question_id = ? AND logical_table = ?
                ORDER BY ordinal
                """,
                (question_id, logical_name),
            ).fetchall()
            preview = sql_problem_connection.execute(
                f'SELECT * FROM "{physical_name}" LIMIT 5'
            ).fetchall()
            header = "| " + " | ".join(name for name, _kind in columns) + " |"
            separator = "| " + " | ".join("---" for _column in columns) + " |"
            types = "| " + " | ".join(f"*{kind}*" for _name, kind in columns) + " |"
            sample_rows = [
                "| " + " | ".join(_markdown_cell(value) for value in row) + " |"
                for row in preview
            ]
            sections.append(
                "\n".join(
                    [f"#### `{logical_name}`", header, separator, types, *sample_rows]
                )
            )
        return "\n\n".join(sections)

    class _AnswerDisclosure:
        value = False

        def __init__(self, question_id):
            self.ui = mo.accordion(
                {"Reveal reference answer": _revealed_answer(question_id)}
            )

    def make_sql_problem(question_id):
        source_number, company, title, question, _answer, answer_type, _spec, notes = (
            _question_record(question_id)
        )
        description_text = (
            f"## {question_id.upper()} · {company}: {title}\n\n"
            f"**Exercise:** {question}\n\n"
            f"{_schema_markdown(question_id)}"
        )
        if notes:
            description_text += f"\n\n**Implementation note:** {notes}"
        description = mo.md(description_text)
        if answer_type == "sql":
            editor = mo.ui.code_editor(
                value="SELECT\n  -- write your query here",
                language="sql",
                label=f"{question_id.upper()} SQL answer",
                min_height=180,
            )
        else:
            editor = mo.ui.text_area(
                value="",
                label=f"{question_id.upper()} written answer",
                full_width=True,
                rows=7,
            )
        submission = editor.form(
            submit_button_label="Submit answer",
            clear_on_submit=False,
            bordered=False,
        )
        reveal = _AnswerDisclosure(question_id)
        return mo.vstack([description, submission, reveal.ui], gap=1), submission, reveal

    def _normalize(value):
        if isinstance(value, float):
            return round(value, 8)
        return value

    def _execute_checked_sql(question_id, source):
        if not isinstance(source, str) or not source.strip():
            raise AssertionError("Enter a query before submitting.")
        cleaned = re.sub(r"--[^\n]*|/\*.*?\*/", " ", source, flags=re.DOTALL).strip()
        if not re.match(r"^(SELECT|WITH)\b", cleaned, flags=re.IGNORECASE):
            raise AssertionError("Submit one read-only SELECT or WITH query.")
        if re.search(
            r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM)\b",
            cleaned,
            flags=re.IGNORECASE,
        ):
            raise AssertionError("This exercise accepts read-only queries only.")

        _source_number, _company, _title, _question, answer, _kind, _spec, _notes = (
            _question_record(question_id)
        )
        expected_cursor = sql_problem_connection.execute(_scoped_sql(question_id, answer))
        submitted_cursor = sql_problem_connection.execute(_scoped_sql(question_id, source))
        submitted_column_names = [
            description[0] for description in (submitted_cursor.description or ())
        ]
        expected_rows = [
            tuple(_normalize(value) for value in row) for row in expected_cursor.fetchall()
        ]
        submitted_output_rows = submitted_cursor.fetchall()
        submitted_rows = [
            tuple(_normalize(value) for value in row) for row in submitted_output_rows
        ]
        return {
            "expected_columns": len(expected_cursor.description or ()),
            "submitted_columns": len(submitted_cursor.description or ()),
            "submitted_column_names": submitted_column_names,
            "submitted_output_rows": submitted_output_rows,
            "expected_rows": expected_rows,
            "submitted_rows": submitted_rows,
        }

    def _assert_sql_result(result):
        if result["submitted_columns"] != result["expected_columns"]:
            raise AssertionError(
                f"Expected {result['expected_columns']} output columns; "
                f"received {result['submitted_columns']}."
            )
        if result["submitted_rows"] != result["expected_rows"]:
            raise AssertionError(
                "Result differs from the reference. "
                f"Received {result['submitted_rows'][:8]}."
            )

    def _execute_checked_text(question_id, source):
        if not isinstance(source, str) or len(source.strip()) < 30:
            raise AssertionError(
                "Give a concise explanation of at least 30 characters."
            )
        checker_spec = json.loads(_question_record(question_id)[6])
        normalized = source.casefold()
        missing = [
            alternatives
            for alternatives in checker_spec
            if not any(term.casefold() in normalized for term in alternatives)
        ]
        return missing

    def _assert_text_result(missing):
        if missing:
            raise AssertionError(
                "Address these missing ideas: "
                + "; ".join(" / ".join(group) for group in missing)
                + "."
            )

    def _query_output(result=None, error=None):
        if error is not None:
            safe_error = str(error).replace("```", "''' ")
            return mo.md(
                "### Query error\n\n"
                f"```text\n{type(error).__name__}: {safe_error}\n```"
            )

        columns = result["submitted_column_names"]
        rows = result["submitted_output_rows"]
        row_label = "row" if len(rows) == 1 else "rows"
        if not columns:
            return mo.md(f"### Query output\n\n_Query returned {len(rows)} {row_label}._")

        header = "| " + " | ".join(_markdown_cell(column) for column in columns) + " |"
        separator = "| " + " | ".join("---" for _column in columns) + " |"
        rendered_rows = [
            "| " + " | ".join(_markdown_cell(value) for value in row) + " |"
            for row in rows
        ]
        table = "\n".join([header, separator, *rendered_rows])
        return mo.md(
            f"### Query output\n\n**{len(rows)} {row_label}**\n\n{table}"
        )

    def _revealed_answer(question_id):
        _source_number, _company, _title, _question, answer, answer_type, _spec, _notes = (
            _question_record(question_id)
        )
        if answer_type == "sql":
            return mo.md(f"```sql\n{answer}\n```")
        return mo.md(answer)

    def grade_sql_problem(question_id, source, reveal_answer):
        outputs = []
        if source is None:
            outputs.append(
                mo.callout(
                    "Write your answer, then select **Submit answer**.",
                    kind="neutral",
                )
            )
        else:
            answer_type = _question_record(question_id)[5]
            if answer_type == "sql":
                execution = {}

                @assertion(_assert_sql_result)
                def _submission(submitted_source):
                    try:
                        result = _execute_checked_sql(question_id, submitted_source)
                    except Exception as error:
                        execution["error"] = error
                        raise
                    execution["result"] = result
                    return result

                outputs.append(_submission(source))
                outputs.append(
                    _query_output(
                        result=execution.get("result"),
                        error=execution.get("error"),
                    )
                )
            else:
                @assertion(_assert_text_result)
                def _submission(submitted_source):
                    return _execute_checked_text(question_id, submitted_source)

                outputs.append(_submission(source))

        if reveal_answer:
            outputs.append(_revealed_answer(question_id))
        return mo.vstack(outputs, gap=1)

    return grade_sql_problem, make_sql_problem


@app.cell
def _(make_sql_problem):
    _q01_problem, q01_form, q01_reveal = make_sql_problem("q01")
    _q01_problem
    return q01_form, q01_reveal


@app.cell
def _(grade_sql_problem, q01_form, q01_reveal):
    grade_sql_problem("q01", q01_form.value, q01_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q02_problem, q02_form, q02_reveal = make_sql_problem("q02")
    _q02_problem
    return q02_form, q02_reveal


@app.cell
def _(grade_sql_problem, q02_form, q02_reveal):
    grade_sql_problem("q02", q02_form.value, q02_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q03_problem, q03_form, q03_reveal = make_sql_problem("q03")
    _q03_problem
    return q03_form, q03_reveal


@app.cell
def _(grade_sql_problem, q03_form, q03_reveal):
    grade_sql_problem("q03", q03_form.value, q03_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q04_problem, q04_form, q04_reveal = make_sql_problem("q04")
    _q04_problem
    return q04_form, q04_reveal


@app.cell
def _(grade_sql_problem, q04_form, q04_reveal):
    grade_sql_problem("q04", q04_form.value, q04_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q05_problem, q05_form, q05_reveal = make_sql_problem("q05")
    _q05_problem
    return q05_form, q05_reveal


@app.cell
def _(grade_sql_problem, q05_form, q05_reveal):
    grade_sql_problem("q05", q05_form.value, q05_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q06_problem, q06_form, q06_reveal = make_sql_problem("q06")
    _q06_problem
    return q06_form, q06_reveal


@app.cell
def _(grade_sql_problem, q06_form, q06_reveal):
    grade_sql_problem("q06", q06_form.value, q06_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q07_problem, q07_form, q07_reveal = make_sql_problem("q07")
    _q07_problem
    return q07_form, q07_reveal


@app.cell
def _(grade_sql_problem, q07_form, q07_reveal):
    grade_sql_problem("q07", q07_form.value, q07_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q08_problem, q08_form, q08_reveal = make_sql_problem("q08")
    _q08_problem
    return q08_form, q08_reveal


@app.cell
def _(grade_sql_problem, q08_form, q08_reveal):
    grade_sql_problem("q08", q08_form.value, q08_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q09_problem, q09_form, q09_reveal = make_sql_problem("q09")
    _q09_problem
    return q09_form, q09_reveal


@app.cell
def _(grade_sql_problem, q09_form, q09_reveal):
    grade_sql_problem("q09", q09_form.value, q09_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q10_problem, q10_form, q10_reveal = make_sql_problem("q10")
    _q10_problem
    return q10_form, q10_reveal


@app.cell
def _(grade_sql_problem, q10_form, q10_reveal):
    grade_sql_problem("q10", q10_form.value, q10_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q11_problem, q11_form, q11_reveal = make_sql_problem("q11")
    _q11_problem
    return q11_form, q11_reveal


@app.cell
def _(grade_sql_problem, q11_form, q11_reveal):
    grade_sql_problem("q11", q11_form.value, q11_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q12_problem, q12_form, q12_reveal = make_sql_problem("q12")
    _q12_problem
    return q12_form, q12_reveal


@app.cell
def _(grade_sql_problem, q12_form, q12_reveal):
    grade_sql_problem("q12", q12_form.value, q12_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q13_problem, q13_form, q13_reveal = make_sql_problem("q13")
    _q13_problem
    return q13_form, q13_reveal


@app.cell
def _(grade_sql_problem, q13_form, q13_reveal):
    grade_sql_problem("q13", q13_form.value, q13_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q14_problem, q14_form, q14_reveal = make_sql_problem("q14")
    _q14_problem
    return q14_form, q14_reveal


@app.cell
def _(grade_sql_problem, q14_form, q14_reveal):
    grade_sql_problem("q14", q14_form.value, q14_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q15_problem, q15_form, q15_reveal = make_sql_problem("q15")
    _q15_problem
    return q15_form, q15_reveal


@app.cell
def _(grade_sql_problem, q15_form, q15_reveal):
    grade_sql_problem("q15", q15_form.value, q15_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q16_problem, q16_form, q16_reveal = make_sql_problem("q16")
    _q16_problem
    return q16_form, q16_reveal


@app.cell
def _(grade_sql_problem, q16_form, q16_reveal):
    grade_sql_problem("q16", q16_form.value, q16_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q17_problem, q17_form, q17_reveal = make_sql_problem("q17")
    _q17_problem
    return q17_form, q17_reveal


@app.cell
def _(grade_sql_problem, q17_form, q17_reveal):
    grade_sql_problem("q17", q17_form.value, q17_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q18_problem, q18_form, q18_reveal = make_sql_problem("q18")
    _q18_problem
    return q18_form, q18_reveal


@app.cell
def _(grade_sql_problem, q18_form, q18_reveal):
    grade_sql_problem("q18", q18_form.value, q18_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q19_problem, q19_form, q19_reveal = make_sql_problem("q19")
    _q19_problem
    return q19_form, q19_reveal


@app.cell
def _(grade_sql_problem, q19_form, q19_reveal):
    grade_sql_problem("q19", q19_form.value, q19_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q20_problem, q20_form, q20_reveal = make_sql_problem("q20")
    _q20_problem
    return q20_form, q20_reveal


@app.cell
def _(grade_sql_problem, q20_form, q20_reveal):
    grade_sql_problem("q20", q20_form.value, q20_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q21_problem, q21_form, q21_reveal = make_sql_problem("q21")
    _q21_problem
    return q21_form, q21_reveal


@app.cell
def _(grade_sql_problem, q21_form, q21_reveal):
    grade_sql_problem("q21", q21_form.value, q21_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q22_problem, q22_form, q22_reveal = make_sql_problem("q22")
    _q22_problem
    return q22_form, q22_reveal


@app.cell
def _(grade_sql_problem, q22_form, q22_reveal):
    grade_sql_problem("q22", q22_form.value, q22_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q23_problem, q23_form, q23_reveal = make_sql_problem("q23")
    _q23_problem
    return q23_form, q23_reveal


@app.cell
def _(grade_sql_problem, q23_form, q23_reveal):
    grade_sql_problem("q23", q23_form.value, q23_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q24_problem, q24_form, q24_reveal = make_sql_problem("q24")
    _q24_problem
    return q24_form, q24_reveal


@app.cell
def _(grade_sql_problem, q24_form, q24_reveal):
    grade_sql_problem("q24", q24_form.value, q24_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q25_problem, q25_form, q25_reveal = make_sql_problem("q25")
    _q25_problem
    return q25_form, q25_reveal


@app.cell
def _(grade_sql_problem, q25_form, q25_reveal):
    grade_sql_problem("q25", q25_form.value, q25_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q26_problem, q26_form, q26_reveal = make_sql_problem("q26")
    _q26_problem
    return q26_form, q26_reveal


@app.cell
def _(grade_sql_problem, q26_form, q26_reveal):
    grade_sql_problem("q26", q26_form.value, q26_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q27_problem, q27_form, q27_reveal = make_sql_problem("q27")
    _q27_problem
    return q27_form, q27_reveal


@app.cell
def _(grade_sql_problem, q27_form, q27_reveal):
    grade_sql_problem("q27", q27_form.value, q27_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q28_problem, q28_form, q28_reveal = make_sql_problem("q28")
    _q28_problem
    return q28_form, q28_reveal


@app.cell
def _(grade_sql_problem, q28_form, q28_reveal):
    grade_sql_problem("q28", q28_form.value, q28_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q29_problem, q29_form, q29_reveal = make_sql_problem("q29")
    _q29_problem
    return q29_form, q29_reveal


@app.cell
def _(grade_sql_problem, q29_form, q29_reveal):
    grade_sql_problem("q29", q29_form.value, q29_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q30_problem, q30_form, q30_reveal = make_sql_problem("q30")
    _q30_problem
    return q30_form, q30_reveal


@app.cell
def _(grade_sql_problem, q30_form, q30_reveal):
    grade_sql_problem("q30", q30_form.value, q30_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q31_problem, q31_form, q31_reveal = make_sql_problem("q31")
    _q31_problem
    return q31_form, q31_reveal


@app.cell
def _(grade_sql_problem, q31_form, q31_reveal):
    grade_sql_problem("q31", q31_form.value, q31_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q32_problem, q32_form, q32_reveal = make_sql_problem("q32")
    _q32_problem
    return q32_form, q32_reveal


@app.cell
def _(grade_sql_problem, q32_form, q32_reveal):
    grade_sql_problem("q32", q32_form.value, q32_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q33_problem, q33_form, q33_reveal = make_sql_problem("q33")
    _q33_problem
    return q33_form, q33_reveal


@app.cell
def _(grade_sql_problem, q33_form, q33_reveal):
    grade_sql_problem("q33", q33_form.value, q33_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q34_problem, q34_form, q34_reveal = make_sql_problem("q34")
    _q34_problem
    return q34_form, q34_reveal


@app.cell
def _(grade_sql_problem, q34_form, q34_reveal):
    grade_sql_problem("q34", q34_form.value, q34_reveal.value)
    return


@app.cell
def _(make_sql_problem):
    _q35_problem, q35_form, q35_reveal = make_sql_problem("q35")
    _q35_problem
    return q35_form, q35_reveal


@app.cell
def _(grade_sql_problem, q35_form, q35_reveal):
    grade_sql_problem("q35", q35_form.value, q35_reveal.value)
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


if __name__ == "__main__":
    app.run()
