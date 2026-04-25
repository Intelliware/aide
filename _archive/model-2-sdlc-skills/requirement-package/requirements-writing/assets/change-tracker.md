# Change Tracker

> **Project:** [project name]
> **Feature:** [feature name]
> **Tracker initialized:** [date]
> **Current package version:** [v0.1 / v0.2 / v1.0 / …]

---

## Package Version Log

One entry per package version. A new version is cut when the synthesiser assembles the package or when a formal review cycle produces corrections that are applied and re-assembled.

| Version | Date | Trigger | Summary | Assembled by |
|---------|------|---------|---------|-------------|
| [v0.1] | [date] | [Initial assembly / Review correction / Stakeholder revision / Post-handoff amendment] | [1–2 sentence summary of what this version contains or changes] | [name or role] |

---

## Change Register

One entry per discrete change to a requirements artifact. Every skill appends entries as it produces or revises an artifact. Entries are never deleted — a reversed change gets its own entry.

| CHG ID | Date | Package Version | Artifact | Item ID | Change Type | Description | Trigger | Authorized By | Impact |
|--------|------|----------------|----------|---------|-------------|-------------|---------|---------------|--------|
| [CHG-001] | [YYYY-MM-DD] | [v0.1] | [executive-summary / stakeholder-personas / business-objectives / user-journeys / functional-requirements / business-rules / data-requirements / permissions-access-control / nonfunctional-requirements / assumptions-constraints-scope] | [REQ-xxx / OBJ-xxx / BR-xxx / NFR-xxx / ACR-xxx / ASMP-xxx / CON-xxx / OOS-xxx / MNT-xxx / P-xx / — (for section-level changes)] | [Added / Modified / Removed / Deferred / Reinstated] | [What changed — precise enough that a reader does not need to open the artifact to understand the change] | [Initial authoring / Hand-off gate feedback / Downstream skill discovery / Review finding / Stakeholder correction / Late-arriving requirement / Assumption verified false / Constraint conflict resolution] | [Name or role who authorized the change; "BSA — initial authoring" for first-pass entries] | [Item IDs in other artifacts affected by this change, or "None" if self-contained] |

### Field Definitions

**CHG ID:** Sequential, never reused. Format: `CHG-NNN` (zero-padded to three digits). If the register exceeds 999 entries, extend to four digits.

**Package Version:** The package version this change will appear in. During initial authoring (before the first assembly), all entries carry the first version number (e.g., v0.1). After assembly, changes made during review carry the next version number.

**Artifact:** The requirements artifact that was changed. Use the artifact file name without extension (e.g., `functional-requirements`, not a source reference file name).

**Item ID:** The specific requirement, rule, objective, or other tracked item that changed. Use `—` (em dash) for section-level changes that do not affect a single tracked item (e.g., "Executive summary scope section rewritten").

**Change Type:**

| Type | Meaning |
|------|---------|
| Added | A new item was created in the artifact |
| Modified | An existing item's content, priority, status, or classification changed |
| Removed | An item was deleted from the artifact — the item ID is retired |
| Deferred | An item was moved out of scope for this package version — recorded in assumptions-constraints-scope |
| Reinstated | A previously Removed or Deferred item was brought back into the artifact |

**Trigger:** What caused this change. Use the controlled vocabulary above. If a trigger does not fit any listed category, use a brief free-text description and flag it for the BSA to classify.

**Authorized By:** The person or role who approved this change. For initial authoring entries, the BSA is the default authority. For changes triggered by review findings or stakeholder corrections, name the individual who directed the change.

**Impact:** Other tracked items in other artifacts that are affected by this change. This is a forward pointer — it tells the reader "if you are looking at this change, you should also check these items." Use item IDs (e.g., "BR-003, NFR-PER-001") or "None" if the change is self-contained. The synthesiser uses this field to validate that impacted items were actually updated.

---

## Version Diff Summary

One section per package version after v0.1. Produced by the synthesiser at assembly time. Gives downstream consumers (architects, AI agents) a structured diff they can act on without re-reading the entire package.

### [Version] — [Date]

**Items added:**

| Artifact | Item ID | Description |
|----------|---------|-------------|
| [artifact] | [ID] | [what was added] |

*None — no items added in this version.*

**Items modified:**

| Artifact | Item ID | Field Changed | Previous Value | New Value |
|----------|---------|--------------|----------------|-----------|
| [artifact] | [ID] | [which field] | [old] | [new] |

*None — no items modified in this version.*

**Items removed or deferred:**

| Artifact | Item ID | Change Type | Reason |
|----------|---------|-------------|--------|
| [artifact] | [ID] | [Removed / Deferred] | [why] |

*None — no items removed or deferred in this version.*

**Impact chain (cross-artifact):**

| Source Change | Impacted Item | Impact Confirmed |
|--------------|--------------|:----------------:|
| [CHG-xxx → Item ID] | [Item ID in another artifact] | Yes / No / Pending |

*None — no cross-artifact impacts in this version.*
