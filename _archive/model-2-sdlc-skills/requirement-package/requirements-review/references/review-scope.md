# Review — Scope

## Purpose

Validate that scope is well-defined and bounded within the requirements package. Check that out-of-scope items are explicit and governed, must-not-touch boundaries are respected by requirements, scope-related assumptions are resolved, and the scope summary in the executive summary is consistent with the detailed boundary register.

## When to Use

- After the requirements package is drafted — specifically after the executive summary (Section 1), functional requirements (Section 5), and the assumptions-constraints-scope document (Section 10) are complete
- Before any other review skill — scope problems invalidate other reviews (you cannot review completeness against an incorrectly bounded scope)
- When stakeholders express concern that the delivery is "too big" or "going off track"

## What This Reviews

Scope review asks three questions:
1. **Is every requirement within the declared scope?** (Catch requirements that conflict with explicit out-of-scope decisions)
2. **Does any requirement touch a must-not-touch element?** (Catch boundary violations)
3. **Are scope-related assumptions resolved?** (Catch ungoverned scope assumptions that will become disputes during implementation)

> **Out of scope for this review:** whether every in-scope item is addressed by at least one requirement (scope gaps in the other direction). That is covered by `review-completeness.md`. Do not conflate the two. This review checks that requirements do not exceed the declared scope; the completeness review checks that requirements fully cover it.

Scope creep often enters requirements documents through legitimate-looking additions: "while we're changing this, we should also…" or "the stakeholder mentioned this and it seemed related." Scope review catches it before it reaches the architect.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Executive summary | `docs/<feature>/requirements-package/requirements/executive-summary.md` (Section 1 of the requirements package) — specifically the **Scope summary** sub-section | Yes — provides the summary-level boundary baseline used to identify adjacent areas and to verify consistency with Section 10 |
| Assumptions, Constraints & Out of Scope document | `docs/<feature>/requirements-package/requirements/assumptions-constraints-scope.md` (Section 10 of the requirements package) | Yes — the authoritative boundary definition with OOS-xxx and MNT-xxx entries |
| Functional requirements | `docs/<feature>/requirements-package/requirements/functional-requirements.md` (Section 5 of the requirements package) | Yes — every requirement is evaluated against the scope |

## Precondition — Verify Inputs Before Running Any Check

**Precondition A — Section 10 exists and is populated.** Open the assumptions-constraints-scope document. If it is absent, or if its OOS and MNT tables contain only placeholder rows (e.g., `OOS-001 | [what is excluded]`), the review cannot run. Raise a Blocker finding and halt — do not execute any check.

| Precondition finding | Severity | Action |
|---|---|---|
| Section 10 is absent | Blocker | Halt. Do not run any checks. Raise with BSA: Section 10 must be produced before scope review can proceed. |
| Section 10 exists but OOS and MNT tables are skeletal placeholders | Blocker | Halt. Do not run any checks. Raise with BSA: Section 10 must be completed with real entries before scope review can proceed. |

**Precondition B — Executive summary scope summary sub-section exists.** Open the executive summary (Section 1) and locate the scope summary sub-section. This is a degraded-mode precondition — failure does not halt the review.

| Precondition finding | Severity | Action |
|---|---|---|
| Executive summary scope summary sub-section is absent or empty | Medium | Raise as a finding. Proceed with all checks, but execute Step 1a using the fallback method described in Check 1. Step 1e (Section 1 vs Section 10 consistency) cannot be performed — note this limitation in the findings list. |

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  PRECONDITION A (Blocker)                            │
│     Section 10 is present and populated — not        │
│     skeletal. Halt if absent or skeletal.            │
│  PRECONDITION B (Medium / degraded mode)             │
│     Executive summary scope summary is present.      │
│     Raise finding if absent; continue in fallback.   │
├──────────────────────────────────────────────────────┤
│  1. OUT-OF-SCOPE SECTION COMPLETENESS                │
│     1a. Identify adjacent areas (exec summary or     │
│         fallback). 1b. Verify OOS-xxx entries.       │
│     1c. Flag empty OOS list as High.                 │
│     1d. Verify each OOS entry is evaluable.          │
│     1e. Verify Section 1 and Section 10 are          │
│         consistent with each other.                  │
├──────────────────────────────────────────────────────┤
│  2. MUST-NOT-TOUCH SECTION COMPLETENESS              │
│     MNT-xxx entries cover all existing components    │
│     that any requirement modifies or whose           │
│     behaviour it depends on changing.                │
├──────────────────────────────────────────────────────┤
│  3. REQUIREMENT vs OUT-OF-SCOPE CONFLICT             │
│     No functional requirement covers something       │
│     listed as OOS-xxx.                               │
├──────────────────────────────────────────────────────┤
│  4. MUST-NOT-TOUCH BOUNDARY CHECK                    │
│     No functional requirement touches, modifies,     │
│     or depends on changing an MNT-xxx element.       │
├──────────────────────────────────────────────────────┤
│  5. SCOPE ASSUMPTION STATUS                          │
│     ASMP-xxx entries related to scope boundaries     │
│     are confirmed, or are pending with a named       │
│     owner, verification plan, and a deadline that    │
│     falls before handoff.                            │
└──────────────────────────────────────────────────────┘
```

## Check Details

### Check 1 — Out-of-Scope Section Completeness

**Step 1a — Identify adjacent areas.**

**If Precondition B passed:** Read the scope summary sub-section of the executive summary (Section 1). It describes what is in scope and out of scope at a summary level. Use it to build the set of adjacent areas — system areas, capabilities, or integrations that are related to the in-scope work. Then:

- For every area the executive summary describes as "not included," "excluded," "deferred," "outside this release," "future scope," or "not addressed" — verify a corresponding OOS-xxx entry exists in Section 10.
- For every in-scope area the executive summary names — identify what sits directly alongside it in the system (the same deployment unit, the same database, shared APIs, shared data structures) and verify those adjacent areas either have requirements (in scope) or OOS-xxx entries (explicitly excluded). If an adjacent area identified in this step has neither requirements covering it nor an OOS-xxx entry explicitly excluding it, raise a **Medium** finding — the boundary around that area is ungoverned.

**If Precondition B failed (fallback):** Derive adjacent areas from the functional requirements. For each requirement, identify the system areas it touches (modules, tables, APIs, services). For each touched area, identify what sits directly alongside it — same service, same database, shared schema — and verify those adjacent areas either have requirements (in scope) or OOS-xxx entries (explicitly excluded). If an adjacent area identified in this step has neither, raise a **Medium** finding — the boundary around that area is ungoverned.

**Step 1b — Verify OOS-xxx entry completeness.**

For each OOS-xxx entry, verify:

- **Decision maker**: names someone with organisational authority to commit to the exclusion. "The team" or "general consensus" is not acceptable.
- **Future phase references**: if an OOS item is deferred to a future phase, the phase must exist in an active roadmap or be explicitly noted as "No plan to address — risk accepted by [name]."

**Step 1c — Empty OOS list.**

If the OOS list contains no real entries, raise a **High** finding — it is almost never true that no adjacent item was considered. An empty list means no boundary analysis was done and there is no documentary basis for rejecting scope creep during implementation.

**Step 1d — OOS entry evaluability.**

For each OOS entry, ask: if a developer surfaces an adjacent issue during implementation and brings it to the BSA, does this OOS entry give a definitive answer about whether the issue is in scope?

**Weak entries (flag for improvement):**
- "Keep scope narrow" — not evaluable
- "Avoid unnecessary changes" — tautological, not a rule
- "Future phases will handle related work" — no criterion for what counts as related

**Strong entries (these pass):**
- "Mobile application support is excluded from this release — any UI capability applies to the web interface only"
- "The billing module is out of scope — no requirement may introduce a dependency on billing data or billing workflows"
- "Integration with third-party analytics is excluded — the data layer must be designed to be analytics-agnostic"

Weak entries are a **Medium** finding. They will not stop implementation but will produce inconsistent scope decisions when new issues surface.

**Step 1e — Section 1 vs Section 10 consistency check.**

*Skip this step if Precondition B failed — note the limitation in the findings list.*

For every scope boundary stated in the Section 1 scope summary, verify that a corresponding OOS-xxx or MNT-xxx entry exists in Section 10. For every OOS-xxx or MNT-xxx entry in Section 10 that covers an entire system area, a named integration, or a named module, verify it is reflected at least at a summary level in the Section 1 scope summary. Individual data field exclusions or minor implementation constraints need not appear in Section 1.

Inconsistencies between Section 1 and Section 10 are a **Medium** finding. They indicate the two documents were not kept in sync and will give a first-time reader a different boundary picture than the detailed register.

### Check 2 — Must-Not-Touch Section Completeness

**Identify which components need MNT coverage.**

**Identifying components that need MNT coverage.**

A component requires an MNT-xxx entry if it meets both of the following:
1. It is **not** intended to be modified by this change (it is not the subject of any functional requirement), and
2. At least one functional requirement **modifies** it, **calls** it in a way that changes its behaviour, **writes** to a data structure it owns, or **depends on changing** a contract it exposes.

Read-only access to an existing component — where no requirement changes its behaviour, schema, or contracts — does not by itself require an MNT entry, unless the component is fragile and even read-side changes risk side effects (e.g., firing triggers, invalidating caches). If fragility is suspected, raise a **Low** finding for the BSA to assess.

**For brownfield and hybrid projects:** scan the functional requirements for every existing component they touch using the criteria above. Verify each such component either has an MNT-xxx entry (if it must not be modified) or is covered by a requirement (if it is intentionally being changed). An existing component that is neither in the MNT list nor covered by a requirement is an ungoverned boundary — flag as **Medium**. This does not apply to components accessed in a read-only capacity where no requirement modifies their behaviour, schema, or contracts — those are handled by the fragility check above and do not require an MNT entry.

An empty MNT section on a brownfield or hybrid project is a **High** finding — it means no preservation analysis was done.

Every MNT-xxx entry must document:
- What must not be touched
- Why it must be preserved
- What breaks if it is modified

### Check 3 — Requirement vs Out-of-Scope Conflict

For every functional requirement, check whether it covers functionality, data, or system areas that appear in the OOS-xxx list.

Common patterns:
- A requirement was added after the out-of-scope decision was recorded, without revisiting the exclusion
- A requirement covers an adjacent area that was explicitly deferred to a future phase
- A requirement was added as a "prerequisite fix" but the scope exclusion list does not acknowledge it as now in-scope

Apply the **Scope Violation Resolution Protocol** (below) to any conflict found.

> **Note:** this check does not catch in-scope items with no requirement (scope gaps in the other direction). That is the responsibility of `review-completeness.md`. Do not attempt to catch gaps here.

### Check 4 — Must-Not-Touch Boundary Check

For every MNT-xxx item, verify that no functional requirement touches, modifies, references a change to, or depends on modifying that element.

Apply the **Scope Violation Resolution Protocol** (below) to any violation found.

---

### Scope Violation Resolution Protocol

When a functional requirement conflicts with an OOS-xxx entry (Check 3) or an MNT-xxx item (Check 4), the resolution is always one of:

1. **Scope creep** — the requirement must be removed or redesigned so that it no longer conflicts with the OOS or MNT entry. No change to the scope boundary.
2. **Legitimate scope change** — the requirement reflects a genuine need. The OOS or MNT entry must be revised: remove the item from OOS/MNT, document the revised boundary, and obtain explicit sign-off from a named decision maker. The change must be reflected in the executive summary scope summary (Section 1) as well.

If the BSA cannot determine which path applies, raise the ambiguity as a **High** finding. In the recommended action, describe both paths and what decision is needed. Do not allow the review to proceed until the BSA commits to one path in writing and the affected artifact is updated.

---

### Check 5 — Scope Assumption Status

**Step 5a — Identify scope-related assumptions.**

Review the ASMP-xxx entries in the assumptions-constraints-scope document. Scan for any entry whose statement relates to a scope boundary. Do not limit the scan to assumptions explicitly categorised as "scope" — scope assumptions frequently appear under technical, system behaviour, or data categories.

Use the following signal phrases to identify candidates:

| Signal phrase pattern | Why it signals a scope assumption |
|---|---|
| "is assumed to be out of scope" | Direct scope boundary assumption |
| "is assumed not to require modification" | Implicit MNT assumption |
| "has no shared dependency with" | Implicit boundary assumption — if wrong, the scope expands |
| "will not be affected by" | Implicit preservation assumption |
| "is assumed to be unchanged" | Implicit MNT assumption |
| "is not expected to need updating" | Implicit scope exclusion framed as expectation |
| "there is no dependency between" | Negative-form boundary assumption — if wrong, the scope expands |
| "does not share data with" | Negative-form boundary assumption — if wrong, the scope expands |
| "does not share schema with" | Negative-form boundary assumption — if wrong, the scope expands |
| "does not share infrastructure with" | Negative-form boundary assumption — if wrong, the scope expands |
| "no changes are required to" | Implicit scope exclusion stated as fact |
| "will remain unaffected" | Implicit preservation assumption in negative form |

**Step 5b — Classify each scope-related assumption.**

| Status | Severity | What to raise |
|---|---|---|
| `Assumed-pending-confirmation` with no owner, no verification plan, and no deadline | **High** | This assumption is ungoverned. An unconfirmed scope boundary assumption is a late-breaking scope dispute waiting to happen. Must be resolved before PASS. |
| `Assumed-pending-confirmation` with a named owner, a verification plan, and a deadline before handoff | **Medium** | Acceptable to proceed, but flag for tracking. Verify the deadline is realistic. |
| `Stakeholder-confirmed` or `Code-verified` | No finding | Pass. |
| `Verified-False` with downstream requirements revised | No finding | Pass — the escalation protocol was followed. |
| `Verified-False` with downstream requirements not revised | **High** | A scope assumption has been disproved and the affected requirements have not been updated. Identify every requirement whose rationale referenced this assumption and raise as a High finding for each. |

## Output

A findings list in this format:

| Finding ID | Check | Requirement / Item | Description | Severity | Recommended Action |
|-----------|-------|--------------------|-------------|---------|-------------------|
| SCOPE-001 | Req vs out-of-scope conflict | REQ-009, OOS-003 | REQ-009 adds admin reporting functionality explicitly excluded by OOS-003 | High | Apply scope violation resolution protocol: remove REQ-009 or revise OOS-003 with decision maker sign-off and update Section 1 scope summary |
| SCOPE-002 | Must-not-touch boundary | REQ-004, MNT-002 | REQ-004 modifies the order status API response shape, which is listed as must-not-touch in MNT-002 | High | Apply scope violation resolution protocol: redesign REQ-004 to be additive only, or reclassify MNT-002 with documented rationale, decision maker approval, and Section 1 scope summary update |
| SCOPE-003 | Out-of-scope completeness | OOS section | Out-of-scope list is empty — no adjacent areas were considered for exclusion and there is no documentary basis for rejecting scope creep | High | Identify adjacent system areas from the executive summary scope summary and document explicit exclusion decisions with decision maker sign-off |
| SCOPE-004 | Scope assumption status | ASMP-006 | Scope assumption that the billing module is not a shared dependency has no owner, no verification plan, and no deadline | High | Assign an owner, define a verification plan, and set a deadline before handoff |
| SCOPE-005 | Must-not-touch completeness | MNT section | MNT section is empty on a hybrid project — REQ-007 calls the legacy order processing engine and depends on a change to its retry contract, but no MNT entry governs any adjacent components of that engine | High | Identify all existing components that requirements modify or whose behaviour they depend on changing; document MNT entries for those not intended to be modified |
| SCOPE-006 | Section 1 vs Section 10 consistency | OOS-004, Section 1 | Section 10 OOS-004 excludes the inventory reservation service but the Section 1 scope summary makes no mention of this exclusion | Medium | Update the Section 1 scope summary to reflect the inventory reservation service exclusion |

**Severity:**
- **High** — a scope boundary violation, a governance failure (empty OOS/MNT sections, ungoverned scope assumption), or a verified-false assumption whose downstream requirements were not updated. Must be resolved before PASS.
- **Medium** — a scope quality issue that weakens governance during implementation but does not constitute an active violation (absent executive summary scope summary, weak OOS entry wording, Section 1 vs Section 10 inconsistency, pending assumption with a plan, ungoverned adjacent component that is read-only)
- **Low** — a documentation gap with no immediate delivery impact

## Verdict

- **PASS** — No High findings. Out-of-scope and must-not-touch sections are present, non-trivial, and consistent with the functional requirements. All scope-related assumptions are either confirmed or pending with a named owner, verification plan, and a deadline before handoff. No Verified-False scope assumptions with unrevised downstream requirements.
- **FAIL** — One or more High findings remain unresolved.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Requirements that conflict with an explicit scope exclusion decision reach the architect | Check 3 surfaces requirement vs out-of-scope conflicts before handoff |
| "While we're in there" additions accumulate and the delivery balloons | Checks 1 and 3 together force every exclusion to be documented and every requirement to be consistent with it |
| A developer modifies a must-not-touch element because a requirement implied it was needed | Check 4 catches functional requirements that breach must-not-touch boundaries |
| A scope assumption declared "pending" is still pending at handoff with no owner | Check 5 distinguishes between ungoverned assumptions (High) and pending-with-plan assumptions (Medium) |
| A scope assumption is disproved but affected requirements are never updated | Check 5 raises a High finding for every Verified-False assumption whose downstream requirements were not revised |
| Out-of-scope decisions were made verbally with no record | Check 1 requires every exclusion to have a named decision maker with documented authority |
| OOS entries are too vague to govern implementation decisions | Step 1d requires each OOS entry to be evaluable against a concrete new item |
| A brownfield or hybrid project has no preservation analysis | Check 2 raises a High finding if the MNT section is empty on any project touching existing components |
| Section 1 and Section 10 give readers contradictory scope pictures | Step 1e flags any inconsistency between the executive summary scope summary and the detailed boundary register |
| Scope boundary review runs against an incomplete Section 10 | Precondition A halts the review before any check runs, preventing false PASSes |
| The executive summary scope summary is missing with no record of the gap | Precondition B raises a Medium finding and switches Check 1 to fallback mode |

## Hand-off Gate

**Review 1 of 10 — strictly sequential. A FAIL verdict must be resolved before reading the next review skill.**

Before reading `review-completeness.md`, you must:
1. Write the completed findings list in full — every check result with its finding, severity, and recommended action.
2. Record the PASS or FAIL verdict.
3. Present findings and verdict to the BSA for review.
4. If **FAIL**: the BSA resolves all High findings, updates the affected artifacts, and you re-run this review. Do not proceed until the verdict is PASS.
5. If **PASS**: receive explicit BSA acknowledgement, then read `review-completeness.md`.

---

## Completion Criteria

- [ ] Precondition A verified — Section 10 is present and populated (not skeletal); if absent or skeletal, Blocker raised and review halted
- [ ] Precondition B verified — executive summary scope summary present; if absent, Medium finding raised and Check 1 running in fallback mode
- [ ] Check 1 complete — adjacent areas identified (Step 1a); OOS-xxx entries cover them (Step 1b); empty OOS list checked (Step 1c); each entry is evaluable (Step 1d); Section 1 vs Section 10 consistency verified (Step 1e, or noted as skipped if Precondition B failed)
- [ ] Check 2 complete — MNT section covers all existing components that requirements modify or depend on changing
- [ ] Check 3 complete — no functional requirement conflicts with an OOS-xxx entry
- [ ] Check 4 complete — no functional requirement touches or depends on modifying an MNT-xxx element
- [ ] Check 5 complete — all scope-related ASMP-xxx entries confirmed or pending-with-plan; no Verified-False scope assumptions with unrevised downstream requirements; signal phrase scan applied including negative-form phrases
- [ ] Verdict recorded
