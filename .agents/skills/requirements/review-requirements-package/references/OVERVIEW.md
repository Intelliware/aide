# Overview — review-requirements-package

## Purpose

Independently invocable validator for an assembled requirements package. Runs ten reviews in strict sequence, producing per-review verdicts and a final readiness verdict that gates design handoff. Lifted from `model-2-sdlc-skills/requirement-package/requirements-review/` (per `_archive/skill-disposition.md` row 26) — every rule from the source skill carries over: review only after the package is assembled, strict sequence, no parallelism, FAIL halts, re-run earlier reviews when their checked content changed.

The skill exists as a separate entry point from `create-requirements-package` because users routinely want to validate a package without re-running creation. A typical scenario: design feedback flagged a measurability gap; user fixes the package; user wants only the readiness check before re-handing off to design. Bundling review inside `create-requirements-package` would force a re-run of the macro creation workflow even when only validation is needed.

## When to use

- Assembled `requirements-package.md` exists and validation is wanted before design handoff
- User says any trigger phrase from the SKILL.md frontmatter
- Re-validating after the change tracker recorded amendments (downstream skill discovery, assumption falsification, hand-off gate feedback)
- A new project mode (greenfield/brownfield) was applied after the package was first created and policies need re-checking

## When NOT to use

- Package not yet assembled — `create-requirements-package`
- Validating a design or implementation artifact — `review-design-package` (or planning equivalent)
- Authoring or amending requirements — `create-requirements-package`

## Position in workflow

```
create-requirements-package -> review-requirements-package -> create-design-package -> review-design-package -> create-implementation-package -> ...
```

If readiness returns BLOCKED, the loop is `review-requirements-package` then fix in `create-requirements-package` then `review-requirements-package` until APPROVED. If the project's flow is `quick-dev`, this skill is bypassed in favor of the lighter quick-dev validation built into `quick-dev/document-quick-change`.
