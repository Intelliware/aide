# Review — Feasibility

## Purpose

Flag technically infeasible, high-risk, or disproportionately expensive requirements.

## When to Use

**Gate:** run this review after all five input artifacts are drafted. Do not begin architect handoff until this review has a PASS verdict — the architect must not start design work against requirements that have unresolved feasibility blockers.

> **Pay particular attention when:** the project involves significant technical complexity, novel integrations, or aggressive NFR targets; or any requirement was written by a stakeholder without input from engineering — feasibility gaps are most common when the "what" is defined without the "how" being considered at all.

## What This Reviews

Feasibility asks: **can these requirements actually be built within the constraints?** It does not re-evaluate the architectural approach — that is the architect's job. It identifies requirements that are structurally infeasible, technically implausible, or whose cost/risk is disproportionate to the stated value, so those conversations happen before design begins.

The BSA is not expected to have deep architectural expertise. This skill identifies signals that warrant escalation to engineering or architecture for a feasibility opinion — it is not about independently ruling requirements in or out.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` | Yes |
| Non-functional requirements | `docs/<feature>/requirements-package/requirements/nonfunctional-requirements.md` | Yes — NFR targets are the most common source of feasibility concerns |
| Business rules | `docs/<feature>/requirements-package/requirements/business-rules.md` | Yes — business rules can impose constraints that make requirements infeasible |
| Data requirements | `docs/<feature>/requirements-package/requirements/data-requirements.md` | Yes — data model decisions can make NFR targets implausible |
| Assumptions, constraints, and scope | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` | Yes — stated constraints can conflict with requirements |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. NFR TARGET PLAUSIBILITY                          │
│     Are the NFR targets internally consistent        │
│     and supported by the functional scope as         │
│     written? (Two sub-checks with different          │
│     resolution paths — see Check Details.)           │
├──────────────────────────────────────────────────────┤
│  2. FUNCTIONAL REQUIREMENT CONFLICTS                 │
│     Do any functional requirements or NFRs directly  │
│     contradict each other in a way that makes        │
│     simultaneous implementation impossible?          │
├──────────────────────────────────────────────────────┤
│  3. EFFORT DISPROPORTIONALITY                        │
│     Are any requirements likely to require           │
│     significantly more effort than their stated      │
│     priority justifies?                              │
├──────────────────────────────────────────────────────┤
│  4. CONSTRAINT, SCOPE, AND BUSINESS RULE CONFLICTS   │
│     Do any stated constraints, assumptions, scope    │
│     boundaries, or business rules make a requirement │
│     impossible to implement as written?              │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — NFR Target Plausibility

This check has two distinct sub-checks with different resolution paths. Run both.

#### 1a — NFR vs. NFR Contradictions

Two NFR targets that cannot both be satisfied simultaneously. Resolution is **BSA-owned** — one NFR must be revised without engineering escalation.

| Question | Red flag |
|----------|---------|
| Do any two NFR targets contradict each other at the stated operating conditions? | E.g., a throughput target and a latency target that are physically incompatible at the stated concurrency level |
| Does an availability target exceed what the weakest NFR-described dependency can support? *(Skip this question if the NFRs do not enumerate dependency availability SLAs — if so, raise a Low finding: "Dependency availability not enumerated in NFRs — availability target cannot be cross-checked.")* | A feature cannot be more available than its least available dependency as described in the NFRs |

All conflict findings from this sub-check are **High**. The skip-condition finding (if raised) is **Low** and does not trigger a FAIL.

#### 1b — NFR vs. Functional Scope Mismatches

An NFR target that implicitly requires a mechanism or capability that the functional requirements make no provision for. All findings from this sub-check, regardless of severity, are **escalated to engineering or architecture** — the BSA does not independently resolve them.

| Question | Severity |
|----------|---------|
| Does the NFR target implicitly require a capability (e.g., redundancy, failover, rate limiting) that the functional requirements make no provision for, and the absence is structurally obvious? | **High** |
| Does the NFR target implicitly require an unsupported capability, but whether the functional scope actually omits it requires engineering confirmation? | **Medium** |
| Is the NFR target expressed at a precision or magnitude suggesting it was not derived from any analysis (e.g., "sub-millisecond", "infinite scale" with no basis stated)? | **Medium** — engineering must confirm before the target is accepted |
| Does the functional scope make the NFR target structurally implausible? (E.g., a real-time consistency requirement across operations the functional spec describes as distributed and asynchronous) | **High** |

### Check 2 — Functional Requirement Conflicts

**Scope:** conflicts between functional requirements and NFRs only. Business rule and constraint conflicts are covered in Check 4 and must not be duplicated here.

Review the functional requirements and NFRs together for direct contradictions:

- Two functional requirements that cannot both be true simultaneously (e.g., "always send a notification" and "never send more than one notification per event")
- A functional requirement that directly contradicts an NFR (e.g., a requirement to log every field in a payload and an NFR prohibiting storage of that data class)

When a conflict is detected it is a **High** finding. Resolution is **BSA-owned** — one of the two requirements must be revised.

### Check 3 — Effort Disproportionality

**Precondition:** this check requires each functional requirement to carry a stated priority label (e.g., Must Have / Should Have / Could Have, or High / Medium / Low). If priority labels are absent, raise a **Low** finding ("Priority labels absent — effort disproportionality cannot be assessed") and skip the remaining sub-checks.

Without estimating exact hours, assess whether any requirement's apparent complexity is grossly disproportionate to its stated priority. Use the following textual signals to infer complexity from the requirement's own description:

- Names three or more distinct integration points or external systems
- Describes coordination across more than two system boundaries
- Implies a new data model with no existing analogue in the data requirements
- States a number of permutations, combinations, or states that grows with user-defined input (N users, N roles, N products)
- Uses language that implies replacing or rewriting an existing behaviour rather than extending it

| Signal | Severity |
|--------|---------|
| A "Low" or "Could Have" priority requirement that, based on its description, would require replacing or fundamentally restructuring a core system behaviour | **Medium** — this is a priority correction, not a feasibility escalation; flag for descoping or reprioritisation before design begins |
| A requirement whose complexity grows non-linearly with scope (e.g., supporting N combinations of states where N is unbounded and no cap is stated) | **Medium** — add an explicit scope cap or descope; must be addressed before implementation |
| A "Nice-to-have" requirement whose functional description implies a significant standalone workstream disproportionate to its stated value | **Medium** — flag for priority re-evaluation before sprint planning is locked |

### Check 4 — Constraint, Scope, and Business Rule Conflicts

**Scope:** the assumptions, constraints, and scope document and the business rules artifact, reviewed against the functional requirements, NFRs, and data requirements. If a conflicting pair includes an artifact already cited in a finding from Check 1 or 2, skip it — it is already captured.

- A stated constraint that directly prohibits something a requirement requires (e.g., a constraint ruling out schema changes while a data requirement adds new fields to an existing table)
- An assumption that, if it does not hold, makes a requirement impossible to satisfy
- A scope boundary that excludes a system or data set that a functional requirement depends on
- A business rule that, when enforced, makes a functional requirement impossible to satisfy simultaneously (e.g., a rule capping a value that a requirement must exceed in a valid use case)

When a conflict is detected it is a **High** finding. Resolution is **BSA-owned** — the requirement, the constraint, or the business rule must change.

## Output

A findings list in this format:

| Finding ID | Check | Requirement(s) | Description | Severity | Resolution Owner | Recommended Action |
|-----------|-------|---------------|-------------|---------|-----------------|-------------------|
| FEAS-001 | Check 1b | NFR-P-001 | 99.99% availability target stated with no mention of redundancy, failover, or DR in the functional spec — the target is implausible as written | High | Engineering | Engineering review required; functional spec must address the mechanism or the target must be revised |
| FEAS-002 | Check 2 | REQ-003, NFR-SEC-002 | REQ-003 requires full payload logging for audit; NFR-SEC-002 prohibits storage of PII — the payload described in REQ-003 contains PII fields | High | BSA | Resolve conflict — either scope the logging requirement to exclude PII fields or request a security exception |
| FEAS-003 | Check 4 | REQ-009, CONST-002 | CONST-002 states no new columns may be added to the orders table; REQ-009 requires storing a new status field per order — these directly conflict | High | BSA | Resolve conflict — either change the data approach (e.g., separate table) or request a constraint exception |
| FEAS-004 | Check 3 | REQ-011 | Low-priority requirement implies supporting all permutations of N user role combinations — complexity grows factorially with no scope bound stated | Medium | BSA | Add an explicit scope cap or descope; address before sprint planning |

**Severity:**
- **High** — feasibility blocker; the requirement cannot be implemented as specified without resolving the conflict
- **Medium** — feasibility risk that must be addressed before implementation begins, but does not independently block requirements sign-off
- **Low** — observation that warrants a conversation but does not block progress

## Verdict

- **PASS** — No High findings. Medium and Low findings documented, assigned, and accepted by the BSA. **Accepted** means the BSA has reviewed each Medium finding and either (a) recorded a follow-up action with an owner and due date, or (b) resolved it before sign-off.
- **FAIL** — One or more High findings remain unresolved.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Two NFR targets that are physically incompatible are accepted without review | Check 1a catches NFR-vs-NFR contradictions within the requirements artifacts |
| An NFR target is set without any mechanism in the functional spec to support it, discovered during architecture review | Check 1b surfaces NFR-vs-functional-scope mismatches before design begins |
| Two functional requirements or an FR and NFR directly contradict each other, undiscovered until implementation | Check 2 catches functional requirement conflicts before design begins |
| A low-priority or nice-to-have requirement implies disproportionate effort or unbounded complexity that nobody assessed before it was accepted into scope | Check 3 surfaces effort-priority mismatches before the sprint plan is locked |
| A stated constraint or business rule directly contradicts a requirement, undiscovered until implementation | Check 4 catches constraint and business-rule conflicts before design begins |

## Hand-off Gate

**Review 9 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-requirements-readiness.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, resolution owner, and recommended action.
2. Record the PASS or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**:
   - For BSA-owned findings (Checks 1a, 2, and 4): the BSA revises the affected requirements directly, then you re-run this review.
   - For engineering-escalated findings (Check 1b): the BSA escalates to engineering or architecture and receives a determination. Based on that determination, the BSA either (a) adds the missing functional requirement to close the capability gap, (b) revises the NFR target to a level engineering confirms is supportable by the existing functional scope, or (c) documents an accepted risk with explicit sign-off from the delivery lead. If Engineering determines that a Check 1b **Medium** finding represents a genuine capability gap, update that finding's severity to **High** and its recommended action accordingly, then re-evaluate the verdict — if it changes to FAIL, resolve under this step before proceeding. Do not proceed until the verdict is PASS.
5. If **PASS**: receive explicit BSA acknowledgement, then read `review-requirements-readiness.md`.

---

## Completion Criteria

- [ ] All 4 checks completed, including both sub-checks of Check 1
- [ ] Priority labels confirmed present in functional requirements before Check 3 runs; if absent, Low finding raised
- [ ] All feasibility concerns documented with severity, resolution owner, and recommended action
- [ ] Check 1b High and Medium findings escalated to engineering or architecture
- [ ] Check 1b findings resolved based on engineering's determination — missing functional requirement added, NFR target revised, or accepted risk documented with delivery lead sign-off
- [ ] Check 1a, 2, and 4 High findings resolved by the BSA through requirements revision
- [ ] Check 3 Medium findings reviewed by the BSA; each either has a recorded follow-up action with an owner and due date, or has been resolved before sign-off
- [ ] Verdict recorded
