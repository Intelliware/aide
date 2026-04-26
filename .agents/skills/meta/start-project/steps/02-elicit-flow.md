---
slug: elicit-flow
sequence: 2
depends-on-prior: true
---

# Step 2 — Elicit flow

Run after step 01 has confirmed mode = `fresh` or `rebaseline`. (Mode
`extend-repos` skips this step entirely.)

## Purpose

Pick the flow that drives every subsequent default — which composition
the requirements stage uses, whether reverse-engineering runs first,
whether the KB is built before or alongside requirements. Pinning this
once at bootstrap keeps every downstream skill from re-asking.

## Sub-steps

1. Read `framework.toml.core.default_flow` (default `greenfield`) as the
   suggested value.
2. Ask the user to choose:
   - **greenfield** — net-new product. No existing code to reverse
     engineer. First downstream skill: `create-requirements-package`.
   - **brownfield** — existing code; reverse-engineer first, then
     requirements / design in brownfield mode. First downstream skill:
     `analyze-repository`.
   - **quick-dev** — single small change; skip the formal stages. First
     downstream skill: `document-quick-change`.
3. Record the answer. It will become both `project.default_flow` (in
   step 05) and the routing key for step 06.

## Elicitation patterns referenced

- `references/elicitation-patterns/project-bootstrap.md` § flow-choice
  (file does not exist yet — referenced by path so the runner knows
  where to load it when authored)

## Hard gates

- The flow value must be one of the three enum values before this step
  exits.

## Exit criteria

- [ ] User has chosen one of `greenfield`, `brownfield`, `quick-dev`.
- [ ] The choice has been echoed back so the user can confirm or
      change before moving on.

## Next

Step 03 — elicit-project-context.
