# User Journey Mapping

## Purpose

Map end-to-end user experience flows for the current state. Captures user goals, touchpoints, actions, confirmed pain points, and AI-inferred satisfaction score estimates at each stage. Complements process-mapping (system view) with the user experience view.

## When to Use

- The proposed change affects how a user completes a goal (not just a backend data change invisible to users)
- You need to understand which existing user paths the proposed change will affect
- The change introduces a new user-facing step, modifies an existing one, or removes friction from a flow

## What This Produces

**As-is user journey maps** for each persona affected by the proposed change — staged from the user's perspective, with goals, actions, pain points, and AI-inferred satisfaction score estimates at each stage derived from UI evidence.

This skill produces current-state documentation only. To-be (future-state) journey maps are out of scope here — they are produced during requirements-elicitation, once the BA/PO has confirmed the as-is baseline.

## How It Differs from Process Mapping

| Process Map | User Journey Map |
|-------------|-----------------|
| System/operational view | User experience view |
| Actors, steps, handoffs, decision points | Goals, touchpoints, actions, emotions, pain points |
| Shows what the system does | Shows what the user experiences |
| All actors including backend systems | Focused on the human |
| Evidence: routes, handlers, state machines | Evidence: UI components, navigation, forms, user-visible messages |

Both are needed. Process maps tell you *what the system does*. Journey maps tell you *how it feels to use it*. Gaps between the two reveal where good processes produce bad experiences.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Current capability inventory | codebase-discovery output | Yes — UI surfaces and touchpoints |
| Process maps | process-mapping output | Yes — identifies which steps involve users |
| Proposed change description | `docs/<feature>/requirements-package/discovery/change-description.md` | Yes — determines which journeys to map |
| Existing journey documentation | existing-artifact-review findings | If available |

> **Missing input guard:** If an expected input file cannot be found at its documented path, do not silently skip it. Inform the user: *"I expected [artifact name] at `[full path]` but it was not found. This input is [required/recommended] for this skill. Should I proceed without it, or can you provide it?"*

**If existing journey documentation is available:** Before deriving journeys from interface evidence (Step 2), record what the existing documentation claims about each persona's journey. When the AI's derived journeys conflict with existing documentation, flag each conflict explicitly in the Journey Gaps table (Step 5) as an Important gap. Do not silently adopt or silently override existing documentation — the conflict is itself information the BA/PO must resolve.

## Workflow

```
┌──────────────────────────────────────────────────┐
│  1. IDENTIFY — Personas and journeys to map      │
│     Who uses the system? Which of their          │
│     journeys does the change affect?             │
├──────────────────────────────────────────────────┤
│  2. SOURCE — Derive journeys from UI evidence    │
│     Read pages, forms, navigation, and error     │
│     messages found in codebase-discovery.        │
├──────────────────────────────────────────────────┤
│  3. STAGE — Break each journey into phases       │
│     Group touchpoints into logical stages        │
│     (Discover, Start, Do, Confirm, Return,       │
│     Recover). Not all journeys need all stages.  │
├──────────────────────────────────────────────────┤
│  4. ANNOTATE — Goals, actions, pain points       │
│     For each stage: what does the user want,     │
│     what do they do, what might go wrong.        │
├──────────────────────────────────────────────────┤
│  5. FLAG — Gaps requiring elicitation            │
│     User intent and emotion cannot be read       │
│     from code. Flag what needs confirmation.     │
├──────────────────────────────────────────────────┤
│  6. ASSEMBLE — Populate user journey map template│
│     One template entry per persona per journey.  │
└──────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Identify Personas and Journeys

**The AI derives candidate personas from system evidence — the BA/PO does not need to enumerate them. However, what the system exposes are technical roles and interface patterns, not behavioural personas.** A technical role (e.g., `ADMIN`, `EDITOR`) is a starting point, not a persona. A persona encapsulates the goals, mental model, and context of use of a real human — none of which can be read from code. All candidate personas identified in this step must be flagged as "Role-derived — requires stakeholder validation" in the Journey Gaps table (Step 5) unless prior user research already on record confirms their real-world characteristics.

**The AI looks for:**
- Named roles and user types visible in the system's configuration and access control structure
- Distinct areas of the interface designed for different user types
- Onboarding or setup flows specific to a particular role

**Do not limit personas to logged-in users.** The AI also checks for:
- **Unauthenticated or anonymous users** — anyone who interacts with the system before logging in (public pages, pre-login flows, guest access)
- **Downstream recipients** — people who receive notifications, emails, or alerts triggered by the system but may never log in themselves (invited collaborators, approval request recipients, notification-only contacts)
- **External parties** — organisations or systems that receive information from the system without directly using the interface
- **Pre-registration users** — anyone who interacts with the product before creating an account (trial flows, invite acceptance, sign-up flows)

**Scope the mapping effort before proceeding.** A non-trivial change can touch many personas and journeys. Mapping all of them is rarely feasible or useful. Apply this prioritization rule:

1. **Map first:** The single journey the proposed change directly intersects — in full, for all affected personas.
2. **Map second:** Adjacent journeys that share touchpoints or data with the changed journey — in summary, flagging only the intersection points.
3. **Defer or skip:** Journeys that are unaffected by the change and have no shared touchpoints. Note them as out of scope.

If the proposed change is broad enough that three or more primary journeys qualify for tier 1, flag this to the BA/PO before mapping and wait for explicit direction — do not begin mapping. Present the list of qualifying journeys and ask the BA/PO to either: (a) narrow the change scope so that fewer journeys qualify for tier 1, or (b) explicitly authorise mapping all qualifying journeys with the understanding that the exercise will take proportionally longer. Proceed only after receiving explicit direction.

**Identify journeys to map** — a journey is a goal-driven sequence of interactions:
- Start from the proposed change and work outward: what user goal does the change serve?
- Identify the full journey containing that goal — from the user's starting point to their successful outcome
- Identify any adjacent journeys that share touchpoints or data with the changed journey

**Common journey patterns to check for:**
- Onboarding / first-time setup
- Primary task completion (the core action the product exists to support)
- Recovery flows — error states, retry, undo, help-seeking
- Account and settings management
- Notification-driven return visits

### Step 2 — AI Derives Journeys from Interface Evidence (Internal Step)

Before asking the BA/PO to describe journeys, the AI derives them from the interface evidence gathered in codebase-discovery. The BA/PO does not participate in this step — the AI works from what it already knows about the system's user-facing surfaces.

**What the AI examines internally — web interfaces:**
- Pages and screens in the system — the stops in a journey
- Navigation structures (menus, breadcrumbs, back links) — the sequence and hierarchy of the journey
- Forms — what information the user must provide and in what order
- Progress indicators and multi-step flows — explicitly modelled journey stage sequences
- Post-action paths (e.g., "after submitting, the user is shown a confirmation and then returned to the dashboard") — the flow after a key action
- Error messages and empty states — what the user experiences when a journey stalls
- Notification and email content — how the system re-engages users after something happens in the background

**What the AI examines internally — other surfaces (if applicable):**
- Mobile app screens and navigation — equivalent touchpoints on mobile
- How the system notifies users and drives them to return (push notifications, deep links)
- What external parties receive from the system and when

**If no non-web surfaces are found,** note "web interface only" in the Evidence Source field on the journey map header and proceed.

**For each touchpoint the AI identifies, it records:**
- The name and purpose of the screen or interaction point
- What the user can do there
- Where the user comes from and where they go next

### Step 3 — Stage the Journey

Group touchpoints into journey stages. Stages are named from the user's perspective, not the system's.

**Generic stage model (adapt to fit):**

| Stage | User Question | Typical Touchpoints |
|-------|--------------|-------------------|
| Discover | "Does this product do what I need?" | Landing page, marketing, search |
| Start | "How do I begin?" | Onboarding, signup, first-login, setup wizard |
| Do | "How do I accomplish my goal?" | Core feature pages, forms, workflows |
| Confirm | "Did it work?" | Confirmation screens, email notifications, status indicators |
| Return | "How do I come back or check progress?" | Dashboard, notifications, history views |
| Recover | "Something went wrong — what now?" | Error pages, retry flows, support entry points |

Not all journeys have all stages. A journey for an admin managing settings may skip Discover and Start entirely.

### Step 4 — Annotate Goals, Actions, and Pain Points

Each stage is documented using the Stage Detail fields defined in `../assets/user-journey-map.md`. The required fields are: **user goal**, **touchpoints**, **actions**, **system response**, **satisfaction score** (AI-inferred), and **confirmed pain points**. All fields must be populated for every stage — record "None identified" explicitly rather than leaving a field blank.

For each stage in the journey, capture the following:

**Goal** — what the user wants to achieve at this stage (written from their perspective, not the system's)
- Use "I want to..." language: "I want to see my order status without calling support"
- One goal per stage. Split a stage into two when: (a) different actions are required to achieve each goal, or (b) different personas would have materially different goals for what appears to be a single stage. Do not split when the goals are sequential steps within a single continuous flow the user would perceive as one action (e.g., "enter details" and "review before submitting" within one uninterrupted form page).

**Action** — what the user actually does
- Specific and observable: "clicks 'Place Order'", "enters credit card details", "waits for email confirmation"
- Include passive actions: "reads error message", "waits", "leaves and returns later"

**Pain points** — friction, confusion, or frustration that can be confirmed as present from UI evidence. Record a pain point here only when the evidence is unambiguous. When the AI cannot determine whether a UI pattern is intentional or problematic, do not record it as a pain point — record it in the Journey Gaps table (Step 5) as an "Unconfirmed pain point" instead.

Confirmable pain points include:
- Long forms with no progress indication when the total page count is visible in the markup
- Error messages that contain no action guidance for the user
- Required fields that carry no visual indicator until submission fails
- Confirmation states whose copy does not distinguish success from in-progress
- Dead ends with no visible recovery path in the UI

**Rate each pain point severity using this rubric:**
- **High** — blocks task completion entirely, or forces the user to abandon and seek help (dead ends, unrecoverable error states, missing required information with no path forward)
- **Medium** — slows completion or causes confusion but has a workaround (unclear labels, redundant steps, confusing feedback that resolves on retry)
- **Low** — minor friction that most users will tolerate (cosmetic inconsistency, slightly verbose copy, non-critical missing convenience feature)

**System response** — what the system does in response to the user's actions, from the user's visible perspective only. Record from UI evidence: confirmation messages, loading states, error messages, redirects, and any visible state change. Do not describe internal processing — only what the user sees or receives.

**Satisfaction score** — an AI-inferred estimate of the stage experience, recorded in the Stage Detail block and used as the source score for the as-is Mermaid diagram. **These scores are derived entirely from static code and UI evidence — they are not measured user data.** They must be clearly labelled as estimates in every output artifact; stakeholders must not treat them as validated findings without independent user research.

Derive the score from the pain point assessment already completed for this stage:
- Start at 3 (neutral — task completion is possible but unremarkable)
- Subtract 1 for each High-severity pain point confirmed at this stage; floor at 1
- If the stage has no confirmed pain points and UI evidence shows a consistently smooth path (clear labels, immediate feedback, no dead ends), score 4
- Reserve 5 for stages with actively positive design evidence: progress feedback, smart defaults, minimal required input, visible confirmation of success
- Record the basis alongside every score: "AI-inferred from UI evidence — not measured user data"

### Step 5 — Flag Gaps for Elicitation

User intent, emotion, and context cannot be read from code. Flag what needs stakeholder or user confirmation:

- **Assumed persona** — "this role exists in the code but we don't know who uses it in practice"
- **Unknown goal** — "this page exists but we don't know what outcome the user expects"
- **Unconfirmed pain point** — a UI pattern that may represent friction but cannot be confirmed as such from code evidence alone (e.g., a multi-step form that may be intentionally staged, a required field whose necessity is unclear from the UI context). Do not include these in the pain points list in Step 4 — record them here for stakeholder validation only.
- **Missing journey coverage** — "we can see the happy path but the error/recovery journey has no UI"
- **External context** — "the user arrives here from an email notification but we can't trace what triggers it"

**Assign each gap a priority:**
- **Critical** — if this gap is not resolved, the journey map is based on a wrong assumption and the downstream requirements will be wrong (e.g., an assumed persona that may not exist, an assumed goal that may be incorrect)
- **Important** — the gap limits the accuracy or completeness of the journey but the overall direction is sound; must be resolved before requirements are finalized
- **Nice-to-know** — a detail that would improve fidelity but will not materially affect requirements (e.g., exact wording of an error message, precise order of fields in a form)

Record the priority in the Journey Gaps table. Do not treat all gaps as equal — elicitation sessions should be sequenced to resolve Critical gaps first.

### Step 6 — Assemble

For each persona/journey pair, produce one separate file named `docs/<feature>/requirements-package/discovery/user-journey-[persona]-[journey-name].md` (e.g., `user-journey-customer-order-cancellation.md`). Do not combine multiple persona/journey combinations into a single file. If four persona/journey combinations were mapped, four files are written — one per combination.

Populate the `user-journey-map` template for each file.

**Cross-reference the corresponding process map:** In the journey map header, record the name and file path of the process map from which this journey's steps were sourced (e.g., `process-map-order-submission.md`). If no process map covers the same flow, note "No corresponding process map — gap flagged."

**As-is Mermaid diagram:** Include a Mermaid journey diagram for the as-is happy path. Score each action 1–5 to match the Satisfaction scores recorded in the Stage Detail blocks. Add a note immediately below the diagram stating: "Scores are AI-inferred estimates derived from UI evidence — not measured user data. Validate with user research before treating as findings."

## Output

One populated **user-journey-map** document per persona/journey combination, written to a separate file — `docs/<feature>/requirements-package/discovery/user-journey-[persona]-[journey-name].md` (use the template at `../assets/user-journey-map.md`). Multiple persona/journey combinations produce multiple files; they are never combined into one.

### File Output

Write the completed user journey map(s) to `docs/<feature>/requirements-package/discovery/user-journey-map.md`.

Journey maps feed into **requirements-elicitation** (personas reveal who to engage and stages and gaps become structured questions) and **current-capability-synthesis** (journey context contributes to the baseline).

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|---|---|
| New feature adds a step that breaks the user's mental model of the flow | As-is journey makes the existing model explicit before adding to it |
| Requirements designed from the system's perspective, not the user's | Journey maps force the user's goal to be the primary frame |
| Error and recovery paths missing from requirements | Step 4 explicitly maps pain points and dead ends in the current journey |
| Assuming all users experience the system the same way | Step 1 identifies distinct personas with distinct journeys |
| Proposed changes that invalidate or ignore existing user flows | As-is journey maps make the current sequence, dependencies, and mental model explicit so that changes can be evaluated for disruption before requirements are written |

## Hand-off Gate

**Before proceeding to the next skill in your sequence, you must:**
1. Write the completed `user-journey-map` artifact in full — one journey per affected persona, in plain language for the BA/PO to review.
2. **Write each journey map to `docs/<feature>/requirements-package/discovery/user-journey-[persona]-[journey-name].md`, where `[persona]` and `[journey-name]` are short descriptive identifiers (e.g., `user-journey-customer-order-cancellation.md`). If multiple persona/journey combinations were mapped, write one file per combination. All file writes must succeed before proceeding. If the folder structure does not exist, create it.**
3. Present all journey maps to the BA/PO.
4. Confirm the completion criteria below are satisfied.
5. Ask the BA/PO explicitly: **"Are these user journey maps complete and accurate enough to proceed?"** Do not interpret silence or acknowledgement as acceptance — wait for an explicit confirmation. If the BA/PO identifies corrections, update the relevant document(s), overwrite the file(s), and re-present before asking again.

Do not proceed to the next skill until the BA/PO has explicitly confirmed the journey maps are accepted.

---

## Completion Criteria

- [ ] All user personas affected by the proposed change have been identified, including unauthenticated and external personas where applicable
- [ ] Each affected persona has at least one journey mapped
- [ ] Journeys are derived from interface evidence by the AI before the BA/PO is asked to describe anything
- [ ] Each journey is staged from the user's perspective (not the system's)
- [ ] Each stage has all Stage Detail fields populated: user goal, touchpoints, actions, system response, satisfaction score (AI-inferred and labelled as such), and confirmed pain points
- [ ] An as-is Mermaid journey diagram is present for each mapped journey, with action scores matching the Satisfaction scores in the Stage Detail blocks
- [ ] Gaps requiring elicitation are flagged with specific questions and priority ratings
- [ ] Journey maps reference the process maps they correspond to
