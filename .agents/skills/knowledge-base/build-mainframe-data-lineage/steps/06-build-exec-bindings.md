---
slug: 06-build-exec-bindings
sequence: 6
depends-on-prior: true
---

# Step 6: Build EXEC SQL / IMS / CICS Bindings

Produce three lineage artefacts: `06-db2-host-variable-bindings.md`, `07-ims-segment-bindings.md`, and `08-cics-commarea-bindings.md`. Each maps EXEC blocks to copybook fields.

## Why

EXEC blocks are the boundary between COBOL data structures and external systems (DB2, IMS, CICS). A field may be MOVEd within COBOL all day; it ultimately enters or exits the program through an EXEC block. The bindings index lets a downstream consumer answer:

- Which COBOL field corresponds to DB2 column X.Y?
- Which IMS segment is read into copybook Z?
- Does the CICS COMMAREA shape match across LINK / XCTL caller and callee?

## Inputs

- `program-exec-inventory.md` (per cobol-program repo) — every EXEC block with statement, host vars, source lines
- `program-data-bindings.json` (per cobol-program repo) — for resolving host-var names to working-storage / linkage fields
- The copybook universe from step 2 — for resolving working-storage / linkage fields back to copybook fields
- The MOVE chain from step 4 — for resolving CICS COMMAREA chains end-to-end

## Process — DB2

### 1. Walk every EXEC SQL block

For each EXEC SQL row in `program-exec-inventory.md`:

```
Program:  BILLPROC
Section:  2100-CALC
Verb:     SELECT
Tables:   TAX_TABLE
Cursor:   no
Host vars: INTO :WS-TAX
Source:   BILLPROC.cbl:142-145
```

Resolve every host variable:

- `:WS-TAX` → working-storage field `WS-TAX` (PIC S9(5)V99 COMP-3)
- If `WS-TAX` is declared inside a COPY'd record, record the chain back to the copybook field

### 2. Map host vars to DB2 columns

The recorded SQL statement names the column being SELECTed (or INSERTed / UPDATEd). For straightforward statements, map column → host-var:

```
TAX_TABLE.TAX_RATE → :WS-TAX → WS-TAX (PIC S9(5)V99 COMP-3)
```

For `SELECT *` and other opaque statements, flag in step 7 — column position cannot be resolved without the DB2 catalogue.

### 3. Validate type compatibility

For each (DB2 column, host-var) pair, check type compatibility:

- DB2 `INTEGER` → host-var must be `PIC S9(9) COMP` or compatible
- DB2 `DECIMAL(p,s)` → host-var must be `PIC S9(p-s)V9(s) COMP-3` or compatible
- DB2 `CHAR(n)` → host-var must be `PIC X(n)` or compatible
- Nullable columns require an indicator host-var; flag if missing

Mismatches are flagged in step 7.

### 4. Render `06-db2-host-variable-bindings.md`

One section per EXEC SQL block, with the resolved column ↔ host-var ↔ copybook-field chain.

## Process — IMS

### 1. Walk every EXEC DLI block

For each EXEC DLI row in `program-exec-inventory.md`:

```
Program:  BILLEXTR
Verb:     GU
PCB:      CUST-PCB
SSA:      SEGMENT(CUSTSEG) WHERE(CUST-ID = :WS-CUST-ID)
Host vars: WS-CUST-ID, CUST-IO-AREA
Source:   BILLEXTR.cbl:198-202
```

### 2. Resolve segment name to IMS- copybook

`CUSTSEG` should correspond to a copybook in the matched copybook library named `IMS-CUSTSEG` (or a domain-specific name). If found, record the binding; if not, flag in step 7.

### 3. Resolve INTO area to copybook field

`CUST-IO-AREA` is a working-storage 01-level. If declared via `COPY IMS-CUSTSEG`, record the chain.

### 4. Validate PCB sensitivity

The program's LINKAGE PCB list (in `program-data-bindings.json`) declares which segments each PCB is sensitive to. If the EXEC DLI uses a PCB that is not sensitive to the named segment, flag.

### 5. Render `07-ims-segment-bindings.md`

One section per EXEC DLI block, with the resolved segment ↔ IO-area ↔ copybook chain.

## Process — CICS

### 1. Walk every EXEC CICS LINK / XCTL block

For each LINK / XCTL row in `program-exec-inventory.md`:

```
Program:  BILLINQ
Verb:     LINK
Resource: PROGRAM
Target:   BILLUPD
Options:  COMMAREA(LK-COMMAREA) LENGTH(LK-LENGTH)
Host vars: LK-COMMAREA, LK-LENGTH
Source:   BILLINQ.cbl:142-148
```

### 2. Resolve COMMAREA copybook on the caller side

`LK-COMMAREA` is a working-storage 01-level. If declared via `COPY LSCOMM`, record the caller-side copybook.

### 3. Resolve COMMAREA copybook on the callee side

The callee program (`BILLUPD`) has a `LINKAGE 01 LK-COMMAREA COPY LSCOMM` (typically). Find it in BILLUPD's `program-data-bindings.json` LINKAGE-section binding.

### 4. Validate byte size match

The caller passes `LENGTH(LK-LENGTH)`; the callee's LINKAGE 01-level has a byte size from the copybook. Byte sizes must match. Mismatches are flagged in step 7.

### 5. Validate variant selector

If the COMMAREA copybook has REDEFINES variants (e.g. BILLAREA-V1 / BILLAREA-V2 selected by BA-VERSION), confirm that the caller sets the selector before LINK and that the callee reads it. Mismatches are flagged.

### 6. Render `08-cics-commarea-bindings.md`

One section per LINK / XCTL chain, with caller / callee / COMMAREA / variant resolution.

### 7. CICS Channels and Containers

For programs using channels and containers (modern CICS), record per-container layouts similarly. Channels replace COMMAREA; containers replace single-record passing.

## Output

`<KB>/lineage/mainframe/06-db2-host-variable-bindings.md`, `07-ims-segment-bindings.md`, and `08-cics-commarea-bindings.md` populated.

## Halt conditions

- An EXEC SQL host var does not resolve to any working-storage / linkage field — flag (likely a precompiler-emitted SQLCA or DCLGEN issue; record and continue)
- An EXEC DLI segment name does not correspond to any IMS- copybook — flag
- A CICS LINK target program is not in any `program-data-bindings.json` — flag (could be an external program; record and continue)

## Common mistakes

- Auto-resolving `SELECT *` to column positions without consulting the DB2 catalogue — flag
- Ignoring nullable-column indicator host-vars — flag if missing
- Treating CICS LINK byte-size mismatches as warnings — they are failures (silent COMMAREA truncation)
- Skipping channel / container resolution for modern CICS programs
