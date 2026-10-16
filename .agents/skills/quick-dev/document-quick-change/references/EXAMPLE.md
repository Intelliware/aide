# Example — document-quick-change

## Trigger phrase

> "Quick change: add a 'mark as read' button to the notification cards. Linear ticket NOT-142 has the UX notes."

## What the skill did

1. No `features.toml`, so inferred the name `notification-mark-as-read`.
   No existing quick-dev files for it (legacy-tree check clean). Confirmed
   the name with the user.
2. Read Linear ticket NOT-142 — captured UX notes (button label "Mark as
   read", behavior "removes button after success", placement "top-right of
   each card") and one open question ("what about already-read notifications?").
3. Classified as **small** rigor (one component, 2–3 ACs, no architectural
   decisions). Confirmed with user.
4. Drafted the five blocks against `quick-dev-spec.yaml` — including §12.2a Solution Constraints ("no new toast libraries — reuse `useToast`"; "all retries via `useRetry`") so the executor has them through any Solution Pivot.
5. Inserted one `[NEEDS CLARIFICATION]` marker for the existing-notifications
   question. User answered: hide the button on already-read notifications.
6. Removed the marker, finalized the spec.
7. Resolved the requirements-stage directory from `project.toml` (legacy
   mode, default `[project.paths]`) — no question asked — and wrote
   `.framework-output/requirements/notification-mark-as-read/notification-mark-as-read-quick-dev-spec.md`.
8. Initialized `CHANGE-TRACKER.md` beside the spec.
9. User confirmed the spec is accurate.

## What it produced

```markdown
---
feature_id: notification-mark-as-read
package_version: 0.1.0-doc.0
created: 2026-04-25
---

# Notification "Mark as Read" — Quick-Dev Spec

## 1. Overview
A small UI change adding a per-card "Mark as Read" action that calls the
existing PATCH `/api/notifications/:id` endpoint. Affects the notification
card component and its tests; no API or schema changes.

## 2. Business Context
Users cannot tell which notifications they have already seen, leading to
repeated review of identical notifications. Linear ticket NOT-142.

## 3. Functional Requirements
- FR1: The notification card shows a "Mark as read" button when the card's
  `read` field is `false`.
- FR2: Clicking "Mark as read" sends `PATCH /api/notifications/:id` with
  body `{ read: true }`.
- FR3: After a successful PATCH, the button is removed from the card.
- FR4: Cards whose `read` field is already `true` do not show the button.

### Delta
- ADDED: per-card "Mark as read" action and its handler.
- MODIFIED: notification card render path.
- REMOVED: none.

## 4. Acceptance Criteria
- AC1: Clicking the button on an unread card sends `PATCH /api/notifications/:id`
  with `{ read: true }`.
- AC2: After a 200 response, the button disappears from the card.
- AC3: Cards rendered with `read: true` never show the button.
- AC4: A failed PATCH leaves the card unchanged and surfaces a toast.

## 5. Glossary
| Term | Definition |
|---|---|
| Notification card | The repeated UI block in `NotificationList` rendering a single notification. |

## 6. Change Log
| # | Date | Change |
|---|---|---|
| 0 | 2026-04-25 | Initial quick-dev spec authored. |
```

## Hand-off

> "Spec on disk and confirmed. Recommend invoking `plan-quick-change` next:
>
> *'Plan the quick change `notification-mark-as-read`.'*"
