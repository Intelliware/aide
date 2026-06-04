---
slug: source-and-scope
sequence: 1
depends-on-prior: false
---

# Step 1 — Source Documentation & QE Scope

## Purpose

Establish the high-level QE scope by optionally ingesting source documentation and eliciting which categories of tests the user wants to produce.

## Procedure

### 1a. Source documentation

Ask the user:

> Would you like to provide any high-level source documentation to help get a sense of what we're after?

- **If yes:** Ask for the project path to the document(s). Attempt to guess the path based on `project.toml` paths and the project's `source-docs/` or equivalent directory. Offer the guessed path and let the user confirm or enter a new path. Read and internalize the provided documents.
- **If no:** Ask the user to enter some high-level detail about what they're looking to build out in the QE package. Record their free-text response.

### 1b. Test type selection

Ask the user:

> What kinds of QE tests are you looking to produce?

Present a selection list (the user may select multiple and/or add their own). Infer sensible defaults from the prior packages:

- [ ] End-to-End (E2E) Tests
- [ ] Integration Tests
- [ ] Path Integration Tests
- [ ] Contract Tests
- [ ] Performance / Load Tests
- [ ] Chaos / Resilience Tests
- [ ] Security Tests
- [ ] Smoke Tests
- [ ] Regression Tests
- [ ] Other (please specify as comma-separated list): ___

Record the user's selections. These become the test categories that drive the rest of the workflow.

## Acknowledgement checkpoint

Summarize what was gathered:
- Source documents loaded (or free-text summary)
- Selected test types

Ask: "Does this capture the QE scope correctly?" Wait for confirmation before proceeding.

## Next

Proceed to `steps/02-topology-and-boundaries.md`.
