---
name: reverse-engineer-jcl-job
description: "Use when the user asks to document JCL job decks, mainframe batch jobs, PROCs / PROCLIB, INCLUDE members, IDCAMS / SORT / IEBGENER control cards, GDG dataset lifecycles, or scheduler integration on a mainframe. Produces Part A (internal docs for batch developers and ops) and Part B (job-flow guide for application teams and downstream consumers). Do NOT use for COBOL source — use reverse-engineer-cobol-program; do NOT use for copybooks — use reverse-engineer-copybook-library."
---

# Reverse Engineer JCL Job Documentation

Drives a 5-stage extraction workflow that turns an existing JCL / PROCLIB repository into two documentation parts: Part A (full internals for batch developers and ops) and Part B (job-flow guide for application teams and downstream consumers).

## Overview

JCL repos have two legitimate audiences (batch developers / ops who need step-level detail, runtime overrides, restart points; and application teams who need to know what each job does, what datasets it reads/writes, what predecessor/successor jobs are tied to it). A flat per-job dump does not serve the second audience: PROC expansion with overrides must be resolved, GDG roll behaviour must be explained, condition codes and restart points must be documented, and the dataset I/O graph must be extracted. This skill produces both parts from a single pass.

## When to use

- User asks to document JCL jobs, PROCs, JES2 procedures, INCLUDE members, IDCAMS / SORT / IEBGENER usage, GDG lifecycles
- User wants a job-flow graph or dataset I/O graph generated from JCL
- User has been routed here by `analyze-repository` after JCL classification
- In a mainframe monorepo, run this skill AFTER `reverse-engineer-cobol-program` so JCL `EXEC PGM=` calls resolve against an already-built program inventory

## When NOT to use

- The repo contains COBOL source — use `reverse-engineer-cobol-program`
- The repo contains only copybooks — use `reverse-engineer-copybook-library`
- Cross-program / field-level data-traceability work — that is `build-mainframe-data-lineage` after Part A from this skill exists
- The "JCL" is actually shell scripts or a non-mainframe scheduler — use a different RE skill (none exist for shell / Airflow today; raise as a gap)

## Inputs

- Path to the JCL repository (or JCL/PROCLIB directories inside a mainframe monorepo)
- Source version being documented (Endevor / ChangeMan / Panvalet package, or current main commit)
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: scheduler artefacts (Control-M, CA-7, Zeke, OPC/A) listing predecessor/successor edges; existing run books

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Schedulers, ops, batch developers | Per-job step list; PROC expansion with overrides; DD inventory (DSN, DISP, GDG generation); INCLUDE chain; condition codes; restart points; IDCAMS / SORT / IEBGENER usage; scheduler integration markers; RACF considerations | Stays in source repo |
| Part B | Application teams, downstream consumers, data ops | Job-flow guide: what the job does, datasets read/written, predecessor/successor jobs (where derivable), dataset lifecycle (GDG roll, retention), consumer-visible failure modes | Knowledge base |

Part B is a strict subset of Part A.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all jobs (`.jcl`), PROCs (`.proc`), INCLUDE members
- Per job: identify steps (`EXEC PGM=` / `EXEC PROC=`), DD names, DSNs, DISP, GDG generations, condition codes, INCLUDE references
- Identify scheduler integration markers (Control-M `//*$$`, CA-7, JES2 `/*JOBPARM`, OPC/A markers)
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Per-Job Step Reference
- For each job: every step's PGM or PROC, parameter overrides, DD list with DSN / DISP / DCB / SPACE, SYSIN content, IDCAMS / SORT / IEBGENER control cards
- For each PROC: parameter list with defaults, step list, INCLUDE references

### Stage 3: PROC Expansion and DD Inventory
- For each job step that EXECs a PROC, produce the expanded view: which PROC step runs, which DD is overridden, the resolved DSN per DD
- Produce the per-job DD inventory: input vs. output, DISP=SHR vs. NEW vs. MOD, GDG +1 / -1 / 0 generation, retention period
- Resolve INCLUDE chains; flag circular includes

### Stage 4: Cross-Cutting Concerns and Job-Flow Guide
- Condition codes: per-step `COND=`, `IF (RC=…)`, `EVEN`, `ONLY` clauses; restart points
- Scheduler integration: predecessor/successor edges from Control-M / CA-7 / OPC/A artefacts (where supplied)
- Per-job consumer guide: input datasets read, output datasets written, predecessor/successor (where known), failure modes from a consumer's perspective
- Generate `job-flow.mmd` (Mermaid step→step graph with DD I/O annotated)
- Generate `dataset-io.json` (job → step → DD → DSN → DISP → program invoked)

### Stage 5: Verification and Finalization
- **Close-out gate — ask, then route.** Do NOT run `steps/verify.md`
  unconditionally. Ask the user how this extraction should be closed out, per
  `references/elicitation-patterns/re-verification-gate-selection.md`:
  - **automated** — run `steps/verify.md` in `automated` mode. It issues the
    mechanical GO/NO-GO; checks only the model can judge are reported
    UNVERIFIED and never counted toward GO.
  - **review** — run `steps/verify.md` in `review-evidence` mode (mechanical
    checks only, no verdict), then hand off by name to
    `review-reverse-engineering-package`, which owns the readiness verdict.

  Halt until the user answers; do not infer a mode.
  `[project.elicitation].re_verification_gate` may pre-answer it (`ask` is the
  default, or `review` / `automated`); an unattended run left on `ask` fails
  fast rather than picking for the user.
- Validate the Part B subset rule
- Validate the two mandatory feed-files (`job-flow.mmd`, `dataset-io.json`)
- Log all changes using the `track-change` skill

## Key Rules

- **Source code is the source of truth** — every documented step, DD, DSN, DISP, GDG ref, or COND clause traces to a specific JCL or PROC source line
- **Resolve PROC overrides** — Part A documents both the PROC default and the override applied at the EXEC PROC site
- **Document GDG generations** — `+1` (new), `0` (current), `-1` (previous) all matter for consumer guides
- **Resolve INCLUDE chains** — silent INCLUDE membership is a major source of "where did this DD come from" confusion
- **Keep Part B a strict subset of Part A** — never put something in Part B that isn't already in Part A

## Compositions

- `templates/compositions/re-jcl-job-internal.yaml` — Part A blocks
- `templates/compositions/re-jcl-job-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/jcl-job-internal/`, against `templates/compositions/re-jcl-job-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/jcl-job-consumer/`, against `templates/compositions/re-jcl-job-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/jcl-job/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/jcl-job/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- Every rendered block's `last_verified_against_commit` frontmatter field MUST be set to the full 40-character SHA of the source repo at extraction time (`git rev-parse HEAD`) — this is what `review-reverse-engineering-package`'s review-freshness sub-review checks; leaving it as the template's empty placeholder is a defect, not an omission.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

**Mandatory extracted artefacts (this skill only)** — written at the canonical Part-A directory root, not driven by the block list. These feed `build-mainframe-data-lineage`:
- `job-flow.mmd` — Mermaid step→step graph with DD I/O annotated
- `dataset-io.json` — job → step → DD → DSN → DISP → program invoked

## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

`build-knowledge-base` aggregates Part B into the central KB index. Mainframe stacks then run `build-mainframe-data-lineage` (with the COBOL-program and copybook-library Part A outputs already in place).

## Common mistakes

- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- Documenting a job at the JCL syntax level without resolving PROC overrides
- Skipping INCLUDE-chain resolution — DD names that come from an INCLUDE silently confuse consumers
- Treating `DSN=&SYSUID..XYZ` as a literal DSN — symbolic substitutions must be flagged
- Missing GDG generation (+1 / 0 / -1) — consumers cannot wire downstream jobs without this
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
