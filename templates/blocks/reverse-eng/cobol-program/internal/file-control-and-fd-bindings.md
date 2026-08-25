---
slug: file-control-and-fd-bindings
title: "File-Control and FD Bindings"
applies-to: [re-cobol-program-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
last_verified_against_commit: ""  # populated by the reverse-engineer-* skill at render time — full 40-char SHA of the source repo
---

## 3. File-Control and FD Bindings

For every program, document each `SELECT` ↔ `FD` ↔ DD-name (or DSN where literal) ↔ record-layout copybook chain.

### 3.1 FD Binding Table (per program)

| Program ID | SELECT (file-name) | ASSIGN (DD or DSN) | ORGANIZATION | ACCESS MODE | FD record | Copybook | Source Lines |
|---|---|---|---|---|---|---|---|
| [PROGNAME] | [CUST-FILE] | [CUSTDD] | SEQUENTIAL / INDEXED / RELATIVE | SEQUENTIAL / RANDOM / DYNAMIC | [01-name] | [CUSTREC] | [file:N-M] |

### 3.2 Notes on Special Cases

- **Symbolic ASSIGN** — `ASSIGN TO &SYSUID..XYZ` or similar: flag for resolution at the JCL invocation site (do NOT auto-resolve).
- **Multiple records per FD** — list each `01` record under the same FD.
- **VSAM** — capture KEY clauses (`RECORD KEY IS`, `ALTERNATE RECORD KEY IS`) and RRN behaviour.
- **Sort/merge files** — `SD` declarations are documented separately from `FD`.

### 3.3 Cross-Program File Sharing (informational)

When the same DD-name (or DSN) is documented across multiple programs, list it here. (The lineage skill produces the canonical cross-program graph.)

| Shared DD / DSN | Programs | Roles (input / output / update) |
|---|---|---|
| [CUSTDD] | [PROG1, PROG2] | [PROG1: input; PROG2: update] |
