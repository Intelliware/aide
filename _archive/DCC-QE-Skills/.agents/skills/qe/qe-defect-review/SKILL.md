---
name: qe-defect-review
description: "Use when the user asks to review test failures, analyze why tests failed, walk through defects, determine root cause of failures, says 'my tests failed', 'analyze failures', 'review the failures', 'what went wrong', or after qe-execution hands off with failure details. Walks through each test failure one at a time, classifies as script issue vs real defect, proposes remediation, and waits for user approval before proceeding to the next failure. Outputs a structured summary of all failure causes and remediations."
---

# QE Defect Review

Interactively walk through test failures one at a time, classify each as a
test script issue or a real application defect, propose remediation, and build
a structured summary of causes and next steps.

## When to use

- After `qe-execution` reports test failures
- User provides execution results or failure logs
- User says "my tests failed", "analyze failures", "what went wrong"

## When NOT to use

- User wants to build tests → `qe-development`
- User wants to run tests → `qe-execution`
- No failures to review

## Inputs

| Input | Source | Required |
|---|---|---|
| Failure details | qe-execution hand-off or user-provided | Yes |
| `docs/KNOWLEDGE.md` | `BB-DCC-QE/docs/KNOWLEDGE.md` | No (enhances analysis if present) |
| Report files | `BB-DCC-QE/target/` (allure-results, screenshots, logs) | No (used for evidence) |

## Outputs

| Output | Destination | Format |
|---|---|---|
| Per-failure classification and remediation | Chat (interactive) | Structured markdown per failure |
| Final summary | Chat | Complete failure analysis table |

## Review Process

### Step 1 — Gather failure data

Collect from available sources:
- qe-execution hand-off (scenario names, errors, categories)
- `target/allure-results/` — individual test result JSONs
- `target/logs/latest-run.log` — execution log
- `screenshots/FAILED_*.png` — visual evidence
- Terminal output from the test run

### Step 2 — Walk through failures one at a time

For EACH failure, present this structure and wait for user response:

```markdown
## Failure [N] of [total]

**Scenario:** <scenario name>
**Feature:** <feature file>
**Failed Step:** <exact step that failed>
**Error:** <error message>
**Screenshot:** <path if available>

### Classification

**Category:** <one of the categories below>
**Confidence:** <High/Medium/Low>

**Reasoning:**
<explain why this classification was chosen, referencing KNOWLEDGE.md if relevant>

### Proposed Remediation

**Action:** <Fix test / Fix application code / Fix test data / Environment issue>
**Details:** <specific fix recommendation>

---
> Do you agree with this classification? Reply APPROVED, or provide an alternative cause.
```

### Failure Categories

| Category | Pattern | Typical Remediation |
|---|---|---|
| **Element Not Found** | `Element.*not found`, `Timeout.*locator` | Fix locator in objectRepo.properties |
| **Timing Issue** | `TimeoutError`, `wait.*timed out` | Add proper wait (GenericActions.waitForElementVisible) |
| **Assertion Failure** | `AssertionError`, `expected.*but was` | Likely real defect — or test expectation wrong |
| **Network Error** | `net::ERR_`, `Connection refused`, HTTP 5xx | Environment or application issue |
| **Data Issue** | `NullPointerException`, `No value for key` | Fix test data in environments.json or testdata/ |
| **Environment Issue** | `Unable to connect`, server down | Environment not available — retry later |
| **Application Defect** | UI error, button not working, wrong behaviour | Real bug — create JIRA ticket |

### Cross-reference with KNOWLEDGE.md

If `docs/KNOWLEDGE.md` is available, use it to:
- Check if the failed step's locator exists in Section 21
- Check if the utility method being called is documented in Section 3
- Check Section 22 (Known Gaps & Risks) for known issues
- Identify if the failure matches a known pattern (hardcoded waits, static state)

### Step 3 — User approval per failure

For each failure:
- If user says APPROVED → record classification and move to next
- If user provides alternative cause → record their version and move to next
- If user wants to dig deeper → provide more evidence (logs, screenshots, code)

### Step 4 — Final summary

After all failures reviewed, present:

```markdown
## Failure Analysis Summary

**Total failures reviewed:** N
**Date:** <timestamp>
**Environment:** <env>
**Tag:** <tag>

### Results

| # | Scenario | Category | Cause | Remediation | Status |
|---|---|---|---|---|---|
| 1 | ... | Assertion Failure | App returns wrong status | Fix in BZC backend | Approved |
| 2 | ... | Element Not Found | Locator changed | Update objectRepo.properties | Approved |
| 3 | ... | Timing Issue | Missing wait after AJAX | Add waitForElementVisible | User override: data issue |

### Action Items

**Fix in test code (script issues):**
- [ ] Update locator `fileTransfer.statusCell` in objectRepo.properties
- [ ] Add waitForElementVisible after form submission in FileTransferSteps

**Create JIRA tickets (application defects):**
- [ ] [BZC][File Transfer] Upload returns wrong status for valid CSV

**Environment/data fixes:**
- [ ] Retry after environment stabilises
```

## Hand-off back to qe-development

If script fixes are needed, offer:
> "There are N test script issues to fix. Would you like to invoke
> `qe-development` to implement the fixes?"

## Rules

- Always present failures one at a time — never dump all at once
- Always wait for user approval before moving to next failure
- Always cross-reference KNOWLEDGE.md if available
- Always distinguish script issues from real application defects
- Never create JIRA tickets automatically — only recommend
- Always provide evidence (error, screenshot path, log excerpt) with each failure

