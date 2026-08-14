# Active-Feature Precondition

Shared precondition contract for every feature-aware skill. Defined once here so a
change to the resolution logic (a new failure mode, a new echo format) ripples
through every consuming skill via a single edit, rather than being copy-pasted and
drifting. See `config/SCHEMAS.md` § 2.8 (the registry) and § 2.9 (the active-feature
pointer) for the underlying schema, and `_docs/feature-id-minimal-plan.md` § 7 for
the design rationale.

**Phase note.** As of this writing, resolving the active feature does not yet change
*where* any artifact is written — no skill's output paths carry a `<feature-id>/`
segment yet (that is `_docs/feature-id-minimal-plan.md` phase 3). This precondition's
job in phase 2 is narrower: make every feature-aware skill *know* the active feature
and refuse to guess when it doesn't, so phase 3 has something correct to build on.

## The two-line resolution rule

```
If features.toml is absent  → not opted in. Proceed exactly as before this
                               precondition existed. Skip the rest of this file.
If it is present            → resolve [user].active_feature and follow the mode
                               below that matches this skill.
```

A project that has never run `select-feature` is never affected by anything in this
document — the check is the first line, and it is a pure no-op for that project.

## Mode A — Write-side (select-and-create)

Applies to skills that produce new artifacts:
`create-requirements-package`, `create-design-package`, `create-implementation-package`,
`create-quality-package`, `execute-increments`, `execute-quality-increments`,
`document-quick-change`, `plan-quick-change`, `execute-quick-change`, `manage-bugs`,
`create-pr`.

1. If `features.toml` is absent, proceed as today. Stop here.
2. Resolve `[user].active_feature` from `project.user.toml`.
3. If unset, or set to a value not present in `features.toml`: **halt.**
   > No active feature. Run `select-feature`, then re-run this skill.

   Invoke `select-feature` by name, passing this skill's own name (as `caller`) and
   the user's request text (as `description`, if one exists in this turn). **Do not**
   invent an ID and **do not** fall back to a slug derived from the request — that
   silent-guess behaviour is the exact defect this precondition exists to close.
4. If it resolved cleanly, **echo** the feature ID and the resolved output
   directory before the first write:

   > Working feature: `FEAT-0001-alert-customer`. Artifacts will be written under
   > `.framework-output/design/FEAT-0001-alert-customer/`.

   Cheap, no round-trip in the common case, and it catches a stale pointer at the
   one moment it matters — before anything lands in the wrong place.

`select-feature` closes with `## Next skill\n<caller>` once a feature is active, so
the user is carried straight back into the skill that halted.

## Mode B — Read-side (select-only)

Applies to skills that only read/audit existing artifacts and to the review gates
that write verdict files (which are working artifacts, not deliverables — see
`config/SCHEMAS.md` § 2.8):
`review-requirements-package`, `review-design-package`, `review-implementation-package`,
`review-quality-package`, `audit-quality-coverage`.

Identical to Mode A, with one difference at step 3: **suppress create.** Reviewing or
auditing is not a reason to mint a feature that has nothing to review yet, so
`select-feature` is invoked with `caller_mode = select-only` and its create path is
unreachable for this call. If the registry is genuinely empty, the halt message
changes to name the producing skill instead:

> No active feature, and no features are registered yet. Run the stage's `create-*`
> skill first.

Step 4's echo applies identically, before the skill's first **read** rather than its
first write — a review run against the wrong feature returns a confident verdict
about the wrong artifacts, which is as damaging as a misplaced write and harder to
notice.

## Mode C — Probe-only (framework-navigator)

`framework-navigator` does not halt and does not write anything (see its own
`## Output` contract: "Side effects: none"). It resolves the active feature the same
way — `features.toml` present, `[user].active_feature` set and valid — purely to
inform its recommendation and its per-feature state-probe output. When no feature
resolves, the navigator's answer is a *recommendation* to run `select-feature`, not a
halt: the navigator's whole job is answering "what should I do next," and "select a
feature" is a legitimate answer, not a failure. See
`.agents/skills/meta/framework-navigator/references/state-probe.md`.

## Explicitly not this precondition's job

- **Minting logic.** All of it — ordinal allocation, slug proposal, registry
  writes — lives in `select-feature`. This precondition only decides *whether* to
  call it and in which mode.
- **Path construction.** Building the actual `<feature-id>/`-scoped path is phase 3
  work. This precondition resolves *which* feature-id string is active; it does not
  yet change any `default-output-path` or step-file path string.
- **Feature status/lifecycle.** Out of scope per `_docs/feature-id-minimal-plan.md`
  § 1. This precondition asks "which feature," never "is this feature done."
