# Active-Feature Precondition

Shared precondition contract for every feature-aware skill. Defined once here so a
change to the resolution logic (a new failure mode, a new echo format) ripples
through every consuming skill via a single edit, rather than being copy-pasted and
drifting. See `config/SCHEMAS.md` § 2.8 (the registry) and § 2.9 (the active-feature
pointer) for the underlying schema, and `_docs/feature-id-minimal-plan.md` § 7 for
the design rationale.

**Scope note.** Resolving the active feature determines **both** paths a stage
writes to, and they are separate rules in this file. The **per-section working
tree** is `docs/<feature-id>/` (*Resolving the working-tree directory*, below).
The **assembled artifact** gains a `<feature-id>/` directory immediately above it
(*Resolving the assembled artifact path*). Keep the two straight when reading the
mode steps: step 4's echo names whichever of the two the calling skill is about to
write, and for most `create-*` skills that is the assembled path.

## The two-line resolution rule

```
If features.toml is absent  → not opted in. Proceed exactly as before this
                               precondition existed. Skip the rest of this file.
If it is present            → resolve [user].active_feature and follow the mode
                               below that matches this skill.
```

The signal is the file's presence and nothing else. What changed with the bootstrap
default is only *who creates it*: `start-project` now writes an empty `features.toml`
for a genuinely new project, so feature-scoped paths are the default for new
adoption. An absent registry therefore means one of two things — a project that
predates the default, or one that deliberately removed the file — and both must
behave exactly as they did before any of this existed. That guarantee is what makes
the default safe to flip; it is not softened by flipping it.

## Resolving the working-tree directory

Both Mode A and Mode B need the per-section working-tree directory, and on an
opted-in project that directory is `docs/<feature-id>/`. Resolve it in this order:

1. `docs/<feature-id>/` exists → use it. This is the steady state and the common
   case; stop here.
2. Neither exists → create `docs/<feature-id>/`. Ordinary first run for a new
   feature.
3. `docs/<slug>/` exists but `docs/<feature-id>/` does not → this is the feature's
   **pre-opt-in directory**, and the rule below applies. `<slug>` is the feature ID
   with its `FEAT-NNNN-` prefix stripped: `FEAT-0007-notification-mark-as-read`
   yields `notification-mark-as-read`.

Case 3 exists because a project that opts in mid-flight already has a directory
that was named by inference before the registry existed. Creating
`docs/FEAT-0007-notification-mark-as-read/` alongside an existing
`docs/notification-mark-as-read/` would split one feature's work across two trees —
the precise failure this whole change exists to prevent, reintroduced by the fix
for it. So on case 3, **halt** and offer exactly two options:

> `docs/notification-mark-as-read/` already holds this feature's work from before
> the registry existed. Either:
> **(a) rename it** to `docs/FEAT-0007-notification-mark-as-read/` — one
> `git mv`, history preserved, everything registry-bound afterwards; or
> **(b) keep it** where it is, and I will keep using it for this feature.

Both answers are legitimate and neither needs a new registry field. Option (b) is
stable across sessions precisely because the slug is derivable from the ID, so this
same rule re-finds the directory on every subsequent run — which is why the match is
defined on the slug rather than recorded somewhere. This also honours
`config/SCHEMAS.md` § 2.8's promise that artifacts already on disk in a flat layout
"stay where they are and keep working": the framework offers the migration, it never
performs it unasked.

Never resolve case 3 silently in either direction. Renaming a directory the user
did not ask you to rename and starting a second tree beside theirs are both worse
than one question.

## Resolving the assembled artifact path

The assembled per-stage artifact gains a `<feature-id>/` directory immediately above
it. Every feature-scoped composition's `default-output-path` is written in the
**opted-in** form, carrying that segment:

```
{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md
```

**The segment is conditional; the string is not.** Resolve it by the same two-line
rule at the top of this file:

```
features.toml exists       → resolve the segment normally. The path is as written.
features.toml is absent    → drop the <feature-id>/ segment entirely, leaving the
                             flat path the project uses today. The filename keeps
                             its {feature-id}- prefix, exactly as before.
```

Dropping one segment is the whole of the not-opted-in behaviour. A project that never
runs `select-feature` therefore writes byte-for-byte where it writes today, which is
`_docs/feature-id-minimal-plan.md` § 6's central promise and is not negotiable for the
sake of a tidier path string.

Three details that are easy to get wrong:

- **Filenames keep the `{feature-id}-` prefix.** The names are redundant
  (`FEAT-0001-refund/FEAT-0001-refund-requirements.md`) and deliberately so — every
  existing filename stays valid, so only globs that assume directory *depth* break,
  not globs that match on filename. See § 2.1 of the plan.
- **Per-item files never gain a prefix.** `INC-XXX.md`, `TC-XXX.md` and bug-log
  entries are per-feature counters, and the enclosing feature directory is what
  associates them, so `FEAT-0001-alert-customer/INC-001.md` is already unambiguous.
  They gain the enclosing segment, not a prefix.
- **SoD colocate mode is already correct** and changes nothing — it has always nested
  under `<feature-id>/`. In SoD directory mode the segment goes *inside* the
  `<repo-code>/` directory (`<repo-code>/<feature-id>/`), never outside it, because
  `<repo-code>/` is the boundary `[stages.*].write_role` enforces
  (`config/SCHEMAS.md` § 5) and a role check must keep corresponding to a subtree.
  Cross-cutting features nest identically as `_cross-cutting/<feature-id>/`.

## Worked example — one feature, both ways

The two rules above are easier to trust side by side than in isolation. Below is a
single feature, `FEAT-0001-alert-customer`, laid out under both configurations.
This is the only place the opted-in tree is shown end to end: the skills' own
`references/EXAMPLE.md` files all depict the **not-opted-in** column, because that
is what a project gets until someone runs `select-feature`.

Opted in — `features.toml` exists, `[user].active_feature = "FEAT-0001-alert-customer"`:

```
docs/FEAT-0001-alert-customer/          ← working tree, per-section files
  requirements-package/
  design-package/
  CHANGE-TRACKER.md
.framework-output/requirements/FEAT-0001-alert-customer/FEAT-0001-alert-customer-requirements.md
.framework-output/design/FEAT-0001-alert-customer/FEAT-0001-alert-customer-design.md
.framework-output/implementation/FEAT-0001-alert-customer/INC-001.md
```

Not opted in — no `features.toml`, the folder name inferred from the request:

```
docs/alert-customer/                    ← working tree, per-section files
  requirements-package/
  design-package/
  CHANGE-TRACKER.md
.framework-output/requirements/alert-customer-requirements.md
.framework-output/design/alert-customer-design.md
.framework-output/implementation/INC-001.md
```

Three things the comparison makes concrete. The assembled files differ by exactly
one directory level, never by filename — which is why filename globs survive opt-in
and depth-sensitive ones do not. `INC-001.md` gains the segment but no prefix, so
the not-opted-in column has nothing distinguishing it from a second feature's
`INC-001.md`, which is the collision opting in exists to fix. And the working-tree
directory is the one place the two columns disagree on a *name* rather than a
depth, which is why a project opting in mid-flight hits case 3 above and gets asked
before anything moves.

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
- **Authoring the composition path.** This precondition supplies the *rule* for
  resolving the `<feature-id>/` segment (see above); the segment itself is written
  into each composition's `default-output-path`. If a new feature-scoped
  composition omits it, Check N1 fails the build — the guardrail lives in
  `scripts/validate.py` / `validate.js`, not here.
- **Performing the migration.** The reconciliation rule *offers* to rename a
  pre-opt-in directory and honours the answer. It never runs `git mv` unprompted,
  and it does not sweep the project for other unmigrated directories — one feature,
  one question, at the moment that feature is next worked.
- **Feature status/lifecycle.** Out of scope per `_docs/feature-id-minimal-plan.md`
  § 1. This precondition asks "which feature," never "is this feature done."
