---
slug: performance-patterns-and-constraints
title: "Performance Patterns and Constraints"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect, ops]
optional: false
order-hint: 340
---

## 24. Performance Patterns and Constraints

This section documents the API's performance budget, hot paths, and the patterns the codebase already uses to stay within budget. The downstream AI must respect these constraints when adding code — common mistakes include adding a synchronous downstream call in a hot path, introducing an N+1 query, or holding a database connection across an external API call. Extract from the source: documented SLOs (p50/p95/p99 latency, throughput targets), connection-pool sizes, request/response size limits, pagination defaults, and any existing performance comments or `// TODO: optimize` annotations.

To verify, profile or read traces for the top-5 hottest endpoints if telemetry is available. Confirm pagination is *enforced* (server caps page size, not just defaults it) — clients can and will request `limit=10000`. Confirm bulk endpoints have explicit batch-size limits. Find the connection pool config and verify it matches deployment topology (pool × replicas ≤ DB max connections).

Be careful about premature optimization — only document patterns the codebase *actually uses*, not patterns that *should* be there. Distinguish "this is enforced" from "this is a guideline." If the codebase has documented performance learnings (postmortems, ADRs), summarize them here so the AI doesn't reintroduce a fixed regression.

Hallucination risks: do not invent SLO numbers; do not assume HTTP/2 multiplexing if the server only supports HTTP/1.1; do not assume gzip/brotli unless the response middleware is configured for it. Do not document load-test results that haven't actually been measured.

### Suggested template content

#### 24.1 Performance Budget (SLOs)

| Endpoint Class | p50 | p95 | p99 | Throughput |
|----------------|-----|-----|-----|------------|
| Read (cached) | {{5ms}} | {{20ms}} | {{50ms}} | {{1k rps}} |
| Read (uncached) | {{20ms}} | {{100ms}} | {{300ms}} | {{500 rps}} |
| Write | {{50ms}} | {{200ms}} | {{500ms}} | {{200 rps}} |
| Heavy aggregation | {{200ms}} | {{1s}} | {{2s}} | {{10 rps}} |

#### 24.2 Pagination

- **Default page size:** {{20}}
- **Max page size:** {{100}} — server-enforced (rejected with 400 above this)
- **Cursor format:** {{opaque base64 of `{lastId, lastCreatedAt}`}}

```{{language}}
// Canonical cursor pagination implementation
{{example}}
```

#### 24.3 N+1 Prevention

- **Strategy:** {{e.g., DataLoader batching at the controller boundary; eager-loading via repository options}}
- {{Cross-reference Section 15.4 for the repository-level pattern}}

```{{language}}
// Anti-pattern detection: how to spot N+1 in code review
{{example showing the bad and the fixed version}}
```

#### 24.4 Connection / Resource Pools

| Pool | Size | Acquire Timeout | Idle Timeout |
|------|------|-----------------|--------------|
| Postgres | {{20 per replica}} | {{2s}} | {{30s}} |
| Redis | {{10 per replica}} | {{1s}} | {{n/a}} |
| HTTP egress | {{50 sockets per host}} | {{n/a}} | {{60s keep-alive}} |

**Capacity check:** `pool_size × replica_count ≤ DB max_connections × 0.8`

#### 24.5 Payload Size Limits

| Direction | Max Size | Enforced At |
|-----------|----------|-------------|
| Inbound JSON body | {{1 MB}} | {{body-parser}} |
| Inbound multipart | {{50 MB}} | {{multer}} |
| Outbound list response | {{2 MB streamed}} | {{controller}} |

#### 24.6 Caching for Performance

{{Cross-reference Section 17 — list which hot paths rely on cache and degrade gracefully on miss}}

#### 24.7 Heavy Operations — Move Off Request Path

- {{e.g., report generation → background job (Section 18)}}
- {{e.g., bulk imports → queued + chunked}}
- {{e.g., webhook fan-out → publish event, fan out asynchronously}}

#### 24.8 Known Performance Gotchas

- {{e.g., `JSON.stringify` of large lists blocks the event loop — chunk}}
- {{e.g., synchronous file I/O on hot paths — never}}
- {{e.g., regex with backtracking on user input — use re2}}
