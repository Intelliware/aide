---
slug: commarea-and-linkage-contract
title: "COMMAREA and Linkage Contract"
applies-to: [re-cobol-program-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 19. COMMAREA and Linkage Contract

For programs callable from another program (CICS LINK / XCTL, batch CALL, IMS PSB), document the LINKAGE shape from the caller's perspective.

### 19.1 LINKAGE Contract (per program)

| Program ID | Caller Form | LINKAGE 01-Level | Canonical Record | Byte Length | Required at Entry | Returned to Caller |
|---|---|---|---|---|---|---|
| [PROGNAME] | CICS LINK | LK-COMMAREA | LSCOMM (variant V2) | 200 | BA-VERSION='2', BA-CUST-ID populated | BA-RESULT, BA-MESSAGE |
| [PROGNAME] | batch CALL | LK-INPUT, LK-OUTPUT, LK-STATUS | LSINPT, LSOUT, LSSTAT | 100 / 200 / 4 | LK-INPUT populated | LK-OUTPUT, LK-STATUS |

### 19.2 Variant Selection (CICS COMMAREA with REDEFINES)

When the COMMAREA has REDEFINES variants, document the selector field and its valid values (cross-reference the canonical record graph in the matched copybook library).

| Program ID | Selector Field | Valid Values | Variant Behaviour |
|---|---|---|---|
| [PROGNAME] | BA-VERSION | '1' / '2' | V1 = legacy; V2 = current |

### 19.3 Channels and Containers (modern CICS)

Programs using CICS channels and containers replace COMMAREA with a per-container layout. Document each container the callee expects.

| Program ID | Channel | Container Name | Direction | Layout Copybook |
|---|---|---|---|---|
| [PROGNAME] | BILLING-CHAN | CUST-RECORD-CONT | input  | CUSTREC |
| [PROGNAME] | BILLING-CHAN | RESULT-CONT      | output | RESULTREC |

### 19.4 IMS PCB List Contract

For IMS-MPP/BMP programs, the LINKAGE PCB list IS the contract. Document each PCB by index, type (DB / TP), and segment sensitivity.

| Program ID | PCB Index | Type | Sensitive Segments | Processing Options |
|---|---|---|---|---|
| [PROGNAME] | 1 | DB | CUSTSEG, ADDRSEG | GO / GP / GU / IS |
| [PROGNAME] | 2 | TP | n/a | input/output |

### 19.5 Pseudo-Conversational State

For CICS pseudo-conversational programs, document what the callee expects in COMMAREA at "first pass" (`EIBCALEN = 0`) vs. "continuation" (`EIBCALEN > 0`). Consumers re-enter the program via TRANSID with the COMMAREA returned from the previous RETURN.
