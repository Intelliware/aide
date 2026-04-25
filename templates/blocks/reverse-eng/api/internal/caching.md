---
slug: caching
title: "Caching"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 270
---

## 17. Caching

This section documents how the API caches data, what backing store the cache uses, where cache reads/writes happen in the request pipeline, and how invalidation is handled. The goal is to give a downstream AI everything it needs to add a new cached path without introducing stale-data bugs or accidentally bypassing existing cache layers. Extract from the source code: which library or client wraps the cache (e.g., `redis`, `ioredis`, `node-cache`, `IMemoryCache`, `cachetools`), where TTLs are configured (constants file vs per-call), and what key-naming convention is used.

To verify against the actual implementation, search for cache import sites and trace at least one read-through and one write-through flow end-to-end. Confirm the documented TTL values match what is set in code, and confirm that any "cache-aside" pattern actually re-checks the source on miss. Be careful about three common false positives: (1) memoization helpers that look like a cache but live only inside a single request scope, (2) HTTP-layer caching headers (`Cache-Control`, ETag) that are documented but not actually honored by upstream proxies, and (3) framework-level "second-level cache" that is configured but disabled in production.

Hallucination risks: do not invent Redis if the codebase only uses in-process caching; do not assume cache invalidation happens automatically on writes — it is almost always explicit. If the codebase has multiple cache layers (e.g., in-process LRU + Redis), document each one separately with its own TTL and invalidation rules.

If the API has no caching layer at all, mark this section as "Not applicable — no caching is used in this service" and skip the subsections.

### Suggested template content

#### 17.1 Cache Layers

| Layer | Backing Store | Library / Client | Scope | Default TTL |
|-------|---------------|------------------|-------|-------------|
| {{layer-name}} | {{e.g., Redis 7, in-process LRU, Memcached}} | {{e.g., ioredis 5.x}} | {{per-request / per-process / shared}} | {{e.g., 60s, 5m, 1h}} |

#### 17.2 Cache Key Conventions

- **Namespace prefix:** `{{e.g., svc:users:}}`
- **Key format:** `{{e.g., svc:users:{userId}:profile:v2}}`
- **Versioning strategy:** {{e.g., embedded `:v2` suffix bumped on shape change}}
- **Tenant isolation:** {{e.g., `{tenant}:` prefix on every key, or per-tenant DB index}}

#### 17.3 Read-Through / Write-Through Patterns

```{{language}}
// Canonical cache-aside read pattern used by this codebase
{{example: check cache → miss → load from repo → write to cache → return}}
```

```{{language}}
// Canonical write-through / invalidation-on-write pattern
{{example: update repo → DEL key (or SET new value) → publish invalidation event}}
```

#### 17.4 Invalidation Rules

| Mutation | Keys Invalidated | Mechanism |
|----------|------------------|-----------|
| {{e.g., user.update}} | {{e.g., svc:users:{id}:*}} | {{e.g., DEL on commit}} |
| {{e.g., product.price-change}} | {{e.g., svc:products:{id}, svc:catalog:list:*}} | {{e.g., pub/sub broadcast}} |

#### 17.5 What MUST NOT Be Cached

- {{e.g., authentication tokens}}
- {{e.g., per-request authorization decisions}}
- {{e.g., write-side responses (anything mutating)}}

#### 17.6 Operational Notes

- **Eviction policy:** {{e.g., allkeys-lru with maxmemory 2gb}}
- **Failure mode:** {{e.g., cache miss on connection failure — never block the request}}
- **Warmup:** {{e.g., none / scheduled job at deploy / lazy on first hit}}
