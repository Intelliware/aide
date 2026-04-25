---
slug: environment-and-configuration
title: "Environment and Configuration"
applies-to: [re-ui-framework-consumer]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 120
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
