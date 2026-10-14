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

## Failed verification — Solution Pivot Gate

Any failed check stops the increment. The default response is **not** to
silently iterate on the existing approach. Instead:

1. **Diagnose to root cause.** Run 4-phase RCA — reproduce, isolate, root
   cause, fix candidate. Do not propose a fix until you can name *why* the
   first attempt failed in terms the user can verify. Symptom-level patches
   are rejected.
2. **Cross-check against solution constraints.** Re-read the spec's §12.2a
   Solution Constraints (or, if the spec is inline, the constraints captured
   during change-scope-discovery). Any candidate fix that would violate a
   solution constraint is discarded before it is proposed — including on a
   pivot. The constraints survive the pivot.
3. **Decide: small-loop fix or pivot?** If the same approach is salvageable
   with a localized adjustment that does **not** change the strategy
   (e.g., off-by-one fix, missing await, wrong selector), perform the fix
   and re-verify all three dimensions in the same turn. This is a
   small-loop fix, not a pivot.
4. **If the approach itself is wrong, halt at the Solution Pivot Gate.**
   Present **one** alternative approach with:
   - the root cause diagnosis (one or two sentences),
   - what changes vs. the current approach (specific files / techniques),
   - why it will resolve the failure,
   - the tradeoffs (perf, footprint, complexity, blast radius),
   - confirmation that the alternative honors every solution constraint.

   If the root cause is that a documented solution constraint itself
   blocks every viable fix, the legitimate pivot proposal is to **ask the
   user to revisit the constraint** — name the constraint, explain why it
   blocks the fix, and let the user decide to relax it or escalate. The
   AI does not unilaterally relax a constraint.

   Then **stop and wait for explicit user approval** before writing any new
   code. Do not propose two alternatives in parallel and do not begin
   implementing while presenting — the gate is a hard halt. If the user
   approves, restart the increment loop from TDD step 1 with the new
   approach. If the user redirects to a different alternative, treat that
   as a new pivot — re-verify it against the solution constraints before
   proceeding.
5. **One pivot per verification event.** The pivot budget resets per
   verification event, not per change. A failed 3-dimension verification
   gets one pivot; a Confirmation Gate report ("doesn't work in my
   environment") is a *separate* verification event and gets its own
   pivot budget. What the rule forbids is pivoting twice on the *same*
   failing event without escalation. If a pivot is approved, executed,
   and the same verification event fails again, that is the user's signal
   to escalate — surface that the change may be larger than quick-dev
   scope and offer the brownfield enhancement spec (authored via
   `create-requirements-package` in brownfield mode) as the escalation
   path. Do not pivot a second time on the same event silently.

The rule the gate enforces: each change of approach is a checkpoint. Silent
iteration through three or four approaches in one turn is the failure mode
this protocol exists to prevent.

## Verification log

Append a one-line verification entry to the increment's section in
`{paths.requirements_package}/<feature-id>/CHANGE-TRACKER.md` so the audit shows the
increment was verified in three dimensions, not just unit-tested. If a
Solution Pivot Gate fired during the increment, append a second line
recording the root cause, the approved alternative, and the user who
approved it — pivots are part of the audit trail.
