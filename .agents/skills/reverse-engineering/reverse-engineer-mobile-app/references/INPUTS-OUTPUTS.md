# reverse-engineer-mobile-app — Inputs and Outputs

## Inputs

### Required

- **Repository path** — absolute path to the mobile app repo's root.
- **Platform identification** — Android / iOS / React Native / Flutter (elicited if not obvious).
- **Source version** — taken from `build.gradle`, `Info.plist`/Marketing Version, `package.json`, or git tag.

### Optional

- Existing app documentation, app store listings, deployment runbooks
- Crash analytics or instrumentation reports (reveal real user paths)
- App store screenshots (reveal actual screen flows)

### Elicitation

Reference: `references/elicitation-patterns/repo-scope-discovery.md`. Used to confirm:
- Repository path and version
- Platform(s) supported
- Architecture pattern (MVVM / MVI / Clean Architecture / Redux / etc.)
- API integration approach (Retrofit / URLSession / fetch wrapper / GraphQL client)
- Local storage approach (Room / CoreData / AsyncStorage / Realm)
- Push notification provider (FCM / APNs / OneSignal)
- Deep linking model (intent filters / URL schemes / universal links / app links)
- Distribution (Google Play, App Store, internal track, beta channel)
- Scope exclusions (deprecated screens, legacy navigation flows)

### Project.toml driving values

```toml
[[project.repos]]
code = "orderhub-android"
name = "OrderHub Android"
path = "../orderhub-android"
role = "mobile"
type = "kotlin-android"
```

## Outputs

### Part A — Internal documentation (stays in source repo)

Default location: `<repo>/docs/mobile-app-internal/` driven by `re-mobile-app-internal.yaml`. Coverage:

- App overview and purpose
- Architecture (pattern, module/feature organization)
- Navigation graph (full)
- Screen reference (per screen: purpose, view model, state, API calls, navigation entries/exits)
- State management
- API integration layer
- Authentication and authorization
- Local storage and caching
- Push notifications
- Permissions
- Deep linking / universal links / app links
- Lifecycle behavior (background/foreground, state preservation, kill-restore)
- Background processing / WorkManager / BGTasks
- Offline support and sync model
- Build, signing, and distribution
- Testing strategy

### Part B — Overview & integration guide

Location: `{paths.knowledge_base_path}/source-docs/<repo-slug>/mobile-app-consumer.md` driven by `re-mobile-app-consumer.yaml`. Coverage:

- App purpose and key features
- Platforms supported
- APIs consumed (which backends? which versions?)
- Deep linking integration (URLs partner teams can use)
- Push notification topics / channels
- Authentication / SSO integration points
- Distribution and release cadence
- Team ownership and contact
- Quick-reference link to Part A for contributors

### Side artifacts

- `extraction-status.md` — inventory checklist
- `CHANGE-TRACKER.md` — Parts Affected = A / B / Both

## Hand-off contract

`build-knowledge-base` consumes:
- Part B path
- Repo-slug
- `last_verified_against_commit` SHA
- Cross-references to APIs consumed (so KB can build dependency edges to RE'd API repos)
