---
slug: 05-build-job-program-dataset-chain
sequence: 5
depends-on-prior: true
---

# Step 5: Build Job → Program → Dataset Chain

Produce `<KB>/lineage/mainframe/05-job-program-dataset-chain.md` and `05-job-program-dataset-chain.mmd` — the cross-system Mermaid graph connecting JCL jobs to programs to datasets to copybooks.

## Why

This is the operational view of lineage. Operations / scheduling teams use it to answer "which jobs touch this dataset" and "which dataset feeds this program." Auditors use it to confirm a dataset's I/O surface.

## Inputs

- `dataset-io.json` (per jcl-job repo) — every job → step → DD → DSN → DISP → program-invoked entry
- `program-data-bindings.json` (per cobol-program repo) — every program's FD ↔ DD ↔ copybook chain
- The copybook universe from step 2

## Process

### 1. Walk every job

For each `dataset-io.json` entry, enumerate jobs and their steps:

```
Job:BILLPOST
  └─ Step:BILLPOST.STEP010 (EXEC PGM=BILLPROC)
      ├─ DD:STEP010.STEPLIB → DSN=PROD.LOAD.LIB (DISP=SHR)
      ├─ DD:STEP010.CUSTDD  → DSN=PROD.CUSTOMER.MASTER (DISP=SHR, io=input)
      ├─ DD:STEP010.BILLDD  → DSN=PROD.BILLING.OUTPUT(+1) (DISP=NEW, io=output, gdg=+1)
      └─ DD:STEP010.ERRDD   → DSN=PROD.BILLING.ERR(+1) (...)
```

### 2. Resolve PGM names to programs

For each step's `exec.kind == "PGM"` entry, find the program in the contributing `program-data-bindings.json`. If not found, flag in step 7 (utility / vendor program is acceptable; mystery program is not).

### 3. For each (Step, DD) pair, find the program's matching FD

In the program's `program-data-bindings.json`, find the binding whose `fd` field matches this DD-name. Record the copybook bound to that FD.

### 4. For each (Step, DD, Program FD), match a copybook

If the program has a binding with `section: FILE` and `fd: <ddname>`, the binding's `copybook` is the record copybook for that DD. If no FILE-section binding matches the DD-name, the DD is likely a STEPLIB / SYSOUT / SYSPRINT / SYSUDUMP / SYSABEND or a dynamically allocated DD — leave the copybook unresolved and flag if the DD is non-system (i.e. not in {STEPLIB, SYSOUT, SYSPRINT, SYSUDUMP, SYSABEND}).

### 5. Render Mermaid

Emit `05-job-program-dataset-chain.mmd` with the following graph shape:

```mermaid
graph LR
    Job:BILLPOST --> Step:BILLPOST.STEP010
    Step:BILLPOST.STEP010 --> Pgm:BILLPROC
    Pgm:BILLPROC --> DD:STEP010.CUSTDD
    DD:STEP010.CUSTDD --> DSN:PROD.CUSTOMER.MASTER
    DSN:PROD.CUSTOMER.MASTER --> Copybook:CUSTREC
    Pgm:BILLPROC --> DD:STEP010.BILLDD
    DD:STEP010.BILLDD --> DSN:PROD.BILLING.OUTPUT
    DSN:PROD.BILLING.OUTPUT --> Copybook:BILLREC
```

For large graphs (typical mainframe shop has hundreds of jobs and thousands of steps), partition the rendered Mermaid into per-job sub-graphs. The full graph is preserved in the markdown render.

### 6. Render Markdown

`05-job-program-dataset-chain.md` is a human-readable navigation companion to the Mermaid file:

- One section per job with a brief job summary (drawn from `02-what-this-job-does.md` of the jcl-job consumer Part B)
- The job's step list with each step's PGM, DD inventory, and copybook bindings
- Cross-links into `02-copybook-where-used.md` and `03-field-where-used.md`

### 7. Annotate GDG generations

For each DD with a GDG generation (`+1` / `0` / `-1`), surface the generation in the rendered output. Cross-job GDG roll coordination (predecessor writes `+1`; successor reads `0`) is documented in the jcl-job consumer Part B's `03-predecessor-and-successor-jobs.md`; this lineage artefact does not duplicate that text but does annotate each generation in the chain.

### 8. Annotate symbolic-substitution DSNs

For each DSN containing `&`, render the symbolic name as-is and append a flag pointing to step 7's `09-unbound-and-flagged-items.md`.

## Output

`<KB>/lineage/mainframe/05-job-program-dataset-chain.md` and `05-job-program-dataset-chain.mmd` populated.

## Halt conditions

- `program-data-bindings.json` and `dataset-io.json` reference inconsistent DD-names and the inconsistency is not flaggable (e.g. the program doesn't open the DD-name the JCL passes) — flag in step 7
- Mermaid render fails to parse

## Common mistakes

- Treating SYSOUT / SYSPRINT / SYSUDUMP DDs as "missing copybook bindings" — they are system DDs; exclude from the binding match
- Auto-resolving symbolic-substitution DSNs — leave them symbolic and flag
- Producing a single monolithic Mermaid file for very large graphs — partition by job
- Skipping GDG generation annotation — `(+1)` vs. `(0)` vs. `(-1)` matters enormously for downstream consumers
