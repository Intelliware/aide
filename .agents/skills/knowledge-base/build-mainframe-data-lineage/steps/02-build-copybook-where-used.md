---
slug: 02-build-copybook-where-used
sequence: 2
depends-on-prior: true
---

# Step 2: Build copybook-where-used

Produce `<KB>/lineage/mainframe/02-copybook-where-used.md` — for every copybook in any contributing copybook-library, list every program that copies it and every JCL step that writes a dataset whose record copybook is this one.

## Why

This is the primary "where is this copybook used" answer. Foundation for the field-where-used index in step 3 and the unbound-and-flagged report in step 7.

## Inputs

- Validated `copybook-record-graph.json` (one per copybook-library contributing repo)
- Validated `program-data-bindings.json` (one per cobol-program contributing repo)
- Validated `dataset-io.json` (one per jcl-job contributing repo)
- Per-program FD ↔ DD ↔ copybook chain from `program-data-bindings.json`

## Process

### 1. Build the copybook universe

For each copybook-library, expand `copybook-record-graph.json` into a flat list of `(library, copybook-name, variants[])`. Resolve naming collisions by recording each `(library, copybook-name)` pair separately — divergent copybooks are tracked, not merged.

### 2. For every copybook, list its program consumers

Scan every `program-data-bindings.json`. For each program's binding entry:

```
{
  "program_id": "BILLPROC",
  "bindings": [
    { "copybook": "CUSTREC", "section": "FILE", "fd": "CUST-FILE", "key_fields": [...] },
    ...
  ]
}
```

Add `(program_id, section, fd, key_fields)` to the consumer list of `CUSTREC`.

### 3. For every copybook, list its JCL-step consumers

Scan every `dataset-io.json`. For each step's DD entry, look up the program invoked (`exec.kind == "PGM"` → `exec.name`). Cross-reference that program's `program-data-bindings.json` to find the FD ↔ DD match for the same `ddname`. The copybook bound to that FD is the copybook the JCL step indirectly consumes.

```
JCL: BILLPOST.STEP010.CUSTDD → PROD.CUSTOMER.MASTER (DISP=SHR)
Program: BILLPROC has FD CUST-FILE bound to CUSTDD with copybook CUSTREC
∴ JCL step BILLPOST.STEP010 consumes copybook CUSTREC via DSN PROD.CUSTOMER.MASTER
```

### 4. Render the markdown

Render `02-copybook-where-used.md` as one section per copybook:

```
### CUSTREC (canonical record CUST-RECORD)
- Library: billing-copybook
- Variants: CUST-RECORD (no REDEFINES)
- Copied by N programs:
  - BILLPROC (FILE section, FD CUST-FILE)
  - ...
- Consumed by M JCL steps writing/reading PROD.CUSTOMER.MASTER:
  - BILLPOST.STEP010 (read, DISP=SHR)
  - CUSTMNT.STEP010   (write, +1 generation)
  - ...
- Drift warning (if any): see copybook-conflicts.md
```

### 5. Handle unused copybooks

A copybook in `copybook-record-graph.json` with no program consumers is rendered with an explicit "no consumers found" note. The verify step (8) does NOT flag this as a coverage failure — orphan copybooks may be deliberately retained for legacy compatibility — but it is surfaced in `09-unbound-and-flagged-items.md` so an architect can review.

## Output

`<KB>/lineage/mainframe/02-copybook-where-used.md` populated.

## Halt conditions

- A program's `binding.copybook` references a copybook not present in any contributing `copybook-record-graph.json` — flag and continue (downstream programs will see "unresolved copybook"); record in step 7's `09-unbound-and-flagged-items.md`
- A JCL step's `exec.name` references a program not present in any contributing `program-data-bindings.json` — flag in step 7

## Common mistakes

- Treating divergent same-name copybooks as one row — drift visibility depends on listing them separately
- Skipping the JCL-step consumer pass — the file says "copybook X is used by program Y" but not "JCL job Z writes the dataset that program Y reads via copybook X" — that connection is lineage's primary value-add
- Auto-resolving symbolic-substitution DSNs in JCL — leave them symbolic; downstream sees the raw DSN
