# Example — create-design-package

A worked example for the brownfield-elaborate path, continuing the refund-processing feature from the requirements example.

## Trigger

User: *"Requirements review came back APPROVED with one conditional note on partner-API rate limits. Can you build the design package now?"*

The orchestrator confirms `docs/refund-processing/requirements-package/review/readiness-verdict.md` exists with verdict APPROVED, `default_flow = "brownfield"`, knowledge base reachable. Active composition resolves to `templates/compositions/greenfield-design-package.yaml` (the brownfield enhancement composition was offered but the user wanted full design rigor). Step 1 runs because the project is brownfield.

## Step 1 — Architecture-baseline discovery

The skill ran the three sub-steps:

1. `architecture-discovery` — read the codebase at the architectural level. Identified the api-orders / api-billing / web-portal split, the Spring Boot 3.2.1 stack, the PostgreSQL 15 / Redis 7 data layer, the rabbit-mq integration with the partner clearing house, and the existing IAM-role boundary between refund-operator and refund-admin. Wrote `raw-architectural-observations.md`.

2. `technical-debt-assessment` — categorized debt relative to refund-processing: must-fix = none; should-fix = the unpinned PartnerClearingHouseClient retry policy (currently exponential backoff with no cap); defer = the legacy XML payment confirmation endpoint (out of scope for refund). Wrote `technical-debt-assessment.md`.

3. `existing-architecture-assessment` — synthesized into `architecture-baseline.md` with C4 Level 1 (system context) and Level 2 (container) diagrams, integration map, security boundaries, and the conditional partner-API rate limit observation carried forward from the requirements review.

## Step 2 — Design assembly

Step 0 (scoping) determined which blocks apply for refund-processing:
- `design/frontend-design` → INCLUDED (refund-operator UI changes in the web-portal)
- `design/backend-design` → INCLUDED
- `design/api-design` → INCLUDED
- `design/database-design` → INCLUDED (refund_transaction table additions)
- `design/integration-design` → INCLUDED (partner clearing house)
- `design/workflow-business-rules-design` → INCLUDED (refund eligibility state machine)
- `design/dashboard-reporting-design` → SKIPPED (no new dashboards in scope)
- `design/ux-design` → INCLUDED (operator workflow updates)

The 11-step design assembly ran with the 7-Step per-file Workflow per block. Technology pinning: Spring Boot 3.2.1 (existing), PostgreSQL 15 (existing), new dependency `com.electricmind:partner-clearing-house-client:2.4.0`. Three ADRs authored: `adr/0007-refund-eligibility-state-machine.md`, `adr/0008-partner-rate-limit-token-bucket.md`, `adr/0009-refund-event-saga-vs-2pc.md` — all written to `../knowledge-base/adr/`.

## What it produced

```
.framework-output/design/refund-processing-design.md     # assembled package (~340KB)
docs/refund-processing/solutions-package/
├── discovery/
│   ├── raw-architectural-observations.md
│   ├── technical-debt-assessment.md
│   └── architecture-baseline.md
└── design/
    ├── 01-solution-overview.md
    ├── 02-technology-stack.md
    ├── 03-solution-architecture.md
    ├── 04-frontend-design.md
    ├── 05-backend-design.md
    ├── 06-api-design.md
    ├── 07-database-design.md
    ├── 08-security-design.md
    ├── 09-integration-design.md
    ├── 10-workflow-business-rules-design.md
    ├── 11-ux-design.md
    ├── 12-deployment-devops.md
    ├── 13-observability-operations.md
    ├── 14-testing-strategy.md
    ├── 15-non-functional-requirements-technical.md
    ├── change-tracker.md
    └── solution-package.md         # alias to the assembled package

../knowledge-base/adr/
├── 0007-refund-eligibility-state-machine.md
├── 0008-partner-rate-limit-token-bucket.md
└── 0009-refund-event-saga-vs-2pc.md
```

Handoff to `review-design-package` was clean. Two reviews ran (architecture, security-posture) and the readiness gate returned GO. Handoff to `create-implementation-package` followed.
