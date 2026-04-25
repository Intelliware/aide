---
slug: compatibility-strategy
title: "Compatibility Strategy"
applies-to: [re-mobile-framework-internal]
requires-decision-from: [code-reader, architect, ops]
optional: false
order-hint: 300
---

## 20. Compatibility Strategy

### 20.1 Dimensions of Compatibility

| Dimension | Concern |
|-----------|---------|
| OS version | iOS / iPadOS / Android API skew |
| Device class | Phone / tablet / foldable / chrome / mac (Designed for iPad) |
| Framework version | App-on-framework version mismatch tolerance |
| Module API level | Native modules vs. host framework version |
| Bundle ↔ binary | OTA bundle vs. shipped binary mismatch |
| Tooling version | Xcode / Gradle / Node / SDK skew |

### 20.2 Supported Window

| Platform | Minimum | Sunset Notice |
|----------|---------|---------------|
| iOS | `{{ios_min}}` (typ. last 3 major versions) | One major version ahead in changelog |
| Android | API `{{android_min}}` (typ. covers 95% of devices) | Same |

### 20.3 Migration Strategy

- **Breaking API change**: published in MAJOR release, with codemod + dual-shipped wrapper for one minor.
- **New default behaviour**: opt-in flag in MINOR; flips to default in next MAJOR.
- **Removal**: announced N+2 versions in advance, deprecation warning emitted from N+1.

### 20.4 Codemods

The framework ships codemods under `packages/codemods/` for every breaking change:

```bash
npx framework-codemod 3.0/migrate-router-api ./src
```

Codemods are AST-driven (jscodeshift / dart_codemod) and idempotent.

### 20.5 Bundle ↔ Binary Compatibility (OTA)

- Bundles are pinned to a `runtimeVersion` (see `release-channel-and-codepush-or-ota`).
- Native modules expose `frameworkApiLevel`; the engine rejects modules whose level exceeds the host's.
- Runtime mismatch surfaces a single, actionable error to the user ("App needs an update from the store").

### 20.6 OS Skew

- Feature detection over version detection: prefer `if (UNUserNotificationCenter.current().supportsContentExtensions)` over `if (#available(iOS 14, *))`.
- Per-OS branches must be co-located in a `compat/` namespace so audits can find them.

### 20.7 Forward Compatibility

- New permissions / APIs introduced by a future OS are absorbed via the `permissions-system` and `module-system` extension points without requiring app code changes.
- Engine-level features behind flags: easy to disable in older deployments.

### 20.8 Backwards-Compat Test Suite

- Matrix CI runs key sample apps against the **last 3 minor releases** of the framework.
- "Compatibility report" PR-comment summarises: { added APIs, deprecations, removals, behaviour changes }.

### 20.9 Where the Code Lives

```
{{repo}}/
├── packages/codemods/                  # breaking-change codemods
├── packages/compat/                    # OS-skew helpers
├── tools/compat-report/                # PR comment generator
└── docs/migration-guides/              # human-readable upgrade notes
```
