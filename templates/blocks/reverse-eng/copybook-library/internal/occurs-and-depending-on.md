---
slug: occurs-and-depending-on
title: "OCCURS and DEPENDING ON"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 5. OCCURS and DEPENDING ON

For every copybook with `OCCURS`, document the table shape, the controlling field (if `DEPENDING ON`), and the canonical max-occurrence expansion used by the lineage skill.

### 5.1 OCCURS Inventory

| Copybook | Table Group | Min | Max | DEPENDING ON | Notes |
|---|---|---|---|---|---|
| [BILLDETLS] | BILL-LINES | 0 | 999 | BILL-LINE-COUNT | variable-length record |
| [STATETBL]  | STATE-CODES | 50 | 50 | (none — fixed) | fixed-length lookup |
| [TXNARR]    | TXN-DETAIL  | 1 | 50 | TXN-COUNT | typical max in production: 12 |

### 5.2 Variable-Length Records (DEPENDING ON)

For each `OCCURS DEPENDING ON`:

| Copybook | Controlling Field | Element Length | Header Length | Max Total Length | Notes |
|---|---|---|---|---|---|
| [BILLDETLS] | BILL-LINE-COUNT (PIC 9(4)) | 30 | 4 | 4 + 999*30 = 29,974 | RECFM=VB; CRLF separator |

### 5.3 Indexed Field Naming for the Lineage Skill

The lineage skill expands OCCURS into indexed positions: `BILL-LINES[0]`, `BILL-LINES[1]`, …, `BILL-LINES[BILL-LINE-COUNT-1]`. Document the convention:

| Convention | Description |
|---|---|
| Zero-indexed | start at [0] |
| Inclusive of count − 1 | last valid index is `(controlling-value − 1)` |
| Sub-fields | indexed via dotted notation: `BILL-LINES[i].BL-PRODUCT` |

### 5.4 Fixed-Length OCCURS (no DEPENDING ON)

Fixed-length tables are simpler — document the controlling literal (`OCCURS 50 TIMES`) and the resulting byte-stable record size.

### 5.5 Anti-Patterns

- **Reading past `BILL-LINE-COUNT`** — undefined behaviour; programs must clamp to the controlling field.
- **Mismatched controlling-field PIC vs. max occurs** — `OCCURS 0 TO 999 DEPENDING ON FIELD` where FIELD is `PIC 9(2)` allows max 99, not 999. Flag.
