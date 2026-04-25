# detect-knowledge-base-drift — Worked Example

## Scenario

ACME's CI pipeline is configured to invoke this skill in `--mode=gate` on
every PR open / re-push. PR-1042 changes `api-orders/src/features/checkout/`
and `api-billing/src/Authorization/`. The dev forgot to run
`update-knowledge-base` after merging the local feature branch. The CI
runs the gate.

## Inputs

```
--mode: gate
project.toml: <ACME's standard config>
<knowledge_base_path>: ../acme-kb
PR base: main (HEAD = e7c4f3b…)
PR head: feature/fraud-screening (HEAD = a91b3c8d…)
```

## Step trace

### Step 1 — L1 commit-stamp

For each of 14 components, the skill:

1. Looks up `last_verified_against_commit` (LV) and `repo`.
2. Runs `git -C <repo> rev-list <LV>..HEAD --count` → number of new commits.
3. Runs `git -C <repo> diff --name-only <LV> HEAD` → changed file list.
4. Cross-references against `paths:` globs.

Results:

| Component | repo | LV | commits since | paths overlap? | L1 verdict |
|---|---|---|---|---|---|
| order-checkout-flow | api-orders | 8f3c1a2 | 6 | YES (`src/features/checkout/**`) | suspect, severity medium |
| billing-payment-authorization | api-billing | b7e4d9c | 3 | YES (`src/Authorization/CheckoutAuthorizationHandler.cs`) | suspect, severity medium |
| inventory-reservation | api-orders | 8f3c1a2 | 6 | NO | not a suspect, severity low (stamp old, no overlap) |
| (11 others) | various | various | 0–2 | NO | not a suspect |

L1 suspects: 2 (`order-checkout-flow`, `billing-payment-authorization`).

### Step 2 — L2 structural diff

For each L1 suspect:

**`order-checkout-flow`** — `verification_signal: openapi-diff`.
- Run OpenAPI diff: compare `<repo>/openapi.json` at LV vs HEAD.
- Result: 1 new endpoint (`POST /orders/{id}/fraud-screen`), 0 removed,
  0 modified.
- The endpoint isn't mentioned in the component description.
  Severity: medium (additive — but description should mention it).

**`billing-payment-authorization`** — `verification_signal: openapi-diff`.
- Run OpenAPI diff.
- Result: 0 added, 0 removed, 1 modified (request schema gained an
  optional `fraud_screen_token` field).
- Field is optional; no breakage. Severity: low.

L2 hits at threshold ≥ medium: 1 (`order-checkout-flow`).

### Step 3 — Skipped (gate mode)

L3 and L4 are full-mode only.

### Step 4 — Compose report

Rows:

| Component ID | Layer | Severity | Evidence | Recommended action |
|---|---|---|---|---|
| order-checkout-flow | L1 | medium | 6 commits since `8f3c1a2…`, 11 files in `paths:` touched. | `update-knowledge-base --feature-id=<id>` |
| order-checkout-flow | L2 | medium | OpenAPI added `POST /orders/{id}/fraud-screen` not documented in component. | (same as L1 row) |
| billing-payment-authorization | L1 | medium | 3 commits since `b7e4d9c…`, 1 file in `paths:` touched. | `update-knowledge-base --feature-id=<id>` |
| billing-payment-authorization | L2 | low | OpenAPI: 1 optional field added, backward-compatible. | (same as L1 row) |

Gate decision:
- Threshold: medium.
- Hits at ≥ medium: 3 (two L1 medium + one L2 medium).
- Decision: **fail**.
- Exit code: 1.

CI surfaces the report:
```
detect-knowledge-base-drift --mode=gate FAILED.
3 hits at severity ≥ medium.
Run `update-knowledge-base --scope=full --feature-id=<your feature>` and re-run the gate.
Report: ../acme-kb/.drift-reports/2026-04-25T14-23-00Z.md
```

## After the dev runs `update-knowledge-base`

Re-run the gate. L1 now sees `last_verified_against_commit` matches the
new merge SHA on both components — `commits_since = 0`, no suspects.
L2 not run (no L1 suspects). Gate passes; PR proceeds.

## Counter-example — `--mode=full` weekly cron

Same KB, weekly cron triggers `--mode=full`. After the dev's PR merged
and update-knowledge-base ran, the KB is in sync. Cron run trace:

- L1: 0 suspects (every component's stamp is current).
- L2: skipped (no suspects).
- L3: skipped (no L2 hits, no `manual`-marked suspects).
- L4 coverage sweep:
  - Enumerate every endpoint in every repo's OpenAPI: 47 endpoints.
  - Confirm each maps to ≥1 component: 47/47 ✓.
  - Enumerate every exported symbol in framework repos: 8 symbols. 8/8 ✓.
  - Enumerate every route in web-portal: 12 routes. 11/12 ✓ — one new
    route `/fraud-review` exists in the code but no component lists it.
    Likely the dev shipped a UI change without an associated component.
  - Component path resolution: 14/14 components have at least one path
    that resolves to existing source.
  - Result: 1 orphan, 0 stales.

Report:

| Component ID | Layer | Severity | Evidence | Recommended action |
|---|---|---|---|---|
| (orphan) | L4-orphan | medium | Route `/fraud-review` exists in `web-portal/src/routes/fraud-review.tsx` but no component lists it. | Either author a new component or extend `web-portal-fraud-screen` (if it exists) to cover this route. Run `verify-knowledge-base-coverage --mode=delta`. |

Cron writes the report; the on-call engineer sees the orphan and routes
to a follow-up ticket.

## Performance notes

- L1 on 14 components: ~2 seconds (one `git rev-list` + one
  `git diff --name-only` per repo, results cached).
- L2 on 2 suspects: ~5 seconds total (OpenAPI diff is the dominant cost).
- Total gate time: ~10 seconds. Comfortably under the 60-second budget.
- Full-mode L3 + L4 on 14 components: ~3 minutes (1 LLM call per L2-hit
  suspect; L4 enumeration is mostly file IO).
