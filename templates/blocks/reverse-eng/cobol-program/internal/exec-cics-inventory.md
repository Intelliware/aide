---
slug: exec-cics-inventory
title: "EXEC CICS Inventory"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 8. EXEC CICS Inventory

For programs running under CICS, document every embedded `EXEC CICS` block. Excluded if the program is pure batch (no CICS-runnable artefacts).

### 8.1 Per-Program EXEC CICS Table

One row per `EXEC CICS` block. Columns chosen to match the canonical lineage feed-file (`program-exec-inventory.md`).

| Program ID | Verb | Resource | Target / Name | Options | Host Variables | Source Lines |
|---|---|---|---|---|---|---|
| [PROGNAME] | READ | FILE | CUSTOMER-FILE | RIDFLD(WS-CUST-ID) UPDATE | WS-CUST-ID, CUST-RECORD | [file:N-M] |
| [PROGNAME] | WRITE | FILE | BILLING-FILE | FROM(BILL-RECORD) | BILL-RECORD | [file:N-M] |
| [PROGNAME] | LINK | PROGRAM | XYZ | COMMAREA(LK-COMMAREA) LENGTH(LK-LENGTH) | LK-COMMAREA, LK-LENGTH | [file:N-M] |
| [PROGNAME] | XCTL | PROGRAM | NXT | COMMAREA(LK-COMMAREA) | LK-COMMAREA | [file:N-M] |
| [PROGNAME] | RETURN | TRANSID | TXY1 | COMMAREA(LK-COMMAREA) | LK-COMMAREA | [file:N-M] |
| [PROGNAME] | SEND | MAP | MAP1 | MAPSET('MAPSET1') FROM(MAP1O) | MAP1O | [file:N-M] |
| [PROGNAME] | RECEIVE | MAP | MAP1 | INTO(MAP1I) | MAP1I | [file:N-M] |

### 8.2 RESP / RESP2 Handling

For each program, summarise `RESP` / `RESP2` checking convention. Programs that ignore RESP are flagged.

| Program ID | RESP Variable | RESP2 Variable | Convention | Notes |
|---|---|---|---|---|
| [PROGNAME] | WS-CICS-RESP | WS-CICS-RESP2 | Check after every EXEC CICS | Includes default `HANDLE CONDITION ERROR` paragraph |

### 8.3 BMS / 3270 Map Bindings

| Program ID | Mapset | Map | Send/Receive | Source Lines |
|---|---|---|---|---|
| [PROGNAME] | MAPSET1 | MAP1 | SEND, RECEIVE | [file:N-M] |

### 8.4 Channels and Containers (modern CICS)

| Program ID | Channel | Container | Operation | Source Lines |
|---|---|---|---|---|
| [PROGNAME] | BILLING-CHAN | CUST-RECORD-CONT | PUT, GET | [file:N-M] |
