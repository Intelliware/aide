# reverse-engineer-cobol-program — Overview

## Purpose

Extract structured documentation from an existing COBOL program repository, producing two complementary parts: Part A (full internals for mainframe developers/maintainers) and Part B (consumer contract for app integrators, batch scheduler owners, and downstream-system teams).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-cobol-program  ──▶  build-knowledge-base
                              │                                        │
                              ├─ Part A → stays in source repo         └─▶ build-mainframe-data-lineage
                              ├─ Part B → KB                              (cross-program traceability)
                              └─ Lineage feed-files (call graph,
                                 data bindings, exec inventory)
                                 → KB-side aggregator input
```

In a mainframe monorepo, this skill runs after `reverse-engineer-copybook-library` so program documentation can reference an already-built canonical record graph for each `COPY` statement.

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact." For a COBOL program, "source code" is the `.cbl/.cob/.pli` file — NOT a run book, NOT a CICS PPT entry, NOT an Endevor description.
- **Six AI Principles** apply.
- **7-Step Workflow** is the inner loop per program.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Mainframe developers, maintainers | DIVISION-by-DIVISION reference, PERFORM and CALL graphs, FILE-CONTROL / FD bindings, embedded EXEC inventories, error/abend handling | Stays in source repo |
| Part B | App integrators, batch scheduler owners, downstream-system teams | Program contract: invocation, expected DDs, COMMAREA/LINKAGE shape, called subprograms, externally observable side effects, error and abend contract | KB |

**Why two parts?** A paragraph-level reference alone (like a COBOL listing alone) cannot express how a downstream caller invokes the program, what it must pass, what side effects it produces, or what abend codes it can return. The consumer contract fills this gap.

## Why the COBOL source is the source of truth

Run books, CICS table extracts, and Endevor descriptions all drift from the actual source. EXEC SQL statements may be modified in the COBOL file but not re-precompiled in the listing extract a team is using. The verification step explicitly checks every documented PERFORM, CALL, EXEC block, and LINKAGE shape against the COBOL source — never against secondary artefacts.

## Three mandatory feed-files for the lineage skill

Beyond Part A and Part B blocks, this skill writes three additional artefacts at the Part-A directory root, used as input by `build-mainframe-data-lineage`:

- `program-call-graph.mmd` — Mermaid `CALL`/`PERFORM`/`XCTL` graph
- `program-data-bindings.json` — copybook → DIVISION/SECTION-where-used → key fields per program
- `program-exec-inventory.md` — every `EXEC CICS|SQL|DLI` with file/SQL/segment names

Without these, lineage cannot produce the cross-program field-level chain.

## Extraction stages

1. **Discovery and Inventory** — programs, entry points, copybooks included, EXEC blocks, opened files. Run `steps/scaffold.md`.
2. **Identification, Environment, Data Divisions** — per program: PROGRAM-ID, FILE-CONTROL, FDs, working / linkage / local-storage; copybook inclusion list with REPLACING resolution.
3. **Procedure Division and Control Flow** — SECTION/PARAGRAPH map; PERFORM graph; CALL/LINK/XCTL/GOBACK/STOP RUN; embedded EXEC CICS / SQL / DLI inventories; error handling.
4. **Cross-Cutting Concerns and Bindings** — file/FD bindings, subprogram graph, CICS COMMAREA/channel layouts, runtime considerations.
5. **Consumer Documentation** — per-program contract; integration examples (JCL fragment for batch, COMMAREA snippet for CICS, LINKAGE example for callee programs).
6. **Verification and Finalization** — run `steps/verify.md`; verify subset rule; verify the three feed-files; finalize change-tracker.

This skill uses **6 stages** instead of 5 — the additional stage exists because consumer-contract assembly + verification of the three lineage feed-files is too substantial to fold into a single Stage 5.

## Compositions

- `templates/compositions/re-cobol-program-internal.yaml` — Part A
- `templates/compositions/re-cobol-program-consumer.yaml` — Part B

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`. In mainframe stacks, additionally hand off to `build-mainframe-data-lineage` once all contributing repos (copybook-library, cobol-program, jcl-job) have completed Part A.
