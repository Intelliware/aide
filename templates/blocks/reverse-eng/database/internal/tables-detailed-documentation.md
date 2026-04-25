---
slug: tables-detailed-documentation
title: "Tables — Detailed Documentation"
applies-to: [re-database-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 150
---

## 5. Tables — Detailed Documentation

### [Table Name] (Example: `users`)

#### 5.1.1 Entity Overview

- **Formal Name:** Users
- **Alias:** None
- **Description:** Registered users of the platform who can create orders, manage account settings, and receive communications
- **Approximate Row Count:** [e.g., 2.5M]
- **Row Size:** [e.g., ~500 bytes average]
- **Growth Rate:** [e.g., ~10K new users/day]
- **Update Frequency:** Real-time (created, updated as users interact with platform)
- **Volatility:** Low (records rarely deleted; mostly updates to settings)
- **Archival Strategy:** Users 5+ years inactive are moved to `users_archive` table

#### 5.1.2 Column Definitions

| Column | Type | Nullable | Constraint | Default | Business Definition | Example | Notes |
|--------|------|----------|-----------|---------|-------------------|---------|-------|
| `user_id` | UUID | NO | PK | `gen_random_uuid()` | Unique identifier for user. Immutable. | `550e8400-e29b-41d4-a716-446655440000` | Generated at insert |
| `email` | VARCHAR(255) | NO | UQ, CK | — | Primary email address for user. Lowercased and trimmed. Used for login. | `alice@example.com` | Applied constraint: `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z\|a-z]{2,}$'` |
| `password_hash` | VARCHAR(255) | NO | — | — | Bcrypt hash of password. Never store plaintext. | `$2b$12$R9h7cIPz0gi...` | Update only through change password endpoint |
| `first_name` | VARCHAR(100) | NO | — | — | User's given name. | `Alice` | May contain accented characters; use Unicode normalization |
| `last_name` | VARCHAR(100) | NO | — | — | User's family name. | `Smith` | May contain accented characters; use Unicode normalization |
| `phone` | VARCHAR(20) | YES | — | NULL | Phone number in E.164 format. Nullable (not all users provide). | `+14155552671` | Normalized to E.164 format; validation at application layer |
| `is_active` | BOOLEAN | NO | — | `true` | Whether account is active. Inactive users cannot login. | `true` | Updated by change-password and deactivation workflows |
| `created_at` | TIMESTAMP | NO | — | `CURRENT_TIMESTAMP` | Timestamp when user account was created. UTC timezone. | `2024-01-15 10:23:45 UTC` | Set at insert; never updated |
| `updated_at` | TIMESTAMP | NO | — | `CURRENT_TIMESTAMP` | Timestamp when user record was last updated. UTC timezone. | `2024-02-20 14:50:12 UTC` | Updated by trigger `tr_users_updated_at` |
| `deleted_at` | TIMESTAMP | YES | — | NULL | Timestamp when user was deleted (soft delete). NULL if not deleted. | `2024-03-10 09:15:00 UTC` | Soft delete flag; records never hard-deleted |

#### 5.1.3 Constraints

**Primary Key:**
```sql
CONSTRAINT pk_users PRIMARY KEY (user_id)
```
- **Purpose:** Uniquely identify each user
- **Type:** UUID, auto-generated
- **Implications:** Every user must have a unique ID; never reuse IDs even after deletion

**Unique Constraint (Email):**
```sql
CONSTRAINT uk_users_email UNIQUE (email)
```
- **Purpose:** Prevent duplicate email registrations
- **Enforcement:** Database level ensures uniqueness
- **Violation Error:** "Duplicate key value violates unique constraint 'uk_users_email'"
- **Application Handling:** Catch error at application layer; offer "Email already exists, try login" message
- **Note:** Emails are lowercased before insertion to handle case-insensitivity

**Check Constraint (Email Format):**
```sql
CONSTRAINT ck_users_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
)
```
- **Purpose:** Ensure email looks valid (basic validation)
- **Business Rule:** Only valid email formats are stored
- **Violation Error:** "New row for relation 'users' violates check constraint 'ck_users_email_format'"
- **Application Handling:** Validate before sending to database; use RFC 5322 or send verification email

#### 5.1.4 Indexes

| Index Name | Columns | Type | Strategy | Size | Purpose | Query Examples |
|------------|---------|------|----------|------|---------|-----------------|
| `pk_users` | `user_id` | B-Tree (PK) | — | ~100 MB | Primary key index; used for lookups by ID | `SELECT * FROM users WHERE user_id = '550e8400-...'` |
| `uk_users_email` | `email` | B-Tree (UNIQUE) | — | ~80 MB | Unique constraint index; used for login by email | `SELECT * FROM users WHERE email = 'alice@example.com'` |
| `ix_users_created_at` | `created_at` | B-Tree | — | ~60 MB | Sort and filter by creation date | `SELECT * FROM users WHERE created_at > NOW() - INTERVAL '30 days' ORDER BY created_at DESC` |
| `ix_users_is_active` | `is_active` | B-Tree | — | ~40 MB | Filter active users; combined with other predicates | `SELECT COUNT(*) FROM users WHERE is_active = true` |
| `ix_users_updated_at` | `updated_at` | B-Tree | — | ~60 MB | Sort and filter by update time; used for sync/replication | `SELECT * FROM users WHERE updated_at > ? ORDER BY updated_at` |

#### 5.1.5 Triggers

| Trigger Name | Event | Purpose | Side Effects |
|--------------|-------|---------|--------------|
| `tr_users_updated_at` | BEFORE UPDATE | Automatically update `updated_at` to current timestamp | Sets `updated_at = CURRENT_TIMESTAMP` |
| `tr_users_audit_log` | AFTER INSERT/UPDATE/DELETE | Log all user changes to audit table | Inserts row into `users_audit` with action, timestamp, user ID |
| `tr_users_cache_invalidate` | AFTER UPDATE | Invalidate cache entries for modified user | Publishes message to cache invalidation queue |

**Trigger Details:**

```sql
-- tr_users_updated_at: Always set updated_at to now
CREATE TRIGGER tr_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END;
```

#### 5.1.6 Soft Delete Behavior

Users are never hard-deleted from this table. Instead, `deleted_at` is set to the deletion timestamp.

**Query Impact:**
```sql
-- Standard query (excludes deleted)
SELECT * FROM users WHERE deleted_at IS NULL;

-- Include deleted records
SELECT * FROM users;  -- No WHERE clause

-- Recently deleted (recovery window)
SELECT * FROM users WHERE deleted_at BETWEEN NOW() - INTERVAL '30 days' AND NOW();
```

**Restore Behavior:**
```sql
-- To restore a deleted user
UPDATE users SET deleted_at = NULL WHERE user_id = '550e8400-...';
```

#### 5.1.7 Relationships

**Outgoing Foreign Keys:** None from this table.

**Incoming Foreign Keys:**

| Source Table | FK Constraint | Cardinality | Cascade Rule | Implications |
|--------------|---------------|-------------|--------------|--------------|
| `orders` | `fk_orders_user_id → users.user_id` | 1:M (one user has many orders) | ON DELETE RESTRICT | Cannot delete user if they have orders. Delete orders first. |
| `addresses` | `fk_addresses_user_id → users.user_id` | 1:M (one user has many addresses) | ON DELETE CASCADE | Deleting user cascades to addresses (hard-deleted). |
| `user_settings` | `fk_user_settings_user_id → users.user_id` | 1:1 (one user has one settings record) | ON DELETE CASCADE | Deleting user cascades to settings. |

**Dependency Analysis:**
```
To delete a user:
1. Soft-delete is preferred: SET deleted_at = NOW()
2. If hard-delete required: DELETE all addresses first, then user settings, then user
   (or rely on CASCADE for addresses and settings)
3. Cannot delete if user has orders (FK ON DELETE RESTRICT)
   → Option: DELETE orders first OR move to archive table
```

#### 5.1.8 Special Behaviors

**Email Case-Insensitivity:**
```sql
-- Emails are stored lowercase
INSERT INTO users (email, ...) VALUES (LOWER('Alice@Example.COM'), ...);

-- Query for email (case-insensitive)
SELECT * FROM users WHERE LOWER(email) = LOWER('alice@example.com');
-- OR use case-insensitive collation
SELECT * FROM users WHERE email ILIKE 'alice@example.com';
```

**Timestamp Handling:**
```
All timestamps are in UTC timezone.
- Application layer converts user local time → UTC before storing
- Application layer converts UTC → user local time when displaying
Never store timestamps with timezone info to a TIMESTAMP column (store to TIMESTAMPTZ)
```

**Password Hash Security:**
```
- Password hashes use Bcrypt (cost factor 12)
- Never log, export, or compare passwords
- Hash changes require verification (old password or email verification)
- Never allow plaintext password in logs or error messages
```

---

### [Additional Tables Follow Same Pattern]

<!-- Repeat section 5.1 for each table: orders, products, order_items, etc. -->
