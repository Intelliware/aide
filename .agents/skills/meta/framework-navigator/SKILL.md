---
name: framework-navigator
description: "Use when the user asks for help choosing or finding a skill, says 'help', 'what's next', 'what should I do next', 'what's my best option', 'how do I…', 'where do I start', 'I'm not sure which skill', 'what skills are available', 'show me the catalog', 'list all the skills', or describes a goal in plain English instead of invoking a specific skill (e.g. 'I want a quick change to this project', 'I want to RE this API into the global KB', 'help me write requirements'). Routes to the right skill based on workspace state and goal description; supports goal mode (state probe + match + recommend) and catalog mode (stage-grouped listing). Reads project.toml and on-disk artifacts, then names exactly one downstream skill and the trigger phrase to invoke it. Never performs the work itself."
---

# Framework Navigator

## Overview

Help router for A.I.D.E. Two operating modes:

- **Goal mode** — user states a goal in plain English; navigator probes workspace state, matches against the skill catalog, asks at most two disambiguating questions, and recommends exactly one downstream skill plus the trigger phrase to invoke it.
- **Catalog mode** — user asks "show me what's here"; navigator renders a stage-grouped table of every skill plus the canonical flow sequences.

The navigator does **not** perform documentation, planning, design, or coding work. Its single job is to point at the next skill.

## When to use

- "help" / "I need help" / "what should I do next"
- "what's my best option" / "how do I…" / "where do I start"
- "I'm not sure which skill to run"
- "what skills are available" / "show me the catalog" / "list all the skills"
- The user describes a goal in plain English without naming a skill
- The user is mid-flow and re-orients ("am I on the right track?")

## When NOT to use

- The user has already named a specific skill — invoke that skill directly.
- The user wants the framework configured (overrides, suppression, customization) — route to **`customize-framework`**.
- The user wants to add hooks (before/after skill chaining) — route to **`customize-framework`** with operation `add-hook`.
- The user wants to install, enable, or inspect presets — route to **`manage-presets`**.
- The user wants to bootstrap a brand-new project — route to **`start-project`** (the navigator can recommend it but should not perform initialization).
- The user is asking a non-framework question (general coding help, language reference) — answer normally, do not invoke this skill.

## Inputs

See `references/INPUTS-OUTPUTS.md`. Primary inputs:

- The user's utterance (goal vs. catalog request)
- `project.toml` (if present) — flow, paths, knowledge_base_path, decision-table answers
- On-disk stage artifacts (requirements / design / implementation / KB)
- The skill catalog (`skills/_registry/skills.csv` + `skills.json`)
- The flow graph (`skills/_registry/workflow-graph.yaml`)

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Detect mode** — goal vs. catalog. See `steps/01-detect-mode.md`.
2. **State probe** (always; cheap, informs both modes). Read `project.toml` and check stage-artifact existence, plus — when `features.toml` exists — the active feature (opt-in; no-op for projects that never ran `select-feature`). See `steps/02-state-probe.md` and `references/state-probe.md`.
3. **Match or render**:
   - Goal mode: match utterance to catalog descriptions, score candidates via `references/recommendation-rubric.md`, ask up to 2 disambiguating questions if needed. See `steps/03-match-or-render.md`.
   - Catalog mode: render stage-grouped table + flow sequences + anytime list.
4. **Recommend** (goal mode only) — name exactly one skill, give the exact trigger phrase, list any prerequisite skills enforced by `workflow-graph.yaml` gates, show position-in-workflow context. See `steps/04-recommend.md`.

## Output

Goal mode:

- One named skill recommendation
- One quoted trigger phrase the user can paste
- Prerequisites (if any) per the flow graph
- Position-in-workflow note: "this is in the X stage; after it you'd typically run Y"
- Optional flag for ambiguous on-disk state (e.g. multiple flows half-done)

Catalog mode:

- A markdown table with columns: Stage | Skill | Description | When to use this
- The three canonical flow sequences (greenfield / brownfield / quick-dev) listed by skill name
- The `anytime` skills listed separately
- A pointer: "Run framework-navigator with a specific goal to get a personalized recommendation."

Side effects: **none.** Navigator never writes files or invokes other skills.

## Next skill

`<dynamic — selected from catalog>`

Common targets and the trigger phrase the navigator emits to the user:

- `start-project` — "Start a new project with A.I.D.E."
- `analyze-repository` — "Analyze the repo at `<path>` and tell me which RE skill to run."
- `create-requirements-package` — "Create the requirements package for `<feature>`."
- `document-quick-change` — "Document a quick change for `<scope>`."
- `customize-framework` — "Customize the framework for this project."
- `customize-framework` (hooks) — "Add a before-hook to run `<skill>` before `<target-skill>`."
- `manage-presets` — "Show me available presets." / "Install the `<preset-name>` preset." / "Disable the `<preset-name>` preset."
- `select-feature` — "Select (or start) the feature I'm working on." (surfaced as a prerequisite, not a standalone recommendation, when `features.toml` exists but no feature is active — see `references/ai-principles/feature-precondition.md` Mode C)

## Common mistakes

- Recommending more than one skill instead of asking a clarifying question.
- Skipping the state probe and recommending blindly (e.g. recommending `create-requirements-package` when no `project.toml` exists).
- Forgetting to surface gates from `workflow-graph.yaml` (e.g. recommending `create-design-package` without noting `review-requirements-package` must have signed off first).
- Recommending `framework-navigator` itself (never loop).
- Doing the recommended work yourself instead of handing off — emit the trigger phrase and stop.
- Quoting a skill name that is not in `skills/_registry/skills.csv` (always cross-check).
- Pulling stage names or flow names from training-data instinct rather than `workflow-graph.yaml`.
- Halting or refusing to recommend when no feature is active. The navigator surfaces `select-feature` as a prerequisite note (like any other unmet gate) — it never blocks its own answer on it.
