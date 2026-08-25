---
slug: exec-sql-inventory
title: "EXEC SQL Inventory"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 190
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 9. EXEC SQL Inventory

For programs precompiled against DB2 (or another DBMS), document every embedded `EXEC SQL` statement. Excluded if no `EXEC SQL` blocks are found in source.

### 9.1 Per-Program EXEC SQL Table

| Program ID | Statement Kind | Tables / Views | Cursor? | Host Variables (INTO / VALUES) | Source Lines |
|---|---|---|---|---|---|
| [PROGNAME] | SELECT | TAX_TABLE | no | INTO :WS-TAX | [file:N-M] |
| [PROGNAME] | DECLARE CURSOR | CUSTOMER, ORDERS | yes (CUST-CUR) | n/a | [file:N-M] |
| [PROGNAME] | OPEN CURSOR | (declared) | yes | n/a | [file:N-M] |
| [PROGNAME] | FETCH | CUSTOMER | yes | INTO :CUST-RECORD | [file:N-M] |
| [PROGNAME] | INSERT | BILLING | no | VALUES (:BILL-RECORD) | [file:N-M] |
| [PROGNAME] | UPDATE | CUSTOMER | no | SET STATUS = :WS-NEW-STATUS | [file:N-M] |
| [PROGNAME] | DELETE | OBSOLETE | no | n/a | [file:N-M] |
| [PROGNAME] | COMMIT | — | n/a | n/a | [file:N-M] |
| [PROGNAME] | ROLLBACK | — | n/a | n/a | [file:N-M] |

### 9.2 Cursor Inventory

For each cursor: declaration, open/close, fetch order, lock mode.

| Program ID | Cursor | Declared Lines | Tables | Lock Mode | Open / Close Sites |
|---|---|---|---|---|---|
| [PROGNAME] | CUST-CUR | [file:N] | CUSTOMER | WITH UR / RR / CS / RS | OPEN @ 2100; CLOSE @ 9100 |

### 9.3 Host-Variable Bindings

Every host variable referenced by an EXEC SQL block must be declared in WORKING-STORAGE or LINKAGE. Cross-check against the working-storage-and-linkage block.

| Program ID | Host Variable | Declared In | Resolves To | Source Lines |
|---|---|---|---|---|
| [PROGNAME] | :WS-CUST-ID | WORKING-STORAGE | WS-CUST-ID PIC 9(10) | [file:N-M] |
| [PROGNAME] | :CUST-RECORD | WORKING-STORAGE | 01 CUST-RECORD COPY CUSTREC | [file:N-M] |

### 9.4 SQLCODE / SQLSTATE Handling

Programs that ignore SQLCODE / SQLSTATE are flagged. Programs with a centralised post-EXEC paragraph (e.g. `9100-CHECK-SQL`) document its behaviour.

| Program ID | Convention | Codes Handled | Default Action |
|---|---|---|---|
| [PROGNAME] | Centralised post-EXEC check | 0 / +100 / -805 / -911 | ABEND U4038 on -805 / -911; rollback on others |

### 9.5 DBRMs

Each EXEC-SQL program produces a DBRM at precompile time. List the DBRM name and the package / collection it is bound into (cross-check with the JCL bind step where applicable).

| Program ID | DBRM | Package | Collection | Notes |
|---|---|---|---|---|
| [PROGNAME] | DBRM-NAME | PKG-NAME | COLLID | Bound nightly via job BINDPROD |
