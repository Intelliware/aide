# Knowledge-base stage

Skills for building, navigating, updating, and verifying the global knowledge base. **The KB lives in its own repo** (separate from A.I.D.E.); these skills operate against the path declared in `project.toml`'s `[project.paths] knowledge_base_path`.

The KB is markdown-first and traversed by agentic search (`read + grep + glob`) — no vector DB, no embeddings.

## Produces
- KB initial index (`ARCHITECTURE.md`), components, and graph (via `build-knowledge-base`)
- Selective component file lists for downstream stages (via `navigate-knowledge-base`)
- KB updates as features ship (via `update-knowledge-base`)
- Drift reports and coverage gap reports

## Consumes
- Reverse-engineering Part A + B docs (under `<knowledge_base_path>/source-docs/<repo-slug>/`)
- Implementation increment + git diff (for updates)
- Source repository state (for drift detection)

## Skills
- `build-knowledge-base/` — initial KB construction from RE outputs
- `navigate-knowledge-base/` — selective component lookup for any stage
- `update-knowledge-base/` — closing skill at end of execution flows
- `detect-knowledge-base-drift/` — PR-gate / scheduled drift detection
- `verify-knowledge-base-coverage/` — scheduled coverage sweep
- `review-knowledge-base-package/` — periodic global KB audit (cadence-based, not per-PR); orchestrates the two above plus seven additional lenses

See `config/SCHEMAS.md` for the KB schemas (ARCHITECTURE.md template, per-component frontmatter, graph.json).
