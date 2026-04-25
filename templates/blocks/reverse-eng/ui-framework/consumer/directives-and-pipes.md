---
slug: directives-and-pipes
title: "Directives and Pipes"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Directives and Pipes

### 7.1 Directives

#### 7.1.1 `[DirectiveName]` — `[fwDirectiveSelector]`

- **Import:** `import { DirectiveName } from '@orgname/framework-components';`
- **Selector:** `[fwDirectiveSelector]`
- **Applied to:** [e.g., "Any `<input>` element." / "Only `<fw-table>` components."]
- **Purpose:** [One sentence.]

**Inputs:**

| Name           | Type      | Default    | Description                              |
|----------------|-----------|------------|------------------------------------------|
| `[inputName]`  | `[type]`  | `[default]`| [What it controls.]                      |

**Outputs:**

| Name            | Emitted Type        | Description                              |
|-----------------|---------------------|------------------------------------------|
| `[outputName]`  | `EventEmitter<type>`| [When it fires.]                         |

**Host Element Effects:**
<!-- What the directive does to the element it's placed on. -->
- [e.g., "Adds class `fw-highlighted` when condition is true."]
- [e.g., "Sets `aria-invalid` based on form control validity."]

**Usage:**
```html
<!-- Example -->
```

### 7.2 Pipes

#### 7.2.1 `[PipeName]` — `[fwPipeName]`

- **Import:** `import { PipeName } from '@orgname/framework-core';`
- **Usage in template:** `{{ value | fwPipeName : arg1 : arg2 }}`
- **Pure:** [Yes/No]
- **Purpose:** [One sentence.]

**Arguments:**

| Position | Name     | Type      | Default    | Description                          |
|----------|----------|-----------|------------|--------------------------------------|
| 1        | `format` | `string`  | `'short'`  | [What it controls.]                  |

**Usage:**
```html
<!-- Example -->
{{ user.createdAt | fwDate : 'long' }}
```
