# Step 1 — Quality strategy (QA analysis)

Author the strategy that frames the whole package. Read the requirements NFRs,
the design testing-strategy block, and the relevant `project.toml` elicitation
answers (`testing_strategy`, `compliance_regime`, `release_cadence`,
`observability_stack`) before drafting.

Produce these blocks:

1. **`quality/quality-strategy`** — quality goals (what "good" means for this
   feature, stated measurably), the risk-based approach (rank scope by risk;
   heaviest coverage on highest-risk paths), entry and exit criteria, and the
   release gates that the feature must pass. Gates must be measurable and
   binary — e.g. "line coverage >= 80% on changed files", "zero open Critical or
   High defects", "all money-movement acceptance criteria automated".
2. **`quality/test-approach`** — the test levels in scope (unit, integration,
   system/E2E, performance, security, accessibility, as applicable), what each
   level is responsible for proving, and what is explicitly out of scope.

Rules:

- Every gate threshold must be justified by a requirement, NFR, compliance
  obligation, or the project's `testing_strategy` answer. Do not invent
  thresholds with no basis.
- Risk ranking drives effort allocation; record the ranking so the review can
  check that coverage follows risk.
- If the design's testing-strategy block and this strategy disagree, the design
  wins or the design is amended via its change tracker — never silently diverge.

Summarize the drafted strategy back to the user and wait for acknowledgement
before proceeding to Step 2.
