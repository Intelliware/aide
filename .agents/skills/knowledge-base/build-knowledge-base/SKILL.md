---
name: build-knowledge-base
description: "Use when initialising a project's knowledge base for the first time, scaffolding the KB after reverse-engineering Part A/B docs land, building the KB on a brownfield onboarding, populating an empty knowledge_base_path, or generating ARCHITECTURE.md plus components/ plus graph.json from RE outputs. Replaces the legacy build-knowledge-repository-phase aggregator."
---

# Build Knowledge Base

Initial KB construction. Reads reverse-engineering Part A/B docs that have been
deposited under `<knowledge_base_path>/source-docs/<repo-slug>/`, then
**scaffolds the entire KB**: per-repo READMEs, per-component leaves with the
mandatory frontmatter, the shared/ pass for entities and cross-cutting
concerns, `graph.json`, `ARCHITECTURE.md`, the root `NAVIGATE.md` (legacy
name: `CLAUDE.md` — readers fall back automatically), and the
synthesized/ 10-folder structure preserved from the legacy aggregator.

This skill replaces and extends `reverse-engineering/phases/build-knowledge-repository-phase.md`.

## Overview

The KB lives in **its own repo** (separate from A.I.D.E.). Its location is
declared by `project.toml`'s `[project.paths] knowledge_base_path`, typically
`"../my-project-kb"` for a sibling-repo layout. This skill is the canonical
way to populate that path on day one.

The KB is markdown-first and traversed by agentic search (`read + grep + glob`).
There is **no vector DB and no embeddings** — the schemas (`ARCHITECTURE.md`
section structure, per-component frontmatter, `graph.json`) ARE the index.

The schemas are the contract: see `config/SCHEMAS.md` § 3 for the full KB
schema. This skill emits artifacts that conform to it.

## When to use

- The user says "build the knowledge base", "initialise the KB", "scaffold
  the knowledge base", "set up the KB from the RE docs", or "create
  ARCHITECTURE.md".
- Reverse-engineering has produced Part A/B docs for every repo and they
  are present under `<knowledge_base_path>/source-docs/<repo-slug>/`.
- `project.toml` has `[project.paths] knowledge_base_path` set to a path
  that exists and is empty (or the user has confirmed overwrite).
- You are in brownfield onboarding flow and the next stage needs grounding.

## When NOT to use

- The KB is already populated and you are reacting to a feature shipping
  → use `update-knowledge-base`.
- A single component needs an ad-hoc lookup → use `navigate-knowledge-base`.
- You suspect drift between source repos and the KB → use
  `detect-knowledge-base-drift`.
- RE Part A/B docs do not yet exist → run the reverse-engineering stage
  first.
- A repo's extraction carries **neither** close-out attestation — no
  `MECHANICAL: GO` verification report and no APPROVED/CONDITIONAL readiness
  verdict → halt and name the repo. The RE close-out gate has two legal exits
  and this is neither; ingesting an unattested extraction is how a defect
  becomes every downstream stage's ground truth. Send the user back to the
  gate rather than ingesting and noting it.
- `project.toml` does not declare `knowledge_base_path` → set it before
  invoking this skill.

## Inputs

| Input | Source | Required |
|---|---|---|
| `project.toml` | `{project-root}/project.toml` | Yes |
| RE Part A + Part B docs | `<knowledge_base_path>/source-docs/<repo-slug>/` | Yes |
| **Close-out attestation, per repo** | either a verification report from the RE skill's `steps/verify.md` in `automated` mode carrying `MECHANICAL: GO`, **or** a `review/readiness-verdict.md` from `review-reverse-engineering-package` reading APPROVED or CONDITIONAL | Yes — one of the two |
| `[[project.repos]]` array | `project.toml` | Yes |
| KB block templates | `templates/blocks/knowledge-base/` | Yes |
| `kb-instance-root` composition | `templates/compositions/kb-instance-root.yaml` | Yes |
| `kb-component` composition | `templates/compositions/kb-component.yaml` | Yes |
| Latest commit SHA per repo | `git rev-parse HEAD` in each `[[project.repos]].path` | Yes |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

Execute one step at a time. Read the step file only when starting that step.

1. **Validate target** — `steps/01-validate-target.md`
2. **Scaffold per-repo entries** — `steps/02-scaffold-repos.md`
3. **Emit components** — `steps/03-emit-components.md`
4. **Shared pass** (entities + cross-cutting) — `steps/04-shared-pass.md`
5. **Emit graph.json** — `steps/05-emit-graph.md`
6. **Emit ARCHITECTURE.md** — `steps/06-emit-architecture-index.md`
7. **Emit root NAVIGATE.md** — `steps/07-emit-navigate-md.md`
8. **Validate coverage** — `steps/08-validate-coverage.md`

The synthesized/ 10-folder structure (preserved from the legacy aggregator)
is created in step 2; its contents are filled incrementally in steps 3–6 as
the per-component frontmatter and graph become available. See
`references/SYNTHESIZED-FOLDERS.md` for the mapping from the legacy
01-architecture-overview…10-repository-maintenance layout to the new
schema-driven artifacts.

## Output

The complete KB at `<knowledge_base_path>/`:

```
<knowledge_base_path>/
├── ARCHITECTURE.md            # root index, conforms to kb-architecture.template.md
├── NAVIGATE.md                # navigation instructions for AI agents (legacy: CLAUDE.md)
├── graph.json                 # machine-readable component dep graph
├── glossary.md                # initialised; populated from project.toml.glossary
├── change-tracker.md          # initialised empty
├── repos/<repo-slug>/{README.md, NAVIGATE.md}
├── components/<repo-slug>/<component-id>.md   # leaves with mandatory frontmatter
├── shared/{entities/, cross-cutting/, adrs/, integration-patterns/}
├── synthesized/01..10/        # 10-folder structure preserved from legacy aggregator
└── source-docs/<repo-slug>/   # symlinks/pointers to each repo's RE docs (untouched)
```

Every public artifact (RE-extracted endpoint, framework symbol, app
entry-point) maps to ≥1 component file. `graph.json` is regenerated from
the depends_on / consumed_by edges in component frontmatter.

## Next skill
verify-knowledge-base-coverage

## Common mistakes

- **Hand-editing graph.json or the capability index in ARCHITECTURE.md** —
  both are derived. Edit the per-component frontmatter and let the skill
  regenerate them.
- **Mixing source-doc content into component bodies** — the KB indexes
  source docs, it does not reproduce them. Keep `source-docs/` as
  symlinks; component bodies summarise and link.
- **Skipping the shared/ pass** — entities referenced by ≥2 components
  must be promoted to `shared/entities/`. Missing this pass produces
  duplicated, drift-prone entity definitions.
- **Using short hashes for `last_verified_against_commit`** — schema
  requires full 40-char SHAs.
- **Treating the synthesized/ folders as optional** — they are the
  preserved legacy structure and downstream tooling expects them. Empty
  files with section headers are acceptable on day one.
- **Authoring components without "Use when …" descriptions** — skill
  routing depends on this exact phrasing. `verify-knowledge-base-coverage`
  flags violations.
- **Overwriting an existing KB without confirmation** — step 1 enforces
  this; do not bypass.
