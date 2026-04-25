---
slug: inter-service-communication
title: "Inter-Service Communication"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 290
---

## 19. Inter-Service Communication

This section documents how this API talks to other services in the system: synchronous HTTP/gRPC clients, async message publishing/consuming, service discovery, and the contract enforcement strategy. Extract from the source: which other services this API calls (egress), which services call this API (ingress beyond the public client), and which messages this API publishes or consumes on shared brokers. For each external dependency, identify the client wrapper (typed SDK, generated client from OpenAPI, hand-rolled `fetch`), timeout/retry/circuit-breaker configuration, and how authentication is propagated.

To verify, read the actual HTTP client construction (look for `axios.create`, `HttpClient` factories, gRPC channel setup) and the timeout values — README docs are routinely out of date. For each downstream service, confirm whether errors are surfaced as typed exceptions, generic 5xx, or swallowed. For event publishing, confirm the schema source of truth (proto, JSON Schema, AsyncAPI) and whether the publisher actually validates against it before sending.

Be careful about the difference between *internal-only* services and *third-party integrations* — the latter belong in the next section (File Storage and External Integrations). Internal here means services owned by the same organization. Also be careful about transitive calls: an HTTP client wrapped in three layers may add retries at each layer, multiplying the actual retry count by 3× or more.

Hallucination risks: do not assume circuit breakers exist unless the code shows them; do not assume mutual TLS unless you can find the cert config; do not invent a service mesh layer (Istio, Linkerd) unless deployment manifests confirm it.

### Suggested template content

#### 19.1 Outbound Dependencies (services this API calls)

| Service | Protocol | Client | Timeout | Retry | Auth |
|---------|----------|--------|---------|-------|------|
| {{e.g., user-service}} | {{HTTP/JSON}} | `{{generated from openapi.yaml}}` | {{5s}} | {{3× exp}} | {{S2S JWT}} |
| {{e.g., billing-grpc}} | {{gRPC}} | `{{generated proto}}` | {{2s}} | {{none}} | {{mTLS}} |

#### 19.2 Inbound Dependencies (services that call this API)

| Caller | Endpoint(s) | Auth Method | Notes |
|--------|-------------|-------------|-------|
| {{e.g., admin-portal}} | {{/internal/users/*}} | {{S2S JWT}} | {{rate-limited 1k/s}} |

#### 19.3 Event Topics / Queues

| Direction | Topic / Exchange | Schema Location | Format |
|-----------|------------------|-----------------|--------|
| publishes | {{user-events.v1}} | `{{schemas/user-events.proto}}` | {{Protobuf}} |
| consumes | {{billing-events.v2}} | `{{schemas/billing.json}}` | {{JSON, validated by Ajv}} |

#### 19.4 Calling a Downstream Service — Canonical Pattern

```{{language}}
// Show: client construction, timeout, retry, error mapping, propagated trace headers
{{example call}}
```

#### 19.5 Publishing / Consuming an Event

```{{language}}
// Publish: include schema validation, key, headers (correlation-id, trace)
{{publish example}}
```

```{{language}}
// Consume: handler skeleton, dedup, ack/nack, DLQ
{{consume example}}
```

#### 19.6 Timeout / Retry / Circuit-Breaker Defaults

- **Default HTTP timeout:** {{e.g., 5s}}
- **Default retry count:** {{e.g., 3 with exponential backoff}}
- **Circuit breaker:** {{e.g., opossum, opens after 50% errors over 30s}}
- **Trace propagation:** {{e.g., W3C traceparent headers always forwarded}}
