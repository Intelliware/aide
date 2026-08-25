# Example — review-adversarial

End-to-end worked example showing the skill applied standalone to a requirements package.

## Setup

Project: `feat-2041-checkout-redesign`. Requirements package already assembled. User wants an adversarial pass before kicking off the design stage.

```
docs/
└── refund-delay-alerts/
    └── requirements-package/
        ├── requirements-package.md
        ├── requirements/
        │   ├── change-tracker.md
        │   └── completeness-tracker.md
        └── analysis/
            └── current-capability-baseline.md
```

## Invocation

```
review-adversarial \
  --target=docs/refund-delay-alerts/requirements-package/requirements-package.md \
  --stage=requirements
```

`--output-path` is omitted, so the skill defaults to:

```
_review/refund-delay-alerts-requirements-package/2026-04-29T13-42-00Z/review-adversarial.md
```

`--target-commit` is omitted, so the skill runs `git rev-parse --short HEAD` and records `a3f9c12`.

## What the skill reads

1. `requirements-package.md` (the canonical entry file)
2. Frontmatter detection: confirms `stage: requirements` matches the `--stage` flag
3. Sibling files (`change-tracker.md`, `current-capability-baseline.md`) as supporting evidence

## What the skill produces

```markdown
---
schema: aide-adversarial-findings@1
target_artifact: requirements-package
target_path: docs/refund-delay-alerts/requirements-package/requirements-package.md
target_commit: a3f9c12
produced_by: review-adversarial
produced_at: 2026-04-29T13:42:00Z
stage: requirements
severity_counts: { critical: 1, high: 2, medium: 3, low: 1 }
triage_counts:    { must-fix: 1, should-fix: 2, consider: 3, wont-fix: 1 }
worst_severity: critical
finding_ids: [ADV-001, ADV-002, ADV-003, ADV-004, ADV-005, ADV-006, ADV-007]
---

# Adversarial findings — Requirements Package refund-delay-alerts

## Triage summary

| ID | Severity | Category | Finding (one line) | Action |
|---|---|---|---|---|
| ADV-001 | critical | Weasel word | "performant under typical load" — neither term is defined | must-fix |
| ADV-002 | high | Hidden assumption | Mobile traffic share assumed but never stated | should-fix |
| ADV-003 | high | Missing stakeholder | Tax/finance team impacted by tax-calc requirement REQ-009 but not named | should-fix |
| ADV-004 | medium | Unsupported claim | "Industry-standard checkout flow" — no reference | consider |
| ADV-005 | medium | Good news only | Risk register lists 2 risks; competitor analysis lists none | consider |
| ADV-006 | medium | Scope ambiguity | "Phase 2 features" referenced but not enumerated | consider |
| ADV-007 | low | Weasel word | "Easy to use" in non-functional preamble | wont-fix |

## Critical findings (claim vs counter)

### ADV-001 · CRITICAL · Weasel word

> **Original claim** (requirements-package.md § 4.2, line 87)
> "REQ-014 — The checkout system must be performant under typical load."

> **Adversarial counter**
> "Performant" is unfalsifiable; "typical load" is undefined. Two reviewers can both PASS review-measurability against this and still ship a 30-second checkout under any load they later define as atypical. The acceptance criteria below REQ-014 reference "snappy" and "responsive" — both also unfalsifiable.

**Recommended fix:** P95 latency < 250ms at 500 concurrent checkouts; degrade gracefully at 1000 with explicit error UX. Tie acceptance criteria to those numbers.

## All findings

### ADV-001 · critical · Weasel word
- **Evidence:** requirements-package.md § 4.2, line 87 (REQ-014); also line 92 ("snappy"), line 94 ("responsive")
- **Risk:** untestable; will pass review-measurability vacuously
- **Recommendation:** P95 < 250ms at 500 concurrent users; explicit degrade behaviour > 1000

### ADV-002 · high · Hidden assumption
- **Evidence:** requirements-package.md § 2.3 — "support all current devices"
- **Risk:** mobile traffic share is load-bearing for downstream design choices (responsive vs. native shell); never stated, never verified
- **Recommendation:** add explicit "mobile traffic > X% — design must prioritize touch UX" or "mobile traffic < 10% — desktop-first acceptable"

### ADV-003 · high · Missing stakeholder
- **Evidence:** REQ-009 (tax calculation) at requirements-package.md § 4.5
- **Risk:** tax/finance team owns the rule engine REQ-009 will integrate with; not named anywhere in the package
- **Recommendation:** add to stakeholder list; flag for design-package review participation

### ADV-004 · medium · Unsupported claim
- **Evidence:** requirements-package.md § 1.2 — "follows industry-standard checkout flow"
- **Risk:** appeals to authority without citing one
- **Recommendation:** cite the standard (Baymard, Nielsen, internal precedent) or remove the claim

### ADV-005 · medium · Good news only
- **Evidence:** requirements-package.md § 6 (risk register)
- **Risk:** two listed risks both have "mitigation: monitor closely"; no failure-mode analysis; competitor risk section absent
- **Recommendation:** add at least one risk per major external dependency; require a measurable mitigation per high risk

### ADV-006 · medium · Scope ambiguity
- **Evidence:** requirements-package.md § 1.4 references "Phase 2 features" without listing them
- **Risk:** ambiguous out-of-scope items have historically caused scope creep in this team's prior packages (see retro for ACME-1893)
- **Recommendation:** enumerate Phase 2 explicitly OR remove the reference

### ADV-007 · low · Weasel word
- **Evidence:** requirements-package.md § 1.1 — "easy to use"
- **Risk:** preamble-only; not load-bearing
- **Recommendation:** keep if rephrased to "consistent with current checkout UX patterns"; otherwise drop
```

## What happens next

Standalone invocation: the user reads the findings file, decides which to address, and re-opens `create-requirements-package` to author fixes. The next `review-requirements-package` run will pick up the changes.

Wrapped invocation (the same skill, same lens, same output): the wrapper sub-review reads `worst_severity: critical` and emits a FAIL verdict for `review-adversarial-pass`, halting the gate sequence per `references/review-patterns/review-verdict-mapping.md`.

## How an empty findings case looks

If the same skill ran against a clean package and found nothing:

```markdown
---
schema: aide-adversarial-findings@1
target_artifact: requirements-package
target_path: docs/refund-delay-alerts/requirements-package/requirements-package.md
target_commit: a3f9c12
produced_by: review-adversarial
produced_at: 2026-04-29T13:42:00Z
stage: requirements
severity_counts: { critical: 0, high: 0, medium: 0, low: 0 }
triage_counts:    { must-fix: 0, should-fix: 0, consider: 0, wont-fix: 0 }
worst_severity: none
finding_ids: []
---

# Adversarial findings — Requirements Package refund-delay-alerts

No findings.
```

Wrappers consume this file the same way: `worst_severity: none` → PASS verdict.
