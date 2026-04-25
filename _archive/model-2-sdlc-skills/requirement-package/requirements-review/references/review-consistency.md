# Review — Consistency

## Purpose

Detect contradictions and duplicate requirements within and across requirements artifacts.

## When to Use

- After `package-synthesis.md` has produced and written `docs/<feature>/requirements-package/requirements-package.md` — all review skills operate on the assembled package, not on individual artifacts
- When two or more artifacts have been written by different people or at different times
- Any time a requirement references another artifact — inconsistencies accumulate at cross-references
- Run after `review-completeness.md` (Review 2 of 10) returns a PASS verdict — consistency is only meaningful when checked against a complete, gap-free artifact set

## What This Reviews

Consistency asks: **do the artifacts contradict each other, or contradict themselves?** It also catches duplicates — requirements stated twice with subtle differences that will cause divergent implementation. It does not check whether the requirements are correct, complete, or measurable — only whether they agree with each other.

## Pre-conditions

All six inputs listed below must be approved for review before this review begins — meaning they have been authored, internally reviewed by the BSA, and are not pending substantive revision. If any input has not reached that state, stop: raise the gap with the BSA (see [Role Definition](#role-definition)) and do not proceed. Running this review against unapproved artifacts produces false negatives that will not be caught by a re-run.

## Inputs

All inputs are drawn from the assembled `docs/<feature>/requirements-package/requirements-package.md`.

| Input | Source | Required |
|-------|--------|----------|
| Functional spec (Section 5 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Acceptance criteria — embedded in Section 5 alongside each requirement, or as a separate artifact if one was produced | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Business rules catalog (Section 6 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Non-functional requirements (Section 9 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Data requirements document (Section 7 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |
| Assumptions, constraints & out of scope (Section 10 of the package) | `docs/<feature>/requirements-package/requirements-package.md` | Yes |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. WITHIN-ARTIFACT CONSISTENCY                      │
│     Same artifact, contradictory statements          │
├──────────────────────────────────────────────────────┤
│  2. CROSS-ARTIFACT CONSISTENCY                       │
│     Same concept named or described differently      │
│     across two or more artifacts                     │
├──────────────────────────────────────────────────────┤
│  3. SPEC ↔ AC CONSISTENCY                            │
│     AC tests something the spec does not require,    │
│     or spec requires something no AC tests           │
├──────────────────────────────────────────────────────┤
│  4. SPEC ↔ BUSINESS RULES CONSISTENCY                │
│     Rule implies different behavior from the spec    │
├──────────────────────────────────────────────────────┤
│  5. SPEC ↔ DATA REQUIREMENTS CONSISTENCY             │
│     Information type names, element names,           │
│     constraints differ between spec and data reqs    │
├──────────────────────────────────────────────────────┤
│  6. SPEC ↔ ASSUMPTIONS & CONSTRAINTS CONSISTENCY     │
│     A requirement violates a stated constraint       │
├──────────────────────────────────────────────────────┤
│  7. NFR ↔ ASSUMPTIONS & CONSTRAINTS CONSISTENCY      │
│     NFR target contradicts a constraint              │
├──────────────────────────────────────────────────────┤
│  8. DUPLICATE DETECTION                              │
│     Same requirement stated twice with differences   │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — Within-Artifact Consistency

**Method:** For each artifact, group its statements by subject area (e.g., notifications, authentication, payment). Within each group, compare every statement against every other statement in that group. Grouping bounds the comparison space and prevents contradictions from hiding across distant sections of a long document.

Flag any two statements within the same artifact that contradict each other.

Common examples:
- Functional spec: "The system sends a notification immediately" and later "Notifications are queued and sent within 5 minutes"
- Business rules: Two rules with overlapping conditions that produce different outcomes for the same input
- NFR: Two performance NFRs for the same endpoint with different targets

### Check 2 — Cross-Artifact Consistency

**Method:** Before comparing artifacts, build a term registry. Extract every named entity, state value, threshold, time duration, enumeration value, role name, process name, error code, status code, and unit of measure from all artifacts. Record each entry in a table with the following columns:

| Term | Category | Canonical value | Source artifacts | Variants found |
|------|----------|-----------------|-----------------|----------------|
| Customer | Information type name | Customer | Spec, AC | "Account" (Data req), "User" (Business rules) |

Any row with two or more distinct entries in the "Variants found" column is a candidate inconsistency for this check. The term registry is a working artifact — retain it in the findings document so downstream reviews (measurability, data-completeness) can reference it without rebuilding it from scratch.

The same concept appearing in multiple artifacts must be described identically. The following list covers the minimum categories to check — it is illustrative, not exhaustive:

- **Information type names:** does the spec call it "Customer" while the data requirements document calls it "Account" and the business rules call it "User"? One canonical name must be chosen.
- **State names:** order status values used in the spec, business rules, and data requirements document must be identical
- **Threshold values:** if a threshold appears in both the spec and an NFR, they must match
- **Time durations:** "within 5 minutes" in the spec vs "SLA of 10 minutes" in the NFR for the same behavior
- **Allowed values:** if the spec lists valid payment methods, the business rules and data requirements must use the identical set
- **Role names:** "Admin" vs "Administrator" vs "System Administrator" across artifacts
- **Process and workflow names:** the same process must carry the same name across all artifacts that reference it
- **Error codes and status codes:** codes named or numbered differently across the spec and business rules
- **Units of measure:** currency, file size, and time units must be consistent (e.g., "MB" in one artifact vs "MiB" in another)

### Check 3 — Spec ↔ AC Consistency

For each AC, identify the requirement(s) it is testing. When an AC tests behavior the spec does not describe, raise a consistency finding: the AC and the spec do not agree. Do not reclassify this as a completeness finding — the scope of this check is whether the two artifacts agree with each other.

For each requirement, find the AC(s) that test it. If the AC's pass condition describes a different behavior from the requirement, it is an inconsistency.

**Edge cases:**
- **AC tests multiple requirements simultaneously:** verify consistency against each referenced requirement separately and create a distinct finding for each inconsistency found.
- **AC tests implied behavior (behavior the spec never explicitly states):** flag as a consistency finding and note that the implied behavior requires explicit statement in the spec before the inconsistency can be resolved.

### Check 4 — Spec ↔ Business Rules Consistency

For each business rule, find the functional requirement it governs. Check two things:
1. Does the rule add conditions or restrictions the spec does not acknowledge? If so, it is an inconsistency.
2. Does the rule produce an outcome that differs from the spec's described outcome? If so, it is an inconsistency.

Common example: Spec says "Users can cancel orders." Business rule BR-030 says "Orders can only be cancelled if status is Pending." But the spec has no cancellation restriction — the rule added a condition the spec does not acknowledge.

**Resolution:** Any change — whether to the spec, to the rule, or to both — requires stakeholder confirmation before the affected artifact is updated. Do not update either side unilaterally.

**Additional case:** A business rule that has no corresponding functional requirement is also a finding — it describes behavior that is unspecified in the spec. Flag it as a **High** inconsistency with the rule ID and note that no governing requirement exists; the BSA must either create the missing requirement or remove the rule before this review can PASS.

### Check 5 — Spec ↔ Data Requirements Consistency

For every information type or element name used in the functional spec, find its entry in the data requirements document. Flag any of the following mismatches:

- **Name:** spec uses "order date," data requirements defines "date created"
- **Required/conditional status:** spec says "required," data requirements marks as conditional
- **Cardinality:** spec implies one-to-one, data requirements defines one-to-many
- **Relationship direction:** spec describes information type A owning information type B, data requirements defines B owning A
- **Constraint:** spec implies one constraint, data requirements references a different BR-xxx
- **Allowed values:** spec names a set of permitted values, data requirements references a different set

### Check 6 — Spec ↔ Assumptions & Constraints Consistency

**Format dependency:** This check assumes the assumptions, constraints & out of scope document labels each constraint as Hard or Soft. If the document uses a different format, map the constraints to an equivalent Hard/Soft classification before proceeding and record the mapping in the findings document.

For every **hard constraint** in the assumptions, constraints & out of scope document, verify that no functional requirement contradicts it. A requirement that would violate a hard constraint is a High inconsistency — the requirement cannot be correct as written.

For every **soft constraint**, verify whether any functional requirement conflicts with it. A conflict with a soft constraint is a Medium inconsistency — it requires stakeholder awareness and a documented decision on whether to relax the constraint or revise the requirement.

### Check 7 — NFR ↔ Assumptions & Constraints Consistency

**Method:** For each constraint in the assumptions, constraints & out of scope document, determine whether any NFR target is inconsistent with it. Compare both numeric targets and qualitative restrictions.

Cover all constraint types, including but not limited to:

- **Performance constraints:** maximum response time, throughput ceiling, batch processing window
- **Security constraints:** prohibited protocols, mandatory encryption standards, authentication requirements
- **Compliance constraints:** data residency rules, retention limits, regulatory prohibitions
- **Budget constraints:** if a constraint caps infrastructure spend, NFRs that imply costs beyond that cap are inconsistent
- **Operational constraints:** maintenance windows, on-call coverage limits, deployment frequency restrictions
- **Technology constraints:** approved technology list, prohibited third-party vendors

An NFR that permits behavior a hard constraint prohibits is a High inconsistency.

**Scope boundary:** An NFR that is silent where a hard constraint mandates a specific target is a completeness gap, not a consistency finding — silence is an absence, not a contradiction. Do not raise it here; it will be surfaced by `review-completeness.md` (Review 2).

### Check 8 — Duplicate Detection

**Method:** For specs with more than 30 requirements, group requirements by functional area before comparing. Within each group, compare every requirement against every other requirement in that group. Across groups, spot-check requirements that are explicitly cross-referenced or that share domain keywords.

Flag any two requirements that describe the same behavior, even if worded differently.

**Severity of duplicates:**
- **Identical wording:** Medium severity. Identically-worded requirements may carry different priority, ownership, or sprint assignment — those differences will produce coordination defects regardless of wording.
- **Same behavior, different wording:** High severity if the descriptions diverge in any measurable way (timing, actor, condition, or outcome).
- **Near-duplicate with subtle difference:** High severity — developers will implement one version, QE will test against the other.

## Output

A findings list in this format:

| Finding ID | Check | Artifacts Involved | Description | Severity | Recommended Resolution |
|-----------|-------|-------------------|-------------|---------|----------------------|
| CONS-001 | Cross-artifact | Spec REQ-003, NFR NFR-P-001 | Spec says "within 5 minutes," NFR says SLA of 10 minutes for the same notification delivery | High | Align to one value; confirm with stakeholder |
| CONS-002 | Spec ↔ Business rules | REQ-008, BR-030 | Business rule restricts cancellation to Pending status; spec does not mention this restriction | High | Confirm with stakeholder; add restriction to spec or update rule |
| CONS-003 | Duplicate | REQ-004, REQ-011 | Both describe email notification on order confirmation with different timing specifications | High | Merge into one requirement with a single timing value |

When more than two artifacts are involved in a single finding, list all artifact IDs separated by commas in the "Artifacts Involved" column.

**Severity:**
- **High** — contradiction that will produce defects or scope disputes if not resolved
- **Medium** — naming inconsistency or structural mismatch that will cause implementation divergence; example: "Admin" vs "Administrator" used across three artifacts for the same role
- **Low** — cosmetic naming difference with no functional impact; example: inconsistent capitalisation of a term that is otherwise unambiguous in context

## Verdict

- **PASS** — No High findings remain unresolved. Fewer than five Medium findings remain without a written BSA acceptance decision. All Low findings documented.
- **FAIL** — One or more High findings remain unresolved, OR five or more Medium findings remain without a written BSA acceptance decision.

**Threshold rationale:** With eight checks, a well-authored artifact set should produce zero to two Medium findings at most. A count of five or more Medium findings signals a pattern of systemic naming and structural carelessness — not isolated edge cases — and warrants artifact revision rather than acceptance. The BSA may raise this threshold to eight for specs with more than 100 requirements, provided the increase is recorded and justified in the findings document.

**Formal acceptance of a Medium finding** means the BSA has reviewed it and recorded a written decision — a comment in the findings document, an email, or equivalent — stating that the inconsistency is understood and the risk is accepted. Verbal acceptance does not qualify.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A contradiction within a single artifact (e.g., two NFRs for the same endpoint with different targets) goes unnoticed until implementation | Check 1 surfaces within-artifact contradictions before handoff |
| The same concept is named or described differently across two artifacts, causing developers to implement divergent versions of the same thing | Check 2 surfaces cross-artifact naming and value contradictions before anyone writes code |
| An AC validates behavior the spec never stated, causing QE to test a version of the feature that was never formally required | Check 3 surfaces AC-spec disagreements before test planning begins |
| A business rule adds a restriction the spec never acknowledged, discovered in UAT | Check 4 catches spec-rule conflicts at the requirements stage |
| Information type or element names differ between the spec and the data requirements document, causing inconsistent implementation | Check 5 catches naming and constraint mismatches before handoff |
| A requirement contradicts a stated constraint, discovered only when the constraint blocks delivery | Check 6 catches spec-constraint conflicts before implementation begins |
| A feature's NFR target contradicts a hard constraint | Check 7 catches constraint-NFR conflicts |
| The same requirement is stated twice with different owners or sprint assignments, causing duplicate or conflicting implementation | Check 8 catches duplicates before work is assigned |

## Role Definition

**BSA (Business Systems Analyst):** the accountable owner of the requirements artifacts for this engagement. The BSA has authority to accept findings, direct artifact updates, and grant sign-off on review verdicts. If this role does not exist on the project by this title, identify a named equivalent before this review begins and record that person's name in the findings document.

## Hand-off Gate

**Review 3 of 10 — strictly sequential.**

← Review 1: `review-scope.md` | Review 2: `review-completeness.md` | **Review 3: this skill** | Review 4: `review-measurability.md` →

A FAIL verdict must be fully resolved before reading the next review skill.

Before reading `review-measurability.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings and any Medium findings that contribute to the FAIL threshold, updates the affected artifacts, and you re-run this review. Do not proceed until the verdict is PASS.
5. If **PASS**: receive explicit written acknowledgement from the BSA — a recorded comment, email, or document sign-off. Verbal acknowledgement does not qualify. Then read `review-measurability.md`.

---

## Completion Criteria

- [ ] All 8 checks completed
- [ ] All findings documented with severity and recommended resolution
- [ ] All High findings resolved by artifact update confirmed by the BSA
- [ ] All Medium findings either resolved or each carrying a written BSA acceptance decision; total unresolved Medium findings below five
- [ ] Verdict recorded
- [ ] Written BSA acknowledgement received and recorded in the findings document
