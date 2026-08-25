---
slug: identification-and-environment
title: "Identification and Environment Divisions"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 120
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 2. Identification and Environment Divisions

For each program, document the IDENTIFICATION DIVISION and ENVIRONMENT DIVISION verbatim. Source-line citations are required.

### 2.1 IDENTIFICATION DIVISION (per program)

| Program ID | Author | Installation | Date Written | Source Lines |
|---|---|---|---|---|
| [PROGNAME] | [name] | [installation] | [date] | [path/to/file.cbl:N-M] |

### 2.2 ENVIRONMENT DIVISION

For each program: SOURCE-COMPUTER, OBJECT-COMPUTER, SPECIAL-NAMES, and FILE-CONTROL summary (the per-FD detail lives in the file-control-and-fd-bindings block).

```
PROGRAM-ID: [PROGNAME]
  SOURCE-COMPUTER: [machine]
  OBJECT-COMPUTER: [machine]
  SPECIAL-NAMES:
    [collating sequence, currency sign, decimal point, etc.]
  FILE-CONTROL:
    [SELECT clauses — summary; full ASSIGN / ORGANIZATION / ACCESS MODE in next block]
```

### 2.3 Compilation / Precompilation Pipeline

Where the program is processed by precompilers (DB2, CICS), record the order and the precompiler-emitted side artefacts (DBRMs, PPT entries, listings).

| Program ID | Precompilers in order | Side artefacts |
|---|---|---|
| [PROGNAME] | [e.g. DB2 → CICS → COBOL] | [DBRM name, listing path] |
