# Example — audit-quality-coverage

> Illustrative only. Feature names, INC IDs, layer vocabulary, and
> markers are placeholders. The skill is framework-agnostic;
> substitute the test stack and tracker layout pinned in your team's
> quality package.

## Scenario — Pre-release coverage audit for the `outgoing-wires-mvp2`
> feature

**User says:** "Audit quality coverage for outgoing-wires-mvp2"

### Step 1 — Locate package and tracker

- Resolved `KB_FEATURE_ROOT` →
  `docs/outgoing-wires-mvp2/quality-package/` (legacy mode, not opted in;
  opted in it would be `.framework-output/quality/outgoing-wires-mvp2/`).
- Implementation package: 6 INCs found.
- Quality package: assembled, version 0.3-quality.2.
- Test-case status tracker: present (team uses the TC-XXX flow), 14
  TCs across 3 scaffolding + 11 test-case rows.

### Step 2 — Cross-reference

Joined `increment-status.md` + `traceability.md` + `test-case-status.md`:

| INC | Name | Test level (per test-design) | Dev status | Test coverage claimed (matrix) | TCs implemented |
|---|---|---|---|---|---|
| INC-001 | Import wire initiation | E2E + integration | done | TC-OWM-004, TC-OWM-005 | both `completed` |
| INC-002 | Entitlement validation | integration | done | TC-OWM-006 | `not-started` |
| INC-003 | AuthZ service check | unit (dev-owned) | done | (n/a — dev-owned) | — |
| INC-004 | Approval workflow UI | E2E | in-progress | (planned) TC-OWM-010 | not yet planned |
| INC-005 | Audit emitter | unit (dev-owned) | done | (n/a — dev-owned) | — |
| INC-006 | Confirmation screen | E2E | done | TC-OWM-014 | `completed` |

### Step 3 — Live drift check

Tag scheme pinned in `automation-and-cicd`: `@INC-{nnn}` markers in
feature/spec files.

- `@INC-001` → 2 scenarios present in the suite ✅
- `@INC-006` → tag **not found** in any feature/spec file ⚠️ Drift
  (tracker says `completed` but the artifact was deleted or renamed
  without updating the tracker)
- `@INC-002` → tag absent (matches tracker — TC `not-started`)

### Step 4 — Coverage report

(Renders the format defined in `references/coverage-report-format.md`
— summary table, detail table, gaps table.)

### Step 5 — Next actions

> "3 gaps found. Would you like to:
>
> 1. **INC-002** — `not-started` TC for an in-scope INC →
>    `/execute-quality-increments` (next ready TC: TC-OWM-006)
> 2. **INC-004** — INC `in-progress`, no planned TC →
>    `/execute-increments` to ship the application code first, then
>    `/create-quality-package` to extend the test design
> 3. **INC-006** — drift: tracker says `completed` but the marker is
>    missing in the suite → `/detect-knowledge-base-drift` to confirm
>    the source-of-truth gap, then either restore the artifact via
>    `/execute-quality-increments` or update the tracker via
>    `/create-quality-package`
> 4. Exit"

**User:** Start on INC-002

**Skill:**

> "Invoking `/execute-quality-increments` with TC-OWM-006 as the
> next-ready increment..."

Appends a `Coverage audit` row to `change-tracker.md` recording the
audit and its 3 findings.

