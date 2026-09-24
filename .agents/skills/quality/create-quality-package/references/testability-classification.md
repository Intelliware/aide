# Testability classification — reference

The canonical classifier + decision table + output schema for Step 0b
(`steps/00b-testability-check.md`). This reference is consulted *during*
Step 0b; the step file is the procedural spine and this reference is the
substance the agent applies.

The check is **generic**: it asks one question — *does the in-scope work
present any automatable observable surface?* — and routes the run
accordingly. It replaces team-specific layer vocabularies (e.g. L1–L4
test pyramids) with a stack-agnostic classification.

---

## 1. Why this gate exists

The quality stage assumes there is *something to test*. Most increments
satisfy that trivially, but a real minority do not — pure
infrastructure-as-code changes, build-file pins, internal refactors with
no behaviour change, documentation updates, telemetry plumbing that only
emits to a dashboard the team does not yet assert against. Authoring a
test plan for those increments produces speculative test cases that fail
review or get silently dropped during execution.

Running the classification *before* test-design elicitation lets the
agent:

- Confirm there is an automatable observable surface, **or**
- Route the increment to manual / monitored / waived coverage with the
  rationale recorded, **or**
- Halt and escalate to the upstream stage when the scope itself is
  unclear enough that "what to test" cannot be answered.

The classification's output is a small, auditable section of the
quality package — never silent.

---

## 2. The classifier

For each `INC-XXX` in the implementation package (and each top-level
acceptance criterion when ACs do not map 1:1 to increments), answer the
five questions in order. Stop at the first **No** that forces a
non-`automatable` classification.

| # | Question | If yes | If no |
|---|---|---|---|
| 1 | Does the increment change observable behaviour of the system (functional output, side-effect, persisted state, emitted event, rendered UI, returned response)? | Continue | → `not-automatable` (candidate: waived / manual / monitored) |
| 2 | Is the observable surface reachable from a test boundary the project already runs or can stand up (unit / contract / integration / API / UI / event-stream / log / metric)? | Continue | → `not-automatable` unless a new boundary is in scope (escalate) |
| 3 | Is the expected behaviour **deterministic** for a defined input (or deterministically bounded — latency, error budget, statistical assertion)? | Continue | → `partially-automatable` (monitored / sampled) |
| 4 | Can the inputs / preconditions be produced in a test environment without prohibited side effects (no production-data exposure, no irreversible external call, no compliance violation)? | Continue | → `partially-automatable` (manual or environment-restricted) |
| 5 | Is the scope description specific enough that a competent tester could write the first concrete case unaided? | → `automatable` | → `unclear` (escalate to upstream stage) |

The five questions are deliberately stack-agnostic. They never ask
"is there a Playwright spec for this?" — they ask "is there an
observable surface, is it reachable, is it deterministic, is it
producible, is it specified?".

---

## 3. Classification outcomes

| Classification | Meaning | Effect on the rest of the quality stage |
|---|---|---|
| `automatable` | Surface exists, is reachable, deterministic, producible, and specified. | Proceed through Steps 1–3 normally. Test design (Step 2) produces concrete cases for this scope. |
| `partially-automatable` | Some checks land in CI, others must be manual or monitored (e.g. visual regression on a brand colour, latency under load, sampled production observation). | Proceed, but record the manual / monitored portion explicitly in the `test-design` block. Release-gate metrics in `automation-and-cicd` must reflect the split. |
| `not-automatable — waived` | Genuinely no behaviour change visible to a test (e.g. refactor with byte-identical output, dependency-pin update that the build itself proves). | Skip test-design for this scope. Record the waiver in the classification output with a one-line justification. `audit-quality-coverage` later treats the scope as "covered by waiver", not "missing". |
| `not-automatable — manual` | Behaviour exists but is impractical to automate this release (e.g. cross-tenant disaster-recovery drill, regulator visual sign-off). | Step 2 records the manual procedure under the `test-design` block's "Manual checks" subsection; Step 3's release gate documents how the manual sign-off is captured. |
| `not-automatable — monitored` | Behaviour is observable only in production (e.g. a SLO whose only assertion is a production-metric burn-rate). | Step 3 documents the monitoring assertion in `quality-metrics-and-reporting`; no pre-release test case is authored. |
| `unclear` | The classifier failed Q5 (specification gap) or Q2 (no reachable boundary and no plan to add one). | **Halt the quality stage.** Route back to `create-implementation-package` or `create-design-package` with the specific question(s) that cannot be answered. Do not proceed to Step 1 with `unclear` rows. |

A scope may receive only one classification. A multi-part scope is
split (one classification per part) before proceeding.

---

## 4. Output schema

Step 0b writes the result to the `quality/testability-classification`
block. The block is a single table whose rows are the classified
scopes, one row per increment / AC group:

| Field | Description |
|---|---|
| Scope ID | `INC-XXX`, `AC-XX`, or `<feature>:<sub-scope>` for unmapped groups |
| Classification | One of the six outcomes in §3 |
| Observable surface | One-line description (e.g. "POST /wires → 201 + persisted row + Kafka event") or `none` |
| Boundary | The test boundary chosen for the case (unit / contract / integration / API / UI / event / log / metric / manual / monitored / n/a) |
| Constraints | Compliance / data / environmental constraints lifted from §12.2 / §12.2a or design NFRs |
| Rationale | 1–2 sentences. Required for every `not-automatable-*` and `partially-automatable` row; optional for `automatable` |
| Action | The downstream action (`design test case` / `record manual procedure` / `record monitoring assertion` / `waive` / `escalate`) |

The block is consumed by Step 2 (test-design — only rows with `Action =
design test case` or `record manual procedure` produce cases) and Step
3 (quality-engineering — `record monitoring assertion` rows feed
`quality-metrics-and-reporting`).

---

## 5. Decision rules — common edge cases

- **Pure refactor with regression coverage already present.** Classify
  as `automatable`; the action is "rely on existing regression suite
  — no new case". Record the asserting suite by name in the rationale.
- **Telemetry-only change.** If the team has assertions against the
  emitted signal in any environment, `automatable` at the relevant
  boundary (log / metric); if not, `not-automatable — monitored` with
  the dashboard URL or alert name in the rationale.
- **Build / dependency upgrade.** Usually `not-automatable — waived`
  with rationale "build proves compilation; suite proves regression";
  becomes `automatable` if the upgrade touches an externally observable
  contract (HTTP client behaviour change, log format change).
- **Cross-cutting infrastructure change with no functional delta.**
  `not-automatable — waived` is appropriate **only** when the change
  has no behaviour-observable surface in any environment. If it does
  (e.g. mTLS turned on means TLS handshake errors are now observable),
  classify per Q1–Q4 against that new surface.
- **Compliance / regulatory work.** Often `partially-automatable` —
  automatable parts go to CI; sign-off goes to manual evidence
  capture. Do **not** waive compliance work.
- **Spike / exploratory work.** `unclear` — escalate. Spikes do not
  belong in the same quality package as production-bound increments.

---

## 6. Anti-patterns

- **Defaulting to `automatable` because everything else feels like
  paperwork.** The waiver row *is* the paperwork. Skipping the
  classification produces speculative cases that fail review later.
- **Using `not-automatable — waived` for "we will add the test next
  sprint".** That is a deferred-coverage decision, not a waiver. Add
  the scope to the next iteration's package or capture it as an
  accepted-coverage-exception in the traceability matrix; do not waive.
- **Treating layered-pyramid vocabulary (L1 / L2 / L3 / L4) as the
  classification.** Those are *boundary* labels, not testability
  outcomes. The classification is "is this testable?" — the layer is
  filled in only when the answer is `automatable`.
- **Hiding `unclear` rows as `partially-automatable` to avoid halting.**
  The halt is the value. Routing `unclear` back to upstream stages
  catches the specification gap while it is still cheap.

---

## 7. Provenance

This classifier generalises the testability-check pattern originally
prototyped in an earlier team-internal QE skill set ("Phase 0c") where it
was expressed in client-specific L1–L4 layer vocabulary. Here it is restated
stack-agnostically: the five-question classifier replaces the layer
table; the six outcomes replace the layer-by-layer routing; the
`unclear` outcome's escalation rule is preserved verbatim.

