# Example — execute-quick-change

## Trigger phrase

> "Execute the quick change in `docs/notification-mark-as-read/quick-dev-package/`."

## What the skill did

1. Loaded the plan (`INC-001 — Add per-card mark-as-read action`) and the spec.
2. **Phase Education + Game Plan + Go/No-Go** — restated the increment,
   listed the 5 TDD tasks (one per AC plus refactor), waited for user "go".
3. Created branch `feature/inc-001-mark-as-read`.
4. **TDD per AC** — RED test for AC1, ran tests (RED expected), wrote
   minimal handler, ran tests (GREEN), refactored. Repeated for AC2, AC3, AC4.
5. **3-dimension verification** — Completeness (all 4 ACs covered),
   Correctness (`pnpm test` green; `pnpm lint` clean), Coherence
   (`useToast` follows existing pattern; PATCH client used per orientation).
6. **Adversarial review (4 lens)** — blind review found a UX edge case
   (button focus state during in-flight PATCH); spec compliance pass;
   standards compliance flagged missing `aria-busy` on the button while
   the PATCH is in-flight; codebase integration found an inconsistency
   with how other mutations indicate progress (sibling components show a
   spinner, not just disabled state).
7. **Fix cycle** — added `aria-busy`, added an inline spinner consistent
   with siblings, re-ran tests + review. All re-checks green.
8. Presented commit summary, user approved.
9. Atomic commits:
   - `feat(notifications): add mark-as-read button (AC1, AC2)`
   - `feat(notifications): hide button on already-read cards (AC3)`
   - `feat(notifications): toast on patch failure (AC4)`
   - `chore(notifications): aria-busy + spinner during in-flight patch`
10. Opened PR with description generated from spec + plan + diff.
11. Logged the implementation via `track-change`.
12. Handed off to `update-knowledge-base --scope=catalog-only` so the
    `web-portal` component frontmatter's `last_verified_against_commit` is
    refreshed.

## What it produced

- 4 atomic commits on `feature/inc-001-mark-as-read`
- Open PR `#412` with an auto-generated description that lists ACs,
  references Linear NOT-142, and links the spec/plan files in the repo
- A `CHANGE-TRACKER.md` row recording the implementation
- A KB catalog update queued for the `web-portal` component

## Hand-off

> "Quick change complete and PR open at `#412`. The KB catalog hand-off was
> invoked (`update-knowledge-base --scope=catalog-only`). Next: review the
> PR with your team and merge once approved."
