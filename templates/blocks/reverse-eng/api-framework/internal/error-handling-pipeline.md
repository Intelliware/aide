---
slug: error-handling-pipeline
title: "Error Handling Pipeline"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Error Handling Pipeline

The error pipeline is the framework's other half — it must handle every failure path from parser errors through handler exceptions to encoder failures. Document the exception model (typed hierarchy vs. opaque), the renderer registry that maps errors to responses, and the fallback chain that guarantees the framework never crashes a request silently. Read the source for `error-boundary` middleware and the catch-all `unhandled` renderer.

Be specific about which errors are user-recoverable (4xx) vs. server faults (5xx) and how the framework distinguishes them. Also document how errors interact with logging and observability — every error should produce exactly one structured log entry and one metric increment, never zero or duplicates.

### Suggested template content

**Exception hierarchy:**

```
FrameworkError                       (base; everything else extends)
├── HttpError                        (intentional, has status+code)
│   ├── BadRequestError (400)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   ├── ValidationError (400)        ← thrown by parsing/validation block
│   └── RateLimitError (429)
├── PluginError                      (registration / runtime plugin issues)
└── InternalError (500)              (fallback; wraps unrecognized errors)
```

**Pipeline flow:**

```
            error thrown anywhere in middleware/handler/encoder
                              │
                              ▼
             ┌──────────────────────────────────┐
             │     error-boundary middleware    │  catches everything
             └─────────────────┬────────────────┘
                               │
                               ▼
             ┌──────────────────────────────────┐
             │       Renderer Registry          │  match by error type
             └─────────────────┬────────────────┘
                               │
                               ▼
             ┌──────────────────────────────────┐
             │       Fallback (InternalError)   │  if no renderer matches
             └─────────────────┬────────────────┘
                               │
                               ▼
             ┌──────────────────────────────────┐
             │    Response encoded + logged     │
             └──────────────────────────────────┘
```

**Source files:**

- Error types: `{{path}}`
- Error boundary middleware: `{{path}}`
- Renderer registry: `{{path}}`
- Default renderers: `{{path}}`

**Renderer interface:**

```{{lang}}
interface ErrorRenderer {
  matches(err: unknown): boolean;
  render(err: unknown, ctx: Context): RenderedResponse;
}
```

Renderers are tried in registration order; first match wins.

**Default renderers:**

| Error class | Status | Body shape |
|---|---|---|
| `ValidationError` | 400 | `{ error: { code, message, details: [] } }` |
| `HttpError` | err.status | `{ error: { code: err.code, message: err.message } }` |
| `Error` (generic) | 500 | `{ error: { code: "internal_error", request_id } }` |
| anything else (string, number, ...) | 500 | wrapped as `InternalError` |

**Logging contract:**

- Every rendered error produces exactly one log entry at level:
  - `warn` for 4xx (client error)
  - `error` for 5xx (server error)
- Log entry includes `request_id`, `error.code`, `error.message`, stack (5xx only).
- Sensitive fields (auth tokens, request body for 5xx) are redacted by {{redactor}}.

**Observability hooks:**

- Counter: `framework.error.total{status, code}` incremented on every render.
- Histogram: `framework.error.render_duration_ms` (cheap; useful when renderers do work).
- Trace span: error renders create a child span with `error=true` semantic-conventions tag.

**Plugin extensibility:**

- `plugin.registerErrorRenderer(renderer)` — add at the front (highest priority).
- `plugin.wrapError(fn)` — last-chance to transform errors before rendering.

**Async + cancellation:**

- `AbortError` and `TimeoutError` are first-class HttpErrors mapped to 499 / 408.
- Cancellations during streaming responses do not produce an error if at least one chunk was sent.

**Common pitfalls (for plugin authors):**

- Throwing a string or number — wrapped in InternalError, log loses stack. Always throw `Error` subclasses.
- Catching errors in middleware and silently swallowing — bypasses the pipeline, causes lost telemetry.
- Mutating `err` after passing it to `next(err)` — renderer sees the mutated value.
- Registering a catch-all renderer that always matches — shadows specific renderers if registered last.
