# Phase 2 — Generate BDD Scenarios

## Purpose
Expand the approved draft scenario titles from `test-cases.md` into full Cucumber `.feature` file content with complete Given/When/Then steps, entry point, background, and locator references. Every ✅ AC scenario gets full steps. Every 🟡 AC scenario gets steps with `@wip` and assumption comments.

## Process

### Step 0 — Pre-flight: load and confirm draft skeleton

Before writing any Gherkin steps:

1. Read the approved `features/<JIRA-ID-or-INC-ID>/test-cases.md`
2. Extract every row from the `## Acceptance Criteria & Draft Scenarios` table
3. Confirm the scenario count to the user:
   > "Phase 2 will expand **[N] draft scenario titles** from Phase 1 into full Gherkin ([✅ N confirmed] + [🟡 N @wip]). 🔴 [N] ACs remain excluded. Proceed?"
4. Wait for confirmation before writing any `.feature` content
5. Do **not** change or rephrase scenario titles that were approved in Phase 1 — carry them through unchanged

---

### Step 1 — Write full Gherkin scenarios

Expand each draft scenario title into complete Gherkin, following conventions from KNOWLEDGE.md Section 13:

1. Always start from the confirmed entry point (login step from Phase 1)
2. Reuse existing steps wherever possible (check KNOWLEDGE.md Section 8):
   - Mark reused steps normally
   - Mark new steps with `# NEW STEP` comment
3. Keep scenarios atomic — one behaviour per scenario
4. Use `Background:` for steps shared across all scenarios in the feature
5. Do not use `And` as the first word of a step

**BDD enforcement rules — apply to every scenario:**
- Every ✅ AC produces at least one `Scenario:` or `Scenario Outline:` — no exceptions
- Every 🟡 AC produces at least one `Scenario:` tagged `@wip` with a `# ASSUMPTION:` comment on any step that depends on the conditional
- 🔴 ACs are never expanded into steps — include a comment `# EXCLUDED: <AC ID> — <reason>` in the feature file to record their absence
- Scenario titles from `test-cases.md` are carried through **unchanged** — do not rephrase them
- If a scenario title drifted technical during Phase 1, correct it now and note the correction in the coverage table
- If an AC covers multiple distinct flows (happy path + error path), produce either a `Scenario Outline:` with an Examples table or separate `Scenario:` blocks — one block per behaviour
- If an AC was originally written in Given/When/Then language, use those steps directly (expanding locator references and entry points as needed)

### Step 2 — Write scenarios.md

Write to `features/<JIRA-ID-or-INC-ID>/scenarios.md`:

```markdown
# BDD Scenarios — <JIRA-ID>

## Target Feature File
`src/test/resources/features/<path>/<name>.feature`

## Feature Draft

​```gherkin
@<tag>
Feature: <Feature name>

  Background:
    # Entry point steps

  Scenario: <Business outcome description>
    Given <precondition>
    When <action>
    Then <expected result>
​```

## Coverage Mapping

| Acceptance Criterion | Draft Scenario Title (from test-cases.md) | Scenario (in scenarios.md) | Notes |
|---|---|---|---|
| AC1: ... | User successfully uploads a valid CSV file | Scenario: User successfully uploads a valid CSV file | |
| AC2: ... | System rejects an invalid CSV with a clear error message | @wip Scenario: System rejects an invalid CSV with a clear error message | |
```

## Checkpoint

> "Phase 2 complete. [N] scenarios written covering [N] ✅ ACs and [N] 🟡 @wip ACs. Do the scenarios look correct? Reply APPROVED or tell me what to change."

## Exit criteria
- `scenarios.md` written to `features/<JIRA-ID-or-INC-ID>/`
- Every ✅ AC from `test-cases.md` has at least one fully-stepped `Scenario:` or `Scenario Outline:`
- Every 🟡 AC has at least one `@wip`-tagged scenario with `# ASSUMPTION:` comments
- 🔴 AC exclusions recorded as comments in the feature file
- Coverage mapping table shows every AC from Phase 1 accounted for
- User has approved Phase 2

