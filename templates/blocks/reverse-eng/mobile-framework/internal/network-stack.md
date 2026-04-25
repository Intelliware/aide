---
slug: network-stack
title: "Network Stack"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, security]
optional: false
order-hint: 210
---

## 11. Network Stack

### 11.1 HTTP Client Layers

```
[ User code ]
   ↓
[ Framework `fetch` / `Http` API ]
   ↓
[ Interceptor chain ]
   ↓
[ Native transport: NSURLSession (iOS) / OkHttp (Android) / cronet ]
```

### 11.2 Provided High-Level APIs

| API | Purpose |
|-----|---------|
| `fetch(url, init)` | Spec-compliant Web fetch |
| `XMLHttpRequest` | Legacy compatibility (only present where required) |
| `WebSocket` | Persistent bidirectional |
| `Http` (typed) | Built-in retry + JSON typing |

### 11.3 Interceptor Chain

Interceptors are registered globally and run in declaration order:

| Interceptor | Responsibility |
|-------------|----------------|
| Auth | Add bearer token, refresh on 401 |
| Logging | Dev-build logging + redaction |
| Tracing | Inject `traceparent` / `b3` headers, record spans |
| Caching | RFC-7234 + custom policy |
| Retry | Idempotent calls + jittered backoff |
| Compression | Negotiate `gzip`, `br` |
| Circuit breaker | Drop calls when downstream is unhealthy |

> Order matters: auth before retry (so retries get fresh tokens); logging last (so it sees final headers).

### 11.4 TLS and Certificate Pinning

- TLS handled by the OS — minimum version `{{tls_min}}` (typ. 1.2).
- Pinning hooks:
  - iOS: `URLSessionDelegate.urlSession(_:didReceive:completionHandler:)` evaluates trust against pinned SPKI hashes.
  - Android: OkHttp `CertificatePinner` configured with the same hashes.
- Pin set lives in `{{cert_pin_config_path}}`; rotation is staged (new pin added before old removed) and aligned with cert renewal.
- Pinning can be disabled per-build (debug only) for traffic inspection in {{e.g., Charles, mitmproxy}}.

### 11.5 Caching Policy

- Default: HTTP-driven (`Cache-Control` / `ETag`).
- Override: per-request `cache: { policy: "stale-while-revalidate", ttl: 60 }`.
- Disk cache size: `{{n}}` MiB, evicted LRU.
- Caches honour `Vary` headers and per-user partitioning where session is involved.

### 11.6 Concurrency and Connection Pool

- Up to `{{n}}` concurrent requests per host (HTTP/2 multiplexing means 1 connection serves all).
- HTTP/2 + Brotli enabled where the server negotiates them.
- HTTP/3 / QUIC: `{{enabled / behind a flag / not yet}}`.

### 11.7 Retry Strategy

- Idempotent verbs (GET, PUT, DELETE) retried by default — opt out via `retry: { idempotent: false }`.
- POST never retried unless explicitly opted in via `retry: { unsafePost: true, idempotencyKey: "..." }`.
- Backoff: exponential with full jitter; max retries `{{n}}`.
- Honours `Retry-After` header on 429 / 503.

### 11.8 Background Networking

- iOS: `URLSession` with background configuration for downloads/uploads exceeding app lifetime.
- Android: `WorkManager` with `Network` constraint for retryable jobs.

### 11.9 Telemetry

Every request emits:

```
metric: http.request
labels: method, host, status_class, route_template
duration_ms, body_bytes_sent, body_bytes_received, retried, cache_hit
```

Errors (network, TLS, DNS) are categorised distinctly so dashboards don't conflate them with 5xx.

### 11.10 Where the Code Lives

```
{{repo}}/
├── packages/network/                   # fetch / Http / interceptors
├── packages/network-{ios,android}/     # native transports
└── tools/devtools/network-inspector/   # dev-mode inspector
```
