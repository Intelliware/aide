---
name: reverse-engineer-mobile-app
description: "Use when the user asks to document a mobile application, Android app, iOS app, React Native app, or any mobile application repository. Produces Part A (internal app docs) and Part B (app overview & integration guide). Do NOT use for mobile frameworks/libraries — use reverse-engineer-mobile-framework instead."
---

# Reverse Engineer Mobile Application Documentation

Drives a 5-stage extraction workflow that turns an existing mobile application codebase into two documentation parts: Part A (full internals for app developers) and Part B (overview & integration guide for other teams). Covers Android (Kotlin/Java), iOS (Swift/Objective-C), and React Native.

## Overview

Mobile apps span three distinct platforms with different lifecycle, navigation, and packaging patterns. This skill identifies the platform first, then applies platform-aware extraction. The output captures both developer-facing internals (Part A) and the integration-facing summary (Part B) consumed by backend teams, security teams, and the knowledge base.

## When to use

- User asks to document a mobile app, Android app, iOS app, React Native app
- The codebase is consumed by end users on mobile devices, not by other developers as a dependency
- User has been routed here by `analyze-repository` after mobile-app classification

## When NOT to use

- The repo is a mobile framework / library — use `reverse-engineer-mobile-framework`
- The repo is a web app with a mobile-responsive layout — use `reverse-engineer-web-app`
- The repo is a backend API consumed by a mobile app — use `reverse-engineer-api`

## Inputs

- Path to the mobile application repository
- Platform identification (Android / iOS / React Native / Flutter)
- Source version being documented
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing app documentation, app store listings, deployment runbooks

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Mobile developers, maintainers | Full internals: architecture, screens, navigation, state, API integration, platform specifics | Stays in app repo |
| Part B | Other teams, integrators | App purpose, features, APIs consumed, deep linking, deployment, team ownership | Knowledge base |

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

### Stage 1: Discovery and Inventory
- Identify platform (Android/iOS/React Native) and architecture pattern (MVVM, MVI, Clean Architecture, Redux)
- Inventory screens, navigation graph, API integrations, local storage, push notifications
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Global Infrastructure
- Architecture, navigation, state management, API service layer, authentication, error handling

### Stage 3: Feature-by-Feature Extraction
- For each feature: screens, view models/presenters, API calls, local data, platform-specific behavior

### Stage 4: Platform-Specific Concerns
- App lifecycle, deep linking, push notifications, permissions, background processing, offline support

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
- Log all changes using the `track-change` skill

## Key Rules

- **Identify the platform first** — Android, iOS, and React Native have very different patterns
- **Document the navigation graph completely** — screen-to-screen flows are critical
- **API integration patterns are essential** — how the app communicates with backend services
- **Platform-specific lifecycle matters** — background/foreground transitions, state preservation, deep-link handling

## Compositions

- `templates/compositions/re-mobile-app-internal.yaml` — Part A blocks
- `templates/compositions/re-mobile-app-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/mobile-app-internal/`, against `templates/compositions/re-mobile-app-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/mobile-app-consumer/`, against `templates/compositions/re-mobile-app-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/mobile-app/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/mobile-app/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
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
- Skipping platform identification and assuming patterns from the wrong platform
- Documenting screens without their navigation context
- Omitting deep-link / universal-link handling — critical for integration teams
- Skipping background processing / lifecycle transitions
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
