---
name: reverse-engineer-cobol-program
description: "Use when the user asks to document COBOL programs, reverse-engineer COBOL source, extract documentation from a COBOL repository, document mainframe batch / online programs, document CICS / IMS / DB2 program logic, or build a program contract for COBOL callers. Produces Part A (internal docs for mainframe maintainers) and Part B (consumer guide for app integrators, batch schedulers, and downstream-system teams). Do NOT use for copybook-only repos — use reverse-engineer-copybook-library."
---

# Reverse Engineer COBOL Program Documentation

Drives a 6-stage extraction workflow that turns an existing COBOL program repository into two documentation parts: Part A (full internals for mainframe developers and maintainers) and Part B (program contract for consumers, integrators, and batch schedulers).

## Overview

COBOL programs have three legitimate audiences (mainframe maintainers, batch scheduler owners, downstream-system integrators) and a paragraph-level reference alone does not serve all three. This skill produces Part A (DIVISION-by-DIVISION reference, PERFORM and CALL graphs, FILE-CONTROL bindings, embedded EXEC inventories) and Part B (entry points, expected DDs, called subprograms, externally observable side effects) from a single coordinated pass against the COBOL source.

## When to use

- User asks to document a COBOL repository, COBOL programs, mainframe batch programs, CICS online programs, DB2-precompiled COBOL, IMS DL/I COBOL
- User wants the call graph or PERFORM graph for a COBOL program extracted as documentation
- User has been routed here by `analyze-repository` after COBOL-program classification

## When NOT to use

- The repo contains only copybooks (`.cpy` files with no `PROCEDURE DIVISION`) — use `reverse-engineer-copybook-library`
- The repo contains only JCL / PROCs — use `reverse-engineer-jcl-job`
- The repo is a DB2 schema (DDL / DBRMs) without COBOL source — use `reverse-engineer-database`
- Cross-program / field-level data-traceability work — that is `build-mainframe-data-lineage` after Part A from this skill exists

## Inputs

- Path to the COBOL program repository (or COBOL source directory inside a mainframe monorepo)
- Source version being documented (Endevor / ChangeMan / Panvalet package, or current main commit)
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing program contracts, run books, DB2 DBRM listings, CICS PPT/PCT extracts, IMS PSB/PCB listings

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Mainframe developers, maintainers | DIVISION-by-DIVISION reference; PERFORM and SECTION graph; CALL/LINK/XCTL graph; FILE-CONTROL ↔ FD bindings; WORKING-STORAGE / LINKAGE / LOCAL-STORAGE breakdown; embedded EXEC CICS / SQL / DLI inventories; copybook inclusion list (with REPLACING) | Stays in source repo |
| Part B | App integrators, batch scheduler owners, downstream-system teams | Program contract: entry points, expected DD names, called subprograms, externally observable side effects (file I/O, CICS commareas, SQL writes, MQ puts) | Knowledge base |

Part B is a strict subset of Part A.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory programs (one folder may contain many `.cbl/.cob/.pli`); for each, identify program-id, entry points, called subprograms, included copybooks (`COPY` statements with REPLACING), opened files, embedded `EXEC CICS|SQL|DLI` blocks
- Identify execution context per program (batch / CICS online / IMS MPP/BMP) from divisions and EXEC blocks
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Identification, Environment, Data Divisions
- For each program: PROGRAM-ID, AUTHOR, INSTALLATION (from IDENTIFICATION DIVISION); SOURCE/OBJECT-COMPUTER, SPECIAL-NAMES, FILE-CONTROL (ASSIGN to DD-name or DSN, ORGANIZATION, ACCESS MODE) (from ENVIRONMENT DIVISION); FILE SECTION FDs, WORKING-STORAGE, LOCAL-STORAGE, LINKAGE SECTION (from DATA DIVISION)
- Document copybook inclusion: each `COPY <name> [REPLACING ...]` statement, the section it appears in, the canonical record it pulls in

### Stage 3: Procedure Division and Control Flow
- Per program: SECTION / PARAGRAPH map; PERFORM graph (THRU and TIMES variants); CALL / LINK / XCTL / GOBACK / STOP RUN points
- Embedded EXEC inventories: every `EXEC CICS` (READ/WRITE/LINK/XCTL/RETURN/SEND/RECEIVE/COMMAREA), `EXEC SQL` (statement, INTO host vars, cursor declarations), `EXEC DLI` (GU/GN/GHU/REPL/DLET/ISRT, PCB sensitivity)
- Error handling: SQLCODE / SQLSTATE checks, ABEND codes, DECLARATIVES, ON SIZE ERROR

### Stage 4: Cross-Cutting Concerns and Bindings
- File / FD bindings: every FD ↔ SELECT ↔ DD-name (or DSN where literal); record layout copybook in use
- Subprogram graph: static `CALL 'XYZ'` vs dynamic `CALL WS-NAME`; LINKAGE contract for each callee
- CICS COMMAREA / channel-container layouts (mapped to copybooks where applicable)
- Performance / runtime considerations: working-storage size, large `OCCURS DEPENDING ON`, paginated cursors, expensive PERFORMs in inner loops

### Stage 5: Consumer Documentation
- Per program, write the consumer-facing program contract: how to invoke, expected DD names with example DSNs, COMMAREA / LINKAGE shape, called subprograms with their LINKAGE shape, externally observable side effects, error and abend contract
- Integration examples: a JCL fragment invoking the program; a CICS commarea client snippet; a calling-program LINKAGE example

### Stage 6: Verification and Finalization
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
- Validate the Part B subset rule and the three mandatory extracted artifacts (`program-call-graph.mmd`, `program-data-bindings.json`, `program-exec-inventory.md`)
- Log all changes using the `track-change` skill

## Key Rules

- **Source code is the source of truth** — every documented division, paragraph, EXEC block, or LINKAGE shape must trace to a specific source line
- **Document execution context per program** — batch / CICS / IMS-MPP / IMS-BMP — because the consumer contract differs sharply
- **Resolve `COPY ... REPLACING`** — the included record after substitution is what the program actually uses; the lineage skill in stage 4 depends on this
- **Treat dynamic `CALL` as an "unbound edge"** — flag and list candidate targets; do not invent a single resolved target
- **Keep Part B a strict subset of Part A** — never put something in Part B that isn't already in Part A

## Compositions

- `templates/compositions/re-cobol-program-internal.yaml` — Part A blocks
- `templates/compositions/re-cobol-program-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/cobol-program-internal/`, against `templates/compositions/re-cobol-program-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/cobol-program-consumer/`, against `templates/compositions/re-cobol-program-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/cobol-program/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/cobol-program/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- Every rendered block's `last_verified_against_commit` frontmatter field MUST be set to the full 40-character SHA of the source repo at extraction time (`git rev-parse HEAD`) — this is what `review-reverse-engineering-package`'s review-freshness sub-review checks; leaving it as the template's empty placeholder is a defect, not an omission.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

**Mandatory extracted artifacts (this skill only)** — written at the canonical Part-A directory root, not driven by the block list. These feed `build-mainframe-data-lineage`:
- `program-call-graph.mmd` — Mermaid graph of `CALL` / `PERFORM` / `XCTL` per program
- `program-data-bindings.json` — copybook → division-where-used → key fields per program
- `program-exec-inventory.md` — every `EXEC CICS|SQL|DLI` block, with file/SQL/segment names

## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

`build-knowledge-base` aggregates Part B into the central KB index. Mainframe stacks then run `build-mainframe-data-lineage` to produce cross-program field-level traceability.

## Common mistakes

- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- Documenting a single program's PROCEDURE DIVISION without the embedded EXEC inventories
- Treating dynamic `CALL` as resolved without listing candidate targets
- Omitting `COPY ... REPLACING` substitutions when describing the in-use record
- Producing Part B without a JCL invocation example for batch programs
- Skipping verification of LINKAGE-SECTION ↔ caller-COMMAREA / parameter shape consistency
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
