---
slug: field-index
title: "Field Index"
applies-to: [re-copybook-library-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 15. Field Index

Every elementary field name in the library, with the copybooks (and variants) that contain it. Use this to answer "which copybook contains field X" or "where does field X appear."

### 15.1 Index Format

| Field Name | Copybook | Record / Variant | Level | PIC | USAGE | Notes |
|---|---|---|---|---|---|---|
| CUST-AMOUNT  | CUSTREC | CUST-RECORD | 05 | S9(9)V99 | COMP-3 | canonical |
| CUST-AMOUNT  | CUSTREC.LEGACY | CUST-RECORD | 05 | 9(11)V99 | DISPLAY | drift — see copybook-conflicts.md |
| CUST-AMOUNT  | IO-CUST-EXTRACT | CUST-EXTRACT-RECORD | 10 | S9(9)V99 | COMP-3 | extract record |
| CUST-ID      | CUSTREC | CUST-RECORD | 05 | 9(10) | DISPLAY | canonical |
| CUST-ID      | DB2-CUSTOMER | DB2-CUSTOMER | 05 | 9(10) | DISPLAY | DCLGEN — matches DDL |
| CUST-ID      | IMS-CUSTSEG  | IMS-CUSTSEG  | 05 | 9(10) | DISPLAY | DBD-derived |
| BILL-LINES   | BILLDETLS | BILL-DETAILS | 05 | (group, OCCURS 0..999) | (n/a) | indexed table |
| BL-PRODUCT   | BILLDETLS | BILL-DETAILS | 10 | X(15) | DISPLAY | inside BILL-LINES |

### 15.2 Naming Collisions

Where the same field name appears in multiple copybooks with different PIC / USAGE, the field is listed multiple times above. These cases are flagged in `copybook-conflicts.md`.

### 15.3 Domain-Specific Field Groups

For convenience, group fields by domain:

#### Customer Identity
- CUST-ID, CUST-NAME, CUST-STATUS, CUST-LINE1, CUST-LINE2, CUST-CITY, CUST-STATE, CUST-POSTAL

#### Billing
- BA-AMOUNT, BA-CURRENCY, BA-MULTIPLIER, BILL-LINE-COUNT, BL-PRODUCT, BL-QUANTITY, BL-UNIT-PRICE

#### DB2 Indicator Variables
- CUST-NAME-IND, BA-MULTIPLIER-IND (every nullable column has a paired indicator)

### 15.4 Cross-Reference to the Lineage Skill

The lineage skill's `field-where-used.md` extends this index by adding "every program section that reads/writes/MOVEs the field." When lineage is in scope, treat the lineage version as the authoritative source.
