# Example — create-qe-package

## Scenario

A Kafka-based wire-transfer enrichment service has completed requirements, design, and implementation. The user invokes `/create-qe-package` to build out the QE test suite.

## Walkthrough

1. **Step 1 — Source & Scope:** User provides `source-docs/wires-documentation-complete.md`. Selects E2E Tests and Integration Tests.

2. **Step 2 — Topology:** Skill infers from design package:
   - mock payment-gateway → incoming-wires-topic → wires-service → outgoing-wires-topic → mock settlement-engine
   - Kafka broker is infrastructure, wires-service is in scope, payment-gateway and settlement-engine are mocked
   - Inputs: Kafka producer publishing to incoming topic (async)
   - Outputs: Kafka consumer reading from outgoing topic (async)

3. **Step 3 — Technologies:** Inferred from design: Cucumber 7.15.0, JUnit 5, Spring Kafka, Awaitility, Jackson. User confirms.

4. **Step 4 — Artifacts:** `.feature` files, `.java` step definitions, Cucumber runner class, `.csv` for Jira export. User adds `application-qe.yml`.

5. **Step 5 — Test Harness:** BDD test harness wraps full topology. Test producer simulates payment-gateway, test consumer simulates settlement-engine. Real wires-service under test.

6. **Step 6 — Embedding:** Cucumber runner embedded in existing Spring Boot project at `src/test/java/qe/`. Feature files at `src/test/resources/features/qe/`.

7. **Step 7 — Organization:** Categorized — `e2e`, `integration`.

8. **Step 8 — Execution:** Local via IDE + real Kafka; lower environments via CI pipeline with containerized Kafka; upper environments smoke-only via scheduled pipeline.

9. **Step 9 — Plan generation:** 8 test cases generated (TC-WIRE-001 through TC-WIRE-008), split across `e2e/` and `integration/` sub-folders.

## Output structure

```
qe-package/
├── qe-package.md
├── execution-strategy.md
├── change-tracker.md
└── plan/
    ├── qe-plan-overview.md
    ├── test-case-status.md
    ├── e2e/
    │   ├── TC-WIRE-001.md
    │   ├── TC-WIRE-002.md
    │   ├── TC-WIRE-003.md
    │   ├── TC-WIRE-004.md
    │   ├── TC-WIRE-005.md
    │   └── TC-WIRE-007.md
    └── integration/
        ├── TC-WIRE-006.md
        └── TC-WIRE-008.md
```
