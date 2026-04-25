# Implementation Package Workflow

This workflow coordinates the implementation package phases. It does not contain the detailed phase logic; each phase skill owns its own workflow, references, templates, standards, and quality gates.

## Initial Routing

Ask the user which path they want to run:

| Path | Use when | Start with |
|------|----------|------------|
| Full path | User received an approved solution package and wants to plan, implement, and prepare a PR | `implementation-plan` |
| Planning only | User wants an implementation plan and AI-agent project context without coding yet | `implementation-plan` |
| Execution only | User already has an approved `implementation-plan.md` and `project-context.md` | `implementation-execution` |
| PR only | User has completed implementation and wants review, commits, PR description, and PR creation | `implementation-pr` |

If the user is unsure, recommend the full path. Coding should generally not start until plan readiness returns GO.

## Phase Chain

Run the selected phase and then stop at each phase boundary for user confirmation.

```text
implementation-plan
  -> ask whether to start implementation-execution

implementation-execution
  -> ask whether to start implementation-pr

implementation-pr
  -> summarize commit/PR status and remaining reviewer actions
```

## Execution-Only Guard

When the user starts directly at implementation execution:

1. Confirm `docs/<feature>/implementation-package/plan/implementation-plan.md` exists or ask the user to provide the approved plan.
2. Confirm `docs/<feature>/implementation-package/plan/project-context.md` exists or ask the user to provide equivalent project context.
3. Confirm the user accepts skipping the plan readiness gate if no `review-plan-readiness` verdict exists.
4. Do not write code if required plan details, file paths, or verification steps are missing.

## PR-Only Guard

When the user starts directly at PR/handoff:

1. Confirm implementation tasks are complete.
2. Confirm the working tree diff is ready for review.
3. Review before commit.
4. Do not commit or create a PR without explicit user approval.

## Output Location

Planning outputs should use:

```text
docs/<feature>/implementation-package/
```

Reuse the `<feature>` folder from `docs/<feature>/solutions-package/` or `docs/<feature>/requirements-package/` when it exists. Otherwise infer the feature name from the solution design package or user-provided change description, convert to kebab-case, and confirm with the user before writing outputs.

## Parent Completion

This parent workflow is complete when one of these is true:

- The user chooses a phase and the appropriate phase skill has started.
- The user decides not to continue and receives a concise summary of recommended next steps.
- The PR/handoff phase completes with reviewed changes, approved commits, and a created or ready-to-create PR.
