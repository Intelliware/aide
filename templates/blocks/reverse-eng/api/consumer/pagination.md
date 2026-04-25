---
slug: pagination
title: "Pagination"
applies-to: [re-api-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. Pagination

Document the API's pagination model: cursor-based, offset-based, page-based, or hybrid. Specify defaults, maximums, how the consumer requests the next page, how the consumer detects end-of-data, and what happens during concurrent inserts/deletes (drift, duplication, missed records). Verify by paginating a real list endpoint and checking edge cases: empty page, single-item page, exactly-`limit` page, mid-pagination resource deletion.

If the API supports more than one model (e.g., cursor for some endpoints, offset for others), document which is used where. Cursor pagination is preferred for stable iteration over changing data; offset pagination is acceptable for short, mostly-static lists. Note rate-limit interaction: paging deeply through a large list can quickly exhaust quota.

### Suggested template content

**Pagination model:** {{model — e.g. "Cursor-based (opaque)"}}

**Default & maximum page size:**

| Setting | Default | Maximum |
|---|---|---|
| `limit` | {{default-limit}} | {{max-limit}} |

**Cursor pagination (preferred):**

```
GET /v1/orders?limit=50

Response:
{
  "data": [ ... ],
  "next_cursor": "{{opaque-cursor}}",
  "has_more": true
}
```

To fetch the next page:

```
GET /v1/orders?limit=50&cursor={{opaque-cursor}}
```

**End-of-data signal:**

- `has_more: false` AND `next_cursor: null`.
- Consumers MUST check `has_more`, not the length of `data`.

**Cursor opacity:**

- Cursors are opaque base64 tokens. Do not parse, sort, or persist them long-term.
- Cursors expire after {{cursor-ttl — e.g. 1 hour}}.

**Offset pagination (legacy / specific endpoints):**

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | 1-indexed |
| `per_page` | {{default}} | Max {{max}} |

```
GET /v1/legacy?page=2&per_page=25
```

Response includes a `Link` header (RFC 5988):

```
Link: <...?page=3>; rel="next", <...?page=10>; rel="last"
```

**Stability under concurrent writes:**

- Cursor pagination: snapshot semantics — newly-inserted records do NOT appear mid-iteration.
- Offset pagination: NO stability — inserts/deletes can cause skipped or duplicated records.

**Total count:**

- {{total-count-policy — e.g. "Returned in `X-Total-Count` header on first page only; expensive on large collections"}}.
- For very large collections, `X-Total-Count` may be absent; rely on `has_more`.

**Sample pseudocode:**

```{{lang}}
let cursor = null;
do {
  const url = `/v1/orders?limit=100${cursor ? `&cursor=${cursor}` : ''}`;
  const res = await get(url);
  for (const order of res.data) process(order);
  cursor = res.next_cursor;
} while (cursor);
```

**Common pitfalls:**

- Sorting by mutable fields (e.g. `updated_at`) without a cursor → records may be skipped.
- Treating `next_cursor` as parseable / persistent — it's opaque and expires.
- Paginating without a `limit` and getting throttled — always set an explicit limit.
