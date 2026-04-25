---
slug: response-serialization
title: "Response Serialization"
applies-to: [re-api-framework-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. Response Serialization

Document how handler return values become wire bytes: encoder registry, content negotiation, streaming, compression, and how errors override the negotiated content type. This block mirrors request-parsing-and-validation but for the outbound path. Verify by sending a single resource through the pipeline with several `Accept` headers and confirming each path.

Be careful about default-encoder rules: many frameworks have a `null` / `undefined` ambiguity (returns 204 vs. literal `null` body), and serializers often need to handle large objects via streaming to avoid OOM. Note explicitly which fields the serializer drops by convention (private fields, `__internal__` prefix, etc.) and how that's enforced.

### Suggested template content

**Encoder registry:**

| Content-Type | Encoder | Source | Notes |
|---|---|---|---|
| `application/json` | `JsonEncoder` | `{{path}}` | Stable key order? {{key-order}} |
| `application/cbor` | `CborEncoder` | `{{path}}` | Optional, plugin-provided |
| `text/plain` | `TextEncoder` | `{{path}}` | |
| `application/octet-stream` | `BinaryEncoder` | `{{path}}` | Streamed |

**Content negotiation:**

```
Accept header → match against registered encoders → highest q-value wins
```

- Default: `application/json` if no `Accept` or `*/*`.
- Mismatch: 406 unless a `406-fallback` encoder is registered.
- Encoders register a quality factor for tiebreaking ({{tie-rules}}).

**Response from handler return value:**

| Return value | Body | Status |
|---|---|---|
| `undefined` / `void` | empty | 204 |
| `null` | `null` (literal JSON) | 200 |
| primitive / object | encoded | 200 |
| `Response` / `Stream` | passed through | as set |
| thrown error | error pipeline | per error |

**Source files:**

- Encoder dispatch: `{{path}}`
- Built-in JSON encoder: `{{path}}`
- Streaming response support: `{{path}}`
- Compression middleware: `{{path}}`

**Streaming responses:**

- Returning an `AsyncIterable` / readable stream → chunked transfer encoding.
- Backpressure honored via {{backpressure-mechanism}}.
- Encoder may emit `Trailer` headers if {{trailer-policy}}.

**Compression:**

- Enabled when `Accept-Encoding` matches a registered codec AND body > {{compression-threshold}}.
- Default codecs: gzip, brotli (zstd opt-in).
- Skipped for already-compressed types ({{skip-content-types}}).
- Streaming-safe.

**Serialization conventions:**

- Field whitelist/blacklist: {{policy — e.g. "Fields prefixed `_` are dropped from JSON output"}}.
- Date encoding: ISO-8601 with `Z`.
- BigInt: serialized as string by default (configurable).
- `undefined` fields: dropped from objects (asymmetric with `null`, which is preserved).

**Plugin extension points:**

- `plugin.registerEncoder(contentType, encoder)` — add a new encoder.
- `plugin.useResponseTransform(fn)` — mutate the response object before encoding.
- `plugin.setQualityFactor(contentType, factor)` — influence content negotiation.

**Headers always set:**

| Header | Source | Notes |
|---|---|---|
| `Content-Type` | encoder | Includes `charset=utf-8` for text types |
| `Content-Length` | runtime | Omitted on streamed responses |
| `Date` | runtime | RFC 1123 |
| `X-Request-ID` | request-id middleware | Mirrored from request |

**Common pitfalls:**

- Mutating the response after `next()` returns — most encoders have already written headers.
- Returning a Promise from a handler that resolves to another Promise → unwrapped exactly once.
- Encoding circular references — encoder throws `CircularReferenceError`; expose to handler via error pipeline.
- Forgetting to flush a streamed response — connection hangs until idle timeout.
