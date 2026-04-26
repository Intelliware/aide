# Traceability Convention

The framework-wide ID schema, numbering rules, and resolution order for
all traceability links. The traceability block template
(`templates/blocks/shared/traceability.md`) cites this reference; the
block carries an abbreviated cheatsheet but the rules below are
authoritative when the two disagree.

## Why these rules exist

Traceability is the spine that connects every SDLC stage. If IDs drift in
shape ("FR-3.2.1" vs. "FR-3-2-1"), abbreviations collide ("DR" meaning
Data Requirement here and Decision Record there), or numbering rules vary
per project, the matrix becomes unauditable. The forward and backward
views break, the check-implementation-readiness gate becomes
unenforceable, and KB drift detection silently misses changes.

## 1. Prefix table

These are the only prefixes the framework recognises. New prefixes
require an ADR; do not invent ad-hoc.

| Prefix | Stage | Cardinality | Example | Definition |
|---|---|---|---|---|
| `FR-X.Y.Z` | Requirements | hierarchical (3 levels max) | `FR-3.2.1` | Functional Requirement. The third level is the leaf — never sub-numbered further. |
| `NFR-X.Y` | Requirements | hierarchical (2 levels) | `NFR-2.1` | Non-Functional Requirement. Two levels max — quality + sub-quality. |
| `BR-X` | Requirements | flat | `BR-17` | Business Rule. Flat numbering across the project; never grouped into hierarchies. |
| `UJ-X` | Requirements | flat | `UJ-4` | User Journey. Flat across the project. |
| `DR-X` | Requirements | flat | `DR-2` | Data Requirement (entity-level). |
| `AC-X.Y` | Requirements | hierarchical (child of FR) | `AC-3.2` | Acceptance Criterion. Always a child of an FR; the X.Y matches the parent FR's leaf. |
| `DES-X.Y` | Design | hierarchical (2 levels) | `DES-2.1` | Design element or decision-row. Two levels max. |
| `ADR-NNNN` | Design / KB | flat 4-digit zero-padded | `ADR-0007` | Architecture Decision Record. Append-only, immutable once accepted. |
| `INC-XXX` | Planning | flat 3-digit zero-padded | `INC-014` | Implementation increment (canonical 8-section shape). |
| `INC-XXX.Y` | Planning | sub-increment | `INC-014.2` | Sub-increment carved from a parent INC; only one level of sub-numbering. |
| `IMP-X.Y` | Implementation | hierarchical (2 levels) | `IMP-1.4` | Implementation unit (story-equivalent, module path, or PR link). |
| `TC-X.Y` | Verification | hierarchical (child of FR or AC) | `TC-3.2.1` | Test case. Typically a child of an FR or AC; allowed to extend one level deeper than its parent. |
| `KBC-<slug>` | Knowledge Base | slug-based | `KBC-order-checkout-flow` | KB component identifier. The slug must match the component's `component_id` frontmatter field. |
| `BUG-NNNN` | Execution | flat 4-digit zero-padded | `BUG-0042` | Bug log entry. Append-only. |
| `CR-NNNN` | Anywhere | flat 4-digit zero-padded | `CR-0123` | Change request — used by `track-change`. |

## 2. Numbering rules

### 2.1 Hierarchy depth

Each prefix has a fixed maximum depth (table column 3). Going deeper
violates the convention; if a leaf needs structure, group its children at
the same level using `Notes` rather than inventing `FR-3.2.1.4`.

### 2.2 Zero-padding

ADR, INC, BUG, CR use zero-padded numerals (4 digits for ADR/BUG/CR, 3
for INC). The padding is mandatory — `ADR-7` is not equivalent to
`ADR-0007`. Padding makes file lists and grep results sort lexically.

### 2.3 Hierarchical numbering

`FR-X.Y.Z`, `DES-X.Y`, `IMP-X.Y` use **dotted decimal** with no leading
zeroes (`FR-3.2.1`, never `FR-03.02.01`). Dashed forms (`FR-3-2-1`) are
forbidden — they collide visually with the prefix-separator dash.

### 2.4 Reuse and renumbering

Once an ID is assigned and the artifact has been reviewed (signed off by
the corresponding `review-*` skill), the ID is **immutable**. To replace
a rejected requirement, mark the original `removed` and assign a new ID;
do not reuse the number.

The single exception is pre-review draft state: an `FR-3.2.1` that has
not yet passed review can still be renumbered as the requirements package
restructures. After review sign-off, renumbering is forbidden.

### 2.5 Sub-IDs and revisions

Some prefixes admit sub-IDs (`INC-014.2`); these are siblings under the
parent and inherit its review status. Revisions of an ID are recorded in
the artifact's change-log block, not via numeric suffixes — `FR-3.2.1`
revised in v1.4 is still `FR-3.2.1`.

## 3. Resolution order when an ID looks ambiguous

When a reader encounters a bare ID in body text (e.g., `INC-014`), the
resolution order is:

1. The current artifact's local matrix. If `INC-014` appears as a row in
   this artifact's traceability matrix, that's the binding.
2. The artifact this is linked from. (Body text in a design package
   citing `FR-3.2.1` resolves to the upstream requirements package.)
3. The project's super-context — `project.toml [project.paths]`. Each
   path corresponds to a stage's authoritative artifact set.
4. Cross-project references — these must be qualified
   (`<repo-slug>:INC-014`) to be valid; bare IDs are local by default.

If resolution fails at all four levels, the validator emits a dangling-ID
error.

## 4. The matrix is the source of truth

The forward and backward traceability views are **generated** from the
matrix, never hand-authored. The matrix is the single source. This
discipline:

- Makes the matrix the canonical place to update IDs (no view drift).
- Enables tooling to flag unverified or unimplemented rows.
- Lets readiness checks read one structure rather than reconciling three.

The block template's forward/backward view tables are placeholder
shapes; the actual views are emitted at composition-render time from the
matrix.

## 5. Status values

Every matrix row has a `Status` column drawn from a fixed vocabulary:

| Status | Meaning | Stage where it usually lands |
|---|---|---|
| `proposed` | Authored but not reviewed | Requirements / Design draft |
| `accepted` | Reviewed and signed off | Post-review on the source stage |
| `implemented` | Code exists; not yet verified | Execution |
| `verified` | Tests / manual checks pass | Execution / KB |
| `deferred` | Intentionally postponed; rationale in `Notes` | Any |
| `removed` | Superseded; rationale in `Notes` | Any |

Custom statuses violate the convention. To add a status, open an ADR.

## 6. Coverage-gap discipline

The matrix block emits three gap lists:

- `gap_unimplemented` — `source-id` rows with no `implements-as` entry.
- `gap_unverified` — `implements-as` entries with no `verified-by` entry.
- `deferred_or_removed` — `source-id` rows with status `deferred` or
  `removed`.

These lists are how the matrix stays honest. A "100% coverage" claim
that hides unverified rows is worse than a partial matrix that flags
them.

The `check-implementation-readiness` skill (per `bmad-check-implementation-readiness`)
treats `gap_unverified` as a **hard gate**: rows there block "ready"
status until they have a `verified-by` entry or are explicitly
`deferred` with rationale.

## 7. Cross-document IDs

When an artifact references an ID owned by a different artifact, the
reference uses the bare ID and the resolution order in §3 binds it. For
multi-repo / multi-project setups, qualify with the repo slug:

```
<repo-slug>:<ID>     e.g.   api-orders:INC-014
```

The slug is the `code` field from `[[project.repos]]` in the project's
`project.toml`. KB components carry their cross-repo provenance via the
`paths` and `consumed_by` frontmatter fields, not by qualified IDs.

## 8. Validation

The package validators and `verify-knowledge-base-coverage` enforce:

- Every ID matches its prefix's regex (this document's §1).
- No ID exceeds the depth specified in the prefix table.
- Every reference resolves to an existing row (no dangling IDs).
- Every matrix row has the three core columns
  (`source-id`, `implements-as`, `verified-by`); custom columns may be
  added but cannot replace these.
- Status values come from the fixed vocabulary in §5.

Violations are errors, not warnings — the matrix is load-bearing.
