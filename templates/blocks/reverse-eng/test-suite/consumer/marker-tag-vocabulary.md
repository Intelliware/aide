---
slug: marker-tag-vocabulary
title: "Marker / Tag Vocabulary"
applies-to: [re-test-suite-consumer]
requires-decision-from: [code-reader, qe-analyst]
optional: false
order-hint: 160
---

## 6. Marker / Tag Vocabulary (consumer view)

The vocabulary a quality-stage skill must use when authoring new scenarios — controlled tags, free-form tag patterns, and the mandatory tag policy. `create-quality-package` cites these tags in its test-design block; `audit-quality-coverage` consults them when computing per-category coverage; `review-test-failures` uses the severity tag to suggest priority.

This block is canonical. Internal-only tags or in-flight vocabulary additions are filtered out by the RE skill; what consumers see is the agreed-on set.

### Suggested template content

```yaml
---
kind: test-suite
component-id: {{suite-id}}
sub-component: marker-vocabulary
---
```

**Controlled tags (closed vocabulary — bind on consumers):**

| Tag | Meaning | When a consumer MUST apply it |
|---|---|---|
| `@smoke` | Sub-5-minute critical-path scenario | When the new scenario is part of the deploy-gate set |
| `@critical` | Revenue / auth / compliance path | When the new scenario exercises a critical-path journey |
| `@regression` | Full nightly regression | DEFAULT for any scenario not in `@smoke` / `@critical` |
| `@flaky-quarantine` | Known-flaky; do not block | Only when paired with an open quarantine ticket |
| `@wip` | Work-in-progress; local-only | Use during authoring; MUST be removed before merge |

**Free-form patterns (open vocabulary — bind on consumers):**

| Pattern | Purpose | Required? | Example |
|---|---|---|---|
| `@inc-NNN` | Link to an implementation increment | YES — at least one `@inc-*` OR `@ac-*` is mandatory | `@inc-042` |
| `@ac-X.Y.Z` | Link to an acceptance criterion | YES — at least one `@inc-*` OR `@ac-*` is mandatory | `@ac-2.1.3` |
| `@team-X` | Ownership routing | YES | `@team-checkout` |

**Mandatory tag policy (binding on consuming skills):**

Every scenario authored or modified by `create-quality-package` / `execute-quality-increments` MUST carry:

1. Exactly one of `@critical | @regression | @wip | @flaky-quarantine` (severity class).
2. At least one of `@inc-NNN` or `@ac-X.Y.Z` (traceability).
3. Exactly one `@team-X` (ownership).

`audit-quality-coverage` surfaces scenarios that violate the policy as findings.

**Forbidden tags (consuming skills MUST NOT emit):**

| Tag | Why |
|---|---|
| `@skip` | Use `@wip` (in-progress) or `@flaky-quarantine` (with ticket) |
| `@only` | Test-author convenience that must never reach the repo |
| `@pending` | Ambiguous — use `@wip` |
| `@todo` | Ambiguous — use `@wip` |

**How to extend the vocabulary:** consumers do not extend the vocabulary directly. New controlled tags require a PR to the internal view's `marker-tag-vocabulary` block by the suite maintainer; the consumer view is regenerated downstream.

