---
slug: breaking-changes
title: "Breaking Changes"
applies-to: [pr-description]
requires-decision-from: [author, reviewer, architect]
optional: true
order-hint: 5
---

## Breaking Changes

Anything in this PR that changes a public contract, removes a capability,
or requires consumers to take action. Omit the section entirely when the
change is fully backwards-compatible — do not write "None."

**Format:**

```
## Breaking Changes

### {{contract / surface affected}}
- **Before:** {{prior shape}}
- **After:** {{new shape}}
- **Migration:** {{what consumers must do, in concrete steps}}
- **Window:** {{deprecation window, e.g. "old form supported until
  release 4.2 / 2026-Q3"}}
```

**Rules:**

- "Public contract" includes: HTTP routes, response shapes, library
  exports, CLI flags, environment variables, event payloads, database
  columns consumed by downstream services.
- Always pair the contract change with a concrete migration step.
  "Consumers must update" is not a migration step.
- Internal refactors that do not change a consumer-visible contract are
  **not** breaking changes — describe them in `change-list` instead.

**Examples:**

- ✅ "Endpoint `GET /users/:id` now returns `roles: []` instead of
  `role: string`. Migration: consumers must accept an array; the
  single-string form is removed in 4.2."
- ❌ "Refactored auth internals." (not a breaking change — belongs in
  change-list)
- ❌ "Some consumers may need to update." (vague; not actionable)
