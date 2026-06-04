---
slug: test-data-and-environments
title: "Test Data and Environments"
applies-to: [greenfield-quality-package]
requires-decision-from: [tester, qa-engineer]
optional: false
order-hint: 4
---

## 4. Test Data and Environments

### 4.1 Test data strategy

| Need | Source | Sensitivity | Provisioning / refresh |
|---|---|---|---|
| [e.g., Partner card tokens] | [Sandbox vault, synthetic] | [No production PAN] | [Generated per run; rotated nightly] |
| [e.g., Merchant fixtures] | [Seed script] | [Masked] | [Reset per suite] |

Rules: never use production secrets or real PII/PAN in fixtures; prefer
synthetic or masked data; make data setup deterministic and repeatable.

### 4.2 Environments

| Test level | Environment | Notes |
|---|---|---|
| Unit | [Local / CI runner] | [No external deps] |
| Integration | [Ephemeral / sandbox] | [Partner sandbox, test DB] |
| E2E | [Staging-like] | [Seeded data set] |
| Performance | [Dedicated perf env] | [Production-like sizing] |
