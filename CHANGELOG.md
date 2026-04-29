# A.I.D.E. (AI Integrated Delivery Enablement) — CHANGELOG

> Project-level release-stream change log.
> **Audience:** end users / downstream consumers of A.I.D.E. — not internal SDLC participants (those use per-package CHANGE-TRACKER.md).
> **Format:** Keep-a-Changelog over the canonical change-log block (`templates/blocks/shared/change-log.md`) wrapped by `templates/compositions/project-change-log.yaml`. **This file dogfoods F-007.**

| Field | Value |
|---|---|
| Artifact | A.I.D.E. — release stream |
| Artifact type | project-change-log |
| Current artifact version | `1.2.0` |
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

### `1.2.0` — 2026-04-29

> **Note on version sequencing.** This entry assumes 1.1.0 (the solution-context layer, branch `mm/add-context`) lands first. If this branch merges before `mm/add-context`, this entry should be retitled to 1.1.0 and the README/header version adjusted accordingly. The two feature branches are independent and can ship in either order.

#### Added

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Addition | skills | `.agents/skills/meta/review-adversarial/` | New anytime skill performing attitude-driven adversarial review of A.I.D.E. artifacts. Six lenses: weasel words, hidden assumptions, unsupported claims, missing stakeholders, "good news only" framing, scope inflation. Stage-aware via `--stage` hint with frontmatter fallback. Produces Format 4 findings (`aide-adversarial-findings@1`). | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Addition | skills | `.agents/skills/meta/review-edge-case-hunter/` | New anytime skill performing method-driven edge-case review. Seven categories: branching paths, error paths, boundaries, concurrency, time/clock, data shapes, authorization. Reports only unhandled edges. Same Format 4 schema as the adversarial sibling. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Addition | skills | `.agents/skills/reverse-engineering/review-reverse-engineering-package/` | New per-repo gate skill that validates Part A + Part B before KB ingestion. 9 sub-reviews (section-completeness, grounding, consistency, coverage, freshness, traceability, adversarial-pass, edge-cases, readiness). Wraps the new anytime skills in sub-reviews 7–8. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Addition | skills | `.agents/skills/knowledge-base/review-knowledge-base-package/` | New periodic global KB audit skill (cadence-based, not per-PR). 10 sub-reviews orchestrating `verify-knowledge-base-coverage` and `detect-knowledge-base-drift` plus seven additional lenses, ending with a readiness verdict. Wraps the new anytime skills in sub-reviews 8–9. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Addition | references | `references/review-patterns/review-output-format.md`, `review-verdict-mapping.md`, `adversarial-wrapper-pattern.md` | Three new shared references: Format 4 schema spec (`aide-adversarial-findings@1`), severity-to-verdict mapping for wrappers, and the dispatcher pattern documentation cited from all five `review-*-package` skills. Single source of truth for the wrapper integration. | repo @ this commit | ✅ Verified |
| 6 | 2026-04-29 | Addition | docs | `_docs/adversarial-review-design.md` | Stage 1 design note for the layer (281 lines). Defines two new anytime skills, two new review-package skills, wrapper integration into all five review-package skills, the shared output format, the verdict mapping, and the staged delivery plan. | repo @ this commit | ✅ Verified |

#### Changed

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 1 | 2026-04-29 | Source Update | skills | `.agents/skills/requirements/review-requirements-package/` | Sequence expanded from 10 to 12 sub-reviews. New sub-reviews `review-adversarial-pass` (10) and `review-edge-cases` (11) inserted before the readiness gate (now 12). Halts on FAIL per existing pattern. | repo @ this commit | ✅ Verified |
| 2 | 2026-04-29 | Source Update | skills | `.agents/skills/design/review-design-package/` | Sequence expanded from 3 to 5 sub-reviews. New `review-adversarial-pass` (3) and `review-edge-cases` (4) inserted before `review-solution-readiness` (now 5). Halts on FAIL per existing pattern. | repo @ this commit | ✅ Verified |
| 3 | 2026-04-29 | Source Update | skills | `.agents/skills/planning/review-implementation-package/` | Sequence expanded from 8 to 10 sub-reviews. New `review-adversarial-pass` (8) and `review-edge-cases` (9) inserted before the implementation-readiness verdict (now 10). Adversarial findings flow into the consolidated issue list rather than halting; severities mapped to Critical/Important/Minor per the wrapper pattern. | repo @ this commit | ✅ Verified |
| 4 | 2026-04-29 | Source Update | skills | `.agents/skills/_registry/workflow-graph.yaml` | Inserted `review-reverse-engineering-package` in brownfield between `reverse-engineer-<dynamic>` and `build-knowledge-base` as a required gate. Added `review-adversarial`, `review-edge-case-hunter`, and `review-knowledge-base-package` to the `anytime` list. | repo @ this commit | ✅ Verified |
| 5 | 2026-04-29 | Source Update | docs | `README.md` | Version bumped to 1.2.0. Skill count 32 → 36. Stage rows for `meta`, `reverse-engineering`, and `knowledge-base` updated to mention the new review skills. KB section updated to "6 KB skills". | repo @ this commit | ✅ Verified |

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
