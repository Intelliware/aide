# capture-solution-context — Overview

## Purpose

Captures the project-level **solution context** that reverse-engineering
cannot recover from code: mission, personas, goals/KPIs, constraints,
external integrations, ownership/RACI. The output is a permanent layer
of the knowledge base, sibling to `components/` and `shared/entities/`,
which informs every downstream stage (requirements, design, planning,
execution) by answering questions like:

- *Who is this solution for, and what jobs do they hire it to do?*
- *What does success look like in business terms?*
- *What constraints (regulatory, contractual, infrastructural) shape
  every decision?*
- *Which third-party vendors and SaaS platforms does the solution depend
  on at an organisational level (not just at the code level)?*
- *Who owns each part of the solution, and how is on-call structured?*

The skill is interactive by design. The value of solution context is in
the discovery conversation itself — auto-derivation from code yields a
plausible-but-wrong stub.

## When to use

- Brownfield onboarding has reached `verify-knowledge-base-coverage`
  and the component catalog is in place.
- Greenfield projects after `start-project` and before
  `create-requirements-package`.
- Solution-context staleness has been flagged by
  `detect-knowledge-base-drift` (L4 layer, default 90-day threshold).
- The team has acquired a new repo, vendor, regulatory regime, or
  persona segment.

## When NOT to use

- The user is doing feature-level requirements work — that lives in
  `requirements/create-requirements-package`. The two are different
  scopes; this audit deliberately keeps them separate.
- The user wants AI coding rules (tech-stack-specific guardrails) —
  use `generate-ai-rules`.
- The user wants deployment/operations docs — use `document-operations`.
- The KB has not been built (`build-knowledge-base` has not run, or the
  `<KB>/shared/` directory does not exist) — bootstrap the KB first.

## Position in workflow

Brownfield onboarding flow:

1. `start-project` (meta)
2. RE stage produces Part A/B docs
3. `build-knowledge-base`
4. `verify-knowledge-base-coverage`
5. **`capture-solution-context`** ← THIS SKILL
6. `generate-ai-rules`
7. `document-operations`
8. `create-requirements-package` (first feature)

Greenfield flow:

1. `start-project`
2. **`capture-solution-context`** ← THIS SKILL
3. `generate-ai-rules` (often deferred until a stack is chosen)
4. `create-requirements-package`

Anytime: refresh on persona shift, vendor change, or regulatory
update. The skill is idempotent — Step 01 always asks before
overwriting an existing leaf.

## Interactive vs non-interactive

| Mode | Default | Behaviour |
|---|---|---|
| Interactive | Yes | Each elicitation step opens a discovery conversation with the user. Each leaf is confirmed before saving. |
| Non-interactive | `--non-interactive` flag | Auto-fillable fields are populated from RE + `project.toml`; everything else is replaced by `TODO(human):` markers with the discovery question inlined as a comment. Step 07 still runs. |

Non-interactive mode is for CI smoke tests and bulk bootstraps. It
intentionally produces incomplete output so reviewers immediately see
what needs human attention; it does **not** silently fill from
inference.
