# Review — Architecture

## Purpose

Comprehensive adversarial review of the solution design package's architectural soundness. Evaluates the design through multiple quality-attribute lenses — structural integrity (component boundaries, coupling, cohesion, pattern adherence), scalability (bottleneck risks, capacity planning, load characteristics), resilience (fault tolerance, failure handling, graceful degradation, recovery), and maintainability (cognitive complexity, extensibility, team autonomy, documentation). Uses the adversarial review technique: the reviewer must find issues — zero findings triggers re-analysis. Consumes the assembled solution-package.md and validates it against the requirements package and architecture baseline. This is the first review skill and runs before review-security-posture.

## What This Produces

A structured findings report that identifies architectural issues in the solution design package before it reaches implementation. The report categorizes findings by severity (CRITICAL / HIGH / MEDIUM / LOW), maps each finding to the design section it affects, and provides actionable recommendations.

This review operates on the **assembled solution design package** (`docs/<feature>/solutions-package/solution-package.md`) — not on individual design sections in isolation. The value of this review is the cross-section perspective: catching issues that arise when individually reasonable design decisions interact.

**What this review covers:**

| Quality Attribute | What the Review Checks |
|-------------------|----------------------|
| **Structural integrity** | Component boundaries, coupling between components, cohesion within components, adherence to stated architectural patterns, consistency of communication patterns |
| **Scalability** | Bottleneck risks under load, capacity planning gaps, horizontal vs. vertical scaling assumptions, data growth implications, stateful component risks |
| **Resilience** | Fault tolerance for each dependency, failure propagation paths, graceful degradation design, retry/timeout/circuit breaker coverage, single points of failure, recovery procedures |
| **Maintainability** | Cognitive complexity of the design, extensibility for likely future changes, team autonomy (can teams work on components independently?), boundary clarity, naming consistency |
| **Coherence** | Do all design decisions work together without contradiction? Are technology choices compatible? Do patterns align across sections? |
| **Requirements coverage** | Does every requirement have architectural support? Are there design decisions without a traced requirement? |
| **Gap analysis** | What is missing? What was assumed but not stated? What edge cases are unaddressed? |

**What this review does NOT cover:**

| Concern | Where It Is Reviewed |
|---------|---------------------|
| Security-specific issues (auth flows, RBAC, data protection, threat model, compliance) | `review-security-posture` |
| Package completeness, cross-section alignment, handoff readiness | `review-solution-readiness` |
| Individual test cases or code quality | Implementation phase |

## When to Use

- Always — every solution design package receives an architecture review
- Runs after the solution package is assembled (Step 15 of the design workflow) and the user has confirmed the assembled package
- Runs before `review-security-posture`

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Assembled solution design package | `docs/<feature>/solutions-package/solution-package.md` | Yes |
| Requirements package | `docs/<feature>/requirements-package/requirements-package.md` — functional requirements, NFRs, user journeys, business rules, permissions-access-control | Yes |
| Requirements change tracker | `docs/<feature>/requirements-package/requirements/change-tracker.md` — Package Version Log and Version Diff Summary | Yes |
| Architecture baseline | `docs/<feature>/solutions-package/discovery/architecture-baseline.md` — existing component architecture, tech stack, integration points, quality attributes | If discovery ran |

> **Missing input guard:** If any required input cannot be found at its documented path, halt the review and inform the user: *"I cannot proceed with the architecture review because [artifact name] was not found at `[expected path]`. Please ensure the artifact exists before running this review."*

> **Version staleness check:** Before starting the review, compare the requirements package version recorded in the solution overview (Section 1) against the current version in the change tracker's Package Version Log. If the solution was designed against an older version, flag this as a HIGH finding: *"The solution design was produced against requirements package [old version], but the current requirements package is [new version]. The following requirements changed: [list from Version Diff Summary]. Design sections that may be stale: [affected sections]."* This finding must be resolved (design sections updated) before the review can return PASS.

## Adversarial Review Technique

This review uses the adversarial approach: **the reviewer must find issues**. The purpose is to force genuine analysis rather than a cursory pass that rubber-stamps the design.

**Rules:**
1. You must find issues. Zero findings is not an acceptable outcome — re-analyze or explain with specific evidence why no issues exist.
2. Adopt a skeptical stance — assume problems exist and look for them.
3. Look for what is **missing**, not just what is **wrong**. "What's not here?" is as important as "what's broken?"
4. Findings must be specific and actionable — not vague concerns.
5. Every finding must reference the specific design section(s) it affects.
6. False positives are expected — the user decides what is real and what is noise. Err on the side of flagging rather than missing.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE REVIEW — INTERNAL SEQUENCE                         │
├──────────────────────────────────────────────────────────────────┤
│  1. LOAD — Read solution package + requirements + baseline       │
├──────────────────────────────────────────────────────────────────┤
│  2. STRUCTURAL INTEGRITY — Evaluate component architecture       │
│     Boundaries, coupling, cohesion, pattern adherence            │
├──────────────────────────────────────────────────────────────────┤
│  3. COHERENCE — Check cross-section consistency                  │
│     Decision compatibility, pattern consistency, structure align  │
├──────────────────────────────────────────────────────────────────┤
│  4. SCALABILITY — Evaluate under-load behavior                   │
│     Bottlenecks, capacity, data growth, stateful risks           │
├──────────────────────────────────────────────────────────────────┤
│  5. RESILIENCE — Evaluate failure handling                        │
│     Fault tolerance, failure propagation, degradation, SPOFs     │
├──────────────────────────────────────────────────────────────────┤
│  6. MAINTAINABILITY — Evaluate long-term health                  │
│     Complexity, extensibility, team autonomy, boundary clarity   │
├──────────────────────────────────────────────────────────────────┤
│  7. REQUIREMENTS COVERAGE — Validate traceability                │
│     Every requirement has architectural support; no orphan design │
├──────────────────────────────────────────────────────────────────┤
│  8. GAP ANALYSIS — Identify what is missing                      │
│     Unstated assumptions, unaddressed edge cases, missing pieces │
├──────────────────────────────────────────────────────────────────┤
│  9. TRIAGE — Classify and prioritize findings                    │
│     Assign severity, map to sections, recommend fixes            │
├──────────────────────────────────────────────────────────────────┤
│  10. PRESENT — Deliver findings report for user review            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Load

Read the assembled solution design package, the requirements package, and the architecture baseline (if it exists).

Build a mental model of:
- The component topology — what communicates with what, and how
- The data flow — how data moves through the system from user action to persistence and back
- The technology choices — what frameworks, databases, message brokers, and infrastructure are in use
- The requirements — what the system must do (functional) and how well it must do it (NFRs)

### Step 2 — Structural Integrity

Evaluate the component architecture for soundness:

| Check | What to Look For |
|-------|-----------------|
| **Component boundaries** | Are boundaries drawn at natural domain seams? Do components have a single, clear responsibility? Are there components that do too much (god components)? |
| **Coupling** | How many components depend on each other? Are there circular dependencies? Would changing component A force changes in components B, C, and D? Are components coupled through shared databases, shared state, or shared types? |
| **Cohesion** | Does each component contain functionality that belongs together? Are there functions or data that would be more natural in a different component? |
| **Pattern adherence** | Does the design consistently follow the architectural patterns it declares (e.g., layered architecture, hexagonal, event-driven)? Are there sections that violate the declared patterns? |
| **Communication patterns** | Are synchronous and asynchronous patterns used appropriately? Are there synchronous call chains that should be asynchronous? Are message contracts well-defined? |
| **Data ownership** | Does each data entity have a single owning component? Are there entities shared across components without clear ownership? |

### Step 3 — Coherence

Check that design decisions across all sections work together without contradiction:

| Check | What to Look For |
|-------|-----------------|
| **Decision compatibility** | Do technology choices work together? Are library/framework versions compatible? Do selected tools integrate with each other? |
| **Pattern consistency** | Are naming conventions consistent across sections? Do error handling patterns match between API, backend, and integration sections? Do logging patterns from observability match the structured logging in backend design? |
| **Cross-section alignment** | Does the API design expose what the frontend needs? Does the backend implement what the API contract promises? Does the data model support the queries the backend needs? Do deployment environments match what observability expects? |
| **Contradictions** | Are there cases where Section A assumes X but Section B assumes Y? (e.g., API design says "synchronous response" but backend design says "async processing with webhook callback") |

### Step 4 — Scalability

Evaluate whether the design can handle expected and peak loads:

| Check | What to Look For |
|-------|-----------------|
| **Bottleneck risks** | Which component is the narrowest point under load? Is there a single database that all services hit? Are there sequential processing steps that cannot be parallelized? |
| **Stateful components** | Which components hold state? Can stateful components scale horizontally, or does state prevent it? Are sessions sticky? Is there a single-writer bottleneck? |
| **Data growth** | How does the data model handle growth over time? Are there tables that will grow unboundedly? Are there missing archival or partitioning strategies for high-volume data? |
| **Capacity planning gaps** | Do the NFRs specify load targets? Does the design address how those targets are met? Are there components where the scaling strategy is "hope it's fast enough"? |
| **Connection pooling** | Are database and external service connections pooled appropriately? Under peak load, will connection pools be exhausted? |
| **Caching** | Are frequently accessed, rarely changed data sets cached? Is the cache invalidation strategy defined? Are there cache stampede risks? |

### Step 5 — Resilience

Evaluate how the system handles failures:

| Check | What to Look For |
|-------|-----------------|
| **Single points of failure** | Is there a component whose failure brings down the entire system? Are there dependencies without fallback behavior? |
| **Failure propagation** | If an external service goes down, does the failure cascade through the system? Are there circuit breakers at integration boundaries? |
| **Retry and timeout** | Do all external calls have timeouts configured? Are retry strategies defined (exponential backoff, jitter)? Are retries idempotent? |
| **Graceful degradation** | When a non-critical dependency fails, does the feature degrade gracefully or crash entirely? Is there a degraded-mode experience defined? |
| **Data consistency under failure** | If a multi-step operation fails partway through, is the data left in a consistent state? Are there compensating transactions or saga patterns where needed? |
| **Recovery procedures** | Are rollback procedures defined for deployments? Can the system self-heal, or does it require manual intervention? |

### Step 6 — Maintainability

Evaluate the design's long-term health:

| Check | What to Look For |
|-------|-----------------|
| **Cognitive complexity** | Can a new developer understand the system by reading the design? Are there overly clever patterns that sacrifice readability for elegance? |
| **Extensibility** | For likely future changes (adjacent features, new integrations, new user types), how much of the design would need to change? Are extension points identified? |
| **Team autonomy** | Can different teams work on different components without blocking each other? Are component boundaries aligned with team boundaries? |
| **Dependency management** | Are third-party dependencies well-isolated? Could a critical dependency be replaced without rewriting large portions of the system? |
| **Naming consistency** | Are entities, endpoints, events, and metrics named consistently across all sections? Does the same concept have different names in different sections? |

### Step 7 — Requirements Coverage

Validate that the design traces back to requirements and vice versa:

| Check | What to Look For |
|-------|-----------------|
| **Uncovered requirements** | Are there functional requirements with no corresponding design? Are there NFRs (performance, availability, security) with no architectural support? |
| **Orphan design decisions** | Are there design elements that don't trace to any requirement? Were they confirmed by the user, or did the AI invent them? |
| **User journey coverage** | Can every user journey from the requirements be traced through the design — from frontend interaction through API, backend, data layer, and back? |
| **NFR architectural support** | For each NFR, is there a specific design decision or pattern that ensures it is met? (Not "we'll optimize later" — concrete architectural support.) |

### Step 8 — Gap Analysis

Identify what is missing from the design:

| Check | What to Look For |
|-------|-----------------|
| **Unstated assumptions** | What does the design assume but not document? (e.g., "users will only access from a single device," "data volume will stay below 1M rows") |
| **Unaddressed edge cases** | What happens when the system receives unexpected input? What happens at boundary conditions (empty lists, maximum values, concurrent updates)? |
| **Missing error scenarios** | Are all error paths designed, or only the happy path? What happens when validation fails, when a dependency is unavailable, when data is inconsistent? |
| **Migration path gaps** | For brownfield projects: how does the system transition from the current state to the designed state? Are there intermediate states that need explicit design? |
| **Operational gaps** | Who operates this system? Are runbooks referenced? Is there a clear escalation path when alerts fire? |

### Step 9 — Triage

Classify each finding by severity:

| Severity | Definition | Action Required |
|----------|-----------|----------------|
| **CRITICAL** | Architectural flaw that would cause system failure, data loss, or inability to meet a core requirement. Must be fixed before implementation. | Block — must resolve before proceeding |
| **HIGH** | Significant risk that could cause production incidents, performance degradation, or difficulty meeting NFRs. Should be fixed before implementation. | Strong recommendation to fix |
| **MEDIUM** | Design weakness that increases maintenance burden, limits future extensibility, or creates tech debt. Can proceed but should be addressed. | Fix if practical |
| **LOW** | Minor improvement opportunity, naming inconsistency, or documentation gap. | Note for future consideration |

For each finding, provide:
1. **Severity** — CRITICAL / HIGH / MEDIUM / LOW
2. **Section(s)** — which design section(s) are affected
3. **Issue** — specific, concrete description of the problem
4. **Impact** — what happens if this is not addressed
5. **Recommendation** — actionable fix

### Step 10 — Present

Present the findings report to the user.

---

## Output Structure

```
## Architecture Review Findings

### Summary

| Severity | Count |
|----------|-------|
| CRITICAL | N     |
| HIGH     | N     |
| MEDIUM   | N     |
| LOW      | N     |

### Verdict

[BLOCK / WARNING / PASS]
- BLOCK: CRITICAL findings exist — must resolve before proceeding to implementation
- WARNING: HIGH findings exist — recommended to resolve, can proceed with acknowledged risk
- PASS: No CRITICAL or HIGH findings — proceed to next review

### Findings

#### CRITICAL

[CRITICAL-1] Title
- **Section(s):** Section N — [name]
- **Issue:** [specific description]
- **Impact:** [what happens if not addressed]
- **Recommendation:** [actionable fix]

#### HIGH

[HIGH-1] Title
...

#### MEDIUM

[MEDIUM-1] Title
...

#### LOW

[LOW-1] Title
...

### Requirements Coverage Summary

| Requirement | Architecturally Supported | Design Section | Gap |
|-------------|--------------------------|---------------|-----|
| FR-01       | Yes / Partial / No        | Section N     | [description if partial/no] |
| NFR-01      | Yes / Partial / No        | Section N     | [description if partial/no] |

### Reviewed Perspectives

- [x] Structural integrity — component boundaries, coupling, cohesion, patterns
- [x] Coherence — cross-section consistency, decision compatibility
- [x] Scalability — bottleneck risks, capacity, data growth, stateful components
- [x] Resilience — fault tolerance, failure propagation, degradation, SPOFs
- [x] Maintainability — complexity, extensibility, team autonomy, naming
- [x] Requirements coverage — functional and NFR traceability
- [x] Gap analysis — assumptions, edge cases, missing scenarios
```

---

## Hand-off Gate

Before proceeding to `review-security-posture`:

1. Present the findings report in full.
2. For each CRITICAL finding, discuss the recommended fix and confirm resolution approach with the user.
3. For HIGH findings, confirm whether the user wants to resolve now or acknowledge the risk.
4. MEDIUM and LOW findings are noted — the user may choose to address them or defer.
5. If CRITICAL findings exist, the user must confirm that the design will be updated before proceeding. The design update happens, then this review re-runs on the updated package.
6. If no CRITICAL findings: proceed to `review-security-posture` once the user confirms.

## Completion Criteria

- [ ] All seven review perspectives (structural, coherence, scalability, resilience, maintainability, requirements coverage, gap analysis) have been evaluated
- [ ] Every finding has a severity, affected section(s), issue description, impact, and recommendation
- [ ] The adversarial review technique was applied — findings exist, or specific evidence explains why not
- [ ] Requirements coverage summary shows every requirement from the requirements package
- [ ] The user has reviewed the findings and confirmed resolution approach for CRITICAL and HIGH items
- [ ] The verdict (BLOCK / WARNING / PASS) is stated

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Rubber-stamp review — "the design looks fine" without genuine analysis | Adversarial technique requires finding issues; zero findings triggers re-analysis |
| Cross-section contradictions ship to implementation — e.g., API and backend disagree on async vs. sync | Coherence check (Step 3) specifically looks for contradictions between sections |
| Scalability bottleneck is invisible because each section looks fine in isolation | Scalability check (Step 4) evaluates the whole system under load, not individual components |
| Single point of failure goes unnoticed because resilience was reviewed per-component, not end-to-end | Resilience check (Step 5) traces failure propagation paths across the full architecture |
| Design is so complex that implementation teams cannot understand it | Maintainability check (Step 6) evaluates cognitive complexity and team autonomy |
| A requirement has no architectural support but nobody noticed | Requirements coverage check (Step 7) maps every requirement to its supporting design |
| Design assumes conditions that are not stated and may not be true | Gap analysis (Step 8) explicitly identifies unstated assumptions |
| Findings are vague and unactionable — "consider improving scalability" | Each finding requires severity, affected section, specific issue, impact, and recommendation |
| CRITICAL issues are noted but not resolved before implementation begins | Hand-off gate blocks progression until CRITICAL findings are resolved |
