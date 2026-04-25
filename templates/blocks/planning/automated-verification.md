---
slug: automated-verification
title: "Automated Verification (AI Gate)"
applies-to: [greenfield-implementation-package]
requires-decision-from: [lead-dev, qa]
optional: false
order-hint: 6
---

## Automated Verification (AI Gate)

Part of the **Canonical Increment Shape**.

**Format:**

```
#### Automated Verification (AI Gate)

1. [Test/verification step 1]
2. [Test/verification step 2]
3. ...

**Expected**:
- [Expected result 1]
- [Expected result 2]
- ...
```

**Rules:**

- AI Gates verify **mechanics** (does it work?)
- List specific test commands or verification steps
- Include expected results
- Should be executable by CI/CD or automated test runner
- Use specific commands where possible (e.g., curl, test names, etc.)

**Examples:**

- ✅ "Run Testcontainers migration tests"
- ✅ "Integration tests for CRUD operations"
- ✅ "Test JIT provisioning creates user_account on first login"
- ✅ "Verify constraint violations are rejected"
- ❌ "Test authentication" (too vague)

### Common Mistake — Verification is vague

- Bad: "Test authentication"
- Good: "Integration tests for /api/me endpoint return user info for authenticated users"

### Worked Example

```
#### Automated Verification (AI Gate)

1. Unit tests for role mapping
2. Unit tests for 401/403 behavior
3. Integration tests for `/api/me` endpoint
4. Test JIT provisioning creates `user_account` on first login

**Expected**:

- Role mapping extracts roles from JWT correctly
- Unauthenticated requests return 401
- `/api/me` returns user info for authenticated users
- JIT provisioning creates accounts correctly
```
