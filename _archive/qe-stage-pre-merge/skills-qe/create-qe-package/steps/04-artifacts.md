---
slug: artifacts
sequence: 4
depends-on-prior: true
---

# Step 4 — Expected Artifacts

## Purpose

Establish the list of concrete artifacts the QE package will generate when executed.

## Procedure

Attempt to guess the artifact list from the technologies chosen in Step 3 and the test types from Step 1. Present an example:

> Based on your technology choices, here's a suggested list of artifacts the QE package will produce:

Example (adapt to the user's stack):
- `.feature` files (Gherkin scenarios)
- `.java` / `.ts` / `.py` step definition files
- Runner/configuration classes
- `.csv` files for export to test management tools (e.g., Jira)
- Test data fixtures / factories
- Configuration files (e.g., `application-qe.yml`, `cucumber.properties`)
- Report templates / output specs

Then ask:

> Please review this list. What artifacts do you expect to be produced? Add or remove as needed.

Record the finalized artifact inventory.

## Acknowledgement checkpoint

Present the finalized artifact list. Ask: "Is this artifact list complete?" Wait for confirmation.

## Next

Proceed to `steps/05-test-harness.md`.
