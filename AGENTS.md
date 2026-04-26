# theframework — AI orientation

This folder is **theframework**, a skills-based SDLC methodology framework conforming to [agentskills.io](https://agentskills.io). When this folder is open in a multi-root workspace, the AI agent has access to all framework skills via the host's default `.agents/skills/` discovery root — no configuration required.

## Using the framework

- Invoke any skill via slash command: `/<skill-name>` (e.g. `/start-project`, `/framework-navigator`, `/create-requirements-package`).
- If unsure which skill fits a goal, invoke `/framework-navigator` first — it routes a plain-English goal to the right skill, or shows the catalog.
- Each skill's `SKILL.md` declares **when** to use it (the `description:` is the trigger). Detail lives in `references/`, loaded on demand. Don't pre-load `references/`.
- Skill-to-skill handoffs happen by name (`## Next skill\n<name>`), never by `@`-include — this preserves context budget.

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

The KB lives in its own repo, separate from theframework and from any application repo.

## What this folder is NOT

This folder is **theframework**, not the user's project. Do **not** write user code, project artifacts, or implementation deliverables into `.agents/skills/`, `templates/`, `config/`, `scripts/`, or `references/` here. Those locations are framework-internal. The user's work product lives in their own project's workspace folder.

The single exception: if the user explicitly says they're working on theframework itself — adding a new skill, fixing a script, updating a template — then treat this folder as the project. Otherwise, leave it alone.

## Where to find more

- `README.md` — host setup, top-level layout, stages, knowledge-base architecture, vocabulary, maintenance scripts.
- `.agents/skills/_registry/skills.csv` — generated catalog of every skill (32 of them) with description and stage.
- `.agents/skills/_registry/workflow-graph.yaml` — hand-authored stage flow / gates.
- `_docs/requirements.md` — framework-internal requirements; not part of any shippable artifact.
