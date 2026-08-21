---
slug: naming-conventions
title: "Naming Conventions"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 230
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 13. Naming Conventions

Document the shop-specific naming rules in force across these programs. Pulled from the program inventory + ENVIRONMENT DIVISION + observed paragraph names.

### 13.1 Program-ID Naming

| Pattern | Meaning | Examples |
|---|---|---|
| `xxxYYzz` | xxx=app prefix, YY=function, zz=variant | BILLPRC, BILLPST, BILLRPT |

### 13.2 Paragraph-Name Naming

| Pattern | Meaning | Examples |
|---|---|---|
| `NNNN-VERB-NOUN` | NNNN=section sequence, VERB-NOUN=action | 0000-MAINLINE, 1000-INIT, 2100-READ-CUST |
| `9NNN-VERB-NOUN` | error / cleanup paragraphs at end | 9100-CLOSE-FILES, 9999-EXIT |

### 13.3 Working-Storage Variable Naming

| Prefix | Meaning |
|---|---|
| `WS-` | working-storage local |
| `LK-` or `LS-` | linkage section |
| `IO-` | I/O area / record buffer |
| `WS-CICS-` | CICS-related (RESP, RESP2, EIBxxx aliases) |

### 13.4 Copybook Inclusion Naming

Programs may rename included copybooks via `COPY ... REPLACING` substitutions. Document the convention by which prefixes are substituted (e.g. `==:PFX:==` replaced by `CUST` to scope a generic record into a customer-specific use).

### 13.5 Deviations

Any program that violates the naming convention is flagged here.

| Program ID | Deviation | Reason |
|---|---|---|
| [PROGNAME] | Paragraphs use mnemonic names (no NNNN- prefix) | ported from a vendor product |
