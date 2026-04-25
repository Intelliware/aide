---
slug: observability-hooks
title: "Observability Hooks"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 300
---

## 20. Observability Hooks

Document the metrics, traces, and profiling integration points the framework exposes. Plugins or applications use these to ship to their monitoring stack of choice (Prometheus, OpenTelemetry, Datadog, etc.). The framework should ship raw signals without prescribing a vendor; document those signals here. Verify by inspecting an actual production export — discrepancies are the easiest way to find documentation drift.

Cover semantic conventions (`http.method`, `http.status_code`, `http.route`) and how the framework names spans/metrics. Be explicit about cardinality budgets: which labels are bounded vs. potentially unbounded (e.g., raw `path` is unbounded; `route` template is bounded).

### Suggested template content

**Metrics emitted (always on):**

| Metric | Type | Labels | Notes |
|---|---|---|---|
| `framework.request.total` | counter | method, route, status | One per request |
| `framework.request.duration_ms` | histogram | method, route, status | Buckets: {{buckets}} |
| `framework.request.body_bytes` | histogram | method, route | Inbound size |
| `framework.response.body_bytes` | histogram | method, route, status | Outbound size |
| `framework.error.total` | counter | code, status | One per rendered error |
| `framework.error.unhandled` | counter | — | Bucketed by hour for alerting |
| `framework.middleware.duration_ms` | histogram | name | Per-middleware cost |
| `framework.connection.open` | gauge | — | Live HTTP connections |
| `framework.config.reload_total` | counter | result | Hot-reload outcomes |

**Cardinality budget:**

- `route`: bounded by registered routes (typically < 1000).
- `method`: bounded (GET/POST/...).
- `status`: bounded (HTTP status codes).
- `path`: NOT a label — use `route` (template) instead.
- Tenant / user IDs: NOT labels by default; prefer separate observability sink.

**Tracing:**

- OpenTelemetry-compatible spans on every request.
- Span name: `<METHOD> <route-template>`.
- Standard attributes: `http.method`, `http.status_code`, `http.route`, `http.scheme`, `net.host.name`.
- Plugin-emitted spans become children of the request span via `ctx.startSpan(name)`.
- Sampling: defers to the configured sampler; framework adds a `forced=true` attribute when an explicit sampling decision is made.

**Source files:**

- Metrics registry: `{{path}}`
- Tracing instrumentation: `{{path}}`
- OpenTelemetry adapter: `{{path}}`

**Plugin extension API:**

| Method | Purpose |
|---|---|
| `metrics.counter(name, labels)` | Register / increment a counter |
| `metrics.histogram(name, labels, value)` | Record a histogram observation |
| `metrics.gauge(name, labels, value)` | Set a gauge |
| `tracer.startSpan(name, attrs)` | Start a span; auto-parented to current |
| `addRequestAttribute(key, value)` | Add to the request span |

**Exporters (out-of-the-box adapters):**

| Exporter | Status |
|---|---|
| Prometheus (pull `/metrics`) | first-party plugin |
| OTLP gRPC | first-party plugin |
| StatsD | community |
| Datadog (DogStatsD + APM) | community |

**Log correlation:**

- Every log record carries `trace_id` + `span_id` when inside a request scope.
- See logging-architecture block for record shape.

**Health and readiness:**

- `/healthz` (liveness) — returns 200 once the runtime is up; never depends on downstream.
- `/readyz` (readiness) — returns 200 only after all `afterStart` plugin hooks succeed and any plugin-registered probes report healthy.
- Plugins register probes via `plugin.registerHealthCheck(name, fn)`.

**Profiling integration:**

- CPU + heap profilers exposed via the dev CLI (see performance-tuning block).
- In production, profiling must be opt-in via config; never auto-enabled.

**Common pitfalls:**

- Adding high-cardinality labels (user_id, tenant_id) — kills metric backends; use logs/traces instead.
- Emitting metrics from request-scope code outside a request — drops the `route` label and makes the metric unbounded.
- Creating a new tracer per request — defeats batching; use the framework-provided one.
- Reusing span names across endpoints — ruins flamegraphs. Use the route template.

**Cross-references:**

- See logging-architecture block for log → trace correlation.
- See plugin-extension-system block for how exporters integrate.
- See security-model block for what NOT to put in metrics labels.
