---
slug: anti-patterns-and-pitfalls
title: "Anti-Patterns and Pitfalls"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 350
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 12. Anti-Patterns and Pitfalls

Common copybook anti-patterns observed in this library. Each item explains the failure mode and the recommended alternative.

### 12.1 Layout Anti-Patterns

- **Reordering existing fields** — silently shifts byte offsets; breaks every consumer. Always add at the trailing FILLER.
- **Changing PIC or USAGE in place** — breaks COMP-3 / DISPLAY conversions. Use a new REDEFINES variant.
- **Implicit padding** — relying on implicit byte padding instead of explicit FILLER produces compiler-version-dependent layouts.

### 12.2 REDEFINES Anti-Patterns

- **Variant size larger than base** — every consumer that allocates by base size silently corrupts when reading the larger variant.
- **Selector-less REDEFINES** — consumer must rely on context outside the copybook to know which variant is in use; brittle.
- **Multi-level nested REDEFINES** — almost always reducible to two single-level variants; nesting obstructs comprehension.

### 12.3 OCCURS Anti-Patterns

- **`OCCURS DEPENDING ON` controlling field PIC too narrow for max occurs** — `OCCURS 0 TO 999 DEPENDING ON FIELD` where FIELD is `PIC 9(2)` allows max 99, not 999.
- **Reading past `BILL-LINE-COUNT`** — undefined behaviour; consumers must clamp.

### 12.4 Auto-Generation Anti-Patterns

- **Hand-editing a DCLGEN-derived copybook** — silently breaks DDL alignment.
- **Hand-editing a DBD-derived copybook** — silently breaks segment-IO alignment.
- **Regenerating a hand-edited copybook without preserving the edits** — loses the edits silently.

### 12.5 Naming-Convention Anti-Patterns

- **Outside-convention copybooks accumulating in the library** — "no recognised prefix" should be empty in steady state.
- **Field names that don't echo the canonical record short name** — `CUST-RECORD` containing `ID`, `STATUS` instead of `CUST-ID`, `CUST-STATUS` — collisions in WORKING-STORAGE of consumers.

### 12.6 Drift Anti-Patterns

- **Multiple folders containing same-name copybooks with different content** — see duplicate-and-divergent-detection.
- **Copybooks edited but not re-deployed** — Endevor/ChangeMan packages out of sync with on-disk source.
- **Deprecated copybooks still in active use** — see deprecated-copybooks.

### 12.7 Library-Specific Pitfalls

| Pitfall | Affected Copybooks | Recommendation |
|---|---|---|
| [Description] | [list] | [recommended fix] |
