---
slug: copybook-where-used
title: "Copybook Where-Used"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 120
---

## 2. Copybook Where-Used

For every copybook in any contributing copybook library, list every program that copies it and every JCL step that writes a dataset whose record copybook is this one.

### 2.1 Per-Copybook Reference

For each copybook, render the following:

```
### [COPYBOOK-NAME]
Library: [REPO-SLUG]
Variants: [variant names from the canonical record graph]
Naming-convention bucket: [IO- / WS- / LS- / DB2- / IMS- / CICS-]

Copied by N programs:
  - [PROGRAM-ID]  ([section]; [FD or LINKAGE 01-level]; [key fields touched])
  - ...

Consumed by M JCL steps (via FD ↔ DD ↔ copybook chain):
  - [JOB.STEP]  ([io=input/output]; DSN=...; [GDG=+1/0/-1])
  - ...

Drift warning (if any): see `copybook-conflicts.md` in the contributing copybook library
```

### 2.2 Unused Copybooks

Copybooks with no program consumers are documented with an explicit "no consumers found" note. They are also surfaced in `09-unbound-and-flagged-items.md` so an architect can decide whether to deprecate.

### 2.3 Divergent Copybooks

When a copybook name appears in multiple libraries with byte-different content, each is documented as its own entry, with a cross-link to `copybook-conflicts.md` and a list of programs still using each variant.

### 2.4 Sort Order

Copybooks are sorted by naming-convention bucket, then alphabetically within bucket. The summary in `10-lineage-summary.md` provides an alphabetical index across all buckets.
