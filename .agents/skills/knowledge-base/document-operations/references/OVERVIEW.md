# document-operations — Overview

## Purpose

Captures the operational layer of the solution: how it deploys, where
it runs, how it observes itself, and what humans do when things break.
This is the third leg of the project-scoped solution-context layer,
alongside `capture-solution-context` (intent) and `generate-ai-rules`
(implementation guardrails).

The artefact is split into four leaves — each focused enough that an
on-call engineer can read just the one they need at 03:00.

## When to use

- Bootstrap sequence after `generate-ai-rules`.
- Infrastructure event: new region, new orchestrator, cloud-provider
  migration, secrets-manager swap, monitoring-stack change.
- SLO refresh — typically annually or after a major incident.
- Runbook addition — every meaningful incident produces a new runbook
  candidate.

## When NOT to use

- Per-feature deployment plans — those belong in design or
  implementation packages.
- The project has no deployment story yet (e.g. greenfield, before
  design package fixes infrastructure).
- The user wants AI coding rules — use `generate-ai-rules`.

## Position in workflow

Brownfield:
1. → `verify-knowledge-base-coverage`
2. `capture-solution-context`
3. `generate-ai-rules`
4. **`document-operations`** ← THIS SKILL
5. `create-requirements-package`

Greenfield:
1. `start-project`
2. `capture-solution-context`
3. `create-design-package` → `create-implementation-package`
4. **`document-operations`** ← THIS SKILL (post-design, when there is
   actually a deployment shape)
5. `execute-increments`

Anytime: refresh after infrastructure events. The skill is idempotent
and Step 01 prompts before overwriting existing leaves.

## How the four leaves split

| Leaf | What goes here | What does NOT go here |
|---|---|---|
| `00-deployment-topology.md` | Where it runs, scale shape, failover, multi-region/cluster topology, deploy tooling, release cadence | Per-feature deploy plans |
| `10-environments-and-secrets.md` | Environment matrix (dev/staging/prod), config layering, secret stores, rotation cadence, owner per env | Actual secret values |
| `20-slos-and-monitoring.md` | SLOs (with measurement), SLIs, dashboards, alert routing, error-budget policy | Per-feature dashboards (those live with the feature) |
| `30-runbooks-and-oncall.md` | Runbooks, escalation paths, on-call rotations (detailed), incident-response process | Postmortems (those are events, not steady-state docs) |

The four leaves keep on-call docs scannable. A runbook should fit on
one screen; if it doesn't, it's split.
