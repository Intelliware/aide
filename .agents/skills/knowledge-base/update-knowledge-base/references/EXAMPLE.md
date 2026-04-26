# update-knowledge-base — Worked Example

## Scenario

ACME has just shipped feature `ACME-1247: Add fraud screening before
payment authorization`. The execute-increments flow produced 3 increments
(INC-101 through INC-103). The merge SHA on `api-orders` is
`a91b3c8…d4e5f12`; on `api-billing` is `c44e88f…9b2d1c3`. No changes to
`web-portal` or other repos.

Diff summary (truncated):

```
api-orders/src/features/checkout/checkout-service.ts        | 78 ++++--
api-orders/src/features/checkout/fraud-screen-client.ts     | 134 +++++++ (NEW)
api-orders/src/shared/dto/fraud-screen-request.ts           |  42 +++ (NEW)
api-orders/package.json                                     |   3 +-       (added: @acme/fraud-vendor-sdk)
api-billing/src/Authorization/CheckoutAuthorizationHandler.cs | 23 +--
docs/part-b/checkout-consumer-guide.md                       | 51 ++--
docs/part-b/payment-authorization-guide.md                   |  8 +-
```

## Inputs

```
--scope: full
feature_id: ACME-1247
merge_shas: {"api-orders": "a91b3c8d4e5f12...", "api-billing": "c44e88f9b2d1c3..."}
implementation_increments: [INC-101, INC-102, INC-103]
git_diff: <as above>
```

## Step trace

### Step 1 — Classify diff

For each changed file, the skill greps `components/**/*.md` for
frontmatter `paths:` entries that match (literal or glob):

| File | Matched components |
|---|---|
| `api-orders/src/features/checkout/checkout-service.ts` | `order-checkout-flow` (paths: `src/features/checkout/**`) |
| `api-orders/src/features/checkout/fraud-screen-client.ts` | `order-checkout-flow` (paths: `src/features/checkout/**`) |
| `api-orders/src/shared/dto/fraud-screen-request.ts` | `order-checkout-flow` (paths: `src/shared/dto/checkout-*.ts` — does NOT match; this is a NEW path that needs to be added) |
| `api-orders/package.json` | (no component owns package.json — flagged for ADR threshold check) |
| `api-billing/src/Authorization/CheckoutAuthorizationHandler.cs` | `order-checkout-flow` (paths: `api-billing:src/Authorization/CheckoutAuthorizationHandler.cs`) |
| `docs/part-b/checkout-consumer-guide.md` | `order-checkout-flow` (source_doc match) |
| `docs/part-b/payment-authorization-guide.md` | `billing-payment-authorization` (source_doc match) |

Affected components:

- `order-checkout-flow` (api-orders)
- `billing-payment-authorization` (api-billing)

ADR-threshold flag raised: new external dependency
`@acme/fraud-vendor-sdk` added.

Diff scope check: 2 of 14 components affected = 14% → well below 50%, proceed.

### Step 2 — Update components

For `order-checkout-flow`:

- Re-read RE Part B (now updated by the feature) →
  `docs/part-b/checkout-consumer-guide.md`.
- Re-derive triggers: existing `[place order, submit cart, checkout, capture
  payment, authorize payment, order confirmation, cart submit]`. Add
  `[fraud screen, screen for fraud]` from new section. Triggers changed
  → flag for capability index refresh.
- Re-derive `paths`: existing `[src/features/checkout/**, …,
  api-billing:src/Authorization/CheckoutAuthorizationHandler.cs]`. Add
  `src/shared/dto/fraud-screen-request.ts`. Order-checkout-flow now
  also depends on a new component `fraud-screening` (created if it does
  not already exist).
- Skill checks: does `components/api-orders/fraud-screening.md` exist?
  No. Create it.
  - `component_id: fraud-screening`
  - `repo: api-orders`
  - `type: api-feature`
  - `description: Use when a checkout submission must be screened for fraud risk before payment authorization.`
  - `triggers: [fraud check, fraud screen, screen for fraud, risk decision]`
  - `paths: [src/features/checkout/fraud-screen-client.ts, src/shared/dto/fraud-screen-request.ts]`
  - `depends_on: [@acme/fraud-vendor-sdk]` (external — listed by name as a non-component dep, not a graph edge).
  - `consumed_by: [order-checkout-flow]`
  - `data_entities: [FraudScreenRequest, FraudScreenDecision]`
  - `last_verified_against_commit: a91b3c8...`
  - `last_feature_id: ACME-1247`
  - `source_doc: docs/part-b/checkout-consumer-guide.md`
  - `verification_signal: openapi-diff`
- Update `order-checkout-flow.depends_on` to include `fraud-screening`.
- Bump `last_verified_against_commit` to `a91b3c8…`.
- Set `last_feature_id` to `ACME-1247`.
- Body § 4 (Recent Activity) rewritten with feature link and change
  summary.

For `billing-payment-authorization`:

- Diff is small (23 lines, one file).
- Triggers unchanged.
- depends_on unchanged.
- Bump `last_verified_against_commit` to `c44e88f9b2d1c3...`.
- Set `last_feature_id` to `ACME-1247`.
- Body § 4 rewritten.

### Step 3 — Append change-tracker row

Append to `<kb>/change-tracker.md`:

```
| 2026-04-25 | ACME-1247 | order-checkout-flow, billing-payment-authorization, fraud-screening (new) | Add fraud screening between cart submission and payment authorization. Introduces @acme/fraud-vendor-sdk dependency. | mike.moerman@electricmind.com |
```

### Step 4 — Emit ADR (threshold crossed)

New external dependency `@acme/fraud-vendor-sdk` triggers ADR threshold #1.
Allocate next number: existing ADRs go up to 0016 → new ADR is 0017.

Render `templates/blocks/knowledge-base/adr-template.md`:

- File: `<kb>/shared/adrs/ADR-0017-fraud-screening-vendor-selection.md`
- Status: `accepted`
- Date: 2026-04-25
- Deciders: derived from PR reviewers + actor.
- Title: "Fraud screening vendor selection".
- Context: distilled from the increment plans + commit messages.
- Decision: "We will use @acme/fraud-vendor-sdk for synchronous fraud
  screening between cart submission and payment authorization, called
  from `order-checkout-flow` via the new `fraud-screening` component."
- Considered alternatives: derived from increment notes if listed; else
  flagged for human review with placeholder text.
- Affected components: `order-checkout-flow`, `fraud-screening`.

No existing ADR is superseded by this one (skill checks the supersedes
field — empty in this case).

### Step 5 — Update graph.json (incremental)

- Existing nodes: 14. Add 1 node: `fraud-screening`.
- Existing edges:
  - Add edge `{from: order-checkout-flow, to: fraud-screening, kind: calls}`.
- No edges removed.

Write the updated `graph.json` (full file rewrite, but only edges
involving touched components were re-evaluated — others copied verbatim
from the previous version).

### Step 6 — Update ARCHITECTURE.md capability index

`order-checkout-flow.triggers` changed (new trigger phrases), and a new
component `fraud-screening` exists. Refresh § 4 only:

- Before:
  | place order | order-checkout-flow |
- After:
  | place order | order-checkout-flow |
  | screen for fraud | fraud-screening |

Component Catalog (§ 3) is also refreshed for the one new row. Other
sections are not touched.

### Step 7 — Validate

All checks pass. Update report:

```json
{
  "scope": "full",
  "feature_id": "ACME-1247",
  "components_updated": [
    {"id": "order-checkout-flow", "fields_changed": ["triggers", "paths", "depends_on", "last_verified_against_commit", "last_feature_id"], "body_sections_rewritten": ["1", "4"]},
    {"id": "billing-payment-authorization", "fields_changed": ["last_verified_against_commit", "last_feature_id"], "body_sections_rewritten": ["4"]},
    {"id": "fraud-screening", "fields_changed": ["NEW"], "body_sections_rewritten": ["1", "2", "3", "4"]}
  ],
  "edges_added": [{"from": "order-checkout-flow", "to": "fraud-screening", "kind": "calls"}],
  "edges_removed": [],
  "adrs_emitted": ["ADR-0017-fraud-screening-vendor-selection"],
  "change_tracker_row_appended": true,
  "capability_index_refreshed": true,
  "validation": "passed"
}
```

## Counter-example — `--scope=catalog-only`

Same feature, but invoked via `execute-quick-change`:

- Steps 1, 2, 3, 7 only.
- Step 2 updates only `last_feature_id` and `last_verified_against_commit`
  on the two existing components; does NOT detect the missing
  `fraud-screening` component, does NOT add the new path glob, does NOT
  rewrite bodies.
- Step 4 (ADR) skipped — but step 7 emits a warning: "ADR threshold
  crossed (new external dep @acme/fraud-vendor-sdk) but `catalog-only`
  mode skipped ADR emission. Re-run with `--scope=full` if architectural
  impact warrants it."
- Steps 5 and 6 skipped — graph.json and Capability Index are NOT
  refreshed.

This mode is fine for a typo fix, a copy change, a one-line bug patch.
It's wrong for a feature like the one above; the warning in step 7 nudges
the caller toward the right tool.
