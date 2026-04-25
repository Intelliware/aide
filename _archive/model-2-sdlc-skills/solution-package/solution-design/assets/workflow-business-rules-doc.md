# Section 10: Workflow / Business Rules Design

> Populated by `workflow-business-rules-design.md`. This is Section 10 of the solution design package.

## For Brownfield Projects

### 1. Existing Workflow Patterns

<!-- How the current system handles state machines, workflows, and rule enforcement -->

### 2. State Machines

<!-- State machine for each stateful entity -->

#### [Entity Name] State Machine

**States:**

| State | Description | Terminal? |
|-------|-------------|----------|
| | | |

**Transitions:**

| From | To | Trigger | Guard | Action | Requirement |
|------|----|---------|-------|--------|-------------|
| | | | | | |

**State Diagram:**

```
[state] --trigger/guard--> [state]
```

### 3. Multi-Step Workflows

<!-- If applicable: workflow definitions with steps, actors, timeouts, escalations -->

| Step | Actor | Action | Timeout | Escalation | Requirement |
|------|-------|--------|---------|-----------|-------------|
| | | | | | |

### 4. Business Rule Enforcement Map

| Rule ID | Rule Description | Category | Enforcement Point | Error Behavior |
|---------|-----------------|----------|-------------------|---------------|
| | | validation / calculation / eligibility / state / policy / integration | | |

### 5. Automation Triggers

| Trigger | Type | Condition | Action | Requirement |
|---------|------|-----------|--------|-------------|
| | scheduled / event / threshold | | | |

### 6. Rule Conflict Resolution

<!-- Precedence rules and resolution strategy when multiple rules could fire on the same input -->

### 7. Requirements Traceability

| Design Element | Type | Requirement ID | Requirement Summary |
|---------------|------|---------------|---------------------|
| | state / transition / rule / automation | | |

## For Greenfield Projects

Same structure, omitting Section 1 (Existing Workflow Patterns).
