---
name: review-implementation-package
description: "Use when the user asks to review the implementation package, validate the implementation plan before coding starts, run the pre-execution gate, check increment readiness, verify increments conform to the Canonical Increment Shape, or confirm INC-XXX coverage. Produces a GO/NO-GO verdict with per-increment findings."
---

<!-- validate: allow-phase-vocab -->

# Review Implementation Package

The pre-execution gate for the planning stage. Validates an assembled
implementation package against the approved requirements package, the approved
design package, and the Canonical Increment Shape. Returns a GO / NO-GO
verdict with per-increment findings.

## Overview

This skill is the planning-stage analogue of `review-requirements-package` and
`review-design-package`. It runs after `create-implementation-package` has
produced the package and self-checked it via plan-readiness review, and before
any execution-stage skill runs.

A NO-GO verdict blocks handoff to execution. The user resolves findings (or
returns to `create-implementation-package` for rework), then this skill is
re-run for re-validation.

## When to use

- The user says "review implementation package", "validate the implementation
  plan", "check increment readiness", "pre-execution review", "approve the
  implementation plan", or "is the plan ready for execution"
- An implementation package exists at `{project.paths.implementation_package}/{feature-id}/`
- The user has not yet started executing increments

## When NOT to use

- The implementation package has not been assembled — run
  `create-implementation-package` first
- The user wants to write or refactor increments — use
  `create-implementation-package`
- The user wants to execute increments — use `execute-increments` (a NO-GO
  here blocks that)
- The user wants to review code (post-implementation) — use the PR review
  flow, not this skill

## Inputs

| Input | Source | Required |
|---|---|---|
| Implementation package | `{project.paths.implementation_package}/{feature-id}/` (incl. all `INC-XXX.md`, `implementation-package.md`, `increment-status.md`, `bugs-and-issues-log.md`, `change-tracker.md`) | Yes |
| Approved Requirements Package | `{project.paths.requirements_package}/{feature-id}/` | Yes |
| Approved Design Package | `{project.paths.design_package}/{feature-id}/` | Yes |
| Canonical Increment Shape spec | `templates/blocks/planning/*.md` (8 blocks) and `references/canonical-increment-shape-spec.md` | Yes |

See `references/INPUTS-OUTPUTS.md` for the full inputs/outputs tables.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Review 1. If `features.toml` is absent, skip feature resolution, but still map this skill's paths per that file's § *Not opted in* before reading or writing — they are spelled in the opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller: review-implementation-package`) rather than guessing which feature's package to review — do not fall back to creating one. If it resolves, echo the feature ID and the resolved package path before Review 1.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Run the review checks **strictly in order**. Do not run them in parallel.
Stop on any NO-GO finding until the user resolves the finding or asks for
help resolving it.

1. **Shape conformance review** — every increment has all 8 sections in
   order; section headings match exactly; no legacy `PHASE-XXX` IDs remain
2. **FR coverage review** — every FR in the Requirements Package is covered
   by at least one increment (or explicitly listed out-of-scope); no invented
   FRs
3. **Design coverage review** — every component, endpoint, and integration
   point in the Design Package appears in at least one increment Plan
4. **Independent executability review** — every increment is executable
   without conversation context (specific files, INC-ID dependencies,
   concrete commands)
5. **Verification gate review** — every AI Gate is specific and executable;
   every Human Gate is 2-4 judgment items; Success Criteria are 4-8 binary
   checkboxes
6. **Dependency graph review** — INC-ID dependencies form a DAG; no cycles;
   sequencing is feasible
7. **Support document review** — `implementation-package.md` overview,
   `increment-status.md`, `bugs-and-issues-log.md`, `change-tracker.md` all
   present and consistent
8. **Adversarial pass** — wraps `meta/review-adversarial --stage=planning`;
   findings map into the consolidated issue list by severity
9. **Edge-case pass** — wraps `meta/review-edge-case-hunter --stage=planning`;
   same mapping
10. **Implementation-readiness verdict** — final GO / NO-GO

For step-by-step procedure, see `references/review-workflow.md`.

## Output

A review report containing:

- A pass / fail verdict for each of the 10 reviews above
- Per-increment findings (organized by INC ID)
- A consolidated issue list with severity (Critical / Important / Minor)
- Two Format 4 findings files from reviews 8–9, written to
  `{project.paths.implementation_package}/{feature-id}/review/adversarial-findings.md` and
  `.../edge-case-findings.md`
- A final **GO** or **NO-GO** verdict
- If NO-GO: explicit required fixes before re-validation

The verdict is also recorded in
`{project.paths.implementation_package}/{feature-id}/change-tracker.md`.

## Next skill

- **GO** → the user chooses one of two paths (the quality stage is **not**
  mandated on the dev critical path; this is a per-run decision, not a config
  switch):
  - **Quality-first (synchronous gate)** → `create-quality-package`. The
    quality stage authors the test/quality plan before execution; its
    `review-quality-package` gate must return GO before `execute-increments`
    runs. Recommended when the test design should shape or precede coding.
  - **Execute-first (quality parallel or deferred)** → `execute-increments`
    directly. The quality stage runs in parallel or later on its own cadence;
    coverage is reconciled post-hoc by `audit-quality-coverage`.
  - State the recommended path but **wait for the user to pick** — do not
    auto-select from `project.toml`. (`[project.testing].qe_repo`, when set,
    only routes where QE-owned test artifacts are written; it does **not**
    decide this fork.)
- **NO-GO** → back to `create-implementation-package` for rework, then re-run
  this skill

## Common mistakes

- **Running reviews in parallel.** Reviews run strictly in sequence — a fix
  for an earlier review can change content the later reviews would check.
- **Skipping shape conformance because "we just authored it".** Authors miss
  shape issues all the time; this is the independent gate.
- **Treating Minor findings as Critical.** Distinguish severity. Critical =
  blocks execution; Important = should be fixed but execution can proceed
  with documented risk; Minor = polish, optional.
- **Not re-validating after fixes.** A fix that changes content checked by an
  earlier passed review invalidates that earlier verdict — re-run affected
  reviews.
- **Letting `[NEEDS CLARIFICATION]` markers slide.** Any unresolved marker is
  an automatic NO-GO.
- **Forgetting requirements/design version stamping.** The package overview
  must record the versions of upstream packages it was authored against.
