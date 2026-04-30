---
slug: db2-host-variable-bindings
title: "DB2 Host-Variable Bindings"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
---

## 6. DB2 Host-Variable Bindings

For every `EXEC SQL` block in any contributing program, map host variables back to working-storage / linkage / copybook fields and forward to DB2 columns.

### 6.1 Per-EXEC-SQL Section

For each EXEC SQL block, render:

```
### [PROGRAM].[SECTION]  (verb=[SELECT/FETCH/INSERT/UPDATE/DELETE/...])
Source lines: [PROGRAM.cbl:N-M]
Tables / views: [TAX_TABLE, ...]
Cursor: [yes/no — name=CUST-CUR if applicable]

Statement:
  EXEC SQL
       SELECT TAX_RATE
         INTO :WS-TAX
         FROM TAX_TABLE
        WHERE COUNTRY_CODE = :WS-COUNTRY
  END-EXEC

Host-var bindings:
  | Position | Host Variable | DB2 Column           | Type Compatibility |
  |----------|---------------|----------------------|--------------------|
  | INTO[1]  | :WS-TAX       | TAX_TABLE.TAX_RATE   | DECIMAL(7,2) → S9(5)V99 COMP-3  ✓ |
  | WHERE[1] | :WS-COUNTRY   | TAX_TABLE.COUNTRY_CODE | CHAR(2) → X(2)  ✓ |

Working-storage / linkage chain:
  :WS-TAX → WORKING-STORAGE WS-TAX (no copybook)
  :WS-COUNTRY → WORKING-STORAGE WS-COUNTRY (from COPY WSCNTRY)
```

### 6.2 Cursor Bindings

For declared cursors, document the DECLARE / OPEN / FETCH / CLOSE chain:

```
Cursor: CUST-CUR
  DECLARE: BILLPROC.0500-DECLARE  (BILLPROC.cbl:88-95)
  OPEN:    BILLPROC.2000-PROCESS  (BILLPROC.cbl:140)
  FETCH:   BILLPROC.2100-LOOP     (BILLPROC.cbl:148-150) — INTO :CUST-RECORD
  CLOSE:   BILLPROC.9000-TERM     (BILLPROC.cbl:280)
```

### 6.3 Indicator Variables

For nullable DB2 columns, the host-var requires an indicator. Document each pair:

```
Column CUSTOMER.CUST_NAME (NULLABLE)
  Host var:        :CUST-NAME       (X(40))
  Indicator host:  :CUST-NAME-IND   (S9(4) COMP)
  Source:          DB2-CUSTOMER copybook (DCLGEN-generated)
```

Missing indicators on nullable columns are flagged in `09-unbound-and-flagged-items.md` § 8.

### 6.4 SQLCODE Routing

For each program, summarise the SQLCODE handling convention. Detail lives in the cobol-program Part A's `error-handling-and-abend-codes` block; this section cross-links.

### 6.5 Type-Compatibility Failures

DB2 column type / host-var PIC mismatches are flagged in `09-unbound-and-flagged-items.md` § 8. Examples:

- DB2 `INTEGER` against host-var `PIC 9(5) DISPLAY` (host-var too narrow / wrong USAGE)
- DB2 `DECIMAL(15,2)` against host-var `PIC 9(9)V99 COMP-3` (host-var too narrow)
- DB2 `VARCHAR(40)` against host-var `PIC X(40)` (missing the `LENGTH` half-word for VARCHAR)

### 6.6 SELECT * and Opaque Statements

`SELECT *` and other column-list-omitted statements cannot have their bindings resolved without consulting the DB2 catalogue. Each is flagged in `09-unbound-and-flagged-items.md` and rendered here with a note: "column positions not resolved; consult DB2 catalogue."
