---
slug: acceptance-criteria
title: "Acceptance Criteria"
applies-to: [greenfield-requirements-package, brownfield-enhancement-spec, quick-dev-spec]
requires-decision-from: [product-owner, qa]
optional: false
order-hint: 13
---

# 13. Acceptance Criteria

> **Part of:** [Project Name] — Requirements Package
>
> **Purpose:** Define how we verify that requirements have been met. These become test cases during implementation.

---

## 13.1 Feature Verification

<!-- For each major feature area, define acceptance criteria using Given/When/Then or checklist format. -->

### [Feature Area, e.g., Practitioner Management]

| AC# | Criterion | Related FR |
|-----|----------|-----------|
| AC1.1 | [e.g., Given a Resource Manager is logged in, when they create a practitioner profile with all mandatory fields, then the profile is saved and visible in the practitioner list] | FR1.1.1 |
| AC1.2 | [e.g., Given a practitioner profile exists, when any mandatory field is empty on save, then the system displays a validation error and prevents saving] | FR1.1.2 |
| | | |

## 13.2 Test Scenarios

<!-- High-level test scenarios organized by category. -->

### Happy Path Scenarios

| # | Scenario | Expected Result | Related FRs |
|---|---------|----------------|-------------|
| 1 | [e.g., Create allocation with all valid data] | [e.g., Allocation created in Provisional status] | [FR3.1.1] |
| | | | |

### Error & Edge Case Scenarios

| # | Scenario | Expected Result | Related FRs |
|---|---------|----------------|-------------|
| 1 | [e.g., Create allocation with end date before start date] | [e.g., Validation error displayed, allocation not created] | [FR3.1.2] |
| | | | |
