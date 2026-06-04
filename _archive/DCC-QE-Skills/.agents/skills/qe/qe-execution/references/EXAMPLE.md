# Example — qe-execution

## Scenario: Run newly developed tests after qe-development hand-off

**Hand-off from qe-development:** Tag `@BZC-5678`, environment PAT4

**Skill confirms:**
> "Running tag `@BZC-5678` against PAT4 (local mode). Proceed?"

User confirms.

**Skill builds command:**
```powershell
Set-Location C:\Users\TAS8231\workspace\qe-tool-integration-2\BB-DCC-QE
mvn compile exec:java "-Dexec.mainClass=debugger.CucumberDebugger" "-Dexec.classpathScope=test" "-Dexec.args=@BZC-5678" "-Denv=PAT4"
```

**Skill executes and reports:**

```markdown
## Test Execution Results

**Tag:** @BZC-5678
**Environment:** PAT4
**Mode:** local
**Duration:** 2m 15s

### Summary
- ✅ Passed: 2
- ❌ Failed: 1
- ⏭️ Skipped: 0

### Failures
| # | Scenario | Error | Category |
|---|---|---|---|
| 1 | User successfully uploads a valid CSV file | AssertionError: Expected "Success" but was "Failed: Invalid format" | Assertion failure |

### Reports
- HTML: target/final-cucumber-report/
- Screenshots: screenshots/FAILED_fileTransfer_uploadCSV.png
```

**Skill offers:**
> "There was 1 test failure. Would you like to review it? Invoke qe-defect-review to walk through the failure and determine root cause."

