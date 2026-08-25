---
slug: copy-statements-and-replacing-rules
title: "COPY Statements and REPLACING Rules"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 5. COPY Statements and REPLACING Rules

For every program, list every `COPY` statement and the resulting in-use record after `REPLACING` substitutions.

### 5.1 COPY Inventory (per program)

| Program ID | Section | Copybook | REPLACING? | In-use Record (post-substitution) | Source Lines |
|---|---|---|---|---|---|
| [PROGNAME] | FILE / WORKING-STORAGE / LINKAGE / LOCAL-STORAGE / PROCEDURE | [CUSTREC] | yes / no | [resolved record name] | [file:N-M] |

### 5.2 REPLACING Substitutions

When a `COPY ... REPLACING` is used, document each `==pattern==` and `==replacement==` pair. Cite the canonical record from the copybook library Part A.

```
COPY [COPYBOOK-NAME] REPLACING
  ==:PFX:== BY ==CUST==
  ==:NUM:== BY ==9(10)==.
```

| Pattern (==…==) | Replacement (==…==) | Notes |
|---|---|---|
| `:PFX:` | `CUST` | Prefix substitution for record name |
| `:NUM:` | `9(10)` | Type substitution for ID |

### 5.3 Cross-Program Copybook Use

Group copybooks by their consuming programs. The lineage skill produces the canonical cross-program graph; this section is the per-repo summary.

| Copybook | Programs | Variants in use (if REDEFINES) |
|---|---|---|
| [CUSTREC] | [PROG1, PROG2, PROG3] | [BILLAREA-V1 in PROG1; V2 in PROG2/3] |

### 5.4 Unresolved or Unknown Copybooks

Where a `COPY` cannot be resolved against the matched copybook-library Part A, flag it here. NEVER guess at the contents of an unresolved copybook.

| Program ID | COPY statement | Reason | Action |
|---|---|---|---|
| [PROGNAME] | `COPY UNKNOWN.` | not in matched library | open ticket; do not infer contents |
