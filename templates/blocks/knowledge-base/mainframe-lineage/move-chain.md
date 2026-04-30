---
slug: move-chain
title: "MOVE Chain"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 140
---

## 4. MOVE Chain

The field-to-field data-flow graph. Edges are emitted for every `MOVE`, `MOVE CORRESPONDING`, `COMPUTE`, `CALL ... USING`, `EXEC SQL ... INTO`, `EXEC SQL ... VALUES`, `EXEC DLI ... INTO`, and `EXEC CICS ... COMMAREA` reference.

### 4.1 Edge Forms

| Verb | Source | Destination | Notes |
|---|---|---|---|
| MOVE | source field | receiving field | within one program |
| MOVE_CORRESPONDING | source group | receiving group | one logical edge per matched field name (expanded) |
| COMPUTE | RHS fields (multiple) | LHS field | RHS appears as multiple edges |
| CALL_USING | caller field | callee LINKAGE 01-level | static CALLs only; dynamic flagged |
| EXEC_SQL_INTO | DB2 column | host-var working-storage / linkage field | per host-var |
| EXEC_SQL_VALUES | host-var | DB2 column | INSERT path |
| EXEC_DLI_INTO | IMS segment field | program io-area field | per host-var |
| EXEC_CICS_COMMAREA | caller COMMAREA field | callee LINKAGE field | one edge per matched field name |

### 4.2 Edge Listing Format

For each edge in `04-move-chain.json`, render in the markdown:

```
### MV-001 [verb=MOVE]
- Source: [PROGRAM].[SECTION].[field]   (copybook=[COPYBOOK])
- Dest:   [PROGRAM].[SECTION].[field]   (copybook=[COPYBOOK or null])
- Source lines: [PROGRAM.cbl:N-M]
```

Edges are sorted by edge ID (`MV-NNN`).

### 4.3 By Source Field

A secondary view organises edges by source field. For each canonical field with outbound edges, list every destination:

```
### [COPYBOOK].[RECORD].[FIELD]
Outbound edges:
  - [verb] → [PROGRAM].[SECTION].[field]   (MV-NNN, [source-lines])
  - ...
Inbound edges:
  - [verb] ← [PROGRAM].[SECTION].[field]   (MV-NNN, [source-lines])
  - ...
```

### 4.4 Suspicious Edges

Edges flagged by step 4 § 7 (mismatched PIC / USAGE, MOVE CORRESPONDING type drift, CALL_USING parameter mismatches, etc.) are surfaced in `09-unbound-and-flagged-items.md` § 10.

### 4.5 Companion Machine-Readable Artefact

`04-move-chain.json` is the canonical machine-readable form. Downstream consumers (audit / compliance tools, refactoring tools) should read the JSON; the markdown is for human navigation.

The JSON schema is documented in the parent skill's INPUTS-OUTPUTS reference.

### 4.6 What This Section Does NOT Include

- Run-time data: this is static lineage. Whether `MV-001` is actually executed at run time depends on PERFORM / IF / EVALUATE control flow.
- Probabilistic flow: edges are present-or-absent; there is no notion of "edge taken N% of the time."
- Dynamic CALLs: their target programs are flagged in `09-unbound-and-flagged-items.md`; they do not produce edges.
