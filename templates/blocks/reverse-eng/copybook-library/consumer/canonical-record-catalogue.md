---
slug: canonical-record-catalogue
title: "Canonical Record Catalogue"
applies-to: [re-copybook-library-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 300
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 14. Canonical Record Catalogue

Every record in the library, post-REDEFINES (named variants) and post-OCCURS expansion (indexed positions). Generated from `copybook-record-graph.json`. This is the data dictionary.

### 14.1 Catalogue (Excerpt — Per Naming-Convention Bucket)

For each record, show the canonical name, source copybook, byte size, and one-line purpose.

#### IO- (file records)

| Record | Copybook | Byte Size | Purpose |
|---|---|---|---|
| CUST-RECORD       | CUSTREC | 200 | customer master |
| BILL-RECORD       | BILLREC | 250 | billing line |
| CUST-EXTRACT-RECORD | IO-CUST-EXTRACT | 180 | nightly customer extract for billing |

#### WS- (shared working-storage)

| Record | Copybook | Byte Size | Purpose |
|---|---|---|---|
| WS-COUNTERS | WSCNTRS | 80 | program-local counters |
| WS-DATETIME | WSDATE  | 30 | derived date/time fields |

#### LS- (linkage / commareas)

| Record (variant) | Copybook | Byte Size | Purpose |
|---|---|---|---|
| BILLAREA-V1 | LSCOMM | 200 | billing CICS COMMAREA — legacy V1 |
| BILLAREA-V2 | LSCOMM | 200 | billing CICS COMMAREA — current V2 |
| LS-CUST-INPUT | LS-CUST-INPUT | 100 | callable subprogram input |

#### DB2- (DCLGEN)

| Record | Copybook | DB2 Table | Purpose |
|---|---|---|---|
| DB2-CUSTOMER | DB2-CUSTOMER | CUSTOMER | host vars + indicator vars |
| DB2-BILLING  | DB2-BILLING  | BILLING  | host vars |

#### IMS- (DBD-derived)

| Record | Copybook | DBD / Segment | Purpose |
|---|---|---|---|
| IMS-CUSTSEG | IMS-CUSTSEG | CUSTDB / CUSTSEG | customer segment IO |
| IMS-ADDRSEG | IMS-ADDRSEG | CUSTDB / ADDRSEG | address child segment |

### 14.2 Variant Selectors

For records with REDEFINES variants, document the selector field used to pick the active variant.

| Record Pair | Selector | Values |
|---|---|---|
| BILLAREA-V1 / BILLAREA-V2 | BA-VERSION | '1' / '2' |
| TXNREC-DEBIT / TXNREC-CREDIT | TXN-KIND | 'D' / 'C' |

### 14.3 OCCURS Tables

For records containing variable-length tables (`OCCURS DEPENDING ON`), document the table boundaries.

| Record | Table | Index Range | Element Size | Notes |
|---|---|---|---|---|
| BILL-DETAILS | BILL-LINES | [0..BILL-LINE-COUNT-1] | 30 bytes | max 999 occurrences |

### 14.4 Cross-Reference to Source

Every entry in this catalogue has a corresponding source-line citation in Part A's per-copybook record reference.
