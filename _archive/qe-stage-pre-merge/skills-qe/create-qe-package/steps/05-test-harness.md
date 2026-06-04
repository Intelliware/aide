---
slug: test-harness
sequence: 5
depends-on-prior: true
---

# Step 5 — Test Harness Design

## Purpose

Capture how the QE test harness works end-to-end — this is the user's opportunity to explain in detail how the whole flow operates, what the artifacts are generated for, and how they should be used and executed. Processes vary from team to team; the harness must fit their way of working.

## Procedure

Attempt to infer a harness description from the topology (Step 2), technologies (Step 3), and artifacts (Step 4). Present it as an example:

> Based on what we've gathered so far, here's how I understand the test harness will work:

Render a description covering:
- How tests are structured and organized
- How test data flows through the harness
- How the harness interacts with the system under test
- How results are collected and reported
- How failures are handled and reported

Then ask:

> Please provide additional detail about how this test harness is expected to work. This is your opportunity to explain:
>
> - What are the artifacts being generated for?
> - How should they be used and executed?
> - What team-specific processes or conventions should we follow?
> - Any sequencing, dependencies, or orchestration between test runs?

Record the user's detailed response and merge it with the inferred description.

## Acknowledgement checkpoint

Present the merged harness description. Ask: "Does this capture how the test harness should work?" Wait for confirmation.

## Next

Proceed to `steps/06-tech-stack-and-embedding.md`.
