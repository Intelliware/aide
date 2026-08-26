---
name: reverse-engineer-ui-framework
description: "Use when the user asks to document a UI framework, component library, design system, or reusable UI components — for any underlying technology (e.g., React, Vue, Angular, Svelte, Solid, Lit, Qwik, Web Components, SwiftUI, Jetpack Compose). Produces Part A (full framework docs) and Part B (implementer docs for app developers using the library). Do NOT use for application repositories — use reverse-engineer-web-app instead."
---

# Reverse Engineer UI Framework Documentation

Drives a 5-stage extraction workflow that turns an existing UI framework / component library into two documentation parts: Part A (full internals for framework maintainers) and Part B (implementer docs for app developers consuming the library).

## Overview

UI frameworks differ from web apps: they are consumed by other developers as a dependency rather than by end users via a browser. Their value lives in their public component surface, design tokens, and composition philosophy. This skill captures both the framework's internals (Part A) and the strict subset that consumers need (Part B).

## When to use

- User asks to document a UI framework, component library, design system codebase
- The codebase publishes reusable UI components consumed by other apps
- User has been routed here by `analyze-repository` after UI-framework classification

## When NOT to use

- The repo is a single web application that uses third-party components — use `reverse-engineer-web-app`
- The repo is a backend framework — use `reverse-engineer-api-framework`
- The repo is a mobile UI library — use `reverse-engineer-mobile-framework`

## Inputs

- Path to the UI framework repository
- Source version being documented
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing implementer documentation, Storybook, design tokens

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Framework maintainers | Full internals, architecture, private APIs, build system | Stays in framework repo |
| Part B | App developers using the framework | Public API, components, services, patterns, recipes | Knowledge base |

**Rule:** Part B is always a strict subset of Part A.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Discovery and Inventory
- Inventory all components, services, directives, pipes, DI tokens
- Record source paths, public API surfaces, and dependencies
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Foundation
- Framework overview, architecture, configuration, theming, design tokens
- Shared types, interfaces, enums

### Stage 3: Component-by-Component Extraction
- For each component: read TS/JS source, template, styles, tests
- Document every @Input, @Output, prop, slot, method, content projection
- Verify defaults against actual property initializers, not assumptions

### Stage 4: Services, Directives, Patterns
- Services, directives, pipes, DI tokens
- Common patterns and recipes, anti-patterns
- Testing utilities for consumers

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
- Validate the Part B subset rule (every Part B item must exist in Part A)
- Log all changes using the `track-change` skill

## Key Rules

- **Part B is a strict subset of Part A** — never put something in Part B that isn't in Part A
- **Verify every @Input, @Output, prop, and method against source** — AI invents plausible but wrong defaults
- **Document one component at a time** — focused extraction prevents hallucination
- **Include the framework's philosophy** — consumers need to understand design intent, not just API surface

## Compositions

- `templates/compositions/re-ui-framework-internal.yaml` — Part A blocks
- `templates/compositions/re-ui-framework-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/ui-framework-internal/`, against `templates/compositions/re-ui-framework-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/ui-framework-consumer/`, against `templates/compositions/re-ui-framework-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/ui-framework/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/ui-framework/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

## Next skill

Depends on the close-out mode elected at the gate:

- **review** → `review-reverse-engineering-package` — the per-repo readiness gate.
  KB ingestion follows its APPROVED / CONDITIONAL verdict, not this skill's completion.
- **automated** → straight to KB ingestion once the mechanical gate returns GO. The
  UNVERIFIED list travels with the extraction; it is not cleared by ingestion.

Then, in either case:

`build-knowledge-base` — aggregates Part B into the central KB index.

## Common mistakes

- **Running `steps/verify.md` without asking.** The close-out gate is a user
  decision; picking the mode yourself reinstates the self-attested gate the
  routing pattern replaced.
- **Reporting a model-judgment check as PASS in `automated` mode.** Those items
  are UNVERIFIED. A GO with a non-empty UNVERIFIED list is the honest and
  expected outcome — it means well-formed, not attested as correct.
- **Issuing a GO/NO-GO in `review-evidence` mode.** The review skill owns the
  verdict there; two verdicts for one extraction is worse than one.
- Inventing default values for inputs/props instead of reading the property initializers
- Documenting framework internals in Part B and leaking abstraction
- Skipping the framework philosophy / design intent — consumers need to know "why this shape"
- Omitting content projection / slot documentation — critical for consumer composition
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
