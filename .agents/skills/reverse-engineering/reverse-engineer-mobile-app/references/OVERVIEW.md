# reverse-engineer-mobile-app — Overview

## Purpose

Extract structured documentation from an existing mobile application (Android, iOS, or React Native), producing two complementary parts: Part A (full internals for app developers) and Part B (overview & integration guide for other teams).

## Position in the flow

```
analyze-repository  ──▶  reverse-engineer-mobile-app  ──▶  build-knowledge-base
                              │
                              ├─ Part A → stays in source repo
                              └─ Part B → KB
```

## Canonical RE foundations

- **Guiding Principle:** "If you cannot point to the line of source code that proves a documented behavior, do not document it as fact."
- **Six AI Principles** apply (especially "Context is Critical" — platform conventions affect every screen).
- **7-Step Workflow** is the inner loop per extraction chunk.

## Documentation model — two parts

| Part | Audience | Content | Destination |
| --- | --- | --- | --- |
| Part A | Mobile developers, maintainers | Full internals: architecture, screens, navigation, state, API integration, platform specifics | Stays in app repo |
| Part B | Other teams, integrators | App purpose, features, APIs consumed, deep linking, deployment, team ownership | KB |

## Why mobile apps need platform-aware extraction

- **Android**: Activities/Fragments OR Compose; Manifest as integration contract; intent filters; broadcast receivers; services; RoomDB.
- **iOS**: ViewControllers OR SwiftUI scenes; Info.plist; URL schemes + Universal Links; CoreData; background modes.
- **React Native**: JS bridge or Hermes; Metro bundler; React Navigation; AsyncStorage; native modules.

The skill identifies the platform first (Stage 1) and then applies the platform-aware template. Mixed-platform RN apps document both sides.

## Extraction stages

1. **Discovery and Inventory** — platform identification, architecture pattern, screens, navigation graph, API integrations, local storage, push, permissions, deep links. Run `steps/scaffold.md`.
2. **Global Infrastructure** — architecture, navigation, state management, API service layer, authentication, error handling.
3. **Feature-by-Feature Extraction** — for each feature: screens + view models/presenters + API calls + local data + platform-specific behavior.
4. **Platform-Specific Concerns** — lifecycle, deep linking, push notifications, permissions, background processing, offline support.
5. **Verification and Finalization** — run `steps/verify.md`, finalize change-tracker.

## What to avoid

- Documenting screens without their navigation context
- Skipping platform-specific lifecycle behavior
- Inventing deep-link patterns without checking the manifest / entitlements
- Treating Part B as a feature list — it should also include deployment, deep-link integration, and team ownership

## Compositions

- `templates/compositions/re-mobile-app-internal.yaml` — Part A
- `templates/compositions/re-mobile-app-consumer.yaml` — Part B (validation pass will surface coverage gaps)

## Hand-off

After verification passes, hand off by name to `build-knowledge-base`.
