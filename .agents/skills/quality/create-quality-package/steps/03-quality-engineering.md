# Step 3 — Quality engineering, assembly, and handoff

Author the quality-engineering plan, the defect-management approach, and the
metrics, then assemble the package and hand off.

Produce these blocks:

1. **`quality/test-data-and-environments`** — test data strategy (synthetic vs
   masked, never production secrets/PAN), how data is provisioned and refreshed,
   and the environments each test level runs in.
2. **`quality/automation-and-cicd`** — the automation framework and runners with
   **pinned versions** (exactly as the design stage pins the production stack),
   the CI/CD quality gates and where they run (per-PR, nightly), and coverage
   thresholds. Tie each gate back to a release gate from Step 1.
3. **`quality/nonfunctional-quality`** — how performance, security,
   accessibility, and reliability are validated, traced to the design's
   technical NFRs and security design.
4. **`quality/defect-management`** — the severity model and the triage flow;
   defects are logged and triaged via `manage-bugs`, not inline.
5. **`quality/quality-metrics-and-reporting`** — the KPIs tracked (coverage,
   escaped-defect rate, gate pass rate, flaky-test rate) and where they are
   reported.

Then:

- **Assemble** `quality-package.md` by resolving
  `templates/compositions/greenfield-quality-package.yaml` against the drafted
  blocks. Run a final cross-reference pass: every release gate maps to a CI gate;
  every test level has automation or an accepted manual exception; the
  traceability matrix has no unaccounted acceptance criteria or increments.
- **Update** the change tracker with the authored/modified sections.
- **Hand off** by name to `review-quality-package`, summarizing what was
  produced and asking the user to confirm readiness for review.

Do not write code or create tests here — that is `execute-increments`. This step
produces the plan that execution implements.
