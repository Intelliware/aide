---
slug: performance-and-runtime-considerations
title: "Performance and Runtime Considerations"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 220
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 12. Performance and Runtime Considerations

Document characteristics affecting program performance at runtime.

### 12.1 Working-Storage Footprint

| Program ID | Approx WS bytes | Approx LS bytes | Notes |
|---|---|---|---|
| [PROGNAME] | [N] | [N] | [includes copy CUSTREC at 200 bytes; OCCURS 0 TO 999 in BILLDETLS] |

### 12.2 Variable-Length Tables

OCCURS DEPENDING ON dramatically affects working-storage size at runtime. Document each.

| Program ID | Group | Controlling Field | Min | Max | Source Lines |
|---|---|---|---|---|---|
| [PROGNAME] | BILL-LINES | BILL-LINE-COUNT | 0 | 999 | [file:N-M] |

### 12.3 Inner-Loop Database Calls

Every `EXEC SQL` inside a `PERFORM ... UNTIL` is a candidate for cursor / batch / pre-fetch optimisation.

| Program ID | Loop Paragraph | EXEC SQL Inside | Estimated Calls per Run |
|---|---|---|---|
| [PROGNAME] | 2000-PROCESS | SELECT TAX_RATE FROM TAX_TABLE | 1 per customer (~100K) |

### 12.4 File I/O Patterns

- **Sequential vs. random access** — note ACCESS MODE per FD
- **VSAM key density** — programs that traverse a sparse alternate key
- **Sort/merge** — internal SORT (`SORT file-name`) vs. external SORT step in JCL
- **Read-ahead** — explicit READ NEXT vs. block fetch

### 12.5 CICS Pseudo-Conversational vs. Conversational

For CICS programs, note whether the program is pseudo-conversational (RETURN with COMMAREA between user interactions) or conversational (long-running task). Conversational programs are flagged because they hold task control blocks for the duration of a user session.

### 12.6 Restart and Checkpoint

For long-running batch / BMP programs, document the checkpoint frequency, the restart record, and the restart-from-checkpoint protocol.

| Program ID | Checkpoint Mechanism | Frequency | Restart Path |
|---|---|---|---|
| [PROGNAME] | EXEC DLI CHKP / IMS Restart | every 10K records | 9000-RESTART reads ROLLBACK record |
