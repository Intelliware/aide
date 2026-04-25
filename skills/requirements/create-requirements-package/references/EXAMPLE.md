# Example — create-requirements-package

A worked example showing the brownfield-elaborate path. Paths and outputs are real; the user prose is paraphrased.

## Trigger

User: *"We need to add partial refunds to the orders system. Can you build a requirements package for this?"*

The orchestrator detects: trigger phrase "build a requirements package", `project.toml` `default_flow = "brownfield"`, `[[project.repos]]` includes `code = "api-orders"` and `code = "api-billing"`, and a knowledge base exists at `../knowledge-base`. Active composition resolves to `templates/compositions/brownfield-enhancement-spec.yaml` because the user mentioned "add… to the orders system" — a brownfield enhancement signal.

The orchestrator then asks: *"This sounds like a brownfield enhancement to your existing orders system. Would you like the lean enhancement-spec composition (single doc, ~16 blocks) or the full brownfield-requirements-package composition (every block)?"* The user chooses the full package — composition rebinds to `greenfield-requirements-package.yaml` (still applicable as the structural blueprint) with discovery enabled because of brownfield mode.

## What the skill did

1. **Step 0 (anchor):** Captured the change description — "Refund Operations Specialist needs to process partial refunds against existing orders so chargeback rate falls under 1% monthly." Wrote it to `docs/refund-processing/requirements-package/discovery/change-description.md`.

2. **Step 1 (`steps/01-discovery.md`):** Ran the six-step discovery sequence (codebase-discovery → existing-artifact-review → process-mapping → user-journey-mapping → requirements-elicitation → current-capability-synthesis). Used `knowledge-base/navigate-knowledge-base` to pull the `order-checkout-flow` and `refund-eligibility` components from the KB. Produced six discovery artifacts ending in `current-capability-baseline.md`.

3. **Relevance gate:** Reviewed all 21 blocks declared by the composition. Marked three as N/A: `requirements/views-dashboards` (no UI in this enhancement), `requirements/permissions-access-control` (covered by an existing role with no changes), `requirements/glossary` (project glossary is sufficient). Wrote the determinations to `completeness-tracker.md`.

4. **Step 3 (`steps/03-analysis.md`):** Ran the eleven-step analysis sequence. Produced `stakeholder-map.md`, `change-scope.md`, `dependency-map.md`, `impact-analysis.md`, `constraint-register.md`, `gap-analysis.md`, `assumption-log.md`, `decision-log.md`, `risk-register.md`. Risk register flagged three high risks (PCI scope creep, refund clawback timing, partner-API rate limits).

5. **Step 4 (`steps/04-writing.md`):** Initialized `change-tracker.md` at v0.1. Filled the 18 active blocks (21 minus 3 N/A) using the 7-Step per-file Workflow per section. FR numbering used `FR.REFUND.PARTIAL.*` family. Each section traced back to the analysis artifacts (constraint refs, risk refs).

6. **Assembly and handoff:** Assembled into `.framework-output/requirements/refund-processing-requirements.md` per the composition block ordering. Handoff message: *"Requirements draft is complete (v0.1). Ready to invoke `review-requirements-package`?"*

## What it produced

```
.framework-output/requirements/refund-processing-requirements.md     # assembled package (~210KB)
docs/refund-processing/requirements-package/
├── discovery/
│   ├── change-description.md
│   ├── codebase-discovery.md
│   ├── existing-artifact-review.md
│   ├── process-map.md
│   ├── user-journey-map.md
│   ├── requirements-elicitation.md
│   └── current-capability-baseline.md
├── analysis/
│   ├── stakeholder-map.md
│   ├── change-scope.md
│   ├── dependency-map.md
│   ├── impact-analysis.md
│   ├── constraint-register.md
│   ├── gap-analysis.md
│   ├── assumption-log.md
│   ├── decision-log.md
│   └── risk-register.md
└── requirements/
    ├── 01-executive-summary.md
    ├── 02-business-context.md
    ├── ... (18 active section files)
    ├── 14-acceptance-criteria.md
    ├── change-tracker.md
    ├── completeness-tracker.md
    └── requirements-package.md           # alias to the assembled package
```

The handoff to `review-requirements-package` was clean — every block existed (or was explicitly N/A in the tracker), the change tracker was at v0.1 with 187 `Added` rows, and traceability matrix was populated end-to-end. Review took two passes (first found a measurability gap in NFR-PERF.REFUND.LATENCY); after fix, readiness verdict was APPROVED.
