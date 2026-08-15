# SQL problem screenshot reconciliation

This is the human-reviewable source map for `database/sql_problem_bank.sqlite`. The 95
screenshots resolve to 35 numbered questions (`8.1`–`8.35`) and 35 matching answer sets.
Every screenshot is represented below by its capture time. Times refer to the filenames in
this directory on 2026-08-13 or 2026-08-14.

The database uses stable IDs `q01`–`q35`. A question's logical table `events` is stored as
`q01__events`, because SQLite does not provide PostgreSQL-style schemas inside one database
file. `questions.question` and `questions.answer` hold the requested statement and answer;
read-only views `q01`–`q35` also expose each question as an individual object, and
`question_tables` records every logical-to-physical table mapping.

## Reconciled inventory

| ID | Source | Company | Topic | Question image(s) | Answer image(s) | Tables |
|---|---|---|---|---|---|---|
| q01 | 8.1 | Facebook | Click-through rate | 11.50.07 PM | 11.58.28 PM | events |
| q02 | 8.2 | Robinhood | Top completed-order cities | 11.50.12 PM | 11.58.35, 11.58.39 PM | trades, users |
| q03 | 8.3 | New York Times | Laptop vs. mobile views | 11.50.19 PM | 11.58.57 PM | viewership |
| q04 | 8.4 | Amazon | Cumulative product spend | 11.50.24, 11.50.40, 11.51.07, 11.52.55, 11.52.59 PM | 11.59.03, 11.59.09 PM | total_trans |
| q05 | 8.5 | eBay | Valuable high-volume customers | 11.54.06 PM | 11.59.26 PM | user_transactions |
| q06 | 8.6 | Twitter | Tweet histogram | 11.54.14 PM | 11.59.32, 11.59.36 PM | tweets |
| q07 | 8.7 | Stitch Fix | Repeat purchases on different days | 11.54.22 PM | 11.59.53 PM | purchases |
| q08 | 8.8 | LinkedIn | Duplicate job listings | 11.54.29 PM | 12.00.06, 12.00.16 AM | job_listings |
| q09 | 8.9 | Etsy | High-value first transactions | 11.54.36 PM | 12.00.41 AM | user_transactions |
| q10 | 8.10 | Twitter | Seven-day tweet average | 11.54.44 PM | 12.00.48 AM | tweets |
| q11 | 8.11 | Uber | Third transaction | 11.54.51 PM | 12.00.55, 12.01.03 AM | transactions |
| q12 | 8.12 | Amazon | Top products by category | 11.54.58 PM | 12.01.29, 12.01.33 AM | product_spend |
| q13 | 8.13 | Walmart | Latest-transaction buckets | 11.55.05 PM | 12.01.52 AM | user_transactions |
| q14 | 8.14 | Facebook | Database views | 11.55.13 PM | 12.02.00 AM | — |
| q15 | 8.15 | Expedia | Indexing by workload | 11.55.23 PM | 12.02.05 AM | — |
| q16 | 8.16 | Microsoft | Primary keys | 11.55.31 PM | 12.02.09 AM | — |
| q17 | 8.17 | Amazon | Relational vs. NoSQL | 11.55.38 PM | 12.02.14, 12.02.19 AM | — |
| q18 | 8.18 | Capital One | MapReduce shuffle | 11.55.46 PM | 12.02.42 AM | — |
| q19 | 8.19 | Amazon | WHERE vs. HAVING | 11.55.54 PM | 12.02.48 AM | — |
| q20 | 8.20 | KPMG | Foreign keys | 11.56.00 PM | 12.02.53, 12.02.58 AM | — |
| q21 | 8.21 | Microsoft | Clustered vs. non-clustered indexes | 11.56.10 PM | 12.03.18 AM | — |
| q22 | 8.22 | Twitter | Users outside top topics | 11.56.17 PM | 12.03.25, 12.03.40 AM | user_topics, topic_rankings |
| q23 | 8.23 | Facebook | Monthly active-user retention | 11.56.24 PM | 12.03.56 AM | user_actions |
| q24 | 8.24 | Twitter | Session-duration ranks | 11.56.30 PM | 12.04.01, 12.04.05 AM | sessions |
| q25 | 8.25 | Snapchat | Send/open time by age | 11.56.36, 11.56.40 PM | 12.04.28, 12.04.34 AM | activities, age_breakdown |
| q26 | 8.26 | Pinterest | Most concurrent session | 11.57.04 PM | 12.05.03 AM | sessions |
| q27 | 8.27 | Yelp | Top-rated businesses | 11.57.08 PM | 12.05.07, 12.05.11 AM | reviews |
| q28 | 8.28 | Google | Odd/even daily measurements | 11.57.13 PM | 12.05.34, 12.05.36 AM | measurements |
| q29 | 8.29 | Etsy | Recent-signup conversion | 11.57.17, 11.57.21 PM | 12.06.06 AM | signups, user_purchases |
| q30 | 8.30 | Walmart | Products bought together | 11.57.46 PM | 12.06.10, 12.06.12 AM | transactions, products |
| q31 | 8.31 | Facebook | Reactivated users | 11.57.51 PM | 12.06.34 AM | user_logins |
| q32 | 8.32 | Wayfair | Weekly year-over-year growth | 11.57.57 PM | 12.06.38, 12.06.42 AM | user_transactions |
| q33 | 8.33 | Stripe | Rolling seven-day earnings | 11.58.02 PM | 12.07.01, 12.07.10 AM | user_transactions |
| q34 | 8.34 | Facebook | Mutual friends with MapReduce | 11.58.07 PM | 12.07.34 AM | — |
| q35 | 8.35 | Google | Distributed query frequencies | 11.58.13 PM | 12.07.40, 12.07.46 AM | — |

## Reconciliation decisions

- The five 8.4 captures are one question: two statement-only crops and three overlapping
  statement/schema captures. None becomes a second problem.
- The red `8.25` and `8.29` labels identify schema continuations; each continuation is
  attached to its matching statement.
- Split answer images are joined by their printed number and capture order.
- Reference SQL is valid SQLite and preserves the intended result. It intentionally fixes
  OCR damage, typographical syntax errors, `MINUS`/date-function dialect differences, and
  logical defects in 8.7, 8.23, 8.26, and 8.31. Corrections are recorded in each database
  question's `notes` field.
- 8.29 uses a fixed `2021-01-08` as-of date, making the exercise deterministic rather than
  dependent on the learner's current clock.
- SQL submissions are graded by result equivalence against seeded tables. Explanatory
  answers are graded against compact concept groups, not exact wording.
