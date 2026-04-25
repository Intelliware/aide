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
- Run `steps/verify.md` to execute the full extraction-verification gate
- Log all changes using the `track-change` skill

## Key Rules

- **Identify the platform first** — Android, iOS, and React Native have very different patterns
- **Document the navigation graph completely** — screen-to-screen flows are critical
- **API integration patterns are essential** — how the app communicates with backend services
- **Platform-specific lifecycle matters** — background/foreground transitions, state preservation, deep-link handling

## Compositions

- `templates/compositions/re-mobile-app-internal.yaml` — Part A blocks
- `templates/compositions/re-mobile-app-consumer.yaml` — Part B blocks (validation pass will surface coverage gaps)

## Output

- Part A: `<repo>/docs/mobile-app-internal/` (stays in source repo)
- Part B: `<KB>/source-docs/<repo-slug>/mobile-app-consumer.md`
- `extraction-status.md` and `CHANGE-TRACKER.md` inside the source repo

## Next skill

`build-knowledge-base` — aggregates Part B into the central KB index.

## Common mistakes

- Skipping platform identification and assuming patterns from the wrong platform
- Documenting screens without their navigation context
- Omitting deep-link / universal-link handling — critical for integration teams
- Skipping background processing / lifecycle transitions
- Generating content during scaffolding — `steps/scaffold.md` produces structure-only
