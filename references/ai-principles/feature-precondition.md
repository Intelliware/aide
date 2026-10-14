# Active-Feature Precondition

Shared precondition contract for every feature-aware skill. Defined once here so a
change to the resolution logic (a new failure mode, a new echo format) ripples
through every consuming skill via a single edit, rather than being copy-pasted and
drifting. See `config/SCHEMAS.md` § 2.8 (the registry) and § 2.9 (the active-feature
pointer) for the underlying schema, and `_docs/feature-id-minimal-plan.md` § 7 for
the design rationale.

**Scope note.** On an opted-in project, resolving the active feature determines
**one directory per stage** — the **stage feature directory** — and everything that
stage produces for the feature lands inside it: the assembled artifact *and* the
per-section working tree (block files, discovery and analysis notes, change and
completeness trackers, review findings). For a legacy-mode stage it is
`{paths.<stage>_package}/<feature-id>/`, so it follows `[project.paths]` into
whatever directory — or repository — the project points that stage at. See
*Resolving the stage feature directory*, below. Projects that have not opted in keep
the pre-existing split layout (*Not opted in*, below) — except quick-dev, which
follows `project.toml` in both cases (*Quick-dev layout*, below).

## The two-line resolution rule

```
If features.toml is absent  → not opted in. Skip feature resolution and the
                               modes below, but map every path per *Not opted
                               in* (quick-dev: *Quick-dev layout*) — skill text
                               spells paths in the opted-in form.
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

## Resolving the stage feature directory

Every stage writes one directory per feature, and on an opted-in project both the
assembled artifact and the working tree live inside it. Resolve it by the stage's
mode — the same resolution the stage's `00-scope-target-repo` step already performs
for the assembled artifact:

| Stage mode | Stage feature directory |
|---|---|
| Legacy (no SoD fields on `[stages.<stage>]`) | `{paths.<stage>_package}/<feature-id>/` |
| SoD directory mode, single-repo | `<host-repo>/<artifact_subdir>/<stage>/<repo-code>/<feature-id>/` |
| SoD directory mode, cross-cutting | `<host-repo>/<artifact_subdir>/<stage>/_cross-cutting/<feature-id>/` |
| SoD colocate mode | `<source-repo-path>/<artifact_subdir>/<stage>/<feature-id>/` |

Which `[project.paths]` key a stage uses:

| Stage / skill family | Key | Sub-directories inside the stage feature directory |
|---|---|---|
| Requirements (`create-` / `review-requirements-package`) | `requirements_package` | `discovery/`, `analysis/`, `requirements/`, `review/` |
| Design (`create-` / `review-design-package`) | `design_package` | `discovery/`, `design/` (incl. `design/adr/` fallback), `review/` |
| Quality (`create-` / `review-quality-package`, `execute-quality-increments`, `audit-quality-coverage`, `review-test-failures`) | `quality_package` | `quality/` (incl. `quality/plan/`), `review/` |
| Implementation (`create-` / `review-implementation-package`, `execute-increments`, `manage-bugs`) | `implementation_package` | `plan/` — per-increment files sit at the directory root |
| Quick-dev (`document-` / `plan-` / `execute-quick-change`) | per artifact — `requirements_package` for the spec and `CHANGE-TRACKER.md`, `implementation_package` for the plan, orientation notes and review files | none — see *Quick-dev layout*, below |

**Skills spell these paths in the legacy-mode form** (`{paths.design_package}/<feature-id>/design/…`).
When the stage runs in SoD mode, substitute the directory resolved by its
`00-scope-target-repo` step for the `{paths.<key>}/<feature-id>/` prefix; the rest of
the path is unchanged. Because `[project.paths]` (or the SoD host repo) decides the
prefix, a stage pointed at a sibling repository writes its working files there too —
nothing feature-scoped is written to `{project-root}/docs/` on an opted-in project.

**Code is unaffected.** This rule governs framework documents only. Source and test
code still go wherever the target repository's own layout says, resolved through
`[[project.repos]]` / `[project.testing].qe_repo`; the feature ID never becomes a
segment of a code path.

Resolve the directory in this order:

1. The stage feature directory exists → use it. This is the steady state; stop here.
2. It does not exist → apply the legacy-tree check below, then create it.

**Legacy-tree check.** Before 2.7.0, an opted-in project kept its working tree at
`docs/<feature-id>/<legacy-package-dir>/` (the legacy names are in *Not opted in*,
below), and a project that improvised its layout before opting in may hold the same
work under a differently-named `docs/<name>/`. Creating a fresh stage feature
directory beside either would split one feature across two trees — the precise
failure this mechanism exists to prevent. So before creating, check `docs/` for:

- `docs/<feature-id>/<legacy-package-dir>/` for this stage, and
- any `docs/<name>/<legacy-package-dir>/` where `<name>` is **not** a registered
  feature ID (the registry lists every legitimate name, so this set is exact) and
  the contents plausibly belong to this feature.

If one is found, **halt** and offer:

> `docs/refunds/requirements-package/` holds requirements work that looks like this
> feature (`refund-processing`). Feature work now lives in
> `.framework-output/requirements/refund-processing/`. Either:
> **(a) move it there** — one `git mv` per sub-directory, history preserved; or
> **(b) stop here** so you can move or archive it yourself.

Never resolve this silently. Moving a directory the user did not ask you to move and
starting a second tree beside theirs are both worse than one question. Listing a
non-feature directory as a candidate is a normal outcome of `docs/` holding
hand-written folders too — offer "none of these" and continue. This honours
`config/SCHEMAS.md` § 2.8's promise that artifacts already on disk "stay where they
are and keep working": the framework offers the migration, it never performs it
unasked, and it asks once per feature per stage, at the moment that stage is next
worked.

## Resolving the assembled artifact path

The assembled per-stage artifact sits at the root of the stage feature directory.
Every feature-scoped composition's `default-output-path` is written in the
**opted-in** form, carrying the `<feature-id>/` segment:

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

**No alias files on an opted-in project.** The `docs/` alias files
(`requirements-package/requirements-package.md`, `solutions-package/solution-package.md`)
existed only to point from the working tree at an assembled artifact in another
tree. With both in one directory there is nothing to point across, so opted-in
skills write no alias, and every consumer — review skills included — reads the
assembled artifact by its canonical path.

## Not opted in

Without `features.toml` there is no active feature to resolve: no Mode A or Mode B,
no `select-feature`, no echo. The project keeps the layout it had before feature
scoping existed, byte for byte — `_docs/feature-id-minimal-plan.md` § 6's central
promise. This section and *Quick-dev layout* are the parts of the file that still
apply, because skill text spells every path in the opted-in form and the table below
is how a not-opted-in run turns those into the layout it actually has:

- The assembled artifact drops the `<feature-id>/` segment (above).
- The working tree stays under `docs/<name>/<legacy-package-dir>/`, where
  `<name>` is reused from an existing `docs/` folder or inferred from the
  request as a kebab slug and confirmed with the user. Skill text spells working-tree
  paths in the opted-in form; map them back with this table:

| Opted-in prefix | Not-opted-in prefix (`<legacy-package-dir>`) |
|---|---|
| `{paths.requirements_package}/<feature-id>/` (requirements) | `docs/<name>/requirements-package/` |
| `{paths.design_package}/<feature-id>/` | `docs/<name>/solutions-package/` |
| `{paths.quality_package}/<feature-id>/` | `docs/<name>/quality-package/` |
| `{paths.implementation_package}/<feature-id>/` | `{paths.implementation_package}/` (no working tree under `docs/`) |

- The alias files are still written, because the two trees are still separate.
- **Quick-dev is the exception.** It no longer uses `docs/<name>/quick-dev-package/`;
  it follows `project.toml` with `<name>` in place of `<feature-id>`. See
  *Quick-dev layout*, below.

The working tree cannot simply follow `[project.paths]` here: with the segment
dropped, every feature's working files would land in the same stage directory and
collide. Keeping them under a per-feature `docs/` folder is what made the flat
layout work, so it stays.

**The split is deliberate.** A project without `features.toml` was promised the
layout it already had (`_docs/feature-id-minimal-plan.md` § 6), and moving its
working tree would relocate files that existing runs, links and reviewers already
point at. A not-opted-in run that leaves its working files under `docs/<name>/`
while the assembled artifact goes to the configured `[project.paths]` directory —
possibly another repository — is therefore behaving as specified, not reproducing
the defect 2.7.0 fixed. One tree per stage is what opting in buys: add a
`features.toml` (its presence is the only signal, so an empty file is enough;
`start-project` writes one for new projects).

## Worked example — one feature, both ways

Below is a single feature, `alert-customer`, laid out under both configurations.
This is the only place the opted-in tree is shown end to end: the skills' own
`references/EXAMPLE.md` files all depict the **not-opted-in** layout, because that
is what a project gets until someone runs `select-feature`.

Opted in — `features.toml` exists, `[user].active_feature = "alert-customer"`, all
stages in legacy mode with the default `[project.paths]`:

```
.framework-output/requirements/alert-customer/
  alert-customer-requirements.md        ← assembled artifact
  discovery/  analysis/  requirements/  review/
.framework-output/design/alert-customer/
  alert-customer-design.md
  discovery/  design/  review/
.framework-output/implementation/alert-customer/
  INC-001.md  increment-status.md  plan/
```

Point `design_package` at `{project-root}/../design-docs/aide` and the whole design
directory — assembled artifact and working tree alike — moves into that repository
as `../design-docs/aide/alert-customer/`.

Not opted in — no `features.toml`, the folder name inferred from the request:

```
docs/alert-customer/                    ← working tree, per-section files
  requirements-package/
  solutions-package/
.framework-output/requirements/alert-customer-requirements.md
.framework-output/design/alert-customer-design.md
.framework-output/implementation/INC-001.md
```

Two consequences worth holding onto. Filename globs survive opt-in unconditionally,
and only depth-sensitive ones break. And `INC-001.md` gains the segment but no
prefix, so the not-opted-in layout has nothing distinguishing it from a second
feature's `INC-001.md` — that collision is one of the things opting in exists to fix.

## Quick-dev layout

Since 2.7.5, quick-dev follows the same per-stage layout as every other stage. Each
artifact goes to the directory its stage is configured to use. Nothing is asked
about *where* to write: `project.toml` (and `features.toml`, when present) already
says.

**This section applies whether or not the project has opted in.** On an opted-in
project the directory segment is the resolved `<feature-id>`. Without
`features.toml` it is the `<name>` slug — reused from an existing folder for this
change, otherwise inferred from the request and confirmed with the user — and
everything else below is identical. The segment is never dropped for quick-dev,
because the spec, plan and tracker of two changes would otherwise collide in one
stage directory.

| Artifact | Written by | Stage (`[stages.<stage>]`) | Legacy-mode directory |
|---|---|---|---|
| `<id>-quick-dev-spec.md` | `document-quick-change` | `requirements` | `{paths.requirements_package}/<id>/` |
| `CHANGE-TRACKER.md` | created by `document-quick-change`, appended by `execute-quick-change` | `requirements` | `{paths.requirements_package}/<id>/` |
| `<id>-quick-dev-plan.md`, `codebase-orientation.md` | `plan-quick-change` | `planning` | `{paths.implementation_package}/<id>/` |
| `review-YYYY-MM-DD.md` | `execute-quick-change` | `execution` | `{paths.implementation_package}/<id>/` |
| Source and test code | `execute-quick-change` | — | the target repository's own layout (unchanged) |

`<id>` is `<feature-id>` or `<name>`. The tracker stays with the spec — one tracker
per change, not one per stage — because the change it records is the spec's.

**SoD stages.** When a stage sets `dir` or `colocate_with_source`, substitute that
stage's SoD directory (the geometry in *Resolving the stage feature directory*,
above) for the legacy-mode prefix, then run its `write_role` check before the first
write. Requirements, planning and execution are resolved independently, so a project
whose requirements live in a BA repo and whose planning is colocated with source puts
the spec in the BA repo and the plan in the source repo.

**Repo scope is derived, not asked.** Directory mode needs `<repo-code>/` or
`_cross-cutting/`; colocate mode needs the source repo. Quick-dev resolves it in
this order and stops at the first that answers:

1. **Upstream path signal** — `plan-` and `execute-quick-change` read it from where
   the spec (or plan) already sits: `<repo-code>/`, `_cross-cutting/` plus the spec's
   `affects_repos` frontmatter, or the colocated source repo.
2. **The spec's affected components** — the repositories named in the spec's
   FR "Where" references, mapped to `[[project.repos]].code`. One repo → that code;
   two or more → `_cross-cutting/`, with `affects_repos` written into the spec's
   frontmatter. When this diverges from the feature's `repos` field, offer to update
   the field (`config/SCHEMAS.md` § 2.8).
3. **The feature's `repos`** in `features.toml`, when opted in and the spec names no
   repository.
4. **`[[project.repos]]`** — the only entry, otherwise the `primary` entry.

If none of these answers, **halt** and name the fix — add `repos` to the feature
entry, or name the affected repository in the spec — rather than asking the user to
choose. A quick change that spans more than one repository under a colocate-mode
stage halts too: colocate mode has no `_cross-cutting/` home, and a cross-repository
change has already tripped `plan-quick-change`'s escape hatch.

**Legacy-tree check.** Before 2.7.5, quick-dev wrote everything to
`docs/<name>/quick-dev-package/` (not opted in) or to
`{paths.requirements_package}/<feature-id>/` (opted in, 2.7.0). Before creating a
quick-dev directory, check for either holding this change's files. If found,
**halt** and offer to move them, one `git mv` per file, to the directories in the
table above, or to stop so the user can move them. As elsewhere, never move them
unasked.

## Mode A — Write-side (select-and-create)

Applies to skills that may legitimately need to **mint** a feature — those producing a
feature's first artifact, where nothing upstream exists to select from:
`create-requirements-package`, `create-design-package`, `create-implementation-package`,
`create-quality-package`, `document-quick-change`.

**The A/B split turns on whether minting is legitimate, not on whether the skill writes.**
Both modes write and both halt. A skill operating on an artifact that must already exist — a
spec to load, increments to run, a log to open, a diff to describe — belongs in Mode B even
though it writes plenty. The skill's own halt message is the tell: "rather than guessing which
feature's X" means X pre-exists, so Mode B; "rather than inventing a feature ID" means nothing
pre-exists, so Mode A.

`execute-quick-change` and `manage-bugs` were listed here pending a decision and are now
**Mode B**, by the rule above and by their own halt messages. `execute-quick-change` says
"which feature's *plan* to execute" — and its own upstream producer, `plan-quick-change`, is
already Mode B, so leaving the consumer in Mode A let it mint a feature its producer could
not. `manage-bugs` says "which feature's *log* to operate on", and the worry that it "may be
the first thing run on a project" does not survive its own required-inputs table: the
implementation-package directory is a required input, and the log is written inside it, so a
feature must already have reached planning. Its "independently invocable" note means
independent of an increment *session*, not of the package. Creating `bugs-and-issues-log.md`
when missing is not minting a feature — it is a file inside a directory that must exist.

1. If `features.toml` is absent, proceed as today. Stop here.
2. Resolve `[user].active_feature` from `project.user.toml`.
3. The pointer must resolve to **exactly one** well-formed entry. Three outcomes:

   **a. Unset** — nothing to resolve: **halt.**
   > No active feature. Run `select-feature`, then re-run this skill.

   **b. Set, but matching no entry** — a stale pointer: **halt**, naming the value,
   because "no active feature" contradicts the config file the user will open next.
   > `[user].active_feature` is `refunds-v2`, which no entry in `features.toml`
   > declares. A stale pointer sends every write to a feature that does not exist.
   > Run `select-feature` to pick a registered feature, then re-run this skill.

   **c. Set, but matching more than one entry** — ambiguous: **halt.** Do not pick
   one. Two entries sharing an `id` carry their own `title` and `repos`, and nothing
   ranks them, so continuing means writing under a feature chosen arbitrarily.
   > `features.toml` declares `refunds` twice. Which entry governs is undefined, so
   > I can't tell which feature's directory to write under. Give the two entries
   > distinct ids — `refunds-api` / `refunds-ui`, or whatever tells them apart — then
   > re-run this skill.

   For (a) and (b), invoke `select-feature` by name, passing this skill's own name (as
   `caller`) and the user's request text (as `description`, if one exists in this turn).
   **Do not** invent an ID and **do not** fall back to a slug derived from the request —
   that silent-guess behaviour is the exact defect this precondition exists to close.
   For (c) do **not** invoke `select-feature`: the fix is an edit to `features.toml`,
   and minting a third feature would not resolve the collision between the first two.

   Checking (c) costs nothing beyond (b) — both read the same `features.toml` this step
   already opens, and counting matches is the same pass as testing for one. Scope is
   deliberately the **resolved** entry only: a malformed or duplicated `id` elsewhere in
   the registry does not affect where *this* run writes, so it is left to Check N2 rather
   than blocking unrelated work.
4. If it resolved cleanly, **echo** the feature ID and the resolved stage feature
   directory before the first write:

   > Working feature: `alert-customer`. All design artifacts — assembled package and
   > working files — will be written under `.framework-output/design/alert-customer/`.

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
`plan-quick-change`, `execute-increments`, `execute-quality-increments`, `create-pr`,
`execute-quick-change`, `manage-bugs`.

**How much a skill writes is irrelevant to the mode.** `execute-increments` writes
production code and is still Mode B: increments to run cannot exist without a package that
named them, so minting a feature here would produce one with nothing to execute.

Identical to Mode A, with one difference at step 3: **suppress create.** Needing something
to read is not a reason to mint a feature that has nothing in it yet, so `select-feature`
is invoked with `caller_mode = select-only` and its create path is unreachable for this
call. This applies to step 3's cases (a) and (b) — the two that invoke `select-feature` at
all. Case (c), an ambiguous pointer, behaves identically in both modes: it halts and invokes
nothing, because a duplicate is fixed by editing `features.toml`, not by selecting. If the
registry is genuinely empty, the halt message changes to name the producing skill instead:

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

- **Minting logic.** All of it — slug proposal, the *mint-time* uniqueness check,
  registry writes — lives in `select-feature`. This precondition only decides
  *whether* to call it and in which mode.

  The delegation is **mint-time only**, and the distinction matters because
  `select-feature` is reached only when the pointer *fails* to resolve. A duplicate
  `id` is a state where it resolves fine, so deferring every uniqueness question to
  `select-feature` would leave that state unchecked on every subsequent run. The two
  checks answer different questions and both are needed: `select-feature` asks "may
  this new id join the registry," step 3(c) asks "does the active pointer name
  exactly one entry." Registry-wide validity — `id` format across all entries, and
  `repos` resolving against `[[project.repos]]` — stays with Check N2, which is the
  only one of the three that can see the whole file at once and the only one that
  needs a second file to do it.
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
