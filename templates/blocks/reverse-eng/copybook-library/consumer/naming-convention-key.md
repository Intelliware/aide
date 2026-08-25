---
slug: naming-convention-key
title: "Naming-Convention Key"
applies-to: [re-copybook-library-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 320
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 16. Naming-Convention Key

Quick reference to the leading-prefix conventions used in this library. Mirrors Part A's naming-convention-buckets section, scoped to the consumer view.

### 16.1 Prefix → Purpose

| Prefix | Purpose | When You Use It |
|---|---|---|
| `IO-` | file record layouts | Open an FD; declare a record under `01 ... COPY IO-XXX.` |
| `WS-` | shared working-storage groups | Pull common counters / dates into your WORKING-STORAGE |
| `LS-` | linkage / commareas | Define a CICS COMMAREA or batch CALL parameter |
| `DB2-` | DCLGEN host variables | Bind EXEC SQL `INTO :host-var` |
| `IMS-` | DBD-derived segment IO | Read or write IMS segments |
| `CICS-` | BMS map records, channel containers | CICS SEND/RECEIVE MAP or PUT/GET CONTAINER |

### 16.2 Field-Name Convention (within a copybook)

Every elementary field within a copybook prefixes the canonical record short name. Examples:

| Copybook | Record | Short Name | Example Fields |
|---|---|---|---|
| CUSTREC  | CUST-RECORD | CUST | CUST-ID, CUST-STATUS, CUST-NAME |
| BILLREC  | BILL-RECORD | BILL | BILL-ID, BILL-AMOUNT, BILL-DATE |
| LSCOMM   | BILLAREA    | BA   | BA-VERSION, BA-CUST-ID, BA-RESULT |
| WSCNTRS  | WS-COUNTERS | WS-CNT | WS-CNT-CUSTS, WS-CNT-BILLS |

### 16.3 DB2 Indicator Variables

DCLGEN appends `-IND` to nullable columns. Use them in EXEC SQL with the same colon-host-var form:

```cobol
       EXEC SQL
            SELECT CUST_NAME
              INTO :CUST-NAME :CUST-NAME-IND
              FROM CUSTOMER
             WHERE CUST_ID = :CUST-ID
       END-EXEC
       IF CUST-NAME-IND = -1
          MOVE 'UNKNOWN' TO CUST-NAME-DISPLAY
       END-IF
```

### 16.4 Variant Selector Naming

For copybooks with REDEFINES, the selector field follows the parent record's short-name convention with `-VERSION` (or domain-specific suffix):

| Copybook | Selector | Variant Names |
|---|---|---|
| BILLAREA | BA-VERSION | BILLAREA-V1, BILLAREA-V2 |
| TXNREC   | TXN-KIND   | TXNREC-DEBIT, TXNREC-CREDIT |

### 16.5 Outside-Convention Copybooks

Copybooks with no recognised prefix exist but are flagged for review. Treat them as one-off; do not assume they fit any of the above patterns.
