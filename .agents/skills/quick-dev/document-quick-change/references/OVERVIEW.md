# Overview — document-quick-change

## Purpose

`document-quick-change` is the entry point of the quick-dev flow. It captures a
small-to-medium change as a single combined lightweight spec — replacing the
separate requirements package and design package of the elaborate flow with one
artifact that captures just enough to plan, implement, verify, and review the
change. The spec follows the `quick-dev-spec` composition: overview, business
context, functional requirements, acceptance criteria, glossary, change log.

The spec is the source of truth for the rest of the quick-dev flow:

- `plan-quick-change` derives an increment list from the FRs + ACs
- `execute-quick-change` verifies completeness against the ACs
- The PR review step (inside `execute-quick-change`) checks spec compliance
  against the diff

The skill enforces forced uncertainty markers (`[NEEDS CLARIFICATION]`),
progressive rigor (trivial / small / medium), and an explicit user
confirmation before any planning or coding begins. These together replace the
gates of the full requirements + design + planning pipeline with one tight
loop that's still rigorous about ambiguity.

## When to use

- Change is small or medium — fits in a few files within one module
- Developer can describe it in a few sentences
- No new data models, no new API endpoints, no architectural decisions
- No cross-team coordination needed
- User explicitly asked for "expedited", "quick", "fast-track", or "small change"

## When NOT to use

- Multi-file, cross-module changes — full pipeline
- New data models or API endpoints — full pipeline
- Architectural decisions needed — full pipeline
- Spec already exists — go straight to `plan-quick-change`

## Position in workflow

First of three quick-dev skills. Followed by `plan-quick-change`, then
`execute-quick-change`. Escape hatch: if classification reveals the change is
too large, recommend the full elaborate flow (`create-requirements-package` →
`create-design-package` → `create-implementation-package`).
