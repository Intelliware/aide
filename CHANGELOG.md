# A.I.D.E. (AI Integrated Delivery Enablement) — CHANGELOG

> Project-level release-stream change log.
> **Audience:** end users / downstream consumers of A.I.D.E. — not internal SDLC participants (those use per-package CHANGE-TRACKER.md).
> **Format:** Keep-a-Changelog over the canonical change-log block (`templates/blocks/shared/change-log.md`) wrapped by `templates/compositions/project-change-log.yaml`. **This file dogfoods F-007.**

| Field | Value |
|---|---|
| Artifact | A.I.D.E. — release stream |
| Artifact type | project-change-log |
| Current artifact version | `2.6.0` |
| Versioning convention | Semver (MAJOR.MINOR.PATCH) |
| Stage / Skill of record | (project-level — managed by `create-pr` step 6 going forward) |

## Versioning convention

A.I.D.E. uses semver:

- **MAJOR** — breaking changes to the skill catalogue, SKILL.md frontmatter shape, composition / block contracts, project.toml schema. Migration steps required.
- **MINOR** — new skills, new compositions, new schema fields, new validator checks. Backwards-compatible for existing projects.
- **PATCH** — bug fixes, doc updates, validator allowlists, non-breaking SKILL.md / step-file edits.

## Parts Affected — Reference (project-level vocabulary)

| Value | Meaning |
|---|---|
| `validator` | `scripts/validate.py` and `scripts/build-registry.py` |
| `skills` | Anything under `.agents/skills/` |
| `compositions` | Anything under `templates/compositions/` |
| `blocks` | Anything under `templates/blocks/` |
| `config` | `config/` (schemas + example files) |
| `references` | Top-level `references/` (cross-cutting framework references) |
| `branding` | Repo-wide naming, top-level identity files |
| `docs` | `_docs/` (framework-internal documentation) |
| `Multiple` | When more than two of the above apply |

## Change Types

Standard change-log block taxonomy. Project-level changelog maps these to Keep-a-Changelog categories at presentation time:

| Change Type | Keep-a-Changelog category |
|---|---|
| Initial Extraction | Added |
| Addition | Added |
| Source Update | Changed |
| Restructure | Changed |
| Correction | Fixed |
| Deprecation | Deprecated |
| Removal | Removed |

---

## Change Log

### `2.6.0` — 2026-08-11

Adds two new customization capabilities: Hook System and Preset Bundles.

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-11 | Addition | config | `config/SCHEMAS.md` | Hook system schema (§ 2.5.1) with `[[hooks]]` array-of-tables, validation rules 17-23, and preset schemas (§ 2.10 for preset.toml, § 2.11 for presets.toml) with validation rules 24-28. | branch `feature/hooks-and-presets` | ☐ Pending |
| 2 | 2026-08-11 | Addition | skills | `.agents/skills/meta/manage-presets/` | New skill for preset installation, enable/disable, discovery, and inspection. Four-step workflow: discover, install, enable-disable, show. Added to `anytime` in workflow-graph.yaml. | branch `feature/hooks-and-presets` | ☐ Pending |
| 3 | 2026-08-11 | Addition | config | `config/customizations/hooks.toml.example` | Comprehensive hook authoring examples demonstrating before/after hooks, priority ordering, optional prompts, conditions, and suppression. | branch `feature/hooks-and-presets` | ☐ Pending |
| 4 | 2026-08-11 | Addition | config | `config/presets.toml.example`, `config/preset.toml.example` | Example files for preset registry (presets.toml) and preset manifest (preset.toml). | branch `feature/hooks-and-presets` | ☐ Pending |
| 5 | 2026-08-11 | Addition | references | `references/orientation/hook-runtime.md` | Hook execution procedure for skills: lifecycle, condition evaluation, optional handling, announcements, error handling, and implementation checklist. | branch `feature/hooks-and-presets` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-11 | Source Update | skills | `.agents/skills/meta/customize-framework/steps/03-pick-operation.md` | Added `add-hook` and `suppress-hook` operations to the operation menu with hook-specific elicitation flow. | branch `feature/hooks-and-presets` | ☐ Pending |
| 2 | 2026-08-11 | Source Update | skills | `.agents/skills/meta/customize-framework/steps/04-author-override.md` | Added hook authoring templates for `add-hook` and `suppress-hook` operations. | branch `feature/hooks-and-presets` | ☐ Pending |
| 3 | 2026-08-11 | Source Update | skills | `.agents/skills/meta/customize-framework/steps/05-verify-merge.md` | Updated merge table to include preset layers and show preset origins in the layer column. | branch `feature/hooks-and-presets` | ☐ Pending |
| 4 | 2026-08-11 | Source Update | config | `config/customizations/README.md` | Added documentation for hooks and presets, updated precedence diagram to show presets between Layers 4 and 5. | branch `feature/hooks-and-presets` | ☐ Pending |
| 5 | 2026-08-11 | Source Update | skills | `.agents/skills/_registry/workflow-graph.yaml` | Added `manage-presets` to the `anytime` skills list. | branch `feature/hooks-and-presets` | ☐ Pending |
| 6 | 2026-08-25 | Correction | skills, config, references | `.agents/skills/meta/framework-navigator/SKILL.md`, `config/SCHEMAS.md`, `references/orientation/hook-runtime.md`, `.agents/skills/meta/manage-presets/{SKILL.md,references/EXAMPLE.md,steps/02-install.md}`, `AGENTS.md`, `config/customizations/README.md` | Renumbered the preset schema sections `§ 2.8`/`§ 2.9` → `§ 2.10`/`§ 2.11` and hook/preset validation rules `13-19`/`20-24` → `17-23`/`24-28` — both collided with `2.5.0`'s feature-registry sections and rules of the same numbers, which landed on `main` while this branch was in flight and are cross-referenced from `scripts/validate.py`/`.js` and several skill docs, so those kept their numbers and this branch's renumbered instead. | merge of `feature/hooks-and-presets` into `main` | ☐ Pending |

#### Branch Dependency

Minor release on top of `2.5.0` (was drafted on top of `2.2.0`; `2.3.0` through `2.5.0`
landed on `main` first and this entry's version and preset section/rule numbers were
renumbered accordingly at merge time — see Changed row 6). Additive — no migration
required. Both hooks and presets are fully opt-in. Projects without `[[hooks]]`
declarations or `presets.toml` see no change in behavior. The merge order is extended
to insert presets between Layer 4 (`project.user.toml`) and Layer 5
(`customizations/<skill>.toml`), but this only affects projects that register presets.

---

### `2.5.0` — 2026-08-25

Adds `generate-re-skill`, a skill that builds a complete reverse-engineering skill —
`SKILL.md`, references, compositions, and block templates — for a technology stack the
eleven built-in RE domain types don't cover (GraphQL servers, serverless functions, ML
pipelines, CLI tools, etc.). `analyze-repository` gains two new stages that route to it:
Stage 0 registers the repo in `project.toml` if it isn't already, and Stage 2b hands off
to `generate-re-skill` when no domain type matches with reasonable confidence. Two
unrelated fixes shipped in the same PR: a line-count fix that keeps
`analyze-repository/SKILL.md` under the 200-line self-documenting-skill cap after Stage
0/2b were added, and a `last_verified_against_commit` freshness field added to the
mainframe block templates.

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-25 | Addition | skills | `.agents/skills/reverse-engineering/generate-re-skill/` | New skill: six-stage workflow (analyze stack, research stack, define templates, generate skill, review flow, execute skill) that produces a complete `reverse-engineer-<type>` skill for a stack not covered by the eleven built-in domain types. | branch `feature/re-skill-generator` | ☐ Pending |
| 2 | 2026-08-25 | Addition | references | `references/elicitation-patterns/stack-discovery.md` | New elicitation pattern for gathering the stack characteristics `generate-re-skill` needs before drafting templates. | branch `feature/re-skill-generator` | ☐ Pending |
| 3 | 2026-08-25 | Addition | skills | `.agents/skills/reverse-engineering/analyze-repository/references/repo-registration.md`, `references/unsupported-stack-routing.md` | Procedural bodies for the new Stage 0 (`project.toml` registration check) and Stage 2b (unsupported-stack routing to `generate-re-skill`), kept in `references/` rather than inline so `SKILL.md` stays under the 200-line cap. | branch `feature/re-skill-generator` | ☐ Pending |
| 4 | 2026-08-25 | Addition | docs | `_docs/skills-test-results-2026-08-19.md` | Test-plan run log covering the new skill. | branch `feature/re-skill-generator` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-25 | Source Update | skills | `.agents/skills/reverse-engineering/analyze-repository/SKILL.md` | Added Stage 0 (repository registration check) and Stage 2b (unsupported-stack detection, routing to `generate-re-skill` below ~70% confidence) as short pointers into the new reference files. | branch `feature/re-skill-generator` | ☐ Pending |
| 2 | 2026-08-25 | Source Update | skills | `.agents/skills/reverse-engineering/README.md`, `.agents/skills/_registry/workflow-graph.yaml`, `.agents/skills/_registry/skills.csv`, `.agents/skills/_registry/skills.json` | Registered `generate-re-skill` in the `anytime` workflow list and the skill registry; README now documents it alongside the eleven domain skills. | branch `feature/re-skill-generator` | ☐ Pending |
| 3 | 2026-08-25 | Correction | skills | `reverse-engineer-{cobol-program,copybook-library,jcl-job}/SKILL.md` and their block templates under `templates/blocks/reverse-eng/` | Added a `last_verified_against_commit` freshness field — none of the mainframe block templates declared a source-commit field despite their content going stale as the source repo changes. Bundled into this PR per operator instruction; not caused by this branch's own work. | branch `feature/re-skill-generator` | ☐ Pending |
| 4 | 2026-08-25 | Correction | skills | `.agents/skills/reverse-engineering/analyze-repository/SKILL.md` | Fixed the file exceeding the 200-line self-documenting-skill cap (216 lines after Stage 0/2b were added inline) — the only `SKILL.md` in the registry over the limit. Moved both stages' procedural bodies to `references/`, back to 166 lines. | branch `feature/re-skill-generator` | ☐ Pending |

#### Branch Dependency

Minor release on top of `2.4.0` (new skill, new elicitation pattern — both
backwards-compatible). Additive: `analyze-repository`'s existing eleven-way dispatch is
unchanged for any repo that already matches a domain type — Stage 0 and Stage 2b are
only reached when a repo doesn't already resolve as before. Landed via PR 2047.

---

### `2.4.0` — 2026-08-16

Phases 1 (Foundation), 2 (Preconditions), 3b (Working tree), 3 (Path segments) and 4
(Guardrails) of `_docs/feature-id-minimal-plan.md`, shipped as one release. Phase 1 gives the
`{feature-id}` token — already load-bearing in every stage's output paths — a source
of truth: the opt-in feature registry (`features.toml`), the personal active-feature
pointer (`[user].active_feature`), and the `select-feature` skill that mints and
activates features. Phase 2 makes that source of truth binding: every feature-aware
skill now resolves the active feature and refuses to guess when it cannot, instead of
inventing an ID or a slug from the request. Phase 3b binds the working-tree directory
to the resolved ID, phase 3 puts that ID into the assembled paths themselves, and phase 4
adds the validator checks that stop either from silently regressing.

The phases ship together because none of them is much use alone. Phase 1 registers a
skill nothing routes to; phase 2 makes it reachable but moves no artifact; 3b and 3
are what actually stop one feature's work from landing in two places under two names;
and phase 4 is what stops the three retired spellings from creeping back one file at a
time. Shipping 1 and 2 by themselves would have released a registry that nothing consumed.

A project with no `features.toml` remains byte-for-byte unaffected, which is the
constraint the whole design is built around rather than a courtesy. Each
precondition's first line is the presence check and returns immediately; the
assembled path drops exactly one directory segment; and the filename keeps its
`{feature-id}-` prefix either way, so a glob matching on filename survives while one
assuming directory *depth* does not.

**New projects get it by default; existing projects never do.** A `fresh`
`start-project` run now writes a comment-only `features.toml`, so feature-scoped
paths are what a team newly adopting the framework gets without having to know the
option exists. Nothing about the signal changed — presence of the file means
feature-scoped, absence means behave as before — so this is a change to what
bootstrap produces, not to how anything resolves, and opting out is a deletion.
`rebaseline` and `extend-repos` are excluded: they imply artifacts already on flat
paths, and enabling feature scoping there moves the next write while leaving
everything already written behind.

**A feature ID is a plain kebab slug** — `alert-customer`, with no allocated ordinal ahead of it.
The plan specified an ordinal prefix, carried over from an earlier design, and it was
dropped before release once it became clear that **nothing consumed the number.** Every
reference to the ordinal was machinery for maintaining it: allocation, uniqueness
validation, and a rule for stripping the prefix back off to match pre-opt-in directories.
No skill, template or check read it. Its only consumer was `ls`, and the registry's
`created` field covers what the ordinal was really being read for — the date a feature
was minted, rather than its position in an allocation sequence. To be precise about the
trade rather than overstating it: `created` is day-granular and unvalidated, so it is
not the total order an ordinal was. Neither limit bites, because `features.toml` is
append-only and entry order is therefore a finer-grained sequence than any date, and
nothing sorts on the field today.

Dropping it also removed a hazard the format had manufactured. Allocating `max + 1`
invents a shared counter, so two people minting features simultaneously on separate
branches computed the same next ordinal — a collision that then needed catching. Slugs
have nothing to contend over; what remains is two people naming the *same* work
identically, which is a genuine duplicate that the committed registry surfaces as a merge
conflict and Check N2 rejects outright. The cost, recorded honestly in `SCHEMAS.md` § 2.8:
an ordinal-prefixed directory name was self-evidently a feature and `docs/refunds/` is
not, so features must be enumerated from the registry rather than by listing directories —
which is what everything already did.

The practical effect is that **opting in mid-flight adds a directory level and renames
nothing.** The folder name a project already infers from a request and the registry ID are
now the same kind of string, so `docs/refunds/` is already correct and
`alert-customer-requirements.md` keeps its name, moving from
`requirements/alert-customer-requirements.md` to
`requirements/alert-customer/alert-customer-requirements.md`. Under the ordinal, opt-in
changed the depth, the filename, *and* the working-tree directory name. The pre-opt-in
file is still left where it was — migrating an existing tree is deliberately not in this
release, see § 13.2 of the plan — but the move is now a pure move.

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-14 | Addition | config | `config/features.toml.example` | New annotated example for the committed, opt-in feature registry — one `[[features]]` entry per feature, `id` a lowercase kebab slug used verbatim as the directory name, optional `ticket` / `repos`. Presence of `features.toml` is the opt-in; absence means the project behaves exactly as before this change. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 2 | 2026-08-14 | Addition | config | `config/SCHEMAS.md` | New § 2.8 (the feature registry — schema, opt-in semantics, why the ID carries no ordinal, and duplicate-slug handling via git merge conflict) and § 2.9 (the active-feature pointer — Layer 4, resolution rule, echo requirement). `active_feature` added to the § 2.4 Layer 4 field table. New `features.toml.example` deliverables-table row. § 4 validation gains rules 13-16 (opt-in, fire only when `features.toml` exists): `id` format, `id` uniqueness, `active_feature` resolution, `repos` cross-reference. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 3 | 2026-08-14 | Addition | config | `config/project.user.toml.example` | New commented-out `[user].active_feature` example alongside the existing `[user].role` block, cross-referencing `config/SCHEMAS.md` § 2.8-2.9. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 4 | 2026-08-14 | Addition | skills | `.agents/skills/meta/select-feature/` (`SKILL.md` + `references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md`) | New skill: selects or mints the active feature. Select leads, create follows — presenting the existing registry first is the deliberate mitigation against the same work acquiring two feature identities. Registered in `workflow-graph.yaml`'s `anytime` list as the redirect target for every write-side / read-side skill's feature-ID precondition (row 5 onward). `python3 scripts/build-registry.py` re-run; 50 skills, 0 warnings. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 5 | 2026-08-14 | Addition | references | `references/ai-principles/feature-precondition.md` | New shared precondition contract (mirrors the `write-discipline.md` pattern) defining Mode A (write-side: select-and-create, halt-and-delegate to `select-feature`), Mode B (read-side: select-only, create suppressed), and Mode C (probe-only: `framework-navigator`, never halts). Single source so a future change to the resolution logic ripples through every consuming skill via one edit. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 6 | 2026-08-14 | Addition | skills | 11 write-side skills (`create-requirements-package`, `create-design-package`, `create-implementation-package`, `create-quality-package`, `execute-increments`, `execute-quality-increments`, `document-quick-change`, `plan-quick-change`, `execute-quick-change`, `manage-bugs`, `create-pr`) | Each gains a `## Precondition — active feature` section citing Mode A: halt and redirect to `select-feature` (passing its own name as `caller`) when `features.toml` exists but no active feature resolves; echo the feature ID and resolved output directory before the first write otherwise. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 7 | 2026-08-14 | Addition | skills | 5 read-side skills (`review-requirements-package`, `review-design-package`, `review-implementation-package`, `review-quality-package`, `audit-quality-coverage`) | Each gains a `## Precondition — active feature` section citing Mode B: identical resolution, but `select-feature` is invoked with `caller_mode: select-only` — reviewing/auditing is never a reason to mint a feature that has nothing to review yet. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 8 | 2026-08-14 | Addition | skills | `framework-navigator` (`SKILL.md`, `references/state-probe.md`, `steps/03-match-or-render.md`, `steps/04-recommend.md`) | State probe gains `features_toml_present` / `active_feature` fields (opt-in, no-op when `features.toml` is absent). The recommendation gate filter now surfaces `select-feature` as a prerequisite — using the same mechanism as an unmet `workflow-graph.yaml` gate, no score penalty — when the probe shows no active feature ahead of a feature-aware recommendation. The navigator never halts on this itself: per its own "Side effects: none" contract, it recommends, it does not block. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 9 | 2026-08-16 | Addition | skills | `start-project` (`SKILL.md`, `steps/06-handoff.md`) | Bootstrap now states once, at handoff, that feature-scoped paths exist and that `select-feature` enables them at any point. Closes a discoverability hole rather than changing a default: `start-project` never mentioned `features.toml`, and a feature-aware skill cannot route a user to `select-feature` on a project without a registry because the precondition returns before it could — so the only way in was to already know to ask. Deliberately a statement, not a question: it writes no `features.toml`, does not wait for a reply, and is not re-raised. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 10 | 2026-08-16 | Addition | references | `references/ai-principles/feature-precondition.md` | New *Worked example — one feature, both ways* section showing a single feature's full tree opted in and not, placed where the working-tree and assembled-path rules meet so the two can be read together. This is the only end-to-end illustration of the opted-in tree: every skill's own `references/EXAMPLE.md` depicts the not-opted-in shape, correctly, because that is what a project gets until someone runs `select-feature`. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 11 | 2026-08-16 | Addition | scripts | `scripts/validate.py`, `scripts/test_validate.py` | Phase 4 — Check **N1** (framework, default run): every feature-scoped composition's `default-output-path` carries `{feature-id}` as a complete path segment, and no retired placeholder names a per-feature directory in an A.I.D.E. artifact path. Feature-scoping is *derived* from the four per-feature `[project.paths]` keys rather than listed, so a stage composition added later is covered the day it lands. Check **N2** (project, `--features-toml PATH`): `id` format, uniqueness, `active_feature` resolution, `repos` cross-referencing — following the `--project-toml` seam Check I established, because this script is anchored to the framework repo and cannot see a project's registry. Sub-rules needing a companion file warn that they were skipped rather than passing silently. Hard errors, not warnings: both land green in the same change that fixes every violation they report. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 12 | 2026-08-16 | Addition | scripts | `scripts/validate.js`, `scripts/test-validate.js` | N1 and N2 ported to the Node validator with matching messages and exit behaviour. § 8 of the plan had required every validator change to land twice; phase 4 initially shipped Python-only, which left half the entry points without the guardrail, since `validate.js` is a live twin carrying checks A through M. Both suites now run green — 47 Python cases and 52 Node, the gap being the six malformed-slug inputs that Python groups under one `subTest` and Node registers individually — and the two cases Python lacked (duplicate ID; the skipped-sub-rule warnings) were added so the twins match on behaviour rather than on check names. | branch `feat/feature-id-minimal-plan` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-15 | Restructure | skills, templates | 51 files across `requirements`, `design`, `quality`, `quick-dev`, plus `workflow-graph.yaml`, `capture-solution-context`, `review-adversarial/references/OVERVIEW.md`, `templates/blocks/quality/test-case-increment.md` | Phase 3b — bound the per-section working-tree directory to the registry ID: every `docs/<feature>/` became `docs/<feature-id>/`, and the third spelling `<feature-folder>` (a defect inherited from the superseded plan) was retired. Three spellings for one concept were what allowed a single feature's work to be described in three mutually-consistent-looking ways. Non-mechanical part: `requirements-writing-workflow.md`, `solution-discovery-workflow.md` and `document-quick-change/SKILL.md` no longer infer a folder name from the user's description and negotiate it — on an opted-in project the registry answers that question, and the inference survives only as the not-opted-in fallback. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 2 | 2026-08-15 | Addition | references | `references/ai-principles/feature-precondition.md` | New *Resolving the working-tree directory* section, including the reconciliation rule for a project that opts in mid-flight. When `docs/<slug>/` exists but `docs/<feature-id>/` does not, the skill **halts** and offers either a `git mv` rename or keeping the existing directory — creating the ID-named directory alongside would split one feature across two trees, which is the precise failure this change exists to prevent, reintroduced by the fix for it. Option (b) is stable across sessions because the slug is derivable from the ID, so the rule re-finds the directory on every run without a new registry field. Honours `config/SCHEMAS.md` § 2.8's promise that artifacts already on disk stay where they are. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 3 | 2026-08-15 | Restructure | templates | 7 compositions (`greenfield-requirements-package`, `brownfield-enhancement-spec`, `greenfield-design-package`, `greenfield-quality-package`, `brownfield-quality-package`, `quick-dev-spec`, `greenfield-implementation-package`) | Phase 3 — each feature-scoped `default-output-path` now carries the `{feature-id}/` segment, written in the opted-in form with a comment pointing at the conditional rule. One string plus a comment rather than two keys: two path strings per composition would need to stay in sync forever, and a self-erasing token would put conditional logic in a format that has no way to express it. The new *Resolving the assembled artifact path* section in `feature-precondition.md` holds the rule — segment present when `features.toml` exists, dropped when absent, filename prefix unchanged either way. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 4 | 2026-08-15 | Restructure | skills | ~33 occurrences across `requirements`, `design`, `quality`, `quick-dev` | Phase 3 skill path strings for the four stages whose package is a single assembled artifact, e.g. `{paths.requirements_package}/{feature-id}-requirements.md` → `{paths.requirements_package}/{feature-id}/{feature-id}-requirements.md`. Uniform and mechanical; the redundant-looking filename prefix is deliberate per § 2.1 of the plan. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 5 | 2026-08-16 | Restructure | skills, config | 23 files across `planning`, `execution`, `quality`, plus `config/customizations/review-implementation-package.toml.example` and `greenfield-implementation-package.yaml` | Phase 3 for the implementation stage, which differs from the other four: the package is a *directory* of per-feature files, so the segment goes on the directory reference rather than beside a filename. Increments, `increment-status.md`, `bugs-and-issues-log.md`, `change-tracker.md`, `implementation-package.md` and the `plan/` and `review/` subdirectories all now sit under `{project.paths.implementation_package}/{feature-id}/`. Each moved because it tracks state for one feature's increments — the same test that keeps this project-level CHANGELOG where it is, since that one is project-scoped, carries no `{feature-id}` in its path, and is written at PR time rather than during authoring. Largely propagates a shape the stage had already committed to: `execute-increments/steps/00-scope-target-repo.md` already documented legacy mode as `{project.paths.implementation_package}/<feature-id>/` alongside both SoD modes while the rest of the stage still described a flat layout. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 6 | 2026-08-16 | Correction | config, skills | `config/customizations/review-implementation-package.toml.example`, `templates/compositions/greenfield-implementation-package.yaml` | Converged the customization example's `{feature-id}-review/` directory on `{feature-id}/review/`, matching the bare `review/` that `review-implementation-package` already used — § 2.1's keep-the-prefix rule governs filenames, not directories, so there was no reason for the two to disagree. The composition's header comment now says a feature's increments live together under the segment; "the set of all increments for a project" stopped being a useful description once the stage root holds one directory per feature. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 7 | 2026-08-16 | Restructure | skills, config | `start-project` (`SKILL.md`, `steps/05-write-project-toml.md`, `steps/06-handoff.md`), `config/SCHEMAS.md` § 2.8 | **Feature-scoped paths are now the default for new projects.** A `fresh` bootstrap writes a comment-only `features.toml`; `rebaseline` and `extend-repos` deliberately do not, because they imply artifacts already on flat paths that enabling feature scoping would orphan. Reverses this branch's earlier decision to leave creation entirely manual — feature IDs are the intended way forward for new adoption, and a one-time note at handoff, fired when the user has no features and no artifacts, is the weakest possible way to offer that. Safe because the *signal* did not change: presence of the file still means feature-scoped, absence still means behave exactly as before, so opting out is `rm features.toml` with no migration. Needed no schema or validator change — § 2.8 already declared an empty-but-present registry legal and Check N2 already treated it as a warning. The registry is handed over **empty**: `start-project` mints no feature and sets no `active_feature`, so creating the registry and naming a feature stay separate decisions and only the first belongs to bootstrap. Brownfield is what settles that — `analyze-repository`, the `reverse-engineer-*` skills and `build-knowledge-base` carry no active-feature precondition, because RE docs and KB components are keyed by repo-slug and domain rather than by feature, so that flow does substantial work before any feature exists to name. Minting at bootstrap would force a name for work that is not feature work and leave that ID active when the first real feature arrived, producing exactly the duplicate identity `select-feature` prevents. Each skill's own precondition asks at the right moment instead: immediately for greenfield and quick-dev, several skills later for brownfield. | branch `feat/feature-id-minimal-plan` | ☐ Pending |

#### Fixed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-16 | Correction | skills | `plan-quick-change` (`SKILL.md`, `references/INPUTS-OUTPUTS.md`), `execute-quick-change/references/INPUTS-OUTPUTS.md` | The quick-dev spec handoff was broken and had been since before this work: `document-quick-change` writes the spec to `{paths.requirements_package}/<feature-id>/`, but both downstream skills loaded it from `docs/<feature-id>/quick-dev-package/`. It survived only because the agent carried the spec in conversation across the three skills and so never had to resolve the path it had been given. `quick-dev-spec.yaml`'s `default-output-path` settles which side was wrong — the spec is a deliverable, so the readers were fixed. Resulting split: the spec assembled, and the plan, change tracker, orientation notes and review findings in the working tree. Recorded as a known defect at line 69 of the superseded plan; retiring `<feature-folder>` did not cause it but did remove the last ambiguity that let it pass unnoticed, since both sides now name the same directory in the same spelling and simply disagree about the parent. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 2 | 2026-08-16 | Correction | config | `config/features.toml.example` | `repos = ["billing-api"]` did not match any `[[project.repos]].code` in `project.toml.example`, which declares `api-billing`. Found by Check N2 on its first run against the committed examples — the cross-reference rule existed in `SCHEMAS.md` § 4 from phase 1, but nothing enforced it, so the two examples had been shipped inconsistent. Exactly the class of drift N2 exists to catch, caught on the pair it ships with. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 3 | 2026-08-16 | Correction | skills | `start-project` (`SKILL.md`, `steps/06-handoff.md`) | The opt-in note introduced a *fourth* spelling, `docs/<feature-name>/`, in the same change that retired the other two — written before Check N1 existed to reject it. Replaced with a plain-language description of the default, since the note's whole purpose is to describe the state of a project that has not opted in and therefore has no ID to show. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 4 | 2026-08-16 | Correction | scripts | `scripts/validate.js`, `scripts/test-validate.js` | The Node validator's hand-rolled `parseSimpleToml` mis-parsed multi-line basic strings: `description = """` matched the quoted-string branch, collapsed to a single quote character, and then threw on the prose beneath it. `validate.js --project-toml config/project.toml.example` had therefore been failing where `validate.py` passed the same file, so Check I was effectively Python-only. Two neighbouring gaps shared the cause — inline arrays stayed raw strings and trailing `# comments` were swallowed into values. Adds multi-line strings, inline and multi-line arrays, and quote-aware comment stripping, and narrows section-header detection to lines that actually start with `[` (the old test also matched any line *ending* in `]`, which an inline array does). Pre-existing and unrelated to feature IDs; surfaced because N2 was the first check to read an array out of a project file. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 5 | 2026-08-16 | Correction | references | `references/ai-principles/feature-precondition.md` | The file contradicted itself, in a contract 16 skills read. Its phase note and its closing "not this precondition's job" bullet both still said the assembled artifact path was unaffected and that "no composition's `default-output-path` carries a `<feature-id>/` segment yet" — while the middle of the same file specified how to resolve exactly that segment. Written during phase 3b and not revisited when phase 3 shipped. The note now frames the two paths (working tree, assembled) as the two rules the file actually contains, and the closing bullet points at Check N1 as the thing that enforces the segment. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 6 | 2026-08-16 | Correction | skills | `.agents/skills/meta/select-feature/SKILL.md` | Minting a feature could silently split one feature across two directory trees — the precise failure feature IDs exist to prevent, reachable through the most likely path. Create mode derived the `id` purely from the freshly typed title, so a project holding `docs/refunds/` plus a title of "Refund processing fixes" yielded `refund-processing-fixes`, which matches no existing directory; the next skill then took its "directory does not exist" branch and created a second tree beside the first without asking. Create mode now inspects `docs/` for directories matching no registered feature and offers a matching one's name as the `id`, with the reason stated, before a title-derived slug wins by default. Because the `id` *is* the directory name, accepting that proposal means there is nothing to migrate at all — which is why this proposal is load-bearing rather than a convenience, and why it is the primary defence with reconciliation as the backstop. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 7 | 2026-08-16 | Correction | config | `config/SCHEMAS.md` § 2.8 | The registry's shape example declared `repos = ["billing-api"]`, which matches no `[[project.repos]].code` in `project.toml.example` — the same inconsistency fixed in `features.toml.example`, one file over. Check N2 did not catch this one because it validates registry files, not the schema document that documents them. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 8 | 2026-08-18 | Correction | validator | `scripts/validate.py`, `scripts/validate.js` | Check N1b flagged retired feature placeholders inside fenced code blocks, where Check M — written in the same change, over the same trees — has always exempted them. The asymmetry made the outstanding migration documentation unwritable: showing `docs/<feature>/` beside `docs/<feature-id>/` is the point of that guidance, and N1 has no suppression pragma, so an author could only comply by deleting the illustration or mangling it past the regex. N1b now applies `_in_code_fence` / `inCodeFence` at the hit, exactly as M does; the exemption is positional, so prose below a closed fence still errors. Two tests added to each of `scripts/test_validate.py` (49 total) / `scripts/test-validate.js` (53 total). Also documents why the fixture-mode dispatch order is `--features-toml` → `--framework-toml` → `--project-toml` rather than by check letter: the modes are mutually exclusive early returns, and N2 takes a `project.toml` as a companion for rule 16, so testing `--project-toml` first would capture the paired invocation as Check I and N2 would never run. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 9 | 2026-08-18 | Correction | validator | `scripts/validate.js` | The file-header check manifest had drifted from `validate.py`'s: Check M was listed after N1 and N2 in both the manifest and the hard-error list, and Check J was missing altogether. The two headers are the first thing a reader consults for what the script does, so a Node reader learned a different check set than a Python one. Both lists now read `… I, J, M, N1, N2`, matching `validate.py`. Comments only — no behaviour change. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 10 | 2026-08-18 | Addition | scripts | `scripts/test-validate.js` | Brought the Node suite to coverage parity with the Python one. Four behaviours were asserted only in `test_validate.py`: rule 6a rejecting a `[project.testing].qe_repo` that names no declared repo, rule 6a accepting one that names a declared `test-automation` repo, rule 6b accepting every enum value plus an absent key, and a default run reporting Check L. `validate.js` already implemented all four — only the tests were missing, so the Node validator could have regressed on rule 6a with a green suite. Also collapsed the N2 malformed-id loop from six generated `test()` calls into one test looping internally, mirroring `test_validate.py`'s `subTest` so the two totals are directly comparable; the rejected value is named in each assertion message, so a failure still identifies the shape. Per-group counts now match exactly, and the residual 49-vs-53 gap is entirely the four `parseSimpleToml` tests, which have no Python counterpart because `validate.py` uses `tomllib`. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 11 | 2026-08-18 | Correction | skills, references | `.agents/skills/quality/review-test-failures/SKILL.md`, `references/ai-principles/feature-precondition.md` | `review-test-failures` resolved two feature-scoped paths with nothing to resolve the token: it reads the `automation-and-cicd` block under `docs/<feature-id>/quality-package/quality/` and appends its `Failure triage` row to `change-tracker.md` in the same tree, while carrying no active-feature precondition and going unnamed in `feature-precondition.md`. Raised in review of !2051. Classified **Mode B**, not Mode A: the skill already declares itself read-only apart from that single tracker row, and a run with failures to triage necessarily has a quality package already — so minting a feature here is never right and create must stay suppressed. Mode B's scope note now reads "a verdict file or a tracker row" rather than verdict files alone, putting the tracker row inside the stated contract rather than leaving it an unremarked exception. The three other skills naming `<feature-id>` without citing the precondition were audited and are not defects: `capture-solution-context` contrasts layers in prose, `detect-knowledge-base-drift` illustrates an `--feature-id=` flag, and `start-project` creates the registry and so cannot require an active feature — which leaves this the only real instance. Note that nothing enforces this binding, unlike write-discipline's `## Preconditions` check for `create-*` skills; a mirrored check is still outstanding, and is why the gap survived to review. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 12 | 2026-08-18 | Correction | skills, references | `create-pr`, `execute-increments`, `execute-quality-increments`, `plan-quick-change` (`SKILL.md`), `references/ai-principles/feature-precondition.md` | Four skills were Mode A — create reachable — for work that cannot exist without an upstream artifact, so a stale `active_feature` could mint a second, empty feature and attach real work to it. Their own halt messages already gave the game away: "which feature **the diff belongs to**", "which feature's **increments to run**", "which feature's **TC-XXX increments to run**", "which feature's **spec to load**" — every one presupposes the artifact exists, which is the definition of select-only. Moved to Mode B. Mode A's scope note now states the axis outright: the split turns on whether *minting* is legitimate, not on whether the skill writes, and the halt message is the tell ("guessing which feature's X" → B; "inventing a feature ID" → A). Mode B's note was corrected in the same pass, because its old "only read/audit existing artifacts" framing was falsified by its own new membership — `execute-increments` writes production code and is still Mode B, since increments to run cannot exist without a package that named them. `create-quality-package` was raised in review too but stays Mode A: it says "inventing a feature ID from the request", like the other `create-*` skills. `execute-quick-change` and `manage-bugs` are Mode B candidates by the same rule and are deliberately left in Mode A pending a decision, recorded in the scope note rather than left silent. Mode A 11 → 7, Mode B 6 → 10; governed (17) and citing (19) unchanged. Raised in review of !2051 by Mike Moerman. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 13 | 2026-08-18 | Correction | docs, config, references, scripts | `config/SCHEMAS.md`, `references/ai-principles/feature-precondition.md`, `.agents/skills/meta/select-feature/references/OVERVIEW.md`, `CHANGELOG.md`, `scripts/test-validate.js`, `scripts/test_validate.py` | Stopped naming the retired ordinal-prefixed ID form. Eleven references across six files spelled out a literal `FEAT-`-prefixed convention that was reversed before anything shipped, so every mention described a naming scheme no reader has ever encountered while implying it was once live. The *reasoning* is unchanged and still recorded in full — no ordinal, because nothing consumed the number and allocating `max + 1` manufactured a contended resource — but it now reads as "the ordinal-prefixed form originally specified" rather than citing a string. Purely editorial: no validator logic ever matched the prefix (Check N1's retired-spelling list is `<feature>` / `<feature-folder>` / `<feature-name>`, and Check N2's rule is a plain slug regex), so no behaviour changes and both suites pass unaltered. The design records under `_docs/` keep the literal form deliberately — naming what was superseded is the purpose of a superseded plan — as do the pre-existing `FEAT-` usages in `_docs/adversarial-review-design.md`, which predate this work. Raised in review of !2051 by Mike Moerman, who correctly read it as a transient decision. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 14 | 2026-08-18 | Fix | scripts | `scripts/build-registry.js` | The Node registry builder over-counted every `SKILL.md` by one line: `text.split('\n').length` treats the trailing newline as starting a further empty line, where `build-registry.py`'s `len(text.splitlines())` treats it as terminating the last one. Harmless until a file landed exactly on the boundary, which entry 12's Mode B insertion did — taking `execute-quality-increments/SKILL.md` to 200 lines, at which point Node warned `has 201 lines (>200)` and Python stayed silent. A cross-validator divergence is a defect on its own terms, since the two are contracted to be functionally identical, and this one was latent on the 200-line threshold for any file at the limit. Node now strips one trailing newline before splitting; both builders emit an identical `skills.csv` and both validators report 3 warnings. Found while re-running the suites for entry 13, not raised in review. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 15 | 2026-08-19 | Correction | skills | `.agents/skills/design/create-design-package/references/solution-discovery-workflow.md`, `.agents/skills/design/create-design-package/steps/01-discovery.md` | Renumbered discovery's feature-folder sub-step `0a` → `0`. The letter suffix implied a sibling that does not exist: design's discovery has exactly one sub-step 0, sitting beside plain `1`, `2`, `3`, so the `a` disambiguated nothing and only invited the question of where `0b` went. Nothing desyncs, because `steps/01-discovery.md`'s table cites `§` names in the workflow reference rather than ordinals. Deliberately **not** applied to `create-requirements-package`, which carries a genuine `0a` / `0b` pair (feature-folder + tracker init, then the analysis-skipped gather) where the suffixes are load-bearing — renaming half of it would leave `0` next to `0b`. Raised in review of !2051 by Mike Moerman. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 16 | 2026-08-20 | Fix | references | `references/ai-principles/feature-precondition.md` | Mode A step 3 now requires the pointer to resolve to **exactly one** well-formed entry, replacing a presence test. Presence was satisfied by either of two entries sharing an `id`, so the pointer resolved, the precondition passed, and a duplicate registry ran silently — observed in both modes during the targeted test run. The delegation one section below ("the uniqueness check … lives in `select-feature`") could not cover it, because `select-feature` is invoked only when the pointer *fails* to resolve, and a duplicate is a state where it succeeds; that clause is now marked **mint-time only**, with the two checks distinguished by the question they answer ("may this new id join the registry" vs. "does the active pointer name exactly one entry"). Step 3's three outcomes are now separated with a message each, which also splits the stale-pointer case out of the "No active feature" string it previously shared — false on its face when `active_feature` is set, and contradicting the config file the user opens next. The ambiguous case deliberately does **not** invoke `select-feature`: a duplicate is fixed by editing `features.toml`, and minting a third feature would not resolve the collision between the first two. Mode B's "one difference at step 3" note is scoped to the two cases that invoke anything. No new I/O — counting matches is the same read of `features.toml` the step already performs — and scope is the *resolved* entry only, so a malformed or duplicated `id` elsewhere stays with Check N2 rather than blocking unrelated work; registry-wide validity and the `repos` cross-reference (which needs a second file) are unchanged. Both validators green, 49 Python / Node suites unaltered. Found by `_docs/feature-id-targeted-test-plan.md` steps F.17-F.18, finding F-11. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 17 | 2026-08-20 | Fix | references, skills, docs | `references/ai-principles/feature-precondition.md`, `.agents/skills/quick-dev/execute-quick-change/SKILL.md`, `.agents/skills/execution/manage-bugs/SKILL.md`, `_docs/feature-id-targeted-test-plan.md` | Resolved the open mode decision entry 12 left recorded in the scope note: `execute-quick-change` and `manage-bugs` move Mode A → Mode B. Both were listed Mode A while the prose directly beneath applied the file's own A/B rule and called both Mode B candidates, so an agent invoking either had no determinate answer on whether it could mint — in the one file whose purpose is that a change to the resolution logic ripples through every consuming skill via a single edit. Both halt messages are the tell the rule names: "which feature's *plan* to execute" and "which feature's *log* to operate on". For `execute-quick-change` the chain was also inverted — its upstream producer `plan-quick-change` was already Mode B, so the consumer could mint a feature the producer could not. For `manage-bugs` the "may be the first thing run on a project" concern does not survive its own required-inputs table: the implementation-package directory is a required input and `bugs-and-issues-log.md` is written inside it, so a feature must already have reached planning; "independently invocable" means independent of an increment *session*, not of the package, and creating the log when missing is a file inside a directory that must exist, not a mint. Both skills now cite Mode B and pass `caller_mode: select-only`, each with the suppression rationale inline. Mode A 7 → 5, Mode B 10 → 12; governed (17) and citing (19) unchanged, and Mode A is now exactly the four `create-*` skills plus `document-quick-change` — every member a genuine first-artifact producer. Test plan F.1's pinned sets and header table repinned to 5/12. Both validators green, suites unaltered. Found by `_docs/feature-id-targeted-test-plan.md` step F.1, finding F-16. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 18 | 2026-08-20 | Fix | skills | `.agents/skills/meta/select-feature/SKILL.md`, `.agents/skills/meta/select-feature/references/EXAMPLE.md` | `select-feature` is the single place that implements `caller_mode = select-only`, and it never mentioned it — the string appeared in the contract, in `references/INPUTS-OUTPUTS.md` and in all twelve Mode B callers, but not once in the workflow that has to honour it. Worse than silence, the workflow instructed the opposite: step 3 offered "create a new feature" as a "permanently visible option" unconditionally, and step 2's two skip cases routed *to* create, so an agent reading `SKILL.md` — the document progressive disclosure encourages, since `references/` load on demand — would offer create on a `review-*` call and let a reviewer mint a feature with nothing to review. That is precisely the defect Mode B exists to close, reachable by reading the more authoritative of the two documents. The Overview now states that `caller_mode` decides whether create is reachable and names the twelve dependants; step 2's empty-registry branch halts under `select-only` naming the producing `create-*` skill; step 2's no-match branch falls through to the full list instead of create, because a Mode B caller's `description` is usually an *action* ("review the requirements package") that resembles no feature title — so that branch was the common path for a review, not an edge case; step 3 omits the create option entirely rather than disabling it, with a scripted refusal if the user asks; step 4 is marked unreachable. `Common mistakes` gains the case, and `references/EXAMPLE.md` gains Scenario 3, the first `select-only` walkthrough — its absence (both prior scenarios exercise select-and-create) is plausibly why this went unnoticed while Mode B grew to be the larger set. Step 1 needs no guard: Mode B step 1 returns before invoking anything when `features.toml` is absent, so `select-only` never reaches it. Both validators green, 3 pre-existing warnings unchanged, suites unaltered. Note `SKILL.md` is now 199 lines against the builders' 200-line warning threshold — see entry 14 for the off-by-one that boundary previously exposed. Found by `_docs/feature-id-targeted-test-plan.md` steps F.11/F.12, finding F-9. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 19 | 2026-08-20 | Correction | skills | `.agents/skills/meta/select-feature/references/INPUTS-OUTPUTS.md` | The `caller_mode` row defined `select-only` membership with a framing entry 12 had already retired, and named the roster wrong three ways. It called the callers "read-side skills", which its own membership falsifies — `execute-increments` writes production code and `create-pr` writes commits — and entry 12 corrected precisely that wording in Mode B's scope note one file over, while this row kept it. It named `framework-navigator`, which is **Mode C**: the navigator never invokes `select-feature` as a precondition redirect (it *recommends* it, and declares "side effects: none"), so it cannot pass `caller_mode` at all, making this the one place in the tree miscategorising it. And its `review-*` + `audit-quality-coverage` list covered 6 of the 12 actual callers, omitting `plan-quick-change`, `execute-increments`, `execute-quality-increments`, `create-pr` from entry 12, and `execute-quick-change`, `manage-bugs` from entry 17 — neither entry revisited this row. The row now points at `feature-precondition.md`'s Mode B roster as the single source of truth rather than re-enumerating it, since the enumeration is what drifted, and restates that how much a skill writes does not determine its mode. The *implementation* was never wrong: all twelve `select-only` call sites match the contract's roster exactly with no strays, so only the description of them had drifted — which is why no validator check caught it, there being no cross-reference between a prose roster and its call sites. Both validators green and byte-identical apart from each naming itself, including flag-gated Check N2; 3 pre-existing warnings unchanged. Follow-up to entries 17 and 18, surfaced while re-verifying entry 18's edits after a `ripgrep` invocation without `--hidden` had been silently skipping the entire `.agents/` tree. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 20 | 2026-08-20 | Fix | config, skills | `config/SCHEMAS.md` § 5.1, `review-requirements-package`, `review-design-package`, `review-quality-package` (`SKILL.md`), `create-requirements-package`, `create-design-package`, `create-quality-package` (`steps/00-scope-target-repo.md`) | 22 path strings placed the assembled artifact directly under `<repo-code>/`, `_cross-cutting/` or a `{paths.*}` key with no `<feature-id>/` directory between, so on any opted-in project the create skills wrote to `…/<id>/<id>-requirements.md` while the review gates looked in `…/<id>-requirements.md` — a broken stage handoff on the configuration a new project gets by default. Root cause is § 5.1 itself: the canonical directory-mode geometry diagram omitted the feature directory while § 5.2's colocate geometry immediately below it had it, and the defect tracks exactly which section each stage inherits from — requirements, design and quality are the dir-mode stages § 5.1 names and all three were wrong in all three of their modes, while planning and execution are the colocate stages § 5.2 names and `execute-increments` has all three right. One un-migrated schema section mirrored six times, not six oversights, which is why the wrong form looked so consistent. Both geometries now nest the feature directory *inside* the repo-code boundary, with the reason stated at the diagram: `<repo-code>/` is what `[stages.<stage>].write_role` checks against, and a role check must keep corresponding to a subtree. Three collateral corrections: each create skill's Output table already carried the correct SoD form while its own `steps/00` did not, so every affected skill contradicted itself internally; the contract's claim that colocate mode "has always nested under `<feature-id>/`" was false of all three colocate paths and is now true; and "Legacy mode" named the non-SoD layout but read as *not opted in*, which is what let the pre-opt-in path sit in the branch that fires for opted-in projects, so each Step 0 now states that the segment is conditional on `features.toml` rather than on the stage mode. Scope is larger than finding F-12 recorded (5 strings across 3 files) and the undercount was structural: it counted the "Legacy mode" bullet in two review gates, but each Step 0 carries four path strings and the contract puts the segment in all four; quality was missed entirely; and `review-quality-package` was named the control case when only its legacy line was right. Found by `_docs/feature-id-targeted-test-plan.md` steps F.16-F.18, finding F-12. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 21 | 2026-08-20 | Addition | validator | `scripts/validate.py`, `scripts/validate.js`, `scripts/test_validate.py`, `scripts/test-validate.js` | Added **Check N1c**, closing the blind spot that let entry 20 ship: N1a asserted the `{feature-id}/` segment for composition `default-output-path` values only, while N1b walked every skill and template markdown file checking *only* for retired spellings. A path in skill markdown that was rooted at a per-feature key, spelled `{feature-id}` correctly and omitted the directory segment was therefore checked by nothing — and F.3 is the controlled proof, having injected into a composition the character-identical string that shipped green in `review-design-package/SKILL.md`. Same defect, same spelling, same consequence, caught in one file type and invisible in the other. N1c asserts that any per-feature artifact *path* in skill or template markdown encloses the artifact in a `{feature-id}/` directory. Deliberately **not** the narrower rule the finding proposed (extending N1a's "rooted at a `FEATURE_SCOPED_PATH_KEYS` token" test to markdown): the SoD paths begin at `<repo-code>/` or `_cross-cutting/` and are rooted at no token at all, so that form would have caught 2 of the 20 real instances. Keying on the *filename* prefix and then requiring a parent path is also what excludes the legitimate non-path uses — report templates displaying `<feature-id>-quality.md`, prose about the prefix itself, and `filename_pattern` values — and the assertion is containment rather than adjacency, because the working tree nests a package subdirectory under the feature directory (`docs/<feature-id>/quick-dev-package/<feature-id>-quick-dev-plan.md`); an adjacency rule rejected three correct quick-dev paths when first prototyped. Fenced blocks are exempt, as in N1b and M. Verified non-vacuous against the pre-entry-20 tree: both validators reported exactly the same 20 strings with byte-identical messages, and both report none after. 5 tests added to each suite (Python 49 → 54, Node 53 → 58, residual gap still exactly the four `parseSimpleToml` tests per entry 10). Also corrects `check_n1`'s own docstring, which claimed N1 "asserts every feature-scoped path carries a feature segment. Together they close both halves of the routing contract" — true only of composition output paths, so a maintainer reading it would reasonably believe entry 20's defect class was impossible. It now names which sub-check covers which file type and states the remaining gap outright: a path assembled across several prose sentences, or drawn as an ASCII directory tree, matches no path-shaped regex and is checked by neither, which is precisely why § 5.1's diagram had to be fixed by hand. Note F-12 attributed that sentence to `check_m`; it was in `check_n1`. | branch `feat/feature-id-minimal-plan` | ☐ Pending |
| 22 | 2026-08-20 | Fix | skills, config, docs | `.agents/skills/meta/select-feature/SKILL.md`, `references/OVERVIEW.md`, `references/EXAMPLE.md`, `config/SCHEMAS.md` § 2.8, `_docs/feature-id-targeted-test-plan.md` | Replaced two contradictory `docs/`-collision rules in `select-feature` step 4 with **one unconditional question**. The rules read the same `docs/` listing and reached opposite conclusions, and which fired depended on whether the user had volunteered something the skill never asks for: the *warning* was gated on "a `docs/` directory the user has just said is **not** this feature" — a question no step anywhere posed — while the *proposal* recommended the matching directory and used the warning's own subject matter as the selling point. On a project with hand-written `docs/architecture/` and the title "Architecture refresh", the proposal won by default, the user accepted a sensible-looking recommendation, and the resolution rule adopted their notes as the feature's working tree without asking. Since § 2.8 makes this a convention rather than a validated rule — both validators accept a registry whose sole `id` is `architecture` — the mint-time check is the *only* defence, so one reachable only by user initiative was functionally absent. Step 4 now asks, every time a proposed `id` matches a `docs/` directory no registered feature owns and regardless of how the slug was derived: "`architecture` matches `docs/architecture/`, which no registered feature owns. Is that directory this feature's work, or something else?" That single question separates the two cases the two rules were racing to classify, and it cannot be inferred: a match is equally consistent with the directory being this work (the desired outcome, nothing to move) or unrelated (a silent merge), and nothing on disk distinguishes them. Each branch now carries a **drafted blockquote**, which the warning never had — its old lines were rationale addressed to the implementer, so even when it did fire its wording was left to the agent and the load-bearing clause, that adoption happens *without asking*, could be dropped without violating any doc. A third branch closes the inverse gap, which was completely silent and is the one that actually produces the failure the mechanism exists to prevent: *declining* a proposed match is what creates two trees for one feature, so warning coverage had been inverted relative to risk. Rationale moved to `references/OVERVIEW.md` to hold `SKILL.md` at 199 lines against the builders' 200-line cap (see entry 14), keeping the operational rule and all four blockquotes in `SKILL.md` itself — entry 18's lesson being that behaviour documented only in `references/` is behaviour an agent reading `SKILL.md` will contradict. `EXAMPLE.md` gains Scenario 4, the first collision walkthrough, and the test plan's F.19 criteria are repinned from "warns" to the question plus both answers and the override path, since a re-run would otherwise test the retired behaviour. Found by `_docs/feature-id-targeted-test-plan.md` step F.19, adjudicated FAIL by the operator on 2026-08-19, finding F-4. | branch `feat/feature-id-minimal-plan` | ☐ Pending |

#### Branch Dependency

Ships together with `2.3.0` in a single pull request against `main`. The two were
originally stacked — `feat/feature-id-minimal-plan` branched from
`path-token-reconciliation` rather than `main`, because the `{feature-id}` work assumes
every `{paths.<key>}` token already resolves (the `2.3.0` prerequisite). That ordering
still holds in the commit history, and the two version entries are kept separate here
to preserve it. What changed is the delivery: `path-token-reconciliation` was folded
into this PR rather than merged on its own, so `2.3.0` is a numbered entry in this log
that was never tagged as a release of its own. `main` moves from `2.2.0` to `2.4.0` in
one step.

`_docs/feature-id-minimal-plan.md` § 9 describes phases 1 and 2 as adding capability
without moving a byte of any existing artifact. That held for those two phases and no
longer describes this release: 3b renames the working-tree directory on opted-in
projects and 3 adds a directory level to every assembled path. What is preserved is
narrower and worth stating exactly — a project with no `features.toml` is unchanged,
and an opted-in project's *filenames* are unchanged. Directory depth is not.

`python3 scripts/validate.py` (0 errors, 3 pre-existing unrelated warnings), `node
scripts/validate.js` (0 errors, 4 warnings — the same 3 plus a pre-existing 201-line
`SKILL.md` notice only the Node registry check reports), `python3 scripts/test_validate.py`
(49/49), `node scripts/test-validate.js` (53/53), and `python3 scripts/build-registry.py`
(50 skills, 0 warnings — phases 2 onward added no new skill, only wired existing ones)
all green.

**Known documentation debt, deliberately not discharged here.** § 8 of the plan predicted
five files it then failed to touch, and predicted the consequence correctly: "leaving them
describing the old shape is documentation debt, not a saving". Outstanding are
`references/ai-principles/write-discipline.md` (per-section paths still described as
non-feature-scoped), `_docs/ai-sdlc-stage-map-new.md` (the canonical tree, lines 123-291,
still shows the pre-phase-3 shape and is the document a reader consults *for* the layout),
`AGENTS.md` (no `feature-id` vocabulary entry),
`references/elicitation-patterns/project-bootstrap.md` and `config/framework.toml.example`
(both cosmetic). Check N1 does not catch these because none of them spells a retired
placeholder — they describe the old *shape* in prose, which no regex can police. They should
be cleared before merge.

`README.md`'s version line is set to `2.4.0`, per the synchronisation rule at the foot
of this file. It had been left at `2.2.0` — the `2.3.0` bump did not carry it forward,
and the phase 1 bump here did not either, so the line was two releases stale rather
than one. Because both releases land in the same PR, `2.4.0` is the correct final
value and there is no second half left to reconcile.

### `2.3.0` — 2026-08-14

Reconciles every `{paths.<name>}` composition/skill token against the `[project.paths]`
keys actually declared in `config/SCHEMAS.md`, and adds the missing `quality_package`
key those tokens should have resolved to all along. See
`_docs/path-token-reconciliation-plan.md` for the full defect analysis — this is the
prerequisite for the feature-ID-as-path-segment work in
`_docs/feature-id-minimal-plan.md` (`2.4.0`), which would have inherited the same
phantom-token confusion had it landed first. Both ship in the same pull request; this
entry stays separate to record that the reconciliation stands on its own and came
first.

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-14 | Addition | config | `config/SCHEMAS.md`, `config/project.toml.example` | New `[project.paths].quality_package` key — restores a key the archived QE work depended on but that was dropped when those skills merged into the live tree, with a default (`"{project-root}/.framework-output/quality"`) that breaks no existing `project.toml`. § 1.5 gains a **`{paths.<key>}` / `{project.paths.<key>}` token-family** subsection: the two spellings are declared synonyms resolving into `[project.paths]`, and `{feature-id}` / `{increment-id}` / `{repo-slug}` / `{component-slug}` are documented as skill-supplied runtime substitutions — a distinct mechanism from both the config-load tokens above them and the `{paths.<key>}` family, not an informal fourth naming style. | branch `path-token-reconciliation` | ☐ Pending |
| 2 | 2026-08-14 | Addition | validator | `scripts/validate.py`, `scripts/validate.js` | New **Check M** — every `{paths.<key>}` / `{project.paths.<key>}` reference under `.agents/skills/` and `templates/compositions/` must name a key actually declared in `[project.paths]`. Hard error, not a warning: a `<key>` that resolves to nothing is a broken pointer, not a style variant, and a warning would only invite the naming scheme to drift back. Ships with positive/negative fixture tests in `scripts/test_validate.py` / `scripts/test-validate.js` (phantom-key rejection, declared-key acceptance, `{project.paths.<key>}` synonym acceptance). | branch `path-token-reconciliation` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-14 | Correction | Multiple | 7 `templates/compositions/*.yaml`, 23 `.agents/skills/**` files, `config/customizations/review-implementation-package.toml.example` (31 files, 43 occurrences) | Renamed every `{paths.<name>_path}` phantom token — `requirements_path`, `design_path`, `planning_path`, `quality_path`, `implementation_path`; none was ever a declared `[project.paths]` key — to the real key it always meant (the `*_package` sibling). Each occurrence had silently diverged from where the corresponding `create-*` skill actually writes; a `review-*` / `audit-*` skill resolving one of these tokens literally would have looked in the wrong directory. `greenfield-implementation-package.yaml`'s `{paths.planning_path}` became `{project.paths.implementation_package}` (matching the key `create-implementation-package/SKILL.md` already used correctly) rather than a new `planning_package` key, since planning and implementation were never two separate stages in `[project.paths]`. | branch `path-token-reconciliation` | ☐ Pending |
| 2 | 2026-08-14 | Correction | config | `config/SCHEMAS.md` | § 4 validation rule 5 said path tokens are "one of the four defined in § 1.5" — stale since the `{workspace}` token (2.0.0, Check K's PR) brought the count to five without updating the rule text. | branch `path-token-reconciliation` | ☐ Pending |

#### Branch Dependency

Minor release on top of `2.2.0` (new schema field, new validator check — both
backwards-compatible per this file's own versioning convention). Purely a naming-
consistency and validation-coverage fix: every renamed token already pointed at the
directory its `*_package` sibling names, so no artifact moves and no `project.toml`
requires migration. Projects that never overrode `quality_package` inherit the new
default silently; projects that already set it (there should be none, since the key
did not previously exist in the schema) are unaffected either way.

### `2.2.0` — 2026-08-04

Reconciles the three unlanded `mm/*` branches onto one branch. `mm/add-all` already
contained every commit of `mm/add-context` and `mm/add-adverserial` via its own merge
commits, so this is one body of work, not three.

**Reconciled by content, not by merge.** `mm/add-cobol` and `mm/add-ack` are already
ancestors of `main`, but `add-ack`'s tip is **not** an ancestor of `add-all` — the same
work exists on both sides under different SHAs, and `add-all`'s copies are the older
ones. A `git merge` would have reverted SoD path resolution and the write-discipline
Preconditions across the requirements / design / planning / execution skills, and failed
Check J. So: additions taken wholesale, shared files left at `main`'s version with only
the *intent* of the branch's change re-applied by hand.

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-04 | Addition | skills | `.agents/skills/knowledge-base/{capture-solution-context,generate-ai-rules,document-operations}/` | **Solution-context layer** — the human-grounded half of the KB. Three skills emitting `<KB>/shared/{solution-context, ai-rules, operations}/`: mission, personas, goals/KPIs, constraints, integrations, ownership; AI coding guardrails; deployment topology, environments, SLOs, runbooks. RE reads code rigorously but anything absent from code is invisible to it. Two of the three are hybrid — `generate-ai-rules` derives versions and commands from RE Part A, `document-operations` reads CI/CD configs — and only ask about what code cannot reveal. | branch `mm/add-context` | ☐ Pending |
| 2 | 2026-08-04 | Addition | skills | `.agents/skills/knowledge-base/review-knowledge-base-package/` | Periodic global-KB audit: ten ordered sub-reviews plus one conditional, writing to `<KB>/_review/<ISO8601>/` so audit history accumulates. Orchestrates `verify-knowledge-base-coverage` and `detect-knowledge-base-drift` L1 rather than reimplementing them; the cheap per-PR signal stays with `detect-knowledge-base-drift`. | branch `mm/add-adverserial` | ☐ Pending |
| 3 | 2026-08-04 | Addition | templates | `templates/blocks/knowledge-base/` (12 blocks), `templates/compositions/kb-{solution-context,ai-rules,operations}.yaml` | Block library and compositions backing the solution-context layer. | branch `mm/add-context` | ☐ Pending |
| 4 | 2026-08-04 | Addition | references | `references/elicitation-patterns/{personas,coding-rules,operations-discovery,ownership-and-raci}.md` | Question scripts for the four interactive halves of the layer. | branch `mm/add-context` | ☐ Pending |
| 5 | 2026-08-04 | Addition | config | `config/framework.toml.example`, `config/SCHEMAS.md` | `[knowledge_base] solution_context_max_age_days = 90` (advisory; never `high` severity) and `lineage_max_drift_commits = 25`. Deliberately different units: human-grounded leaves go stale on a calendar, lineage goes stale on a source-structure change. | branch `mm/add-context` + this reconcile | ☐ Pending |
| 6 | 2026-08-04 | Addition | docs | `_docs/{solution-context-gap-audit,solution-context-layer,adversarial-review-design,plan-yolo-mode}.md` | Design provenance for both layers, including the BMad gap audit that decided what to take and what RE already covers. | branches `mm/add-context`, `mm/add-adverserial`, `mm/add-all` | ☐ Pending |
| 7 | 2026-08-05 | Addition | docs | `_docs/exploration-queue.md` | The exploration requests that prompted the two layers, landed from `mm/add-all` (where it sat at repo root as `TODO.md`) and moved under `_docs/` with both items marked resolved. **Framework-development working material, not a framework artifact** — no block, composition, schema entry, or skill produces or consumes it. Filed as `docs` provenance in the row above on first landing, which was the wrong label: the four documents there record decisions taken, this one records the requests that led to them. | branch `mm/add-all` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-04 | Addition | skills | `review-requirements-package`, `review-design-package`, `review-implementation-package` | **Adversarial wrappers wired into the remaining three review gates**: requirements 10 → 12 sub-reviews, design 3 → 5, planning 8 → 10. Wrappers sit immediately before each readiness gate — running them first would waste them on an artifact still failing basic consistency, running them after would mean the gate never saw their findings. Planning translates severity into Critical / Important / Minor rather than PASS / FAIL. Applied by hand onto `main`'s current `review-workflow.md` files, not taken from the branch. | branch `mm/add-adverserial` (re-applied) | ☐ Pending |
| 2 | 2026-08-04 | Addition | skills | `build-knowledge-base/steps/{02,06,07}`, `navigate-knowledge-base`, `detect-knowledge-base-drift/steps/04`, `verify-knowledge-base-coverage/steps/03` | Solution-context wired into the KB pipeline: subtrees scaffolded **empty** at build, `ARCHITECTURE.md` § 0 pointer, documented read order, new `navigate` tiers exempt from `--max-components`, advisory staleness and repo-coverage sweeps. Four of the six files had diverged on `main` — including a rename (`07-emit-claude-md.md` → `07-emit-navigate-md.md`) that a wholesale checkout would have resurrected. | branch `mm/add-context` (re-applied) | ☐ Pending |
| 3 | 2026-08-04 | Addition | skills | `.agents/skills/_registry/workflow-graph.yaml` | Solution-context skills placed in both flows — `capture-solution-context` before the first requirements package, `generate-ai-rules` after design in greenfield but early in brownfield (RE Part A already carries the stack), `document-operations` optional on infra presence. All three plus `review-knowledge-base-package` added to `anytime`. Registry 45 → **49** skills. | branches `mm/add-context`, `mm/add-adverserial` | ☐ Pending |
| 4 | 2026-08-04 | Correction | references | `references/review-patterns/adversarial-wrapper-pattern.md` | Dropped the wired/reserved split — all five review-package skills now wrap, which is what the shared reference was factored out for. | this reconcile | ☐ Pending |
| 5 | 2026-08-04 | Correction | docs | `_docs/cobol-mainframe-review-integration.md` (**deleted**), `review-knowledge-base-package` | Applied the last pending patches — sub-review 7.5 `review-mainframe-lineage-integrity`, condition-gated on `<KB>/lineage/mainframe/` with a recorded `N/A` verdict when absent — then deleted the document per its own Apply-Time Checklist step 7. A silently-omitted sub-review and a legitimately-inapplicable one must not look identical in a verdict file. | branch `mm/add-cobol` (deferred patches) | ☐ Pending |
| 6 | 2026-08-04 | Correction | docs | `_docs/skills-test-plan.md` | Grafted the 11 test-plan sections covering the newly-landed skills into `main`'s newer plan (which had dropped them because the skills never landed), added wrapper pass-criteria to D.3/D.5/D.7, and added 7 coverage-matrix rows. `main`'s version won everywhere else — it is 500+ lines further along. `C.8.4` collided (`main` reuses it for `reverse-engineer-test-suite`), so the RE-review sections renumbered to C.8.5/C.8.6. `skills-test-results.md` left untouched: `main`'s is a superset. | branch `mm/add-all` (grafted) | ☐ Pending |
| 7 | 2026-07-14 | Addition | skills | `.agents/skills/execution/create-pr/{SKILL.md, references/implementation-pr-workflow.md}` | **Host-aware PR creation.** Step 4 previously hardcoded `gh pr create`, which left Azure DevOps repos with no automated path. It now probes the git remote URL and the available CLIs before attempting creation: `github.com` → `gh pr create` (with auth check); `dev.azure.com` / `visualstudio.com` → `az repos pr create` (with extension install, `az login` guidance, and URL-segment extraction for `--project` and `--repository`); everything else → a browser-URL fallback with per-platform templates for GitHub, Azure DevOps and GitLab. `SKILL.md` workflow summary, output list, and common-mistakes section updated to match. | PR 1917 | ☐ Pending |
| 8 | 2026-07-21 | Restructure | compositions | `templates/compositions/brownfield-enhancement-spec.yaml`, `references/elicitation-patterns/impact-assessment.md`, `README.md` | **Requirements-parity for the brownfield enhancement spec.** The requirements portion now mirrors the greenfield requirements shape block-for-block, on the principle that brownfield differs from greenfield only in that the pre-existing foundation is *discovered* rather than authored. Foundation-level detail is therefore not restated, and change-only sections are delta-gated behind `include-if` conditions (e.g. `project.elicitation.changes_personas`) rather than dropped, so a requirement authored here ends up equivalent in scope to its greenfield counterpart. Design and planning stay deliberately lean (single increment). | PR 1917 | ☐ Pending |

#### Branch Dependency

Minor release on top of `2.1.0`. Additive — no migration required. `mm/add-context`,
`mm/add-adverserial` and `mm/add-all` are recorded as merged ancestors via
`git merge -s ours`, so their authoring history stays reachable while this branch's tree
remains authoritative. All three are then safely deletable with `git branch -d`.

Deliberately **not** taken from `mm/add-all`: its older copies of the requirements /
design / planning / execution skills (already superseded on `main` by the SoD and
write-discipline work), and its `_docs/skills-test-results.md` (superseded by `main`'s
2026-07-24 and 2026-07-26 records).

#### Release packaging

`2.2.0` is tagged `R2.2.0`; **there is no `R2.1.0` tag.** Both the `2.1.0` and `2.2.0`
bodies of work reached `main` in the same merge (PR 2011), so `main` was never at
`2.1.0` as a released state — `2.1.0` is a real version boundary in this log, but it
shipped inside `R2.2.0`. Retro-tagging it would assert a release that never existed.

Rows 7-8 under Changed (PR 1917) also ship here. They merged to `main` on 2026-08-02,
after the `R2.0.0` tag but before this release, and were recorded retroactively at
release time rather than when they landed — which is why their dates precede the rest
of the section.

### `2.1.0` — 2026-08-04

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-04 | Addition | references | `references/elicitation-patterns/re-verification-gate-selection.md` | New **RE close-out gate**. Every `reverse-engineer-*` skill now asks the user how the extraction should be attested — `automated` (mechanical gate) or `review` (human sign-off) — and routes accordingly. Replaces the unconditional kick-off of `steps/verify.md`, which self-issued its own GO/NO-GO with no human in the loop. | branch `mm/re-close-out-gate` | ☐ Pending |
| 2 | 2026-08-04 | Addition | skills | `.agents/skills/reverse-engineering/review-reverse-engineering-package/` | Per-repo RE readiness gate: nine ordered sub-reviews (completeness, grounding, consistency, coverage, freshness, traceability, adversarial pass, edge cases, readiness) with per-verdict human acceptance and a written APPROVED / CONDITIONAL / BLOCKED verdict. Ported from the unmerged `mm/add-adverserial` branch and corrected for current output geometry. Independently invocable. | branch `mm/re-close-out-gate` | ☐ Pending |
| 3 | 2026-08-04 | Addition | skills | `.agents/skills/meta/review-adversarial/`, `.agents/skills/meta/review-edge-case-hunter/` | Adversarial-review layer: attitude-driven critique and method-driven edge-case walk, both producing `aide-adversarial-findings@1` files. Anytime-runnable; invoked as sub-reviews 7–8 by `review-reverse-engineering-package`. Also ported from `mm/add-adverserial`. | branch `mm/re-close-out-gate` | ☐ Pending |
| 4 | 2026-08-04 | Addition | references | `references/review-patterns/` (3 files) | Shared wrapper-dispatcher contract, Format 4 findings schema, and severity→verdict mapping for the adversarial sub-reviews. | branch `mm/re-close-out-gate` | ☐ Pending |
| 5 | 2026-08-04 | Addition | config | `config/project.toml.example`, `config/SCHEMAS.md` | New `[project.elicitation].re_verification_gate` (`ask` default / `review` / `automated`) pre-answers the close-out gate for unattended runs. Validation rule 6b rejects unrecognised values rather than falling back to `ask`. | branch `mm/re-close-out-gate` | ☐ Pending |
| 6 | 2026-08-04 | Addition | validator | `scripts/validate.py`, `scripts/validate.js` | New **Check L** — RE close-out gate binding. Asserts every `reverse-engineer-*` skill cites the routing pattern, its `steps/verify.md` declares both modes and both check tiers, and `re_verification_gate` values are in-enum. | branch `mm/re-close-out-gate` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-04 | Correction | skills | 11 × `reverse-engineer-*/steps/verify.md` | Verification checks are now split into **Tier M** (machine-checkable — a command, parse, or exact comparison whose two sides the report quotes) and **Tier J** (model judgment). Only Tier M may produce PASS or feed the verdict; Tier J is reported UNVERIFIED and never counted toward GO. Closes a real gap: the previous gate let the model grade its own extraction on judgment checklists and call the result verified. | branch `mm/re-close-out-gate` | ☐ Pending |
| 2 | 2026-08-04 | Correction | skills | 11 × `reverse-engineer-*/steps/verify.md` | The step is now mode-aware. `automated` issues `MECHANICAL: GO/NO-GO` scoped to Tier M; `review-evidence` issues **no** verdict and hands its report to `review-reverse-engineering-package` as evidence for sub-reviews 1, 5, 6. A Tier M failure halts in `automated` mode but is handed up as a finding in `review-evidence` mode. | branch `mm/re-close-out-gate` | ☐ Pending |
| 3 | 2026-08-04 | Correction | skills | `.agents/skills/knowledge-base/build-knowledge-base/SKILL.md` | Ingestion now requires a close-out attestation per repo — either a `MECHANICAL: GO` verification report or an APPROVED/CONDITIONAL readiness verdict. An extraction carrying neither is a halt, not a warning. | branch `mm/re-close-out-gate` | ☐ Pending |
| 4 | 2026-08-04 | Addition | skills | `.agents/skills/_registry/workflow-graph.yaml` | Brownfield flow gains the close-out fork after the RE dispatcher slot, modelled as `role: user-elected` (like the quality-stage fork), not as an unconditional gate. `review-adversarial`, `review-edge-case-hunter`, and `review-reverse-engineering-package` added to `anytime`. | branch `mm/re-close-out-gate` | ☐ Pending |
| 5 | 2026-08-04 | Correction | docs | `_docs/cobol-mainframe-review-integration.md` | Marked the `review-reverse-engineering-package` half of the pending patch-list **applied** (folded in at port time, expanded from ten domains to eleven to include `test-suite`). The `review-knowledge-base-package` half was still pending at this point; both halves land in `2.2.0` below, at which point the document is deleted. | branch `mm/reconcile` | ☐ Pending |

#### Branch Dependency

Minor release on top of `2.0.0`. Additive: projects that do not set
`re_verification_gate` get `ask`, which surfaces one question at the end of each RE
run. No migration required, but note the behavioural change — a reverse-engineering
run no longer closes itself, and `build-knowledge-base` now refuses an extraction that
received neither attestation.

Scoped out deliberately: `review-knowledge-base-package` (the global-KB audit sibling
on `mm/add-adverserial`) and that branch's Stage-4 cross-wiring of adversarial
sub-reviews into the requirements / design / planning review skills. Both remain
available on `mm/add-adverserial` for a later pass.

### `2.0.0` — 2026-07-29

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-07-28 | Addition | config | `config/SCHEMAS.md`, `config/project.toml.example` | Added the `[tools.*]` add-on resolution convention and the `{workspace}` path token, letting projects declare pluggable tool add-ons that resolve against the workspace root. Backwards-compatible: projects without `[tools.*]` are unaffected. | branch `mm/AIDE-core-changes` | ☐ Pending |
| 2 | 2026-07-28 | Addition | validator | `scripts/validate.py`, `scripts/validate.js` | New framework-layer `[tools.*]` guardrail (**Check K**): validates add-on tool declarations against the resolution convention and warns on malformed or unresolvable entries. | branch `mm/AIDE-core-changes` | ☐ Pending |
| 3 | 2026-07-28 | Addition | skills | `.agents/skills/_registry/**`, `aide-addon.toml` | Registry now supports add-on **extra-roots** via an `aide-addon.toml` manifest, so installed add-ons can contribute stage folders and skills to the canonical tree without polluting core. | branch `mm/AIDE-core-changes` | ☐ Pending |
| 4 | 2026-07-28 | Addition | references | flows / source-adapter convention | Added an optional **source-adapter** convention to the greenfield/brownfield flows for pluggable discovery inputs. Opt-in; existing flows unchanged when unused. | branch `mm/AIDE-core-changes` | ☐ Pending |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-07-28 | Restructure | skills | integration tooling → `aide-addons` add-on | Extracted the integration tooling (Jira / Confluence / document-conversion) out of the core catalogue into a separately-installable `aide-addons` add-on, consumed through the new add-on extra-roots mechanism. Projects that relied on these skills being present in core must now install the `aide-addons` add-on. | branch `mm/AIDE-core-changes` | ☐ Pending |
| 2 | 2026-07-28 | Correction | compositions | `templates/compositions/{brownfield,greenfield}-quality-package.yaml` | Fixed `affects-repos` handling in quality packages, gated mobile-framework subsystems, and resolved the quality-gate flags. | branch `mm/AIDE-core-changes` | ☐ Pending |
| 3 | 2026-07-28 | Correction | blocks | mainframe lineage / reverse-engineering blocks | Feed-files now sit at the Part-B root; lineage db2/cics/ims gates are feed-derived; sparse block numbering is pinned and the test-suite Part-B path is aligned to the source-docs convention. | branch `mm/AIDE-core-changes` | ☐ Pending |

#### Branch Dependency

Major release on top of `1.6.5`. Versioned as MAJOR because integration tooling
(Jira / Confluence / document-conversion) has been **removed from the core skill
catalogue** and extracted into a separately-installable `aide-addons` add-on
(commit `3f40c0f`, marked breaking upstream). **Migration required:** projects that
relied on those skills shipping in core must now install the `aide-addons` add-on
to restore them. The rest of the release is additive and backwards-compatible —
pluggable `[tools.*]` add-on resolution, add-on extra-roots, the source-adapter
convention, and validator Check K — but the catalogue-shape change alone crosses
the MAJOR threshold under this project's semver convention.

---

### `1.6.5` — 2026-06-18

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-15 | Addition | references | `references/orientation/workspace-agents-coding-standards.md` | New host-agnostic coding-standards addendum spliced into the workspace-root `./AGENTS.md` managed block by Step 9 of the install runbook. Introduces a `## Coding standards (auto-enforced per repo)` heading that the runbook asserts on after every install/update, so every agentskills.io host sees the repo-wide coding standards directive without project-specific configuration. | branch `feature/code-standards-discovery` | ☐ Pending |


#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-16 | Source Update | skills | `.agents/skills/planning/review-implementation-package/SKILL.md`, `.agents/skills/quality/review-quality-package/SKILL.md`, `.agents/skills/quality/create-quality-package/SKILL.md`, `.agents/skills/quality/create-quality-package/references/INPUTS-OUTPUTS.md`, `.agents/skills/execution/execute-increments/SKILL.md`, `.agents/skills/_registry/workflow-graph.yaml` | Made the quality stage **optional and user-elected** on the dev critical path, decoupled from any `project.toml` field. At `review-implementation-package` GO the user picks one of two paths per-run: (a) **quality-first** → `create-quality-package`, whose `review-quality-package` gate must return GO before `execute-increments`; or (b) **execute-first** → `execute-increments` directly, with the quality stage running in parallel/deferred and coverage reconciled post-hoc by `audit-quality-coverage`. `execute-increments` now treats the Quality Package as **recommended, not required** — when present it must carry a `review-quality-package` GO before its release gates bind; when absent it anchors TDD on Requirements-Package ACs. `create-quality-package` may be authored quality-first/in parallel before INCs land, classifying ACs only and recording the `INC-XXX` traceability column as `(pending)`. `review-quality-package` no longer branches on configuration. The workflow graph marks `create-quality-package` `optional: true` / `role: user-elected` in both greenfield and brownfield, with the `review-quality-package` gate binding only within the quality-first path. The choice is a conversational, per-run decision that is **not persisted**. `[project.testing].qe_repo` is now used **purely for artifact routing** (where QE-owned test files are written) and plays no part in the gate decision. | this change | ✅ Verified |

#### Branch Dependency

In-flight change pending versioning decision (patch vs. minor). The quality
stage becomes a user-elected fork at `review-implementation-package` GO rather
than a mandated gate; the decision is conversational and not persisted, and is
fully independent of `[project.testing].qe_repo` (which now only routes
QE-owned test artifacts). Projects that always elect the quality-first path see
no change in the gate's force.
| 1 | 2026-06-15 | Source Update | docs | `INSTRUCTIONS.md` (Step 9, Step 10 verification, Step 12 uninstall, Troubleshooting, machine-readable YAML manifest, `.aide-install.json` provenance schema) | Reworked Step 9 to publish AIDE's workspace-root `./AGENTS.md` as a **managed block** delimited by `<!-- aide:managed:begin … -->` / `<!-- aide:managed:end -->` sentinels instead of a whole-file generated copy. AIDE only writes between the sentinels; hand-authored content outside the block is preserved verbatim across installs and updates. Five write modes are now defined: `create`, `replace-in-place`, `migrate` (from the legacy `<!-- aide:generated-agents -->` whole-file marker), `prepend` (first adoption on a hand-authored file — no longer skipped), and `malformed-skip` (refuse to modify a corrupted block to avoid data loss). Step 9 also splices the new `references/orientation/workspace-agents-coding-standards.md` addendum into the block immediately before the stable `## What this folder is NOT` anchor; verification asserts the `## Coding standards (auto-enforced per repo)` heading landed. Sentinel detection matches the substrings `aide:managed:begin` / `aide:managed:end` (not the full banner literal) so the human-readable warning can be reworded in future releases without breaking installed workspaces. Step 10's verify list, Step 12's uninstall protocol, the troubleshooting "hand-authored file" entry, the YAML manifest's `aide_install.agents_md` section, and the `.aide-install.json` schema (`agents_md_block_begin`, `agents_md_block_end`, `agents_md_write_mode`) are all updated to match. Re-running the runbook on existing installs is fully idempotent. | branch `feature/code-standards-discovery` | ☐ Pending |

#### Branch Dependency

Patch release on top of `1.6.2`. Backwards-compatible: existing installs whose `./AGENTS.md` still begins with the legacy `<!-- aide:generated-agents -->` marker are auto-migrated to the managed-block format on the next install/update (write mode `migrate`); installs that already use the sentinels get an in-place block refresh (`replace-in-place`); hand-authored `./AGENTS.md` files that previously caused Step 9 to skip are now adopted via `prepend`, preserving the user's content below the block. The skill catalogue, workflow-graph stage ordering, composition shapes, and schemas are unchanged. Validator behavior unchanged.

---

### `1.6.2` — 2026-06-05

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-05 | Addition | config | `config/SCHEMAS.md`, `config/project.toml.example` | Added optional `[project.testing].qe_repo` to declare a dedicated QE/test-automation repository by `[[project.repos]].code`. Quality-stage artifact execution and test-suite lookup prefer this repo when configured, while preserving the previous code-repo fallback when unset. The repo role vocabulary now includes `test-automation` and `qe`, and the example project declares a `qe-automation` repo. | this release | ✅ Verified |
| 2 | 2026-06-05 | Addition | validator | `scripts/validate.py`, `scripts/validate.js`, `scripts/test_validate.py`, `scripts/test_fixtures/sod-negatives/unknown-qe-repo.toml` | Added validator coverage for `[project.testing].qe_repo`: the field must be a non-empty string matching a declared `[[project.repos]].code`; Python and Node validators warn when the referenced repo is not role `test-automation` or `qe`. Regression tests cover both unknown and valid QE repo configurations. | this release | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-05 | Source Update | skills | `.agents/skills/meta/start-project/**` | `start-project` now elicits `[project.testing].qe_repo`, ensures the selected QE repo exists in `[[project.repos]]`, and renders the new section into `project.toml`. New projects can therefore declare the QE repo during bootstrap instead of relying on later manual edits. | this release | ✅ Verified |
| 2 | 2026-06-05 | Source Update | skills, blocks | `.agents/skills/quality/**`, `templates/blocks/quality/{test-case-increment,automation-and-cicd}.md` | Quality-stage planning and execution now resolve QE-owned executable test artifacts to `[project.testing].qe_repo` when configured. `create-quality-package` records the resolved target in TC-XXX plans; `execute-quality-increments` writes to the QE repo by default; coverage audit and failure triage search the QE repo first. When no QE repo is configured, behavior falls back to the in-scope code repo. `execute-increments` is intentionally unchanged because it owns application TDD tests in the code repo. | this release | ✅ Verified |
| 3 | 2026-06-05 | Source Update | docs | `README.md`, `CHANGELOG.md` | Bumped the visible framework version and changelog current artifact version from `1.6.1-beta` to the non-beta `1.6.2`; updated the README update example to use `AIDE_REF=v1.6.2`. | this release | ✅ Verified |

#### Branch Dependency

Patch release on top of `1.6.1-beta`. Backwards-compatible: projects without
`[project.testing].qe_repo` keep the existing code-repo default for QE-owned
test artifacts. Projects that opt in get a dedicated QE repo target for
quality-stage executable artifacts and lookup operations. Application
implementation execution remains unchanged: `execute-increments` continues to
write dev-owned TDD tests in the code repo.

### `1.6.1-beta` — 2026-06-05

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-05 | Addition | docs | `INSTRUCTIONS.md` | New tool-agnostic A.I.D.E. install/update/uninstall runbook. It defines git preflight and no-HTTP-fallback rules for private repos; mandatory vs optional copy sets; workspace-root flat skill-discovery shim generation; workspace-root `AGENTS.md` generation; verification, provenance, troubleshooting, and a machine-readable YAML manifest. The runbook is intentionally script-free so any coding agent can install A.I.D.E. into `AIDE/` and generate the workspace-root discovery surface without Python, Node, symlinks, junctions, or editor-specific configuration. | PR #28 (`feature/instructions-prompt`, commit `228d7d2`) | ✅ Verified |
| 2 | 2026-06-05 | Addition | validator | `scripts/validate.py`, `scripts/validate.js` | Added validator Check J: the three package-authoring `create-*` skills (`create-requirements-package`, `create-design-package`, `create-implementation-package`) must each declare a top-level `## Preconditions` section and reference `references/ai-principles/write-discipline.md`; the validator also verifies the referenced write-discipline file exists. Python and Node validators carry the same bounded skill list and check semantics. | PR #28 (`feature/instructions-prompt`, commit `228d7d2`) | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-05 | Source Update | docs | `README.md` | Rewrote Getting Started Step 1 around the new `INSTRUCTIONS.md` runbook: install/update prompts now require the rules block first, document override variables (`AIDE_SOURCE_URL`, `AIDE_REF`, `AIDE_TARGET_DIR`), explain idempotent updates, and describe workspace-root flat shims plus generated `AGENTS.md` as the cross-host discovery/orientation mechanism. This release also corrects the visible README version header from `1.5.2` to `1.6.1-beta`. | PR #28 (`feature/instructions-prompt`, commit `228d7d2`) + this correction | ✅ Verified |
| 2 | 2026-06-05 | Source Update | docs | `.agents/skills/_registry/SHIMS.md` | Reframed discovery shims from a future build-output/script scheme to the implemented install-runbook scheme: shims are generated at the consumer workspace root (`./.agents/skills/<skill>/SKILL.md`), canonical skills remain untouched under `AIDE/.agents/skills/<stage>/<skill>/SKILL.md`, stale marker-tagged shims are swept on reinstall, and a parallel generated `./AGENTS.md` uses the `<!-- aide:generated-agents -->` marker. | PR #28 (`feature/instructions-prompt`, commit `228d7d2`) | ✅ Verified |
| 3 | 2026-06-05 | Source Update | skills, references, docs | `AGENTS.md`, `references/ai-principles/write-discipline.md`, `.agents/skills/{requirements,design,planning}/create-*-package/SKILL.md` | Elevated the write-discipline contract from a workflow note to a hard precondition for requirements, design, and implementation-package creation. The three skills now require reading `<AIDE root>/references/ai-principles/write-discipline.md`, presenting the three mandatory prompts, recording the user's choices, and halting before Step 0 until confirmed. The reference now clarifies that One-pass mode still writes each file before drafting the next, adds a per-section persistence checkpoint with independent verification, and adds a closing inventory check before handoff. `AGENTS.md` now advertises the same operational contract repo-wide. | PR #28 (`feature/instructions-prompt`, commit `228d7d2`) | ✅ Verified |
| 4 | 2026-06-05 | Source Update | docs | `CHANGELOG.md` | Added this missing release entry for PR #28 and advanced the changelog current artifact version from `1.6.0-beta` to `1.6.1-beta`, restoring alignment between the latest main merge, the project changelog, and the visible README version. | this correction branch | ✅ Verified |

#### Branch Dependency

Patch-beta release on top of `1.6.0-beta`. This release is documentation and validation hardening: it does not change the skill catalogue shape, workflow graph stage ordering, composition schema, or package artifact shape. Existing installs continue to work, while new or updated installs should follow `INSTRUCTIONS.md` to generate workspace-root skill shims and the workspace-root `AGENTS.md` orientation file. The strengthened write-discipline preconditions affect only the three bound package-authoring skills and convert the already-required write-on-acknowledge behavior into a validator-enforced, pre-Step-0 contract.

### `1.6.0-beta` — 2026-05-31

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-31 | Addition | skills | `.agents/skills/quality/{create-quality-package,review-quality-package,execute-quality-increments,audit-quality-coverage,review-test-failures}/` | New unified **quality** stage consolidating three earlier QE skill candidates (branch in-tree `.agents/skills/qe/`, EM-QE, DCC-QE) into a single stage with **5 skills**. `create-quality-package` + `review-quality-package` drive the Quality Package (quality strategy, test design traced to ACs, QE plan with automation/CI gates/test data/release gates). `execute-quality-increments` is the optional per-test-case TC-XXX executor. `audit-quality-coverage` and `review-test-failures` are independently invocable (read-only coverage audit; failed-run triage walk-through). DCC-QE's `qe-code-scanner` was deliberately not ported — its capability is delivered by `reverse-engineer-test-suite` + `navigate-knowledge-base --profile=test-suite`. See `_docs/qe-analysis-3-methods.md` for the full merge analysis and `_archive/qe-stage-pre-merge/README.md` for the archive note. | this release | ✅ Verified |
| 2 | 2026-05-31 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-test-suite/SKILL.md` | New reverse-engineering skill for standalone test-automation repositories (Cucumber / Playwright / Cypress / Selenium / pytest / k6 / RestAssured / Karate). Part A documents internals for test engineers; Part B catalogues reusable assets (shared utilities, fixtures, page objects, step-defs, marker / tag vocabulary, environment / data contract, CI surface, ownership) into the KB with `kind: test-suite` frontmatter so `navigate-knowledge-base --profile=test-suite` finds it. Consumed by all four quality-stage authoring/operational skills for reuse cross-checks, drift detection, and triage lookups. | this release | ✅ Verified |
| 3 | 2026-05-31 | Addition | compositions | `templates/compositions/re-test-suite-internal.yaml`, `templates/compositions/re-test-suite-consumer.yaml`, plus 26 new block files under `templates/blocks/reverse-eng/test-suite/{internal,consumer}/` | New RE compositions for the test-suite domain, fully populated with their block libraries. **Internal (Part A) — 16 blocks** (order 110..260): `suite-overview`, `runner-and-entry-points`, `project-structure-and-conventions`, `configuration-and-profiles`, `shared-utilities-catalogue`, `fixtures-and-test-data`, `page-objects-and-step-defs`, `spec-feature-inventory`, `marker-tag-vocabulary`, `auth-and-environment-entry`, `environment-matrix`, `parallelism-and-isolation`, `reporting-and-analytics`, `ci-integration`, `known-gaps-and-anti-patterns`, `glossary`. **Consumer (Part B) — 10 blocks** (order 110..200): `suite-purpose-and-scope`, `runner-and-invocation`, `shared-utilities-catalogue`, `fixtures-catalogue`, `page-objects-and-step-defs-catalogue`, `marker-tag-vocabulary`, `environment-and-data-contract`, `feature-inventory`, `ci-surface`, `ownership`. Every consumer-side block declares `kind: test-suite` in its frontmatter example so `navigate-knowledge-base --profile=test-suite` finds it. Satisfies `scripts/validate.js` Check H ("RE skill output-structure binding") cleanly with zero stub warnings. | this release | ✅ Verified |
| 4 | 2026-05-31 | Addition | skill-config | `config/customizations/{create-quality-package,execute-quality-increments,audit-quality-coverage,review-test-failures}.toml.example` | Four new Layer-5 team customization examples for the quality-stage skills: stack pinning, NFR floors, per-category coverage floors with exempt-INC allowlist, per-TC exit gates, failure-category taxonomy extension, severity bands, KB reuse-analysis configuration. Replaces the legacy `create-qe-package.toml.example` (removed). | this release | ✅ Verified |
| 5 | 2026-05-31 | Addition | config | `config/project.toml.example` | Added three new `[project.elicitation]` keys: `uses_test_case_increments` (opt into the TC-XXX flow), `test_framework`, `test_runner`. Consumed by the four quality-stage skills so they don't re-ask per invocation. Pre-existing `testing_strategy` key preserved. Backwards-compatible: unknown elicitation keys are tolerated. | this release | ✅ Verified |
| 6 | 2026-05-31 | Addition | docs | `_archive/qe-stage-pre-merge/README.md` | Archive breadcrumb documenting what used to live at `.agents/skills/qe/`, why it was merged, where each source skill now lives, and the rationale for not porting `qe-code-scanner`. | this release | ✅ Verified |
| 7 | 2026-05-31 | Addition | compositions | `templates/compositions/brownfield-quality-package.yaml` | Brownfield quality composition matching the greenfield quality package surface while documenting brownfield KB/source grounding through `create-quality-package` and `navigate-knowledge-base`. Keeps `config/customizations/create-quality-package.toml.example`'s brownfield composition option resolvable. | this release | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-31 | Source Update | skills | `.agents/skills/_registry/workflow-graph.yaml` | Inserted new `quality` stage at **order 4**; shifted execution / reverse-engineering / knowledge-base / quick-dev / jira / confluence / files-conversion to orders 5–11. Wired `create-quality-package` (gated by `review-quality-package`) between `review-implementation-package` and `execute-increments` in **both** greenfield and brownfield sequences. Added `audit-quality-coverage`, `review-test-failures`, and `execute-quality-increments` to the `anytime:` block. Validator Check B (workflow-graph resolution) clean. | this release | ✅ Verified |
| 2 | 2026-05-31 | Source Update | docs | `README.md` | Added a `quality` row to the Stages table positioned between `planning` and `execution`. | this release | ✅ Verified |
| 3 | 2026-05-31 | Source Update | skills | `.agents/skills/quick-dev/document-quick-change/SKILL.md` | Step 5 of Workflow now requires a per-AC **"How will this be proven?"** verification note and an explicit §12.2a **quality constraints** subsection (test framework / runner / coverage floor / lint rules / prohibited test patterns). Two new Common-mistakes entries reinforce both. Codifies the quick-dev quality-stage bypass policy. | this release | ✅ Verified |
| 4 | 2026-05-31 | Source Update | skills | `.agents/skills/quick-dev/execute-quick-change/SKILL.md` | Added a new Overview subsection **"Quality stage is bypassed (by design)"** mapping each quality concern to its inline carrier and naming the six escalation triggers to the full quality stage. Cross-references `quality/README.md` and `quality-in-the-lifecycle.md`. Doc-only — no workflow steps changed. | this release | ✅ Verified |
| 5 | 2026-05-31 | Source Update | docs | `.agents/skills/quality/README.md` | Skills table expanded to 5 rows. Added new sections: **"Test-suite intelligence via the knowledge base"** (codifies why `qe-code-scanner` is not ported; routes through `reverse-engineer-test-suite` + `navigate-knowledge-base`), **"No hard external-tool dependencies"** (the Atlassian-CLI Step-9 test), and an expanded Quick-dev section with an 8-row carrier table plus a 6-trigger escalation list. | this release | ✅ Verified |
| 6 | 2026-05-31 | Source Update | docs | `.agents/skills/quality/create-quality-package/references/quality-in-the-lifecycle.md` | Stage matrix gained a **quick-dev row** documenting the compressed carriers (per-AC proof notes, §12.2a quality constraints, TDD + 3-dim verification, 4-lens review, Completion Confirmation Gate). Execution row references `review-test-failures`; KB row references `audit-quality-coverage`. Prose Quick-dev section restated with the 6 escalation triggers verbatim with `quality/README.md`. | this release | ✅ Verified |
| 7 | 2026-05-31 | Source Update | docs | `tools/README.md`, `tools/packages/atlassian-cli/README.md` | Added "Status: optional companion tool" banners explicitly stating that the Atlassian CLI is **not** part of the A.I.D.E. framework and **not required** by any stage skill. Names every A.I.D.E. stage (requirements / design / planning / quality / execution / KB / quick-dev) and the five quality-stage skills as forbidden hard-dependents. Implements Step 9 / Option B of the QE merge plan. | this release | ✅ Verified |
| 8 | 2026-05-31 | Source Update | skill-config | `config/customizations/README.md` | Extended the file-purpose table to list the four new quality-stage customization examples. | this release | ✅ Verified |
| 9 | 2026-05-31 | Source Update | skills | `.agents/skills/{jira,confluence,files-conversion}/*/SKILL.md`, `.agents/skills/_registry/{skills.csv,skills.json}` | Normalized Jira, Confluence, and document-conversion skill descriptions to the framework's "Use when..." trigger style, fixed relative links to optional companion tool documentation, and regenerated the skill registry. Resolves the prior description-discipline warnings for those integration skills; only the `jira-get` line-count warning remains for that skill family. | this release | ✅ Verified |

#### Removed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-31 | Removal | skill-config | `config/customizations/create-qe-package.toml.example` | Removed superseded customization for the legacy `create-qe-package` skill. Replaced by the four new `customizations/*-quality-*.toml.example` files. | this release | ✅ Verified |

#### Branch Dependency

Minor release on top of `1.5.2`. Pure additive: the new `quality` stage and its 5 skills do not alter any existing skill, composition, block, or schema. The `quick-dev` skills gained additional in-workflow prompts (per-AC verification notes, §12.2a quality-constraints subsection) but no structural changes — quick-dev specs authored under earlier versions remain valid; the new prompts only affect newly authored specs going forward. The `workflow-graph.yaml` re-ordering shifts stage `order` values (execution `4` → `5`, etc.) but stage IDs are unchanged, so any downstream tooling that resolves by ID continues to work; tooling that hard-codes numeric order values would need adjusting. The new `[project.elicitation]` keys (`uses_test_case_increments`, `test_framework`, `test_runner`) are tolerated as unknown by older project.toml files and ignored by skills that don't consume them.

Validator state at release: 0 errors, 4 warnings (`templates/blocks/quality/index.md`, `templates/blocks/requirements/completeness-tracker.md`, `templates/blocks/requirements/index.md`, plus `jira-get` length >200 lines). Skill count: 45 → 48. New block count: +26 (test-suite internal 16 + consumer 10).

---

### `1.5.2` — 2026-05-31

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-31 | Addition | docs | `.agents/skills/_registry/SHIMS.md` | New design note documenting the cross-host **discovery-shim** scheme: why physical files instead of symlinks/junctions, ownership table (canonical `<stage>/<skill>/SKILL.md` vs generated flat `<skill>/SKILL.md` under `build/AIDE/`), intended generator behavior, manual-invocation commands, and the hidden `<!-- aide:generated-shim -->` marker safety invariant. Documentation only on this branch — the referenced generator and packaging scripts (`scripts/build-skill-shims.{py,js}`, `scripts/package-aide.{py,js}`, `scripts/install-skills.{py,js}`) and the README "Step 1 — Install the framework" rework land in a follow-up release. | cherry-picked from `feature/skill-shims-discovery` | ✅ Verified |
| 2 | 2026-05-29 | Addition | skill-config | `config/customizations/create-requirements-package.toml.example` | New `force_discovery` boolean (default `false`) on the `create-requirements-package` customization. When `true`, Step 1 (brownfield discovery → `current-capability-baseline.md`) runs even when the active composition is `greenfield-requirements-package.yaml`. Lets teams that want the full greenfield output structure still demand a current-capability baseline against an existing system, without having to switch the project's flow to brownfield. | retro-changelog for PR #20 (`feat/add-force-discovery-create-req`, merged into `main` at `7f6682c`) | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-31 | Source Update | docs | `.agents/skills/README.md` | Added a "Host discovery (slash commands)" section explaining the canonical-vs-flat layout mismatch and pointing readers at the new `_registry/SHIMS.md` design note. References to `scripts/build-skill-shims.{py,js}` and `scripts/build-registry.{py,js}` describe the intended workflow once the scripts land. | cherry-picked from `feature/skill-shims-discovery` | ✅ Verified |
| 2 | 2026-05-31 | Source Update | docs | `README.md` | Bumped version header `1.5.0` → `1.5.2` and added a one-line cross-reference in "Step 2 — Open it in your IDE" pointing at `.agents/skills/_registry/SHIMS.md` for the cross-host flat-discovery design. No change to Step 1 / installation workflow on this branch. | this commit | ✅ Verified |
| 3 | 2026-05-29 | Source Update | skill | `.agents/skills/requirements/create-requirements-package/SKILL.md` | Updated the skill overview and Step 1 entry in the orchestration list to reflect that discovery now runs either when the project is brownfield **or** when `force_discovery = true` is set in the skill customization. Previously the description said "brownfield only". No behavior change to greenfield projects that do not set the flag. | retro-changelog for PR #20 (`feat/add-force-discovery-create-req`) | ✅ Verified |
| 4 | 2026-05-29 | Source Update | skill | `.agents/skills/requirements/create-requirements-package/steps/01-discovery.md` | Retitled "Step 1 — Discovery (brownfield only)" → "Step 1 — Discovery" and rewrote the gating preamble to enumerate the two run conditions (brownfield mode OR `force_discovery = true`). Pure-greenfield projects without the flag still skip the step exactly as before. | retro-changelog for PR #20 (`feat/add-force-discovery-create-req`) | ✅ Verified |

#### Branch Dependency

Additive on top of `1.5.1`. Two independent change streams are bundled into this release:

1. **Doc-only cherry-pick from `feature/skill-shims-discovery`** — adds `.agents/skills/_registry/SHIMS.md` and a "Host discovery (slash commands)" section in `.agents/skills/README.md`. No skill content changed; no frontmatter shape changed; no `<stage>/<skill>/` paths moved; no scripts added or modified. The companion shim generator, packaging script, user-global installer, registry-build integration, `.gitignore` rules, and Check J validator described in `_registry/SHIMS.md` will land in a separate follow-up release.
2. **Retro-changelog for PR #20 (`feat/add-force-discovery-create-req`, merged at `7f6682c`)** — that PR landed on `main` without a changelog entry. The new `force_discovery` flag on `create-requirements-package` is opt-in (defaults to `false`), so projects that do not set it see no behavior change. Documented here so `main` becomes self-consistent again when this branch merges.

Teams already on the framework continue to work unchanged whether or not they opt into either stream.

---

### `1.5.1` — 2026-05-21

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-19 | Addition | references | `references/ai-principles/write-discipline.md` | New cross-cutting AI principle codifying the write-discipline contract for `create-*` SDLC skills: three mandatory pre-skill prompts (acknowledgement mode, output structure, confirmation), the write-on-acknowledge invariant, back-revision protocol, and the "draft-in-chat-then-flush" anti-pattern warning. Referenced by the three create-package skills via a "Before Step 0" instruction. (PR #12, USWISO-5728) | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-19 | Source Update | skills | `.agents/skills/requirements/create-requirements-package/SKILL.md`, `.agents/skills/design/create-design-package/SKILL.md`, `.agents/skills/planning/create-implementation-package/SKILL.md` | Inserted a "Before Step 0" instruction in all three `create-*` SKILL.md files pointing at the new `references/ai-principles/write-discipline.md`, ensuring the three mandatory user prompts (acknowledgement mode, output structure, confirmation) fire before any package authoring begins. (PR #12, USWISO-5728) | repo @ this commit | ✅ Verified |
| 2 | 2026-05-19 | Source Update | skills | `.agents/skills/design/create-design-package/SKILL.md`, `.agents/skills/design/create-design-package/steps/02-design.md` | Marked Step 1 discovery as **MANDATORY** for brownfield flows and added a brownfield guard to step 02 that halts execution when `architecture-baseline.md` is missing. Added a new "skipping discovery in brownfield mode" entry to the common-mistakes list. (PR #12, USWISO-5728) | repo @ this commit | ✅ Verified |
| 3 | 2026-05-20 | Source Update | skills | `.agents/skills/requirements/review-requirements-package/SKILL.md`, `.agents/skills/requirements/review-requirements-package/references/review-workflow.md` | Hardened the review-requirements-package contract so that the `review/` directory and per-review artifact files are **always** written to disk. Each `review/<review-name>.md` is now written immediately after the user accepts that review's verdict (instead of being deferred to the end), and `review/readiness-verdict.md` is written immediately after Review 10. Presenting findings in chat without writing the files is now explicitly called out as a skill violation. (PR #16, USWISO-5730) | repo @ this commit | ✅ Verified |
| 4 | 2026-05-21 | Restructure | skills | `.agents/skills/knowledge-base/build-knowledge-base/` (SKILL.md + steps 02, 06, 08 + 3 references), `.agents/skills/knowledge-base/build-knowledge-base/steps/07-emit-navigate-md.md` (renamed from `07-emit-claude-md.md`), `.agents/skills/knowledge-base/navigate-knowledge-base/` (SKILL.md + OVERVIEW.md) | Renamed the KB's agent-facing navigation document from `CLAUDE.md` to the host-neutral `NAVIGATE.md` (root + per-repo). Build-knowledge-base now emits `NAVIGATE.md`; navigate-knowledge-base implements a resolver pattern that reads `NAVIGATE.md` first and falls back to `CLAUDE.md` when absent, so KBs built before this version continue to work unmodified. Step file `07-emit-claude-md.md` renamed to `07-emit-navigate-md.md` (slug + handoff pointer updated). Validator coverage check in step 08 accepts either filename. Registry rebuilt (42 skills, no new warnings). | repo @ this commit | ✅ Verified |

#### Fixed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-20 | Correction | skills | `.agents/skills/knowledge-base/detect-knowledge-base-drift/steps/01-l1-commit-stamp.md` | Made the L1 commit-stamp procedure submodule-aware: detects whether `.git` is a file (submodule) vs a directory (standalone repo) and switches between `cd <repo.path> && git <cmd>` and `git -C <repo.path> <cmd>` for the three git operations (`rev-parse HEAD`, `rev-list`, `diff --name-only`). Eliminates the 27 false-positive "broken SHA" findings observed across UI submodules in multi-repo workspaces. (PR #14) | repo @ this commit | ✅ Verified |

#### Branch Dependency

Patch release on top of `1.5.0` bundling three independent skill-hardening PRs (PR #12 / USWISO-5728, PR #14, PR #16 / USWISO-5730) plus the host-neutral KB navigation-file rename (`CLAUDE.md` → `NAVIGATE.md`). Pure additive — no breaking changes; existing requirements-, design-, and knowledge-base-package outputs remain valid, and KBs built before this version continue to function unmodified thanks to the resolver-pattern fallback in `navigate-knowledge-base`. The new write-discipline reference, review-on-disk guarantees, submodule-aware drift detection, and host-neutral navigation filename tighten skill behavior without altering any artifact shape, composition, or schema.

---

### `1.5.0` — 2026-05-06

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-06 | Addition | skills | `.agents/skills/jira/{jira-get,jira-search,jira-extract-requirements}/` | Three new Jira skills: `jira-get` (single-issue fetch with cache), `jira-search` (JQL search with aggregation reports), `jira-extract-requirements` (Feature/Epic → markdown discovery package with L0 link traversal and staleness tracking). All three are optional integrations gated on the `atl` CLI being installed. | repo @ this commit | ✅ Verified |
| 2 | 2026-05-06 | Addition | skills | `.agents/skills/confluence/{confluence-fetch,confluence-extract-package}/` | Two new Confluence skills: `confluence-fetch` (single-page fetch with optional `--with-jira` enrichment), `confluence-extract-package` (page + L0 links → markdown discovery package with staleness tracking and graceful Jira coupling via `.jira.json`). | repo @ this commit | ✅ Verified |
| 3 | 2026-05-06 | Addition | skills | `.agents/skills/files-conversion/document-convert/` | New universal document converter skill: Word/Excel/PDF → markdown with progressive-disclosure references for each format and structured analysis output. Optional integration gated on the `spt` CLI. | repo @ this commit | ✅ Verified |
| 4 | 2026-05-06 | Addition | skills | `.agents/skills/_registry/workflow-graph.yaml` (stages 8/9/10) | Added `jira`, `confluence`, and `files-conversion` stages; positioned `jira-extract-requirements` and `confluence-extract-package` as `optional: true, role: discovery-input` in both greenfield and brownfield flows ahead of `create-requirements-package`; added `jira-get`, `jira-search`, `confluence-fetch`, `document-convert` to the anytime-utility whitelist. Discovery-input role preserves the requirements-package gate. | repo @ this commit | ✅ Verified |
| 5 | 2026-05-06 | Addition | Multiple | `tools/packages/atlassian-cli/`, `tools/packages/sharepoint-cli/`, `tools/packages/shared-utils/` | New npm-workspace monorepo at `tools/` housing the optional CLIs that back the Jira / Confluence / document-convert skills, plus a shared-utils package for cross-cutting helpers. Workspace install is opt-in; skills probe for the CLI on PATH and fall back to `cd tools && npm run <cli> --` when not globally installed. | repo @ this commit | ✅ Verified |
| 6 | 2026-05-06 | Addition | scripts | `scripts/build-registry.js`, `scripts/validate.js`, `scripts/test-validate.js` | Node.js parity implementations of the existing Python registry/validator scripts to support contributors without a Python toolchain. CRLF normalization in frontmatter parsers. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-06 | Source Update | skills | `.agents/skills/{jira,confluence,files-conversion}/*/SKILL.md` (6 files) | Added the framework-standard `## When NOT to use` section to all six new skills, bringing skill-catalogue conformance to 42/42. Each section enumerates sibling-skill alternatives and the optional-CLI prerequisite. | repo @ this commit | ✅ Verified |
| 2 | 2026-05-06 | Source Update | skills | `.agents/skills/jira/jira-extract-requirements/references/OVERVIEW.md`, `.agents/skills/confluence/confluence-extract-package/references/OVERVIEW.md` | Rewrote "Position in workflow" sections to mark these skills as optional discovery inputs feeding Step 1 of `create-requirements-package`, removing earlier framing that implied they could bypass the requirements-package gate. | repo @ this commit | ✅ Verified |
| 3 | 2026-05-06 | Source Update | skills | `.agents/skills/confluence/confluence-extract-package/SKILL.md` | Replaced thin `Related Skills` block with explicit `## Related skills` section documenting the upstream cache producers, the `.jira.json` runtime coupling with `confluence-fetch --with-jira`, the graceful-degradation contract when enrichment is absent, and the sibling (not fallback) relationship to `jira-extract-requirements`. | repo @ this commit | ✅ Verified |
| 4 | 2026-05-06 | Source Update | skills | 8 files across `.agents/skills/{jira,confluence}/**` | Removed undocumented `GLOBAL_CLI` references in favor of a runtime probe-and-fallback pattern (`atl --version` → fallback to `cd tools && npm run atl --`), aligning skill behavior with the optional-integration philosophy and removing an implicit dependency on a never-defined config key. | repo @ this commit | ✅ Verified |
| 5 | 2026-05-06 | Source Update | Multiple | `tools/packages/atlassian-cli/AI-INTEGRATION.md` | Rewrote AI integration guide (~85 lines) with accurate skill table, correct cache paths, correct skill-discovery path, and explicit optional-integration framing. Re-pointed inbound links from package README and FAQ. | repo @ this commit | ✅ Verified |
| 6 | 2026-05-06 | Source Update | skills | `.agents/skills/files-conversion/document-convert/README.md` | Replaced misleading "consolidating three similar skills" claim (no such prior skills existed) with an honest description: handles three document formats through progressive disclosure of format-specific references. | repo @ this commit | ✅ Verified |
| 7 | 2026-05-06 | Source Update | Multiple | `tools/README.md`, `tools/tools-install.prompt.md`, `tools/packages/atlassian-cli/docs/ARCHITECTURE.md`, `tools/packages/sharepoint-cli/README.md`, `tools/packages/shared-utils/README.md`, `tools/package.json`, `.env.example`, `.gitignore` | Cleanup of stale references to removed packages (`db-cli`, `figma-cli`); removed `npm run help` / `npm run info` script entries; added `tools/package-lock.json` and `tools/packages/*/package-lock.json` to `.gitignore`. | repo @ this commit | ✅ Verified |

#### Removed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-06 | Removal | Multiple | `tools/packages/db-cli/`, `tools/packages/figma-cli/` | Removed two CLI packages that had zero references from any skill or top-level documentation. They can be reintroduced as proper optional integrations (skill + workflow-graph entry + AI-INTEGRATION) when there is a corresponding skill that needs them. | repo @ this commit | ✅ Verified |
| 2 | 2026-05-06 | Removal | Multiple | `tools/packages/atlassian-cli/docs/AI-INTEGRATION.md`, `tools/scripts/{show-help,show-info,README}.{js,md}` | Deleted stale duplicate AI-INTEGRATION (re-pointed inbound links) and redundant `show-help` / `show-info` helper scripts (content lived in `tools/README.md`). | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release adds the optional Jira / Confluence / document-conversion integrations on top of `1.4.6`. Pure additive at the skill-catalogue level — no breaking changes to existing projects. The new skills enter the workflow as `optional: true, role: discovery-input` ahead of `create-requirements-package` and as anytime utilities; the requirements-package gate is preserved. The `tools/` workspace is opt-in and skills degrade gracefully when the underlying CLIs are not installed.

---

### `1.4.6` — 2026-05-01

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-01 | Addition | skills | `.agents/skills/quick-dev/execute-quick-change/steps/04-confirmation-gate.md` | New Completion Confirmation gate at the tail of the quick-dev execution workflow — forces an explicit user-confirmation checkpoint before the skill closes the change. | repo @ this commit | ✅ Verified |
| 2 | 2026-05-01 | Addition | blocks | `templates/blocks/quick-dev/assumptions-constraints-out-of-scope.md` | New shared block capturing assumptions, constraints, and out-of-scope items at quick-dev spec time so they propagate into plan and execute steps. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-01 | Source Update | skills | `.agents/skills/quick-dev/execute-quick-change/{SKILL.md,steps/02-verify.md,references/*}` | Added Solution Pivot gate to step 02 (verify) — when the implemented change diverges from the documented intent, the skill prompts the user to confirm a pivot or rewind rather than silently shipping the divergent solution. | repo @ this commit | ✅ Verified |
| 2 | 2026-05-01 | Source Update | skills | `.agents/skills/quick-dev/{document-quick-change,plan-quick-change,execute-quick-change}/` — SKILL.md + step files | Aligned the three quick-dev SKILL.md and step files with the new gates and solution-constraints capture (per adversarial-review feedback) — consistent terminology, gate references, and handoff text across the flow. | repo @ this commit | ✅ Verified |
| 3 | 2026-05-01 | Source Update | compositions | `templates/compositions/quick-dev-spec.yaml`, `templates/compositions/brownfield-enhancement-spec.yaml` | Wired the new assumptions/constraints/out-of-scope block into both quick-dev-flavoured spec compositions. | repo @ this commit | ✅ Verified |
| 4 | 2026-05-01 | Source Update | branding | `README.md` | Rewrote Getting Started: install (mandatory/optional/skip lists), open in IDE (VSCode + Copilot first, then Cursor), bootstrap with /start-project (sibling workspace layout, Legacy vs SoD subsections), where to go next. Existing reference sections preserved below. | repo @ this commit | ✅ Verified |
| 5 | 2026-05-01 | Source Update | docs, config | `_docs/sod-multi-repo-proposal.md` § 3-4, `config/project.toml.example` (commented SoD block) | Updated SoD layout diagram and example `dir`/`path` values to recommend siblings of the workspace folder (`dir = "../ba-repo"`, `path = "{project-root}/../<repo>"`) rather than children. | repo @ this commit | ✅ Verified |
| 6 | 2026-05-01 | Restructure | config, skills | `config/project.toml.example`, `config/project.user.toml.example`, `.agents/skills/meta/start-project/references/{EXAMPLE,INPUTS-OUTPUTS}.md` | Renamed example KB repo from `checkout-knowledge-base` to generic `knowledge-base-repo` across all docs/examples (4 files, 7 occurrences). | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release adds the Solution Pivot + Completion Confirmation gates and solution-constraints capture to the quick-dev workflow on top of `1.4.5`. Pure additive — no breaking changes to existing quick-dev projects; the new constraints block is wired through the spec composition and the new gates run inside the existing execute-quick-change flow.

---

### `1.4.5` — 2026-05-01

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Addition | docs | `_docs/sod-multi-repo-proposal.md` | Design proposal for the separation-of-duties (SoD) multi-repo capability — full schema, layout geometry (legacy / SoD directory mode / SoD colocate mode), per-stage adoption story, and validator-rule design (rules 7–12). | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Addition | config | `config/project.toml.example`, `config/project.user.toml.example` | New SoD-aware example project.toml files showing the `[stages.<stage>]` and `[[project.repos]]` shape required to enable SoD per-stage. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Addition | skills | `.agents/skills/requirements/create-requirements-package/steps/00-scope-target-repo.md`, `.agents/skills/design/create-design-package/steps/00-scope-target-repo.md`, `.agents/skills/execution/execute-increments/steps/00-scope-target-repo.md`, `.agents/skills/planning/create-implementation-package/steps/scope-target-repo.md` | New scope-target-repo step files added at the head of the create / plan / execute workflows. Resolve the host repo for the artifact and (in SoD modes) detect cross-cutting features by reading `[stages.<stage>]` plus the `affects_repos` block. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-30 | Addition | blocks | `templates/blocks/shared/affects-repos.md` | New shared block that SDLC artifact templates include to declare cross-repo impact (`affects_repos` list) when the feature is cross-cutting. | repo @ this commit | ✅ Verified |
| 5 | 2026-05-01 | Addition | validator | `scripts/test_validate.py`, `scripts/test_fixtures/sod-negatives/` (8 fixtures) | New stdlib-only unittest suite covering validator rules 7–12, plus eight negative-test TOML / Markdown fixtures (absolute artifact subdir, both modes set, cross-cutting empty / unknown affects, role mismatch, unknown write role). | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-01 | Source Update | validator | `scripts/validate.py` | Extended the validator with SoD rules 7–12 and a `--project-toml` CLI flag: artifact-subdir non-absolute, single-mode-per-stage (no `dir` + `colocate_with_source`), known write-role, role-to-stage mapping, cross-cutting `affects_repos` non-empty, cross-cutting `affects_repos` references known repos. Existing rules 1–6 unchanged. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Source Update | config | `config/SCHEMAS.md` | Documented SoD layout geometry (legacy / directory / colocate modes) and per-stage SoD adoption (`[stages.<stage>]` with `dir`, `colocate_with_source`, `artifact_subdir`, write-role). +113 lines net. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Source Update | skills | `.agents/skills/requirements/review-requirements-package/SKILL.md`, `.agents/skills/design/review-design-package/SKILL.md` | Added "Step 0 — Locate the upstream artifact (SoD only)" section to both review skills so they resolve the upstream artifact path under legacy / directory / colocate modes. Read-only step (no permission check); non-interactive invocations fail fast on ambiguity. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-30 | Source Update | skills | `.agents/skills/requirements/create-requirements-package/SKILL.md`, `.agents/skills/design/create-design-package/SKILL.md`, `.agents/skills/planning/create-implementation-package/SKILL.md`, `.agents/skills/execution/execute-increments/SKILL.md` | Threaded the new scope-target-repo step into each create / plan / execute SKILL.md as the leading step. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-30 | Source Update | compositions | `templates/compositions/greenfield-requirements-package.yaml`, `templates/compositions/greenfield-design-package.yaml` | Wired the new `shared/affects-repos` block into both greenfield compositions so cross-cutting features can declare repo impact at authoring time. | repo @ this commit | ✅ Verified |
| 6 | 2026-05-01 | Restructure | skills | `.agents/skills/knowledge-base/update-knowledge-base/SKILL.md` + `references/OVERVIEW.md` | Tightened catalog-only matching-criterion language: clarified that update-knowledge-base only updates components whose match criteria are satisfied by the diff and never speculatively touches unmatched components. | repo @ this commit | ✅ Verified |

#### Fixed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Correction | skills | `.agents/skills/meta/framework-navigator/references/INPUTS-OUTPUTS.md`, `.agents/skills/meta/framework-navigator/references/OVERVIEW.md`, `.agents/skills/meta/framework-navigator/steps/03-match-or-render.md` | Replaced hardcoded "32 skills" assertions with dynamic registry reads. The skill now reflects the current registry size at invocation time instead of drifting whenever new skills land. | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release adds the separation-of-duties (SoD) multi-repo capability on top of `1.4.0` (acknowledgement-restoration). SoD is fully additive — every legacy project keeps working without modification, and SoD adoption is **per-stage**: a stage adopts SoD only when its `[stages.<stage>]` entry declares `dir` or `colocate_with_source`. See `_docs/sod-multi-repo-proposal.md` for the full design.

The compound version label `1.4.5` reflects: ack-restoration `1.4.0` + COBOL/mainframe RE `1.3.0` (merged forward via `mm/add-cobol`) + SoD scaffold (this release). The canonical merge order remains:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0) → mm/add-ack (1.4.0) → SoD work captured here.

---

### `1.4.0` — 2026-04-30

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-30 | Restructure | skills | `.agents/skills/{requirements,design,planning,execution}/` — 4 SKILL.md + 9 step files + 2 process.md refs | Stage 1 of acknowledgement-restoration: promotes "verify understanding" from a single bullet inside the 7-step per-file workflow to a top-level "Verification rule (always-on)" section in every SDLC create/execute SKILL.md, plus an "Acknowledgement checkpoint" sub-section at the tail of each step file and a non-skippable note under the 7-step table in the two process.md references. See `_docs/plan-restore-acknowledgement.md`. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-30 | Restructure | skills | `.agents/skills/{requirements,design}/` — 2 process.md + 2 step files + 2 workflow refs | Stage 2 of acknowledgement-restoration: makes the section relevance check unconditional. Drops the "if relevance is in question" clause from the 7-step Step 0 row and from per-block workflow text. Adds explicit per-sub-step relevance ask to discovery-workflow and analysis-workflow refs. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-30 | Restructure | blocks, skills | `templates/blocks/{requirements,design}/` — 4 block templates + 2 step files | Stage 3 of acknowledgement-restoration: adds "AUTHORING RULE — sub-section acknowledgement" notes (HTML-comment-wrapped so they do not render in the assembled package) to the four large block templates (functional-requirements, business-logic-rules, api-design, database-design) mandating a per-item acknowledgement loop instead of one-pass drafting. Step files flag these blocks as iterative. | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release contains the acknowledgement-restoration changes (Changes A / B / C from `_docs/plan-restore-acknowledgement.md`) on top of `mm/add-cobol` (1.3.0). It matches the design-doc-declared `mm/add-ack` 1.4.0 release identity per the canonical merge order:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0) → mm/add-ack (1.4.0).
On `mm/add-ack-cobol-repo` this layer was bundled with 1.3.0 (cobol RE) and serves as the foundation for the SoD multi-repo capability shipped in 1.4.5.

---

### `1.3.0` — 2026-04-29

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Addition | docs | `_docs/cobol-mainframe-re-design.md` | Stage 1 design note for the COBOL/mainframe RE layer: three new RE domain skills, one new KB aggregation skill, analyze-repository extensions, block / composition trees, review-package integration. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-cobol-program/` | New domain skill: documents COBOL programs into Part A (DIVISION-by-DIVISION reference, PERFORM/CALL graph, FILE-CONTROL/FD bindings, EXEC CICS/SQL/DLI inventories) + Part B (program contract for batch schedulers and integrators). Emits three lineage feed-files (program-call-graph.mmd, program-data-bindings.json, program-exec-inventory.md). | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-copybook-library/` | New domain skill: documents copybook libraries into Part A (per-copybook record reference, REDEFINES variants, OCCURS expansion, level-88 condition names, naming-convention buckets, duplicate / divergent detection) + Part B (canonical record catalogue + field index = the data dictionary). Emits feed-files: copybook-record-graph.json, data-dictionary.md, copybook-conflicts.md. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/reverse-engineer-jcl-job/` | New domain skill: documents JCL / PROCLIB into Part A (step-by-step reference, PROC and INCLUDE expansion, DD inventory, GDG and dataset lifecycle, condition codes, IDCAMS/SORT/IEBGENER patterns, scheduler integration, RACF) + Part B (job-flow guide for downstream consumers). Emits feed-files: job-flow.mmd, dataset-io.json. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/build-mainframe-data-lineage/` | New KB-stage aggregator skill: consumes the three domain skills' feed-files and emits a coherent cross-program data-lineage artefact under `<KB>/lineage/mainframe/` (copybook-where-used, field-where-used, MOVE chain, job→program→dataset chain, EXEC SQL/IMS/CICS bindings, unbound-and-flagged catalogue, summary). Eight-step workflow with explicit coverage-rule gate. | repo @ this commit | ✅ Verified |
| 6 | 2026-04-29 | Addition | blocks | `templates/blocks/reverse-eng/cobol-program/`, `templates/blocks/reverse-eng/copybook-library/`, `templates/blocks/reverse-eng/jcl-job/` | 56 new block templates (16+6 cobol-program, 12+6 copybook-library, 11+5 jcl-job) backing the three new RE domain compositions. | repo @ this commit | ✅ Verified |
| 7 | 2026-04-29 | Addition | blocks | `templates/blocks/knowledge-base/mainframe-lineage/` | 10 new block templates backing the kb-mainframe-data-lineage composition. | repo @ this commit | ✅ Verified |
| 8 | 2026-04-29 | Addition | compositions | `templates/compositions/re-cobol-program-{internal,consumer}.yaml`, `templates/compositions/re-copybook-library-{internal,consumer}.yaml`, `templates/compositions/re-jcl-job-{internal,consumer}.yaml`, `templates/compositions/kb-mainframe-data-lineage.yaml` | Seven new compositions (six per-domain RE pairs plus the lineage aggregator). | repo @ this commit | ✅ Verified |
| 9 | 2026-04-29 | Addition | docs | `_docs/cobol-mainframe-review-integration.md` | Documents the review-package patches that apply post-merge of mm/add-adverserial — extends review-reverse-engineering-package coverage tables for the three new domains and adds a review-mainframe-lineage-integrity sub-review to review-knowledge-base-package. Deferred patch because the target review skills don't exist on this branch. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Source Update | skills | `.agents/skills/reverse-engineering/analyze-repository/` | Extended dispatcher with mainframe detection: new 1c′ extension-density + source-line-marker step (.cbl/.cob/.cpy/.pli/.jcl/.proc/.bms/.dbd/.psb, IDENTIFICATION DIVISION, EXEC CICS/SQL/DLI, JCL JOB/STEP/SYSIN, Endevor / ChangeMan / Panvalet headers), three new dispatch rows (cobol-program / copybook-library / jcl-job), mainframe-monorepo ordering rule (copybook-library → cobol-program → jcl-job → build-mainframe-data-lineage), worked-example variant for a mainframe monorepo. SKILL.md still under 200 lines. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Source Update | validator | `.agents/skills/_registry/{skills.csv, skills.json}` | Rebuilt registry: 36 skills (was 35), 0 warnings. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Source Update | validator | `.agents/skills/_registry/workflow-graph.yaml` | Updated brownfield flow to reference ten domain skills (was seven) and to list build-mainframe-data-lineage as an optional post-build step gated on mainframe-stack presence. | repo @ this commit | ✅ Verified |

#### Branch Dependency

This release builds on the design-doc-declared merge order:
mm/add-context (1.1.0) → mm/add-adverserial (1.2.0) → mm/add-cobol (1.3.0).
The review-package integration (Stage 4) is documented as a deferred
patch because it modifies skills introduced by mm/add-adverserial. If
the merge order changes, the version on this branch must be adjusted
accordingly at integration time.

---

### `1.0.1` — 2026-04-27

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-27 | Restructure | skills, blocks | `.agents/skills/reverse-engineering/`, `templates/blocks/reverse-eng/` | Made the reverse-engineering skills and their block libraries technology-agnostic — removed framework-, language-, and platform-specific verbiage from SKILL.md files and reusable blocks so the RE flow applies cleanly to any stack. | repo @ this commit | ✅ Verified |

---

### `1.0.0` — 2026-04-27

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-27 | Addition | branding | repo-wide | Renamed the framework to **A.I.D.E. (AI Integrated Delivery Enablement)** — full form on first mention in README + AGENTS, short form `A.I.D.E.` everywhere else | repo @ this commit | ✅ Verified |
| 2 | 2026-04-27 | Addition | docs | `README.md` header | Project version pinned to `1.0.0`, displayed at the top of the README. Single source of truth for the version. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-27 | Addition | docs | `CHANGELOG.md` (this file) | Added at repo root. Dogfoods F-007 — uses the canonical change-log block via `project-change-log.yaml` composition. | repo @ this commit | ✅ Verified |

#### Changed

(Forward-looking placeholder — entries land here as `Changed` as they ship.)

#### Fixed

(Forward-looking placeholder.)

#### Deprecated

(Forward-looking placeholder.)

#### Removed

(Forward-looking placeholder.)

#### Security

(Forward-looking placeholder.)

---

### `0.x` — pre-1.0 history (compressed)

Pre-1.0 work was not formally versioned. The git log under the previous repo name (`theframework`) carries the per-commit history. Notable milestones, in chronological order:

- **Migration foundation** — skills consolidated under `.agents/skills/`, AGENTS.md authored, host setup simplified.
- **Cursor IDE host support** — host-comparison cheatsheet authored.
- **Stage-mapping reference docs** — `_docs/` set authored to track archive→current stage mapping.
- **BMAD methodology committed** — `_bmad/` brought into version control as a methodology input (config.user.toml gitignored per F-006-style convention).
- **End-to-end test pass** — all 32 skills exercised across 5 phases (A–E); 7 findings raised and resolved:
    - F-001 — validator phase-vocab allowlist via per-file pragma
    - F-002 — Check A widened to count direct skill-markdown refs
    - F-003 — test-plan B.4 pass criterion aligned to SKILL.md
    - F-004 — stale change-tracker-template cross-references corrected
    - F-005 — RE output bound to composition block lists; validator Check H added
    - F-006 — `build-knowledge-base` fail-loud on empty `[[project.repos]]`
    - F-007 — project-level CHANGELOG.md support (the work this file is the first instance of)
- **Test-plan tightened** — Phase A / Phase C / Phase D.10 pass criteria updated to reflect the post-fix framework state.

The 1.0.0 entry above marks the formal start of versioned releases.

## Cross-Part / Cross-Section Synchronisation

| If This Changes... | Check This... |
|---|---|
| README version line | This CHANGELOG's "Current artifact version" cell |
| Block / composition contracts | Update validator checks accordingly; bump MAJOR if breaking |
| Project.toml schema | Update `config/SCHEMAS.md` and `config/project.toml.example` together; bump MINOR for additive fields, MAJOR for breaks |
| New skill added or skill removed | Bump MINOR; record under Added or Removed; rebuild registry |
| Skill description edited | Rebuild registry (`scripts/build-registry.py`); record under Changed |
