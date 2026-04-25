# Review — Measurability

## Purpose

Validate that requirements use measurable, quantifiable language — no vague terms like "fast", "user-friendly", or "scalable" without defined thresholds.

## When to Use

- After the functional spec, NFRs, acceptance criteria, and business rules are drafted
- Before architect handoff — unmeasurable NFRs cannot be designed against
- Before QE test planning — unmeasurable acceptance criteria cannot be tested
- Any time stakeholders use quality adjectives without numbers: "fast," "responsive," "secure," "easy to use," "highly available"

## What This Reviews

Measurability asks: **can we objectively determine whether this requirement is met?** A requirement is measurable if a person can evaluate it independently and reach the same pass/fail conclusion. A requirement is unmeasurable if two people can read it and reasonably disagree about whether it is satisfied.

Unmeasurable requirements are not just a quality problem — they are a delivery risk. They create disputes at sprint review, enable requirements to be declared "done" when they are not, and make regression testing impossible.

## The Vague Language Taxonomy

| Category | Examples | Fix pattern |
|----------|---------|------------|
| **Relative performance** | fast, quick, responsive, snappy, real-time, near-real-time | Replace with a number and context: "within 200ms worst-case response under normal load" |
| **Subjective quality** | user-friendly, intuitive, easy to use, simple, clean | Replace with a measurable behavior: "Task X is completable in ≤ 3 steps without training" |
| **Vague availability** | highly available, always on, minimal downtime | Replace with a percentage and period: "99.9% uptime measured monthly" |
| **Unquantified scale** | scalable, handles large volumes, grows with the business | Replace with a number: "must support 10,000 concurrent users" |
| **Approximate security** | secure, protected, encrypted | Replace with a named, verifiable standard: "encrypted at rest using AES-256; encrypted in transit using TLS 1.2 or higher." If the project mandates a specific organisational security baseline, name the document and version — do not write "the required organisational standard" |
| **Vague timing** | soon, promptly, within a reasonable time, as quickly as possible | Replace with a duration: "within 30 seconds" |
| **Conditional without threshold** | minimal impact, negligible overhead, no significant degradation | Replace with a tolerance: "response time must not increase by more than 50ms over the current measured baseline" |
| **Undefined "valid"** | valid input, correct format, appropriate value | Replace with explicit criteria: "must be a date in ISO 8601 format between 2000-01-01 and today" |
| **Comparative without baseline** | better than, faster than current, improved, enhanced | Replace with a baseline value and target: "response time reduced from the current measured baseline of 800ms to ≤ 200ms worst-case" |
| **Percentage without denominator** | 99% of requests must succeed, error rate under 1% | Replace with an explicit population: "99% of all HTTP requests within any 1-hour rolling window must return a 2xx or 3xx status" |
| **Undefined frequency** | regular backups, periodic reports, frequent syncs | Replace with an interval: "daily backups at 02:00 UTC; weekly reports generated every Monday at 06:00 UTC" |
| **Indefinite sufficiency** | sufficient capacity, adequate resources, enough storage | Replace with a numeric threshold: "storage must accommodate 12 months of transaction data at projected volume without exceeding 80% utilisation" |

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Functional spec | `docs/<feature>/requirements-package/requirements/functional-requirements.md` | Yes |
| Non-functional requirements | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` | Yes — highest density of measurability failures |
| Acceptance criteria | `docs/<feature>/requirements-package/requirements/functional-requirements.md` (embedded in each requirement) | Yes — pass conditions are the test of measurability |
| Business rules catalog | `docs/<feature>/requirements-package/requirements/business-rules.md` | Yes — rules with vague conditions are untestable |

> **Missing input guard:** If any required input listed above cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with this review because [artifact name] was not found at `[expected path]`. This input is required. Please ensure the artifact exists before running this review."*

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. FUNCTIONAL SPEC SCAN                             │
│     Flag every vague quality adjective or            │
│     unquantified performance claim                   │
├──────────────────────────────────────────────────────┤
│  2. NFR SCAN                                         │
│     Every NFR must have a numeric target with units  │
│     and a defined measurement method                 │
├──────────────────────────────────────────────────────┤
│  3. ACCEPTANCE CRITERIA SCAN                         │
│     Every pass condition must be evaluable           │
│     without judgment                                 │
├──────────────────────────────────────────────────────┤
│  4. BUSINESS RULE SCAN                               │
│     Every rule condition must use measurable         │
│     predicates — no "large," "excessive," "many"     │
├──────────────────────────────────────────────────────┤
│  5. MEASUREMENT METHOD VERIFICATION                  │
│     Every measurable target must have a stated       │
│     method for measuring it                          │
├──────────────────────────────────────────────────────┤
│  6. SMART QUALITY SCORING                            │
│     Score every functional requirement and NFR on    │
│     S and M dimensions; score FRs on all five        │
│     dimensions. Confirm holistic quality after       │
│     vague language fixes have been applied           │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — Functional Spec Scan

Read every requirement. Flag any sentence containing these trigger words or equivalent constructs:

**Performance triggers:** fast, quick, quickly, immediately, in real time, near-real-time, without delay, promptly, soon, as quickly as possible, minimal latency

**Quality triggers:** user-friendly, intuitive, easy, simple, clean, professional, seamless, smooth, natural

**Scale triggers:** scalable, handles large volumes, supports many users, grows with demand, high throughput

**Security triggers:** secure, protected, encrypted, safe (flag these and verify that a named, versioned standard is stated — not just "the required standard")

**Precision triggers:** accurate, correct, appropriate, valid, proper (without an explicit criterion)

**Threshold triggers:** minimal impact, negligible overhead, no significant degradation, minor effect (flag and verify a numeric tolerance is stated)

**Comparative triggers:** better than, faster than current, improved, enhanced, reduced (without a baseline and target value)

**Frequency triggers:** regular, periodic, frequent, occasional (without an interval)

**Sufficiency triggers:** sufficient, adequate, enough (without a numeric threshold)

**Percentage triggers:** any "%" or "percent" expression — verify that the denominator population and the measurement window are both stated explicitly

For each flagged item, determine whether the intent can be expressed as a number, a standard, or an observable pass/fail condition. If not, flag it for stakeholder clarification.

### Check 2 — NFR Scan

For every NFR, verify:

| Field | Required content | Fail example | Pass example |
|-------|-----------------|-------------|-------------|
| Target | Numeric value with units | "fast response" | "worst-case response ≤ 200ms" |
| Load profile | Concurrency or throughput conditions | (blank) | "under 1,000 concurrent users" |
| Measurement method | Named tool or method | "will be tested" | "measured via load test in staging" |
| Measurement environment | Where it is measured | (blank) | "staging environment with production-equivalent data volume" |

Any NFR missing any of these four fields is unmeasurable and cannot be designed against.

### Check 3 — Acceptance Criteria Scan

For every AC pass condition, ask: can an evaluator determine pass or fail without exercising judgment?

**Unmeasurable pass conditions:**
- "The system works correctly" — no objective evaluation possible
- "The user experience is good" — subjective
- "Performance is acceptable" — no threshold
- "The page loads quickly" — no threshold
- "Errors are handled gracefully" — undefined "gracefully"

**Measurable equivalents:**
- "Successful response containing the expected data fields" — objective
- "Task completion rate ≥ 95% in usability test with 5 participants" — objective
- "worst-case response ≤ 200ms over a 10-minute load test" — objective
- "Error response containing an 'errors' field with the field name and message" — objective

### Check 4 — Business Rule Scan

For every business rule, check that all conditions use measurable predicates:

**Unmeasurable rule conditions:**
- "IF the order is large THEN apply discount" — what is "large"?
- "IF user activity is excessive THEN throttle" — what is "excessive"?
- "IF the response time is slow THEN show a loading indicator" — what is "slow"?

**Measurable equivalents:**
- "IF order total > £500 THEN apply 10% discount"
- "IF user sends > 100 requests in 60 seconds THEN throttle access and return a rate-limit response"
- "IF response has not arrived within 2 seconds THEN show loading indicator"

### Check 5 — Measurement Method Verification

For every NFR and performance AC, verify that the measurement method is:
- Named specifically (not "will be tested")
- Executable (the tooling exists or is listed as a readiness requirement)
- Tied to a specific environment (not "production" if production testing is not acceptable)

If a measurement method requires tooling that doesn't exist, flag it as a readiness gap (should be in the gap register) rather than a measurability failure.

**Interaction with Check 2:** When Check 2 has already raised a finding against an NFR for a missing measurement method, and Check 5 determines that the absence is caused by tooling that does not yet exist, reclassify the Check 2 finding as a readiness gap rather than a measurability failure. Update the finding's recommended action to "add to gap register with a named owner and resolution date," and do not carry it forward as a measurability failure. One finding with the correct classification is sufficient — do not record both.

## Output

A findings list in this format:

| Finding ID | Check | Location | Vague Language | Resolution | Status | Severity |
|-----------|-------|---------|---------------|-----------|--------|---------|
| MEAS-001 | NFR scan | NFR-P-002 | "The page must load quickly" | "The page must load within 2 seconds (Lighthouse Time to Interactive metric) worst-case on a standard broadband connection, measured in staging using Lighthouse CI" | Replaced | High |
| MEAS-002 | Functional spec | REQ-006 | "The system must handle large order volumes" | Stakeholder input needed: "What is the maximum expected order volume per minute?" Cannot be resolved without a confirmed figure from the product owner | Open | High |
| MEAS-003 | Business rule | BR-015 | "IF user is inactive for a long time THEN log them out" | "IF user has had no interaction for > 30 minutes THEN invalidate their session" | Replaced | High |
| MEAS-004 | AC pass condition | AC-004.2 | "Pass: the export is complete quickly" | "Pass: the exported file is available for download within 5 minutes of the request" | Replaced | High |

**Status values:** Use "Replaced" when the resolution column contains the corrected requirement text. Use "Open" when stakeholder input is required before a replacement can be written — include the specific question that must be answered. Do not mix replacement text and open questions within the same cell; the status column makes the distinction unambiguous.

**Severity:** Measurability failures are High when the vague language appears in a normative requirement, NFR, AC pass condition, or business rule condition — anything that must be tested or designed against. Exceptions: a vague adjective appearing only in non-normative explanatory prose with no normative dependency on it may be recorded as Low; a vague qualifier in an explicitly lower-priority "should" requirement where the core testable behavior remains objective may be recorded as Medium. Apply these exceptions sparingly and record the justification in the findings row.

## Check 6 — SMART Quality Scoring

After checks 1–5 have identified and resolved vague language, apply SMART scoring to confirm overall requirement quality. Score every **functional requirement** on all five dimensions. Score every **NFR** on the Specific and Measurable dimensions only — NFRs do not carry journey stage or stakeholder origin metadata in the same form as functional requirements. All scoring uses a 1–5 scale.

| Criterion | Applies to | 5 — Excellent | 3 — Acceptable | 1 — Poor |
|-----------|-----------|-------------|---------------|---------|
| **Specific** | FRs and NFRs | Clear, unambiguous, single behavior or target | Mostly clear but could be tighter | Vague, ambiguous, or compound |
| **Measurable** | FRs and NFRs | Quantifiable metric, testable pass/fail | Partially measurable | No threshold, subjective |
| **Attainable** | FRs only | Achievable within stated constraints | Probably achievable, uncertain | Unrealistic or technically infeasible |
| **Relevant** | FRs only | Clearly traces to a documented stakeholder need | Connection exists but indirect | Orphaned — no clear stakeholder origin |
| **Time-bound** | FRs only | Delivery timing is defined or explicitly deferred with a stated reason | Timing implied but not stated | No indication of when the requirement must be satisfied |

**Note on Attainable dimension:** Scores on Attainable are a preliminary signal only. Feasibility is comprehensively assessed in `review-feasibility.md` (Review 9). A score of 1 here should trigger an early flag to the BSA, but closure requires that dedicated review — it cannot be resolved here.

**Scoring thresholds:**
- Any criterion scoring **< 3** → item is flagged for revision
- **< 10%** of scored items flagged → Pass
- **10–30%** flagged → Warning — FAIL verdict; address flagged items and re-run this check before proceeding
- **> 30%** flagged → Critical — FAIL verdict; the spec must be substantially revised before handoff

This check is run after checks 1–5 have been applied and their findings resolved. It is a quality confirmation, not a first-pass scan.

---

## Verdict

- **PASS** — All requirements, NFRs, ACs, and business rules use measurable, objective language. Checks 1–5 produce no unresolved findings. SMART check (Check 6) shows fewer than 10% of scored items flagged.
- **PASS WITH OBSERVATIONS** — No High findings from Checks 1–5 remain unresolved. SMART check shows fewer than 10% of scored items flagged. One or more Medium or Low findings remain open. BSA written acknowledgement of accepted risk for each open finding must be recorded in the findings document before handoff.
- **FAIL** — One or more High findings from Checks 1–5 remain unresolved; or SMART check (Check 6) shows 10% or more of scored items flagged (Warning or Critical band). The BSA must resolve all High findings; a Warning or Critical SMART result requires the flagged items to be revised and Check 6 re-run before the verdict is re-evaluated.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Sprint review ends in a debate about whether "fast enough" means the requirement is done | Every performance requirement has a threshold; there is nothing to debate |
| QE cannot write a load test because the NFR has no numeric target | Check 2 forces numeric targets with measurement methods before handoff |
| A business rule with "large" as a condition is implemented inconsistently across five developer interpretations | Check 4 forces explicit thresholds into every rule condition |
| An architect cannot design a caching strategy because there is no latency target to design against | Check 2 ensures every performance NFR has a target the architect can design to |
| A requirement passes individual word-level checks but is still too vague, unanchored to a stakeholder need, or has no defined delivery timing | SMART scoring in Check 6 catches holistic quality problems that word scanning misses |

## Hand-off Gate

**Review 4 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-testability.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS, PASS WITH OBSERVATIONS, or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings, updates the affected artifacts, and you re-run this review in full. Do not proceed until the verdict is PASS or PASS WITH OBSERVATIONS.
5. If **PASS WITH OBSERVATIONS**: obtain BSA written acknowledgement of accepted risk for each open Medium or Low finding, recorded as a note on the relevant finding row. Then read `review-testability.md`.
6. If **PASS**: receive explicit BSA acknowledgement, then read `review-testability.md`.

---

## Completion Criteria

- [ ] All 6 checks completed across all artifacts
- [ ] Every functional requirement uses only objective, measurable language
- [ ] Every NFR has a numeric target with units, a load profile, a measurement method, and a measurement environment
- [ ] Every AC pass condition is evaluable by an independent person without judgment
- [ ] Every business rule condition uses explicit, measurable predicates
- [ ] Every NFR and performance AC has a measurement method that is named, executable with available tooling, and tied to a specific environment; any tooling gap has been added to the gap register with a named owner and resolution date
- [ ] SMART scores calculated for all functional requirements (all five dimensions) and all NFRs (S and M dimensions); flagged items revised
- [ ] All findings documented with resolution text or explicit stakeholder clarification question; Status column populated as "Replaced" or "Open"
- [ ] Verdict recorded (PASS / PASS WITH OBSERVATIONS / FAIL)
- [ ] If PASS WITH OBSERVATIONS: BSA written acknowledgement recorded for each open finding
