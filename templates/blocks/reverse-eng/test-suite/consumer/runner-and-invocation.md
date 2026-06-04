---
slug: runner-and-invocation
title: "Runner and Invocation"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 120
---

## 2. Runner and Invocation

A consumer of this suite — quality-package author, application developer, agent answering a navigate query — needs three pieces of runner information: what stack the suite runs on (so they don't propose tooling that won't integrate), the canonical command to invoke a subset (so they can verify their assumption before authoring), and the report location (so they can read past runs without spinning up the suite themselves). That's the entire scope of this block; deeper runner details live in the internal view.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: runner
---
```

**Stack TL;DR:**

| Layer | Pin | Notes |
|---|---|---|
| Test runner | `{{runner}}` | e.g. `Playwright Test 1.45`, `JUnit 5.10 + Cucumber 7.18`, `pytest 8.2` |
| Build tool | `{{build-tool}}` | e.g. `pnpm`, `Maven`, `Gradle`, `uv` |
| Language | `{{language}}` | e.g. `TypeScript`, `Java 21`, `Python 3.12` |

**Canonical invocations (consumer view):**

| Goal | Command | Notes |
|---|---|---|
| Run a single scenario by name | `{{by-name-cmd}}` | Use when verifying a specific scenario's coverage |
| Run by tag (e.g. `@smoke`) | `{{by-tag-cmd}}` | Use when scoping coverage by capability |
| Run a single feature / spec file | `{{by-file-cmd}}` | Use during authoring of an adjacent scenario |
| Show available tags | `{{show-tags-cmd}}` | Use during reuse-analysis to discover the vocabulary |

**Where reports land (most-recent run):**

| Report | Path |
|---|---|
| HTML report | `{{html-path}}` |
| JUnit XML | `{{junit-path}}` |
| JSON results | `{{json-path}}` |

**CI dashboard (cross-run):** `{{ci-dashboard-url}}` — the suite's authoritative pass-rate trend, owned by the QE team.

**How quality-stage skills use this:**

- `create-quality-package` cites the canonical command in its `automation-and-cicd` block so the package's CI gate matches the suite's actual invocation.
- `audit-quality-coverage` reads the JSON results path to compute coverage signal.
- `review-test-failures` reads the HTML report + traces path to triage failures.

