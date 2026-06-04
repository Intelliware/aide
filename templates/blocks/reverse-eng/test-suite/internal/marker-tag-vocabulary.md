---
slug: marker-tag-vocabulary
title: "Marker / Tag Vocabulary"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader, qe-analyst]
optional: false
order-hint: 190
---

## 9. Marker / Tag Vocabulary

Tags / markers / annotations are the suite's runtime filter language. Document every tag the suite recognises, what it means, where it's used, and whether it's free-form or controlled. CI invocations target subsets of the suite via these tags, so vocabulary drift here directly produces drift in what CI runs.

Split into controlled (closed set; new entries require a vocabulary update) and free-form (open set; intended for ad-hoc grouping). Lock the controlled vocabulary down — `@smoke`, `@critical`, `@regression`, `@flaky-quarantine` are the kind of tags whose meaning must be unambiguous.

### Suggested template content

**Controlled tags (closed vocabulary):**

| Tag | Meaning | Mandatory on | CI invocation | Notes |
|---|---|---|---|---|
| `@smoke` | Sub-5-minute smoke pack | Critical-path scenarios | `{{smoke-cmd}}` | Failures block deploy |
| `@critical` | Revenue / auth / compliance path | All scenarios touching these paths | `{{critical-cmd}}` | Failures page on-call |
| `@regression` | Full regression suite | All scenarios | `{{regression-cmd}}` | Nightly |
| `@flaky-quarantine` | Known-flaky; do not block on failure | Quarantined scenarios | Excluded from `@regression` | Must have an open quarantine ticket |
| `@wip` | Work-in-progress; do not run in CI | Scenario under active authoring | Excluded from all CI runs | Local-only; removed before merge |
| `{{tag-N}}` | {{meaning-N}} | {{mandatory-on-N}} | `{{ci-cmd-N}}` | {{notes-N}} |

**Free-form tags (open vocabulary, intentional):**

| Pattern | Purpose | Example |
|---|---|---|
| `@inc-NNN` | Map scenario to an increment | `@inc-042` |
| `@ac-X.Y.Z` | Map scenario to an acceptance criterion | `@ac-2.1.3` |
| `@team-X` | Ownership routing | `@team-checkout` |
| `@env-X` | Environment-specific (rare; prefer profile) | `@env-prod-readonly` |

**Mandatory tag policy:**

Every scenario MUST carry:

1. Exactly one of `@critical | @regression | @wip | @flaky-quarantine` (severity class).
2. At least one `@inc-NNN` or `@ac-X.Y.Z` (traceability).
3. Exactly one `@team-X` (ownership).

Scenarios missing any of these are surfaced as findings by `audit-quality-coverage`.

**Forbidden tags:** {{forbidden — e.g. "`@skip`, `@pending`, `@only`, `@todo` — use `@wip` for in-progress work; quarantine flakes via `@flaky-quarantine` with a ticket"}}

**Vocabulary change procedure:**

1. New controlled tags require a PR to this block.
2. The PR must include the migration of any pre-existing scenarios that should carry the new tag.
3. CI invocations consuming the tag must be added in the same PR.

