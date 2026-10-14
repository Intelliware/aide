---
name: capture-solution-context
description: "Use when the user wants to capture project-level solution context that the code cannot tell you — mission, personas, goals/KPIs, constraints, external integrations, ownership/RACI; says 'capture solution context', 'document the solution', 'set up project context', 'document who uses this and why', 'capture business context for the KB'; or when bootstrapping a new project's knowledge base after RE → build-knowledge-base. Produces six markdown files under <KB>/shared/solution-context/ plus a glossary delta. Interactive by default; supports --non-interactive for CI runs that stub from RE outputs."
---

# Capture Solution Context

Project-scoped, KB-resident, persistent-across-features. Captures the
"why / who / under-what-constraints" layer that reverse-engineering and the
component graph cannot recover from code alone. The artefact is the
solution-context layer of the KB — a sibling of `components/` and
`shared/{entities,cross-cutting,adrs}/`.

This skill is **interactive by default**. The value comes from the
discovery itself; running it autonomously produces a stub with TODOs
flagged for a human follow-up pass.

## Overview

Six discovery steps, each producing one markdown file under
`<KB>/shared/solution-context/`:

| Step | File produced | Topic |
|---|---|---|
| 02 | `00-overview.md` | Mission, value prop, classification, multi-part summary |
| 03 | `10-personas-and-use-cases.md` | Who uses it, key journeys, jobs-to-be-done |
| 04 | `20-goals-and-kpis.md` | Measurable outcomes, success metrics, baselines |
| 05 | `30-constraints-and-compliance.md` | Regulatory, contractual, NFR ceilings |
| 06 | `40-external-integrations.md` | SaaS, vendors, third-party APIs at org level |
| 06 | `50-ownership-and-raci.md` | Teams, decision authority, on-call ownership |

Each leaf carries trigger-style frontmatter (`description`, `triggers`,
`paths`) so `navigate-knowledge-base` can surface it when a feature
description matches.

Step 07 finalises and appends the glossary delta to
`<KB>/glossary.md`.

## When to use

- The user says "capture solution context", "document the solution",
  "set up project context", "document who uses this and why", "capture
  business context for the KB", or asks for a project-level overview the
  code can't produce.
- Brownfield: after `verify-knowledge-base-coverage` (so the component
  catalog exists and can be linked from solution-context leaves).
- Greenfield: after `start-project` and **before**
  `create-requirements-package` (solution context informs the first
  requirements package).
- Refresh: any time the solution shifts materially (new persona, new
  vendor, regulatory change, M&A, repo added).

## When NOT to use

- The user wants feature-scoped requirements → use
  `requirements/create-requirements-package` (it has its own brownfield
  discovery; that artefact is feature-scoped, not project-scoped, and the
  two layers do not overlap).
- The user wants AI coding rules (versions, conventions, language quirks)
  → use `generate-ai-rules`.
- The user wants deployment/SLO/runbook docs → use `document-operations`.
- The KB is not yet populated and `[[project.repos]]` is empty — run
  `start-project` and the RE stage first.

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| `project.toml` | `{project-root}/project.toml` | Yes | Reads `[project]`, `[project.paths]`, `[[project.repos]]`, `[project.glossary]`. |
| `knowledge_base_path` | `project.toml [project.paths]` | Yes | Solution-context leaves are written under `<KB>/shared/solution-context/`. |
| Existing component catalog (if present) | `<KB>/components/`, `<KB>/ARCHITECTURE.md` | No | When present, persona use-cases and KPIs link to relevant components by `component_id`. |
| User responses to elicitation prompts | Interactive | Yes (interactive mode) | Drives every step's body. Skipped in `--non-interactive` mode (TODO stubs emitted). |
| RE-derived classification | `<KB>/source-docs/<repo>/part-a/**` | No | Auto-fills `00-overview.md` § Classification when present. |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Read the step file only when starting it.

1. **Detect existing context** — `steps/01-detect-existing.md`
2. **Elicit mission & overview** — `steps/02-elicit-mission.md`
3. **Elicit personas & use cases** — `steps/03-elicit-personas.md`
4. **Elicit goals & KPIs** — `steps/04-elicit-goals-kpis.md`
5. **Elicit constraints & compliance** — `steps/05-elicit-constraints.md`
6. **Elicit integrations & ownership** — `steps/06-elicit-integrations-and-ownership.md`
7. **Emit & glossary delta** — `steps/07-emit-and-glossary.md`

Steps 02–06 each follow the same shape: load auto-fillable inputs from
RE / project.toml, present findings to the user, run the matching
elicitation pattern, draft the leaf, get user confirmation, save.

In `--non-interactive` mode, steps 02–06 skip elicitation and write
stub leaves with `TODO(human):` markers and the auto-fillable parts
populated. Step 07 still runs.

## Output

```
<knowledge_base_path>/shared/solution-context/
├── 00-overview.md
├── 10-personas-and-use-cases.md
├── 20-goals-and-kpis.md
├── 30-constraints-and-compliance.md
├── 40-external-integrations.md
└── 50-ownership-and-raci.md
```

Plus a glossary delta appended to `<KB>/glossary.md` (preserving
existing entries).

Every leaf carries this frontmatter so `navigate-knowledge-base`
can surface it:

```yaml
---
solution_context_id: <stable-kebab-id>
description: >-
  Use when {{the leaf's discovery topic applies}}
triggers:
  - <keyword 1>
  - <keyword 2>
last_captured: <ISO-8601 date>
last_captured_by: <user identifier from project.toml>
related_components:    # optional; populated when component catalog is present
  - <component_id>
---
```

## Next skill

`generate-ai-rules` (typically runs immediately after).

## Common mistakes

- **Treating this as a requirements skill.** Solution context is
  project-scoped and persistent. Feature requirements live under
  `{paths.requirements_package}/<feature-id>/`. They are different layers.
- **Skipping interactive mode silently in CI.** Always emit
  `TODO(human):` markers in non-interactive output so a human knows the
  leaf is incomplete; never produce a confidently-wrong leaf from auto-
  fill alone.
- **Hand-editing the glossary in-place.** Step 07 owns the glossary
  delta path; preserve existing entries and append only new ones with a
  clear date marker.
- **Linking to component_ids that don't exist.** If a persona's use
  case maps to a feature not yet catalogued, leave `related_components`
  empty rather than inventing IDs.
- **Authoring leaves without `Use when …` descriptions.**
  `navigate-knowledge-base` matches on this exact phrasing —
  `verify-knowledge-base-coverage` flags violations.
- **Overwriting an existing solution-context leaf without confirmation.**
  Step 01 enforces this.
