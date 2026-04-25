# Solutions Package Workflow

This workflow coordinates the solution design package phases. It does not contain the detailed phase logic; each phase skill owns its own workflow, references, templates, standards, and quality gates.

## Initial Routing

Ask the user which path they want to run:

| Path | Use when | Start with |
|------|----------|------------|
| Full guided path | User wants the complete solution design process and may want architecture discovery first | `solution-discovery` or `solution-design` after user choice |
| Skip solution discovery | User wants to start design directly, discovery was already done elsewhere, architecture is already known, or the project is greenfield | `solution-design` |
| Design update | Requirements package changed after a prior solution design pass | `solution-design` |
| Review only | A solution package already exists and needs formal validation | `solution-review` |

If the user is unsure, recommend solution discovery when the work is brownfield and the existing architecture is not well understood. If the user chooses to skip discovery, continue and record the missing architecture baseline as a confidence risk.

## Phase Chain

Run the selected phase and then stop at each phase boundary for user confirmation.

```text
solution-discovery
  -> ask whether to start solution-design

solution-design
  -> ask whether to start solution-review

solution-review
  -> if approved, ask whether to proceed with implementation package handoff
```

## Optional Discovery Rules

When solution discovery is skipped:

1. State the trade-off clearly before design starts.
2. Do not fail only because `docs/<feature>/solutions-package/discovery/architecture-baseline.md` is missing.
3. Use the requirements package, available codebase context, and user-confirmed architecture assumptions as design inputs.
4. Record unverified architecture claims as assumptions or design risks.
5. Prefer targeted questions over a broad architecture interview.

## Output Location

All generated project outputs should use:

```text
docs/<feature>/solutions-package/
```

Reuse the `<feature>` folder from `docs/<feature>/requirements-package/` when it exists. Otherwise infer the feature name from the requirements package or user-provided change description, convert to kebab-case, and confirm with the user before writing outputs.

## Parent Completion

This parent workflow is complete when one of these is true:

- The user chooses a phase and the appropriate phase skill has started.
- The user decides not to continue and receives a concise summary of recommended next steps.
- The formal review phase returns a GO or accepted CONDITIONAL GO decision for implementation handoff.
