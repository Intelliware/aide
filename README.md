# theframework

A unified, skills-based SDLC methodology framework, conformant with the [agentskills.io](https://agentskills.io) standard.

Supports three flows:
- **Greenfield** — full SDLC from requirements through execution for new projects
- **Brownfield** — reverse-engineer existing repos into a knowledge base, then enhance
- **Quick-dev** — lightweight scoped-change path with combined spec + plan + execute

Includes a global **knowledge-base** capability for multi-repo, large solutions: built initially via reverse-engineering, maintained by closing skills as features ship.

## Getting started

1. Open this repo and your target project repo(s) in one VSCode workspace (or a common parent directory).
2. Invoke the `start-project` skill (`skills/meta/start-project/`) to choose a flow and write your `project.toml`.
3. Follow the recommended next skill at each stage handoff.

If unsure where to start, invoke `framework-navigator` (`skills/meta/framework-navigator/`) — it routes you based on a goal in plain English (or shows the catalog).

## Top-level layout

| Path | Purpose |
|---|---|
| `config/` | Schemas + example files for the four-layer config (framework + project + user overrides + per-skill customizations). See `config/SCHEMAS.md`. |
| `skills/` | All capabilities, grouped by stage. Each skill is `SKILL.md` + `references/` + optional `steps/`. |
| `skills/_registry/` | Generated `skills.csv` + `skills.json` from frontmatter; hand-authored `workflow-graph.yaml` |
| `templates/blocks/` | Reusable section blocks, grouped by stage |
| `templates/compositions/` | YAML manifests assembling blocks into artifacts |
| `references/` | Cross-cutting framework references loaded by skills on demand |
| `scripts/` | Build tools: `build-registry.py`, `validate.py` |
| `_archive/` | Frozen snapshot of pre-unification legacy folders + audit + validation report |
| `_bmad/`, `_bmad-output/` | BMAD method (kept for reference / inspiration; not part of theframework) |

## Stages

Skills are grouped by stage of work, not by flow. The flow choice (greenfield/brownfield/quick-dev) lives in `project.toml` and is read by skills as a mode.

| Stage | What it produces |
|---|---|
| `meta` | Cross-cutting orchestrators and utilities (`start-project`, `customize-framework`, `framework-navigator`, `track-change`, `shard-document`, `verify-source`, `scaffold-documentation`) |
| `requirements` | Requirements packages (`create-`, `review-`) |
| `design` | Solution design packages (`create-`, `review-`) |
| `planning` | Implementation packages broken into INC-XXX increments (`create-`, `review-`) |
| `execution` | Implemented code, increment-status, bug log, PR (`execute-increments`, `manage-bugs`, `create-pr`) |
| `reverse-engineering` | Per-repo Part A internal + Part B consumer docs (`analyze-repository` dispatcher + 7 domain skills) |
| `knowledge-base` | The global multi-repo KB (`build-`, `navigate-`, `update-`, `detect-knowledge-base-drift`, `verify-knowledge-base-coverage`) |
| `quick-dev` | Lightweight scoped-change path (`document-`, `plan-`, `execute-quick-change`) |

## Knowledge base

The KB **lives in its own repo**, separate from theframework. `project.toml`'s `[project.paths] knowledge_base_path` points at it. Open both repos in one VSCode workspace; coding agents access both.

The KB is markdown-first. Agents traverse it via `read + grep + glob` over per-component frontmatter (`description`, `triggers`, `paths`, `depends_on`, `consumed_by`, …) — **no vector DB**, no embeddings. The root `ARCHITECTURE.md` (5–15 KB) loads first; `navigate-knowledge-base` selects the minimal component set for a given feature.

See `config/SCHEMAS.md` § 3 for KB schemas, `templates/blocks/knowledge-base/` for KB block templates, and `skills/knowledge-base/README.md` for the 5 KB skills.

## Reverse engineering

Reverse engineering produces, per repo, a **Part A** (internal implementation docs) and a **Part B** (consumer-facing docs) artifact set. RE outputs are the primary input to `build-knowledge-base`, but they are also useful standalone — e.g., onboarding a new maintainer to an unfamiliar service.

Entry point is `analyze-repository`: a thin dispatcher that classifies the repo (handling monorepos and hybrids) and names the next skill to invoke. The seven domain skills:

| Domain | Skill | Typical target |
|---|---|---|
| `api` | `reverse-engineer-api` | A specific API service (REST, GraphQL, RPC) |
| `api-framework` | `reverse-engineer-api-framework` | A framework for *building* APIs (e.g., Express, FastAPI) |
| `web-app` | `reverse-engineer-web-app` | A specific web application (SPA, SSR, hybrid) |
| `ui-framework` | `reverse-engineer-ui-framework` | A framework for *building* UIs (e.g., React, Vue, design systems) |
| `database` | `reverse-engineer-database` | A schema, data model, or DB-layer service |
| `mobile-app` | `reverse-engineer-mobile-app` | A specific mobile application (iOS, Android, cross-platform) |
| `mobile-framework` | `reverse-engineer-mobile-framework` | A framework for *building* mobile apps (e.g., React Native, Flutter) |

Each domain ships paired compositions in `templates/compositions/`: `re-<domain>-internal.yaml` (Part A) and `re-<domain>-consumer.yaml` (Part B).

See `skills/reverse-engineering/README.md` for the full domain catalog and `templates/blocks/reverse-eng/` for the per-domain block libraries.

## Vocabulary

- **Stage** — SDLC-level grouping of work (replaces the old "phase")
- **Increment** — implementation chunk, conforming to the canonical 8-section shape (replaces the old phase-as-chunk)
- **Package** — artifact produced by a stage (requirements-package, design-package, implementation-package)

Avoid: "phase" (overloaded), "epic", "story", agile vocabulary.

## Standards

- Every skill: `SKILL.md` ≤200 lines, agentskills.io frontmatter (`name` + `description` in "Use when…" trigger form), plus `references/{OVERVIEW,INPUTS-OUTPUTS,EXAMPLE}.md` minimum, plus optional `steps/` and folded references.
- Templates: blocks with frontmatter (`slug`, `title`, `applies-to`, `requires-decision-from`, `optional`, `order-hint`); YAML compositions assemble blocks per artifact.
- Config: four-layer TOML (framework + framework.user + project + project.user) with deep merge; per-skill overrides under `config/customizations/`. `_suppress: true` to drop a base entry.

## Maintenance

```
python3 scripts/build-registry.py    # regenerates skills.csv + skills.json from frontmatter (run after every skill add/move/rename/edit)
python3 scripts/validate.py          # composition/block cross-refs, workflow-graph resolution, description discipline, stale "phase" sweep
```

The migration's final validation report is at `_archive/validation-report.md`. The skill disposition audit is at `_archive/skill-disposition.md`.
