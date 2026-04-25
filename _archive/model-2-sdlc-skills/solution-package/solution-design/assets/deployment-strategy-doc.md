# Section 12: Deployment / DevOps

> Populated by `deployment-strategy.md`. This is Section 12 of the solution design package.

## For Brownfield Projects

### 1. Existing Deployment Infrastructure

<!-- Current CI/CD pipeline, deployment topology, container strategy, release approach -->

### 2. Deployment Units

| Unit | Type | Build Artifact | Configuration | Infrastructure Dependencies |
|------|------|---------------|--------------|---------------------------|
| | service / frontend / migration / job | | | |

### 3. Environment Promotion

| Environment | Purpose | Configuration | Secrets Management |
|------------|---------|--------------|-------------------|
| | dev / staging / prod | | |

### 4. CI/CD Pipeline Changes

<!-- New or modified pipeline stages, new jobs, container build changes -->

### 5. Release Strategy

| Factor | Assessment |
|--------|-----------|
| Risk level | |
| Strategy | rolling / canary / blue-green / feature flags |
| Rationale | |

### 6. Deployment Sequence

| Phase | What Deploys | Dependencies | Pre-Conditions | Verification |
|-------|-------------|-------------|---------------|-------------|
| | | | | |

### 7. Migration Coordination

<!-- If applicable: migration classification by phase, breaking migration phased approach -->

| Phase | Migration | Classification | Coexistence |
|-------|-----------|---------------|-------------|
| | | additive / breaking | |

### 8. Rollout and Rollback

#### Rollout Progression

| Stage | Traffic | Duration | Criteria to Advance |
|-------|---------|----------|-------------------|
| | | | |

#### Rollback Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| | | |

#### Rollback Procedure

| Unit | Procedure | Time to Rollback |
|------|-----------|-----------------|
| | | |

### 9. Post-Deployment Verification

<!-- Smoke tests, canary monitoring signals, sign-off checklist -->

### 10. Requirements Traceability

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| | release strategy / sequence / rollback | | |

## For Greenfield Projects

Same structure, omitting Section 1 (Existing Deployment Infrastructure).
