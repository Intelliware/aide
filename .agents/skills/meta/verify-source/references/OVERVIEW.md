# Overview — verify-source

## Purpose

`verify-source` is the framework's generic content-vs-source verifier. It
answers one question across every package type: "are the claims in this doc
backed by the source it cites?" Source can be code, tests, tickets, prior
packages, or upstream specs — whatever the package's traceability fields point
at. The skill checks completeness, accuracy, consistency, and change-tracking
in a stage-agnostic way, then runs a small set of package-type-specific
checks layered on top.

It exists because every stage's review skill needed the same four checks —
duplicating that logic across requirements review, design review, RE
verification, KB verification, and quick-dev verification was driving drift.
By centralizing the universal verification logic and letting each stage layer
its specific checks on top, we keep the universal portion consistent and let
stage skills focus on what's genuinely stage-specific (e.g. "every endpoint
has an OpenAPI fragment" for RE-API, "every requirement has measurable
ACs" for requirements).

This skill is the generalization of the legacy `verify-extraction` skill —
which was RE-only — into a meta utility usable from any stage.

## When to use

- Any time a package has been assembled, amended, or extracted
- Before review-stage skills (requirements review, design review)
- When AI hallucination risk is elevated (long session, vague specs)
- When drift is suspected — sources changed but docs may not have followed
- KB staleness warnings indicate `last_verified_against_commit` is old

## When NOT to use

- Verifying code against tests at the execution stage — that is the
  execution skill's own verification, not this one
- The cited source isn't readable — verification requires comparison
- Domain-specific deep RE checks — those still live in
  `reverse-engineer-*/steps/verify.md`

## Position in workflow

Cross-cutting utility. Sits before any review-stage skill, after any
authoring or extraction skill. Used in every flow (greenfield, brownfield,
quick-dev, RE) before an artifact is declared ready for the next stage.
