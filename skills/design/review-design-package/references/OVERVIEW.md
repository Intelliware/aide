# Overview — review-design-package

## Purpose

Independently invocable validator for an assembled design package. Runs three reviews in strict sequence (architecture, security-posture, readiness), producing per-review verdicts and a final readiness verdict that gates planning handoff. Lifted from `model-2-sdlc-skills/solution-package/solution-review/` (per `_archive/skill-disposition.md` row 30) — every rule from the source skill carries over: review only after the package is assembled, strict sequence, no parallelism, NO-GO halts, re-run earlier reviews when their checked content changed.

The skill exists as a separate entry point from `create-design-package` because users routinely want to validate a design without re-running creation. A typical scenario: a downstream planning skill flagged a security gap; user fixes the design package; user wants only the readiness check before re-handoff to planning. Bundling review inside `create-design-package` would force a re-run of the macro creation workflow even when only validation is needed. Folder name was changed from `solution-review` to `review-design-package` to drop the legacy `solution-` prefix and align with the new stage name "design".

## When to use

- Assembled design package exists and validation is wanted before planning handoff
- User says any trigger phrase from the SKILL.md frontmatter
- Re-validating after the design change tracker recorded amendments (downstream skill discovery, hand-off gate feedback)
- Re-validating after the requirements `change-tracker.md` shows the design's recorded requirements version is stale

## When NOT to use

- Design package not yet assembled — `create-design-package`
- Validating a requirements or implementation artifact — `review-requirements-package` (or future planning equivalent)
- Authoring or amending design — `create-design-package`

## Position in workflow

```
create-requirements-package -> review-requirements-package -> create-design-package -> review-design-package -> create-implementation-package -> ...
```

If readiness returns NO-GO, the loop is `review-design-package` then fix in `create-design-package` then `review-design-package` until GO or accepted CONDITIONAL GO. If the project's flow is `quick-dev`, this skill is bypassed in favor of the lighter quick-dev validation built into `quick-dev/document-quick-change`.
