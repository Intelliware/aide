---
slug: error-and-abend-contract
title: "Error and Abend Contract"
applies-to: [re-cobol-program-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 330
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 21. Error and Abend Contract

For consumers, document the error/abend behaviours they must handle. This is the consumer-facing slice of the program's internal error handling.

### 21.1 Return Codes

| Program ID | RETURN-CODE | Meaning | Consumer Action |
|---|---|---|---|
| [PROGNAME] | 0 | success | continue |
| [PROGNAME] | 4 | warnings logged in ERRDD | continue (with `COND=(0,LT)` downstream) |
| [PROGNAME] | 8 | errors; output partial | halt downstream |
| [PROGNAME] | 12+ | catastrophic | halt downstream + page ops |

### 21.2 Abend Codes

| Program ID | Abend | Trigger | Consumer Action |
|---|---|---|---|
| [PROGNAME] | U4038 | DBRM not bound (SQLCODE -805) | rebind DBRM; restart from STEPxxx |
| [PROGNAME] | U4040 | unrecoverable file error | check file status; restart from STEPxxx |
| [PROGNAME] | S0C4 | storage protection | open ticket; do not retry until fix deployed |
| [PROGNAME] | S0C7 | data exception (bad numeric) | bad input data; correct and re-run |

### 21.3 CICS RESP Contract (per program, for CICS callees)

| Program ID | Returned Field | Values | Consumer Meaning |
|---|---|---|---|
| [PROGNAME] | BA-RESULT  | 'OK' / 'NF' / 'ER' | OK = success; NF = not found; ER = error (see BA-MESSAGE) |

### 21.4 IMS Status Contract (for IMS-MPP/BMP callees)

| Program ID | PCB Status | Consumer Meaning |
|---|---|---|
| [PROGNAME] | spaces | success |
| [PROGNAME] | GE | segment not found |
| [PROGNAME] | other | abend; restart-from-checkpoint |

### 21.5 Restart Contract

For long-running batch programs with checkpoint logic, document how a consumer restarts after a failure.

| Program ID | Restart Mechanism | Restart Step | Notes |
|---|---|---|---|
| [PROGNAME] | restart-from-checkpoint | STEPxxx with PARM='RESTART' | reads ROLLBACK record from PRIORDD |
