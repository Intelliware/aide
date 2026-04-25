---
name: reverse-engineer-mobile-app
description: >
  Reverse engineer a mobile application repository into structured documentation. Covers Android (Kotlin/Java),
  iOS (Swift/Objective-C), and React Native. Produces Part A (internal app docs) and Part B (app overview
  & integration guide). Use this skill whenever the user mentions documenting a mobile app, Android app,
  iOS app, React Native app, or any mobile application repository. Trigger for "document the mobile app",
  "reverse engineer the Android app", "extract iOS app docs", "document the React Native application".
  Do NOT use for mobile frameworks/libraries — use reverse-engineer-mobile-framework instead.
---

# Reverse Engineer Mobile Application Documentation

You are guiding the user through extracting documentation from an existing mobile application.

## Before You Start — Load Context

1. `phases/canonical-reverse-engineering-shape.md` — Foundations
2. `phases/reverse-engineer-mobile-app-phase.md` — Mobile App-specific process
3. `templates/mobile-app-doc-template.md` — Output template
4. `../_shared/templates/change-tracker-template.md` — Change tracking

## Documentation Model

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| **Part A** | Mobile developers, maintainers | Full internals: architecture, screens, navigation, state, API integration, platform specifics | Stays in app repo |
| **Part B** | Other teams, integrators | App purpose, features, APIs consumed, deep linking, deployment, team ownership | Knowledge repository |

## Workflow

### Phase 1: Discovery and Inventory
- Identify platform (Android/iOS/React Native) and architecture pattern (MVVM, MVI, Clean Architecture)
- Inventory screens, navigation graph, API integrations, local storage, push notifications

### Phase 2: Global Infrastructure
- Architecture, navigation, state management, API service layer, authentication, error handling

### Phase 3: Feature-by-Feature Extraction
- For each feature: screens, view models/presenters, API calls, local data, platform-specific behavior

### Phase 4: Platform-Specific Concerns
- App lifecycle, deep linking, push notifications, permissions, background processing, offline support

### Phase 5: Verification and Finalization

## Key Rules

- **Identify the platform first** — Android, iOS, and React Native have very different patterns
- **Document the navigation graph completely** — screen-to-screen flows are critical
- **API integration patterns are essential** — how the app communicates with backend services
- **Platform-specific lifecycle matters** — background/foreground transitions, state preservation
