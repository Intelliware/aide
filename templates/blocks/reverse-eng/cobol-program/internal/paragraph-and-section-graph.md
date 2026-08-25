---
slug: paragraph-and-section-graph
title: "Paragraph and Section Graph"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 160
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 6. Paragraph and Section Graph

For every program, document the PROCEDURE DIVISION as a structured map of sections and paragraphs. PERFORM and CALL relations live in the call-and-perform-graph block.

### 6.1 Section / Paragraph Tree (per program)

```
[PROGNAME]
  0000-MAINLINE
  1000-INIT
    1100-OPEN-FILES
    1200-INIT-COUNTERS
  2000-PROCESS                    SECTION
    2100-READ-CUST
    2200-CALC-BILL
    2300-WRITE-BILL
  9000-TERMINATE
    9100-CLOSE-FILES
    9200-COMMIT
```

| Program ID | Element | Kind | Source Lines | Notes |
|---|---|---|---|---|
| [PROGNAME] | 0000-MAINLINE | paragraph | [file:N-M] | program entry point |
| [PROGNAME] | 2000-PROCESS  | section   | [file:N-M] | exited via fall-through |

### 6.2 DECLARATIVES

If the program has a DECLARATIVES section, document each USE statement and the targeted exception condition.

| Program ID | DECLARATIVE Section | USE Clause | Triggered By |
|---|---|---|---|
| [PROGNAME] | DECL-FILE-ERR       | USE AFTER STANDARD ERROR PROCEDURE ON FD-NAME | I/O failure on FD-NAME |

### 6.3 Naming-Convention Notes

Most shops prefix paragraphs with a 4-digit number indicating sequence (`0000`, `1000`, …) plus a verb. Note any deviations in the program inventory.
