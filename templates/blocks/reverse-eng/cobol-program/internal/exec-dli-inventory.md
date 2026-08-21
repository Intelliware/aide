---
slug: exec-dli-inventory
title: "EXEC DLI Inventory"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 200
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 10. EXEC DLI Inventory

For programs running under IMS (MPP, BMP) or using IMS DB / DC services, document every embedded `EXEC DLI` block (or the equivalent `CALL 'CBLTDLI'` form). Excluded if no IMS interactions are found in source.

### 10.1 PSB / PCB List (per program)

The LINKAGE SECTION of an IMS program declares a PCB list. Document it from the entry-point `ENTRY 'DLITCBL' USING ...` clause or the modern `EXEC DLI` form.

| Program ID | PCB Index | PCB Name | Type | Sensitivity (Segments) | Processing Options | Source Lines |
|---|---|---|---|---|---|---|
| [PROGNAME] | 1 | CUST-PCB | DB | CUSTSEG, ADDRSEG | GO / GP / GU / IS | [file:N-M] |
| [PROGNAME] | 2 | IO-PCB   | TP | n/a | input/output | [file:N-M] |

### 10.2 EXEC DLI / CBLTDLI Calls

| Program ID | Verb | PCB | Segment Search Argument | Host Variables | Source Lines |
|---|---|---|---|---|---|
| [PROGNAME] | GU  | CUST-PCB | SEGMENT(CUSTSEG) WHERE(CUST-ID = :WS-CUST-ID) | WS-CUST-ID, CUST-IO-AREA | [file:N-M] |
| [PROGNAME] | GN  | CUST-PCB | SEGMENT(ADDRSEG) | ADDR-IO-AREA | [file:N-M] |
| [PROGNAME] | REPL | CUST-PCB | n/a | CUST-IO-AREA | [file:N-M] |
| [PROGNAME] | ISRT | CUST-PCB | SEGMENT(CUSTSEG) | CUST-IO-AREA | [file:N-M] |
| [PROGNAME] | DLET | CUST-PCB | n/a | CUST-IO-AREA | [file:N-M] |
| [PROGNAME] | CHKP | (system) | n/a | WS-CHKP-ID | [file:N-M] |

### 10.3 Status Code Handling

For each program, document how PCB status codes are checked after every DLI call.

| Program ID | Convention | Codes Handled | Default Action |
|---|---|---|---|
| [PROGNAME] | Centralised post-call check 9100-CHECK-DLI | spaces / GE / GA / GB / GK | ABEND on unhandled; loop terminator on GE |

### 10.4 IO-AREA / Segment Bindings

Each segment IO area is a copybook. Cross-check with the copy-statements-and-replacing-rules block.

| Program ID | Segment | IO-AREA Copybook | Source Lines |
|---|---|---|---|
| [PROGNAME] | CUSTSEG | IMS-CUSTSEG | [file:N-M] |
| [PROGNAME] | ADDRSEG | IMS-ADDRSEG | [file:N-M] |

### 10.5 BMP-Specific Considerations

For batch message-processing programs (BMP):
- Checkpoint frequency (`CHKP`) and restart logic
- IMS-DB only vs. IMS-DB + IMS-DC
- Tolerance for application-major status codes
