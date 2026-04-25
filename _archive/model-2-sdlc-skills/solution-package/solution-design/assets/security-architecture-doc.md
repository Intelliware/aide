# Section 9: Security Design

> Populated by `security-architecture.md`. This is Section 9 of the solution design package.

## For Brownfield Projects

### 1. Existing Security Posture

<!-- Current auth flow, authorization model, encryption, secrets management, trust boundaries -->

### 2. Security Decisions from Upstream Sections

<!-- Consolidated view of security decisions already made in Sections 4, 5, 6, 7, 8 -->

| Section | Security Decision | Gap / Concern |
|---------|------------------|--------------|
| | | |

### 3. Authentication Flow

<!-- End-to-end auth flow: unchanged, extended, or new -->

### 4. Authorization Changes

#### New Permissions and Roles

| Permission / Role | Description | Granted To | Status |
|------------------|-------------|-----------|--------|
| | | | new / modified |

#### Permission Matrix

<!-- Operations vs roles matrix -->

#### Ownership-Based Access Rules

<!-- Rules where access depends on data ownership -->

### 5. Data Classification

| Entity / Field | Sensitivity Level | Justification |
|---------------|------------------|--------------|
| | Public / Internal / Confidential / Restricted | |

### 6. Data Protection

<!-- Encryption at rest and in transit, PII handling, data retention, data minimization -->

### 7. Trust Boundaries

<!-- Existing and new trust boundaries with validation at each -->

### 8. Secrets Management

| Secret | Purpose | Storage | Rotation Policy | Access |
|--------|---------|---------|----------------|--------|
| | | | | |

### 9. Security Audit Logging

| Event | Log Level | Fields | Sensitive Data Exclusions |
|-------|----------|--------|-------------------------|
| | | | |

### 10. Threat Surface Assessment

| Threat / Attack Vector | Likelihood | Impact | Mitigation | Residual Risk |
|-----------------------|-----------|--------|-----------|--------------|
| | | | | |

### 11. Compliance Impact

<!-- If applicable: regulatory implications (GDPR, HIPAA, PCI-DSS, SOC2) and design responses -->

### 12. Requirements Traceability

| Security Decision | Change Type | Requirement ID | Requirement Summary |
|------------------|------------|---------------|---------------------|
| | | | |

## For Greenfield Projects

Same structure, with Section 1 covering the designed security architecture and all items as new.
