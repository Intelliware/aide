# PR Reviewer

## Purpose

Adversarial PR review using four sequential lenses — the reviewer's job is to find problems, not to confirm the code works. Zero findings triggers re-analysis (a review that finds nothing is a review that didn't look hard enough). The four lenses, applied in sequence: (1) Blind review — review the diff alone without reading the change spec; surface anything that looks wrong, unclear, or fragile based purely on the code changes; (2) Spec compliance review — read the change spec and its acceptance criteria, then re-review the diff for gaps between what was specified and what was implemented, missing edge cases, and acceptance criteria not covered by tests; (3) Standards compliance review — read all applicable coding standards (language, framework, common, testing) and re-review the diff for rule violations; standards are the gold standard — existing codebase deviations are not acceptable precedent; (4) Codebase integration review — read the surrounding codebase context (affected files, patterns, conventions), then review for convention violations, pattern mismatches, naming inconsistencies, and integration issues the diff alone cannot reveal. Only flag pattern mismatches where the existing pattern is also standards-compliant. Across all four lenses, checks the applicable quality dimensions: security (injection, auth, secrets, validation), test coverage (adequacy of tests for changed paths), error handling (errors, edges, retries), maintainability (complexity, coupling, readability), performance (N+1, leaks, hot paths), accessibility (if UI changes), and formatting (style, lint compliance). Not every dimension applies to every change — the reviewer determines which are relevant based on scope. Produces severity-rated findings: Critical (blocks merge), Important (should fix before merge), Minor (note for future). When used in subagent mode, ideally run with a different model than the implementer to avoid blind spots.

## What This Does

Conducts an adversarial code review of the PR. The reviewer's job is to find problems — not to confirm the code works. This review is deliberately separate from the agent that wrote the code, because self-review shares the implementer's blind spots.

The review applies four lenses in sequence, each adding more context. Findings are severity-rated and actionable.

## When to Use

- **Step 5 of the expedited workflow — before any commit.** The reviewer examines the uncommitted working tree diff so that Critical findings are fixed before code is committed. Only clean, reviewed code gets committed.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Working tree diff | `git diff` (unstaged) or `git diff --cached` (staged) — the **uncommitted** changeset | Yes |
| Change spec | From Step 1 — what, where, why, ACs, delta | Yes |
| Codebase orientation | From Step 2 — technology versions, patterns, conventions, standards compliance snapshot | Yes |
| Coding standards | `../assets/standards/` — all applicable language, framework, and common standards | Yes |
| Testing standards | `../assets/standards/common/testing/` — unit testing, integration testing, mocking strategy | Yes |
| Codebase (surrounding files) | Files adjacent to the changed files — for integration checking | Yes |

---

## The Adversarial Principle

This review is adversarial by design:

1. **The reviewer's job is to find problems.** A review that finds nothing is suspicious.
2. **Zero findings triggers re-analysis.** If the first pass finds nothing, the reviewer must go back and look harder. Genuine zero-finding PRs exist (trivial changes, config-only), but they are rare — and the re-analysis must confirm the PR is genuinely trivial.
3. **Findings are diagnosis only.** State the problem and the evidence. Do not propose fixes — that biases the implementer toward the reviewer's solution rather than finding the best one.
4. **Severity calibration matters.** Marking a nitpick as Critical wastes time. Marking a security issue as Minor is dangerous.
5. **Fresh context.** The reviewer should approach the diff without preconceptions from the implementation session.

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
│  2. SPEC COMPLIANCE ──► Diff + change spec + ACs                 │
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

Read the diff. Do not read the spec, the story, or any context. Surface anything that looks wrong based purely on the code:

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

**Output:** List of raw observations. No severity yet.

### Lens 2 — Spec Compliance (Diff + Change Spec + ACs)

Now read the change spec — the what, where, why, acceptance criteria, and delta. Re-review the diff:

| What to Check | Finding Type |
|--------------|-------------|
| **Missing ACs** | An acceptance criterion exists in the spec but has no corresponding implementation or test |
| **Missing edge cases** | The spec describes error scenarios that the implementation does not handle |
| **Extra implementation** | Code that does something not specified — potential scope creep |
| **Incorrect behavior** | Implementation contradicts the spec (wrong status code, wrong error message, wrong business rule) |
| **Missing tests** | A specified behavior has implementation code but no test |
| **Contract mismatch** | API path, request/response schema, or error code differs from the spec |

**Output:** List of spec gaps and mismatches. No severity yet.

### Lens 3 — Standards Compliance (Diff + All Applicable Standards)

Read the applicable coding standards — language standards, framework standards, and common standards (clean code, error handling, naming conventions, design patterns, testing standards). Review every new or modified line against the rules.

**Standards are the gold standard.** If the existing codebase deviates from a standard, that deviation is technical debt — not acceptable precedent. New code must follow the standard, not the deviation.

**What to check by standard category:**

| Standard Category | What to Check | Rule Examples |
|------------------|---------------|---------------|
| **Language standards** | Language-specific idioms, type system usage, version-appropriate features | Java: records over mutable POJOs (JV-01); TypeScript: no `any` (TS-02); Swift: `guard let` (SW-02); Kotlin: `val` over `var` (KT-01) |
| **Clean code** | Method length, file size, naming clarity, single responsibility | CC-01 through CC-14 — functions ≤20 lines, files ≤800 lines, no magic numbers |
| **Error handling** | Error propagation, error types, recovery, user-facing messages | Typed errors, no bare catch, meaningful error messages |
| **Design patterns** | Appropriate pattern usage, no over-engineering | Factory, Strategy, Observer where applicable |
| **Code design principles** | SOLID, DRY, YAGNI, composition over inheritance | Single responsibility, interface segregation, dependency inversion |
| **Naming conventions** | File names, class names, variables, constants, endpoints | Conventions from orientation + `../assets/standards/common/naming-conventions.md` |
| **Testing standards** | Test structure, naming, mocking strategy, assertion quality | AAA structure (UT-01), behavior-focused names (UT-02), mock at narrowest boundary (MOC-01) |
| **Security practices** | Input validation, authentication, data exposure | Validate at boundaries, no secrets in code, parameterized queries |

**How to check:**
1. Read each standard file that applies to this project's tech stack (identified during orientation)
2. For each rule in each standard, scan the diff for violations
3. Note the specific rule ID (e.g., `TS-02`, `CC-05`, `MOC-01`) for each finding
4. Check version-gated rules — only enforce rules compatible with the project's actual versions (from orientation)

**Output:** List of standards violations with rule IDs and locations. No severity yet.

### Lens 4 — Codebase Integration (Diff + Surrounding Code + Conventions)

Read the surrounding codebase — files adjacent to the changes, orientation context. Review for fit with the existing codebase:

| What to Check | Finding Type |
|--------------|-------------|
| **Naming violations** | File names, class names, variable names that break the project's conventions |
| **Pattern mismatches** | New code uses a different pattern than existing code — but only flag if the existing pattern *also* complies with standards |
| **Import consistency** | New imports follow a different style or path convention |
| **Integration issues** | Type mismatches at boundaries, missing interface implementations, broken contracts |
| **Test convention violations** | Tests use a different framework, naming, or structure than existing tests |

**Important:** If this lens identifies a pattern mismatch where the existing code deviates from a standard but the new code follows the standard, that is **not a finding** — the new code is correct. Flag the existing code as technical debt, not the new code as a pattern mismatch.

**Output:** List of integration issues and convention violations. No severity yet.

### Step 5 — Zero-Check

If no findings emerged from all four lenses, re-analyze:

1. Is the change genuinely trivial (config change, dependency bump, rename)?
   - If yes: confirm zero findings is appropriate. Proceed with a clean review.
2. Is the change non-trivial but looks clean?
   - Re-read the spec — are there ACs you missed?
   - Re-read the diff more slowly — are there subtle issues?
   - Check test quality specifically — do tests assert meaningful behavior?
3. If re-analysis still finds nothing: proceed with zero findings. But this should be rare.

### Step 6 — Triage

Consolidate findings from all four lenses. For each finding:

**Assign severity:**

| Severity | Criteria | Examples | Merge Impact |
|----------|----------|---------|-------------|
| **Critical** | Blocks merge — will cause a bug, security vulnerability, data loss, or production failure | Missing auth check, SQL injection, data corruption risk | Must fix before merge |
| **Important** | Should fix before merge — significantly impacts quality, maintainability, or correctness | Missing error handling for a likely scenario, test that asserts nothing | Should fix |
| **Minor** | Note for future — cosmetic, stylistic, or low-impact improvements | Slightly verbose code, suboptimal but correct algorithm | Does not block merge |

**Severity calibration rules:**

| Rule | Detail |
|------|--------|
| Security issues are always Critical | No exceptions — injection, auth bypass, secret exposure |
| Missing AC coverage is Important or Critical | Important if edge case; Critical if primary flow |
| Naming/style issues are Minor | Unless they will cause confusion that leads to bugs |
| Performance issues depend on the hot path | N+1 on a rarely-called endpoint is Important; on the main query is Critical |
| Do not inflate severity to seem thorough | Nitpicks marked Critical undermine trust |

**Deduplicate:** If multiple lenses found the same issue, merge into one finding. Note which lenses caught it.

**Classify source:**

| Bucket | Meaning | Action |
|--------|---------|--------|
| `decision_needed` | Reviewer is uncertain — needs implementer or user input | Present for discussion |
| `patch` | Clear fix needed — unambiguous | Implementer fixes before merge |
| `defer` | Valid concern but does not block this PR | Log for future work |
| `dismiss` | After full analysis, the concern is not valid | Exclude from final report |

### Step 7 — Report

Structure the review report:

```
## PR Review — [Change Name]

### Verdict: [APPROVE / REQUEST CHANGES / BLOCK]

### Summary
[2-3 sentences: overall assessment of the PR quality]

### Critical Findings (must fix before merge)

#### [C-1] [Title]
- **Lens:** [Blind / Spec Compliance / Standards Compliance / Integration]
- **Location:** `file:line`
- **Rule:** [Standard rule ID if from Standards lens, e.g., TS-02, CC-05 — omit if not standards-related]
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
| **APPROVE** | Zero Critical findings. All Important findings either addressed or explicitly accepted. |
| **REQUEST CHANGES** | One or more Important findings that should be fixed. No Critical findings. |
| **BLOCK** | One or more Critical findings. Merge must not proceed until fixed. |

---

## Quality Dimensions Reference

Not every dimension applies to every change. The reviewer determines which are relevant.

| Dimension | What to Check |
|-----------|--------------|
| **Standards compliance** | Every applicable rule from language, framework, and common standards — checked with specific rule IDs |
| **API compliance** | REST naming, correct HTTP status codes, error response format, pagination, versioning |
| **Security** | Injection risks, authentication/authorization, secrets management, input validation, data exposure |
| **Test coverage** | All new code paths have tests, edge cases tested, error scenarios tested, testing standards followed |
| **Error handling** | Errors caught and handled, edge cases covered, retry logic, graceful degradation |
| **Maintainability** | Complexity, coupling/cohesion, readability, SOLID/DRY/YAGNI compliance |
| **Performance** | N+1 queries, memory leaks, unnecessary allocations, hot path efficiency |
| **Accessibility** | ARIA attributes, keyboard navigation, screen reader compatibility, color contrast (UI changes only) |
| **Documentation** | API docs updated, non-obvious code has comments |
| **Formatting** | Style consistency, lint compliance, import ordering |

---

## Completion Criteria

- [ ] All four lenses applied in sequence (Blind → Spec → Standards → Integration)
- [ ] Zero-check performed if no findings emerged
- [ ] Every finding has severity, lens, location (file:line), and evidence
- [ ] Standards findings include specific rule IDs
- [ ] Severity calibration rules followed — no inflated or deflated severities
- [ ] Findings deduplicated across lenses
- [ ] Quality dimensions table filled — which were applicable and how many findings each
- [ ] Verdict stated (APPROVE / REQUEST CHANGES / BLOCK)
- [ ] Positive observations included
- [ ] Report presented to user

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Reviewer rubber-stamps the PR with "LGTM" and no actual review | Adversarial principle — zero findings triggers re-analysis |
| Reviewer only checks formatting and misses a security issue | Four-lens structure ensures logic, spec, standards, and integration are all checked |
| Code passes review but violates organizational coding standards | Lens 3 (Standards Compliance) checks every applicable standard rule with specific rule IDs |
| New code follows a bad pattern from the existing codebase | Lens 4 explicitly notes: if existing code deviates from a standard, new code following the standard is not a finding |
| Critical findings discovered after code is committed | Review happens on the **uncommitted** diff — findings are fixed before any commit |
| Every finding is marked Critical — implementer cannot prioritize | Severity calibration rules with concrete criteria prevent inflation |
| Review finds problems but also proposes fixes, biasing the implementer | Diagnosis-only rule — findings describe the problem, not the solution |
| Reviewer misses that an acceptance criterion is not covered | Lens 2 (Spec Compliance) explicitly checks each AC against the implementation |
| Self-review shares the implementer's blind spots | Review starts from the uncommitted diff and applies the four lenses with fresh context |
| Review finds the same issue in Lens 1 and Lens 3 separately | Step 6 deduplication merges findings across lenses |
