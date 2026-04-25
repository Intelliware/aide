---
slug: observability-operations
title: "Observability & Operations"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, ops]
optional: false
order-hint: 14
---

## 14. Observability & Operations

### 14.1 Logging Strategy

| Level | When to Use | Example |
|-------|-----------|---------|
| [ERROR] | [Unrecoverable failures] | [e.g., Database connection lost] |
| [WARN] | [Recoverable issues] | [e.g., Retry succeeded after failure] |
| [INFO] | [Significant business events] | [e.g., Allocation approved] |
| [DEBUG] | [Diagnostic details] | [e.g., Query parameters, response times] |

### 14.2 Metrics & Monitoring

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| [e.g., API response time P95] | [e.g., Application metrics] | [e.g., > 2 seconds] |
| [e.g., Error rate] | [e.g., Log aggregation] | [e.g., > 1% of requests] |
| | | |

### 14.3 Health Checks

| Endpoint | Checks | Used By |
|----------|--------|---------|
| [e.g., /actuator/health] | [e.g., Database connectivity, disk space] | [e.g., Load balancer, monitoring] |
