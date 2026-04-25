# Section 3: Solution Architecture

> Populated by `system-design.md`. This is Section 3 of the solution design package.
> For brownfield projects, use the delta structure. For greenfield, use the topology structure.

## For Brownfield Projects

### 1. Existing Component Landscape

<!-- The "before" picture from the architecture baseline -->

| Component | Responsibility | Communicates With | Pattern |
|-----------|---------------|-------------------|---------|
| | | | |

### 2. Architectural Delta

#### Unchanged Components

| Component | Rationale for No Change |
|-----------|------------------------|
| | |

#### Modified Components

| Component | What Is Changing | Why This Component | Impact on Existing Responsibilities |
|-----------|-----------------|-------------------|-------------------------------------|
| | | | |

#### New Components

| Component | Responsibility | Boundaries | Why Separate | Deployment Approach |
|-----------|---------------|-----------|-------------|-------------------|
| | | | | |

### 3. Inter-Component Communication

| From | To | Pattern | Protocol | Direction | Notes |
|------|----|---------|----------|-----------|-------|
| | | sync / async | | | existing / modified / new |

### 4. Data Flow Paths

<!-- Traced flows for key operations, labelled as [existing], [modified], [new] -->

### 5. Boundary Decisions

| Decision | Rationale | Alternative Considered | Why Rejected |
|----------|-----------|----------------------|--------------|
| | | | |

### 6. Integration Seams

| Seam | Existing Side Expects | New Side Provides | Risks |
|------|----------------------|-------------------|-------|
| | | | |

### 7. Requirements Traceability

| Requirement ID | Requirement Summary | Component(s) | How Addressed |
|---------------|--------------------:|--------------|---------------|
| | | | |

### 8. Cascading Implications

| Decision | Cascades To | Implication |
|----------|------------|-------------|
| | | |

## For Greenfield Projects

### 1. Component Topology

| Component | Responsibility | Boundaries | Deployment Approach | Rationale for Separation |
|-----------|---------------|-----------|-------------------|------------------------|
| | | | | |

### 2. Inter-Component Communication

<!-- Same format as brownfield Section 3 -->

### 3. Data Flow Paths

<!-- Same format as brownfield Section 4 -->

### 4. Boundary Decisions

<!-- Same format as brownfield Section 5 -->

### 5. Requirements Traceability

<!-- Same format as brownfield Section 7 -->

### 6. Cascading Implications

<!-- Same format as brownfield Section 8 -->
