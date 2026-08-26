---
name: document-operations
description: "Use when the user wants to capture solution-level operational documentation that the code can only partially reveal — deployment topology, environment matrix, secrets layout, SLOs, dashboards, runbooks, on-call rotations; says 'document operations', 'capture deployment', 'document SLOs', 'set up runbooks for the KB'. Reads CI/CD configs and RE Part B deployment sections to auto-fill, then interactively elicits the gaps. Produces four leaves under <KB>/shared/operations/."
---

# Document Operations

Captures the **how does it run** layer of solution context: deployment
topology, environments and secrets, SLOs and monitoring, runbooks and
on-call. Sibling to `capture-solution-context` (the "why / who")
and `generate-ai-rules` (the "what AI agents must follow").

The skill is **hybrid**: CI/CD configs and RE Part B deployment
sections give a strong first pass, but production-realistic operations
docs need a human in the loop for SLOs, escalation paths, secret-
rotation cadence, and runbook tribal knowledge.

## Overview

Three steps:

| Step | Purpose | Outputs touched |
|---|---|---|
| 01 | Read CI/CD + RE deployment sections | populates draft of all four leaves |
| 02 | Elicit gaps | finalises SLOs, runbooks, on-call |
| 03 | Emit | writes leaves; cross-links to solution context and AI rules |

## When to use

- After `capture-solution-context` and `generate-ai-rules` (the canonical
  bootstrap order).
- After a major infrastructure change (new region, new orchestrator,
  cloud provider migration, secret-store change).
- When SLOs change or new runbooks are needed.

## When NOT to use

- The user wants per-feature deployment instructions — those live in
  the design / implementation packages.
- The user wants AI coding rules — use `generate-ai-rules`.
- The KB has not been built — bootstrap it first.
- The project has no deployment story yet (greenfield, pre-design) —
  there is nothing to document; defer until design package fixes
  deployment shape.

## Inputs

| Input | Source | Required | Notes |
|---|---|---|---|
| `project.toml` | `{project-root}/project.toml` | Yes | Drives per-repo loop. |
| RE Part B deployment sections | `<KB>/source-docs/<repo>/part-b/**/deployment*` | No | Auto-fill source for environments, deploy tooling. |
| CI/CD configs at repo paths | `<repo.path>/.github/workflows/**`, `.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml`, `.circleci/**`, `bitbucket-pipelines.yml`, `Dockerfile`, `docker-compose*.yml`, `terraform/`, `helm/`, `k8s/` | No | Read-only — captures pipelines, environments, build artefacts. |
| `<KB>/shared/solution-context/30-constraints-and-compliance.md` § 3 | KB | No | NFR ceilings → SLO targets. |
| `<KB>/shared/solution-context/50-ownership-and-raci.md` § 3 | KB | No | On-call rotations already captured. |
| Existing `<KB>/shared/operations/` leaves | KB | No | Step 01 detects refresh / replace. |
| Elicitation patterns | `references/elicitation-patterns/operations-discovery.md` (NEW) | Yes (interactive) | Drives Step 02. |

See `references/INPUTS-OUTPUTS.md`.

## Precondition — hooks

Before Step 0, and after this skill's final step (before the `## Next skill` handoff), check the merged config for `[[hooks]]` entries scoped to this skill. If any exist, follow `<AIDE root>/references/orientation/hook-runtime.md` for the full execution procedure (partition by event, evaluate conditions, prompt for optional hooks, announce, invoke, handle errors). If none exist, this is a no-op.

## Workflow

1. **Read CI/CD + RE deployment** — `steps/01-read-cicd.md`
2. **Elicit gaps** — `steps/02-elicit-gaps.md`
3. **Emit** — `steps/03-emit.md`

## Output

```
<knowledge_base_path>/shared/operations/
├── 00-deployment-topology.md
├── 10-environments-and-secrets.md
├── 20-slos-and-monitoring.md
└── 30-runbooks-and-oncall.md
```

Each leaf carries the same trigger-style frontmatter as solution-context
leaves so `navigate-knowledge-base` can surface it.

## Next skill

`create-requirements-package` (or whichever feature-creation skill the
flow specifies). For brownfield, this is the typical end of the
bootstrap sequence and the first feature can begin.

## Common mistakes

- **Documenting aspirations rather than reality.** SLOs without
  measurement = wishlist. If a metric is not measured, mark it
  `aspirational` and add a TODO with the responsible team.
- **Duplicating on-call info from solution context.** Step 02 reads
  `50-ownership-and-raci.md` first; this leaf adds runbook detail and
  escalation procedures that don't fit there.
- **Inlining secrets.** Never. The leaf names the secret store, the
  rotation cadence, and the team that owns rotation — never the secret
  itself.
- **Treating Dockerfile / k8s manifest as the topology.** It's input.
  The topology answers "where does this run, how many regions, what's
  the failover, what's the scale shape" — synthesise from inputs +
  human knowledge.
- **Skipping the SLO sanity check.** If `30-constraints-and-compliance.md`
  declares an SLA of 99.95 % uptime and the SLO leaf says nothing,
  Step 02 must surface the mismatch.
