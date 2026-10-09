# Example — execute-quick-change

## Trigger phrase

> "Execute the quick change `notification-mark-as-read`."

## What the skill did

1. Loaded the plan (`INC-001 — Add per-card mark-as-read action`) from
   `.framework-output/implementation/notification-mark-as-read/` and the spec from `.framework-output/requirements/notification-mark-as-read/`.
2. Loaded the spec's §12.2a Solution Constraints — "no new toast libraries; reuse `useToast`"; "no inline retry — go through `useRetry`".
3. **Education + Game Plan + Go/No-Go** — restated the increment,
   listed the 5 TDD tasks (one per AC plus refactor), waited for user "go".
4. Created branch `feature/inc-001-mark-as-read`.
5. **TDD per AC** — RED test for AC1, ran tests (RED expected), wrote
   minimal handler, ran tests (GREEN), refactored. Repeated for AC2, AC3, AC4.
6. **3-dimension verification** — Completeness (all 4 ACs covered),
   Correctness (`pnpm test` green; `pnpm lint` clean), Coherence
   (`useToast` follows existing pattern; PATCH client used per orientation).
7. **Adversarial review (4 lens)** — blind review found a UX edge case
   (button focus state during in-flight PATCH); spec compliance pass;
   standards compliance flagged missing `aria-busy` on the button while
   the PATCH is in-flight; codebase integration found an inconsistency
   with how other mutations indicate progress (sibling components show a
   spinner, not just disabled state).
8. **Fix cycle** — added `aria-busy`, added an inline spinner consistent
   with siblings, re-ran tests + review. All re-checks green. Cross-checked
   that the spinner uses the existing `<Spinner />` component — no new
   dependency introduced (solution constraint honored).
9. Presented commit summary, user approved the diff.
10. Atomic commits:
    - `feat(notifications): add mark-as-read button (AC1, AC2)`
    - `feat(notifications): hide button on already-read cards (AC3)`
    - `feat(notifications): toast on patch failure (AC4)`
    - `chore(notifications): aria-busy + spinner during in-flight patch`
11. Opened PR with description generated from spec + plan + diff.
12. **Completion Confirmation Gate** — surfaced verification evidence (test
    + lint output, review summary, PR link) and explicitly asked: "The
    PR is at #412. Please confirm the mark-as-read button behaves
    correctly in your browser before this is considered done — I'll wait
    for your confirmation." User replied "confirmed, looks good". Logged
    the confirmation in `CHANGE-TRACKER.md`.
13. Logged the implementation via `track-change`.
14. Handed off to `update-knowledge-base --scope=catalog-only` so the
    `web-portal` component frontmatter's `last_verified_against_commit` is
    refreshed.

### Variant: pivot path

If at step 6 the verification had failed because the PATCH client was
silently swallowing 5xx errors and the toast never surfaced, the skill
would have:

- Run 4-phase RCA — root cause: `apiClient.patch` does not throw on
  non-2xx; current implementation relied on the throw.
- Cross-checked candidate fixes against the solution constraints — adding
  a custom retry helper would violate the "go through `useRetry`" rule, so
  that option was discarded before being proposed.
- Halted at the **Solution Pivot Gate** with a single alternative:
  "Switch the mutation to `useRetry` with an explicit `okStatuses: [200]`
  contract. Tradeoff: one extra hook in the component tree; benefit:
  consistent failure surfacing. Approve to proceed?"
- Waited for explicit user approval before writing any new code.
- On approval, restarted the TDD loop with the new approach and logged
  the pivot in `CHANGE-TRACKER.md`.

## What it produced

- 4 atomic commits on `feature/inc-001-mark-as-read`
- Open PR `#412` with an auto-generated description that lists ACs,
  references Linear NOT-142, and links the spec/plan files in the repo
- A `CHANGE-TRACKER.md` row recording the implementation
- A KB catalog update queued for the `web-portal` component

## Hand-off

> "User confirmed the change works in their browser. PR is at `#412`, the
> KB catalog hand-off was invoked (`update-knowledge-base
> --scope=catalog-only`), and `CHANGE-TRACKER.md` records the
> confirmation. Next: review the PR with your team and merge once
> approved."

The hand-off is only spoken **after** the Completion Confirmation Gate
clears — never on the back of "tests pass and the PR is open".
