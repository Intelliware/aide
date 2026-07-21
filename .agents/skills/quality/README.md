# Quality stage

The quality stage consolidates how a feature is proven correct into a single
gated artifact — the **Quality Package** — and threads quality activity through
the rest of the lifecycle.

## Skills

| Skill | Purpose |
|---|---|
| `create-quality-package` | Assemble the Quality Package: quality strategy (QA analysis), test design traced to acceptance criteria (software testing), and the quality-engineering plan (automation, CI gates, test data). Hands off to `review-quality-package`. |
| `review-quality-package` | Independently invocable gate. Runs six sequential reviews (coverage, test-design quality, quality-engineering, metrics/gates, traceability, readiness) ending in a GO / CONDITIONAL GO / NO-GO verdict before execution. |
| `execute-quality-increments` | Optional path after a GO quality package when the team has opted into the per-test-case (TC-XXX) increment flow. Executes one test-case increment at a time, producing the actual test artifacts and updating the test-case-status tracker. |
| `audit-quality-coverage` | Independently invocable, read-only audit of test coverage against the implementation package. Detects INCs with no tests, coverage drift, and pre-release gaps. |
| `review-test-failures` | Independently invocable triage walk-through of a failed test run. Classifies each failure (script / app defect / environment-data / flaky), proposes a remediation routed to a named framework skill, and produces a structured summary. |

## Position in the flow

```
... create-implementation-package -> review-implementation-package -> create-quality-package -> review-quality-package -> execute-increments (+ execute-quality-increments) -> ...
```

The package sits after the planning gate and before execution so test design can
trace to requirements acceptance criteria, design NFRs, and the `INC-XXX`
increments at once. `execute-increments` then implements the design with TDD;
`execute-quality-increments` is its TC-XXX-flavoured sibling for teams that
have opted into per-test-case increments. The release gates defined here
become the feature's exit criteria.

`audit-quality-coverage` and `review-test-failures` are invokable at any time
and do not sit on the main flow.

## The three disciplines

The package folds three distinct disciplines into one artifact (full definitions
and AI-augmentation tables in
`create-quality-package/references/quality-disciplines.md`):

- **Software testing** — detect product defects and verify behavior. Drives the
  Test Design and Test Approach sections.
- **Quality assurance analysis** — prevent defects by improving process and
  controls. Drives the Quality Strategy, release gates, and metrics.
- **Quality engineering** — make quality continuous and scalable. Drives
  Automation/CI-CD, Test Data and Environments, and Non-Functional Quality.

## Quality across the lifecycle

Quality is not confined to this stage. The full per-stage touchpoint map lives in
`create-quality-package/references/quality-in-the-lifecycle.md`. In brief:

- **requirements** — acceptance criteria testability (via `review-requirements-package`)
- **design** — testing strategy + verifiable NFRs + security posture (via `create-design-package`, `review-design-package`)
- **planning** — per-increment AI/Human verification gates (via `create-implementation-package`)
- **quality** — consolidated strategy, test design, automation, metrics, release gates (this stage)
- **execution** — TDD implements the design; defects via `manage-bugs` (via `execute-increments`); failed runs triaged via `review-test-failures`
- **knowledge-base** — coverage and quality signals recorded on ship (via `update-knowledge-base`); periodic gap checks via `audit-quality-coverage`

## Test-suite intelligence via the knowledge base

The framework deliberately does **not** ship a "scan the test repo for reusable
assets" skill. That capability already exists, in a more general and durable
form, through the knowledge base.

When a project includes a test-automation repository, the standard reverse-
engineering and KB skills produce the same intelligence a bespoke code-scanner
would, and keep it current as the suite evolves:

- `reverse-engineer-test-suite` — documents an existing test repo (Part A for
  maintainers; Part B as a consumer catalog of reusable step definitions,
  page objects, fixtures, hooks, helpers, tags, runners).
- `reverse-engineer-api` / `-web-app` / `-mobile-app` / `-ui-framework` /
  `-api-framework` / `-mobile-framework` — surface the public testable
  contracts the suite is exercising.
- `build-knowledge-base` — folds those Part A/B outputs into the KB's
  `components/` tree with a graph entry per reusable asset.
- `navigate-knowledge-base` — the entry point any quality-stage skill uses to
  pull only the minimal set of reusable components relevant to the current
  scope, before authoring a new test case or step definition.
- `update-knowledge-base` / `detect-knowledge-base-drift` /
  `verify-knowledge-base-coverage` — keep the test-suite intelligence honest
  over time.

How the quality-stage skills consume this:

- `create-quality-package` — its **reuse-analysis** reference instructs the
  agent to invoke `navigate-knowledge-base` first, with the scope of the new
  feature, and to author new test cases against existing reusable components
  wherever possible (rather than re-inventing helpers, fixtures, or page
  objects).
- `execute-quality-increments` — its AI-Gate cross-check applies the same
  reuse-analysis pass to each TC-XXX increment before implementing new
  artifacts, biasing toward composition over duplication.

The net effect is the same as a dedicated "test-suite scanner" (don't
duplicate, reuse what's already proven) without a stage-local skill that would
inevitably diverge from the KB. If a project does not yet have a knowledge
base, the reuse-analysis step degrades gracefully to a manual walkthrough —
see `create-quality-package/references/reuse-analysis.md`.

## No hard external-tool dependencies

By design, **no skill in this stage hard-depends on any external CLI or
service** — not the Atlassian CLI, not the SharePoint CLI, not Jira, not
Confluence, not any vendor test platform. Those integrations are no longer in
core at all: they ship as a separate **tool add-on** (the `jira-*` /
`confluence-*` / `document-convert` skills), installed and wired per
`_docs/pluggable-tool-addons-proposal.md`. Quality skills never assume they are
present.

Quality-stage skills must remain runnable on a vanilla checkout with no
external credentials configured. If a future contribution introduces a hard
dependency from a quality skill onto an external tool, treat it as a
framework bug and route it back through `customize-framework` instead.

## Quick-dev

For the lightweight quick-dev flow this stage is bypassed (like the requirements
and design review gates are). Quality folds inline into the quick-dev spec and
the 3-dimension verification in `execute-quick-change`.

### Where each quality concern lives in quick-dev

| Concern (full pipeline) | Quick-dev carrier |
|---|---|
| Test design traced to ACs | Per-AC **"How will this be proven?"** note authored in `document-quick-change` step 5 |
| Test framework / runner / coverage floor / lint rules / prohibited test patterns | §12.2a **quality constraints** subsection of the spec |
| TDD enforcement | `execute-quick-change` Iron Rule 1 (no production code without a failing test first) |
| Coverage + correctness verification | `execute-quick-change` 3-dimension verification (Completeness / Correctness / Coherence) |
| Adversarial / readiness review | `execute-quick-change` 4-lens adversarial PR review (blind / spec compliance / standards / codebase integration) |
| Release gate | `execute-quick-change` **Completion Confirmation Gate** (user confirms the change works in their environment) |
| Defects | `manage-bugs` (anytime; same skill, lighter usage) |
| KB / coverage signals | `update-knowledge-base --scope=catalog-only` at the end of `execute-quick-change` |

### When quick-dev is no longer enough

Escalate from quick-dev to the full quality stage when **any** of these is true:

- The change introduces a new data model, new API endpoint, new external integration, or architectural decision.
- Multi-environment automation strategy is required (more than the developer's local + one shared env).
- A formal coverage matrix, release-gate metrics, or compliance evidence must exist as artifacts.
- Cross-team coordination on test data, environments, or release windows is needed.
- The risk profile is high (regulated workflow, irreversible change, large blast radius).
- The proof of an AC cannot be expressed as a one-line verification note.

In those cases, halt the quick-dev flow and route to `create-quality-package`
(and, upstream, to the full `create-requirements-package` → `create-design-package`
→ `create-implementation-package` pipeline). See
`create-quality-package/references/quality-in-the-lifecycle.md` for the full
per-stage carrier map including the quick-dev row.

