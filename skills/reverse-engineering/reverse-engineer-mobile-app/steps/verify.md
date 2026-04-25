---
slug: verify
sequence: 5
depends-on-prior: true
---

# Step: Verify Extracted Documentation Against Source

Run verification checklists against the extracted documentation to ensure accuracy and completeness.

## When to run

Run at the start of Stage 5 (Verification and Finalization) of the parent reverse-engineer-mobile-app workflow.

## Why verification is non-negotiable

```
Source Code Accuracy → Documentation Accuracy → Downstream Consumer Accuracy
```

Mobile verification is critical because lifecycle and platform-specific behavior is easy to invent wrong, and integration teams (backend, security, marketing for deep links) depend on Part B accuracy.

## Inputs

- All extracted documentation (Part A, Part B)
- Access to the source code
- The artifact inventory from `extraction-status.md`
- The change-tracker

## Process

### 1. Determine Scope

Confirm full vs. section-scoped verification, and source-code accessibility.

### 2. Run the Four Universal Checks

**Completeness Check**
- [ ] All inventoried artifacts have corresponding documentation
- [ ] Extraction status tracker shows 100% complete
- [ ] No placeholder/TODO markers remain
- [ ] Both documentation parts are populated

**Accuracy Check**
- [ ] Every documented behavior traced to a specific source location
- [ ] Default values match actual code defaults
- [ ] Type signatures and request/response shapes are exact
- [ ] No "UNVERIFIED" markers remain unresolved

**Consistency Check**
- [ ] No contradictions between Part A and Part B
- [ ] No internal details leaked into Part B
- [ ] Terminology consistent
- [ ] Cross-references valid

**Change Tracking Check**
- [ ] Every extraction session logged
- [ ] Parts Affected values correct (A / B / Both)
- [ ] Source version recorded
- [ ] Verification status recorded

### 3. Run Domain-Specific Checks (Mobile App)

- [ ] **Platform identified** — Android, iOS, RN, Flutter — and platform-specific sections present
- [ ] **Navigation graph complete** — every screen has at least one entry/exit edge documented
- [ ] **API integration verified** against actual networking code (Retrofit / URLSession / fetch / etc.)
- [ ] **Local storage** documented (Room / Core Data / AsyncStorage / Realm) with schema
- [ ] **Permissions documented** match the actual manifest / Info.plist declarations
- [ ] **Push notification setup** verified (FCM / APNs / OneSignal config and topic/channel structure)
- [ ] **Deep linking / universal links / app links** verified against the actual intent filters / associated domains entitlement
- [ ] **Lifecycle behavior** documented (background → foreground transitions, state preservation, kill-restore behavior)
- [ ] **Offline support** documented if applicable (cache strategy, sync model)

### 4. Spot-Check Against Source

For 3-5 representative features:
1. Read the documentation
2. Read the source (screens + view models + API calls + navigation registration)
3. Compare every documented prop, state field, API endpoint, navigation route, lifecycle hook
4. Flag discrepancies

### 5. Report Results

Produce a verification report.

### 6. Log Verification

Use `track-change` to record the verification activity.

## Output

- Verification report
- Corrections list
- Updated change-tracker entries
- GO/NO-GO determination

## Halt conditions

- Halt if source not accessible
- Halt if inventory missing
- Halt if platform was not identified — domain checks cannot run
- NO-GO on unresolved failures

## Common mistakes

- Skipping platform-specific lifecycle checks
- Inventing deep-link patterns without checking the actual manifest / entitlements
- Trusting README claims about offline support without verifying the cache code path
- Treating spot-checks as sufficient
