---
slug: components
title: "Components"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Components

<!-- Repeat Section 5.x for each component category. Repeat 5.x.x for each component. -->

### 5.1 [Category Name, e.g., "Layout Components"]

#### 5.1.1 `[ComponentName]` — `<fw-component-selector>`

- **Import:** `import { ComponentName } from '@orgname/framework-components';`
- **Selector:** `<fw-component-name>`
- **Purpose:** [One sentence describing what it does and when to use it.]

**Generic Type Parameters (if any):**

| Parameter | Constraint       | Description                                      |
|-----------|------------------|--------------------------------------------------|
| `T`       | `extends object` | [e.g., "Row data type for the table."]           |

**Inputs (`@Input()`):**

| Name            | Type                | Default     | Required | Description                          |
|-----------------|---------------------|-------------|----------|--------------------------------------|
| `[inputName]`   | `[type]`            | `[default]` | Yes/No   | [What it controls.]                  |
| `[inputName2]`  | `[type]`            | `[default]` | No       | [What it controls.]                  |

**Outputs (`@Output()`):**

| Name            | Emitted Type         | Description                                |
|-----------------|----------------------|--------------------------------------------|
| `[outputName]`  | `EventEmitter<type>` | [When it fires and what the payload means.] |

**Content Projection Slots:**

<!-- Critical for AI to know WHERE to place child content. -->

| Slot / Select                   | Purpose                                           | Required |
|---------------------------------|---------------------------------------------------|----------|
| `(default / no attribute)`      | [e.g., "Main body content of the card."]          | Yes      |
| `[fwCardHeader]`                | [e.g., "Projected into the card's header area."]  | No       |
| `[fwCardFooter]`                | [e.g., "Projected into the card's footer area."]  | No       |
| `[fwCardActions]`               | [e.g., "Action buttons area, right-aligned."]     | No       |

**Exposed CSS Custom Properties / Theming Hooks:**

<!-- If the component allows styling customization via CSS variables or parts. -->

| Property / Part                 | Default Value    | Description                              |
|---------------------------------|------------------|------------------------------------------|
| `--fw-card-padding`             | `$fw-spacing-md` | [Internal padding of the card body.]     |
| `--fw-card-border-radius`       | `$fw-border-radius-md` | [Corner radius.]                  |
| `::part(header)`                | —                | [CSS part targeting the header element.] |

**Public Methods (callable via `@ViewChild`):**

| Method Signature                          | Returns   | Description                          |
|-------------------------------------------|-----------|--------------------------------------|
| `methodName(param: Type): ReturnType`     | `[type]`  | [What it does.]                      |

**Minimal Usage:**
```typescript
// Component class — simplest possible, required inputs only
```

```html
<!-- Template — simplest possible -->
```

**Realistic Usage:**
```typescript
// Component class — showing common optional inputs, event handling, content projection
```

```html
<!-- Template — showing slots, event bindings, conditional rendering -->
```

**Edge Cases and Gotchas:**
- [e.g., "`mode` must be set before `dataSource` is bound, or the component throws."]
- [e.g., "Must be placed inside a `<fw-layout>` — will not render standalone."]
- [e.g., "When using `<ng-template>` for custom cell rendering, the implicit context is `{ $implicit: rowData, index: number }`."]

---

<!-- ===== Repeat 5.x.x for every component ===== -->
