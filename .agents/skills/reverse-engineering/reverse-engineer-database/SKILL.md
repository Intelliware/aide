---
name: reverse-engineer-database
description: "Use when the user asks to document a database (schema, stored procedures, triggers, views), reverse-engineer a schema, extract database docs, create a data dictionary, or generate ERDs from existing database code. Produces Part A (internal DB docs for DBAs), Part B1 (data dictionary & ERD), and Part B2 (database consumer guide for application developers)."
---

# Reverse Engineer Database Documentation

Drives a 6-stage extraction workflow that turns an existing database repository into three complementary documentation deliverables: Part A (internal docs for DBAs), Part B1 (data dictionary & ERD), and Part B2 (consumer guide for application developers).

## Overview

Database documentation has three legitimate audiences (DBAs, query-pattern consumers, application developers) and a data dictionary alone — like OpenAPI alone for APIs — does not serve all three. This skill produces all three from a single coordinated pass against the DDL, migrations, stored procedures, and triggers.

## When to use

- User asks to document a database, schema, stored procedures, triggers, views
- User wants a data dictionary and ERD generated from existing DDL
- User wants a database consumer guide (query patterns, transaction boundaries, performance)
- User has been routed here by `analyze-repository` after database classification

## When NOT to use

- The repo is an API that happens to include a few migration files — `reverse-engineer-api` covers it; this skill becomes a secondary pass only if migrations + sprocs are non-trivial
- The repo is a NoSQL document store with no schema-as-code (e.g. ad-hoc Mongo) — adapt the workflow but be explicit that DDL-as-source-of-truth no longer applies

## Inputs

- Path to the database repository (or DDL/migration directory)
- Source version being documented (DB engine version + schema version)
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing data dictionary, ERD, runbooks

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | DBAs, database maintainers | Full internals: schema rationale, triggers, RLS, migration strategy, performance | Stays in DB repo |
| Part B1 | Application developers, analysts | Data dictionary, ERD, table/column reference | Knowledge base |
| Part B2 | Application developers | Consumer guide: how to query, write, handle transactions, common patterns | Knowledge base |

A data dictionary alone (like OpenAPI alone for APIs) cannot express query patterns, transaction boundaries, performance considerations, or common access patterns. The consumer guide fills this gap.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all tables, views, stored procedures, functions, triggers, indexes, constraints
- Map foreign key relationships for ERD generation
- Run `steps/scaffold.md` to establish file structure for Part A, Part B1, and Part B2 BEFORE any content extraction

### Stage 2: Schema Documentation
- For each table: columns, types, constraints, defaults, indexes, relationships
- Document naming conventions, schema organization

### Stage 3: Stored Procedures and Business Logic
- For each procedure/function: parameters, return types, business logic, error handling, transaction boundaries

### Stage 4: Cross-Cutting Concerns
- Security (RLS, permissions, encryption), performance (indexing strategy, query patterns), migration strategy

### Stage 5: Consumer Documentation and ERD
- Generate ERD (Mermaid format), complete data dictionary, write consumer guide

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
- Validate the ERD against actual FK constraints
- Log all changes using the `track-change` skill

## Key Rules

- **DDL is the source of truth** — verify column types, constraints, and defaults against actual DDL/migration files
- **Document FK cascade rules explicitly** — ON DELETE CASCADE vs RESTRICT matters enormously
- **Stored procedures need parameter-level documentation** — not just the signature
- **The consumer guide teaches query patterns** — not just schema structure
- **Indexes and partitioning are part of the contract** — they affect query plans visible to consumers

## Compositions

- `templates/compositions/re-database-internal.yaml` — Part A blocks
- `templates/compositions/re-database-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/database-internal/`, against `templates/compositions/re-database-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/database-consumer/`, against `templates/compositions/re-database-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/database/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/database/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

**Supplementary artifacts (this skill only)** — written at the canonical Part-B directory root, not driven by the block list:
- `<KB>/source-docs/<repo-slug>/data-dictionary.md` + `erd.mmd` — generated reference artifacts (not block-driven)

## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

`build-knowledge-base` — aggregates Part B1 + B2 into the central KB index.

## Common mistakes

- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- Documenting an ORM model as ground truth instead of the DDL
- Omitting FK cascade rules (ON DELETE / ON UPDATE behaviors)
- Stopping at schema and skipping stored-procedure business logic
- Producing a data dictionary without consumer query patterns
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
