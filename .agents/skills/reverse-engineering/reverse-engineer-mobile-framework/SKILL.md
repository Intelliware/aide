---
name: reverse-engineer-mobile-framework
description: "Use when the user asks to document a mobile framework or library, mobile SDK, Android AAR library, iOS pod / SPM package, or React Native npm module. Produces Part A (internal framework docs) and Part B (implementer docs for app developers). Do NOT use for mobile applications — use reverse-engineer-mobile-app instead."
---

# Reverse Engineer Mobile Framework Documentation

Drives a 5-stage extraction workflow that turns an existing mobile framework / library / SDK into two documentation parts: Part A (full internals for framework maintainers) and Part B (implementer docs for app developers integrating the framework).

## Overview

Mobile frameworks differ from mobile applications: they are consumed by other developers as a dependency rather than by end users via a device. They commonly support multiple platforms (Android AAR, iOS Pod / SPM, React Native npm) from one repository, and the distribution mechanism IS part of the public contract. This skill captures both the framework's internals (Part A) and the strict subset that app developers need (Part B).

## When to use

- User asks to document a mobile framework, mobile library, mobile SDK
- The codebase is published as a package (AAR, CocoaPod, SPM, npm) and consumed by other mobile apps
- User has been routed here by `analyze-repository` after mobile-framework classification

## When NOT to use

- The repo is a mobile application — use `reverse-engineer-mobile-app`
- The repo is a UI framework targeting web — use `reverse-engineer-ui-framework`
- The repo is a backend SDK consumed by server code — use `reverse-engineer-api-framework`

## Inputs

- Path to the mobile framework repository
- Source version being documented
- Reference: `references/elicitation-patterns/repo-scope-discovery.md` for scope-discovery elicitation
- Optional: existing implementer documentation, sample integration apps

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Framework maintainers | Full internals: architecture, build/publish pipeline, internal patterns | Stays in framework repo |
| Part B | App developers using the framework | Public API, integration guide, platform-specific usage, patterns | Knowledge base |

**Rule:** Part B is always a strict subset of Part A.

## Workflow

### Stage 1: Discovery and Inventory
- Identify platforms supported (Android/iOS/React Native)
- Inventory public classes, protocols/interfaces, configuration options, extension points
- Identify distribution mechanism (AAR, CocoaPod, SPM, npm)
- Run `steps/scaffold.md` to establish file structure for Part A and Part B BEFORE any content extraction

### Stage 2: Foundation
- Framework architecture, platform support matrix, public API surface, configuration

### Stage 3: Component-by-Component Extraction
- For each public API: methods, parameters, return types, platform-specific behavior
- Platform-specific code examples for each supported platform

### Stage 4: Integration, Patterns, Migration
- Integration guide per platform, common patterns, anti-patterns, testing utilities, migration guides

### Stage 5: Verification and Finalization
- Run `steps/verify.md` to execute the full extraction-verification gate
- Validate the Part B subset rule
- Log all changes using the `track-change` skill

## Key Rules

- **Document all supported platforms** — each may have different APIs or behavior
- **Distribution mechanism is critical** — consumers need to know how to add the dependency
- **Platform-specific code examples are mandatory** — Kotlin, Swift, and JavaScript examples where applicable
- **Part B is a strict subset of Part A** — never put something in Part B that isn't in Part A

## Compositions

- `templates/compositions/re-mobile-framework-internal.yaml` — Part A blocks
- `templates/compositions/re-mobile-framework-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output structure (mandatory)

Output is **bound to the composition's block list** — do not invent file names, do not rearrange order, do not consolidate multiple blocks into a single deep-dive.

**Part A (internal)** renders as a tree under `<source-repo-path>/docs/mobile-framework-internal/`, against `templates/compositions/re-mobile-framework-internal.yaml`.

**Part B (consumer)** renders as a tree under `<knowledge_base_path>/source-docs/<repo-slug>/mobile-framework-consumer/`, against `templates/compositions/re-mobile-framework-consumer.yaml`.

Per-block file naming (applies to BOTH parts): `<NN>-<bare-slug>.md`, where:
- `<NN>` is the 1-based, zero-padded position of the block in the **full** `order`-sorted block list (first block → `01`, second → `02`, …). The index is assigned over the complete list **before** decision-gating, so a gated-out block leaves a **numbering gap** — survivors keep their full-list index and are **not** renumbered contiguously (e.g. if the block at `03` is omitted, the next rendered file is still `04-…`, not `03-…`).
- `<bare-slug>` is the block slug with the `reverse-eng/mobile-framework/internal/` (or `…/consumer/`) prefix stripped.
- Block content shape comes from `templates/blocks/reverse-eng/mobile-framework/<part>/<bare-slug>.md`. Extracted source content fills the rendered block; the block's structural shape is preserved.
- A block whose `decision-gates: include-if:` evaluates false is **omitted entirely** — do not author an empty placeholder.

Side artifacts at the Part-A directory root:
- `extraction-status.md` — RE-pass tracking
- `CHANGE-TRACKER.md` — initialised from `templates/blocks/shared/change-log.md`

## Next skill

`build-knowledge-base` — aggregates Part B into the central KB index.

## Common mistakes

- Documenting one platform thoroughly and skimming the others
- Omitting distribution-mechanism details (AAR coordinates, Pod spec, SPM URL, npm name)
- Missing platform-specific code examples — consumers need at least one example per supported platform per public API
- Skipping the Part B ⊆ Part A subset check during verification
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
