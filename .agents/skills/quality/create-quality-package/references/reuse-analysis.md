# Reuse analysis — reference (test-design time)

The lateral-thinking checklist used during test-design authoring
(Step 2, optionally Step 2b) to keep the design from re-inventing
shared utilities, fixtures, page objects, or scenario shapes that the
KB or the test suite already provides.

This reference is the **planning-time** counterpart of the
**execution-time** reuse cross-check at
`.agents/skills/quality/execute-quality-increments/references/reuse-analysis.md`.
The two are aligned by intent but operate at different grains:

| | This reference (create-quality-package) | Execute-side reference |
|---|---|---|
| When | Test-design authoring (Step 2 / Step 2b) | Per-artifact AI-Gate (Step 2a) |
| Grain | One pass over the **whole test-design draft** | One pass **per shareable artifact** of one increment |
| Output | Reuse rows in the test-design block; reuse summary line in the package | Per-artifact disposition (`Reuse as-is` / `Extend in place` / `Wrap with adapter` / `Create new`) |
| Failure mode prevented | "We designed 14 cases that duplicate 9 existing ones" | "We wrote a new helper that duplicates an existing one" |

Both layers are needed. Planning-time reuse keeps the test inventory
honest; execution-time reuse keeps the codebase honest.

---

## 1. When this reference is consulted

- **Step 2 (test design)** — when proposing concrete cases, scenarios,
  shared fixtures, and any abstraction that will outlive the increment
  (page objects, builders, scenario outlines, custom matchers).
- **Step 2b (test-case increments, gated)** — when carving the design
  into scaffolding vs test-case increments; scaffolding rows should
  prefer reuse over new creation wherever possible.
- **`review-quality-package`** — the reviewer cross-checks that
  reuse-analysis rows were captured for non-trivial new assets.

The reference is **not** consulted in Step 0b (testability check),
Step 1 (strategy), or Step 3 (engineering). Those steps describe
*what* and *why*; reuse analysis applies to *how*.

---

## 2. The lateral-thinking checklist

For every proposed test-design asset that is not a single-use case
body, walk the checklist in order. *Comments lie. Code and component
frontmatter do not.*

### 2.1 Generalisation question

Before asking "does this exist?", ask:

> **Does a more GENERIC method exist for this TYPE of interaction?**

Examples of the right reframe:

- "Do I need `assertWireAccepted(response)`?" → "Do I need any
  HTTP-202-with-Location-header assertion?" → search for that.
- "Do I need a `WireBuilder.withCorrelationId(...)`?" → "Do I need any
  builder for the wire payload at all?" → search for that.
- "Do I need a `DashboardPage` page object?" → "Do I have a
  base-page abstraction or any other page object for this app already?"

If the generic question yields a candidate, prefer extending the
generic over introducing a specific.

### 2.2 KB lookup (when a KB exists for the test suite)

- [ ] Invoke `navigate-knowledge-base --profile=test-suite` filtered by
      the relevant `--profile-subkind`:
      - `shared-utilities` for utilities, assertion helpers, async helpers
      - `fixtures` for test-data builders, factories, seed-data sources
      - `feature-inventory` when checking whether a similar scenario
        already exists
      - `page-objects` for UI page abstractions
- [ ] Read the frontmatter of every returned component. Read the body
      only for components whose frontmatter suggests a real match.
- [ ] Capture candidate list with component IDs, paths, and one-line
      "why this is a candidate" notes.

If no KB has been built for the test suite yet, surface this in the
reuse rows (`KB: skipped — no test-suite components yet; recommend
reverse-engineer-test-suite`) and proceed with §2.3 only.

### 2.3 Suite scan (always)

- [ ] Identify the test repos to scan (only repos in `project.toml`'s
      repo list — never wander).
- [ ] Identify the conventional directories for this asset type within
      those repos (`fixtures/`, `support/`, `page-objects/`, etc.).
- [ ] Grep / read for matches by **shape** (interaction type, input,
      output) — not by name. Two helpers with different names can do
      the same thing.

### 2.4 Disposition (planning-time)

For each candidate from §2.2 + §2.3, choose:

| Disposition | When | Effect on the test-design row |
|---|---|---|
| **Reuse** | Candidate covers the design's need exactly | Test-design row names the existing asset; no new asset proposed |
| **Extend** | Candidate is right shape; needs additive change | Test-design row marks the asset for extension in Step 2a (execution time) and names the candidate |
| **Wrap** | Candidate's behaviour is right but a thin adapter would make the design read naturally | Test-design row marks the asset for adapter creation in Step 2a |
| **Create new (justified)** | None of the above; rationale required | Test-design row carries the rationale citing what each candidate cannot do |

The execution-side gate (Step 2a in `execute-quality-increments`) will
re-verify the disposition per artifact against live code; this
planning-time pass is the **first** filter — its job is to keep
speculative duplication out of the test-design block.

---

## 3. Output schema (planning-time)

The test-design block (Step 2) carries a `Reuse` column on every row
whose asset is shareable. Format:

| Asset | Disposition | Source | Rationale |
|---|---|---|---|
| `assertWireAccepted(response)` | Wrap | KB:`<suite>/shared-utilities.md#HttpAssertions` | Generic asserter exists; adapter reads naturally in scenario |
| `WireBuilder.withCorrelationId(...)` | Extend | KB:`<suite>/fixtures.md#WireBuilder` | Builder exists; field is additive, no callers affected |
| `DashboardPage` | Create new | n/a | No page object exists for the dashboard screen; new in INC-014 |

The reuse summary line goes in the package-level
`quality-metrics-and-reporting` block:

> **Reuse posture:** N Reuse / M Extend / K Wrap / L Create new (across
> [n] shareable assets in the test design).

A package whose reuse summary is `0 Reuse / 0 Extend / 0 Wrap / N
Create new` for a brownfield project with an established suite is a
review red flag — it usually means the reuse check was not run.

---

## 4. Anti-patterns

- **The "we'll consolidate later" lie.** No team has ever consolidated
  duplicate fixtures after the fact. Planning-time is the only cheap
  consolidation window.
- **The "this is faster" trap.** Creating new is faster *for this
  package*. Reusing is faster *for the suite over time*. The team's
  KPI is the second one.
- **Search by name.** Two helpers with different names can do the same
  thing. Always search by interaction shape.
- **Skipping KB lookup because "the KB is incomplete".** Incomplete is
  not empty. Skipping silently is the failure mode this reference
  exists to prevent — record the skip with rationale (e.g.
  "test-suite KB not built yet") so the gap is visible.
- **Conflating planning-time reuse with execution-time reuse.** The
  planning-time pass surveys the test-design *whole*; the
  execution-time pass interrogates each artifact at write time. Both
  are needed.

---

## 5. Provenance

This planning-time reuse reference generalises an earlier lateral-thinking
checklist (originally authored as "Phase 3" in a team-internal toolkit,
restated stack-agnostically here and split from the execution-side gate per
the merge analysis). See `_docs/qe-analysis-3-methods.md` § (c) Step 7 for
the rationale.

