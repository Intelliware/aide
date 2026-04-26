# Canonical Reverse-Engineering Shape — Reference

The Canonical RE Shape is the cross-cutting structure every reverse-engineering
domain skill conforms to. It guarantees:

- **Symmetry across domains** — a maintainer who has read one RE skill can
  navigate any of the seven without re-learning the workflow.
- **Audience-correct output** — internal vs. consumer docs never get mixed.
- **Consistency with the KB** — Part B outputs slot directly into
  `build-knowledge-base` without per-domain transformation.
- **Coverage completeness** — every public surface of the analyzed system
  ends up cited in at least one Part A and one Part B section.

This document is the framework-level specification. The seven domain skills
under `.agents/skills/reverse-engineering/` implement it; per-domain compositions
under `templates/compositions/re-<domain>-{internal,consumer}.yaml` assemble
the actual section blocks.

## Two-part output model

Every RE skill produces output in two parts addressing two distinct audiences.
Some domains split Part B further when one artifact cannot serve all
consumer use cases.

| Part | Audience | Lives in | Always present? |
|---|---|---|---|
| **Part A** | Maintainers, contributors, future authors of the analyzed system | The analyzed system's own repo (`docs/<domain>-internal/`) | Yes — every domain |
| **Part B** | External consumers (other teams, integrators, SDK generators) | The KB repo (`<KB>/source-docs/<repo-slug>/`) | Yes — every domain |

**Domain-specific Part B splits.** Two domains carry a B1/B2 split because
no single artifact serves both machine and human consumers:

| Domain | Part B1 | Part B2 |
|---|---|---|
| `api` | OpenAPI 3.x specification | Narrative companion guide (workflows, getting started, error handling) |
| `database` | Data dictionary + ERD | Consumer guide (querying, transactions, common patterns) |

The other five domains (`api-framework`, `web-app`, `ui-framework`,
`mobile-app`, `mobile-framework`) ship a single Part B document each.

## Canonical 5-stage workflow

The default workflow has five stages. Five domains follow it verbatim;
`database` extends it with a stored-procedures / business-logic stage between
stages 2 and 3 (so it is 6-stage), and reframes "Feature" as "Schema object."

| # | Stage | Purpose |
|---|---|---|
| 1 | Discovery and Inventory | Read the full source tree; inventory all public surfaces; scaffold the destination file structure for Part A and Part B(s) **before** any content extraction. |
| 2 | Global Infrastructure | Document the cross-cutting machinery (request pipeline, app shell, schema overview, layout engine, runtime — depending on domain) that subsequent feature/module sections depend on. |
| 3 | Feature-by-Feature Extraction | Iterate over modules / endpoints / components / tables / screens. Extract Part A (internal) and Part B (consumer) content for each unit. Cross-verify after each unit. |
| 4 | Cross-Cutting Concerns | Document the things that span features: error handling, observability, security, accessibility, performance, build/deploy, feature flags. |
| 5 | Verification and Finalization | Run the per-domain validation pass; resolve coverage gaps surfaced by the consumer composition; mark the change-tracker complete; sign off `extraction-status.md`. |

`database` inserts **Stage 3 — Stored Procedures and Business Logic** between
Stages 2 and 3 of the canonical sequence, then renumbers the remaining stages
(Stage 4 → Cross-Cutting, Stage 5 → Consumer Documentation and ERD, Stage 6
→ Verification).

## Scaffold-then-extract principle

Stage 1 ends with a complete on-disk file scaffold for Part A and Part B
(empty section files with frontmatter). Subsequent stages **fill** the
scaffold; they do not create new files except where the inventory legitimately
discovered something new.

The principle exists to enforce three properties:

- The full target structure is visible from Stage 1, so reviewers can
  see the intended scope before content lands.
- Coverage gaps surface as empty section files rather than missing files.
- Content extraction is bounded — agents do not invent new sections beyond
  the composition's block list.

## Change-tracker requirements

Every RE invocation maintains two artifacts in the analyzed repo:

- `extraction-status.md` — per-stage progress with checkboxes; the
  Stage 5 verification pass requires every box ticked.
- `CHANGE-TRACKER.md` — append-only log of which source files were read,
  which sections were authored, and any divergence between Part A and
  Part B that was reconciled.

These survive between sessions: a partially-completed RE run resumes by
reading them, not by re-scanning the whole tree.

## 7-step per-section extraction workflow

Inside Stages 2, 3, and 4, every section follows the same 7-step extraction
workflow (defined in each domain skill's `references/OVERVIEW.md`):

1. **Read source** — open the relevant files; do not summarize from filenames.
2. **Inventory** — list the entities the section will document.
3. **Extract Part A** — author the internal section against the inventory.
4. **Extract Part B** — author the consumer section, deriving from Part A
   but rewriting for the consumer audience.
5. **Cross-verify** — confirm consistency between Part A, Part B (and B1/B2
   where they exist).
6. **Update change-tracker** — append the section to `CHANGE-TRACKER.md`.
7. **Mark scaffold complete** — flip the section's checkbox in
   `extraction-status.md`.

The workflow is identical across all 7 domains; what varies is the
section list, which is supplied by the per-domain composition.

## Validation checklist

Before declaring an RE invocation complete:

- [ ] Stage 1 scaffold matches the per-domain composition's block list
- [ ] Every Part A section is non-empty (or explicitly marked N/A with rationale)
- [ ] Every Part B section is non-empty (or explicitly marked N/A with rationale)
- [ ] No Part A content has leaked into Part B (and vice versa)
- [ ] B1/B2 split (where applicable) is consistent — same entities, different framing
- [ ] All cross-cutting concerns from Stage 4 appear in both parts where audience-relevant
- [ ] `extraction-status.md` has every checkbox ticked
- [ ] `CHANGE-TRACKER.md` covers every section authored
- [ ] Part B passes the per-domain consumer-composition validation pass
- [ ] If the project has a KB, `build-knowledge-base` consumes Part B without errors

## Common mistakes

- **Skipping the scaffold.** Authoring sections file-by-file as they're
  discovered makes it impossible to see the intended scope until late.
  Always end Stage 1 with the full scaffold on disk.
- **Mixing audiences.** Internal implementation details (private function
  signatures, refactoring history, performance trade-offs) belong only in
  Part A. Consumer-facing surface (public APIs, integration patterns,
  deployment) belongs in Part B.
- **Inventing sections.** Composition manifests are authoritative. If a
  domain's composition does not include a section the analyzed system
  needs, **fix the composition**, do not add the section ad-hoc.
- **Forgetting cross-verification.** Step 5 of the 7-step workflow is what
  keeps Part A and Part B from drifting. Cross-verifying at the end of the
  whole RE run is too late — drift compounds.
- **Treating Stage 5 as optional.** "It looks done" is not a valid Stage 5
  outcome. The validation pass must run; coverage gaps surfaced by the
  consumer composition must be resolved or explicitly waived.
- **Letting the change-tracker rot.** A change-tracker that does not
  reflect the current on-disk state is worse than no change-tracker —
  future sessions will trust it and skip re-extraction that's actually
  needed.
