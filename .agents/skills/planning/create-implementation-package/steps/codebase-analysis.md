---
slug: codebase-analysis
sequence: 1
depends-on-prior: false
---

# Step 1 — Codebase Analysis (brownfield only)

## When this step runs

This step runs **only when the project is brownfield** —
`project.default_flow = brownfield` in `project.toml`, or the user has
indicated an existing codebase will host the implementation. Skip on greenfield
projects (no codebase to analyze).

## Purpose

Build code-level ground truth about the areas of the existing codebase that
the proposed feature will touch. The implementation package's increments will
be structured around this ground truth — file paths in Plan items, naming
conventions in AI Gate phrasing, integration points in Dependencies — rather
than around the design document's abstractions.

This is the developer's complement to the architecture baseline (which is
high-level: "uses NestJS with TypeORM"). Codebase analysis is code-level:
"services live in `src/modules/{feature}/`, use constructor injection, follow
the `OrderService` pattern, name test files `*.spec.ts`".

## Inputs

| Input | Source | Required |
|---|---|---|
| Solution Design Package | `{project.paths.design_package}/{feature-id}/` | Yes |
| Architecture baseline | `{project.paths.design_package}/{feature-id}/discovery/architecture-baseline.md` | If present |
| Requirements Package | `{project.paths.requirements_package}/{feature-id}/` | Yes |
| Codebase access | filesystem | Yes |
| Coding standards | `_assets/standards/` (if present) | If present |

## Output

`{project.paths.implementation_package}/{feature-id}/plan/codebase-analysis.md` — structured
map of the affected codebase areas covering:

- **Affected modules / directories / layers** — the analysis boundary
- **Existing patterns** — DI, error handling, state management, API layer,
  test conventions
- **Integration points** — where new modules will connect to existing ones
- **Code dependencies** — internal imports, external libraries, version pins
- **Test conventions** — test file locations, naming, fixtures, mock patterns
- **Code integration strategy** — where new code extends current patterns and
  where it diverges (with adapter-layer plans if patterns differ)

## Procedure

1. **LOAD inputs.** Read solution design (component map, technology stack,
   data model, API design, backend/frontend design), architecture baseline
   (if present), and requirements package (functional requirements, data
   requirements, business rules, NFRs). Extract language/framework versions
   from build files; record which standard rules apply.
2. **SCOPE the analysis.** From the solution design's component map and data
   flows, identify which modules, directories, and layers the feature will
   read from, write to, or integrate with. Define the boundary explicitly —
   in scope vs. out of scope.
3. **READ source files** in the in-scope areas. Do not skim — read the actual
   code. Extract patterns from real files, not from intuition.
4. **MAP existing patterns.** Document the patterns the codebase actually uses
   for: DI/wiring, error handling, validation, response shapes, state
   management, query patterns, auth, logging. For each pattern, cite a
   representative file.
5. **MAP integration points.** Where will new feature code touch existing
   code? List entry points (routes, event subscribers, scheduled jobs),
   shared services, and cross-module dependencies.
6. **COMPARE against standards.** If `_assets/standards/` exists, note where
   discovered patterns align with standards and where they deviate.
   Standards are gold; deviations may need adapter layers.
7. **WRITE** `codebase-analysis.md`. Present to the user. Get acknowledgement
   before proceeding to Step 2.

## Halt conditions

- Codebase access is missing — ask user to provide repo path.
- Solution design references components that don't exist in the codebase —
  surface to the user; design may be stale or wrong.
- Architecture baseline contradicts the codebase — surface the conflict; the
  design package may need updating before implementation planning continues.

## Acknowledgement checkpoint

Before proceeding to `steps/test-planning.md`:

1. Summarize the affected modules, existing patterns, and integration points in chat.
2. Ask: "Does the codebase analysis match your understanding of where this work lands?"
3. Wait for explicit confirmation. Do not infer.
4. If the user requests changes, revise the analysis and repeat the summary.

## Why this step is first

Without codebase analysis, the implementation package's increments reference
files that don't exist, use patterns the codebase doesn't follow, or assume
integration points that aren't there. Plans become unexecutable on contact
with the actual code.
