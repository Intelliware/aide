# verify-knowledge-base-coverage — Worked Example

## Scenario A — `--mode=baseline` immediately after build

`build-knowledge-base` has just finished for ACME's three-repo project. It
emitted 14 components and reported 0 orphans during step 8. The build skill
now hands off to `verify-knowledge-base-coverage --mode=baseline` for the
authoritative deeper sweep.

### Inputs

```
--mode: baseline
project.toml: <ACME standard>
<knowledge_base_path>: ../acme-kb
```

### Step trace

#### Step 1 — Enumerate artifacts

Per repo:

- `api-orders` (`role=api`):
  - Read OpenAPI spec at `api-orders/openapi.json`.
  - 23 endpoints enumerated (representative_path = controller file).
- `api-billing` (`role=api`):
  - Read OpenAPI at `api-billing/openapi.yaml`.
  - 24 endpoints enumerated.
- `web-portal` (`role=ui`):
  - Walk `web-portal/src/routes/` (Vite + React Router).
  - 12 routes enumerated.

Total: 47 endpoints + 12 routes = 59 artifacts.

#### Step 2 — Compute coverage gaps

For each artifact, match against components' `paths:`:

- 59 / 59 endpoints+routes match at least one component → 0 orphans.

For each component, walk `paths:`:

- 14 / 14 components have paths that resolve to existing files → 0 stales.

#### Step 3 — Staleness warnings

All 14 components were just stamped today by the build → 0 warnings.

#### Step 4 — Emit report

```json
{
  "mode": "baseline",
  "totals": {"components": 14, "endpoints_enumerated": 47, "routes_enumerated": 12},
  "orphans": [],
  "stales": [],
  "warnings": [],
  "gap_ratio": 0.0,
  "rebuild_recommendation": "narrow-fix"
}
```

Markdown:

```
Coverage Report — 2026-04-25T15:04:18Z
Mode: baseline
Gap ratio: 0.0%
Recommendation: narrow-fix (no gaps to fix)
Orphans (0). Stales (0). Warnings (0).
```

Build flow continues — `start-project` resumes routing to the next stage.

---

## Scenario B — `--mode=delta` six months later, after multiple ships

ACME runs the cron weekly. Six months in, the KB has 22 components (8
added incrementally via `update-knowledge-base`). This week's cron fires.

### Inputs

```
--mode: delta
--prior-report: ../acme-kb/.coverage-reports/2026-10-13T00-00-00Z.json
```

### Step trace

#### Step 1 — Determine advanced repos

Read prior report's `repo_heads`. Compare to current HEADs:

- `api-orders`: prior `8f3c1a2…`, current `9d2c5e0…` → **advanced**.
- `api-billing`: prior `c44e88f…`, current `c44e88f…` → unchanged.
- `web-portal`: prior `2d8a5f1…`, current `4f7b3a8…` → **advanced**.

Re-enumerate artifacts only for `api-orders` and `web-portal`.

#### Step 2 — Compute gaps for advanced repos + cross-repo components

`api-orders` enumeration:
- 26 endpoints (3 added since prior).
- 25 / 26 endpoints match a component → **1 orphan**:
  `POST /orders/{id}/refund-eligibility-check`. The endpoint exists in
  `src/features/refunds/eligibility-controller.ts` but no component
  lists this path.

`web-portal` enumeration:
- 14 routes (2 added since prior).
- 14 / 14 routes match → 0 orphans.

For cross-repo components (graph.json shows 3 components with cross-repo
`paths:`), re-check their paths regardless of which repo advanced.
Result: 3 / 3 still resolve.

For all components in `api-orders` and `web-portal` (from the advanced
set): walk paths.
- 1 component (`legacy-promo-engine` in api-orders) has paths
  `src/promos/v1/**` that no longer resolve — code was deleted in a
  cleanup commit. **1 stale.**

For components in unchanged repos: skip path-resolution (their paths
were valid in the prior report and the source hasn't moved).

#### Step 3 — Staleness warnings

Walk all 22 components. For each, compute the wall-clock age of
`last_verified_against_commit`:

- 18 components: <30 days → no warning.
- 3 components: 30–60 days → warning.
- 1 component (`internal-tooling-cli`, never touched after build): 180
  days → warning.

4 warnings emitted.

#### Step 4 — Emit report

```json
{
  "mode": "delta",
  "totals": {"components": 22, "endpoints_enumerated": 50, "routes_enumerated": 14},
  "orphans": [
    {
      "kind": "endpoint",
      "identifier": "POST /orders/{id}/refund-eligibility-check",
      "repo": "api-orders",
      "representative_path": "src/features/refunds/eligibility-controller.ts",
      "recommended_action": "Author component refund-eligibility-check or extend billing-refund-processor.paths."
    }
  ],
  "stales": [
    {
      "component_id": "legacy-promo-engine",
      "unresolved_paths": ["src/promos/v1/**"],
      "recommended_action": "Code was deleted in a cleanup commit. Either delete this component or update paths to the new promos engine."
    }
  ],
  "warnings": [
    {"component_id": "fraud-screening", "last_verified_against_commit": "a91b3c8…", "age_days": 47},
    {"component_id": "shipping-label-issuer", "last_verified_against_commit": "f1c4d2e…", "age_days": 36},
    {"component_id": "subscription-renewal", "last_verified_against_commit": "9b3e7d0…", "age_days": 33},
    {"component_id": "internal-tooling-cli", "last_verified_against_commit": "8f3c1a2…", "age_days": 180}
  ],
  "gap_ratio": 0.03,
  "rebuild_recommendation": "narrow-fix"
}
```

Markdown report surfaces this; cron action: open a tracking issue with
the report attached.

The on-call engineer reviews:

- Orphan: file an `update-knowledge-base` ticket for the recent
  refund-eligibility feature.
- Stale: file a ticket to delete the legacy-promo-engine component (the
  code was retired).
- Warnings: schedule a `detect-knowledge-base-drift --mode=full` next
  week to catch up; especially `internal-tooling-cli` which is
  half-a-year stale.

---

## Counter-example — rebuild recommendation

Same project but six MORE months of incremental drift. Cron fires:

- 30 components, 9 orphans, 4 stales = 13 / 60 artifacts in gaps.
- gap_ratio = 0.22 → between 0.05 and 0.30 → recommendation `triage`.

Or with even more drift: 20 orphans + 8 stales out of 70 = 0.40 → recommendation
`rebuild`. The on-call engineer queues a
`build-knowledge-base --overwrite` and a fresh
`verify-knowledge-base-coverage --mode=baseline`.
