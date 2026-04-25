# [Framework Name] — Documentation for AI-Assisted Development

> **Purpose of this document:** This documentation is structured to enable AI assistants to accurately generate applications, components, and features using [Framework Name]. Every section prioritizes precision, concrete examples, and explicit constraints over narrative explanation.
>
> **Documentation version:** [e.g., 2.1.0 — keep in sync with framework version]
> **Framework version covered:** [e.g., 3.4.x]
> **Last updated:** [date]

---

## Table of Contents

### Part 1 — Foundation
1. [Framework Overview](#1-framework-overview)
2. [Environment and Configuration](#2-environment-and-configuration)
3. [Project Scaffolding and Structure](#3-project-scaffolding-and-structure)

### Part 2 — Visual Design
4. [Theming, Styling, and Responsive Design](#4-theming-styling-and-responsive-design)

### Part 3 — API Reference
5. [Components](#5-components)
6. [Services](#6-services)
7. [Directives and Pipes](#7-directives-and-pipes)
8. [Shared Types, Interfaces, and Enums](#8-shared-types-interfaces-and-enums)
9. [Dependency Injection Tokens and Providers](#9-dependency-injection-tokens-and-providers)

### Part 4 — Patterns and Guides
10. [Inter-Component Communication](#10-inter-component-communication)
11. [Routing and Navigation](#11-routing-and-navigation)
12. [Forms and Validation](#12-forms-and-validation)
13. [Data Fetching and API Integration](#13-data-fetching-and-api-integration)
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [Performance Patterns](#15-performance-patterns)
16. [Security Conventions](#16-security-conventions)

### Part 5 — Recipes
17. [Common Patterns (Recipes)](#17-common-patterns-recipes)
18. [Anti-Patterns](#18-anti-patterns)

### Part 6 — Quality and Maintenance
19. [Error Handling](#19-error-handling)
20. [Testing](#20-testing)
21. [Accessibility](#21-accessibility)

### Part 7 — Reference
22. [Migration and Upgrade Notes](#22-migration-and-upgrade-notes)
23. [Glossary](#23-glossary)
24. [Quick Reference Cheat Sheet](#24-quick-reference-cheat-sheet)
25. [Appendix A: Complete Reference App](#appendix-a-complete-reference-app)

---

# Part 1 — Foundation

---

## 1. Framework Overview

### 1.1 What This Framework Is

- **Name:** [Framework Name]
- **Built on:** Angular [specify version range, e.g., 17.x–18.x]
- **Purpose:** [One or two sentences — e.g., "A component library and application shell for building enterprise admin dashboards."]
- **Package(s):**

| Package                            | Purpose                                    |
|------------------------------------|--------------------------------------------|
| `@orgname/framework-core`          | [e.g., "Core services, DI tokens, shell."] |
| `@orgname/framework-components`    | [e.g., "UI component library."]            |
| `@orgname/framework-forms`         | [e.g., "Form utilities and validators."]   |
| <!-- Add all publishable packages --> |                                          |

### 1.2 Key Concepts and Architecture

<!-- This is the MENTAL MODEL section. AI models need to understand the core abstractions before they see any API. Describe the 3–7 foundational concepts that everything else builds on. Use a short paragraph per concept, not just a bullet. -->

**[Concept 1, e.g., "The Application Shell"]**
[Explain what it is, what it controls, and how every app interacts with it. e.g., "Every application is wrapped in a `FwShell` component that manages the top nav, sidebar, and content area. You never create your own root layout — the Shell provides it. Your app's routed views render inside the Shell's content outlet."]

**[Concept 2, e.g., "Feature Modules"]**
[Explain the concept and how it differs from or extends vanilla Angular modules/standalone components.]

**[Concept 3, e.g., "Data Stores"]**
[e.g., "The framework provides `FwStore<T>` as the standard way to manage server-fetched data. Components bind to stores, not raw HTTP calls. Stores handle caching, refresh, and error states internally."]

**[Concept 4, e.g., "The Action System"]**
[If the framework has a specific pattern for user actions, commands, etc.]

<!-- Add as many concepts as needed. This section should give the AI enough context to make correct high-level architectural decisions. -->

**How they fit together:**
<!-- A brief paragraph or ASCII diagram showing how the core concepts relate. -->

```
[Shell]
  ├── [Navigation / Routing]
  ├── [Feature A]
  │     ├── [Components] ←→ [Store] ←→ [API Service]
  │     └── [Forms]
  └── [Feature B]
        └── ...
```

### 1.3 Core Philosophy and Design Principles

- **Principle 1:** [e.g., "Convention over configuration — most behaviors have sensible defaults."]
- **Principle 2:** [e.g., "Composition over inheritance — build complex UIs by composing small components."]
- **Principle 3:** [e.g., "Framework-managed state — avoid direct DOM manipulation or standalone state libraries unless explicitly required."]
- **Principle 4:** [e.g., "Explicit over magic — no hidden side effects; all behaviors are opt-in via inputs or providers."]

### 1.4 When to Use / When NOT to Use

**Use this framework when:**
- [e.g., "Building internal CRUD-heavy admin applications."]
- [e.g., "You need consistent theming across a suite of apps."]

**Do NOT use this framework when:**
- [e.g., "Building public-facing marketing sites — it adds unnecessary overhead."]
- [e.g., "The app requires a non-Angular rendering layer."]

---

## 2. Environment and Configuration

### 2.1 Prerequisites

| Dependency        | Required Version | Notes                          |
|-------------------|------------------|--------------------------------|
| Node.js           | [e.g., >= 18.x]  |                                |
| Angular CLI       | [e.g., 17.3.x]   |                                |
| TypeScript        | [e.g., 5.3.x]    |                                |
| RxJS              | [e.g., 7.8.x]    |                                |
| [Peer dep]        | [version]        | [why it's needed]              |

### 2.2 Browser Compatibility

| Browser           | Minimum Version | Notes / Required Polyfills     |
|-------------------|-----------------|--------------------------------|
| Chrome            | [version]        |                                |
| Firefox           | [version]        |                                |
| Safari            | [version]        | [e.g., "Requires X polyfill."] |
| Edge              | [version]        |                                |

### 2.3 Installation

```bash
# Complete installation commands — include ALL packages
[e.g., npm install @orgname/framework-core @orgname/framework-components]
```

### 2.4 Required Angular Configuration Changes

<!-- EXACT configuration diffs. AI will apply these literally when scaffolding a new project. -->

**`angular.json` modifications:**
```jsonc
// Show only the keys that must be added or changed, with comments
{
  // ...
}
```

**`tsconfig.json` modifications:**
```jsonc
{
  "compilerOptions": {
    // e.g., "paths": { "@fw/*": ["..."] }
  }
}
```

**`main.ts` or `app.config.ts` bootstrap changes:**
```typescript
// Complete file content showing framework bootstrap
```

**`styles.scss` global import:**
```scss
// Required global style imports
```

### 2.5 Framework Runtime Configuration

<!-- How to configure the framework at the app level — feature flags, API base URLs, environment-specific settings. -->

```typescript
// Example: providing framework configuration
import { provideFwConfig } from '@orgname/framework-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFwConfig({
      apiBaseUrl: environment.apiUrl,
      // ... document every available config key below
    }),
  ],
};
```

**Configuration Options Reference:**

| Key                    | Type      | Default       | Description                                  |
|------------------------|-----------|---------------|----------------------------------------------|
| `apiBaseUrl`           | `string`  | `'/'`         | [Base URL for all framework HTTP calls.]     |
| `defaultPageSize`      | `number`  | `20`          | [Default pagination size.]                   |
| `[key]`                | `[type]`  | `[default]`   | [Description.]                               |

---

## 3. Project Scaffolding and Structure

### 3.1 Scaffolding a New App

```bash
# Option A: CLI/Schematic (if available)
[e.g., npx @orgname/create-app my-app --template=dashboard]
```

**Available schematics/generators:**
<!-- If the framework provides Angular schematics, list every one. -->

| Command                                        | What it generates                        |
|------------------------------------------------|------------------------------------------|
| `ng generate @orgname/framework:feature [name]`| [e.g., "Feature folder with routing."]   |
| `ng generate @orgname/framework:store [name]`  | [e.g., "A data store service."]          |
| `[command]`                                     | [description]                            |

```bash
# Option B: Manual setup steps (if no CLI)
# Step 1: ...
# Step 2: ...
```

### 3.2 Required Project Structure

<!-- AI models rely on this heavily. Be explicit about what goes where and WHY. -->

```
src/
├── app/
│   ├── app.component.ts          # Root component — typically just hosts <fw-shell>.
│   ├── app.component.html        # Should contain ONLY <fw-shell> (or equivalent).
│   ├── app.config.ts             # Framework providers registered here. THE source of truth for DI.
│   ├── app.routes.ts             # Top-level route definitions — layout routes and lazy feature imports.
│   │
│   ├── core/                     # Singleton services, guards, interceptors. Provided in root.
│   │   ├── services/             #   App-wide services (auth, user session, global config).
│   │   ├── guards/               #   Route guards.
│   │   ├── interceptors/         #   HTTP interceptors.
│   │   └── models/               #   App-wide interfaces/types (User, AppConfig, etc.).
│   │
│   ├── features/                 # One folder per feature. Each is lazy-loaded via routes.
│   │   └── [feature-name]/
│   │       ├── [feature-name].component.ts       # Feature's root/shell component.
│   │       ├── [feature-name].component.html
│   │       ├── [feature-name].routes.ts           # Feature-level child routes.
│   │       ├── components/                        # Feature-specific presentational components.
│   │       │   └── [component-name]/
│   │       │       ├── [component-name].component.ts
│   │       │       └── [component-name].component.html
│   │       ├── services/                          # Feature-specific services/stores.
│   │       │   └── [feature-name].store.ts
│   │       └── models/                            # Feature-specific interfaces.
│   │           └── [feature-name].model.ts
│   │
│   ├── shared/                   # Reusable components, pipes, directives used across features.
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   │
│   └── layouts/                  # (If applicable) Layout components for different route shells.
│       └── ...
│
├── assets/
│   ├── i18n/                     # Translation files (if using framework i18n).
│   └── images/
│
├── styles/
│   ├── _variables.scss           # Framework theme variable overrides.
│   ├── _mixins.scss              # App-specific mixins (if any).
│   └── styles.scss               # Global entry — imports framework styles, then overrides.
│
└── environments/
```

### 3.3 Naming Conventions

| Artifact                | Convention                         | Example                              |
|-------------------------|------------------------------------|--------------------------------------|
| Components              | [e.g., kebab-case]                 | `user-profile.component.ts`          |
| Component selectors     | [e.g., `app-` prefix]             | `<app-user-profile>`                 |
| Services                | [e.g., kebab-case + `.service`]    | `auth.service.ts`                    |
| Stores                  | [e.g., kebab-case + `.store`]      | `user.store.ts`                      |
| Models/Interfaces       | [e.g., PascalCase + `.model`]      | `user-profile.model.ts`             |
| Enums                   | [e.g., PascalCase + `.enum`]       | `user-role.enum.ts`                  |
| Route files             | [convention]                       | `feature-name.routes.ts`             |
| Guards                  | [convention]                       | `auth.guard.ts`                      |
| Interceptors            | [convention]                       | `error.interceptor.ts`               |
| Test files              | [convention]                       | `user-profile.component.spec.ts`     |

### 3.4 Module / Dependency Registration Pattern

<!-- One of the most common AI errors: importing a class but not registering it. Show the exact pattern. -->

**For standalone components (Angular 15+):**
```typescript
// How to import framework components into your own component
```

**For module-based apps (if supported):**
```typescript
// How to import framework modules
```

**For services/providers:**
```typescript
// How to register framework services
```

### 3.5 Minimal Boilerplate App

<!-- A complete, copy-paste-ready minimal application. This is the single most important example for AI code generation. Show EVERY file needed for a working "hello world." -->

**`app.config.ts`**
```typescript
// Complete file contents
```

**`app.component.ts`**
```typescript
// Complete file contents
```

**`app.component.html`**
```html
<!-- Complete file contents -->
```

**`app.routes.ts`**
```typescript
// Complete file contents
```

**`styles.scss`**
```scss
// Complete file contents
```

---

# Part 2 — Visual Design

---

## 4. Theming, Styling, and Responsive Design

### 4.1 Styling Approach

- **Styling method:** [e.g., "SCSS with framework-provided design tokens."]
- **Component styles:** [e.g., "Use Angular ViewEncapsulation.Emulated (default). Never use None."]
- **Global styles:** [e.g., "Import framework base styles in `styles.scss`. App-level overrides go in `_variables.scss`."]

### 4.2 Design Tokens / Variables

<!-- Complete list. AI must use these instead of hardcoded values. -->

**Colors:**
```scss
$fw-color-primary: ...;
$fw-color-primary-light: ...;
$fw-color-primary-dark: ...;
$fw-color-secondary: ...;
$fw-color-success: ...;
$fw-color-warning: ...;
$fw-color-danger: ...;
$fw-color-info: ...;
$fw-color-text-primary: ...;
$fw-color-text-secondary: ...;
$fw-color-background: ...;
$fw-color-surface: ...;
$fw-color-border: ...;
// ... complete list
```

**Spacing Scale:**
```scss
$fw-spacing-xxs: ...;   // [e.g., 4px]
$fw-spacing-xs: ...;    // [e.g., 8px]
$fw-spacing-sm: ...;    // [e.g., 12px]
$fw-spacing-md: ...;    // [e.g., 16px]
$fw-spacing-lg: ...;    // [e.g., 24px]
$fw-spacing-xl: ...;    // [e.g., 32px]
$fw-spacing-xxl: ...;   // [e.g., 48px]
```

**Typography:**
```scss
$fw-font-family-base: ...;
$fw-font-family-mono: ...;
$fw-font-size-xs: ...;
$fw-font-size-sm: ...;
$fw-font-size-md: ...;
$fw-font-size-lg: ...;
$fw-font-size-xl: ...;
$fw-font-weight-normal: ...;
$fw-font-weight-medium: ...;
$fw-font-weight-bold: ...;
$fw-line-height-tight: ...;
$fw-line-height-normal: ...;
$fw-line-height-relaxed: ...;
```

**Borders and Radii:**
```scss
$fw-border-radius-sm: ...;
$fw-border-radius-md: ...;
$fw-border-radius-lg: ...;
$fw-border-radius-full: ...;
$fw-border-width: ...;
$fw-border-color: ...;
```

**Shadows and Elevation:**
```scss
$fw-shadow-sm: ...;
$fw-shadow-md: ...;
$fw-shadow-lg: ...;
```

**Z-index Scale:**
```scss
$fw-z-index-dropdown: ...;
$fw-z-index-sticky: ...;
$fw-z-index-modal: ...;
$fw-z-index-toast: ...;
$fw-z-index-tooltip: ...;
```

### 4.3 Responsive Breakpoints

| Name        | Min-width  | Token / Mixin                        | Typical Use                  |
|-------------|-----------|---------------------------------------|------------------------------|
| `xs`        | `0`       | `@include fw-breakpoint-up(xs) {}`    | [Mobile portrait]            |
| `sm`        | `[px]`    | `@include fw-breakpoint-up(sm) {}`    | [Mobile landscape]           |
| `md`        | `[px]`    | `@include fw-breakpoint-up(md) {}`    | [Tablet]                     |
| `lg`        | `[px]`    | `@include fw-breakpoint-up(lg) {}`    | [Desktop]                    |
| `xl`        | `[px]`    | `@include fw-breakpoint-up(xl) {}`    | [Large desktop]              |

### 4.4 Icon System

<!-- If the framework provides or mandates a specific icon approach. -->

- **Icon library:** [e.g., "Framework ships its own SVG icon set via `<fw-icon>`."]
- **Usage:**

```html
<!-- How to use icons -->
<fw-icon name="[icon-name]"></fw-icon>
```

- **Available icons:** [Link to icon reference or list common ones]
- **Custom icons:** [How to register custom SVG icons]

```typescript
// Example: registering custom icons
```

### 4.5 Applying and Switching Themes

```typescript
// How to configure or swap themes at the app level
```

### 4.6 Framework-Provided Utility CSS Classes

<!-- If the framework provides utility classes (e.g., `fw-mt-md`, `fw-flex`, `fw-hidden-sm`). -->

| Class Pattern          | Example              | Effect                         |
|------------------------|----------------------|--------------------------------|
| `fw-m[side]-[size]`   | `fw-mt-md`           | [Margin top, medium.]          |
| `fw-p[side]-[size]`   | `fw-px-lg`           | [Padding horizontal, large.]   |
| `fw-text-[variant]`   | `fw-text-secondary`  | [Text color secondary.]        |
| `fw-display-[value]`  | `fw-display-flex`    | [Display flex.]                |
| [pattern]              | [example]            | [effect]                       |

### 4.7 Styling Do's and Don'ts

- **DO:** [e.g., "Use `$fw-spacing-*` tokens for all margins and padding."]
- **DO:** [e.g., "Use the framework grid system for page layout."]
- **DO NOT:** [e.g., "Never override framework component styles with `::ng-deep`."]
- **DO NOT:** [e.g., "Never use hardcoded color hex values — always reference tokens."]
- **DO NOT:** [e.g., "Never set `z-index` with arbitrary values — use the scale tokens."]

---

# Part 3 — API Reference

<!-- ============================================================
     INSTRUCTIONS FOR DOCUMENTING EACH COMPONENT/SERVICE/DIRECTIVE
     Repeat the appropriate template below for EVERY public export.
     Group them logically by domain (e.g., Layout, Data, Navigation, Forms).
     ============================================================ -->

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

---

## 6. Services

<!-- Repeat 6.x for each service. -->

### 6.1 `[ServiceName]`

- **Import:** `import { ServiceName } from '@orgname/framework-core';`
- **Provided in:** [e.g., `'root'` / `FrameworkCoreModule` / must be manually provided]
- **Purpose:** [One sentence.]
- **Stateful:** [Yes/No — does it hold internal state across calls?]

**Generic Type Parameters (if any):**

| Parameter | Constraint    | Description                              |
|-----------|---------------|------------------------------------------|
| `T`       | `[constraint]`| [Description.]                           |

**Public Properties:**

| Property           | Type                   | Description                             |
|--------------------|------------------------|-----------------------------------------|
| `[propertyName]`   | `Observable<type>`     | [What it exposes.]                      |

**Public Methods:**

| Method Signature                                          | Returns              | Description              |
|-----------------------------------------------------------|----------------------|--------------------------|
| `fetchItems(filter?: FilterModel): Observable<Item[]>`    | `Observable<Item[]>` | [What it does.]          |

**Minimal Usage:**
```typescript
// Inject and call — simplest case
```

**Realistic Usage:**
```typescript
// With error handling, loading states, subscriptions
```

**Edge Cases and Gotchas:**
- [List non-obvious behaviors, required initialization order, etc.]

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

---

## 8. Shared Types, Interfaces, and Enums

<!-- AI models constantly invent plausible-but-wrong type names. This section is critical. List EVERY public type, interface, and enum that appears in any method signature, input, or output above. -->

### 8.1 Interfaces

```typescript
// List every public interface with full type definition

export interface FwColumnDef<T = any> {
  field: keyof T;
  header: string;
  sortable?: boolean;           // Default: false
  width?: string;               // e.g., '200px', '30%'
  cellRenderer?: TemplateRef<FwCellContext<T>>;
}

export interface FwCellContext<T> {
  $implicit: T;
  index: number;
  column: FwColumnDef<T>;
}

export interface FwFilterCriteria {
  field: string;
  operator: FwFilterOperator;
  value: any;
}

export interface FwPaginationConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showFirstLastButtons?: boolean; // Default: true
}

export interface FwMenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: FwMenuItem[];
  badge?: string | number;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
}

// ... list ALL public interfaces
```

### 8.2 Enums

```typescript
export enum FwFilterOperator {
  Equals = 'eq',
  NotEquals = 'neq',
  Contains = 'contains',
  GreaterThan = 'gt',
  LessThan = 'lt',
  Between = 'between',
  In = 'in',
}

export enum FwDialogSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  FullScreen = 'fullscreen',
}

export enum FwToastSeverity {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

// ... list ALL public enums
```

### 8.3 Type Aliases

```typescript
export type FwSortDirection = 'asc' | 'desc' | null;
export type FwButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type FwSize = 'sm' | 'md' | 'lg';

// ... list ALL public type aliases
```

---

## 9. Dependency Injection Tokens and Providers

<!-- This section documents how to customize the framework via DI. Many frameworks allow overriding default behaviors by providing custom implementations for injection tokens. -->

### 9.1 Available Injection Tokens

| Token                           | Type                    | Default Provider                     | Purpose                                           |
|---------------------------------|-------------------------|--------------------------------------|---------------------------------------------------|
| `FW_HTTP_BASE_URL`              | `string`                | `'/'`                                | [Base URL for all framework HTTP calls.]          |
| `FW_DATE_FORMAT`                | `string`                | `'MM/dd/yyyy'`                       | [Default date display format.]                    |
| `FW_AUTH_SERVICE`               | `FwAuthService`         | `DefaultFwAuthService`               | [Provide a custom auth implementation.]           |
| `FW_ERROR_HANDLER`              | `FwErrorHandler`        | `DefaultFwErrorHandler`              | [Provide custom global error handling.]           |
| `[TOKEN_NAME]`                  | `[type]`                | `[default]`                          | [Purpose.]                                        |

### 9.2 Overriding a Token

```typescript
// Example: providing a custom auth service
import { FW_AUTH_SERVICE } from '@orgname/framework-core';
import { MyCustomAuthService } from './core/services/my-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: FW_AUTH_SERVICE, useClass: MyCustomAuthService },
  ],
};
```

### 9.3 Provider Functions

<!-- If the framework exposes convenience `provide*()` functions. -->

| Function                                     | Purpose                                          |
|----------------------------------------------|--------------------------------------------------|
| `provideFwConfig(config: FwConfig)`           | [Registers core framework configuration.]        |
| `provideFwHttpInterceptors()`                 | [Registers framework HTTP interceptors.]         |
| `provideFwRouter(routes: Routes)`             | [Configures framework-aware routing.]            |
| `[function]`                                  | [Purpose.]                                       |

---

# Part 4 — Patterns and Guides

---

## 10. Inter-Component Communication

### 10.1 Parent → Child

```typescript
// Standard @Input binding or framework-specific alternative
```

### 10.2 Child → Parent

```typescript
// Standard @Output/EventEmitter or framework-specific alternative
```

### 10.3 Sibling / Cross-Feature Communication

<!-- Does the framework provide a message bus, event system, or shared state? -->

```typescript
// Example using framework mechanism
```

### 10.4 Global App State / Context

```typescript
// How the framework manages app-wide state (user session, global config, etc.)
```

### 10.5 Framework-Specific DI Communication Patterns

<!-- Patterns like providing a service at a component level to create scoped communication. -->

```typescript
// Example if applicable
```

---

## 11. Routing and Navigation

### 11.1 Route Configuration

```typescript
// Example route config using framework conventions
```

### 11.2 Layout / Shell Routes

<!-- If the framework uses layout routes, named outlets, or shell-based routing. -->

```typescript
// Example
```

### 11.3 Navigation Guards

```typescript
// Framework-provided guards or conventions for custom ones
```

### 11.4 Route Resolvers

```typescript
// Example
```

### 11.5 Breadcrumb Integration

<!-- If the framework auto-generates breadcrumbs from route data. -->

```typescript
// Example: adding breadcrumb data to routes
```

### 11.6 Deep Linking and Query Parameters

```typescript
// Framework conventions for reading/writing query params
```

---

## 12. Forms and Validation

### 12.1 Framework Form Approach

<!-- Does the framework wrap Angular Reactive Forms? Provide its own primitives? -->

```typescript
// Example: building a basic form
```

```html
<!-- Corresponding template -->
```

### 12.2 Built-in Validators

| Validator                     | Usage                                      | Description                       |
|-------------------------------|--------------------------------------------|-----------------------------------|
| `FwValidators.required`       | `[e.g., control-level]`                    | [What it checks.]                 |
| `FwValidators.email`          | `[usage]`                                  | [What it checks.]                 |
| `FwValidators.minLength(n)`   | `[usage]`                                  | [What it checks.]                 |
| `[validator]`                 | `[usage]`                                  | [What it checks.]                 |

### 12.3 Custom Validator Pattern

```typescript
// How to write a custom validator the framework way
```

### 12.4 Async Validation

```typescript
// Example: async validator (e.g., checking username availability)
```

### 12.5 Cross-Field Validation

```typescript
// Example: validating that two fields match
```

### 12.6 Error Display Conventions

```html
<!-- How validation errors are displayed using framework components -->
```

### 12.7 Dynamic Forms

<!-- If the framework supports generating forms from config/schema. -->

```typescript
// Example: building a form from a config object
```

### 12.8 Form Arrays / Repeatable Sections

```typescript
// Example: adding/removing dynamic form rows
```

---

## 13. Data Fetching and API Integration

### 13.1 Recommended Pattern

```typescript
// The standard way to fetch and display data
```

### 13.2 Error Handling

```typescript
// How to handle API errors using framework patterns
```

### 13.3 Loading and Empty States

```typescript
// How the framework expects you to show loading spinners, skeletons, and "no data" states
```

```html
<!-- Template example -->
```

### 13.4 Pagination

```typescript
// Server-side pagination pattern
```

### 13.5 Caching Strategies

<!-- If the framework provides built-in caching for data fetching. -->

```typescript
// Example: using framework cache
```

### 13.6 Real-Time / WebSocket Patterns

<!-- If applicable. -->

```typescript
// Example
```

### 13.7 Optimistic Updates

<!-- If the framework supports or recommends a pattern for optimistic UI updates. -->

```typescript
// Example
```

---

## 14. Internationalization (i18n)

<!-- If the framework has its own i18n system or wraps Angular's. Skip this section if it defers entirely to vanilla Angular i18n. -->

### 14.1 Setup

```typescript
// How to configure i18n
```

### 14.2 Translation File Format

```json
// Example translation file
```

### 14.3 Using Translations in Templates

```html
<!-- Example -->
```

### 14.4 Using Translations in TypeScript

```typescript
// Example
```

### 14.5 Pluralization and Interpolation

```html
<!-- Example -->
```

---

## 15. Performance Patterns

### 15.1 Change Detection Strategy

<!-- Does the framework recommend or enforce OnPush? -->
- [e.g., "All framework components use `ChangeDetectionStrategy.OnPush`. Your components should too."]

### 15.2 Lazy Loading

```typescript
// The framework's recommended lazy loading pattern
```

### 15.3 Virtual Scrolling

<!-- If the framework provides virtual scrolling for large lists/tables. -->

```html
<!-- Example -->
```

### 15.4 Bundle Size Considerations

- [e.g., "Import individual components, not the entire module: `import { FwButton } from '@orgname/framework-components/button';`"]
- [e.g., "Tree-shakeable provider pattern: use `providedIn: 'root'` for services."]

### 15.5 TrackBy Conventions

```html
<!-- Required trackBy pattern for *ngFor or @for with framework components -->
```

---

## 16. Security Conventions

### 16.1 XSS Prevention

- [e.g., "The framework auto-sanitizes all `[innerHTML]` bindings. Use `FwSanitizer` if you need to bypass."]
- [e.g., "Never use `bypassSecurityTrustHtml` without explicit justification."]

### 16.2 Authentication Integration

```typescript
// How the framework integrates with authentication (token attachment, session management)
```

### 16.3 Authorization / Permission Patterns

```typescript
// How to conditionally show/hide UI based on user permissions
```

```html
<!-- Template example: permission-based visibility -->
```

### 16.4 CSP (Content Security Policy) Notes

- [e.g., "The framework does not use inline styles dynamically. Compatible with strict CSP."]
- [e.g., "If using framework animations, add `'unsafe-eval'` to script-src (or use the CSP-compatible animation bundle)."]

---

# Part 5 — Recipes

---

## 17. Common Patterns (Recipes)

### 17.1 CRUD Feature Module

<!-- Complete example with every file. -->

**File: `features/products/products.routes.ts`**
```typescript
// Complete file
```

**File: `features/products/product-list.component.ts`**
```typescript
// Complete file
```

**File: `features/products/product-list.component.html`**
```html
<!-- Complete file -->
```

**File: `features/products/product-form.component.ts`**
```typescript
// Complete file
```

**File: `features/products/product-form.component.html`**
```html
<!-- Complete file -->
```

**File: `features/products/services/product.store.ts`**
```typescript
// Complete file
```

**File: `features/products/models/product.model.ts`**
```typescript
// Complete file
```

### 17.2 Authentication Flow

<!-- Login page, route guards, token refresh, session expiry handling. -->

**File: `features/auth/login.component.ts`**
```typescript
// Complete file
```

**File: `features/auth/login.component.html`**
```html
<!-- Complete file -->
```

**File: `core/guards/auth.guard.ts`**
```typescript
// Complete file
```

### 17.3 Dialog / Modal Pattern

```typescript
// How to open a dialog, pass data in, and receive a result
```

### 17.4 Toast / Notification Pattern

```typescript
// How to trigger toasts/notifications from a service
```

### 17.5 Table with Server-Side Pagination, Sorting, and Filtering

```typescript
// Complete component showing all three
```

```html
<!-- Complete template -->
```

### 17.6 Dashboard with Multiple Widgets

```typescript
// Complete example
```

### 17.7 File Upload

```typescript
// Framework-specific file upload pattern
```

### 17.8 Confirmation Before Destructive Action

```typescript
// Pattern for "Are you sure?" dialogs before delete, etc.
```

### 17.9 Master-Detail Layout

```typescript
// List on left, detail on right — framework pattern
```

### 17.10 [Additional patterns as relevant to the framework]

```typescript
// e.g., Search/filter page, Settings page, Multi-step wizard, etc.
```

---

## 18. Anti-Patterns

<!-- AI models tend to generate plausible-but-wrong code. This section is critical. -->

### 18.1 Component Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Wrapping `<fw-card>` in a `<div>` for layout"]    | [e.g., "Breaks grid system."]                          | [e.g., "Use `<fw-grid-item>` as wrapper."]           |
| [e.g., "Using `ViewEncapsulation.None` to style framework components"] | [e.g., "Bleeds styles globally."]           | [e.g., "Use CSS custom properties or theming API."]  |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.2 Data/State Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Calling HTTP directly from a component"]           | [e.g., "Bypasses framework caching/error handling."]   | [e.g., "Use a `FwStore` or framework data service."] |
| [e.g., "Manual `.subscribe()` without teardown"]           | [e.g., "Memory leaks."]                                | [e.g., "Use `async` pipe or `takeUntilDestroyed()`."]|
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.3 Styling Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Using `::ng-deep` to override framework styles"]  | [e.g., "Deprecated and fragile."]                      | [e.g., "Use `--fw-*` CSS custom properties."]        |
| [e.g., "Hardcoded colors instead of tokens"]               | [e.g., "Breaks theming."]                              | [e.g., "Always use `$fw-color-*` tokens."]           |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.4 Form Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Using `ngModel` with framework form components"]   | [e.g., "Conflicts with reactive model."]               | [e.g., "Use `fwFormControl` binding."]               |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

### 18.5 Routing Anti-Patterns

| Anti-Pattern                                               | Why It's Wrong                                         | Correct Approach                                     |
|------------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| [e.g., "Eagerly importing feature components"]             | [e.g., "Defeats lazy loading, inflates initial bundle."]| [e.g., "Always use `loadChildren` or `loadComponent`."] |
| [anti-pattern]                                              | [why]                                                  | [correct]                                            |

---

# Part 6 — Quality and Maintenance

---

## 19. Error Handling

### 19.1 Framework Error Types

| Error Class / Code         | When It Occurs                                | How to Handle                          |
|---------------------------|-----------------------------------------------|----------------------------------------|
| `FwConfigError`           | [e.g., "Missing required provider at boot."]  | [e.g., "Check `app.config.ts` setup."]   |
| `FwValidationError`       | [e.g., "Invalid form submission."]            | [e.g., "Display via `fw-error-display`."]|
| `FwHttpError`             | [e.g., "API request failed."]                 | [e.g., "Handled by store; use error template."] |
| `[ErrorClass]`            | [When]                                         | [How]                                  |

### 19.2 Global Error Handler Setup

```typescript
// How to register/configure the framework's global error handler
```

### 19.3 Component-Level Error Handling

```typescript
// Pattern for handling errors within a component
```

```html
<!-- Error display template pattern -->
```

### 19.4 Error Propagation

<!-- How errors flow through the framework: HTTP → Store → Component → UI -->

```
[HTTP Layer] → [Store/Service] → [Component] → [Template]
    │                │                │              │
    │                │                │              └─ <fw-error-display>
    │                │                └─ catchError / error$ stream
    │                └─ FwStore.error$ observable
    └─ Interceptor → FwHttpError → FwErrorHandler
```

---

## 20. Testing

### 20.1 Test Environment Setup

```typescript
// How to configure TestBed with all required framework providers
import { provideFwTestingModule } from '@orgname/framework-testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideFwTestingModule(),
      // ...
    ],
  });
});
```

### 20.2 Unit Testing Components

```typescript
// Minimal component test
```

### 20.3 Framework-Provided Test Utilities

<!-- Test harnesses, mock services, fixture helpers. -->

| Utility                        | Import                                    | Purpose                              |
|--------------------------------|-------------------------------------------|--------------------------------------|
| `FwButtonHarness`              | `@orgname/framework-testing`              | [Test harness for `<fw-button>`.]    |
| `MockFwAuthService`            | `@orgname/framework-testing`              | [Pre-built mock for auth service.]   |
| `FwTestHelper.flush()`         | `@orgname/framework-testing`              | [Flushes async framework internals.] |
| `[utility]`                    | `[import]`                                | [Purpose.]                           |

```typescript
// Example: using a test harness
```

### 20.4 Mocking Framework Services

```typescript
// Pattern for mocking a framework store or service in tests
```

### 20.5 Integration Testing Patterns

```typescript
// Testing a feature with routing and data
```

### 20.6 E2E Testing Conventions

<!-- If the framework provides specific selectors, test IDs, or Cypress/Playwright utilities. -->

```typescript
// Example
```

---

## 21. Accessibility

### 21.1 Built-in A11y Features

- [e.g., "All form components auto-generate `id`, `for`, and `aria-describedby` from the `label` input."]
- [e.g., "Framework modals trap focus and restore it on close."]

### 21.2 Required Developer Actions

- [e.g., "Always provide `label` input on `<fw-input>` — it is used for `aria-label`."]
- [e.g., "Use `<fw-sr-only>` for screen-reader-only text."]
- [e.g., "Use `fwAriaLive` directive for dynamic content announcements."]

### 21.3 Keyboard Navigation

| Component         | Keyboard Behavior                                                |
|-------------------|------------------------------------------------------------------|
| `<fw-menu>`       | [e.g., "Arrow keys navigate, Enter selects, Escape closes."]    |
| `<fw-table>`      | [e.g., "Tab moves between focusable cells."]                    |
| `[component]`     | [behavior]                                                       |

### 21.4 Focus Management Patterns

```typescript
// Example: programmatic focus management after a dialog closes or a route changes
```

---

# Part 7 — Reference

---

## 22. Migration and Upgrade Notes

| From Version | To Version | Breaking Change                  | Migration Action                  |
|-------------|-----------|----------------------------------|-----------------------------------|
| [1.x]       | [2.x]     | [e.g., "`FwTable` → `FwDataGrid`"]| [e.g., "Rename selector, update inputs."] |
| [version]   | [version] | [change]                          | [action]                          |

---

## 23. Glossary

| Term                | Meaning in this framework                                      |
|---------------------|----------------------------------------------------------------|
| [e.g., "Shell"]     | [e.g., "The root layout component wrapping all routed views."] |
| [e.g., "Feature"]   | [e.g., "A lazy-loaded module representing one app section."]   |
| [e.g., "Store"]     | [e.g., "A reactive data service managing server-fetched state."]|
| [term]              | [definition]                                                    |

---

## 24. Quick Reference Cheat Sheet

<!-- A condensed, scannable reference for common tasks. AI models benefit from this as a fast lookup before generating code. -->

### Scaffolding
```bash
# New feature:          [command or file creation steps]
# New component:        [command]
# New service/store:    [command]
```

### Common Imports
```typescript
// Components
import { FwButton, FwCard, FwTable, FwDialog } from '@orgname/framework-components';

// Services
import { FwAuthService, FwToastService, FwDialogService } from '@orgname/framework-core';

// Types
import { FwColumnDef, FwPaginationConfig, FwMenuItem } from '@orgname/framework-core';

// Validators
import { FwValidators } from '@orgname/framework-forms';

// Testing
import { provideFwTestingModule, MockFwAuthService } from '@orgname/framework-testing';
```

### Common Template Patterns
```html
<!-- Button -->
<fw-button variant="primary" (clicked)="onSave()">Save</fw-button>

<!-- Table with columns -->
<fw-table [data]="items" [columns]="columns" (rowClicked)="onSelect($event)"></fw-table>

<!-- Form field with validation error display -->
<fw-form-field label="Email" [control]="form.controls.email">
  <input fwInput formControlName="email" />
</fw-form-field>

<!-- Dialog trigger -->
<!-- Show the framework's recommended pattern for opening a dialog -->

<!-- Toast -->
<!-- Show the one-liner for triggering a toast notification -->
```

### Route Template
```typescript
export const routes: Routes = [
  {
    path: '',
    component: FeatureShellComponent,
    children: [
      { path: '', component: ListComponent },
      { path: 'create', component: FormComponent },
      { path: ':id', component: DetailComponent },
      { path: ':id/edit', component: FormComponent },
    ],
  },
];
```

---

## Appendix A: Complete Reference App

<!-- A fully working reference application demonstrating all major features. This is the gold-standard the AI targets. -->

### App Description
[e.g., "A product management dashboard with user auth, product CRUD, dashboard widgets, and settings."]

### File Listing

| File Path                                  | Purpose                                      |
|-------------------------------------------|----------------------------------------------|
| `src/app/app.config.ts`                   | Bootstrap and framework provider setup.      |
| `src/app/app.component.ts`               | Root shell component.                         |
| `src/app/app.routes.ts`                  | Top-level routes with lazy loading.           |
| `src/app/core/services/auth.service.ts`  | Auth integration using framework patterns.    |
| `src/app/features/dashboard/...`          | Dashboard — demonstrates widgets, layout.     |
| `src/app/features/products/...`           | Products CRUD — forms, table, routing.        |
| `src/app/features/settings/...`           | Settings — demonstrates form patterns.        |
| `src/app/shared/components/...`           | Shared presentational components.             |

### Key Files

<!-- Inline the most important files below, or link to a repository. -->

**`src/app/app.config.ts`**
```typescript
// Complete file
```

**`src/app/app.routes.ts`**
```typescript
// Complete file
```

**`src/app/features/products/products.routes.ts`**
```typescript
// Complete file
```

**`src/app/features/products/product-list.component.ts`**
```typescript
// Complete file
```

<!-- ... continue with all key files ... -->

---

*End of documentation template.*
