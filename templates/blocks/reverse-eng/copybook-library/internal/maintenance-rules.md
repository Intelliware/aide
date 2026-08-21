---
slug: maintenance-rules
title: "Maintenance Rules"
applies-to: [re-copybook-library-internal]
requires-decision-from: [architect]
optional: false
order-hint: 210
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 11. Maintenance Rules

Rules for editing copybooks. These exist because copybooks have many consumers — a careless edit can silently corrupt every program that copies the modified record.

### 11.1 Compatibility Discipline

| Edit | Allowed? | Rationale |
|---|---|---|
| Add a field at the trailing FILLER | yes (with FILLER reservoir) | byte size unchanged for older consumers |
| Reorder existing fields | no | shifts byte offsets; breaks every consumer |
| Change a PIC clause | no | breaks COMP-3 / DISPLAY conversions in consumers |
| Change a USAGE clause | no | same as PIC change |
| Add a level-88 condition name | yes | adds a predicate; no byte-layout change |
| Remove a level-88 condition name | no | breaks programs that test it |
| Add a REDEFINES variant | yes (with new selector value) | additive |
| Remove a REDEFINES variant | only if no consumer uses it | check via lineage's where-used |
| Edit a DCLGEN-generated copybook | no | regenerate from DDL instead |
| Edit a DBD-derived copybook | no | regenerate from DBD instead |

### 11.2 Trailing-FILLER Reservoir Convention

Each copybook should reserve a FILLER at the end large enough to accommodate plausible additions without growing the byte size. Common conventions:

| Copybook Class | Trailing FILLER Size | Rationale |
|---|---|---|
| File records (`IO-`) | 10–20 bytes | record extensions over time |
| COMMAREAs (`LS-`) | 16 bytes | CICS LINK LENGTH stability |
| DCLGEN copybooks | 0 (regenerated) | DCLGEN handles |

### 11.3 Change-Review Discipline

| Change Type | Reviewer | Lineage Re-Run? |
|---|---|---|
| Add a field at trailing FILLER | data architect | yes |
| Add a REDEFINES variant | data architect + downstream consumers | yes |
| Mark deprecated | architect | yes (re-flag consumers) |
| Remove a deprecated copybook | architect | yes (must show zero consumers) |

### 11.4 Naming-Convention Enforcement

New copybooks must use a recognised naming-convention bucket prefix (per the naming-convention-buckets block). Outside-convention names are flagged at PR review.

### 11.5 Regeneration Discipline

Auto-generated copybooks (DCLGEN, DBD-derived) are regenerated, never edited. Document the regeneration command per generator in the change-tracker, so re-running is reproducible.

### 11.6 Versioning

Some shops version copybooks via filename suffix (`-V0`, `-V1`, `-V2`) when a binary-incompatible change is unavoidable. Document the convention here if in use:

| Approach | When |
|---|---|
| In-place evolution via REDEFINES + new selector value | preferred — consumers opt in |
| Filename version suffix | when LINKAGE shape is changing for a subset of programs |
