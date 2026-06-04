---
slug: suite-purpose-and-scope
title: "Suite Purpose and Scope"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 110
---

## 1. Suite Purpose and Scope

The consumer view of the suite opens with a one-paragraph statement of what the suite proves and what it deliberately does not. This is the first thing the quality-stage skills read when grounding a feature against the existing suite — every downstream decision ("can we reuse a helper here?", "is this AC already covered?") starts from this scope statement.

Keep the language application-oriented, not stack-oriented. The reader is a quality-package author, an application developer planning a new test, or an agent answering a navigate-knowledge-base query. They care about which journeys the suite exercises and which it doesn't; the runner / framework details belong in the internal view.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}            # e.g. acme-checkout-e2e
status: {{status}}                    # active | maintenance | deprecated
owners: [{{owner-1}}, {{owner-2}}]
related-application-components:
  - {{kb-component-id-1}}
  - {{kb-component-id-2}}
---
```

**Suite purpose (one paragraph):**

{{purpose — e.g. "Proves that the merchant checkout journey is functional end-to-end across every supported payment method and region. Failing scenarios block deploys to staging and production."}}

**Scope — what this suite covers:**

| Journey / capability | Coverage depth | Tag |
|---|---|---|
| {{journey-1}} | Happy path + 3 failure paths | `{{tag-1}}` |
| {{journey-2}} | Happy path only | `{{tag-2}}` |
| {{journey-3}} | Happy + failure + edge | `{{tag-3}}` |

**Scope — what this suite does NOT cover (find these elsewhere):**

| Concern | Where it's covered instead | Owner |
|---|---|---|
| Unit tests | Application repos under `src/test/` | App teams |
| Load / performance | `{{perf-suite-link}}` | Performance team |
| Visual regression | `{{visual-suite-link}}` | Design-system QA |
| Security scanning (SAST / DAST) | `{{security-pipeline-link}}` | Security team |
| Accessibility audits | `{{a11y-suite-link}}` | A11y team |

**Critical-path declaration:** Scenarios tagged `@critical` are the suite's contract — these MUST pass for a deploy to proceed. The current list lives in the feature-inventory KB component.

**Cross-reference:** the internal view (Part A) under `docs/test-suite-internal/` carries the stack details, runner config, and maintenance procedures. This consumer view is the source of truth for *what* the suite proves; the internal view is the source of truth for *how*.

