# Example — qe-coverage-check

## Scenario: Pre-release audit for the Outgoing Wires MVP2 Import feature

**User says:** "Check QE coverage for outgoing-wires-mvp2-import"

---

### Step 1 — Locate KB feature folder

Skill matches `outgoing-wires-mvp2-import` directly.
**KB_FEATURE_ROOT** = `TDBC-knowledge-base/features/outgoing-wires-mvp2-import/`

---

### Step 2 — Read implementation package

Reads `increment-status.md` → 6 INCs found.
Reads `test-plan.md` §10:
- INC-001, INC-002, INC-004: E2E ✔ → BB-DCC-QE required
- INC-003: API/IT only → dev-owned (Cypress)
- INC-005: Unit only → dev-owned
- INC-006: L4, E2E ✔ → BB-DCC-QE required

Reads each INC file for Layer:
- INC-001: L4, done
- INC-002: L3, done
- INC-003: L2, done
- INC-004: L4, in-progress
- INC-005: L1, done
- INC-006: L4, done

---

### Step 3 — Read qe-increment-status.md

File exists. Contents:

| INC | QE Status | Tag |
|---|---|---|
| INC-001 | done | @outgoing-wires-inc001 |
| INC-002 | ready | — |
| INC-003 | n/a | — |
| INC-004 | not-ready | — |
| INC-005 | n/a | — |
| INC-006 | done | @outgoing-wires-inc006 |

---

### Step 4 — Live tag check against KNOWLEDGE.md

- `@outgoing-wires-inc001` → found, 4 scenarios ✅
- `@outgoing-wires-inc006` → **not found** ⚠️ Drift

---

### Step 5 — Coverage report presented

```
## QE Coverage Report — outgoing-wires-mvp2-import
Generated: 2026-05-22
Implementation package: 6 total INCs

### Summary
| Status | Count |
|---|---|
| ✅ Fully covered (done, tag verified) | 1 |
| 🔄 In-progress | 0 |
| ⚠️ Ready but not started | 1 |
| 🔴 Not covered (not-ready — blocked on dev) | 1 |
| ⚠️ Drift — tracker says done but tag not in codebase | 1 |
| ➖ Not applicable (dev-owned only) | 2 |

### Coverage Detail
| INC | Name | Layer | Dev Status | QE Status | Tag | Scenarios in BB-DCC-QE | Gap? |
|---|---|---|---|---|---|---|---|
| INC-001 | Import wire initiation | L4 | done | done | @outgoing-wires-inc001 | 4 | ✅ |
| INC-002 | Entitlement validation | L3 | done | ready | — | 0 | ⚠️ No automation yet |
| INC-003 | AuthZ service check | L2 | done | n/a | — | — | ➖ |
| INC-004 | Approval workflow UI | L4 | in-progress | not-ready | — | 0 | 🔴 Blocked on dev |
| INC-005 | Audit emitter | L1 | done | n/a | — | — | ➖ |
| INC-006 | Confirmation screen | L4 | done | done | @outgoing-wires-inc006 | 0 (tag not found) | ⚠️ Drift |

### Gaps requiring action
| INC | Name | Issue | Recommended action |
|---|---|---|---|
| INC-002 | Entitlement validation | Dev done, QE not started | `/qe-development INC-002` |
| INC-006 | Confirmation screen | Tag @outgoing-wires-inc006 not in KNOWLEDGE.md | `/qe-code-scanner` then recheck |
```

---

### Step 6 — Next action offered

> "2 gaps found. Would you like to:
> 1. Start QE automation for INC-002 — invoke `/qe-development INC-002`
> 2. Refresh codebase knowledge to resolve the INC-006 drift warning — invoke `/qe-code-scanner`
> 3. Exit"

**User:** Start on INC-002

**Skill:**
> "Invoking `qe-development` for INC-002..."

Hands off to `qe-development` with INC-002 as the input (skips Phase 0 prompting).
