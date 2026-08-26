# A.I.D.E. (AI Integrated Delivery Enablement) — AI orientation

This folder is **A.I.D.E.**, a skills-based SDLC methodology framework conforming to [agentskills.io](https://agentskills.io). When this folder is open in a multi-root workspace, the AI agent has access to all framework skills via the host's default `.agents/skills/` discovery root — no configuration required.

## Using the framework

- Invoke any skill via slash command: `/<skill-name>` (e.g. `/start-project`, `/framework-navigator`, `/create-requirements-package`).
- If unsure which skill fits a goal, invoke `/framework-navigator` first — it routes a plain-English goal to the right skill, or shows the catalog.
- Each skill's `SKILL.md` declares **when** to use it (the `description:` is the trigger). Detail lives in `references/`, loaded on demand. Don't pre-load `references/`.
- Skill-to-skill handoffs happen by name (`## Next skill\n<name>`), never by `@`-include — this preserves context budget.

## Operational contracts for `create-*` skills (MUST honour)

Any `create-*` skill (`create-requirements-package`, `create-design-package`, `create-implementation-package`) MUST read and apply `<AIDE root>/references/ai-principles/write-discipline.md` **before** executing its first step. "AIDE root" is the folder containing this `AGENTS.md` and the `.agents/` directory — when AIDE is installed under `./AIDE/`, the file resolves to `./AIDE/references/ai-principles/write-discipline.md`.

The contract enforces:

1. The three mandatory user prompts (acknowledgement mode, output structure, confirmation) fire **before** Step 0.
2. The **write-on-acknowledge invariant** — every artifact is written to disk as soon as it is complete; nothing is accumulated in conversation for a single bulk write at the end.
3. The **per-section persistence checkpoint** — every section closes by confirming its file exists on disk before advancing.
4. The **closing inventory check** — before any `## Next skill` handoff, the AI verifies every composition-expected artifact exists on disk with non-trivial content.

Violating any of the above is a defect, not a style preference. The `review-*` skills treat missing per-section files as a finding.

## Operational contract for hook execution (MUST honour, all skills)

Unlike the write-discipline contract above, this obligation is **not** limited to `create-*` skills. Any skill can be configured as a hook host or hook target — `[[hooks]].skill` in `customizations/<skill>.toml` resolves to any registered skill, with no category restriction (see `config/SCHEMAS.md` § 2.5.1). So every A.I.D.E. skill MUST read and apply `<AIDE root>/references/orientation/hook-runtime.md` at its own skill boundaries: before Step 0, and after its final step, before the `## Next skill` handoff.

This is conditional, not unconditional like write-discipline's prompts: if the merged config has no `[[hooks]]` entries scoped to the running skill, the check is a no-op. But the check itself — consulting the merged config for hooks at both boundaries — MUST always happen, because that is the only way a hook configured by a user via `/customize-framework add-hook` (or shipped in a preset) actually fires.

Proceeding past Step 0, or emitting `## Next skill`, without checking for configured hooks is a defect — it silently defeats any hooks the user or a preset configured, regardless of what `customizations/<skill>.toml` contains.

## Vocabulary

- **Stage** — SDLC-level grouping of work.
- **Increment** — implementation chunk, IDs `INC-XXX`, conforming to the canonical 8-section shape.
- **Package** — artifact produced by a stage (requirements-package, design-package, implementation-package).
- Avoid: "phase" (overloaded), "epic", "story", and other agile-method vocabulary.

## Project context

If a sibling workspace folder contains `project.toml`, that file is the project's super-context. It declares the active flow (greenfield / brownfield / quick-dev) and any project-specific config layered over the framework defaults. Skills read `project.toml` automatically when they need to.

If no sibling folder has `project.toml` yet, suggest `/start-project` to create one.

The framework's own folder (this one) does **not** contain a `project.toml`. The user's project does.

## Knowledge base

Multi-repo solutions may also include a knowledge-base repo as a separate sibling workspace folder. The KB is markdown-first and traversed via agentic search (`read + grep + glob`) — there is no vector DB, no embeddings. Use:

- `/navigate-knowledge-base` — select the minimal component set for a feature
- `/build-knowledge-base` — initial creation from reverse-engineering output
- `/update-knowledge-base` — keep it current after shipping
- `/detect-knowledge-base-drift` — flag source repos that have changed without KB updates
- `/verify-knowledge-base-coverage` — ensure every public artifact maps to ≥1 KB component

The KB lives in its own repo, separate from A.I.D.E. and from any application repo.

## Customization

A.I.D.E. supports three levels of customization, all opt-in:

### Layer overrides (customize-framework)

Override any config value without editing framework files. Use `/customize-framework` to:
- Change skill defaults (elicitation depth, artifact counts, etc.)
- Suppress optional artifacts team-wide or personally
- Pin elicitation answers so skills don't re-ask
- Add custom blocks to compositions

The five-layer config model (`framework.toml` → `framework.user.toml` → `project.toml` → `project.user.toml` → `customizations/<skill>.toml`) ensures overrides are explicit and auditable.

### Hooks (skill chaining)

Run one skill automatically before or after another. Every skill's execution side is bound to the hook contract — see "Operational contract for hook execution" above; this subsection covers authoring hooks, not consuming them. Hooks are declared in `customizations/<skill>.toml` as `[[hooks]]` entries:

```toml
[[hooks]]
code = "kb-check"
event = "before"
skill = "navigate-knowledge-base"
condition = "project.paths.knowledge_base_path != ''"
```

Use `/customize-framework` with operation `add-hook` to author hooks interactively. See `config/SCHEMAS.md` § 2.5.1 for the full schema.

### Presets (reusable bundles)

Presets are shareable bundles of customization files. They ship in add-on repos or local `presets/` directories. Use `/manage-presets` to:
- `discover` — find available presets in the workspace
- `install` — add a preset to `presets.toml`
- `enable` / `disable` — toggle presets without removing them
- `show` — inspect what a preset contains before installing

Presets merge between Layer 4 and Layer 5, so project-local customizations always win. See `config/SCHEMAS.md` § 2.10–2.11.

## What this folder is NOT

This folder is **A.I.D.E.**, not the user's project. Do **not** write user code, project artifacts, or implementation deliverables into `.agents/skills/`, `templates/`, `config/`, `scripts/`, or `references/` here. Those locations are framework-internal. The user's work product lives in their own project's workspace folder.

The single exception: if the user explicitly says they're working on A.I.D.E. itself — adding a new skill, fixing a script, updating a template — then treat this folder as the project. Otherwise, leave it alone.

## Where to find more

- `README.md` — host setup, top-level layout, stages, knowledge-base architecture, vocabulary, maintenance scripts.
- `.agents/skills/_registry/skills.csv` — generated catalog of every skill with description and stage.
- `.agents/skills/_registry/workflow-graph.yaml` — hand-authored stage flow / gates.
- `_docs/requirements.md` — framework-internal requirements; not part of any shippable artifact.
