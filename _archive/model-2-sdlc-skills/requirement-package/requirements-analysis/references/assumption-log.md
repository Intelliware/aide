# Assumption Log

## Purpose

Track, categorize, and drive resolution of assumptions the requirements are built on. An assumption is an unverified belief that one or more requirements or analysis outputs depend on. Produces an assumption register that feeds into risk-analysis (unverified assumptions are risks), the requirements-package (the architect needs to know which requirements rest on unverified assumptions), and the verification status summary in the handoff package. This is a living document — not a one-time capture — updated continuously from discovery through the requirements phase.

## When to Use

This is a **living document skill** — not a one-time step. Start it during codebase-discovery (when code-derived assumptions first appear) and maintain it continuously through discovery, analysis, and requirements phases. Step 9 in the analysis-workflow sequence is a formal consolidation pass — review all assumptions from steps 1–8 before risk-analysis consumes them.

**Add an entry immediately** whenever any discovery or analysis output produces an unverified belief. Do not batch entries for end-of-phase. The following are triggers for immediate logging:

- Any discovery or analysis output uses a word like "assumes", "appears to", "inferred", "likely", or "unclear"
- A requirement is written based on behavior that has not been stakeholder-confirmed
- A dependency readiness status is Uncertain
- A gap cannot be confirmed without external verification
- Any risk-analysis entry is sourced from an assumption

## What an Assumption Is

An assumption is an **unverified belief that one or more requirements or analysis outputs depend on**. If the assumption is wrong, something downstream must change.

An assumption is not:
- A confirmed requirement (that is a requirement)
- A settled decision (that belongs in the decision-log)
- A known risk (risks are derived from assumptions, but the risk register tracks the risk, not the underlying assumption)
- A provisional decision made on an unverified assumption — that is both a decision (log it in the decision-log) **and** an assumption (log it here); the decision-log entry must reference the ASMP ID so the link between the decision and its unverified basis is traceable

## Assumption ID Convention

Every assumption entry must have a stable unique identifier in the format `ASMP-NNN` (e.g., `ASMP-001`, `ASMP-042`). Assign IDs sequentially in the order assumptions are logged. Assign the ID as the first action when adding an entry — all subsequent linking and cross-referencing uses this ID.

**Why IDs matter:** The risk register, decision-log, gap register, and requirements documents all reference assumption IDs when linking to unverified beliefs. An assumption without an ID cannot be reliably cited by downstream artifacts.

IDs are never reused. If an assumption is proven false, its ID remains in the register with status `Invalidated`. If an assumption is split or reformulated, its ID remains in the register with status `Superseded`. Both statuses preserve the ID permanently — they differ in whether the invalidation cascade applies (`Invalidated` triggers it; `Superseded` does not).

## Verification Statuses

| Status | Meaning |
|--------|---------|
| **Code-verified** | Confirmed by reading the codebase — specific file and line can be cited |
| **Stakeholder-confirmed** | Confirmed by a named person in a specific conversation or document |
| **Assumed — pending confirmation** | Not yet verified — requires a linked risk register entry created at point of logging |
| **Circular — pending BSA decision** | Cannot be independently verified because two or more assumptions can only be verified by reference to each other — escalated to the BSA for an explicit planning decision (see Driving Verification) |
| **Superseded** | The entry was split or reformulated into one or more replacement entries — the original scope was refined, not proven false. The original ID is retained for traceability. The invalidation cascade does **not** apply: do not sweep dependents for rework, do not open rework risk entries, and do not notify stakeholders of a previously confirmed status. Reference the replacement ASMP IDs in the notes field. |
| **Invalidated** | Confirmed to be false — downstream items that depended on it must be revised and the full invalidation cascade applies (see Updating Entries) |

**Any assumption logged with status "Assumed — pending confirmation" requires a linked risk register entry.** Create the risk entry at the time of logging the assumption — do not defer this to step 11 (risk-analysis). The consequence of the assumption being wrong is the risk; the risk-analysis step will enrich these entries but does not replace the requirement to create them at source. Record the risk register ID in the assumption entry's `Linked risk ID` field, and record the ASMP ID in the risk register entry's `Source` field so the link is navigable in both directions.

**Scope of confirmation:** A Stakeholder-confirmed status requires that the confirmation explicitly covers the full scope of the assumption. A stakeholder confirming "yes, that field exists" does not confirm "that field is populated, accurate, and available in the production environment." If confirmation is partial, the assumption remains "Assumed — pending confirmation" for the unconfirmed portion. Split the entry into two assumptions if necessary — one confirmed, one still pending.

**Splitting an assumption:** When a single assumption entry must be split into two (because confirmation was partial, or because the entry spans two independently verifiable claims):
1. Assign a new `ASMP-NNN` ID for each new entry — do not reuse or extend the original ID.
2. Mark the original entry as `Superseded` with a note: "Split into [new ASMP IDs] — scope refined." The original ID must remain in the register; it is not deleted. Do not trigger the invalidation cascade — the assumption was reformulated, not proven false.
3. Transfer all "Depends On This" references from the original entry to whichever new entry covers the same scope. If a dependent artifact could be affected by either new entry, reference both IDs.
4. Create linked risk register entries for any new entries with status "Assumed — pending confirmation." If the original entry had an existing linked risk entry, assess whether it maps to one or both new entries and update accordingly — do not leave the original risk entry pointing to a `Superseded` assumption ID without updating its source reference.
5. Update all downstream artifacts that referenced the original ASMP ID — replace the reference with the appropriate new ASMP ID (or both, if both apply).

## Assumption Categories

Every assumption is assigned a category at the time of logging.

| Category | What makes it this category |
|----------|-----------------------------|
| **Technical** | Assumptions about existing system behavior, code structure, APIs, or infrastructure |
| **Data** | Assumptions about data availability, quality, format, or accessibility |
| **Business** | Assumptions about user behavior, business rules, organisational workflows, or stakeholder intent |
| **Organisational** | Assumptions about team capacity, skills, tooling access, or approval authority |

When in doubt, assign the category that matches the action required to verify the assumption — a Technical assumption is verified by a developer or by reading code; an Organisational assumption is verified by consulting people or reviewing team capacity. If a single assumption spans two categories (e.g., "the payments API supports idempotent retries" is both Technical and Business), assign the category that describes the primary subject matter of the belief — what the assumption is fundamentally about. "The payments API supports idempotent retries" is primarily a claim about system behavior, so it is Technical even though a business rule may require the behavior. If the primary subject matter is genuinely ambiguous, split the assumption into two entries — one per category — each scoped to a single independently verifiable claim.

## Inputs

Assumptions flow in from everywhere:

| Source | What It Contributes |
|--------|-------------------|
| codebase-discovery | Code-inferred behavior where confidence is < Confirmed |
| existing-artifact-review | Behaviors documented in stale or unverifiable artifacts |
| requirements-elicitation | Items the user couldn't answer definitively |
| dependency-mapping | Uncertain readiness statuses |
| gap-analysis | Assumptions about data availability or team capacity |
| constraint-extraction | Constraints sourced only from verbal stakeholder input |

## Conflicting Assumptions

When two sources produce assumptions about the same system element that contradict each other (e.g., codebase-discovery infers one behavior; requirements-elicitation records a stakeholder stating a different behavior):

**Both entries currently pending confirmation:**

1. **Log both assumptions as separate entries** — do not suppress one in favor of the other. Each belief exists, each has a source, and each has downstream dependencies that may differ.
2. **Cross-reference both entries explicitly** — in each entry's `Notes` field record: "Conflicts with [ASMP-NNN] — [brief description of the conflict]."
3. **Do not assign either entry a verified status** — a conflict means neither belief is confirmed. Both entries must remain "Assumed — pending confirmation" until the conflict is resolved.
4. **Escalate the conflict immediately** — present both entries to the BSA with a clear statement of the conflict and the two sources. The BSA must either direct a resolution path (e.g., "verify against the production system by [date]") or make an explicit written decision to accept one belief over the other with a stated rationale.
5. **When the conflict is resolved:** mark the disproven entry `Invalidated` (citing the resolution evidence and who confirmed it) and update the surviving entry's status to Code-verified or Stakeholder-confirmed. Update all downstream artifacts that referenced either ASMP ID.

**One entry already verified, incoming entry contradicts it:**

When a new source produces a belief that contradicts an assumption already marked Code-verified or Stakeholder-confirmed:

1. **Log the incoming contradicting belief as a new entry** with status "Assumed — pending confirmation" and a `Notes` field referencing the conflict: "Conflicts with [ASMP-NNN] — contradicts a previously confirmed entry."
2. **Do not immediately invalidate the previously confirmed entry** — the new belief has not yet been verified. Both coexist until the conflict is resolved.
3. **Cross-reference the confirmed entry** — add a note to its record: "Confirmed status under challenge from [new ASMP-NNN] — treat as unresolved pending conflict investigation." Do not change its status yet; the status transitions only when the conflict is resolved.
4. **Escalate immediately** — a conflict with a previously confirmed assumption is higher severity than a conflict between two pending assumptions, because downstream artifacts may already have been written against the confirmed belief. Present both entries to the BSA with a list of all downstream artifacts that depended on the confirmed entry.
5. **When the conflict is resolved:** if the confirmed entry is proven wrong, follow the full invalidation cascade (see Updating Entries — When an assumption is invalidated). If the confirmed entry survives, mark the new entry `Invalidated` and close its linked risk register entry.

A conflict between a code-inferred assumption and a stakeholder-stated assumption is a requirements integrity issue, not a documentation inconvenience. An unresolved conflict that reaches the requirements phase will produce requirements built on an undecided foundation.

## How to Add an Entry

When an assumption is identified, add it immediately — do not defer.

**Step 0 — Assign an ID:** Assign the next sequential `ASMP-NNN` ID before filling in any other field. This is the first action; all downstream linking uses this ID.

For each entry:

1. **State the assumption precisely** — what is believed to be true? Write it as a falsifiable statement: it must be possible to confirm or disprove it by a single specific action with a single named source. Scope each assumption to one verifiable claim. An assumption that requires multiple independent actions to verify (e.g., "the customer record exists, is accurate, and is accessible in production") must be decomposed into one entry per claim. A single overly broad assumption cannot be assigned a meaningful verification owner, deadline, or risk consequence — decompose it before logging. Avoid vague language such as "the system supports X" without specifying which capability, interface, or data element is being claimed.
2. **Assign a category** — Technical, Data, Business, or Organisational (see Assumption Categories above).
3. **State what depends on it** — which requirements, analysis outputs, or design decisions would need to change if the assumption is wrong. Use IDs where available (e.g., `REQ-012`, `DEP-003`). If requirement IDs have not yet been assigned, use a placeholder such as `[REQ-TBD: payment processing requirement]` and increment the `Outstanding REQ-TBD count` in the Summary table. The agent sweeps all `REQ-TBD` placeholders at the start of each requirements phase session and back-fills IDs as they are assigned — do not wait until end-of-phase to back-fill.
4. **Record the evidence source** — what created this belief? Acceptable sources: code observation (cite file and path), document (cite name and version), verbal statement (cite name and date). If the source is an inference, state what it is inferred from — "inference from X" is acceptable; "reasonable inference" without a stated basis is not.
5. **Assign verification status** — which of the six statuses applies right now? Valid starting statuses for a new entry are: `Code-verified`, `Stakeholder-confirmed`, `Assumed — pending confirmation`, and `Circular — pending BSA decision`. `Superseded` and `Invalidated` are not valid starting statuses — they are applied to existing entries only through the lifecycle transitions described in Splitting an assumption and Updating Entries respectively.
6. **State the risk if wrong** — what breaks or must be reworked?
7. **Define the verification method** — who will confirm it, by when, and how? (See Driving Verification below.) For entries logged directly as `Circular — pending BSA decision`, record `N/A — resolution is a BSA planning decision` and leave the verification owner and verification-by date blank. Do not invent a verification path for an assumption that has been identified as unverifiable by independent means.
8. **Define the fallback** — if the assumption proves false, what is the recovery plan? For entries logged directly as `Circular — pending BSA decision`, state the recovery plan for the scenario where the BSA decides the circular cluster represents an untenable constraint — this may mean descoping dependent requirements or restructuring the approach entirely.
9. **Initialize the stakeholders notified field** — set to `None` at entry time. This field is populated when the assumption is confirmed (see Updating Entries). Do not leave it blank — `None` is a valid and required initial value so the field is never confused with an overlooked omission.
10. **Populate the notes field** — record any cross-references, conflict flags, circularity detections, supersession links, or other contextual information that does not fit a structured field. If none apply at entry time, set to `None`. This field is the primary mechanism for cross-referencing conflicting or related assumptions and must be updated whenever a conflict, split, or reclassification occurs.

## Driving Verification

The assumption log is only valuable if assumptions are actually verified. For each "Assumed — pending confirmation" entry:
- Assign a named owner (not "team TBD")
- Set a verification-by date
- The verification method must be specific: "confirm with [Name] in the elicitation session on [date]", not "ask someone"

**Circular assumptions:** If two or more assumptions can only be verified by reference to each other — neither can be independently confirmed without the other first being confirmed — they cannot self-verify. When this is detected:
1. Mark all affected entries as `Circular — pending BSA decision`.
2. **If any affected entry was previously "Assumed — pending confirmation":** its existing linked risk register entry remains open — the risk did not disappear when the status changed. Clear the verification-by date and verification owner from the assumption entry — they no longer apply because resolution is now a BSA decision, not a verification task. Record the date of reclassification and who detected the circularity in the notes field.
3. **If any affected entry was not yet logged:** log it now as `Circular — pending BSA decision` and create a linked risk register entry at the time of logging.
4. Present the circular pair (or group) to the BSA with a clear statement of why independent verification is not possible.
5. The BSA must make an explicit written planning decision: either (a) identify a verification path that breaks the circularity (e.g., a third independent source), or (b) treat the circular cluster as an explicit design constraint logged in the decision-log, with all dependent requirements flagged as resting on an unverifiable basis.
6. A circular assumption that is silently carried forward as "Assumed — pending confirmation" — without the circularity being flagged — is a process failure of the same severity as a silently overdue assumption.

**Overdue assumptions:** If a verification-by date passes without resolution, the assumption is overdue. The agent is responsible for identifying overdue entries at each checkpoint — do not wait for the BSA or the verification owner to flag them. When an overdue entry is detected:
1. Re-assess immediately — is the assumption still relevant to the requirements? If not, mark it `Superseded` with a note explaining why it is no longer relevant (e.g., "Requirement descoped — assumption no longer applies"). Do not mark it `Invalidated` — the assumption was not proven false, the scope changed. `Superseded` correctly suppresses the invalidation cascade; `Invalidated` would incorrectly trigger rework sweeps and stakeholder notifications for artifacts that do not need revision. Close the linked risk register entry and mark the fallback as `Closed — assumption no longer in scope`.
2. Present the overdue entry to the BSA with a clear summary of: the assumption statement, the original deadline, who the verification owner is, and what is blocking resolution.
3. The BSA must either extend the deadline with a new named owner and date, or make an explicit written decision to accept the risk — verbal acknowledgement is not sufficient.
4. If a deadline extension is granted, create a fresh risk-register entry linked to the overdue assumption — the delay itself is now a delivery risk, independent of the original risk the assumption generated.

An overdue assumption that is silently carried forward without BSA acknowledgement is a process failure.

Assumptions that reach the requirements-package stage with status "Assumed — pending confirmation" are an explicit handoff risk — the architect and developer will build against an unverified belief.

## Updating Entries

**When an assumption is verified:**
1. Update the status to Code-verified or Stakeholder-confirmed.
2. Cite the specific evidence (file/line for Code-verified; person, date, and context for Stakeholder-confirmed). Confirm the scope of the evidence matches the full scope of the assumption before closing.
3. Record who made the status change and when — this is the audit trail entry for the transition.
4. Populate the `Stakeholders notified` field with the names and dates of everyone informed of the confirmed status — populate this at the point of notification, not retrospectively. This list is required if the assumption is later invalidated.
5. Close the linked risk register entry if the assumption is confirmed true.
6. Mark the fallback plan as `Closed — assumption confirmed true`. No further action is required on the fallback.

**When a Circular entry is resolved by BSA decision:**

Two outcomes are possible. Update affected entries as follows depending on which the BSA chose:

*Outcome A — BSA identifies a verification path (a third independent source that breaks the circularity):*
1. Reclassify all affected entries from `Circular — pending BSA decision` to `Assumed — pending confirmation`.
2. Assign a named verification owner and verification-by date to each reclassified entry — the entry now follows the standard pending confirmation process.
3. The existing linked risk register entry remains open — the risk has not been resolved, only a resolution path has been found. Update the risk entry's description to reflect the new verification path and owner.
4. Record the BSA's decision in the notes field of each reclassified entry: "[Date] BSA decision [DECISION-NNN]: verification path identified via [source]. Reclassified to Assumed — pending confirmation."
5. Remove the entry from the `Circular — Pending BSA Decision` summary — it will now appear in the `Assumed — Pending Confirmation` summary.

*Outcome B — BSA treats the cluster as an accepted design constraint:*
1. Update the status of each affected entry to `Stakeholder-confirmed` — the BSA has explicitly accepted the unverifiable belief as a governing constraint, which is a form of stakeholder confirmation.
2. Record the confirmation evidence as the decision-log entry ID: "BSA accepted as design constraint per [DECISION-NNN], [date], [BSA name]."
3. Record the BSA as the confirming stakeholder in the `Stakeholders notified` field.
4. Close the linked risk register entry — the BSA's explicit acceptance of the constraint retires the unverified-assumption risk. Open a separate risk entry only if the constraint itself creates a delivery or quality risk (this is a distinct risk from the assumption's unverified status).
5. Flag all dependent requirements as resting on an accepted constraint — update each requirement's notes or assumptions section to reference the relevant ASMP ID and DECISION-NNN.
6. Mark the fallback plan as `Closed — accepted as design constraint per [DECISION-NNN]`.

**When an assumption is invalidated (proven false):**
1. Mark status as Invalidated.
2. Record who confirmed the invalidation, when, and what evidence was found.
3. Update all dependent requirements and analysis outputs. Use the "Depends On This" list from the assumption entry to identify every affected artifact.
4. Create a risk register entry for the rework needed. **Exception — if the entry was previously `Circular — pending BSA decision`:** a linked risk register entry already exists. Do not create a duplicate. Instead, update the existing risk entry to reflect that the assumption is now confirmed false and reframe the risk as a confirmed rework obligation rather than an unverified risk.
5. If the assumption had previously been marked Code-verified or Stakeholder-confirmed, notify all stakeholders recorded in the `Stakeholders notified` field — they may have made downstream decisions based on the now-invalidated confirmation.
6. Activate the fallback plan recorded at entry time. If the fallback plan is no longer viable, escalate to the BSA before proceeding with rework.

## Output

A maintained **assumption-log** document using the template at `../assets/assumption-log.md`.

### File Output

Write the completed assumption log to `docs/<feature>/requirements-package/analysis/assumption-log.md`.

The template provides:
- The **Assumption Register** — full entry table with all fields: ASMP ID, assumption statement, category, evidence source, verification status, linked risk ID, dependencies, risk if wrong, verification method, owner, fallback plan, notes, stakeholders notified, dates logged and verified, and evidence citation.
- The **Assumed — Pending Confirmation** summary — a filtered view of all entries with status "Assumed — pending confirmation", showing linked risk IDs, verification owners, deadlines, and fallback plans.
- The **Circular — Pending BSA Decision** summary — a filtered view of all entries with status "Circular — pending BSA decision", showing: the circular group members (listed by ASMP ID), the reason independent verification is not possible, the linked risk IDs, and the decision-log entry ID for the BSA's written planning decision (or `Awaiting BSA decision` if no decision has been recorded yet).
- The **Invalidated Assumptions** log — a record of false assumptions with downstream items affected and actions taken. Does not include `Superseded` entries — superseded entries appear only in the main register.
- A **Summary** table with: status counts by category, total assumption count, count of overdue `Assumed — pending confirmation` entries (entries whose verification-by date has passed without resolution — only this status can be overdue; `Circular`, `Superseded`, and `Invalidated` entries do not have verification-by dates and are never counted as overdue), count of `Circular — pending BSA decision` entries, and `Outstanding REQ-TBD count` (the number of dependency fields still containing placeholder references that have not yet been back-filled with assigned IDs).

The assumption log feeds into: risk-analysis (each unverified assumption is a risk entry), the requirements-package (the architect must know which requirements rest on unverified assumptions), and the handoff package verification status summary.

**Lifecycle closure:** The assumption log is maintained from discovery through requirements-package assembly. It is closed — no further entries are added — once Checkpoint 2 is signed off and the requirements-package is assembled. Assumptions discovered after handoff (e.g., during development or testing) are outside the scope of this skill and must be captured in a delivery risk log owned by the development team. The closed assumption log is included as a read-only artifact in the requirements package so the architect and developer have a full record of what was verified, what remains unverified, and what was accepted as a known risk.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| An architect designs against assumed behavior that turns out to be a bug | Invalidated assumptions are flagged with a downstream impact review |
| Requirements built on unverified code-inferred behavior that gets discovered wrong during implementation | "Assumed — pending confirmation" entries are visible risks, not hidden assumptions |
| Tribal knowledge assumed to be correct never gets written down or verified | Verbal-only assumptions are immediately logged and assigned a verification owner |
| An assumption is marked verified without citing specific evidence | Verification requires citing file/line or named person/date — status cannot advance without a concrete evidence citation |
| An overdue verification is silently carried forward | Overdue assumptions trigger BSA escalation with an explicit written decision to extend or accept the risk |
| An assumption is invalidated after the handoff gate is signed off, with no downstream audit | The Invalidated status requires recording who confirmed the invalidation and triggers a sweep of all artifacts in the "Depends On This" list |
| Circular assumptions prevent independent verification | If two assumptions can only be verified by reference to each other, escalate to the BSA — circular assumptions cannot self-verify and must become an explicit planning decision, not a verification task |

## Hand-off Gate

**The assumption-log is a running log, not a one-shot artifact. It is updated throughout all phases. It has two mandatory review checkpoints:**

**Checkpoint 1 — End of Analysis (before the requirements phase begins):**
1. Before presenting the log, scan for overdue entries — any "Assumed — pending confirmation" entry whose verification-by date has passed. Present overdue entries separately and first, with their escalation status. Do not bury them in the main log review.
2. Scan for any `Circular — pending BSA decision` entries. Present these separately after overdue entries, with the circular pair or group clearly identified and the reason independent verification is not possible.
3. Present the full current assumption-log.
4. The BSA reviews all "Assumed — pending confirmation" entries and confirms each has a verification owner and target date.
5. Each "Assumed — pending confirmation" and each "Circular — pending BSA decision" entry must have a linked risk-register entry with the ASMP ID recorded in the risk entry's `Source` field.
6. Receive explicit acknowledgement before the requirements phase begins.

**Checkpoint 2 — End of Requirements (before requirements-package assembly):**
1. Present the final assumption-log.
2. No "Assumed — pending confirmation" entries may remain without an explicit BSA decision to accept the risk. An explicit decision means a written entry in the decision-log that: (a) references the ASMP ID, (b) states the accepted risk, and (c) records the BSA's name and date of acknowledgement. Verbal acknowledgement is not sufficient.
   - **Decision-log coordination note:** The decision-log consolidation ran at step 10 of the analysis phase. Any risk-acceptance decisions made at Checkpoint 2 are new entries that must be added to the decision-log after Checkpoint 2 completes — the agent is responsible for creating these entries. The decision-log is not closed until Checkpoint 2 is fully signed off. Do not treat the step 10 consolidation as the final state of the decision-log if Checkpoint 2 produces new decisions.
3. All invalidated assumptions must be propagated to affected artifacts.
4. No `Circular — pending BSA decision` entries may remain without a written BSA decision recorded in the decision-log.

---

## Completion Criteria (per phase)

**End of discovery:**
- [ ] All code-inferred assumptions from codebase-discovery are logged *(Agent)*
- [ ] All behaviors sourced from stale documents are logged *(Agent)*
- [ ] All elicitation deferrals are logged *(Agent)*
- [ ] All logged assumptions have an ASMP ID assigned *(Agent)*

**End of analysis:**
- [ ] All uncertain dependency readiness items are logged *(Agent)*
- [ ] All verbal-only constraints are logged *(Agent)*
- [ ] All "Assumed — pending confirmation" entries have a verification owner and target date *(BSA confirms at Checkpoint 1)*
- [ ] All "Assumed — pending confirmation" entries have a linked risk register entry created at point of logging *(Agent)*
- [ ] No verification-by dates are overdue — any that are have been escalated to the BSA and a written disposition recorded *(BSA confirms)*
- [ ] No `Circular — pending BSA decision` entries remain without a written BSA decision recorded in the decision-log *(BSA confirms at Checkpoint 1)*

**End of requirements:**
- [ ] No "Assumed — pending confirmation" entries remain without a written BSA decision to accept the risk *(BSA written sign-off per Checkpoint 2)*
- [ ] All invalidated assumptions have been propagated to dependent requirements and analysis outputs *(Agent)*
- [ ] The Summary table's `Outstanding REQ-TBD count` is zero — all placeholder requirement references have been back-filled with assigned IDs *(Agent)*
- [ ] All written BSA risk-acceptance decisions are recorded in the decision-log with the referenced ASMP ID *(Agent)*
