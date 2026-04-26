# Overview — plan-quick-change

## Purpose

`plan-quick-change` produces a lightweight implementation plan from an agreed
quick-dev spec. The plan is a small set of increments — typically 1 to 3 —
each conforming to a reduced increment shape. The reduced shape keeps the
fields that matter for execution discipline (Identity with AC mapping, Goal,
Plan, AI Gate, Human Gate, Success Criteria) and inlines the elaborate
`Dependencies` and `Outcome` sections into Goal/Plan when the change is small
enough to make them redundant.

The skill always orients on the affected codebase before producing the plan,
so file paths, patterns, and test approaches reflect the real code rather
than plausible inventions. It exposes an escape hatch: if orientation reveals
the change is actually too large for the quick-dev flow (>5–7 files,
cross-module, new data model, new API endpoint, or complex
interdependencies), the skill halts and recommends the full elaborate
pipeline.

The clarity gate is non-negotiable: no `[NEEDS CLARIFICATION]` markers can
survive past planning, every increment must have all reduced-shape sections,
and every increment must trace to one or more acceptance criteria from the
spec.

## When to use

- A quick-dev spec exists and is confirmed
- Codebase is accessible — orientation requires it
- The change is still small after orientation

## When NOT to use

- No spec — invoke `document-quick-change` first
- Spec has unresolved markers — return to documenting
- Orientation reveals scope creep — escape hatch to full pipeline
- A plan already exists — go to `execute-quick-change`

## Position in workflow

Second of three quick-dev skills. Receives the spec from `document-quick-change`,
hands off to `execute-quick-change`. The escape hatch can redirect the user to
`create-implementation-package` (or further upstream to the requirements +
design pipeline) when scope grows.
