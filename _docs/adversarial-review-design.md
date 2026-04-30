# Adversarial Review Layer + Review-Package Expansion

**Stage 1 deliverable.** Defines the design for two new anytime
adversarial-review skills, two new `review-*-package` skills covering
reverse-engineering and the knowledge base, the wrapper integration
that lets every `review-*-package` skill consume the adversarial
skills, and the shared output format.

This document is the contract for Stages 2–5: anything described here
must end up in the corresponding stage's outputs; anything left out is
intentionally NOT in scope.

## Why

A.I.D.E. has three `review-*-package` skills today
(`review-requirements-package`, `review-design-package`,
`review-implementation-package`). They run a strict sequence of
sub-reviews ending in a readiness gate. They do **not** include an
adversarial pass — every sub-review is constructive: "is this complete,
testable, traceable, etc.". Nothing systematically tries to break the
artifact.

Reverse-engineering output and the global knowledge base have **no
review-*-package skill at all**. RE output feeds the KB; the KB feeds
every downstream stage. Both are large artifacts whose quality
silently amplifies through the rest of the framework, and yet they
have no formal readiness gate.

This design closes both gaps in one coherent layer:

1. Two **anytime** adversarial skills (Option B from prior discussion)
   — runnable on any A.I.D.E. artifact, including KB components, RE
   docs, and quick-dev artifacts where no `review-*-package` exists.
2. Two new **`review-*-package` skills** for RE and KB, completing
   the per-stage review surface.
3. **Wrapper integration** (Option D from prior discussion) so every
   `review-*-package` skill — existing three + two new — runs the
   adversarial skills as sub-reviews before its readiness gate.

The anytime skills stay standalone so they remain available for any
artifact and for ad-hoc deep dives outside a gate sequence.

## Scope at a glance

| Component | Type | New / Modified |
|---|---|---|
| `meta/review-adversarial/` | New skill (anytime, Option B) | New |
| `meta/review-edge-case-hunter/` | New skill (anytime, Option B) | New |
| `reverse-engineering/review-reverse-engineering-package/` | New `review-*-package` skill | New |
| `knowledge-base/review-knowledge-base-package/` | New `review-*-package` skill | New |
| `requirements/review-requirements-package/` | Existing — wrapper integration | Modified |
| `design/review-design-package/` | Existing — wrapper integration | Modified |
| `planning/review-implementation-package/` | Existing — wrapper integration | Modified |
| `references/review-output-format.md` | Shared output-format spec (Format 4) | New |
| `references/review-verdict-mapping.md` | Severity → sub-review verdict mapping | New |

## The two anytime adversarial skills (Option B)

Both live under `meta/`, are independently invocable, and accept a
`--target=<path>` plus an optional `--stage=<hint>` (auto-detected
from the artifact's frontmatter when absent).

### `meta/review-adversarial/`

Attitude-driven. Looks for:

- Hidden assumptions that aren't stated
- Weasel words ("performant", "scalable", "robust") with no
  threshold
- "Good news only" framing — risks understated, alternatives missing
- Stakeholders or systems impacted but not named
- Scope inflation; vague boundaries
- Claims unsupported by evidence in the artifact itself

### `meta/review-edge-case-hunter/`

Method-driven. Walks the artifact systematically and reports only
what's not handled:

- Every branching path, error path, and boundary condition
- Concurrency edges, partial-failure paths, idempotency gaps
- Data-shape edges (empty, max, malformed, multi-byte)
- Authorization / permission edges
- Timing / clock / timezone edges

Both skills produce findings in the **shared Format 4 schema** (see
below) and write to a path that depends on how they're invoked:

- Standalone (anytime): `_review/<artifact-slug>/<timestamp>/<skill>.md`
- From a wrapper (sub-review of a `review-*-package` skill):
  `<package-review-dir>/<skill>.md`

The skills are agnostic to invocation mode — only the output path
changes, set by the caller.

## The two new `review-*-package` skills

Both follow the existing `review-*-package` shape: a strict sequence
of sub-reviews ending in a readiness gate; verdicts are PASS / PASS
WITH OBSERVATIONS / FAIL; FAIL halts the sequence.

### `reverse-engineering/review-reverse-engineering-package/`

Per-repo. Reviews the Part A + Part B output for one repo before it
is ingested into the KB.

| # | Sub-review | What it checks |
|---|---|---|
| 1 | review-section-completeness | Part A sections required by the domain skill are all present |
| 2 | review-grounding | Every claim references a source file or commit; no fabrications |
| 3 | review-consistency | Part A (internal) and Part B (consumer) tell a consistent story |
| 4 | review-coverage | Public artifacts (exported APIs, schemas, routes) are all surfaced |
| 5 | review-freshness | `last_verified_against_commit` matches the source repo HEAD |
| 6 | review-traceability | Component frontmatter `paths` resolve to real files |
| 7 | review-adversarial-pass | Wrapper around `meta/review-adversarial` with `--stage=reverse-engineering` |
| 8 | review-edge-cases | Wrapper around `meta/review-edge-case-hunter` |
| 9 | review-readiness | Final go/no-go gate (last) |

### `knowledge-base/review-knowledge-base-package/`

Global, periodic audit of one KB instance. Orchestrates existing
checks where they apply, rather than duplicating their logic.

| # | Sub-review | What it checks | Notes |
|---|---|---|---|
| 1 | review-architecture-index | `ARCHITECTURE.md` exists, well-formed, all sections present | |
| 2 | review-component-coverage | Every public artifact has a leaf | Calls `verify-knowledge-base-coverage` |
| 3 | review-graph-integrity | `graph.json` parses; `depends_on` / `consumed_by` are symmetric | |
| 4 | review-frontmatter-integrity | Every leaf has required frontmatter fields | |
| 5 | review-staleness | `last_verified_against_commit` is recent across leaves | Calls `detect-knowledge-base-drift` L1 |
| 6 | review-link-integrity | No broken links in `CLAUDE.md` / `ARCHITECTURE.md` / leaves | |
| 7 | review-solution-context-coverage | `shared/{solution-context, ai-rules, operations}/` leaves present | |
| 8 | review-adversarial-pass | Wrapper around `meta/review-adversarial` with `--stage=knowledge-base` | |
| 9 | review-edge-cases | Wrapper around `meta/review-edge-case-hunter` | |
| 10 | review-readiness | Final go/no-go gate (last) | |

KB review is intentionally periodic, not gate-blocking on every
change. It runs on a cadence (e.g. monthly) or on demand, with
`detect-knowledge-base-drift` continuing to provide the cheap
per-PR signal.

## Wrapper integration (Option D)

Every existing `review-*-package` skill gains two new sub-reviews
inserted **before** its readiness gate:

- `review-adversarial-pass` — calls `meta/review-adversarial`
- `review-edge-cases` — calls `meta/review-edge-case-hunter`

Each wrapper is a one-step dispatcher: it invokes the anytime skill
with `--target=<package-path>` and `--stage=<this-stage>`, captures
the findings file in the package's review directory, then maps the
findings' worst severity to a sub-review verdict (table below).

This means the anytime skills are the single source of adversarial
logic; wrappers are thin and identical in structure across all five
`review-*-package` skills.

## Output format (Format 4)

All adversarial findings — whether produced standalone or via a
wrapper — use the same schema. Defined once in
`references/review-output-format.md` and referenced from every
producing skill.

```markdown
---
schema: aide-adversarial-findings@1
target_artifact: requirements-package
target_path: docs/FEAT-2041/requirements-package/requirements-package.md
target_commit: a3f9c12
produced_by: review-adversarial      # or review-edge-case-hunter
produced_at: 2026-04-29T13:42:00Z
stage: requirements                  # or design / planning / execution / reverse-engineering / knowledge-base
severity_counts: { critical: 1, high: 3, medium: 5, low: 2 }
triage_counts:    { must-fix: 1, should-fix: 3, consider: 5, wont-fix: 2 }
worst_severity: critical
---

# Adversarial findings — Requirements Package FEAT-2041

## Triage summary

| ID | Severity | Category | Finding (one line) | Action |
|---|---|---|---|---|
| ADV-001 | critical  | Measurability   | "performant" undefined          | must-fix    |
| ADV-002 | high      | Scope           | Mobile clients out of scope?    | should-fix  |
| ...                                                                                |

## Critical findings (claim vs counter)

### ADV-001 · CRITICAL · Measurability

> **Original claim** (req § 4.2)
> "The system must be performant under typical load."

> **Adversarial counter**
> "Performant" is unfalsifiable. "Typical load" is undefined.
> Two reviewers can both PASS this and still ship a 30s-latency
> feature.

**Recommended fix:** P95 < 250ms at 500 concurrent users.

## All findings

### ADV-001 · critical · Measurability
- **Evidence:** requirements-package.md § 4.2, line 87
- **Risk:** untestable; will not pass review-measurability
- **Recommendation:** add P95 latency target

### ADV-002 · high · Scope
- ...
```

The frontmatter is load-bearing — wrappers and downstream
automation (e.g. `change-tracker.md` row generation) parse it
without reading the markdown body.

## Verdict mapping

How each wrapper maps anytime-skill findings to the wrapper
sub-review's verdict. Defined once in
`references/review-verdict-mapping.md`.

| Worst severity in findings | Sub-review verdict | Effect on gate |
|---|---|---|
| `critical` / `must-fix` | FAIL | Halts sequence per existing pattern |
| `high` / `should-fix`   | PASS WITH OBSERVATIONS | Surfaces in readiness gate input |
| `medium` / `low` / `consider` | PASS | Logged in findings file, advisory only |
| no findings | PASS | (skill ran but found nothing) |

A FAIL on either adversarial sub-review halts the sequence the same
way a FAIL on any other sub-review does — fix-then-rerun, with
earlier passed reviews re-evaluated if the fix touches their
content.

## Coverage matrix (after the layer ships)

| Artifact | Gate skill (wrapped) | Anytime adversarial reachable? |
|---|---|---|
| Requirements package | `review-requirements-package` | yes |
| Design package | `review-design-package` | yes |
| Implementation package | `review-implementation-package` | yes |
| RE Part A + B (per repo) | `review-reverse-engineering-package` | yes |
| Knowledge base instance | `review-knowledge-base-package` | yes |
| KB component leaf (one file) | (no gate skill) | yes — anytime only |
| Quick-dev change brief | (no gate skill) | yes — anytime only |
| RE Part A section (one file) | (no gate skill) | yes — anytime only |

## Stages of work

| Stage | Deliverable |
|---|---|
| 1 | This design note |
| 2 | `meta/review-adversarial/` and `meta/review-edge-case-hunter/` skills (full self-documenting set: SKILL.md ≤200 lines + references/OVERVIEW.md + INPUTS-OUTPUTS.md + EXAMPLE.md) plus `references/review-output-format.md` and `references/review-verdict-mapping.md` |
| 3 | `review-reverse-engineering-package/` and `review-knowledge-base-package/` skills (same self-documenting standard) |
| 4 | Wrapper integration into the existing three `review-*-package` skills (insert sub-reviews 10–11; readiness becomes 12) |
| 5 | Registry rebuild, workflow-graph entries (anytime list + new review-package skills wired into their respective stage flows), version bump (1.1.0 → 1.2.0), CHANGELOG entry |

## Non-goals (explicitly NOT in this layer)

- Replacing any existing constructive sub-review. Adversarial review
  is additive; it never substitutes for completeness, testability,
  traceability, etc.
- Auto-fixing findings. The skill produces findings; fixes are
  authored via the relevant `create-*-package` skill (or directly by
  the user) and the failed sub-review re-runs from the start, per the
  existing pattern.
- Code-level adversarial review of executing software. This layer
  reviews artifacts (specs, plans, docs, KB content); code-level
  adversarial review is `bmad-code-review`-style work that could be
  layered later if needed.
- Per-leaf KB review skills. KB component-level adversarial review
  uses the anytime skills directly. Only the global KB instance gets
  a `review-*-package` gate.

## Acceptance check

Stage 1 is done when this design note exists, every skill in scope
appears in the matrices above, the format and verdict-mapping specs
are described, and the staged delivery plan is set.
