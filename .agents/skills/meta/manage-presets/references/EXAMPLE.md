# Example — manage-presets

## Scenario: Discovering and installing a compliance preset

A team wants to adopt an enterprise compliance preset from an add-on repo.

### Step 1: Discover available presets

```
> /manage-presets discover

Scanning workspace folders for presets...

Available Presets
=================

Name                     Status       Source                                    Description
----                     ------       ------                                    -----------
enterprise-compliance    Available    {workspace}/aide-enterprise/presets/...   SOX/SOC2 compliance gates
team-conventions         Available    {project-root}/presets/team-conventions   Team coding standards

Legend: Enabled = active, Disabled = registered but inactive, Available = not yet installed

Install a preset? Enter name or 'skip': enterprise-compliance
```

### Step 2: Install the preset

```
Validating preset at {workspace}/aide-enterprise-addon/presets/enterprise-compliance...
  - preset.toml found and valid
  - Name: enterprise-compliance
  - Version: 1.0.0
  - Requires: A.I.D.E. >= 2.3.0 ✓

Checking for conflicts...
  - No conflicts detected

Installing preset 'enterprise-compliance' from {workspace}/aide-enterprise-addon/presets/enterprise-compliance

Files in this preset:
- customizations/create-requirements-package.toml — Adds compliance-callout block
- customizations/review-implementation-package.toml — Requires compliance sign-off gate

Installed preset 'enterprise-compliance' to presets.toml

The preset is enabled and will take effect on the next skill invocation.
```

### Step 3: Verify the installation

```
> /manage-presets show enterprise-compliance

Preset: enterprise-compliance
==============================

Description:  SOX/SOC2 compliance gates for regulated environments
Version:      1.0.0
Requires:     A.I.D.E. >= 2.3.0
Tags:         compliance, enterprise, regulated

Status: Enabled (registered in presets.toml)
Source: {workspace}/aide-enterprise-addon/presets/enterprise-compliance

Conflicts with: minimal-docs, fast-iteration
Extends:        (none)

Customization Files
-------------------

1. create-requirements-package.toml
   Skill:   create-requirements-package
   Summary: Adds compliance-callout block and requires regulatory-impact section

2. review-implementation-package.toml
   Skill:   review-implementation-package
   Summary: Requires compliance sign-off gate before GO verdict

Merge Order
-----------

1. framework.toml
2. project.toml
3. [presets]
   a. enterprise-compliance (enabled) ← this preset
4. customizations/<skill>.toml (wins over presets)
```

---

## Scenario: Disabling a preset temporarily

A developer wants to disable a preset for testing without removing it.

```
> /manage-presets disable enterprise-compliance --personal

Preset 'enterprise-compliance' is now disabled.

Note: This change is in your personal registry (presets.user.toml).
Team members will still see this preset as enabled.

Created presets.user.toml
Updated .gitignore with: presets.user.toml
```

---

## Scenario: Showing a preset before installing

A user wants to inspect what a preset contains before deciding to install.

```
> /manage-presets show {workspace}/aide-minimal/presets/minimal-docs

Preset: minimal-docs
====================

Description:  Reduced documentation for rapid prototyping
Version:      0.5.0
Requires:     A.I.D.E. >= 2.0.0
Tags:         minimal, prototype, fast

Status: Not installed
Source: {workspace}/aide-minimal/presets/minimal-docs

Conflicts with: enterprise-compliance
Extends:        (none)

Customization Files
-------------------

1. create-requirements-package.toml
   Skill:   create-requirements-package
   Summary: Suppresses optional artifacts (competitive-analysis, stakeholder-map)

2. create-design-package.toml
   Skill:   create-design-package
   Summary: Skips architecture-decision-records, uses lightweight templates

Install this preset? [y/N]: n
```

---

## Resulting presets.toml

After the examples above, `{project-root}/presets.toml` contains:

```toml
# Preset registry — managed by skills/meta/manage-presets
# Edit via the skill or by hand; both are supported.
# See config/SCHEMAS.md § 2.11 for schema.

[[presets]]
name = "enterprise-compliance"
source = "{workspace}/aide-enterprise-addon/presets/enterprise-compliance"
enabled = true
```

And `{project-root}/presets.user.toml` (gitignored) contains:

```toml
# Personal preset registry — managed by skills/meta/manage-presets
# This file overrides presets.toml for this user only.

[[presets]]
name = "enterprise-compliance"
enabled = false    # Personal override
```
