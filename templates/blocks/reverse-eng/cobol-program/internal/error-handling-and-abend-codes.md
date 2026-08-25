---
slug: error-handling-and-abend-codes
title: "Error Handling and Abend Codes"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 210
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 11. Error Handling and Abend Codes

For each program, document every error path: file-status checks, SQLCODE / SQLSTATE checks, IMS PCB status codes, CICS RESP / RESP2, explicit `ABEND` / `STOP RUN` / `GOBACK` with non-zero return code.

### 11.1 File-Status Checks (per program)

| Program ID | FILE | After (operation) | FILE STATUS Variable | Codes Handled | Action |
|---|---|---|---|---|---|
| [PROGNAME] | CUST-FILE | OPEN / READ / CLOSE | WS-CUST-STATUS | 00 / 10 / 35 / 39 / 4x / 9x | log + continue / log + abend / retry |

### 11.2 SQLCODE / SQLSTATE Routing

| Program ID | Codes | Handler Paragraph | Action |
|---|---|---|---|
| [PROGNAME] | 0 (success)  | inline | continue |
| [PROGNAME] | +100 (no row) | 9100-CHECK-SQL | branch to alternate path |
| [PROGNAME] | -805 (DBRM)  | 9100-CHECK-SQL | ABEND U4038 |
| [PROGNAME] | -911 (deadlock) | 9100-CHECK-SQL | ROLLBACK + restart-from-checkpoint |

### 11.3 IMS PCB Status Routing

| Program ID | Codes | Handler | Action |
|---|---|---|---|
| [PROGNAME] | spaces (success) | inline | continue |
| [PROGNAME] | GE (segment not found) | 9100-CHECK-DLI | branch to alternate path |
| [PROGNAME] | GG (status word) | 9100-CHECK-DLI | log + continue |

### 11.4 CICS RESP / RESP2 Routing

| Program ID | Verb | Codes Handled | Action |
|---|---|---|---|
| [PROGNAME] | READ | NORMAL / NOTFND / DUPREC / DISABLED | branch / abend per matrix |

### 11.5 Explicit Abend Codes

| Program ID | Abend Code | Trigger | Source Lines |
|---|---|---|---|
| [PROGNAME] | U4038 | SQLCODE -805 from BIND drift | [file:N-M] |
| [PROGNAME] | U4040 | unrecoverable file error | [file:N-M] |

### 11.6 Return Codes (batch programs)

For batch programs that GOBACK / STOP RUN with a non-zero `RETURN-CODE`, document the convention.

| Program ID | RETURN-CODE Value | Meaning | JCL Reaction |
|---|---|---|---|
| [PROGNAME] | 0 | success | continue |
| [PROGNAME] | 4 | warnings logged | continue (COND=(0,LT) downstream) |
| [PROGNAME] | 8 | errors logged, partial output | halt downstream |
| [PROGNAME] | 12+ | catastrophic | halt downstream + page ops |

### 11.7 DECLARATIVES and ON SIZE ERROR

If used, document the targeted exception conditions and side effects (e.g., setting WS-FATAL flag, writing to ERRDD).
