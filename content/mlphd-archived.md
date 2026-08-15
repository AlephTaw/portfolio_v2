---
title: Machine Learning PhD Quest
description: Working notes published as a structured research and study document.
---

# Data Science

Data science serves as the operational layer of the broader Machine Learning PhD Quest. This section is where notes turn into working systems, experiments, and reusable habits.

## SQL

SQL is the first anchor topic because it sits at the boundary between raw data and reliable analysis. The goal is not only to write queries, but to build judgment about data shape, constraints, and evidence.

### Query Design

Good query design starts with a clear question, then works backward to the minimal set of tables, joins, filters, and aggregations needed to answer it.

- Start with the analytical question.
- Inspect the grain of each table before joining.
- Prefer readable CTEs when the logic benefits from explicit stages.
- Check whether `COUNT(*)`, `COUNT(column)`, and `COUNT(DISTINCT column)` imply different meanings.

### Data Cleaning

SQL is often the fastest place to identify null-heavy columns, duplicate records, broken foreign keys, and category drift before analysis moves into Python notebooks or dashboards.

- Profile missingness before imputing or dropping.
- Use targeted deduplication logic instead of blanket `DISTINCT`.
- Normalize categories close to the source when possible.
- Keep transformations auditable.

### Aggregation Patterns

Aggregation is where many silent mistakes happen. Grouping logic should reflect the true unit of analysis, not just the columns that are convenient to type.

The main practice areas here are:

- cohort summaries
- rolling windows
- ratio metrics
- percent-of-total comparisons
- segmentation by time, product, or behavior

### Window Functions

Window functions are essential for ranking, running totals, lag and lead comparisons, sessionization, and longitudinal analysis.

Examples worth internalizing:

- `ROW_NUMBER()` for deterministic ordering
- `LAG()` and `LEAD()` for temporal comparisons
- `SUM(...) OVER (...)` for cumulative metrics
- partitioned averages for within-group benchmarking

### Optimization Notes

Performance matters because slow exploratory workflows reduce iteration speed. Query optimization belongs in the learning loop, not only in production firefighting.

- inspect execution plans
- reduce unnecessary scans
- index for real access patterns
- distinguish correctness problems from performance problems

## Next Threads

This document structure is intended to expand naturally into new sections such as statistics, machine learning systems, evaluation, monitoring, and research synthesis.
