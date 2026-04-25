# Section 6: Database Design

> Populated by `data-model-design.md`. This is Section 6 of the solution design package.
> For brownfield projects, use the delta structure. For greenfield, use the entity definitions structure.

## For Brownfield Projects

### 1. Existing Schema

<!-- Entities in the affected area with current columns, relationships, and indexes -->

| Column | Type | Nullable | Default | Constraints | Index |
|--------|------|----------|---------|-------------|-------|
| | | | | | |

### 2. Schema Delta

#### New Entities

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| | | | | | |

#### Modified Entities

| Entity | Change | Column | Before | After | Reason |
|--------|--------|--------|--------|-------|--------|
| | | | | | |

#### Unchanged Entities

| Entity | Rationale for No Change |
|--------|------------------------|
| | |

### 3. Entity Relationships

<!-- ERD and relationship table -->

| From Entity | To Entity | Relationship | FK Column | Cascade Delete | Cascade Update | Status |
|------------|-----------|-------------|-----------|---------------|---------------|--------|
| | | | | | | new / existing |

### 4. Validation Enforcement

| Business Rule ID | Rule Description | Enforcement Layer | How Enforced |
|-----------------|-----------------|-------------------|--------------|
| | | Database / ORM / Application / Multiple | |

### 5. Indexing Strategy

| Index Name | Table | Columns | Type | Rationale |
|-----------|-------|---------|------|-----------|
| | | | | |

#### Data Volume Considerations

| Entity | Expected Rows at Launch | Expected Rows at 1 Year | Partitioning Needed? |
|--------|------------------------|------------------------|---------------------|
| | | | |

### 6. Caching Strategy

| Entity / Query Pattern | Cache Needed? | Cache Type | TTL | Invalidation Strategy | Rationale |
|----------------------|--------------|-----------|-----|----------------------|-----------|
| | | | | | |

### 7. Migration Strategy

| Order | Migration | Description | Reversible? | Requires Downtime? |
|-------|-----------|-------------|------------|-------------------|
| | | | | |

#### Coexistence Strategy

<!-- Can old code and new code run against the same schema during deployment? -->

### 8. Requirements Traceability

| Schema Element | Change Type | Requirement ID | Requirement Summary |
|---------------|------------|---------------|---------------------|
| | | | |

## For Greenfield Projects

### 1. Entity Definitions

<!-- All entities with full column definitions (same column table format as New Entities above) -->

### 2. Entity Relationships

<!-- Same format as brownfield Section 3 -->

### 3. Validation Enforcement

<!-- Same format as brownfield Section 4 -->

### 4. Indexing Strategy

<!-- Same format as brownfield Section 5 -->

### 5. Caching Strategy

<!-- Same format as brownfield Section 6 -->

### 6. Requirements Traceability

<!-- Same format as brownfield Section 8 -->
