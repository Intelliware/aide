# Phase 0b — QE Increment Readiness Check

## Purpose
Locate the knowledge-base feature folder for this work item, check whether a
`qe-package/qe-increment-status.md` tracker exists, and either **create it** (first
run) or **surface readiness recommendations** (subsequent runs) before any test
authoring begins.

---

## Process

### 1. Locate the KB feature folder

**Fast-path — INC ID supplied in Phase 0:**
If Phase 0 resolved the context from an INC file, the KB feature folder is already known.
Use that path directly as **KB_FEATURE_ROOT** and skip the discovery steps below.

**Discovery — JIRA ID or plain instructions:**
Search `TDBC-knowledge-base/features/` for a folder that corresponds to the current
work item. Try these signals in order:

1. **JIRA summary keywords** — look for a folder whose name contains a slug of the
   JIRA summary (e.g. `outgoing-wires`, `import-wires`, `mvp2`).
2. **User-supplied slug** — if the user mentioned a feature name, match on that.
3. **Prompt as last resort** — if no match is found, ask once:
   > "I couldn't automatically find the KB feature folder. What is the folder name
   > under `TDBC-knowledge-base/features/`? (e.g. `outgoing-wires-mvp2-import`)"

Hold the resolved path as **KB_FEATURE_ROOT** for the rest of this phase.

### 2. Check for implementation-package

Check if `<KB_FEATURE_ROOT>/implementation-package/increment-status.md` exists.

- **If not found:** Tell the user "No implementation-package found for this feature —
  QE scope is unconstrained." Skip to **Exit** (proceed to Phase 1 normally).

### 3. Check for qe-package

Check if `<KB_FEATURE_ROOT>/qe-package/qe-increment-status.md` exists.

- **If NOT found → go to §4 (Create)**
- **If found → go to §5 (Recommend)**

---

### 4. CREATE — first-run bootstrap

Read all three sources:
- `<KB_FEATURE_ROOT>/implementation-package/increment-status.md`
- `<KB_FEATURE_ROOT>/implementation-package/implementation-package.md` (INC names + layer)
- `<KB_FEATURE_ROOT>/implementation-package/plan/test-plan.md` (pyramid placement, §10)

From the test-plan's pyramid table (§10), determine for each INC whether BB-DCC-QE
automation is required (E2E ✔ column) or whether it is **dev-owned only** (unit/IT/Cypress
with no E2E row).

Create `<KB_FEATURE_ROOT>/qe-package/qe-increment-status.md` with the content
template below, pre-populated for every INC.

**Status legend for the QE tracker:**

| Status | Meaning |
|---|---|
| `n/a` | Dev-owned only (unit/IT/Cypress); no BB-DCC-QE automation needed |
| `not-ready` | Dev INC not yet `done`; cannot automate yet |
| `ready` | Dev INC is `done` (Human Gate passed); QE can start |
| `in-progress` | QE automation being authored |
| `done` | QE automation authored, reviewed, and tag passing in CI |

**Template to write:**

```markdown
# QE Increment Status — <feature name>

**Purpose:** Tracks which implementation increments have BB-DCC-QE automation
authored against them, and their current readiness / completion state.

**Status legend:**
- `n/a` — dev-owned only; no BB-DCC-QE automation needed
- `not-ready` — dev INC not yet done; cannot automate
- `ready` — dev INC done (Human Gate passed); QE can start
- `in-progress` — QE automation being authored
- `done` — QE automation done and tag passing

**Last updated:** <date>

| Dev INC | Name | Layer | Dev Status | QE Status | BB-DCC-QE tag / feature file | Notes |
|---|---|---|---|---|---|---|
| INC-001 | <name> | <layer> | <dev-status> | not-ready / n/a | — | — |
...one row per INC...
```

After writing the file, tell the user:
> "Created `qe-package/qe-increment-status.md` with <N> rows. <X> INCs are currently
> `ready` for QE automation (dev Human Gate passed). See recommendations below."

Then fall through to §5 to surface the recommendations.

---

### 5. RECOMMEND — readiness summary

Read `<KB_FEATURE_ROOT>/qe-package/qe-increment-status.md`.

Produce a readiness report in chat:

```
## QE Increment Readiness — <feature>

**Ready to automate now** (<N> INCs, dev Human Gate passed):
| INC | Name | Layer | Suggested QE priority |
|---|---|---|---|
| INC-XXX | ... | L4 | 🥇 High — user-facing E2E journey |

**In-progress QE** (<N> INCs):
| INC | Name | QE tag | Status |
...

**Blocked — waiting on dev** (<N> INCs):
| INC | Name | Dev status | Blocker |
...

**Not applicable** (<N> INCs — dev-owned only):
(collapsed — ask to expand if needed)
```

Priority guidance for the "Ready" set:
- **🥇 High** — L4 UI components and full-journey flows (E2E visible to end user)
- **🥈 Medium** — L2/L3 API validators and entitlement/AuthZ paths
- **🥉 Lower** — infrastructure INCs (scheduler, mTLS, audit emitter)

After the report, ask:
> "Would you like to start QE automation for one of the ready INCs above, or
> continue with your original JIRA/instructions from Phase 1?"

If the user picks a ready INC: load that INC's file
(`<KB_FEATURE_ROOT>/implementation-package/INC-XXX.md`) as additional context
alongside the JIRA/description before handing to Phase 1.

**If INC ID was supplied directly in Phase 0:** the INC file is already loaded.
Instead of asking which INC to use, confirm readiness of that specific INC:
- If QE Status is `ready` or `in-progress` → proceed to Phase 1.
- If QE Status is `not-ready` → warn: "⚠️ `<INC-ID>` has QE status `not-ready` (dev Human Gate not yet passed). Proceeding may result in automation against incomplete functionality. Continue anyway? (yes / no)"
- If QE Status is `n/a` → warn: "⚠️ `<INC-ID>` is marked `n/a` (dev-owned only — no BB-DCC-QE automation expected). Continue anyway? (yes / no)"

---

## Exit criteria

- KB_FEATURE_ROOT is resolved (or user confirmed none exists)
- `qe-package/qe-increment-status.md` exists (created or already present)
- Readiness report surfaced to user
- User has chosen to proceed with a specific INC or their original JIRA context
- If INC ID was supplied directly: readiness of that INC confirmed with the user
- Phase 1 has the right input context loaded
