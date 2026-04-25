---
slug: authentication-and-connection
title: "Authentication and Connection"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 230
---

## 13. Authentication and Connection

### 13.1 Connection Strings

#### Development
```
Type: PostgreSQL (or [DBMS])
Host: db-dev.internal.example.com:5432
Database: ecommerce_dev
Username: app_dev
Password: [ask in team Slack #database-access]
Connection pooling: Disabled (useful for development)

Connection string:
postgresql://app_dev:PASSWORD@db-dev.internal.example.com:5432/ecommerce_dev
```

#### Staging
```
Type: PostgreSQL
Host: db-staging.internal.example.com:5432
Database: ecommerce_staging
Username: app_staging
Password: [stored in secrets manager; contact DevOps]
Connection pooling: pgBouncer (pool size 10)

Connection string (use environment variable):
postgresql://app_staging:${DB_PASSWORD}@db-staging.internal.example.com:5432/ecommerce_staging
```

#### Production
```
Type: PostgreSQL
Primary write: db-prod-primary.internal.example.com:5432
Read-only replica: db-prod-ro.internal.example.com:5432
Database: ecommerce
Username: app_prod (service account)
Password: [stored in secrets manager; rotated every 90 days]
Connection pooling: pgBouncer with failover (pool size 50)

Connection string (use environment variable; handles failover):
postgresql://app_prod:${DB_PASSWORD}@db-prod-primary.internal.example.com:5432/ecommerce?
  application_name=ecommerce_api&
  fallback_application_name=ecommerce_api&
  target_session_attrs=read-write
```

### 13.2 Credential Management

**Never:**
- Hardcode passwords in code
- Commit credentials to Git
- Share passwords via email or chat
- Use personal credentials in production

**Always:**
- Use environment variables for development
- Use secrets manager (HashiCorp Vault, AWS Secrets Manager) for staging/production
- Rotate credentials every 90 days
- Use service accounts (not personal accounts) for applications
- Audit credential usage and access

**Development Setup:**
```bash
# Create .env file (in .gitignore)
export DB_HOST=db-dev.internal.example.com
export DB_PORT=5432
export DB_NAME=ecommerce_dev
export DB_USER=app_dev
export DB_PASSWORD=your_password_here

# Load in shell
source .env

# Connect
psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

---

# Part 6 — Data Management
