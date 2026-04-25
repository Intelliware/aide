# PR Description Template

## Summary

<!-- 2-4 sentences: What does this PR do and why? Link to the phase and requirements. -->

**Phase:** PHASE-NNN — [Phase Name]
**Requirements:** FR-NNN, FR-NNN

[Brief description of what this PR implements and the user-facing impact.]

## Changes

<!-- Group changes by category. Use the commit types as a guide. -->

### Features
- [Description of new capability]

### Fixes
- [Description of bug fix] (if applicable)

### Refactoring
- [Description of restructuring] (if applicable)

### Configuration
- [Description of config changes] (if applicable)

## Files Changed

<!-- Generated from git diff --stat. Group by area. -->

| Area | Files | Change Type |
|------|-------|-------------|
| [module/layer] | `path/to/file.ts` | Created / Modified / Deleted |
| [module/layer] | `path/to/file.test.ts` | Created / Modified / Deleted |

## Design Decisions

<!-- Key decisions made during implementation. Pull from commit body action lines. -->

- **[Decision area]:** [What was chosen and why]
- **Rejected alternative:** [What was considered and why it was discarded]

## Testing

### Automated Tests
- **Unit tests:** N new, N modified — all passing
- **Integration tests:** N new, N modified — all passing (if applicable)
- **Component tests:** N new, N modified — all passing (if applicable)
- **Full suite:** N total tests, 0 failures, 0 skipped

### Test Commands
```bash
[command to run tests]
```

### Manual Test Plan
<!-- Steps for the reviewer to manually verify. -->

1. [Step 1 — setup]
2. [Step 2 — action]
3. [Step 3 — expected result]

## Breaking Changes

<!-- Only if applicable. Describe what breaks and how to migrate. -->

- **What breaks:** [description]
- **Migration:** [steps to update]

## Checklist

- [ ] All tests pass
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Documentation updated (if applicable)
- [ ] Breaking changes documented (if applicable)
- [ ] Commits follow conventional commit format
