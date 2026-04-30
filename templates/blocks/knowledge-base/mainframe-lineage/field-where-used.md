---
slug: field-where-used
title: "Field Where-Used"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
---

## 3. Field Where-Used

For every canonical field in every copybook, list every program section that reads, writes, or `MOVE`s the field. Indexed fields (`OCCURS DEPENDING ON`) are recorded with `[i]` notation.

### 3.1 Per-Field Reference

For each canonical field, render:

```
### [COPYBOOK].[RECORD].[FIELD]    (level [N], PIC [pic], USAGE [usage])
Read by:
  - [PROGRAM].[SECTION]    ([source-lines] — [verb e.g. MOVE source / DISPLAY])
  - ...
Written by:
  - [PROGRAM].[SECTION]    ([source-lines] — [verb e.g. MOVE target])
  - ...
Drift (if any):
  - Also exists in [OTHER-COPYBOOK] as [pic] [usage] (drift; see copybook-conflicts.md)
  - Programs still using [OTHER-COPYBOOK]: [list]
```

### 3.2 Group-Level References

Programs that MOVE an entire group (e.g. `MOVE CUST-RECORD TO WS-WORK-RECORD`) reference the group by name. Group entries appear at the level of the group, with their elementary children listed beneath.

### 3.3 Indexed Fields

For fields inside `OCCURS [DEPENDING ON]` groups, the entry uses canonical position notation:

```
### BILLDETLS.BILL-DETAILS.BILL-LINES[i].BL-PRODUCT  (level 10, PIC X(15))
Read by:
  - BILLPROC.2400-WRITE  (BILLPROC.cbl:220 — PERFORM VARYING IDX FROM 1 BY 1)
Written by:
  - (none — assigned via MOVE CORRESPONDING from input record)
```

`BILL-LINES[i]` denotes "any valid index"; expansion to integer positions is left to a downstream consumer that knows the run-time `BILL-LINE-COUNT`.

### 3.4 Unused Fields

Fields with no program citations (typical of FILLERs, deprecated fields, and DCLGEN-generated indicator vars that programs ignore) are documented with "no consumers found." These are surfaced in `09-unbound-and-flagged-items.md` for architect review (not a hard failure).

### 3.5 Cross-Copybook Field-Name Collisions

The same field name (`CUST-AMOUNT`, `BILL-AMOUNT`) appearing in different copybooks is documented as separate canonical fields. Domain consolidation across copybooks is not done at this layer — that is a refactoring exercise out of scope for lineage.

### 3.6 Sort Order

Sorted alphabetically by full canonical name (`COPYBOOK.RECORD.FIELD`). The summary in `10-lineage-summary.md` provides a flat alphabetical index by short field name (`CUST-AMOUNT` regardless of copybook).
