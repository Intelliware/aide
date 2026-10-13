# create-implementation-package — Inputs and Outputs

## Inputs

| Input | Source | Required | Purpose |
|---|---|---|---|
| Solution Design Package | `{project.paths.design_package}/{feature-id}/` | Yes | Architectural intent the increments realize |
| Requirements Package | `{project.paths.requirements_package}/{feature-id}/` | Yes | Functional Requirements to map onto increments |
| Canonical Increment Shape blocks | `templates/blocks/planning/*.md` (8 files) | Yes | Single-sourced section spec — never inline |
| Composition spec | `templates/compositions/greenfield-implementation-package.yaml` | Yes | Composes the 8 blocks plus shared overview/glossary/change-log per increment |
| project.toml | `{project-root}/project.toml` | Yes | Resolves output paths and FR identifier conventions |
| Codebase access | filesystem | Conditional | Required when `project.default_flow = brownfield` (drives `steps/codebase-analysis.md`) |
| Architecture baseline | `{project.paths.design_package}/{feature-id}/discovery/architecture-baseline.md` | Conditional | Brownfield only; narrows codebase analysis scope |
| Coding standards | `_assets/standards/` | If present | Drives test-planning conventions and verification gate phrasing |

### Missing-input guards

- If the design package is missing or not yet approved, halt and instruct the
  user to run `design/review-design-package` first.
- If the requirements package is missing, halt — FR mapping is mandatory and
  cannot be invented.
- If `project.paths.implementation_package` is unset in `project.toml`, halt
  and ask the user to set it before authoring increments.

## Outputs

| Output | Path | Produced by | Purpose |
|---|---|---|---|
| Per-increment file | `{project.paths.implementation_package}/{feature-id}/INC-XXX.md` | composition `greenfield-implementation-package.yaml` | One file per increment; all 8 Canonical Increment Shape sections plus shared overview/glossary/change-log |
| Implementation package overview | `{project.paths.implementation_package}/{feature-id}/implementation-package.md` | Step 5 (support docs) | Lists every increment with ID, name, FR mapping, dependencies, status |
| Increment status tracker | `{project.paths.implementation_package}/{feature-id}/increment-status.md` | Step 5 (support docs) | Tracks state per increment: not-started / in-progress / completed / blocked / on-hold |
| Bugs and issues log | `{project.paths.implementation_package}/{feature-id}/bugs-and-issues-log.md` | Step 5 (support docs) | Initialized empty; populated during execution by `execute-increments` and `manage-bugs` |
| Change tracker | `{project.paths.implementation_package}/{feature-id}/change-tracker.md` | Step 5 (support docs) | Records changes that propagate from requirements/design into implementation |
| Codebase analysis (brownfield only) | `{project.paths.implementation_package}/{feature-id}/plan/codebase-analysis.md` | `steps/codebase-analysis.md` | File/module map, conventions, integration strategy |
| Test plan | `{project.paths.implementation_package}/{feature-id}/plan/test-plan.md` | `steps/test-planning.md` | Test strategy, regression coverage, test modifications |
| Plan-readiness verdict | reported in chat + recorded in change tracker | `steps/plan-readiness-review.md` | GO / NO-GO before handoff to review-implementation-package |

### Per-increment file shape (the Canonical Increment Shape)

Every `INC-XXX.md` file contains exactly these 8 sections in this order — see
the corresponding block under `templates/blocks/planning/` for each section's
format spec, rules, and examples:

1. **Increment Identity** — `templates/blocks/planning/increment-identity.md`
2. **Goal** — `templates/blocks/planning/goal.md`
3. **Dependencies** — `templates/blocks/planning/dependencies.md`
4. **Plan** — `templates/blocks/planning/plan.md`
5. **Outcome** — `templates/blocks/planning/outcome.md`
6. **Automated Verification (AI Gate)** — `templates/blocks/planning/automated-verification.md`
7. **Human Verification (Human Gate)** — `templates/blocks/planning/human-verification.md`
8. **Success Criteria** — `templates/blocks/planning/success-criteria.md`

The composition wraps these with the shared overview, glossary, and change-log
blocks (per `greenfield-implementation-package.yaml`).
