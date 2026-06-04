# Phase 4 — Code Output

## Purpose
Generate all code needed to implement the approved BDD scenarios.

## Process

1. Generate code in clearly labelled blocks for each target file
2. Every block must specify:
   - Exact target file path (relative to BB-DCC-QE root)
   - Action: `NEW CLASS` or `ADD TO EXISTING`

### Coding rules (from KNOWLEDGE.md)

**Locator strategy** (Section 21):
- Store ALL locators in `src/test/resources/locators/objectRepo.properties`
- Naming pattern: `{page}.{element}.{type}` (e.g. `fileTransfer.uploadButton.button`)
- Priority: ID → data-attribute → name → CSS class → XPath text → XPath structural
- Access via `ConfigManager.getProperty("key")`
- Never hardcode selectors in Java code

**Utility method usage** (Section 3):
- Always use GenericActions methods (click, enterText, selectFromDropdown, etc.)
- Never call raw Playwright API (page.click, page.fill) directly
- Use TableUtils for all table interactions
- Use appropriate wait methods (waitForElementVisible, waitForPageLoad)

**Step definition conventions** (Section 13):
- Class suffix: `StepDef` or `Steps`
- Step wording matches project style from Section 8
- One action per method, brief comment above each

**Framework patterns** (Section 14):
- Access page via `DriverFactory.getPage()`
- Locators from `ConfigManager.getProperty(key)`
- Content text from `ConfigManager.getcontentText(key)`
- State sharing via `TestContext` / `ScenarioContext`

### Write code-output.md

Write to `features/<JIRA-ID>/code-output.md`:

```markdown
# Code Output — <JIRA-ID>

## New Locators (objectRepo.properties)
​```properties
# <page> locators
page.element.type=<selector>
​```

## Step Definitions
​```java
// Target: src/test/java/stepdefinitions/<File>.java
// Action: ADD TO EXISTING / NEW CLASS

// <brief description>
@And("<exact Gherkin wording>")
public void methodName(String param) {
    // implementation using GenericActions/utilities
}
​```

## Page Methods (if needed)
​```java
// Target: src/main/java/framework/app/<path>/<File>.java
// Action: ADD TO EXISTING / NEW CLASS
​```

## Feature File
​```gherkin
// Target: src/test/resources/features/<path>/<name>.feature
// Action: NEW FILE
​```

## Locator Verification Notes
> All generated locators are suggestions — verify in DevTools before committing.
```

## Checkpoint

> "Phase 4 complete. Review the code above. Reply APPROVED or tell me what to fix."

## Exit criteria
- code-output.md written to features/<JIRA-ID>/
- All code follows project conventions
- User has approved Phase 4

