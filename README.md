# theframework

A unified, skills-based SDLC methodology framework, conformant with the [agentskills.io](https://agentskills.io) standard.

Supports three flows:
- **Greenfield** — full SDLC from requirements through execution for new projects
- **Brownfield** — reverse-engineer existing repos into a knowledge base, then enhance
- **Quick-dev** — lightweight scoped-change path with combined spec + plan + execute

Includes a global **knowledge-base** capability for multi-repo, large solutions: built initially via reverse-engineering, maintained by closing skills as features ship.

## Getting started

1. Open this repo and your target project repo(s) in one VSCode workspace (or a common parent directory).
2. Wire the framework into your AI host (see "Running in …" sections below).
3. Invoke the `start-project` skill to choose a flow and write your `project.toml`.
4. Follow the recommended next skill at each stage handoff.

If unsure where to start, invoke `framework-navigator` — it routes you based on a goal in plain English (or shows the catalog).

## Running in VSCode + GitHub Copilot

GitHub Copilot adopted the [agentskills.io](https://agentskills.io) specification natively on 2025-12-18, and theframework's skills conform to that spec. No transformation, transpile, or build step is required — Copilot reads `SKILL.md` files directly. Only the **discovery path** needs to be wired up.

### Prerequisites

- VSCode with the GitHub Copilot extension installed and signed in
- Copilot in **agent mode** (Chat view → switch from "Ask" to "Agent"). Agent mode is required for skills that read multiple files or run scripts.

### Step 1 — make the framework's skills discoverable

Pick one of three options:

| Option | Setup | Best for |
|---|---|---|
| **A. Workspace setting** | Open `.vscode/settings.json` in your **target project** and add `"chat.agentSkillsLocations": ["${workspaceFolder}/../theframework/skills"]` (adjust the relative path to where you cloned theframework). | Multi-repo workspaces where theframework lives next to your project repos. |
| **B. Symlink into the project** | From your project root: `ln -s ../theframework/skills .claude/skills`. Copilot reads `.claude/skills/` natively. | Single-repo projects; cross-tool support (Claude Code reads the same path). |
| **C. Direct clone** | Clone theframework directly into `.claude/skills/` of your project. | Pinning a framework version per project. |

Verify by opening Chat and typing `/` — every framework skill (32 of them) should appear in the picker with its description.

### Step 2 — wire the always-on framework orientation (recommended)

Copilot auto-attaches `.github/copilot-instructions.md` (or `AGENTS.md` at repo root) to every chat. Create one of these in your **target project** with a brief framework orientation, e.g.:

```markdown
# Project AI guidance

This project uses theframework (https://…) — a skills-based SDLC framework.

- Skill catalog: `.claude/skills/` (or wherever you wired it in Step 1)
- Invoke skills via `/<skill-name>` in Copilot Chat
- Project flow + super-context: `project.toml` at this repo's root
- If unsure which skill to use, invoke `/framework-navigator`
- Vocabulary: stage / increment / package — avoid "phase", "epic", "story"
```

Without this file, Copilot still works — but the model has to discover the framework's conventions on first use rather than being told them upfront.

### Step 3 — configure MCP servers (optional)

If any skills you'll use depend on MCP tools, add a `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "<server-name>": { "command": "...", "args": ["..."] }
  }
}
```

Note the root key is `servers` (not `mcpServers`). See [VSCode MCP docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

### Step 4 — path-scoped rules (optional)

For rules that should apply only to specific paths (e.g., "in `frontend/`, prefer functional components"), use `.github/instructions/<name>.instructions.md` with an `applyTo:` glob in the frontmatter. These are loaded only when files matching the glob are in scope.

### Compositions and Copilot

Copilot has no native equivalent of theframework's YAML compositions. Skills that consume compositions still work — the skill itself reads the YAML from disk. If you want a composition exposed as a one-shot Copilot agent (e.g. "run the whole greenfield-requirements-package flow"), wrap it as a custom agent at `.github/agents/<flow-name>.agent.md`. This is optional and not required for any skill to function.

## Running in Cursor IDE

Cursor adopted native [agentskills.io](https://agentskills.io) support around v2.3.x — the same `SKILL.md` format used by Claude Code and Copilot is read directly. Like Copilot, only the discovery path needs to be wired up; no transformation, transpile, or build step is required.

### Prerequisites

- Cursor IDE v2.3.x or later (skills support is bundled; no separate install).
- Agent panel open and a model selected. Cursor's Agent reads skills automatically; slash invocation works in the Agent chat.

### Step 1 — make the framework's skills discoverable

Cursor scans four roots automatically: `.cursor/skills/` and `.agents/skills/` (project), plus `~/.cursor/skills/` and `~/.agents/skills/` (user-global). It also has backward-compat reading of `.claude/skills/`, but that path is gated in some versions (only activates when `~/.claude/` already exists). **Recommended: use `.cursor/skills/` directly.**

| Option | Setup | Best for |
|---|---|---|
| **A. Symlink into the project (recommended)** | From your project root: `ln -s ../theframework/skills .cursor/skills`. Cursor reads `.cursor/skills/` natively. | Cross-tool single source — Copilot reads `.claude/skills/`, Cursor reads `.cursor/skills/`; symlink to whichever root makes sense per project. |
| **B. Direct clone** | Clone theframework directly into `.cursor/skills/` of your project. | Pinning a framework version per project. |
| **C. User-global** | Symlink into `~/.cursor/skills/`. | Personal use across every project on your machine. |

There is no Cursor equivalent of VSCode's `chat.agentSkillsLocations` setting — discovery roots are fixed to the four directories above, so an in-project symlink is the cleanest path.

Verify by opening the Agent panel and typing `/` — every framework skill should appear in the picker with its description.

### Step 2 — wire the always-on framework orientation (recommended)

Cursor honors two always-on mechanisms: **`.cursor/rules/<name>.mdc`** files (project rules) and a top-level **`AGENTS.md`** file. Either works. The `.mdc` form gives you the most control:

```markdown
---
description: theframework — project orientation
alwaysApply: true
---

This project uses theframework — a skills-based SDLC framework.

- Skill catalog: `.cursor/skills/` (or wherever Step 1 wired it)
- Invoke skills via `/<skill-name>` in the Agent panel
- Project flow + super-context: `project.toml` at this repo's root
- If unsure which skill to use, invoke `/framework-navigator`
- Vocabulary: stage / increment / package — avoid "phase", "epic", "story"
```

Save as `.cursor/rules/framework-orientation.mdc`. Cursor's rule precedence is **Team → Project → User**; this is project-scoped. Keep individual rule files under ~500 lines per Cursor's guidance.

For path-scoped rules (e.g., "in `frontend/`, prefer functional components"), add another `.mdc` file with a `globs:` field — Cursor auto-attaches it when matching files are in scope.

### Step 3 — configure MCP servers (optional)

If skills depend on MCP tools, add `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global). **Note: Cursor's key is `mcpServers`, not `servers` like VSCode:**

```json
{
  "mcpServers": {
    "<server-name>": { "command": "...", "args": ["..."] }
  }
}
```

Remote servers use `{ "url", "headers" }` instead.

### Step 4 — slash command shortcuts (optional)

Cursor supports project-level slash commands via `.cursor/commands/<name>.md`. These are short markdown prompts that expand at invocation. Useful as one-line entry points to common flows:

```
.cursor/commands/start-greenfield.md
.cursor/commands/start-brownfield.md
.cursor/commands/start-quick-dev.md
```

Each file's body is a brief prompt that names the corresponding framework skill and any required arguments. This is sugar — every framework skill is already directly invocable as `/<skill-name>` once Step 1 is done.

### Compositions and Cursor

Like Copilot, Cursor has no native runtime for theframework's YAML compositions. Skills consume compositions directly from disk and run unchanged. There is no portable Cursor equivalent of Copilot's `.agent.md` files (Cursor's "custom agent modes" are UI-configured and stored in Cursor's local settings DB, not in a portable file). If you want a composition surfaced as a single shortcut, use a Step 4 slash command.

### Known limitations

- `.claude/skills/` backward-compat is unreliable in some Cursor versions — use `.cursor/skills/` directly.
- No setting to add custom skill discovery roots (VSCode has `chat.agentSkillsLocations`; Cursor does not).
- Custom agent modes are not file-based, so cross-tool agent personas don't port from Copilot.

## Running in Claude Code

Claude Code reads `.claude/skills/` and `~/.claude/skills/` natively. Use option A or B from the Copilot section's Step 1 to wire the framework's `skills/` directory in. Always-on context lives in `CLAUDE.md` (project-scoped) or `~/.claude/CLAUDE.md` (user-scoped) instead of `.github/copilot-instructions.md` or `.cursor/rules/`. Otherwise, the skill experience is identical.

## Host-comparison cheatsheet

| Capability | Claude Code | Copilot agent mode | Cursor Agent |
|---|---|---|---|
| Skill discovery via frontmatter | ✓ | ✓ (identical) | ✓ (identical) |
| Slash invocation `/skill-name` | ✓ | ✓ (identical) | ✓ (identical) |
| Progressive disclosure (`references/` loaded on demand) | ✓ | ✓ (identical) | ✓ (identical) |
| Default skill roots | `.claude/skills/`, `~/.claude/skills/` | `.claude/skills/`, `.github/skills/`, `.agents/skills/` (+ user-global equivalents) | `.cursor/skills/`, `.agents/skills/` (+ user-global), backward-compat for `.claude/skills/` |
| Custom skill discovery roots | n/a | `chat.agentSkillsLocations` workspace setting | (none — symlink instead) |
| Always-on context | `CLAUDE.md` hierarchy | `.github/copilot-instructions.md` / `AGENTS.md` | `.cursor/rules/*.mdc` (`alwaysApply: true`) / `AGENTS.md` |
| Path-scoped instructions | `CLAUDE.md` per directory | `.github/instructions/*.instructions.md` with `applyTo:` | `.cursor/rules/*.mdc` with `globs:` |
| MCP config | (varies) | `.vscode/mcp.json` (root key: `servers`) | `.cursor/mcp.json` (root key: `mcpServers`) |
| Composition manifests (YAML) | (skill-driven) | (skill-driven) | (skill-driven) |
| Project super-context (`project.toml`) | (skill-driven) | (skill-driven) | (skill-driven) |

The skills themselves are identical across all three hosts — host-specific wiring (above) lives outside `skills/`.

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
