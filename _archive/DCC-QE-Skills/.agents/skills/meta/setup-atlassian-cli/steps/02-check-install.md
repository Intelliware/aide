---
slug: check-install
sequence: 2
depends-on-prior: true
---

# Step 2 — Check CLI installation

Run after Step 0 has confirmed Node.js ≥ 18.0.0 is available. This step ensures the `tools/atlassian-cli` dependencies are installed and the CLI binary responds correctly.

## Purpose

The atlassian-cli must have its `node_modules` populated before it can run. This step detects whether `npm install` has already been run and only performs the install if needed, so it is safe to re-run and does not waste time reinstalling unnecessarily.

## Sub-steps (run in order)

1. Tell the user: "Checking atlassian-cli installation…"
2. Check whether the directory `tools/atlassian-cli/node_modules` exists in the workspace.
3. **If `node_modules` is absent:**
   - Tell the user: "Dependencies not installed — running `npm install` inside `tools/atlassian-cli/`…"
   - Run the following command from the workspace root:
     ```
     cd tools/atlassian-cli && npm install
     ```
   - Wait for the command to complete. Show the user a summary of the output (package count, any warnings).
   - If `npm install` exits with an error, surface the full error output and halt. Do not proceed. Ask the user to investigate the npm error and re-run this step when resolved.
4. **If `node_modules` is already present:**
   - Tell the user: "Dependencies already installed — skipping `npm install`."
5. Verify the CLI binary responds correctly by running from the `tools/atlassian-cli/` directory:
   ```
   node bin/atl.js --help
   ```
6. **If the help output is printed successfully:**
   - Tell the user: "CLI verified — `atl` is operational."
   - Set install-check = `pass`. Proceed to Step 2.
7. **If the command fails** (node error, missing module, etc.):
   - Surface the full error to the user.
   - Suggest: deleting `node_modules` and re-running `npm install` (`rm -rf tools/atlassian-cli/node_modules && cd tools/atlassian-cli && npm install`).
   - Do not proceed until the CLI help output is printed cleanly.

## Hard gates

- `tools/atlassian-cli/node_modules` MUST exist before the CLI is invoked.
- `node bin/atl.js --help` MUST succeed (exit code 0) before this step is considered complete.
- If `npm install` fails, halt and surface the error — do not attempt to continue with a partial install.

## Exit criteria

- [ ] `tools/atlassian-cli/node_modules` directory exists.
- [ ] `node bin/atl.js --help` ran successfully and its output was shown to the user.
- [ ] install-check is set to `pass`.

## Next

Step 3 — configure-env.
