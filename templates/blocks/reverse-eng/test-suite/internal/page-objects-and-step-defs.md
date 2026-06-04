---
slug: page-objects-and-step-defs
title: "Page Objects and Step Definitions"
applies-to: [re-test-suite-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 170
---

## 7. Page Objects and Step Definitions

Inventory the page-object (UI-suite) and step-definition (BDD-suite) layers. These are the second-largest reuse surface after shared utilities, and they're where stale locators and duplicated step phrasings accumulate. Document one page object / step-def file per logical surface and call out the canonical phrasing for any step that has been re-written in three different ways across the suite.

For UI suites, every page object should expose a small, intention-revealing API (`asLoggedInMerchant()`, `submitCheckout(items)`) rather than a thin wrapper over the runner API. For BDD suites, the step catalogue should make duplicate phrasings impossible to miss — if `Given the user is logged in` and `Given I am authenticated` both exist, document them side-by-side with a recommendation.

### Suggested template content

**Page-object inventory (UI suites):**

| Page object | Source | Surface covered | Public methods | Owner |
|---|---|---|---|---|
| `{{po-1}}` | `{{path-1}}` | {{surface-1 — e.g. "/checkout pages"}} | `{{methods-1}}` | {{owner-1}} |
| `{{po-2}}` | `{{path-2}}` | {{surface-2}} | `{{methods-2}}` | {{owner-2}} |

**Page-object design contract:**

- Locators are private; never exposed off the class.
- Public methods are intention-revealing verbs, never raw element returns.
- Each PO owns its own waits; no caller-side `waitForSelector`.
- Inheritance via a `BasePage` is allowed for genuinely cross-cutting concerns only.
- Locator strategy preference (highest to lowest): `{{strategy-1 — e.g. role + accessible-name}}` > `{{strategy-2 — e.g. data-testid}}` > `{{strategy-3 — e.g. CSS}}` > `{{strategy-4 — e.g. XPath}}` (XPath only as a last resort).

**Step-definition inventory (BDD suites):**

| Step phrasing | Source | Parameters | Calls into | Canonical? |
|---|---|---|---|---|
| `Given {{phrasing-1}}` | `{{path-1}}` | `{{params-1}}` | `{{calls-1}}` | ✅ canonical |
| `Given {{phrasing-2}}` | `{{path-2}}` | `{{params-2}}` | `{{calls-2}}` | ⚠️ duplicate of above — use canonical |
| `When {{phrasing-3}}` | `{{path-3}}` | `{{params-3}}` | `{{calls-3}}` | ✅ canonical |
| `Then {{phrasing-4}}` | `{{path-4}}` | `{{params-4}}` | `{{calls-4}}` | ✅ canonical |

**Step-definition design contract:**

- Step definitions are thin: they translate the natural-language phrasing into a single call to the shared-utility / page-object layer.
- Business logic, branching, and waits do NOT belong in step-defs.
- New step phrasings MUST be checked against this table first to avoid duplicates — see `create-quality-package`'s reuse-analysis pass.

**Known duplicate-phrasing remediation queue:** {{queue — list any duplicates planned for consolidation, with the canonical target and the deprecation deadline}}

