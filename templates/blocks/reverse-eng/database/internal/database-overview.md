---
slug: database-overview
title: "Database Overview"
applies-to: [re-database-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Database Overview

### 1.1 What This Database Is

- **Name:** [Database Name]
- **DBMS:** [e.g., PostgreSQL 16.1 / SQL Server 2022 / Oracle 23c / MySQL 8.0]
- **Purpose:** [One or two sentences — e.g., "Backend data store for the e-commerce platform. Stores customers, products, orders, and transactions for web and mobile applications."]
- **Environment:** [Production / Development / Staging — briefly describe environment scope]

### 1.2 Database Architecture

- **Architecture Style:** [Monolithic / Service-Oriented / Microservice-Adjacent, etc.]
- **Scaling Strategy:** [Read replicas / Sharding / Federated queries / Single instance, etc.]
- **Key Characteristics:** [List 3-4 defining characteristics — e.g., "Normalized OLTP schema. Uses soft deletes for audit trail. Temporal tables for order history. Materialized views for reporting."]

### 1.3 Design Philosophy

| Decision | Rationale |
|----------|-----------|
| [e.g., "Normalized 3NF with selective denormalization"] | [e.g., "Normalize for consistency; denormalize specific tables (Orders summary) for reporting performance"] |
| [e.g., "Soft deletes (logical deletion) instead of hard deletes"] | [e.g., "Preserve audit trail and historical data; prevent accidental data loss"] |
| [e.g., "UUID primary keys for federation and integration"] | [e.g., "Support multi-region deployments and API integration"] |
| [e.g., "All timestamps in UTC"] | [e.g., "Avoid timezone confusion; handle user timezone conversion in application layer"] |

### 1.4 Key Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| **Database Size** | [e.g., 250 GB] | Approximate; includes backups |
| **Largest Tables** | [e.g., Events (500M rows), Logs (1B rows)] | Review growth rate quarterly |
| **Read Queries/sec** | [e.g., 5000-10000] | Peak load; varies by time of day |
| **Write Queries/sec** | [e.g., 500-1000] | Peak load; mostly batch inserts |
| **Backup Schedule** | [e.g., Full daily at 2 AM UTC, incremental hourly] | Recovery time objective (RTO): 4 hours |
| **Availability SLA** | [e.g., 99.9%] | Excludes scheduled maintenance windows |
