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

<!-- Capture the actual runtime, package manager, and tools the codebase needs.
The rows below are illustrative — replace with what the repo really uses
(Node/npm/pnpm/yarn/bun, Python/pip/poetry, Ruby/bundler, .NET SDK, Go,
Rust/cargo, JDK/Maven/Gradle, Deno, Bun, etc.). -->

| Requirement      | Version     | How to Check        | Installation Link |
|------------------|-------------|---------------------|--------------------|
| [Runtime — e.g., Node.js / Python / Ruby / .NET SDK / Go / JDK] | [e.g., 20.x] | [version check command] | [URL] |
| [Package manager — e.g., npm / pnpm / yarn / bun / pip / poetry / bundler / dotnet / cargo / go modules / Maven / Gradle] | [e.g., 9.x] | [version check command] | [URL] |
| Git              | [any]       | `git --version`     | [git-scm.com]       |
| [Other tool — e.g., Docker, language-specific compiler, native build tools] | [version] | [Check command] | [URL] |

### 2.2 Browser Support

| Browser       | Minimum Version | Notes                                   |
|---------------|-----------------|----------------------------------------|
| Chrome        | [e.g., 110]     | [e.g., "Fully supported"]               |
| Firefox       | [e.g., 109]     | [e.g., "Fully supported"]               |
| Safari        | [e.g., 16.1]    | [e.g., "Fully supported"]               |
| Edge          | [e.g., 110]     | [e.g., "Fully supported"]               |
| Internet Explorer | Not supported   | [e.g., "Use Edge instead"]              |

### 2.3 Installation and Setup

<!-- Use the package manager actually found in the repo. Examples below substitute
`<pm>` for the real tool — npm / pnpm / yarn / bun / pip / poetry / bundle / dotnet
restore / cargo / go mod / mvn / gradle. -->

**Clone the repository:**
```bash
git clone [repository-url]
cd [project-directory]
```

**Install dependencies:**
```bash
<pm> install
# Examples by ecosystem:
#   npm install / pnpm install / yarn install / bun install
#   pip install -r requirements.txt / poetry install
#   bundle install
#   dotnet restore
#   cargo build
#   go mod download
#   mvn dependency:resolve / gradle dependencies
```

**Configure environment:**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your local settings — required variables vary by stack;
# see section 2.4 for the full list discovered in this codebase.
```

**Start development server:**
```bash
<pm> [run] start
# Examples:
#   npm start / pnpm dev / yarn dev / bun dev
#   python manage.py runserver / flask run / uvicorn app:app --reload
#   bundle exec rails server
#   dotnet run
#   cargo run
#   go run .
#   mvn spring-boot:run / gradle bootRun
```

**Verify setup:**
```bash
# Open browser to [the dev server's URL — typically http://localhost:[port]]
# You should see [the app's entry view — e.g., login page, dashboard]
# Try [the smoke action — e.g., logging in with test credentials from .env.example]
```

### 2.4 Environment Variables

<!-- Complete reference of all environment variables actually used by the app.
Naming convention varies by stack:
  - Vite-based apps:           VITE_*
  - Create React App / Webpack: REACT_APP_*
  - Next.js (server):           plain names; (browser-exposed): NEXT_PUBLIC_*
  - Vue CLI:                    VUE_APP_*
  - Nuxt:                       NUXT_*  / NUXT_PUBLIC_*
  - Angular:                    no runtime prefix; baked at build time via environment.ts files
  - Svelte/SvelteKit:           PUBLIC_* (browser-exposed)
  - Astro:                      PUBLIC_*
  - Server-rendered (Rails/Django/Laravel/.NET): plain names, read server-side only
Use whichever convention this codebase actually follows. -->

**Application Configuration (rows below are illustrative — replace with actual variables):**

| Variable Name            | Type      | Default Value           | Required | Example / Description |
|--------------------------|-----------|-------------------------|----------|---------------------------|
| `[PREFIX_]API_URL`       | String    | `http://localhost:3001` | Yes      | Base URL for API calls; varies by environment |
| `[PREFIX_]API_TIMEOUT`   | Number    | `30000`                 | No       | HTTP request timeout in milliseconds |
| `[PREFIX_]LOG_LEVEL`     | String    | `'warn'`                | No       | Log level: 'debug', 'info', 'warn', 'error' |
| `[PREFIX_]SENTRY_DSN`    | String    | (empty)                 | No       | Error-tracking DSN; only set in prod |
| `[PREFIX_]AUTH_DOMAIN`   | String    | (none)                  | Yes      | Auth provider domain (e.g., Auth0, Cognito, Okta, Keycloak, Azure AD, Clerk) |
| `[PREFIX_]AUTH_CLIENT_ID`| String    | (none)                  | Yes      | Auth provider client / application ID |
| `[PREFIX_]ENV`           | String    | `'development'`         | No       | Current environment: 'development', 'staging', 'production' |
| `[VARIABLE]`             | `[type]`  | `[default]`             | [Yes/No] | [Description] |

**Example .env.local for local development (illustrative — substitute the prefix this codebase uses):**
```bash
PREFIX_API_URL=http://localhost:3001
PREFIX_API_TIMEOUT=30000
PREFIX_LOG_LEVEL=debug
PREFIX_AUTH_DOMAIN=myapp-dev.auth-provider.example
PREFIX_AUTH_CLIENT_ID=YOUR_DEV_CLIENT_ID
PREFIX_ENV=development
```

### 2.5 Build and Runtime Configuration

<!-- Document the actual build / config files found in the repo. Examples per stack:
  - JS/TS bundlers:    vite.config.ts, webpack.config.js, rollup.config.js, esbuild.config.js, tsconfig.json
  - Next.js:           next.config.js + tsconfig.json
  - Angular:           angular.json + tsconfig.json
  - Svelte/SvelteKit:  svelte.config.js + vite.config.js
  - Rails:             config/application.rb, config/environments/*.rb
  - Django:            settings.py, settings/*.py
  - .NET:              .csproj, appsettings*.json
  - Spring/Java:       pom.xml or build.gradle, application.yml
  - Phoenix/Elixir:    mix.exs, config/*.exs -->

**Build / Configuration Files (replace with real files):**

- `[primary build config]` — [purpose and key settings]
- `[type-checker / compiler config — e.g., tsconfig.json, .babelrc, mypy.ini, .eslintrc, ruff.toml]` — [purpose]
- `[environment / settings file]` — [purpose]

**Application Bootstrap:**

<!-- Show the real entry-point / bootstrap code from this codebase. The snippet
below is illustrative for a React 18 + Redux + Vite app — replace with the
codebase's actual entry file in its real language and framework. The shape
("acquire mount node → wire DI / state → render root component") is universal;
syntax varies. -->

```typescript
// Illustrative: src/main.tsx (React + Redux)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import './styles/index.scss';

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

Equivalent shapes in other stacks:
- **Vue 3:** `createApp(App).use(pinia).use(router).mount('#app')`
- **Angular:** `bootstrapApplication(AppComponent, appConfig)` in `main.ts`
- **Svelte 5 / SvelteKit:** `mount(App, { target: document.getElementById('root') })`
- **Solid:** `render(() => <App />, document.getElementById('root'))`
- **Next.js / Nuxt / Astro:** entry is implicit — convention-driven file routing handles bootstrap.
- **Server-rendered (Rails/Django/Laravel/.NET MVC):** entry is the framework's HTTP request lifecycle, not a client-side mount.

### 2.6 Development Tools and Commands

<!-- Replace `<pm>` and the script names with what the codebase actually defines
(package.json scripts, Rakefile tasks, Makefile targets, mix tasks, dotnet CLI
targets, gradle tasks, etc.). -->

| Command                      | Purpose                                      | Example |
|------------------------------|----------------------------------------------|---------|
| `<pm> [run] start` / `dev`   | Start development server with hot reload    | Runs on http://localhost:[port] |
| `<pm> test`                  | Run unit / component tests                   | Uses [test runner] |
| `<pm> [run] build`           | Create optimized production build            | Output goes to `[dist / build / out / public / target / bin] folder` |
| `<pm> [run] lint`            | Check code for style and error issues        | Uses [linter — ESLint / Rubocop / Pylint / Ruff / dotnet format / golangci-lint / Checkstyle] |
| `<pm> [run] format`          | Auto-format code                             | Uses [formatter — Prettier / Black / Rubocop / Ruff format / dotnet format / gofmt / google-java-format] |
| `<pm> [run] type-check`      | Check static types (if applicable)           | [TS: tsc --noEmit / Python: mypy / Ruby: Sorbet/Steep / Java/.NET: compile-time] |
| `<pm> [run] e2e`             | Run end-to-end tests                         | Uses [E2E runner — Playwright / Cypress / WebdriverIO / Selenium] |
| [Other command]              | [Purpose]                                    | [Details] |
