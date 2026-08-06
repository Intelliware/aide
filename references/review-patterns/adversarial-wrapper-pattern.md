# Adversarial Wrapper Pattern

Shared dispatcher pattern for invoking `meta/review-adversarial` and `meta/review-edge-case-hunter` as sub-reviews inside a `review-*-package` skill.

**Wired in all five review-package skills.** Each inserts the two wrappers immediately before its readiness gate — after the checklist-driven sub-reviews have settled, and before the gate that aggregates them:

| Skill | Sub-reviews | Wrapper positions | Readiness gate |
|---|---|---|---|
| `review-requirements-package` | 12 | 10, 11 | 12 |
| `review-design-package` | 5 | 3, 4 | 5 |
| `review-implementation-package` | 10 | 8, 9 | 10 |
| `review-reverse-engineering-package` | 9 | 7, 8 | 9 |
| `review-knowledge-base-package` | 10 (+1 conditional) | 8, 9 | 10 |

The ordering is the point. Running the wrappers first would waste them on an artifact still failing basic consistency; running them after the gate would mean the gate never saw their findings.

## Wrapper structure

Each wrapper is a single sub-review step that:

1. Invokes the anytime skill with `--target=<package-canonical-entry>`, `--stage=<this-stage>`, and `--output-path=<package-review-dir>/<wrapper-output-name>.md`.
2. Reads the resulting Format 4 findings file's frontmatter `worst_severity` field.
3. Maps to a verdict using the per-skill verdict mapping (see `review-verdict-mapping.md` for the canonical table).
4. Writes the wrapper sub-review's verdict file alongside the other sub-review verdict files in the package's review directory.

## Per-skill parameters

| Wrapping skill | Stage | Adversarial output filename | Edge-case output filename |
|---|---|---|---|
| `review-requirements-package` | `requirements` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-design-package` | `design` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-implementation-package` | `planning` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-reverse-engineering-package` | `reverse-engineering` | `adversarial-findings.md` | `edge-case-findings.md` |
| `review-knowledge-base-package` | `knowledge-base` | `adversarial-findings.md` | `edge-case-findings.md` |

The output filenames are uniform; only the directory differs (each skill writes findings into its own review directory).

## Verdict vocabulary mapping per skill

The two anytime skills produce findings with severity `critical | high | medium | low | none`. Each wrapping skill maps these to its own verdict vocabulary:

### Skills using PASS / PASS WITH OBSERVATIONS / FAIL semantics

`review-requirements-package`, `review-design-package`, `review-reverse-engineering-package`, `review-knowledge-base-package`.

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

`review-implementation-package` only.

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

Without this shared reference, each wrapping skill would either copy-paste the dispatcher logic or quietly diverge over time. With it, wrappers are uniformly shaped and any change to the dispatcher pattern (e.g., a new `--target-commit` argument, a new severity tier) ripples through every wrapping skill via a single edit here. With five skills wrapping, that leverage is the whole point: the alternative was five copies of the same dispatcher drifting apart one edit at a time.
