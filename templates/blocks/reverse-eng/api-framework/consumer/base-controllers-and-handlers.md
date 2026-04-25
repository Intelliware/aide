---
slug: base-controllers-and-handlers
title: "Base Controllers and Handlers"
applies-to: [re-api-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Base Controllers and Handlers

### 5.1 Base Controller/Handler Class

**Import:**
```typescript
import { BaseController } from '@orgname/api-core';
```

**Purpose:** [One sentence describing what this base class provides]

**What You Must Override:**

| Method | Purpose | Signature |
|---|---|---|
| [e.g., `getAll()`] | [e.g., "List all entities"] | `async getAll(req: Request): Promise<Entity[]>` |
| [method] | [purpose] | [signature] |

**What You Can Override (Optional):**

| Hook | Purpose | Default Behavior |
|---|---|---|
| [e.g., `beforeSave()`] | [e.g., "Modify entity before saving"] | [What the default does] |
| [hook] | [purpose] | [default] |

**Public Methods Available:**

| Method | Purpose | Signature |
|---|---|---|
| [e.g., `getById(id)`] | [e.g., "Get entity by ID"] | `async getById(id: string): Promise<Entity>` |
| [method] | [purpose] | [signature] |

**Minimal Implementation Example:**

```typescript
// Simplest possible controller extending this base
```

**Realistic Implementation Example:**

```typescript
// Full controller with common overrides and configurations
```
