# Business Rules Catalog

> **Project:** [project name]
> **Change request:** [brief description]
> **Date:** [date]

---

## Summary Counts

| Change type | Count |
|-------------|-------|
| New | |
| Modified | |
| Removed | |
| **Total active (New + Modified)** | |

| Authority | Count |
|-----------|-------|
| Policy-mandated (across New and Modified) | |

---

## Part 1: Active Rules (New and Modified)

Rules grouped by category, sorted New → Modified within each category. Policy-mandated authority is visible in the `Authority` field of each card.

### Validation Rules

Rules that determine whether a data entity or input is accepted by the system.

```
Rule BR-NNN: [Rule name]
Category:    Validation
Change type: [New / Modified]
Authority:   [Policy-mandated — omit this field entirely if not externally mandated]
Applies to:  [Entity, customer segment, product line, jurisdiction, or context — be specific]
Effective:   [Date from which the rule applies — omit field entirely if timeless]
Condition:   IF [condition] THEN [outcome]
             ELSE IF [condition] THEN [outcome]
             ELSE [default outcome]
Exceptions:  [Explicit exceptions; write NONE if there are none]
Precedence:  [If this rule can conflict with another, state which wins and under what condition; omit if no conflict possible]
Source:      [Document, meeting record, or artifact — e.g. "functional-spec §3.2", "constraint register CR-004", "stakeholder session YYYY-MM-DD"]
Req trace:   [REQ-ID(s) this rule supports]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Short description]
  Given: [initial state — specific entity values]
  When:  [action that triggers rule evaluation]
  Then:  [externally observable outcome proving rule enforcement]
```

### Calculation Rules

Rules that define how derived or computed values are produced.

```
Rule BR-NNN: [Rule name]
Category:    Calculation
Change type: [New / Modified]
Authority:   [Policy-mandated — omit if not externally mandated]
Applies to:  [Entity, customer segment, product line, jurisdiction, or context]
Effective:   [Date — omit if timeless]
Condition:   IF [condition] THEN [formula or computed value]
             ELSE IF [condition] THEN [formula or computed value]
             ELSE [default formula or computed value]
Exceptions:  [Explicit exceptions; write NONE if none]
Precedence:  [Conflict resolution; omit if no conflict possible]
Source:      [Origin artifact]
Req trace:   [REQ-ID(s)]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Short description — verify calculation with specific input values]
  Given: [initial state with specific numeric values]
  When:  [action that triggers the calculation]
  Then:  [the computed result equals the expected value]
```

### Eligibility Rules

Rules that define who or what can access a capability or resource.

```
Rule BR-NNN: [Rule name]
Category:    Eligibility
Change type: [New / Modified]
Authority:   [Policy-mandated — omit if not externally mandated]
Applies to:  [Entity, customer segment, product line, jurisdiction, or context]
Effective:   [Date — omit if timeless]
Condition:   IF [user/entity meets condition] THEN [access granted / action permitted]
             ELSE [access denied / fallback]
Exceptions:  [Explicit exceptions; write NONE if none]
Precedence:  [Conflict resolution; omit if no conflict possible]
Source:      [Origin artifact]
Req trace:   [REQ-ID(s)]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Eligible entity — access granted]
  Given: [entity meeting the eligibility condition]
  When:  [action attempted]
  Then:  [access granted / action permitted — observable outcome]

  AC-BR-NNN-2: [Ineligible entity — access denied]
  Given: [entity NOT meeting the eligibility condition]
  When:  [same action attempted]
  Then:  [access denied / fallback behavior — observable outcome]
```

### State Transition Rules

Rules that define under what conditions an entity changes state.

```
Rule BR-NNN: [Rule name]
Category:    State transition
Change type: [New / Modified]
Authority:   [Policy-mandated — omit if not externally mandated]
Applies to:  [Entity type and scope]
Effective:   [Date — omit if timeless]
Condition:   IF [entity is in state X] AND [trigger condition] THEN [transition to state Y; triggered actions: audit record created, notification sent, etc.]
             ELSE [no transition / alternative outcome]
Exceptions:  [Explicit exceptions; write NONE if none]
Precedence:  [Conflict resolution; omit if no conflict possible]
Source:      [Origin artifact]
Req trace:   [REQ-ID(s)]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Valid transition — state changes]
  Given: [entity in state X with trigger condition met]
  When:  [trigger action occurs]
  Then:  [entity transitions to state Y; triggered actions are observable]

  AC-BR-NNN-2: [Invalid transition — state preserved]
  Given: [entity in state X with trigger condition NOT met, or entity in wrong state]
  When:  [trigger action attempted]
  Then:  [entity remains in current state; no transition occurs]
```

### Policy Rules

Rules derived from business policy, regulatory obligation, or organisational decision rather than technical logic.

```
Rule BR-NNN: [Rule name]
Category:    Policy
Change type: [New / Modified]
Authority:   [Policy-mandated — omit if not externally mandated]
Applies to:  [Scope of the policy]
Effective:   [Date — omit if timeless]
Condition:   IF [condition] THEN [policy outcome]
             ELSE [default]
Exceptions:  [Explicit exceptions; write NONE if none]
Precedence:  [Conflict resolution; omit if no conflict possible]
Source:      [Regulation / contractual obligation / stakeholder decision — cite the authority document]
Req trace:   [REQ-ID(s)]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Policy enforced]
  Given: [condition that triggers the policy]
  When:  [action subject to the policy]
  Then:  [policy outcome is observable]
```

### Integration Rules

Rules governing how data is exchanged with or from external systems.

```
Rule BR-NNN: [Rule name]
Category:    Integration
Change type: [New / Modified]
Authority:   [Policy-mandated — omit if not externally mandated]
Applies to:  [External system and integration direction: Received from / Sent to]
Effective:   [Date — omit if timeless]
Condition:   IF [data condition or message type] THEN [mapping / transformation / validation outcome]
             ELSE [rejection / error handling outcome]
Exceptions:  [Explicit exceptions; write NONE if none]
Precedence:  [Conflict resolution; omit if no conflict possible]
Source:      [Origin artifact]
Req trace:   [REQ-ID(s)]
Confirmed:   [evidence-backed / stakeholder-confirmed / source-cited / assumed-pending-confirmation]
Acceptance criteria:
  AC-BR-NNN-1: [Valid integration data — accepted]
  Given: [data meeting the condition from the external system]
  When:  [data is received / sent]
  Then:  [mapping / transformation / validation outcome is observable]

  AC-BR-NNN-2: [Invalid integration data — rejected]
  Given: [data NOT meeting the condition]
  When:  [data is received / sent]
  Then:  [rejection / error handling outcome is observable]
```

---

## Part 2: Removed Rules

Rules retired by this feature, grouped by category. Removed rules are separated from active rules so reviewers can verify retirements without conflating them with active requirements.

```
Rule BR-NNN: [Rule name]
Category:    [Validation / Calculation / Eligibility / State transition / Policy / Integration]
Change type: Removed
Authority:   [Policy-mandated — omit if retirement is not externally mandated; cite both original mandate and superseding authority if applicable]
Applies to:  [Prior applicability — what this rule previously governed]
Prior condition: IF [prior condition] THEN [prior outcome]
                 ELSE IF [condition] THEN [outcome]
                 ELSE [prior default outcome]
Prior exceptions: [Exceptions that applied to the prior rule; write NONE if none]
Retirement reason: [Why this feature retires this rule — which requirement or policy change drives the removal]
Replaced by: [BR-NNN of replacement rule, or NONE if capability is simply retired]
Precedence impact: [Rules whose Precedence field referenced this rule and must now be updated; write NONE if none]
Source:      [Prior artifact where the rule was documented]
Req trace:   [REQ-ID that drives the removal]
Confirmed:   [stakeholder-confirmed / evidence-backed]
Acceptance criteria:
  AC-BR-NNN-1: [Prior behavior no longer produced]
  Given: [the prior condition that would have triggered the old rule]
  When:  [the action that would have invoked the rule]
  Then:  [the system does NOT produce the prior outcome — state what happens instead]
```

---

## Part 3: Unchanged Rules — Not Cataloged

Coverage log of decision nodes in `[UNCHANGED]` process steps. One line per node. Omit this section entirely if analysis did not produce process maps.

```
BR-NNN — [Rule name] — Unchanged — not cataloged
[No ID] — [Rule name or brief description] — Unchanged — not cataloged — ID unassigned
```

*If no unchanged rules from process maps, write: No unchanged rules from process maps — analysis did not produce process maps, or all in-scope decision nodes are New or Modified.*

---

## Assumption Log — Unconfirmed Rules

Rules whose behaviour could not be confirmed from available sources or by a stakeholder. Every rule carrying `assumed-pending-confirmation` status must also appear here, flagged for carry-forward into the `assumptions-constraints-scope` document at step 10.

| Rule ID | Assumption | Risk if Wrong | Planned Verification | Owner | Target Date |
|---------|-----------|--------------|---------------------|-------|------------|
| BR-xxx | [what is assumed about this rule] | [consequence] | [how it will be verified] | | |

---

## Rule Change History

Companion change log — append when any rule card is revised during this iteration. One entry per revision.

| Rule ID | Date of Revision | Revised By | Nature of Change | Prior Rule Text (full card) |
|---------|-----------------|-----------|-----------------|----------------------------|
| BR-xxx | [date] | [name / role] | [condition changed / scope changed / outcome changed] | [full text of the prior rule card before revision] |

*If no rules were revised during this iteration, write: No rule revisions during this iteration.*
