---
name: reverse-engineer-api
description: "Use when the user asks to document an API repository, reverse-engineer API docs, extract API documentation from source code, create OpenAPI specs from existing code, or build API consumer guides. Produces Part A (internal docs), Part B1 (OpenAPI spec), and Part B2 (consumer companion guide)."
---

# Reverse Engineer API Documentation

Drives a 5-stage extraction workflow that turns an existing API codebase into three complementary documentation deliverables: Part A (internal, stays in the repo), Part B1 (OpenAPI 3.x specification), and Part B2 (narrative companion guide).

## Overview

API documentation has three legitimate audiences (maintainers, machine consumers, human consumers) and no single artifact serves all three. This skill produces all three from a single extraction pass against the source code, with strict cross-part consistency enforced via the change-tracker.

## When to use

- User asks to document an API, REST API, GraphQL API, or backend service that exposes HTTP endpoints
- User wants OpenAPI generated from an existing codebase
- User wants a consumer-facing companion guide (workflows, error handling, getting started)
- User has been routed here by `analyze-repository` after API classification

## When NOT to use

- The repo is an API/backend framework or library (consumed by other developers as a dependency) — use `reverse-engineer-api-framework`
- The repo is a web application that happens to have a few internal endpoints — use `reverse-engineer-web-app`
- The repo is a database with no HTTP surface — use `reverse-engineer-database`

## Inputs

- Path to the API repository
- Source version being documented
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for the scope-discovery elicitation
- Optional: existing OpenAPI spec to verify against

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | API maintainers, contributors | Full internal implementation docs | Stays in the API repository |
| Part B1 | API consumers, SDK generators | OpenAPI 3.x specification | Knowledge base |
| Part B2 | API consumers | Narrative companion guide (getting started, workflows, error handling) | Knowledge base |

OpenAPI alone cannot express workflows, tutorials, getting started guides, or error handling strategies. The companion guide fills this gap.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Follow the canonical RE 7-step extraction workflow (see `references/OVERVIEW.md`) within these five stages:

### Stage 1: Discovery and Inventory
- Read the API source code to create a complete inventory of endpoints, middleware, services, entities
- Create `extraction-status.md` and `CHANGE-TRACKER.md`
- Run `steps/scaffold.md` to establish file structure for Part A, Part B1, and Part B2 BEFORE any content extraction

### Stage 2: Global Infrastructure
- Document the request pipeline, middleware, authentication, error handling, global configuration
- These inform every subsequent endpoint's documentation

### Stage 3: Feature-by-Feature Extraction
- For each feature module: read controller, DTOs, service, repository, entity, tests
- Extract Part A (internal implementation), Part B1 (OpenAPI paths/schemas), Part B2 (workflow examples)
- Verify all three parts for consistency after each feature

### Stage 4: Consumer Documentation
- Complete the companion guide (Part B2): Getting Started, Authentication, Pagination, Error Handling
- Complete cross-cutting OpenAPI components (Part B1): shared schemas, security, servers

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
- Validate the OpenAPI spec with a linter
- Log all changes using the `track-change` skill

## Key Rules

- **Source code is the single source of truth** — never trust Swagger annotations without verification
- **Read the full request pipeline** — middleware, guards, pipes, handler, interceptors, exception filters
- **Verify response shapes against response DTOs**, not entities
- **Document error responses from exception throws**, not assumptions
- **Keep all three parts synchronized** — use the change-tracker cross-impact rules
- **Extract one feature at a time** — focused extraction produces accurate documentation

## Compositions

This skill drives two YAML compositions:

- `templates/compositions/re-api-internal.yaml` — Part A (internal implementation) blocks
- `templates/compositions/re-api-consumer.yaml` — Part B (consumer-facing) blocks (currently stub — block authoring pending)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/api-internal/`, against `templates/compositions/re-api-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/api-consumer/`, against `templates/compositions/re-api-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/api/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/api/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

**Supplementary artifacts (this skill only)** — written at the canonical Part-B directory root, not driven by the block list:
- `<KB>/source-docs/<repo-slug>/openapi.yaml` — OpenAPI 3.x machine-readable spec (generated, not block-driven)

## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

`build-knowledge-base` — aggregates the Part B1/B2 outputs (and any other RE'd repos) into the central KB index.

## Common mistakes

- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- Trusting framework-decorator metadata (`@ApiResponse`) instead of verifying against actual handler code
- Documenting entities as response shapes when the controller returns DTOs
- Skipping middleware/guards/interceptors documentation — these affect every endpoint
- Letting Part B drift from Part A — use cross-impact rules in the change-tracker
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
