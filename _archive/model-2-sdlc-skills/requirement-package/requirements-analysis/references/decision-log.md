# Decision Log

## Purpose

Record and maintain key decisions — what was decided, when, alternatives considered, rationale, who decided, and linked items. Prevents revisiting settled decisions.

## When to Use

This is a **living document skill** — not a one-time step. Start it at the beginning of the analysis phase and maintain it throughout the analysis phase. At hand-off it becomes a read-only artifact: the requirements phase and design phase **consume** it; they do not add to it. Step 10 in the analysis-workflow sequence is the formal consolidation pass — review all decisions from steps 1–9 before risk-analysis consumes them.

Record a decision whenever:
- A scope boundary is drawn (what is in vs. out vs. must-not-touch)
- A stakeholder resolves a conflicting requirement
- A requirements-domain interpretation is selected from multiple valid alternatives — for example, which regulatory standard the system must comply with, which business rule takes precedence when two conflict, or which of two competing stakeholder positions defines the requirement. **This does not include implementation or technology decisions** — those are solution-phase decisions and do not belong in the requirements-package decision log
- A constraint is accepted, waived, or negotiated
- A prioritization classification is challenged and resolved
- A Won't-have classification is assigned — whether or not it was challenged. Unchallenged Won't-have decisions are particularly important to preserve: the absence of a challenge creates no discussion trail, and the decision will be re-raised as a new requirement if it is not logged with rationale
- A risk is accepted rather than mitigated
- A requirement is deliberately descoped
- A provisional decision is made that rests on an unverified assumption — the entry must reference the linked ASMP ID so the decision's unverified basis is traceable if the assumption is later invalidated

The decision log prevents revisiting settled decisions — a common and costly failure mode in brownfield projects where stakeholders, architects, and developers are often working from partial context at different times.

## What Belongs Here vs. Other Documents

| Document | What It Records |
|----------|----------------|
| **Decision log** | **That** a decision was made, **what** was decided, **when**, **why**, **who** decided, and **what alternatives were rejected** |
| Assumption log | Beliefs that have not yet been verified — pre-decision uncertainty |
| Constraint register | Limits the feature must operate within — often the input to a decision, not the decision itself |
| Scope change log | Changes to the change-scope document specifically. Scope changes produce entries in **both** the decision log (recording that the scope change was authorised and why) and the scope change log (recording the delta to the scope document itself) |
| Risk register | Risks accepted rather than mitigated — these produce a decision log entry when accepted |

## Decision ID Convention

Every decision entry must have a stable unique identifier in the format `DEC-NNN` (e.g., `DEC-001`, `DEC-042`). Assign IDs sequentially in the order decisions are logged. Assign the ID as the first action when adding an entry — all subsequent linking and cross-referencing uses this ID.

**Why IDs matter:** Requirements, risk entries, scope items, and assumption log entries all reference decision IDs when linking to settled decisions. A decision without an ID cannot be reliably cited by downstream artifacts.

IDs are never reused. If a decision is superseded, its ID remains in the register with status `Superseded by DEC-NNN`. The superseding decision receives a new ID.

**Concurrent contributors:** On projects where more than one person adds entries to the decision log simultaneously, IDs must be assigned by a single designated owner (typically the BSA) before any entry is shared or merged. If two contributors independently assign the same ID before syncing, the later-merged entry must be renumbered to the next available ID and all references to it updated. The date of the original decision is preserved; only the ID changes. Document the renumbering in the entry's status field (e.g., "Renumbered from DEC-007 — collision resolved [date]").

## How to Add an Entry

**Step 0 — Assign an ID:** Assign the next sequential `DEC-NNN` ID before filling in any other field. This is the first action; all downstream linking uses this ID.

When a decision is made:

1. **Record the date** — the date the decision was made, not the date the log entry was written if they differ
2. **State the decision clearly** — what was decided? Write it so someone who wasn't in the room understands what was settled
3. **State the alternatives considered** — what other options were on the table? This is critical — without it, the decision looks arbitrary and will be relitigated
4. **State the rationale** — why was this option chosen over the alternatives? What criteria drove the decision?
5. **Name the decision-maker** — the named person who had authority to make this call, or the named governance body that made it as a collective.
   - **Individual decision**: record the named person (e.g., "Jane Smith — Product Owner").
   - **Governance body decision** (board, committee, panel): record the body as the decision-maker and the chair as the ratifying authority separately (e.g., "Decision-maker: Architecture Review Board | Ratified by: Jane Smith (chair)"). Do not record the chair as the decision-maker — the chair facilitates and ratifies; the body decides. If the body voted, note the outcome (e.g., "unanimous" or "majority").
   - If a separate approver ratified a decision made by the BSA, record both the BSA as the decision-maker and the approver as the ratifying authority.
6. **Link to affected items** — which requirements, risks, scope items, or constraints does this decision affect? Use IDs (e.g., `REQ-012`, `RISK-003`, `CON-005`). If IDs have not yet been assigned, use a placeholder (e.g., `[REQ-TBD: payment processing requirement]`) and back-fill once assigned. The BSA is responsible for back-filling all placeholders. No placeholder may remain unresolved at the hand-off checkpoint — an unresolved `TBD` placeholder at the gate check is treated as an incomplete entry and blocks the gate.
7. **Set a status:**
   - `Active` — the decision stands
   - `Superseded by DEC-NNN` — a later decision replaced it; mark this entry and add the new one
   - `Deferred — revisit trigger: [condition] | owner: [named person]` — not yet final; must state the specific condition that triggers revisit and assign a named person responsible for monitoring it. A Deferred entry without a trigger condition and owner is not a valid entry. If the assigned owner becomes unavailable before the trigger fires, the BSA must assign a new named owner immediately — a Deferred entry without a current, reachable owner is treated as overdue and escalated to the BSA for disposition.

**Provisional decisions on unverified assumptions:** If the decision was made on an assumption that has not yet been verified, the entry must include a reference to the linked ASMP ID (e.g., `ASMP-014`). When the assumption is later invalidated, the decision must be reviewed and either confirmed, revised, or superseded.

## Reopening a Decision

Decisions in the log are settled and should not be reopened without cause. A decision can be reopened when:
- New information has emerged that the original decision-maker did not have
- The context has changed (a dependency that was available is now unavailable, a constraint that was hard is now waived)
- The decision was made without all required stakeholders being consulted

**Authorization:** Reopening must be authorised by the original decision-maker, their delegated authority, or — for governance decisions — the chair of the original approving body. Anyone who identifies a condition for reopening must escalate to one of these parties; they may not unilaterally reopen a settled decision.

**When authorization is structurally unavailable** (the original decision-maker has left the organization, no delegate was designated, and no equivalent approving body exists): the BSA escalates to their sponsor or project lead. The sponsor records a provisional authorization in the decision log, the decision is reopened and marked `Provisionally Superseded — sponsor authorization: [name, date]`, and the new entry notes that the standard authorization path was unavailable and why. This is not a normal path — the provisional authorization must be documented and is subject to review if the original decision-maker becomes reachable.

When a decision is reopened, the existing entry is marked `Superseded by DEC-NNN` and a new entry is added — the history is preserved, not overwritten.

## Output

A maintained **decision-log** document. Use the template at `../assets/decision-log.md` if it exists. If the template file is absent, create `docs/<feature>/requirements-package/analysis/decision-log.md` directly with the following mandatory structure:

### File Output

Write the completed decision log to `docs/<feature>/requirements-package/analysis/decision-log.md`.

**Decision Register** — one row per decision, with these fields:

| Field | Description |
|---|---|
| DEC ID | Stable unique identifier in format `DEC-NNN` |
| Date decided | The date the decision was made (not the date the entry was written, if they differ) |
| Decision | A clear statement of what was decided, written so someone not present understands what was settled |
| Alternatives considered | What other options were on the table; required — omitting this field is not permitted |
| Rationale | Why this option was chosen over the alternatives |
| Decision-maker | Named individual or documented governance body with chair (see "How to Add an Entry") |
| Confirmed by / date | The name and date of the person who confirmed this decision is still correct and active. Required before any checkpoint passes — an empty field means the decision has not been confirmed and the entry fails the gate check |
| Linked items | IDs of affected requirements, risks, scope items, constraints, or assumptions (`REQ-NNN`, `RISK-NNN`, `CON-NNN`, `ASMP-NNN`). Use `[REQ-TBD: description]` as a placeholder if IDs are not yet assigned |
| Status | `Active`, `Superseded by DEC-NNN`, or `Deferred — revisit trigger: [condition] \| owner: [named person]` |

**Decisions by Category** — filtered views for: scope decisions, constraint waivers, accepted risks, and Won't-have decisions (challenged and unchallenged).

**Superseded Decisions** log — original decisions that have been replaced, with the reason for change and the superseding DEC ID. IDs are never deleted.

**Summary** — a status count table (Active / Deferred / Superseded totals).

The decision log feeds into `assumptions-constraints-scope` in the requirements phase:
- **Scope boundary decisions and Won't-have decisions** → carried forward as out-of-scope items in the assumptions-constraints-scope register
- **Constraint waivers and accepted constraints** → carried forward into the constraint register
- **Accepted risks** → surfaced in the constraint register where the accepted risk imposes a boundary on the change

The architect receives these decisions through the requirements package via the assumptions-constraints-scope artifact. The architect must not contradict them without cause. Today's decisions also become tomorrow's settled artifacts in any future existing-artifact-review.

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| A scope boundary agreed in week 1 is forgotten and re-debated in week 4 | The decision log entry is the reference — DEC ID, date, decision-maker, rationale |
| An architect makes a design decision that contradicts an analysis-phase decision | Scope boundary decisions, constraint waivers, and Won't-have decisions are carried forward into the `assumptions-constraints-scope` artifact, which is part of the requirements package handed to the architect |
| A requirement that was deliberately descoped is re-raised as a new requirement | Won't-have decisions are logged with rationale, making re-raising visible |
| Alternatives considered are forgotten, causing the same alternatives to be re-evaluated | Alternatives rejected are recorded alongside the chosen option |
| A settled decision is reopened by anyone who disagrees with it | Reopening requires authorisation from the original decision-maker or equivalent authority |
| A decision built on an unverified assumption survives unchanged after the assumption is invalidated | Provisional decisions reference their ASMP ID; assumption invalidation triggers a review of all linked decision entries |
| A "Deferred" decision is silently carried forward with no monitoring | Every Deferred entry requires a named owner and a specific revisit trigger — entries without both are invalid |
| Decisions are made informally and never logged — the log exists but is incomplete | The "When to Use" section defines mandatory triggers for logging; the BSA reviews all prior steps at the consolidation pass (step 10 in the workflow) specifically to surface decisions that were made but not yet recorded. The hand-off gate requires BSA confirmation that all scope boundary decisions, constraint waivers, accepted risks, and Won't-have decisions are captured — this confirmation is the control against an incomplete log |

## Hand-off Gate

**The decision-log is a running log, not a one-shot artifact. It is updated throughout the analysis phase and becomes read-only at hand-off. It has one mandatory review checkpoint — the end of analysis. If the checkpoint cannot be passed, the BSA must not advance to the requirements phase — the BSA escalates to their sponsor, documents the blocking issue, and resolves it before proceeding. The checkpoint is not passed until all conditions are met and the BSA has received explicit written acknowledgement from the authorising stakeholder.**

**Hand-off Checkpoint — End of Analysis (before the requirements phase begins):**
1. Present the decision-log in full.
2. The BSA confirms all scope boundary decisions, constraint waivers, accepted risks, and Won't-have decisions (challenged and unchallenged) are recorded.
3. All decisions that affect the architect's design space must be present and confirmed. A decision affects the architect's design space if it constrains what the architect may or may not design — for example: a scope boundary that excludes a system component, a constraint that was waived or accepted, a requirement that was deliberately descoped, or any decision that limits the solution space available to the architect. When in doubt, include the entry — over-inclusion is preferable to an architect making a design decision that contradicts an undisclosed requirements decision.
4. No "Active" decisions may remain that the decision-maker has not confirmed. Confirmation is recorded in the "Confirmed by / date" field of the Decision Register; an entry without a populated confirmation field does not satisfy this check.
5. All "Deferred" entries must have a named owner and a stated revisit trigger condition. The BSA must confirm that each named owner is currently reachable and still accountable — a name that was valid at entry time but is no longer valid (e.g., the person has left the project) must be updated before this checkpoint passes.
6. No unresolved `[TBD]` placeholders may remain in the linked items field.
7. Receive explicit written acknowledgement from the authorising stakeholder before the requirements phase begins.

---

## Completion Criteria

**End of analysis (before hand-off):**
- [ ] All scope boundary decisions are logged *(Agent)*
- [ ] All constraint waivers are logged with approval *(Agent)*
- [ ] All accepted risks have a corresponding log entry *(Agent)*
- [ ] All prioritization challenges and resolutions are logged *(Agent)*
- [ ] All Won't-have decisions are logged with rationale — challenged and unchallenged *(Agent)*
- [ ] All decisions that affect the architect's design space are present and confirmed *(Agent + BSA)*
- [ ] All provisional decisions on unverified assumptions reference their ASMP ID *(Agent)*
- [ ] All Deferred entries have a named owner (currently reachable) and a stated revisit trigger *(Agent + BSA confirms at hand-off checkpoint)*
- [ ] No Active decisions remain that the decision-maker has not confirmed — "Confirmed by / date" field populated *(BSA confirms at hand-off checkpoint)*
- [ ] No unresolved `[TBD]` placeholders remain in the linked items field *(Agent)*
- [ ] Authorising stakeholder has provided explicit written acknowledgement *(BSA)*
