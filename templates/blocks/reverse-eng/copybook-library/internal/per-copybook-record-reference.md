---
slug: per-copybook-record-reference
title: "Per-Copybook Record Reference"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 3. Per-Copybook Record Reference

For every copybook, document the full record(s): every level, name, PIC, USAGE, OCCURS clauses, REDEFINES, FILLER, VALUE clauses, level-88 condition names. One sub-section per copybook.

### 3.1 Reference Format

For each copybook, render in the following form (extracted directly from the .cpy source):

```
Copybook: [COPYBOOK-NAME]
Source path: [path/to/file.cpy]
Source version: [package / commit]
Naming-convention bucket: [IO- / WS- / LS- / DB2- / IMS- / CICS-]
Record(s):

  01  [RECORD-NAME].
      05  [FIELD-NAME]      PIC [pic] [USAGE …] [VALUE …].
          88  [CONDITION]    VALUE [value(s)].
      05  [GROUP-NAME].
          10  [FIELD]         PIC [pic].
      05  [VARIANT-A].
          10  [...]
      05  [VARIANT-B] REDEFINES [VARIANT-A].
          10  [...]
      05  [TABLE]    OCCURS [N] TO [M] TIMES DEPENDING ON [field].
          10  [...]
      05  [FILLER]   PIC X([n]).
```

### 3.2 Content Per Copybook

| Copybook | Records | REDEFINES variants | OCCURS DEPENDING ON | Level-88 count | Notes |
|---|---|---|---|---|---|
| [CUSTREC] | 1 (CUST-RECORD) | 0 | 0 | 3 (CUST-ACTIVE, CUST-INACTIVE, CUST-PURGE) | byte-stable; canonical |
| [BILLAREA] | 1 (BILLAREA) | 1 (V1, V2) | 0 | 2 (BA-V1, BA-V2 selectors) | LS bucket; CICS COMMAREA |
| [BILLDETLS] | 1 (BILL-DETAILS) | 0 | 1 (BILL-LINES) | 0 | OCCURS 0..999 DEPENDING ON BILL-LINE-COUNT |

### 3.3 Auto-Generated Copybooks

For DCLGEN / DBD-derived copybooks, link back to the source artefact (DDL table, DBD segment).

| Copybook | Source Artefact | Generation Tool | Last Generated |
|---|---|---|---|
| [DB2-CUSTOMER] | DDL CUSTOMER table | DCLGEN | YYYY-MM-DD |
| [IMS-CUSTSEG]  | DBD CUSTDB segment CUSTSEG | DBDGEN-helper | YYYY-MM-DD |
