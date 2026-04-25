---
slug: environment-and-configuration
title: "Environment and Configuration"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 120
---

## 2. Environment and Configuration

### 2.1 Prerequisites

| Dependency             | Required Version | Notes                                |
|------------------------|------------------|--------------------------------------|
| [Language/Runtime]     | [e.g., Node 20.x]| [e.g., "LTS only."]                 |
| [Package manager]      | [e.g., pnpm 9.x] |                                      |
| [Database]             | [e.g., PostgreSQL 16] |                                  |
| [Cache]                | [e.g., Redis 7.x] |                                     |
| [Message broker]       | [e.g., RabbitMQ 3.13] |                                  |
| [Other infra]          | [version]        | [notes]                              |

### 2.2 Local Development Setup

```bash
# Step-by-step commands to go from git clone to running locally
# 1. Clone and install
git clone [repo]
cd [repo]
[install command, e.g., pnpm install]

# 2. Start infrastructure (database, cache, etc.)
[e.g., docker compose up -d]

# 3. Run migrations
[e.g., pnpm run migrate]

# 4. Seed development data (if applicable)
[e.g., pnpm run seed]

# 5. Start the API
[e.g., pnpm run dev]

# 6. Verify
[e.g., curl http://localhost:3000/health]
```

### 2.3 Configuration Management

<!-- How configuration is loaded, structured, and accessed in code. -->

- **Configuration source:** [e.g., "Environment variables loaded via `.env` files, validated at startup with Zod schemas."]
- **Configuration access pattern:** [e.g., "Injected via `ConfigService`, never read from `process.env` directly."]

**Configuration schema:**

```typescript
// The complete configuration type/schema — showing every config key the app uses.
// AI needs this to know what config is available when implementing features.

interface AppConfig {
  port: number;                       // Default: 3000
  nodeEnv: 'development' | 'staging' | 'production';

  database: {
    host: string;
    port: number;                     // Default: 5432
    name: string;
    user: string;
    password: string;                 // Source: DB_PASSWORD env var
    poolSize: number;                 // Default: 10
    ssl: boolean;                     // Default: true in production
  };

  redis: {
    host: string;
    port: number;                     // Default: 6379
    password?: string;
  };

  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;             // Default: '15m'
    refreshTokenExpiresIn: string;    // Default: '7d'
  };

  // ... document EVERY config key
}
```

**Environment variable mapping:**

| Config Key              | Env Variable          | Required | Default            |
|-------------------------|-----------------------|----------|--------------------|
| `database.host`         | `DB_HOST`             | Yes      | —                  |
| `database.port`         | `DB_PORT`             | No       | `5432`             |
| `auth.jwtSecret`        | `JWT_SECRET`          | Yes      | —                  |
| [key]                   | [env var]             | [y/n]    | [default]          |

### 2.4 Environment-Specific Behaviors

| Behavior                        | Development            | Staging                | Production             |
|---------------------------------|------------------------|------------------------|------------------------|
| [e.g., "SQL query logging"]     | [Enabled — verbose]    | [Enabled — slow only]  | [Disabled]             |
| [e.g., "Email sending"]         | [Mocked / logged]      | [Sandbox provider]     | [Live provider]        |
| [e.g., "Rate limiting"]         | [Disabled]             | [Enabled — relaxed]    | [Enabled — strict]     |
| [e.g., "CORS origins"]          | [`localhost:*`]        | [`staging.example.com`]| [`app.example.com`]    |
| [behavior]                      | [dev]                  | [staging]              | [prod]                 |
