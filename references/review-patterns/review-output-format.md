# Adversarial Review — Output Format (Format 4)

Single source of truth for the output schema produced by every skill
that performs adversarial or method-driven review against an A.I.D.E.
artifact. Cited from:

- `meta/review-adversarial/`
- `meta/review-edge-case-hunter/`
- The wrapper sub-reviews `review-adversarial-pass` and
  `review-edge-cases` inside every `review-*-package` skill

The schema is **load-bearing** — wrappers parse the YAML frontmatter
to compute their sub-review verdict (see
`review-verdict-mapping.md`); downstream automation reads it to
generate `change-tracker.md` rows. Producing skills must emit
exactly the fields below.

## File location

| Invocation mode | Output path |
|---|---|
| Standalone (anytime) | `_review/<artifact-slug>/<ISO8601>/<producing-skill>.md` |
| Wrapped from a `review-*-package` skill | `<package-review-dir>/<wrapper-name>.md` |

The producing skill never decides the path; it accepts an
`--output-path=<path>` argument (caller-controlled).

## YAML frontmatter (required, exact)

```yaml
---
schema: aide-adversarial-findings@1
target_artifact: requirements-package      # see "target_artifact values" below
target_path: docs/refund-delay-alerts/requirements-package/requirements-package.md
target_commit: a3f9c12                     # short SHA of the repo containing the target, at review time
produced_by: review-adversarial            # or review-edge-case-hunter
produced_at: 2026-04-29T13:42:00Z          # ISO 8601 UTC
stage: requirements                        # see "stage values" below
severity_counts: { critical: 1, high: 3, medium: 5, low: 2 }
triage_counts:    { must-fix: 1, should-fix: 3, consider: 5, wont-fix: 2 }
worst_severity: critical                   # max(severity_counts) — drives wrapper verdict
finding_ids: [ADV-001, ADV-002, ADV-003, ADV-004, ADV-005, ADV-006, ADV-007, ADV-008, ADV-009, ADV-010, ADV-011]
---
```

### Field rules

- `schema`: literal `aide-adversarial-findings@1`. Bump to `@2` only on a breaking change to this spec.
- `target_artifact`: one of — `requirements-package`, `design-package`, `implementation-package`, `reverse-engineering-doc`, `knowledge-base-component`, `knowledge-base-instance`, `quick-change-brief`, `other` (last resort).
- `stage`: one of — `requirements`, `design`, `planning`, `execution`, `reverse-engineering`, `knowledge-base`, `quick-dev`, `meta`.
- `severity_counts` and `triage_counts` MUST sum to `len(finding_ids)`.
- `worst_severity` MUST equal the highest non-zero key in `severity_counts` using the order `critical > high > medium > low`. `none` if all zeros.

## Body structure (required, in order)

```markdown
# Adversarial findings — <human title>

## Triage summary

| ID | Severity | Category | Finding (one line) | Action |
|---|---|---|---|---|
| ADV-001 | critical  | Measurability   | "performant" undefined          | must-fix    |
| ADV-002 | high      | Scope           | Mobile clients out of scope?    | should-fix  |
| ...

## Critical findings (claim vs counter)

### ADV-001 · CRITICAL · Measurability

> **Original claim** (req § 4.2)
> "The system must be performant under typical load."

> **Adversarial counter**
> "Performant" is unfalsifiable. "Typical load" is undefined.
> Two reviewers can both PASS this and still ship a 30s-latency feature.

**Recommended fix:** P95 < 250ms at 500 concurrent users.

(repeat per critical finding; SKIP this section entirely if no critical findings)

## All findings

### ADV-001 · critical · Measurability
- **Evidence:** requirements-package.md § 4.2, line 87
- **Risk:** untestable; will not pass review-measurability
- **Recommendation:** add P95 latency target

### ADV-002 · high · Scope
- **Evidence:** requirements-package.md § 2.1
- **Risk:** mobile UX assumed but never confirmed in scope
- **Recommendation:** explicit in/out-of-scope statement for mobile

(continue for every finding ID)
```

## Severity vocabulary

| Severity | Meaning |
|---|---|
| `critical` | Artifact cannot ship as-is; will produce wrong outcomes downstream |
| `high` | Significant risk; should be addressed before handoff |
| `medium` | Worth surfacing; not blocking |
| `low` | Minor / advisory; no action required if accepted |

## Triage vocabulary (optional but recommended)

| Triage | Meaning |
|---|---|
| `must-fix` | Critical or high requiring fix this pass |
| `should-fix` | High or medium, schedule before handoff |
| `consider` | Medium or low worth thinking about |
| `wont-fix` | Acknowledged, accepted, no action |

A finding's triage is the producing skill's recommendation;
final acceptance is the user's call (recorded in the wrapper
sub-review's verdict file).

## Finding ID format

`ADV-NNN` (zero-padded 3-digit), starting at 001 within a single
findings file. IDs are local to that file — not globally unique.
Cross-file references use `<file-path>#ADV-NNN`.

## Empty-findings case

If the producing skill finds nothing, emit a complete file with
`severity_counts: { critical: 0, high: 0, medium: 0, low: 0 }`,
`worst_severity: none`, `finding_ids: []`, and a body that omits
the "Critical findings" and "All findings" sections, replacing
them with a single line: `No findings.` This signals to wrappers
that a PASS verdict applies.

## Schema version history

- `aide-adversarial-findings@1` — initial. Defined in v1.2.0.
