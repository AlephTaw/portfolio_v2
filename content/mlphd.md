---
title: Machine Learning PhD Quest
description: Working notes published as a structured research and study document.
---
# The Software Development Lifecycle
## Traditional SDLC
## ML Applications
## Application Canvas
### Reporting
### Quality Assurance


# Python
# Algorithms

# Containerization and Orchestration
# Data Science
## Machine Learning
## Deep Learning
### Evals, Metrics, Objectives
### Deep Learning
### Probability
### Statistics

## Data Storage and Retrieval

### Introduction


Cloud storage includes object storage, block storage, file storage, and data lakes or warehouses. You should view them as a hierarchy. They scale from raw hardware blocks to structured business data. Each layer serves a specific access pattern, speed requirement, and consistency model.

#### Physical and Infrastructure Layer

This layer deals with bytes, disks, and raw access.

- **Block Storage:** Raw volumes attached to servers. It offers low latency and high IOPS. Use it for operating system boot disks and high-performance databases.
- **File Storage:** Hierarchical folders shared over a network. It uses protocols like NFS or SMB. Use it for shared user home directories and legacy application content.

#### Unstructured and Blob Layer

This layer stores raw files without a fixed database schema.

- **Object Storage:** Flat namespace for binary large objects. It scales infinitely and costs very little. Use it for images, backups, media files, and data lake raw zones.

#### Analytical and Big Data Layer

This layer organizes massive data for search and analytics.

- **Data Lakes:** Central repositories for raw, semi-structured, and structured files. Use them for big data processing and machine learning training.
- **Data Warehouses:** Columnar, highly optimized relational storage. Use them for fast business intelligence queries and aggregated reporting.

#### Operational and Transactional Layer

This layer manages live, mutable application state.

- **Relational Databases (SQL):** Tables with strict schemas and ACID guarantees. Use them for core business transactions and user accounts.
- **NoSQL Databases:** Flexible schemas optimized for specific access patterns like key-value, document, or graph. Use them for high-speed lookups and real-time feeds.

#### Ephemeral and Cache Layer

This layer trades durability for speed.

- **In-Memory Caches:** Volatile RAM storage. Use them for session stores, query results, and sub-millisecond retrieval.

### Relational Databases (Postgres)

#### Introduction to SQL

#### Post Q

#### Data Cleaning

#### Aggregation Patterns

#### Window Functions

#### Optimization Notes

### Next Threads

### Column Databases

### Graph Databases

### In-Memory

## Data Engineering

## Exploratory Data Analysis

## Model Development, Evaluation, and Selection

## Machine Learning Operations (MLOps)
### Reproducibility
### Testing
### Deployment
### Observability
### Monitoring
### Alerting
### Maintanaince
#### Graceful Degredation
### Automation
### Performance Optimization
### Scaling

## Working with LLMS
### Model Fine-Tuning
### Test-Time Training
#### RAG vs TTT for task / as retreival and cached tool paths
### Performance
#### KV caching


