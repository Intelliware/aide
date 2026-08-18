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
2. It does not exist → apply the reconciliation check below, then create
   `docs/<feature-id>/`.

**Because the feature ID *is* the directory name, case 1 absorbs most of the
mid-flight adoption problem by itself.** A project that opts in after improvising
`docs/refunds/` keeps working the moment its feature is minted as `refunds`: the
directory already matches, nothing is renamed, and there is nothing to reconcile.
That is why `select-feature` proposes an existing `docs/` directory name as the slug
rather than deriving one from the title — the proposal is what steers the common
case into case 1, so treat it as load-bearing rather than a convenience.

**Reconciliation, for the case the proposal did not catch.** A registry hand-written
without `select-feature`, or a slug the user deliberately overrode, can leave a
feature whose ID does not match the directory holding its work. Creating
`docs/refund-processing/` next to an existing `docs/refunds/` would split one
feature across two trees — the precise failure this whole mechanism exists to
prevent, reintroduced by the fix for it. So before creating, check whether `docs/`
holds any directory that is **not** a registered feature ID (the registry lists
every legitimate name, so this set is exact). If one plausibly holds this feature's
work, **halt** and offer two options:

> `docs/refunds/` holds work that looks like this feature, but the active feature is
> `refund-processing`, so I would create a second directory beside it. Either:
> **(a) rename the directory** to `docs/refund-processing/` — one `git mv`, history
> preserved; or
> **(b) rename the feature** to `refunds` in `features.toml` and `active_feature`,
> leaving the directory untouched.

Both answers end with the ID and the directory in agreement, so case 1 handles every
subsequent run and no registry field records an exception. That symmetry is a
consequence of the ID being the directory name: under the retired ordinal-prefixed
format only (a) was really available, because "keep the old directory" meant binding
an ID to a differently-named directory forever, and the binding had to be
re-derived by stripping the prefix on every run.

Option (b) has one precondition: it is safe only while **no artifacts exist under
the current ID**, on either the working-tree or the assembled side. If some do, the
rename strands them, and (a) is the only correct answer. Check before offering it.

Never resolve this silently in either direction. Renaming a directory the user did
not ask you to rename and starting a second tree beside theirs are both worse than
one question. Listing a non-feature directory as a candidate is a normal outcome of
`docs/` holding hand-written folders too — offer "none of these" and move on. This
also honours `config/SCHEMAS.md` § 2.8's promise that artifacts already on disk in a
flat layout "stay where they are and keep working": the framework offers the
migration, it never performs it unasked.

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
  (`refund/refund-requirements.md`) and deliberately so — every existing filename
  stays valid, so only globs that assume directory *depth* break, not globs that
  match on filename. See § 2.1 of the plan.
- **Per-item files never gain a prefix.** `INC-XXX.md`, `TC-XXX.md` and bug-log
  entries are per-feature counters, and the enclosing feature directory is what
  associates them, so `alert-customer/INC-001.md` is already unambiguous. They gain
  the enclosing segment, not a prefix.
- **SoD colocate mode is already correct** and changes nothing — it has always nested
  under `<feature-id>/`. In SoD directory mode the segment goes *inside* the
  `<repo-code>/` directory (`<repo-code>/<feature-id>/`), never outside it, because
  `<repo-code>/` is the boundary `[stages.*].write_role` enforces
  (`config/SCHEMAS.md` § 5) and a role check must keep corresponding to a subtree.
  Cross-cutting features nest identically as `_cross-cutting/<feature-id>/`.

## Worked example — one feature, both ways

The two rules above are easier to trust side by side than in isolation. Below is a
single feature, `alert-customer`, laid out under both configurations. This is the
only place the opted-in tree is shown end to end: the skills' own
`references/EXAMPLE.md` files all depict the **not-opted-in** column, because that
is what a project gets until someone runs `select-feature`.

Opted in — `features.toml` exists, `[user].active_feature = "alert-customer"`:

```
docs/alert-customer/                    ← working tree, per-section files
  requirements-package/
  design-package/
  CHANGE-TRACKER.md
.framework-output/requirements/alert-customer/alert-customer-requirements.md
.framework-output/design/alert-customer/alert-customer-design.md
.framework-output/implementation/alert-customer/INC-001.md
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

**The two columns differ by exactly one directory level and nothing else.** No file
is renamed and the working-tree directory is identical, because the inferred folder
name and the registry ID are now the same kind of string — a kebab slug. That is the
single largest practical consequence of dropping the ordinal prefix: under it, the
opted-in column repeated an ordinal-prefixed ID in both the directory and the
filename, so opting in changed the depth *and* the filename *and* the working-tree
directory name, and this section's claim that the columns "differ by exactly one
directory level, never by filename" was not actually true of its own example.

Two consequences worth holding onto. Filename globs survive opt-in unconditionally,
and only depth-sensitive ones break. And `INC-001.md` gains the segment but no
prefix, so the not-opted-in column has nothing distinguishing it from a second
feature's `INC-001.md` — that collision is what opting in exists to fix, and it is
now the *only* thing opting in changes.

## Mode A — Write-side (select-and-create)

Applies to skills that may legitimately need to **mint** a feature — those producing a
feature's first artifact, where nothing upstream exists to select from:
`create-requirements-package`, `create-design-package`, `create-implementation-package`,
`create-quality-package`, `document-quick-change`, `execute-quick-change`, `manage-bugs`.

**The A/B split turns on whether minting is legitimate, not on whether the skill writes.**
Both modes write and both halt. A skill operating on an artifact that must already exist — a
spec to load, increments to run, a log to open, a diff to describe — belongs in Mode B even
though it writes plenty. The skill's own halt message is the tell: "rather than guessing which
feature's X" means X pre-exists, so Mode B; "rather than inventing a feature ID" means nothing
pre-exists, so Mode A.

`execute-quick-change` and `manage-bugs` sit here pending a decision. Both read artifacts that
must already exist, so by the rule above both are Mode B candidates; `manage-bugs` is the
harder call because it is independently invocable and may be the first thing run on a project.

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

   > Working feature: `alert-customer`. Artifacts will be written under
   > `.framework-output/design/alert-customer/`.

   Cheap, no round-trip in the common case, and it catches a stale pointer at the
   one moment it matters — before anything lands in the wrong place.

`select-feature` closes with `## Next skill\n<caller>` once a feature is active, so
the user is carried straight back into the skill that halted.

## Mode B — Select-only (the feature already exists)

Applies to skills whose feature necessarily already exists, because they operate on
something an earlier skill produced: the read/audit skills, the review gates that write a
verdict file or a tracker row (working artifacts, not deliverables — see
`config/SCHEMAS.md` § 2.8), and the execution skills that work a plan written upstream.
`review-requirements-package`, `review-design-package`, `review-implementation-package`,
`review-quality-package`, `audit-quality-coverage`, `review-test-failures`,
`plan-quick-change`, `execute-increments`, `execute-quality-increments`, `create-pr`.

**How much a skill writes is irrelevant to the mode.** `execute-increments` writes
production code and is still Mode B: increments to run cannot exist without a package that
named them, so minting a feature here would produce one with nothing to execute.

Identical to Mode A, with one difference at step 3: **suppress create.** Needing something
to read is not a reason to mint a feature that has nothing in it yet, so `select-feature`
is invoked with `caller_mode = select-only` and its create path is unreachable for this
call. If the registry is genuinely empty, the halt message changes to name the producing
skill instead:

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

- **Minting logic.** All of it — slug proposal, the uniqueness check, registry
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
