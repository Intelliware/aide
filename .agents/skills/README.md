# Skills

Each capability in A.I.D.E. is a **skill** following the [agentskills.io](https://agentskills.io) standard: a directory containing a `SKILL.md` (with `name` + `description` frontmatter) plus supporting files.

## Stages

Skills are grouped into stages of work, not into greenfield/brownfield/quick-dev flows. The flow choice lives in `project.toml` and is read by skills as a mode.

| Stage | Purpose |
|---|---|
| `requirements/` | Gather, analyze, write, and review functional and non-functional requirements |
| `design/` | Translate requirements into technical solution design; review designs |
| `planning/` | Break solution design into implementation increments (canonical 8-section shape) |
| `execution/` | Execute increments; manage bugs; create PRs |
| `reverse-engineering/` | Document existing repos (7 domain skills + analyze-repository dispatcher) |
| `knowledge-base/` | Build, navigate, update, and verify the global knowledge base |
| `quick-dev/` | Document, plan, and execute small scoped changes (rapid path) |
| `meta/` | Cross-cutting orchestrators and utilities (start-project, customize-framework, framework-navigator, …) |

## Self-documenting standard

Every skill ships exactly three reference files alongside `SKILL.md`:

- `references/OVERVIEW.md` — purpose, when to use, when not to use, position in workflow
- `references/INPUTS-OUTPUTS.md` — input parameters table + output artifacts table
- `references/EXAMPLE.md` — one real worked example

`SKILL.md` stays under 200 lines and links to these.

## Discovery

The skill catalog is generated from frontmatter into `_registry/skills.csv`. The hand-authored `_registry/workflow-graph.yaml` captures stage groupings, gates, and edges between skills. The `framework-navigator` skill (under `meta/`) consumes both for natural-language routing.
