# Assumption Log

> **Project:** [project name]
> **Change request:** [brief description]
> **Living document — updated continuously from discovery through requirements phase**

---

## Assumption Register

| ID | Assumption | Category | Source | Status | Linked Risk ID | Depends On This | Risk If Wrong | Verification Method | Owner | Verification By Date | Date Logged | Date Verified | Evidence | Stakeholders Notified | Fallback Plan | Notes |
|----|-----------|----------|--------|--------|---------------|----------------|--------------|--------------------| ------|---------------------|------------|--------------|---------|----------------------|--------------|-------|
| ASMP-001 | [precise, falsifiable statement of what is believed to be true — scoped to one independently verifiable claim] | [Technical / Data / Business / Organisational] | [observed system behaviour: `file/path:line` / document: `name, version` / verbal: `Name, date, context` / inferred from: `context`] | [Code-verified / Stakeholder-confirmed / Assumed — pending confirmation / Circular — pending BSA decision / Superseded / Invalidated] | [RISK-xxx — required if status is "Assumed — pending confirmation" or "Circular — pending BSA decision"; create at point of logging] | [REQ-xxx, DEP-xxx, RISK-xxx, or analysis outputs that depend on this being true] | [what must be revised if this assumption is false] | [specific: "confirm with [Name] in session on [date]" — N/A for Circular entries] | [named person — N/A for Circular entries] | [date — N/A for Circular entries] | [date] | [date or blank] | [citation when verified: file/line or person, date, context] | [names and dates of everyone informed of the confirmed status — "None" at entry time] | [recovery plan if assumption is false — for Circular entries, state recovery if BSA decides the circular cluster is untenable] | [cross-references, conflict flags, circularity detections, supersession links — "None" if not applicable] |

---

## Assumed — Pending Confirmation

All entries with status "Assumed — pending confirmation". Each must have a linked risk register entry created at point of logging.

| ASMP ID | Assumption | Linked Risk | Verification Owner | Verification By Date | Fallback If False |
|---------|-----------|------------|---------------------|---------------------|------------------|
| ASMP-xxx | | RISK-xxx | [named person] | [date] | [what changes or is descoped] |

---

## Circular — Pending BSA Decision

Assumptions that cannot be independently verified because two or more assumptions can only be verified by reference to each other. Each must have a linked risk register entry.

| ASMP IDs (circular group) | Why Independent Verification Is Not Possible | Linked Risk IDs | BSA Decision (DEC ID) |
|--------------------------|---------------------------------------------|----------------|----------------------|
| ASMP-xxx, ASMP-yyy | [why these cannot be verified independently] | RISK-xxx | [DEC-xxx / Awaiting BSA decision] |

---

## Invalidated Assumptions

Assumptions confirmed to be false. Downstream items must be reviewed and the full invalidation cascade applies.

| ASMP ID | What Was Assumed | What Is True | Date Invalidated | Confirmed By | Downstream Items Affected | Action Taken |
|---------|-----------------|-------------|-----------------|-------------|--------------------------|-------------|
| ASMP-xxx | | | | [name, evidence] | [REQ-xxx, DEP-xxx, ...] | [updated / descoped / risk accepted] |

---

## Summary

| Status | Technical | Data | Business | Organisational | Total |
|--------|-----------|------|----------|---------------|-------|
| Code-verified | | | | | |
| Stakeholder-confirmed | | | | | |
| Assumed — pending confirmation | | | | | |
| Circular — pending BSA decision | | | | | |
| Superseded | | | | | |
| Invalidated | | | | | |
| **Total** | | | | | |

| Metric | Value |
|--------|-------|
| Overdue "Assumed — pending confirmation" entries (verification-by date passed without resolution) | |
| "Circular — pending BSA decision" entries awaiting a written BSA decision | |
| Outstanding REQ-TBD count (placeholder requirement references not yet back-filled with assigned IDs) | |
