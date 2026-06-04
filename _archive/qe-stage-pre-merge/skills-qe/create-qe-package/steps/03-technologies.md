---
slug: technologies
sequence: 3
depends-on-prior: true
---

# Step 3 — QE Technologies

## Purpose

Establish the full list of technologies the QE test harness will use.

## Procedure

Attempt to infer the technology list from the design package's technology stack section and the test types selected in Step 1. Present a guessed table as an example:

> Based on the design package and your selected test types, here's a suggested technology list for the QE harness:

| Layer | Technology | Version | Notes |
|---|---|---|---|
| (inferred from prior packages) | | | |

Then ask:

> Please review and adjust this list. Add any technologies specific to your QE needs that aren't captured here. Remove any that don't apply.

The user may add test runners, assertion libraries, mocking frameworks, report generators, data factories, container orchestration tools (e.g., Testcontainers), or anything else relevant to their QE approach.

Record the finalized technology table.

## Acknowledgement checkpoint

Present the finalized technology table. Ask: "Is this technology list complete and correct?" Wait for confirmation.

## Next

Proceed to `steps/04-artifacts.md`.
