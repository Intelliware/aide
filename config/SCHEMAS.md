# theframework — Configuration & Knowledge-Base Schemas

> **Status:** Design draft. The artifacts in this directory are schemas, templates,
> and `.example` files. They are NOT live runtime configuration. The skeleton task
> will lift them into their canonical locations and create real `framework.toml` /
> `project.toml` instances.

## Deliverables in this directory

| File | One-line description |
|---|---|
| `SCHEMAS.md` | This document — full design rationale for the four-layer config model and KB schemas. |
| `framework.toml.example` | Annotated example of the installer-managed shipped defaults (read-only by users). |
| `project.toml.example` | Annotated example of the committed project super-context for a 3-repo setup with a sibling KB repo. |
| `project.user.toml.example` | Annotated example of the gitignored personal project preferences layer. |
| `customizations/example-skill.toml.example` | Per-skill team override example demonstrating deep-merge, array-by-key merge, and `_suppress: true`. |
| `kb-architecture.template.md` | The root `ARCHITECTURE.md` template every KB carries; uses `{{placeholders}}` filled by the build-knowledge-base-index skill. |
| `kb-component-frontmatter.example.yaml` | Realistic component frontmatter for an `order-checkout-flow` component spanning api-orders + api-billing. |
| `kb-graph.example.json` | `graph.json` example with 5 nodes and 6 edges across multiple repos and edge `kind` values. |

There is no `framework.user.toml.example` file in this directory by design — its
shape is identical to a subset of `framework.toml` and it is documented inline
in this schema doc (§ Layer 2). Producing a misleading "personal answers"
example before the installer is built would invite confusion. The skeleton task
will generate it from the installer's prompt set.

---

## 1. The Four-Layer Config Model

### 1.1 Concept

theframework borrows BMAD's two-axis configuration model and extends it with a
**suppression marker**. The two axes are:

- **Scope axis:** _global_ (per-installation, applies to everything the user
  does with theframework on this machine) vs. _project_ (this repository / this
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

**Key design rule:** every layer is _optional_. theframework runs from
`framework.toml` alone if the user has done nothing else. Each higher layer
supplies _refinements_, never required values.

### 1.2 Why this shape

BMAD's split between installer-managed (`config.toml`, `config.user.toml`) and
custom (`custom/config.toml`, `custom/config.user.toml`) works well in
practice: it lets the installer regenerate its own files freely without
clobbering user intent, because user intent lives in a sibling tree the
installer never touches. theframework keeps that separation but renames the
layers along the scope+sharing axes because:

1. theframework's "project" notion is first-class (greenfield/brownfield/quick-dev
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
override a value or add an entry. theframework adds:

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

Relative paths (no leading `/` or `~`) are resolved relative to `{project-root}`
when they appear in `project.toml` / `project.user.toml` / `customizations/`,
and relative to `{framework-root}` when they appear in
`framework.toml` / `framework.user.toml`.

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

`[knowledge_base]`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `default_path` | path | `"{project-root}/../knowledge-base"` | Default KB location relative to the project root. Most projects override this in `project.toml.knowledge_base_path`. |
| `architecture_filename` | string | `"ARCHITECTURE.md"` | Name of the root index doc in every KB. |
| `graph_filename` | string | `"graph.json"` | Name of the dependency graph file. |
| `components_dirname` | string | `"components"` | Name of the components subdirectory. |
| `default_verification_signal` | enum | `"openapi-diff"` | Default `verification_signal` value for new components. Values: `openapi-diff`, `exported-symbols-diff`, `route-inventory-diff`, `schema-diff`, `manual`. |
| `staleness_warning_days` | int | `30` | Components whose `last_verified_against_commit` corresponds to a commit older than this many days raise a warning during KB read. |

`[registry]`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `regenerate_on_install` | bool | `true` | Skill-manifest regeneration on installer runs. |
| `regenerate_on_skill_change` | bool | `true` | Watch SKILL.md frontmatter and regenerate when descriptions change. |
| `manifest_path` | path | `"{framework-root}/_config/skill-manifest.csv"` | Where the registry generator writes its output. |

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
[project.elicitation]      # answers to decision-table questions
[[project.repos]]          # one entry per repository in this project
```

#### `[project]`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | yes | Human-readable project name. Used in headings and audit logs. |
| `code` | string | yes | Stable short identifier. Lowercase, kebab-case, no spaces. Used as the merge key when this project appears in cross-project tooling. |
| `domain` | string | yes | One-line domain ("e-commerce checkout", "internal HR tooling"). Feeds glossary disambiguation and persona priming. |
| `description` | string | no | A few-sentence project summary. Free-form Markdown allowed. |
| `default_flow` | enum | no | One of `greenfield`, `brownfield`, `quick-dev`. Defaults to `framework.toml`'s `core.default_flow`. |

#### `[project.paths]`

All paths may use the tokens in § 1.5. Relative paths resolve under
`{project-root}`.

| Field | Type | Default | Purpose |
|---|---|---|---|
| `requirements_package` | path | `"{project-root}/.framework-output/requirements"` | Where the requirements stage writes its package. |
| `design_package` | path | `"{project-root}/.framework-output/design"` | Where the design stage writes. |
| `implementation_package` | path | `"{project-root}/.framework-output/implementation"` | Where the implementation stage writes. |
| `knowledge_base_path` | path | _(no default)_ | Path to the KB repository. **Critical:** the KB lives in its own repo, so this path almost always points outside `{project-root}` (typically `"../knowledge-base"` for a sibling repo). Absolute paths are also valid. If unset, the KB-stage skills error early with a helpful message. |

#### `[project.glossary]`

| Field | Type | Purpose |
|---|---|---|
| `references` | array<path> | Files (Markdown, CSV, YAML) that contribute glossary entries. Loaded in order; later files override earlier on identical terms. |
| `[[project.glossary.entries]]` | array<table> | Inline entries. Each: `term` (string, required), `definition` (string, required), `aliases` (array<string>, optional), `domain_specific` (bool, default `false`). |

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

#### `[[project.repos]]`

Array-of-table; one entry per repository participating in the project. This is
the merge-by-`code` array — order doesn't matter, the `code` is what binds
overrides.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `code` | string | yes | Stable short identifier (kebab-case). The merge key. |
| `name` | string | yes | Human-readable name for headings. |
| `path` | path | yes | Filesystem path to the repo. May be `"."` if it _is_ this project root. |
| `role` | enum | yes | One of: `api`, `ui`, `mobile`, `framework`, `database`, `infra`, `shared-library`, `tooling`. Drives which RE templates and KB component types apply. |
| `type` | string | no | Free-form technology hint (`"node-typescript-nest"`, `"dotnet-8"`, `"react-vite"`). Feeds tech-detection short-circuits in the brownfield flow. |
| `primary` | bool | no | At most one repo may set `primary = true`; that repo is treated as the project's "home" for ambiguous operations. Defaults to the first entry if unset. |

### 2.4 Layer 4 — `project.user.toml`

**Location:** `{project-root}/project.user.toml` (gitignored).
**Sharing:** personal, machine-local.
**Edit policy:** edited freely by the user.

Same schema as `project.toml` but every field is optional. Typical contents are
just one or two sections — see `project.user.toml.example`.

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

---

## 3. KB Schemas

A theframework Knowledge Base is a **separate Git repository** owned by the
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
5. Every path token used (`{project-root}` etc.) is one of the four defined in § 1.5.
6. `_suppress = true` only appears in array-of-table entries with a `code` or `id`.

**KB:**

1. `component_id` is unique across the entire KB (not just within a repo).
2. `repo` matches a `code` in `project.toml`'s `[[project.repos]]`.
3. `description` starts with `Use when ` (case-sensitive).
4. Every `depends_on` / `consumed_by` reference resolves to a known `component_id`.
5. Every `last_verified_against_commit` is a full 40-char SHA, not a short hash.
6. `graph.json` has no edges referencing missing nodes; node count matches the
   number of `components/**/*.md` files.

---

## 5. Open questions deferred to later tasks

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
