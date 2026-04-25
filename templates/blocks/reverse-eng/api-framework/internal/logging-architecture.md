---
slug: logging-architecture
title: "Logging Architecture"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 190
---

## 9. Logging Architecture

Cover the structured logger's design: log record shape, level taxonomy, sink registry, request correlation, and the rules that govern what the framework itself logs vs. what user code logs. Read every `logger.*` call site in `core/` and confirm they follow the documented conventions — drift here is common and produces noisy ops experiences.

Document the redaction layer in detail: which fields are scrubbed, where the regex/policy lives, and what an attacker would need to do to exfiltrate via logs (e.g., embed secrets in non-redacted fields). Logging is a frequent source of accidental data exposure; the maintainer block needs to make the rules unambiguous.

### Suggested template content

**Log record shape (canonical):**

```json
{
  "ts": "2026-04-25T12:34:56.789Z",
  "level": "info",
  "msg": "request completed",
  "request_id": "{{uuid}}",
  "trace_id": "{{trace-id}}",
  "span_id": "{{span-id}}",
  "logger": "core.runtime",
  "ctx": { "method": "POST", "path": "/v1/orders", "status": 201, "duration_ms": 12 },
  "err": { "code": "...", "stack": "..." }
}
```

**Levels:**

| Level | When to use | Production default? |
|---|---|---|
| `trace` | Per-event detail (parser, router) | off |
| `debug` | Internal flow useful in dev | off |
| `info` | Lifecycle, request summary | on |
| `warn` | Recoverable issue, 4xx | on |
| `error` | 5xx, unexpected failure | on |
| `fatal` | Process must exit | on |

**Sink registry:**

| Sink | Purpose | Enabled by default? |
|---|---|---|
| `stdout-json` | Structured JSON to stdout | yes |
| `stderr-text` | Pretty text for dev | when TTY |
| `file` | Rolling file | no |
| `http` | Forward to log aggregator | no |

Plugins can register sinks via `plugin.registerLogSink(sink)`.

**Source files:**

- Logger: `{{path}}`
- Sink dispatcher: `{{path}}`
- Redactor: `{{path}}`

**Request correlation:**

- `request_id` is set by the request-id middleware before any logging in the request scope.
- Loggers obtained via `ctx.logger` are bound with `request_id`, `trace_id`, `span_id`.
- Loggers obtained at module scope are unbound; using them inside a request loses correlation.

**Redaction:**

- Redaction policy lives at `{{path}}`.
- Default redactions: `Authorization` headers, `password`, `token`, `secret*` keys, configured `secret`-flagged config values.
- Match strategy: case-insensitive key match at any depth.
- Redacted values are replaced with `"[REDACTED]"`.
- Plugins can extend the policy via `plugin.addRedactionRule(rule)`.

**What the framework logs (canonical events):**

| Event | Level | Logger |
|---|---|---|
| `server.starting` | info | `core.runtime` |
| `server.listening` | info | `core.runtime` |
| `server.shutdown` | info | `core.runtime` |
| `request.start` | trace | `core.runtime` |
| `request.complete` | info | `core.runtime` |
| `error.rendered` | warn / error | `core.errors` |
| `plugin.registered` | debug | `core.plugins` |
| `config.changed` | info | `core.config` |

**Performance:**

- Sinks are async by default; log calls do not block the hot path.
- Buffered batching: {{batch-size}} records or {{flush-interval}} flush.
- Backpressure: if a sink is slow, the buffer caps at {{cap}} and overflow drops with a single `log.dropped` warning per minute.

**Plugin extensibility:**

- `app.logger.child(bindings)` — create a contextual logger.
- `plugin.registerLogSink(...)` — add new transports.
- `plugin.wrapLogRecord(fn)` — last-chance enrichment.

**Common pitfalls:**

- Using `console.log` in core code — bypasses the structured logger; banned by lint rule `{{rule-name}}`.
- Logging request bodies at info level — can blow past sink buffers and may leak PII.
- Constructing log messages via string concatenation — defeats sink filters; use structured fields.
