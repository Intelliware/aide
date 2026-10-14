---
name: review-test-failures
description: "Use when the user asks to review test failures, analyse why tests failed, triage failed scenarios, walk through defects, or determine root cause of a failing run; says 'my tests failed', 'analyse the failures', 'review the failures', 'what went wrong', 'triage the failed scenarios', or after execute-quality-increments / execute-increments / a CI run hands off with failure details. Walks through each failure one at a time, classifies as script issue / application defect / environment-or-data / flaky, proposes a remediation routed to a named framework skill, and waits for explicit user approval before advancing. Outputs a structured summary with action items grouped by routing target."
---

# Review Test Failures

## Overview

Interactively walks through a set of test failures one at a time,
classifies each (script issue / application defect / environment-or-
data / flaky), proposes a concrete remediation routed to a named
framework skill, and obtains explicit user approval before recording
the verdict and advancing to the next failure.

Produces a final summary table grouped by routing target so the user
can invoke each downstream skill (`execute-quality-increments`,
`execute-increments`, `manage-bugs`) once with all related findings,
rather than chasing failures one-by-one.

This skill is **read-only**. It does not modify test code, application
code, fixtures, logs, screenshots, the KB, the implementation package,
or the assembled quality package. The only write it ever performs is
the single `Failure triage` row it appends to the quality package's
`change-tracker.md` after the final summary lands.

## When to use

- After `execute-quality-increments` reports failures
- After `execute-increments` reports failing tests in a TDD red phase
  that the user is unsure how to interpret
- After a CI test run produces a failure set the user wants triaged
- User provides raw test output, a results directory, or screenshots
  and asks for triage
- User says "my tests failed", "analyse the failures", "review the
  failed scenarios", "what went wrong"

## When NOT to use

- The user wants to **build or amend** test artifacts —
  `execute-quality-increments` (TC flow) or `execute-increments`
  (inline tests)
- The user wants to **execute** the test suite — invoke their
  test-runner directly (the framework does not own a test-execution
  skill; the quality package's `automation-and-cicd` block pins the
  command)
- The user wants to **audit coverage** — `audit-quality-coverage`
- The user wants to **review the quality package** —
  `review-quality-package`
- The user wants to **log a single bug** — `manage-bugs`. (This
  skill triages whole batches of failures and *routes* application
  defects to `manage-bugs` as part of its summary.)
- The user wants to **refresh the KB** — `update-knowledge-base` or
  `detect-knowledge-base-drift`
- There are no failures to review

## Inputs

| Input | Source | Required |
|---|---|---|
| Failure set | Hand-off from `execute-quality-increments` / `execute-increments` / a CI run, or user-provided | Yes |
| Quality package automation-and-cicd block | `{paths.quality_package}/<feature-id>/quality/automation-and-cicd.md` | Yes — pins evidence locations (reports, logs, screenshots) |
| Failure categories taxonomy | `references/failure-categories.md` (generic) + `templates/blocks/quality/failure-categories.md` (team-overridable) | Yes |
| `project.toml` | `{project-root}/project.toml` | Yes |
| Per-test reports, execution log, screenshots | paths declared in automation-and-cicd | Recommended — drives evidence-first triage |
| Knowledge base | `{paths.knowledge_base_path}/` via `navigate-knowledge-base --profile=test-suite` (with `--profile-subkind=shared-utilities` for locator / fixture lookup during classification) | Optional — cross-references shared utilities, known patterns, prior-failure history |
| Test suite codebase | `[project.testing].qe_repo` resolved through `[[project.repos]]`; fallback to in-scope code repo when unset | Optional — direct lookup of locators / fixtures / shared helpers when the KB is unavailable |

See `references/INPUTS-OUTPUTS.md` for the full table.

## Verification rule (always-on)

Walk failures **one at a time**. Never dump a batch of classifications
and ask the user to react in bulk — that is the single most common
way to mis-classify. After every proposed classification, wait for
explicit `APPROVED` or `user-override`. Before closing the skill,
summarise the triage results, the actions taken, and the audit
record location; wait for user acknowledgement before terminating.

## Precondition — active feature

Follow `references/ai-principles/feature-precondition.md` Mode B, before Step 0. If
`features.toml` is absent, skip feature resolution, but still map this skill's paths per
that file's § *Not opted in* before reading or writing — they are spelled in the
opted-in form. If present and `[user].active_feature` does not resolve, halt and invoke `select-feature` in select-only mode (`caller:
review-test-failures`) rather than guessing which feature's failures are being triaged —
do not fall back to creating one, because a run with failures to triage already has a
quality package. If it resolves, echo the feature ID and the resolved
`automation-and-cicd` path before reading any evidence.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Read each step file only when starting
that step.

1. `steps/01-gather-failure-data.md` — Resolve the failure source,
   read the evidence locations pinned in the quality package, build
   the canonical failure list, decide whether to bulk-mode-group, and
   warm up the KB if available.
2. `steps/02-walk-failures.md` — Present each failure in turn with
   full evidence (one at a time, never a dump); hand control to
   Step 3 for classification; advance only after Step 3 records the
   user's verdict.
3. `steps/03-classify-and-remediate.md` — Match the failure against
   the failure-categories taxonomy (team override > package block >
   framework default); cross-reference the KB; compute disposition +
   routing; present classification + remediation; obtain explicit
   approval; append to the running summary; return to Step 2.
4. `steps/04-final-summary.md` — Render the consolidated triage
   summary, group action items by routing target, append the
   `Failure triage` row to `change-tracker.md`, and offer to invoke
   the next-action skills.

## Output

| Artifact | Destination | Format |
|---|---|---|
| Per-failure presentation + classification | Chat (interactive) | Markdown block per failure |
| Running summary table | Chat | Markdown table, grown one row at a time |
| Final summary block + action items | Chat | Markdown — summary + disposition counts + routed action items |
| `change-tracker.md` row | `{paths.quality_package}/<feature-id>/quality/change-tracker.md` | Markdown table — single row recording the triage (Trigger note: `Failure triage`) |

## Next skill

Selected per the routing target the user approved (the skill offers
to invoke; the user picks):

- **Script issue** → `execute-quality-increments` (if the team uses
  the TC-XXX flow) or `execute-increments` (inline-tests mode)
- **Application defect** → `manage-bugs`
- **Environment / data** → manual environment fix; if recurring,
  `manage-bugs` to track it as an environment bug
- **Flaky / non-deterministic** → `execute-quality-increments` to
  harden the test (never silently retry)
- **All addressed / user deferred** → exit; the chat summary + the
  `change-tracker.md` row are the persistent record

## Common mistakes

- **Dumping the whole batch.** Always one failure at a time. Bulk
  presentation = bulk mis-classification.
- **Inventing causes.** Every classification must cite the specific
  evidence (error line, log excerpt, screenshot, KB component) that
  drove the match. No vague "looks like a timing issue".
- **Auto-creating bugs.** This skill routes application defects to
  `manage-bugs`; it never writes to the bug log itself. The user
  confirms each bug at invocation time.
- **Hard-coding paths or framework names.** Evidence locations come
  from the quality package's `automation-and-cicd` block and the
  resolved test-suite repo (`[project.testing].qe_repo` when set, otherwise
  code-repo fallback); the
  category taxonomy can be overridden by the team. Read both; do
  not assume.
- **Treating "all failures are app defects" as plausible.** A
  previously-green suite that suddenly turns mostly red is usually
  an environment or script issue. Challenge bulk-app-defect
  patterns before accepting them.
- **Skipping the change-tracker row when the user defers all
  actions.** The triage still happened — record it.
- **Using "phase" terminology.** This skill uses "step", "increment",
  "stage", "disposition" per framework vocabulary.

