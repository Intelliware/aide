---
slug: 03-build-field-where-used
sequence: 3
depends-on-prior: true
---

# Step 3: Build field-where-used

Produce `<KB>/lineage/mainframe/03-field-where-used.md` — for every canonical field in every copybook, list every program section that reads, writes, or MOVEs the field.

## Why

This is the field-level cross-reference. The MOVE chain in step 4 builds on it. Operations like "find every place CUST-AMOUNT is touched" depend on this index.

## Inputs

- The copybook universe from step 2
- `program-data-bindings.json` (per cobol-program repo) — provides the per-program copybook usage with `key_fields`
- `program-exec-inventory.md` (per cobol-program repo) — provides the EXEC-block field references (host vars, COMMAREA fields)
- (Implicit) the COBOL source — only consulted via the PROC-DIVISION citations recorded in `program-data-bindings.json`'s `key_fields` entries

## Process

### 1. Enumerate canonical fields

For each copybook variant in `copybook-record-graph.json`, walk its field tree. Produce a flat list of canonical field names with full path notation:

```
CUSTREC.CUST-RECORD.CUST-ID                    (level 05, PIC 9(10))
CUSTREC.CUST-RECORD.CUST-STATUS                (level 05, PIC X)
CUSTREC.CUST-RECORD.CUST-ADDRESS.CUST-LINE1    (level 10, PIC X(35))
BILLDETLS.BILL-DETAILS.BILL-LINES[i].BL-PRODUCT (indexed; i in 0..BILL-LINE-COUNT-1)
```

Group items (records that contain other records) appear as their own entries — programs that MOVE the whole group reference the group name.

### 2. Match fields to program citations

For each program in `program-data-bindings.json`:

- The `bindings.key_fields` list names the fields the program touches per copybook section
- For each field in `key_fields`, add the program / section to the field's "where-used" list

For each program in `program-exec-inventory.md`:

- EXEC SQL host variables → the host-variable name (`:WS-CUST-ID`) maps to a working-storage field; if that working-storage field corresponds to a copybook field (via COPY), record the chain
- EXEC CICS COMMAREA references → likewise
- EXEC DLI INTO areas → likewise

### 3. Render the markdown

Render `03-field-where-used.md` as one entry per canonical field:

```
### CUSTREC.CUST-RECORD.CUST-AMOUNT  (level 05, PIC S9(9)V99 COMP-3)
- Read by:
  - BILLPROC.2100-CALC      (BILLPROC.cbl:142 — MOVE source)
  - BILLREPT.2200-PRINT     (BILLREPT.cbl:87 — DISPLAY)
- Written by:
  - BILLPOST.2300-UPDATE    (BILLPOST.cbl:198 — MOVE target)
- Drift warning:
  - Also exists in CUSTREC.LEGACY as 9(11)V99 DISPLAY (drift; see copybook-conflicts.md)
  - Programs still using LEGACY: BILLEXTR-OLD (deprecated)
```

### 4. Handle unused fields

A canonical field with no program citations is rendered with an explicit "no consumers found" note. Common for FILLERs and for fields in deprecated copybooks. Surfaced in `09-unbound-and-flagged-items.md` for architect review (not a hard failure).

### 5. Handle indexed fields

For fields inside `OCCURS DEPENDING ON` groups, render once per canonical position notation (`BILL-LINES[i].BL-PRODUCT`), not once per integer position. Programs that PERFORM-VARYING over the table are recorded as touching the indexed pattern.

## Output

`<KB>/lineage/mainframe/03-field-where-used.md` populated.

## Halt conditions

- A `key_fields` entry references a field not in the copybook's record graph — flag in step 7 (likely a scaffolding error in the contributing cobol-program RE; do not invent a position for it)

## Common mistakes

- Conflating fields with the same name across different copybooks — `CUST-AMOUNT` in CUSTREC is a different canonical field from `CUST-AMOUNT` in IO-CUST-EXTRACT, even if both refer to the same domain concept; the field index lists them separately and the lineage skill's flag-and-cross-reference machinery surfaces the relationship
- Expanding indexed fields into integer positions — the canonical form uses `[i]` notation; expansion to integers is left to a downstream consumer that knows the run-time `BILL-LINE-COUNT`
- Treating EXEC SQL host-vars as copybook fields without resolving the COPY chain — host vars are working-storage names that may or may not come from a copybook
