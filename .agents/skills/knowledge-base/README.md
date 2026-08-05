# Knowledge-base stage

Skills for building, navigating, updating, verifying and auditing the global knowledge base. **The KB lives in its own repo** (separate from A.I.D.E.); these skills operate against the path declared in `project.toml`'s `[project.paths] knowledge_base_path`.

The KB is markdown-first and traversed by agentic search (`read + grep + glob`) — no vector DB, no embeddings.

## Two halves

| Half | Answers | Source | Lives in |
|---|---|---|---|
| **Code-grounded** | *What* the code is, how it fits, what drifted | RE Part A/B + git | `ARCHITECTURE.md`, `components/`, `graph.json`, `source-docs/` |
| **Human-grounded** | *Why* it exists, who it serves, what AI must follow, how it runs | interactive discovery + auto-fill from RE and CI/CD | `shared/{solution-context, ai-rules, operations}/` |

Reverse-engineering reconstructs structure, behaviour and contracts rigorously — but anything absent from code is invisible to it: business goals, KPIs, personas, vendor relationships, on-call rotations, the coding rules a team would tell a new engineer on day one. The second half exists for those.

Both halves are project-scoped and persistent. Neither overlaps the requirements stage, whose `current-capability-baseline.md` is feature-scoped and recomputed per feature.

## Produces
- KB initial index (`ARCHITECTURE.md`), components, and graph (via `build-knowledge-base`)
- Solution context, AI rules, and operations leaves under `shared/` (via the three human-grounded skills)
- Selective component file lists for downstream stages (via `navigate-knowledge-base`)
- KB updates as features ship (via `update-knowledge-base`)
- Drift reports, coverage gap reports, and periodic audit verdicts

## Consumes
- Reverse-engineering Part A + B docs (Part B under `<knowledge_base_path>/source-docs/<repo-slug>/<domain>-consumer/`)
- A close-out attestation per repo — `build-knowledge-base` refuses an extraction carrying neither a `MECHANICAL: GO` verification report nor an APPROVED/CONDITIONAL readiness verdict
- Implementation increment + git diff (for updates)
- Source repository state (for drift detection)
- Interactive input from the team, for what the code cannot reveal

## Skills

Code-grounded:
- `build-knowledge-base/` — initial KB construction from RE outputs
- `navigate-knowledge-base/` — selective component lookup for any stage
- `update-knowledge-base/` — closing skill at end of execution flows
- `detect-knowledge-base-drift/` — PR-gate / scheduled drift detection
- `verify-knowledge-base-coverage/` — scheduled coverage sweep
- `build-mainframe-data-lineage/` — cross-program field-level traceability for mainframe stacks

Human-grounded:
- `capture-solution-context/` — mission, personas, goals/KPIs, constraints, integrations, ownership/RACI
- `generate-ai-rules/` — `project-context.md` guardrails; auto-derives the stack from RE Part A, asks only about the rest
- `document-operations/` — deployment topology, environments/secrets, SLOs, runbooks, on-call

Audit:
- `review-knowledge-base-package/` — periodic global audit (monthly/quarterly, or before a release that leans on KB-grounded decisions). Orchestrates the coverage and drift skills, adds adversarial and edge-case passes, and emits a readiness verdict. **Not** a per-PR gate — that stays `detect-knowledge-base-drift`.

See `config/SCHEMAS.md` for the KB schemas (ARCHITECTURE.md template, per-component frontmatter, graph.json).
