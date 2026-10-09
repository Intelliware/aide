# A.I.D.E. (AI Integrated Delivery Enablement)

**Version:** 2.7.5

A unified, skills-based SDLC methodology framework, conformant with the [agentskills.io](https://agentskills.io) standard.

Supports three flows:
- **Greenfield** — full SDLC from requirements through execution for new projects
- **Brownfield** — reverse-engineer existing repos into a knowledge base, then enhance
- **Quick-dev** — lightweight scoped-change path with combined spec + plan + execute

Includes a global **knowledge-base** capability for multi-repo, large solutions: built initially via reverse-engineering, maintained by closing skills as features ship.

## Getting Started

### Step 1 — Install the framework

A.I.D.E. installs by copying its runtime folders into an `AIDE/` directory in your workspace. The installation runbook is **tool-agnostic** and lives in [`INSTRUCTIONS.md`](INSTRUCTIONS.md) — give it to any coding agent (GitHub Copilot, Cursor, JetBrains AI Assistant, Claude, etc.) or follow it yourself.

#### ⚠️ Required — paste these install rules *above* every prompt

Every install/update prompt below is a **two-block paste**: the rules block first, then the prompt. Do not paste a prompt without the rules — weaker models will otherwise probe GitHub anonymously over HTTP, hit a misleading `404`, and report the repo as "not found" when the real issue is missing credentials.

**Rules block — copy verbatim:**

```text
Install rules — follow these strictly, no exceptions:
1. Preflight: before any fetch, run
     git ls-remote <AIDE_SOURCE_URL> <AIDE_REF>
   When using github.com make sure the URL ends in ".git"
   Substitute the actual URL and ref from the prompt below. The command must
   print one line containing a SHA. Zero lines = ref doesn't exist on the
   remote. A stderr error = auth or network. Show me the stderr verbatim and
   stop — do not retry with a different transport.
2. No HTTP fallbacks: never substitute Invoke-WebRequest, iwr, Invoke-RestMethod,
   curl, wget, gh api, gh repo view, api.github.com, or raw.githubusercontent.com
   for git. They are anonymous, return 404 (not 401) on private repos by design,
   and lose the diagnostic stderr. A 404 from any of those is "auth missing",
   not "repo missing".
```

**Example — what your actual paste should look like (replace AIDE_SOURCE_URL with the URL for your Github,  Azure DevOps, or GitLab URL, make sure you are authenticated to it) :**

```text
Install rules — follow these strictly, no exceptions:
1. Preflight: before any fetch, run
     git ls-remote <AIDE_SOURCE_URL> <AIDE_REF>
   ...
2. No HTTP fallbacks: ...

Install AIDE from <AIDE_SOURCE_URL> per its INSTRUCTIONS.md.
```

Paste both blocks into the agent chat in that order. The same rules block applies to every prompt in this README — install, update, and all override examples.

#### One-line prompt — paste this into any agent chat (after the rules block above):

> *"Install AIDE from `https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE` per its `INSTRUCTIONS.md`."*

The agent will fetch the repo, copy the mandatory subset (`AGENTS.md`, `.agents/`, `config/`, `templates/`, `references/`) into `./AIDE/`, skip framework-maintenance folders, create discovery shims at your workspace root so any agentskills.io host sees the skills, and verify the result.

**Configurable variables.** All defaults are sensible — only mention a variable if you want to override it.

| Variable          | Default                                     | What it controls                                                                            |
|-------------------|---------------------------------------------|---------------------------------------------------------------------------------------------|
| `AIDE_SOURCE_URL` | `https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE` | Where to fetch from. Use a fork, an internal mirror, or a local clone (`file:///abs/path`). |
| `AIDE_REF`        | `main`                                      | Branch, tag, or commit SHA to install.                                                      |
| `AIDE_TARGET_DIR` | `./AIDE`                                    | Where in your workspace the framework lands.                                                |

**Examples with overrides** (rules block above still applies — paste it first):

> *"Install AIDE from `https://github.com/my-org/aide-fork` using `AIDE_REF=R1.5.2` per its `INSTRUCTIONS.md`."*

> *"Install AIDE from `file:///c:/Users/me/repos/AIDE` into `AIDE_TARGET_DIR=./vendor/aide` per its `INSTRUCTIONS.md`."*

See [`INSTRUCTIONS.md`](INSTRUCTIONS.md) for the full runbook, the deny-list of files that are never copied, discovery-shim behaviour, troubleshooting, and the machine-readable YAML manifest.

#### Updating an existing install

The install runbook is fully idempotent — re-running it *is* the update path. Each run sweeps the workspace-root shims under `./.agents/skills/`, refreshes `./AGENTS.md`, and re-copies the canonical tree into `AIDE/`. Hand-authored files (anything lacking the marker) are preserved.

**One-line prompt — paste this into any agent chat to update** (rules block above still applies — paste it first):

> *"Update AIDE in this workspace from `https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE` by re-running its `INSTRUCTIONS.md`."*

The word **update** in the prompt tells the agent to skip the "overwrite or abort?" confirmation (see `INSTRUCTIONS.md` Step 2 — "update-intent exception") and just refresh in place.

The same `AIDE_SOURCE_URL`, `AIDE_REF`, and `AIDE_TARGET_DIR` overrides apply. Use `AIDE_REF` to pin a specific release rather than tracking `main`. Release tags are named `R<semver>` — for example `R2.2.0`, not `v2.2.0`:

> *"Update AIDE from `https://dev.azure.com/IntelliwareDev/AI_Knowledge_Repo/_git/AIDE` using `AIDE_REF=R2.2.0` by re-running its `INSTRUCTIONS.md`."*

### Step 2 — Open it in your IDE

Open your AIDE folder alongside your project repo(s) in one multi-root workspace. The framework's skills sit at `.agents/skills/` — a default discovery root for both supported IDEs — so no `settings.json` edits, symlinks, or overlays are needed.

To verify discovery: open the IDE's agent panel and type `/`. Every framework skill should appear in the picker with its description (the current full count is in `.agents/skills/_registry/skills.csv`).

> **Cross-host flat-discovery design.** Hosts (VS Code Copilot, JetBrains Copilot, Cursor, Claude Code, …) scan `.agents/skills/<skill>/SKILL.md` relative to each workspace folder root. A.I.D.E. organises canonical skills under `<stage>/<skill>/` inside `AIDE/`. The installation runbook ([`INSTRUCTIONS.md`](INSTRUCTIONS.md) Step 8) bridges the two by generating one **flat shim** per skill directly at the workspace root, so hosts see the right shape and the canonical files inside `AIDE/` stay unmodified. No symlinks, no junctions, no editor config. Design notes: [`.agents/skills/_registry/SHIMS.md`](.agents/skills/_registry/SHIMS.md).

> **Currently supported hosts:** VSCode + GitHub Copilot (primary), Cursor IDE. Claude Code is currently not supported.

#### Step 2a — VSCode + GitHub Copilot (primary target)

GitHub Copilot adopted the [agentskills.io](https://agentskills.io) specification natively on 2025-12-18, and A.I.D.E.'s skills conform to that spec. Copilot reads `SKILL.md` files directly — no transformation, transpile, or build step is required.

**Prerequisites:**
- VSCode with the GitHub Copilot extension installed and signed in
- Copilot in **agent mode** (Chat view → switch from "Ask" to "Agent"). Agent mode is required for skills that read multiple files or run scripts.

**Verify discovery.** Open Settings (⌘,), search for `chat.agentSkillsLocations`, and confirm `.agents/skills` is in the list of enabled discovery roots (it ships enabled by default). Then open Chat and type `/` — every framework skill should appear in the picker with its description.

**Framework orientation (automatic).** Copilot auto-attaches `AGENTS.md` from every workspace folder root, so simply having AIDE open as a workspace folder gives every chat the framework orientation — how to invoke skills, the vocabulary to use, and a guard rail telling the model that AIDE's folder is the framework, not the user's project. **No project-side wiring required.**

**Project-side guidance (optional).** Scoped to project-specific rules — codebase conventions, path-scoped style preferences, etc. Add any of:

- `.github/copilot-instructions.md` or `AGENTS.md` at your project's root (always-on)
- `.github/instructions/<name>.instructions.md` with an `applyTo:` glob (path-scoped, e.g. "in `frontend/`, prefer functional components")

Project-side files compound with AIDE's `AGENTS.md` — both attach in parallel, no conflict.

**Compositions and Copilot.** Copilot has no native equivalent of AIDE's YAML compositions. Skills that consume compositions still work — the skill itself reads the YAML from disk. If you want a composition exposed as a one-shot Copilot agent (e.g. "run the whole greenfield-requirements-package flow"), wrap it as a custom agent at `.github/agents/<flow-name>.agent.md`. This is optional and not required for any skill to function.

#### Step 2b — Cursor IDE

Cursor adopted native [agentskills.io](https://agentskills.io) support around v2.3.x — the same `SKILL.md` format used by Copilot is read directly.

**Prerequisites:**
- Cursor IDE v2.3.x or later (skills support is bundled; no separate install)
- Agent panel open and a model selected. Cursor's Agent reads skills automatically; slash invocation works in the Agent chat.

**Verify discovery.** Open the Agent panel and type `/` — every framework skill should appear in the picker with its description. If none appear, confirm the AIDE folder is listed in the workspace's folder list and that `.agents/skills/` exists at its root.

**Framework orientation (automatic).** Cursor reads `AGENTS.md` from every workspace folder root, so simply having AIDE open as a workspace folder gives every chat the framework orientation. **No project-side wiring required.**

**Project-side guidance (optional).** Scoped to project-specific rules. Add any of:

- `AGENTS.md` at your project's root (always-on)
- `.cursor/rules/<name>.mdc` with `alwaysApply: true` (always-on, project-scoped)
- `.cursor/rules/<name>.mdc` with a `globs:` field (path-scoped, e.g. "in `frontend/`, prefer functional components")

Keep individual `.mdc` rule files under ~500 lines per Cursor's guidance. Project-side files compound with AIDE's `AGENTS.md` — both attach in parallel, no conflict.

**Slash command shortcuts (optional).** Cursor supports project-level slash commands via `.cursor/commands/<name>.md`. These are short markdown prompts that expand at invocation — useful as one-line entry points to common flows (e.g. `start-greenfield.md`, `start-brownfield.md`, `start-quick-dev.md`). Each file's body is a brief prompt that names the corresponding framework skill and any required arguments. This is sugar — every framework skill is already directly invocable as `/<skill-name>`.

**Compositions and Cursor.** Like Copilot, Cursor has no native runtime for AIDE's YAML compositions. Skills consume compositions directly from disk and run unchanged. There is no portable Cursor equivalent of Copilot's `.agent.md` files (Cursor's "custom agent modes" are UI-configured and stored in Cursor's local settings DB, not in a portable file). If you want a composition surfaced as a single shortcut, use a slash command shortcut.

**Known limitations:**
- No setting to add custom skill discovery roots (VSCode has `chat.agentSkillsLocations`; Cursor does not). Not a blocker — `.agents/skills/` is in Cursor's defaults.
- Custom agent modes are not file-based, so cross-tool agent personas don't port from Copilot.

### Step 3 — Bootstrap your project with `/start-project`

Once your IDE shows the framework skills in the slash picker, the entry point for any new project is `/start-project`. It elicits the flow (greenfield / brownfield / quick-dev), captures project identity, paths, glossary, and decision-table prefills, then writes `project.toml` and hands off to the first skill of the chosen flow.

#### Recommended workspace layout

Create a dedicated **workspace folder** that holds `project.toml`, the optional `project.user.toml`, and the IDE workspace file (`.code-workspace`). Keep your source repos and the knowledge-base repo as **siblings** of the workspace folder, not children:

```
~/Dev/
├── checkout-workspace/        ← {project-root}: project.toml + checkout.code-workspace
├── api-orders/                ← source repo (sibling)
├── web-portal/                ← source repo (sibling)
└── knowledge-base-repo/       ← KB repo (sibling)
```

The framework defines `{project-root}` as whatever directory contains `project.toml`. Sibling repos are addressed via the `{project-root}/../<repo>` path token. Run `/start-project` from inside the workspace folder so it writes `project.toml` there.

This layout works for both setup modes below and is the recommended starting point even for single-repo projects — it keeps framework artifacts out of your source repos and gives you one stable location for the IDE workspace file.

#### Two setup modes

A.I.D.E. supports two project-bootstrap modes. **Pick one based on team layout, not project size:**

- **Legacy (simple).** All artifacts (requirements, design, planning, execution) land under `{project-root}/.framework-output/<stage>/`. One person can play any role; no per-stage repo separation. Recommended starting point.
- **Separation-of-Duties (SoD).** Each SDLC stage writes to a dedicated role-restricted repo (BA-repo for requirements, architect-repo for design, tester-repo for testing) or colocates with the relevant source repo (planning + execution). The framework checks `[user].role` from `project.user.toml` against the stage's `write_role` at every write boundary; per-repo write access at the platform level (GitHub teams, etc.) provides the hard guardrail. For teams that need RBAC at the artifact level.

SoD is **opt-in per-stage** — a project may flip requirements to SoD while leaving execution on legacy paths. Both modes use the same `start-project` entry point and the same skills under the hood.

#### Step 3a — Legacy setup (recommended starting point)

1. Open the workspace folder in the IDE alongside the AIDE folder and your project repo(s).
2. From within the workspace folder, invoke `/start-project`.
3. Answer the elicitation prompts:
   - **Flow:** greenfield / brownfield / quick-dev
   - **Identity:** `name`, `code` (lowercase kebab-case), `domain`, optional `description`
   - **Paths:** stage output directories (defaults to `{project-root}/.framework-output/<stage>/`); `knowledge_base_path` for greenfield/brownfield (default `{project-root}/../knowledge-base-repo`)
   - **Glossary:** optional inline terms + reference files
   - **Repos:** for multi-repo projects, one entry per source repo with `code`, `name`, `path`, `role`
   - **Decision-table prefills:** compliance regime, team size, deployment model, etc.
4. The skill writes `project.toml` (committed) and optionally `project.user.toml` (gitignored personal overrides), then hands off to the first skill of the chosen flow:
   - **greenfield** → `/create-requirements-package`
   - **brownfield** → `/analyze-repository`
   - **quick-dev** → `/document-quick-change`

The resulting `project.toml` contains `[project]`, `[project.paths]`, `[project.glossary]`, `[project.elicitation]`, and (for multi-repo) `[[project.repos]]` blocks. **No `[stages.*]` blocks** — that's what keeps the project in legacy mode.

#### Step 3b — Separation-of-Duties setup

SoD requires the same `start-project` bootstrap, plus a hand-edit to `project.toml` to declare per-stage role policy. `start-project` does not yet elicit SoD config interactively (planned future enhancement) — for now, follow this two-step path:

1. **Run `/start-project` first** to produce a working legacy `project.toml` exactly as in Step 3a.
2. **Hand-edit `project.toml`** to add `[stages.<stage>]` blocks declaring the host repo (or colocation) and write role for each SoD-adopting stage. Using the recommended sibling layout, point each `dir` at a sibling repo via `..`:

   ```toml
   [project]
   artifact_subdir = ".framework-output"

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
   ```

3. **Add your role** to `project.user.toml` (gitignored):

   ```toml
   [user]
   role = "Developer"   # or BA / Architect / BSA / Tester / KB-Steward
   ```

The skill layer compares `[user].role` against `[stages.<stage>].write_role` at every write boundary and refuses mismatched writes. Stages without role policy declared (`dir` or `colocate_with_source` unset) fall back to legacy resolution exactly as today — adoption is per-stage.

For the full SoD design (path resolution rules, cross-cutting feature handling, validator rules), see `_docs/sod-multi-repo-proposal.md`. For the full annotated `project.toml` schema including the SoD example block, see `config/project.toml.example`.

### Step 4 — Where to go next

If you're unsure which skill to invoke for a given goal, run `/framework-navigator` — it routes a plain-English goal to the right skill, or shows the catalog. Otherwise follow each skill's `## Next skill` handoff at the end of its run.

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
| `quality` | Quality packages: strategy + test design (traced to ACs) + QE plan (automation / CI gates / test data / release gates). Plus three anytime-invocable skills: `audit-quality-coverage`, `review-test-failures`, `execute-quality-increments` (optional TC-XXX flow) |
| `execution` | Implemented code, increment-status, bug log, PR (`execute-increments`, `manage-bugs`, `create-pr`) |
| `reverse-engineering` | Per-repo Part A internal + Part B consumer docs (`analyze-repository` dispatcher + 11 domain skills), plus `review-reverse-engineering-package` — the per-repo readiness gate for the review close-out path |
| `knowledge-base` | The global multi-repo KB, both halves. Code-grounded: `build-`, `navigate-`, `update-`, `detect-knowledge-base-drift`, `verify-knowledge-base-coverage`, `build-mainframe-data-lineage`. Human-grounded: `capture-solution-context`, `generate-ai-rules`, `document-operations`. Plus `review-knowledge-base-package` for the periodic audit |
| `quick-dev` | Lightweight scoped-change path (`document-`, `plan-`, `execute-quick-change`) |

## Knowledge base

The KB **lives in its own repo**, separate from A.I.D.E. `project.toml`'s `[project.paths] knowledge_base_path` points at it. Open both repos in one multi-root workspace; coding agents access both.

The KB is markdown-first. Agents traverse it via `read + grep + glob` over per-component frontmatter (`description`, `triggers`, `paths`, `depends_on`, `consumed_by`, …) — **no vector DB**, no embeddings. The root `ARCHITECTURE.md` (5–15 KB) loads first; `navigate-knowledge-base` selects the minimal component set for a given feature.

The KB has **two halves**. The code-grounded half (`ARCHITECTURE.md`, `components/`, `graph.json`, `source-docs/`) is derived from reverse-engineering and git. The human-grounded half (`shared/{solution-context, ai-rules, operations}/`) covers what code cannot reveal — mission, personas, goals and KPIs, constraints, vendor relationships, ownership and on-call, plus the AI coding guardrails in `shared/ai-rules/project-context.md`. RE is rigorous about structure and behaviour, and blind to intent; the second half exists for that. Both are project-scoped and persist across features.

See `config/SCHEMAS.md` § 3 for KB schemas, `templates/blocks/knowledge-base/` for KB block templates, and `.agents/skills/knowledge-base/README.md` for the 10 KB skills.

## Reverse engineering

Reverse engineering produces, per repo, a **Part A** (internal implementation docs) and a **Part B** (consumer-facing docs) artifact set. RE outputs are the primary input to `build-knowledge-base`, but they are also useful standalone — e.g., onboarding a new maintainer to an unfamiliar service.

Entry point is `analyze-repository`: a thin dispatcher that classifies the repo (handling monorepos and hybrids) and names the next skill to invoke. The eleven domain skills:

| Domain | Skill | Typical target |
|---|---|---|
| `api` | `reverse-engineer-api` | A specific API service (REST, GraphQL, RPC) |
| `api-framework` | `reverse-engineer-api-framework` | A framework for *building* APIs (e.g., Express, FastAPI) |
| `web-app` | `reverse-engineer-web-app` | A specific web application (SPA, SSR, hybrid) |
| `ui-framework` | `reverse-engineer-ui-framework` | A framework for *building* UIs (e.g., React, Vue, design systems) |
| `database` | `reverse-engineer-database` | A schema, data model, or DB-layer service |
| `mobile-app` | `reverse-engineer-mobile-app` | A specific mobile application (iOS, Android, cross-platform) |
| `mobile-framework` | `reverse-engineer-mobile-framework` | A framework for *building* mobile apps (e.g., React Native, Flutter) |
| `cobol-program` | `reverse-engineer-cobol-program` | COBOL / PL/I program source with executable procedure logic |
| `copybook-library` | `reverse-engineer-copybook-library` | Mainframe record layouts and copybook data dictionaries |
| `jcl-job` | `reverse-engineer-jcl-job` | Mainframe batch jobs, PROCs, INCLUDEs, and control cards |
| `test-suite` | `reverse-engineer-test-suite` | A dedicated standalone test-automation repository |

Each domain ships paired compositions in `templates/compositions/`: `re-<domain>-internal.yaml` (Part A) and `re-<domain>-consumer.yaml` (Part B).

### The close-out gate

An extraction does not close itself. Every domain skill ends by **asking** the user how
the output should be attested before the KB ingests it, then routing:

- **`automated`** — `steps/verify.md` runs the machine-checkable (**Tier M**) checks and
  issues a `MECHANICAL: GO / NO-GO`. Checks that only the model can judge (**Tier J**) are
  reported UNVERIFIED and never counted toward GO. A GO with a non-empty UNVERIFIED list
  is the normal outcome: it says *well-formed*, not *correct*.
- **`review`** — the same Tier M checks run first as evidence, then
  `review-reverse-engineering-package` runs nine ordered sub-reviews with per-verdict human
  acceptance and writes an APPROVED / CONDITIONAL / BLOCKED readiness verdict to disk.
  Additive: choosing review keeps every mechanical check and adds judgment on top.

`build-knowledge-base` requires one of the two attestations per repo and halts on an
extraction that carries neither. `[project.elicitation].re_verification_gate`
(`ask` default / `review` / `automated`) pre-answers the question for unattended runs; an
unattended run left on `ask` fails fast rather than the AI picking a mode.

See `references/elicitation-patterns/re-verification-gate-selection.md` for the routing
contract, `.agents/skills/reverse-engineering/README.md` for the full domain catalog, and
`templates/blocks/reverse-eng/` for the per-domain block libraries.

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
