# Example — create-quality-package

A worked example continuing the refund-processing feature from the design and
planning examples.

## Trigger

User: *"Implementation plan is GO. Build the quality package before we start coding."*

The orchestrator confirms `.framework-output/design/refund-processing-design.md`
(review = GO) and `.framework-output/implementation/` (review = GO, increments
INC-001..INC-006) exist, then invokes `create-quality-package`.

## Step 1 — Quality strategy

The skill drafted the strategy from the requirements NFRs and the
`compliance_regime = "pci-dss"` elicitation answer:

- Quality goals: zero Critical defects at release; refund correctness provable
  end-to-end; no PAN data in logs or test fixtures.
- Risk-based scope: partner clearing-house integration and money-movement paths
  are highest risk -> heaviest coverage; static content -> smoke only.
- Test levels: unit, integration (saga + partner API contract), system E2E,
  security (secret handling), performance (settlement batch).
- Release gates: line coverage >= 80% on changed files; 100% of money-movement
  acceptance criteria automated; zero open Critical/High defects; partner
  contract tests green.

## Step 2 — Test design

Each acceptance criterion became one or more concrete cases, recorded in
`traceability.md`:

| Test ID | Level | Traces to | INC |
|---|---|---|---|
| QT-01 | unit | AC-3 (partial refund math) | INC-002 |
| QT-07 | integration | AC-5 (saga compensation) | INC-004 |
| QT-12 | e2e | AC-1 (happy-path refund) | INC-005 |
| QT-15 | security | NFR-SEC-2 (no PAN in logs) | INC-003 |

INC-006 (admin read-only view) had no money-movement risk; a smoke-only
exception row was recorded and accepted by the user.

## Step 3 — Quality engineering + assembly

- Automation: Vitest 1.6 (unit/integration), Playwright 1.44 (E2E), Pact 12 for
  partner contracts — all pinned.
- CI gates: coverage threshold enforced on changed files; contract tests run on
  every PR; nightly performance run on the settlement batch.
- Test data: synthetic card tokens from the sandbox vault; no production PAN.
- Defect management: defects logged via `manage-bugs`, severity model recorded.

The skill assembled `refund-processing-quality.md`, wrote the per-section block
files, updated the change tracker, and handed off:

*"Quality package assembled (4 test levels, 18 cases, all increments mapped or
excepted). Ready to run review-quality-package?"*

## What it produced

```
.framework-output/quality/
└── refund-processing-quality.md

docs/refund-processing/quality-package/quality/
├── quality-strategy.md
├── test-approach.md
├── test-design.md
├── test-data-and-environments.md
├── automation-and-cicd.md
├── nonfunctional-quality.md
├── defect-management.md
├── quality-metrics-and-reporting.md
├── traceability.md
└── change-tracker.md
```
