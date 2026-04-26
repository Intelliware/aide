---
slug: test-plan
title: "Test Plan"
applies-to: [pr-description]
requires-decision-from: [author, reviewer]
optional: false
order-hint: 3
---

## Test Plan

Evidence that the change works and has not regressed neighbours. The
reviewer reads this section to decide whether the change has been
exercised honestly — not to read your test code.

**Format:**

```
## Test Plan

### Automated
- [x] {{test name / file}} — {{what it covers}}
- [x] {{test name / file}} — {{what it covers}}

### Manual / exploratory
- [x] {{scenario}} — {{result}}
- [ ] {{scenario}} — {{still pending, owner: @name}}

### Coverage gaps (intentional)
- {{area}} — {{why deferred, where tracked}}
```

**Rules:**

- List both automated and manual checks. "Tests pass" is not a test plan.
- Tick a checkbox only after the check has actually run on the diff.
- Be honest about coverage gaps and link them to a tracking issue.
- Cite the success criteria from the increment by ID where possible.

**Examples:**

- ✅ "Automated — `auth/test_entra_login.py::test_jit_provision`: covers
  first-login path for a new Entra user. (Increment success criterion
  INC-014/SC-3.)"
- ❌ "All tests pass." (says nothing about *which* tests cover *what*)
- ❌ "Tested manually." (no scenario, no result)

### Common Mistake — listing tests that already existed

The test plan should describe checks that exercise **this** change, not
the entire suite. If the existing suite covers the change, say so
explicitly: "covered by existing `auth/test_login.py`."
