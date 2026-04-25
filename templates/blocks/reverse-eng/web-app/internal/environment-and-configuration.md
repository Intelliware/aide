---
slug: environment-and-configuration
title: "Environment and Configuration"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 120
---

## 2. Environment and Configuration

### 2.1 Prerequisites for Development

| Requirement      | Version     | How to Check        | Installation Link |
|------------------|-------------|---------------------|--------------------|
| Node.js          | [e.g., 18.x] | `node --version`    | [nodejs.org]       |
| npm or yarn      | [e.g., 9.x]  | `npm --version`     | Bundled with Node  |
| Git              | [any]       | `git --version`     | [git-scm.com]      |
| [Other tool]     | [version]   | [Check command]     | [URL]              |

### 2.2 Browser Support

| Browser       | Minimum Version | Notes                                   |
|---------------|-----------------|----------------------------------------|
| Chrome        | [e.g., 110]     | [e.g., "Fully supported"]               |
| Firefox       | [e.g., 109]     | [e.g., "Fully supported"]               |
| Safari        | [e.g., 16.1]    | [e.g., "Fully supported"]               |
| Edge          | [e.g., 110]     | [e.g., "Fully supported"]               |
| Internet Explorer | Not supported   | [e.g., "Use Edge instead"]              |

### 2.3 Installation and Setup

**Clone the repository:**
```bash
git clone [repository-url]
cd [project-directory]
```

**Install dependencies:**
```bash
npm install
# or
yarn install
```

**Configure environment:**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your local settings
# Required variables:
# REACT_APP_API_URL=http://localhost:3001
# REACT_APP_AUTH_DOMAIN=your-auth0-domain.auth0.com
```

**Start development server:**
```bash
npm start
# or
yarn start
```

**Verify setup:**
```bash
# Open browser to http://localhost:3000
# You should see the login page
# Try logging in with test credentials (see .env.example)
```

### 2.4 Environment Variables

<!-- Complete reference of all environment variables. Include defaults and examples. -->

**Frontend Application Configuration:**

| Variable Name          | Type      | Default Value    | Required | Example / Description |
|------------------------|-----------|--------------------|----------|---------------------------|
| `REACT_APP_API_URL`    | String    | `http://localhost:3001` | Yes | Base URL for API calls; varies by environment |
| `REACT_APP_API_TIMEOUT`| Number    | `30000`           | No      | HTTP request timeout in milliseconds |
| `REACT_APP_LOG_LEVEL`  | String    | `'warn'`          | No      | Log level: 'debug', 'info', 'warn', 'error' |
| `REACT_APP_SENTRY_DSN` | String    | (empty)           | No      | Sentry error tracking URL; only in prod |
| `REACT_APP_AUTH_DOMAIN`| String    | (none)            | Yes     | Auth0 domain for authentication |
| `REACT_APP_AUTH_CLIENTID` | String | (none)            | Yes     | Auth0 application client ID |
| `REACT_APP_ENV`        | String    | `'development'`   | No      | Current environment: 'development', 'staging', 'production' |
| `[VARIABLE]`           | `[type]`  | `[default]`       | [Yes/No] | [Description] |

**Example .env.local for local development:**
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
REACT_APP_LOG_LEVEL=debug
REACT_APP_AUTH_DOMAIN=myapp-dev.auth0.com
REACT_APP_AUTH_CLIENTID=YOUR_DEV_CLIENT_ID
REACT_APP_ENV=development
```

### 2.5 Build and Runtime Configuration

**Build Configuration Files:**

- `tsconfig.json`: TypeScript compiler options. Key settings:
  - `target`: [e.g., "ES2020"]
  - `module`: [e.g., "ESNext"]
  - `lib`: [List of libraries, e.g., "ES2020", "DOM"]

- `[Build config file, e.g., webpack.config.js, vite.config.ts]`: [Purpose and key settings]

**Application Configuration Bootstrap:**

<!-- The main application setup file. Show the complete code if possible. -->

```typescript
// src/main.tsx (or app.config.ts, index.tsx, depending on framework)
// This file sets up the application at startup

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import './styles/index.scss';

// Example bootstrap code — show your actual code
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### 2.6 Development Tools and Commands

| Command              | Purpose                                      | Example |
|----------------------|----------------------------------------------|---------|
| `npm start`          | Start development server with hot reload    | Runs on http://localhost:3000 |
| `npm test`           | Run unit and component tests                 | Uses Jest with watch mode |
| `npm run build`      | Create optimized production build            | Output goes to `dist/` folder |
| `npm run lint`       | Check code for style and error issues        | Uses ESLint |
| `npm run format`     | Auto-format code                             | Uses Prettier |
| `npm run type-check` | Check TypeScript types                       | Full type checking without building |
| `npm run e2e`        | Run end-to-end tests                         | Uses Playwright or Cypress |
| [Other command]      | [Purpose]                                    | [Details] |
