---
slug: filtering-sorting-search
title: "Filtering, Sorting, and Search"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
---

## 9. Filtering, Sorting, and Search

Document the query-parameter conventions for filtering list endpoints, sorting, and (if supported) free-text search. Surface the supported operators, the encoding of complex predicates, the allowed sort fields, and the search engine's behavior (tokenization, language, fuzzy matching). Verify by reading the validation/parser code on the server, since spec docs often miss edge cases like null handling and case-insensitive comparisons.

If the API uses a query DSL (e.g., RSQL, JSON-based filter trees), provide a small but realistic example and link to the full grammar. Be explicit about which fields are indexed and therefore efficient to filter or sort by — consumers will otherwise hit slow paths or 408 timeouts on large datasets.

### Suggested template content

**Filter conventions:**

| Pattern | Example | Notes |
|---|---|---|
| Equality | `?status=open` | |
| Multi-value (OR) | `?status=open&status=pending` | Repeated key = OR within field. |
| Negation | `?status!=closed` | |
| Range | `?created_at[gte]=2026-01-01&created_at[lt]=2026-02-01` | Operators: `gt`, `gte`, `lt`, `lte`. |
| Null | `?assignee_id=null` | Literal `null`, not empty. |
| Substring | `?name[contains]=acme` | |

**Filterable fields per resource:**

| Resource | Filterable fields | Indexed? |
|---|---|---|
| Orders | `status`, `customer_id`, `created_at`, `total` | Yes |
| Customers | `email`, `created_at` | Yes |
| {{resource-3}} | {{fields}} | {{indexed}} |

Filtering on non-indexed fields may be rejected (`400 unfilterable_field`) or rate-limited harder.

**Sort conventions:**

```
?sort=created_at         (ascending)
?sort=-created_at        (descending; minus prefix)
?sort=-created_at,name   (multi-key)
```

**Sortable fields per resource:**

| Resource | Default sort | Sortable fields |
|---|---|---|
| Orders | `-created_at` | `created_at`, `total`, `status` |
| Customers | `-created_at` | `created_at`, `email` |

**Search:**

- Endpoint: `{{search-endpoint — e.g. /v1/customers/search}}`
- Query: `?q=<terms>`
- Tokenization: {{tokenization — e.g. "Unicode word boundaries; lowercased"}}.
- Operators: {{operators — e.g. "AND default; OR via `|`; phrase via quotes"}}.
- Fuzzy matching: {{fuzzy-policy — e.g. "Off by default; enable with `&fuzzy=true`"}}.
- Result ranking: {{ranking — e.g. "TF-IDF on indexed fields"}}.

**Combining filter + search + sort:**

```
GET /v1/customers/search?q=acme&status=active&sort=-created_at&limit=25
```

When `q` is present, the result is sorted by relevance unless `sort` is explicitly set.

**Common pitfalls:**

- Filtering on `updated_at` without an indexed-field hint can timeout on large collections.
- Search is eventually consistent; recently-created records may be missing for up to {{search-lag}}.
- Combining many filters can blow past URL-length limits — use POST with body filter on the {{advanced-search-endpoint}} endpoint when needed.
