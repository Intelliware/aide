# Adversarial Wrapper Pattern

Shared dispatcher pattern for invoking `meta/review-adversarial` and `meta/review-edge-case-hunter` as sub-reviews inside a `review-*-package` skill.

**Wired today:**

- `reverse-engineering/review-reverse-engineering-package/references/review-workflow.md` (sub-reviews 7–8)

**Reserved.** The pattern is deliberately generic so the other `review-*-package` skills can adopt it without redesign. They have not, and this document does not imply they have: `review-requirements-package` (10 sub-reviews), `review-design-package` (3), and `review-implementation-package` (8) run their own sequences with no adversarial wrapper. Their rows below describe what adoption *would* look like — treat them as a contract for a future edit, not a description of current behavior. Adopting the pattern in one of them is a deliberate change to that skill's `review-workflow.md`, not something this reference activates on its own.

## Wrapper structure

Each wrapper is a single sub-review step that:

1. Invokes the anytime skill with `--target=<package-canonical-entry>`, `--stage=<this-stage>`, and `--output-path=<package-review-dir>/<wrapper-output-name>.md`.
2. Reads the resulting Format 4 findings file's frontmatter `worst_severity` field.
3. Maps to a verdict using the per-skill verdict mapping (see `review-verdict-mapping.md` for the canonical table).
4. Writes the wrapper sub-review's verdict file alongside the other sub-review verdict files in the package's review directory.

## Per-skill parameters

| Wrapping skill | Status | Stage | Adversarial output filename | Edge-case output filename |
|---|---|---|---|---|
| `review-reverse-engineering-package` | wired | `reverse-engineering` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-requirements-package` | reserved | `requirements` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-design-package` | reserved | `design` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-implementation-package` | reserved | `planning` | `adversarial-findings.md` | `edge-case-findings.md` |

The output filenames are uniform; only the directory differs (each skill writes findings into its own review directory).

## Verdict vocabulary mapping per skill

The two anytime skills produce findings with severity `critical | high | medium | low | none`. Each wrapping skill maps these to its own verdict vocabulary:

### Skills using PASS / PASS WITH OBSERVATIONS / FAIL semantics

`review-reverse-engineering-package` (wired); `review-requirements-package` and `review-design-package` on adoption.

The standard mapping from `review-verdict-mapping.md`:

| `worst_severity` | Sub-review verdict |
|---|---|
| `critical` | FAIL |
| `high` | PASS WITH OBSERVATIONS |
| `medium` | PASS WITH OBSERVATIONS |
| `low` | PASS |
| `none` | PASS |

Note: `review-design-package` uses `NO-GO / CONDITIONAL GO / GO` only at the readiness gate; sub-reviews including these wrappers use `PASS / PASS WITH OBSERVATIONS / FAIL` and the readiness gate aggregates.

### Skills using Critical / Important / Minor semantics

`review-implementation-package` only (reserved — not wired today).

This skill collects findings across all sub-reviews and renders a single GO / NO-GO verdict at the end. Adversarial wrapper severity maps to its severity vocabulary as:

| `worst_severity` | Severity assigned to wrapper findings list |
|---|---|
| `critical` | Critical (forces NO-GO) |
| `high` | Important (forces NO-GO unless explicitly accepted as documented risk) |
| `medium` | Important (same treatment) |
| `low` | Minor |
| `none` | (no entry added) |

Each individual finding from the adversarial findings file becomes one row in the consolidated issue list, with severity translated by the same mapping.

## Triage as a tiebreaker

If the findings file's `triage_counts.must-fix > 0` AND `worst_severity == high`, wrappers MAY upgrade verdict severity:

- PASS / OBS schema: PASS WITH OBSERVATIONS → FAIL
- Critical / Important schema: Important → Critical

This is intentionally rare — `must-fix` triage on a `high` finding means the producing skill is calling it critical-equivalent.

## Wrapper sub-review file naming

Each wrapper sub-review writes its own verdict file (separate from the findings file the anytime skill produces) with naming:

| Wrapper sub-review | Verdict file name |
|---|---|
| `review-adversarial-pass` | `review-adversarial-pass.md` |
| `review-edge-cases` | `review-edge-cases.md` |

The verdict file cites the findings file (path) and renders a one-line summary plus the verdict.

## Side effects

Same as the anytime skills' side effects: the wrapper writes its own verdict file plus the anytime skill writes its findings file. No other writes. No mutations to the target artifact.

## Failure modes

| Condition | Behaviour |
|---|---|
| Anytime skill fails (target missing, stage invalid) | Wrapper inherits the error; sub-review verdict is FAIL with a clear citation of the upstream error |
| Findings file's frontmatter does not parse | Wrapper sub-review verdict is FAIL: `Format 4 schema violation in <findings-path>` |
| Findings file's `schema` field is not `aide-adversarial-findings@1` | Wrapper sub-review verdict is FAIL: schema version mismatch |

## Why factor this out

Without this shared reference, each wrapping skill would either copy-paste the dispatcher logic or quietly diverge over time. With it, wrappers are uniformly shaped and any change to the dispatcher pattern (e.g., a new `--target-commit` argument, a new severity tier) ripples through every wrapping skill via a single edit here. It is factored out ahead of full adoption on purpose: the second skill to wrap should inherit the shape rather than reinvent it.
