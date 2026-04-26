# create-implementation-package — Worked Example

The following is a condensed, real example of one increment file produced by
this skill — `INC-002.md` for a security-baseline increment in an API project.
The full implementation package would also include `INC-001` (DB/ORM platform),
`INC-003+` (domain features), and the four support documents
(`implementation-package.md`, `increment-status.md`, `bugs-and-issues-log.md`,
`change-tracker.md`).

---

```markdown
### INC-002 — Security Baseline (API-only)

#### Increment Identity

**Increment ID**: INC-002
**Increment Name**: Security Baseline (API-only)
**FR Mapping**:
- FR1.9.1 Single Sign-On support
- FR1.9.2 Microsoft Entra ID integration
- FR1.9.4 Role-based access control enforcement

#### Goal

Identity, RBAC, and data-scope enforcement are centralized for every endpoint
before any domain APIs ship.

#### Dependencies

INC-001 DB/ORM Core Platform

#### Plan

1. Configure Spring Security OAuth2 Resource Server
2. Implement Entra JWT validation
3. Implement role mapping from JWT `roles` claim
4. Create `GET /api/me` endpoint
5. Implement JIT `user_account` provisioning by Entra `oid`
6. Implement standard RFC7807 errors for authn/authz failures

#### Outcome

- Spring Security OAuth2 Resource Server is configured
- Entra JWT validation works
- Role mapping from JWT works
- `/api/me` endpoint exists and returns user info
- JIT user provisioning works

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

#### Human Verification (Human Gate)

1. Entra app roles configured and assigned in tenant
2. A real login can call `/api/me` end-to-end
3. Role mapping works correctly against a live token

#### Success Criteria

- [ ] OAuth2 Resource Server configured
- [ ] JWT validation works
- [ ] Role mapping works
- [ ] `/api/me` endpoint functional
- [ ] JIT provisioning works
- [ ] RFC7807 errors implemented
```

---

## Walking through the example

| Section | What this example demonstrates |
|---|---|
| Increment Identity | INC-002 is sequential and unique. Three FRs are listed verbatim from the requirements package — no invention, no editing. |
| Goal | Describes **system state** ("centralized for every endpoint"), not effort ("implement security"). |
| Dependencies | Names the upstream INC by ID ("INC-001"), so the dependency graph is machine-readable. |
| Plan | Six imperative steps. Each starts with an action verb (Configure, Implement, Create) and is concrete enough that another agent could execute it without re-reading the design doc. |
| Outcome | Five measurable deliverables — each is something a reviewer can verify exists. |
| AI Gate | Four specific verification steps, each with an expected result. "Tests pass" would not be acceptable here; "Unit tests for 401/403 behavior" with expected outcomes is. |
| Human Gate | Three judgment calls a human must make — Entra tenant configuration, end-to-end login, and live token role mapping. None of these are automatable, which is the point. |
| Success Criteria | Six binary checkboxes. Each is independently verifiable. The increment is done when all six are checked. |

## Why this shape works

- **Independently executable** — another agent reading just `INC-002.md` plus
  the linked FRs and the design package can execute this increment without
  context from the conversation that produced it.
- **Traceable** — the six FR↔code links go FR1.9.1 → INC-002 → specific
  source files (resolved during execution by `execute-increments`).
- **Verifiable** — both gates are populated. The AI gate handles "does it
  work?", the human gate handles "is it the right thing?".
- **Single-sourced** — the section format spec is not duplicated in this file.
  It comes from `templates/blocks/planning/increment-identity.md`, `goal.md`,
  etc., and is composed via
  `templates/compositions/greenfield-implementation-package.yaml`.
