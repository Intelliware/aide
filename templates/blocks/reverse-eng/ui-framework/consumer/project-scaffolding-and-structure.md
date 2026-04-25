---
slug: project-scaffolding-and-structure
title: "Project Scaffolding and Structure"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader, architect]
optional: false
order-hint: 130
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
