---
slug: security-and-access-control
title: "Security and Access Control"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 220
---

## 12. Security and Access Control

### 12.1 Role-Based Access Control (RBAC)

Database access is controlled by roles with specific permissions.

| Role | Purpose | Users | Permissions |
|------|---------|-------|-----------|
| `db_admin` | Database administration | DBA team | All permissions on all objects |
| `app_user` | Application service account | Production app (read/write) | INSERT/UPDATE/DELETE on transactional tables; SELECT on all tables |
| `app_readonly` | Reporting/analytics (read-only) | Reporting service, BI tools | SELECT only; no INSERT/UPDATE/DELETE |
| `analyst` | Data analyst (ad-hoc queries) | Analytics team | SELECT on all tables; no INSERT/UPDATE/DELETE |
| `support` | Customer support (limited write) | Support team | SELECT all; UPDATE on limited tables (user_settings); no DELETE |

**Permission Matrix:**

| Role | users | orders | products | audit_logs |
|------|-------|--------|----------|-----------|
| **db_admin** | ALL | ALL | ALL | ALL |
| **app_user** | SELECT,INSERT,UPDATE | SELECT,INSERT,UPDATE | SELECT | SELECT |
| **app_readonly** | SELECT | SELECT | SELECT | SELECT |
| **analyst** | SELECT | SELECT | SELECT | SELECT |
| **support** | SELECT | SELECT | SELECT | SELECT |

### 12.2 Row-Level Security (RLS)

Some tables have RLS policies that restrict data visibility based on the current user.

**Example: Support Team Can Only See Their Assigned Users**

```sql
-- Policy: support_team can only see users assigned to them
CREATE POLICY rls_support_user_visibility ON users
FOR SELECT
USING (
    -- If you're db_admin, see all
    current_user_id() IN (SELECT user_id FROM db_admins)
    OR
    -- If you're support, see only assigned users
    user_id IN (
        SELECT user_id FROM support_assignments
        WHERE support_user_id = current_user_id()
    )
);
```

**Application Developer Impact:**
- Queries automatically filtered by RLS
- Example: Support user queries `SELECT * FROM users` → only sees their assigned users
- No special code needed; filtering happens at database layer
