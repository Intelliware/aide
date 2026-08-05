# Inputs / Outputs — review-adversarial

## Inputs

| Name | Required? | Default | Description |
|---|---|---|---|
| `--target=<path>` | yes | — | Path to the artifact under review. Can be a file (e.g. `requirements-package.md`, a KB component leaf) or a directory (e.g. `<KB>/`, a package directory containing multiple files). For directories, the skill reads the canonical entry file (`requirements-package.md`, `design-package.md`, `implementation-package.md`, `ARCHITECTURE.md`, etc.) and treats sibling files as supporting evidence. |
| `--stage=<stage>` | no | inferred | One of: `requirements`, `design`, `planning`, `execution`, `reverse-engineering`, `knowledge-base`, `quick-dev`, `meta`. Influences lens emphasis (see `OVERVIEW.md` § Stage-specific specializations). When absent, the skill detects from frontmatter or path. |
| `--output-path=<path>` | no | derived | Where to write the findings file. Default for standalone use: `_review/<artifact-slug>/<ISO8601>/review-adversarial.md`. Wrappers always supply this explicitly. |
| `--target-commit=<sha>` | no | `git rev-parse --short HEAD` | Short SHA of the repo containing the target. Recorded in findings frontmatter for traceability. |
| `--max-findings=<n>` | no | 50 | Hard cap on findings emitted. Beyond the cap, the skill keeps the highest severities and notes the truncation in the body. |

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Findings file | `--output-path` | `aide-adversarial-findings@1` (Format 4) — see `references/review-patterns/review-output-format.md` |

The findings file is the **only** output. The skill writes nothing else.

## Side effects

None. The skill does not:

- Modify the target artifact
- Append to `change-tracker.md`
- Update `skills/_registry/`
- Write to logs
- Invoke other skills

## Failure modes

| Condition | Behaviour |
|---|---|
| `--target` does not exist | Halt with clear error; no file written |
| `--target` is empty | Emit a `none`-severity findings file; do not error |
| `--stage` value not in the allowed set | Halt with clear error |
| `--output-path` parent directory does not exist | Create it (skill is responsible for `mkdir -p` semantics) |
| Findings exceed `--max-findings` | Truncate (highest severity wins); body notes truncation |
| Schema mismatch in target's frontmatter | Treat as `target_artifact: other`; do not error |

## Determinism

Two invocations against the same target with the same flags MAY produce different findings (model-driven analysis is non-deterministic). The schema and structure ARE deterministic — every output file conforms to `aide-adversarial-findings@1`.

## Performance notes

- Single artifact (one file, < 5000 lines): typical runtime under a minute.
- KB instance (directory with hundreds of leaves): the skill loads only the canonical entry file (`ARCHITECTURE.md`) plus a sample of components, not every leaf. Sampling is a deliberate bound, not coverage — say so in the findings file. For full KB coverage use `verify-knowledge-base-coverage`.

## Schema version

Currently produces `aide-adversarial-findings@1`. Bump triggers a major version bump on this skill's `SKILL.md` frontmatter (handled at framework version-bump time).
