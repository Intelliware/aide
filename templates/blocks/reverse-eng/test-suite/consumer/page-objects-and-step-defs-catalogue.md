---
slug: page-objects-and-step-defs-catalogue
title: "Page Objects and Step Definitions Catalogue"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Page Objects and Step Definitions Catalogue (consumer view)

The reusable PO + step-def surface. A quality-stage skill authoring a new UI scenario MUST consume an existing page-object method if one matches the intent; authoring a new step-definition phrasing MUST first check whether a canonical equivalent already exists. Duplicate phrasings are the leading cause of test-maintenance debt; this catalogue is the prevention mechanism.

Only public, canonical entries appear here. Deprecated / duplicate / internal-only entries are filtered out by the RE skill at Part-B generation time; if a consumer encounters a deprecated method while reading the internal Part A, the canonical replacement is the one listed here.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: page-objects-and-step-defs
query-axes: [page-object, step-def-given, step-def-when, step-def-then]
---
```

**Page objects (UI surface):**

| Page object | Surface covered | Public methods | Source | Example invocation |
|---|---|---|---|---|
| `{{po-1}}` | {{surface-1 — e.g. "/checkout flow pages"}} | `{{methods-1}}` | `{{path-1}}` | `{{example-1}}` |
| `{{po-2}}` | {{surface-2}} | `{{methods-2}}` | `{{path-2}}` | `{{example-2}}` |

**Canonical step definitions — Given:**

| Phrasing | Parameters | Source | Reuse note |
|---|---|---|---|
| `Given {{phrasing-g1}}` | `{{params-g1}}` | `{{path-g1}}` | Canonical for "{{intent-g1}}" |
| `Given {{phrasing-g2}}` | `{{params-g2}}` | `{{path-g2}}` | Canonical for "{{intent-g2}}" |

**Canonical step definitions — When:**

| Phrasing | Parameters | Source | Reuse note |
|---|---|---|---|
| `When {{phrasing-w1}}` | `{{params-w1}}` | `{{path-w1}}` | Canonical for "{{intent-w1}}" |
| `When {{phrasing-w2}}` | `{{params-w2}}` | `{{path-w2}}` | Canonical for "{{intent-w2}}" |

**Canonical step definitions — Then:**

| Phrasing | Parameters | Source | Reuse note |
|---|---|---|---|
| `Then {{phrasing-t1}}` | `{{params-t1}}` | `{{path-t1}}` | Canonical for "{{intent-t1}}" |
| `Then {{phrasing-t2}}` | `{{params-t2}}` | `{{path-t2}}` | Canonical for "{{intent-t2}}" |

**Reuse rule (binding on consuming skills):**

When `create-quality-package` or `execute-quality-increments` is about to author a new BDD step or a new page-object method, it MUST:

1. Query this catalogue for an existing canonical phrasing / method.
2. If a match exists, REUSE it (matching parameter shape exactly).
3. If a near-match exists, propose an extension to the suite maintainer rather than authoring a parallel entry.
4. Only when no match or near-match exists does the skill author a new entry, AND it surfaces the addition in the same change so the catalogue is updated.

**Locator strategy reminder (binding on new POs):** prefer role-based locators → data-testid → CSS → XPath (last resort). See the internal view's page-objects-and-step-defs block for rationale.

