# Failure Categories — reference

This file is the **generic, framework-agnostic** taxonomy used by
`review-test-failures` when no team override is present. The team's
project-specific taxonomy lives in
`templates/blocks/quality/failure-categories.md` (which teams can
shadow with `templates/blocks/quality/_user/failure-categories.md`
per the four-layer config rules).

A category gives the triage agent three things:

1. A **name** the chat summary table can show.
2. A **signature** (recognisable patterns in error messages, stack
   traces, screenshots, or log lines) that helps the agent
   classify the failure.
3. A **routing target** — which framework skill remediates this
   category. Routing is the whole point of the taxonomy.

## Top-level disposition

Every failure resolves to exactly one of four dispositions. Categories
slot under one of these:

| Disposition | Meaning | Default routing target |
|---|---|---|
| **Script issue** | The test artifact is wrong (locator, fixture, assertion, timing, setup) | `execute-quality-increments` (TC flow) or `execute-increments` (inline tests) |
| **Application defect** | Production code is wrong; the test correctly detected a real bug | `manage-bugs` |
| **Environment / data** | Infrastructure or test data is wrong; the application + test are both fine in isolation | Recommend environment fix; if recurring, log via `manage-bugs` |
| **Flaky / non-deterministic** | The test passes sometimes and fails sometimes for the same code under the same conditions | `execute-quality-increments` (harden the test) — never silently retry |

If a failure does not cleanly resolve to one disposition, present
**multiple** candidate dispositions to the user with the evidence for
each — never silently pick one.

## Generic categories (defaults)

These categories are framework-agnostic. They use no tool-specific
terminology and route to no tool-specific remediation. Teams override
patterns and remediation hints in the
`templates/blocks/quality/failure-categories.md` block.

### Script issues

| Category | Generic signature | Default remediation hint |
|---|---|---|
| Element / selector not found | Error mentions an element, locator, selector, or DOM query that did not resolve; screenshot shows the page rendered but without the target | Update the shared selector / page-object pinned in `automation-and-cicd`. Confirm the change against the KB's component for the target page. |
| Timing / wait issue | Error includes `timeout`, `did not stabilise`, `not visible after Nms`; the target is present in screenshots taken after the failure | Replace fixed `sleep` / arbitrary timeouts with the polling / waiting primitive pinned in `automation-and-cicd`. |
| Assertion mismatch (test-side) | Expected value is wrong (stale fixture, off-by-one, stale snapshot, copy-paste) | Update the fixture / expected value; cross-check against the design package or KB component for the contract. |
| Setup / teardown failure | Failure occurs in `BeforeEach` / `AfterEach` / fixture build / data prep | Fix the fixture or hook; consider whether the setup belongs in a shared scaffolding utility (reuse cross-check). |
| Test-data corruption | Fixture is wrong / has been mutated by a prior test / has expired (e.g. seed user disabled) | Refresh the fixture / regenerate the test data; isolate state per test if mutation is shared. |

### Application defects

| Category | Generic signature | Default remediation hint |
|---|---|---|
| Assertion mismatch (application-side) | Test is correct; application returns a value / status / message that contradicts the design contract; KB shows no recent change to the contract on the test side | Route to `manage-bugs`. Include the contract reference (design block or KB component) in the bug body. |
| Server error (5xx / unhandled) | HTTP 5xx, unhandled exception in the application log, stack trace in the response | Route to `manage-bugs`. Include the application log excerpt. |
| Functional regression | Behaviour worked previously; the same test passed in a prior run; no fixture / selector changed | Route to `manage-bugs`. Cross-reference with the implementation package's last shipped INC to identify the suspect change. |

### Environment / data

| Category | Generic signature | Default remediation hint |
|---|---|---|
| Service unavailable | Connection refused / DNS / TLS / timeouts at network layer; affects every test, not just the failing one | Confirm the environment is up via the documented healthcheck; retry. If recurring, escalate environment ownership. |
| Authentication / authorisation | Token expired / 401 / 403 from the documented test-user account | Refresh credentials per the team's secret-rotation procedure; do not commit credentials to the repo. |
| Shared-state contamination | A prior test left state that breaks this one (e.g. a record with the expected unique key already exists) | Add per-test setup that resets the state, or randomise the unique key. |
| Resource exhaustion | Timeouts / 429s / quota errors that scale with parallelism | Reduce parallelism for the affected suite or add throttling; not a script bug per se. |

### Flaky / non-deterministic

| Category | Generic signature | Default remediation hint |
|---|---|---|
| Intermittent timing | Sometimes passes, sometimes times out; no code change correlates | Replace timing primitives; add explicit synchronisation against application signals (events / DOM mutations) rather than wall-clock. |
| Race condition | Failure depends on order / parallelism / interleaving | Make the test independent; remove shared state; serialise the affected step. |
| Resource leak in test | Failure rate climbs with suite size | Add explicit teardown for the leaking resource. |

## How the skill uses this taxonomy

1. For each failure, the agent attempts to match the error message,
   the failed step, the screenshot context, and the surrounding log
   lines against the signatures above.
2. The match yields one category + one default remediation hint.
3. The agent presents both to the user **with the evidence that drove
   the match** and asks for explicit approval (or alternative).
4. The approved category and remediation feed the final summary
   table; the routing target feeds the action-items section.

The taxonomy is suggestive, not prescriptive. If a failure does not
match cleanly, the agent says so and asks the user; it does not
force-fit.

