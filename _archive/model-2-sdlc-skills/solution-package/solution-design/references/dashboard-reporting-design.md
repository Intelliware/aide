# Dashboard / Reporting Design

## Purpose

Design the dashboard and reporting capabilities for the feature — metrics, visualizations, and data aggregation. Consumes: the system-design (which components produce data that feeds dashboards), the data-model-design (entities and relationships that reports query), the backend-design (service layer that exposes reporting data), the api-design (endpoints that serve dashboard data), the existing-architecture- assessment (existing reporting infrastructure, dashboard tooling, data warehouse or analytics pipelines), and the requirements package (business objectives for success metrics that need dashboards, functional requirements for reporting capabilities, nonfunctional requirements for reporting performance targets). For brownfield projects, follows existing dashboard and reporting patterns — same visualization tooling, same data aggregation approach, same refresh cadence conventions. Covers: dashboard layout and information hierarchy (what metrics are shown, how they are organized, who sees what), data aggregation strategy (real-time vs. batch, pre-computed vs. on-demand, materialized views vs. live queries), reporting data model (if reports require a separate read model, star schema, or denormalized views), visualization specifications (chart types, filters, drill-down paths, export formats), access control for reports (which roles see which dashboards — aligned with permissions-access-control), refresh and caching strategy (how frequently data updates, staleness tolerance), and historical data retention for trend reporting. Not all projects need this section — scope to what is relevant. Produces dashboard and reporting design that is Section 11 of the solution design package.

## What This Produces

The dashboard and reporting architecture for the feature — what metrics and reports are needed, how the data behind them is aggregated and served, and how dashboards are structured for their target audience. This section takes business objectives and functional requirements that call for reporting capabilities and designs the full pipeline: from source data in the transactional model to what the user sees on screen.

This is Section 11 of the solution design package. It builds on:
- **Data model design** (Section 6) — the entities and relationships that reports query against
- **Backend design** (Section 5) — the service layer that computes and serves reporting data
- **API design** (Section 7) — the endpoints or query interfaces that dashboards consume
- **System design** (Section 3) — which components produce the data that feeds dashboards

**What this section covers vs. what other sections cover:**

| Concern | Where It Lives |
|---------|---------------|
| Transactional data model (entities, columns, relationships) | Section 6 — Data Model Design |
| API endpoints for reporting data | Section 7 — API Design |
| Backend services that compute aggregations | Section 5 — Backend Design |
| Operational monitoring dashboards (system health, SLIs, alerting) | Section 13 — Observability Design |
| **Business dashboards (KPIs, success metrics, user-facing analytics)** | **Section 11 — This section** |
| **Data aggregation strategy (pre-computed vs. on-demand, materialized views)** | **Section 11 — This section** |
| **Reporting data model (read model, star schema, denormalized views)** | **Section 11 — This section** |
| **Visualization specifications (chart types, layouts, filters, drill-down)** | **Section 11 — This section** |
| **Report access control (which roles see which dashboards)** | **Section 11 — This section** |
| **Historical data retention and trend reporting** | **Section 11 — This section** |

**Boundary with Observability (Section 13):** Observability covers operational dashboards that answer "is the system healthy?" — SLIs, error rates, latency distributions, infrastructure metrics. This section covers business dashboards that answer "is the feature achieving its goals?" — KPIs, business metrics, user activity trends, reports that stakeholders and end users consume. If a metric serves both purposes (e.g., request volume is both an operational and a business metric), document it in the section that is its primary audience and cross-reference the other.

## When to Use

- Included when the feature involves dashboards, reports, analytics, or business metric visualization
- Runs after `workflow-business-rules-design` (Step 10) and before `deployment-strategy` (Step 12)
- May be omitted only if the feature has no reporting or dashboard needs (confirmed in the design workflow's Step 0)

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| Data model design | `docs/<feature>/solutions-package/design/06-data-model-design.md` — entities, relationships, status columns that reports query | Yes | Yes |
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — service layer, data access layer, caching strategy | Yes | Yes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — endpoints that serve dashboard data (if applicable) | Yes, if dashboards consume APIs | Yes |
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map showing which components produce reportable data | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — reporting tools, visualization libraries, analytics infrastructure | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 5 (Data Architecture: existing analytics infrastructure, data warehouse, reporting tools), Section 3 (Tech Stack: visualization libraries, BI tools) | If discovery ran — identifies existing reporting patterns | Identifies patterns from codebase or user input |
| Requirements package — functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` — reporting capabilities, dashboard specifications, export requirements | Yes | Yes |
| Requirements package — business objectives | `docs/<feature>/requirements-package/requirements/business-objectives.md` — success metrics and KPIs that need dashboards | Yes | Yes |
| Requirements package — permissions-access-control | `docs/<feature>/requirements-package/requirements/permissions-access-control.md` — which roles can see which reports | Yes | Yes |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — reporting performance targets (query response time, data freshness, concurrent users) | Yes | Yes |
| Access to the codebase | Local filesystem or repository — existing dashboard code, report generation services, analytics queries, materialized views | Yes (brownfield) — the AI reads existing reporting patterns | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 5 (Data Architecture) for existing analytics infrastructure — is there a data warehouse, OLAP store, analytics database (e.g., ClickHouse, BigQuery, Redshift), or do reports query the transactional database directly?
- Read Section 3 (Tech Stack) for existing reporting and visualization tools — Metabase, Tableau, PowerBI, Grafana, Looker, custom-built admin dashboards, embedded analytics libraries (Chart.js, D3, Recharts, Apache ECharts).
- Note data pipeline patterns — ETL/ELT jobs, CDC (change data capture), streaming aggregation, or no separate analytics pipeline.
- These tell the AI what reporting infrastructure exists. The AI then reads the actual codebase (Step 2) to extract specific implementations.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI uses the system design's component map to identify reporting-related code, then reads dashboard configurations, report generation services, and analytics queries directly.
- For brownfield projects without codebase access: ask the user to describe existing reporting infrastructure. Record as `user-stated`.
- For greenfield projects: no existing reporting infrastructure. Design from scratch using the technology stack.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  DASHBOARD / REPORTING DESIGN — INTERNAL SEQUENCE                │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read data model (entities, relationships), backend design    │
│     (services, caching), API design (reporting endpoints),       │
│     system design (data producers), technology stack, reqs       │
│     (functional, business objectives, PAC, NFRs).                │
│     If discovery ran: read baseline Sections 3, 5.               │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     reporting patterns (Brownfield only)                         │
│     Read dashboard configs, report services, analytics queries,  │
│     materialized views, ETL jobs, BI tool integrations.          │
├──────────────────────────────────────────────────────────────────┤
│  3. QUESTIONS FIRST — Define what each audience needs to know    │
│     For each dashboard audience: what questions must the         │
│     dashboard answer? Design from questions, not metrics.        │
├──────────────────────────────────────────────────────────────────┤
│  4. METRICS — Define metrics and KPIs                            │
│     For each question: what metric answers it? Define            │
│     calculation, source data, granularity, and dimensions.       │
├──────────────────────────────────────────────────────────────────┤
│  5. AGGREGATION — Design data aggregation strategy               │
│     Real-time vs. batch, pre-computed vs. on-demand,             │
│     materialized views vs. live queries, read model design.      │
├──────────────────────────────────────────────────────────────────┤
│  6. DASHBOARDS — Design dashboard layout and visualizations      │
│     Information hierarchy, chart types, filters, drill-down      │
│     paths, default time ranges.                                  │
├──────────────────────────────────────────────────────────────────┤
│  7. REPORTS — Design report specifications                       │
│     Scheduled reports, on-demand exports, delivery channels,     │
│     report formats (PDF, CSV, Excel).                            │
├──────────────────────────────────────────────────────────────────┤
│  8. ACCESS CONTROL — Define who sees what                        │
│     Map roles to dashboards and reports. Align with              │
│     permissions-access-control from requirements.                │
├──────────────────────────────────────────────────────────────────┤
│  9. REFRESH & RETENTION — Design data freshness and history      │
│     Refresh cadence, caching, staleness tolerance, historical    │
│     data retention for trend reporting.                          │
├──────────────────────────────────────────────────────────────────┤
│  10. VALIDATE — Check against requirements and upstream sections │
├──────────────────────────────────────────────────────────────────┤
│  11. ASSEMBLE — Write the dashboard/reporting section            │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. This skill depends on the data model design and backend design having been completed.

From the **requirements package**, collect:
- **Business objectives** — success metrics and KPIs that need dashboards (e.g., "reduce refund processing time by 20%," "track conversion rates by channel")
- **Functional requirements** — reporting capabilities (e.g., "managers can view a refund summary dashboard," "users can export their transaction history")
- **Permissions-access-control** — which roles can access which reports and dashboards
- **NFRs** — reporting performance targets (e.g., "dashboard loads in under 3 seconds," "reports support 50 concurrent users," "data freshness within 15 minutes")

From the **data model** (Section 6), note:
- Entities with status/state columns — these are the primary dimensions for status-based reports
- Entities with timestamps — these drive time-series analysis
- Entities with financial/quantity fields — these are the primary measures for aggregation
- Relationships between entities — these determine which joins are needed for cross-entity reports

From the **backend design** (Section 5), note:
- Existing caching strategy — reporting queries should align with or extend it
- Service boundaries — which services own the data that feeds reports
- Background processing — existing patterns for scheduled data aggregation

From the **technology stack** (Section 2), note:
- Visualization tools or libraries (e.g., Chart.js, D3.js, Recharts, Apache ECharts, Grafana, Metabase)
- Analytics databases (e.g., ClickHouse, BigQuery, Redshift, PostgreSQL with analytics extensions)
- BI tools (e.g., Tableau, PowerBI, Looker, Metabase)
- Data pipeline tools (e.g., dbt, Airflow, Kafka Connect, Debezium)

### Step 2 — Extract Existing Reporting Patterns from the Codebase (Brownfield Only)

Read reporting-related code to understand existing patterns.

| Pattern Area | What to Read |
|-------------|-------------|
| **Dashboard tooling** | BI tool configurations (Metabase questions/dashboards, Tableau workbooks, Grafana dashboard JSON), embedded analytics components, admin dashboard code |
| **Reporting services** | Report generation services, analytics query builders, aggregation endpoints, export functionality |
| **Data aggregation** | Materialized views, database views, scheduled aggregation jobs, ETL/ELT pipelines, CQRS read models |
| **Analytics queries** | Complex queries used for reporting — joins, aggregations, window functions, CTEs. Note which tables they hit and how they handle large datasets |
| **Caching for reports** | Report-specific caching (pre-computed summaries, cached query results, CDN-cached report files) |
| **Export functionality** | How existing reports are exported — PDF generation, CSV export, Excel generation, email delivery |
| **Access control** | How existing dashboards and reports restrict access — role-based filtering, tenant isolation, data masking |

**What to look for specifically:**

| Technology | Key Files to Read |
|-----------|------------------|
| **Metabase** | Metabase API configurations, saved questions, dashboard definitions, collection permissions |
| **Grafana** | Dashboard JSON files, data source configurations, variable definitions, panel queries |
| **Custom dashboards** | Dashboard components, charting library usage, API calls for dashboard data, state management for filters |
| **SQL views** | Database views (`CREATE VIEW`), materialized views (`CREATE MATERIALIZED VIEW`), stored procedures for reports |
| **dbt** | Model definitions, sources, tests, exposures (which dashboards consume which models) |
| **Report services** | Report generation code, template engines, PDF libraries, scheduled report delivery |

Present the extracted patterns: **"I've read the existing reporting and dashboard code and identified the following patterns. Please confirm these are accurate, and let me know if there are reporting tools or patterns the code doesn't fully reflect (e.g., dashboards configured in a BI tool outside the codebase)."**

For greenfield projects, skip this step.

### Step 3 — Define Dashboard Questions (Questions First)

For each audience identified in the requirements, define the questions their dashboard must answer. Design from questions, not from available metrics — every panel on a dashboard should answer a real question. If a metric doesn't answer a question that someone in this audience actually asks, it doesn't belong on their dashboard.

**Step 3a — Identify audiences.** From the requirements package (functional requirements, permissions-access-control), identify who needs dashboards:

| Audience | Role(s) | Primary Goal | Example Questions |
|----------|---------|-------------|-------------------|
| *(e.g., Operations Manager)* | *(refund_manager, admin)* | *(Monitor refund processing efficiency)* | *(How many refunds are pending? What's the average processing time? Are we hitting SLA targets?)* |
| *(e.g., Finance Analyst)* | *(finance_viewer)* | *(Track refund costs and trends)* | *(What's the total refund value this month? How does it compare to last month? Which products have the highest refund rate?)* |
| *(e.g., End User)* | *(customer)* | *(Track their own refund status)* | *(What's the status of my refund? When was it last updated?)* |

**Step 3b — Define questions per audience.** For each audience, define the specific questions the dashboard must answer, organized into categories:

| Category | Question | Priority | Requirement |
|----------|----------|----------|-------------|
| **Health / Status** | *(Is the refund pipeline healthy? Are there bottlenecks?)* | *(Must have)* | *(FR-12)* |
| **Volume / Throughput** | *(How many refunds were processed today? This week? This month?)* | *(Must have)* | *(BO-01)* |
| **Performance** | *(What's the average time from submission to resolution?)* | *(Must have)* | *(NFR-03)* |
| **Trends** | *(Is the refund rate increasing or decreasing over time?)* | *(Should have)* | *(BO-02)* |
| **Breakdown** | *(Which product categories have the highest refund rate?)* | *(Should have)* | *(FR-14)* |

**Anti-pattern check:** If a question is answered by "show a count of X," verify that someone actually uses that count to make a decision. If the answer is "it's nice to know," deprioritize it. Dashboards that show everything answer nothing.

### Step 4 — Define Metrics and KPIs

For each question from Step 3, define the metric that answers it:

| Metric | Definition | Calculation | Source Entities | Dimensions | Granularity | Requirement |
|--------|-----------|-------------|----------------|-----------|-------------|-------------|
| *(Pending refund count)* | *(Number of refunds currently in PENDING or UNDER_REVIEW status)* | *(COUNT WHERE status IN ('pending', 'under_review'))* | *(refunds)* | *(status, assigned_reviewer)* | *(Real-time)* | *(FR-12)* |
| *(Average resolution time)* | *(Mean time from refund creation to terminal state)* | *(AVG(resolved_at - created_at) WHERE status IN ('approved', 'rejected', 'expired'))* | *(refunds)* | *(status, product_category, time period)* | *(Daily)* | *(NFR-03)* |
| *(Refund rate)* | *(Percentage of orders that result in a refund)* | *(COUNT(refunds) / COUNT(orders) * 100)* | *(refunds, orders)* | *(product_category, time period)* | *(Weekly)* | *(BO-02)* |
| *(Total refund value)* | *(Sum of all refund amounts in the period)* | *(SUM(amount) WHERE status = 'completed')* | *(refunds)* | *(time period, product_category, refund_reason)* | *(Daily)* | *(BO-01)* |

**Metric classification:**

| Type | Description | Example | Aggregation Implication |
|------|-------------|---------|------------------------|
| **Point-in-time** | Current state snapshot — changes constantly | Pending refund count | Live query or very short cache (< 1 min) |
| **Period aggregate** | Calculated over a time window | Avg resolution time this week | Pre-computed or cached, refreshed on cadence |
| **Trend** | Period aggregate compared across periods | Refund rate this month vs. last month | Requires historical aggregates; pre-compute and store |
| **Ratio** | One metric divided by another | Approval rate (approved / total) | Compute from component aggregates; avoid double-counting |

### Step 5 — Design Data Aggregation Strategy

For each metric from Step 4, determine how the data is aggregated:

**Step 5a — Aggregation approach per metric:**

| Metric | Query Complexity | Data Volume | Freshness Need | Approach | Rationale |
|--------|-----------------|-------------|---------------|----------|-----------|
| *(Pending refund count)* | *(Simple — single table, status filter)* | *(Low — typically < 1000 pending)* | *(Real-time)* | *(Live query)* | *(Low volume, simple query, needs current state)* |
| *(Average resolution time)* | *(Medium — date arithmetic, filtering)* | *(High — all historical refunds)* | *(Hourly)* | *(Pre-computed — materialized view refreshed hourly)* | *(Expensive to compute over full history on every request)* |
| *(Refund rate)* | *(High — cross-entity join, ratio calculation)* | *(Very high — all orders and refunds)* | *(Daily)* | *(Pre-computed — scheduled aggregation job writes to summary table)* | *(Cross-entity join on large tables; result changes slowly)* |

**Step 5b — Aggregation infrastructure decision.** Based on the aggregation approaches above, determine what infrastructure is needed:

| Option | When to Use | Trade-offs |
|--------|------------|------------|
| **Live queries against transactional DB** | Simple metrics, low volume, real-time freshness required | No additional infrastructure; risk of impacting transactional performance for complex queries |
| **Database views** | Moderate complexity; reusable query logic | Simplifies application code; still hits transactional DB on every query |
| **Materialized views** | Complex aggregations that don't need real-time freshness | Pre-computed for fast reads; requires refresh strategy; not all DBs support well |
| **Summary / aggregation tables** | High-volume period aggregates, trend reporting | Fast reads from pre-computed data; requires a background job to maintain; data is as fresh as the last job run |
| **Read replica** | Reporting queries that are too heavy for the primary DB | Isolates reporting load from transactional workload; eventual consistency lag |
| **Separate analytics store** (ClickHouse, BigQuery, Redshift) | Large-scale analytics, complex queries, high concurrency | Optimized for analytical queries; requires data pipeline (ETL/CDC); additional infrastructure |
| **CQRS read model** | Application needs different query shapes than the write model | Optimized read model; maintained via event sourcing or projections; eventual consistency |

Present the decision: **"Based on the metrics and their aggregation needs, I recommend [approach]. Here's the rationale: [rationale]. Does this align with your infrastructure constraints and preferences?"**

**Step 5c — Reporting data model (if a separate read model is needed).**

If metrics require a separate read model (summary tables, star schema, denormalized views), design it:

| Table / View | Type | Source | Refresh | Purpose |
|-------------|------|--------|---------|---------|
| *(refund_daily_summary)* | *(Summary table)* | *(refunds, orders)* | *(Nightly batch job)* | *(Daily refund counts, totals, averages by product category)* |
| *(refund_status_snapshot)* | *(Materialized view)* | *(refunds)* | *(Every 15 minutes)* | *(Current state distribution for the operations dashboard)* |

For each summary table, define:
- Columns (dimensions + measures)
- How it is populated (SQL, ETL job, event handler)
- Refresh cadence and mechanism
- Retention period

**Star schema design (if applicable):**

If the reporting needs are complex enough to warrant a dimensional model:

```
                ┌──────────────┐
                │  dim_date    │
                └──────┬───────┘
                       │
┌──────────────┐  ┌────┴──────────┐  ┌──────────────┐
│ dim_product  ├──┤ fact_refunds  ├──┤ dim_customer │
└──────────────┘  └────┬──────────┘  └──────────────┘
                       │
                ┌──────┴───────┐
                │ dim_reason   │
                └──────────────┘
```

### Step 6 — Design Dashboard Layout and Visualizations

For each audience from Step 3, design the dashboard:

**Dashboard: [Dashboard Name] — Audience: [Role(s)]**

**Information hierarchy.** Organize panels from most important (top-left) to least important (bottom-right), grouped by category:

| Section | Position | Panel | Visualization Type | Metric(s) | Default Time Range | Filters |
|---------|----------|-------|-------------------|-----------|-------------------|---------|
| **Overview** | *(Top row)* | *(Active refund count)* | *(Stat / big number)* | *(Pending + Under Review count)* | *(Current)* | *(None)* |
| **Overview** | *(Top row)* | *(Avg resolution time)* | *(Stat with trend arrow)* | *(Avg resolution time, period-over-period change)* | *(Last 7 days)* | *(None)* |
| **Overview** | *(Top row)* | *(Approval rate)* | *(Gauge)* | *(Approved / Total this period)* | *(Last 30 days)* | *(None)* |
| **Trends** | *(Second row)* | *(Refund volume over time)* | *(Line chart)* | *(Daily refund count, stacked by status)* | *(Last 30 days)* | *(Product category, Refund reason)* |
| **Trends** | *(Second row)* | *(Refund value over time)* | *(Area chart)* | *(Daily total refund value)* | *(Last 30 days)* | *(Product category)* |
| **Breakdown** | *(Third row)* | *(Refunds by category)* | *(Horizontal bar chart)* | *(Refund count by product category)* | *(Last 30 days)* | *(Status)* |
| **Detail** | *(Bottom)* | *(Recent refunds table)* | *(Data table with pagination)* | *(Individual refund records)* | *(Last 7 days)* | *(Status, Reviewer, Amount range)* |

**Visualization selection guidance:**

| Data Pattern | Recommended Visualization | Avoid |
|-------------|--------------------------|-------|
| Single current value | Stat / big number (with trend indicator) | Pie chart, bar chart |
| Value against a target | Gauge or progress bar | Line chart |
| Change over time (one series) | Line chart or area chart | Bar chart (unless discrete periods) |
| Change over time (multiple series) | Multi-line or stacked area chart | Pie chart |
| Part-of-whole composition | Stacked bar or treemap | Pie chart (hard to compare similar-sized segments) |
| Comparison across categories | Horizontal bar chart | Pie chart, radar chart |
| Distribution | Histogram or box plot | Line chart |
| Individual records | Data table with sort/filter/pagination | Any chart |
| Geographic distribution | Choropleth map or bubble map | Bar chart |

**Filter and drill-down design:**

| Filter | Type | Default Value | Applies To | Source |
|--------|------|--------------|-----------|--------|
| *(Time range)* | *(Date range picker)* | *(Last 30 days)* | *(All panels)* | *(Global filter)* |
| *(Product category)* | *(Multi-select dropdown)* | *(All)* | *(Trend and breakdown panels)* | *(dim_product or products table)* |
| *(Refund status)* | *(Multi-select dropdown)* | *(All)* | *(Volume and detail panels)* | *(Enum values from data model)* |

| Drill-down Path | From | To | Interaction |
|----------------|------|----|-------------|
| *(Category → individual refunds)* | *(Refunds by category bar chart)* | *(Detail table filtered by clicked category)* | *(Click bar segment)* |
| *(Time period → daily detail)* | *(Monthly trend line chart)* | *(Same chart zoomed to daily granularity)* | *(Click point or drag to select range)* |
| *(Refund row → refund detail)* | *(Data table)* | *(Individual refund detail page)* | *(Click row)* |

### Step 7 — Design Report Specifications (If Applicable)

Only include this step if the feature requires downloadable or scheduled reports beyond interactive dashboards.

| Report | Format | Trigger | Audience | Content | Delivery | Requirement |
|--------|--------|---------|----------|---------|----------|-------------|
| *(Weekly refund summary)* | *(PDF)* | *(Scheduled — every Monday 08:00)* | *(Finance team)* | *(Total refund value, count by status, top refund reasons, week-over-week trend)* | *(Email to distribution list)* | *(FR-15)* |
| *(Refund detail export)* | *(CSV / Excel)* | *(On-demand — user clicks Export)* | *(Operations managers)* | *(All refund records matching current filters)* | *(Browser download)* | *(FR-16)* |
| *(Monthly executive summary)* | *(PDF)* | *(Scheduled — 1st of month)* | *(VP+)* | *(Refund rate trend, cost impact, category analysis, SLA compliance)* | *(Email)* | *(FR-17)* |

**Report design rules:**
- Scheduled reports include a header with the report period, generation timestamp, and filter criteria applied
- Export reports match the current dashboard filter state — what the user sees is what they export
- Large exports (> 10,000 rows) are generated asynchronously with a download link, not inline
- Report generation does not block the transactional database — use read replicas or pre-computed data

### Step 8 — Define Report and Dashboard Access Control

Map roles to dashboards and reports, aligned with the permissions-access-control requirements:

| Dashboard / Report | Roles with Access | Data Scope | Row-Level Filter | Requirement |
|-------------------|------------------|-----------|-----------------|-------------|
| *(Operations dashboard)* | *(refund_manager, admin)* | *(All refunds)* | *(None — sees all)* | *(PAC-06)* |
| *(Team performance dashboard)* | *(refund_manager)* | *(Own team's refunds only)* | *(WHERE reviewer_team = user.team)* | *(PAC-07)* |
| *(My refunds view)* | *(customer)* | *(Own refunds only)* | *(WHERE customer_id = user.id)* | *(PAC-08)* |
| *(Finance summary report)* | *(finance_viewer, admin)* | *(Aggregated — no PII)* | *(Amounts and counts only — no customer names)* | *(PAC-09)* |

**Access control design decisions:**
- **Dashboard-level access** — enforced by the dashboard platform (role-based visibility) or the application's route guards
- **Row-level security** — enforced in the query layer (WHERE clause injection based on user context) or the database (row-level security policies)
- **Column-level restrictions** — sensitive fields (customer PII, financial details) masked or excluded for roles that don't need them
- **Data masking** — for dashboards that show individual records to restricted roles, define which fields are masked (e.g., customer name → "J*** D**")

### Step 9 — Design Refresh and Retention Strategy

**Refresh strategy per dashboard/metric:**

| Metric / Dashboard | Freshness Requirement | Refresh Mechanism | Staleness Tolerance | Cache TTL |
|-------------------|----------------------|-------------------|--------------------|-----------| 
| *(Pending refund count)* | *(Real-time)* | *(Live query on page load + WebSocket push on status change)* | *(< 30 seconds)* | *(No cache — always live)* |
| *(Operations dashboard — trend panels)* | *(Hourly)* | *(Materialized view refreshed every hour; dashboard polls every 5 minutes)* | *(Up to 1 hour)* | *(5 minutes)* |
| *(Finance summary)* | *(Daily)* | *(Nightly aggregation job writes to summary table; dashboard reads from summary)* | *(Up to 24 hours)* | *(1 hour)* |
| *(Weekly PDF report)* | *(Weekly)* | *(Scheduled generation from summary tables)* | *(Point-in-time snapshot)* | *(N/A — generated once)* |

**Auto-refresh behavior:**
- Dashboards that show real-time data auto-refresh at the interval matching their staleness tolerance
- Dashboards showing period aggregates default to manual refresh with an auto-refresh option
- All dashboards show a "last updated" timestamp so users know data freshness

**Historical data retention:**

| Data | Retention Period | Granularity After Aging | Rationale | Requirement |
|------|-----------------|------------------------|-----------|-------------|
| *(Raw refund records)* | *(Per data model retention — typically 7 years for financial data)* | *(Full detail retained)* | *(Regulatory / audit requirements)* | *(NFR-08)* |
| *(Daily summary aggregates)* | *(3 years)* | *(Daily granularity retained)* | *(Supports year-over-year trend analysis)* | *(BO-02)* |
| *(Hourly operational snapshots)* | *(90 days)* | *(Roll up to daily after 90 days)* | *(Hourly detail only needed for recent operational analysis)* | *(NFR-09)* |

**Archival strategy:** If historical data ages out of the hot store, define where it goes (cold storage, data lake) and whether it remains queryable for historical trend reports.

### Step 10 — Validate

Check the completed dashboard and reporting design against:

- **Requirements** — does every functional requirement for reporting have a corresponding dashboard panel, metric, or report? Are any requirements unaddressed?
- **Business objectives** — does every KPI / success metric from the business objectives have a dashboard visualization?
- **Data model** — do all metrics reference entities and columns that exist in the data model (Section 6)? Are the joins feasible?
- **Backend design** — if metrics are served via API endpoints, do those endpoints exist in the API design (Section 7)? If aggregation services are needed, are they covered in the backend design (Section 5)?
- **Access control** — are the role-to-dashboard mappings consistent with the permissions-access-control requirements? Are they consistent with the security design (Section 9)?
- **NFRs** — are the freshness requirements, query performance targets, and concurrent user targets achievable with the chosen aggregation strategy?
- **Observability boundary** — are business dashboards (this section) clearly separated from operational dashboards (Section 13)? No metric is orphaned between the two sections.
- **Traceability** — does every metric, dashboard panel, and report trace to a requirement?

### Step 11 — Assemble

Combine all sections into the dashboard / reporting design output. This becomes Section 11 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/11-dashboard-reporting.md` using the template at `../assets/dashboard-reporting-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Reporting Patterns** — how the current system handles dashboards, reports, data aggregation, and analytics infrastructure (from Step 2)

**2. Dashboard Questions** — audience definitions and the questions each dashboard must answer (from Step 3)

**3. Metrics and KPIs** — metric definitions, calculations, source data, granularity, and dimensions (from Step 4)

**4. Data Aggregation Strategy** — aggregation approach per metric, infrastructure decisions, reporting data model if applicable (from Step 5)

**5. Dashboard Layout and Visualizations** — dashboard designs with information hierarchy, visualization types, filters, and drill-down paths (from Step 6)

**6. Report Specifications** — scheduled and on-demand report definitions with format, content, and delivery (from Step 7, if applicable)

**7. Access Control** — role-to-dashboard mappings, row-level security, column-level restrictions, data masking (from Step 8)

**8. Refresh and Retention** — refresh cadence per metric, auto-refresh behavior, historical data retention and archival (from Step 9)

**9. Requirements Traceability** — every metric, dashboard panel, and report traces to the requirement that drives it

### For Greenfield Projects

Same structure, omitting Section 1 (Existing Reporting Patterns).

---

## Requirements Traceability

Every metric, dashboard panel, report, and aggregation component must trace to the requirement that drives it.

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| *(Pending refund count — stat panel)* | *(dashboard panel)* | *(FR-12)* | *(Operations managers can see current refund pipeline status)* |
| *(Average resolution time metric)* | *(metric / KPI)* | *(NFR-03, BO-01)* | *(Refund processing SLA; track resolution time improvements)* |
| *(Refund rate trend — line chart)* | *(dashboard panel)* | *(BO-02)* | *(Track whether refund rate is improving over time)* |
| *(Weekly refund summary PDF)* | *(scheduled report)* | *(FR-15)* | *(Finance team receives weekly refund cost summary)* |
| *(refund_daily_summary table)* | *(aggregation infrastructure)* | *(NFR-03, FR-14)* | *(Pre-compute daily aggregates for dashboard performance)* |

If a design element cannot be traced to a requirement, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `deployment-strategy`, you must:

1. Write the completed dashboard / reporting design in full.
2. Present it to the user for review with the following questions:
   - **Questions:** Do the dashboard questions match what each audience actually needs to know? Are there questions I've missed?
   - **Metrics:** Are the metric definitions and calculations correct? Are there KPIs or success metrics that aren't covered?
   - **Aggregation:** Is the data aggregation strategy appropriate? Is the balance between live queries and pre-computed data right for your infrastructure and performance needs?
   - **Dashboards:** Are the layouts and visualizations right? Are the chart types appropriate for the data patterns? Are the filters and drill-down paths what users expect?
   - **Reports:** Are the scheduled and on-demand reports correct? Are the formats and delivery channels right?
   - **Access control:** Are the role-to-dashboard mappings correct? Is the row-level security appropriate?
   - **Freshness:** Are the refresh cadences and staleness tolerances acceptable?
   - **Retention:** Is the historical data retention period sufficient for trend reporting needs?
   - **Traceability:** Is every design element connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the design is accurate.

## Completion Criteria

- [ ] For brownfield: existing reporting patterns are extracted from the codebase (dashboard configs, report services, analytics queries, materialized views) and confirmed by the user
- [ ] Dashboard questions are defined per audience — every panel answers a real question, not just "show a metric"
- [ ] Every business objective / KPI from the requirements has a corresponding metric with a defined calculation
- [ ] Every reporting functional requirement has a corresponding dashboard panel or report
- [ ] Metrics are classified by type (point-in-time, period aggregate, trend, ratio) with appropriate aggregation implications
- [ ] Data aggregation strategy is defined per metric: live query, materialized view, summary table, or analytics store
- [ ] If a separate reporting data model is needed (summary tables, star schema), it is designed with columns, refresh mechanism, and retention
- [ ] Dashboard layouts are designed with information hierarchy — most important metrics are most prominent
- [ ] Visualization types are appropriate for the data pattern (no pie charts for time-series, no line charts for category comparison)
- [ ] Filters and drill-down paths are defined for each dashboard
- [ ] If scheduled or on-demand reports are required: format, content, delivery channel, and generation approach are defined
- [ ] Access control maps roles to dashboards and reports, consistent with permissions-access-control requirements (PAC)
- [ ] Row-level security and column-level restrictions are defined where needed
- [ ] Refresh cadence is defined per metric/dashboard with staleness tolerance
- [ ] Historical data retention periods are defined with aging/archival strategy
- [ ] Metrics reference entities and columns that exist in the data model (Section 6)
- [ ] Aggregation services (if needed) are consistent with the backend design (Section 5)
- [ ] Business dashboards are clearly separated from operational dashboards (Section 13 — Observability)
- [ ] Requirements traceability is complete — every metric, panel, report, and aggregation component traces to a requirement
- [ ] The user has explicitly confirmed the design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A dashboard shows every available metric with no structure, so users can't find what matters | Step 3 starts from audience questions, not metrics — every panel must answer a question someone actually asks |
| Reports query the transactional database with expensive aggregations, degrading application performance | Step 5 explicitly evaluates each metric's query complexity and data volume, recommending pre-computation or read replicas for expensive queries |
| A dashboard is designed but the data model doesn't have the fields or relationships to support its metrics | Step 10 validates that every metric references entities and columns that exist in the data model (Section 6) |
| Report access control is an afterthought — sensitive financial data is visible to roles that shouldn't see it | Step 8 maps roles to dashboards and defines row-level and column-level restrictions, aligned with permissions-access-control requirements |
| A KPI from the business objectives has no dashboard or report — the feature ships but no one can tell if it's achieving its goals | Step 4 maps every business objective and KPI to a metric; Step 10 validates that none are missing |
| Pre-computed aggregates go stale and no one knows whether the dashboard is showing current data | Step 9 defines refresh cadence per metric with staleness tolerance, and requires a "last updated" indicator on all dashboards |
| Historical trend reports fail because old data was purged — there's nothing to compare against | Step 9 defines historical data retention periods per data type with aging and archival strategy |
| Dashboard is built with real-time live queries for metrics that don't need real-time freshness, wasting resources | Step 4 classifies metrics by type (point-in-time vs. period aggregate vs. trend) and Step 5 matches aggregation approach to freshness need |
| The reporting design overlaps with the observability design — the same metric is specified in both places with conflicting definitions | The boundary section at the top of this skill and Step 10 validation explicitly separate business dashboards (Section 11) from operational dashboards (Section 13) |
| A scheduled report is generated by querying the production database during peak hours, causing slowdowns | Step 7 requires that report generation uses read replicas or pre-computed data, never blocking the transactional database |
| Drill-down paths are missing — a dashboard shows a high-level number but the user can't investigate why it changed | Step 6 requires drill-down paths for each dashboard, defining how users navigate from summary to detail |
| The new dashboard uses a different visualization tool than existing dashboards, fragmenting the reporting experience | Step 2 (brownfield) extracts existing tooling patterns and Step 5 presents the infrastructure decision for user confirmation |
| Pie charts are used for time-series data or comparison of many categories, making the visualization unreadable | Step 6 includes a visualization selection guide that maps data patterns to appropriate chart types |
