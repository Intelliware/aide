# Section 14: Testing Strategy

> Populated by `testability-design.md`. This is Section 14 of the solution design package.

## For Brownfield Projects

### 1. Existing Test Infrastructure

<!-- Current test frameworks, organization, mocking patterns, coverage levels, CI pipeline test stages -->

### 2. Test Boundaries

#### Component-to-Test-Type Mapping

| Component | Unit | Integration | E2E | Contract | Mock Boundary |
|-----------|------|-----------|-----|----------|--------------|
| | | | | | |

#### Test Pyramid

<!-- Test pyramid for the feature: relative proportion of unit, integration, E2E tests -->

### 3. Test Data Strategy

| Test Type | Data Approach | Creation Pattern | Sensitive Data Handling | Cleanup |
|----------|--------------|-----------------|----------------------|---------|
| | synthetic / fixtures / factory / anonymized | | | |

### 4. Contract Testing

<!-- If applicable: contract boundaries, testing approach, tooling -->

| Contract Boundary | Consumer | Provider | Tool | Approach |
|------------------|----------|----------|------|----------|
| | | | | |

### 5. Performance Testing

| Target | Test Scenario | Load Profile | Infrastructure | When to Run |
|--------|-------------|-------------|---------------|------------|
| | | | | |

### 6. Security Testing

| Coverage Area | Testing Approach | Automation | CI Integration |
|--------------|-----------------|-----------|---------------|
| | | | |

### 7. Test Infrastructure Changes

<!-- What needs to be added or modified to support the testing strategy -->

| Change | Type | Purpose | Priority |
|--------|------|---------|----------|
| | new / modified | | |

### 8. Coverage Targets and Quality Gates

| Test Type | Coverage Target | CI/CD Gate | Gate Criteria |
|----------|----------------|-----------|--------------|
| | | | |

### 9. AI Development Test Considerations

<!-- Regression patterns, verification loop, regression test discipline for AI-assisted development -->

### 10. Requirements Traceability

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| | test boundary / coverage / performance / security | | |

## For Greenfield Projects

Same structure, omitting Section 1 (Existing Test Infrastructure).
