---
slug: security-design
title: "Security Design"
applies-to: [greenfield-design-package, brownfield-enhancement-spec]
requires-decision-from: [architect, security]
optional: false
order-hint: 8
---

## 8. Security Design

<!-- Security architecture and implementation decisions. -->

### 8.1 Security Overview

[One paragraph describing the overall security approach.]

### 8.2 Authentication Strategy

- **Method:** [e.g., OAuth2/OIDC via Microsoft Entra ID]
- **Flow:** [e.g., Authorization Code Flow with PKCE (frontend) → JWT Bearer (API)]
- **Token Type:** [e.g., Entra ID JWT access token]
- **Token Lifetime:** [e.g., 1 hour, silent refresh via MSAL]

### 8.3 Authorization Model (RBAC)

<!-- How roles and permissions are enforced. -->

**Role Source:** [e.g., Entra ID app roles, mapped from JWT `roles` claim]

**Role Definitions:**

| Role | Entra ID App Role | System Permissions |
|------|-------------------|-------------------|
| [e.g., Administrator] | [e.g., App.Admin] | [e.g., Full CRUD on all entities, user management] |
| [e.g., Resource Manager] | [e.g., App.ResourceManager] | [e.g., Manage practitioners and allocations] |
| | | |

### 8.4 Data Security

| Concern | Approach |
|---------|---------|
| [e.g., Encryption at rest] | [e.g., Azure-managed encryption (TDE)] |
| [e.g., Encryption in transit] | [e.g., TLS 1.2+ enforced] |
| [e.g., PII handling] | [e.g., Minimize collection, encrypt sensitive fields] |
| [e.g., Audit logging] | [e.g., All data modifications logged with user, timestamp, action] |

### 8.5 Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| [e.g., Content-Security-Policy] | [value] | [e.g., Prevent XSS] |
| [e.g., X-Content-Type-Options] | [nosniff] | [e.g., Prevent MIME sniffing] |
| [e.g., Strict-Transport-Security] | [value] | [e.g., Force HTTPS] |
