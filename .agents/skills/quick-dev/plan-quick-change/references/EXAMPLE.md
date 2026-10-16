# Example — plan-quick-change

## Trigger phrase

> "Plan the quick change `notification-mark-as-read`."

## What the skill did

1. Loaded the agreed spec from `.framework-output/requirements/notification-mark-as-read/`; confirmed no markers remain.
2. Orientation: read `src/components/NotificationCard.tsx`,
   `src/components/__tests__/NotificationCard.test.tsx`,
   `src/api/endpoints.ts`. Identified the existing PATCH client utility,
   the React Testing Library + Vitest test setup, and the toast utility
   used elsewhere for failed mutations.
3. Escape-hatch check: 2 production files + 1 test file, single component,
   no new endpoint. **Stays in quick-dev.**
4. Decomposed 4 ACs into one increment — they are tightly coupled and a
   single TDD pass is the natural unit.
5. Populated the reduced increment shape.
6. Clarity gate: passed. No markers, all sections, file paths specified,
   AC mappings (AC1–AC4) present, no speculative work.
7. Wrote `.framework-output/implementation/notification-mark-as-read/notification-mark-as-read-quick-dev-plan.md` —
   the planning-stage directory, resolved from `project.toml`.
8. User confirmed.

## What it produced

```markdown
# Notification "Mark as Read" — Quick-Dev Plan

## INC-001 — Add per-card mark-as-read action
**AC mapping:** AC1, AC2, AC3, AC4

### Goal
Each unread notification card exposes a "Mark as read" button that calls
the existing PATCH client and removes itself on success; read cards never
show the button; failures surface a toast and leave state unchanged.

### Plan
1. `src/components/NotificationCard.tsx`
   - Conditionally render a `<button>` when `notification.read === false`.
   - On click, call `patchNotification(id, { read: true })` from
     `src/api/endpoints.ts`.
   - On success, set local `read = true` so the button unmounts.
   - On failure, call `useToast().error('Could not mark as read.')`.
2. `src/components/__tests__/NotificationCard.test.tsx`
   - Add tests covering AC1 (click → PATCH), AC2 (success → button gone),
     AC3 (initial read → no button), AC4 (failure → toast + state intact).

### AI Gate
- `pnpm test src/components/__tests__/NotificationCard.test.tsx` → all
  4 new tests pass; existing tests remain green.
- `pnpm lint` → no new warnings.

### Human Gate
- Visual check on the notification list — button placement and disappearance
  feel correct on the dev environment.

### Success Criteria
- [ ] AC1 test passes against the real PATCH client (mocked)
- [ ] AC2 test passes (button removed after success)
- [ ] AC3 test passes (no button when initial read=true)
- [ ] AC4 test passes (toast shown, state unchanged on failure)
- [ ] No lint regressions
```

## Hand-off

> "Plan ready and approved. Recommend invoking `execute-quick-change`:
>
> *'Execute the quick change `notification-mark-as-read`.'*"
