---
slug: shared-utilities-catalogue
title: "Shared Utilities Catalogue"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
---

## 3. Shared Utilities Catalogue (consumer view)

The consumer-facing inventory of every reusable utility the suite exposes. This is the single most important block in the consumer view — it is what `create-quality-package`'s reuse-analysis pass and `execute-quality-increments`'s AI-Gate cross-check query before authoring any new helper. If a needed utility already lives here, the new scenario MUST reuse it.

Group by interaction type, same axes as the internal view, but expose only the public surface — signature, purpose, source path, and the example invocation. Internal-only helpers and deprecated entries are filtered out by the RE skill at Part-B generation time.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: shared-utilities
query-axes: [action, wait, assertion, data, navigation, network, fixture]
---
```

**How to query this catalogue from a quality-stage skill:**

```text
navigate-knowledge-base --profile=test-suite \
  --component-id={{suite-id}} \
  --sub-component=shared-utilities \
  --filter="group:action OR group:assertion" \
  --about="<feature scope>"
```

**Actions:**

| Name | Signature | Source | Example invocation | Purpose |
|---|---|---|---|---|
| `{{action-1}}` | `{{sig-1}}` | `{{path-1}}` | `{{example-1}}` | {{purpose-1}} |
| `{{action-2}}` | `{{sig-2}}` | `{{path-2}}` | `{{example-2}}` | {{purpose-2}} |

**Waits:**

| Name | Signature | Source | Example invocation | Purpose |
|---|---|---|---|---|
| `{{wait-1}}` | `{{sig-1}}` | `{{path-1}}` | `{{example-1}}` | {{purpose-1}} |

**Assertions:**

| Name | Signature | Source | Example invocation | Purpose |
|---|---|---|---|---|
| `{{assert-1}}` | `{{sig-1}}` | `{{path-1}}` | `{{example-1}}` | {{purpose-1}} |

**Data builders / factories:**

| Name | Signature | Source | Example invocation | Purpose |
|---|---|---|---|---|
| `{{builder-1}}` | `{{sig-1}}` | `{{path-1}}` | `{{example-1}}` | {{purpose-1}} |

**Navigation helpers:**

| Name | Signature | Source | Example invocation | Purpose |
|---|---|---|---|---|
| `{{nav-1}}` | `{{sig-1}}` | `{{path-1}}` | `{{example-1}}` | {{purpose-1}} |

**Network mocks / interceptors:**

| Name | Signature | Source | Example invocation | Purpose |
|---|---|---|---|---|
| `{{mock-1}}` | `{{sig-1}}` | `{{path-1}}` | `{{example-1}}` | {{purpose-1}} |

**Reuse rule (binding on consuming skills):**

When a quality-stage skill is about to author a new helper, it MUST first query this catalogue. If a match exists, the existing helper is used; if a near-match exists, an issue is opened against the suite maintainer to either generalise the existing helper or document why a new one is justified. New helpers in scenario / step-def files that bypass the catalogue are a review reject.

