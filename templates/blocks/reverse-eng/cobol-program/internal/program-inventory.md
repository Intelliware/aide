---
slug: program-inventory
title: "Program Inventory"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 110
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 1. Program Inventory

### 1.1 Programs in Scope

One row per program (`.cbl/.cob/.pli`). Rows that fall outside scope (deprecated, vendor-shipped) appear in a separate "Out of scope" sub-table with reason.

| Program ID | Source File | Execution Context | Has EXEC CICS | Has EXEC SQL | Has EXEC DLI | Last Modified | Last Verified |
|---|---|---|---|---|---|---|---|
| [PROGNAME] | [path/to/file.cbl] | batch / cics / ims-mpp / ims-bmp | yes / no | yes / no | yes / no | YYYY-MM-DD | YYYY-MM-DD (commit / ENV pkg) |

### 1.2 Inventory Statistics

| Metric | Count |
|---|---|
| Total programs | [N] |
| Batch programs | [N] |
| CICS online programs | [N] |
| IMS-MPP / IMS-BMP programs | [N] |
| Programs with EXEC SQL | [N] |
| Programs with EXEC CICS | [N] |
| Programs with EXEC DLI | [N] |
| Static `CALL` targets (distinct) | [N] |
| Dynamic `CALL` sites (flagged) | [N] |
| Distinct copybooks referenced | [N] |

### 1.3 Out of Scope

| Program ID | Reason | Last Reviewed |
|---|---|---|
| [PROGNAME] | deprecated / vendor / archived | YYYY-MM-DD |
