# Example — review-qe-package

## Scenario

The WIRES-POC QE package has been assembled with 3 scaffolding increments and 11 test case increments across `e2e/` and `integration/` categories. The user invokes `/review-qe-package`.

## Walkthrough

### Review 1 — Completeness

**Findings:**
- ✅ All 12 functional requirements (FR-ING.*, FR-VAL.*, FR-NRM.*, FR-ENR.*, FR-PUB.*, FR-ORD.*) traced by at least one test case.
- ✅ NFR-AVL.1 (resilience) traced by TC-WIRE-013 (broker restart).
- ⚠️ NFR-OBS.1 (observability) not covered by any QE test case — metrics emission is verified only in developer tests.
- ✅ Both E2E and Integration types represented.
- ✅ Negative scenarios present (missing fields, malformed JSON).

**Verdict:** PASS WITH OBSERVATIONS (NFR-OBS.1 gap noted; user may accept or add a test case).

### Review 2 — Consistency

**Findings:**
- ✅ Categorized structure (`e2e/`, `integration/`) matches declared organization.
- ✅ All TC IDs unique, sequential, follow `TC-WIRE-NNN` convention.
- ✅ All dependency references resolve.
- ✅ Status tracker lists all 14 increments.

**Verdict:** PASS

### Review 3 — Execution Readiness

**Findings:**
- ✅ `execution-strategy.md` covers local (IDE + real Kafka), lower (CI + containerized Kafka), upper (scheduled smoke suite).
- ✅ Prerequisites documented per environment.
- ✅ Tag-based filtering documented (`@smoke`, `@regression`, `@happy-path`, etc.).
- ✅ Artifact target paths consistent with embedding strategy (`src/test/java/com/wires/qe/`).

**Verdict:** PASS

### Review 4 — Readiness Verdict

- Reviews 1–3: PASS WITH OBSERVATIONS (1), PASS (2), PASS (3).
- Implementation package: all 8 increments `completed`.
- Requirements/design versions current.

**Verdict:** PASS WITH OBSERVATIONS — user accepts the NFR-OBS.1 observation.

### Output

```
qe-package/review/
├── review-completeness.md
├── review-consistency.md
├── review-execution-readiness.md
└── readiness-verdict.md          ← PASS WITH OBSERVATIONS
```

Handoff to `execute-qe-increments`.
