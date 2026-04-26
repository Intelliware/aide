# execute-increments — Worked Example

The following is a condensed, realistic execution log for one increment —
INC-002 (Security Baseline) — being executed by this skill. Output is what
the user would see in chat. Code blocks for Plan execution are summarized;
real runs would show the actual TDD cycle.

---

```
> Execute the next increment.

[step 01: load-increment]

Loading next not-started increment: INC-002 (Security Baseline).

Dependencies check:
- INC-001 status: completed (verified 2026-04-22)
✓ Dependencies satisfied.

Prerequisites check:
- Existing test suite: green (mvn -pl api test → 47 tests pass)
- Codebase clean: working tree clean
✓ Prerequisites satisfied.

[step 02: execute-plan — TDD per Plan item]

Plan item 1: Configure Spring Security OAuth2 Resource Server
  RED:    Write failing test SecurityConfigTest#oauth2ResourceServerEnabled
          → mvn test -Dtest=SecurityConfigTest#oauth2ResourceServerEnabled
          → FAILED (expected — no config yet)
  GREEN:  Configure SecurityConfig.java
          → mvn test -Dtest=SecurityConfigTest#oauth2ResourceServerEnabled
          → PASS
  REFACTOR: extract issuer URI to application.yml (no behavior change)
          → re-run: PASS

Plan item 2: Implement Entra JWT validation
  ... (similar TDD cycle)

Plan items 3-6: ... (similar TDD cycles)

[step 03: ai-gate]

Running Automated Verification:
1. mvn -pl api test -Dtest=RoleMapping*
   → 6 tests pass
2. mvn -pl api test -Dtest=AuthnAuthzBehaviorTest
   → 8 tests pass (401/403 paths verified)
3. mvn -pl api verify -Dtest=ApiMeIT
   → 3 integration tests pass against Testcontainers
4. mvn -pl api verify -Dtest=JitProvisioningIT
   → 2 integration tests pass

Expected results check:
✓ Role mapping extracts roles from JWT correctly
✓ Unauthenticated requests return 401
✓ /api/me returns user info for authenticated users
✓ JIT provisioning creates accounts correctly

AI Gate: PASS (fresh evidence from current turn)

[step 04: human-gate]

Human Verification items requiring your sign-off:

1. Entra app roles configured and assigned in tenant
2. A real login can call /api/me end-to-end
3. Role mapping works correctly against a live token

Please confirm each (or report any failure). I will wait for your response
before proceeding.

> Confirmed all three. Tenant config done last week, just verified live
> login + /api/me, roles map correctly.

[step 05: success-criteria]

Verifying Success Criteria:
[x] OAuth2 Resource Server configured       — SecurityConfig.java present
[x] JWT validation works                    — AI Gate evidence
[x] Role mapping works                      — AI Gate evidence
[x] /api/me endpoint functional             — AI Gate evidence
[x] JIT provisioning works                  — AI Gate evidence
[x] RFC7807 errors implemented              — ErrorResponseAdvice.java + 4 error tests pass

All 6 criteria met.

[step 06: status-update]

Updating increment-status.md:
  INC-002 Security Baseline:  in-progress → completed (2026-04-25)

Handing off to update-knowledge-base:
  Affected components: api-auth, api-users
  KB update queued.

INC-002 closed.

Next: INC-003 (Allocation Creation API). Continue or stop here?
```

---

## What this example demonstrates

- **One increment at a time.** The skill loaded INC-002, executed it end to
  end, and stopped at the user-facing checkpoint before INC-003.
- **TDD discipline.** Each Plan item ran a RED-GREEN-REFACTOR cycle. No
  production code was written before a failing test.
- **Fresh verification.** The AI Gate output cites commands run in the
  current turn. There is no "earlier I ran…" or "the subagent said…".
- **Human Gate is a hard wait.** The skill stopped after surfacing the
  Human Gate items and only proceeded after the user confirmed.
- **Success Criteria check is explicit.** Every binary checkbox is verified
  individually — not a global "looks good".
- **Status update + KB handoff.** The increment's row in
  `increment-status.md` flipped to `completed`, and the affected components
  were queued for `update-knowledge-base`.
- **Bug logging not shown here** because no bugs surfaced. If they had, the
  skill would have invoked `manage-bugs` (separate skill) to log them
  rather than writing to `bugs-and-issues-log.md` directly.
- **Vocabulary.** Throughout: "increment", "INC-002". No "phase" anywhere
  except in references to deployment phase (which would be a real ops
  concept, not a chunk-level term).
