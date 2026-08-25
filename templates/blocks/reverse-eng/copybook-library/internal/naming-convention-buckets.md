---
slug: naming-convention-buckets
title: "Naming-Convention Buckets"
applies-to: [re-copybook-library-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 120
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 2. Naming-Convention Buckets

Copybooks in this library are organised by leading-prefix naming convention. Buckets are confirmed with the user during scaffolding.

### 2.1 Bucket Catalogue

| Prefix | Purpose | Member Count | Examples |
|---|---|---|---|
| `IO-` | file record layouts (FD-bound) | [N] | IO-CUSTREC, IO-BILLREC |
| `WS-` | shared working-storage groups | [N] | WS-COUNTERS, WS-DATETIME |
| `LS-` | linkage / commareas | [N] | LS-COMMAREA, LS-CUST-INPUT |
| `DB2-` | DCLGEN-generated host-variable copybooks | [N] | DB2-CUSTOMER, DB2-BILLING |
| `IMS-` | IMS DBD-derived segment layouts | [N] | IMS-CUSTSEG |
| `CICS-` | CICS-related (BMS map records, channel containers) | [N] | CICS-MAP1IN |
| (other) | unrecognised prefix — flagged for user review | [N] | (list) |

### 2.2 Bucket-Specific Rules

| Bucket | Rule | Rationale |
|---|---|---|
| `IO-` | one record per file; FD-bound; do not include in WORKING-STORAGE | record layouts are I/O-bound |
| `DB2-` | regenerate from DDL via DCLGEN; do not hand-edit | drift from DDL silently corrupts hosts |
| `IMS-` | regenerate from DBD; do not hand-edit | drift from DBD silently corrupts segment IO |
| `LS-` | LINKAGE only; binary-stable shape across versions or REDEFINES variants | breaking the LINKAGE shape breaks every caller |

### 2.3 Cross-Bucket Conventions

| Convention | Description |
|---|---|
| Field naming | within a copybook, all fields prefix the canonical record short name (e.g. CUSTREC → `CUST-ID`, `CUST-STATUS`) |
| Filler | every copybook ends with explicit `FILLER` to a known byte boundary; never relies on implicit padding |
| Padding | numeric COMP-3 fields aligned on `SYNCHRONIZED` boundaries |

### 2.4 Outside-Convention Copybooks

Copybooks with no recognised prefix appear here. Decide per copybook: assign to a bucket, leave as one-off, or deprecate.
