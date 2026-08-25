---
slug: deprecated-copybooks
title: "Deprecated Copybooks"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 200
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 10. Deprecated Copybooks

Deprecated copybooks remain on disk for backward compatibility but must NOT be used by new programs. This section lists each, the reason for deprecation, the canonical replacement, and the deadline for removing it from active use.

### 10.1 Deprecation Inventory

| Copybook | Reason | Replacement | Programs Still Using | Removal Target |
|---|---|---|---|---|
| [CUSTREC.LEGACY] | superseded 2023-Q3 by CUSTREC | CUSTREC | BILLEXTR, BILLREPT-OLD | 2027-Q1 |
| [WSCNTRS-V0]     | superseded by WSCNTRS-V2 | WSCNTRS-V2 | (none — safe to delete) | next release |
| [LSCOMM-V0]      | original 80-byte COMMAREA superseded by LSCOMM (200-byte) | LSCOMM | (none) | next release |

### 10.2 Marking Convention

Deprecated copybooks are marked with a header comment:

```
*****************************************************
* COPYBOOK: CUSTREC.LEGACY
* STATUS:   DEPRECATED — use CUSTREC instead
* SINCE:    2023-09-15
* SUNSET:   2027-Q1
*****************************************************
```

| Marker | Meaning |
|---|---|
| `*DEPRECATED*` in header | do not use in new programs |
| `*SUNSET:*` in header  | scheduled removal date |

### 10.3 Identifying Active Use

Active use is detected by the lineage skill's `copybook-where-used.md`. Programs still copying a deprecated copybook are flagged for migration.

### 10.4 Removal Discipline

Removing a deprecated copybook from disk requires:
1. Zero programs still copying it (per lineage)
2. Architectural sign-off (decision recorded in change-tracker)
3. Source-control archive (do not delete history; mark "archived")
4. Update of this section after removal (history retained as a footnote)

### 10.5 Anti-Pattern

Adding a fix to a deprecated copybook (instead of migrating consumers to the canonical replacement) is an anti-pattern. Document any case found:

| Copybook | Recent Edit | Reason | Recommendation |
|---|---|---|---|
| [example] | 2026-03 | quick fix for production incident | follow-up: migrate consumers; revert deprecated edit |
