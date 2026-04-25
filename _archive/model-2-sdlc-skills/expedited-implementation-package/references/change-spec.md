# Change Spec

## Purpose

Write a lightweight change spec — the developer's replacement for requirements and solutions packages on small-to-medium changes. The agent helps the developer refine their description into a structured spec covering: (1) what — the change in one or two sentences, (2) where — the files and components affected (best guess, confirmed in orientation), (3) why — the motivation (bug fix, UX improvement, feature request, tech debt, etc.), (4) acceptance criteria — testable pass/fail conditions that define done, (5) out of scope — what this change explicitly does NOT do, and (6) delta — ADDED/MODIFIED/REMOVED behavior for brownfield framing. The spec is the source of truth for the entire expedited flow: the implementation plan is derived from it, verification checks completeness against it, and the PR reviewer checks spec compliance against it. Enforces forced uncertainty markers: if the developer's description is ambiguous on any point that affects implementation, the agent inserts [NEEDS CLARIFICATION: specific question] and resolves with the developer before proceeding. No coding begins until the spec is clear and agreed. Progressive rigor: for trivial changes (rename, typo, config update) the spec can be a single sentence with one AC and does not need a file — inline is sufficient. For small and medium changes, the spec is written to `docs/<feature>/implementation-package/change-spec.md` using the template at `../assets/change-spec.md` so that AI sessions can be stopped and resumed without losing the agreed spec. The agent determines the rigor level based on the scope of the change and confirms with the developer.

## What This Produces

A structured specification for a small-to-medium change — the single source of truth that drives the entire expedited flow. The change spec replaces the requirements package (what) and the solutions package (how) with a lightweight format that captures just enough to plan, implement, verify, and review the change.

The change spec is consumed by every subsequent step:
- **Orientation** uses the "where" section to scope which files to read
- **Planning** derives tasks from acceptance criteria and delta
- **Verification** checks completeness against acceptance criteria
- **PR review** checks spec compliance against the diff

## When to Use

- First step of the expedited workflow
- Before any codebase reading or planning
- When the developer has a change to describe

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Developer's description | Conversation — the developer describes what they want to change | Yes |
| Change spec template | `../assets/change-spec.md` — if the change needs the full template | If medium rigor |

### Existing Artifact Intake

Before drafting the change spec, ask whether the user has any existing artifacts that should inform the spec. Examples include Jira or Linear tickets, bug reports, incident notes, support tickets, screenshots, UX notes, API examples, prior PRs, README sections, ADRs, existing requirements, solution notes, or implementation package artifacts.

If artifacts are provided:

1. Read them before classifying the change as trivial, small, or medium.
2. Extract what, where, why, acceptance criteria, out-of-scope items, constraints, and open questions.
3. If artifacts conflict with the user's current description, surface the conflict and ask which source is authoritative before finalizing the spec.

If no artifacts exist, proceed from the user's description and record that the change spec was conversation-derived.

---

## How the AI Works — Internal Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│  CHANGE SPEC — INTERACTIVE REFINEMENT                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LISTEN ──────────► Capture the developer's description       │
│     What are they changing? Why? What's the scope?               │
│                                                                  │
│  2. CLASSIFY ────────► Determine rigor level                     │
│     Trivial / Small / Medium                                     │
│     Confirm with developer                                       │
│                                                                  │
│  3. STRUCTURE ───────► Map description to spec sections           │
│     What, Where, Why, ACs, Out of Scope, Delta                   │
│     Insert [NEEDS CLARIFICATION] for any ambiguity               │
│                                                                  │
│  4. RESOLVE ─────────► Work through each marker with developer   │
│     One marker at a time, specific questions                     │
│     Do not guess — ask                                           │
│                                                                  │
│  5. FINALIZE ────────► Write the spec (inline or template)       │
│     Present for confirmation                                     │
│     No proceeding until developer agrees                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 1 — Listen

Capture the developer's description of the change. Let them describe it in their own words — do not force structure yet. Note:

| What to Capture | Why |
|----------------|-----|
| What they want to change | Becomes the "What" section |
| Why they want to change it | Becomes the "Why" section |
| Which files or components they mention | Becomes the "Where" section (confirmed in orientation) |
| What "done" looks like to them | Seeds the acceptance criteria |
| What they explicitly do NOT want to change | Becomes "Out of Scope" |
| Any constraints or concerns they mention | May surface clarification needs |

### Step 2 — Classify the Rigor Level

Determine how much spec structure the change needs:

| Level | Signals | Spec Format | AC Count |
|-------|---------|-------------|----------|
| **Trivial** | Rename, fix typo, update config value, adjust a constant | Single sentence + 1 AC, inline — no file needed | 1 |
| **Small** | Add a button, update a component's behavior, fix a bug | Short spec using `../assets/change-spec.md` — written to `docs/<feature>/implementation-package/change-spec.md` | 2–3 |
| **Medium** | New component, refactor a module, add a feature to an existing service | Full template using `../assets/change-spec.md` — written to `docs/<feature>/implementation-package/change-spec.md` | 3+ |

**Present the classification to the developer:**
> "This looks like a [trivial/small/medium] change. I'll use [inline spec / short spec / the full template]. Does that match your sense of scope?"

If the developer disagrees, adjust.

### Step 3 — Structure the Spec

Map the developer's description onto the spec sections. Use the template at `../assets/change-spec.md` for small and medium changes.

**Section-by-section:**

#### What

One or two sentences describing the change. This is the elevator pitch — a reader should understand the change from this section alone.

| Good | Bad |
|------|-----|
| "Add a 'mark as read' button to notification cards that updates the notification status via the existing PATCH endpoint" | "Update notifications" |
| "Fix the race condition in OrderService.cancel where concurrent requests can double-refund" | "Fix a bug in orders" |

#### Where

Files and components affected — the developer's best guess, confirmed during orientation.

| What to Include | Format |
|----------------|--------|
| Source files that will be modified | `src/components/NotificationCard.tsx` |
| Source files that will be created | `src/hooks/useMarkAsRead.ts` (new) |
| Test files that will be modified or created | `src/components/__tests__/NotificationCard.test.tsx` |
| Configuration files | `src/api/endpoints.ts` (add new endpoint constant) |

If the developer is unsure which files, note the component or area: "notification cards component — exact file TBD in orientation."

#### Why

The motivation for the change. One sentence.

| Type | Example |
|------|---------|
| Bug fix | "Users report double-refunds when canceling orders during high load" |
| UX improvement | "Users cannot tell which notifications they've already seen" |
| Feature request | "Product requested bulk export of user data for compliance" |
| Tech debt | "The payment module uses deprecated Stripe API v2; migrating to v3" |
| Performance | "Dashboard query takes 8 seconds due to N+1 on organization members" |

#### Acceptance Criteria

Testable pass/fail conditions that define done. Each AC must be independently verifiable — no compound ACs.

| Good AC | Bad AC |
|---------|--------|
| "Clicking 'mark as read' sends a PATCH request to `/api/notifications/:id` with `{ read: true }` and the button disappears" | "Notifications work correctly" |
| "When two concurrent cancel requests arrive, only the first succeeds; the second returns 409 Conflict" | "Fix the race condition" |
| "The exported CSV contains columns: name, email, created_at, last_login" | "Export works" |

**Rules for ACs:**
- Each AC starts with a specific trigger or condition
- Each AC ends with a specific, observable outcome
- Each AC can be verified by a test (unit, integration, or manual)
- No AC uses "should" — use present tense ("returns," "displays," "throws")

#### Out of Scope

What this change explicitly does NOT do. This prevents scope creep during implementation.

| Good | Bad |
|------|-----|
| "Does not change the notification list layout or filtering" | (omitting this section) |
| "Does not migrate existing notifications — only new ones get the 'read' status" | "We'll handle migration later" (vague) |

#### Delta

For brownfield changes, describe what's changing relative to current behavior:

| Section | What to Write |
|---------|--------------|
| **ADDED** | New behavior that does not exist today |
| **MODIFIED** | Existing behavior that will change — describe the before and after |
| **REMOVED** | Existing behavior being deprecated or deleted |

For greenfield or trivial changes, this section may be minimal.

### Step 4 — Resolve Uncertainty

#### 4a. Scan for Ambiguities

Before inserting markers, systematically scan the spec against this taxonomy. For each category, assess coverage as **Clear**, **Partial**, or **Missing**:

| Category | What to Check |
|----------|--------------|
| **Functional scope & behavior** | Core user goals defined? Explicit out-of-scope? User roles differentiated? |
| **Domain & data model** | Entities and relationships clear? Field types, constraints, defaults specified? Validation rules explicit? |
| **Interaction & UX flow** | Critical user journeys sequenced? Error, empty, and loading states described? Accessibility or localization needs? |
| **Edge cases & failure handling** | Negative scenarios covered? Rate limiting or throttling defined? Conflict resolution for concurrent edits? |
| **Non-functional quality** | Performance targets (latency, throughput)? Security posture (auth, data protection)? Compliance constraints? |
| **Constraints & trade-offs** | Technical constraints explicit? Trade-offs or rejected alternatives documented? |
| **Terminology** | Canonical terms established? Synonyms or deprecated terms avoided? |

Only categories relevant to the change need review — a config value rename does not need UX flow analysis.

#### 4b. Insert Markers

For every point scored **Partial** or **Missing** that affects implementation, insert a marker:

```
[NEEDS CLARIFICATION: What HTTP status should the PATCH endpoint return when the notification is already read — 200 (idempotent success) or 409 (conflict)?]
```

**Prioritize by impact:** Ask about decisions that change architecture, data modeling, or user experience first. Defer low-impact details (logging format, internal naming) to implementation.

**Marker rules:**

| Rule | Detail |
|------|--------|
| Be specific | "What should happen when X?" — not "Is this clear?" |
| One question per marker | Do not bundle multiple questions |
| Only for implementation-affecting ambiguity | Do not mark cosmetic questions |
| Resolve before proceeding | No marker can survive past the change spec step |
| Maximum 5 questions per round | If more than 5 ambiguities exist, prioritize by `impact × uncertainty` and resolve in rounds |

#### 4c. Resolve Markers

**Resolution process:**
1. Present all markers to the developer at once, ordered by impact
2. Resolve one at a time
3. Update the spec with each answer
4. Remove the marker after resolution
5. If an answer introduces new ambiguity, insert a new marker and continue

**If the developer says "I don't know" or "whatever you think":**
- For genuinely trivial decisions (logging format, variable name): make the call and document it in the spec
- For decisions that affect behavior (error codes, retry logic, validation rules): explain the options and their trade-offs — the developer must choose

**Early termination:** If the developer says "done", "good", or "proceed", stop asking and move to finalization — but only if no **Missing** categories remain that affect implementation.

### Step 5 — Finalize

Write the completed spec in the format matching the rigor level:

| Level | Output |
|-------|--------|
| Trivial | Inline in the workflow conversation — one sentence + 1 AC — no file needed |
| Small | Write to `docs/<feature>/implementation-package/change-spec.md` using `../assets/change-spec.md` (populate relevant sections; omit inapplicable ones) |
| Medium | Write to `docs/<feature>/implementation-package/change-spec.md` using `../assets/change-spec.md` with all sections fully populated |


**Why a file for small and medium changes:** Writing the spec to disk means any future AI session can read `docs/<feature>/implementation-package/change-spec.md` and resume from a known agreed state rather than reconstructing intent from conversation history. This is essential for AI SDLC stop-and-resume workflows.
Present the spec to the developer:

> "Here's the change spec — written to `docs/<feature>/implementation-package/change-spec.md`. Does this accurately capture what you want to build? I'll use this as the source of truth for planning, implementation, and review."

**Do not proceed until the developer explicitly confirms.**

---

## Output

### Trivial — Inline Spec

```
Change: Rename `getUserName` to `getDisplayName` across the user module.
AC: All references updated; tests pass; no runtime behavior change.
```

### Small — Written to `docs/<feature>/implementation-package/change-spec.md`

Uses `../assets/change-spec.md` with the relevant sections populated. Example content:

```
## What
Add a "mark as read" button to notification cards.

## Where
- src/components/NotificationCard.tsx
- src/components/__tests__/NotificationCard.test.tsx

## Why
Users cannot tell which notifications they've already seen.

## Acceptance Criteria
- [ ] Clicking "mark as read" sends PATCH to /api/notifications/:id with { read: true }
- [ ] Button disappears after successful PATCH
- [ ] Already-read notifications do not show the button

## Out of Scope
- No changes to notification list layout or filtering
```

### Medium — Written to `docs/<feature>/implementation-package/change-spec.md`

Follows the complete structure in `../assets/change-spec.md` with all sections populated, including the Delta section (ADDED/MODIFIED/REMOVED).

---

## Hand-off Gate

Before proceeding to orientation (`codebase-orientation`):

1. The spec is written in the appropriate format — inline for trivial, `docs/<feature>/implementation-package/change-spec.md` for small and medium.
2. All `[NEEDS CLARIFICATION]` markers are resolved — none remain.
3. The developer has explicitly confirmed the spec is accurate.
4. Ask: "Is there anything else this change should or should not do that we haven't captured?"

Do not proceed until the developer says the spec is agreed.

---

## Completion Criteria

- [ ] Developer's description has been captured
- [ ] Rigor level has been determined and confirmed with the developer
- [ ] All spec sections are populated (at the appropriate rigor level)
- [ ] Acceptance criteria are testable pass/fail conditions (no vague ACs)
- [ ] Out of scope is explicitly stated
- [ ] Delta section captures ADDED/MODIFIED/REMOVED (if brownfield)
- [ ] `docs/<feature>/implementation-package/change-spec.md` written to disk (small and medium changes only — trivial stays inline)
- [ ] All `[NEEDS CLARIFICATION]` markers have been resolved
- [ ] The developer has explicitly confirmed the spec
- [ ] No compound acceptance criteria (each AC is independently verifiable)

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| Agent guesses at what the developer wants and implements the wrong thing | Forced uncertainty markers — ambiguous points are surfaced and resolved, not guessed |
| Acceptance criteria are vague ("it works") — verification cannot determine if the change is done | AC rules require specific trigger + observable outcome; vague ACs are rejected |
| Scope creeps during implementation — the agent adds features the developer didn't ask for | Out of scope section explicitly bounds the change; verification checks against spec, not agent initiative |
| The change spec is overkill for a trivial rename, wasting time | Progressive rigor — trivial changes get one sentence; the agent classifies and confirms |
| The change spec is too thin for a medium change, leaving gaps that surface during implementation | Progressive rigor — medium changes get the full template; the agent classifies and confirms |
| Developer says "just make it work" and the agent proceeds without clarity | Resolution process requires specific answers for behavior-affecting decisions — "whatever you think" is not accepted for non-trivial choices |
| The spec exists but the developer never confirmed it — agent built against its own assumptions | Hand-off gate requires explicit developer confirmation before proceeding |
