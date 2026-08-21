---
slug: called-subprograms-and-side-effects
title: "Called Subprograms and Side Effects"
applies-to: [re-cobol-program-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 320
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 20. Called Subprograms and Side Effects

For each program, document everything observable to the outside world: subprograms it calls, files it reads/writes, DB2 tables it touches, IMS segments it touches, MQ queues it puts/gets, CICS resources it interacts with.

### 20.1 Called Subprograms (exit edges)

| Program ID | Subprogram | Form | Resolution | Effect on Caller |
|---|---|---|---|---|
| [PROGNAME] | BILLCALC  | static CALL | resolved to PROD.LOAD.LIB(BILLCALC) | LINKAGE: LK-CUST-RECORD, LK-CALC-AREA |
| [PROGNAME] | (dynamic) | CALL WS-NAME | candidates: BILLW01, BILLW02 | LINKAGE: depends on WS-NAME |
| [PROGNAME] | XYZ | CICS LINK | resolved via CICS PPT | COMMAREA: LSCOMM V2 |

### 20.2 File / Dataset Side Effects

| Program ID | DD or Resource | Direction | Mode | Record Copybook |
|---|---|---|---|---|
| [PROGNAME] | CUSTDD | read | sequential | CUSTREC |
| [PROGNAME] | BILLDD | write | sequential | BILLREC |
| [PROGNAME] | ERRDD  | write | sequential | ERRREC |

### 20.3 DB2 Side Effects

| Program ID | Table / View | Operation | Notes |
|---|---|---|---|
| [PROGNAME] | TAX_TABLE  | SELECT | read once per customer |
| [PROGNAME] | BILLING    | INSERT | one row per billed customer |
| [PROGNAME] | CUSTOMER   | UPDATE | sets STATUS='B' on success |

### 20.4 IMS Side Effects

| Program ID | Segment | PCB | Operation |
|---|---|---|---|
| [PROGNAME] | CUSTSEG | CUST-PCB | GU, GN |
| [PROGNAME] | BILLSEG | BILL-PCB | ISRT |

### 20.5 MQ / TS / TD Queue Side Effects

| Program ID | Resource Kind | Name | Operation |
|---|---|---|---|
| [PROGNAME] | MQ queue       | BILLING.NOTIFY | MQPUT |
| [PROGNAME] | CICS TS queue  | BILLTSQ        | WRITEQ TS |
| [PROGNAME] | CICS TD queue  | BILLTDQ        | WRITEQ TD |

### 20.6 Idempotency

Document whether re-running the program with the same input produces the same output (idempotent) or whether running twice double-posts (non-idempotent). Critical for restart logic.

| Program ID | Idempotent? | Reason |
|---|---|---|
| [PROGNAME] | no | INSERT into BILLING duplicates rows on re-run |
| [PROGNAME] | yes | UPDATE … WHERE STATUS='P' — second run finds no rows |
