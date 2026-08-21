---
slug: call-and-perform-graph
title: "CALL and PERFORM Graph"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 7. CALL and PERFORM Graph

For each program, document control-transfer relations: intra-program (`PERFORM`) and inter-program (`CALL`/`LINK`/`XCTL`/`GOBACK`/`STOP RUN`/`RETURN`).

### 7.1 PERFORM Graph (intra-program, per program)

| Program ID | Calling Paragraph | Target | Form | Source Lines |
|---|---|---|---|---|
| [PROGNAME] | 0000-MAINLINE | 1000-INIT | PERFORM | [file:N-M] |
| [PROGNAME] | 0000-MAINLINE | 2000-PROCESS UNTIL EOF-CUST | PERFORM UNTIL | [file:N-M] |
| [PROGNAME] | 0000-MAINLINE | 1000-INIT THRU 1200-INIT-COUNTERS | PERFORM THRU | [file:N-M] |

### 7.2 CALL Graph (inter-program)

| Program ID | Site Paragraph | Call Form | Target | Resolution | Source Lines |
|---|---|---|---|---|---|
| [PROGNAME] | 2200-CALC-BILL | CALL 'BILLCALC' USING ... | BILLCALC | static | [file:N-M] |
| [PROGNAME] | 2300-WRITE-BILL | CALL WS-NAME USING ... | (dynamic) | candidates: BILLW01, BILLW02 | [file:N-M] |

### 7.3 CICS Control Transfer

| Program ID | Site Paragraph | EXEC CICS Statement | Target | Notes |
|---|---|---|---|---|
| [PROGNAME] | 3000-DISPATCH | EXEC CICS LINK PROGRAM('XYZ') COMMAREA(LK-COMMAREA) | XYZ | LINK returns; COMMAREA shape per linkage block |
| [PROGNAME] | 4000-FINALIZE | EXEC CICS XCTL PROGRAM('NXT') | NXT | XCTL does not return |
| [PROGNAME] | 9999-EXIT     | EXEC CICS RETURN | — | end of CICS task |

### 7.4 IMS DLI Control Transfer (where applicable)

| Program ID | Site | EXEC DLI Statement | PCB | Notes |
|---|---|---|---|---|
| [PROGNAME] | ... | EXEC DLI GU SEGMENT(CUSTSEG) | PCB-1 | reads CUSTSEG |

### 7.5 Mermaid Call Graph

The full graph is rendered separately into the Part-A side artefact `program-call-graph.mmd`. This section optionally embeds a per-program subgraph for documentation completeness; the canonical artefact is `program-call-graph.mmd`.
