# Archive: QE stage (pre-merge)

This folder marks the pre-merge state of A.I.D.E.'s QE skill set, before it
was consolidated into the unified **quality** stage.

## What used to live here

Three earlier, parallel sources of QE skills had been prototyped:

1. **Branch in-tree set** at `.agents/skills/qe/` — 3 skills
   (`create-qe-package`, `review-qe-package`, `execute-qe-increments`)
   producing a QE Package with test cases as `TC-XXX` increments. Backed the
   fail-fast POC.
2. **EM-QE** at `_archive/EM-QE-Skills/.agents/skills/quality/` — 2 skills
   (`create-quality-package`, `review-quality-package`) using a three-discipline
   framing (software testing / QA analysis / quality engineering) and the
   "Quality Package" terminology that was ultimately adopted.
3. **DCC-QE** at `_archive/DCC-QE-Skills/.agents/skills/qe/` — a team-internal
   toolkit tuned to BB-DCC-QE (Playwright + Cucumber + Java), with two
   operational skills (`qe-coverage-check`, `qe-defect-review`) plus a
   reverse-engineering-style `qe-code-scanner` and a setup-atlassian-cli
   meta skill.

## What replaced it

The three sets were merged into a single **`quality/`** stage under
`.agents/skills/quality/` with **5 skills**:

| Skill | Origin |
|---|---|
| `create-quality-package` | EM-QE base, with DCC's testability-check (Step 00b) and the reuse-analysis reference added |
| `review-quality-package` | EM-QE, lifted essentially as-is |
| `execute-quality-increments` | Branch in-tree set's `execute-qe-increments`, generalised |
| `audit-quality-coverage` | DCC-QE's `qe-coverage-check`, generalised |
| `review-test-failures` | DCC-QE's `qe-defect-review`, generalised |

DCC-QE's `qe-code-scanner` was **deliberately not ported** — its capability
is delivered by the existing reverse-engineering + knowledge-base skills
(`reverse-engineer-test-suite` + `navigate-knowledge-base --profile=test-suite`),
which keep the test-suite intelligence current in a more general and durable
form. See `.agents/skills/quality/README.md` → "Test-suite intelligence via
the knowledge base" for the rationale.

The Atlassian CLI from DCC-QE was **left as an optional companion tool** at
`tools/packages/atlassian-cli/`, with explicit "not framework-required"
status documented in `tools/README.md` and `tools/packages/atlassian-cli/README.md`.

## Why this folder exists with content

The old `.agents/skills/qe/` folder has been **archived as a complete
snapshot** under `_archive/qe-stage-pre-merge/skills-qe/` and then
removed from the live tree. The snapshot preserves every SKILL.md,
step, and reference exactly as it stood before the merge so anyone
needing to consult the legacy phrasing — for cross-walks, audits, or
to lift a nuance that was not carried into the unified stage — can
read it here without going to git history.

The live quality stage lives at `.agents/skills/quality/`; this
snapshot is read-only history.

For the full pre-merge analysis (option matrix, cross-reference matrix, the
nine matrix questions and answers, and the per-step implementation checklist)
see:

- `_docs/qe-analysis-3-methods.md` — the design document the merge was
  executed against.
- `CHANGELOG.md` entry for the release that consolidated the QE skills.

## Related archives

| Archive | What it holds |
|---|---|
| `_archive/model-2-sdlc-skills/expedited-implementation-package/` | The legacy expedited-implementation-package whose execute + deliver phases anchor today's `execute-quick-change` |
| `_archive/requirements-package/`, `_archive/solution-design-package/`, etc. | Earlier phase-named skill folders pre-dating the stage / increment vocabulary |

## Do not restore from here

Any code under this archive is for historical reading only. The live
quality stage lives at `.agents/skills/quality/`; updates to quality
behaviour belong there, not here.

