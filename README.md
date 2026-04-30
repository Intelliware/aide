# A.I.D.E. (AI Integrated Delivery Enablement)

**Version:** 1.1.0

A unified, skills-based SDLC methodology framework, conformant with the [agentskills.io](https://agentskills.io) standard.

Supports three flows:
- **Greenfield** — full SDLC from requirements through execution for new projects
- **Brownfield** — reverse-engineer existing repos into a knowledge base, then enhance
- **Quick-dev** — lightweight scoped-change path with combined spec + plan + execute

Includes a global **knowledge-base** capability for multi-repo, large solutions: built initially via reverse-engineering, maintained by closing skills as features ship.

## Getting started

1. Open this repo and your target project repo(s) as folders in one multi-root VSCode or Cursor workspace.
2. Skills auto-discover — see "Running in …" sections below for the one-time host verification.
3. Invoke the `start-project` skill to choose a flow and write your `project.toml`.
4. Follow the recommended next skill at each stage handoff.

If unsure where to start, invoke `framework-navigator` — it routes you based on a goal in plain English (or shows the catalog).

> **Currently supported hosts:** VSCode + GitHub Copilot, Cursor IDE. Claude Code is currently not supported.

## Running in VSCode + GitHub Copilot

GitHub Copilot adopted the [agentskills.io](https://agentskills.io) specification natively on 2025-12-18, and A.I.D.E.'s skills conform to that spec. No transformation, transpile, or build step is required — Copilot reads `SKILL.md` files directly. Skills are stored under A.I.D.E.'s `.agents/skills/` directory, which is one of Copilot's default discovery roots, so **no settings.json edits, symlinks, or overlays are needed**.

### Prerequisites

- VSCode with the GitHub Copilot extension installed and signed in
- Copilot in **agent mode** (Chat view → switch from "Ask" to "Agent"). Agent mode is required for skills that read multiple files or run scripts.

### Step 1 — open A.I.D.E. alongside your project

Open this repo as a folder in the same multi-root workspace as your target project repo(s). Save the workspace as `<project>.code-workspace` (File → Save Workspace As…) so the layout is reproducible. Copilot iterates every workspace folder root and looks for skills under each root's default discovery directories — `.agents/skills/` is one of those defaults, so A.I.D.E.'s skills are picked up automatically.

To verify: open Settings (⌘,), search for `chat.agentSkillsLocations`, and confirm `.agents/skills` is in the list of enabled discovery roots (it ships enabled by default). Then open Chat and type `/` — all 35 framework skills should appear in the picker with their descriptions.

### Step 2 — framework orientation (automatic)

A.I.D.E. ships an `AGENTS.md` at its repo root. Copilot auto-attaches `AGENTS.md` from every workspace folder root, so simply having A.I.D.E. open as a workspace folder gives every chat the framework orientation — how to invoke skills, the vocabulary to use, and a guard rail telling the model that A.I.D.E.'s folder is the framework, not the user's project. **No project-side wiring required.**

Project-side guidance is **optional** and scoped to project-specific rules — codebase conventions, path-scoped style preferences, etc. Add any of:

- `.github/copilot-instructions.md` or `AGENTS.md` at your project's root (always-on)
- `.github/instructions/<name>.instructions.md` with an `applyTo:` glob (path-scoped, e.g. "in `frontend/`, prefer functional components")

Project-side files compound with A.I.D.E.'s `AGENTS.md` — both attach in parallel, no conflict.

### Compositions and Copilot

Copilot has no native equivalent of A.I.D.E.'s YAML compositions. Skills that consume compositions still work — the skill itself reads the YAML from disk. If you want a composition exposed as a one-shot Copilot agent (e.g. "run the whole greenfield-requirements-package flow"), wrap it as a custom agent at `.github/agents/<flow-name>.agent.md`. This is optional and not required for any skill to function.

## Running in Cursor IDE

Cursor adopted native [agentskills.io](https://agentskills.io) support around v2.3.x — the same `SKILL.md` format used by Copilot is read directly. Skills are stored under A.I.D.E.'s `.agents/skills/` directory, which is one of Cursor's built-in discovery roots, so **no settings, symlinks, or overlays are needed**.

### Prerequisites

- Cursor IDE v2.3.x or later (skills support is bundled; no separate install).
- Agent panel open and a model selected. Cursor's Agent reads skills automatically; slash invocation works in the Agent chat.

### Step 1 — open A.I.D.E. alongside your project

Open this repo as a folder in the same multi-root Cursor workspace as your target project repo(s). Cursor scans `.agents/skills/` (and `.cursor/skills/`) under every workspace folder root, so A.I.D.E.'s skills are picked up automatically.

To verify: open the Agent panel and type `/` — all 35 framework skills should appear in the picker with their descriptions. If any are missing, confirm the A.I.D.E. folder is listed in the workspace's folder list and that `.agents/skills/` exists at its root.

### Step 2 — framework orientation (automatic)

A.I.D.E. ships an `AGENTS.md` at its repo root. Cursor reads `AGENTS.md` from every workspace folder root, so simply having A.I.D.E. open as a workspace folder gives every chat the framework orientation — how to invoke skills, the vocabulary to use, and a guard rail telling the model that A.I.D.E.'s folder is the framework, not the user's project. **No project-side wiring required.**

Project-side guidance is **optional** and scoped to project-specific rules. Add any of:

- `AGENTS.md` at your project's root (always-on)
- `.cursor/rules/<name>.mdc` with `alwaysApply: true` (always-on, project-scoped)
- `.cursor/rules/<name>.mdc` with a `globs:` field (path-scoped, e.g. "in `frontend/`, prefer functional components")

Project-side files compound with A.I.D.E.'s `AGENTS.md` — both attach in parallel, no conflict. Keep individual `.mdc` rule files under ~500 lines per Cursor's guidance.

### Step 3 — slash command shortcuts (optional)

Cursor supports project-level slash commands via `.cursor/commands/<name>.md`. These are short markdown prompts that expand at invocation. Useful as one-line entry points to common flows:

```
.cursor/commands/start-greenfield.md
.cursor/commands/start-brownfield.md
.cursor/commands/start-quick-dev.md
```

Each file's body is a brief prompt that names the corresponding framework skill and any required arguments. This is sugar — every framework skill is already directly invocable as `/<skill-name>` once Step 1 is done.

### Compositions and Cursor

Like Copilot, Cursor has no native runtime for A.I.D.E.'s YAML compositions. Skills consume compositions directly from disk and run unchanged. There is no portable Cursor equivalent of Copilot's `.agent.md` files (Cursor's "custom agent modes" are UI-configured and stored in Cursor's local settings DB, not in a portable file). If you want a composition surfaced as a single shortcut, use a Step 3 slash command.

### Known limitations

- No setting to add custom skill discovery roots (VSCode has `chat.agentSkillsLocations`; Cursor does not). Not a blocker — `.agents/skills/` is in Cursor's defaults.
- Custom agent modes are not file-based, so cross-tool agent personas don't port from Copilot.

## Host-comparison cheatsheet

| Capability | Copilot agent mode | Cursor Agent |
|---|---|---|
| Skill discovery via frontmatter | ✓ | ✓ (identical) |
| Slash invocation `/skill-name` | ✓ | ✓ (identical) |
| Progressive disclosure (`references/` loaded on demand) | ✓ | ✓ (identical) |
| Default skill roots (per workspace folder) | `.agents/skills/`, `.github/skills/`, `.claude/skills/` | `.cursor/skills/`, `.agents/skills/` (+ `.claude/skills/` backward-compat) |
| Default skill roots (user-global) | `~/.agents/skills/`, `~/.copilot/skills/`, `~/.claude/skills/` | `~/.cursor/skills/`, `~/.agents/skills/` |
| Custom skill discovery roots | `chat.agentSkillsLocations` workspace setting | (none — rely on defaults) |
| Always-on context | `.github/copilot-instructions.md` / `AGENTS.md` | `.cursor/rules/*.mdc` (`alwaysApply: true`) / `AGENTS.md` |
| Path-scoped instructions | `.github/instructions/*.instructions.md` with `applyTo:` | `.cursor/rules/*.mdc` with `globs:` |
| Composition manifests (YAML) | (skill-driven) | (skill-driven) |
| Project super-context (`project.toml`) | (skill-driven) | (skill-driven) |

The skills themselves are identical across both hosts — they live under `.agents/skills/` inside this repo and are auto-discovered when A.I.D.E. is opened as a workspace folder. Claude Code is currently not supported.

## Top-level layout

| Path | Purpose |
|---|---|
| `config/` | Schemas + example files for the four-layer config (framework + project + user overrides + per-skill customizations). See `config/SCHEMAS.md`. |
| `.agents/skills/` | All capabilities, grouped by stage. Each skill is `SKILL.md` + `references/` + optional `steps/`. Sits at `.agents/skills/` so both Copilot and Cursor pick it up via their default discovery roots when A.I.D.E. is opened as a workspace folder. |
| `.agents/skills/_registry/` | Generated `skills.csv` + `skills.json` from frontmatter; hand-authored `workflow-graph.yaml` |
| `templates/blocks/` | Reusable section blocks, grouped by stage |
| `templates/compositions/` | YAML manifests assembling blocks into artifacts |
| `references/` | Cross-cutting framework references loaded by skills on demand |
| `scripts/` | Build tools: `build-registry.py`, `validate.py` |
| `_docs/` | Framework-internal documentation (e.g., `requirements.md`); not part of any shippable artifact. |
| `_archive/` | Frozen snapshot of pre-unification legacy folders + audit + validation report |
| `_bmad/` | BMAD method (kept locally for reference / inspiration; gitignored, not part of A.I.D.E.) |

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
| `knowledge-base` | The global multi-repo KB. Code-grounded skills (`build-`, `navigate-`, `update-`, `detect-knowledge-base-drift`, `verify-knowledge-base-coverage`) plus the solution-context layer (`capture-solution-context`, `generate-ai-rules`, `document-operations`) for project-scoped intent the code can't reveal |
| `quick-dev` | Lightweight scoped-change path (`document-`, `plan-`, `execute-quick-change`) |

## Knowledge base

The KB **lives in its own repo**, separate from A.I.D.E. `project.toml`'s `[project.paths] knowledge_base_path` points at it. Open both repos in one multi-root workspace; coding agents access both.

The KB is markdown-first. Agents traverse it via `read + grep + glob` over per-component frontmatter (`description`, `triggers`, `paths`, `depends_on`, `consumed_by`, …) — **no vector DB**, no embeddings. The root `ARCHITECTURE.md` (5–15 KB) loads first; `navigate-knowledge-base` selects the minimal component set for a given feature.

The KB has two complementary halves. The **code-grounded half** (this `ARCHITECTURE.md` + `components/` + `graph.json`, all derived from RE Part A/B) is what most KB skills produce and consume. The **human-grounded half** under `<KB>/shared/{solution-context, ai-rules, operations}/` captures the project-scoped intent that code can't recover: mission, personas, KPIs, constraints, AI coding rules, deployment topology, SLOs, runbooks. The new `capture-solution-context`, `generate-ai-rules`, and `document-operations` skills produce that half through interactive discovery; `navigate-knowledge-base` surfaces leaves from both halves when feature triggers match.

See `config/SCHEMAS.md` § 3 for KB schemas, `templates/blocks/knowledge-base/` for KB block templates, and `.agents/skills/knowledge-base/README.md` for the 8 KB skills.

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

See `.agents/skills/reverse-engineering/README.md` for the full domain catalog and `templates/blocks/reverse-eng/` for the per-domain block libraries.

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
