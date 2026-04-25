---
name: reverse-engineer-mobile-framework
description: >
  Reverse engineer a mobile framework or library repository into structured documentation. Covers Android
  libraries (AAR), iOS frameworks (CocoaPods/SPM), and React Native packages (npm). Produces Part A
  (internal framework docs) and Part B (implementer docs for app developers). Use this skill whenever
  the user mentions documenting a mobile framework, mobile library, mobile SDK, Android AAR library,
  iOS pod/SPM package, or React Native npm module. Trigger for "document the mobile framework", "reverse
  engineer the mobile library", "extract mobile SDK docs". Do NOT use for mobile applications — use
  reverse-engineer-mobile-app instead.
---

# Reverse Engineer Mobile Framework Documentation

You are guiding the user through extracting documentation from an existing mobile framework/library.

## Before You Start — Load Context

1. `phases/canonical-reverse-engineering-shape.md` — Foundations
2. `phases/reverse-engineer-mobile-framework-phase.md` — Mobile Framework-specific process
3. `templates/mobile-framework-doc-template.md` — Output template
4. `../_shared/templates/change-tracker-template.md` — Change tracking

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | Framework maintainers | Full internals: architecture, build/publish pipeline, internal patterns | Stays in framework repo |
| **Part B** | App developers using the framework | Public API, integration guide, platform-specific usage, patterns | Knowledge repository |

**Rule:** Part B is always a strict subset of Part A.

## Workflow

### Phase 1: Discovery and Inventory
- Identify platforms supported (Android/iOS/React Native)
- Inventory public classes, protocols/interfaces, configuration options, extension points
- Identify distribution mechanism (AAR, CocoaPod, SPM, npm)

### Phase 2: Foundation
- Framework architecture, platform support matrix, public API surface, configuration

### Phase 3: Component-by-Component Extraction
- For each public API: methods, parameters, return types, platform-specific behavior
- Platform-specific code examples for each supported platform

### Phase 4: Integration, Patterns, Migration
- Integration guide per platform, common patterns, anti-patterns, testing utilities, migration guides

### Phase 5: Verification and Finalization

## Key Rules

- **Document all supported platforms** — each may have different APIs or behavior
- **Distribution mechanism is critical** — consumers need to know how to add the dependency
- **Platform-specific code examples are mandatory** — Kotlin, Swift, and JavaScript examples where applicable
- **Part B is a strict subset of Part A**
