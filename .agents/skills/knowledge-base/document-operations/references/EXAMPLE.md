# document-operations — Worked Example

## Scenario

Continuing the ACME Checkout example. Solution context and AI rules
are captured. The SRE lead joins the session to author operations
docs.

## Inputs (state on disk before running)

```
acme-kb/
├── shared/
│   ├── solution-context/{00..50}.md      # 6 leaves
│   ├── ai-rules/project-context.md       # canonical + 1 override
│   └── operations/                        # empty
└── ARCHITECTURE.md, components/, graph.json
```

`30-constraints-and-compliance.md` declares:
- 99.95 % monthly availability SLA
- P95 checkout-API latency budget 800 ms
- Card data retention: zero — never stored
- Audit-log retention: 7 years

`50-ownership-and-raci.md` declares the `checkout-oncall` rotation
covers Orders + Billing.

CI/CD inventory found by Step 01:
- `.github/workflows/{deploy.yml, test.yml}` in all three repos
- `helm/` charts in `api-orders` and `api-billing`
- `terraform/` with `prod`, `staging`, `dev` workspaces (separate
  AWS accounts)
- `web-portal` deploys via Cloudflare Pages

## Step-by-step trace

### Step 01 — Read CI/CD + RE deployment

Auto-derived first-pass facts:
- Cloud: AWS (api-orders, api-billing) + Cloudflare (web-portal).
- Regions: `us-east-1` primary, `us-west-2` warm standby.
- Orchestrator: EKS (Helm-deployed).
- Database: RDS Postgres 15 (api-billing); DynamoDB (api-orders).
- Cache: ElastiCache Redis (api-orders).
- Secrets: AWS Secrets Manager.
- Observability: Datadog (already noted in solution context vendor
  catalog).
- Deploy: GitHub Actions → Helm via OIDC; auto-promote to staging on
  main, manual prod gate.

Drafts the four leaves with auto-fillable sections populated.

### Step 02 — Elicit gaps

The SRE lead provides:

**Topology gaps**
- Region failover is manual (Route53 health-check based but with
  human approval).
- Auto-scaling: HPA on api-orders (CPU 70 %), fixed-3 on api-billing
  (cost-controlled).
- Release cadence: prod deploy 2× weekly (Tue/Thu).

**Environments & secrets gaps**
- Env matrix: dev / staging / prod, each in its own AWS account
  (`ACME-dev`, `ACME-staging`, `ACME-prod`).
- Config layering: `Parameter Store` for non-secret config; Secrets
  Manager for secrets.
- Rotation cadence: 90 days for DB credentials (automated via Lambda),
  365 days for service-account API keys (manual; runbook below).
- Owner per env: Platform team (dev/staging), Platform + SRE (prod).

**SLOs & monitoring gaps**
- Availability SLO: 99.95 % monthly (mirrors the SLA — measured via
  Datadog synthetic checks).
- Latency SLO: P95 < 800 ms checkout submit (measured), P95 < 200 ms
  read endpoints (aspirational — no histogram yet, marked TODO).
- Error-budget policy: 21 m of unavailability per month; if exceeded,
  feature freeze on `checkout-oncall` repos until budget resets.
- Alert routing: PagerDuty `acme-checkout-prod` service.

**Runbooks gaps**
The lead names six runbooks worth writing now:
1. Failover: us-east-1 → us-west-2.
2. Stripe outage: switch to Adyen fallback PSP.
3. Database failover (RDS).
4. Cache flush + warm-up.
5. Manual prod deploy + rollback.
6. Service-account key rotation (the manual one).

In session, three runbooks (1, 2, 5) are drafted in detail. The other
three are stubbed with TODO + responsible engineer.

**On-call gaps**
- Primary rotation: `checkout-oncall` (1-week shifts, weekly handover
  meeting Mon 09:00).
- Escalation tier 2: SRE on-call.
- Tier 3: Platform engineering manager.
- Paging tool: PagerDuty.

### Step 03 — Emit

Writes:

```
<KB>/shared/operations/
├── 00-deployment-topology.md            # 87 lines
├── 10-environments-and-secrets.md       # 64 lines
├── 20-slos-and-monitoring.md            # 71 lines (1 aspirational SLO marked)
└── 30-runbooks-and-oncall.md            # 156 lines
                                          # ← exceeds 80-line/runbook
                                          #   warn: SPLIT into per-runbook files
```

Validation result: warn on `30-runbooks-and-oncall.md` size. Step 03
prompts the SRE lead and they accept the split: each runbook moves to
its own file under `<KB>/shared/operations/runbooks/<runbook-slug>.md`,
and `30-runbooks-and-oncall.md` becomes the index + on-call rotation
detail.

Cross-links written:
- Each leaf's § "Cross-links" section points to relevant
  `solution-context` and `ai-rules` entries.
- `<KB>/CLAUDE.md` updated with operations entries.

## Hand-off

"Operations captured (4 index leaves + 6 runbooks). Bootstrap of the
solution-context layer is complete; ready for
`create-requirements-package` to scope the first feature."
