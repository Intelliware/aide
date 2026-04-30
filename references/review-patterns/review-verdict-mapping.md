# Adversarial Review — Verdict Mapping

Single source of truth for how a wrapper sub-review (`review-adversarial-pass`
or `review-edge-cases` inside a `review-*-package` skill) maps the findings
file produced by `meta/review-adversarial` or `meta/review-edge-case-hunter`
to its own PASS / PASS WITH OBSERVATIONS / FAIL verdict.

Cited from every wrapper sub-review and from the verdict-rendering step of
both anytime skills.

## The mapping

The wrapper reads the YAML frontmatter `worst_severity` field and applies:

| `worst_severity` in findings file | Wrapper sub-review verdict | Effect on the gate sequence |
|---|---|---|
| `critical` | **FAIL** | Halts the sequence; user must fix and re-run per existing pattern |
| `high` | **PASS WITH OBSERVATIONS** | Findings surface in the readiness gate's input; user must explicitly accept |
| `medium` | **PASS WITH OBSERVATIONS** | Same — surfaced but non-blocking |
| `low` | **PASS** | Findings logged in file, advisory only |
| `none` | **PASS** | Skill ran but found nothing |

Rationale: critical findings represent something the artifact cannot ship
with — they belong in the same blocking lane as "untestable requirement" or
"missing data dictionary" failures from the existing constructive
sub-reviews. High and medium represent real risk worth surfacing to the
readiness gate but not enough to halt the sequence on its own. Low is
advisory.

## Triage as a tiebreaker (optional)

If `worst_severity` lands on `high` but the producing skill flagged the
worst finding's triage as `must-fix`, the wrapper MAY upgrade the verdict
to FAIL. This is intentionally rare — `must-fix` triage on a `high`
finding is the producing skill saying "I'm calling this critical-equivalent
even though severity is high". Wrappers SHOULD trust the triage when it
disagrees with severity.

The reverse does NOT apply: a `critical` finding always FAILs even if
triage is `should-fix`. Severity is the floor; triage can only escalate.

## Fail recovery (matches existing pattern)

Same as every other sub-review in the existing `review-*-package` skills:

1. Stop the sequence.
2. Present the findings file to the user (Format 4 makes it directly readable).
3. Help the user resolve findings if asked (bracketed fix-then-re-validate).
4. Re-run the failed wrapper sub-review from the start.
5. If the fix changes content checked by an earlier passed sub-review,
   re-evaluate that earlier verdict.
6. Append a `Review finding` row to `change-tracker.md` for every fix.

## Readiness gate inputs

A readiness gate (the final sub-review in any `review-*-package` skill)
that sees PASS WITH OBSERVATIONS verdicts from one or both adversarial
wrappers MUST:

- Include the wrapper findings files in its CONDITIONAL verdict's
  conditions list.
- Render a one-line summary per outstanding finding into the
  readiness-verdict file so handoff documentation surfaces them.

## Configuration

The mapping is fixed and not overridable per-project. Projects that
want a stricter or looser mapping should compose it via additional
sub-reviews rather than mutating this table — keeps the verdict
semantics consistent across all five gate skills.

## Schema dependency

Requires findings files conforming to `review-output-format.md`
schema `aide-adversarial-findings@1`. If the schema version doesn't
match, the wrapper MUST fail with a clear error rather than guessing.
