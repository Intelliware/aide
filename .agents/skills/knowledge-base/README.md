# Knowledge-base stage

Skills for building, navigating, updating, and verifying the global knowledge base. **The KB lives in its own repo** (separate from A.I.D.E.); these skills operate against the path declared in `project.toml`'s `[project.paths] knowledge_base_path`.

The KB is markdown-first and traversed by agentic search (`read + grep + glob`) — no vector DB, no embeddings.

## Two halves

The KB has two complementary halves. Both share the same root layout under `<knowledge_base_path>/`; both are reached by the same `navigate-knowledge-base` selector.

| Half | What it captures | Source | Skills |
|---|---|---|---|
| **Code-grounded** | What the code is, how it fits together, what drifted | Reverse-engineering + git | build/navigate/update/detect-drift/verify-coverage |
| **Human-grounded** | Why it exists, who it serves, what AI must follow, how it runs | Interactive discovery + auto-derivation from RE/CI | capture-solution-context, generate-ai-rules, document-operations |

## Produces
- KB initial index (`ARCHITECTURE.md`), components, and graph (via `build-knowledge-base`)
- Solution-context leaves under `<KB>/shared/solution-context/` (via `capture-solution-context`)
- AI rules at `<KB>/shared/ai-rules/project-context.md` plus per-repo overrides (via `generate-ai-rules`)
- Operations leaves under `<KB>/shared/operations/` plus split runbooks (via `document-operations`)
- Selective component + solution-context file lists for downstream stages (via `navigate-knowledge-base`)
- KB updates as features ship (via `update-knowledge-base`)
- Drift reports (component drift + solution-context staleness) and coverage gap reports

## Consumes
- Reverse-engineering Part A + B docs (under `<knowledge_base_path>/source-docs/<repo-slug>/`)
- CI/CD configs and infra files in source repos (for `document-operations`)
- User responses to elicitation patterns under `references/elicitation-patterns/`
- Implementation increment + git diff (for updates)
- Source repository state (for drift detection)

## Skills

### Code-grounded
- `build-knowledge-base/` — initial KB construction from RE outputs
- `navigate-knowledge-base/` — selective component + solution-context lookup
- `update-knowledge-base/` — closing skill at end of execution flows
- `detect-knowledge-base-drift/` — PR-gate / scheduled drift detection (component drift + solution-context staleness)
- `verify-knowledge-base-coverage/` — scheduled coverage sweep (component coverage + solution-context coverage)

### Human-grounded (solution-context layer)
- `capture-solution-context/` — interactive discovery: 6 leaves (mission, personas, goals/KPIs, constraints, integrations, ownership/RACI)
- `generate-ai-rules/` — hybrid (auto + interactive): canonical `project-context.md` plus per-repo overrides
- `document-operations/` — hybrid (auto + interactive): 4 leaves (deployment topology, environments & secrets, SLOs & monitoring, runbooks & on-call) plus split runbooks

### Periodic gate
- `review-knowledge-base-package/` — periodic global KB audit (cadence-based, not per-PR); orchestrates `verify-knowledge-base-coverage` + `detect-knowledge-base-drift` plus seven additional lenses, ending in a readiness verdict

See `config/SCHEMAS.md` for the KB schemas (ARCHITECTURE.md template, per-component frontmatter, graph.json), `_docs/solution-context-gap-audit.md` for the rationale behind the human-grounded layer, and the per-skill `references/EXAMPLE.md` for worked examples.
