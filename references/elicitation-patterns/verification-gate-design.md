# Elicitation pattern: Verification gate design

## Purpose

Designs the two gates every increment must pass before it is considered
done: the **AI Gate** (mechanical, automated checks an agent or CI runs)
and the **Human Gate** (intent-level review only a human can perform).
Invoked from `create-implementation-package` while authoring each
increment so the Automated Verification, Human Verification, and Success
Criteria sections of the Canonical Increment Shape are concrete,
machine-checkable, and reviewable.

## Inputs needed from user

- Per-increment automated check list (specific commands, test names, assertions, expected results)
- Per-increment human-review checklist (what intent the human is verifying — UX, business-rule correctness, side-effect safety, data-migration safety)
- Coverage requirements (line, branch, mutation; per-component overrides)
- Gate failure handling (retry policy, escalation, rollback)
- Success criteria (observable outcome that proves the increment delivers its goal)
- Cross-increment regression checks (which prior increments' tests must still pass)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Per increment: list the automated checks that constitute the AI Gate.**
   - **Format:** structured-list of `{check_kind, command, expected_outcome}`
   - **Validation:** `check_kind` ∈ `{unit-test, integration-test, e2e-test, lint, typecheck, build, contract-test, security-scan, performance-budget, accessibility-scan}`; `command` is a runnable shell or test-runner command; `expected_outcome` is a specific assertion or exit code (re-prompt if "tests pass" or other vague outcomes)
   - **Maps to:** `implementation.increments[].ai_gate[]`

2. **Per increment: declare the coverage requirement.**
   - **Format:** structured `{line_pct, branch_pct, mutation_pct?, per_file_overrides[]}`
   - **Validation:** percentages 0-100; `per_file_overrides[]` must reference real paths
   - **Maps to:** `implementation.increments[].ai_gate.coverage`

3. **Per increment: list the human-review checklist items.** (intent-level — only a human can answer)
   - **Format:** structured-list of free-text items, each phrased as a yes/no question
   - **Validation:** at least one item; each item is phrased as a question (re-prompt if it reads as a statement)
   - **Maps to:** `implementation.increments[].human_gate[]`

4. **Per increment: name the success criterion.** (the observable outcome that proves the increment delivers its goal — separate from individual checks)
   - **Format:** structured `{criterion, observation_method, evidence_source}`
   - **Validation:** `observation_method` ∈ `{automated-assertion, manual-walkthrough, telemetry-query, demo-recording, log-grep}`; `evidence_source` references either a tool / dashboard / file path
   - **Maps to:** `implementation.increments[].success_criteria`

5. **What happens when the AI Gate fails?**
   - **Format:** multiple-choice
   - **Options:** `block-merge` (default; standard CI behavior) / `auto-retry-once` (flaky test policy) / `escalate-to-human` (human reviews and decides)
   - **Maps to:** `implementation.increments[].ai_gate.failure_policy`

6. **What happens when the Human Gate raises a concern?**
   - **Format:** multiple-choice
   - **Options:** `block-merge-until-resolved` (default) / `merge-with-followup-ticket` (concern recorded but not blocking) / `revert-and-redesign` (concern is severe; back to design)
   - **Maps to:** `implementation.increments[].human_gate.failure_policy`

7. **Cross-increment regression checks.** Which prior increments' tests must still pass when this one merges?
   - **Format:** structured-list of `{inc_id, test_command}`
   - **Validation:** auto-fill with all prior increments' AI-Gate commands; user can prune
   - **Maps to:** `implementation.increments[].regression_checks[]`

8. **Rollback strategy.** If this increment ships and breaks production, how do we roll back?
   - **Format:** structured `{strategy, time_to_rollback_minutes, manual_steps?}`
   - **Validation:** `strategy` ∈ `{revert-deploy, feature-flag-off, db-restore-from-snapshot, forward-fix-only}`; `time_to_rollback_minutes` numeric
   - **Maps to:** `implementation.increments[].rollback`

**Wrap-up:** Confirm the answers in summary form before proceeding. Print, per increment: AI-Gate command list with expected outcomes, coverage thresholds, human-gate questions, success criterion + evidence source, failure policies, regression check list, rollback strategy. Re-prompt any vague AI-Gate command or any human-gate item not phrased as a question. Confirm before writing the Automated Verification, Human Verification, and Success Criteria sections.

## Output format

Answers feed `INC-XXX.md` sections 6 (Automated Verification), 7 (Human Verification), 8 (Success Criteria).

```markdown
## Automated Verification (AI Gate)

| Check | Command | Expected outcome |
|---|---|---|
| Unit tests | `pnpm test --filter orders-api` | All tests pass; coverage ≥ 85% line, ≥ 75% branch |
| Lint | `pnpm lint` | Exit code 0 |
| Typecheck | `pnpm typecheck` | Exit code 0 |
| Contract test | `pnpm test:contract --tag orders-api-v1` | All tests pass |
| Security scan | `pnpm audit --audit-level=high` | No high-severity vulnerabilities |

**Failure policy:** block-merge.

## Human Verification (Human Gate)

- [ ] Does the new endpoint reject requests with malformed customer IDs in a way that surfaces a useful error to the operator (not a 500)?
- [ ] Does the order-validation business rule correctly reject negative quantities (review against `FR1.1.3`)?
- [ ] Are the audit-log entries readable and useful when viewed in Datadog?

**Failure policy:** block-merge-until-resolved.

## Success Criteria

- Operators can submit a manual order via REST and see it appear in the order-resolution UI within 2 seconds.
- Observation method: telemetry-query (Datadog dashboard `order-intake-rate`).
- Evidence source: link to the dashboard committed in `docs/dashboards/`.

## Rollback

- Strategy: feature-flag-off (`feature.order-intake.rest-v1`).
- Time to rollback: 5 minutes.
```

## Validation rules

- Every AI-Gate check must have a runnable command and a specific expected outcome — "tests pass" alone is rejected.
- Coverage thresholds are numeric percentages with sensible bounds (warn if line < 70% or > 95%).
- Every Human-Gate item is a yes/no question (re-prompted if statement-form).
- Success criteria reference an observation method from the enum + a real evidence source (file, dashboard URL, log-grep target).
- Rollback strategy is required, even if it's `forward-fix-only` (in which case the user must explicitly state why rollback is impossible).
- Regression check list defaults to all prior increments' AI-Gate commands; the user must explicitly prune any.

## Reusable across

- `create-implementation-package` (per-increment authoring loop)
- `greenfield-implementation-package` composition (declared as required elicitation)
