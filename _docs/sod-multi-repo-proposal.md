# Separation-of-Duties Multi-Repo Capability — Proposal

| Field | Value |
|---|---|
| Status | Research / design proposal — revised after adversarial review |
| Branch | `mm/add-ack-cobol-repo` (integration version 1.4.5) |
| Date | 2026-04-30 (revised) |
| Foundation | Builds on `mm/add-cobol` (1.3.0) + `mm/add-ack` (acknowledgement-restoration); does not depend on `mm/add-adverserial` |
| Backward compatibility | **Hard requirement.** Existing single-repo `project.toml` projects must keep working without any change. |

---

## 0. TL;DR

- **Requirements, design, and testing** stages each get their own role-restricted repo (BA-repo, architect-repo, tester-repo) — the dir-based pattern. Tester stage is shown for completeness but skills land in Step 7.
- **Planning and execution** stages **colocate with source-code repos**. Plan and increment artifacts live in `<source-repo>/.framework-output/implementation/<feature-id>/`.
- **Cross-cutting features** are handled by **per-source-repo skill invocation**. The planning and execution skills add a Step 0 — *Scope the target source repo* — that reads the upstream artifact's path and (when needed) `affects_repos` frontmatter to either auto-resolve (single-repo features) or ask the user to pick one repo (cross-cutting features). The user runs the skill once per affected repo.
- **The KB** stays where it is — sibling repo, read-mostly. Pointed at via `[project.paths].knowledge_base_path` exactly as today; no new KB config surface.
- **Backward compatibility is per-stage.** A stage adopts SoD only when its `[stages.<stage>]` entry declares `dir` or `colocate_with_source`. Stages without those fields continue resolving via `[project.paths]` exactly as today.

---

## 1. Goals

Support a separation-of-duties (SoD) workflow where each SDLC role writes to a dedicated repo (or, for planning/execution, to the relevant source-code repo), with all repos visible (read access) to every participant in a VSCode multi-root workspace. Write access is enforced per-repo by role.

| Role | Write zone | Reads from |
|---|---|---|
| BA | `ba-repo` | All other repos |
| Architect / BSA | `architect-repo` | All other repos |
| Developer | All source-code repos (`api-orders`, `ui-checkout`, …) — both code AND planning/execution artifacts | All other repos |
| Tester | `tester-repo` *(Step 7)* | All other repos |
| KB-Steward | `knowledge-base` | All other repos |

Enforcement is layered:

1. **Fast feedback (framework's job).** The skill layer compares `[user].role` against `[stages.<stage>].write_role` at every write boundary and refuses mismatched writes with a clear error before the work reaches commit.
2. **Hard guardrail (platform's job).** Each role-restricted repo on GitHub has push access scoped to its authorized role/team. Unauthorized push attempts are rejected by the server. Out of scope for framework configuration but assumed by the SoD model.
3. **Audit (deferred — Step 8).** Optional persistent acknowledgement records via the `record_acknowledgements` flag. Off by default.

---

## 2. Key prior findings (foundation for the proposal)

These are validated against the current state of `mm/add-ack-cobol-repo`:

1. **AIDE is path-agnostic by construction.** Skills resolve all I/O through `project.toml` path tokens. Tokens can resolve into any directory, including a sibling repo or a source-code repo. The KB-as-sibling-repo pattern is the existing proof point.
2. **The acknowledgement layer is already consumer-side.** `mm/add-ack` makes verification a chat-based summary by the *consumer* before downstream skills proceed. No producer-side ack file is written. This is exactly the shape SoD needs — no relocation required.
3. **`[[project.repos]]` already exists** with stable `code` join key. The new design reuses it as the join key for SoD path resolution; no fields are added to it.
4. **No role concept exists yet.** `[[project.repos]].role` is a tech-stack hint (`api`, `ui`, …), not RBAC. We introduce `write_role` as a new, orthogonal concept — added as a new field on the existing `[stages.<stage>]` table.
5. **No tester stage exists yet.** Adding one is sequenced as a separate, deferred step (Step 7).
6. **Cross-cutting plans don't need a coordination repo.** Per-repo skill invocation pushes the orchestration to the human at the planning boundary, where it naturally belongs.

---

## 3. Workspace layout

```
~/Dev/                                                   ← parent directory holding all repos
├── checkout-workspace/                                  ← {project-root}: workspace folder
│   ├── project.toml                                     ← schema lives here
│   ├── project.user.toml                                ← gitignored, [user].role
│   └── checkout.code-workspace                          ← VSCode multi-root workspace file
│
├── ba-repo/                                             ← write_role: BA (requirements artifacts)
├── architect-repo/                                      ← write_role: Architect (design artifacts)
├── tester-repo/                                         ← write_role: Tester (test plans) — Step 7
├── knowledge-base-repo/                                 ← KB sibling repo
│
├── api-orders/                                          ← write_role: Developer (code + planning + execution artifacts)
└── ui-checkout/                                         ← write_role: Developer (code + planning + execution artifacts)
```

`{project-root}` = the directory containing `project.toml` (existing framework convention, `config/SCHEMAS.md:135-145`, unchanged). The framework loader walks up from `cwd` until it finds `project.toml`. **All repos are siblings of the workspace folder**, addressed via the `{project-root}/../<repo>` path token. The workspace folder itself is just a holder for `project.toml`, `project.user.toml`, and the `.code-workspace` file — it never contains source code or stage artifacts.

**No `developer-repo`.** Planning and execution artifacts live inside the source-code repos they describe.

---

## 4. The schema

The proposal **adds new fields to existing tables**; it does not introduce new top-level tables. SoD fields layer onto the framework's existing `[stages.<stage>]` subtables (which already hold `enabled`, `default_composition`, `required_artifacts`, and a nested `elicitation` table per `framework.toml.example`). The new fields are additive — there are no name collisions with existing fields.

### `project.toml` (committed)

```toml
# project.toml — at the workspace root.
# {project-root} = directory containing this file.
# All repos are siblings of the workspace folder; addressed via {project-root}/../<repo>.

[project]
name            = "Checkout Modernization"
artifact_subdir = ".framework-output"   # subdirectory name under each SoD stage's host repo

[stages.requirements]
dir        = "../ba-repo"
write_role = "BA"

[stages.design]
dir        = "../architect-repo"
write_role = "Architect"

[stages.planning]
colocate_with_source = true
write_role           = "Developer"

[stages.execution]
colocate_with_source = true
write_role           = "Developer"

[stages.testing]
dir        = "../tester-repo"
write_role = "Tester"
# (Step 7 — tester skills deferred; this entry shown for completeness.)

[[project.repos]]
code = "api-orders"
path = "{project-root}/../api-orders"
role = "api"
type = "node-typescript-nest"

[[project.repos]]
code = "ui-checkout"
path = "{project-root}/../ui-checkout"
role = "ui"
type = "react-typescript"
```

The KB pointer remains `[project.paths].knowledge_base_path`, unchanged from today's schema. No new KB config surface is introduced.

### `project.user.toml` (gitignored)

```toml
[user]
role = "Developer"   # one of: BA | Architect | BSA | Developer | Tester | KB-Steward
```

Per `SCHEMAS.md § 2.4` (revised), `project.user.toml` accepts a `[user]` block for project-scoped personal preferences. The block deep-merges field-by-field with `framework.user.toml.[user]` (which holds machine-global identity fields like `name`, `communication_language`, `skill_level`, `preferred_persona`). Project-level `role` lives here because the same person may act as different roles on different projects.

### Layer 5 customizations and SoD policy

SoD policy fields (`[stages.<stage>].dir`, `colocate_with_source`, `write_role`, `[user].role`, `[project].artifact_subdir`) live in **Layers 1-4 only**. Per-skill customizations at `customizations/<skill>.toml` (Layer 5) cannot override these fields. This prevents per-skill escape hatches in the role policy. Layer 5 customizations continue to apply normally for skill-internal behavior (composition pinning, elicitation depth, artifact suppression via `_suppress: true`, custom blocks).

### Loader validation

The config loader rejects `[stages.<stage>]` entries that have neither `dir` nor `colocate_with_source = true`, or that have both. Loader emits a clear error. Full validator rule list in § 12 Step 1.

---

## 5. Section-by-section reference

### `[project]`

| Field | Purpose | Default |
|---|---|---|
| `name` | Human-readable project name. | required |
| `artifact_subdir` | Subdirectory name under each SoD stage's host repo where artifacts land. Single source of truth for the `.framework-output` convention in SoD mode. **Not a path** — bare relative directory name only (no leading slash, no path tokens). | `".framework-output"` |

`artifact_subdir` is distinct from `framework.toml.core.output_root`, which is a fully tokenized path used in legacy-mode resolution and remains unchanged.

### `[stages.<stage>]` — two SoD modes plus legacy fallback

The framework already ships `[stages.<stage>]` subtables (e.g. `[stages.requirements]`, `[stages.design]`) holding fields like `enabled`, `default_composition`, `required_artifacts`, and a nested `elicitation` table. The proposal **adds** SoD policy fields to those existing subtables — additively, with no name collision.

A stage adopts SoD when its entry declares one of the following resolution modes; otherwise it falls back to legacy resolution via `[project.paths]`.

| Mode | Indicated by | Output path |
|---|---|---|
| Directory mode | `dir = "<repo-name>"` | `{project-root}/<dir>/<artifact_subdir>/<stage>/<repo-code>/<feature-id>-<stage>.md` |
| Colocate mode | `colocate_with_source = true` | `<source-repo-path>/<artifact_subdir>/<stage>/<feature-id>/<artifact>` (where `<source-repo-path>` resolves via `[[project.repos]][code=<repo-code>].path`) |
| Legacy mode | (neither field set) | Resolves via `[project.paths].<stage>_package` exactly as today. |

New SoD fields on `[stages.<stage>]`:

| Field | Purpose | Required? |
|---|---|---|
| `dir` | Host repo for dir-mode stages. Must not be set together with `colocate_with_source`. | One of `dir` or `colocate_with_source` is required for SoD; both unset means legacy mode for this stage. |
| `colocate_with_source` | When `true`, artifacts live inside the relevant source repo. Must not be set together with `dir`. | (see above) |
| `write_role` | The role allowed to write to this stage's artifacts. Compared against `[user].role`. | Required when SoD enforcement is wanted; optional otherwise. |
| `output` | (Optional) per-stage override of `artifact_subdir`. | No |

These fields are **additive** to the existing `[stages.<stage>]` schema; they do not collide with `enabled`, `default_composition`, `required_artifacts`, or the nested `elicitation` table.

### `[[project.repos]]` (unchanged)

Same array, same fields as today. Describes source-code repos. **No new fields added.**

| Field | Purpose | Notes |
|---|---|---|
| `code` | Stable identifier; subdirectory name under each dir-mode stage's output (e.g. `requirements/api-orders/`); also the join key for colocate-mode resolution. | join key |
| `path` | Filesystem location, expressible with `{project-root}` token. | |
| `role` | Tech-stack hint enum (`api`, `ui`, `mobile`, `framework`, `database`, `infra`, `shared-library`, `tooling`). | NOT an RBAC role |
| `type` | (Optional) finer-grained tech identifier. | |
| `primary` | (Optional) `true` for the canonical repo when an operation is ambiguous. Used as the **suggested default** in Step 0 prompts when an upstream artifact lacks `affects_repos` (legacy-fallback case only). Not used as a default for cross-cutting prompts — the user must pick deliberately there. | |

### `[user]` in `project.user.toml`

| Field | Purpose |
|---|---|
| `role` | The role this user operates as on this project. Compared against `[stages.<stage>].write_role` at every write boundary. |

Project-scoped because the same person may act as different roles on different projects. Deep-merges with `framework.user.toml.[user]` per the standard merge rules.

---

## 6. Path-resolution rules

These rules describe how the agent (the runtime executor of skills) resolves paths and applies permission checks. There is no separate "resolver" code module — the agent reads `project.toml` directly and follows the rules below as documented in `SCHEMAS.md` and in each affected skill's `SKILL.md` / step files.

Path resolution is **per-stage**. For each stage and feature, the agent inspects the merged `[stages.<stage>]` record and chooses one of three modes:

- **Directory mode.** If `dir` is set, the path is
  `{project-root}/<stages.<stage>.dir>/<artifact_subdir>/<stage>/<repo-code>/<feature-id>-<stage>.md`.

- **Colocate mode.** If `colocate_with_source = true`, the path is
  `<source-repo-path>/<artifact_subdir>/<stage>/<feature-id>/`,
  where `<source-repo-path>` resolves via `[[project.repos]][code=<repo-code>].path`. The `<repo-code>` is implicit in the repo path itself, so it does not appear as a separate path segment.

- **Legacy mode.** If neither `dir` nor `colocate_with_source` is set, the resolver falls back to `[project.paths].<stage>_package` exactly as today. Resolution for stages not enumerated in `[project.paths]` (e.g. a future testing stage) is deferred until those skills are designed (Step 7).

**Permission check** (orthogonal to mode). At every write boundary, the agent looks up `[stages.<stage>].write_role`. If set, the agent compares it against `[user].role` from `project.user.toml`. On mismatch, the agent refuses the write, surfaces the role mismatch as an error, and exits cleanly (no partial state). If either field is unset, the agent skips the check. When SoD fields are configured but `[user].role` is missing, the agent emits a one-time startup warning: *"SoD configured without `[user].role` — write protections inactive."*

---

## 7. Directory layout (worked example)

### Why the layouts differ between modes

Dir-mode stages aggregate multiple source repos' artifacts under one host repo, so they need subdirectory scoping (`<repo-code>/` for single-repo features, `_cross-cutting/` for multi-repo features) to disambiguate. Colocate-mode stages distribute artifacts into the source repos themselves, so the source-repo path *is* the discriminator — no further subdirectory is needed, and there is no place a `_cross-cutting/` directory could live (which source repo would hold it?). The asymmetry below is forced by this geometry, not a stylistic choice. Path-globbing skills must check the stage's mode before assuming layout.

### Dir-mode stages: requirements / design / testing *(testing — Step 7)*

```
ba-repo/
└── .framework-output/
    └── requirements/
        ├── api-orders/                       ← matches [[project.repos]].code
        │   ├── ORD-042-bulk-order-import.md
        │   └── ORD-051-payment-retry.md
        ├── ui-checkout/
        │   └── UI-019-cart-redesign.md
        └── _cross-cutting/                   ← features spanning >1 source repo
            └── CHK-001-checkout-flow.md
```

`architect-repo/.framework-output/design/` follows the same shape. `tester-repo/.framework-output/testing/` will follow the same shape once tester skills land in Step 7.

### Colocate-mode stages: planning / execution

```
api-orders/
├── src/...                                   ← code
└── .framework-output/
    └── implementation/
        ├── ORD-042/                          ← single-repo feature
        │   ├── INC-001.md
        │   ├── INC-002.md
        │   ├── increment-status.md
        │   └── bugs-and-issues-log.md
        └── CHK-001/                          ← cross-cutting feature, api-orders SLICE
            ├── INC-001.md
            └── increment-status.md

ui-checkout/
├── src/...
└── .framework-output/
    └── implementation/
        ├── UI-019/                           ← single-repo feature
        │   └── INC-001.md
        └── CHK-001/                          ← same feature ID, ui-checkout SLICE
            ├── INC-001.md
            └── increment-status.md
```

**Important:** colocate-mode stages have **no `_cross-cutting/` directory** (see geometry rationale above). Cross-cutting features appear in each affected source repo's directory, scoped to that repo.

---

## 8. Following a feature end-to-end

### Single-repo feature (ORD-042 in api-orders)

| Stage | Path | Written by | Skill behavior |
|---|---|---|---|
| Requirements | `ba-repo/.framework-output/requirements/api-orders/ORD-042-*.md` | BA | normal |
| Design | `architect-repo/.framework-output/design/api-orders/ORD-042-*.md` | Architect | normal |
| Planning | `api-orders/.framework-output/implementation/ORD-042/INC-001.md` | Developer | Step 0 auto-resolves: path signal indicates single-repo → no prompt |
| Execution (artifacts) | `api-orders/.framework-output/implementation/ORD-042/increment-status.md` | Developer | normal |
| Execution (code) | `api-orders/src/...` | Developer | normal git commit |
| Testing *(Step 7)* | `tester-repo/.framework-output/testing/api-orders/ORD-042/test-plan.md` | Tester | normal |
| KB update | `knowledge-base/components/api-orders/...` | KB-Steward (via execution) | normal |

### Cross-cutting feature (CHK-001 spanning api-orders + ui-checkout)

| Stage | Path | Written by | Skill behavior |
|---|---|---|---|
| Requirements | `ba-repo/.framework-output/requirements/_cross-cutting/CHK-001-*.md` | BA | one document; frontmatter lists `affects_repos: [api-orders, ui-checkout]` |
| Design | `architect-repo/.framework-output/design/_cross-cutting/CHK-001-*.md` | Architect | one document; same `affects_repos` |
| Planning (1st invocation) | `api-orders/.framework-output/implementation/CHK-001/INC-001.md` | Developer | Step 0 prompts: "scope?" → user picks `api-orders` |
| Planning (2nd invocation) | `ui-checkout/.framework-output/implementation/CHK-001/INC-001.md` | Developer | Step 0 prompts again → user picks `ui-checkout` |
| Execution (artifacts) | per-repo `increment-status.md` updated independently | Developer | each invocation scoped to one repo |
| Execution (code) | commits in api-orders + ui-checkout per their normal git flow | Developer | |
| Testing *(Step 7)* | `tester-repo/.framework-output/testing/_cross-cutting/CHK-001/test-plan.md` | Tester | one document; integration tests cover both repos |
| KB update | `knowledge-base/components/{api-orders,ui-checkout}/...` | KB-Steward (via execution) | drift detection picks up changes in both repos |

> **Note on cross-repo increment ordering.** When one repo's increment depends on another's landing first (e.g., the UI cart-redesign in CHK-001 may need the API payment-retry contract to exist before its own work proceeds), **sequencing is the human's responsibility in MVP**. Automated dependency tracking (`depends_on: <repo-code>/<feature-id>/<increment-id>`) is deferred — see § 14.

---

## 9. Cross-cutting orchestration model

The framework distinguishes *understanding* stages (where the cross-repo nature must be expressed in one artifact) from *action* stages (where work is naturally repo-scoped):

| Stage | Cross-cutting representation |
|---|---|
| Requirements | One artifact under `_cross-cutting/`; declares `affects_repos` in frontmatter |
| Design | One artifact under `_cross-cutting/`; declares `affects_repos` in frontmatter |
| Planning | **Per-repo invocation.** The skill prompts the user at Step 0 to pick a target repo from `affects_repos`. |
| Execution | **Per-repo invocation.** Same Step 0 prompt. Code commits land in the chosen source repo. |
| Testing *(Step 7)* | One artifact under `_cross-cutting/` (integration test plans naturally cover multiple repos) |

The human is responsible for sequencing: they invoke the planning skill (and later the execution skill) once per affected repo. For single-repo features (the common case), Step 0 auto-resolves and the human sees no prompt — preserving today's UX exactly.

---

## 10. Skill changes (specific edits)

### Step 0 — Scope the target source repo

Add to `create-implementation-package/SKILL.md` and `execute-increments/SKILL.md` as the new first step:

> **Step 0 — Scope the target source repo.**
>
> Determine the target `<repo-code>` for this skill run, in this priority order:
>
> 1. **Stage in legacy mode.** If the stage's `[stages.<stage>]` entry has neither `dir` nor `colocate_with_source`, skip this step entirely and resolve paths via `[project.paths]` exactly as today.
> 2. **Path signal.** If the upstream artifact lives under `<host-repo>/<artifact_subdir>/<stage>/<repo-code>/...`, the `<repo-code>` segment is the scope. Auto-resolve. No prompt.
> 3. **Frontmatter signal (cross-cutting).** If the upstream artifact lives under `<host-repo>/<artifact_subdir>/<stage>/_cross-cutting/...`, read its `affects_repos` frontmatter:
>    - If exactly one entry: pin that `<repo-code>`. No prompt.
>    - If more than one entry: prompt the user — *"This is a cross-cutting feature affecting `{affects_repos}`. Which repo are we scoping this session to?"* — and use their answer. **Do not pre-fill a default**; the user must choose deliberately.
> 4. **Legacy fallback (no path or frontmatter signal).** Prompt the user — *"Which source repo is this work scoped to?"* — pre-filling with the project's `primary` repo (if any) as the suggested default.
>
> The chosen `<repo-code>` is used by all subsequent path resolution.
>
> **Interactive-only contract.** These skills are designed for interactive invocation. If a non-interactive context is detected (no TTY, scripted chain, CI), the skill **fails fast** with a clear error rather than blocking on an unanswerable prompt.

### Permission check

Add at every `Write`/`Edit` boundary in the resolver wrapper:

> Before writing, look up `[stages.<stage>].write_role`. If set, compare with `[user].role` from `project.user.toml`. If they don't match: refuse the write, surface the role mismatch as an error, and exit cleanly (no partial state).
>
> If the stage is in legacy mode (no SoD fields) or `[user].role` is unset, skip the check.

### `affects_repos` frontmatter — the contract

Cross-cutting upstream artifacts (those under `_cross-cutting/`) **MUST** include `affects_repos` in frontmatter, listing the `[[project.repos]].code` values of every affected source repo. Single-repo artifacts under `<repo-code>/` do not need the field — their location already encodes the scope.

The validator (`scripts/validate.py`) enforces: any artifact under a `_cross-cutting/` directory must carry `affects_repos`, and every value must resolve to a known `[[project.repos]].code`.

For legacy artifacts that lack the field, Step 0 falls back to the prompt (with `primary` as the suggested default).

---

## 11. Backward compatibility — explicit guarantees

The proposed changes layer additively over the current `mm/add-ack-cobol-repo` 1.4.5 schema. **Every legacy project keeps working without modification.** Per § 6, SoD adoption is *per-stage*: a stage adopts SoD only when its `[stages.<stage>]` entry declares `dir` or `colocate_with_source`. Otherwise that stage continues using its legacy `[project.paths]` resolution. This enables **incremental migration** — a team can flip requirements to SoD while leaving execution on legacy paths.

| What today's project has | What the new framework does |
|---|---|
| `[stages.<stage>]` entries without `dir` or `colocate_with_source` | **Legacy mode.** Resolver uses `[project.paths]` exactly as today. No Step 0 scoping. No permission checks. Behavior identical to today. |
| `[stages.<stage>]` entries with `dir = "..."` (no colocate) | Directory mode. Per-repo `<repo-code>/` subdirectories under each stage. Permission checks active if `[user].role` set. |
| `[stages.<stage>]` entries mixing `dir` and `colocate_with_source` across stages | Each stage uses its declared mode. Mix freely (recommended layout uses both). |
| `[stages.<stage>]` SoD fields present but `[user]` empty | Path resolution uses SoD; permission checks skipped (with one-time startup warning). |
| `[project.paths].knowledge_base_path` only | Unchanged. KB lookup uses this field exactly as today. No new KB config surface. |
| Upstream artifact lacks `affects_repos` frontmatter (legacy / pre-SoD) | Step 0 prompts the user, pre-filling `primary` as the suggested default. |
| Project uses **quick-dev** or **reverse-engineering** flows | Continues on `[project.paths]`; quick-dev and RE are **not part of SoD MVP**. |
| Project has in-flight execution-stage artifacts at SoD-enablement | Those artifacts remain at legacy paths; SoD layout applies only to features started after enablement. Migration tooling for in-flight work is deferred (§ 14). |
| `framework-navigator` skill discovery | **Stays role-blind in MVP**; lists all skills regardless of `[user].role`. Skill-layer write refusal (§ 1 layer 1) catches role violations at invocation time. |
| Layer 5 customizations (`customizations/<skill>.toml`) | Continue to apply for skill-internal tuning (compositions, blocks, elicitation, suppressions). They **cannot** override SoD policy fields (`dir`, `colocate_with_source`, `write_role`, `[user].role`, `artifact_subdir`); those remain Layer 1-4 only. |
| Existing skill names and step numbering | Unchanged. Step 0 is a *prepended* step, not a renumbering. Today's "Step 1" stays "Step 1". |

**No file removals. No required field renames. No behavioral changes to legacy mode.**

The "hard guardrail" enforcement layer — GitHub repo-level write permissions on the role-restricted repos — is out of scope for framework configuration but assumed by the SoD model.

---

## 12. Implementation sequence

> **Note on framing.** This framework is a markdown instruction set executed by an agent at runtime — it has no compiled code path between user → skill. There is no "config-loader utility" to build. The SoD path-resolution and permission-check rules below live as prose in `SCHEMAS.md` and the relevant `SKILL.md` / step files. The agent applies them by reading `project.toml` and following the documented rules. "Step" entries below describe documentation and skill-content changes, not code modules.

| Step | Work | Risk | Backward-compat surface |
|---|---|---|---|
| 1 | **Schema additions and validator updates.** SoD fields (`dir`, `colocate_with_source`, `write_role`, `output`) added to `[stages.<stage>]` documentation in `config/SCHEMAS.md` and `.example` files; `[project].artifact_subdir` documented; `project.user.toml` schema clarified to allow `[user]` block; `validate.py` rules added (see below). | Low | Pure addition; absent → legacy mode |
| 2 | Step 0 scoping in `create-implementation-package` and `execute-increments` SKILL.md (path → frontmatter → prompt with `primary` fallback; interactive-only with fail-fast non-interactive guard) | Medium | Skipped when stage is legacy mode |
| 3 | Permission check at write boundary in the same two skills | Medium | Skipped when `[user].role` absent or stage is legacy mode |
| 4 | `_cross-cutting/` subdirectory convention at requirements/design/testing only (geometry rationale documented in § 7) | Low | Pure addition; never appears in legacy mode or in colocate-mode stages |
| 5 | `affects_repos` frontmatter field — added to **cross-cutting** requirements/design block templates only; single-repo templates unchanged | Low | Field is required only for cross-cutting artifacts; legacy artifacts trigger the Step 0 prompt fallback |
| 6 | Drift detector role-aware filtering | Low | All-repos default when role absent |
| 7 | Tester stage skills (`.agents/skills/testing/`) — net-new; includes adding `testing_package` to `[project.paths]` for legacy-mode fallback if needed | High | Net-new stage; absent on this branch |
| 8 | Optional ack file logging (`record_acknowledgements` flag) | Low | Off by default |

**Steps 1–6** are the SoD MVP. Step 7 is independent and can be deferred until tester-role workflows are needed. Step 7 is independent and can be deferred until audit needs surface.

### Validator rules to add to `scripts/validate.py` (Step 1)

1. Reject `[stages.<stage>]` entries with neither `dir` nor `colocate_with_source = true`, or with both.
2. Validate `[stages.<stage>].dir` (when set) is a relative path under `{project-root}`.
3. Validate `[stages.<stage>].write_role` (when set) is one of: `BA`, `Architect`, `BSA`, `Developer`, `Tester`, `KB-Steward`.
4. Validate `[user].role` (when set in `project.user.toml`) matches the same enum.
5. Validate `[project].artifact_subdir` (when set) is a bare relative path (no leading slash, no path tokens).
6. Validate cross-cutting artifacts (under `_cross-cutting/`) carry `affects_repos` frontmatter, with values resolving to known `[[project.repos]].code`.

---

## 13. Variants for teams that don't want full colocation

A team may prefer planning + execution artifacts in a separate dedicated repo (`developer-repo`) rather than colocated with source code. Supported by flipping the planning/execution stages to dir mode:

```toml
[stages.planning]
dir        = "developer-repo"
write_role = "Developer"

[stages.execution]
dir        = "developer-repo"
write_role = "Developer"
```

Under this variant, cross-cutting features at planning/execution use the `_cross-cutting/` subdirectory convention (same rule as the dir-mode geometry described in § 7). Step 0 scoping still applies to determine the `<repo-code>` segment of the path.

This variant is **supported by the schema but not the recommended default**. Choose colocation if most features are single-repo; choose dir-based if cross-cutting features dominate or source-repo CI / branch-protection rules would clash with iterative `increment-status.md` updates.

---

## 14. Open questions / deferred decisions

- **`project.toml` location.** Workspace root recommended (sample assumes this). Alternative: inside KB repo. Both work with walk-up discovery.
- **KB write enforcement.** A KB-Steward write_role mechanism could attach to KB-aware skills in the future. Defer until KB write-conflict cases surface; not in MVP.
- **Tester stage scope.** Step 7 — substantive design effort. Until then, testing artifacts can be authored manually under `tester-repo/.framework-output/testing/`.
- **Adversarial review coupling.** SoD design uses `approved: yes/no` boolean. When `mm/add-adverserial` lands, it plugs in as an optional review composition without modifying SoD primitives.
- **Cross-repo plan dependencies.** A UI plan that depends on an API plan landing first uses frontmatter `depends_on: api-orders/CHK-001/INC-001`. Specify the field shape, the upstream-status check, and cycle detection when first needed. § 8's worked example already exposes this gap (UI cart-redesign vs. API payment-retry).
- **Increment numbering for cross-cutting features.** `INC-001` per source repo means the same number can repeat across repos for the same feature. Path disambiguates. If teams find this confusing, namespaced IDs (`INC-AO-001`, `INC-UC-001`) are an opt-in convention.
- **Status rollup.** "What's the overall state of CHK-001?" requires reading both source repos' `increment-status.md`. A small `status-rollup` skill can aggregate when needed; not in MVP.
- **SoD support for quick-dev and reverse-engineering flows.** MVP keeps these on legacy paths. Extending SoD to them is reasonable for regulated teams that need role-gated quick-dev or RE; defer until requested.
- **Migration tooling for in-flight artifacts.** Teams that flip the execution stage to colocate-mode mid-feature can move artifacts manually (`git mv` + path edits). A migration utility could automate this; defer until requested.
- **Role-aware `framework-navigator`.** Filter or badge skills by `[user].role`. Requires registry-generator updates to emit role hints into `skills.json` and possibly extending `workflow-graph.yaml`. Deferred.
