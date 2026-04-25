# PR Reviewer

## Purpose

Adversarial PR review covering all applicable quality dimensions. The review is intentionally adversarial — the reviewer's job is to find problems, not to confirm the code works. Zero findings triggers re-analysis (a review that finds nothing is a review that didn't look hard enough). Uses four review lenses applied in sequence: (1) Blind review — review the diff alone without reading the spec or story; surface anything that looks wrong, unclear, or fragile based purely on the code changes; (2) Spec compliance review — read the task's inline design spec and acceptance criteria, then re-review the diff for gaps between what was specified and what was implemented, missing edge cases, and acceptance criteria not covered by tests; (3) Standards compliance review — read all applicable coding and testing standards, then re-review the diff for standards violations; (4) Codebase integration review — read the surrounding codebase context (project-context.md, affected files), then review for convention violations, pattern mismatches, naming inconsistencies, and integration issues the diff alone cannot reveal. Across all four lenses, checks the applicable quality dimensions: API compliance (REST naming, status codes, errors, pagination, versioning, idempotency), security (injection, auth, secrets, validation, exposure), test coverage (adequacy of tests for new/changed paths), error handling (errors, edges, retries, degradation), maintainability (complexity, coupling/cohesion, readability, SOLID/DRY/YAGNI), performance (N+1, leaks, allocations, hot paths), accessibility (ARIA, keyboard, screen readers, contrast, semantics, WCAG), documentation (API docs, README, comments, changelog for public changes), and formatting (style, lint compliance vs standards). Not every dimension applies to every PR — the reviewer determines which are relevant based on the scope of changes. Produces severity-rated findings: Critical (blocks merge), Important (should fix before merge), Minor (note for future).

## What This Does

Conducts an adversarial code review of the PR. The reviewer's job is to find problems — not to confirm the code works. This review is deliberately separate from the agent that wrote the code, because self-review shares the implementer's blind spots.

The review applies four lenses in sequence, each adding more context. Findings are severity-rated and actionable.

## When to Use

- **Step 1 of the PR workflow — before any commit.** The reviewer examines the uncommitted working tree diff so that Critical findings are fixed before code is committed. Only clean, reviewed code gets committed.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Working tree diff | `git diff` (unstaged) or `git diff --cached` (staged) — the **uncommitted** changeset | Yes |
| Phase specification | From `implementation-plan.md` — inline specs, ACs, FR mapping | Yes |
| Project context | `project-context.md` — naming, patterns, conventions | Yes |
| Coding standards | `../assets/standards/` — all applicable language, framework, and common standards | Yes |
| Testing standards | `../assets/standards/common/testing/` — unit testing, integration testing, mocking strategy | Yes |
| Codebase (surrounding files) | Files adjacent to the changed files — for integration checking | Yes |

---

## The Adversarial Principle

This review is adversarial by design:

1. **The reviewer's job is to find problems.** A review that finds nothing is suspicious.
2. **Zero findings triggers re-analysis.** If the first pass finds nothing, the reviewer must go back and look harder. Genuine zero-finding PRs exist (trivial changes, config-only), but they are rare — and the re-analysis must confirm the PR is genuinely trivial.
3. **Findings are diagnosis only.** State the problem and the evidence. Do not propose fixes — that biases the implementer toward the reviewer's solution rather than finding the best one.
4. **Severity calibration matters.** Marking a nitpick as Critical wastes everyone's time. Marking a security issue as Minor is dangerous.
5. **Fresh context.** The reviewer should approach the diff without preconceptions from the implementation session, reading only the diff, spec, standards, and relevant codebase context needed for the four review lenses.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  PR REVIEWER — FOUR-LENS SEQUENCE (on uncommitted diff)          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BLIND REVIEW ─────► Diff only, no context                   │
│     What looks wrong, unclear, or fragile?                       │
│              │                                                   │
│              ▼                                                   │
│  2. SPEC COMPLIANCE ──► Diff + spec + ACs                        │
│     What was specified but not implemented?                      │
│     What was implemented but not specified?                      │
│              │                                                   │
│              ▼                                                   │
│  3. STANDARDS COMPLIANCE ► Diff + all applicable standards       │
│     Does the code follow language, framework, and common         │
│     coding standards? Standards are the gold standard —          │
│     existing codebase deviations are not acceptable precedent.   │
│              │                                                   │
│              ▼                                                   │
│  4. CODEBASE INTEGRATION ► Diff + surrounding code + conventions │
│     Does the code fit the codebase?                              │
│     Convention violations? Pattern mismatches?                   │
│              │                                                   │
│              ▼                                                   │
│  5. ZERO-CHECK ──────► Re-analyze if no findings                 │
│              │                                                   │
│              ▼                                                   │
│  6. TRIAGE ──────────► Rate severity, deduplicate                │
│              │                                                   │
│              ▼                                                   │
│  7. REPORT ──────────► Structured findings + verdict             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Lens 1 — Blind Review (Diff Only)

Read the diff. Do not read the spec, the story, or the PR description. Surface anything that looks wrong based purely on the code:

| What to Look For | Examples |
|-----------------|---------|
| **Logic errors** | Off-by-one, wrong comparison operator, inverted condition |
| **Missing error handling** | Unhandled promise rejection, bare catch, missing null check |
| **Security issues** | SQL injection, missing input validation, hardcoded secrets, exposed internal data |
| **Resource leaks** | Opened but not closed connections, missing cleanup, unbounded growth |
| **Dead code** | Unused imports, unreachable branches, commented-out code |
| **Unclear intent** | Magic numbers, cryptic variable names, complex expressions without explanation |
| **Test quality** | Tests that assert nothing meaningful, tautological tests, missing edge cases |
| **Copy-paste errors** | Duplicated blocks with inconsistent modifications |

**Output:** List of raw observations. No severity yet — that comes during triage.

### Lens 2 — Spec Compliance (Diff + Spec + ACs)

Now read the phase specification — the inline design specs, acceptance criteria, and FR mapping. Re-review the diff:

| What to Check | Finding Type |
|--------------|-------------|
| **Missing ACs** | An acceptance criterion exists in the spec but has no corresponding implementation or test |
| **Missing edge cases** | The spec describes error scenarios that the implementation does not handle |
| **Extra implementation** | Code that does something not specified — potential scope creep |
| **Incorrect behavior** | Implementation contradicts the spec (wrong status code, wrong error message, wrong business rule) |
| **Missing tests** | A specified behavior has implementation code but no test |
| **Contract mismatch** | API endpoint path, request/response schema, or error code differs from the spec |

**Output:** List of spec gaps and mismatches. No severity yet.

### Lens 3 — Standards Compliance (Diff + All Applicable Standards)

Read the applicable coding standards — language standards, framework standards, and common standards (clean code, error handling, naming conventions, design patterns, testing standards). Review every new or modified line against the rules.

**Standards are the gold standard.** If the existing codebase deviates from a standard, that deviation is technical debt — not acceptable precedent. New code must follow the standard, not the deviation.

**What to check by standard category:**

| Standard Category | What to Check | Rule Examples |
|------------------|---------------|---------------|
| **Language standards** | Language-specific idioms, type system usage, version-appropriate features | Java: records over mutable POJOs (JV-01), sealed interfaces (JV-03); TypeScript: no `any` (TS-02), discriminated unions (TS-04); Swift: `guard let` (SW-02), async/await (SW-03); Kotlin: `val` over `var` (KT-01), sealed classes (KT-03) |
| **Clean code** | Method length, file size, naming clarity, single responsibility | CC-01 through CC-14 — functions ≤20 lines, files ≤800 lines, no magic numbers |
| **Error handling** | Error propagation, error types, recovery, user-facing messages | Typed errors, no bare catch, meaningful error messages, boundary validation |
| **Design patterns** | Appropriate pattern usage, no over-engineering | Factory, Strategy, Observer where applicable; no pattern for pattern's sake |
| **Code design principles** | SOLID, DRY, YAGNI, composition over inheritance | Single responsibility, interface segregation, dependency inversion |
| **Naming conventions** | File names, class names, variables, constants, endpoints | Project-specific conventions from `project-context.md` and `../assets/standards/common/naming-conventions.md` |
| **Testing standards** | Test structure, naming, mocking strategy, assertion quality | AAA structure (UT-01), behavior-focused names (UT-02), mock at narrowest boundary (MOC-01), DI over module mocking (MOC-02) |
| **Security practices** | Input validation, authentication, data exposure | Validate at boundaries, no secrets in code, parameterized queries |

**How to check:**
1. Read each standard file that applies to this project's tech stack
2. For each rule in each standard, scan the diff for violations
3. Note the specific rule ID (e.g., `TS-02`, `CC-05`, `MOC-01`) for each finding

**Output:** List of standards violations with rule IDs and locations. No severity yet.

### Lens 4 — Codebase Integration (Diff + Surrounding Code + Conventions)

Read the surrounding codebase — files adjacent to the changes, `project-context.md`. Review for fit with the existing codebase:

| What to Check | Finding Type |
|--------------|-------------|
| **Naming violations** | File names, class names, variable names that break the project's conventions |
| **Pattern mismatches** | New code uses a different pattern than existing code (different DI approach, different error handling style) — but only flag if the existing pattern *also* complies with standards |
| **Import consistency** | New imports follow a different style or path convention |
| **Integration issues** | Type mismatches at boundaries, missing interface implementations, broken contracts with existing code |
| **Test convention violations** | Tests use a different framework, naming, or structure than existing tests |

**Important:** If this lens identifies a pattern mismatch where the existing code deviates from a standard but the new code follows the standard, that is **not a finding** — the new code is correct. Flag the existing code as technical debt, not the new code as a pattern mismatch.

**Output:** List of integration issues and convention violations. No severity yet.

### Step 5 — Zero-Check

If no findings emerged from all four lenses, re-analyze:

1. Is the PR genuinely trivial (config change, dependency bump, documentation fix)?
   - If yes: confirm zero findings is appropriate. Proceed with a clean review.
2. Is the PR non-trivial but looks clean?
   - Re-read the spec — are there ACs you missed?
   - Re-read the diff more slowly — are there subtle issues?
   - Check test quality specifically — do tests assert meaningful behavior?
3. If re-analysis still finds nothing: proceed with zero findings. But this should be rare.

### Step 6 — Triage

Consolidate findings from all four lenses. For each finding:

**Assign severity:**

| Severity | Criteria | Examples | Merge Impact |
|----------|----------|---------|-------------|
| **Critical** | Blocks merge — will cause a bug, security vulnerability, data loss, or production failure | Missing auth check, SQL injection, data corruption risk, breaking contract change without migration | Must fix before merge |
| **Important** | Should fix before merge — significantly impacts quality, maintainability, or correctness but does not cause immediate failure | Missing error handling for a likely scenario, test that asserts nothing, naming that will confuse future developers | Should fix; merge at reviewer discretion if justified |
| **Minor** | Note for future — cosmetic, stylistic, or low-impact improvements | Slightly verbose code, suboptimal but correct algorithm, missing optional documentation | Does not block merge |

**Severity calibration rules:**

| Rule | Detail |
|------|--------|
| Security issues are always Critical | No exceptions — injection, auth bypass, secret exposure, data leaks |
| Missing AC coverage is Important or Critical | Important if the AC is for an edge case; Critical if it is for a primary flow |
| Naming/style issues are Minor | Unless they will cause confusion that leads to bugs |
| Performance issues depend on the hot path | N+1 on a rarely-called endpoint is Important; N+1 on the main query is Critical |
| Do not inflate severity to seem thorough | Nitpicks marked Critical undermine trust in the review |

**Deduplicate:** If multiple lenses found the same issue (e.g., Lens 1 noticed a missing null check and Lens 3 flagged it as a standards violation of error handling rule EH-03), merge into one finding. Note which lenses caught it.

**Classify source:**

| Bucket | Meaning | Action |
|--------|---------|--------|
| `decision_needed` | Reviewer is uncertain — needs implementer or user input | Present for discussion |
| `patch` | Clear fix needed — the finding is unambiguous | Implementer fixes before merge |
| `defer` | Valid concern but does not block this PR | Log for future work |
| `dismiss` | After full analysis, the concern is not valid | Exclude from final report |

### Step 7 — Report

Structure the review report:

```
## PR Review — Phase [ID]

### Verdict: [APPROVE / REQUEST CHANGES / BLOCK]

### Summary
[2-3 sentences: overall assessment of the PR quality]

### Critical Findings (must fix before merge)

#### [C-1] [Title]
- **Lens:** [Blind / Spec Compliance / Standards Compliance / Integration]
- **Location:** `file:line`
- **Rule:** [Standard rule ID if from Standards lens, e.g., TS-02, CC-05, MOC-01 — omit if not standards-related]
- **Finding:** [What is wrong — diagnosis only, no fix suggestion]
- **Evidence:** [What in the code demonstrates the problem]

### Important Findings (should fix before merge)

#### [I-1] [Title]
- **Lens:** [Blind / Spec Compliance / Standards Compliance / Integration]
- **Location:** `file:line`
- **Rule:** [Standard rule ID if applicable]
- **Finding:** [What is wrong]
- **Evidence:** [What in the code demonstrates the problem]

### Minor Findings (notes for future)

#### [M-1] [Title]
- **Location:** `file:line`
- **Finding:** [What could be improved]

### What Looks Good
[2-3 specific positive observations — not generic praise]

### Quality Dimensions Checked

| Dimension | Applicable | Findings |
|-----------|-----------|----------|
| Standards compliance | Yes / No | N findings (rule IDs: ...) |
| API compliance | Yes / No | N findings |
| Security | Yes / No | N findings |
| Test coverage | Yes / No | N findings |
| Error handling | Yes / No | N findings |
| Maintainability | Yes / No | N findings |
| Performance | Yes / No | N findings |
| Accessibility | Yes / No | N findings |
| Documentation | Yes / No | N findings |
| Formatting | Yes / No | N findings |
```

**Verdict rules:**

| Verdict | When |
|---------|------|
| **APPROVE** | Zero Critical findings. All Important findings are either addressed or explicitly accepted by the user. |
| **REQUEST CHANGES** | One or more Important findings that should be fixed. No Critical findings. |
| **BLOCK** | One or more Critical findings. Merge must not proceed until fixed. |

---

## Quality Dimensions Reference

Not every dimension applies to every PR. The reviewer determines which are relevant based on the scope of changes.

| Dimension | What to Check |
|-----------|--------------|
| **Standards compliance** | Every applicable rule from language, framework, and common standards — checked with specific rule IDs (e.g., TS-02, CC-05, MOC-01) |
| **API compliance** | REST naming conventions, correct HTTP status codes, error response format, pagination, versioning, idempotency |
| **Security** | Injection risks (SQL, XSS, command), authentication/authorization checks, secrets management, input validation, data exposure |
| **Test coverage** | All new code paths have tests, edge cases tested, error scenarios tested, tests assert meaningful behavior, testing standards followed |
| **Error handling** | Errors caught and handled appropriately, edge cases covered, retry logic where needed, graceful degradation, error handling standards followed |
| **Maintainability** | Complexity (cyclomatic, cognitive), coupling/cohesion, readability, SOLID/DRY/YAGNI compliance |
| **Performance** | N+1 queries, memory leaks, unnecessary allocations, hot path efficiency, unbounded operations |
| **Accessibility** | ARIA attributes, keyboard navigation, screen reader compatibility, color contrast, semantic HTML (UI changes only) |
| **Documentation** | API docs updated, README updated (if public-facing), non-obvious code has comments |
| **Formatting** | Style consistency, lint compliance, import ordering |

---

## Completion Criteria

- [ ] All four lenses applied in sequence (Blind → Spec → Standards → Integration)
- [ ] Zero-check performed if no findings emerged
- [ ] Every finding has severity, lens, location (file:line), and evidence
- [ ] Severity calibration rules followed — no inflated or deflated severities
- [ ] Findings deduplicated across lenses
- [ ] Quality dimensions table filled — which were applicable and how many findings each
- [ ] Verdict stated (APPROVE / REQUEST CHANGES / BLOCK)
- [ ] Positive observations included — not just problems
- [ ] Report presented to user

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Reviewer rubber-stamps the PR with "LGTM" and no actual review | Adversarial principle — zero findings triggers re-analysis |
| Reviewer only checks formatting and misses a security issue | Four-lens structure ensures logic (Blind), spec coverage (Spec), standards (Standards), and integration (Codebase) are all checked |
| Code passes review but violates organizational coding standards (e.g., uses `any` in TypeScript, mutable POJOs in Java, bare catch in error handling) | Lens 3 (Standards Compliance) checks every applicable standard rule with specific rule IDs — standards are the gold standard, not existing codebase deviations |
| New code follows a bad pattern from the existing codebase instead of the standard | Lens 4 explicitly notes: if existing code deviates from a standard, the new code must follow the standard, not the deviation |
| Critical findings are discovered after code is already committed — messy fix commits needed | Review happens on the **uncommitted** working tree diff — Critical findings are fixed before any commit is made |
| Every finding is marked Critical — implementer cannot prioritize | Severity calibration rules with concrete criteria prevent inflation |
| Review finds problems but the reviewer also proposes fixes, biasing the implementer | Diagnosis-only rule — findings describe the problem, not the solution |
| Reviewer misses that an acceptance criterion is not covered by any test | Lens 2 (Spec Compliance) explicitly checks each AC against the implementation and tests |
| New code works correctly but uses completely different patterns than the existing codebase | Lens 3 (Codebase Integration) compares against surrounding code and project conventions |
| Self-review shares the implementer's blind spots — bugs pass because the same context wrote and reviewed | Review starts from the uncommitted diff and applies the four lenses with fresh context |
| Review finds issues in Lens 1 and Lens 3 separately but they are the same issue — duplicate noise | Step 5 deduplication merges findings across lenses |
