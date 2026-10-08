# A.I.D.E. — Configuration & Knowledge-Base Schemas

> **Status:** Design draft. The artifacts in this directory are schemas, templates,
> and `.example` files. They are NOT live runtime configuration. The skeleton task
> will lift them into their canonical locations and create real `framework.toml` /
> `project.toml` instances.

## Deliverables in this directory

| File | One-line description |
|---|---|
| `SCHEMAS.md` | This document — full design rationale for the four-layer config model and KB schemas. |
| `framework.toml.example` | Annotated example of the installer-managed shipped defaults (read-only by users). |
| `framework.user.toml.example` | Annotated example of the gitignored personal global preferences layer. |
| `project.toml.example` | Annotated example of the committed project super-context for a 3-repo setup with a sibling KB repo. |
| `project.user.toml.example` | Annotated example of the gitignored personal project preferences layer. |
| `features.toml.example` | Annotated example of the committed, opt-in feature registry — a peer of `project.toml`, not a layer within it. See § 2.8. |
| `customizations/README.md` | Layer-5 directory orientation: file-naming rules, precedence inside Layer 5, when-to-use-which-layer guide, and how `customize-framework` interacts with this folder. |
| `customizations/example-skill.toml.example` | Comprehensive merge-behaviour reference for a hypothetical skill: scalar override, array-of-tables merge by `code`, `_suppress: true`, array-of-scalars replacement. |
| `customizations/create-requirements-package.toml.example` | Worked example for a stage-driver skill (composition pin, deepened elicitation, suppressed optional artifact, custom block). |
| `customizations/analyze-repository.toml.example` | Worked example for a dispatcher skill (classification thresholds, default domain for ambiguous monorepos, signal additions / suppressions). |
| `customizations/review-implementation-package.toml.example` | Worked example for a review skill (per-path reviewer requirements, custom review lens, severity elevation). |
| `kb-architecture.template.md` | The root `ARCHITECTURE.md` template every KB carries; uses `{{placeholders}}` filled by the build-knowledge-base-index skill. |
| `kb-component-frontmatter.example.yaml` | Realistic component frontmatter for an `order-checkout-flow` component spanning api-orders + api-billing. |
| `kb-graph.example.json` | `graph.json` example with 5 nodes and 6 edges across multiple repos and edge `kind` values. |

All four config layers ship an annotated `.example` file so users have a
template for any layer they choose to author. Layer 2 (`framework.user.toml`)
is a subset of Layer 1's schema; the example shows the fields that most
commonly belong at the personal-global layer (chat language, personal flow
default, elicitation depth/persona overrides) without duplicating the full
Layer 1 surface.

---

## 1. The Four-Layer Config Model

### 1.1 Concept

A.I.D.E. borrows BMAD's two-axis configuration model and extends it with a
**suppression marker**. The two axes are:

- **Scope axis:** _global_ (per-installation, applies to everything the user
  does with A.I.D.E. on this machine) vs. _project_ (this repository / this
  product).
- **Sharing axis:** _team_ (committed, version-controlled) vs. _personal_
  (gitignored, machine-local).

That gives four base layers, with a fifth slot for per-skill overrides:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Layer 1  framework.toml                installer-managed   global   │
│  Layer 2  framework.user.toml           installer-managed   global   │
│  Layer 3  project.toml                  team-edited         project  │
│  Layer 4  project.user.toml             personal            project  │
│  Layer 5  customizations/<skill>.toml          team / personal       │
└──────────────────────────────────────────────────────────────────────┘
```

**Precedence (lowest to highest):** `framework.toml` → `framework.user.toml` →
`project.toml` → `project.user.toml` → `customizations/<skill>.toml` →
`customizations/<skill>.user.toml`. Higher layers override lower layers via the
deep-merge rules in § 1.3.

**Key design rule:** every layer is _optional_. A.I.D.E. runs from
`framework.toml` alone if the user has done nothing else. Each higher layer
supplies _refinements_, never required values.

### 1.2 Why this shape

BMAD's split between installer-managed (`config.toml`, `config.user.toml`) and
custom (`custom/config.toml`, `custom/config.user.toml`) works well in
practice: it lets the installer regenerate its own files freely without
clobbering user intent, because user intent lives in a sibling tree the
installer never touches. A.I.D.E. keeps that separation but renames the
layers along the scope+sharing axes because:

1. A.I.D.E.'s "project" notion is first-class (greenfield/brownfield/quick-dev
   flows are project-level, KB lives at project granularity), so promoting
   `project.toml` to a peer of `framework.toml` is more honest than nesting it
   under a `[modules.bmm]` section.
2. The `customizations/` directory is per-skill rather than a single big
   `custom/config.toml`. With ~50 skills under unification, fragmenting overrides
   by skill keeps each file under ~100 lines and makes diffs reviewable.

### 1.3 Deep-merge semantics

When loading config, layers are merged in precedence order using these rules:

| Source value type | Merge rule |
|---|---|
| Scalar (string, number, boolean) | Higher layer **overrides** lower layer. |
| Table (TOML `[section]` or inline `{}`) | **Recursive merge** — keys present only in the lower layer are preserved, keys present in both recurse into this rule set. |
| Array of scalars | Higher layer **replaces** lower layer (no append). |
| Array of tables where each entry has a `code` or `id` key | **Merge by key.** For each entry in the higher layer, if a lower-layer entry has the same `code` (or `id`), recursively merge them; otherwise append the higher-layer entry. |
| Array of tables without a `code`/`id` key | **Append** higher entries to lower entries. |

The key-name lookup order is `code` first, then `id`. Authors choose one
convention per field family — see § 2.4 for examples. The choice of `code`/`id`
specifically (rather than `name`) is deliberate: human-readable names get
edited, but stable keys must survive renames.

### 1.4 The `_suppress: true` marker

BMAD lacks any way to _remove_ a base entry from a higher layer — you can only
override a value or add an entry. A.I.D.E. adds:

```toml
[[stages.requirements.required_artifacts]]
code = "competitive-analysis"
_suppress = true
```

When the merger encounters an entry whose only non-key field is `_suppress = true`
(or `_suppress = true` plus the key field), the matching entry from all lower
layers is **dropped from the merged result**. This is the only way to express
"my project does not produce competitive-analysis even though the framework
default includes it."

Suppression rules:

1. `_suppress = true` is only meaningful on entries within an array-of-tables
   merged by `code`/`id`. On scalars and tables it is ignored (with a warning).
2. The key field must be present alongside `_suppress` so the merger knows
   which lower-layer entry to remove.
3. A higher layer can also _re-introduce_ a suppressed entry by re-declaring it
   without `_suppress` in a still-higher layer. The last layer wins.
4. `_suppress = false` is not a thing — its absence already means "do not
   suppress."

### 1.5 Path resolution and tokens

Path values may use these tokens, expanded at config-load time:

| Token | Resolves to |
|---|---|
| `{project-root}` | The directory containing `project.toml`. |
| `{framework-root}` | The directory containing `framework.toml`. |
| `{home}` | The current user's home directory. |
| `{cwd}` | The shell's current working directory at the time the framework was invoked. |
| `{workspace}` | The common parent of the workspace's root folders in a multi-root workspace (i.e. the directory that holds the framework repo, the project repo, and any sibling add-on repos). When it cannot be determined, it falls back to the parent of `{framework-root}`. Used mainly by `[tools.*].install_root` to locate a sibling add-on repo. |

Relative paths (no leading `/` or `~`) are resolved relative to `{project-root}`
when they appear in `project.toml` / `project.user.toml` / `customizations/`,
and relative to `{framework-root}` when they appear in
`framework.toml` / `framework.user.toml`.

**The `{paths.<key>}` family.** Compositions and skill markdown reference
`[project.paths]` fields (§2.3) using either `{paths.<key>}` or
`{project.paths.<key>}` — the two are synonyms, both legal, and both resolve
identically to that field's configured (or default) value. `<key>` must name
a field actually declared in `[project.paths]` (`requirements_package`,
`design_package`, `implementation_package`, `quality_package`,
`knowledge_base_path`); a `<key>` that names no declared field is a broken
reference, not an informal spelling. This is a distinct mechanism from the
environment tokens above: `{project-root}` et al. expand to a filesystem
location at config-load time, while `{paths.<key>}` is a lookup into
already-resolved config.

**Skill-supplied runtime substitutions.** `{feature-id}`, `{increment-id}`,
`{repo-slug}`, `{component-slug}` and similar are **not** config-load
tokens — no layer declares them and no loader expands them. They are
placeholders that the invoking skill fills in from its own runtime context
(the active feature, the increment being executed, the repo or component in
scope) before a path is used. Documented here so the token table above is
not read as the complete list of every `{...}` placeholder in the tree.

---

## 2. Layer Schemas

### 2.1 Layer 1 — `framework.toml`

**Location:** `<framework-install>/framework.toml` (installer-owned).
**Sharing:** committed inside the framework distribution; reset on every install.
**Edit policy:** read-only for users. Direct edits are clobbered on the next
installer run; durable changes go in `framework.user.toml` or `project.toml`.

**Top-level sections:**

```toml
[core]                  # framework-wide defaults
[stages.<stage>]        # per-stage defaults (one section per stage)
[knowledge_base]        # default conventions for KB layout & verification
[registry]              # skill-registry regeneration triggers
```

**Field reference** (see `framework.toml.example` for a complete commented
artifact):

`[core]`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `output_language` | string | `"English"` | Language for all generated artifacts. Free-form, no enum, so dialects (`"en-GB"`) and non-English values are valid. |
| `default_flow` | enum | `"greenfield"` | Default flow when `project.toml` doesn't specify one. Values: `greenfield`, `brownfield`, `quick-dev`. |
| `output_root` | path | `"{project-root}/.framework-output"` | Default root for non-KB artifacts (req package, design package, impl package). Per-stage paths in `[project.paths]` override this. |
| `glossary_strict` | bool | `false` | When `true`, agents fail loudly on terms not in the glossary; when `false`, they warn. Off by default to avoid blocking new vocabulary. |

`[stages.<stage>]` (one section per known stage; the framework ships with
`requirements`, `design`, `implementation`, `knowledge-base`):

| Field | Type | Default | Purpose |
|---|---|---|---|
| `enabled` | bool | `true` | Stage is available in the orchestrator; setting `false` removes it from the menu. |
| `default_composition` | string | `null` | Name of the default YAML composition for this stage (e.g. `"greenfield-default"`). Skills resolve this against `compositions/<stage>/`. |
| `required_artifacts` | array<table> | (see example) | Artifact descriptors keyed by `code`. The build-knowledge-repository and check-implementation-readiness skills consume this list. |
| `[stages.<stage>.elicitation]` | table | `{}` | Stage-scoped elicitation defaults (e.g. depth, persona to use). |

**Separation-of-duties (SoD) fields.** When a project adopts an SoD layout
(stage artifacts written to role-restricted repos), the following fields may
be set on `[stages.<stage>]`. They are **additive** to the existing fields
above; absence means the stage uses legacy `[project.paths]` resolution.
See `_docs/sod-multi-repo-proposal.md` for the full SoD design.

| Field | Type | Default | Purpose |
|---|---|---|---|
| `dir` | string | (unset) | Host repo (relative to `{project-root}`) where this stage's artifacts are written. Mutually exclusive with `colocate_with_source`. Used by directory-mode SoD resolution. |
| `colocate_with_source` | bool | (unset) | When `true`, artifacts live inside the relevant source repo (resolved via `[[project.repos]][code=<repo-code>].path`). Mutually exclusive with `dir`. Used by colocate-mode SoD resolution. |
| `write_role` | enum | (unset) | The role allowed to write to this stage's artifacts. Compared against `[user].role` from `project.user.toml` at every write boundary. Values: `BA`, `Architect`, `BSA`, `Developer`, `Tester`, `KB-Steward`. |
| `output` | string | (unset) | Per-stage override of `[project].artifact_subdir`. Bare relative directory name; no leading slash, no path tokens. |

A stage adopts SoD when it declares `dir` or `colocate_with_source`. With
neither set, the stage falls back to legacy `[project.paths].<stage>_package`
resolution exactly as today. SoD adoption is **per-stage**: a project may
flip requirements to SoD while leaving execution on legacy paths.

**Layer-restriction note.** SoD policy fields (`dir`, `colocate_with_source`,
`write_role`, plus `[project].artifact_subdir` and `[user].role`) live in
Layers 1–4 only. Per-skill customizations at `customizations/<skill>.toml`
(Layer 5) **cannot** override these fields. This prevents per-skill escape
hatches in the role policy. Layer 5 customizations continue to apply for
skill-internal behavior (composition pinning, elicitation depth, artifact
suppression, custom blocks).

`[knowledge_base]`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `default_path` | path | `"{project-root}/../knowledge-base"` | Default KB location relative to the project root. Most projects override this in `project.toml.knowledge_base_path`. |
| `architecture_filename` | string | `"ARCHITECTURE.md"` | Name of the root index doc in every KB. |
| `graph_filename` | string | `"graph.json"` | Name of the dependency graph file. |
| `components_dirname` | string | `"components"` | Name of the components subdirectory. |
| `default_verification_signal` | enum | `"openapi-diff"` | Default `verification_signal` value for new components. Values: `openapi-diff`, `exported-symbols-diff`, `route-inventory-diff`, `schema-diff`, `manual`. |
| `staleness_warning_days` | int | `30` | Components whose `last_verified_against_commit` corresponds to a commit older than this many days raise a warning during KB read. |
| `solution_context_max_age_days` | int | `90` | Solution-context leaves under `shared/{solution-context, ai-rules, operations}/` whose `last_captured` / `last_generated` / `last_reviewed` is older than this raise an **advisory** staleness flag in `detect-knowledge-base-drift` L4. Never fires `high` severity. Separate from `staleness_warning_days` because human-grounded leaves go stale on a calendar, not on a commit. |
| `lineage_max_drift_commits` | int | `25` | How many commits `<KB>/lineage/mainframe/` may drift behind its contributing repos' HEADs before `review-knowledge-base-package` sub-review 7.5 flags it. Counted in commits, not days — lineage is derived from source structure (COPY members, CALL targets, DD statements), so it goes stale on a change, not on a date. |

`[registry]`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `regenerate_on_install` | bool | `true` | Skill-manifest regeneration on installer runs. |
| `regenerate_on_skill_change` | bool | `true` | Watch SKILL.md frontmatter and regenerate when descriptions change. |
| `manifest_path` | path | `"{framework-root}/_config/skill-manifest.csv"` | Where the registry generator writes its output. |
| `extra_skill_roots` | array of path | `[]` | Additional add-on repos (or `.agents/skills` dirs) whose skills the registry generator should include alongside core. Each is scanned for `SKILL.md` files and tagged with an `origin` (from the add-on's `aide-addon.toml` `[addon].name`, else the dir name) in the generated `skills.csv`/`skills.json`. Also settable per-run via `build-registry.py --extra-skill-root PATH`. Core skills carry `origin = "core"`. |

### 2.2 Layer 2 — `framework.user.toml`

**Location:** `<framework-install>/framework.user.toml` (installer-owned, gitignored).
**Sharing:** personal, machine-local.
**Edit policy:** installer rewrites this file from remembered answers; for
durable pinned values use `customizations/<skill>.user.toml` or
`project.user.toml`.

**Schema:** any subset of `framework.toml`'s schema, plus a `[user]` section:

```toml
[user]
name = "Mike"                       # Used in agent salutations and audit fields.
communication_language = "English"  # Display language for prompts; distinct from output_language.
skill_level = "intermediate"        # One of: novice, intermediate, advanced. Some skills tune verbosity off this.
preferred_persona = "winston"       # Default agent persona when an agent has multiple flavors.
```

The split between `core.output_language` (artifact language) and
`user.communication_language` (chat language) is intentional: a German user
might want German prompts but produce English documentation for an English
codebase.

### 2.3 Layer 3 — `project.toml`

**Location:** `{project-root}/project.toml`.
**Sharing:** committed.
**Edit policy:** team-edited; this is the project's super-context.

This is the single richest layer. Sections:

```toml
[project]                  # identity, default flow, top-level metadata
[project.paths]            # output paths for stage packages and the KB
[project.glossary]         # references to glossary files + inline entries
[project.change_log]       # release-stream CHANGELOG.md (conditional)
[project.elicitation]      # answers to decision-table questions
[[project.repos]]          # one entry per repository in this project
[project.testing]          # optional QE/test-artifact target selection
```

#### `[project]`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | yes | Human-readable project name. Used in headings and audit logs. |
| `code` | string | yes | Stable short identifier. Lowercase, kebab-case, no spaces. Used as the merge key when this project appears in cross-project tooling. |
| `domain` | string | yes | One-line domain ("e-commerce checkout", "internal HR tooling"). Feeds glossary disambiguation and persona priming. |
| `description` | string | no | A few-sentence project summary. Free-form Markdown allowed. |
| `default_flow` | enum | no | One of `greenfield`, `brownfield`, `quick-dev`. Defaults to `framework.toml`'s `core.default_flow`. |
| `artifact_subdir` | string | no | (SoD only) Subdirectory name under each SoD stage's host repo where artifacts land. **Bare relative directory name** (no leading slash, no path tokens). Default `".framework-output"`. Distinct from `framework.toml.core.output_root`, which is a fully tokenized path used in legacy-mode resolution and remains unchanged. Per-stage override available via `[stages.<stage>].output`. |

#### `[project.paths]`

All paths may use the tokens in § 1.5. Relative paths resolve under
`{project-root}`.

| Field | Type | Default | Purpose |
|---|---|---|---|
| `requirements_package` | path | `"{project-root}/.framework-output/requirements"` | Where the requirements stage writes its package. |
| `design_package` | path | `"{project-root}/.framework-output/design"` | Where the design stage writes. |
| `implementation_package` | path | `"{project-root}/.framework-output/implementation"` | Where the implementation stage writes. |
| `quality_package` | path | `"{project-root}/.framework-output/quality"` | Where the quality stage writes its package. Restores a key defined in the archived QE work but dropped when those skills merged into the live tree; adding it with a default breaks no existing `project.toml`. |
| `knowledge_base_path` | path | _(no default)_ | Path to the KB repository. **Critical:** the KB lives in its own repo, so this path almost always points outside `{project-root}` (typically `"../knowledge-base"` for a sibling repo). Absolute paths are also valid. If unset, the KB-stage skills error early with a helpful message. |

#### `[project.testing]`

Optional table for project-wide test-artifact routing. Omit this table when
the project has no dedicated QE/test-automation repository; quality-stage
execution then falls back to the source/code repository exactly as earlier
framework versions did.

| Field | Type | Default | Purpose |
|---|---|---|---|
| `qe_repo` | string | _(unset)_ | Code of the `[[project.repos]]` entry that should receive QE-owned executable test artifacts by default. When set, `execute-quality-increments`, coverage drift checks, and failure triage prefer this repo for feature files, step definitions, runners, fixtures, reports, and marker lookup. When unset, they use the in-scope code repo fallback. |

#### `[project.glossary]`

| Field | Type | Purpose |
|---|---|---|
| `references` | array<path> | Files (Markdown, CSV, YAML) that contribute glossary entries. Loaded in order; later files override earlier on identical terms. |
| `[[project.glossary.entries]]` | array<table> | Inline entries. Each: `term` (string, required), `definition` (string, required), `aliases` (array<string>, optional), `domain_specific` (bool, default `false`). |

#### `[project.change_log]`

Conditional. Declares whether the project maintains a release-stream
CHANGELOG.md and how `create-pr` should write to it. Distinct from the
per-package CHANGE-TRACKER.md files (those are per-artifact, audience =
SDLC participants); both are rendered from the same canonical block at
`templates/blocks/shared/change-log.md` — what differs is scope, audience,
and granularity.

| Field | Type | Default | Purpose |
|---|---|---|---|
| `enabled` | bool | `true` for greenfield/brownfield projects; `false` for quick-dev | Master switch. When `false`, `create-pr` step 6 silently skips. |
| `path` | path | `"{project-root}/CHANGELOG.md"` | Where the changelog lives. |
| `versioning_strategy` | enum | `"semver"` | `semver` \| `calver` \| `none`. Drives the version-header convention. |
| `format` | enum | `"keep-a-changelog"` | `keep-a-changelog` \| `plain`. Plain uses the canonical block's section structure as-is; keep-a-changelog adopts the (Added / Changed / Deprecated / Removed / Fixed / Security) header style. |
| `parts_affected_vocabulary` | array<string> | `[]` | Project-level "Parts Affected" values populated into the canonical block's reference table. Different from per-artifact populations. |

The composition is `templates/compositions/project-change-log.yaml`,
which wraps the canonical block. `start-project` step 03 elicits this
table at bootstrap; `create-pr` step 6 reads it to decide whether to
append.

#### `[project.elicitation]`

A flat table of question-code → answer pairs, where question codes match the
codes used in the decision tables shipped with the framework (e.g.
`compliance_regime`, `team_size`, `user_facing`). This lets project-level
defaults pre-fill elicitation questions and lets the composition selector pick
the right YAML composition without re-asking.

```toml
[project.elicitation]
compliance_regime = "pci-dss"
team_size = "10-25"
user_facing = true
deployment_model = "saas-multi-tenant"
```

Unknown codes are tolerated (skills ignore answers they don't ask for) so
adding new questions to the framework doesn't break old `project.toml` files.

**Enumerated codes.** Most codes are free-form, but a few are validated because a
skill branches on them:

| Code | Type | Default | Purpose |
|---|---|---|---|
| `uses_test_case_increments` | bool | `false` | Opt into the TC-XXX per-test-case execution flow; gates the `test-case-increment` block and `review-quality-package` sub-review 6. |
| `records_testability_classification` | bool | `false` | Render the testability table as a visible block. The gate itself always runs. |
| `re_verification_gate` | enum | `"ask"` | How a reverse-engineering run is closed out. Values: `ask` \| `review` \| `automated`. See below. |

`re_verification_gate` controls the RE close-out gate that every
`reverse-engineer-*` skill reaches after extraction, per
`references/elicitation-patterns/re-verification-gate-selection.md`:

- `ask` (default) — put the choice to the user at close-out. The intended normal
  case: only the user knows whether this extraction is load-bearing enough to
  warrant human sign-off.
- `review` — pre-answer as the review path. `steps/verify.md` runs in
  `review-evidence` mode (mechanical checks, no verdict), then
  `review-reverse-engineering-package` runs nine sub-reviews with per-verdict human
  acceptance and writes the readiness verdict.
- `automated` — pre-answer as the automated path. `steps/verify.md` runs in
  `automated` mode and issues a `MECHANICAL: GO / NO-GO` scoped to machine-checkable
  (Tier M) checks; model-judgment (Tier J) checks are reported UNVERIFIED and never
  counted toward GO.

An **unattended** invocation (CI, scheduled KB refresh) left on `ask` fails fast with
an error naming this key. The AI does not pick a mode when nobody is present to
answer — the same convention `review-requirements-package` § Step 0 uses for a
missing `feature-id`.

#### `[[project.repos]]`

Array-of-table; one entry per repository participating in the project. This is
the merge-by-`code` array — order doesn't matter, the `code` is what binds
overrides.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `code` | string | yes | Stable short identifier (kebab-case). The merge key. |
| `name` | string | yes | Human-readable name for headings. |
| `path` | path | yes | Filesystem path to the repo. May be `"."` if it _is_ this project root. |
| `role` | enum | yes | One of: `api`, `ui`, `mobile`, `framework`, `database`, `infra`, `shared-library`, `tooling`, `test-automation`, `qe`. Drives which RE templates and KB component types apply. Use `test-automation` or `qe` for a dedicated QE repository referenced by `[project.testing].qe_repo`. |
| `type` | string | no | Free-form technology hint (`"node-typescript-nest"`, `"dotnet-8"`, `"react-vite"`). Feeds tech-detection short-circuits in the brownfield flow. |
| `primary` | bool | no | At most one repo may set `primary = true`; that repo is treated as the project's "home" for ambiguous operations. Defaults to the first entry if unset. |

### 2.4 Layer 4 — `project.user.toml`

**Location:** `{project-root}/project.user.toml` (gitignored).
**Sharing:** personal, machine-local.
**Edit policy:** edited freely by the user.

Same schema as `project.toml` but every field is optional. In addition,
`project.user.toml` accepts a `[user]` block for **project-scoped** personal
preferences. The block deep-merges field-by-field with `framework.user.toml`'s
`[user]` (which holds machine-global identity attributes like `name`,
`communication_language`, `skill_level`, `preferred_persona`):

| Field | Type | Purpose |
|---|---|---|
| `role` | enum | (SoD only) The role this user operates as on this project. Values: `BA`, `Architect`, `BSA`, `Developer`, `Tester`, `KB-Steward`. Compared against `[stages.<stage>].write_role` at every write boundary. Project-scoped because the same person may act as different roles on different projects. |
| `active_feature` | string | (only meaningful when `features.toml` exists) Which registered feature this person is currently working on. Must resolve to a declared `id` in `features.toml` — see § 2.8/§ 2.9. Project-scoped and personal for the identical reason `role` is: the same person works different features on different projects, and both fields are consulted at the same write boundaries. |

Typical contents are one or two sections — see `project.user.toml.example`.

### 2.5 Layer 5 — `customizations/<skill-name>.toml`

**Location:** `{project-root}/customizations/<skill-name>.toml`
(team, committed) and `{project-root}/customizations/<skill-name>.user.toml`
(personal, gitignored).
**Edit policy:** edited via the `customize` skill, but plain text is fine too.

Each file is namespaced to one skill. The merger loads it under
`[skills.<skill-name>]` in the merged config — so a skill reads its own
overrides from a known path (`config.skills["bmad-create-prd"].sections`)
without having to know which layer they came from.

This is the layer where `_suppress: true` is most useful — see
`customizations/example-skill.toml.example` for the canonical demonstration.

### 2.5.1 Hooks — `[[hooks]]` array-of-tables

Hooks enable skill chaining at skill boundaries — running one skill automatically
before or after another. They are declared in `customizations/<skill>.toml`
(Layer 5) under a `[[hooks]]` array-of-tables.

**Schema:**

```toml
# In customizations/<skill>.toml

[[hooks]]
code = "kb-check"                # Stable merge key (required, unique per skill)
event = "before"                 # "before" or "after" (required)
skill = "navigate-knowledge-base"  # Skill to invoke (required, must exist in registry)
priority = 100                   # 1-999, lower = runs first (default: 500)
optional = true                  # Prompt user before running if true (default: false)
prompt = "Check KB first?"       # User-facing prompt (required when optional=true)
condition = "project.paths.knowledge_base_path != ''"  # Skip when condition evaluates falsy

[[hooks]]
code = "suppress-default-hook"
_suppress = true                 # Remove hook from lower layer
```

**Field reference:**

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `code` | string | yes | — | Stable identifier for merge-by-key. Unique within the skill after layer merge. |
| `event` | enum | yes | — | `before` (fires before Step 0) or `after` (fires after final step, before `## Next skill`). |
| `skill` | string | yes | — | Skill name to invoke. Must resolve to a registered skill. |
| `priority` | int | no | 500 | Execution order: lower runs first. Valid range: 1–999. |
| `optional` | bool | no | `false` | When `true`, the user is prompted before the hook runs. |
| `prompt` | string | conditional | — | User-facing prompt text. Required when `optional = true`. |
| `condition` | string | no | — | An expression evaluated against the merged config. Hook is skipped when the expression evaluates falsy (empty string, `false`, `0`, missing path). |
| `_suppress` | bool | no | — | When `true`, removes a hook inherited from a lower layer. Entry must contain only `code` and `_suppress`. |

**Hook events (v1):**

| Event | When it fires | Context available |
|---|---|---|
| `before` | Before the skill's Step 0 | Merged config, skill inputs |
| `after` | After the skill's final step, before `## Next skill` handoff | Merged config, skill outputs |

**Execution sequence:**

1. Skill invoked
2. **Before-hooks** (sorted by `priority` ascending)
3. Steps 0..N
4. Gates from `workflow-graph.yaml` (if any)
5. **After-hooks** (sorted by `priority` ascending)
6. `## Next skill` handoff

**Announcement contract:** Before firing any hook, the skill announces:
`Running <event>-hook: <skill> (code: <code>)`. Skipped hooks (due to `condition`
evaluating falsy or user declining an `optional` hook) are also announced:
`Skipped <event>-hook: <skill> (code: <code>) — <reason>`.

**Circular dependency:** A skill **cannot** hook itself, and hook chains must be
acyclic. The loader rejects `A → B → A` patterns at config-merge time.

See `references/orientation/hook-runtime.md` for the full execution procedure
that skill implementations must follow.

### 2.6 The `[tools.<name>]` table — add-on tool resolution

Integration tooling (JIRA, Confluence, document conversion, …) ships as
**separate add-on repos**, not in core (see
`_docs/pluggable-tool-addons-proposal.md`). A `[tools.<name>]` table tells a
skill how to locate the CLI that backs it. The table is **project-scoped**: it
lives in `project.toml` (team declares intent) and may be overridden in
`project.user.toml` (personal, local-path only). It is **not** valid in the
`framework.*` layers — an add-on used on one project must not leak
machine-wide to others.

`<name>` is a free identifier chosen by the add-on (e.g. `atlassian`,
`sharepoint`). Multiple add-ons coexist as multiple tables; two Atlassian
add-ons targeting different sites are just `[tools.atlassian-prod]` and
`[tools.atlassian-sandbox]`.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `cli` | string | yes | The command probed on `PATH` first (e.g. `"atl"`, `"spt"`). If it resolves, it is used directly. |
| `install_root` | path | yes | Fallback location of the add-on's `tools/` dir, used when `cli` is not on `PATH`: the skill runs `cd <install_root> && npm run <run_script> --`. Path tokens allowed — typically `"{workspace}/aide-addons/tools"`. This is the field a user overrides in `project.user.toml` when their clone lives elsewhere. |
| `run_script` | string | no | npm script name for the fallback invocation. Defaults to `cli`. |
| `setup_doc` | path | no | Path to the add-on's setup guide, surfaced in the "add-on not installed" message. |

Because `[tools.<name>]` is a table, the deep-merge semantics (§1.3) let
`project.toml` declare the full block while `project.user.toml` overrides only
`install_root`; unmentioned keys inherit. Per-skill customizations (Layer 5)
**cannot** override `[tools.*]` — it is a project-layer concern only.

Resolution order a skill MUST follow: (1) probe `cli` on `PATH` → use directly;
(2) else expand `install_root` and run via `npm run <run_script> --`; (3) else
halt with a clear "add-on not installed" message pointing at `setup_doc`. If no
`[tools.<name>]` block matches at all, a skill packaged with an in-repo `tools/`
dir MAY fall back to the literal `cd tools && npm run <cli> --` form for
backward compatibility.

### 2.7 The add-on manifest — `aide-addon.toml`

Each add-on repo carries an `aide-addon.toml` at its root so the framework can
**enumerate** what an installed add-on provides (rather than infer it). It is
read by `build-registry.py`/`.js` to label the add-on's skills and by humans as
the add-on's contents contract.

**Location:** `<addon-root>/aide-addon.toml`.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `[addon].name` | string | yes | Short identifier used as the `origin` tag on this add-on's skills in the registry (e.g. `atlassian`). |
| `[addon].description` | string | no | One-line summary of the add-on. |
| `[addon].provides_skills` | array of string | no | Skill names the add-on contributes (documentation / sanity-check aid). |
| `[addon].registers_tools` | array of string | no | The `[tools.<name>]` identifiers a consuming project is expected to declare (see § 2.6). |

Example:

```toml
[addon]
name = "atlassian"
description = "JIRA + Confluence extraction via the Atlassian CLI"
provides_skills = ["jira-get", "jira-search", "jira-extract-requirements",
                   "confluence-fetch", "confluence-extract-package"]
registers_tools = ["atlassian"]
```

An add-on is **discovered** by the host's multi-root `.agents/skills/` scan when
opened as a workspace folder — the manifest does not drive discovery; it drives
enumeration and registry labelling.

### 2.8 The feature registry — `features.toml`

**Location:** `{project-root}/features.toml`. **Not one of the five layers above** —
it is project *data* (which features exist), not configuration (how the framework
should behave), so it is filed as a committed peer of `project.toml` rather than a
section within it. Filing it under `[project]` would have meant answering
layer-precedence questions it does not deserve (can `project.user.toml` override a
feature?) and would have made the registry conflict-prone in the same file that
holds rarely-edited settings like SoD policy and repo definitions.

**The presence of this file is the opt-in — no separate config flag.** Resolution in
every feature-aware skill is exactly two lines:

```
If features.toml exists  → resolve the active feature; write feature-scoped paths.
If it does not           → behave exactly as today.
```

**New projects get this file at bootstrap; existing projects never do.** A `fresh`
`start-project` run writes a comment-only `features.toml`, so feature-scoped paths
are the default for new adoption rather than something a team has to discover. A
project bootstrapped before that default, or one re-baselined onto an existing
artifact tree, is untouched: `start-project` skips the file in its `rebaseline` and
`extend-repos` modes, precisely because artifacts already on flat paths would be
left behind by a change that only moves the *next* write. Those projects opt in
through `select-feature` when their owner chooses to.

On an opted-in project each stage writes everything for a feature — the assembled
artifact and its working files — into one **stage feature directory**,
`{paths.<stage>_package}/<feature-id>/` in legacy mode, so `[project.paths]` (or the SoD
host repo) decides where all of it lands; nothing feature-scoped is written to
`{project-root}/docs/`. Projects that have not opted in keep the `docs/` working tree.

Artifacts already on disk in a flat (non-feature-scoped) layout, or in the pre-2.7.0
`docs/<feature-id>/` working tree, stay where they are and keep working. The
framework offers a migration for one feature's stage at the moment it is next worked (see
`references/ai-principles/feature-precondition.md`); it never sweeps a project, and
it never moves anything unasked.

**Shape** (see `features.toml.example` for the full annotated file):

```toml
[[features]]
id      = "alert-customer"
title   = "Alert customer when a refund is delayed"
created = 2026-08-11
ticket  = "ACME-1247"          # optional
repos   = ["api-billing"]      # optional; codes from [[project.repos]]
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | string | yes | The directory segment and the feature's stable identity. A lowercase kebab slug (`^[a-z0-9]+(-[a-z0-9]+)*$`), used verbatim as a directory name and as the `{feature-id}-` filename prefix. Proposed at mint time — from an existing `docs/` directory name when one matches this work, otherwise from the title — and unique across the registry. Independent of the title thereafter: once artifacts exist under it the `id` is frozen, so editing a `title` never renames a directory. There is no allocated number; see the note on ordinals below. |
| `title` | string | yes | Human-readable one-line description. Freely editable after minting — renaming the title does not rename the directory. |
| `created` | date | yes | ISO date the entry was minted. |
| `ticket` | string | no | External tracker reference (Jira key, ADO work item, etc.). |
| `repos` | array<string> | no | `[[project.repos]].code` values this feature is expected to touch. **Advisory, not authoritative** — each `create-*` skill's own run-time scope prompt (single-repo vs. cross-cutting) always wins when it diverges, because scope genuinely changes during discovery. When the run-time answer diverges from `repos`, the skill should offer to update this field rather than let the two drift apart silently. |

**Absence vs. emptiness.** No `features.toml` means the project is not
feature-scoped. An empty-but-present file (no `[[features]]` entries) is also legal
and means "feature-scoped, nothing minted yet" — the normal state immediately after
a `fresh` bootstrap or a manual opt-in, and it needs no scaffolding trick to
represent, unlike an empty array-of-tables declared inline in TOML. Validation
treats it as a warning-level observation, never an error, so a newly bootstrapped
project passes cleanly before its first feature exists.

**There is no ordinal prefix, and the reason is worth recording.** IDs were
originally specified with an allocated ordinal ahead of the slug, mirroring the
`ADR-NNNN-` naming convention, so that `ls` would show features in creation order. That was dropped
before the format was ever used in anger, because **nothing consumed the number.**
No skill, template or check read the ordinal and did anything with it: every
reference to it was machinery for maintaining it — allocation, uniqueness
validation, and a prefix-stripping rule for matching pre-opt-in directories. Its
only real consumer was `ls`.

`created` covers what the ordinal was really being read for, and more truthfully:
it records the date a feature was minted rather than its position in an allocation
sequence, and it survives gaps. It is not a strict replacement, and the difference
is worth stating plainly — an ordinal is a *total* order, whereas `created` is
day-granular, so two features minted on the same day tie, and the field is required
by convention rather than by any check (§ 4's rules 13-16 do not mention it).
Neither limit costs anything in practice: this file is append-only, so entry order
is itself a total order and a finer-grained one than any date, and nothing in the
framework sorts on `created` today.

Removing it also removed a manufactured hazard. Allocating `max + 1` invents a
shared counter, so two people minting a feature on separate branches at the same
time would compute the *same* next ordinal — a collision that had to be caught by
this file being committed, surfacing as a git merge conflict. A slug has no counter
to contend over: two people minting different features never collide at all, and
two people choosing the *same* slug is a genuine duplicate identity that rule 14
rejects. The safety mechanism was protecting the design from itself.

**What the prefix did buy, and how that is covered instead.** It made a feature
directory self-identifying — an ordinal-prefixed entry under `docs/` was unmistakably
a feature, where `docs/refunds/` could be any folder. The mitigation is to treat this file as
the only source of truth for what features exist: **enumerate features from the
registry, never by listing directories.** Nothing in the framework does otherwise
today.

The corollary is a convention rather than a validated rule: a slug should not
collide with a non-feature directory under `docs/`. Nothing here can enforce it,
because a registry file says nothing about what else lives in the tree, and the
consequence is a misleading migration offer — the legacy-tree check in
`references/ai-principles/feature-precondition.md` finds `docs/architecture/`
matching a feature named `architecture` and treats it as that feature's earlier
working tree. `select-feature` therefore *asks* at mint time — unconditionally, whenever
a proposed `id` matches a `docs/` directory no registered feature owns — because
that is the only moment both the proposed name and the directory listing are in
view, and because a match is equally consistent with the directory being this
feature's work (the desired outcome, offered for migration) or something unrelated (a
wrong migration offer). Nothing on disk distinguishes the two, so it cannot be inferred.
Since no validator can enforce the convention, that question is the only
defence, and it must not be conditional on the user raising it first.

The prefix also allowed two features to share a slug, distinguished only by number.
That is a loss worth taking: two `refunds` features separated only by their ordinals
are near identical at a glance and invite exactly the confusion feature scoping exists
to prevent, so being forced to name them apart is the better outcome.

**Deliberately not in the registry:** any `status` or `lifecycle` field. Feature
status/lifecycle tracking is out of scope for this change (see
`_docs/feature-id-minimal-plan.md` § 1) — the registry carries identity only.

### 2.9 The active feature — `[user].active_feature`

**Location:** `project.user.toml`, Layer 4 (gitignored, personal, machine-local) —
see the `active_feature` row in § 2.4's field table.

```toml
[user]
role           = "BA"
active_feature = "alert-customer"
```

**The registry is shared truth; the pointer is personal state.** Two people on the
same project routinely work different features at the same time; neither should be
able to change the other's working context by committing a file. Putting the
pointer in Layer 4 makes concurrent work the default rather than a special case.

**Resolution rule.** `active_feature` must resolve to a declared `id` in
`features.toml`. If it is set but unresolvable (typo, or the feature was never
committed), that is an **error**, not a silent fallback — inventing a directory for
an unregistered feature is exactly the drift this mechanism exists to prevent.

**Selected, never inferred.** `active_feature` is written only by `select-feature`
(directly, or as the closing step of minting a new feature). No other skill writes
it as a side effect of running.

**Every feature-scoped skill echoes the resolved feature before its first
read/write.** A `review-*` or coverage run against the wrong feature returns a
confident verdict about the wrong artifacts, which is as damaging as a misplaced
write and harder to notice — so the echo applies to read-side skills too, before
their first read rather than their first write.

### 2.10 Preset manifest — `preset.toml`

A **preset** is a reusable bundle of customization files installable as a unit.
Presets ship in add-on repos or local `presets/` directories and are registered
into a project via `presets.toml` (see § 2.9).

Each preset directory carries a `preset.toml` manifest describing its contents:

```
# In add-on repo or local presets/ directory:
<preset-root>/
├── preset.toml              # Manifest (this schema)
└── customizations/
    ├── create-requirements-package.toml
    └── review-implementation-package.toml
```

**Location:** `<preset-dir>/preset.toml`.

**Schema:**

```toml
[preset]
name = "enterprise-compliance"
description = "SOX/SOC2 compliance gates for regulated environments"
version = "1.0.0"
requires_aide_version = ">=2.0.0"
extends = []                         # Parent presets (applied first)
conflicts_with = ["minimal-docs"]    # Mutually exclusive presets
tags = ["compliance", "enterprise"]

[[preset.files]]
path = "customizations/create-requirements-package.toml"
skill = "create-requirements-package"
summary = "Adds compliance-callout block"

[[preset.files]]
path = "customizations/review-implementation-package.toml"
skill = "review-implementation-package"
summary = "Requires compliance sign-off gate"
```

**`[preset]` table:**

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `name` | string | yes | — | Unique identifier (kebab-case). Used as merge key in `presets.toml`. |
| `description` | string | no | — | One-line summary of what the preset does. |
| `version` | string | no | — | Semver version of this preset. |
| `requires_aide_version` | string | no | — | Version constraint (e.g. `>=2.0.0`). Loader warns on mismatch. |
| `extends` | array<string> | no | `[]` | Parent preset names. Parents are applied first, then this preset's files override. |
| `conflicts_with` | array<string> | no | `[]` | Mutually exclusive preset names. Loader rejects enabling both. |
| `tags` | array<string> | no | `[]` | Free-form tags for discoverability. |

**`[[preset.files]]` array-of-tables:**

| Field | Type | Required | Purpose |
|---|---|---|---|
| `path` | string | yes | Relative path from the preset directory to the customization file. |
| `skill` | string | yes | Skill name this file customizes. Must match a registered skill. |
| `summary` | string | no | One-line summary of what this file changes. |

The `[[preset.files]]` array is documentation — the loader actually globs
`<preset-dir>/customizations/*.toml` and infers skill names from filenames.
The manifest provides upfront discoverability so `manage-presets show` can
describe a preset without parsing every file.

### 2.11 Preset registry — `presets.toml`

The **preset registry** tracks which presets are installed and their enable
state. It lives at `{project-root}/presets.toml` (committed) with an optional
`{project-root}/presets.user.toml` overlay (personal, gitignored).

**Location:** `{project-root}/presets.toml`.

**Schema:**

```toml
# Installed presets, applied in order (earlier = lower precedence)
[[presets]]
name = "enterprise-compliance"
source = "{workspace}/aide-enterprise-addon/presets/enterprise-compliance"
enabled = true

[[presets]]
name = "team-conventions"
source = "{project-root}/presets/team-conventions"
enabled = false    # Disabled but remembered
```

**`[[presets]]` array-of-tables (merged by `name`):**

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `name` | string | yes | — | Merge key. Must match `[preset].name` from the target's `preset.toml`. |
| `source` | path | yes | — | Path to the preset directory (the directory containing `preset.toml`). Path tokens allowed. |
| `enabled` | bool | no | `true` | When `false`, the preset is remembered but not applied. |

**Merge order (updated for presets):**

```
framework.toml
  → framework.user.toml
    → project.toml
      → project.user.toml
        → [PRESETS: in order from presets.toml, enabled only]
          → customizations/<skill>.toml (project-local team)
            → customizations/<skill>.user.toml (project-local personal)
```

Presets are inserted between Layer 4 (`project.user.toml`) and Layer 5
(`customizations/<skill>.toml`). Within presets, earlier entries in the
`[[presets]]` array have lower precedence than later entries. Project-local
Layer 5 customizations always override preset values.

**Personal override (`presets.user.toml`):** A personal registry at
`{project-root}/presets.user.toml` can enable/disable presets for the
local user without editing the team-committed file. Same schema; entries
merge by `name` with personal winning.

**Discovering presets:** Use `manage-presets discover` to scan workspace
folders for `preset.toml` manifests that are not yet registered.

---

## 3. KB Schemas

A A.I.D.E. Knowledge Base is a **separate Git repository** owned by the
team, pointed at via `project.paths.knowledge_base_path`. It is read by every
flow (greenfield uses it for context, brownfield builds and updates it,
quick-dev consults the relevant components) and is structured as:

```
<knowledge-base-repo>/
├── ARCHITECTURE.md            # root index — see kb-architecture.template.md
├── graph.json                 # machine-readable component graph — see kb-graph.example.json
├── components/
│   ├── api-orders/
│   │   ├── order-checkout-flow.md       # frontmatter + body, see kb-component-frontmatter.example.yaml
│   │   ├── order-fulfillment.md
│   │   └── ...
│   ├── api-billing/
│   ├── web-portal/
│   └── ...
└── _meta/
    ├── conventions.md         # project-specific KB conventions
    └── change-log.md          # KB-level change tracker
```

The `components/<repo>/<component-id>.md` shape is intentionally a flat list
under each repo. Earlier designs prototyped a hierarchical
`components/<repo>/<feature-area>/<component-id>.md` layout; we discarded it
because feature areas are notoriously unstable (today's "checkout" is
tomorrow's "checkout / payment / invoicing" three-way split), whereas
`component-id` is stable by construction.

### 3.1 `ARCHITECTURE.md` — root index

Every KB carries an `ARCHITECTURE.md` at its root. Sections, in order:

1. **Solution Summary** — exactly three paragraphs: (a) what the system does in
   plain language, (b) the architectural style and the one-or-two decisions
   that shape everything else, (c) the boundaries and what's _explicitly_ out
   of scope.
2. **Repository Map** — table of every repo with `code`, `role`, `path` (in the
   wider source tree), `primary owner` (team or person), and `last_indexed_commit`.
3. **Component Catalog** — table of every component across all repos with
   `component_id`, `repo`, `type`, `description` (Use-when… form), and a link
   to the component's MD file.
4. **Capability Index** — inverted table: capability → list of `component_id`s.
   This is the lookup the orchestrator hits first when a story arrives ("which
   components implement 'process refunds'?"). Capability strings are free-form
   short verb-phrases.
5. **Dependency Graph** — a Mermaid C4-Level-2 container diagram (synthesized
   from `graph.json`) plus an explicit link to `graph.json` for tooling.
6. **Cross-Cutting Concerns** — pointers (not contents) to the auth, logging,
   error-handling, observability, and security docs. The actual contents live
   inside individual repos' Part B docs; the KB just indexes them.
7. **How To Load This KB** — instructions written for an AI agent: read order,
   when to consult `graph.json` vs. `ARCHITECTURE.md`, how to interpret
   `verification_signal` and `last_verified_against_commit`, and how to flag
   stale components.

The template lives at `kb-architecture.template.md` with `{{placeholders}}` the
build-knowledge-base-index skill fills in.

### 3.2 Per-component frontmatter

Every `components/<repo>/<component-id>.md` opens with YAML frontmatter using
this schema. All fields except `description`'s "Use-when…" wording and a few
optional arrays are required:

| Field | Type | Required | Purpose |
|---|---|---|---|
| `component_id` | string | yes | Stable, kebab-case, unique within the KB. Survives renames; never changes once published. |
| `repo` | string | yes | The `code` of one entry in `[[project.repos]]`. A component may span multiple repos; in that case this is the _primary_ repo and additional repos are listed in `paths` via per-glob repo prefixes. |
| `type` | enum | yes | One of: `api-feature`, `ui-feature`, `framework`, `mobile-feature`, `database-schema`, `shared-library`. Drives which RE template the build-component-doc skill applies. |
| `description` | string | yes | Single sentence in **"Use-when…" form**: starts literally with "Use when " and finishes a clause naming the trigger condition. This phrasing is non-negotiable because skill-routing matches against it, mirroring how Claude Code's skill descriptions work. |
| `triggers` | array<string> | yes | Short keyword phrases the orchestrator matches against the user's story to select this component. We chose a flat array over a grouped object (`{verbs: [...], nouns: [...]}`) because grouped triggers tempted authors to over-categorize trivial entries; a flat list is simpler and the matcher is just substring + lemma. |
| `paths` | array<glob> | yes | Globs identifying the source files that constitute this component. Globs may be repo-prefixed (`api-billing:src/refunds/**`) for components that genuinely span repos. |
| `depends_on` | array<string> | no | Other `component_id`s this component calls or imports. Mirrors edges of `kind: depends-on` or `kind: calls` in `graph.json`. |
| `consumed_by` | array<string> | no | Inverse of `depends_on` — `component_id`s that call this one. The build-knowledge-base-index skill keeps these two lists in sync; humans write whichever side is easier. |
| `data_entities` | array<string> | no | Domain entities this component reads/writes (`Order`, `Invoice`, `Refund`). Joins to the aggregated data dictionary. |
| `last_verified_against_commit` | string | yes | The full SHA of the source commit that backed the last verified extraction. Used to compute staleness. |
| `last_feature_id` | string | no | Identifier of the most recent feature/story whose implementation touched this component. Lets retrospectives jump straight to the docs they should refresh. |
| `source_doc` | path | yes | Path (relative to the source repo's root) to the canonical Part A or Part B doc this component is derived from. Empty string is _not_ permitted — every component has a source. |
| `verification_signal` | enum | yes | One of: `openapi-diff`, `exported-symbols-diff`, `route-inventory-diff`, `schema-diff`, `manual`. Tells the verify-knowledge-base skill which automated check to run. `manual` is allowed but flags the component for human review on every staleness sweep. |

The body of the component file (after the frontmatter) is free-form Markdown:
the build-component-doc skill writes a structured summary, but the schema
itself is just "any Markdown" — schema rigor lives in the frontmatter.

### 3.3 `graph.json`

Machine-readable companion to `ARCHITECTURE.md`. Used by tooling for
dependency-impact analysis and for rendering the Mermaid diagram in the root
doc.

```json
{
  "nodes": [
    { "id": "<component_id>", "repo": "<repo-code>", "type": "<component-type>", "doc": "components/<repo>/<id>.md" }
  ],
  "edges": [
    { "from": "<component_id>", "to": "<component_id>", "kind": "calls | consumes | depends-on | derives-from" }
  ]
}
```

**Node fields.** `id`, `repo`, `type` mirror the component frontmatter. `doc`
is a relative path from the KB root to the component's MD file — this gives
graph consumers a one-step jump to the human-readable doc.

**Edge `kind` values.**

| Kind | Meaning |
|---|---|
| `calls` | Synchronous request/response between services. |
| `consumes` | Asynchronous consumption (event, queue, file drop). |
| `depends-on` | Compile-time or runtime dependency that isn't a network call (shared library, framework). |
| `derives-from` | Data lineage edge — `to` is the source of truth, `from` materializes a view/projection of it. |

These four were chosen as the smallest set that distinguishes the four
operationally different blast radii: `calls` propagates synchronously,
`consumes` propagates with eventual consistency, `depends-on` propagates at
build/deploy time, and `derives-from` propagates only when the source data
changes.

`graph.json` is **derived**, not authoritative — `ARCHITECTURE.md` and the
component frontmatter are. The build-knowledge-base-index skill regenerates
`graph.json` whenever any component's frontmatter changes.

---

## 4. Validation rules summary

These are the validation checks the loader runs on a merged config / KB. Each
skill's contract assumes these have already passed.

**Config:**

1. `project.code` matches `^[a-z][a-z0-9-]*$`.
2. Every `[[project.repos]]` entry has a unique `code`.
3. At most one `[[project.repos]]` entry has `primary = true`.
4. `project.default_flow`, when set, is one of the three flow values.
5. Every path token used (`{project-root}` etc.) is one of the five defined in § 1.5.
6. `_suppress = true` only appears in array-of-table entries with a `code` or `id`.
6a. `[project.testing].qe_repo`, when set, must be a non-empty string matching one declared `[[project.repos]].code`. Warn when the referenced repo's `role` is not `test-automation` or `qe`.
6b. `[project.elicitation].re_verification_gate`, when set, must be one of `ask`, `review`, `automated`. An unrecognised value is an error, not a silent fallback to `ask` — a typo'd gate mode must not quietly downgrade the close-out to the AI's choice.

**Config — separation-of-duties (SoD):**

7. `[stages.<stage>]` entries are rejected if they have neither `dir` nor `colocate_with_source = true`, or if they have both. (One mode per stage; choosing neither leaves the stage in legacy mode and is fine — but partial SoD config is rejected.)
8. `[stages.<stage>].dir` (when set) is a relative path resolvable under `{project-root}`.
9. `[stages.<stage>].write_role` (when set) is one of: `BA`, `Architect`, `BSA`, `Developer`, `Tester`, `KB-Steward`.
10. `[user].role` (when set in `project.user.toml`) matches the same enum.
11. `[project].artifact_subdir` (when set) is a bare relative path: no leading slash, no path tokens.
12. **Artifact frontmatter (cross-cutting):** any artifact written under a `_cross-cutting/` directory MUST carry an `affects_repos` array in its YAML frontmatter, and every value MUST resolve to a known `[[project.repos]].code`. Single-repo artifacts MAY omit the field; if present, must have exactly one entry matching the artifact's `<repo-code>` directory.

**Config — feature registry (opt-in, `features.toml`):** these rules apply only
when `features.toml` exists; a project without one is not in feature-scoped mode
and none of the following fires.

13. Every `[[features]].id` matches `^[a-z0-9]+(-[a-z0-9]+)*$` — a lowercase kebab
    slug, used verbatim as a directory name.
14. Every `[[features]].id` is unique. Two features cannot share a directory, so a
    duplicate is an error rather than a warning; the fix is to differentiate the
    slug (`refunds-api` and `refunds-ui`, not two `refunds`).
15. `[user].active_feature` (when set in `project.user.toml`) resolves to a
    declared `[[features]].id`. Unset is valid (see § 2.9); set-but-unresolvable
    is an error, including when `features.toml` is present but empty.
16. Every `[[features]].repos` entry (when present) resolves to a known
    `[[project.repos]].code`.

**Config — hooks (per § 2.5.1):**

17. `[[hooks]].code` must be unique within the skill after all layers are merged.
18. `[[hooks]].skill` must resolve to a registered skill in the catalog.
19. `[[hooks]].event` must be one of `before` or `after`.
20. `[[hooks]].priority`, when specified, must be an integer in [1, 999].
21. `[[hooks]].prompt` is required when `optional = true`.
22. `[[hooks]].condition`, when specified, must be a syntactically valid expression (dot-path, comparison operator, value).
23. No circular hook dependencies: if skill A hooks skill B, skill B cannot hook skill A (directly or transitively).

**Config — presets (per § 2.10 and § 2.11):**

24. `[[presets]].name` must match the `[preset].name` in the referenced `preset.toml`.
25. `[[presets]].source` must be a resolvable path containing a valid `preset.toml`.
26. `[preset].conflicts_with` entries must not include any preset that is also enabled in `presets.toml`.
27. `[preset].extends` entries must resolve to registered presets and form an acyclic graph.
28. `[[preset.files]].skill` must match a registered skill name.

**KB:**

1. `component_id` is unique across the entire KB (not just within a repo).
2. `repo` matches a `code` in `project.toml`'s `[[project.repos]]`.
3. `description` starts with `Use when ` (case-sensitive).
4. Every `depends_on` / `consumed_by` reference resolves to a known `component_id`.
5. Every `last_verified_against_commit` is a full 40-char SHA, not a short hash.
6. `graph.json` has no edges referencing missing nodes; node count matches the
   number of `components/**/*.md` files.

---

## 5. Separation-of-duties (SoD) layout conventions

When a stage adopts SoD via `[stages.<stage>].dir` (directory mode) or
`colocate_with_source = true` (colocate mode), it follows one of two
subdirectory conventions for organizing artifacts. The asymmetry between
the two modes is forced by the geometry of the layouts, not stylistic.

### 5.1 Directory-mode geometry (used by requirements, design, testing)

A single host repo aggregates artifacts from many source repos. To
disambiguate which artifact belongs to which source repo, the layout uses
two subdirectory conventions:

```
<host-repo>/<artifact_subdir>/<stage>/
  ├── <repo-code-1>/                     ← single-repo features for that source repo
  │   ├── <feature-id>/                  ← one directory per feature
  │   │   └── <feature-id>-<stage>.md
  │   └── ...
  ├── <repo-code-2>/
  │   └── ...
  └── _cross-cutting/                    ← features spanning >1 source repo
      └── <feature-id>/
          └── <feature-id>-<stage>.md
```

- `<repo-code>/` directories hold artifacts for single-repo features. The
  directory name matches a `code` value from `[[project.repos]]`.
- `<feature-id>/` nests *inside* `<repo-code>/` and `_cross-cutting/`, never
  outside either. `<repo-code>/` is the boundary `[stages.<stage>].write_role`
  enforces, and a role check must keep corresponding to a subtree, so the
  feature directory cannot straddle it. The segment is conditional on
  `features.toml` existing; see
  `references/ai-principles/feature-precondition.md`.
- `_cross-cutting/` holds artifacts for features that span multiple source
  repos. Every artifact under `_cross-cutting/` MUST carry an `affects_repos`
  array in its YAML frontmatter listing the affected `[[project.repos]].code`
  values.

### 5.2 Colocate-mode geometry (used by planning, execution)

Each source repo holds only its own slice of every feature. The repo path
itself is the discriminator — no further subdirectory scoping is needed:

```
<source-repo>/<artifact_subdir>/<stage>/
  ├── <feature-id-A>/                    ← single-repo feature
  │   ├── INC-001.md
  │   └── increment-status.md
  └── <feature-id-B>/                    ← cross-cutting feature, this repo's slice
      ├── INC-001.md
      └── increment-status.md
```

Colocate-mode stages have **no `_cross-cutting/` directory** — there is no
host repo a cross-cutting artifact could live in "outside" any source repo.
A cross-cutting feature appears in each affected source repo's directory,
scoped to that repo's slice of the work.

### 5.3 Why the layouts differ

Dir-mode aggregates many source repos' artifacts into one host repo, so it
needs `<repo-code>/` and `_cross-cutting/` to disambiguate within that host.
Colocate-mode distributes artifacts into the source repos themselves, so the
source-repo path *is* the discriminator and no further subdirectory is
needed. Path-globbing skills must check the stage's mode before assuming
layout.

---

## 6. Open questions deferred to later tasks

- **Multi-project KBs.** A single KB serving multiple `project.toml`s is
  desirable for monorepo setups; the current schema assumes 1-KB-per-project.
  The skeleton task should add a `project.toml` field for "I am one of several
  projects sharing this KB" and a `_meta/projects.toml` in the KB to enumerate
  them. Out of scope for this design pass.
- **Migration from BMAD `config.toml`.** The `bmad-customize` skill knows the
  shape of the old custom config. A migration helper that reads the old layout
  and writes the new four-layer split is on the roadmap but not designed here.
- **Schema versioning.** Every file should carry a `schema_version` field at
  the top so the loader can detect old layouts. Deferred until we have at
  least one migration to reason about.
