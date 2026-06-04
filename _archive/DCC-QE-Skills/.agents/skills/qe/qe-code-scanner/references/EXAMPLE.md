# Example — qe-code-scanner

## Scenario: First-time scan triggered by qe-development

**User invokes `qe-development` for JIRA ticket BZC-1234.**

The skill checks for `BB-DCC-QE/docs/KNOWLEDGE.md` — file does not exist.

**Skill says:**
> "docs/KNOWLEDGE.md not found. Running qe-code-scanner to seed codebase knowledge..."

**qe-code-scanner executes Steps 1–10:**
1. Reads `pom.xml` → detects Playwright 1.41.0, Cucumber 7.17.0, Java 17
2. Maps folder structure → identifies 14 step def classes, 37 feature files
3. Deep scans GenericActions.java → finds 45+ utility methods tagged by type
4. Scans all step definitions → extracts exact Gherkin strings
5. Scans page classes → lists public methods
6. Scans feature files → notes tags and backgrounds
7. Reads environments.json → finds 8 environments (DEV11, DEV12, SIT4, SIT5, PAT4, PAT2, WBBPAT1, PROD)
8. Identifies login pattern → tdbcGeneric.userNavigatesToUapPage...
9. Detects conventions → `{page}.{element}.{type}` locator pattern
10. Detects patterns → ConfigManager access, DriverFactory singleton

**Output:** Writes `BB-DCC-QE/docs/KNOWLEDGE.md` (full structured document).

**Skill reports:**
> "Scan complete. KNOWLEDGE.md updated at docs/KNOWLEDGE.md. Found 16 step defs, 45+ utility methods, 37 feature files. Ready."

Control returns to `qe-development` which proceeds with Phase 1.

