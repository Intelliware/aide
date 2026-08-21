---
slug: copy-with-replacing-patterns
title: "COPY With REPLACING Patterns"
applies-to: [re-copybook-library-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 330
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 17. COPY With REPLACING Patterns

Common `COPY ... REPLACING` patterns used by consumers of this library. These show the intended ways to specialize generic copybooks for a specific use site.

### 17.1 Prefix Substitution

Substitute a generic record prefix with a specific one:

```cobol
       WORKING-STORAGE SECTION.
       01  CUSTOMER-RECORD COPY :PFX:REC REPLACING
              ==:PFX:== BY ==CUST==.
```

| Generic Pattern | Substitution | Resulting Record |
|---|---|---|
| `:PFX:REC` | `==:PFX:== BY ==CUST==` | CUST-RECORD with `CUST-`-prefixed fields |
| `:PFX:REC` | `==:PFX:== BY ==BILL==` | BILL-RECORD with `BILL-`-prefixed fields |

### 17.2 Type Substitution

Substitute a generic PIC clause with a domain-specific one:

```cobol
       01  GENERIC-ID COPY :IDREC: REPLACING
              ==:NUM:== BY ==9(10)==.
```

### 17.3 Multi-Pattern REPLACING

Multiple substitutions can be combined in a single COPY:

```cobol
       COPY GENREC REPLACING
              ==:PFX:== BY ==CUST==
              ==:NUM:== BY ==9(10)==
              ==:NAME:== BY ==X(40)==.
```

### 17.4 Common Substitution Conventions

| Pattern Token | Typical Substitution |
|---|---|
| `:PFX:` | record/field prefix (e.g. CUST, BILL) |
| `:NUM:` | numeric PIC clause (9(10), S9(9)V99 COMP-3, etc.) |
| `:NAME:` | character PIC clause (X(40), X(80)) |
| `:DATE:` | date PIC clause (9(8) for YYYYMMDD) |

### 17.5 Anti-Patterns to Avoid

- **Substituting actual COBOL keywords** — e.g. replacing `==DISPLAY==` with `==COMP-3==`. Compiles unpredictably across COBOL dialects.
- **Substituting field names that contain other substitution tokens** — recursive substitution is non-portable.
- **REPLACING a level number** — illegal; flag as drift.

### 17.6 Verification

After every `COPY ... REPLACING`, the lineage skill's `field-where-used.md` must show the post-substitution field name. If a substitution doesn't appear in the index, suspect a REPLACING pattern that didn't match.
