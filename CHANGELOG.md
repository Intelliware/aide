# A.I.D.E. (AI Integrated Delivery Enablement) — CHANGELOG

> Project-level release-stream change log.
> **Audience:** end users / downstream consumers of A.I.D.E. — not internal SDLC participants (those use per-package CHANGE-TRACKER.md).
> **Format:** Keep-a-Changelog over the canonical change-log block (`templates/blocks/shared/change-log.md`) wrapped by `templates/compositions/project-change-log.yaml`. **This file dogfoods F-007.**

| Field | Value |
|---|---|
| Artifact | A.I.D.E. — release stream |
| Artifact type | project-change-log |
| Current artifact version | `2.0.0` |
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
