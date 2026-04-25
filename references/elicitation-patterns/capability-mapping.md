# Elicitation pattern: Capability mapping

## Purpose

Builds the inverted index that maps capability terms (verbs and nouns
real users search for — "send email", "process payment", "validate
order") to the components that implement them. Invoked from
`build-knowledge-base` (step 06-emit-architecture-index) and from the
`kb-instance-root` composition so ARCHITECTURE.md's capability index
gives downstream agents and humans a fast jump-to-implementation lookup.

## Inputs needed from user

- The set of capability terms to index (drawn from per-component frontmatter `capabilities[]` plus user additions)
- Synonyms / aliases per capability (so search hits the same component on near-misses)
- Capability axes (the dimensions along which capabilities are grouped — typical axes: business-function, data-entity, lifecycle-stage, integration-direction)
- Per-axis taxonomy (the values that make up the axis)
- Confirmation of the capability → component mapping (auto-built from frontmatter; user reviews and corrects)

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Review the auto-extracted capability terms.** (the union of `capabilities[]` from every component frontmatter)
   - **Format:** structured-list with strike-through / add controls
   - **Validation:** flag terms that appear in only one component (likely too narrow); flag terms that appear in >50% of components (likely too broad)
   - **Maps to:** `capability_index.terms[]`

2. **Loop: for each term, list its synonyms / aliases.** (so users can find it via near-matches)
   - **Format:** structured-list per term
   - **Validation:** aliases are unique across the index (no two terms claim the same alias)
   - **Maps to:** `capability_index.terms[].aliases[]`

3. **Choose the capability axes for this KB.** (typically pick 2-3)
   - **Format:** multiple-choice (multi-select; pre-fill `business-function` + `data-entity` as defaults)
   - **Options:** `business-function` (sell, fulfill, account, support, …) / `data-entity` (order, customer, payment, …) / `lifecycle-stage` (intake, validation, fulfillment, settlement, …) / `integration-direction` (inbound, outbound, internal-only) / `user-role` (operator, admin, end-user, …) / `runtime-tier` (web, mobile, batch, event-driven) / `other`
   - **Maps to:** `capability_index.axes[]`

4. **For each chosen axis, list the values it takes in this project.**
   - **Format:** structured-list per axis
   - **Validation:** at least 2 values per axis; ≤ 12 values per axis (warn beyond 12)
   - **Maps to:** `capability_index.axes[].values[]`

5. **Review the auto-built term → component mapping.** (the skill builds a draft from frontmatter; the user confirms or corrects)
   - **Format:** structured table; user can add/remove edges per row
   - **Validation:** every term has at least one component; every component covers at least one term (warn on orphans)
   - **Maps to:** `capability_index.mapping[]`

6. **Per-axis cross-tabs.** Confirm the cross-tab between axis values and components.
   - **Format:** structured matrix per axis (rows = axis values, cols = components)
   - **Validation:** every axis value has at least one component contributing
   - **Maps to:** `capability_index.cross_tabs[]`

7. **High-traffic capabilities.** Mark the top 5-10 capabilities most likely to be queried (drives ordering in the index).
   - **Format:** structured-list of capability terms (subset of `terms[]`)
   - **Validation:** 5-10 entries
   - **Maps to:** `capability_index.high_traffic[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Print the term list with synonym counts, the axes with their values, and a sample slice of the term → component mapping. Confirm before regenerating the capability-index section of ARCHITECTURE.md.

## Output format

Answers feed the `knowledge-base/capability-index` block.

```markdown
## Capability index

### High-traffic capabilities
| Capability | Components |
|---|---|
| order resolution | acme-orders-api/order-resolution-service, acme-orders-ui/order-resolution-screen |
| send email notification | acme-orders-api/notification-publisher |

### Axis: business-function
| Value | Components |
|---|---|
| sell | … |
| fulfill | acme-orders-api/order-resolution-service, … |

### Axis: data-entity
| Entity | Components touching it |
|---|---|
| Order | acme-orders-api/order-store, acme-orders-api/order-resolution-service, acme-orders-ui/order-resolution-screen |
```

## Validation rules

- Every capability term must appear in at least one component's `capabilities[]` frontmatter (so the mapping is grounded, not invented).
- Aliases are unique across the index.
- Each axis declares 2-12 values (sweet spot for a useful, non-overwhelming taxonomy).
- The high-traffic list contains 5-10 entries.
- Orphans (terms with no component, components with no term) are surfaced for the user to fix at this step rather than silently emitted.

## Reusable across

- `build-knowledge-base` (step 06-emit-architecture-index)
- `update-knowledge-base` (when adding components changes the capability surface enough to warrant index regeneration)
- `kb-instance-root` composition (declared as required elicitation)
