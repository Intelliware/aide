# Observability Design

## Purpose

Design the observability strategy for the feature — logging, monitoring, and alerting so the team knows it is working, degrading, or failing in production. Consumes: the existing-architecture-assessment (existing monitoring infrastructure, logging conventions, tracing setup, alerting configuration), the system-design (new components and integration seams that need observability), and the requirements package (nonfunctional requirements for availability and performance targets that need monitoring). For brownfield projects, designs observability to extend the existing monitoring infrastructure — same metrics format, same logging framework, same tracing propagation — adding coverage for new components and modified behavior. Covers: metrics to emit (business metrics, technical metrics, SLI/SLO metrics), logging standards (log levels, structured fields, correlation IDs), distributed tracing (span design for new call paths), alert thresholds (when to page, when to warn, linked to NFR targets), and dashboard specifications (what to visualize for the new feature). Produces observability design that is Section 13 of the solution design package.

## What This Produces

The observability strategy for the feature — how the team knows the feature is working, degrading, or failing in production. This section designs the metrics to emit, the logging standards to follow, the distributed tracing spans to create, the alerts to configure, and the operational dashboards to build. The goal is to ensure that when something goes wrong, the team can detect it quickly, locate the problem, and understand its impact.

This is Section 13 of the solution design package. It consumes outputs from all prior sections:
- **System design** (Section 3) — new components and integration seams that need observability coverage
- **Backend design** (Section 5) — service layer, error handling, cross-cutting concerns (logging, correlation IDs, health checks)
- **API design** (Section 7) — endpoints that need latency and error rate monitoring
- **Integration design** (Section 8) — external system calls that need circuit breaker monitoring and dependency health tracking
- **Deployment strategy** (Section 12) — rollout monitoring signals and canary verification criteria

**What this section covers vs. what other sections cover:**

| Concern | Where It Lives |
|---------|---------------|
| Health check endpoint implementation (liveness, readiness) | Section 5 — Backend Design |
| Logging format and correlation ID propagation in code | Section 5 — Backend Design |
| Rollout-specific monitoring signals and halt criteria | Section 12 — Deployment Strategy |
| Business dashboards (KPIs, success metrics, user-facing analytics) | Section 11 — Dashboard / Reporting |
| **SLI/SLO definitions derived from NFRs** | **Section 13 — This section** |
| **Metrics to emit (technical and operational)** | **Section 13 — This section** |
| **Structured logging standards for the feature** | **Section 13 — This section** |
| **Distributed tracing span design** | **Section 13 — This section** |
| **Alert definitions (thresholds, severity, routing, runbooks)** | **Section 13 — This section** |
| **Operational dashboard specifications** | **Section 13 — This section** |

**Boundary with Dashboard / Reporting (Section 11):** Section 11 covers **business dashboards** that answer "is the feature achieving its goals?" — KPIs, business metrics, user activity trends. This section covers **operational dashboards** that answer "is the feature healthy?" — error rates, latency, throughput, saturation. If a metric serves both purposes, document it in the section that is its primary audience and cross-reference the other.

**Boundary with Deployment Strategy (Section 12):** Section 12 defines what to monitor *during rollout* and when to halt/rollback. This section defines the *steady-state* monitoring infrastructure that persists after deployment is complete. The rollout monitoring signals from Section 12 are a subset of the signals defined here — Section 12 specifies which of these signals are rollout-critical and what their halt thresholds are.

## When to Use

- Always included unless the change is documentation-only
- Runs after `deployment-strategy` (Step 12) and before `testability-design` (Step 14)
- Even simple changes need an observability section — if only to confirm "follows existing observability patterns, no new metrics or alerts needed"

## Inputs

| Input | Source | Required | If discovery was skipped |
|-------|--------|----------|--------------------------|
| System design | `docs/<feature>/solutions-package/design/03-system-design.md` — component map, new/modified components, integration seams | Yes | Yes |
| Backend design | `docs/<feature>/solutions-package/design/05-backend-design.md` — service layer, error handling, logging conventions, health checks, correlation IDs | Yes | Yes |
| API design | `docs/<feature>/solutions-package/design/07-api-design.md` — endpoints that need monitoring | If API changes | If API changes |
| Integration design | `docs/<feature>/solutions-package/design/08-integration-design.md` — external system calls, circuit breakers | If integrations change | If integrations change |
| Deployment strategy | `docs/<feature>/solutions-package/design/12-deployment-strategy.md` — rollout monitoring signals, canary verification criteria | Yes | Yes |
| Technology stack | `docs/<feature>/solutions-package/design/02-technology-stack.md` — monitoring tools (Datadog, Grafana, Prometheus, CloudWatch), logging framework (Winston, Pino, Serilog), tracing system (OpenTelemetry, Jaeger, Zipkin) | Yes | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — Section 8 (Performance Characteristics: observability stack — monitoring tools, logging framework, tracing setup, alerting configuration, scaling constraints) | If discovery ran — identifies existing observability infrastructure at the architectural level; specific configurations are derived from the codebase in Step 2 | Identifies patterns from codebase or user input |
| Requirements package — NFRs | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` — availability targets (uptime SLA), performance targets (latency budgets), reliability targets (error budgets) | Yes | Yes |
| Access to the codebase | Local filesystem or repository — monitoring configuration, logging setup, alert definitions, dashboard configs, tracing instrumentation | Yes (brownfield) — the AI reads existing observability infrastructure | Yes if available; otherwise user provides description |

> **Missing input guard:** If the requirements package or any required input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[path]` but it was not found. This input is required. Please provide it or confirm I should proceed without it."*

## Did Discovery Run?

**Discovery ran** if `docs/<feature>/solutions-package/discovery/architecture-baseline.md` exists:

- Read Section 8 (Performance Characteristics) — the observability stack: what monitoring tools exist, what logging framework is in use, whether distributed tracing is configured, what alerting is in place, and what is missing. Also note scaling constraints and performance-relevant architecture decisions.
- This tells the AI what observability infrastructure exists at the architectural level (e.g., "Prometheus for metrics, structured JSON logging via Pino, OpenTelemetry for tracing, PagerDuty for alerting"). The AI then reads the actual codebase (Step 2) to extract specific configurations — metric names, log field conventions, alert thresholds, dashboard definitions.

**Discovery was skipped:**

- For brownfield projects with codebase access: the AI reads monitoring configs, logging setup, alert definitions, and tracing instrumentation directly.
- For brownfield projects without codebase access: ask the user to describe existing observability infrastructure. Record as `user-stated`.
- For greenfield projects: no existing observability infrastructure. Design from scratch using the technology stack.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  OBSERVABILITY DESIGN — INTERNAL SEQUENCE                        │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read all inputs                                       │
│     Read system design (components, seams), backend design       │
│     (error handling, logging, health checks), API design         │
│     (endpoints), integration design (external calls),            │
│     deployment strategy (rollout signals), technology stack,     │
│     requirements (NFRs for availability, performance).           │
│     If discovery ran: read baseline Section 8.                   │
├──────────────────────────────────────────────────────────────────┤
│  2. EXTRACT EXISTING — Read the codebase to extract existing     │
│     observability patterns (Brownfield only)                     │
│     Read monitoring configs, logging setup, alert definitions,   │
│     dashboard configs, tracing instrumentation.                  │
├──────────────────────────────────────────────────────────────────┤
│  3. SLI/SLO — Define service level indicators and objectives     │
│     Derive from NFRs: what to measure, what targets to set,     │
│     what error budgets to establish.                             │
├──────────────────────────────────────────────────────────────────┤
│  4. METRICS — Design metrics to emit                             │
│     Technical metrics, operational metrics, and the              │
│     instrumentation points where they are emitted.               │
├──────────────────────────────────────────────────────────────────┤
│  5. LOGGING — Design structured logging standards                │
│     Log levels, structured fields, what to log at each level,   │
│     sensitive data handling, correlation ID propagation.         │
├──────────────────────────────────────────────────────────────────┤
│  6. TRACING — Design distributed tracing spans                   │
│     Span design for new call paths, context propagation,        │
│     trace sampling strategy.                                    │
├──────────────────────────────────────────────────────────────────┤
│  7. ALERTS — Design alert definitions                            │
│     Thresholds derived from SLOs, severity levels, routing,     │
│     runbook links, escalation.                                  │
├──────────────────────────────────────────────────────────────────┤
│  8. DASHBOARDS — Design operational dashboards                   │
│     What to visualize, organized by operator questions.          │
│     Health, performance, throughput, saturation, risk.           │
├──────────────────────────────────────────────────────────────────┤
│  9. VALIDATE — Check against requirements and upstream sections  │
├──────────────────────────────────────────────────────────────────┤
│  10. ASSEMBLE — Write the observability design section            │
│      Produce the structured output. Present for review.          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load Inputs

Read all inputs. This skill runs after the deployment strategy is complete.

From the **NFRs** (requirements package), collect:
- **Availability targets** — uptime SLA (e.g., 99.9%) → drives SLO definitions and alerting thresholds
- **Performance targets** — latency budgets (e.g., p99 < 500ms) → drives latency SLIs
- **Reliability targets** — acceptable error rates → drives error budget calculations
- **Throughput expectations** — expected request volume → drives capacity monitoring thresholds

From the **system design** (Section 3), identify:
- All new components that need monitoring coverage
- Integration seams between components (these are failure boundary points)
- Data flow paths (each hop in a flow needs tracing)

From the **backend design** (Section 5), note:
- Logging conventions already defined (structured logging format, correlation IDs)
- Health check endpoints (liveness, readiness) already designed
- Error handling strategy (exception hierarchy, error classification)
- Background processing (jobs that need monitoring)

From the **deployment strategy** (Section 12), note:
- Rollout monitoring signals — these are a subset of metrics defined here
- Canary verification criteria — derived from the SLOs defined here

### Step 2 — Extract Existing Observability Patterns from the Codebase (Brownfield Only)

Read observability-related code to understand existing patterns.

| Pattern Area | What to Read |
|-------------|-------------|
| **Metrics instrumentation** | Metrics library setup (Prometheus client, StatsD, Micrometer), custom metric definitions, metric naming conventions, label/tag conventions |
| **Logging** | Logger configuration (Winston, Pino, Serilog, Log4j), log format (JSON structured, plaintext), log levels in use, correlation ID injection middleware |
| **Tracing** | Tracing SDK setup (OpenTelemetry, Jaeger client, Zipkin), auto-instrumentation config, custom span creation, context propagation |
| **Alerting** | Alert definition files (Prometheus alerting rules, Datadog monitors, CloudWatch alarms, PagerDuty service configs), threshold values, routing rules |
| **Dashboards** | Dashboard configuration files (Grafana JSON, Datadog dashboard definitions, CloudWatch dashboards), panel queries, variable definitions |
| **Log aggregation** | Log shipping configuration (Fluentd, Fluent Bit, Filebeat, CloudWatch Logs agent), log retention policies, index patterns |

**Framework-specific guidance:**

| Framework | Key Files to Read |
|-----------|------------------|
| **Spring Boot** | `application.yml` (management endpoints, metrics export), Micrometer config, actuator endpoints, Sleuth/OpenTelemetry config |
| **NestJS** | Logger service, interceptors for metrics, OpenTelemetry SDK setup, Terminus health checks |
| **Django** | Logging settings in `settings.py`, middleware for request logging, django-prometheus, Sentry config |
| **Express** | Morgan/Pino middleware, prometheus-api-metrics, express-opentelemetry, error handling middleware |
| **FastAPI** | Logging config, prometheus-fastapi-instrumentator, OpenTelemetry ASGI middleware |
| **ASP.NET Core** | `appsettings.json` (Serilog, Application Insights), health check registration, OpenTelemetry exporter config |

Present the extracted patterns: **"I've read the existing observability infrastructure and identified the following patterns. Please confirm these are accurate, and let me know if there are monitoring tools or configurations not captured in the codebase (e.g., dashboards managed in a SaaS tool, alerts configured in PagerDuty UI)."**

For greenfield projects, skip this step.

### Step 3 — Define SLIs and SLOs

Derive service level indicators (SLIs) and objectives (SLOs) from the NFRs.

**Step 3a — Define SLIs:**

An SLI is a measurable indicator of service health. For each NFR that specifies an availability, performance, or reliability target, define the SLI:

| SLI | Definition | Measurement | Good Event | Total Events | Source NFR |
|-----|-----------|-------------|-----------|-------------|-----------|
| *(Availability)* | *(Proportion of successful requests)* | *(Requests returning non-5xx / total requests)* | *(HTTP status < 500)* | *(All HTTP requests)* | *(NFR-01: 99.9% availability)* |
| *(Latency)* | *(Proportion of requests served within the latency target)* | *(Requests with duration < 500ms / total requests)* | *(Duration < 500ms)* | *(All HTTP requests)* | *(NFR-02: p99 < 500ms)* |
| *(Throughput)* | *(Requests processed per second)* | *(Request count per time window)* | *(N/A — capacity metric)* | *(N/A)* | *(NFR-04: support 1000 req/s)* |
| *(Error rate — refund endpoints)* | *(Proportion of refund API calls that succeed)* | *(Refund requests returning 2xx or 4xx / total refund requests)* | *(Non-5xx response)* | *(All refund API requests)* | *(NFR-01)* |

**Step 3b — Define SLOs:**

An SLO is the target for an SLI over a time window. For each SLI, define the objective and the error budget:

| SLI | SLO Target | Time Window | Error Budget | Budget Remaining Means |
|-----|-----------|-------------|-------------|----------------------|
| *(Availability)* | *(99.9%)* | *(30-day rolling)* | *(0.1% = 43.2 minutes/month)* | *(Can tolerate this much downtime before breaching)* |
| *(Latency)* | *(99th percentile < 500ms)* | *(30-day rolling)* | *(1% of requests can exceed 500ms)* | *(Up to 1% slow requests before breaching)* |
| *(Error rate — refund)* | *(99.5%)* | *(7-day rolling)* | *(0.5% of refund requests can fail)* | *(If processing 1000 refunds/day, ~35 failures/week allowed)* |

**Step 3c — Error budget policy:**

Define what happens when error budget is consumed:

| Budget Consumed | Action |
|----------------|--------|
| *(< 50%)* | *(Normal operations — deploy at will)* |
| *(50–80%)* | *(Caution — reduce deployment frequency, prioritize reliability work)* |
| *(80–100%)* | *(Freeze non-critical deployments — focus on reliability improvements)* |
| *(100% — SLO breached)* | *(Incident review — no deploys until root cause addressed and budget recovers)* |

### Step 4 — Design Metrics to Emit

Define every metric the feature needs to emit, organized by the four golden signals plus feature-specific metrics:

**Step 4a — The four golden signals:**

| Signal | Metric Name | Type | Labels/Tags | Description | Source Component |
|--------|------------|------|-------------|-------------|-----------------|
| **Latency** | *(http_request_duration_seconds)* | *(Histogram)* | *(method, path, status_code)* | *(Duration of HTTP requests)* | *(API gateway / service)* |
| **Latency** | *(refund_processing_duration_seconds)* | *(Histogram)* | *(status, reason)* | *(Time from refund creation to terminal state)* | *(Refund service)* |
| **Traffic** | *(http_requests_total)* | *(Counter)* | *(method, path, status_code)* | *(Total HTTP requests)* | *(API gateway / service)* |
| **Errors** | *(http_errors_total)* | *(Counter)* | *(method, path, status_code, error_type)* | *(HTTP responses with 5xx status)* | *(API gateway / service)* |
| **Saturation** | *(db_connection_pool_active)* | *(Gauge)* | *(pool_name)* | *(Active database connections vs. pool max)* | *(Database client)* |
| **Saturation** | *(queue_depth)* | *(Gauge)* | *(queue_name)* | *(Messages waiting in the notification queue)* | *(Queue consumer)* |

**Step 4b — Feature-specific metrics:**

| Metric Name | Type | Labels/Tags | Description | Why This Metric | Requirement |
|------------|------|-------------|-------------|----------------|-------------|
| *(refunds_created_total)* | *(Counter)* | *(reason, product_category)* | *(Total refund requests created)* | *(Tracks feature usage volume; sudden spikes may indicate issues)* | *(BO-01)* |
| *(refunds_state_transitions_total)* | *(Counter)* | *(from_state, to_state)* | *(State machine transitions)* | *(Detects stuck state machines — if transitions stop, something is broken)* | *(FR-05)* |
| *(payment_reversal_duration_seconds)* | *(Histogram)* | *(gateway, status)* | *(Duration of payment gateway reversal calls)* | *(External dependency performance — detects gateway degradation)* | *(NFR-02)* |
| *(payment_reversal_errors_total)* | *(Counter)* | *(gateway, error_type)* | *(Failed payment gateway calls)* | *(Tracks circuit breaker triggers, gateway reliability)* | *(NFR-01)* |

**Metric naming conventions (for consistency with existing metrics):**

| Convention | Rule | Example |
|-----------|------|---------|
| **Namespace** | Prefix with service name | `refund_service_` |
| **Unit suffix** | Include unit in name | `_seconds`, `_bytes`, `_total` |
| **Counter suffix** | Always end counters with `_total` | `requests_total` |
| **Label cardinality** | Keep label values bounded — no user IDs, no UUIDs | `status_code` (bounded), NOT `user_id` (unbounded) |

### Step 5 — Design Structured Logging Standards

**Step 5a — Log levels and what to log at each level:**

| Level | When to Use | Examples for This Feature | Volume |
|-------|------------|--------------------------|--------|
| **ERROR** | Unexpected failures that need investigation; the system cannot fulfil the request | Failed to save refund to DB; payment gateway returned unexpected error; unhandled exception | Low — every ERROR should be actionable |
| **WARN** | Expected but notable conditions that may indicate a problem if frequent | Circuit breaker tripped for payment gateway; refund amount near policy limit; slow query exceeded threshold | Low-medium |
| **INFO** | Significant business events and request lifecycle — the audit trail | Refund created, refund approved, refund rejected, payment reversal completed, state transition | Medium — one per business event |
| **DEBUG** | Detailed diagnostic information for troubleshooting | Service method entry/exit, query parameters, cache hit/miss, rule evaluation details | High — disabled in production unless actively debugging |

**Step 5b — Structured log fields:**

Every log entry must include these fields (JSON format):

| Field | Source | Always Present | Example |
|-------|--------|---------------|---------|
| `timestamp` | Logger | Yes | `2026-04-17T14:30:00.000Z` |
| `level` | Logger | Yes | `info` |
| `message` | Code | Yes | `Refund created` |
| `service` | Config | Yes | `refund-service` |
| `requestId` | Middleware | Yes (for HTTP requests) | `req-abc-123` |
| `traceId` | Tracing SDK | Yes (if tracing enabled) | `trace-def-456` |
| `spanId` | Tracing SDK | Yes (if tracing enabled) | `span-ghi-789` |
| `userId` | Auth middleware | If authenticated | `user-123` |
| `method` | Middleware | For HTTP requests | `POST` |
| `path` | Middleware | For HTTP requests | `/api/refunds` |
| `statusCode` | Middleware | For HTTP responses | `201` |
| `duration_ms` | Middleware | For HTTP responses | `45` |
| `error` | Catch block | For errors only | `{ type: "ValidationError", message: "..." }` |

**Step 5c — Sensitive data rules:**

| Data Type | Rule | How |
|-----------|------|-----|
| Passwords / tokens | Never log | Exclude from log context entirely |
| PII (names, emails, addresses) | Never log at INFO or above | Redact or exclude; DEBUG may include in non-production |
| Financial amounts | Log the amount, not the account | `{ refund_amount: 150.00 }` — never log card numbers or bank accounts |
| Request/response bodies | Log at DEBUG only, with size limits | Truncate bodies > 1KB; redact sensitive fields |

**Step 5d — Correlation ID propagation:**

Define how correlation IDs flow through the system:

| Hop | Propagation Method |
|-----|--------------------|
| *(Client → API gateway)* | *(Client generates `X-Request-ID` header; gateway forwards it)* |
| *(API gateway → Backend service)* | *(Gateway forwards `X-Request-ID`; backend reads or generates if missing)* |
| *(Backend → Downstream service)* | *(Include `X-Request-ID` in outgoing request headers)* |
| *(Backend → Message queue)* | *(Include `requestId` in message metadata/headers)* |
| *(Queue consumer → Processing)* | *(Extract `requestId` from message metadata; set in log context)* |

### Step 6 — Design Distributed Tracing Spans

**Step 6a — Identify trace paths:**

For each user-facing operation in the feature, define the call path and the spans to create:

| Operation | Call Path | Spans |
|-----------|----------|-------|
| *(Create refund)* | *(Client → API Gateway → Refund Service → DB → Payment Gateway → Notification Queue)* | *(1. HTTP request, 2. DB insert, 3. Payment gateway call, 4. Queue publish)* |
| *(Approve refund)* | *(Client → API Gateway → Refund Service → DB → Payment Gateway)* | *(1. HTTP request, 2. State machine transition, 3. DB update, 4. Payment reversal)* |
| *(List refunds)* | *(Client → API Gateway → Refund Service → DB)* | *(1. HTTP request, 2. DB query)* |

**Step 6b — Span design:**

For each custom span (beyond auto-instrumentation), define:

| Span Name | Parent | Attributes | Events | Status |
|-----------|--------|-----------|--------|--------|
| *(refund.create)* | *(HTTP request span)* | *(refund.id, refund.amount, refund.reason)* | *(validation.passed, refund.saved)* | *(OK or ERROR with error type)* |
| *(payment.reversal)* | *(refund.approve)* | *(gateway, refund.id, reversal.amount)* | *(request.sent, response.received)* | *(OK or ERROR with gateway error code)* |
| *(notification.publish)* | *(refund.create)* | *(queue.name, message.type)* | *(message.published)* | *(OK or ERROR)* |

**Step 6c — Sampling strategy:**

| Environment | Sampling Rate | Rationale |
|------------|-------------|-----------|
| *(Development)* | *(100%)* | *(Trace everything for debugging)* |
| *(Staging)* | *(100%)* | *(Full visibility for pre-production testing)* |
| *(Production)* | *(10% baseline + 100% for errors)* | *(Balance cost vs. visibility; always trace failures)* |

### Step 7 — Design Alert Definitions

For each SLO and critical operational signal, define an alert:

**Step 7a — Alert definitions:**

| Alert Name | Condition | Duration | Severity | Routing | Runbook |
|-----------|-----------|---------|----------|---------|---------|
| *(RefundServiceDown)* | *(Health check fails for > 2 consecutive checks)* | *(1 minute)* | *(Critical — page)* | *(On-call engineer)* | *(Check service logs, verify DB connectivity, restart if needed)* |
| *(RefundErrorRateHigh)* | *(5xx rate on /api/refunds/* > 5% over 5 minutes)* | *(5 minutes)* | *(Critical — page)* | *(On-call engineer)* | *(Check recent deployments, review error logs, check downstream dependencies)* |
| *(RefundLatencyHigh)* | *(p99 latency on /api/refunds/* > 1500ms over 10 minutes)* | *(10 minutes)* | *(Warning — notify)* | *(Slack #refund-alerts)* | *(Check DB query performance, check payment gateway latency, review slow query log)* |
| *(PaymentGatewayDegraded)* | *(Payment reversal error rate > 10% OR p99 > 5s)* | *(5 minutes)* | *(Warning — notify)* | *(Slack #refund-alerts + on-call)* | *(Check gateway status page, verify circuit breaker state, check if affecting other services)* |
| *(NotificationQueueBacklog)* | *(Queue depth > 1000 messages for > 15 minutes)* | *(15 minutes)* | *(Warning — notify)* | *(Slack #refund-alerts)* | *(Check consumer health, verify consumer is processing, check for poison messages)* |
| *(SLOBudgetBurnRate)* | *(Error budget consumption rate > 2x normal over 1 hour)* | *(1 hour)* | *(Warning — notify)* | *(Slack #refund-alerts)* | *(Review recent changes, check for degradation, consider rollback if caused by recent deploy)* |
| *(DBConnectionPoolExhausted)* | *(Active connections > 90% of pool max)* | *(5 minutes)* | *(Critical — page)* | *(On-call engineer + DBA)* | *(Check for connection leaks, long-running queries, increase pool if justified)* |

**Step 7b — Severity levels and routing:**

| Severity | Definition | Response Time | Notification | Examples |
|----------|-----------|--------------|-------------|---------|
| **Critical** | Service is down or severely degraded; users are impacted now | Immediate (< 5 min) | Page on-call engineer (PagerDuty/Opsgenie) | Service down, SLO breached, data corruption |
| **Warning** | Service is degraded or at risk; users may be impacted soon | Within 30 minutes | Slack channel notification | Latency elevated, error rate rising, queue backlog growing |
| **Info** | Notable condition that may need attention but is not urgent | Next business day | Slack channel or email | Error budget 50% consumed, disk usage above 70%, certificate expiring in 30 days |

**Step 7c — Alert hygiene rules:**

- Every alert must have a runbook link — an alert without a runbook is useless at 3 AM
- Alerts should fire on symptoms (high error rate), not causes (server CPU high) — symptoms indicate user impact
- Alerts should have a duration/sustained condition — avoid single-sample spikes triggering pages
- Critical alerts should be rare and always actionable — alert fatigue is a reliability risk
- Every alert should be reviewed quarterly — remove alerts that never fire (waste) or always fire (noise)

### Step 8 — Design Operational Dashboards

Design dashboards that answer operator questions, not dashboards that show every available metric. Every panel must answer a question someone actually asks when operating this feature.

**Step 8a — Dashboard: [Feature Name] Operations**

Organize around the operator's mental model:

| Section | Position | Panel | Visualization | Metric(s) | Question It Answers |
|---------|----------|-------|--------------|-----------|-------------------|
| **Health** | *(Top row)* | *(Service status)* | *(Status indicator — green/yellow/red)* | *(Health check result, SLO status)* | *(Is it healthy right now?)* |
| **Health** | *(Top row)* | *(Error rate)* | *(Stat with sparkline)* | *(5xx rate, current and trend)* | *(Is the error rate normal?)* |
| **Health** | *(Top row)* | *(SLO budget remaining)* | *(Gauge)* | *(Error budget % remaining this month)* | *(How much budget do we have left?)* |
| **Performance** | *(Second row)* | *(Request latency)* | *(Heatmap or line chart — p50, p95, p99)* | *(http_request_duration_seconds)* | *(Is it fast enough? Where's the latency?)* |
| **Performance** | *(Second row)* | *(Payment gateway latency)* | *(Line chart — p50, p95, p99)* | *(payment_reversal_duration_seconds)* | *(Is the external dependency slow?)* |
| **Throughput** | *(Third row)* | *(Request rate)* | *(Line chart)* | *(http_requests_total rate)* | *(How much traffic are we handling?)* |
| **Throughput** | *(Third row)* | *(Refund creation rate)* | *(Line chart, stacked by reason)* | *(refunds_created_total rate)* | *(Is refund volume normal? Any spikes?)* |
| **Saturation** | *(Fourth row)* | *(DB connection pool)* | *(Gauge — % used)* | *(db_connection_pool_active / max)* | *(Are we running out of DB connections?)* |
| **Saturation** | *(Fourth row)* | *(Queue depth)* | *(Line chart)* | *(queue_depth)* | *(Is the consumer keeping up?)* |
| **Errors** | *(Bottom)* | *(Recent errors)* | *(Log stream / table)* | *(ERROR-level logs, last 30 min)* | *(What's breaking? What does the error say?)* |

**Step 8b — Dashboard filters and variables:**

| Variable | Type | Default | Applies To |
|----------|------|---------|-----------|
| *(Time range)* | *(Time picker)* | *(Last 1 hour)* | *(All panels)* |
| *(Environment)* | *(Dropdown)* | *(Production)* | *(All panels — filters by environment label)* |
| *(Service instance)* | *(Multi-select)* | *(All)* | *(All panels — filters by instance)* |

**Step 8c — Anti-pattern check:**

Before finalizing the dashboard, verify:
- No panel exists that doesn't answer an operator question
- No vanity metrics — every panel should help someone make a decision or take an action
- Panels have clear titles with units (e.g., "Request Latency (ms)" not "Latency")
- Thresholds and status colors are meaningful (green = healthy, yellow = warning, red = critical)
- Default time range is appropriate for the refresh cadence of the underlying metrics

### Step 9 — Validate

Check the completed observability design against:

- **NFRs** — does every availability, performance, and reliability NFR have a corresponding SLI with an SLO target?
- **System design** — does every new component from Section 3 have metrics, logging, and (if applicable) tracing coverage?
- **Backend design** — are the logging standards consistent with the logging conventions defined in Section 5 (cross-cutting concerns)?
- **API design** — does every API endpoint from Section 7 have latency and error rate monitoring?
- **Integration design** — does every external system call from Section 8 have dependency health monitoring (latency, error rate, circuit breaker state)?
- **Deployment strategy** — are the rollout monitoring signals from Section 12 a subset of the metrics defined here?
- **Dashboard / Reporting boundary** — are operational dashboards (this section) clearly separated from business dashboards (Section 11)? No metric is orphaned between the two.
- **Alert coverage** — does every SLO have an alert? Does every critical failure mode have an alert?
- **Alert quality** — does every alert have a runbook? Are severities appropriate? Will the on-call engineer know what to do?
- **Traceability** — does every metric, alert, and dashboard panel trace to a requirement or design component?

### Step 10 — Assemble

Combine all sections into the observability design output. This becomes Section 13 of the solution design package.

### File Output

Write the completed section to `docs/<feature>/solutions-package/design/13-observability-design.md` using the template at `../assets/observability-design-doc.md` as the output structure.

If this section was determined to be not applicable in the design workflow's Step 0, write a stub file containing: **"Not applicable — [rationale from scoping step]."**

---

## Output Structure

### For Brownfield Projects

**1. Existing Observability Patterns** — current monitoring tools, logging framework, tracing setup, alerting configuration, dashboards (from Step 2)

**2. SLI/SLO Definitions** — service level indicators, objectives, error budgets, and budget policy (from Step 3)

**3. Metrics** — four golden signals plus feature-specific metrics with names, types, labels, and instrumentation points (from Step 4)

**4. Structured Logging** — log levels, structured fields, sensitive data rules, correlation ID propagation (from Step 5)

**5. Distributed Tracing** — trace paths, custom span design, sampling strategy (from Step 6)

**6. Alert Definitions** — alert conditions, severity, routing, runbook links (from Step 7)

**7. Operational Dashboards** — dashboard layout, panels, filters, organized by operator questions (from Step 8)

**8. Requirements Traceability** — every SLI, metric, alert, and dashboard panel traces to the requirement that drives it

### For Greenfield Projects

Same structure, omitting Section 1 (Existing Observability Patterns).

---

## Requirements Traceability

Every SLI, metric, alert, and dashboard panel must trace to the requirement or design component that drives it.

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| *(Availability SLI — 99.9%)* | *(SLI/SLO)* | *(NFR-01)* | *(99.9% uptime SLA)* |
| *(http_request_duration_seconds metric)* | *(metric)* | *(NFR-02)* | *(p99 latency < 500ms)* |
| *(RefundErrorRateHigh alert)* | *(alert)* | *(NFR-01)* | *(Detect availability degradation before SLO breach)* |
| *(Payment gateway latency panel)* | *(dashboard panel)* | *(Section 8 — Integration)* | *(Monitor external dependency health)* |
| *(refunds_created_total metric)* | *(metric)* | *(BO-01)* | *(Track feature adoption — cross-ref Section 11 business dashboard)* |
| *(Correlation ID propagation)* | *(logging)* | *(NFR-05)* | *(Mean time to resolution < 30 minutes — requires traceable request chains)* |

If a design element cannot be traced to a requirement or design component, it must be flagged and confirmed with the user before inclusion.

---

## Hand-off Gate

Before proceeding to `testability-design`, you must:

1. Write the completed observability design in full.
2. Present it to the user for review with the following questions:
   - **SLIs/SLOs:** Are the service level indicators the right measures of service health? Are the SLO targets appropriate and achievable?
   - **Metrics:** Are the metrics comprehensive enough? Are there operational signals missing? Are the metric names and labels consistent with existing conventions?
   - **Logging:** Are the log levels and structured fields appropriate? Are the sensitive data rules correct?
   - **Tracing:** Are the trace paths correct? Is the sampling strategy appropriate for your traffic volume and cost constraints?
   - **Alerts:** Are the alert thresholds correct? Are the severities appropriate? Are the runbooks actionable? Will on-call engineers know what to do?
   - **Dashboards:** Do the dashboard panels answer the right operator questions? Is anything missing that you'd want to see during an incident?
   - **Boundary:** Is the separation between operational dashboards (this section) and business dashboards (Section 11) clear?
   - **Traceability:** Is every design element connected to a requirement?
3. If the user identifies corrections, update and re-present before proceeding.
4. Do not proceed until the user explicitly confirms the observability design is accurate.

## Completion Criteria

- [ ] For brownfield: existing observability patterns are extracted from the codebase (monitoring configs, logging setup, alert definitions, dashboard configs, tracing instrumentation) and confirmed by the user
- [ ] Every availability, performance, and reliability NFR has a corresponding SLI with an SLO target and error budget
- [ ] Error budget policy is defined — what happens at each consumption level
- [ ] The four golden signals (latency, traffic, errors, saturation) are covered with specific metrics for the feature
- [ ] Feature-specific metrics are defined with names, types, labels, and instrumentation points
- [ ] Metric naming conventions are consistent with existing metrics (or established for greenfield)
- [ ] Label cardinality is bounded — no unbounded labels (user IDs, UUIDs) in metric labels
- [ ] Structured logging standards are defined — log levels, structured fields, what to log at each level
- [ ] Sensitive data rules are defined — what is never logged, what is redacted, what is allowed at which level
- [ ] Correlation ID propagation is designed across all hops (HTTP, message queue, downstream calls)
- [ ] Distributed tracing spans are designed for every user-facing operation with custom attributes and events
- [ ] Trace sampling strategy is defined per environment
- [ ] Alert definitions are complete — every SLO has an alert, every critical failure mode has an alert
- [ ] Every alert has a severity, routing destination, and runbook link
- [ ] Alert severities are appropriate — critical alerts are rare and always actionable
- [ ] Operational dashboards are designed around operator questions, not metric availability
- [ ] Dashboard panels have titles with units, meaningful thresholds, and status colors
- [ ] No vanity panels — every panel answers a question an operator actually asks
- [ ] Operational dashboards (this section) are clearly separated from business dashboards (Section 11)
- [ ] Rollout monitoring signals from Section 12 are consistent with (a subset of) metrics defined here
- [ ] Requirements traceability is complete
- [ ] The user has explicitly confirmed the observability design is accurate

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A feature ships with no monitoring — the team discovers it's broken from user complaints | Step 4 designs metrics for every new component; Step 7 designs alerts that fire before users notice; Step 8 provides dashboards for proactive monitoring |
| NFRs specify availability and latency targets but no one measures whether they are being met | Step 3 derives SLIs and SLOs directly from NFRs — every target has a measurable indicator with an explicit objective |
| An alert fires at 3 AM but the on-call engineer has no idea what to do | Step 7c requires every alert to have a runbook link with actionable investigation steps |
| Alert fatigue — too many alerts fire constantly, so the team ignores them all and misses real incidents | Step 7c enforces alert hygiene: critical alerts must be rare and actionable, duration thresholds prevent single-sample spikes, and quarterly review removes noise |
| Logs exist but are useless for debugging — inconsistent format, missing context, no correlation IDs | Step 5 defines structured logging with mandatory fields, correlation ID propagation across all hops, and rules for what to log at each level |
| Sensitive data (passwords, PII, card numbers) appears in logs, creating a compliance violation | Step 5c defines explicit rules for what is never logged, what is redacted, and at which level each data type is allowed |
| A dashboard shows 50 panels of raw metrics but no one can tell if the service is healthy | Step 8 designs dashboards around operator questions ("is it healthy?", "where's the bottleneck?", "what changed?") and requires every panel to answer a real question |
| Tracing is enabled but custom spans are missing, so distributed traces show HTTP hops but no business context | Step 6 designs custom spans for each user-facing operation with business-relevant attributes (refund.id, refund.amount, gateway name) |
| The SLO is breached but no one noticed because there was no alert on the error budget | Step 7a includes an SLO budget burn rate alert that fires when budget consumption exceeds normal |
| Metrics have unbounded label cardinality (user IDs as labels), causing the metrics backend to fall over | Step 4 includes explicit label cardinality rules — no user IDs or UUIDs in metric labels |
| Operational dashboards overlap with business dashboards, and neither is complete | The boundary section at the top and Step 9 validation explicitly separate operational (this section) from business (Section 11) dashboards |
| The deployment strategy says "monitor canary for error rate" but doesn't define what the baseline or threshold is | Step 9 validates that rollout monitoring signals from Section 12 reference specific metrics and thresholds defined in this section |
| Production tracing captures 100% of requests, costing thousands per month for minimal debugging benefit | Step 6c defines a sampling strategy per environment — baseline sampling for production with 100% capture for errors |
