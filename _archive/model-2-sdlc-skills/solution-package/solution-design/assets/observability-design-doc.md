# Section 13: Observability Design

> Populated by `observability-design.md`. This is Section 13 of the solution design package.

## For Brownfield Projects

### 1. Existing Observability Patterns

<!-- Current monitoring tools, logging framework, tracing setup, alerting configuration, dashboards -->

### 2. SLI/SLO Definitions

| SLI | Measurement | SLO Target | Error Budget | Budget Policy |
|-----|-----------|-----------|-------------|--------------|
| | | | | |

### 3. Metrics

#### Four Golden Signals

| Signal | Metric Name | Type | Labels | Instrumentation Point |
|--------|-----------|------|--------|---------------------|
| Latency | | | | |
| Traffic | | | | |
| Errors | | | | |
| Saturation | | | | |

#### Feature-Specific Metrics

| Metric Name | Type | Labels | Purpose | Instrumentation Point |
|------------|------|--------|---------|---------------------|
| | counter / gauge / histogram | | | |

### 4. Structured Logging

| What to Log | Level | Structured Fields | Sensitive Data Rules |
|------------|-------|------------------|---------------------|
| | | | |

#### Correlation ID Propagation

<!-- How correlation IDs flow through the system -->

### 5. Distributed Tracing

#### Trace Paths

<!-- New trace paths for key operations -->

#### Custom Span Design

| Span | Parent | Attributes | Purpose |
|------|--------|-----------|---------|
| | | | |

#### Sampling Strategy

<!-- Sampling rate and strategy -->

### 6. Alert Definitions

| Alert Name | Condition | Severity | Routing | Runbook Link |
|-----------|-----------|----------|---------|-------------|
| | | critical / warning / info | | |

### 7. Operational Dashboards

| Dashboard | Audience | Panels | Filters |
|-----------|----------|--------|---------|
| | | | |

### 8. Requirements Traceability

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| | SLI / metric / alert / dashboard / tracing | | |

## For Greenfield Projects

Same structure, omitting Section 1 (Existing Observability Patterns).
