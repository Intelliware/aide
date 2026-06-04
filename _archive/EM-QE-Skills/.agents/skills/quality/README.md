# Quality stage

The quality stage consolidates how a feature is proven correct into a single
gated artifact — the **Quality Package** — and threads quality activity through
the rest of the lifecycle.

## Skills

| Skill | Purpose |
|---|---|
| `create-quality-package` | Assemble the Quality Package: quality strategy (QA analysis), test design traced to acceptance criteria (software testing), and the quality-engineering plan (automation, CI gates, test data). Hands off to `review-quality-package`. |
| `review-quality-package` | Independently invocable gate. Runs six sequential reviews (coverage, test-design quality, quality-engineering, metrics/gates, traceability, readiness) ending in a GO / CONDITIONAL GO / NO-GO verdict before execution. |

## Position in the flow

```
... create-implementation-package -> review-implementation-package -> create-quality-package -> review-quality-package -> execute-increments -> ...
```

The package sits after the planning gate and before execution so test design can
trace to requirements acceptance criteria, design NFRs, and the `INC-XXX`
increments at once. `execute-increments` then implements the test design with
TDD, and the release gates defined here become the feature's exit criteria.

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
- **execution** — TDD implements the design; defects via `manage-bugs` (via `execute-increments`)
- **knowledge-base** — coverage and quality signals recorded on ship (via `update-knowledge-base`)

## Quick-dev

For the lightweight quick-dev flow this stage is bypassed (like the requirements
and design review gates are). Quality folds inline into the quick-dev spec and
the 3-dimension verification in `execute-quick-change`.
