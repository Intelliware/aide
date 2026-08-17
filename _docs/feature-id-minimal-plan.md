# Feature ID as a first-class concept — minimal plan

**Status:** draft for comparison
**Date:** 2026-08-11
**Framework version at authoring:** 2.2.0 (`R2.2.0`, commit `5f8684d`)
**Parallel to:** `_docs/feature-id-path-segment-plan-superseded.md` (the original full
plan, since split — see its banner). This document and
`_docs/path-token-reconciliation-plan.md` together replace it; the full plan is retained
only for its rationale (§1) and decision log (§8), which several sections below carry
forward rather than re-argue.
**Prerequisite:** `_docs/path-token-reconciliation-plan.md` — 30 files, extracted as a
standalone predecessor. **Implemented, shipped in `2.3.0`.** Several sections below were
written before that extraction and defer to it; each says so where it applies.

---

## 1. What this plan is, and how it differs

The full plan treats "feature ID as a path segment" as an opportunity to also fix the
composition-token / config-key mismatch, define a feature lifecycle, and rewrite both
SoD geometries. That is defensible, but it front-loads a prerequisite (the token rename)
that blocks everything else, and it couples a layout change to a schema cleanup.

This plan does the smallest thing that makes a feature ID real:

1. A feature gets a **directory**, in every mode.
2. There is a **registry** saying which features exist.
3. There is an **active feature** pointer saying which one you are working on.
4. The write-side skills **refuse to guess** and route you to a skill that asks.
5. Everything else is explicitly deferred.

**Deliberately out of scope:** feature status and lifecycle derivation (§7 of the full plan),
and any branch-based workflow. Both are separable and neither blocks this. Recommended follow-up
work is listed in §13.

**"A directory" means both layers.** Four stages keep a per-section working tree alongside the
assembled package, and it already has a feature directory — an improvised one. Binding that
placeholder to the registry is in scope here, because leaving it out would govern one file per
stage and leave the dozens beneath it named by inference. See §2.6.

**No longer deferred — moved to the prerequisite.** Earlier drafts deferred the `{paths.*}`
token / config-key mismatch and carried `quality_package` as a "bounded exception" to that
deferral. Measurement showed the whole reconciliation is only 30 files, so it was extracted
into `_docs/path-token-reconciliation-plan.md` and lands **before** this plan. That removes
the deferral, removes the exception, and lets this plan assume every path token resolves.

### 1.1 The two facts that make this small

**Colocate-mode SoD already does exactly what we want.** `config/SCHEMAS.md:709-717`
defines the colocate geometry as:

```
<source-repo>/<artifact_subdir>/<stage>/
  ├── <feature-id-A>/                    ← single-repo feature
  │   ├── INC-001.md
  │   └── increment-status.md
  └── <feature-id-B>/                    ← cross-cutting feature, this repo's slice
```

So the target shape is not an invention. It is a shipped convention that currently
applies to two stages in one mode, and this plan generalises it to all stages in all
three modes. That materially lowers the design risk: we are propagating a pattern the
framework already endorses, not proposing a new one.

**The `{feature-id}` token already exists — it just has no source of truth.** It appears
in 21 skill files and 7 compositions, in strings like
`{paths.requirements_path}/{feature-id}-requirements.md`. Nothing anywhere defines what
its *value* is: no skill mints it, no config declares it, no elicitation pattern asks for
it. It is resolved by whatever the agent decides in the moment.

That reframes the work. This is not "add a feature ID." It is **"give an identifier that
is already load-bearing a definition, a registry, and a home."** Most of the diff is
inserting one path segment next to a token that is already there.

---

## 2. The change

### 2.1 Path shape

One segment, inserted directly above the artifact. **Filenames keep the `<feature-id>-`
prefix** — the only edit to any path string is an inserted directory.

| Mode | Today | After |
|---|---|---|
| Legacy | `.framework-output/<stage>/<feature-id>-<stage>.md` | `.framework-output/<stage>/`**`<feature-id>/`**`<feature-id>-<stage>.md` |
| SoD directory | `<host>/<subdir>/<stage>/<repo-code>/<feature-id>-<stage>.md` | `<host>/<subdir>/<stage>/<repo-code>/`**`<feature-id>/`**`<feature-id>-<stage>.md` |
| SoD colocate | `<src>/<subdir>/<stage>/<feature-id>/INC-001.md` | **already correct — no change** |

Keeping the prefix is a deliberate minimality choice, and it is worth being clear about
the trade: the names are redundant (`FEAT-0001-refund/FEAT-0001-requirements.md`), but
every existing filename stays valid, so no glob that matches on filename breaks — only
globs that assume directory *depth* do. Dropping the prefix would be cleaner to read and
strictly more work to land. It can be done later as a rename; it cannot be undone cheaply
once artifacts are in circulation, so the redundancy is the reversible option.

**"Keep the prefix" means do not strip existing ones — not add new ones.** It applies to the
per-stage package artifacts that already carry it today (`<feature-id>-requirements.md`,
`<feature-id>-design.md`, `<feature-id>-quick-dev-spec.md`). The per-item files —
`INC-XXX.md`, `TC-XXX.md`, and entries in the bug log — have never carried a feature prefix
and do not gain one. Their IDs are per-feature counters and the enclosing feature directory
is what associates them, so `FEAT-0001-alert-customer/INC-001.md` is already unambiguous
(§2.4, §10 item 1).

Segment ordering in SoD directory mode is **repo-first** (`<repo-code>/<feature-id>/`),
carried over from the full plan's D5: the `<repo-code>` directory is the boundary that
`[stages.*].write_role` enforces (`config/SCHEMAS.md:686-702`), so it must stay outermost
or a role check stops corresponding to a subtree.

**Cross-cutting features nest identically**, as `_cross-cutting/<feature-id>/`. The
`_cross-cutting/` directory is a sibling of the `<repo-code>/` directories and continues to
work unchanged — it simply gains the same feature level. Artifacts under it still carry the
`affects_repos` frontmatter array that `config/SCHEMAS.md:699-702` requires, because the
directory encodes "spans multiple repos" but not *which* ones.

### 2.2 Feature ID format

`FEAT-NNNN-<kebab-slug>` — carried over from the full plan's D2. Zero-padded four-digit
ordinal allocated in creation order, plus a descriptive slug: `FEAT-0001-alert-customer`.

This mirrors the framework's existing ADR convention (`ADR-NNNN-<kebab-title>`), including
sequential allocation and the no-reuse rule already specified at
`_docs/skills-test-plan.md:1210-1211`. Gaps in the sequence are legal; reuse is not.

### 2.3 The greenfield build is `FEAT-0001`

Greenfield is a property of *work*, not of a project. After the first delivery lands, the
project is brownfield permanently — so there is no such thing as a greenfield project,
only a greenfield first feature.

The framework already reasons this way. The 2.2.0 `brownfield-enhancement-spec` rewrite
states the principle explicitly: brownfield differs from greenfield only in that the
pre-existing foundation is **discovered** rather than **authored**. Skill placement follows
the same logic — `generate-ai-rules` runs after design in greenfield because "there is no
stack to derive rules from until design has fixed the framework choices," but early in
brownfield "because RE Part A already carries the stack"
(`.agents/skills/_registry/workflow-graph.yaml:81-84`). Those are statements about what is
known at a point in time, not about a permanent project attribute.

**So the initial build gets `FEAT-0001`, minted by `start-project`.** It produces the
identical artifact set — requirements, design, planning, quality, execution — so it is
structurally a feature, just an unusually large one. The payoff is the removal of an
entire special case: no "pre-feature" state, no root-level artifacts that later features
must avoid colliding with, no second layout to document, and a registry that enumerates
everything ever built rather than everything-except-the-first-thing.

The objection worth answering is that the greenfield package is a **baseline** while later
features are **deltas** against it, so making it a peer of `FEAT-0002` flattens a real
asymmetry. It does — but that asymmetry is carried by the **knowledge base**, not by the
ID. `FEAT-0001`'s durable output (architecture, components, ADRs, solution context)
migrates into the KB, and `FEAT-0002` then reads the KB exactly as any brownfield feature
does. The `FEAT-0001` package remains only the historical record of how the baseline was
built. Because a different mechanism carries the asymmetry, the IDs can stay uniform.

This makes the KB load-bearing for greenfield rather than optional: it is the mechanism
that turns the greenfield-to-brownfield transition into a non-event. Without it,
`FEAT-0002` would have to read `FEAT-0001`'s requirements package directly, and that
coupling is exactly what makes the first build feel like it needs special treatment. See
§12 — the framework currently has a gap here.

### 2.4 State files go per-feature, which changes two behaviours

Three files are live state rather than deliverables: `increment-status.md`,
`bugs-and-issues-log.md`, and `change-tracker.md`. In colocate mode they already sit inside
the feature directory (`config/SCHEMAS.md:709-717`). In legacy mode they are **one per
project** — `manage-bugs/references/INPUTS-OUTPUTS.md:7` resolves the bug log to
`{project.paths.implementation_package}/bugs-and-issues-log.md`, auto-created on first
call. Feature-scoping them makes legacy mode match colocate mode, which is correct, but it
has two consequences the plan must own rather than discover later.

**`BUG-XXX` IDs stop being globally unique.** They gain exactly the collision problem that
`INC-XXX` and `TC-XXX` have, and for the same reason: a per-feature counter in a
per-feature file. Two features both mint `BUG-003`. The resolution is the same as for
increments — the ID is unique *within its feature*, and the feature directory is what
disambiguates, so a fully-qualified reference is `FEAT-0001-alert-customer/BUG-003`. This
needs saying explicitly in `manage-bugs`, because today a bare `BUG-003` is unambiguous and
after this change it is not.

**"Show me all open bugs" becomes an aggregation.** Today it is one file read. Afterwards it
is a scan across every feature directory, and under SoD colocate mode across every source
repo as well. `manage-bugs` needs a review mode that aggregates rather than assuming a
single log. This is a small piece of real work that the file-count estimate does not
capture.

Both consequences are acceptable — they are the price of concurrency, and colocate mode has
already been paying it — but neither is free, and a plan that quietly nests the bug log
without saying so would be setting up a surprise.

### 2.5 Path tokens — resolved by the prerequisite

Earlier drafts carried a long analysis here showing that most tokens this plan edits resolve to
no declared `[project.paths]` key, and conceding that feature-scoping a non-resolving path
delivers **isolation** without **findability**.

That hedge is gone. The fix is `_docs/path-token-reconciliation-plan.md` and it lands first:
30 files, 42 occurrences, four of the five phantom names mapping to keys that already exist and
the fifth (`quality_package`) created there. Two findings from that measurement are still worth
carrying here:

- **The planning and execution stages were never broken.** They already use
  `{project.paths.implementation_package}` — 44 occurrences, the most-used token form in the
  tree — which is why §10 item 1 resolves in the skill's favour.
- **There is no runtime.** `config/SCHEMAS.md:131-141` declares five legal tokens and no config
  loader exists; `build-registry` and `validate` are the only scripts in the repository. Every
  path string is instruction text an agent interprets. That is why the mismatch survived
  unnoticed, why its real risk is silent divergence rather than breakage, and why correcting it
  is cheap.

With the prerequisite merged, this plan inserts one directory segment into tokens that resolve,
and therefore delivers both isolation and findability.

### 2.6 The per-section working tree, and what `<feature>` binds to

§2.1's table describes where the **assembled** package lands. It is not the whole layout, and
the missing half is where most of the files actually are.

Four stages also maintain a per-section working tree under `docs/<feature>/<stage>-package/`.
Earlier drafts of this plan treated that as a rival convention to be retired — §7 called it a
"third path convention" and proposed picking a winner. **That reading was wrong, and it matters
that it was wrong, because retiring the tree would delete the framework's own write-discipline
mechanism.** `create-requirements-package/references/INPUTS-OUTPUTS.md` declares both layers
side by side, with distinct jobs:

| Line | Path | Role |
|---|---|---|
| `:21` | `{paths.requirements_path}/{feature-id}-requirements.md` | The **assembled** deliverable — one composed file |
| `:22-24` | `docs/<feature>/requirements-package/{discovery,analysis}/*.md` | Working inputs: change-description anchor, codebase discovery, stakeholder map, impact analysis, risk register |
| `:25-27` | `docs/<feature>/requirements-package/requirements/*.md` | **Per-section block files** `01-executive-summary` through `14-acceptance-criteria`, plus `completeness-tracker.md` and `change-tracker.md` |
| `:28` | `docs/<feature>/requirements-package/requirements-package.md` | An explicit **alias** — "for backwards-compat with model-2 paths", a pass-through to `:21` |

The two layers are complementary, and line 28 says so outright by declaring one a pass-through
to the other. More importantly, `:25` is precisely what
`references/ai-principles/write-discipline.md` requires when it mandates per-section
persistence: the tree is the mechanism, not residue.

**The measurement.** 144 occurrences across 44 files, and it is live routing rather than
documentation debris — roughly 142 are load-bearing (100 table rows in input/output contracts,
15 explicit write/read directives, and the remainder specific tracker, traceability and
`--target=` CLI paths in the review workflows). Only two are explanatory prose: a layering
comment at `.agents/skills/_registry/workflow-graph.yaml:161` and the wording fix at
`capture-solution-context/SKILL.md:138` that the full plan had already spotted.

**Only four stages have such a tree**, and which four is informative:

| Stage | Folder | Occurrences |
|---|---|---|
| Quality | `quality-package` | 64 |
| Requirements | `requirements-package` | 46 |
| Design | `solutions-package` | 33 |
| Quick-dev | `quick-dev-package` | 1 |

Planning and execution have **zero** — exactly the two stages §2.5 found were never broken
because they already use the real `{project.paths.implementation_package}` key. The four stages
with a working tree are the four whose assembled-path tokens were phantom. That correlation is
the likeliest explanation for how the split arose: the tree was where work actually landed, and
the token path was declared alongside it without ever being wired up.

**The policy, and it is one sentence: `<feature>` is the registry's `<feature-id>`.** The tree
already carries a feature directory — it is simply *improvised* rather than registry-bound,
which is the same defect §7 documents for `document-quick-change`, just one level up. So this is
a binding change, not a restructuring: the tree keeps its shape, its depth, and its stage-folder
names, and the placeholder stops being whatever the agent inferred.

**Why this belongs in this plan rather than after it.** If the assembled deliverable moves to
`<stage-root>/<feature-id>/` while the working tree stays at `docs/<improvised-name>/`, the
result is registry-governed naming for one file per stage and agent-improvised naming for the
dozens of files beneath it. That is not a partial win; it relocates the exact drift the plan
exists to prevent, and it does so into the layer with more files in it. §7's precondition already
guarantees the skill knows the feature ID before its first write, so the ID is in hand — what was
missing was the instruction to use it here too.

**Explicitly not fixed:** the design stage's folder is `solutions-package`, not
`design-package`, so the model-2 folder names do not match the stage names. Renaming it is a
cosmetic change to 33 occurrences with no correctness benefit, and it would collide with this
plan's edits in the same files. Left alone deliberately; noted in §13 so it is not rediscovered
as a bug.

---

## 3. The registry — `features.toml`

A new file at project root, **committed**, sitting outside the four-layer config model as
a peer of `project.toml` rather than a layer within it.

```toml
# features.toml — the project's feature registry.
# Committed. One entry per feature. Append-only in practice: entries are not
# deleted when a feature ships, because artifacts on disk still cite the ID.

[[features]]
id      = "FEAT-0001-alert-customer"
title   = "Alert customer when a refund is delayed"
created = 2026-08-11
ticket  = "ACME-1247"          # optional
repos   = ["billing-api"]      # optional; codes from [[project.repos]]
```

**Why a separate file rather than `[[project.features]]` in `project.toml`.** Three
reasons, in order of weight:

1. **Conflict surface.** The registry is appended to often, by many people. `project.toml`
   is edited rarely and holds settings that must not be casually merged. Separating them
   means a feature-registry conflict never risks a bad auto-merge of repo definitions or
   SoD policy.
2. **It preserves the loud-conflict property.** The registry being committed is the
   mechanism that catches two people minting `FEAT-0008` on separate branches — the
   collision surfaces as a git conflict in one small file. A dedicated file keeps that
   property while reducing false conflicts on unrelated edits.
3. **It keeps the config model honest.** `project.toml` is configuration — declarative
   settings the framework reads. The registry is project *data*. Filing data under the
   config schema would have meant `SCHEMAS.md` growing a section that is not
   configuration, and every layer-precedence question (can `project.user.toml` override a
   feature?) would have needed an answer it does not deserve.

**Absence is meaningful and legal.** No `features.toml` means the project has not opted
in — see §6. An empty-but-present file is also legal and means "opted in, no features
yet." This sidesteps the TOML array-of-tables trap the full plan hit (§2.3.3 there):
there is no need to scaffold an empty `[[features]]` block, because the file's absence
already expresses emptiness.

---

## 4. The active feature — `[user].active_feature`

Lives in `project.user.toml`, the existing Layer 4: gitignored, personal, machine-local.

```toml
[user]
role           = "BA"
active_feature = "FEAT-0001-alert-customer"
```

This is the right layer and the precedent already exists. `config/SCHEMAS.md:420`
documents `[user].role` as "project-scoped because the same person may act as different
roles on different projects" — the identical argument applies to features, and both
fields are consulted at the same write boundaries. `config/project.user.toml.example:4`
describes the layer as "GITIGNORED. Personal, machine-local. Edited freely by you alone,"
which is exactly the semantics an active-feature pointer needs.

The distinction that matters: **the registry is shared truth, the pointer is personal
state.** Two people on the same project work different features simultaneously; neither
should be able to change the other's working context by committing a file. Putting the
pointer in Layer 4 makes concurrent work the default rather than a special case, which is
the entire point of the change.

**Resolution rule.** `active_feature` must resolve to a declared `id` in `features.toml`.
If it is set but unresolvable — typo, or the feature was never committed — that is an
error, not a fallback. Silently creating a directory for an unregistered feature is how
the drift this plan exists to prevent gets back in.

---

## 5. `select-feature` — choose a feature, or create one

One new skill, modelled on the existing small-skill shape (`SKILL.md` plus
`references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md`, as `meta/track-change` uses).

**Select is the default; create is the fallback reached from inside it.** This ordering is a
correctness choice, not an ergonomic one. The failure this plan exists to prevent is the same
work acquiring two identities (§7), and a skill that opens by offering to *add* re-creates that
hazard at exactly the moment it was meant to stop it — a user who does not recall that
`FEAT-0007-refund-delays` exists will cheerfully mint `FEAT-0012-delayed-refund-alerts`.
Presenting what already exists first makes reuse the path of least resistance.

**Two modes, because selecting is activating.**

- **Select** (default) — read `features.toml`, list the registered features with enough context
  to be recognised (ID, title, ticket, and which stages already have artifacts on disk), mark the
  current active one, and set `[user].active_feature` in `project.user.toml` on choice, creating
  the `[user]` block if needed. Invoked read-only, this is also the "what features exist" answer,
  so no separate list mode is needed. When the caller passes the description the user already
  typed, rank existing features against it and surface plausible matches first — that is the one
  moment when catching a near-duplicate is cheap.
- **Create** — reachable directly when the user knows the work is new, and offered as a
  permanently visible option from select. Read `features.toml` (offering to create it if absent,
  which *is* the opt-in moment), compute the next ordinal as `max + 1`, prompt for a one-line
  description, propose a kebab slug from it and let the user override, optionally capture ticket
  and repos, append the entry, and set it active.

**It returns the user to where they came from.** When invoked from a halted skill's precondition
(§7), `select-feature` receives that skill's name and closes with `## Next skill\n<caller>`. This
is deliberately the framework's existing forward-handoff convention rather than a new one — the
skill is not resumed in place, it is re-entered, and by then the precondition passes.

**Two cases must skip selection entirely**, or select-first becomes friction for no benefit: an
empty registry goes straight to create, and a supplied description with no plausible match offers
create immediately rather than making the user reject a list first. These skips matter more under
halt-and-re-invoke than they would have under inline invocation, because the round trip is already
costing a hop — see §10 item 6.

**Name versus description.** Skill discovery routes on the `description:` field rather than the
skill name, so the description must advertise both intents — selecting an existing feature *and*
creating one. Naming it `select-feature` while describing only selection would leave users who
know their work is new with nothing to match against.

**The inverse risk is worth designing against.** If creating reads as the discouraged path, people
will attach unrelated work to a loosely-related existing feature, and a feature accumulating three
unrelated changes is its own kind of mess. It is less damaging than duplicate features and it is
not free: hence listing enough per entry to judge relevance, and keeping create a visible
first-class choice rather than something buried beneath a long list.

**It must echo the resolved output paths before finishing.** Given the active feature and
the project's stage modes, print where each stage's artifacts will land. This is the
cheapest possible guard against the failure this whole change targets: a user who can see
`.framework-output/requirements/FEAT-0001-alert-customer/` before any work starts will
notice immediately if it is wrong.

**Ordinal allocation is the one concurrency hazard.** Computing `max + 1` means two people
branching simultaneously both read `FEAT-0007` and both mint `FEAT-0008`. The mitigation
is structural rather than clever: because `features.toml` is committed, the duplicate
surfaces as a merge conflict in a small file. The validator rule in §8 catches it locally
first. Worth stating in the skill itself so the minting agent warns when the working tree
is behind its remote.

---

## 6. Opt-in and back-compat

**The presence of `features.toml` is the opt-in.** No new config flag.

This is the design's best simplification, and it holds because the two things are not
independent: feature-scoped paths without a registry would mean unvalidated directory
names, and a registry without feature-scoped paths would be inert. Tying them removes a
flag, removes a schema field, removes the "flag set but registry missing" state, and
makes the opt-in self-documenting — the file either exists or it does not.

Resolution logic in every affected skill is then two lines:

```
If features.toml exists  → resolve the active feature; write feature-scoped paths.
If it does not           → behave exactly as today.
```

**Existing projects are untouched** until someone runs `select-feature`. Artifacts already on
disk in the flat layout stay where they are and keep working; the framework does not go
looking for them at a new depth, because without a registry it is not in feature-scoped
mode at all.

**AMENDED — new projects are feature-scoped by default; the signal is unchanged.** As
originally written, this section made opt-in wholly manual: `start-project` deliberately did
not create `features.toml`, and the only advertisement was a one-line note at handoff. That
was the wrong default for the framework's own goal. Feature IDs are the intended way forward
for teams newly adopting A.I.D.E., and an opt-in nobody is told about twice is an opt-in
almost nobody takes — the note fires once, at the moment a user has no features and no
artifacts and is least able to evaluate it, and is deliberately never raised again.

A `fresh` `start-project` run now writes a comment-only `features.toml`. Three properties of
the original design are what make this a safe change rather than a breaking one:

- **The signal did not change.** Presence of the file still means feature-scoped, absence
  still means behave exactly as before. Nothing in the two-line rule moved; only *who creates
  the file* did. Had the opt-in been a config flag, this would have been a schema change.
- **The empty registry was already a first-class state.** `config/SCHEMAS.md` § 2.8 already
  declared an empty-but-present file legal and called it "the normal state immediately after
  opt-in", and Check N2 already treated it as a warning rather than an error. Bootstrap
  produces exactly that state, so no schema or validator change was needed.
- **Opting out is a deletion.** Because presence is the whole signal, `rm features.toml`
  reverts every path with no migration. That asymmetry — trivially reversible on a project
  with no artifacts, genuinely hard on one with a populated tree — is what justifies
  defaulting it on for the former and never for the latter.

`rebaseline` and `extend-repos` are excluded for that reason: they imply artifacts already on
flat paths, where enabling feature scoping moves the *next* write and orphans everything
already written. That is a migration, and the position below still holds.

**The registry is created empty, and `start-project` does not mint `FEAT-0001`.** This finally
settles §2.3, which had proposed minting the first feature at bootstrap; a draft of this
amendment briefly reinstated it by routing the handoff through `select-feature`, which was wrong
for the same reason §2.3 was. **Brownfield decides it.** That flow's opening skills —
`analyze-repository`, the `reverse-engineer-*` family, `build-knowledge-base` — carry no
active-feature precondition at all, because RE documentation and KB components are keyed by
repo-slug and domain rather than by feature (the same reason `knowledge_base_path` is absent
from Check N1's feature-scoped keys). A brownfield project does substantial work before any
feature exists to name. Minting at bootstrap would therefore force the user to invent a feature
for work that is not feature work, and would leave that invented ID *active* when their first
genuine feature arrives — so it gets either reused under a wrong name or duplicated by a second
entry, which is the duplicate-identity hazard `select-feature` was built to prevent.

Letting each skill's precondition fire on its own costs nothing and puts the question at the
right moment. For greenfield and quick-dev the next skill is feature-scoped, so it halts at once
and returns automatically via `## Next skill\n<caller>`; for brownfield the question arrives when
requirements work does. The general principle: **creating the registry and naming a feature are
separate decisions, and only the first one belongs to bootstrap.**

**Mixed layouts are tolerated, not prevented.** A project that opts in mid-flight has old
features flat and new ones nested. This is mildly untidy and entirely harmless: each
feature is internally consistent, and nothing reads across features. A one-time
`git mv` per feature is available for teams that want uniformity, but making it mandatory
would turn an opt-in into a migration, which is precisely what this plan avoids.

**DECIDED — no migration tooling is built.** This supersedes the full plan's D6, which specified
a dual-read window plus a migration helper. Registry-presence opt-in already provides what the
dual-read window was for, and relocation is handled manually at runtime — `git mv` the feature's
directory, on the rare occasion anyone wants to. The reasoning is that migration is expected to be
**unnecessary rather than merely deferred**: opting in requires deliberately creating the first
registry entry via `select-feature`, so a project
only enters feature-scoped mode deliberately, and the features it already shipped have no reason to
move. Writing a helper for a case that probably never arises would cost more than the case does.
Rejected: shipping a helper speculatively, and mandating uniformity on opt-in.

---

## 7. Skill behaviour — check and delegate

Every affected skill gains a short precondition. The point is that the change to each
individual skill stays tiny; the minting complexity lives in one place.

**Write-side skills halt.** `create-requirements-package`, `create-design-package`,
`create-implementation-package`, `create-quality-package`, `execute-increments`,
`execute-quality-increments`, `document-quick-change`, `plan-quick-change`,
`execute-quick-change`, `manage-bugs`, `create-pr`:

```
## Precondition — active feature

1. If `features.toml` is absent, proceed as today (not opted in). Stop here.
2. Resolve `[user].active_feature` from `project.user.toml`.
3. If unset, or not present in `features.toml`: **halt** with
   `No active feature. Run /select-feature, then re-run this skill.`
   Pass this skill's own name and the user's description to `select-feature`.
   Do not invent an ID, and do not fall back to a slug derived from the request.
4. Echo the feature ID and the resolved output directory before the first write.
```

**DECIDED — halt and re-invoke, not inline invocation.** The precondition stops the skill and
tells the user what to run, exactly as `review-knowledge-base-package/references/INPUTS-OUTPUTS.md:36`
already does for a missing KB (*"Halt with: `KB not found at <path>. Run build-knowledge-base
first.`"*) and as every `review-*` gate does when it sends the user back to a `create-*` skill and
says "then re-run this skill". Rejected: invoking `select-feature` inline as a sub-flow. Inline
would remove a step, but it would make this the only precondition in the framework that behaves
that way, and `AGENTS.md:10` is explicit that handoffs go by name to preserve context budget. A
plan whose thesis is "stop skills improvising their own conventions" should not improvise a
control-flow convention.

**The return trip uses the same convention, so the user is not left stranded.** Because the
halting skill passes its own name, `select-feature` closes with `## Next skill\n<caller>` once a
feature is active. That is the framework's ordinary forward handoff pointed backwards, so the
agent carries the user back without anyone having to remember what they were doing. The cost of
this decision is therefore one extra hop, not a lost session.

Step 3 is the load-bearing one. The current failure mode is not that skills fail to find a
feature ID — it is that they cheerfully improvise one from whatever the user typed, so two
sessions describing the same work produce two different IDs and two directory trees. The
precondition converts a silent wrong answer into a prompt.

**This is not hypothetical — it is written into a shipped skill.**
`document-quick-change/SKILL.md:36` instructs step 1 to "reuse an existing `docs/<feature>/`
if one exists, otherwise **infer a kebab-case name from the user's description and
confirm**." That is the improvised identifier, specified as intended behaviour. It is the
single clearest case for this plan: the skill is doing exactly what it was told to do, and
the result is that the same feature gets a different directory depending on how the user
phrased the request. `select-feature` replaces the inference with a lookup — and because it leads
with the features that already exist, the natural outcome is reuse rather than a second identity
for the same work.

**`document-quick-change` writes to both layers, and both need the ID.** Step 1 creates
`docs/<feature>/quick-dev-package/` — the working tree — while step 7 (`SKILL.md:42`) writes the
assembled spec to `{paths.requirements_path}/<feature-id>-quick-dev-spec.md`. Earlier drafts read
this as the skill contradicting itself; §2.6 shows it is the normal two-layer arrangement. The
consequence is unchanged and slightly wider than "guard the spec write": step 1's inferred
`<feature>` and step 7's `<feature-id>` must resolve to the **same** registry ID, which today they
have no mechanism to do.

**Read-side skills resolve but never mint.** `audit-quality-coverage`,
`framework-navigator`, and the review skills resolve the same way; if the active feature is
unset they hand off to `select-feature` **in select-only mode**, with create suppressed.
Reviewing is not a reason to create — there is nothing to review in a feature that was invented
one second ago.

**Read-side skills echo too.** Step 4 of the precondition applies to them as well, before their
first *read* rather than their first write. This is the full plan's D8, and it is worth keeping:
a `review-*` or coverage audit run against the wrong feature returns a confident verdict about
the wrong artifacts, which is as damaging as a misplaced write and harder to notice.

**The review skills are not purely read-side — they write verdicts.** All three stage-review
gates emit a `readiness-verdict.md`, and
`review-requirements-package/references/INPUTS-OUTPUTS.md:20` targets
`docs/<feature>/requirements-package/review/readiness-verdict.md`.

**This reverses an earlier decision in this plan, and the reversal reduces work.** Previous
drafts read that path as a third rival convention and proposed relocating verdicts to
`<stage-root>/<feature-id>/review/readiness-verdict.md` to consolidate everything about a feature
under one directory. §2.6 shows the premise was false: `docs/<feature>/<stage>-package/` is the
per-section working tree, a `review/` subdirectory sits in it exactly as `discovery/` and
`analysis/` do, and a verdict is a working artifact rather than a deliverable. So verdicts stay
where they are and inherit their feature scoping from the tree's placeholder binding.

The practical effect is that **the review skills' output paths do not change at all** — only the
value filling `<feature>` does. They no longer need to be treated as phase-3 path edits, which
removes three skills' worth of output-path churn from the riskiest phase.

`framework-navigator`'s state probe should additionally iterate the registry and report
per-feature state, since "which of my three in-flight features is where" is the question
that a multi-feature project actually has.

**`review-adversarial` infers the stage from the path, and §2.6 is what keeps that working.**
`review-adversarial/references/OVERVIEW.md:43`: when `--stage` is absent the skill "detects it
from artifact frontmatter (`stage:` field on packages) **or** path heuristics
(`docs/<feature>/requirements-package/` → requirements, etc.)."

Note which convention that heuristic keys on — the working tree, whose stage-folder names §2.6
preserves unchanged. So the inference keeps working, and this is a second reason not to relocate
the tree: doing so would have silently broken the one place in the framework that reads stage
from a directory name. Misattributing a finding to the wrong stage is a wrong answer rather than
a crash, which is the worst failure shape available, so avoiding it for free is worth having.

Two further things cap the residual risk: frontmatter is consulted **before** the path heuristic,
and when the skill is wrapped by a `review-*-package` gate the wrapper supplies `--stage`
explicitly (`OVERVIEW.md:57`). What remains is a small robustness improvement rather than a
required edit — teach the heuristic the feature-scoped assembled path too, since it currently
only recognises the working tree. Worth doing in phase 3; not a blocker.

---

## 8. Blast radius

| Tier | Files | What |
|---|---|---|
| Skills — six stages | ~68 | requirements 12, design 11, planning 10, execution 8, quality 21, quick-dev 6 |
| Skills — meta | ~6 | `start-project` (mints `FEAT-0001`, §2.3), `framework-navigator` (per-feature state probe, §7), `review-adversarial` (stage-inference heuristic, §7). **Previously omitted from this table** while §2.3 and §7 assigned them work |
| Compositions | 7 | Seven mechanical segment inserts. The tokens they cite are already correct by then, and `greenfield-implementation-package.yaml:23` has already been re-pointed — both done by the prerequisite |
| Config | 5 | New `config/features.toml.example`; `project.user.toml.example` gains `active_feature`; `SCHEMAS.md` gains a registry section and the `{feature-id}` token; `framework.toml.example` `output_root` commentary; **`references/elicitation-patterns/project-bootstrap.md`** — legacy `docs/` example paths plus the feature-elicitation question §2.3 and §5 both depend on. `quality_package` moved to the prerequisite |
| New skill | ~4 | `.agents/skills/meta/select-feature/` |
| Validator | 5 | Check **N** in both `validate.py` and `validate.js` — `M` is taken by the prerequisite's token check, and `A`-`L` were already taken (`L` went to the RE close-out gate in 2.2.0). Plus the matching cases in `test_validate.py` / `test-validate.js` and fixtures. Every validator change lands twice, in Python and Node |
| Discipline | 1 | `references/ai-principles/write-discipline.md` — per-section paths become feature-scoped |
| Orientation | 3 | `README.md` artifact-path examples, `AGENTS.md` vocabulary, and **`_docs/ai-sdlc-stage-map-new.md`** — the canonical tree (lines 123-291). Unavoidable once the layout changes — leaving them describing the old shape is documentation debt, not a saving, and the stage map is the one document a reader consults *for* the layout |
| Working-tree binding (§2.6) | 3 | `capture-solution-context` (prose fix), `_registry/workflow-graph.yaml` (layering comment), `templates/blocks/quality/test-case-increment.md`. The other 41 of §2.6's 44 files are already counted in the two skill rows above |

**~102 files**, on top of the prerequisite's 30. Compare the full plan's ~124, which carries the
token work internally. *(Earlier drafts said ~86 by omitting the meta stage, the validator's test
twins, and the orientation docs; then ~96 before §2.6's working tree was measured; then ~99 before
a scope audit against the full plan's Tier 1 recovered `framework.toml.example`,
`project-bootstrap.md` and the stage map. Corrected upward three times; see §11.)*

### As built — 101 files

The estimate was accurate at the headline and wrong in its composition, so the closeness is
partly luck. `git diff --name-only path-token-reconciliation...HEAD` reports **101 files** against
the predicted ~102, but roughly five predicted files were never touched and roughly five
unpredicted ones were.

**Predicted, not done — outstanding work, not a saving:**

| File | Why it was predicted | Status |
|---|---|---|
| `references/ai-principles/write-discipline.md` | Per-section paths become feature-scoped | **Outstanding.** The per-section write contract still describes non-feature-scoped paths |
| `_docs/ai-sdlc-stage-map-new.md` | The canonical tree (lines 123-291) | **Outstanding.** This is the document a reader consults *for* the layout, and it now describes the pre-phase-3 shape |
| `AGENTS.md` | Vocabulary | **Outstanding.** No `feature-id` entry in the vocabulary list |
| `references/elicitation-patterns/project-bootstrap.md` | Legacy `docs/` example paths | **Outstanding**, and harmless only because §2.3's minting question was dropped |
| `config/framework.toml.example` | `output_root` commentary | **Outstanding**, cosmetic |

§8 predicted this exact failure mode and named it correctly: "leaving them describing the old shape
is documentation debt, not a saving". The debt was taken. It should be discharged before the branch
merges, or logged where someone will find it.

**Not predicted, done:**

- The implementation stage absorbed far more than the tier table implies — 45 occurrences across 12
  files, because `implementation_package` roots four support artifacts (`increment-status.md`,
  `bugs-and-issues-log.md`, `change-tracker.md`, the package index) in addition to the per-increment
  files, and all five had to move inside the segment together.
- `config/customizations/review-implementation-package.toml.example`, to converge a stray
  `{feature-id}-review/` on `{feature-id}/review/`.
- Two reader skills, to fix the quick-dev spec handoff (§12 territory — a pre-existing defect
  surfaced by this work, not caused by it).
- `start-project`, but for opt-in discoverability rather than the predicted `FEAT-0001` minting,
  which was dropped as premature.

**The one prediction that was right and initially ignored.** The Validator row says "Every
validator change lands twice, in Python and Node". Phase 4 shipped N1 and N2 in `validate.py`
alone, and the omission was caught only when this section was re-read to write this reckoning.
`validate.js` is a live twin carrying checks A through M, so a Python-only guardrail is a guardrail
that half the entry points do not have. Ported in a follow-up commit, which also closed a
pre-existing divergence: `validate.js --project-toml config/project.toml.example` had been failing
on a multi-line TOML string that `tomllib` parses without complaint, so Check I was silently
Python-only too. Both suites now run 47 cases green.

**§2.6 widens the work inside already-counted files more than it adds new ones.** Of its 144
occurrences across 44 files, 41 files sit in the requirements, design, quality and quick-dev
skills already tallied above — but those files now need **two** kinds of edit rather than one: the
assembled path gains a `<feature-id>/` segment, and the working tree's `<feature>` placeholder
gets bound to the registry ID. The file count barely moves; the per-file diff roughly doubles in
those four stages. Planning and execution are untouched by this, since they have no working tree
(§2.6).

Two things partly offset it. The binding is a **placeholder substitution, not a path change**, so
it is mechanical and reviewable in bulk. And §7's reversal removes the review skills' verdict
relocation from phase 3 entirely, which was three skills' worth of genuine output-path churn.

**Be honest about what that comparison does and does not show.** The file count drops by
roughly a fifth, not by an order of magnitude, because the segment still has to be inserted
everywhere it appears — that work is irreducible, and it is the bulk of the change in both
plans. **If the goal is a materially smaller diff, this plan does not deliver one.** What
actually shrinks is risk and sequencing:

- **The prerequisite is external, not internal.** The full plan carries the token rename as a
  blocking Tier 2 dependency, so nothing ships until it lands. Here it is a separate 30-file
  change that merges on its own beforehand — a predecessor rather than a blocker. Same work,
  but it never gates a partially-finished plan.
- **No schema surgery.** No `[[project.features]]` section and no rewrite of both SoD
  geometries — colocate mode is already right, and directory mode gains one segment. The single
  new `[project.paths]` key (`quality_package`) belongs to the prerequisite.
- **No lifecycle.** Nothing to derive, no verdict-file instrumentation gap to close first.
- **Each phase is independently shippable** and phases 1-2 change no paths at all.

**Validator scope — Check N must split into two modes, because it asserts two different
kinds of thing.** `scripts/validate.py` is hard-anchored to the framework repo
(`REPO_ROOT = Path(__file__).resolve().parent.parent`, line 45) and walks
`.agents/skills/` and `templates/`. It cannot see a project's `features.toml`, which lives
in a different repo entirely. The check as first drafted conflated framework self-consistency
with project-data validation; those need separating.

The precedent already exists. **Check I** validates SoD rules "against a fixture
`project.toml` … Run with `--project-toml PATH`" (`scripts/validate.py:19-21`), and a SoD
violation is a hard error *only* in that opt-in mode (line 33). Check N should follow the
same seam:

| Mode | Asserts | Runs |
|---|---|---|
| **N1 — framework** (default) | Every feature-scoped `default-output-path` contains `{feature-id}` as a path segment, **and no retired feature placeholder survives in an artifact path** — see the correction below, which narrows this from what was first drafted | Always, in CI |
| **N2 — project** (`--features-toml PATH`, or folded into the existing `--project-toml` mode) | Every `id` matches `^FEAT-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$`; full ID *and* bare ordinal are unique; `active_feature` resolves to a declared `id`; each `repos` entry resolves to a `[[project.repos]].code` — which requires both files, so this sub-rule only runs when `--project-toml` is also supplied | Opt-in, against a committed fixture in the framework repo and against real projects on demand |

N1 must cover `.agents/skills/` as well as `templates/compositions/` — scoping it to
compositions reproduces the exact gap that let the current drift survive, since
`config/SCHEMAS.md:647` rule 5 governs only tokens inside `project.toml` values.

**Correction — N1's placeholder half is narrower than drafted, and the exception count was
wrong.** This section originally asserted that after phase 3b "the literal `<feature>` should
appear nowhere outside the two prose exceptions named in §2.6". A census taken while building the
check found that wrong in both directions.

There are **three** retired spellings, not one: `<feature>`, `<feature-folder>` (introduced by a
superseded plan) and `<feature-name>` (introduced, and then removed, by this one — see §11). And
`<feature>` has **three** classes of legitimate surviving use, none of them prose exceptions to be
grandfathered:

1. **Conversational placeholders** in elicitation prompts and trigger phrases — "List the next
   behavior for `<feature>`". Nothing to do with a directory.
2. **Scope IDs** of the form `<feature>:<sub-scope>`, which are identifiers, not paths.
3. **The documented application's source tree**, e.g. `src/domain/<feature>/` in the
   reverse-engineering blocks. These describe *the codebase being documented*, not A.I.D.E.'s
   own output layout, and A.I.D.E. has no business renaming them.

A ban on the literal token would therefore have fired on all three and been unshippable. As built,
N1 matches a retired spelling only where the parent marks the string as an A.I.D.E. artifact path
— immediately under `docs/` or under a `{paths.*}` token. That keeps the guardrail meaningful
without legislating over vocabulary it does not own, and needs no exception list, which is what
makes it durable: a new legitimate `<feature>` in prose cannot break the build.

N1 pairs naturally with the prerequisite's Check M: M asserts every path token names a real
key, N1 asserts every feature-scoped path carries a feature segment. Together they close both
halves of the routing contract.

**Token-name validation is no longer this plan's problem.** It was previously considered here
and excluded on the grounds that a check reporting violations nobody was authorised to fix is
just noise. Extracting the reconciliation resolves that cleanly: the check lands there as
Check M, in the same change that fixes every violation it would report, so it goes green
immediately and stays green.

---

## 9. Sequencing

A predecessor plus four phases. Phases 1 and 2 are inert — they add capability without changing
where a single byte lands, so they can merge while the path question is still being argued.

| Phase | Content | Ships alone? |
|---|---|---|
| 0 — Prerequisite | `_docs/path-token-reconciliation-plan.md`: 30 files, 42 occurrences, plus `quality_package` and Check M | Yes, and it is worth doing regardless of feature IDs |
| 1 — Foundation | `features.toml` schema + example, `[user].active_feature`, `SCHEMAS.md`, the `select-feature` skill | Yes. Nothing reads the registry yet |
| 2 — Preconditions | The check-and-delegate block in write-side skills; read-side resolution | Yes. Skills now *know* the feature; paths unchanged |
| 3 — The segment | Insert `<feature-id>/` in the 7 compositions and the skill path strings, gated on registry presence | Yes, per stage if wanted |
| 3b — The binding | Bind the working tree's `<feature>` placeholder to the registry ID across §2.6's 44 files. Separable from phase 3 and separately reviewable, because it changes no path *shape* | Yes, per stage |
| 4 — Guardrail | Check N1 (framework, default) and N2 (project, opt-in against a fixture `features.toml`), positive and negative cases | Yes |

Phase 3 is the only one with real risk, and it can be sliced per stage — requirements
first as the canonical case, quality last as the highest-touch. If phase 3 stalls, phases
1, 2 and 4 still leave the project better off: features are registered, named
consistently, and validated, even while artifacts remain flat.

**Phase 3b is worth keeping distinct from 3, and is the better one to do first.** Phase 3 changes
the *shape* of assembled paths by adding a directory level, so it breaks depth-assuming globs and
needs migration thought; 3b leaves the shape alone and only changes what an existing placeholder
resolves to. It is therefore safe in isolation, and delivers the larger share of the consistency
benefit — the working tree holds more files than the assembled deliverables do. Doing 3b first also
means that if phase 3 is abandoned entirely, features are still registry-named everywhere it
matters.

**Correction — "3b moves nothing" was too strong.** An earlier draft of this paragraph said 3b
"moves nothing". That is true of the framework's own files, and true of any project adopting
feature IDs from the start, but false for the case that turns out to matter most: a project that
improvised `docs/checkout-refunds/` before opting in. For that project, binding the placeholder to
the registry ID means its existing feature directory now resolves somewhere else, and the tree has
to be reconciled. Phase 3b therefore needed a rule it was not originally scoped to carry — see the
reconciliation section of `references/ai-principles/feature-precondition.md`, which detects the
pre-existing bare-slug directory and offers a `git mv` or an explicit decision to keep it. The
distinction to draw between 3 and 3b is *shape versus resolution*, not *moves versus does not
move*.

**Positive fixtures matter as much as negative ones.** A project with no `features.toml`
must validate clean, or every existing project fails on upgrade.

---

## 10. Decisions and open questions

Items marked **DECIDED** are settled and carry their rejected alternatives so the reasoning
survives. The rest are genuinely open, but not equally urgent:

- **Nothing now blocks phase 3.** Item 1 was the last blocker and is resolved.
- **Items 2, 3, 4 and 8** are low-stakes and each carries a recommendation in place; they can
  be settled by whoever implements them unless someone objects.
- **Item 9** blocks nothing. It records where the deferred status decision (§1) will first be
  felt, so that the deferral is a known trade rather than a surprise.

1. **DECIDED — the skill wins; the composition is simply wrong.**
   `greenfield-implementation-package.yaml:23` emits `{paths.planning_path}/{increment-id}.md`
   while `create-implementation-package/references/INPUTS-OUTPUTS.md:29` documents
   `{project.paths.implementation_package}/INC-XXX.md`. This looked like a design
   disagreement; it is not. **There is no `planning_path` key and no `planning` anything in
   `[project.paths]`** — the declared keys are exactly `requirements_package`,
   `design_package`, `implementation_package` and `knowledge_base_path`
   (`config/SCHEMAS.md:297-300`, `config/project.toml.example:50-52`). Meanwhile the skill
   cites a real key *and* halts when it is unset (`INPUTS-OUTPUTS.md:22`). One side is bound
   to config and enforced; the other points at nothing.
   So the composition adopts the skill's key, and the result after feature-scoping is:

   ```
   {project.paths.implementation_package}/<feature-id>/INC-001.md
   ```

   **The increment filename stays bare — no `<feature-id>-` prefix.** `INC-XXX` IDs are
   per-feature counters, not global identifiers, and the feature directory is what associates
   them with their feature. This is the identical rule §2.4 sets for `BUG-XXX`: unique within
   the feature, qualified by the directory, so a fully-qualified reference is
   `FEAT-0001-alert-customer/INC-001`. The same applies to `TC-XXX`.
   **The key correction itself now happens in the prerequisite**, which re-points this
   composition as part of its seven-file composition sweep. What remains here is only the
   feature segment. The decision is recorded in this plan because it was resolved here, and
   because the bare-filename rule it establishes is this plan's to enforce.
2. **DECIDED — the skill is `select-feature`, and selection is the default flow.** This was
   previously filed as a naming question ("`add-feature` reads best as a trigger phrase but the
   skill also lists and activates; `manage-features` is more accurate and less inviting"), and
   that framing undersold it. The issue is not the label but the **default action**: a skill
   invoked at §7's halt point that opens by offering to add reproduces the duplicate-identity
   hazard the precondition exists to prevent. Leading with the existing registry makes reuse the
   default and creation the deliberate choice. The mode count drops from three to two as a side
   effect, because selecting a feature *is* activating it. See §5.
   Rejected: `add-feature` (biases toward creating), `manage-features` (accurate but describes an
   administrative task rather than the thing a user wants to do), and splitting select and create
   into two skills (they share all the registry logic, and the whole point is that one flow leads
   to the other).
3. **Should `select-feature` create the stage directories eagerly**, or let each skill create
   its own on first write? Eager creation makes the layout visible immediately; lazy
   creation avoids empty directories for stages a feature never reaches.
4. **Does the KB's `last_feature_id` frontmatter** get validated against the registry? It
   is the correct link between a feature and the components it touched, and it is
   currently free-text. Cheap to check once a registry exists, but it widens scope into
   the KB stage.
5. **DECIDED — the registry's `repos` field is advisory, not authoritative.**
   `create-requirements-package/steps/00-scope-target-repo.md` asks at run time whether the
   work is single-repo (and which `<repo-code>`) or cross-cutting (and which repos, requiring
   ≥ 2). Once `features.toml` carries `repos` the same fact is declared in two places, so one
   has to yield. The **skill wins**: `repos` is a hint that pre-fills the run-time prompt,
   and the user can override it. The reasoning is that scope genuinely changes during
   discovery — a feature registered against one repo routinely turns out to touch two — so
   freezing scope at mint time would fix an answer before the question has been properly
   asked. Pre-filling captures the convenience without the rigidity. Rejected: registry-wins
   (fewer prompts, but wrong more often) and dropping `repos` (loses a useful default and a
   traceability field).
   **Consequence to implement:** when the run-time answer diverges from `repos`, the skill
   should offer to update `features.toml` rather than letting the two drift apart silently.
6. **DECIDED — everything that enters quick-dev gets a registry entry, including trivial
   changes.** `document-quick-change/SKILL.md:39` classifies rigor as trivial / small /
   medium, and only **trivial** stays inline rather than writing a spec to disk. The tempting
   rule was "no artifact, no registry entry," but the skill's own ordering defeats it: step 1
   determines the feature folder and creates `docs/<feature>/quick-dev-package/` *before*
   rigor is classified at step 4, and `CHANGE-TRACKER.md` is initialised regardless of tier.
   A trivial change therefore already produces a directory and a tracked file. If a folder
   exists, the feature is real, and an unregistered real feature is precisely the drift this
   plan exists to prevent.
   Rejected: reordering the skill so rigor precedes folder determination (a genuine
   improvement, but it makes registration depend on a behaviour change in another skill), and
   tolerating folders without registry entries (reintroduces unvalidated directory names).
   **Consequences to implement:**
   - Step 1's "infer a kebab-case name from the user's description" must be **replaced**, not
     merely guarded. The feature name comes from the registry; inference is the defect.
   - `select-feature` must be cheap enough that registering an ID for a one-line fix is not
     resented. **This is the one place §7's halt-and-re-invoke decision costs something real**:
     quick-dev's whole promise is speed, and a trivial one-line fix now takes a hop out to
     `select-feature` and a hop back. The mitigations are §5's skip rules — an empty registry or a
     no-match description goes straight to create, one description prompt, slug proposed, done —
     and the `## Next skill` return so the user never has to remember what they were doing. If it
     still feels heavy in practice, the fix is to revisit §7 for quick-dev specifically rather than
     to tolerate people routing around quick-dev, which is worse than an over-full registry.
7. **DECIDED, then relocated — `quality_package` is added, but by the prerequisite.**
   Quality was the only stage with **no key to point at**: `requirements_package`,
   `design_package` and `implementation_package` all exist in `[project.paths]`
   (`config/SCHEMAS.md:297-300`), with no quality equivalent. Feature-scoping it would have
   added a level to a genuinely undetermined base — isolation with no answer to "where does
   this live." You decided to add the key, with a default, so it breaks no existing
   `project.toml`.
   It was briefly carried here as a bounded exception to a deferral. Once the reconciliation
   was measured at 30 files and extracted into
   `_docs/path-token-reconciliation-plan.md`, the exception became unnecessary: the key now
   lands there, alongside the 16 `{paths.quality_path}` references that need it. Nothing about
   the decision changed, only its home.
   *(An earlier draft justified this by claiming requirements, design and planning already
   "resolve to a declared key" while quality did not. That was false — most stage tokens did
   not resolve either. The true distinction was that quality had nothing to point at.)*
8. **Can the slug change after minting?** §2.2 borrows the ADR convention's no-reuse rule
   for *ordinals*, but says nothing about the slug — and titles get rewritten during
   discovery all the time. If `FEAT-0007-alert-customer` becomes
   `FEAT-0007-notify-customer`, the directory must be renamed and every artifact citing the
   old ID goes stale. The cheap answer is that the **ordinal is the identity and the slug is
   a label frozen at mint time**: rename the title in `features.toml`, leave the ID alone.
   That keeps paths stable at the cost of a directory whose name can drift from its title.
   Worth stating explicitly, because the alternative gets attempted by whoever hits it first.
9. **How is an abandoned feature represented?** §3 makes the registry append-only and
   status is out of scope (§1), so a cancelled feature stays in the registry indistinguishable
   from a live one, and its ordinal is consumed forever. That is probably fine — gaps are
   legal and a stale entry is harmless — but it means "what am I working on" cannot be
   answered from the registry alone once a project has abandoned anything. It is the first
   place the deferred status decision will actually bite.

---

## 11. Comparison with the full plan

| Dimension | Full plan | This plan |
|---|---|---|
| Files | ~124, token work included | ~102, plus a 30-file predecessor |
| Skills touched | 24 of 49 | 20 of 50, plus 1 new |
| Token reconciliation | Internal blocking tier (§2.6 / D10) — nothing ships until it lands | Separate predecessor that ships on its own merits |
| Registry location | `[[project.features]]` in `project.toml` | Separate committed `features.toml` |
| Active feature | `[user].active_feature` | Same |
| New `[project.paths]` keys | `quality_package` added (D7) | Same key, added by the predecessor (§10 Q7) |
| SoD geometry | Both §5.1 and §5.2 rewritten | §5.1 gains a segment; §5.2 already correct |
| Filenames | Prefix retention open (D3) | Retained, decided |
| Opt-in | Back-compat window open (D6) | Registry presence *is* the flag |
| Feature lifecycle | Analysed, parked in §7 | Out of scope |
| New skills | None | One (`select-feature`) |
| Validator | One check + SoD rule extensions | Check M (predecessor) + Check N1/N2 (here) |

### 11.1 On volume, the two plans are now the same size

This needs stating plainly, because the headline numbers mislead in both directions.

| Measure | Full plan | This plan + predecessor |
|---|---|---|
| **Unique files touched** | ~124 | ~102 (the predecessor's 30 are a subset) |
| **Total file-touches / diff volume** | ~124 | ~132 |

**Both figures understate the work by the same amount, so the comparison still holds.** Neither
plan's count was built with §2.6's working tree in view — the full plan named it as one of three
"rival" conventions without costing the 144 occurrences, and this plan measured it only after the
follow-up review. The 44 files land almost entirely inside the six-stage skill tally both plans
already carry, so neither headline number moves much, but the per-file diff in requirements,
design, quality and quick-dev is roughly double what either plan implied. Treat both totals as
file counts, not effort estimates.

Unique files drop by about a fifth. **Diff volume does not drop at all** — it rises slightly,
because 30 files get edited twice: once to correct the key name, once to insert the segment. So
if the goal is a smaller total change, neither plan delivers it, and this one is marginally
larger. What it buys instead is that each pass contains exactly one kind of edit, which is far
easier to review and to revert than both changes landing on the same line.

The unique-file saving is not spread across the change either. It is four specific exclusions:

| Excluded from this plan | Files | Legitimate? |
|---|---|---|
| Knowledge-base stage (`build-`, `update-`, `detect-drift`, `verify-coverage`) | ~17 | **Yes.** The KB tree is component-scoped and genuinely does not move. Deferred as §10 item 4 |
| Orientation / doc sweep beyond README + AGENTS + the stage map (`INSTRUCTIONS.md`, `CHANGELOG.md`, 3 `customizations/*.example`, 4 blocks) | ~8 | **Partly.** Deferring is safe but accrues documentation debt — files that describe a layout the framework no longer uses |
| `customize-framework` feature-switching as a Layer 4 operation | ~2 | **Yes.** `select-feature` covers it — selecting *is* switching |
| SoD rule extensions and the `[[project.features]]` schema section | ~3 | **Yes.** A separate `features.toml` and a single added segment need less schema surgery |

So roughly two thirds of the saving is the KB stage, which both plans agree does not need to
move. **The irreducible core — inserting one directory segment across ~68 skill files in six
stages, plus binding the working tree's placeholder across 44 of them — is identical in both
plans**, and so, now, is the token reconciliation. It is the same
work, sequenced differently. The case for this plan rests entirely on that sequencing: three
reviewable changes that each stand alone, versus one large cutover with an internal dependency.
Anyone evaluating on diff size should pick either — they are the same size.

**The full plan's one real advantage has been neutralised.** It used to be the more coherent
option: the token/config mismatch is a genuine defect, the full plan fixed it, and this plan
preserved it — leaving tokens that name nothing, now resolving one directory deeper. Extracting
`_docs/path-token-reconciliation-plan.md` as a predecessor removes that gap entirely. Both
plans now end with every path token naming a real key and `quality_package` declared; the
difference is only whether the fix is an internal blocking tier or a merged predecessor.

**Where this plan is better.** The prerequisite ships on its own merits, then every subsequent
phase is independently valuable and the first two are risk-free. It also makes a smaller bet:
if feature-scoped paths turn out to be the wrong shape, the reconciliation plus phases 1, 2 and
4 remain useful on their own, whereas the full plan's value is concentrated in a single large
cutover.

**What the full plan still has that this one does not.** The knowledge-base reconciliation
(§10 item 4), the wider documentation sweep, and `customize-framework` feature-switching — the
~27 files decomposed in §11.1. None is load-bearing, but all three are real work that someone
eventually does.

### 11.2 Scope parity — audited decision by decision

The predecessor plus this plan were checked item by item against the full plan's decision log
(§8) and all five blast-radius tiers (§3). The result: **every decision is carried, and the
remaining gaps are the three §11.1 exclusions plus one open process question.**

| Full plan | Where it lands now | Note |
|---|---|---|
| **D0** identity-layer split | §3 + §4 | Substance identical; the registry is a committed peer file rather than a `project.toml` section |
| **D1** feature-under-stage, one layout | §2.1 | Carried, including not-configurable |
| **D2** `FEAT-NNNN-<kebab-slug>` | §2.2 | Carried verbatim |
| **D3** prefix on assembled, not per-section | §2.1 | Carried. The "drop from per-section" half is a no-op — per-section files (`01-executive-summary.md`) never had a prefix (§2.6) |
| **D4** PR description not persisted | **Already implemented** | `pr-description.yaml`'s `default-output-path` is removed and the omission documented inline |
| **D5** repo-first SoD ordering | §2.1 | Carried with the same `write_role` reasoning |
| **D6** back-compat window | §6 — **superseded, decided** | Registry presence replaces the dual-read window. The migration helper is deliberately not built; relocation is manual `git mv` and expected to be unnecessary |
| **D7** `quality_package` key | Predecessor | §10 item 7 records the relocation |
| **D8** echo the working feature | §7 | Carried for both write- and read-side, per D8's insistence that read-path skills are included |
| **D9** halt-and-ask, not required | §7 step 3 | Carried |
| **D10** rename tokens to match keys | Predecessor | Its whole subject |
| **Tier 1** contract surfaces | §8 Config + Discipline + Orientation | Complete after the audit recovered `framework.toml.example`, `project-bootstrap.md` and the stage map |
| **Tier 2** compositions | §8 + predecessor | All 8 accounted for; `pr-description.yaml` needs nothing (D4) |
| **Tier 3** skills | §8 — **partial** | KB stage (~17) deferred to §10 item 4; `customize-framework` (~2) to §13.2 |
| **Tier 4** validator + tests | §8 Validator | Check M (predecessor) + N1/N2. SoD rule extensions (~3) excluded per §11.1 |
| **Tier 5** orientation docs | §8 Orientation — **partial** | README, AGENTS and the stage map carried; the remaining ~8 deferred to §13.2 |
| **§7** lifecycle / status | Out of scope in both | Equal treatment; §13.3 |

**So the answer to "does this cover the single-shot plan's scope" is: yes for every decision and
the entire irreducible core, no for ~27 files of deliberately deferred work** — the KB stage, the
tail of the doc sweep, `customize-framework`, and the SoD rule extensions. D6 is the only decision
whose *substance* changed rather than moving: no migration helper is built, and §6 records why.
Nothing else in the full plan is dropped or weakened.

*This audit is also what corrected the file count from ~99 to ~102: `config/framework.toml.example`
and `references/elicitation-patterns/project-bootstrap.md` were in neither document, and the latter
is load-bearing rather than cosmetic — §2.3's `start-project` minting and §5's `select-feature`
elicitation both need it.*

---

## 12. A pre-existing defect this plan depends on — greenfield cannot scaffold its KB

Not this plan's work, and not caused by it. But §2.3's argument for `FEAT-0001` rests on
the knowledge base carrying the baseline-versus-delta asymmetry, and **in greenfield that
mechanism does not currently work.** It is recorded here because the `FEAT-0001` decision
should be made with the dependency visible, not discovered during phase 3.

### 12.1 The circular dead end

Four facts, each independently verifiable, which together form a loop with no exit:

1. **Greenfield never runs `build-knowledge-base`.** It appears in the brownfield sequence
   (`workflow-graph.yaml:35`, after the RE review gate) and nowhere in greenfield.
2. **`build-knowledge-base` is the only thing that creates the KB's structure** —
   `ARCHITECTURE.md`, `graph.json`, `change-tracker.md`, and `components/<repo-slug>/*.md`
   (`build-knowledge-base/references/INPUTS-OUTPUTS.md:23-30`). Nothing else authors them.
   `start-project` collects `knowledge_base_path` as configuration and routes brownfield
   onward to `build-knowledge-base`; it scaffolds nothing itself.
3. **`build-knowledge-base` hard-requires reverse-engineering output.** RE Part A and Part B
   docs under `<KB>/source-docs/<repo-slug>/` are both marked required
   (`INPUTS-OUTPUTS.md:9-10`), because component bodies are *derived* from them. A greenfield
   project has none and never will — its system is authored, not discovered.
4. **Greenfield still calls `update-knowledge-base`** as the per-increment closing skill
   (`workflow-graph.yaml:47`), and that skill halts when the KB is absent, instructing the
   user to "run `build-knowledge-base`" (`update-knowledge-base/SKILL.md:55`).

So: greenfield finishes an increment → `update-knowledge-base` says run
`build-knowledge-base` → `build-knowledge-base` needs RE docs → greenfield has no RE docs.
The loop closes. Every greenfield increment ends by being told to run a skill that cannot
run.

### 12.2 The second-order hazard

Greenfield does write into the KB path: `capture-solution-context` is the second skill in
the sequence and emits six required leaves to `<KB>/shared/solution-context/`
(`capture-solution-context/references/INPUTS-OUTPUTS.md:8, 23-28`).

This means the escape hatch of "hand-author enough RE docs to satisfy
`build-knowledge-base`" is actively dangerous. That skill requires
`knowledge_base_path` to "be empty or user confirms overwrite"
(`INPUTS-OUTPUTS.md:8`) — but by then it is not empty, so the user is prompted to
**overwrite a KB that already contains their solution context.** The workaround for the
gap can destroy hand-authored project mission, personas, KPIs and constraints.

### 12.3 Why it matters to *this* plan

§2.3 argues the IDs can stay uniform — `FEAT-0001` as a peer of `FEAT-0002` — because the
baseline/delta asymmetry is carried by the KB rather than by the ID. That argument is
sound, but it is currently **aspirational for greenfield**: the handoff it depends on
(`FEAT-0001`'s architecture and ADRs migrating into the KB so `FEAT-0002` reads the KB
like any brownfield feature) has no implementing skill.

**Decided: accept the dependency.** `FEAT-0001` is adopted now, because it is the correct
model regardless of whether the KB handoff works — the ID scheme should not be shaped
around a defect. Until the gap closes, greenfield's `FEAT-0002` reads `FEAT-0001`'s
packages directly, which is the coupling §2.3 would rather avoid but which is no worse than
today's behaviour.

The rejected alternative was closing the gap first, either by adding a greenfield mode to
`build-knowledge-base` that derives components from the **design package** instead of RE
docs (the design package carries the component decomposition, so the input genuinely exists
— it is simply a different source), or by adding a `scaffold-knowledge-base` skill that
emits the empty structure so `update-knowledge-base` has somewhere to write. Either remains
the right fix; neither is a prerequisite for feature IDs.

The gap needs its own write-up and its own schedule, since it breaks greenfield's
per-increment close-out today, entirely independently of feature IDs.

---

## 13. Recommended follow-up work

What remains after the predecessor and all four phases have landed. Nothing here blocks the
plan; the point is that these are known and scheduled rather than rediscovered later as bugs.

Ordered by whether something is currently broken, not by size.

### 13.1 First — a live defect, unrelated to feature IDs

**Close the greenfield KB scaffolding gap (§12).** This is the only item on the list that is
broken *today*: every greenfield increment ends by being told to run a skill that cannot run.
Feature IDs neither cause it nor worsen it, but §2.3's `FEAT-0001` argument leans on the KB
handoff, so the plan is stronger once it works. Either fix identified in §12 is viable — a
greenfield mode for `build-knowledge-base` deriving components from the design package, or a
`scaffold-knowledge-base` skill emitting the empty structure. The overwrite hazard in §12.2
should be fixed in the same change, since the current workaround can destroy hand-authored
solution context.

### 13.2 Then — completing the feature-ID work

**Adoption for projects that already have a flat artifact tree.** The bootstrap default in §6
covers new projects only, which leaves the harder half untouched. Three related gaps, worth
solving together because they are one user journey:

1. **Nothing detects a flat layout.** Every feature-aware skill's precondition returns on its
   first line when `features.toml` is absent, so no skill ever looks at the tree. The framework
   therefore cannot notice "this project has five packages on flat paths" and cannot offer the
   switch. Any detection has to be added *outside* the precondition, or the precondition's
   cheap-exit property is lost — and that property is what guarantees existing projects are
   unaffected.
2. **Assembled artifacts have no migration path.** The reconciliation rule covers the
   working-tree directory only. On opt-in the assembled path changes in both depth *and*
   filename, because `{feature-id}` resolves to the inferred slug before opt-in and to the
   registry ID after: `alert-customer-requirements.md` becomes
   `FEAT-0001-alert-customer/FEAT-0001-alert-customer-requirements.md`. The pre-opt-in file is
   left orphaned and nothing mentions it. Note this qualifies §2.1's "only depth changes"
   claim: depth is all that changes for a *glob* like `*-requirements.md`, but the specific
   filename changes too, which is what strands the old file.
3. **A sweep is explicitly out of scope today** — one feature, one question, at the moment that
   feature is next worked. Reconsider only alongside (1) and (2); a sweep without a story for
   assembled artifacts would move half of each feature.
4. **Nothing verifies a migration finished, which makes a hand-run one unsafe at scale.** No
   check validates a *project's* artifact layout — the validator's only project-artifact mode is
   `--cross-cutting-artifact`, which reads `affects_repos` frontmatter and says nothing about
   paths. So a partial migration is silent, and the reconciliation rule actively confirms it:
   seeing `docs/FEAT-0001-refunds/` present it takes the "already migrated" branch, uses the
   directory, and never looks at the assembled side. The result is a project whose working tree
   is feature-scoped, whose deliverables are still flat, and where every skill reports success.

**On migrating by hand.** Worth recording, because it will be attempted: the work is pure file
movement with no content rewriting, so an agent prompted ad hoc can do it, and `git mv` preserves
history. Two things make it unreliable rather than merely tedious. First, **two different renaming
rules apply** — the five single-file stage deliverables (`-requirements.md`,
`-enhancement-spec.md`, `-quick-dev-spec.md`, `-design.md`, `-quality.md`) change directory *and*
filename, because the filename's `{feature-id}-` prefix changes value from inferred slug to
registry ID, while `implementation_package`'s children (`INC-XXX.md`, `increment-status.md`,
`bugs-and-issues-log.md`, `change-tracker.md`, `implementation-package.md`, `plan/`, `review/`)
change directory only, since per-item files carry no prefix. A hand migration will tend to apply
one rule uniformly. Second, under SoD directory mode the segment nests *inside* `<repo-code>/`
(and `_cross-cutting/<feature-id>/` for cross-cutting features), so the correct target depends on
`project.toml`.

The conclusion that matters for sequencing: the missing piece is **verification, not tooling**. A
one-or-two-feature project can be migrated by prompt and eyeballed. At ten features the moves are
still easy and the silence is the hazard, so an opt-in completeness check — given `project.toml`
and `features.toml`, report artifacts still sitting on flat paths — buys more safety per line than
a migration command would, and it is the one part a prompt cannot supply for itself.

**Knowledge-base reconciliation** (§10 item 4, ~17 files). Validate the KB's `last_feature_id`
frontmatter against the registry and settle `update-knowledge-base`'s feature handling. This is
the correct link between a feature and the components it touched, and it is free text today.
Cheap once a registry exists; deliberately excluded here because the KB tree is component-scoped
and genuinely does not move.

**The wider documentation sweep** (~8 files). `INSTRUCTIONS.md`, `CHANGELOG.md`, three
`customizations/*.example`, four blocks. Pure debt, no risk, no dependencies.

**`customize-framework` feature-switching** (~2 files). Makes activation a first-class Layer 4
operation rather than only a `select-feature` invocation. Genuinely optional — selecting a feature
already sets `[user].active_feature`, which is the whole of what switching means.

### 13.3 Eventually, or never

**Feature lifecycle and status** (out of scope per §1). The full plan's §7 analysis stands and
does not need redoing. Two things are worth knowing before starting: the planning gate has no
verdict file, which the full plan identifies as the inconsistency to fix first, and §10 item 9
records where the deferral bites — an abandoned feature is indistinguishable from a live one in
an append-only registry. **Only worth doing if concurrent features actually surface the need.**
It is the one item here with no current defect behind it.

**Drop the `<feature-id>-` filename prefix** (§2.1). Deliberately retained as the reversible
option. Cheap now, expensive once artifacts circulate — so if it is ever going to happen, sooner
is much better than later. Cosmetic either way.

**Rename `solutions-package` to `design-package`** (§2.6). 33 occurrences, no correctness
benefit, and it would collide with phase 3b's edits in the same files. Recorded so the
inconsistency is known to be deliberate.

**Prefix normalisation of `{paths.X}` versus `{project.paths.X}`.** Ruled out of scope by the
predecessor's §3.1 at roughly 100 occurrences of text that already works, with `SCHEMAS.md` §1.5
legalising both forms instead. Genuinely fine to never do.
