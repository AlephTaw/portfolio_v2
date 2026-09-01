import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import pandas as pd

    return mo, pd


@app.cell(hide_code=True)
def _(mo):
    import sqlite3

    # Initialize an in-memory SQLite database connection with localized variable naming
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    cursor = conn.cursor()

    # 1. Create a comprehensive Sales and Employee table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS store_sales (
        sale_id INTEGER PRIMARY KEY,
        product_id TEXT,
        category TEXT,
        region TEXT,
        department TEXT,
        user_id TEXT,
        employee_name TEXT,
        salary INTEGER,
        amount REAL,
        price REAL,
        score INTEGER,
        sale_date TEXT,
        created_at TEXT
    );
    """)

    # 2. Create a specialized Ticker and Logs table (for Lag/Lead and Status changes)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        log_id INTEGER PRIMARY KEY,
        ticket_id TEXT,
        user_id TEXT,
        event TEXT,
        status TEXT,
        closing_price REAL,
        trade_date TEXT,
        timestamp TEXT,
        updated_at TEXT
    );
    """)

    # Populate store_sales with realistic data for running metrics, partitions, and ranks
    _sales_data = [
        (1, 'P100', 'Electronics', 'North', 'Sales', 'U1', 'Alice', 75000, 1500.0, 1500.0, 95, '2026-01-01', '2026-01-01 10:00:00'),
        (2, 'P101', 'Electronics', 'North', 'Sales', 'U2', 'Bob', 62000, 800.0, 800.0, 88, '2026-01-02', '2026-01-02 11:30:00'),
        (3, 'P100', 'Electronics', 'South', 'Sales', 'U1', 'Charlie', 62000, 1500.0, 1500.0, 91, '2026-01-02', '2026-01-02 14:15:00'),
        (4, 'P102', 'Furniture', 'South', 'HR', 'U3', 'David', 55000, 300.0, 300.0, 74, '2026-01-03', '2026-01-03 09:00:00'),
        (5, 'P103', 'Furniture', 'North', 'HR', 'U4', 'Eva', 68000, 1200.0, 1200.0, 85, '2026-01-04', '2026-01-04 16:45:00'),
        (6, 'P101', 'Electronics', 'South', 'Engineering', 'U2', 'Frank', 90000, 800.0, 800.0, 99, '2026-01-05', '2026-01-05 13:00:00'),
    ]

    cursor.executemany("""
    INSERT INTO store_sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, _sales_data)

    # Populate activity_logs for time-series operations (Lag, Lead, Last_Value)
    _log_data = [
        (1, 'T-801', 'U1', 'login', 'Open', 150.25, '2026-01-01', '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
        (2, 'T-801', 'U1', 'view_item', 'In Progress', 152.10, '2026-01-02', '2026-01-02 10:15:00', '2026-01-02 10:15:00'),
        (3, 'T-801', 'U1', 'checkout', 'Resolved', 149.80, '2026-01-03', '2026-01-03 11:00:00', '2026-01-03 11:00:00'),
        (4, 'T-802', 'U2', 'login', 'Open', 153.40, '2026-01-04', '2026-01-04 09:30:00', '2026-01-04 09:30:00'),
        (5, 'T-802', 'U2', 'purchase', 'Resolved', 155.00, '2026-01-05', '2026-01-05 15:20:00', '2026-01-05 15:20:00'),
    ]

    cursor.executemany("""
    INSERT INTO activity_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, _log_data)

    conn.commit()

    mo.md("### 📊 Database Initialized Successfully with Reactive Safe Globals!")
    return (conn,)


@app.cell
def _(conn, mo, pd):
    # Example: Testing the "Running Sum" and "Moving Average" patterns
    query = """
    SELECT
        *
    FROM store_sales;
    """

    df = pd.read_sql_query(query, conn)

    # Render the interactive dataframe table inside your marimo notebook
    mo.ui.table(df)
    return


@app.cell
def _(mo):

    # Dictionary mapping descriptive titles to executable window function queries
    window_queries = {
        "1. Running Sum": """
            SELECT sale_date, category, amount,
                   SUM(amount) OVER (ORDER BY sale_date) as running_sum
            FROM store_sales;""",
        "2. Windowed Sum": """
            SELECT region, category, amount,
                   SUM(amount) OVER (PARTITION BY region) as region_total_sum
            FROM store_sales;""",
        "3. Running Average": """
            SELECT sale_date, amount,
                   AVG(amount) OVER (ORDER BY sale_date) as running_avg
            FROM store_sales;""",
        "4. Moving Average (3-Day trailing)": """
            SELECT sale_date, amount,
                   AVG(amount) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as trailing_3day_avg
            FROM store_sales;""",
        "5. Windowed Average": """
            SELECT department, employee_name, salary,
                   AVG(salary) OVER (PARTITION BY department) as dept_avg_salary
            FROM store_sales;""",
        "6. Window Ranked": """
            SELECT department, employee_name, salary,
                   RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_salary_rank
            FROM store_sales;""",
        "7. Dense Ranked": """
            SELECT employee_name, salary,
                   DENSE_RANK() OVER (ORDER BY salary DESC) as overall_dense_rank
            FROM store_sales;""",
        "8. Row Numbering": """
            SELECT created_at, employee_name, category,
                   ROW_NUMBER() OVER (ORDER BY created_at) as sequential_row_id
            FROM store_sales;""",
        "9. Running Max": """
            SELECT sale_date, score,
                   MAX(score) OVER (ORDER BY sale_date) as running_max_score
            FROM store_sales;""",
        "10. Windowed Max": """
            SELECT category, product_id, score,
                   MAX(score) OVER (PARTITION BY category) as category_max_score
            FROM store_sales;""",
        "11. Running Min": """
            SELECT sale_date, price,
                   MIN(price) OVER (ORDER BY sale_date) as running_min_price
            FROM store_sales;""",
        "12. Windowed Min": """
            SELECT region, product_id, price,
                   MIN(price) OVER (PARTITION BY region) as region_floor_price
            FROM store_sales;""",
        "13. Kth Ranked Element (3rd Lowest Price)": """
            SELECT product_id, price,
                   NTH_VALUE(product_id, 3) OVER (ORDER BY price ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as third_lowest_product
            FROM store_sales;""",
        "14. First Element": """
            SELECT user_id, timestamp, event,
                   FIRST_VALUE(event) OVER (PARTITION BY user_id ORDER BY timestamp) as initial_session_event
            FROM activity_logs;""",
        "15. Last Element (Correct Frame)": """
            SELECT ticket_id, updated_at, status,
                   LAST_VALUE(status) OVER (PARTITION BY ticket_id ORDER BY updated_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as final_ticket_status
            FROM activity_logs;""",
        "16. Lag / Previous Row": """
            SELECT trade_date, closing_price,
                   LAG(closing_price, 1) OVER (ORDER BY trade_date) as previous_day_price
            FROM activity_logs;""",
        "17. Lead / Next Row": """
            SELECT trade_date, closing_price,
                   LEAD(closing_price, 1) OVER (ORDER BY trade_date) as next_day_price
            FROM activity_logs;""",
        "18. Percent Rank": """
            SELECT employee_name, score,
                   PERCENT_RANK() OVER (ORDER BY score DESC) as relative_score_rank
            FROM store_sales;""",
        "19. Cumulative Distribution": """
            SELECT employee_name, score,
                   CUME_DIST() OVER (ORDER BY score ASC) as cumulative_distribution
            FROM store_sales;""",
        "20. Percentile / NTile (Quartiles)": """
            SELECT employee_name, salary,
                   NTILE(4) OVER (ORDER BY salary DESC) as spend_quartile
            FROM store_sales;""",
        "BONUS: Top K Elements (CTE Pattern)": """
            WITH ranked_products AS (
                SELECT product_id, category, score,
                       DENSE_RANK() OVER (PARTITION BY category ORDER BY score DESC) as rank
                FROM store_sales
            )
            SELECT * FROM ranked_products WHERE rank <= 2;"""
    }

    # Exposed ui element without leading underscore to allow other cells to bind to it
    query_dropdown = mo.ui.dropdown(
        options=list(window_queries.keys()),
        value="1. Running Sum",
        label="⚡ Choose Window Function Pattern:"
    )

    mo.hstack([query_dropdown], justify="start")
    return query_dropdown, window_queries


@app.cell
def _(conn, mo, pd, query_dropdown, window_queries):

    # Safely extract from the underscore protected template dictionary
    _selected_sql = window_queries[query_dropdown.value]

    # Read into an isolated dataframe variable prefix
    _selected
    _df_result = pd.read_sql_query(_selected_sql, conn)

    mo.vstack([
        mo.md(f"**Executing Query for:** `{query_dropdown.value}`"),
        # Corrected: Render the syntax-highlighted block directly using marimo markdown
        mo.md(f"""
        ```sql
        {_selected_sql.strip()}
        ```
        """),
        mo.md("#### 📋 Result Set:"),
        mo.ui.table(_df_result)
    ])
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


if __name__ == "__main__":
    app.run()
