---
slug: check-node
sequence: 1
depends-on-prior: true
---

# Step 1 — Check Node.js availability

Hard gate. Run before any other step. The atlassian-cli requires Node.js ≥ 18.0.0. This step confirms Node is installed and at an acceptable version before any further work is attempted.

## Purpose

TD machines require Node to be installed via a managed updater tool — it cannot be downloaded and installed directly. This step surfaces the exact TD-approved process so the user knows what to request and where to go, rather than searching for instructions themselves.

## Sub-steps (run in order)

1. Tell the user: "Checking Node.js availability…"
2. Run the following command in a terminal:
   ```
   node --version
   ```
3. Parse the version string (e.g. `v20.11.0`). Extract the major version number.
4. **If Node is present AND major version ≥ 18:**
   - Tell the user: "Node.js `<version>` found — requirement met."
   - Set node-check = `pass`. Proceed to Step 1.
5. **If Node is absent** (command not found / not recognized):
   - Display the full install instructions block below.
   - Set node-check = `blocked`.
6. **If Node is present but major version < 18** (e.g. v16.x):
   - Tell the user their current version, then explain it is below the required minimum of 18.
   - Display the full install instructions block below (the updater will upgrade to latest).
   - Set node-check = `blocked`.

## TD Node.js install instructions (display verbatim when node-check = `blocked`)

```
Node.js is not available at the required version (18+) on this machine.
Follow these steps to get it installed via the TD-approved process:

1. Request the "Node Updater" from the TD Service Portal:
   https://tdbfg.service-now.com/myhelpdesk?id=sc_cat_item&sys_id=d2642640ebea92d06902f318cad0cddb&referrer=recent_items
   (Open this link in your browser and submit the request.)

2. Once approved, open the Software Center on your machine and install
   the Node Updater application.

3. After installation, launch the "Node Updater" application from your
   Start menu or desktop.

4. Inside the Node Updater, choose to install the latest version of Node.js
   and follow the prompts.

5. Once complete, open a NEW terminal window (so PATH is refreshed) and
   tell me when you are ready. I will re-check the Node version.
```

## Hard gates

- Do NOT proceed to Step 1 until `node --version` returns a version ≥ 18.0.0.
- If the user says the updater is not yet approved or the install is taking time, acknowledge and wait. Do not attempt workarounds (portable Node, nvm, manual download) — the TD managed process must be used.
- After the user says Node is installed, re-run `node --version` and confirm the version before advancing.

## Exit criteria

- [ ] `node --version` has been run and the output has been shown to the user.
- [ ] The version is confirmed ≥ 18.0.0 (major version check only; minor/patch do not matter).
- [ ] node-check is set to `pass`.

## Next

Step 2 — check-install.
