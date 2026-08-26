---
name: reverse-engineer-copybook-library
description: "Use when the user asks to document a copybook library, reverse-engineer mainframe record layouts, build a coherent data dictionary across COBOL copybooks, normalize record layouts (REDEFINES / OCCURS DEPENDING ON), find duplicate or divergent copybooks across teams, or produce a per-copybook record reference. Produces Part A (internal docs for copybook maintainers and data architects) and Part B (data dictionary for application developers and integrators). Do NOT use for COBOL program repos — use reverse-engineer-cobol-program."
---

# Reverse Engineer Copybook Library Documentation

Drives a 5-stage extraction workflow that turns an existing copybook library (`.cpy` files) into two documentation parts: Part A (full internals for copybook maintainers and data architects) and Part B (a coherent cross-library data dictionary for application developers and integrators).

## Overview

A copybook library has two legitimate audiences (copybook maintainers / data architects, and application developers consuming records as a data dictionary). A flat per-file dump does not serve the second audience: REDEFINES variants must be named, OCCURS DEPENDING ON must be expanded, divergent copybooks of the same name across folders must be detected, and naming-convention buckets (e.g. `WS-`, `IO-`, `LS-`, `DB2-`) must be surfaced. This skill produces both parts from a single pass.

## When to use

- User asks to document a copybook library, build a data dictionary, normalize record layouts, find duplicate copybooks
- User wants the canonical record graph generated from a copybook library
- User has been routed here by `analyze-repository` after copybook-library classification
- In a mainframe monorepo, run this skill FIRST so downstream COBOL-program documentation can reference an already-built canonical record graph

## When NOT to use

- The repo contains COBOL programs (`.cbl/.cob/.pli` with `PROCEDURE DIVISION`) — use `reverse-engineer-cobol-program`
- The repo contains only JCL / PROCs — use `reverse-engineer-jcl-job`
- Cross-program / field-level data-traceability work — that is `build-mainframe-data-lineage` after Part A from this skill exists
- DDL / RDBMS schema work — that is `reverse-engineer-database`

## Inputs

- Path to the copybook library (or copybook directory inside a mainframe monorepo)
- Source version being documented (Endevor / ChangeMan / Panvalet package, or current main commit)
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing data dictionaries, naming-convention guides, deprecated-copybook lists

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Copybook maintainers, data architects | Per-copybook record dictionary: every level (`01–88`), `PIC`, `USAGE`, `OCCURS [DEPENDING ON]`, `REDEFINES`, `FILLER`, `VALUE` clauses; group hierarchy; naming-convention buckets; duplicate / divergent detection; deprecated copybooks | Stays in source repo |
| Part B | Application developers, integrators | Coherent data dictionary across the whole library: canonical record names; field index; "use this copybook for X" guidance; deprecated copybooks; naming-convention key | Knowledge base |

Part B is a strict subset of Part A.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all copybooks (every `.cpy` file), with byte size and last-modified date per file
- Detect duplicates / divergent layouts (same filename, different bytes, across folders or branches)
- Identify naming-convention buckets by leading prefix (`WS-`, `IO-`, `LS-`, `DB2-`, `CICS-`, etc.) — confirmed with user
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Per-Copybook Record Extraction
- For each copybook: every level (`01`/`05`/`10`/`15`/`88`), every group / elementary item, `PIC`, `USAGE` (DISPLAY, COMP, COMP-3, COMP-4, BINARY, NATIONAL, etc.), `OCCURS [DEPENDING ON]`, `REDEFINES`, `FILLER`, `VALUE` clauses, level-88 condition names
- Note `JUSTIFIED RIGHT`, `BLANK WHEN ZERO`, `SIGN IS LEADING/TRAILING SEPARATE`, `SYNCHRONIZED`

### Stage 3: Variants and Conflicts
- For each copybook with `REDEFINES`: name each variant explicitly (Variant A / B / … or domain-specific name agreed with user)
- For each `OCCURS DEPENDING ON`: identify the controlling field; expand into indexed positions in the canonical graph
- Duplicate / divergent detection: produce `copybook-conflicts.md` listing each name with multiple distinct layouts; classify (legitimate variants vs. drift)
- Deprecated copybooks: identify and flag (header markers, naming patterns, user input)

### Stage 4: Cross-Library Data Dictionary
- Generate the canonical record graph: every copybook normalized into one or more named records (post-REDEFINES) with OCCURS expanded
- Build the field index: every elementary field name → list of (copybook, record variant, level, PIC, USAGE)
- Write the consumer-facing data dictionary, organised by naming-convention bucket
- Write "use this copybook for X" guidance keyed by domain (customer / billing / settlement / audit / …)

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
- Validate the canonical record graph (every copybook represented; every variant named; every OCCURS expanded)
- Log all changes using the `track-change` skill

## Key Rules

- **Source code is the source of truth** — every documented level, PIC, USAGE, REDEFINES, or OCCURS clause traces to a specific copybook source line
- **Name every REDEFINES variant explicitly** — flat dumps that show "REDEFINES X" without naming the variant defeat the data-dictionary use case
- **Expand OCCURS DEPENDING ON** — record both the controlling field and the canonical expansion (max occurrences) so lineage can derive indexed positions
- **Flag divergent copybooks of the same name** — silent drift across teams is a major source of mainframe production bugs
- **Keep Part B a strict subset of Part A** — never put something in Part B that isn't already in Part A

## Compositions

- `templates/compositions/re-copybook-library-internal.yaml` — Part A blocks
- `templates/compositions/re-copybook-library-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/copybook-library-internal/`, against `templates/compositions/re-copybook-library-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/copybook-library-consumer/`, against `templates/compositions/re-copybook-library-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/copybook-library/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/copybook-library/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- Every rendered block's `last_verified_against_commit` frontmatter field MUST be set to the full 40-character SHA of the source repo at extraction time (`git rev-parse HEAD`) — this is what `review-reverse-engineering-package`'s review-freshness sub-review checks; leaving it as the template's empty placeholder is a defect, not an omission.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

**Mandatory extracted artefacts (this skill only)** — written at the canonical Part-B directory root, not driven by the block list. These feed `build-mainframe-data-lineage`:
- `copybook-record-graph.json` — every copybook normalised into canonical records; REDEFINES collapsed into named variants; OCCURS expanded
- `data-dictionary.md` — human-readable rendering organised by naming-convention bucket
- `copybook-conflicts.md` — divergent-layout report (same name, different shapes)

## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

`build-knowledge-base` aggregates Part B into the central KB index. Mainframe stacks then run `build-mainframe-data-lineage` (after `reverse-engineer-cobol-program` and `reverse-engineer-jcl-job` have completed).

## Common mistakes

- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- Treating a flat per-file dump as a data dictionary — the cross-library normalisation is the value-add
- Missing REDEFINES variants — naming each one explicitly is mandatory
- Skipping OCCURS DEPENDING ON expansion — lineage cannot derive indexed positions without it
- Hiding divergent layouts in a footnote — they belong in `copybook-conflicts.md`
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
