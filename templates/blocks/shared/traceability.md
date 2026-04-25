---
slug: traceability
title: "Traceability Matrix"
applies-to: [greenfield-requirements-package, greenfield-design-package, greenfield-implementation-package, brownfield-enhancement-spec, quick-dev-spec, kb-instance]
requires-decision-from: [architect, qa]
optional: false
order-hint: 80
---

## Traceability Matrix

Forward and backward traceability across the SDLC chain: requirement →
design → implementation → verification. The same matrix shape works at
every stage; what fills the columns differs by stage. Compositions
include this block whenever an artifact must answer
"where is this requirement satisfied?" or "what does this code element
satisfy?".

**ID schema, abbreviations, and numbering rules:** see
`references/traceability/`. That reference defines the FR-X.Y.Z
convention, the per-stage prefix table (FR / NFR / BR / UJ / DR / AC /
DES / IMP / TC / ADR / KBC), the rules for sub-IDs and revisions, and
the resolution order when an ID looks ambiguous. This block does not
duplicate those rules — it points at them and supplies the table shape.

---

### Source ID Conventions (cheatsheet)

The full schema lives at `references/traceability/`. The cheatsheet
below is for authors who need only the common prefixes:

| Prefix | Stage | Example | Meaning |
|---|---|---|---|
| `FR-X.Y.Z` | Requirements | `FR-3.2.1` | Functional Requirement, hierarchical |
| `NFR-X.Y` | Requirements | `NFR-2.1` | Non-Functional Requirement |
| `BR-X` | Requirements | `BR-17` | Business Rule |
| `UJ-X` | Requirements | `UJ-4` | User Journey |
| `DR-X` | Requirements | `DR-2` | Data Requirement |
| `AC-X.Y` | Requirements | `AC-3.2` | Acceptance Criterion (child of an FR) |
| `DES-X.Y` | Design | `DES-2.1` | Design element / decision-row |
| `ADR-NNNN` | Design / KB | `ADR-0007` | Architecture Decision Record |
| `IMP-X.Y` | Implementation | `IMP-1.4` | Implementation unit (story / module / PR) |
| `TC-X.Y` | Verification | `TC-3.2.1` | Test case (typically a child of an FR/AC) |
| `KBC-X` | Knowledge Base | `KBC-order-checkout-flow` | KB component (the `component_id`) |

> Each prefix has its own numbering rules — see
> `references/traceability/`. Mixing schemes (`FR-3.2.1` vs.
> `FR-3-2-1`) within a project is not allowed; pick one and stick to it.

---

### Matrix

The columns below are the **minimum** traceability set. Stages may add
columns (e.g., `Owning Team`, `Risk`, `Test Status`) but must not drop
any of the three core columns: `source-id`, `implements-as`,
`verified-by`.

| source-id | implements-as | verified-by | Status | Notes |
|---|---|---|---|---|
{{traceability_matrix_rows}}

**Column semantics:**

- `source-id` — The upstream identifier this row traces _from_. In a
  requirements package this is typically a stakeholder need or a parent
  FR. In a design package it is the FR / NFR / BR being designed
  against. In an implementation package it is the design element being
  built. In a KB it is the component or capability the entry belongs to.
- `implements-as` — How the source is realised at this stage. For
  design: a `DES-X.Y` row, an `ADR-NNNN`, or a named pattern. For
  implementation: an `IMP-X.Y` story, a module path, or a PR link. For
  KB: a `component_id` or capability string.
- `verified-by` — How the implementation is verified. Test case IDs
  (`TC-X.Y`), test file paths, automated check names
  (`openapi-diff`, `schema-diff`), or `manual-review` for items that
  resist automation.
- `Status` — One of `proposed`, `accepted`, `implemented`, `verified`,
  `deferred`, `removed`. The KB and implementation stages add the
  finer-grained values.
- `Notes` — Caveats, partial coverage statements, links to follow-up
  tickets. Empty is fine; padding with `N/A` is not.

---

### Forward and Backward Views

Tooling consumes this single source-of-truth matrix to render two
views. Authors maintain only the matrix above; the views below are
generated.

**Forward (requirement → verification):** _"For requirement X, where is
it implemented and how is it verified?"_

| Source ID | Implements As (chain) | Verified By |
|---|---|---|
{{forward_view_rows}}

**Backward (artifact → requirement):** _"For implementation artifact Y
or test case Z, what requirement does it satisfy?"_

| Artifact / Test | Source ID | Provenance |
|---|---|---|
{{backward_view_rows}}

> Both views regenerate when the matrix changes. Do not hand-edit the
> view tables — edits will be overwritten on the next composition build.

---

### Coverage Gaps

The matrix is honest when it lists gaps. A "100% coverage" claim that
hides unverified rows is worse than a partial matrix that flags them.

**Source IDs without an `implements-as` entry** (requirements not yet
designed):

- {{gap_unimplemented_1}}
- {{gap_unimplemented_n}}

**`implements-as` rows without a `verified-by` entry** (built but not
yet covered by tests):

- {{gap_unverified_1}}
- {{gap_unverified_n}}

**`source-id` rows with status `deferred` or `removed`:** these are
deliberate gaps; surface them so a reader does not hunt for the
implementation that doesn't exist.

- {{deferred_or_removed_1}}
- {{deferred_or_removed_n}}

> The check-implementation-readiness skill consumes the gap lists above
> as a hard gate: rows in `gap_unverified` block "ready" status until
> they have a `verified-by` entry or an explicit `deferred` status with
> rationale.
