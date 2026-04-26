---
slug: change-list
title: "Changes"
applies-to: [pr-description]
requires-decision-from: [author]
optional: false
order-hint: 2
---

## Changes

A grouped, reviewable inventory of what the diff touches. The reviewer
uses this section as their reading order — bullets should map to logical
units of change, not files.

**Format:**

```
## Changes

### {{logical-group-1, e.g. "Auth backend"}}
- {{path/or/area}} — {{one-line what + why}}
- ...

### {{logical-group-2, e.g. "Database migration"}}
- {{path/or/area}} — {{one-line what + why}}

### {{logical-group-3, e.g. "Tests"}}
- {{path/or/area}} — {{one-line what + why}}
```

**Rules:**

- Group by logical concern (backend / frontend / migration / tests / docs),
  not by directory.
- One bullet per logical unit, not per file. A 12-file rename is one bullet.
- Cite the increment / FR for each group where applicable.
- Schema or contract changes always get their own group.

**Examples:**

- ✅ "Auth backend — adds `EntraAuthClient` and wires it into the
  `/login` route. (INC-014, FR1.9.1)"
- ❌ "Updated 14 files." (useless to reviewers)
- ❌ "Files in `src/auth/`" (groups by directory, not concern)

### Common Mistake — bundling unrelated changes

If the change-list crosses unrelated concerns (e.g. an auth feature plus
an unrelated logging fix), split the PR. The change-list section should
read as **one** coherent change-set.
