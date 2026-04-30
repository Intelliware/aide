# reverse-engineer-jcl-job — Overview

## Purpose

Extract structured documentation from an existing JCL / PROCLIB repository, producing two complementary parts: Part A (full internals for batch developers and ops) and Part B (job-flow guide for application teams and downstream consumers).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-jcl-job  ──▶  build-knowledge-base
                              │                                  │
                              ├─ Part A → stays in source repo   └─▶ build-mainframe-data-lineage
                              ├─ Part B → KB                        (cross-program traceability)
                              └─ job-flow.mmd, dataset-io.json
                                 → KB-side aggregator input
```

In a mainframe monorepo, this skill runs LAST among the three RE skills (after `reverse-engineer-copybook-library` and `reverse-engineer-cobol-program`) so JCL `EXEC PGM=` calls resolve against an already-built program inventory and copybook record graph.

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact." For JCL, "source code" is the `.jcl/.proc` file — NOT a Control-M flow diagram, NOT an ops run book.
- **Six AI Principles** apply.
- **7-Step Workflow** is the inner loop per job.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Schedulers, ops, batch developers | Per-job step list; PROC expansion with overrides; DD inventory; INCLUDE chain; condition codes; restart points; control-card usage; scheduler integration; RACF | Stays in source repo |
| Part B | Application teams, downstream consumers, data ops | Job-flow guide: what the job does, datasets read/written, predecessor/successor (where known), GDG roll, failure modes | KB |

**Why two parts?** A step-level reference alone (Part A) cannot answer "if I land a file in PROD.CUST.MASTER.G0042V00, which jobs read it next" or "if BILLPOST fails, what does the consumer do." Part B answers exactly those questions.

## Why the JCL source is the source of truth

Control-M and CA-7 flow exports drift from JCL faster than copybooks drift from data dictionaries because schedulers are externally configured. The verification step explicitly checks every documented step, DD, DSN, DISP, GDG ref, and COND clause against the JCL source — never against the scheduler.

## Two mandatory feed-files for the lineage skill

Beyond Part A and Part B blocks, this skill writes two additional artefacts at the Part-A directory root, used as input by `build-mainframe-data-lineage`:

- `job-flow.mmd` — Mermaid step→step graph with DD I/O annotated
- `dataset-io.json` — job → step → DD → DSN → DISP → program invoked

Without these, lineage cannot connect program-level data bindings to dataset-level traceability.

## Extraction stages

1. **Discovery and Inventory** — jobs, PROCs, INCLUDE members, scheduler markers, raw step list. Run `steps/scaffold.md`.
2. **Per-Job Step Reference** — every step's PGM/PROC, parameter overrides, DD list, control-card content.
3. **PROC Expansion and DD Inventory** — resolve PROC overrides; per-job DD inventory; INCLUDE chain resolution.
4. **Cross-Cutting Concerns and Job-Flow Guide** — condition codes, restart points, scheduler edges, consumer-facing job-flow guide; generate `job-flow.mmd` and `dataset-io.json`.
5. **Verification and Finalization** — run `steps/verify.md`; verify subset rule; verify the two feed-files; finalize change-tracker.

This skill uses **5 stages** — PROC expansion is Stage 3 (it cannot be folded into Stage 2 because override resolution depends on the full step list).

## Compositions

- `templates/compositions/re-jcl-job-internal.yaml` — Part A
- `templates/compositions/re-jcl-job-consumer.yaml` — Part B

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`. In mainframe stacks, additionally hand off to `build-mainframe-data-lineage` (the lineage skill expects all three of `copybook-record-graph.json`, `program-data-bindings.json`, and `dataset-io.json` to be present).
