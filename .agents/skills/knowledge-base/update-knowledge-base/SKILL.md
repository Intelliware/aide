---
name: update-knowledge-base
description: "Use when a feature has just shipped and the KB must be brought back into sync — invoked as the closing step of execute-increments or execute-quick-change. Updates only the components matched by the diff, appends to change-tracker, emits an ADR if a threshold is crossed, and incrementally regenerates graph.json and the capability index. Never re-runs a full build."
---

# Update Knowledge Base

Closing skill at the end of execution flows. After a feature has shipped,
this skill brings the KB back into sync with reality — incrementally,
touching only the components matched by the change. It is the inverse of
`build-knowledge-base`: surgical, scoped, and **never** regenerates the
whole KB.

## Overview

A KB that is out of sync with the code is worse than no KB — it leads agents
to wrong conclusions with confidence. This skill keeps the KB current by
processing each shipped feature individually:

1. Classify the diff against the KB component map (which components have
   `paths:` matching the changed files).
2. Re-derive the affected components' frontmatter and bodies.
3. Append a CHANGE-TRACKER row.
4. Emit an ADR if a decision threshold was crossed (new external dep,
   replaced framework, new auth model, etc.).
5. Regenerate `graph.json` for changed edges only.
6. Regenerate ARCHITECTURE.md's capability-index slice if any component's
   triggers changed.
7. Validate the update doesn't orphan anything.

The `--scope=catalog-only` mode is a lighter version invoked by
`execute-quick-change`: it updates only the catalog (description,
last_feature_id, last_verified_against_commit) and the change-tracker, and
skips body re-derivation and ADR emission.

**The set of components touched is the same in both modes** — the
affected-component set Step 1 derives by intersecting the feature's diff
against each component's `paths:` glob. `--scope=catalog-only` does not
re-attest components whose `paths:` did not match the diff, even if their
`last_verified_against_commit` is stale relative to current source HEAD.
Sweeping stale stamps independent of a shipping feature is a
`verify-knowledge-base-coverage` job, not this skill's responsibility.

## When to use

- An execute flow has just finished and reports an implementation
  increment plus a git diff — call this as the closing step.
- A merge-commit has landed on the trunk branch and the post-merge hook
  invokes this skill.
- A retroactive sync is needed because the user shipped a change without
  running through the framework — pass the merge SHA and feature ID.

## When NOT to use

- The KB does not exist yet — run `build-knowledge-base`.
- The change is so large it touches >50% of components — run
  `build-knowledge-base` in overwrite mode instead. (Threshold: if the
  diff modifies files matching >50% of all components' `paths:`, refuse
  to update and recommend a rebuild.)
- The agent is reading the KB, not writing — use `navigate-knowledge-base`.
- A drift alert was raised but no specific feature shipped — use
  `detect-knowledge-base-drift` to investigate.
- You want to sweep stale `last_verified_against_commit` stamps across the
  KB without a feature shipping — use `verify-knowledge-base-coverage`
  instead. This skill only re-attests components matched by a feature's
  diff; it is not a stale-stamp sweeper.

## Inputs

| Input | Source | Required |
|---|---|---|
| Implementation increment | execute-increments output | Yes (full) / partial (catalog-only) |
| Git diff (changed files + line ranges) | git or supplied directly | Yes |
| Source repo identifier + commit SHA(s) | execute output / git | Yes |
| Original requirement / feature ID | caller / increment | Yes |
| Previous KB component manifest | `<knowledge_base_path>/components/**/*.md` | Yes (read in step 1) |
| Optional test/spec files added or changed | git diff | No |
| `--scope` flag | caller | No (default `full`; `catalog-only` from `execute-quick-change`) |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time.

1. **Classify diff** — `steps/01-classify-diff.md`
2. **Update components** — `steps/02-update-components.md`
3. **Append change-tracker** — `steps/03-append-change-tracker.md`
4. **Emit ADR if threshold crossed** — `steps/04-emit-adr-if-threshold.md`
5. **Update graph.json (incremental)** — `steps/05-update-graph.md`
6. **Update ARCHITECTURE.md capability index** — `steps/06-update-architecture-index.md`
7. **Validate** — `steps/07-validate.md`

In `--scope=catalog-only` mode: run only steps 1, 2 (catalog fields only),
3, and 7. Skip 4, 5, 6.

## Output

- Updated component frontmatter and bodies for affected components.
- New row appended to `<knowledge_base_path>/change-tracker.md`.
- Optional new ADR at `<knowledge_base_path>/shared/adrs/ADR-NNNN-<slug>.md`.
- Incrementally updated `<knowledge_base_path>/graph.json`.
- Optionally updated `<knowledge_base_path>/ARCHITECTURE.md` Capability
  Index slice (§ 4 only).
- Update report listing: components updated, edges added/removed, ADRs
  emitted, change-tracker row, validation result.

## Next skill
none — invoked as a closing step. Optionally hands off to
`detect-knowledge-base-drift` for an immediate post-update sweep.

## Common mistakes

- **Editing existing ADRs.** ADRs are append-only. Status changes (to
  `superseded by ADR-XXXX`) are the ONLY edit permitted. Step 4
  enforces this.
- **Hand-editing the capability index.** The index is regenerated from
  current frontmatter in step 6 — never hand-edit. If the desired
  capability vocabulary doesn't appear in any component's triggers,
  update the triggers.
- **Skipping change-tracker.** Step 3 is non-optional. The tracker is
  the audit log; missing rows compound into drift.
- **Updating components whose `paths:` did not match the diff.** Step 1
  is the gatekeeper. If the diff didn't touch `paths:`, the component
  doesn't change — even in `--scope=catalog-only` mode, even if the
  component's `last_verified_against_commit` is stale relative to current
  source HEAD. Re-attesting "every stale-SHA component in the repo" is
  out-of-contract for this skill; for that, see
  `verify-knowledge-base-coverage`.
- **Bumping `last_verified_against_commit` without re-deriving triggers /
  description / depends_on.** In `--scope=full`, all derived fields are
  re-checked against the new code state. In `catalog-only`, only the
  stamp moves.
- **Running this skill on a half-merged feature branch.** Pass the
  merge-commit SHA, not a feature-branch HEAD — the `last_verified_against_commit`
  must be a SHA on the trunk.
- **Letting the diff classify into >50% of components without
  intervening.** If the diff is that broad, refuse and recommend
  `build-knowledge-base` in overwrite mode.
