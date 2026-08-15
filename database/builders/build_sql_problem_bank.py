# ruff: noqa: S608 -- every interpolated identifier is a lesson-owned constant.
"""Build the screenshot-derived SQL interview problem bank."""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

from .common import rebuild_database

DATABASE_PATH = Path(__file__).resolve().parents[1] / "sql_problem_bank.sqlite"


@dataclass(frozen=True)
class Question:
    company: str
    title: str
    question: str
    answer: str
    answer_type: str = "sql"
    checker_groups: tuple[tuple[str, ...], ...] = ()
    notes: str = ""


@dataclass(frozen=True)
class Table:
    name: str
    columns: tuple[tuple[str, str], ...]
    rows: tuple[tuple[object, ...], ...]


def _q(company: str, title: str, question: str, answer: str, **kwargs: object) -> Question:
    return Question(company, title, question, answer.strip(), **kwargs)


QUESTIONS: tuple[Question, ...] = (
    _q("Facebook", "Click-through rate", "Calculate the click-through rate per app for 2019.", """
SELECT app_id,
       1.0 * SUM(CASE WHEN event_id = 'click' THEN 1 ELSE 0 END)
           / NULLIF(SUM(CASE WHEN event_id = 'impression' THEN 1 ELSE 0 END), 0) AS ctr
FROM events
WHERE timestamp >= '2019-01-01' AND timestamp < '2020-01-01'
GROUP BY app_id
ORDER BY app_id;
"""),
    _q("Robinhood", "Top cities by completed orders", "List the three cities with the most completed orders.", """
SELECT u.city, COUNT(DISTINCT t.order_id) AS num_orders
FROM trades AS t JOIN users AS u ON u.user_id = t.user_id
WHERE t.status = 'complete'
GROUP BY u.city
ORDER BY num_orders DESC, u.city
LIMIT 3;
"""),
    _q("New York Times", "Laptop versus mobile views", "Return laptop views and mobile views, where mobile combines phone and tablet.", """
SELECT SUM(CASE WHEN device_type = 'laptop' THEN 1 ELSE 0 END) AS laptop_views,
       SUM(CASE WHEN device_type IN ('phone', 'tablet') THEN 1 ELSE 0 END) AS mobile_views
FROM viewership;
"""),
    _q("Amazon", "Cumulative product spend", "Calculate cumulative spend by date for each product in chronological order.", """
SELECT trans_date, product_id,
       SUM(spend) OVER (PARTITION BY product_id ORDER BY trans_date
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_spend
FROM total_trans
ORDER BY product_id, trans_date;
""", notes="Three repeated question captures were consolidated."),
    _q("eBay", "Highest-volume valuable customers", "Return the ten customers with the most product rows among customers whose total spend is at least $1,000.", """
SELECT user_id, COUNT(product_id) AS num_products
FROM user_transactions
GROUP BY user_id
HAVING SUM(spend) >= 1000
ORDER BY num_products DESC, user_id
LIMIT 10;
"""),
    _q("Twitter", "Tweet histogram", "Build a histogram of tweets posted per user in 2020.", """
WITH totals AS (
  SELECT user_id, COUNT(*) AS num_tweets
  FROM tweets
  WHERE tweet_date >= '2020-01-01' AND tweet_date < '2021-01-01'
  GROUP BY user_id
)
SELECT num_tweets AS tweet_bucket, COUNT(*) AS num_users
FROM totals
GROUP BY num_tweets
ORDER BY tweet_bucket;
"""),
    _q("Stitch Fix", "Repeat purchases on different days", "Count users who purchased the same product on more than one distinct day.", """
SELECT COUNT(DISTINCT user_id) AS repeat_buyers
FROM (
  SELECT user_id, product_id
  FROM purchases
  GROUP BY user_id, product_id
  HAVING COUNT(DISTINCT date(purchase_time)) > 1
);
""", notes="Uses distinct dates directly; this avoids the source solution's tie-sensitive RANK bug."),
    _q("LinkedIn", "Duplicate job listings", "Count companies with at least two listings having the same title and description.", """
SELECT COUNT(DISTINCT company_id) AS duplicate_companies
FROM (
  SELECT company_id, title, description
  FROM job_listings
  GROUP BY company_id, title, description
  HAVING COUNT(*) > 1
);
"""),
    _q("Etsy", "High-value first transactions", "List customers whose first transaction was worth at least $50.", """
WITH numbered AS (
  SELECT user_id, spend,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY transaction_date, transaction_id) AS rn
  FROM user_transactions
)
SELECT user_id
FROM numbered
WHERE rn = 1 AND spend >= 50
ORDER BY user_id;
"""),
    _q("Twitter", "Seven-day rolling tweet average", "Calculate each user's seven-row rolling average of daily tweet counts.", """
WITH daily AS (
  SELECT user_id, date(tweet_date) AS tweet_date, COUNT(*) AS num_tweets
  FROM tweets
  GROUP BY user_id, date(tweet_date)
)
SELECT user_id, tweet_date,
       AVG(num_tweets) OVER (PARTITION BY user_id ORDER BY tweet_date
                             ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_avg_7d
FROM daily
ORDER BY user_id, tweet_date;
"""),
    _q("Uber", "Third transaction", "Return the third chronological transaction for every user.", """
WITH numbered AS (
  SELECT user_id, spend, transaction_date,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY transaction_date) AS rn
  FROM transactions
)
SELECT user_id, spend, transaction_date
FROM numbered
WHERE rn = 3
ORDER BY user_id;
"""),
    _q("Amazon", "Top products by category", "Identify the three highest-grossing products in each category during 2020.", """
WITH spend_by_product AS (
  SELECT category_id, product_id, SUM(spend) AS total_product_spend
  FROM product_spend
  WHERE transaction_date >= '2020-01-01' AND transaction_date < '2021-01-01'
  GROUP BY category_id, product_id
), ranked AS (
  SELECT *, DENSE_RANK() OVER (PARTITION BY category_id ORDER BY total_product_spend DESC) AS rnk
  FROM spend_by_product
)
SELECT category_id, product_id, total_product_spend
FROM ranked
WHERE rnk <= 3
ORDER BY category_id, total_product_spend DESC, product_id;
"""),
    _q("Walmart", "Latest-transaction buckets", "For each users' latest transaction date, return the user count and products bought on that date.", """
WITH latest AS (
  SELECT *, MAX(date(transaction_date)) OVER (PARTITION BY user_id) AS latest_date
  FROM user_transactions
)
SELECT latest_date AS transaction_date,
       COUNT(DISTINCT user_id) AS num_users,
       COUNT(product_id) AS total_products
FROM latest
WHERE date(transaction_date) = latest_date
GROUP BY latest_date
ORDER BY latest_date DESC;
"""),
    _q("Facebook", "Database views", "What is a database view, and what advantages can views have over tables?", "A view is a named query whose result is computed from underlying data. Views can hide query complexity, expose a restricted projection for security, centralize reusable logic, and usually avoid duplicating stored rows.", answer_type="text", checker_groups=(("named query", "saved query", "virtual table"), ("security", "restricted", "hide"), ("reuse", "simplify", "complexity"))),
    _q("Expedia", "Indexing read-heavy and write-heavy systems", "How should UPDATE/INSERT/DELETE-heavy versus SELECT/JOIN-heavy workloads affect indexing decisions?", "Indexes accelerate lookup, filtering, sorting, and joins, but every write must also maintain affected indexes. Use fewer, highly justified indexes for write-heavy OLTP workloads and more query-driven indexes for read-heavy analytical workloads, measuring both cases.", answer_type="text", checker_groups=(("write", "insert", "update", "delete"), ("maintain", "overhead", "slower"), ("select", "join", "read"), ("faster", "speed"))),
    _q("Microsoft", "Primary keys", "What is a primary key, and what makes a good one?", "A primary key is the minimal non-null column set that uniquely identifies each row. A good key is unique, stable, irreducible, compact, and has no business meaning likely to change.", answer_type="text", checker_groups=(("unique",), ("non-null", "not null"), ("stable",), ("minimal", "irreducible"))),
    _q("Amazon", "Relational versus NoSQL databases", "Compare advantages and disadvantages of relational and NoSQL databases.", "Relational systems provide schemas, constraints, ACID transactions, joins, and a standard query model, but rigid schemas and horizontal scaling can be costly. NoSQL systems offer flexible models and scale-out patterns, but often shift consistency, joins, constraints, and access-pattern complexity to the application. The workload should drive the choice.", answer_type="text", checker_groups=(("schema",), ("acid", "transaction"), ("flexible",), ("scale", "horizontal"), ("consistency",))),
    _q("Capital One", "MapReduce shuffle", "Describe a MapReduce algorithm that randomly shuffles a dataset.", "Map each input row to a random partition key, let the shuffle route rows by those keys, and have reducers emit their received rows. Use sufficiently random keys and randomized order within partitions if a globally unbiased permutation is required.", answer_type="text", checker_groups=(("random",), ("map",), ("shuffle",), ("reduce",))),
    _q("Amazon", "WHERE versus HAVING", "Give one important similarity and one difference between WHERE and HAVING.", "Both filter query results. WHERE filters input rows before grouping and cannot directly filter aggregate results; HAVING filters groups after GROUP BY and can use aggregate expressions.", answer_type="text", checker_groups=(("filter",), ("row", "before"), ("group", "aggregate", "after"))),
    _q("KPMG", "Foreign keys", "What is a foreign key, and how does it relate to a primary key?", "A foreign key is a child-table column set constrained to match a candidate key, commonly the primary key, in a parent table (or be null when allowed). It enforces referential integrity and encodes relationships between rows.", answer_type="text", checker_groups=(("child",), ("parent",), ("primary", "candidate"), ("referential integrity", "match"))),
    _q("Microsoft", "Clustered and non-clustered indexes", "Compare clustered and non-clustered indexes.", "A clustered index determines the table's row-storage order (or the closest engine-specific equivalent), so only one ordering is possible. A non-clustered index is a separate search structure containing keys and row locators; a table can have many, at additional storage and write-maintenance cost.", answer_type="text", checker_groups=(("physical", "storage", "order"), ("one", "single"), ("separate", "pointer", "locator"), ("many", "multiple"))),
    _q("Twitter", "Users outside the top 100 topics", "Return users existing on 2021-01-01 who did not follow any of that day's top 100 topics.", """
WITH top_topics AS (
  SELECT topic_id FROM topic_rankings
  WHERE ranking_date = '2021-01-01' AND ranking <= 100
), existing_users AS (
  SELECT DISTINCT user_id FROM user_topics WHERE follow_date <= '2021-01-01'
)
SELECT user_id FROM existing_users
EXCEPT
SELECT DISTINCT u.user_id
FROM user_topics AS u JOIN top_topics AS t ON t.topic_id = u.topic_id
WHERE u.follow_date <= '2021-01-01'
ORDER BY user_id;
""", notes="SQLite EXCEPT replaces the source's MINUS operator."),
    _q("Facebook", "Monthly active-user retention", "For each month, count active users who were also active in the immediately preceding month.", """
WITH active AS (
  SELECT DISTINCT user_id, date(timestamp, 'start of month') AS month
  FROM user_actions
  WHERE event_id IN ('sign-in', 'like', 'comment')
)
SELECT current.month, COUNT(*) AS retained_users
FROM active AS current
JOIN active AS previous
  ON previous.user_id = current.user_id
 AND previous.month = date(current.month, '-1 month')
GROUP BY current.month
ORDER BY current.month;
""", notes="Corrects the source query's missing user correlation and reversed month arithmetic."),
    _q("Twitter", "Session-duration ranks", "Rank users by total session duration within each session type from 2021-01-01 through 2021-02-01.", """
WITH totals AS (
  SELECT user_id, session_type, SUM(duration) AS total_duration
  FROM sessions
  WHERE start_time >= '2021-01-01' AND start_time < '2021-02-02'
  GROUP BY user_id, session_type
)
SELECT user_id, session_type, total_duration,
       RANK() OVER (PARTITION BY session_type ORDER BY total_duration DESC) AS rank
FROM totals
ORDER BY session_type, rank, user_id;
"""),
    _q("Snapchat", "Send/open time by age", "For each age bucket, calculate send and open time as percentages of total send/open time.", """
SELECT b.age_bucket,
       100.0 * SUM(CASE WHEN a.type = 'send' THEN a.time_spent ELSE 0 END) / SUM(a.time_spent) AS pct_send,
       100.0 * SUM(CASE WHEN a.type = 'open' THEN a.time_spent ELSE 0 END) / SUM(a.time_spent) AS pct_open
FROM activities AS a JOIN age_breakdown AS b ON b.user_id = a.user_id
WHERE a.type IN ('send', 'open')
GROUP BY b.age_bucket
ORDER BY b.age_bucket;
"""),
    _q("Pinterest", "Most concurrent session", "Return the session overlapping the largest number of other sessions.", """
SELECT s1.session_id, COUNT(s2.session_id) AS concurrents
FROM sessions AS s1
LEFT JOIN sessions AS s2
  ON s2.session_id <> s1.session_id
 AND s2.start_time <= s1.end_time
 AND s2.end_time >= s1.start_time
GROUP BY s1.session_id
ORDER BY concurrents DESC, s1.session_id
LIMIT 1;
""", notes="Uses a symmetric interval-overlap predicate rather than counting only sessions that start inside another."),
    _q("Yelp", "Top-rated businesses", "Return the count and percentage of businesses whose reviews are all four or five stars.", """
WITH business_ratings AS (
  SELECT business_id, MIN(review_stars) AS min_stars
  FROM reviews
  GROUP BY business_id
)
SELECT SUM(CASE WHEN min_stars >= 4 THEN 1 ELSE 0 END) AS top_rated_businesses,
       100.0 * SUM(CASE WHEN min_stars >= 4 THEN 1 ELSE 0 END) / COUNT(*) AS top_rated_pct
FROM business_ratings;
"""),
    _q("Google", "Odd and even daily measurements", "For each date, sum odd-positioned and even-positioned measurements in timestamp order.", """
WITH numbered AS (
  SELECT date(measurement_time) AS measurement_day, measurement_value,
         ROW_NUMBER() OVER (PARTITION BY date(measurement_time) ORDER BY measurement_time) AS rn
  FROM measurements
)
SELECT measurement_day,
       SUM(CASE WHEN rn % 2 = 1 THEN measurement_value ELSE 0 END) AS odd_sum,
       SUM(CASE WHEN rn % 2 = 0 THEN measurement_value ELSE 0 END) AS even_sum
FROM numbered
GROUP BY measurement_day
ORDER BY measurement_day;
"""),
    _q("Etsy", "Recent-signup conversion", "Using 2021-01-08 as the reproducible as-of date, calculate the percentage of users who signed up in the preceding seven days and purchased at least once.", """
SELECT 100.0 * COUNT(DISTINCT p.user_id) / COUNT(DISTINCT s.user_id) AS conversion_pct
FROM signups AS s
LEFT JOIN user_purchases AS p ON p.user_id = s.user_id
WHERE s.signup_date > date('2021-01-08', '-7 days')
  AND s.signup_date <= '2021-01-08';
""", notes="Pins NOW() to a fixed as-of date so the seeded exercise remains deterministic."),
    _q("Walmart", "Products frequently bought together", "Return the ten product pairs most frequently appearing in the same transaction without double-counting reversed pairs.", """
SELECT p1.product_name AS product1, p2.product_name AS product2, COUNT(*) AS pair_count
FROM transactions AS t1
JOIN transactions AS t2 ON t2.transaction_id = t1.transaction_id AND t1.product_id < t2.product_id
JOIN products AS p1 ON p1.product_id = t1.product_id
JOIN products AS p2 ON p2.product_id = t2.product_id
GROUP BY p1.product_name, p2.product_name
ORDER BY pair_count DESC, product1, product2
LIMIT 10;
"""),
    _q("Facebook", "Reactivated users", "For each month, count users who logged in that month but not in the immediately preceding month.", """
WITH monthly AS (
  SELECT DISTINCT user_id, date(login_date, 'start of month') AS month
  FROM user_logins
)
SELECT current.month, COUNT(*) AS num_reactivated_users
FROM monthly AS current
WHERE NOT EXISTS (
  SELECT 1 FROM monthly AS previous
  WHERE previous.user_id = current.user_id
    AND previous.month = date(current.month, '-1 month')
)
GROUP BY current.month
ORDER BY current.month;
""", notes="Corrects the incomplete source answer and counts distinct user-months."),
    _q("Wayfair", "Weekly year-over-year growth", "For each product and week, calculate total spend and year-over-year growth using the corresponding week 52 rows earlier.", """
WITH weekly AS (
  SELECT product_id, date(transaction_date) AS week, SUM(spend) AS total_spend
  FROM user_transactions
  GROUP BY product_id, date(transaction_date)
), compared AS (
  SELECT *, LAG(total_spend, 52) OVER (PARTITION BY product_id ORDER BY week) AS previous_year_spend
  FROM weekly
)
SELECT product_id, week, total_spend, previous_year_spend,
       100.0 * (total_spend - previous_year_spend) / previous_year_spend AS yoy_growth_pct
FROM compared
WHERE previous_year_spend IS NOT NULL
ORDER BY product_id, week;
"""),
    _q("Stripe", "Rolling seven-day earnings", "Calculate the account's rolling seven-calendar-day earnings for every transaction date.", """
WITH daily AS (
  SELECT date(transaction_date) AS transaction_date, SUM(amount) AS daily_amount
  FROM user_transactions
  GROUP BY date(transaction_date)
)
SELECT d2.transaction_date, SUM(d1.daily_amount) AS rolling_7d_earnings
FROM daily AS d2
JOIN daily AS d1
  ON d1.transaction_date > date(d2.transaction_date, '-7 days')
 AND d1.transaction_date <= d2.transaction_date
GROUP BY d2.transaction_date
ORDER BY d2.transaction_date;
"""),
    _q("Facebook", "Mutual friends with MapReduce", "Describe how MapReduce can compute mutual-friend counts for every user pair.", "For each user, emit every canonical user pair together with that user's friend set. Shuffle by the pair. Each reducer receives both friend sets, intersects them, and emits the pair with the intersection size. Deduplicate undirected edges and sort pair keys to avoid reversed duplicates.", answer_type="text", checker_groups=(("map", "emit"), ("pair",), ("shuffle",), ("intersect", "intersection"), ("reduce",))),
    _q("Google", "Distributed query-frequency service", "Design a large-scale service that tracks search strings and frequencies, including major trade-offs.", "Store query-to-count records in a partitioned key-value system. Hash or consistently hash normalized query strings across shards, update counters atomically or through buffered aggregation, replicate for availability, and define acceptable consistency. Address hot keys, repartitioning, durability, approximate counting, and read/write latency trade-offs.", answer_type="text", checker_groups=(("key-value", "key value"), ("shard", "partition"), ("hash",), ("replica", "availability"), ("consistency", "atomic"))),
)


def _t(name: str, columns: tuple[tuple[str, str], ...], rows: tuple[tuple[object, ...], ...]) -> Table:
    return Table(name, columns, rows)


DATASETS: dict[str, tuple[Table, ...]] = {
    "q01": (_t("events", (("app_id", "INTEGER"), ("event_id", "TEXT"), ("timestamp", "TEXT")), ((1,"impression","2019-01-02"),(1,"impression","2019-01-03"),(1,"click","2019-01-03"),(2,"impression","2019-02-01"),(2,"click","2019-02-01"),(2,"click","2019-02-02"),(1,"click","2020-01-02"))),),
    "q02": (_t("trades", (("order_id","INTEGER"),("user_id","INTEGER"),("price","REAL"),("quantity","INTEGER"),("status","TEXT"),("timestamp","TEXT")), ((1,1,10,1,"complete","2021-01-01"),(2,2,20,1,"complete","2021-01-02"),(3,3,15,2,"complete","2021-01-03"),(4,4,8,1,"complete","2021-01-04"),(5,5,9,1,"complete","2021-01-05"),(6,6,7,1,"cancelled","2021-01-06"),(7,1,11,1,"complete","2021-01-07"))), _t("users", (("user_id","INTEGER"),("city","TEXT"),("email","TEXT"),("signup_date","TEXT")), ((1,"New York","a@x","2020-01-01"),(2,"Boston","b@x","2020-01-01"),(3,"New York","c@x","2020-01-01"),(4,"Chicago","d@x","2020-01-01"),(5,"Austin","e@x","2020-01-01"),(6,"Boston","f@x","2020-01-01")))),
    "q03": (_t("viewership", (("user_id","INTEGER"),("device_type","TEXT"),("view_time","TEXT")), ((1,"laptop","2021-01-01"),(2,"phone","2021-01-01"),(3,"tablet","2021-01-01"),(4,"phone","2021-01-02"),(1,"laptop","2021-01-02"))),),
    "q04": (_t("total_trans", (("order_id","INTEGER"),("user_id","INTEGER"),("product_id","TEXT"),("spend","REAL"),("trans_date","TEXT")), ((1,1,"A",10,"2020-01-01"),(2,2,"A",15,"2020-01-02"),(3,1,"B",7,"2020-01-01"),(4,3,"B",9,"2020-01-03"))),),
    "q05": (_t("user_transactions", (("transaction_id","INTEGER"),("product_id","INTEGER"),("user_id","INTEGER"),("spend","REAL"),("trans_date","TEXT")), ((1,10,1,600,"2020-01-01"),(2,11,1,500,"2020-01-02"),(3,10,2,1000,"2020-01-01"),(4,12,2,100,"2020-01-03"),(5,13,2,50,"2020-01-04"),(6,10,3,999,"2020-01-01"))),),
    "q06": (_t("tweets", (("tweet_id","INTEGER"),("user_id","INTEGER"),("msg","TEXT"),("tweet_date","TEXT")), ((1,1,"a","2020-01-01"),(2,1,"b","2020-02-01"),(3,2,"c","2020-03-01"),(4,3,"d","2020-04-01"),(5,3,"e","2020-04-02"),(6,3,"f","2020-04-03"),(7,1,"old","2019-01-01"))),),
    "q07": (_t("purchases", (("purchase_id","INTEGER"),("user_id","INTEGER"),("product_id","INTEGER"),("quantity","INTEGER"),("price","REAL"),("purchase_time","TEXT")), ((1,1,10,1,5,"2021-01-01 09:00"),(2,1,10,1,5,"2021-01-01 12:00"),(3,1,10,1,5,"2021-01-02 09:00"),(4,2,10,1,5,"2021-01-01"),(5,2,11,1,6,"2021-01-02"),(6,3,12,1,8,"2021-01-03"),(7,3,12,1,8,"2021-01-04"))),),
    "q08": (_t("job_listings", (("job_id","INTEGER"),("company_id","INTEGER"),("title","TEXT"),("description","TEXT"),("post_date","TEXT")), ((1,1,"DS","Model data","2021-01-01"),(2,1,"DS","Model data","2021-01-02"),(3,1,"DE","Build pipes","2021-01-03"),(4,2,"DS","Model data","2021-01-01"),(5,3,"PM","Plan","2021-01-01"),(6,3,"PM","Plan","2021-01-02"))),),
    "q09": (_t("user_transactions", (("transaction_id","INTEGER"),("product_id","INTEGER"),("user_id","INTEGER"),("spend","REAL"),("transaction_date","TEXT")), ((1,10,1,60,"2021-01-01"),(2,11,1,20,"2021-01-02"),(3,10,2,40,"2021-01-01"),(4,11,2,80,"2021-01-02"),(5,12,3,50,"2021-01-03"))),),
    "q10": (_t("tweets", (("tweet_id","INTEGER"),("msg","TEXT"),("user_id","INTEGER"),("tweet_date","TEXT")), tuple((i,f"m{i}",1,f"2021-01-{day:02d}") for i,day in enumerate((1,1,2,3,3,3,4,5,6,7,8),1)) + ((20,"x",2,"2021-01-01"),(21,"y",2,"2021-01-02"))),),
    "q11": (_t("transactions", (("user_id","INTEGER"),("spend","REAL"),("transaction_date","TEXT")), ((1,5,"2021-01-01"),(1,6,"2021-01-02"),(1,7,"2021-01-03"),(2,10,"2021-01-01"),(2,20,"2021-01-02"),(2,30,"2021-01-03"),(3,9,"2021-01-01"))),),
    "q12": (_t("product_spend", (("transaction_id","INTEGER"),("category_id","INTEGER"),("product_id","INTEGER"),("user_id","INTEGER"),("spend","REAL"),("transaction_date","TEXT")), tuple((i,1,100+i%4,i,10*(i%4+1),f"2020-0{i%9+1}-01") for i in range(1,9)) + ((20,2,201,1,70,"2020-02-01"),(21,2,202,2,60,"2020-03-01"),(22,2,203,3,50,"2020-04-01"),(23,2,204,4,40,"2020-05-01"),(24,1,199,1,999,"2019-01-01"))),),
    "q13": (_t("user_transactions", (("transaction_id","INTEGER"),("product_id","INTEGER"),("user_id","INTEGER"),("spend","REAL"),("transaction_date","TEXT")), ((1,10,1,5,"2021-01-01"),(2,11,1,6,"2021-01-03"),(3,12,1,7,"2021-01-03"),(4,10,2,8,"2021-01-02"),(5,13,3,9,"2021-01-03"))),),
    "q22": (_t("user_topics", (("user_id","INTEGER"),("topic_id","INTEGER"),("follow_date","TEXT")), ((1,10,"2020-01-01"),(2,20,"2020-01-01"),(3,30,"2021-01-01"),(4,40,"2021-01-02"))), _t("topic_rankings", (("topic_id","INTEGER"),("ranking","INTEGER"),("ranking_date","TEXT")), ((10,1,"2021-01-01"),(20,101,"2021-01-01"),(30,50,"2021-01-01"),(40,2,"2021-01-01")))),
    "q23": (_t("user_actions", (("user_id","INTEGER"),("event_id","TEXT"),("timestamp","TEXT")), ((1,"sign-in","2021-01-05"),(2,"like","2021-01-10"),(1,"comment","2021-02-01"),(3,"sign-in","2021-02-02"),(1,"like","2021-03-01"),(3,"comment","2021-03-02"))),),
    "q24": (_t("sessions", (("session_id","INTEGER"),("user_id","INTEGER"),("session_type","TEXT"),("duration","INTEGER"),("start_time","TEXT")), ((1,1,"mobile",10,"2021-01-02"),(2,1,"mobile",20,"2021-01-03"),(3,2,"mobile",25,"2021-01-04"),(4,1,"web",5,"2021-01-05"),(5,2,"web",40,"2021-02-01"),(6,3,"web",99,"2021-02-02"))),),
    "q25": (_t("activities", (("activity_id","INTEGER"),("user_id","INTEGER"),("type","TEXT"),("time_spent","REAL"),("activity_date","TEXT")), ((1,1,"send",30,"2021-01-01"),(2,1,"open",70,"2021-01-01"),(3,2,"send",20,"2021-01-01"),(4,2,"open",20,"2021-01-01"),(5,3,"send",80,"2021-01-01"),(6,3,"open",20,"2021-01-01"))), _t("age_breakdown", (("user_id","INTEGER"),("age_bucket","TEXT")), ((1,"18-24"),(2,"18-24"),(3,"25-34")))),
    "q26": (_t("sessions", (("session_id","INTEGER"),("start_time","TEXT"),("end_time","TEXT")), ((1,"2021-01-01 09:00","2021-01-01 12:00"),(2,"2021-01-01 08:00","2021-01-01 10:00"),(3,"2021-01-01 10:30","2021-01-01 11:00"),(4,"2021-01-01 13:00","2021-01-01 14:00"))),),
    "q27": (_t("reviews", (("business_id","INTEGER"),("user_id","INTEGER"),("review_text","TEXT"),("review_stars","INTEGER"),("review_date","TEXT")), ((1,1,"great",5,"2021-01-01"),(1,2,"good",4,"2021-01-02"),(2,1,"ok",3,"2021-01-01"),(2,3,"great",5,"2021-01-03"),(3,2,"great",5,"2021-01-04"))),),
    "q28": (_t("measurements", (("measurement_id","INTEGER"),("measurement_value","REAL"),("measurement_time","TEXT")), ((1,10,"2021-01-01 09:00"),(2,20,"2021-01-01 10:00"),(3,30,"2021-01-01 11:00"),(4,5,"2021-01-02 09:00"),(5,7,"2021-01-02 10:00"))),),
    "q29": (_t("signups", (("user_id","INTEGER"),("signup_date","TEXT")), ((1,"2021-01-02"),(2,"2021-01-04"),(3,"2021-01-08"),(4,"2020-12-01"))), _t("user_purchases", (("user_id","INTEGER"),("product_id","INTEGER"),("purchase_amount","REAL"),("purchase_date","TEXT")), ((1,10,20,"2021-01-03"),(1,11,10,"2021-01-04"),(3,12,5,"2021-01-08"),(4,10,5,"2020-12-02")))),
    "q30": (_t("transactions", (("transaction_id","INTEGER"),("product_id","INTEGER"),("user_id","INTEGER"),("quantity","INTEGER"),("transaction_time","TEXT")), ((1,1,1,1,"2021-01-01"),(1,2,1,1,"2021-01-01"),(1,3,1,1,"2021-01-01"),(2,1,2,1,"2021-01-02"),(2,2,2,1,"2021-01-02"),(3,1,3,1,"2021-01-03"),(3,3,3,1,"2021-01-03"))), _t("products", (("product_id","INTEGER"),("product_name","TEXT"),("price","REAL")), ((1,"Tea",5),(2,"Cake",8),(3,"Coffee",4)))),
    "q31": (_t("user_logins", (("user_id","INTEGER"),("login_date","TEXT")), ((1,"2021-01-05"),(2,"2021-01-06"),(1,"2021-02-05"),(3,"2021-02-06"),(2,"2021-03-01"),(3,"2021-03-02"))),),
    "q33": (_t("user_transactions", (("transaction_id","INTEGER"),("user_id","INTEGER"),("amount","REAL"),("transaction_date","TEXT")), ((1,1,10,"2021-01-01"),(2,2,20,"2021-01-02"),(3,1,5,"2021-01-04"),(4,3,7,"2021-01-08"),(5,2,8,"2021-01-09"))),),
}


def _weekly_rows() -> tuple[tuple[object, ...], ...]:
    rows: list[tuple[object, ...]] = []
    start = date(2020, 1, 6)
    transaction_id = 1
    for product_id, base in ((1, 100.0), (2, 60.0)):
        for week in range(54):
            rows.append((transaction_id, product_id, week % 5 + 1, base + week, (start + timedelta(days=7 * week)).isoformat()))
            transaction_id += 1
    return tuple(rows)


DATASETS["q32"] = (_t("user_transactions", (("transaction_id","INTEGER"),("product_id","INTEGER"),("user_id","INTEGER"),("spend","REAL"),("transaction_date","TEXT")), _weekly_rows()),)


def _physical(question_id: str, logical_name: str) -> str:
    return f"{question_id}__{logical_name}"


def _create_table(connection: sqlite3.Connection, question_id: str, ordinal: int, table: Table) -> None:
    physical_name = _physical(question_id, table.name)
    column_sql = ", ".join(f'"{name}" {kind} NOT NULL' for name, kind in table.columns)
    connection.execute(f'CREATE TABLE "{physical_name}" ({column_sql})')
    placeholders = ", ".join("?" for _ in table.columns)
    connection.executemany(  # noqa: S608 - identifiers come from lesson-owned constants.
        f'INSERT INTO "{physical_name}" VALUES ({placeholders})', table.rows
    )
    connection.execute(
        "INSERT INTO question_tables VALUES (?, ?, ?, ?, ?)",
        (question_id, ordinal, table.name, physical_name, f'CREATE TABLE "{physical_name}" ({column_sql})'),
    )
    connection.executemany(
        "INSERT INTO question_columns VALUES (?, ?, ?, ?, ?)",
        ((question_id, table.name, position, name, kind) for position, (name, kind) in enumerate(table.columns, 1)),
    )


def seed_sql_problem_bank(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE questions (
          question_id TEXT PRIMARY KEY,
          source_number TEXT NOT NULL UNIQUE,
          company TEXT NOT NULL,
          title TEXT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          answer_type TEXT NOT NULL CHECK (answer_type IN ('sql', 'text')),
          checker_spec TEXT NOT NULL,
          notes TEXT NOT NULL
        );
        CREATE TABLE question_tables (
          question_id TEXT NOT NULL REFERENCES questions(question_id),
          ordinal INTEGER NOT NULL,
          logical_name TEXT NOT NULL,
          physical_name TEXT NOT NULL UNIQUE,
          schema_sql TEXT NOT NULL,
          PRIMARY KEY (question_id, logical_name)
        );
        CREATE TABLE question_columns (
          question_id TEXT NOT NULL,
          logical_table TEXT NOT NULL,
          ordinal INTEGER NOT NULL,
          column_name TEXT NOT NULL,
          declared_type TEXT NOT NULL,
          PRIMARY KEY (question_id, logical_table, column_name),
          FOREIGN KEY (question_id, logical_table)
            REFERENCES question_tables(question_id, logical_name)
        );
        """
    )
    for number, question in enumerate(QUESTIONS, 1):
        question_id = f"q{number:02d}"
        connection.execute(
            "INSERT INTO questions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (question_id, f"8.{number}", question.company, question.title, question.question,
             question.answer, question.answer_type, json.dumps(question.checker_groups), question.notes),
        )
        connection.execute(  # noqa: S608 - question_id is generated, not user input.
            f"""
            CREATE VIEW {question_id} AS
            SELECT question_id, source_number, company, title, question, answer,
                   answer_type, checker_spec, notes
            FROM questions
            WHERE question_id = '{question_id}'
            """
        )
        for ordinal, table in enumerate(DATASETS.get(question_id, ()), 1):
            _create_table(connection, question_id, ordinal, table)


def build_sql_problem_bank(target: Path = DATABASE_PATH) -> Path:
    return rebuild_database(target, seed_sql_problem_bank)


if __name__ == "__main__":
    print(f"Built {build_sql_problem_bank()}.")
