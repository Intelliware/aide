# A.I.D.E. — Requirements

This document captures the requirements expressed during the unification design conversation (2026-04-25). It records *what* the framework must do and *why*, separate from *how* it was implemented (covered in `_archive/skill-disposition.md`, `config/SCHEMAS.md`, and `README.md`).

---

## Vision

A unified, skills-based SDLC methodology framework for AI-assisted software engineering. Replaces a fragmented set of legacy folders with one coherent system supporting:

- **Greenfield** — full SDLC for new projects (requirements → design → planning → execution)
- **Brownfield** — reverse-engineer existing repositories into a knowledge base, then enhance
- **Quick-dev** — lightweight scoped change (combined spec + plan + execute)

with a **global, multi-repository knowledge base** that survives feature evolution.

---

## Functional Requirements

### FR1. Skills-based architecture
- **FR1.1.** Every capability shall be a **skill** conforming to the [agentskills.io](https://agentskills.io) standard.
- **FR1.2.** Every skill shall be a directory containing a `SKILL.md` with YAML frontmatter (`name` + `description` minimum).
- **FR1.3.** Skill descriptions shall be written as **trigger conditions** ("Use when…"), never workflow summaries.
- **FR1.4.** `SKILL.md` shall be ≤200 lines; detail lives in `references/` loaded on demand.

### FR2. Three flows
- **FR2.1.** Greenfield flow: requirements package → design package → implementation package (broken into INC-XXX increments) → execution.
- **FR2.2.** Brownfield flow: reverse-engineer existing repos → build knowledge base → run enhancement stages in brownfield mode (consuming the KB).
- **FR2.3.** Quick-dev flow: lightweight scoped-change spec + plan + execute, skipping full requirements / design / planning packages.
- **FR2.4.** The flow choice shall live in `project.toml`; skills shall be **mode-aware** rather than duplicated per flow.

### FR3. Reverse-engineering
- **FR3.1.** The framework shall provide RE for 7 repository types: api, api-framework, web-app, ui-framework, database, mobile-app, mobile-framework.
- **FR3.2.** RE shall produce per-repo Part A (internal implementation docs) and Part B (consumer-facing docs).
- **FR3.3.** A thin dispatcher (`analyze-repository`) shall classify the repo type and recommend the right domain skill.
- **FR3.4.** RE skills shall ask the user which directories within a project to reverse-engineer.

### FR4. Block-and-composition templates
- **FR4.1.** The framework shall have **one** library of section blocks; templates are composed from those blocks.
- **FR4.2.** Compositions are YAML manifests selecting an ordered set of blocks per artifact.
- **FR4.3.** Reduced templates (e.g., quick-dev) shall be smaller compositions over the **same trunks** — no parallel template trees.
- **FR4.4.** Blocks shall live under `templates/blocks/<stage>/`; compositions under `templates/compositions/`.
- **FR4.5.** Each block shall carry frontmatter: `slug`, `title`, `applies-to`, `requires-decision-from`, `optional`, `order-hint`.

### FR5. Configuration & customization
- **FR5.1.** Four-layer TOML configuration model with deep merge:
  - Layer 1 — `framework.toml` (installer-managed defaults, shipped)
  - Layer 2 — `framework.user.toml` (personal global, gitignored)
  - Layer 3 — `project.toml` (project super-context, committed)
  - Layer 4 — `project.user.toml` (personal project, gitignored)
  - Plus per-skill overrides under `config/customizations/<skill>.toml` and `.user.toml`.
- **FR5.2.** Merge semantics: scalars override; tables recursive-merge; arrays of keyed objects merge-by-`code`/`id`; otherwise append.
- **FR5.3.** A `_suppress: true` marker shall let any layer suppress (not just override) a base entry.
- **FR5.4.** A `customize-framework` skill shall write overrides interactively, without hand-TOML editing.

### FR6. User interaction & elicitation
- **FR6.1.** Skills shall elicit input materials from the user at workflow start: source directories, reference documents, glossary entries, decision-table answers.
- **FR6.2.** Elicitation prompts shall be **reusable** across skills, living under `references/elicitation-patterns/<name>.md`.
- **FR6.3.** Elicitation shall be conversational — questions asked one at a time, multiple-choice preferred where applicable.

### FR7. Self-documenting skills
- **FR7.1.** Every skill shall ship at minimum three reference files:
  - `references/OVERVIEW.md` — purpose / when to use / when NOT to use / position in workflow
  - `references/INPUTS-OUTPUTS.md` — inputs table + outputs table
  - `references/EXAMPLE.md` — one real worked example
- **FR7.2.** A human browsing the repo shall be able to understand any skill from `references/OVERVIEW.md` alone.

### FR8. Help router
- **FR8.1.** The framework shall provide a natural-language help router (`framework-navigator`) for queries like "I want to do a quick change, what's my best option?" or "How do I reverse-engineer this API project into the global knowledge base?".
- **FR8.2.** The router shall support two modes:
  - **Goal mode** — user describes a goal; router asks up to 2 clarifying questions; recommends a single skill plus the exact trigger phrase to type.
  - **Catalog mode** — user asks "show me what's here"; router renders a stage-grouped table of all skills.
- **FR8.3.** Goal mode shall **probe workspace state** (artifacts on disk, flow in `project.toml`, KB presence) before recommending.
- **FR8.4.** The router shall consume a **generated skill registry** (`.agents/skills/_registry/skills.csv`) plus a **hand-authored workflow graph** (`.agents/skills/_registry/workflow-graph.yaml`).

### FR9. Global knowledge base
- **FR9.1.** The framework shall support a multi-repository knowledge base that:
  - **FR9.1.1.** Is created initially by reverse-engineering existing repositories.
  - **FR9.1.2.** Is sufficiently decomposed so coding agents do **not** load the whole KB into context.
  - **FR9.1.3.** Includes a guiding architecture / index document mapping what each component does, so an agent can selectively load only components pertinent to a feature.
  - **FR9.1.4.** Is maintained over time — each shipped feature updates the KB with what changed.
- **FR9.2.** The KB shall live in **its own repository**, separate from A.I.D.E.
- **FR9.3.** Multi-repo solutions shall be supported by opening multiple repos in one VSCode workspace, or cloning under a common parent directory.
- **FR9.4.** The framework shall provide skills to:
  - **Build** the KB from RE outputs
  - **Navigate** it (return the minimal component set for a given feature)
  - **Update** it on feature ship
  - **Detect drift** (source repos changed but KB hasn't)
  - **Verify coverage** (every public artifact maps to ≥1 KB component)
- **FR9.5.** The KB shall be **markdown-first** and traversed with **agentic search** (`read + grep + glob`) — no vector DB, no embeddings.
- **FR9.6.** Each KB component shall carry frontmatter (`description`, `triggers`, `paths`, `depends_on`, `consumed_by`, `data_entities`, `last_verified_against_commit`, …) for selective load and drift detection.

### FR10. Vocabulary
- **FR10.1.** The framework shall use the vocabulary: **stage** (SDLC-level grouping), **increment** (implementation chunk conforming to the canonical 8-section shape), **package** (artifact produced by a stage).
- **FR10.2.** The framework shall **not** use: "phase" (overloaded), "epic", "story", or other agile-method vocabulary.
- **FR10.3.** Implementation chunks shall use IDs `INC-XXX` (replacing legacy `PHASE-XXX`).

### FR12. Framework-level always-on orientation
- **FR12.1.** A.I.D.E. shall ship an `AGENTS.md` file at its repo root containing AI-agent orientation: skill discovery path, slash-invocation convention, framework vocabulary (stage / increment / package), the `project.toml` and knowledge-base conventions (phrased folder-agnostically because the framework cannot know sibling folder names), and a guard rail clarifying that the framework's own folder is not the user's project.
- **FR12.2.** The shipped `AGENTS.md` shall be auto-attached to every chat by both supported hosts (Copilot and Cursor read `AGENTS.md` universally) when A.I.D.E. is opened as a workspace folder. No project-side configuration shall be required for framework orientation.
- **FR12.3.** Project-side always-on context (the user's own `AGENTS.md`, `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, or `.cursor/rules/*.mdc`) shall remain **optional** and scoped to **project-specific** guidance only — codebase conventions, path-scoped rules, etc. The framework shall not require users to copy framework-orientation content into their project.
- **FR12.4.** The shipped `AGENTS.md` shall be tight (orientation, not documentation) so its always-attached cost is small even in chats unrelated to active framework use.

### FR11. Reorganization & migration
- **FR11.1.** The seven legacy folders (`_shared`, `implementation-execution`, `implementation-planning`, `model-2-sdlc-skills`, `requirements-package`, `reverse-engineering`, `solution-design-package`) shall be consolidated and archived under `_archive/`.
- **FR11.2.** Every existing skill shall be **audited** (keep / fold / drop / split) before any folder move.
- **FR11.3.** The framework shall preserve historical context — nothing is deleted, only moved to `_archive/`.

---

## Non-Functional Requirements

### NFR1. Conformance
- Skills conform to the agentskills.io specification.
- Skill descriptions ≤ 1024 characters per spec.

### NFR2. Progressive disclosure
- `SKILL.md` ≤ 200 lines; deeper content lives in `references/` loaded on demand.
- Skill-to-skill handoffs by **name** (`## Next skill\n<name>`), never by `@`-include — preserves context budget.

### NFR3. Validation
- The framework shall ship a `scripts/build-registry.py` that walks frontmatter and emits a registry; warns on missing fields, missing `references/` trio, oversized `SKILL.md`.
- The framework shall ship a `scripts/validate.py` that validates composition/block cross-references, workflow-graph resolution, description discipline, and stale "phase" language.

### NFR4. Scope safety
- Agents working on the framework shall read/write only within the project directory tree.
- Destructive operations (folder moves, deletions) shall require user confirmation unless pre-approved.

### NFR5. Host portability
- **NFR5.1.** Skills shall execute correctly in any AI host that conforms to the agentskills.io specification. The framework's currently-supported hosts are:
  - **VSCode + GitHub Copilot agent mode** (formal spec adoption shipped 2025-12-18), and
  - **Cursor IDE** (native agentskills.io support from ~v2.3.x).
  - Claude Code support is **parked** as of 2026-04-26 — the skills remain spec-conformant, so future re-enablement is a documentation-only change, but no current installation guidance targets Claude Code.
- **NFR5.2.** No host-specific transformation of `SKILL.md`, `references/`, `steps/`, `scripts/`, or `assets/` shall be required at install time. Compositions (`templates/compositions/*.yaml`) and `project.toml` are framework-internal — skills consume them directly and the host is not asked to parse them.
- **NFR5.3.** The framework shall ship per-host installation guidance in `README.md` covering:
  - Skill discovery — both supported hosts list `.agents/skills/` among their default `chat.agentSkillsLocations` (Copilot) / fixed discovery roots (Cursor), so opening A.I.D.E. as a workspace folder alongside the target project is sufficient; no settings.json edits, symlinks, or overlays.
  - Framework orientation — automatic via A.I.D.E.'s shipped `AGENTS.md` (per FR12); no project-side wiring required.
  - Optional project-side guidance: `.github/copilot-instructions.md` / project-root `AGENTS.md` / `.github/instructions/*.instructions.md` for Copilot; project-root `AGENTS.md` / `.cursor/rules/*.mdc` (with `alwaysApply: true` / `globs:`) for Cursor — scoped to project-specific rules; compounds with A.I.D.E.'s `AGENTS.md`.
- **NFR5.4.** Adding support for a new spec-conformant host shall require only README guidance — no changes to `.agents/skills/`, `references/`, `templates/`, `scripts/`, or `config/` that are specific to one host.

---

## Constraints & Influences

### Inspirations to draw from
- **BMAD method**: four-layer config, phase-grouping UX, elicitation-first conversational discovery, `customize-framework` pattern, greenfield-vs-brownfield as first-class entry points, two-tier registry pattern
- **Superpowers**: description = trigger conditions only (not workflow summary), skill-to-skill handoff by name, durable artifact paths as the durable handoff between stages, multi-stage workflow with hard gates
- **agentskills.io**: required frontmatter, progressive disclosure, `references/` convention. Adopted natively by Claude Code (reference host, currently parked as a target host), by GitHub Copilot in VSCode (from 2025-12-18), and by Cursor IDE (~v2.3.x); the same `SKILL.md` files run in all three.
- **Claude Code**: CLAUDE.md hierarchy for auto-load on cwd, agentic search over RAG, slash-command discovery (kept as design inspiration even though Claude Code is not a currently-supported runtime host)
- **GitHub Copilot (VSCode)**: `.github/copilot-instructions.md` / `AGENTS.md` for always-on orientation; `.github/instructions/*.instructions.md` with `applyTo:` glob for path-scoped rules; `chat.agentSkillsLocations` workspace setting for custom skill roots
- **Cursor IDE**: `.cursor/rules/*.mdc` (with `alwaysApply: true` for project-wide rules, `globs:` for path-scoped); `.cursor/skills/` and `.agents/skills/` as primary discovery roots (with `.claude/skills/` backward-compat)
- **Microsoft GraphRAG**: community-summary hierarchy (root → repo → component) for selective KB retrieval
- **Aider**: separate `graph.json` sidecar for machine-readable component edges
- **GitHub spec-kit**: spec as source of truth feedback loop ("production reality informs specifications")
- **ADRs**: append-only immutability for architecture decisions

### Anti-patterns to avoid
- Copy-pasting Part A internal docs into the KB (link, don't duplicate)
- One giant `KNOWLEDGE.md` file or full vector index (defeats selective context)
- All-caps rage prose in skills (brittle, ages badly)
- Hand-authored monolithic registry (drifts)
- Hand-maintained dependency diagrams not regenerated from a manifest
- Batch / quarterly KB syncs as the only update path
- Hand-tuned, non-uniform frontmatter per repo (breaks grep-based selection)

---

## Decisions made during design (2026-04-25)

These are answers to design questions raised during the conversation, captured as durable decisions:

1. **Authoritative DNA**: model-2-sdlc-skills carries the rapid-dev DNA; the domain folders (requirements-package, solution-design-package, implementation-planning) carry the greenfield-elaborate DNA. Quick-dev derives from the former; greenfield from the latter, with model-2's granularity folded in where it adds value.
2. **Skill granularity**: one skill per **independently-invocable trigger**. Internal sequential steps that are never invoked alone become `steps/<NN>-<name>.md` files inside a parent skill.
3. **Composition format**: YAML.
4. **Skill folder grouping**: by stage (`.agents/skills/requirements/`, `.agents/skills/design/`, …), not by flow.
5. **RE skill count**: keep 7 separate domain skills + a thin `analyze-repository` dispatcher (instead of one skill that elicits domain).
6. **Vocabulary rename**: phase → stage (outer); phase → increment (inner implementation chunk); package retained for artifacts.
7. **KB location**: lives in its own repo, not inside A.I.D.E. Multi-repo workspaces or shared parent directory.
8. **KB retrieval**: markdown + agentic search; no vector DB.
9. **Help router upgrade**: keep the existing `framework-navigator` name; upgrade to two-mode (goal + catalog) help router with state probe.
10. **Self-documenting standard**: 3-file `references/` minimum (OVERVIEW + INPUTS-OUTPUTS + EXAMPLE) for every skill.

---

## Decisions made (2026-04-26)

These supersede or extend the 2026-04-25 decisions above:

11. **Skill location**: skills relocated from `skills/` to `.agents/skills/`. Rationale: `.agents/skills/` is a default discovery root in both currently-supported hosts (VSCode + GitHub Copilot per `chat.agentSkillsLocations` defaults; Cursor per its built-in roots), so a multi-root workspace with A.I.D.E. as a sibling folder gives zero-configuration skill discovery — no `chat.agentSkillsLocations` edits, no symlinks (Windows-fragile), and no overlay/install step.
12. **Repo deployment model**: A.I.D.E. remains its own repository, opened alongside target project repos in a single multi-root VSCode / Cursor workspace. The framework is *not* installed into target projects; templates/, config/, scripts/, and references/ stay at A.I.D.E.'s repo root and are accessed by skills as part of the same workspace.
13. **Claude Code support parked (2026-04-26)**: native installation guidance for Claude Code is removed from `README.md`. Skills remain agentskills.io-conformant, so re-enabling Claude Code support in future is a documentation-only change.
14. **Internal documentation directory**: framework-internal documentation (this `requirements.md`) lives under `_docs/`, following the existing `_<name>/` underscore convention used by `_archive/` and `_bmad/` to signal "not part of any shippable artifact."
15. **Framework-shipped AGENTS.md**: A.I.D.E. ships its own `AGENTS.md` at the repo root (FR12), auto-attached by both Copilot and Cursor when A.I.D.E. is opened as a workspace folder. Rationale: zero-setup orientation, stays in sync with framework versions via `git pull`, eliminates the need for users to copy framework-orientation content into every project. Project-side always-on context becomes optional and scoped to project-specific rules only.

## Status (as of 2026-04-25)

All requirements above and all deferred items are addressed. `scripts/validate.py` reports **0 errors**; remaining warnings are all intentional (orphan KB blocks awaiting their first KB instance, historical "phase" references in migration-mapping docs, tracking blocks with empty `requires-decision-from` by design). The live breakdown is in `_archive/validation-report.md` and re-rendered on each `validate.py --summary-md` run.

### Deferred items completed in follow-up tasks #13–#15

1. **Elicitation pattern files (task #13)** — 20 patterns authored under `references/elicitation-patterns/` covering every reference from skills and compositions.
2. **Missing-side RE blocks (task #14)** — 105 new blocks across the six previously-empty compositions: `re-api-consumer` (17), `re-api-framework-internal` (22), `re-web-app-consumer` (12), `re-ui-framework-internal` (22), `re-mobile-app-consumer` (10), `re-mobile-framework-internal` (22). All compositions now populated.
3. **Truncated `api-internal-doc-template.md` (task #15)** — 15 new blocks for sections 17–31 (caching, background jobs, inter-service comm, file storage, observability, testing, security, performance, build/deploy, feature flags, anti-patterns, new-endpoint checklist, internal types, glossary, complete-feature walkthrough). `re-api-internal` composition now references all 31 blocks.
