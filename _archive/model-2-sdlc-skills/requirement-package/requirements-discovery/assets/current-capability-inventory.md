# Current Capability Inventory

> **Project:** [project name]
> **Proposed change:** [brief description of the feature or change request]
> **Inventory date:** [date]

---

## Anchor Statement

> **Capability area:** [the business capability area the proposed change will touch — e.g., "Order Cancellation", "User Profile", "Payment Processing"]
> **Likely information involved:** [information the change will work with — e.g., "Order, Customer, Invoice"]
> **Likely interaction points:** [screens, workflows, or processes the change will interact with — e.g., "Order Cancellation screen, Order Detail page"]

*This statement is the reading filter for the entire inventory. Every capability documented below connects to one of the areas named here.*

---

## Capability Areas

Organize capabilities into logical business groupings (e.g., "User Management", "Order Processing", "Reporting"). Each area contains one or more capabilities.

### [Capability Area Name]

> Brief description of what this area of the system does from a business perspective.

#### [Capability Name]

| Field | Value |
|-------|-------|
| **Source** | [how this capability was confirmed — e.g., observed in the system, described in existing documentation, or stakeholder-confirmed; cite the specific document or observation] |
| **Capability type** | [feature / integration / administrative function / background process] |
| **Current status** | [active — available to all users / conditionally available — not yet released to all users / being phased out / disabled] |
| **User-facing description** | [what this capability does from the user's perspective — one or two sentences] |

**Capability interface (directly affected capabilities only):**
- [capability name] — inputs: [what information the user or system provides]; outputs: [what the system returns or does]; failure conditions: [when the capability rejects input and why]
- [repeat for each interaction this capability supports]
<!-- Omit this section for indirectly affected and unrelated capabilities, and for capabilities with no direct user or system input/output -->

**Screens and surfaces:**
- [page/screen name] — [user-facing purpose]; **Fields:** [field name (required or optional, validation rule)], [field name (required or optional, validation rule)], ...
- [page/screen name] — [user-facing purpose]
<!-- List each surface as one bullet. For form surfaces, append the field list inline on the same bullet after "Fields:". Omit this section for capabilities with no user-facing surfaces (e.g., background processes) -->

**Business rules observed:**
- [specific rule with condition and outcome — e.g., "orders below $10 are rejected; orders $10–$99 incur a $5 shipping fee; orders $100+ qualify for free shipping" — cite the source where this rule was confirmed]
- [repeat for each rule]

**Cross-cutting obligations:**
- [audit trail obligations — what events must be recorded, what information the record must include]
- [localisation obligations — languages supported, currency handling conventions]
<!-- Omit this section entirely if no audit trail or localisation requirements were found in the change area -->

**Confirmed behaviors:**
- [behavior statement — e.g., "rejects orders below the minimum order amount" — cite the source: observation, documentation, or stakeholder confirmation]
- [edge cases and boundary conditions — e.g., "handles zero-quantity orders, negative amounts, and currency mismatches"]
- [gaps — behaviors in this capability area that have not been confirmed from any source]

**Information involved:**
- [information name] — [brief description of what it represents and key fields relevant to this capability]
- [repeat for each information type]

**Connected systems:**
- [external service or internal capability this depends on or exposes to] — [nature of the connection: real-time exchange, scheduled data transfer, shared information, or notification]
- [repeat for each connected system]

**Relevance to proposed change:** [directly affected / indirectly affected / unrelated] — [one sentence explaining why]

**Confidence level:** [High / Medium / Low] — Assign this last, after all sections above are populated. High: two or more independent sources agree (e.g., system observation + existing documentation + stakeholder confirmation). Medium: inferred from a single source with no contradicting evidence. Low: uncertain — derived from ambiguous or conflicting sources. If Low, state the follow-up action required to resolve the uncertainty before requirements are written.

---

*Repeat the capability area and capability blocks above for each area discovered.*

---

## Information Observations

Observations about information volume, format, and structural inconsistencies that downstream phases must account for.

| Observation | Where Observed | Implication for Proposed Change |
|---|---|---|
| [what was observed — e.g., "order history dataset is large and requires page-by-page retrieval"] | [where observed — e.g., system behavior, existing documentation] | [what this means for the new feature — e.g., "new views of order data must support pagination"] |
| | | |

---

## Information Gaps Requiring Clarification

Areas where the discovery could not confirm capability behavior from available sources. These become targeted questions for stakeholder input.

| Gap | What Is Unknown | Question to Resolve |
|---|---|---|
| [area or capability] | [what has not been confirmed — e.g., "how errors from the payment service are handled after timeout"] | [question to ask the business or stakeholder] |
| | | |

---

## Behavioral Coverage Assessment

> **Coverage level:** [Confirmed / Partially confirmed / Not confirmed]
> **Assessment basis:** [summary of what has been verified — e.g., "key order cancellation and refund paths confirmed from existing documentation and stakeholder review; notification behavior has not been confirmed"]
> **Risk implication:** [if Partially confirmed: list unconfirmed behaviors and note that requirements must be explicit about preservation expectations for those areas; if Not confirmed: note that no verified baseline exists and behavioral assumptions are unverified; if Confirmed: "No elevated risk from verification gaps"]

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Capability areas identified | |
| Total capabilities | |
| Directly affected by proposed change | |
| Indirectly affected | |
| Unrelated | |
| Conditionally available (not yet released to all users) | |
| Being phased out or disabled | |
| Business rules extracted | |
| Information types documented | |
| Connected systems identified | |
| Information observations | |
| Gaps requiring clarification | |
| Behavioral coverage | [Confirmed / Partially confirmed / Not confirmed] |
