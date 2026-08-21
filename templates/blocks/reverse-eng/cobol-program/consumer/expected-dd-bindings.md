---
slug: expected-dd-bindings
title: "Expected DD Bindings"
applies-to: [re-cobol-program-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 300
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 18. Expected DD Bindings

For each batch program, document the DD names the program opens, the role each plays, the example DSN/DISP convention used at this shop, and the consumer expectation if the DD is missing.

### 18.1 DD Inventory (per program)

| Program ID | DD Name | Role | Example DSN | Example DISP | Behaviour if Missing |
|---|---|---|---|---|---|
| [PROGNAME] | CUSTDD | input | PROD.CUSTOMER.MASTER | DISP=SHR | step abend (open fail) |
| [PROGNAME] | BILLDD | output | PROD.BILLING.OUTPUT(+1) | (NEW,CATLG,DELETE) | step abend (open fail) |
| [PROGNAME] | ERRDD | error log | PROD.BILLING.ERR(+1) | (NEW,CATLG,DELETE) | OK to use SYSOUT=* in dev; required CATLG in prod |
| [PROGNAME] | STEPLIB | program load | site load library | DISP=SHR | step abend (program not found) |
| [PROGNAME] | SYSOUT | print | SYSOUT=* | n/a | none — defaults to job sysout |

### 18.2 GDG and Generation Conventions

For programs that read or write GDG datasets, document the generation expectation.

| Program ID | DD Name | Generation | Notes |
|---|---|---|---|
| [PROGNAME] | BILLDD | (+1) | new generation each run |
| [PROGNAME] | INDD  | (0) | current generation; supplied by predecessor job |
| [PROGNAME] | PRIORDD | (-1) | previous generation; for restart-from-checkpoint |

### 18.3 Symbolic-Substitution DSNs

When a program's DD uses `&SYSUID` or other symbolic DSN parts (rare in batch but common in PROCs), document the expansion convention in use at this shop.

### 18.4 STEPLIB and Load-Library Expectations

Programs that `CALL` other modules require those modules in STEPLIB. List minimum STEPLIB content per program.

| Program ID | Minimum STEPLIB DSN(s) | Reason |
|---|---|---|
| [PROGNAME] | PROD.LOAD.LIB | contains PROGNAME and called subprograms |
| [PROGNAME] | PROD.LOAD.LIB, DB2.RUNLIB | DB2 run-time bindings |
