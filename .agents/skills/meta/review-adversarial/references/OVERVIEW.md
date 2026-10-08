# Overview — review-adversarial

## Purpose

`review-adversarial` is the attitude-driven half of A.I.D.E.'s adversarial review layer. It assumes a skeptical reader and looks for everything an artifact's author would rather you not notice. Its sibling, `review-edge-case-hunter`, walks paths and boundaries methodically. Together they cover the two failure modes that pure constructive review (the existing `review-*-package` sub-reviews) systematically misses: framing problems and coverage problems.

This skill catches framing problems.

## Why it exists

Every existing `review-*-package` sub-review is constructive: "is this complete? testable? traceable? consistent?". Constructive review is good at catching well-formed defects but bad at catching well-presented ones. An artifact can pass scope, completeness, consistency, measurability, testability, implementation-leakage, data-completeness, traceability, and feasibility — and still ship a confident-sounding spec that hides a vague stakeholder, a missing risk, or a scope-creep clause.

Adversarial review adds a different lens: read the artifact assuming the author is *too close* to the problem to see what they've understated, glossed, or quietly assumed.

## What "attitude-driven" means in practice

The skill applies six attitude lenses to the target artifact:

1. **Weasel-word audit** — claims that sound concrete but aren't falsifiable. "Performant", "scalable", "robust", "resilient", "easy to use", "fast", "low latency" without a number.
2. **Hidden-assumption hunt** — load-bearing claims the artifact never states. "We assume requests are idempotent", "we assume mobile traffic is <5%", "we assume the partner API is up 99.9% of the time".
3. **Unsupported-claim audit** — assertions in the artifact that have no evidence inside the artifact (no link, no data, no reference, no rationale).
4. **Missing-stakeholder check** — systems, teams, or users impacted by the artifact but never named. Especially: ops, security, data, mobile, partner integrators.
5. **"Good news only" framing** — risks, alternatives considered, things that could go wrong all absent or treated as solved without analysis.
6. **Scope-inflation / -ambiguity** — vague boundaries, undefined "phase 2", non-goals listed but not enforced, in-scope items that secretly expand the artifact's responsibility.

Each lens is applied in sequence; findings are tagged by lens (the `Category` column in the triage table).

## Stage-specific specializations

The `--stage` hint adjusts the lens emphasis without changing the six categories:

| Stage | Lens emphasis tweaks |
|---|---|
| `requirements` | Heaviest weight on weasel words and hidden assumptions; constraints often understated |
| `design` | Heaviest weight on unsupported claims (ADR rationale) and missing stakeholders (ops/security review) |
| `planning` | Heaviest weight on scope ambiguity (increment boundaries) and "good news only" (risk register) |
| `execution` | Heaviest weight on traceability between increment-status claims and actual diff content |
| `reverse-engineering` | Heaviest weight on unsupported claims (every sentence should reference a source file) |
| `knowledge-base` | Heaviest weight on hidden assumptions baked into ARCHITECTURE.md or CLAUDE.md |
| `quick-dev` | Heaviest weight on scope ambiguity (quick-dev change briefs are notorious for under-scoping) |
| `meta` | Generic application of all six lenses |

If `--stage` is absent, the skill detects it from artifact frontmatter (`stage:` field on packages) or path heuristics (`{paths.requirements_package}/<feature-id>/` → requirements, etc.).

## Severity scoring

The skill assigns severity per finding using these rules. They are *meant* to be conservative — over-flagging burns trust faster than under-flagging.

- `critical` — the finding is a fact-level defect that, if shipped, will produce wrong outcomes downstream. Examples: an unmeasurable acceptance criterion that will pass review-testability vacuously; a hidden assumption that contradicts a requirement.
- `high` — significant risk; should be addressed before handoff. Examples: a major stakeholder unnamed; a "good news only" risk register; a vague scope boundary that has historically caused churn.
- `medium` — worth surfacing; not blocking. Examples: a single weasel word in a non-load-bearing sentence; a missing "alternatives considered" section in an otherwise solid ADR.
- `low` — minor / advisory. Examples: a stylistic weasel word in a section header.

## Position in workflow

- **Anytime use:** any artifact, any time, no project-state requirements.
- **Wrapped from a `review-*-package` skill:** invoked as the `review-adversarial-pass` sub-review (after the constructive sub-reviews, before the readiness gate). The wrapper supplies `--stage`, `--output-path`, and `--target-commit`; this skill is otherwise identical in both modes.

## What this skill does not do

- It does not fix anything. Findings are advisory.
- It does not run method-driven analysis (branches, boundaries). That's `review-edge-case-hunter`.
- It does not block the gate by itself — wrappers do, via the verdict-mapping spec.
- It does not write to `change-tracker.md` directly. The wrapper sub-review records change-tracker rows when fixes happen later.
- It does not maintain its own state across runs. Each invocation produces one findings file at the supplied output path.
