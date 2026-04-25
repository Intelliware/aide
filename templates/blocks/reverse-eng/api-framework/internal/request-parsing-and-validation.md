---
slug: request-parsing-and-validation
title: "Request Parsing and Validation"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Request Parsing and Validation

Cover how the framework converts raw HTTP bytes into typed values: body parsing (JSON, form, multipart, streaming), query / path parameter coercion, header normalization, and the validation/transformation engine. This is the layer where most CVEs in API frameworks have historically lived (prototype pollution, oversized bodies, parser confusion), so document the security posture as well as the API.

Be explicit about the validation engine's hooks: how user schemas (Zod, Pydantic, JSR 380, etc.) are bound to handler parameters, when validation fires (before middleware? after auth?), and how validation errors are converted to responses. Verify by reading the parser source carefully — content-type sniffing, charset handling, and limits often have subtle defaults.

### Suggested template content

**Parser registry:**

| Content-Type | Parser | Source | Limit |
|---|---|---|---|
| `application/json` | `JsonParser` | `{{path}}` | {{json-limit}} |
| `application/x-www-form-urlencoded` | `UrlencodedParser` | `{{path}}` | {{form-limit}} |
| `multipart/form-data` | `MultipartParser` | `{{path}}` | {{multipart-limit}} per field, {{multipart-total}} total |
| `application/octet-stream` | `StreamParser` | `{{path}}` | streamed; size header required |
| `text/plain` | `TextParser` | `{{path}}` | {{text-limit}} |

**Parsing flow:**

```
raw bytes → content-type sniff → registered parser → typed value → validator → handler arg
```

**Body limits (security-critical):**

- Default body limit: {{default-limit}}.
- Per-route override: `route({ bodyLimit: ... })`.
- Excess: bytes are NOT buffered past the limit; connection is closed with 413.

**Query / path parameter coercion:**

- All raw values arrive as strings.
- Coercion happens in the validator, not the router.
- Type-aware: `?count=3` becomes `number` if the schema declares it.
- Arrays: {{array-coercion-rule}}.
- Booleans: `"true"`/`"false"` (case-insensitive); `"1"`/`"0"` accepted iff schema opt-in.
- Empty string vs. missing: {{policy}}.

**Validation engine integration:**

- Default schema library: {{lib — e.g. Zod}}.
- Hook: handlers declare schemas via `{{decorator-or-method}}`.
- Validation runs immediately after parsing, before any user middleware sees the parsed value.
- Failure → `ValidationError` thrown; routed to error pipeline; emitted as 400 with field details.

**Validator interface (extensibility):**

```{{lang}}
interface Validator<T> {
  validate(input: unknown): { ok: true; value: T } | { ok: false; issues: Issue[] };
}
```

Plugins can register alternate validator adapters via `plugin.registerValidator(name, factory)`.

**Sanitization vs. validation:**

- Sanitization is OFF by default — the framework rejects bad input rather than coercing it.
- Custom transforms (trim, lowercase, strip-html) are user responsibility, applied in handler layer.

**Streaming uploads:**

- For `multipart/form-data` over {{stream-threshold}}, parser switches to streaming mode.
- Files are written to {{tmp-location}} with {{retention}}.
- Plugins can intercept the stream via `onPart(part) → consume`.

**Content-Type sniffing:**

- Missing Content-Type with body present → 415 by default; opt-in to permissive mode.
- Charset: defaults to UTF-8; rejected if mis-declared.

**Security hardening:**

- JSON parser uses a hardened recursive-descent implementation (no `eval`, no prototype pollution surface).
- Multipart parser enforces strict CRLF boundaries.
- Headers are normalized to lowercase; duplicate values follow {{dup-policy — e.g. "comma-joined for non-Set-Cookie"}}.

**Common pitfalls (for plugin authors):**

- Reading `ctx.body` before the body parser has run → undefined.
- Mutating the parsed body and expecting downstream validators to see the mutation → they see the original.
- Adding a new parser without registering its content-type → silently ignored.
