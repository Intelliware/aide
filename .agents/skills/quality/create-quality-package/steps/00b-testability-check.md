# Step 0b — Testability check (always-on)

Classify every in-scope `INC-XXX` (and every top-level acceptance
criterion that does not map 1:1 to an increment) as `automatable`,
`partially-automatable`, `not-automatable — waived | manual | monitored`,
or `unclear`, **before** Step 1 begins.

The classifier is stack-agnostic — it asks whether the work has an
automatable observable surface, not what framework would test it. The
classification's output is a small auditable section of the quality
package that downstream steps (test design, quality engineering,
metrics) consume.

Read `references/testability-classification.md` for the full classifier,
outcomes, output schema, edge cases, and anti-patterns. This step is the
procedural spine; the reference is the substance.

## When this step runs

Always. The step is not gated by an elicitation answer. Unlike Step 2b
(test-case increments) — which is optional and gated on
`uses_test_case_increments` — this step always runs because every
quality package needs to know what is testable before it can author
test design.

In SoD legacy mode without `feature-id` the step still runs against the
inputs available; it just records the classification inline in the
package rather than under a SoD path.

## Procedure

### 0b.0 Resolve the package gate flags (do this first)

The quality composition gates four blocks on `[project.elicitation]` flags
that `start-project` does not seed. If they are left unset the gated blocks
**silently omit** — most damagingly the test-case-increment block. So resolve
all four explicitly before anything else; never leave the omission implicit:

| Flag | Gated block(s) | How to resolve |
|---|---|---|
| `uses_test_case_increments` | `test-case-increment` (Step 2b) | Read from `project.toml`; if unset, **default `true`** for a full greenfield/brownfield SDLC (the quality stage is built around TC-XXX increments) and confirm with a one-line prompt. |
| `has_nfrs` | `nonfunctional-quality` | **Derive**: `true` iff the requirements package declares ≥ 1 NFR. No prompt needed. |
| `records_testability_classification` | `testability-classification` (visible table) | Default `true` (this step always runs; the flag only controls whether the table is rendered vs. summarised into the change tracker per 0b.4). |
| `uses_team_failure_categories` | team failure-category block | Default `false` (team-specific vocabulary; opt-in only). Resolve `true` only if `project.toml` sets it. |

Record the four resolved values in the change tracker so the review can see
which blocks were included/omitted and why. If the user wants a choice to be
sticky across future packages, offer to persist it to `[project.elicitation]`
via `customize-framework`. Then proceed.

### 0b.1 Load the inputs

Read the implementation package (every `INC-XXX.md` + `increment-status.md`),
the requirements package (acceptance criteria + NFRs), and the design
package (architectural NFRs + security design). If any of the three is
missing or not at GO, halt — the testability gate has nothing to
classify.

### 0b.2 Apply the classifier

For each scope row (one row per `INC-XXX`; an extra row per AC that
spans multiple increments) walk the 5-question classifier from
`references/testability-classification.md` §2 in order. Stop at the
first **No** that forces a non-`automatable` classification. Record the
outcome plus a 1–2-sentence rationale for every non-`automatable` row.

The five questions:

1. Is there an observable behaviour change?
2. Is it reachable from a test boundary the project runs or can stand up?
3. Is the expected behaviour deterministic (or deterministically bounded)?
4. Are the inputs producible in a test environment without prohibited
   side effects?
5. Is the scope description specific enough for a competent tester to
   write the first concrete case unaided?

### 0b.3 Halt on `unclear`

Any row classified `unclear` (Q2 fails with no plan to add a boundary,
or Q5 fails on specification specificity) **halts the quality stage**.
Route the specific question(s) back to `create-implementation-package`
or `create-design-package`. Do not proceed to Step 1 with `unclear`
rows.

When the user confirms the upstream gap is acknowledged but the quality
stage should proceed for the remaining scope, drop the `unclear` rows
from this iteration's classification and record them as deferred in the
change tracker. Never silently reclassify `unclear` as
`partially-automatable`.

### 0b.4 Render the classification block

Write the result to the `quality/testability-classification` block. The
block is one table; one row per classified scope. Columns (per
`references/testability-classification.md` §4):

`Scope ID | Classification | Observable surface | Boundary | Constraints | Rationale | Action`

When the active composition does not include the
`quality/testability-classification` block (the team has not opted into
keeping the table visible in the package), the classification still
runs and is recorded in the change tracker as a single summary row —
the gate itself is not optional, only the visible output block is.

### 0b.5 Acknowledge the classification

Summarise the classification distribution back to the user — counts per
outcome, list of any `not-automatable — waived` rows with their
one-line waiver rationale, list of any `unclear` rows escalated or
dropped. Wait for acknowledgement before Step 1.

Apply the verification rule from `SKILL.md` — halt if the user
disagrees with any row.

### 0b.6 Change-tracker entry

Append one `Initial Extraction` row for the testability classification:

| Field | Value |
|---|---|
| Artifact | `quality/testability-classification` (block) or `change-tracker` (summary-only mode) |
| Parts Affected | Classification table |
| Change Type | Initial Extraction |
| Provenance | This step |
| Reviewer Action | Acknowledged by user in 0b.5 |

## Output consumed downstream

- **Step 2 (test design)** authors concrete test cases only for rows
  with `Action = design test case` or `record manual procedure`.
- **Step 2b (test-case increments — gated)** decomposes those rows
  only.
- **Step 3 (quality engineering)** picks up `record monitoring
  assertion` rows into the `quality-metrics-and-reporting` block and
  uses the `partially-automatable` split to size the release-gate
  metrics.
- **`audit-quality-coverage`** treats `waived` rows as "covered by
  waiver", not "missing".

## Next

Proceed to `steps/01-quality-strategy.md`.

