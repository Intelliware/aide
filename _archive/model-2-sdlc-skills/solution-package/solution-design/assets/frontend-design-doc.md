# Section 4: Frontend Design

> Populated by `frontend-design.md`. This is Section 4 of the solution design package.

## For Brownfield Projects

### 1. Platform and Framework

<!-- Platform(s) and framework(s) this feature targets -->

### 2. Existing Patterns

<!-- Frontend patterns extracted from the codebase: component structure, state management, routing, styling, testing -->

### 3. Conventions

| Convention Area | Observed Pattern | Recommended Practice | Aligned? | Deviation |
|----------------|-----------------|---------------------|----------|-----------|
| | | | | |

### 4. UI Architecture

#### Page / View Inventory

| Page / View | User Journey | Primary API Calls | Permissions | Platform |
|------------|-------------|-------------------|-------------|----------|
| | | | | |

#### Component Hierarchy

<!-- Per page: component tree showing existing vs new, component types (page, feature, UI, layout) -->

### 5. Component Contracts

| Component | Type | Props / Inputs | Events / Outputs | State | Notes |
|-----------|------|---------------|-----------------|-------|-------|
| | | | | | |

### 6. State Management Strategy

| State | Type | Location | Tool | Cache / Invalidation |
|-------|------|----------|------|---------------------|
| | server / form / URL / global | | | |

#### Optimistic Updates

| Mutation | Optimistic? | Rollback Behavior |
|----------|------------|-------------------|
| | | |

### 7. Routing

| Route | Component | Auth | Layout | Data Loading | Platform |
|-------|-----------|------|--------|-------------|----------|
| | | | | | |

### 8. API Consumption Map

| Page / View | API Endpoint | Method | Hook / Function | Cache Key | Error Handling |
|------------|-------------|--------|-----------------|-----------|---------------|
| | | | | | |

### 9. Forms and Validation

| Form | Fields | Validation Schema | Submission API | On Success | On Error |
|------|--------|-------------------|---------------|-----------|----------|
| | | | | | |

### 10. Error Handling and UX Feedback

#### UX State Matrix

| Page / View | Loading | Success | Empty | Error (4xx) | Error (5xx) | Offline |
|------------|---------|---------|-------|-------------|-------------|---------|
| | | | | | | |

#### Error Boundary Placement

<!-- Route-level and widget-level boundaries with fallback UI -->

#### Toast / Notification Patterns

<!-- Success, error, info patterns -->

### 11. Performance Strategy

#### Code Splitting

| Split Point | Type | Trigger |
|------------|------|---------|
| | | |

#### Memoization Decisions

| Component / Computation | Memoize? | Reason |
|------------------------|----------|--------|
| | | |

#### Virtualization

<!-- Lists with > 50 items that need virtualization -->

#### Rendering Strategy

| Page | Strategy | Reason |
|------|----------|--------|
| | CSR / SSR / SSG / ISR | |

### 12. Accessibility Implementation

| Requirement | Design Decision |
|------------|----------------|
| | |

### 13. Responsive Design

#### Breakpoints

| Breakpoint | Min Width | Layout Changes |
|-----------|-----------|---------------|
| | | |

#### Component Adaptations

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| | | | |

### 14. Frontend Security

<!-- Token storage, XSS prevention, CSRF protection, CSP -->

### 15. Internationalization

<!-- If applicable: string management, date/number formatting, RTL, text expansion -->

### 16. Requirements Traceability

| Component | Type | Change Type | Requirement ID | Requirement Summary |
|-----------|------|------------|---------------|---------------------|
| | | | | |

## For Greenfield Projects

Same structure, omitting Section 2 (Existing Patterns).
