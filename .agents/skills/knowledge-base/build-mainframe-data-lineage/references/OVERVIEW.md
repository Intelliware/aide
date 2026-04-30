# build-mainframe-data-lineage — Overview

## Purpose

Aggregate the per-repo Part A outputs from the three mainframe
RE skills (copybook-library, cobol-program, jcl-job) into a single
cross-program data-lineage artefact under `<KB>/lineage/mainframe/`.
This skill answers questions no single contributing RE pass can:

- Which programs use copybook X?
- Where is field Y read / written / MOVEd?
- Which JCL writes the dataset that program Z reads?
- Which DB2 column does this EXEC SQL host variable bind to?
- Which IMS segment does this PCB read?

## Position in the flow

```
                        ┌──────────────────────┐
copybook-library ──────▶│                      │
cobol-program    ──────▶│  build-mainframe-    │──▶  <KB>/lineage/mainframe/
jcl-job          ──────▶│  data-lineage         │
                        │                      │
build-knowledge-base ──▶│   (KB-stage          │
                        │    aggregator)       │
                        └──────────────────────┘
```

`build-knowledge-base` runs first (it produces `<KB>/source-docs/`
which holds the per-repo Part A/B docs). The three mainframe RE
skills produce mandatory feed-files (the JSON/MMD/MD side artefacts)
that this skill consumes.

## Why a separate KB-stage skill

Lineage cannot be derived from any single repo. A copybook lives in
one repo, the programs that include it live in another, and the JCL
that runs those programs lives in a third. Producing lineage in any
contributing RE skill would require that skill to read another
repo's source — a violation of the per-repo RE contract. Lineage
therefore lives at the KB layer, identical in shape to other
KB-stage aggregator skills (`build-knowledge-base`,
`verify-knowledge-base-coverage`).

## What it does

1. Validates the three contributing repos' feed-files exist and
   parse cleanly
2. Builds the copybook-where-used index by joining
   `copybook-record-graph.json` (every copybook in the library) with
   `program-data-bindings.json` (every copybook each program copies)
   and `dataset-io.json` (every dataset written that consumes a
   copybook record)
3. Builds the field-where-used index by joining canonical field
   names from `copybook-record-graph.json` with program-section
   citations
4. Builds the MOVE chain by traversing `program-data-bindings.json`
   plus a re-read of `program-exec-inventory.md` (which contains
   `MOVE` / `COMPUTE` / `MOVE CORRESPONDING` references)
5. Builds the job → program → dataset chain by joining
   `dataset-io.json` (per JCL) with `program-data-bindings.json`
   (per program)
6. Builds the EXEC SQL / IMS / CICS bindings by joining EXEC blocks
   from `program-exec-inventory.md` with copybook fields and (for
   IMS) the `IMS-*` copybooks
7. Emits the unbound-and-flagged-items index for everything that did
   not resolve cleanly
8. Verifies coverage rules (every copybook documented, every host-var
   resolved, every program reachable from JCL)

## What it does NOT do

- Does not modify any contributing repo's RE Part A outputs
- Does not modify the contributing copybook-record-graph.json /
  program-data-bindings.json / dataset-io.json feed-files
- Does not produce a forward-engineering plan (refactoring,
  COBOL → Java migration, etc.)
- Does not connect to a live mainframe (z/OSMF, FTP, DB2 catalog
  queries are out of scope)
- Does not auto-resolve symbolic-substitution DSNs in JCL
- Does not auto-resolve dynamic CALL targets

## Why the per-repo feed-files are the source of truth

The lineage artefact is derived. Every claim in
`copybook-where-used.md`, `field-where-used.md`, `move-chain.md`,
etc. must trace back to a feed-file row. The verify step (8) checks
this. Treating any other artefact as truth (e.g. an existing tribal
data-lineage spreadsheet) silently corrupts the result.

## Hand-off

After lineage is built, recommend:

- `verify-knowledge-base-coverage` for an audit cycle
- `detect-knowledge-base-drift` for periodic drift detection
- `navigate-knowledge-base` for feature-stage grounding

The lineage artefact is consumed by every downstream A.I.D.E. stage
that touches mainframe code (requirements / design / planning /
execution) via `navigate-knowledge-base`.
