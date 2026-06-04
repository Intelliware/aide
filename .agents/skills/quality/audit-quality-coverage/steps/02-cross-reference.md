---
slug: cross-reference
sequence: 2
depends-on-prior: true
---

# Step 2 — Cross-reference

## Purpose

Build the master coverage list by joining four inputs from Step 1:

1. `increment-status.md` — per-INC dev status (source of truth for
   which increments exist)
2. Per-INC files (`INC-XXX.md`) — per-INC scope / level / NFR mapping
3. `traceability.md` — per-INC claimed test coverage (which tests
   prove which INC)
4. `test-case-status.md` — per-TC implementation status (only when the
   TC-XXX flow is enabled)

## Procedure

### 2a. Build the master INC list

For each INC in `increment-status.md`:

| Field | Source |
|---|---|
| INC ID | `increment-status.md` |
| Name | `increment-status.md` |
| Dev status | `increment-status.md` (`not-started` / `in-progress` / `completed` / `blocked` — apply the team's status vocabulary override if configured) |
| Test level | per-INC file's mapping to the test-design block's pyramid (e.g. `unit (dev-owned)`, `integration`, `contract`, `E2E`, `NFR`) |
| Coverage required? | derived: `no` if the test level is dev-owned-only (e.g. unit-only with no automated black-box gate); `yes` otherwise |

If a per-INC file is missing, record an anomaly and treat coverage as
`unknown` for that INC.

### 2b. Join with the traceability matrix

For each INC, look up the rows in `traceability.md` whose `INC` column
matches:

| Field | Source |
|---|---|
| Coverage claimed | `yes` if at least one matrix row maps a test to this INC; `no` otherwise; `n/a` if Coverage required = `no` |
| Test IDs | the matrix's `Test ID` column for matching rows |
| Test types | the matrix's `Test type / level` column |

If the matrix contains an **explicit accepted exception** for the INC
(per the matrix's coverage-exceptions section), record `Coverage
claimed = exception` with the accepted reason.

### 2c. Join with test-case status tracker (when applicable)

If the team uses the TC-XXX flow:

For each Test ID in `test-case-status.md`:

| Field | Source |
|---|---|
| TC status | `test-case-status.md` (`not-started` / `in-progress` / `completed` / `blocked`) |
| TC type | `test-case-status.md` (`scaffolding` / `test-case`) |

A test-case TC's status feeds back into the INC's verdict in Step 4
(the matrix said the INC is covered by TC-XXX, but TC-XXX is
`not-started` — the coverage is *planned*, not *implemented*).

When the TC-XXX flow is not in use, skip this join; coverage is
read solely from the matrix and verified directly against the test
suite in Step 3.

### 2d. Compute per-INC verdict (provisional)

For each INC, compute a provisional verdict using the table below.
Step 3 may upgrade or downgrade it after the live drift check.

| Dev status | Coverage required | Coverage claimed | TC status | Provisional verdict |
|---|---|---|---|---|
| completed | yes | yes | completed (all matching TCs) | ✅ Fully covered (pending drift check) |
| completed | yes | yes | in-progress | 🔄 In-progress |
| completed | yes | yes | not-started | ⚠️ Ready but not started |
| completed | yes | exception | — | ➖ Accepted exception |
| completed | yes | no | — | ⚠️ Ready but not started (no coverage planned) |
| completed | no | n/a | — | ➖ Not applicable (dev-owned-only) |
| in-progress / not-started / blocked | yes | — | — | 🔴 Blocked on dev |
| unknown (per-INC file missing) | unknown | unknown | unknown | ⚠️ Anomaly — INC file not found |

When the TC-XXX flow is not used, collapse the `TC status` column —
treat coverage as `completed` whenever the matrix maps tests to the
INC. Step 3 will then verify those tests actually exist in the suite.

### 2e. Summarise

Present a one-line summary to the user:

> Cross-reference complete: <N> INCs total —
> <A> provisionally ✅, <B> 🔄, <C> ⚠️ ready, <D> 🔴 blocked,
> <E> ➖ n/a, <F> ⚠️ anomalies.
> Proceeding to KB drift check…

## Next

Proceed to `steps/03-kb-tag-verification.md`.

