---
slug: observability-logging-metrics-tracing
title: "Observability: Logging, Metrics, and Tracing"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 310
---

## 21. Observability: Logging, Metrics, and Tracing

This section documents the three pillars of observability for the API: structured logging, metrics emission, and distributed tracing. The downstream AI needs to know which logger to use, what fields are *always* present (and therefore must not be re-added), how to emit a metric without conflicting with existing names, and how trace context is propagated. Extract the logger library (pino, winston, Serilog, slog, structlog), log format (JSON vs pretty), default level per environment, and which fields are auto-injected by middleware (requestId, userId, traceId).

For metrics, identify the client (prom-client, OpenTelemetry, StatsD, micrometer) and the metric naming convention. List the existing custom metrics and their cardinality budgets — runaway label cardinality is a top cause of monitoring outages. For tracing, identify the SDK (OpenTelemetry, Datadog APM, Jaeger client) and confirm that incoming W3C traceparent headers are honored end-to-end.

To verify, find one request handler and trace which logs/metrics/spans it emits. Confirm log levels match the documented severity meanings — many codebases use `info` for things that should be `debug`, polluting prod logs. Confirm trace headers are propagated to outbound HTTP/gRPC calls (see Section 19).

Be careful about PII: log redaction is often promised but rarely tested. Identify the redaction layer (logger plugin, manual `pick`/`omit`, post-processing) and verify with a test or grep that fields like `password`, `token`, `ssn`, `email` (depending on policy) are not logged in plaintext.

Hallucination risks: do not invent structured-logging fields that don't exist; do not assume sampling is configured (default OTel is 100% which is expensive); do not assume metrics are scraped — confirm the Prometheus endpoint or OTLP exporter is wired.

### Suggested template content

#### 21.1 Logging

- **Library:** {{e.g., pino 8.x}}
- **Format:** {{JSON in prod, pretty in dev}}
- **Default level by env:** {{dev=debug, staging=info, prod=info}}
- **Sink:** {{stdout → vector → Loki}}

**Always-present fields (auto-injected by middleware):**

| Field | Source | Example |
|-------|--------|---------|
| `requestId` | {{cls / als}} | `{{req_01HX...}}` |
| `traceId` | {{OTel}} | `{{4bf92f3577b34da6...}}` |
| `userId` | {{auth middleware (optional)}} | `{{usr_123}}` |
| `route` | {{router}} | `{{POST /v1/orders}}` |

**PII redaction:** {{e.g., pino redact paths: ["*.password", "*.token", "headers.authorization"]}}

```{{language}}
// Canonical structured log call
{{example: logger.info({ orderId, amount }, 'order.created')}}
```

#### 21.2 Metrics

- **Library:** {{e.g., prom-client 14.x}}
- **Endpoint:** `{{GET /internal/metrics}}` (scraped by {{Prometheus}})
- **Naming convention:** `{{svc_subsystem_metric_unit}}` — e.g., `svc_orders_created_total`

**Standard middleware metrics (auto-emitted):**

| Metric | Type | Labels |
|--------|------|--------|
| `http_request_duration_seconds` | histogram | `method`, `route`, `status` |
| `http_requests_total` | counter | `method`, `route`, `status` |

**Cardinality rules:**
- {{e.g., never use userId or orderId as a label}}
- {{e.g., bucket continuous values}}

```{{language}}
// Custom metric registration and increment
{{example}}
```

#### 21.3 Tracing

- **SDK:** {{e.g., @opentelemetry/sdk-node}}
- **Exporter:** {{e.g., OTLP → Tempo}}
- **Sampling:** {{e.g., parent-based, 10% root sampling}}
- **Auto-instrumented:** {{HTTP, fetch, pg, redis}}

```{{language}}
// Manual span creation around a non-instrumented operation
{{example: tracer.startActiveSpan ...}}
```

#### 21.4 Health & Readiness

| Endpoint | Purpose | Checks |
|----------|---------|--------|
| `GET /health/live` | k8s liveness | {{process up}} |
| `GET /health/ready` | k8s readiness | {{db ping, broker ping, cache ping}} |

#### 21.5 Common Pitfalls

- {{e.g., logging request body — PII risk}}
- {{e.g., unbounded label cardinality}}
- {{e.g., dropping trace context on async boundaries (setTimeout, queue handlers)}}
