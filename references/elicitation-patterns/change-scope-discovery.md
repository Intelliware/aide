# Elicitation pattern: Change scope discovery

## Purpose

Captures the boundaries of a single small-to-medium change so a quick-dev
or brownfield-enhancement spec can be authored in one pass — what
changes, where, what done looks like, what's explicitly out of scope, and
how big the change is. Invoked from `document-quick-change` and from
`brownfield-enhancement-spec` (composition). The pattern is deliberately
short: anything that can't be answered here probably needs the full
requirements + design pipeline, not a quick-dev/enhancement spec.

## Inputs needed from user

- One-line change description (the elevator pitch)
- Why now (trigger / motivation — bug, ticket, business request, regulatory)
- Affected components (probe the KB if available; otherwise enumerate)
- Estimated size (XS / S / M; L means escalate to full pipeline)
- Hard constraints (deadline, budget, "must not touch X")
- Solution constraints (implementation guardrails the AI must honor — "no regex", "no hardcoded maps", "no new dependencies")
- Success criteria (observable outcome)
- Explicit out-of-scope statements

## Question script

Ask **one question at a time**. Prefer multiple-choice when applicable. Allow "skip" / "not sure" answers.

1. **Describe the change in one sentence.** ("Add X to Y", "Fix Z so it does W", "Replace A with B")
   - **Format:** free-text
   - **Validation:** non-empty; <=180 chars; warn if more than one verb (likely two changes bundled)
   - **Maps to:** `quick_dev.change.title`

2. **Why now?** What triggered this work — bug, customer request, regulatory deadline, prior incident, performance issue, deferred-tech-debt payback?
   - **Format:** multiple-choice + free-text rationale
   - **Options:** `bug-fix` / `customer-request` / `regulatory-deadline` / `prior-incident` / `performance-issue` / `tech-debt-payback` / `feature-request` / `internal-tooling` / `other`
   - **Maps to:** `quick_dev.change.trigger` + `quick_dev.change.rationale`

3. **Which components are affected?** (if a KB exists, the skill probes ARCHITECTURE.md for matches and pre-fills; otherwise free-list)
   - **Format:** structured-list (auto-fill from KB component IDs when available)
   - **Validation:** when the KB exists, every component must resolve to a real file under `<knowledge_base_path>/components/`
   - **Maps to:** `quick_dev.change.affected_components[]`

4. **Estimated size.**
   - **Format:** multiple-choice
   - **Options:** `XS` (one file, < 1 day) / `S` (a few files, 1-3 days) / `M` (multiple files / one feature folder, 3-10 days) / `L` (escalate — use the full pipeline instead)
   - **Validation:** `L` triggers a redirect to `create-requirements-package` and aborts the quick-dev flow
   - **Maps to:** `quick_dev.change.size`

5. **Hard constraints.** (deadline, budget, "must not touch component X", "must not break behavior Y")
   - **Format:** structured-list of `{constraint_kind, description}` where `constraint_kind` ∈ `{deadline, budget, do-not-touch, do-not-break, regulatory, dependency-version}`
   - **Validation:** at least one entry encouraged (warn if empty)
   - **Maps to:** `quick_dev.change.constraints[]`

6. **Solution constraints.** Implementation choices the AI must honor through every iteration of the change — including any pivot after a failed verification. (e.g. "no regex", "no hardcoded lookup maps", "no new dependencies", "no schema migrations", "must use the existing retry helper")
   - **Format:** structured-list of `{constraint_kind, description, rationale?}` where `constraint_kind` ∈ `{forbidden-technique, forbidden-dependency, required-pattern, performance-budget, footprint-limit, other}`
   - **Validation:** none required, but the question is asked verbatim — silence here is the most common cause of an AI quietly violating an unspoken rule on a retry. Echo the answer (or "none") back.
   - **Maps to:** `quick_dev.change.solution_constraints[]`
   - **Why this is separate from Q5:** hard constraints answer "what must we not break or exceed in the world?"; solution constraints answer "what techniques must the implementation not use?". The first prevents scope drift; the second prevents the AI from re-introducing a forbidden approach during a Solution Pivot.

7. **Success criteria.** What observable outcome confirms the change is done? (1-3 entries; format like an acceptance criterion)
   - **Format:** structured-list of `{given, when, then}` triples
   - **Validation:** at least one triple
   - **Maps to:** `quick_dev.change.success_criteria[]`

8. **What is explicitly OUT of scope?** (one bullet per item — names the things you're NOT changing even if a reader might assume you should)
   - **Format:** structured-list of free-text bullets
   - **Validation:** at least one entry encouraged (warn if empty — out-of-scope is the cheapest insurance against scope creep)
   - **Maps to:** `quick_dev.change.out_of_scope[]`

9. **Existing artifacts to incorporate.** Tickets, incident notes, screenshots, prior PRs, ADRs, design notes — anything the user has that should seed the spec.
   - **Format:** structured-list of paths or URLs
   - **Validation:** local paths must resolve; URLs are accepted as-is
   - **Maps to:** `quick_dev.change.existing_artifacts[]`

**Wrap-up:** Confirm the answers in summary form before proceeding. Echo the title, trigger + rationale, affected components, size, hard constraints, solution constraints, success criteria, out-of-scope list, and existing artifacts. Re-prompt the size if `L`. Confirm before drafting the spec.

## Output format

Answers feed the `requirements/executive-summary-business-context` and `requirements/functional-requirements` blocks of the quick-dev spec OR the framing of the brownfield-enhancement-spec.

```markdown
# Quick-dev change: Add CSV export to order list

## Why now
Trigger: customer-request. Three Tier-1 customers asked for a CSV export
of the filtered order list this quarter; the workaround (copy-paste from
the UI) is breaking on >500 rows.

## Affected components
- acme-orders-api/order-export-controller (new)
- acme-orders-api/order-store (read-only)
- acme-orders-ui/order-list-screen (add export button)

## Size: S (3 days)

## Constraints
- Deadline: 2026-05-15 (customer demo)
- Do-not-touch: existing /v1/orders REST endpoints

## Solution constraints
- forbidden-dependency: no new CSV libraries — use the stdlib formatter already in `acme-orders-api/lib/csv/`
- forbidden-technique: no in-memory full-result-set buffering — stream the export

## Success criteria
- GIVEN an operator with an active order-list filter, WHEN they click "Export CSV", THEN they receive a CSV file with columns id/customer/status/created_at/updated_at containing exactly the filtered rows.

## Out of scope
- Excel format (CSV only this round)
- Scheduled / recurring exports
- Permission changes (uses existing read role)
```

## Validation rules

- Title is one sentence with a single verb; multi-verb titles are flagged as likely-bundled changes.
- Size = `L` aborts the quick-dev flow with a redirect to `create-requirements-package`.
- When the KB exists, affected components must resolve to real component files; unresolved IDs are flagged.
- Out-of-scope must be explicit (warn if empty — silent assumption is the most common cause of quick-dev scope drift).
- Success criteria are Given/When/Then; vague statements ("export works") are re-prompted.
- Solution constraints are asked verbatim and echoed in the wrap-up (even when "none") — these are the rules the implementer must honor through every retry, including a Solution Pivot after a failed verification.

## Reusable across

- `document-quick-change` (entire workflow — the change spec is built from this pattern's answers)
- `quick-dev-spec` composition (declared as required elicitation)
- `brownfield-enhancement-spec` composition (declared as required elicitation; pairs with `impact-assessment`)
