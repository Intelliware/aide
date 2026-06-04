---
slug: project-structure-and-conventions
title: "Project Structure and Conventions"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 130
---

## 3. Project Structure and Conventions

Map the on-disk layout so a new maintainer can find anything in 60 seconds. Document the top-level folders, what each one owns, and the naming conventions that govern files inside them. If the suite has a `features/` + `step-definitions/` split (BDD), or a `specs/` + `page-objects/` split (Playwright/Cypress), or a `tests/` + `fixtures/` + `conftest.py` split (pytest), call out the split and the rationale.

Naming conventions are easy to drift on. Spell out the rules — "feature files use kebab-case matching the user-story ID", "page-object classes use PascalCase and end in `Page`", "step-def files mirror the feature folder structure" — and link to a canonical example for each. This is the single highest-leverage block for keeping the suite tidy as it grows.

### Suggested template content

**Top-level layout:**

```
{{repo-root}}/
├── {{spec-or-feature-dir}}/           # {{purpose-1}}
├── {{step-defs-or-page-objects-dir}}/ # {{purpose-2}}
├── {{shared-utilities-dir}}/          # {{purpose-3}}
├── {{fixtures-or-test-data-dir}}/     # {{purpose-4}}
├── {{config-dir}}/                    # {{purpose-5 — runner config, profiles}}
├── {{reports-dir}}/                   # {{purpose-6 — generated outputs}}
└── {{ci-dir}}/                        # {{purpose-7 — pipeline definitions}}
```

**What lives where:**

| Folder | Owner | Contents | Naming convention |
|---|---|---|---|
| `{{spec-or-feature-dir}}/` | scenario authors | {{contents-1}} | {{naming-1 — e.g. "kebab-case, mirrors user-story ID"}} |
| `{{step-defs-or-page-objects-dir}}/` | shared-utility maintainers | {{contents-2}} | {{naming-2}} |
| `{{shared-utilities-dir}}/` | shared-utility maintainers | {{contents-3}} | {{naming-3}} |
| `{{fixtures-or-test-data-dir}}/` | data steward | {{contents-4}} | {{naming-4}} |

**Naming conventions (binding):**

- **Feature / spec files:** {{rule}} — e.g. `<jira-id>-<short-desc>.feature` (Cucumber) or `<area>/<short-desc>.spec.ts` (Playwright)
- **Step-definition files:** {{rule}}
- **Page-object classes:** {{rule}}
- **Fixture files:** {{rule}}
- **Tag vocabulary:** {{rule}} — see the marker-tag-vocabulary block for the full list

**Linked canonical examples:**

- Feature file: `{{example-feature-path}}`
- Step-definition: `{{example-stepdef-path}}`
- Page-object: `{{example-pageobject-path}}`
- Fixture: `{{example-fixture-path}}`

**Anti-patterns observed (call out):** {{anti-patterns — e.g. "Some older specs put waits directly in the scenario file rather than the page object; flag any new code following that pattern"}}

