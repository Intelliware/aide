# Business Rules Documenter

## Purpose

Extract and document business rules — validation logic, policies, conditional behavior, and constraints. Rules are cataloged separately from functional specs for precise, reviewable documentation of the conditions the system must enforce. Consumes: the to-be process maps from process-mapping (business rules tables already contain BR-NNN-identified rules governing every process decision point — these are inherited directly, not re-derived); the functional spec from functional-requirements (which contains the behavioral requirements that imply business rules); the constraint register from constraint-extraction (constraints often encode or imply business rules); and elicited requirements from requirements-elicitation (stakeholder language often contains rule statements that did not make it explicitly into the spec). Each rule is tagged by change type (new — rule introduced by the feature; modified — rule that existed previously and is being changed by this feature; removed — rule that existed previously and is retired by this feature) and, where applicable, by authority (policy-mandated — required by an external authority). Produces a business rules catalog that feeds into the requirements-package.

## When to Use

- After functional-requirements has produced the functional spec
- When the functional spec contains conditional logic, validation rules, or policy-driven behavior
- Before the requirements package is assembled — business rules captured here give reviewers and the BSA a precise, referenceable set of conditions to verify, rather than re-deriving intent from the functional spec during review
- Note: stakeholder phrases such as "it depends on," "unless," and "only if" are rule candidate signals during elicitation, not standalone triggers to run this skill

## What This Produces

A business rules catalog — a discrete, referenceable set of rules extracted from the to-be process maps, the functional spec, the constraint register, and elicited requirements. Each rule is tagged by change type (New / Modified / Removed) and, where applicable, by authority (Policy-mandated), making the feature's rule delta explicit and reviewable.

Business rules are distinct from functional requirements. A requirement says "the system calculates an order total." A business rule says "the order total equals the sum of line item prices, minus the discount if the order value exceeds £100, plus VAT at the applicable rate."

## Definitions

**BSA (Business Systems Analyst):** The individual accountable for this requirements package. All escalations, confirmations, and gate approvals in this skill are directed to the BSA unless the BSA explicitly delegates a specific decision to another named individual.

**Accountable stakeholder:** The individual with decision-making authority for the business domain the rule governs. This is not the same as any interested party or reviewer. For a pricing rule, the accountable stakeholder is typically the role who owns the pricing policy (e.g., Head of Commercial). For a regulatory rule, it is the role who owns compliance for that regulation. If the accountable stakeholder for a rule is not known, ask the BSA to identify one before proceeding to confirmation — a rule confirmed by the wrong person carries no authority. If the BSA cannot identify an accountable stakeholder within the analysis window, record the rule as `assumed-pending-confirmation` and log the absence of a named authority as an open item.

**Analysis window:** The time period in which this skill is executing, bounded by the start of this requirements step and the hand-off gate at its conclusion. Fallback behaviours that apply "within the analysis window" are temporary measures to prevent the skill from blocking indefinitely — they do not substitute for full confirmation before the requirements package is formally reviewed. Any rule still carrying `assumed-pending-confirmation` at gate time is an open item that must be resolved before the package is acknowledged.

**Companion change log:** A section titled "Rule Change History" appended at the end of the business-rules document. Each entry records: the rule ID, the date of revision, the name or role of the person who directed the change, the nature of the change (condition, scope, or outcome), and the full text of the prior rule card. When producing or updating the catalog, check whether a "Rule Change History" section already exists before adding a new entry — append to it rather than creating a duplicate section.

## Rule Categories

| Category | Description | Examples |
|----------|-------------|---------|
| **Validation rules** | Conditions a data entity must satisfy to be accepted | Required fields, format constraints, range limits, referential integrity |
| **Calculation rules** | How derived values are computed | Pricing formulas, tax calculations, discount logic, aggregation rules |
| **Eligibility rules** | Conditions a user or entity must meet to access a capability | Subscription tier required, permission level, account status |
| **State transition rules** | Conditions under which an entity changes state | Order can only be cancelled if status is Pending or Processing; status changes require an audit log entry |
| **Policy rules** | Rules derived from business policy rather than technical logic | Refund window is 30 days from delivery; data retention is 7 years for financial records |
| **Integration rules** | Rules governing how data is exchanged with external systems | Field mapping between systems, data transformation rules, required values on outbound messages, inbound data validation conditions (what the system must reject if received from an external source), error and rejection handling conditions, idempotency rules for repeated messages |

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| To-be process maps | `docs/<feature>/requirements-package/analysis/process-map.md` (one per affected workflow, from process-mapping, analysis step 6) | If analysis ran — business rules tables in process maps are the canonical source for rules governing process decision points; BR-NNN IDs assigned in these tables must be inherited, not re-assigned. See "Did Analysis Run?" |
| Functional spec | functional-requirements | Yes — primary source for validation, calculation, eligibility, policy, and integration rules not captured in process decision points |
| Constraint register | `docs/<feature>/requirements-package/analysis/constraint-register.md` (from constraint-extraction, analysis step 5) | If analysis ran — constraints often encode or imply business rules. See "Did Analysis Run?" |
| Elicited requirements | `docs/<feature>/requirements-package/discovery/requirements-elicitation.md` if discovery ran; otherwise the ER-NNN entries within the functional-requirements document | Yes — stakeholder language often contains rule statements that did not make it explicitly into the spec |

## Did Analysis Run?

Check for each analysis artifact independently — analysis may have partially run, producing some artifacts but not others.

**To-be process maps** (`docs/<feature>/requirements-package/analysis/process-map.md`):

- **Present** → include each map's business rules table as an extraction source in Step 1. Inherit the BR-NNN IDs assigned in those tables — do not re-assign. See "Rule ID Scheme — Inheriting IDs from Process Maps."
- **Absent** → process-map rules cannot be identified without them. Extract all decision-point rules from the functional spec instead and confirm each with the BSA before handoff; mark each unconfirmed rule as `assumed-pending-confirmation` and flag it for consolidation into the `assumptions-constraints-scope` document at step 10 — the consolidation document is not written until step 10, but every `assumed-pending-confirmation` item must be visible in the catalog as an open item so that step 10 can harvest it.

**Constraint register** (`docs/<feature>/requirements-package/analysis/constraint-register.md`):

- **Present** → include the constraint register as a rule extraction source in Step 1.
- **Absent** → skip the constraint register source in Step 1 — constraint-implied rules cannot be identified without it. Confirm all constraint-derived rules with the BSA before handoff; mark each unconfirmed rule as `assumed-pending-confirmation` and flag it for consolidation into the `assumptions-constraints-scope` document at step 10.

---

## Rule ID Scheme

Rules are assigned globally sequential IDs in the format `BR-NNN` (zero-padded to three digits: BR-001, BR-002, …). IDs are assigned during Step 4 and do not reset per category, per feature, or per run. Once assigned, an ID is permanent — if a rule is removed, its ID is retired, not reused.

**Inheriting IDs from process maps:** When analysis ran, each to-be process map contains a business rules table with BR-NNN IDs already assigned during process-mapping (analysis step 6). These IDs are the canonical identifiers for rules governing process decision points — do not reassign or renumber them. In Step 1, record each process-map rule alongside its existing BR-NNN ID. In Step 4, use that ID in the rule card without modification. Any new rules discovered during extraction that have no process-map ID are assigned the next available sequential number, counting on from the highest BR-NNN already in use across all process maps. Before assigning any new ID, scan all process-map business rules tables to establish the current ceiling.

**Rule modification across iterations:** When a rule is revised in a subsequent iteration, it retains its original ID. The rule card is updated in place and the `Source` field must record the revision event (e.g., "revised: stakeholder session 2024-09-04 — discount threshold increased from £50 to £75"). The prior version of the rule card must be preserved in the companion change log (see Definitions); it must not be silently overwritten. A rule's ID must be retired and a new one issued only when all three of the following change simultaneously: the condition under which the rule is triggered, the scope of entities to which it applies, and the outcome it produces. A change to any two or fewer of these elements is a modification in place. When retiring an ID, note the supersession in both the retired card and the new card.

## Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. EXTRACT — Mine all inputs for rule statements    │
│     Process maps first (inherit BR IDs), then        │
│     spec conditionals, constraint statements,        │
│     elicitation language                             │
├──────────────────────────────────────────────────────┤
│  2. CLASSIFY — Assign each rule to a category        │
│     Validation / Calculation / Eligibility /         │
│     State transition / Policy / Integration          │
├──────────────────────────────────────────────────────┤
│  3. TAG — Assign rule status                         │
│     Change type: New / Modified / Removed            │
│     Authority: Policy-mandated if externally         │
│     required (orthogonal to change type)             │
├──────────────────────────────────────────────────────┤
│  4. FORMALISE — Write each rule precisely            │
│     Condition: IF [condition] THEN [outcome]         │
│     ELSE IF [condition] THEN [outcome]               │
├──────────────────────────────────────────────────────┤
│  5. LINK — Trace rules to requirements               │
│     Every rule traces to the spec item it supports   │
├──────────────────────────────────────────────────────┤
│  6. DETECT CONFLICTS — Check rules against each other│
│     Flag contradictory outcomes for overlapping      │
│     conditions; assign precedence where needed       │
├──────────────────────────────────────────────────────┤
│  7. CONFIRM — Validate rule statements               │
│     New: confirmed with stakeholder                  │
│     Policy-mandated: source document cited           │
├──────────────────────────────────────────────────────┤
│  8. ASSEMBLE — Populate the business-rules template  │
└──────────────────────────────────────────────────────┘
```

## Step Details

### Step 1 — Extract Rule Statements

**From the process maps (when analysis ran — extract first):**
- Extract decision nodes from `[NEW]`, `[MODIFIED]`, and `[REMOVED]` steps only. Decision nodes in `[UNCHANGED]` steps govern rules this feature did not touch — they are out of scope for this catalog.
- For every `[UNCHANGED]` step that contains a decision node, record a single coverage line in the "Unchanged rules — not cataloged" section of the catalog (see Step 8 for catalog structure): `BR-NNN — [Rule name] — Unchanged — not cataloged`. If the decision node has no BR-NNN ID — because it predates the ID scheme or was not assigned one during process-mapping — record the line without an ID: `[No ID] — [Rule name or brief description] — Unchanged — not cataloged — ID unassigned`. Flag the absence to the BSA: a BR-NNN ID must be assigned to that node in the process map before the catalog is considered complete at the hand-off gate.
- For each in-scope decision node in a `[NEW]` or `[MODIFIED]` step: record the existing BR-NNN ID alongside the candidate — do not re-derive or re-assign these IDs
- The Condition, Path if true, and Path if false columns map directly to the IF/THEN/ELSE structure required in Step 4
- The `[NEW]`, `[MODIFIED]`, or `[REMOVED]` label on the associated decision node in the process map's change delta is the authoritative change-type signal — carry it forward to Step 3 without re-derivation
- `[REMOVED]` steps are not expected to have business rules table entries in the process map. Source the prior rule condition from the artifact in which the rule was originally documented (prior functional spec, prior process map version, or stakeholder record). If no prior source exists, flag to the BSA before proceeding.
- A decision node in a `[NEW]` or `[MODIFIED]` step with no corresponding business rules table row is an incomplete process map — flag it to the BSA and do not proceed until it is resolved
- **Process-map rules bypass candidate filtering.** They were reviewed and approved at the process-mapping hand-off gate. Do not apply the candidate filtering criteria below to rules sourced from process maps — proceed directly to Step 2 for those rules.

**From the functional spec:**
- Every "if," "unless," "only when," "must," "cannot," "except when" is a rule candidate
- Every field with a validation requirement is a rule candidate
- Every state transition described is a rule candidate
- Every calculated value implies a calculation rule

**From the constraint register:**
- Regulatory constraints often translate directly into policy rules
- SLA constraints translate into state transition or performance rules

**From elicited requirements:**
- Stakeholder explanations of "how it works today" — treat these as existing rule candidates, particularly when the stakeholder describes the logic in conditional terms ("we do X unless Y" or "only if the customer is on the legacy plan")
- Exceptions and edge cases stakeholders mention — "except when a customer is on the legacy plan"

**Candidate filtering — apply to functional spec, constraint register, and elicited requirement candidates only; process-map rules are exempt:**

Not every conditional sentence from these sources is a business rule. After mining, discard candidates that fall into these categories:

- **UI behaviour with no independent business meaning** — "the Submit button is disabled until all required fields are filled" is a UI constraint. The underlying required-field conditions are rule candidates; the button state is not.
- **Restatements of requirements** — "if the user is authenticated, show the dashboard" is a requirement stated in conditional form. It describes what the system does; it does not encode a condition the system must evaluate and enforce independently of the feature's basic operation.
- **Prose transitions** — conditional phrasing used as narrative connective tissue ("if this is the case, then the following applies…") rather than a business condition with a defined outcome.
- **Duplicate candidates** — the same condition stated in multiple places in the spec produces one rule, not one rule per occurrence. Deduplicate before classifying.

When a candidate is ambiguous, retain it and classify it in Step 2. Under-inclusion at Step 1 is harder to recover from than over-inclusion — Step 2 will surface misclassified non-rules as unclassifiable. Do not discard candidates based on a judgment that they are "obvious" or "self-evident."

### Step 2 — Classify

Assign each rule to its primary category. When a rule spans categories, classify by what the rule primarily governs, using this decision order:

1. If the rule determines whether data is accepted at all → **Validation**
2. If the rule computes a derived value → **Calculation**
3. If the rule determines whether a user or entity may proceed → **Eligibility**
4. If the rule determines whether a state change is permitted → **State transition**
5. If the rule originates from a business or regulatory policy with no direct technical trigger → **Policy**
6. If the rule governs data exchanged with an external system → **Integration**

A rule that validates a field before a calculation is a validation rule. A state transition rule that also enforces a regulatory policy is a state transition rule — capture the policy source in the `Source` field.

If a single stakeholder statement encodes multiple independently testable rules at different levels, decompose it into separate rule entries before classifying (see Step 4, atomicity guidance).

**Classifying Removed rules:** For a rule tagged Removed, classify using the category it held before retirement — use the logic above applied to the prior condition, not the retirement requirement. The category documents what the rule governed historically. Atomicity guidance does not apply to Removed rules — the prior condition is preserved in full as documentary record, not split into separate active entries.

### Step 3 — Tag Rule Status

Business rules are tagged on two independent axes.

**Axis 1 — Change type**

| Change type | Meaning | Requirements implication |
|-------------|---------|--------------------------|
| **New** | Rule is introduced by this feature; no prior version exists | Confirm the rule with the accountable stakeholder before handoff; verify no prior version exists |
| **Modified** | Rule existed before this feature; this feature changes its condition, scope, outcome, or exceptions | Record the prior version and the nature of the change in the `Source` field; any rule whose `Precedence` field references this rule must be reviewed for continued accuracy |
| **Removed** | Rule existed before this feature and is retired by this feature | Record the prior rule condition in full; confirm the retirement with the accountable stakeholder; verify that every other rule whose `Precedence` field referenced this rule is updated to remove the broken reference |

**Axis 2 — Authority**

| Authority | Meaning | Requirements implication |
|-----------|---------|--------------------------|
| **Policy-mandated** | Rule is required by an external authority (regulation, industry standard, pre-existing contractual obligation) | Do not treat as a design choice; always cite the mandate source in the `Source` field; confirm the mandate document is accessible before handoff |

**`Policy-mandated` is orthogonal to change type.** A New rule can be Policy-mandated (a brand-new regulatory requirement this feature must comply with). A Modified rule can be Policy-mandated (an existing regulatory rule being updated to reflect a legislative change). A Removed rule can be Policy-mandated (a previously-mandated rule that a regulatory change now explicitly no longer requires — cite both the original mandate and the superseding authority in the `Source` field). The `Authority` field is omitted entirely when the rule is not externally mandated.

A rule classified as Policy (category) is not automatically Policy-mandated (authority): a refund window set by internal business policy is a Policy-category rule with no Authority. Policy-mandated is reserved for rules traceable to an external authority whose mandate exists independently of this project.

**Identifying change type:**

**Greenfield features:** If this feature introduces a wholly new capability with no prior requirements documents, elicitation records, or confirmed business policies in existence against which to check, all rules are New by definition. Record this standing note in the catalog header: "This catalog covers a new capability — all rules are New; no prior rule base exists against which to verify prior versions." This removes the need to re-derive the absence of prior versions rule by rule.

For rules sourced from process maps, the change type is already determined — use it directly:
- A rule whose associated decision node is labeled `[NEW]` in the process map → tag **New**. No further derivation required.
- A rule whose associated decision node is labeled `[MODIFIED]` in the process map → tag **Modified**. The process map's change delta description records what changed; copy it into the `Source` field. No further derivation required.
- A rule whose associated decision node is labeled `[REMOVED]` in the process map → tag **Removed**. The process map's change delta description records why the step was removed; copy it into the `Source` field. Use the Removed rule card format defined in Step 4. No further derivation required.

For rules sourced from the functional spec, constraint register, or elicited requirements, derive change type as follows:
- If the candidate rule has no prior version in any existing requirements document, elicitation record, or confirmed business policy → tag it **New**.
- If the candidate rule updates, narrows, broadens, or replaces a condition or outcome that exists in any prior requirements document, elicitation record, or confirmed business policy → tag it **Modified**. Record the nature of the change in the `Source` field alongside the originating artifact (e.g., "modified: prior threshold was £50 — confirmed stakeholder session 2024-09-04").
- If the feature explicitly retires a rule that existed in a prior requirements document, elicitation record, or confirmed business policy → tag it **Removed**. Use the Removed rule card format defined in Step 4.
- If you are uncertain whether a prior version exists:
  1. Do not assign a tag and do not proceed with this rule.
  2. Present the rule candidate to the BSA with the explicit question: "Does a prior version of this rule exist in any approved requirements document, elicitation record, or confirmed business policy?"
  3. Tag based on the BSA's answer — **New** if no prior version exists; **Modified** if one does (record the prior version in the `Source` field); **Removed** if the feature retires it entirely (use the Removed rule card format).
  4. If the BSA is confirmed unavailable within the analysis window, tag the rule **New**, mark it `assumed-pending-confirmation`, and record the unresolved prior-version question explicitly in the assumption note. Do not silently default to New — the unresolved question must be visible as an open item for carry-forward into the `assumptions-constraints-scope` document.

**Contradictory stakeholder instructions:** If two stakeholders provide conflicting guidance on the same rule — for example, the commercial team states one condition and the legal team states a different condition — do not select one version unilaterally. Record both versions in the `Source` field, mark the rule `assumed-pending-confirmation`, and escalate to the BSA to convene the relevant parties and produce a single authoritative version. Do not proceed to Step 4 for a rule with unresolved stakeholder disagreement. Record the open conflict as an item for the `assumptions-constraints-scope` document with named resolution parties and a target resolution date.

### Step 4 — Formalise Rule Statements

**Atomicity:** Each rule entry must encode a single, testable condition-outcome pair. A rule must be split into separate entries when removing any one of its branches would leave the remaining branches intact, independently enforceable, and meaningful on their own. A rule whose branches together cover the exhaustive range of a single decision — for example, four tax brackets that together account for every possible order value — is one compound rule and must remain together; splitting it would produce entries that are meaningless in isolation. Apply the split-or-keep test to every multi-branch rule before proceeding. Compound rules that should be split make individual traceability and test case assignment impossible.

Write each rule in a structured, unambiguous form. **Removed rules use a separate format** — see "Removed rule card format" below; do not use this template for them.

```
Rule BR-NNN: [Rule name]
Category:    [Validation / Calculation / Eligibility / State transition / Policy / Integration]
Change type: [New / Modified]
Authority:   [Policy-mandated — omit this field entirely if the rule is not externally mandated]
Applies to:  [Entity, customer segment, product line, jurisdiction, or context — be specific]
Effective:   [Date from which the rule applies; omit field entirely if timeless]
Condition:   IF [condition] THEN [outcome]
             ELSE IF [condition] THEN [outcome]
             ELSE [default outcome]
Exceptions:  [Explicit exceptions to the rule; write NONE if there are none]
Precedence:  [If this rule can conflict with another rule, state which rule wins and under what condition; omit if no conflict is possible]
Source:      [Document, meeting record, or artifact where the rule originates — e.g. "functional-spec §3.2", "constraint register CR-004", "stakeholder session 2024-03-12"]
Req trace:   [REQ-ID(s) this rule supports]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Short description]
  Given: [the initial state — specific entity values that satisfy or violate the condition]
  When:  [the action that triggers rule evaluation]
  Then:  [the externally observable outcome proving the rule was enforced]
```

**Acceptance criteria for every rule:** Every active (New / Modified) rule must have at least one acceptance criterion written inline in the rule card at the time the rule is formalized — not deferred to a later phase. The AC proves the rule is enforced by providing a concrete scenario with specific input values and an observable outcome. It is distinct from the rule's IF/THEN/ELSE statement: the rule says *what* the logic is; the AC says *how to verify it was applied*.

**AC ID scheme:** `AC-BR-NNN-N` — e.g., `AC-BR-007-1`, `AC-BR-007-2`. The BR-NNN portion matches the rule ID. IDs are unique and permanent.

**AC rules for business rules:**
- Every active rule must have at least one AC for the primary enforcement path (the condition is met and the expected outcome is produced).
- Rules with multiple branches must have at least one AC per branch — a rule with IF/ELSE IF/ELSE requires at least three ACs, one per outcome.
- Compound rules (exhaustive range of a single decision) must have an AC for at least the boundary between each bracket and the default path.
- Removed rules must have an AC verifying the old behavior is no longer produced (e.g., "Given [prior condition], When [trigger], Then the system does NOT [prior outcome] — instead [new behavior or error]").
- Modified rules must have at least one AC for the new behavior and one AC confirming the prior behavior is no longer produced (where the prior and new behaviors differ).
- The `Then` clause must reference an externally observable signal — API response, UI state, data state via stable read interface, error message. Do not reference internal system state.

**Error-path assessment for business rules:**

The ELSE/default branch of a rule's IF/THEN/ELSE structure is its primary error path — what happens when none of the primary conditions are met. The multi-branch AC requirement above ensures this is always tested. However, two additional error-path considerations apply:

1. **Rules with no explicit ELSE branch:** If a rule's condition structure does not include a catch-all ELSE, the implicit behavior when no condition is met must be stated and tested. Add an AC for the "none of the above" case: "Given [input that does not match any stated condition], When [trigger], Then [the system does X — no action / default value / error]." If the rule is genuinely exhaustive (e.g., a boolean condition), write `Error path: None — rule is exhaustive over its input domain` inline.

2. **Rules whose evaluation depends on external data or system state:** If a rule's condition references data from an external system, a lookup table, or a dependency that could be unavailable, write an AC for rule-evaluation failure: "Given [the dependency is unavailable], When [the trigger occurs], Then [the system does X — rejects the operation / applies a safe default / queues for retry]." If the rule operates only on data already present in the request or entity being evaluated, write `Rule evaluation failure: N/A — rule evaluates only local data` inline.

**Future-dated rules:** When a rule has a future `Effective` date, it is a confirmed rule with deferred activation — do not omit it or treat it as speculative. Record the effective date as a confirmed business constraint in the `Source` field: "Effective [date] — confirmed business requirement; the rule must be in force from this date." Flag the deferred activation to the BSA so that the NFR skill can capture any related timing or availability constraint in the nonfunctional requirements. The mechanism by which activation is achieved is an implementation concern and is outside the scope of this document.

Avoid ambiguous language:
- Use "equals," "is greater than," "is empty," "contains" — not "is valid," "is correct," "is appropriate"
- Spell out all conditions explicitly — do not use "etc." or "and so on"
- Name every referenced entity and attribute precisely

**Example — populated rule card (New / Modified):**

```
Rule BR-007: Order discount rate
Category:    Calculation
Change type: New
Applies to:  Standard-tier customer accounts placing orders through the web or mobile channel;
             excludes Trade accounts (governed by BR-012) and orders placed via API (no discount applied)
Effective:   2024-06-01
Condition:   IF Order.subtotal is greater than £100 THEN the applicable discount rate is 10%
             ELSE IF Order.subtotal is greater than £50 THEN the applicable discount rate is 5%
             ELSE the applicable discount rate is 0%
Exceptions:  NONE
Precedence:  BR-012 (Trade account pricing) takes precedence over this rule when Order.accountType
             equals "Trade"; BR-007 does not apply in that case
Source:      functional-spec §4.3; stakeholder session 2024-03-12 (pricing policy update confirmed
             by Head of Commercial); Effective 2024-06-01 — confirmed business requirement, flagged
             to NFR skill for timing constraint capture
Req trace:   REQ-018
Confirmed:   stakeholder-confirmed
Acceptance criteria:
  AC-BR-007-1: Discount applied at boundary
  Given: An order with Order.value of £100.01 and Order.accountType of "Standard"
  When:  The order total is calculated
  Then:  A 10% discount of £10.00 is applied, and the pre-tax subtotal is £90.01

  AC-BR-007-2: No discount below threshold
  Given: An order with Order.value of £100.00 and Order.accountType of "Standard"
  When:  The order total is calculated
  Then:  No discount is applied, and the pre-tax subtotal is £100.00

  AC-BR-007-3: Trade account excluded
  Given: An order with Order.value of £150.00 and Order.accountType of "Trade"
  When:  The order total is calculated
  Then:  BR-007 does not apply — BR-012 (Trade account pricing) governs the discount
```

**Removed rule card format:**

Use this format for any rule retired by this feature. The prior condition is recorded in full so reviewers can confirm the retirement is intentional and traceable.

```
Rule BR-NNN: [Rule name]
Category:    [Validation / Calculation / Eligibility / State transition / Policy / Integration]
Change type: Removed
Authority:   [Policy-mandated — omit this field entirely if the retirement is not externally mandated; cite both the original mandate and the superseding authority]
Applies to:  [Prior applicability — what this rule previously governed]
Prior condition: IF [prior condition] THEN [prior outcome]
                 ELSE IF [condition] THEN [outcome]
                 ELSE [prior default outcome]
Prior exceptions: [Exceptions that applied to the prior rule; write NONE if there were none]
Retirement reason: [Why this feature retires this rule — which requirement or policy change drives the removal]
Replaced by: [BR-NNN of the replacement rule if one exists, or NONE if the capability is simply retired]
Precedence impact: [List any rules whose Precedence field referenced this rule and must now be updated; write NONE if no other rule referenced this one]
Source:      [Prior artifact where the rule was documented — e.g. "functional-spec v2.1 §3.4", "stakeholder session 2024-03-12"]
Req trace:   [REQ-ID that drives the removal]
Confirmed:   [stakeholder-confirmed / evidence-backed]
Acceptance criteria:
  AC-BR-NNN-1: [Short description — verify old behavior is no longer produced]
  Given: [the prior condition that would have triggered the old rule]
  When:  [the action that would have invoked the rule]
  Then:  [the system does NOT produce the prior outcome — state what happens instead]
```

**Example — populated removed rule card:**

```
Rule BR-003: Legacy paper-channel discount
Category:    Calculation
Change type: Removed
Applies to:  Standard-tier customer accounts placing orders via the paper order form channel
Prior condition: IF Order.channel equals "Paper" THEN the applicable discount rate is 2%
                 ELSE the applicable discount rate is 0%
Prior exceptions: NONE
Retirement reason: Paper channel is being decommissioned by this feature; no orders will be
                   accepted via paper form after the go-live date
Replaced by: NONE — paper channel orders will no longer be accepted; channel
             decommissioning is governed by REQ-031
Precedence impact: BR-009 (channel-specific fulfilment routing) referenced BR-003 as a
                   condition check — BR-009 must be updated to remove this reference
Source:      functional-spec v2.1 §2.1; channel decommission decision confirmed by
             Head of Operations, stakeholder session 2024-05-08
Req trace:   REQ-031
Confirmed:   stakeholder-confirmed
Acceptance criteria:
  AC-BR-003-1: Paper channel order rejected after decommission
  Given: A Standard-tier customer account attempting to place an order via channel "Paper"
  When:  The order submission is attempted
  Then:  The system rejects the order — no discount calculation occurs; the customer receives
         a notification that the paper order channel is no longer available
```

### Step 5 — Link Rules to Requirements

Every rule must trace to the requirement it supports. The trace is recorded in the rule card (`Req trace` field) and summarised here for cross-reference:

| Rule ID | Requirement ID | Relationship |
|---------|---------------|-------------|
| BR-001 | REQ-005 | Governs |
| BR-002 | REQ-005, REQ-009 | Constrains |

Use a controlled relationship vocabulary: **Governs** (rule defines how the requirement is satisfied), **Constrains** (rule limits the behaviour described in the requirement), **Implements** (rule is a direct implementation statement of the requirement), **Overrides** (rule takes precedence over the default behaviour stated in the requirement), **Retired by** (the requirement mandates that this rule is no longer in effect — for Removed rules only).

`Overrides` describes a rule-vs-requirement relationship only — it records that this rule supersedes what the requirement describes as the default. It is not a conflict resolution mechanism between two rules. When two rules produce contradictory outcomes for the same input, that is a rule-vs-rule conflict: resolve it in Step 6 and record the outcome in the `Precedence` field of the affected rules, not here.

**For rules sourced from process maps:** the process map's change delta table records the Requirement ID for each `[NEW]` and `[MODIFIED]` step. Use that Requirement ID as the starting point for the `Req trace` field — it was established during analysis and does not need to be re-derived.

Rules with no requirement reference are either orphaned (delete or escalate) or represent a rule implied by the feature design that was not explicitly stated — surface it to the BSA and add the missing requirement link.

### Step 6 — Detect Conflicts

Compare every rule against every other rule that shares an entity, attribute, or state. For each overlapping pair, check:

1. Can both rules apply simultaneously to the same input?
2. If yes, do they produce contradictory outcomes?

For each conflict found:
- If one rule should take precedence, document the precedence relationship in the `Precedence` field of both rules.
- If the rules appear to overlap but apply to distinct entities or contexts, document the distinction in the `Applies to` field of each rule.
- If precedence is genuinely unclear, escalate to the accountable stakeholder. If the stakeholder resolves it, document the decision and its rationale in the `Precedence` field of both rules.

**If the stakeholder is unavailable within the analysis window**, do not block indefinitely. Apply the following fallback in order:
1. Assign a preliminary precedence based on the more conservative or restrictive outcome (the rule that rejects, constrains, or limits takes precedence over the rule that permits or grants).
2. Document the rationale for the interim assignment explicitly in the `Precedence` field of both rules, noting it is preliminary pending stakeholder confirmation.
3. Mark both affected rules as `assumed-pending-confirmation`.
4. Record the unresolved conflict as an open item for consolidation into the `assumptions-constraints-scope` document (`assumptions-constraints-scope` skill, step 10 in the requirements sequence).
5. Proceed to Step 7 with this documented interim state. The conflict must be resolved and the preliminary precedence confirmed or overturned before the catalog is presented to the BSA for acknowledgement.

**Unchanged rules and conflict detection:** Rules in the "Unchanged rules — not cataloged" coverage log are not active entries in this catalog, but they remain in force after the feature is delivered. After completing conflict detection across all cataloged (New and Modified) rules, scan the coverage log for Unchanged rules that share an entity, attribute, or state with any New or Modified rule. For each overlap, apply the same two questions: Can both rules apply simultaneously to the same input? If yes, do they produce contradictory outcomes? If a conflict is identified between an Unchanged rule and an active rule, resolve it before handoff — either by tightening the New or Modified rule's `Applies to` field to exclude the overlapping scope, or by escalating to the BSA to determine whether the Unchanged rule must be reclassified as Modified and brought into the catalog. Do not leave an Unchanged-vs-Active conflict unresolved. Record the resolution in the `Precedence` field of the active rule and annotate the corresponding coverage log entry.

**Cross-feature rule references:** A rule in this catalog may reference a BR-NNN ID that belongs to a business-rules catalog produced for a different feature. Before handoff, confirm that every BR-NNN referenced in a `Condition` or `Precedence` field that does not appear in this catalog exists in a prior approved business-rules catalog and is still in force. If a referenced rule has been retired or modified by another feature since it was cited, the reference is broken — flag it to the BSA and update the affected rule card before presenting the catalog for acknowledgement. If the existence or current status of a referenced rule cannot be confirmed, mark the referencing rule as `assumed-pending-confirmation` and record the open reference as an open item for the `assumptions-constraints-scope` document.

**Removed rules and conflict detection:** When a rule is tagged Removed, it will no longer be in force after the feature is delivered. Check the `Precedence` fields of all active (New and Modified) rules for references to the Removed rule. Any active rule that names a Removed rule in its `Precedence` field now has a broken reference — update it to remove the reference and document the change. Record the impacted rules in the Removed rule's `Precedence impact` field. Removed rules themselves do not participate in new conflict detection; their prior conflicts are resolved by their retirement.

### Step 7 — Confirm

Each rule must reach one of four confirmation statuses before the catalog is complete:

| Status | Meaning | When to apply |
|--------|---------|---------------|
| `stakeholder-confirmed` | The accountable stakeholder has explicitly confirmed the rule | New rules; Removed rules (retirement confirmed); Modified rules where the change is new to this feature |
| `source-cited` | The mandate source document is cited and accessible | Policy-mandated rules — cite the external mandate in the `Source` field |
| `evidence-backed` | A prior approved artifact (approved requirements document, signed specification, approved process map) confirms the rule without requiring a fresh stakeholder conversation | Modified rules whose prior version is traceable to an approved artifact; process-map-sourced rules (the process-mapping hand-off gate constitutes prior BSA approval — cite the process map as the confirming artifact in the `Source` field); `evidence-backed` is not a substitute for `stakeholder-confirmed` when the rule is new to this feature and no prior approved artifact exists |
| `assumed-pending-confirmation` | The rule could not be confirmed within the analysis window — it is carried forward as an open assumption | Apply when stakeholder confirmation was sought but not received, or when the prior-version question for a New/Modified rule remains unresolved; every rule carrying this status must be explicitly logged for carry-forward into the `assumptions-constraints-scope` document |

- **New rules:** confirm with the accountable stakeholder. Mark as `stakeholder-confirmed`.
- **Modified rules:** if a prior approved artifact exists, mark as `evidence-backed` and cite it; otherwise confirm the change with the stakeholder and mark as `stakeholder-confirmed`.
- **Removed rules:** confirm the retirement is intentional with the accountable stakeholder. Mark as `stakeholder-confirmed`. If the retirement is traceable to an approved policy change or regulatory update with no ambiguity, mark as `evidence-backed` and cite the source.
- **Policy-mandated rules (any change type):** confirm the mandate source document is cited and accessible. Mark as `source-cited`.
- **Process-map-sourced rules:** the process-mapping hand-off gate constitutes prior BSA approval. Mark as `evidence-backed` and cite the process map (`docs/<feature>/requirements-package/analysis/process-map.md`) in the `Source` field — no additional stakeholder confirmation is required unless the rule was tagged New or Removed and requires separate retirement confirmation.

**If the stakeholder's confirmation contradicts the rule as written:** Do not mark the rule as `stakeholder-confirmed` and proceed. Stop, update the rule statement to match the stakeholder's confirmed version, and return to Step 4 to re-formalise the affected rule card. Record both the original statement and the correction in the `Source` field: "Original statement: [prior text]; corrected by [stakeholder name/role], [date]: [corrected text]." If the correction changes the rule's condition, scope, or outcome, re-assess atomicity (Step 4) and re-run conflict detection (Step 6) for the revised rule before re-presenting for confirmation. If the correction is so substantial that the rule ID retirement criteria are met (all three elements changed simultaneously — see Rule ID Scheme), retire the original ID and issue a new one.

Any rule that cannot reach one of the four statuses is an open assumption — carry it forward for consolidation into the `assumptions-constraints-scope` document (`assumptions-constraints-scope` skill, step 10 in the requirements sequence).

### Step 8 — Assemble

Populate the `business-rules` template in three sections:

1. **Active rules** — all New and Modified rules, grouped by category, sorted New → Modified within each category. Policy-mandated authority is visible in the `Authority` field of each card regardless of sort position.
2. **Removed rules** — all Removed rules, grouped by category. Removed rules are separated from active rules so reviewers can verify retirements without conflating them with active requirements.
3. **Unchanged rules — not cataloged** — the coverage log of decision nodes in `[UNCHANGED]` process steps, one line per node: `BR-NNN — [Rule name] — Unchanged — not cataloged` (or `[No ID] — [description] — Unchanged — not cataloged — ID unassigned` where no BR-NNN exists). This section is omitted entirely if analysis did not produce process maps.

Append the companion change log ("Rule Change History") after the three sections if any rules were revised during this iteration.

## Output

A populated **business-rules** document (use the template at `../assets/business-rules.md`).

### File Output

Write the completed business rules to `docs/<feature>/requirements-package/requirements/business-rules.md`.

Consumed by: the requirements-package (embedded in full).

## Failure Modes This Skill Prevents

| Failure mode | How this skill prevents it |
|--------------|---------------------------|
| Business logic is re-derived from system behaviour or code rather than from documented rules at the point of requirements review | The catalog provides the authoritative rule statement, confirmed before the requirements package is assembled |
| A rule change inadvertently modifies an existing rule the feature was not supposed to touch | Change-type tagging makes the boundary explicit — New must introduce no change to prior business policy; Modified identifies the prior version and the specific change, making unintended scope visible before requirements are acknowledged |
| Rules are missing from the requirements package because they were not surfaced until stakeholder review or later | Rules are extracted from all input sources and confirmed before the requirements package is assembled |
| New rules conflict with existing active rules | Step 6 compares every cataloged rule against every other cataloged rule sharing an entity, attribute, or state, and resolves conflicts before the catalog is presented for BSA acknowledgement |
| A New or Modified rule conflicts with an Unchanged rule that remains in force but is not cataloged in this iteration | Step 6 extends conflict detection to Unchanged rules in the coverage log; any Unchanged-vs-Active rule overlap is surfaced and resolved before handoff |
| A rule references a BR-NNN from a prior feature's catalog that has since been retired or modified | Cross-feature reference checks in Step 6 confirm that every externally-referenced BR-NNN is still in force before the catalog is presented for acknowledgement |
| Validation logic in the spec is interpreted differently by different readers | Formalised IF/THEN/ELSE rule statements in Step 4 eliminate interpretation gaps |
| Externally-mandated rules are treated as design choices | Policy-mandated tagging traces rules to the authoritative external source, preserving compliance evidence |
| A rule is silently retired with no documentation, leaving other rules with broken Precedence references | The Removed change type requires the prior condition, retirement reason, and Precedence impact to be documented; Step 6 verifies that active rules with broken references are updated before the catalog is complete |

## Hand-off Gate

**Requires: functional spec presented and acknowledged. If analysis ran, to-be process maps must have been identified and scanned for business rules tables before extraction begins.**

Within the requirements sequence, this skill runs after `functional-requirements` (step 5) and must complete before `data-requirements` (step 7) begins. Note: `user-journeys` (step 4) has already completed before this skill runs. If rule extraction reveals branches that would materially alter a journey stage (e.g., an eligibility rule that blocks a stage the journey assumed was always available), the affected user-journey map must be revised before this catalog is presented for BSA acknowledgement. Manage the revision as follows:

1. Record a note in the catalog's Active rules section alongside the triggering rule: "Journey revision required — [journey name], stage [N], reason: [rule condition that alters the stage]."
2. Surface the revision need explicitly to the user and obtain confirmation that the affected user-journey map has been updated and re-presented to the BSA for acknowledgement.
3. Do not present this catalog for BSA acknowledgement until the user confirms the journey revision is complete and acknowledged.

`assumptions-constraints-scope` (step 10) depends on all prior skills completing first; do not begin it until this catalog is complete and acknowledged.

Before proceeding to `data-requirements`, you must:
1. Write the completed business rules catalog in full — in three sections (Active rules, Removed rules, Unchanged rules — not cataloged). Every active rule must have its ID, change type tag, authority tag (where applicable), formalised conditions and outcomes, exceptions, precedence, applicability, requirement trace, and confirmation status. Every Removed rule must have its prior condition, prior exceptions, retirement reason, Replaced by, Precedence impact, requirement trace, and confirmation status.
2. For every rule carrying `assumed-pending-confirmation` status, verify that it has been explicitly noted for carry-forward into the `assumptions-constraints-scope` document (`assumptions-constraints-scope` skill, step 10 in the requirements sequence). No unconfirmed rule may be silently present in the catalog — it must be visible as an open assumption.
3. Present it to the BSA for review.
4. Receive explicit acknowledgement.

---

## Completion Criteria

- [ ] All business rules tables in to-be process maps have corresponding rule entries in the catalog — no `[NEW]`, `[MODIFIED]`, or `[REMOVED]` decision node is unrepresented
- [ ] All decision nodes in `[UNCHANGED]` process steps are recorded in the catalog coverage log — none are silently skipped; nodes without BR-NNN IDs are flagged to the BSA for ID assignment in the process map
- [ ] All BR-NNN IDs from process-map business rules tables are carried forward unchanged — no process-map BR ID is re-assigned in the catalog
- [ ] The next available BR-NNN ID for any rules discovered outside the process maps continues from the highest ID already in use across all process maps
- [ ] All conditional logic, validation requirements, and policy statements in the functional spec have corresponding rule entries
- [ ] All constraint register entries that encode business rules have corresponding rule entries
- [ ] Every rule has a change type tag (New / Modified / Removed)
- [ ] Every Modified rule records the prior version and the nature of the change in the `Source` field
- [ ] Every Removed rule has a `Prior condition` recorded in full, a `Prior exceptions` field populated (NONE if none), a `Retirement reason` traced to a requirement, a `Replaced by` field populated (NONE if not replaced), and a `Precedence impact` field populated (NONE if no other rule referenced this one)
- [ ] Every rule whose `Precedence` field referenced a Removed rule has been reviewed and updated to remove the broken reference
- [ ] Every Policy-mandated rule has an `Authority` field populated with the cited mandate source
- [ ] Every rule is formalised with explicit conditions and outcomes — no ambiguous language
- [ ] Every rule has an `Applies to` field populated
- [ ] Every rule has an `Exceptions` field populated (NONE if none)
- [ ] Every rule traces to at least one requirement ID in its `Req trace` field
- [ ] Every rule has a confirmation status (evidence-backed, stakeholder-confirmed, source-cited, or assumed-pending-confirmation)
- [ ] Every rule carrying `assumed-pending-confirmation` status is explicitly noted for carry-forward into the `assumptions-constraints-scope` document — no unconfirmed rule is silently present in the catalog
- [ ] All rules cite their source in the `Source` field (functional spec section, constraint register entry, or stakeholder confirmation)
- [ ] No rule text contains ambiguous language — "valid," "correct," "appropriate," "etc.," and "and so on" are absent from all condition and outcome statements
- [ ] All future-dated rules have the `Effective` date recorded and the `Source` field identifies it as a confirmed business constraint; the NFR skill has been notified to capture any related timing or availability constraint
- [ ] No rule ID is duplicated; any retired IDs are recorded as retired in the catalog header or companion change log
- [ ] All conflicts detected in Step 6 among active (New and Modified) rules are resolved — precedence assigned where determinable; any unresolved conflicts are recorded as open items in the `assumptions-constraints-scope` document with a named resolution owner
- [ ] Unchanged rules in the coverage log have been checked against all New and Modified rules for conflicts — any Unchanged-vs-Active rule overlap is resolved or escalated before handoff
- [ ] All BR-NNN references in `Condition` and `Precedence` fields that point to rules outside this catalog have been confirmed as in-force in a prior approved business-rules catalog; broken references are resolved before handoff
- [ ] Any required user-journey revision identified during rule extraction has been completed and re-acknowledged before this catalog is presented for BSA acknowledgement
- [ ] The catalog is structured in three sections: Active rules (New and Modified, grouped by category, sorted New → Modified within each category), Removed rules (grouped by category), and Unchanged rules — not cataloged (coverage log; omitted if analysis did not produce process maps)
- [ ] Every active (New / Modified) rule has at least one inline acceptance criterion in Given/When/Then format with an observable `Then` clause
- [ ] Rules with multiple branches have at least one AC per branch — the primary path and each alternative path are independently verifiable
- [ ] Every Removed rule has an AC verifying the prior behavior is no longer produced
- [ ] Every Modified rule has at least one AC for the new behavior and one AC confirming the prior behavior is no longer produced (where the prior and new behaviors differ)
- [ ] Every rule with no explicit ELSE branch has an AC for the "none of the above" case, or states `Error path: None — rule is exhaustive over its input domain`
- [ ] Every rule whose condition references external data or a dependency that could be unavailable has an AC for rule-evaluation failure, or states `Rule evaluation failure: N/A — rule evaluates only local data`
- [ ] AC IDs follow the `AC-BR-NNN-N` scheme and are unique within the catalog
- [ ] The companion change log ("Rule Change History") is appended if any rules were revised during this iteration
- [ ] The catalog has been presented to the BSA and explicit acknowledgement received before the skill is considered complete
