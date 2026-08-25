# Plan — Feature ID as a directory segment for all stages (SUPERSEDED)

> **⚠ SUPERSEDED — do not implement from this document.**
>
> Split 2026-08-12 into two independently-mergeable documents:
>
> - `_docs/path-token-reconciliation-plan.md` — the §2.6 prerequisite below.
>   **Implemented, shipped in `2.3.0`.**
> - `_docs/feature-id-minimal-plan.md` — the remaining feature-ID-as-path-segment
>   scope. **Not yet implemented.**
>
> This document is retained for its rationale (§1), blast-radius analysis, and
> decision log (§8) — several decisions here (D1, D2, D5, D7, D10) are carried
> forward by the minimal plan rather than re-argued. It is a historical record,
> not the current plan of record: read the two documents above instead.

Status: ~~proposal / not yet approved~~ — **superseded**, see banner above. (Original: 6 open decisions block implementation; see §8 Decision log. The path shape (D1, D5) and the §2.6 prerequisite (D7, D10) were decided; the prerequisite was independently shippable — and now shipped.)
Scope: A.I.D.E. framework itself (`.agents/skills/`, `templates/`, `config/`, `references/`, `scripts/`, root docs)
Citations verified against: **framework 2.0.0** (commit `0aae630`). Every `file:line` reference below was checked at that commit; re-verify after any upstream sync before acting on a line number.

**In scope:** making feature ID a directory segment in every stage and mode, so that multiple features can be worked concurrently without collision. Includes the feature registry and per-workspace active-feature selection needed to make the segment trustworthy.

**Out of scope:** feature status / lifecycle tracking. Analysed and parked in §7 — the two are separable, and everything in §1 lands without it.

---

## 1. Rationale

### 1.1 Today feature identity lives in filenames, not paths

The default (non-SoD) layout gives each stage a flat directory and encodes feature identity in the **filename**:

```
{project-root}/.framework-output/requirements/<feature-id>-requirements.md
{project-root}/.framework-output/design/<feature-id>-design.md
{project-root}/.framework-output/implementation/INC-001.md
```

Sources: `config/project.toml.example:50-52`, `templates/compositions/greenfield-requirements-package.yaml:13`, `templates/compositions/greenfield-design-package.yaml:13`.

A project with one feature works. A project with two features puts both features' artifacts in the same directory, interleaved, distinguishable only by a filename prefix that each skill re-derives on its own.

### 1.2 The flat layout makes the framework's own write-discipline contract unsafe

`references/ai-principles/write-discipline.md` Prompt 2 offers:

> **A) Full structure** — One file per section/block, plus an index/manifest file that links to them all.

Per-section filenames are generic and stage-scoped, not feature-scoped — `functional-requirements.md`, `security-design.md`, `index.md`, `change-tracker.md`, `completeness-tracker.md` (`_docs/ai-sdlc-stage-map-new.md:140-159`, `:168-188`). In a flat stage directory, the second feature to choose "Full structure" **silently overwrites the first feature's section files**.

This is the sharpest defect in the current design: the framework mandates per-section persistence (write-on-acknowledge invariant, per-section persistence checkpoint, closing inventory check) on a path layout that cannot hold per-section files for more than one feature. The closing inventory check would even pass, because the files exist — they just belong to the wrong feature.

### 1.3 Three rival layout conventions disagree on exactly this point

| Convention | Where it is authoritative | Feature as directory? |
|---|---|---|
| `{paths.<stage>_package}/<feature-id>-<stage>.md` | `config/project.toml.example`, 6 of the 8 stage compositions | No — filename prefix |
| `docs/<feature>/<package-name>/…` | `_docs/ai-sdlc-stage-map-new.md` (requirements `:123`, design `:163`, quick-dev `:260`), `create-*` step files | Yes — feature is the top segment |
| `<artifact_subdir>/<stage>/<feature-id>/INC-XXX.md` | `config/SCHEMAS.md:709-717` (SoD colocate mode) | **Yes — already shipped** |

The stage map is not even internally consistent: requirements, design, and quick-dev use `docs/<feature>/`, but implementation uses `<project.paths.implementation_package>/` (`:199`, `:238`) — the token convention from row 1. So the split is three-way, and one of the three files that is supposed to be canonical straddles two of them.

Skills currently straddle these. `create-requirements-package/steps/01-discovery.md:25` writes to `docs/<feature>/requirements-package/discovery/`, while `steps/04-writing.md:41` aliases the assembled package to `{paths.requirements_path}/{feature-id}-requirements.md`. A downstream skill reading "the requirements package" has to guess which layout is in play.

Note the third row: **SoD colocate mode already treats feature ID as a directory segment.** This proposal generalises an existing, working convention rather than inventing one.

### 1.4 Quick-dev is already broken by the split

`document-quick-change/SKILL.md:36` creates `docs/<feature>/quick-dev-package/`, but `:48` writes the spec to `{paths.requirements_path}/<feature-id>-quick-dev-spec.md`. `plan-quick-change` then takes its spec **input** from `<feature-folder>/quick-dev-package/` (`references/INPUTS-OUTPUTS.md:7`) and writes its own **outputs** back into the same folder (`:17` plan, `:19` codebase-orientation) — so the folder convention is load-bearing on both sides of that skill, while the file `document-quick-change` actually produced sits somewhere else entirely. The handoff only survives because the agent papers over it in-conversation.

### 1.5 There is no persisted feature identity anywhere

Confirmed by search: no `active_feature`, `current_feature`, `[project.features]`, or feature registry exists in the active tree. No `FEAT-` prefix exists either. The feature ID is re-derived per skill invocation by inferring a kebab-case name from the user's description (`document-quick-change/SKILL.md:36`).

Consequences:

- **Traceability across stages is a naming coincidence.** Nothing links the requirements package to the design package for the same feature except that two separate skill invocations happened to produce the same slug. "Refund fee handling" → `refund-fee-handling` in one stage and `refund-fees` in another yields two orphan trees and no error.
- **Cross-stage review has nothing to anchor on.** `review-design-package` cannot mechanically confirm it is reviewing the design for the requirements package that was approved.

### 1.6 State discovery cannot answer per-feature questions

`framework-navigator/steps/02-state-probe.md:35-41` sets `stage_artifacts.<key> = true` iff the stage directory "exists **and** is non-empty", and detects execution via a `{implementation_package}/INC-*/` glob. That answers "has anything ever been written to design?" — not "is feature X past design?". On a multi-feature project the navigator's recommendation is wrong by construction: the first feature to reach execution makes every later feature look like it is already in execution.

A feature directory segment turns this into a correct, cheap probe: `exists(<stage-root>/<feature-id>/)`.

### 1.7 Feature-scoped lifecycle operations are currently impossible

All of these need a path prefix to scope to:

- Archive or delete an abandoned feature without hand-picking files out of four stage directories.
- `git diff`/`git log` limited to one feature's artifacts.
- Review, audit, or verify a single feature (`review-*`, `audit-quality-coverage`, `verify-source` all take a `package_path` today and would take a feature root instead).
- Hand one feature's full artifact set to a reviewer, or attach it to a ticket.
- Run two features concurrently — the common real-world case, and the one the current layout handles worst.

### 1.8 Summary of the rationale

The change is not cosmetic. It (a) removes a silent data-loss path in "Full structure" mode, (b) collapses two rival conventions into one, (c) makes per-feature state probing correct, (d) gives cross-stage traceability something real to hang on, and (e) generalises a convention SoD colocate mode already proves works.

---

## 2. Proposed change

### 2.1 Canonical rule

> **Feature ID is a mandatory path segment immediately below the stage root, in every mode, for every stage that produces feature-scoped artifacts.**

```
<stage-root>/<feature-id>/…
```

Concretely, in default (non-SoD) mode:

```
{project-root}/.framework-output/
├── requirements/
│   └── FEAT-0001-refund-fee-handling/
│       ├── FEAT-0001-requirements.md                ← assembled package / index (D3)
│       ├── discovery/…
│       ├── analysis/…
│       └── requirements/                            ← per-section files, now collision-free
│           ├── functional-requirements.md
│           ├── acceptance-criteria.md
│           └── change-tracker.md
├── design/
│   └── FEAT-0001-refund-fee-handling/…
├── implementation/
│   └── FEAT-0001-refund-fee-handling/
│       ├── implementation-package.md
│       ├── INC-001.md
│       └── increment-status.md
└── quality/
    └── FEAT-0001-refund-fee-handling/…
```

In SoD **directory mode** the segment appends below the existing repo-code discriminator (`config/SCHEMAS.md:686-702`):

```
<host-repo>/<artifact_subdir>/<stage>/<repo-code>/<feature-id>/…
<host-repo>/<artifact_subdir>/<stage>/_cross-cutting/<feature-id>/…
```

In SoD **colocate mode** the layout is **already correct** (`config/SCHEMAS.md:709-717`) and needs only to be extended from planning/execution to all colocated stages.

### 2.2 Why feature-under-stage rather than stage-under-feature

Two shapes are viable. Recommending A.

| | **A. Feature under stage** (recommended) | **B. Stage under feature** |
|---|---|---|
| Shape | `.framework-output/design/<feature-id>/` | `docs/<feature-id>/solutions-package/` |
| Stage roots stay independently configurable via `[project.paths]` | Yes | No — one root per feature; `[project.paths]` loses meaning |
| Works when stages live in different repos (SoD dir mode) | Yes | **No** — a feature-first root cannot span host repos |
| Works for cross-repo features | Yes (`_cross-cutting/<feature-id>/`) | Poorly |
| One folder per feature (easy archive / handoff / PR review) | No — four folders | Yes |
| Matches `_docs/ai-sdlc-stage-map-new.md` today | No | Yes |
| Diff size from current state | Smaller — one segment inserted | Larger — inverts the hierarchy |

Option A is canonical because SoD is the harder constraint and it already dictates stage-first. Pointing every stage root under a shared prefix (`{project-root}/docs/<stage>`) shortens paths to `docs/requirements/<feature-id>/`, but it does **not** recover B's one-folder-per-feature ergonomics — that is still four folders per feature. True feature-first would need an explicit `[project.paths].layout = "feature-first" | "stage-first"` switch, which reintroduces the two-layout ambiguity §1.3 exists to remove and is **recommended against** for the first pass. D1 accepts A on exactly those terms — see §8.1.

### 2.3 Feature identity must be declared, not re-derived

The directory segment is only trustworthy if every stage agrees on it. This requires two separate things, at two different config layers. Conflating them is a design error.

| | **What features exist** | **Which feature I am working on** |
|---|---|---|
| Scope | Project / team | Person + workspace |
| Layer | 3 — `project.toml` (committed) | 4 — `project.user.toml` (gitignored) |
| Lifetime | Life of the feature | Life of my current focus |
| Changes when | A feature is started or shipped | I switch what I'm doing |

#### 2.3.1 Feature registry — `project.toml` (Layer 3, committed)

```toml
[[project.features]]
id            = "FEAT-0001-refund-fee-handling"   # the directory segment; see D2 for the format
title         = "Refund fee handling"
ticket        = "ACME-1247"             # optional; Jira key / Confluence page
affects_repos = ["api-orders"]          # reuses the SoD cross-cutting convention
created       = "2026-07-28"
```

Rules:

1. `start-project` does **not** write a features section at all — it scaffolds a commented-out example. Absence is the valid empty state; see §2.3.3 for why an empty `[[project.features]]` block is a TOML trap.
2. The first `create-*` skill to run for a new feature elicits `id` + `title` and appends the entry.
3. Every subsequent skill **resolves the segment from the registry**. No skill re-slugifies a description when a registry entry exists.

The registry's specific job is narrow but not replaceable by the filesystem: `ls <stage-root>/` also yields the set of feature IDs, but the filesystem cannot distinguish *"this is a new feature"* from *"someone typo'd the slug"* — both simply create a directory. A declarative registry gives the validator an allowlist to check disk state against, which is the anti-drift property §1.5 is missing today.

Deliberately **not** in the registry: any `status` or `lifecycle` field. Status tracking is out of scope for this change (§2.5), and nearly every lifecycle state is derivable from artifacts on disk anyway, so a hand-maintained copy would be a second source of truth that silently drifts. The registry carries identity, nothing more.

#### 2.3.2 Active feature — `project.user.toml` (Layer 4, gitignored)

In a large solution **multiple features are active concurrently**, each worked by a different person. Which feature *I* am on is a personal, workspace-scoped configuration choice: when I configure my workspace I select my active feature, and planning activity I undertake is ascribed to it until I choose otherwise.

That is exactly Layer 4. `config/project.user.toml.example:4` describes the layer as "GITIGNORED. Personal, machine-local. Edited freely by you alone", and the layer already carries a field with an identical justification — `[user].role`, which `config/SCHEMAS.md:420` documents as "project-scoped because the same person may act as different roles on different projects". The same person works different features on different projects, and both fields are consulted at the same write boundaries.

```toml
[user]
role           = "Developer"            # existing — checked against [stages.*].write_role
active_feature = "FEAT-0001-refund-fee-handling"  # new — must resolve to a [[project.features]].id
```

**Resolution order** at any feature-scoped write or read:

1. A feature named explicitly in the user's request — always wins, and does **not** rewrite config.
2. `[user].active_feature` from `project.user.toml`.
3. The only entry in `[[project.features]]`, if there is exactly one.
4. Otherwise halt and ask — Principle 7.

Note this replaces an earlier draft of this plan that proposed `[project].active_feature` in the committed `project.toml`. That was wrong on two counts: it put per-person state in a team-shared file (git churn, and two developers on one branch overwriting each other), and it modelled concurrent features as an edge case rather than the normal condition.

**Selection is a deliberate act, never a side effect.** `active_feature` is written by workspace configuration (`start-project` step 05, which already optionally authors `project.user.toml`, or `customize-framework`) or by an explicit "switch to feature X". No skill silently updates it as a by-product of running.

**Staleness mitigation.** A configured pointer can go stale — I finish a feature and forget to switch. Because selection is deliberate, correcting it is the user's call, so the framework's obligation is visibility, not interrogation: every feature-scoped skill **echoes the resolved feature and its source** before its first write.

> Working feature: `FEAT-0001-refund-fee-handling` (from `project.user.toml` `[user].active_feature`). Artifacts will be written under `.framework-output/design/FEAT-0001-refund-fee-handling/`.

Cheap, no round-trip in the common case, and it surfaces a stale pointer at the one moment it matters — before anything lands in the wrong directory.

#### 2.3.3 The empty registry is a valid, long-lived state

A brand-new project has no features. This is not a transient bootstrap blip to be raced past — it is a legitimate state that can persist for a long time, and the design must treat it as first-class.

**Express emptiness as absence, not as an empty block.** Scaffolding the section as

```toml
[[project.features]]
```

with nothing under it does **not** produce an empty array — TOML reads it as an array containing *one table with no fields*, i.e. a malformed feature with no `id`. `start-project` would emit an invalid `project.toml` on every new project, and the validator would be right to reject it.

The inline alternative is also a trap: `features = []` under `[project]` parses, but the TOML v1.0.0 spec states that "attempting to append to a statically defined array, even if that array is empty, must produce an error at parse time." The first `create-*` skill to append a `[[project.features]]` entry would then fail to parse the file it just wrote.

So: **omit the section entirely and scaffold a commented-out example**, exactly as `config/project.toml.example:164-188` already does for the optional SoD `[stages.*]` blocks and `config/project.user.toml.example:57-60` does for `[user]` / `[user].role`. The loader normalises absence to `[]`. This also honours the standing design rule at `config/SCHEMAS.md:65-67` — "every layer is *optional* … each higher layer supplies *refinements*, never required values."

**How long emptiness lasts depends on the flow.** In greenfield, `start-project` hands off directly to `create-requirements-package`, so the window is short. In brownfield the sequence is `start-project → analyze-repository → reverse-engineer-* → build-knowledge-base → verify-knowledge-base-coverage`, and *none* of those stages is feature-scoped (§3.6) — they are repo- and component-scoped. A brownfield onboarding can legitimately run for weeks with an empty registry.

**Which skills create the first entry:** `create-requirements-package`, `document-quick-change`, and the brownfield enhancement path. Each elicits `id` + `title`, appends the entry, and offers to set `[user].active_feature`.

**Validation must distinguish four states**, and only two are errors:

| Registry | `[user].active_feature` | Verdict |
|---|---|---|
| absent / empty | unset | **Valid** — fresh project or brownfield onboarding |
| non-empty | unset | **Valid** — resolution order §2.3.2 handles it |
| any | set, resolves to a declared `id` | **Valid** |
| any | set, does not resolve | **Error** — dangling pointer, including when the registry is empty |
| contains an entry with no `id` | any | **Error** — the malformed-scaffold case above |

**The "you need a feature" check is a runtime precondition, not a config rule.** `validate.py --project-toml` must never require a non-empty registry; a project with no features is a valid project. The obligation instead sits on downstream feature-scoped skills (`create-design-package`, planning, quality, execution, all `review-*`): invoked against an empty registry, they halt with a message naming the skill that creates the first feature, rather than inventing a slug or writing to an unscoped path.

#### 2.3.4 Why this strengthens the case for the path change

Concurrency is the normal condition, not an edge case. If several features are genuinely in flight at once, the flat layout in §1.1 is not merely risky — the "Full structure" collision in §1.2 stops being a rare accident and becomes the expected outcome, and the navigator's stage probe (§1.6) is wrong for every feature but the most recently touched.

### 2.4 Decisions required before implementation

The identity-layer question is treated as **resolved** by §2.3: the registry is Layer 3 (committed), the active-feature selection is Layer 4 (personal, workspace-scoped). The remainder:

> **This section holds the analysis** — the question, the options, and the reasoning behind each recommendation. The **outcome** of each decision (status, date, rationale, any divergence from the recommendation) is recorded once in **§8 Decision log**. Do not record status here; §8 is the single source of truth for what has actually been decided.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Layout shape | feature-under-stage / stage-under-feature / configurable | Feature-under-stage, single layout |
| D2 | Feature ID format | kebab slug / ordinal + slug / ticket key (`ACME-1247`) / `ACME-1247-refund-fees` | **`FEAT-NNNN-<kebab-slug>`** — ordinal plus slug. Decided; see §8.1. Ticket key stays a registry field, not a path segment. |
| D3 | Keep the `<feature-id>-` filename prefix once the directory carries the ID? | keep / drop | **Keep** on the assembled package only (`<feature-id>/<feature-id>-requirements.md`). Redundant in-tree, but the assembled file is the artifact that gets copied out, emailed, and attached to tickets — it needs to be self-identifying. Drop it from per-section files. |
| D4 | Is the PR description persisted to disk at all? `pr-description.yaml` declared `{paths.execution_path}/pr-{change-id}.md`, but `create-pr` never writes it — its sink is "chat (and PR body if PR is created)" (`references/INPUTS-OUTPUTS.md:29`, `SKILL.md:94`). The question of *where* the file goes presupposes a file that is never created. | persist / don't persist | **Don't persist.** Decided — see §8.1. |
| D5 | Ordering in SoD dir mode: `<repo-code>/<feature-id>/` or `<feature-id>/<repo-code>/`? | repo-first / feature-first | Repo-first — preserves the existing role/ownership boundary that `[stages.*].write_role` enforces. |
| D6 | Back-compat window for the flat layout | hard cut / dual-read window / migration script | Dual-read for one minor version + a migration helper. See §5. |
| D7 | Add the missing stage keys to `[project.paths]`? | yes / no | **`quality_package` only.** It is referenced throughout the quality skills but absent from `config/project.toml.example` and `config/SCHEMAS.md` §2.3. `execution_package` was originally in scope here but is **not added** — D4 established its sole would-be consumer writes nothing to disk. See §2.6 — this is a prerequisite, not a sub-task. |
| D8 | Scope of the §2.3.2 "working feature" echo | every feature-scoped skill / write-path skills only / first skill per session | Every feature-scoped skill, once per invocation, before its first write. Read-path skills included — a `review-*` run against the wrong feature is as damaging as a write |
| D9 | Must `[user].active_feature` be set before a feature-scoped skill will run on a multi-feature project? | required / halt-and-ask fallback | Halt-and-ask (resolution order step 4). Requiring it up front breaks the first-feature bootstrap, where no registry entry exists yet |
| D10 | How to reconcile the `{paths.*_path}` composition tokens with the `*_package` config keys? | rename tokens to match keys / rename keys to match tokens / document an alias map | Rename the **tokens** to match the config keys (`{paths.requirements_package}` etc.), because the keys are the committed, user-visible surface and renaming them would break every existing `project.toml`. Prerequisite work — see §2.6 |

---

### 2.5 Out of scope: feature status and lifecycle management

**This change delivers concurrent features. It does not deliver status tracking.**

The registry carries identity only — `id`, `title`, `ticket`, `affects_repos`, `created`. No `status`, no `lifecycle`, no gate-outcome fields. Nothing in this plan computes, stores, or reports where a feature sits in the SDLC beyond what the framework already does today.

That is a deliberate boundary, and it holds because the two are genuinely separable: feature-scoped paths are a prerequisite for per-feature status, but per-feature status is not a prerequisite for anything here. Every benefit in §1 — collision-free per-section files, one convention instead of two, correct per-feature state probing, feature-scoped review and archival — lands without a single status field.

Status is worth doing later, and the analysis is already done: §7 records which lifecycle states are derivable from artifacts on disk (most of them), which are not (four), and the one framework inconsistency that would need fixing first. Deferred, not discarded.

One consequence for §3.3: `framework-navigator`'s state probe becomes **per-feature** but keeps its current, cheap semantics — "does this feature's stage directory exist and is it non-empty" — evaluated once per registered feature. That is already a strict improvement over today's project-wide probe (§1.6) and needs no lifecycle machinery.

---

### 2.6 Prerequisite: the composition tokens do not resolve to the config keys

**This must land before Tier 2, and it is not part of this change.** The decision is recorded as D7 and D10 in §8.1; this section is the evidence behind it.

#### 2.6.1 Keys and tokens are different things

A **key** is a field name in `[project.paths]` in the user's `project.toml` — `requirements_package`, `design_package`, `implementation_package`, `knowledge_base_path`. User-authored, committed, documented in `config/SCHEMAS.md` §2.3. This is the public config surface.

A **token** is a `{…}` placeholder, and the framework has two unrelated species:

| | Species A — environment tokens | Species B — template tokens |
|---|---|---|
| Examples | `{project-root}`, `{framework-root}`, `{home}`, `{cwd}`, `{workspace}` | `{paths.*}`, `{feature-id}`, `{increment-id}`, `{change-id}` |
| Appear in | *values* inside config files | framework-authored compositions and skill markdown |
| Expand to | a filesystem location | a config field's value (`{paths.*}`) or a runtime value (the rest) |
| Direction | config → filesystem | framework template → config / runtime |
| Documented | yes — `config/SCHEMAS.md` §1.5 | **nowhere** |

Resolving one artifact path is therefore a two-step chain, and only the second step is specified:

```
{paths.requirements_package}                               ← Species B: look up the key
  → "{project-root}/.framework-output/requirements"         ← that key's value
  → "/Users/dev/my-project/.framework-output/requirements"  ← Species A expansion
```

The `{paths.*}` tokens are **dotted addresses into the config**, not nicknames: `{paths.quality_path}` asserts "table `paths`, field `quality_path`". Two things corroborate that reading — the same dotted convention appears in a separate mechanism in the same files (`include-if: "project.elicitation.records_testability_classification == true"`, `greenfield-quality-package.yaml:36`), and the one `{paths.*}` token whose spelling exactly matches its key, `{paths.knowledge_base_path}` at 61 uses, is the only one that has never caused trouble. A token that does not match a key is therefore a **broken pointer**, not a naming preference.

#### 2.6.2 Nine spellings, six destinations, one that resolves

Counting `templates/compositions/` *and* the live skills tree — 45 files under `.agents/skills/` use these tokens:

| Destination | Spellings in use | Existing key |
|---|---|---|
| requirements | `{paths.requirements_path}` ×13, `{paths.requirements_package}` ×2 | `requirements_package` |
| design | `{paths.design_path}` ×11, `{paths.design_package}` ×2 | `design_package` |
| implementation | `{paths.planning_path}` ×1, `{paths.implementation_package}` ×10 | `implementation_package` |
| quality | `{paths.quality_path}` ×16 | — (added by D7) |
| execution | `{paths.execution_path}` ×1 | — (**token deleted** by D4 — no file output) |
| knowledge base | `{paths.knowledge_base_path}` ×61 | `knowledge_base_path` ✓ |

**Three destinations carry two competing spellings at once**, and the split is not random: every `_package`-form use sits in the quality stage or `review-implementation-package` — the QE work merged from `_archive/EM-QE-Skills/` — while every `_path`-form use sits in requirements, design, or quick-dev. The rename is **already half-complete and stalled**, not a new convention being imposed.

#### 2.6.3 A writer and its reader already disagree

`greenfield-implementation-package.yaml:23` writes increments to `{paths.planning_path}/{increment-id}.md`. The skill that has to find them reads `{paths.implementation_package}/INC-*.md` (`audit-quality-coverage/steps/01-locate-package-and-tracker.md:43`). Same destination, two names, and `planning_path` is not a key at all. Whether the coverage audit finds anything depends on an agent inferring that the two strings mean one directory.

#### 2.6.4 Why nothing caught it

Three gaps line up:

1. **No resolver.** Nothing in `scripts/` reads `[project.paths]`. Path resolution is agent-interpreted from markdown, so an unknown field cannot throw.
2. **The validator rule is scoped to the wrong layer.** `config/SCHEMAS.md:647` rule 5 — "every path token used is one of the four defined in §1.5" — sits under the **Config:** heading beside rules about `project.code` and `[[project.repos]]`. It governs Species A tokens inside `project.toml` values. Species B, in `templates/` and `.agents/skills/`, has never been in its scope. (Rule 5 also says "four" where §1.5 defines five; `{workspace}` was added without updating it.)
3. **Failure is silent.** The agent infers intent from the token name, finds `.framework-output/quality/` in an EXAMPLE file, and writes there. It works until two skills infer differently.

#### 2.6.5 Consequences for this plan

1. Inserting `{feature-id}` into a token that does not resolve produces a path that is differently broken, not fixed. The Tier 2 edit is not mechanical until the token names are settled.
2. The proposed validator check (§3.4) would assert segment structure inside strings whose resolution is undefined — it would pass on paths that cannot be built. Its scope must cover `.agents/skills/` as well as `templates/compositions/`, or it reproduces gap 2 above.
3. `{feature-id}` is itself an undocumented Species B token today. Adding it to §1.5 in Tier 1 means also defining the species it belongs to, not just the one token.
4. Blast radius of the prerequisite is **45 skill files + 6 compositions**, and it is the same under any D10 option — an alias map still leaves both spellings in the tree.
5. `{paths.planning_path}` vs `implementation_package` is the planning/implementation vocabulary split surfacing in the path layer. `AGENTS.md` vocabulary says *increment* and *package*, and the key already says `implementation_package`, so the token follows the key.

---

## 3. Blast radius

Measured by searching the active tree (excluding `_archive/`, `_bmad/`, `.claude/skills/bmad-*`) for `{paths.*_path}` tokens, `*_package` config keys, `docs/<feature>`, and `feature-id`/`feature_id`.

**~124 files across 24 of 49 skills, 8 of 9 stage folders** — `reverse-engineering` is the only stage folder untouched. (A raw search matches 26; two of those are incidental, see re-baseline 2 below.)

Re-baselined twice, both against the same measurement:

1. **At 2.0.0** the totals were originally "119 files / 23 of 48 skills / 12 stage folders" against 1.6.5. 2.0.0 removed the `jira`, `confluence`, and `files-conversion` stage folders (6 skills) in favour of the pluggable source-adapter model. None of those 6 were in the affected set, so the numerator held at 23 of 42.
2. **At `13d9c2a`** (PR 2011, reconciling the three unlanded `mm/*` branches, released as 2.2.0) seven skills landed: `capture-solution-context`, `document-operations`, `generate-ai-rules`, `review-knowledge-base-package`, `review-adversarial`, `review-edge-case-hunter`, `review-reverse-engineering-package`. Three match the search, taking the raw count to **26 of 49**, but on inspection only **one is substantive** — `review-adversarial`, whose stage-detection path heuristic is genuinely load-bearing (§3.3). `capture-solution-context` needs a one-line prose fix; `generate-ai-rules` is a false positive and should be left alone. So the honest figure is **24 skills to change, plus one doc-touch** — the raw grep overstates by two. Compositions went 34 → 37 (`kb-ai-rules`, `kb-operations`, `kb-solution-context`), none feature-scoped; block library 452 → 464, affected count unchanged at 4.

### 3.1 Tier 1 — contract surfaces (change first; everything else derives from these)

| File | What changes |
|---|---|
| `config/SCHEMAS.md` | §1.5 add `{feature-id}` token (and the `{paths.<key>}` family, §2.6); §2.3 add `[[project.features]]` + `quality_package` (D7; `execution_package` **not** added — D4); §2.4 add `[user].active_feature` alongside `[user].role` (the `project.user.toml` `[user]` block is at `:413`, the `framework.toml` schema copy at `:246-249`); §5.1/5.2 rewrite both SoD geometries (`:680` and `:704`) — **all three line numbers re-verified after 2.2.0**, which shifted them by ~33 lines when `[project.elicitation].re_verification_gate` and the `[knowledge_base]` staleness keys landed |
| `config/project.toml.example` | `[project.paths]` comments; new **commented-out** `[[project.features]]` example block, matching the SoD-block convention at `:164-188` (§2.3.3) |
| `config/project.user.toml.example` | New `[user].active_feature`, documented next to the existing commented-out `[user]` / `[user].role` block (currently `:57-60`) |
| `config/framework.toml.example` | `output_root` commentary (line 43) |
| `references/ai-principles/write-discipline.md` | Prompt 2 wording; per-section paths in the invariant, checkpoint, and closing inventory check must be feature-scoped |
| `_docs/ai-sdlc-stage-map-new.md` | Lines 123-291 — the canonical tree, mostly the `docs/<feature>/` variant but inconsistent: implementation already uses `<project.paths.implementation_package>/` at `:199` and `:238` (see §1.3). Becomes the single source of truth for the new shape. |
| `references/elicitation-patterns/project-bootstrap.md` | Lines 184-186 — legacy `docs/` example paths (`:64` and `:69` are `Maps to:` field lists, not paths); add feature elicitation |

### 3.2 Tier 2 — compositions (8 of the 37 files in `templates/compositions/`)

**Blocked on §2.6.** The token rename must land first, or these edits insert a segment into strings that do not resolve.

Six are mechanical — `{paths.X_path}/{feature-id}-X.md` → `{paths.X_path}/{feature-id}/{feature-id}-X.md`:

| File | Line | Current `default-output-path` |
|---|---|---|
| `greenfield-requirements-package.yaml` | `:13` | `{paths.requirements_path}/{feature-id}-requirements.md` |
| `brownfield-enhancement-spec.yaml` | `:22` | `{paths.requirements_path}/{feature-id}-enhancement-spec.md` |
| `quick-dev-spec.yaml` | `:14` | `{paths.requirements_path}/{feature-id}-quick-dev-spec.md` |
| `greenfield-design-package.yaml` | `:13` | `{paths.design_path}/{feature-id}-design.md` |
| `greenfield-quality-package.yaml` | `:15` | `{paths.quality_path}/{feature-id}-quality.md` |
| `brownfield-quality-package.yaml` | `:13` | `{paths.quality_path}/{feature-id}-quality.md` |

Two are **not** mechanical — neither currently carries `{feature-id}` at all, so each needs a decision rather than an edit:

- `greenfield-implementation-package.yaml:23` emits `{paths.planning_path}/{increment-id}.md`, while `create-implementation-package/references/INPUTS-OUTPUTS.md:29` documents flat `{project.paths.implementation_package}/INC-XXX.md`. Two mismatches in one line: the token name (§2.6) and the missing feature scope. Reconcile as part of this work.
- `pr-description.yaml` — **already done** (D4). The `default-output-path` line is deleted: the composition has no file output, so it needs neither a config key nor a `{feature-id}` segment. It is now the only composition of 37 without the field; the omission is documented inline so it reads as deliberate.

The remaining 29 compositions (all `re-*`, all `kb-*` including the three new ones, `project-change-log.yaml`) are repo-, component-, or project-scoped and are out of scope per §3.6.

### 3.3 Tier 3 — skills (24 skills, ~94 files)

| Stage | Files | Skills | Nature of change |
|---|---|---|---|
| quality | 21 | `create-quality-package`, `review-quality-package`, `execute-quality-increments`, `audit-quality-coverage`, `review-test-failures` | Highest-touch. `audit-quality-coverage/steps/01-locate-package-and-tracker.md` needs its mixed conventions reconciled — Legacy-vs-SoD mode branching at `:34-36`, plus a tokenized `{paths.quality_path}/{feature-id}-quality.md` sitting beside a hardcoded `docs/<feature>/quality-package/quality/…` at `:61-64`; `TC-XXX.md` paths gain a segment |
| knowledge-base | 17 | `build-`, `update-`, `detect-drift`, `verify-coverage`, + 2 incidental (below) | Mostly **read-side**: KB paths are component-scoped, not feature-scoped, so the KB tree itself does not move. `update-knowledge-base` `feature_id` handling and `last_feature_id` frontmatter should be reconciled with the registry. The two 2.2.0 entrants are **not** substantive: `capture-solution-context/SKILL.md:138` only *mentions* `docs/<feature>/requirements-package/` in prose contrasting the KB layer against requirements (a wording fix, so the doc doesn't describe a layout that no longer exists), and `generate-ai-rules/references/EXAMPLE.md:61` is a **false positive** — its `<initials>/<feature-id>-short-slug` is a git *branch*-naming convention in generated AI rules, unrelated to artifact paths. Do not edit it |
| requirements | 12 | `create-`, `review-` | Write-side canonical change; `steps/00-scope-target-repo.md`, `01-discovery.md`, `03-analysis.md`, `04-writing.md` |
| design | 11 | `create-`, `review-` | Same, plus ADR fallback path (`steps/02-design.md:45-46`) |
| planning | 10 | `create-`, `review-` | Plus the flat `INC-*.md` glob in `review-implementation-package/references/INPUTS-OUTPUTS.md:7-12` → must become feature-scoped |
| execution | 8 | `execute-increments`, `create-pr`, `manage-bugs` | `increment-status.md`, `bugs-and-issues-log.md` move under the feature; `create-pr` reads all four stage roots |
| meta | 8 | `start-project`, `framework-navigator`, `customize-framework`, **`review-adversarial`** | `start-project` elicits the registry and offers `[user].active_feature` in its existing step-05 `project.user.toml` branch; `customize-framework` gains feature-switching as a Layer 4 operation; navigator's state probe becomes per-feature (§1.6) and reports every active feature, not just one. **`review-adversarial` is a genuine read-side risk, not a cosmetic one**: `references/OVERVIEW.md:43` infers the stage from *path heuristics* (`docs/<feature>/requirements-package/` → requirements) when `--stage` is absent. Insert a segment without updating that heuristic and the skill silently misattributes findings to the wrong stage — a wrong answer rather than a crash, which is the worst failure mode in this whole change |
| quick-dev | 6 | `document-`, `plan-`, `execute-quick-change` | Opportunity to fix the §1.4 split in the same pass |

Read-path skills are the risk concentration: `review-*`, `audit-quality-coverage`, `verify-source`, `track-change`, `create-pr`, and the navigator all locate artifacts by glob or by a user-supplied `package_path`. Adding a segment breaks every non-recursive glob.

### 3.4 Tier 4 — validator and tests (doubled by the py/js twin requirement)

| File | Change |
|---|---|
| `scripts/validate.py` + `scripts/validate.js` | New check (**M**). `A`-`L` are now all taken: `K` is the framework-layer `[tools.*]` guardrail from 2.0.0 (`validate.py:1054`, reported at `:1065`), and **`L` was claimed by 2.2.0** for the RE close-out gate binding (`:1105`). This plan originally proposed `L`; that would now collide. The check itself is unchanged: every composition `default-output-path` for a feature-scoped artifact contains `{feature-id}` as a path segment. Extend SoD rules 11-12 for the new depth. Registry rules: `active_feature` resolves to a declared `[[project.features]].id`; `id` matches the D2 format and is unique (both the whole string and the ordinal alone); `affects_repos` entries resolve to `[[project.repos]].code` |
| `scripts/test_validate.py` + `scripts/test-validate.js` | New positive/negative cases |
| `scripts/test_fixtures/sod-negatives/` | Negative fixtures: missing feature segment, duplicate feature id, **duplicate ordinal with differing slugs** (the D2 branch-collision case), malformed id not matching `^FEAT-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$`, `active_feature` pointing at an undeclared feature, a `[[project.features]]` entry with no `id` (the §2.3.3 malformed-scaffold case). **Positive fixtures matter equally here:** a `project.toml` with no features section and no `active_feature` must validate clean, or every new project fails its own bootstrap — and a registry with *gaps* in the ordinal sequence must also pass, since gaps are legal and only reuse is not |
| `scripts/build-registry.{py,js}` | No change expected (skill registry only) |

Every validator change lands twice, in Python and Node. Budget accordingly.

### 3.5 Tier 5 — orientation docs

`README.md` (lines 175-176 setup-mode artifact paths, 187 the `Paths:` elicitation bullet, 207 `artifact_subdir` in the SoD example), `INSTRUCTIONS.md` (install/shim runbook — verify nothing embeds artifact paths), `AGENTS.md` (vocabulary section gains "feature"), `CHANGELOG.md`, `config/customizations/*.toml.example` (**3** of the 9 examples: `create-requirements-package.toml.example:63` `filename_pattern`, `review-implementation-package.toml.example:96` `findings_path_pattern` — note it uses the orphan `{paths.implementation_path}`, so §2.6 must land first — and `audit-quality-coverage.toml.example`), `templates/blocks/shared/affects-repos.md`, `templates/blocks/quality/index.md`, `templates/blocks/knowledge-base/{architecture-index,component}.md`.

### 3.6 Explicitly out of scope — does **not** change

| Area | Why |
|---|---|
| RE Part A: `docs/<domain>-internal/` (11 `re-*-internal.yaml`) | Repo-scoped, not feature-scoped. Reverse engineering documents a repo, not a feature |
| RE Part B + KB tree: `source-docs/<repo-slug>/`, `components/`, `lineage/`, `shared/adrs/` | Component-scoped. The KB is deliberately feature-agnostic; `last_feature_id` frontmatter is the (correct) link |
| KB solution-context layer: `shared/solution-context/`, `shared/ai-rules/`, `shared/operations/` (new in 2.2.0) | **Solution**-scoped — one per solution, not one per feature. Mission, personas, KPIs, coding guardrails and ops topology outlive any single feature, so these must *not* gain a `{feature-id}` segment. Their three compositions (`kb-{solution-context,ai-rules,operations}.yaml`) resolve under `{paths.knowledge_base_path}` and are affected by the §2.6 token rename only, not by the path change |
| `templates/blocks/**` content — 460 of 464 files | Blocks are content, not routing. The 12 blocks added by 2.2.0's solution-context layer reference no feature ID, so the affected count stays at 4 |
| Source-adapter output paths (formerly the Jira / Confluence cache and extract paths) | User-prompted output roots, upstream of the stage pipeline. 2.0.0 removed the bundled `jira`, `confluence`, and `files-conversion` skills in favour of pluggable adapters (`references/orientation/source-adapters.md`), so there is nothing left in-tree to change here — but any adapter that lands later must not reintroduce a feature-scoped path of its own |
| `.claude/skills/bmad-*`, `_bmad/`, `_archive/` | Not A.I.D.E. (per `CLAUDE.md`) |
| Increment / test-case ID schemes (`INC-XXX`, `TC-XXX`) | Unchanged; they become feature-scoped by their parent directory |

### 3.7 Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Existing user projects break.** Installed `AIDE/` copies and populated `.framework-output/` trees live outside this repo. Shims regenerate on upgrade; user artifacts do not move | **High** | Migration helper (§5 Phase 7) + dual-read window (D6). Never auto-move user files without confirmation |
| **Read-path globs silently return nothing** rather than erroring — a `review-*` skill finds zero `INC-*.md` and may report "no increments" instead of halting | **High** | Every read-path skill must halt-on-empty, not proceed-on-empty. Audit each of the ~8 read-path skills explicitly |
| **Feature-ID drift** between stages creating orphan trees | High → Low with registry | §2.3 registry is the mitigation; validator enforces resolution |
| **Two layouts coexist during the deprecation window**, doubling the branching the change was meant to remove | Medium | Time-box the window to one minor version; centralise resolution in one documented reference (`config/SCHEMAS.md` §1.5) rather than per-skill branching |
| Python/Node validator twins diverge | Medium | Land both in the same commit; `test_validate.py` and `test-validate.js` assert the same contract |
| SoD dir mode gains a fourth level; role-boundary enforcement must still hold | Medium | D5 keeps repo-code above feature-id so `write_role` checks are unchanged |
| Quick-dev's existing split (§1.4) gets carried forward instead of fixed | Medium | Fix it in Phase 3; it is a strict subset of this work |
| Deeper paths in ~90 step files consume marginal context budget | Low | Negligible relative to per-skill reference loading |

---

## 4. Sequencing

Each phase ends green on `python3 scripts/validate.py` and `python3 scripts/test_validate.py`.

| Phase | Work | Gate |
|---|---|---|
| **0. Decide** | Resolve D3, D6, D8, D9. (D1, D2, D4, D5, D7, D10 accepted — §8.1) | Written decisions recorded in §8 |
| **0b. Prerequisite** | §2.6 token/key reconciliation: rename the `{paths.*_path}` tokens to match the `[project.paths]` keys, add `quality_package`, delete the orphan `{paths.execution_path}` token (D4), document the `{paths.<key>}` family in `config/SCHEMAS.md` §1.5. **Decided and independently shippable — merge before the rest is settled.** Surface: 45 skill files + 6 compositions | Every `{paths.*}` token in `templates/compositions/` **and `.agents/skills/`** resolves to a declared `[project.paths]` key; no `_path`-form spelling survives; full validator suite green |
| **1. Contracts** | Tier 1 files. `config/SCHEMAS.md` becomes the single normative statement of the path shape; `_docs/ai-sdlc-stage-map-new.md` becomes the single canonical tree | Docs self-consistent; no skill changed yet |
| **2. Compositions + registry** | Tier 2 (8 YAMLs). Add `[[project.features]]` / `active_feature` to schema + example. `start-project` scaffolds and elicits | validate.py check A still passes |
| **3. Write-path skills** | `create-requirements-package`, `create-design-package`, `create-implementation-package`, `create-quality-package`, the 3 quick-dev skills (fixing §1.4), `execute-increments`, `execute-quality-increments`. Feature resolution reads the registry | New artifacts land in feature-scoped paths in a scratch project |
| **4. Read-path skills** | All `review-*`, `audit-quality-coverage`, `verify-source`, `track-change`, `manage-bugs`, `create-pr`, `framework-navigator` (per-feature state probe), the 4 KB skills' feature handling. Recursive globs + halt-on-empty + dual-read | Every read-path skill locates Phase 3 output; halts (not silently passes) on a missing feature |
| **5. Validator + tests** | Tier 4, both language twins | New negative fixtures fail as expected; full suite green |
| **6. Docs** | Tier 5 + `CHANGELOG.md` entry | Grep finds no residual flat feature-scoped path patterns |
| **7. Migration** | Migration helper for existing projects: read old flat layout, propose a per-feature move plan, execute on confirmation. Announce the deprecation window | Helper dry-runs cleanly against a fixture project holding two features in the old layout |

Phases 3 and 4 must not be split across releases — a write-path-only release produces artifacts the read-path skills cannot find.

---

## 5. Verification

1. **Static:** new validate.py/js check **L**; grep sweep for `{paths.*}/{feature-id}-` (should be zero outside the assembled-package pattern per D3). Also assert the §2.6 invariant: every `{paths.*}` token used in `templates/compositions/` **and under `.agents/skills/`** resolves to a declared `[project.paths]` key. Scoping this to compositions alone reproduces the gap that hid the drift (§2.6.4).
2. **Dogfood, the case that is broken today:** scratch project, two features, both choosing "Full structure" in Prompt 2, both taken through requirements → design → planning. Assert no file from feature A is overwritten by feature B, and that `framework-navigator` reports each feature's stage independently and correctly.
3. **SoD:** exercise dir mode and colocate mode with one single-repo and one cross-cutting feature.
4. **Migration:** run the Phase 7 helper against a fixture of the old flat layout; confirm idempotence on a second run.

---

## 6. Open questions

Decision status lives in **§8**; this section holds only what is not a decision waiting on a decider.

- **Standing dependency, not an open question:** the §2.6 prerequisite is now *decided* (D7, D10) but not yet *implemented*. Tier 2 cannot be executed until Phase 0b lands — until then the paths this plan specifies cannot be expressed by the composition layer at all.
- Feature status / lifecycle is deferred (§2.5); the supporting analysis and its own open questions are parked in §7.

---

## 7. Parked — feature lifecycle and status derivation

**Not part of this change.** Recorded here so the analysis does not have to be redone, and so the path change does not accidentally foreclose it. Nothing in §1-§6 depends on anything below.

The headline: a feature lifecycle exists and the framework is already well instrumented for it. Most states derive from artifacts on disk. Four do not, and one of those four is a fixable inconsistency rather than a genuine limit.

### 7.1 The lifecycle is flow-dependent, not one linear enum

`workflow-graph.yaml` defines three flows with different gate sets, and after PR 2011 they no longer share a count. Greenfield runs four review gates (requirements, design, planning, quality — the last user-elected). Brownfield runs **five**: the same four preceded by `review-reverse-engineering-package`, the RE close-out gate now routed at `workflow-graph.yaml:144`, upstream of requirements. Quick-dev runs **none**: `document-quick-change → plan-quick-change → execute-quick-change → create-pr`.

Any lifecycle model must therefore be flow-aware; a single enum applied to all three would mark every quick-dev feature as permanently un-reviewed. Note that the RE gate is **repo-scoped, not feature-scoped** — it certifies the onboarding of a codebase, not the readiness of a feature — so it should not be folded into a per-feature lifecycle even though it sits in the brownfield sequence.

### 7.2 State-by-state derivability

| State | Signal on disk | Derivable? |
|---|---|---|
| Registered, not started | `[[project.features]]` entry, no stage directory | Yes |
| Requirements in progress | Stage dir exists; composition inventory incomplete; `completeness-tracker.md` | Yes |
| Requirements complete | Every composition-expected artifact present (the write-discipline closing inventory check already computes exactly this) | Yes |
| **Requirements gate** | `requirements-package/review/readiness-verdict.md` → `APPROVED` / `CONDITIONAL` / `BLOCKED` | **Yes — explicit verdict file** |
| Design in progress / complete | As above, under the design root | Yes |
| **Design gate** | `solutions-package/review/readiness-verdict.md` → `GO` / `CONDITIONAL GO` / `NO-GO` | **Yes — explicit verdict file** |
| Planning complete | `implementation-package.md` + `INC-*.md` present | Yes |
| **Planning gate** | **Change-tracker row + chat only — no verdict file** | **No — instrumentation gap** |
| Quality gate (when elected) | `quality-package/review/readiness-verdict.md` → `GO` / `CONDITIONAL GO` / `NO-GO` | **Yes — explicit verdict file** |
| Executing / blocked / execution complete | `increment-status.md` aggregate over `not-started` / `in-progress` / `completed` / `blocked` / `on-hold` | **Yes — purpose-built state file** |
| **Shipped / merged** | PR URL is chat-only (`create-pr/references/INPUTS-OUTPUTS.md:30`); changelog entry is conditional on the project keeping a changelog. Since 2.2.0 there may be **no URL at all** at skill-exit — see §7.3 | **No — gap, and harder than it looks** |
| **Abandoned** | — | **No — undecidable from artifacts** |
| **On hold before planning starts** | — | **No — no status file exists yet to hold it** |

Two structural notes. Verdict files are written **even when the verdict is negative** — `review-requirements-package/references/INPUTS-OUTPUTS.md:23` states that on `FAIL` the verdict file is still written, with `FAIL` recorded — so the audit trail survives re-runs and derived state distinguishes "failed the gate" from "not yet reviewed" rather than collapsing both into absence. And under SoD colocate mode `increment-status.md` lives in each source repo, so feature-level execution state for a cross-cutting feature is an **aggregation across N repos**, not a single file read.

### 7.3 The planning gate is an inconsistency worth fixing first

`review-implementation-package` is the **only** package-review skill that does not write a dedicated `review/readiness-verdict.md`. Its outputs are a chat report plus a "verdict entry" row in `change-tracker.md` (`references/INPUTS-OUTPUTS.md:33-34`). The GO/NO-GO therefore exists only as semi-structured prose in a tracker, and the derivability chain breaks at exactly one link, in the middle of the sequence.

PR 2011 sharpened this from a 3-of-4 minority into a 5-of-6 outlier: the two review skills it added — `review-knowledge-base-package` and `review-reverse-engineering-package` — both emit `readiness-verdict.md`. Every package-review gate in the framework now persists a verdict file except planning, which reads as an oversight rather than a design choice.

Whenever status work is picked up, the first move should be to **close the instrumentation gap rather than compensate for it with registry state**: have `review-implementation-package` emit `readiness-verdict.md` like its five siblings, and have `create-pr` persist the PR URL and merge reference. Both are consistent with existing behaviour and valuable as audit artifacts independent of any status feature. The alternative — `planning_approved` and `shipped` fields in the registry — is the hand-maintained mirror that §2.3.1 rejects.

The `create-pr` half is now the harder of the two, because PR 1917 made PR creation host-aware. There are three exit paths — `gh pr create` on GitHub, `az repos pr create` on Azure DevOps, and a **browser-URL fallback** everywhere else — and on the third path the skill hands the user a URL to open, so no PR exists and no PR URL is knowable when the skill finishes. "Persist the PR URL" is therefore not one change but two: capture it directly on the two CLI paths, and on the fallback path either persist the intent and reconcile later, or accept that shipped-state is underivable for those hosts. Worth deciding deliberately rather than discovering at implementation time. Note also that `create-pr/references/INPUTS-OUTPUTS.md:30` still describes the output as arriving "After `gh pr create`", which 2.2.0 made inaccurate — a small pre-existing correction in its own right.

Both fixes are independently shippable and do not require the path change, though they are cheaper afterwards because verdict files land in a feature-scoped directory.

### 7.4 If status is added later, the shape to prefer

Derive by default; declare only what disk cannot express. That means a sparse **override**, not a status mirror:

```toml
[[project.features]]
id        = "FEAT-0001-refund-fee-handling"
lifecycle = "abandoned"   # optional; valid: abandoned | on-hold. Omit for the normal case.
```

Both values mean "a human stopped this deliberately — do not infer from artifacts." Every other state stays computed, preserving the single-source-of-truth property.

### 7.5 Open questions for that future work

- Does derived lifecycle need caching? Computing it means reading up to four verdict files plus an `increment-status.md` per repo. Fine for one feature; `framework-navigator`'s probe has a <100ms budget (`steps/02-state-probe.md:60-63`) and would repeat this per registered feature.
- Is `on-hold` distinguishable from `abandoned` in practice, or is one flag enough?
- Should a derived lifecycle be surfaced anywhere other than `framework-navigator` — a `list-features` affordance, or a project dashboard?
- Concurrency stress: two people with different `[user].active_feature` values writing to the same stage root at once. The path change makes their writes non-overlapping, which is the point — but `increment-status.md` and `change-tracker.md` are per-feature files, so confirm no shared-file contention survives.
- Does a feature ID ever need to be renamed after artifacts exist, and does the migration helper cover that path?
- Should `verify-source` and `track-change` take a feature ID instead of a `package_path` once the segment exists?
- Multi-project KBs (`config/SCHEMAS.md` §6, already deferred) interact with `last_feature_id` uniqueness if two projects share a KB. D2 **sharpens** this rather than easing it: ordinals are allocated per project, so every project mints a `FEAT-0001`, making collision across a shared KB near-certain rather than merely possible. If shared KBs go ahead, `last_feature_id` likely needs qualifying by project code.

---

## 8. Decision log

The authoritative record of what has been decided, when, and why. **§2.4 holds the analysis** — question, options, reasoning. **This section holds the outcome.** Nothing else in the document should carry decision status.

Status vocabulary:

| Status | Meaning |
|---|---|
| `Open` | Not decided. No implementation work may depend on it. |
| `Accepted` | Decided. Implementation may proceed on this point. |
| `Rejected` | The §2.4 recommendation was considered and not taken; the `Decision` column records what was chosen instead. |
| `Superseded` | Replaced by a later decision. Kept for the audit trail, never deleted. |

To record an outcome: set `Status`, fill `Decided` with the date and the decider, and write the rationale — **especially when it diverges from the recommendation**, since a divergence that isn't explained will be re-litigated. Move the row from §8.2 to §8.1.

### 8.1 Decided

| # | Decision | Status | Decided | Rationale |
|---|---|---|---|---|
| D0 | **Identity layer split** — the feature registry is Layer 3 (`project.toml`, committed); active-feature selection is Layer 4 (`project.user.toml`, gitignored). | `Accepted` | During authoring (§2.3) | The registry is a shared team fact and belongs in version control. Which feature *one developer* is currently working on is per-person, per-workspace focus, and belongs in the personal override for the same reason `[user].role` already does. **Supersedes** an earlier draft that put `active_feature` in the committed `project.toml`, which failed twice over: it wrote per-person state into a team-shared file — producing git churn and cross-developer overwrites on any shared branch — and it modelled concurrent features as an edge case rather than the normal condition this change exists to support. |
| S1 | **Scope boundary** — this change delivers concurrent features and feature-scoped paths. Feature *status* and lifecycle tracking are deferred. | `Accepted` | During authoring (§2.5) | The two are genuinely separable: feature-scoped paths are a prerequisite for per-feature status, but per-feature status is a prerequisite for nothing here. Every benefit in §1 lands without a single status field. The registry therefore carries identity only. Analysis preserved in §7 so it doesn't have to be redone — deferred, not discarded. |
| D7 | **Add the missing `[project.paths]` stage keys** — ~~`quality_package` and `execution_package`~~ → **amended 2026-08-09 by D4 to `quality_package` only**, in `config/project.toml.example` and `config/SCHEMAS.md` §2.3. | `Accepted` (amended) | 2026-08-04 | Mostly *restores a dropped key* rather than adding a new one. `quality_package` was defined in the archived QE work (`_archive/EM-QE-Skills/config/project.toml.example:53`; `_archive/EM-QE-Skills/config/SCHEMAS.md:295`, which also documented the token alias explicitly) — but the quality skills were merged into the live tree **without** their schema support. The absence is a merge regression, and it is already causing divergence: mixed conventions in `audit-quality-coverage/steps/01-locate-package-and-tracker.md`, and the `.framework-output/quality/` convention leaking into `review-quality-package/references/EXAMPLE.md:11` because no key declares it. The failure is silent rather than loud because **nothing in `scripts/` reads `[project.paths]`** — path resolution is agent-interpreted from markdown, so a missing key means the agent improvises and a writer can disagree with its reader about where an artifact lives. Adding keys with defaults is backward compatible: no existing `project.toml` breaks, no migration. Key names follow the existing three (`quality_package`, **not** `quality_path`) because the keys are the committed user-visible surface — the same argument D10 rests on. |

| D10 | **Rename the `{paths.*}` tokens to match the `[project.paths]` keys** — `requirements_path` → `requirements_package`, `design_path` → `design_package`, `planning_path` → `implementation_package`; document the `{paths.<key>}` family in `config/SCHEMAS.md` §1.5. | `Accepted` | 2026-08-04 | Three lines of evidence, all in §2.6. **(a)** These tokens are dotted *addresses* into the config, not nicknames — `{paths.quality_path}` asserts a field named `quality_path` exists. The only token whose spelling matches its key (`{paths.knowledge_base_path}`, 61 uses) is the only one that has never misfired, so a mismatched token is a broken pointer rather than a style choice. **(b)** The rename is **already half-done**: every `_package`-form use sits in the QE-merged skills, every `_path`-form use in the older requirements / design / quick-dev skills. This finishes a stalled migration instead of imposing a new convention. **(c)** Keys are the committed user-visible surface; renaming keys instead would break every `project.toml` in the field. **The alias option is rejected** — three destinations carry two competing spellings, so an alias map would have to declare both, encoding the ambiguity rather than resolving it, and it leaves both spellings in the tree for the same 45-file sweep. `planning_path` → `implementation_package` is the only judgement call; the token follows the key, matching `AGENTS.md` vocabulary. |

| D1 | **Layout shape: feature-under-stage, one layout, not configurable** — `<stage-root>/<feature-id>/…` in every mode and stage. | `Accepted` | 2026-08-04 | The decisive constraint is SoD directory mode. `[stages.*].dir` places stage roots in *different host repos*, so a feature-first root cannot span them (§2.2) — SoD is the harder constraint and it already dictates stage-first. Secondary support: each stage root stays independently configurable via `[project.paths]`, which a feature-first root would render meaningless; cross-repo features keep working through `_cross-cutting/<feature-id>/`; and the diff inserts one segment rather than inverting the hierarchy. **Costs accepted knowingly:** four folders per feature instead of one, and a direct contradiction of `_docs/ai-sdlc-stage-map-new.md` as it stands — that doc is rewritten in Tier 1 and is already internally inconsistent (§1.3). **Deliberately not configurable:** a `[project.paths].layout` switch would reintroduce exactly the two-layout ambiguity §1.3 exists to remove. Deferred, not adopted. |
| D5 | **SoD segment ordering: repo-first** — `<host-repo>/<artifact_subdir>/<stage>/<repo-code>/<feature-id>/…` | `Accepted` | 2026-08-04 | The `<repo-code>` directory *is* the ownership boundary that `[stages.*].write_role` enforces (`config/SCHEMAS.md:686-702`). Feature-first would cut across it: one feature directory would span several role-owned scopes, and a `write_role` check would no longer correspond to a directory subtree. Repo-first also appends below an existing discriminator instead of reordering it — a smaller diff — and leaves `_cross-cutting/<feature-id>/` working as a sibling of `<repo-code>/`. Consistent with D1 on the same principle: the coarser, ownership-bearing discriminator stays outermost. |

Carried forward from D1 — a defect found while recording this decision:

- §2.2 originally claimed option B "stays available as a project-level choice" by pointing all stage roots under `{project-root}/docs`. That was **overstated**: the configuration yields `docs/<stage>/<feature-id>/` — still four folders per feature. It shortens the prefix; it does not deliver B's one-folder-per-feature ergonomics, which is B's entire appeal. **§2.2 has been corrected.** The decision stands on the SoD argument alone; anyone who genuinely needs one-folder-per-feature needs the deferred `layout` switch, and that is not grounds to reopen D1 (§8.4).

Carried forward from D10:

- The §3.4 validator check must cover **`.agents/skills/` as well as `templates/compositions/`**. Scoping it to compositions alone reproduces the exact gap that let this drift survive — `config/SCHEMAS.md:647` rule 5 governs only tokens inside `project.toml` values (§2.6.4).
- Rule 5 says "four" tokens where §1.5 defines five. Worth fixing in the same pass; unrelated to feature IDs.

Carried forward from D7 — not a blocker, must not be lost:

1. **Behaviour change for improvised locations.** A declared default becomes authoritative, so any team whose agent had been inferring a location will find *new* artifacts at `.framework-output/quality/` instead. Nothing is lost or broken; this is a release note, not a migration.

D7's second carried-forward item — that `execution_package` was not a restoration and needed a design point D7 could not itself answer — is **resolved by D4 below**, which removes the need for the key entirely. D7 is amended accordingly: `quality_package` only.

| D4 | **The PR description is not persisted to disk** — `default-output-path` removed from `pr-description.yaml`; no `execution_package` key; the `{paths.execution_path}` token is deleted rather than fixed. | `Accepted` | 2026-08-09 | D4 was posed as "should the PR description move under the feature?", which presupposed a file that is never written. `create-pr` renders the body to chat for review and then into the PR itself — its own outputs table gives the sink as "chat (and PR body if PR is created)" (`references/INPUTS-OUTPUTS.md:29`; `SKILL.md:94`). The `default-output-path` was therefore vestigial: it named a destination nothing writes, via `{paths.execution_path}` — a token used **once in the entire repo** and resolving to no key (§2.6.2). Nothing is lost by removing it. The PR body's durable home is the pull request on the remote, and per-increment / per-FR traceability already lives in the conventional commit messages (`Implements: INC-XXX`, `Traceability: FR-...`), so a local copy would duplicate git history. The one real argument for persisting — making "this feature shipped" answerable from the project folder (§7.3) — is status tracking, deferred under S1. **Consequences:** D7 narrows to `quality_package` only; `pr-description.yaml` becomes the only composition of 34 without `default-output-path`, with the omission documented inline so it reads as deliberate; the execution stage gets no `[project.paths]` entry and no `{feature-id}` segment. **Would reopen if** S1 is lifted and derivable ship-state is wanted, which is the same decision as §7.3's "persist the PR URL". |

| D2 | **Feature ID format: `FEAT-NNNN-<kebab-slug>`** — zero-padded 4-digit ordinal, allocated sequentially in creation order, plus a descriptive kebab slug. E.g. `FEAT-0001-alert-customer`. Ticket key remains a registry field (`ticket = "ACME-1247"`), not a path segment. | `Accepted` | 2026-08-09 | Gives features a natural creation-order sort that a bare slug cannot. **This is not a new convention** — it is exactly the framework's existing ADR shape (`ADR-NNNN-<kebab-title>`, e.g. the real `ADR-0001-adopt-oauth4webapi.md` produced in testing), including sequential allocation and the "no number reuse" rule already specified at `_docs/skills-test-plan.md:1210-1211`. Zero-padding to four digits is what makes lexicographic sort agree with numeric order (`FEAT-0010` after `FEAT-0009`); the `FEAT-` prefix disambiguates from the sibling `INC-` / `TC-` / `ADR-` families. A secondary benefit: the ordinal is a **stable identity** while the slug stays descriptive, so a feature can be renamed in prose without losing its anchor — which also hardens the §1.5 drift argument, since a re-slugified description can no longer silently become a second feature. |

Carried forward from D2 — two implementation points, neither a blocker:

1. **Ordinal allocation is a concurrency hazard, and concurrency is the point of this change.** Sequential allocation works by reading the highest existing ordinal — the ADR rule at `skills-test-plan.md:1211` says to "compute by listing existing ADRs before the run". Two developers starting features on separate branches will both read `FEAT-0007` and both mint `FEAT-0008`. The saving grace is a consequence of D0: because the registry lives in the committed `project.toml`, a duplicate ordinal surfaces as a **git merge conflict in one file** — loud and blocking — rather than as two directories quietly coexisting. That is a real argument for the registry being Layer 3, and it means the mitigation is mostly a validator rule (ordinals unique across `[[project.features]]`) plus a note in the skill that mints them. Gaps in the sequence are fine and must not be treated as errors; reuse must not be.
2. **D2 makes D3 more consequential.** With the full ID in the directory name, keeping the `<feature-id>-` filename prefix yields `FEAT-0001-refund-fee-handling/FEAT-0001-refund-fee-handling-requirements.md`. The §2.1 example therefore shows the shortened `FEAT-0001-requirements.md` — self-identifying when copied out, without restating the slug. D3 should decide between the full ID, the ordinal alone, and no prefix, and it is no longer a purely cosmetic call.

### 8.2 Open

Recommendations are summarised for scanning only; the reasoning is in §2.4. `Reversal` is the cost of changing course *after* artifacts exist on disk.

| # | Decision | Recommendation | Gates | Reversal | Status |
|---|---|---|---|---|---|
| D6 | Back-compat window for the flat layout | Dual-read for one minor version + migration helper | **The delivery plan itself** (§4, §5) | Medium — process, not data | `Open` |
| D3 | Filename prefix on the assembled package | Ordinal only — `FEAT-0001-requirements.md`; no prefix on per-section files. Sharpened by D2 | File naming in Tier 2 | Low — rename script | `Open` |
| D8 | Scope of the working-feature echo | Every feature-scoped skill, once per invocation, before first write | Skill runtime behaviour (Tiers 2–3) | Low | `Open` |
| D9 | Require `active_feature` before a feature-scoped skill runs? | Halt-and-ask fallback, not required | Resolution order step 4 | Low | `Open` |

### 8.3 Sequencing the decisions

They do not all have to be taken at once, and holding the cheap ones up behind the expensive ones is the main way this stalls.

**Phase 0b is unblocked — start there.** D7 and D10 are both accepted, so the §2.6 prerequisite can be implemented and merged now. It has no dependency on the eight remaining decisions, and it is a strict correctness improvement on its own: it repairs a live writer/reader disagreement (§2.6.3) whether or not feature-scoped paths ever ship.

**Then D6 — now the only expensive decision left.** With D1, D5 and D2 accepted, the path shape and the segment format are both settled. D6 is different in kind from the rest: it decides the *shape of the delivery*, because dual-read is what makes the work splittable into independently revertible per-stage slices rather than one flag-day change. It is the last decision that can still change the sequencing in §4.

**D3, D8 and D9 last, or in flight.** All three are single-file or UX-level and reversible cheaply. None should block starting. (D4 was in this group and is now settled — §8.1.)

### 8.4 What would reopen the high-stakes decisions

Recorded so a future reader can tell whether a decision still holds on its original grounds, rather than re-deriving it. The first two are **decided** — these are the conditions under which they should be revisited, not live options.

- **D1** (decided) would warrant revisiting only if SoD directory mode were dropped, or if host repos gained the ability to span a feature-first root. As long as `[stages.*].dir` points at per-role repos, a feature-first root cannot span them (§2.2). A demand for one-folder-per-feature ergonomics is *not* sufficient grounds — that is the deferred `layout` switch, not a reversal of D1.
- **D5** (decided) would warrant revisiting only if `write_role` enforcement moved off the directory boundary. Today the boundary *is* the ownership model (`config/SCHEMAS.md:686-702`).
- **D2** (decided) would warrant revisiting only if creation-order sorting stopped being wanted, or if ordinal allocation proved unworkable under branch concurrency despite the merge-conflict backstop. Moving to a bare slug later means renaming every feature directory on disk — the highest reversal cost in the plan.
- **D6** (open) would flip to a hard cut if the framework had no external adopters with artifacts already on disk — the dual-read window exists to protect people mid-feature during the upgrade, and it is the single largest lever on how this ships.
