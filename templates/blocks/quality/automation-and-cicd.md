---
slug: automation-and-cicd
title: "Automation and CI/CD"
applies-to: [greenfield-quality-package]
requires-decision-from: [qa-engineer, tester]
optional: false
order-hint: 5
---

## 5. Automation and CI/CD

### 5.1 Automation stack (pinned)

Record the default test-artifact target before listing tools:

| Concern | Value |
|---|---|
| Default QE artifact repo | `[project.testing].qe_repo` value, or `code-repo fallback` when unset |
| Artifact root | Repo-relative root for generated feature/spec files, step definitions, fixtures, runners, reports, and exports |

Every tool and runner must have an explicit, pinned version — exactly as the
design stage pins the production stack. No "latest".

| Concern | Tool | Pinned version |
|---|---|---|
| Unit / integration | [e.g., Vitest] | [1.6.0] |
| E2E | [e.g., Playwright] | [1.44.0] |
| Contract | [e.g., Pact] | [12.1.0] |
| Coverage | [e.g., c8] | [9.1.0] |

### 5.2 CI/CD quality gates

Each gate maps to a release gate from the Quality Strategy section.

| CI gate | When it runs | Threshold | Maps to release gate |
|---|---|---|---|
| [Changed-file coverage] | [Every PR] | [>= 80%] | [Gate 1] |
| [Contract tests] | [Every PR] | [All green] | [Gate 3] |
| [Performance suite] | [Nightly] | [p95 <= target] | [Gate 4] |

### 5.3 Stability

State how flaky tests are detected and quarantined, and the maximum acceptable
flaky rate before a gate blocks merges.
