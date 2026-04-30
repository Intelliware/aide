---
slug: job-program-dataset-chain
title: "Job → Program → Dataset Chain"
applies-to: [kb-mainframe-data-lineage]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Job → Program → Dataset Chain

Cross-system view connecting JCL jobs to programs to datasets to copybooks. The Mermaid graph in `05-job-program-dataset-chain.mmd` renders this; this markdown provides the navigational companion.

### 5.1 Per-Job Section

For each job, render:

```
### Job: [JOBNAME]
Source: [REPO-SLUG]
Schedule (from jcl-job consumer Part B): [daily 02:00 / weekly Mon / ...]

Steps:
  - [STEPNAME] — EXEC PGM=[PROGNAME]
      DDs:
        STEPLIB → DSN=PROD.LOAD.LIB (system, excluded from chain)
        [DD-NAME] → DSN=[DSN] (DISP=[disp], io=[input/output], gdg=[+1/0/-1])
            Bound copybook (per program FD): [COPYBOOK]
        ...

  - [STEPNAME] — EXEC PROC=[PROCNAME] (resolved view)
      Resolved steps: [STEP1, STEP2, ...]
      DDs after override: ...
```

### 5.2 Predecessor / Successor Cross-Reference

Each job's predecessor/successor edges are in the jcl-job consumer Part B's `03-predecessor-and-successor-jobs.md`. This artefact does not duplicate that text but cross-links into it for each job. Mermaid edges in the rendered graph reflect the same scheduler-confirmed / GDG-derived edges.

### 5.3 GDG Generation Annotation

Each DD using a GDG generation (`+1` / `0` / `-1`) is annotated. Cross-job GDG roll coordination (predecessor writes `+1`; successor reads `0`) is preserved in the rendered markdown but is not the source of truth for that relationship — the source is the jcl-job consumer Part B.

### 5.4 Symbolic-Substitution DSNs

DSNs containing `&` are rendered as-is (with the symbolic name) and cross-linked to `09-unbound-and-flagged-items.md` § 4. The Mermaid graph uses the symbolic DSN as the node label.

### 5.5 Programs Not Invoked From JCL

Programs in any contributing `program-data-bindings.json` that no JCL step references via `EXEC PGM=` are NOT rendered in this artefact's Mermaid graph. They are surfaced in `09-unbound-and-flagged-items.md` § 5 instead. (These are typically callable subprograms invoked via `CALL` only.)

### 5.6 Companion Machine-Readable Artefact

`05-job-program-dataset-chain.mmd` is the canonical machine-readable form. For very large graphs (hundreds of jobs, thousands of steps), it is partitioned into per-job sub-graphs. Downstream consumers that render Mermaid (e.g. a docs site, a graph-visualisation tool) read the `.mmd` directly.
