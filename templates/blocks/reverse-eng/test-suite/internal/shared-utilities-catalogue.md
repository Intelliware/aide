---
slug: shared-utilities-catalogue
title: "Shared Utilities Catalogue"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Shared Utilities Catalogue

Cataloguing the shared utility layer is the single biggest reuse lever a test suite has. Every action helper, wait helper, assertion helper, data builder, navigation helper, network mock, and fixture loader should appear here with a one-line purpose, its signature, and the file it lives in. New scenarios should be authored against these, not against the raw runner API.

Group by interaction type (action / wait / assertion / data / navigation / network / fixture) — the same axes the consuming quality-stage skills query via `navigate-knowledge-base --profile=test-suite`. The reuse-analysis step in `create-quality-package` walks this catalogue before authoring new helpers, so the catalogue's accuracy is what prevents duplicate utility growth.

### Suggested template content

**Catalogue conventions:**

- **Source-of-truth column:** the file path under the repo root.
- **Group column:** one of `action`, `wait`, `assertion`, `data`, `navigation`, `network`, `fixture` (matches the KB component query axes).
- **Visibility column:** `public` (consumable from any spec / step-def), `internal` (only used by other utilities), `deprecated` (do not call; replacement listed).

**Actions:**

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{action-1}}` | `{{sig-1}}` | action | `{{path-1}}` | public | {{purpose-1}} |
| `{{action-2}}` | `{{sig-2}}` | action | `{{path-2}}` | public | {{purpose-2}} |

**Waits:**

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{wait-1}}` | `{{sig-1}}` | wait | `{{path-1}}` | public | {{purpose-1}} |

**Assertions:**

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{assert-1}}` | `{{sig-1}}` | assertion | `{{path-1}}` | public | {{purpose-1}} |

**Data builders / factories:**

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{builder-1}}` | `{{sig-1}}` | data | `{{path-1}}` | public | {{purpose-1}} |

**Navigation helpers:**

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{nav-1}}` | `{{sig-1}}` | navigation | `{{path-1}}` | public | {{purpose-1}} |

**Network mocks / interceptors:**

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{mock-1}}` | `{{sig-1}}` | network | `{{path-1}}` | public | {{purpose-1}} |

**Fixture loaders:** (cross-reference the fixtures-and-test-data block for the data shapes themselves)

| Name | Signature | Group | Source | Visibility | Purpose |
|---|---|---|---|---|---|
| `{{loader-1}}` | `{{sig-1}}` | fixture | `{{path-1}}` | public | {{purpose-1}} |

**Deprecated / do-not-call:**

| Name | Replacement | Sunset commit / date |
|---|---|---|
| `{{old-1}}` | `{{replacement-1}}` | `{{sunset-1}}` |

**Authoring rule:** new specs / step-defs MUST consume these helpers — see `create-quality-package`'s reuse-analysis pass. Direct calls to the raw runner API in a scenario file are a code-review reject unless an exception is documented in `anti-patterns`.

