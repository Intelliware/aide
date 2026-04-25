# create-pr — Worked Example

The following shows a realistic create-pr session: a working tree containing
an INC-002 implementation, an adversarial review that finds two issues, a
fix cycle, atomic commit creation, and PR creation.

---

```
> Create a PR for these changes.

[step 1: diff review — 4 lenses]

Working tree:
  - 11 files modified, 4 files added
  - +423 lines, -27 lines

LENS 1 (BLIND):
  Reading diff alone …
  Findings:
    - [Important] SecurityConfig.java line 47: hardcoded "issuer-uri"
      string. Should be sourced from configuration.
    - [Minor] AuthnExceptionHandler.java line 22: returns "Unauthorized"
      string; should return RFC7807 ProblemDetail per project standard.

LENS 2 (SPEC COMPLIANCE):
  Reading INC-002 (Security Baseline) and mapped FRs (FR1.9.1, FR1.9.2,
  FR1.9.4) …
  Findings:
    - [Critical] AC says "JIT user provisioning by Entra `oid`" but
      JitProvisioningService maps by email, not oid. Will fail on email
      changes in Entra.

LENS 3 (STANDARDS COMPLIANCE):
  Reading _assets/standards/languages/java/error-handling.md …
  Findings:
    - [Important] AuthnExceptionHandler not using RFC7807 (already noted
      from blind review; severity confirmed)

LENS 4 (CODEBASE INTEGRATION):
  Reading project-context.md, surrounding files …
  Findings:
    - [Minor] New service uses public final fields; project convention is
      private final fields with constructor injection.

CONSOLIDATED FINDINGS:
  Critical: 1 (JIT provisioning maps by email instead of oid)
  Important: 2 (hardcoded issuer-uri; missing RFC7807)
  Minor: 2 (Unauthorized string; field visibility)

VERDICT: Cannot proceed to commit. Fix Critical and Important findings
first.

[step 2: fix cycle]

Fixing in working tree …
  - JitProvisioningService: switched key from email to entra-oid claim;
    added test JitProvisioningByOidTest (RED → GREEN).
  - SecurityConfig: extracted issuer-uri to application.yml.
  - AuthnExceptionHandler: rewrote to return ProblemDetail per RFC7807;
    updated 4 existing tests; added 2 new error-shape tests.
  - (Minor findings: also fixed since they were small.)

Re-running tests:
  mvn -pl api test
  → 47 + 8 new = 55 tests pass.

Re-running review LENSES 1-3 (Critical fix changed code in scope of these
lenses):
  All Critical and Important findings resolved.
  No new findings.

[step 3: commit creation]

Proposed atomic commits:

1. feat(api-auth): JIT-provision user by Entra oid
   Body: oid is the stable identifier; email can change.
   Implements: INC-002
   Traceability: FR1.9.2, FR1.9.4

2. refactor(api-auth): extract issuer-uri to application.yml
   Body: avoid hardcoded environment-specific config.
   Implements: INC-002

3. feat(api-error): RFC7807 ProblemDetail for authn/authz errors
   Body: aligns with project error-handling standard.
   Implements: INC-002
   Traceability: FR1.9.4

4. style(api-auth): convert public final fields to private with DI
   Body: align with project convention.
   Implements: INC-002

Approve commit creation? (yes / edit / no)

> Approve.

Creating commits …
  ✓ commit 1 (sha a1b2c3d)
  ✓ commit 2 (sha b2c3d4e)
  ✓ commit 3 (sha c3d4e5f)
  ✓ commit 4 (sha d4e5f6a)

[step 4: PR description]

Generating PR description …

  ## Summary
  - Add OAuth2 Resource Server with Entra JWT validation
  - Implement role mapping from JWT roles claim
  - Add /api/me endpoint with JIT user provisioning by Entra oid
  - Adopt RFC7807 ProblemDetail for authn/authz errors

  ## Increments / FRs implemented
  - INC-002 (Security Baseline) — implements FR1.9.1, FR1.9.2, FR1.9.4

  ## Changes
  - api-auth: SecurityConfig, JwtRoleMapper, JitProvisioningService
  - api-users: ApiMeController
  - api-error: AuthnExceptionHandler with RFC7807 ProblemDetail
  - config: issuer-uri externalized to application.yml

  ## Test Plan
  - [x] Unit: mvn -pl api test (55 tests)
  - [x] Integration: mvn -pl api verify (5 ITs)
  - [x] Human gate confirmed: real login → /api/me works end-to-end

  ## Related
  - Requirements: requirements-package/requirements/05-frs.md (FR1.9.*)
  - Design: design-package/design/05-backend-design.md#auth
  - Implementation package: implementation-package/INC-002.md

[step 5: PR creation]

Approve PR creation against base 'main'? (yes / no)

> Yes.

Running gh pr create …
  ✓ PR #234 created: https://github.com/acme/api/pull/234

[step 6: changelog]

Project maintains CHANGELOG.md. Append entry?

> Yes, please.

Appending CHANGELOG.md …
  ## Unreleased
  ### Added
  - OAuth2 Resource Server with Entra JWT validation (#234)
  - /api/me endpoint with JIT user provisioning (#234)
  ### Changed
  - Authentication errors now use RFC7807 ProblemDetail (#234)

✓ create-pr complete. PR URL: https://github.com/acme/api/pull/234
```

---

## What this example demonstrates

- **Adversarial review.** Five findings in total — including a Critical
  spec-compliance issue that would have shipped a real defect (oid vs.
  email mapping) had review been skipped.
- **Review before commit.** The Critical fix happened in the working tree
  before the first commit was created. History stays clean.
- **Atomic commits.** Four logical commits, not one mega-commit. Each
  commit references INC-002 and (where relevant) FRs.
- **Explicit approval gates.** Two: before commit and before PR. The skill
  never ran `git commit` or `gh pr create` without authorization.
- **PR description has traceability.** Increment ID, FRs, design section,
  and test commands are all named. A reviewer can navigate from the PR
  body to the spec without searching.
- **Conditional changelog.** Only because the project has CHANGELOG.md.
- **No "phase" anywhere.** The vocabulary is "increment" and "INC-002".
