---
slug: 01-load-increment
sequence: 1
depends-on-prior: false
---

# Step 1 — Load Increment

## Purpose

Pick the next increment to execute and confirm prerequisites. The increment
selected becomes the locked unit of work for the rest of the per-increment
loop.

## Procedure

1. **Resolve target increment.**
   - If the user named one (e.g., "execute INC-005"), use that.
   - Otherwise, read `{project.paths.implementation_package}/{feature-id}/increment-status.md`
     and pick the lowest-numbered increment whose status is `not-started`
     and whose dependencies are all `completed`.
2. **Read the increment file.** Open
   `{project.paths.implementation_package}/{feature-id}/INC-XXX.md`. Verify all 8
   sections of the Canonical Increment Shape are present. If any section is
   missing or empty, halt — the package failed review or has been edited;
   recommend re-running `review-implementation-package`.
3. **Verify dependency completion.** For every INC ID in the Dependencies
   section, confirm `increment-status.md` shows `completed`. If any
   dependency is not completed, halt — recommend executing the dependency
   first, or accepting the user's explicit decision to proceed (record in
   change tracker).
4. **Verify prerequisites.**
   - The codebase is in a clean state (existing tests pass, working tree
     clean unless the user explicitly authorizes otherwise).
   - Required test environment is available.
   - Required external dependencies (services, sandbox APIs) are reachable.
5. **Read context.**
   - Read the FRs the increment maps to from
     `{project.paths.requirements_package}/{feature-id}/`.
   - Read the relevant design sections from
     `{project.paths.design_package}/{feature-id}/`.
   - If the knowledge base is configured
     (`project.paths.knowledge_base_path`), read the components the
     increment touches.
6. **Mark increment in-progress.** Update `increment-status.md`:
   `not-started` → `in-progress` (record start date).
7. **Announce.** Tell the user which increment is now in flight, with its
   Goal and dependency status.

## Halt conditions

- Missing or malformed increment file → recommend re-running review.
- Dependencies not completed → recommend executing dependency first or
  request explicit user decision.
- Codebase not clean → resolve before proceeding (avoid contaminated test
  baseline).
- Required external dependencies unreachable → log as a blocker and stop.

## Output of this step

- The increment file is loaded into context.
- `increment-status.md` reflects `in-progress` for this increment.
- The user knows which increment is being executed.
