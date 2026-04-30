---
slug: 04-build-move-chain
sequence: 4
depends-on-prior: true
---

# Step 4: Build the MOVE Chain

Produce `<KB>/lineage/mainframe/04-move-chain.md` and `04-move-chain.json` — the field-to-field data-flow graph for every `MOVE`, `MOVE CORRESPONDING`, `COMPUTE`, `CALL ... USING`, `EXEC SQL ... INTO`, `EXEC SQL ... VALUES`, `EXEC DLI ... INTO`, and `EXEC CICS ... COMMAREA` statement.

## Why

The MOVE chain answers "where does this value come from" and "where does this value go." It is the field-level analogue of a program call graph. Used by audit / compliance reviewers, refactoring teams, and anyone tracing a field through a multi-program data pipeline.

## Inputs

- `program-data-bindings.json` (per cobol-program repo) — copybook bindings and MOVE/COMPUTE references at field level
- `program-exec-inventory.md` (per cobol-program repo) — EXEC blocks with host-variable references
- `program-call-graph.mmd` (per cobol-program repo) — CALL edges (so a CALL_USING can be expanded into a LINKAGE-side field on the callee)
- The field universe from step 3
- The copybook universe from step 2

## Process

### 1. Walk every per-program MOVE / COMPUTE record

For each program, the contributing RE pass recorded `MOVE` / `MOVE CORRESPONDING` / `COMPUTE` references at field granularity (this is a contract of `program-data-bindings.json` — see `reverse-engineer-cobol-program/references/INPUTS-OUTPUTS.md`). Emit one edge per reference:

```
{ "id": "MV-001",
  "src": {"program": "BILLPROC", "section": "2100-CALC",
          "field": "CUST-RECORD.CUST-AMOUNT", "copybook": "CUSTREC"},
  "verb": "MOVE",
  "dst": {"program": "BILLPROC", "section": "2100-CALC",
          "field": "WS-AMOUNT", "copybook": null},
  "source_lines": "BILLPROC.cbl:142-142" }
```

### 2. Expand CALL ... USING into cross-program edges

For each static `CALL` in `program-call-graph.mmd`, look up the callee's LINKAGE 01-levels (from the callee's `program-data-bindings.json`'s LINKAGE bindings). Emit a `CALL_USING` edge per parameter position:

```
{ "id": "MV-002",
  "src": {"program": "BILLPROC", "section": "2200-CALL",
          "field": "WS-AMOUNT", "copybook": null},
  "verb": "CALL_USING",
  "dst": {"program": "BILLCALC", "section": "LINKAGE",
          "field": "LK-AMOUNT", "copybook": null},
  "source_lines": "BILLPROC.cbl:158-160" }
```

Dynamic CALLs do NOT produce edges. They are flagged in step 7.

### 3. Expand EXEC SQL into bind-side edges

For each `EXEC SQL ... INTO :host-var-1, :host-var-2` block (from `program-exec-inventory.md`):

- Emit a `EXEC_SQL_INTO` edge per host variable: source = the SELECT'd table column; dst = the host variable's working-storage / linkage field

For each `EXEC SQL ... VALUES (:host-var-1, ...)` (INSERT) block:

- Emit a `EXEC_SQL_VALUES` edge per host variable in the reverse direction

DB2 column names come from the `program-exec-inventory.md`'s recorded statement; if the column name is opaque (`SELECT *`), flag in step 7.

### 4. Expand EXEC DLI INTO into segment-bind edges

For each `EXEC DLI ... INTO(io-area)` block:

- Emit an `EXEC_DLI_INTO` edge from the IMS segment field to the program's io-area field. The io-area is a copybook (IMS-*); fields of the segment correspond to fields of the io-area.

### 5. Expand EXEC CICS COMMAREA into LINK chains

For each `EXEC CICS LINK PROGRAM('XYZ') COMMAREA(LK-COMMAREA)`:

- Emit an `EXEC_CICS_COMMAREA` edge from the caller's COMMAREA copybook fields to the callee's LINKAGE 01-level fields (the callee's `LINKAGE 01 DFHCOMMAREA` or a renamed equivalent)

### 6. Render JSON and Markdown

`04-move-chain.json` is the canonical machine-readable artefact (validates against the schema in INPUTS-OUTPUTS.md).
`04-move-chain.md` renders the human-readable view, organised by source field. Each entry lists outbound and inbound edges for that field.

### 7. Flag suspicious edges

Surface in step 7 if encountered:

- `MOVE` between fields with mismatched PIC / USAGE (e.g. DISPLAY → COMP-3 implicit conversion)
- `MOVE CORRESPONDING` across groups whose fields have mismatched names or types
- `EXEC_SQL_INTO` whose DB2 column type does not match the host-var PIC
- `CALL_USING` where caller's parameter count or order does not match callee's PROCEDURE DIVISION USING

## Output

`<KB>/lineage/mainframe/04-move-chain.md` and `04-move-chain.json` populated.

## Halt conditions

- `04-move-chain.json` fails schema validation
- A field referenced by an edge does not exist in the field universe — flag in step 7

## Common mistakes

- Producing edges for dynamic CALLs without source evidence — leave dynamic CALLs unresolved; flag in step 7
- Producing edges for symbolic CICS PROGRAM names (`EXEC CICS LINK PROGRAM(WS-NAME)`) — same as dynamic CALL; flag
- Treating `MOVE CORRESPONDING` as a single edge — it is one edge per matched field name; expand
