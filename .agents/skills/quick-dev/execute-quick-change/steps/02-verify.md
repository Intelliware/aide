---
slug: verify
sequence: 2
depends-on-prior: true
---

# Step 2 — 3-dimension verification

After every increment, verify along three orthogonal dimensions in the same
turn. Each dimension answers a different question; missing any one of them
hides a different class of regression.

## Completeness — "is everything done?"

| Check | Pass condition |
|---|---|
| Every AC the increment claims to cover has a passing test | All AC mappings green |
| All tasks in the increment plan are checked off | No half-finished task |
| No `[NEEDS CLARIFICATION]` markers remain in the diff or commit messages | Markers resolved |
| No TODOs introduced in the diff (unless explicit and AC-traced) | Clean diff |

## Correctness — "does it actually work?"

| Check | Pass condition |
|---|---|
| The full affected test suite is green | Tests pass — re-run in this turn |
| Lint is green | No new warnings introduced |
| The increment's AI Gate commands pass with the expected output | AI Gate evidence captured fresh |
| Manual smoke (when applicable) passes the Human Gate | Visual / UX check confirmed |

## Coherence — "does it fit the codebase?"

| Check | Pass condition |
|---|---|
| New code follows the patterns surfaced in orientation | Convention match — no alien graft |
| Naming aligns with surrounding files | Consistency with neighbors |
| Standards compliance — language / framework / common | No unresolved standard violations |
| Cross-cutting concerns are reused, not re-implemented | Toast utility, error handler, logger reused per existing pattern |

## Same-turn rule

Verification evidence (test output, lint output, AI Gate output) is captured
in the same conversation turn that claims success. "I ran them earlier and
they passed" is not acceptable. If too much time has passed, re-run.

## Failure handling

Any failed check stops the increment. Do not patch — invoke systematic
debugging (4-phase RCA), find the root cause, fix, then re-verify all three
dimensions. Patching without RCA is rejected.

## Verification log

Append a one-line verification entry to the increment's section in
`<feature-folder>/quick-dev-package/CHANGE-TRACKER.md` so the audit shows the
increment was verified in three dimensions, not just unit-tested.
