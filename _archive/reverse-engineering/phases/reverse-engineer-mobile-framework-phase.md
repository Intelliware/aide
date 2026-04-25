# Reverse Engineer Mobile Framework Documentation - Instructions

**Purpose:** Comprehensive reference for reverse-engineering mobile frameworks, SDKs, and reusable libraries (Android AARs, iOS frameworks via CocoaPods/SPM, React Native modules, design system components, and utility libraries). Produces two complementary documentation sets from a single source of truth that serve framework developers and mobile app developers who consume the framework.

**Target Audience:** Framework maintainers, mobile library developers, technical writers, developers tasked with documenting an undocumented or under-documented mobile framework, and AI assistants performing documentation extraction.

**Source Documents:** Mobile-Framework-Doc-Template.md, UI-Framework-Doc-Template.md (structural patterns), canonical-reverse-engineering-shape.md (core methodology), change-tracker-template.md.

**Platforms Covered:** Android (AAR/Gradle), iOS (CocoaPods/SPM), React Native (npm), and cross-platform design systems/utilities.

---

## Table of Contents

- [What is Mobile Framework Documentation Reverse Engineering?](#what-is-mobile-framework-documentation-reverse-engineering)
- [The Two-Part Documentation Model](#the-two-part-documentation-model)
- [Why This Matters — Impact on Downstream Mobile App Development](#why-this-matters--impact-on-downstream-mobile-app-development)
- [Core AI Principles for Mobile Framework Documentation](#core-ai-principles-for-mobile-framework-documentation)
- [The 7-Step Workflow for Mobile Framework Documentation](#the-7-step-workflow-for-mobile-framework-documentation)
- [Documentation Package Components](#documentation-package-components)
- [Platform-Specific Considerations](#platform-specific-considerations)
- [Phase-by-Phase Extraction Process](#phase-by-phase-extraction-process)
- [Change Tracking for Mobile Framework Documentation](#change-tracking-for-mobile-framework-documentation)
- [Scaffolding Approach — Structure Before Content](#scaffolding-approach--structure-before-content)
- [Best Practices for Mobile Frameworks](#best-practices-for-mobile-frameworks)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Prompt Templates and Examples](#prompt-templates-and-examples)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## What is Mobile Framework Documentation Reverse Engineering?

### Definition

Reverse-engineering mobile framework documentation is the disciplined process of **reading an existing mobile framework's source code, build configuration, native implementations, and tests** and producing structured, accurate documentation that enables both framework maintainers and mobile app developers to work effectively.

This framework documentation applies to:
- **Android libraries (AAR):** Gradle-distributed Android packages with optional Java/Kotlin code and native bindings
- **iOS frameworks (CocoaPods/SPM):** Swift and Objective-C frameworks distributed via CocoaPods or Swift Package Manager
- **React Native modules:** JavaScript modules that bridge to native code via the React Native bridge
- **Cross-platform design systems:** UI component libraries, token systems, and theme utilities used across multiple platforms
- **Mobile utilities:** Networking, authentication, analytics, localization, and other shared mobile libraries

This is NOT:
- Guessing what the framework does based on its name or README
- Writing aspirational documentation for features that don't exist
- Copying gradle/podspec/package.json metadata without verification
- Documenting only the JavaScript/Kotlin surface without understanding platform-specific behavior

This IS:
- Systematically reading source code across all platforms to extract the truth
- Understanding platform lifecycle integration, permissions, and native capabilities
- Documenting how the framework handles platform-specific concerns (background execution, lifecycle, memory)
- Organizing findings into a known template structure with platform-specific sections
- Producing two audience-specific views: framework developers (Part A) and mobile app developers (Part B)
- Creating living documentation that can be maintained as the framework evolves across platforms

### Key Characteristics

- **Platform-Aware:** Documentation accounts for Android-specific, iOS-specific, and React Native-specific behaviors
- **Architecture-Informed:** Understanding of platform packaging (AAR, Pod/SPM, npm), lifecycle integration, and native bridging
- **Two-Part Output:** One comprehensive document set for framework maintainers, one for mobile app developers using the framework
- **Template-Aligned:** Output follows the Mobile Framework Documentation Template structure
- **Change-Tracked:** All documentation changes are logged for auditability and version alignment
- **Native-Integrated:** Covers native module dependencies, permissions, lifecycle hooks, platform-specific configuration
- **AI-Optimized:** Structured so AI assistants can generate correct code across all supported platforms

### What Belongs in Mobile Framework Documentation

| **Include in Documentation** | **Do NOT Include** |
| --- | --- |
| Public APIs for all supported platforms (Android, iOS, React Native) | Speculative features or planned-but-unbuilt functionality |
| Platform lifecycle integration (onCreate, onDestroy, viewDidLoad, etc.) | Assumed lifecycle behavior not verified against code |
| Actual native module bridging code for React Native | Invented bridging APIs |
| Packaging metadata (AAR manifests, podspec, package.json properties) | Outdated or unverified package metadata |
| Platform-specific permissions required | Permissions not actually needed |
| Design tokens and theming mechanisms per platform | Design tokens that don't exist in any platform |
| Verified performance characteristics and memory behavior | Assumed performance without profiling evidence |
| Native dependency versions (Android, iOS) | "Latest" or approximate versions |
| Installation and setup for each package manager | Installation steps that don't work |
| Actual build configuration (Gradle, Xcode, Metro) | Build configs from documentation that weren't tested |

**Guiding Principle:** If you cannot point to the line of source code that proves a documented behavior, do not document it as fact. Flag it as "needs verification" instead.

---

## The Two-Part Documentation Model

### Overview

Mobile framework documentation is managed centrally but published in two parts. Both parts derive from the same extraction process but serve different audiences with different needs. Documentation is **technology-agnostic at the model level** but includes platform-specific sections where implementation differs.

### Part A: Framework Documentation (Full)

**Audience:** Framework developers, platform maintainers, contributors, library SDK teams.

**Scope:** Everything — internal architecture, native implementations (Java/Kotlin, Swift/Objective-C, C++), build pipelines, testing infrastructure, native permissions and capabilities, platform lifecycle integration, private APIs, performance internals, and the complete public API for all platforms.

**Purpose:**
- Enable maintenance and evolution of the framework across all platforms
- Document platform-specific implementations and WHY they were designed that way
- Record internal patterns, conventions, and platform constraints
- Provide the complete source of truth from which Part B is derived
- Document native dependency management and binary distribution

**Includes (in addition to everything in Part B):**
- Platform-specific implementation details (Java/Kotlin internals for Android, Swift internals for iOS, native bridge architecture for React Native)
- Native module bridging code and JSI interface specifications (React Native)
- Build pipeline details (Gradle tasks, Xcode build phases, Metro bundler configuration)
- Native permission handling and platform capability requirements
- Internal platform lifecycle hooks and state management
- Binary distribution pipeline (Maven Central, CocoaPods trunk, npm registry)
- Internal test utilities, fixtures, and platform-specific testing
- Performance profiling results and optimization decisions
- Native dependency trees and version constraints
- Deprecation and migration implementation details for each platform

### Part B: Implementer Documentation (Consumer-Facing)

**Audience:** Mobile app developers who USE the framework to build applications. They do NOT develop the framework itself. Includes iOS, Android, and React Native developers.

**Scope:** Public interfaces, classes, components, services, extension points, configuration options, theming, patterns, recipes, anti-patterns, and testing utilities for each platform. Platform-specific sections clearly delineate where behavior differs.

**Purpose:**
- Enable mobile app developers to use the framework correctly and efficiently across their target platforms
- Document how to install, configure, customize, and extend the framework per platform
- Provide platform-agnostic recipes for common use cases plus platform-specific implementation notes
- Define anti-patterns to prevent misuse
- Serve as context for AI-assisted code generation targeting specific platforms

**Explicitly Excludes:**
- Internal implementation details (how a component renders internally, native module JSI bridge internals)
- Private methods, internal classes, and internal APIs
- Build and publish pipeline details (that's Part A)
- Framework-internal test utilities (only consumer-facing test helpers)
- Source code organization of the framework itself

**Key Difference from Part A:** Platform-specific sections answer "how do I use this on iOS vs. Android?" not "how is this implemented in Swift vs. Kotlin?"

### Relationship Between Parts

```
Source Code (Single Source of Truth — Multi-Platform)
        │
        ├── Android Source (Gradle, Java/Kotlin, native JNI)
        ├── iOS Source (Swift/Objective-C, Xcode, CocoaPods/SPM)
        ├── React Native Source (JavaScript, native bridge, Metro)
        └── Shared assets (design tokens, styles, schemas)
        │
        ├──→ Extraction Process (this guide — platform-aware)
        │         │
        │         ├──→ Part A: Full Framework Documentation
        │         │         (All platforms, all internals)
        │         │
        │         └──→ Part B: Implementer Documentation
        │                   (All platforms, public APIs only)
        │
        └──→ Change Tracker (logs changes per platform and shared)
```

**Rules:**
- Part B is always a **strict subset** of Part A
- Any information in Part B must also exist in Part A
- Part A may contain platform-specific internals that are deliberately excluded from Part B
- Platform-specific sections must be clearly labeled in both parts
- When Part A changes for one platform, evaluate whether Part B needs updating across all platforms
- The Change Tracker records changes per platform

### How to Decide Where Content Goes

| **Ask Yourself** | **If Yes → Part A Only** | **If No → Both Parts** |
| --- | --- | --- |
| Does this describe an internal native implementation detail? | ✅ | |
| Does this describe how the native bridge works (React Native)? | ✅ | |
| Does this describe internal Gradle/Xcode configuration? | ✅ | |
| Does an app developer need to know this to use the framework? | | ✅ Both Parts |
| Does this describe a public class, method, or component? | | ✅ Both Parts |
| Does this describe how to extend or configure the framework? | | ✅ Both Parts |
| Does this describe platform-specific setup steps? | | ✅ Both Parts |
| Does this describe the build/publish pipeline? | ✅ | |
| Does this describe a permission or platform capability needed by consumers? | | ✅ Both Parts |

---

## Why This Matters — Impact on Downstream Mobile App Development

### Impact on Mobile App Developers

Accurate mobile framework documentation directly enables:
- **Correct cross-platform usage** — developers implement correctly on all target platforms without trial-and-error
- **Consistent patterns** — teams follow the same approach across iOS, Android, and React Native
- **Faster onboarding** — new developers learn the framework from documentation, not by reading multiple platform implementations
- **Platform-specific optimization** — developers understand how to leverage platform capabilities (background execution, permissions, lifecycle)
- **AI-assisted development** — AI assistants generate correct platform-specific code when given accurate documentation as context
- **Fewer bugs** — anti-patterns are documented, preventing common mistakes per platform

### Impact on AI-Assisted Code Generation

AI assistants need to generate platform-specific code correctly. Poor mobile framework documentation leads to:
- AI inventing plausible but wrong API surfaces per platform
- AI generating code that compiles but ignores platform lifecycle or permissions
- AI using deprecated patterns
- AI missing required native permissions, capabilities, or build configuration
- AI generating code that works on one platform but fails on another
- AI missing platform-specific imports, providers, or initialization

**Critical Insight:** The Mobile Framework Documentation Template is specifically structured to give AI assistants the information they need to generate correct, platform-aware code in the order they need it.

### The Quality Chain (Multi-Platform)

```
Accurate Source Code (All Platforms) → Accurate Documentation (All Platforms) → Correct Code Generation (Per Platform)
         (Truth across iOS, Android, RN)      (Extracted Truth)           (Applied Truth per Platform)
```

If documentation drifts from source code on any platform, every downstream consumer — human and AI — produces incorrect work.

---

## Core AI Principles for Mobile Framework Documentation Extraction

> **Universal Principles:** See `canonical-reverse-engineering-shape.md` § Core AI Principles for Documentation Extraction for the six universal principles. Below are the Mobile Framework-specific applications.

### 1. AI is Intelligent, But Not Smart — Mobile Framework Application

**How to apply:**
- Have AI read Android, iOS, and React Native implementations separately before synthesizing cross-platform documentation
- After AI documents a component, verify every public API on the actual source code on each platform
- Check default values against actual source code (ProGuard defaults, CocoaPods specs, package.json fields)
- Verify type signatures exactly on each platform (Kotlin's Int vs. Swift's Int32 vs. JavaScript's number serialization)

### 2. Context is Critical — Mobile Framework Application

**How to apply:**
- Provide all build configuration files (build.gradle.kts, Podspec, package.json) for version and dependency context
- Provide AndroidManifest.xml and Info.plist templates for permission/capability context
- Have AI read shared types and platform-specific type implementations before documenting platform-specific APIs
- Document framework overview and core architecture BEFORE diving into platform-specific components

### 3. AI Will Try to Do More Than Asked — Mobile Framework Application

**How to apply:**
- Be explicit: "Document ONLY APIs that exist in the source code on each platform. Do NOT invent platform-specific variants."
- After AI documents a component, ask it to show the exact line in Android source, iOS source, and React Native bridge that proves each documented API
- Prevent AI from documenting unverified assumptions about platform capability (e.g., "this works on all Android versions")

### 4. Token Limitations Affect Depth — Mobile Framework Application

**How to apply:**
- Document one component or service at a time, not the entire framework at once
- For complex components, break extraction into: API surface first, then behaviors, then edge cases per platform
- Document shared types and interfaces globally once, then reference them for each platform
- Process Android, iOS, and React Native implementations in separate focused sessions if the combined documentation exceeds token limits

### 5. Verification is Non-Negotiable — Mobile Framework Application

**How to apply:**
- After AI documents each component, verify every property, method, and callback against source code on each platform
- Run unit or integration tests on each platform to verify documented behavior works as written
- Check example code for correctness by reading the actual implementations side-by-side
- Verify build configuration examples on fresh projects before documenting (especially Gradle, Podfile, app.json)

### 6. AI Has Short Memory — Mobile Framework Application

**How to apply:**
- At the start of each extraction session, have AI read the framework overview and shared types already extracted
- Reference the cross-platform architecture and established conventions from previous sessions
- Use the scaffolding structure and extraction status tracker as the map for what's documented and what remains
- Enforce platform terminology consistency by referencing what's been established

---

## The 7-Step Workflow for Mobile Framework Documentation

> **Universal Workflow Structure:** See `canonical-reverse-engineering-shape.md` § The 7-Step Workflow for the universal process. Below are the mobile framework-specific prompt templates and extraction order.

### Domain-Specific 7-Step Prompts for Mobile Framework Extraction

**Step 1 & 2 Combined — Set Context & Identify Source Files:**

```
"We are reverse-engineering documentation for [FRAMEWORK NAME], which provides
[purpose] on Android, iOS, and React Native. We are producing two documentation
sets: Part A (full framework docs for maintainers) and Part B (implementer docs
for app developers). Currently documenting [SECTION/COMPONENT].

For Android (Kotlin), source files are in [path].
For iOS (Swift), source files are in [path].
For React Native, source files are in [path].

Extract and document ONLY what exists in the source code on each platform."
```

**Step 3 — Refine Feedback:**

```
"Verify your understanding:
- On Android, the framework uses Kotlin/Java. Show both if applicable.
- On iOS, it uses Swift/Objective-C. Document both if applicable.
- On React Native, this API crosses the JavaScript-native bridge and is async.
- This framework requires [minSdkVersion], [minIOSVersion], [minRNVersion].
- Installation is via [Gradle/CocoaPods/SPM/npm].

Confirm before proceeding with extraction."
```

**Step 4 — Create Scaffolding (Structure ONLY, no content):**

```
"Based on the Mobile Framework Documentation Template, propose the scaffolding
structure for [FRAMEWORK NAME] covering Android, iOS, and React Native. Show:
- File structure for Part A (full framework docs)
- File structure for Part B (implementer docs)
- Section headers (without content)
- Platform-specific subsections
- Recommended extraction order

Structure ONLY. Do NOT extract content yet."
```

**Step 7 — Verify Understanding Before Documenting:**

```
"Before we document [Component/Service], confirm you've found:
- Android: Show every public method/property from [source file]
- iOS: Show every public method/property from [source file]
- React Native: Show every exported function from [source file]
- Shared types used by this component: [list them]
- Required build configuration on each platform: [list them]
- Required permissions: [Android list], [iOS list], [React Native list]

List all artifacts you found, then we'll extract documentation for each."
```

### Recommended Extraction Order

1. Framework overview and cross-platform architecture
2. Platform-specific architecture (Android module structure, iOS framework structure, React Native bridge)
3. Environment and configuration (Gradle, CocoaPods/SPM, package.json, build requirements)
4. Installation and setup per platform and package manager
5. Shared types, interfaces, and enums (with platform-specific equivalents)
6. Design tokens and theming per platform
7. Components — one at a time, documented for all platforms simultaneously
8. Services — one at a time, documented for all platforms simultaneously
9. Platform-specific integrations (permissions, lifecycle, native capabilities)
10. Native module bridging (React Native) or JNI/FFI (Android/iOS)
11. Patterns and recipes (showing implementation on each platform)
12. Anti-patterns per platform
13. Testing utilities (per-platform test helpers)
14. Migration and versioning notes

---

## Documentation Package Components

### File Structure

```
docs/framework/
├── README.md                          # Index, relationships, how to maintain
├── CHANGE-TRACKER.md                  # All documentation changes, per platform
│
├── part-a-full/                       # Part A: Full Framework Documentation
│   ├── 01-framework-overview.md
│   ├── 02-platform-architecture/      # Part A ONLY
│   │   ├── 02-01-android-architecture.md
│   │   ├── 02-02-ios-architecture.md
│   │   └── 02-03-react-native-architecture.md
│   ├── 03-environment-configuration.md
│   ├── 04-build-publish-pipeline/     # Part A ONLY
│   │   ├── 04-01-android-gradle-pipeline.md
│   │   ├── 04-02-ios-xcode-pipeline.md
│   │   └── 04-03-react-native-metro-pipeline.md
│   ├── 05-design-tokens-theming.md
│   ├── 06-components/
│   │   ├── 06-00-component-index.md
│   │   ├── 06-01-[category]-components.md    # Platform-specific subsections
│   │   └── ...
│   ├── 07-services/
│   │   ├── 07-00-service-index.md
│   │   ├── 07-01-[service-name].md
│   │   └── ...
│   ├── 08-platform-integration/       # Part A ONLY
│   │   ├── 08-01-android-lifecycle-permissions.md
│   │   ├── 08-02-ios-lifecycle-capabilities.md
│   │   └── 08-03-react-native-bridge.md
│   ├── 09-native-modules-bindings.md  # Part A ONLY
│   ├── 10-shared-types-interfaces.md
│   ├── 11-native-dependencies.md      # Part A ONLY
│   ├── 12-performance-internals.md    # Part A ONLY
│   ├── 13-internal-patterns.md        # Part A ONLY
│   ├── 14-common-patterns-recipes.md
│   ├── 15-anti-patterns.md
│   ├── 16-error-handling.md
│   ├── 17-testing-infrastructure.md   # Part A ONLY
│   ├── 18-accessibility.md
│   ├── 19-migration-upgrade.md
│   ├── 20-glossary.md
│   ├── 21-quick-reference.md
│   └── appendix-a-reference-apps.md   # Per-platform reference apps
│
├── part-b-implementer/                # Part B: Implementer Documentation
│   ├── 01-framework-overview.md
│   ├── 02-environment-configuration.md
│   ├── 03-installation-setup.md       # Platform-specific installation instructions
│   ├── 04-design-tokens-theming.md
│   ├── 05-components/
│   │   ├── 05-00-component-index.md
│   │   ├── 05-01-[category]-components.md
│   │   └── ...
│   ├── 06-services/
│   │   ├── 06-00-service-index.md
│   │   ├── 06-01-[service-name].md
│   │   └── ...
│   ├── 07-platform-integration.md     # How to use platform features
│   ├── 08-shared-types-interfaces.md
│   ├── 09-common-patterns-recipes.md
│   ├── 10-anti-patterns.md
│   ├── 11-error-handling.md
│   ├── 12-testing.md                  # Consumer testing utilities
│   ├── 13-accessibility.md
│   ├── 14-migration-upgrade.md
│   ├── 15-glossary.md
│   ├── 16-quick-reference.md
│   └── appendix-a-reference-apps.md   # Per-platform sample projects
│
└── reference/
    ├── extraction-status.md           # Tracks documented artifacts per platform
    ├── platform-matrix.md             # Feature/API availability per platform
    ├── version-compatibility.md       # Package version compatibility matrix
    └── verification-log.md            # Verification results per platform
```

### Extraction Status Tracker (Platform-Aware)

**Purpose:** Track which parts of the framework have been documented, noting platform coverage.

**Location:** `docs/framework/reference/extraction-status.md`

**Format:**

```markdown
# Extraction Status

## Summary
- Total components: [X]
- Documented (All platforms): [Y]
- Documented (Partial platforms): [Z]
- Verified (All platforms): [W]
- Remaining: [V]

## Components

| Component | Android | iOS | React Native | All Platforms | Verified | Notes |
|-----------|---------|-----|--------------|---------------|----------|-------|
| Button | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Dialog | ✅ | ✅ | 🔵 Not Started | 🟡 Partial | | Async on RN |
| Form | ✅ | ✅ | ✅ | ✅ | 🔵 Pending | Complex validation |

## Services

| Service | Android | iOS | React Native | All Platforms | Verified | Notes |
|---------|---------|-----|--------------|---------------|----------|-------|
| AuthService | ✅ | ✅ | ✅ | ✅ | ✅ | |
| StorageService | ✅ | ✅ | 🔵 Not Started | 🟡 Partial | | |

## Status Values
- 🔵 **Not Started** — Not yet extracted
- 🟡 **In Progress** — Extraction underway
- ✅ **Completed** — Extraction finished on this platform
- 🔴 **Blocked** — Source code unclear, needs team input
- ⚠️ **Needs Update** — Source code has changed since extraction
```

---

## Platform-Specific Considerations

### Android (Gradle/AAR)

**Framework Packaging:**
- Distributed as Android Archive (AAR) files via Maven repositories (Maven Central, JCenter, private Maven)
- Build system: Gradle with Android Gradle Plugin
- API Level requirements (minSdkVersion, targetSdkVersion)
- Dependencies specified in `build.gradle.kts` or `build.gradle`

**Framework Architecture:**
- Kotlin and/or Java implementation
- Optional native code (C/C++ via NDK for performance-critical operations)
- Resource files (layouts, drawables, strings, colors)
- AndroidManifest.xml for permissions, components, and metadata

**Platform Lifecycle:**
- Activity/Fragment lifecycle integration
- Intent filters and content providers
- Services and broadcast receivers
- Background execution (JobScheduler, WorkManager)

**Documentation Specifics:**
- Document `minSdkVersion` and `targetSdkVersion` requirements
- List all required AndroidManifest.xml permissions
- Document Gradle configuration changes needed (repositories, dependencies, build variants)
- Show ProGuard/R8 consumer rules to prevent code stripping
- Document lifecycle hooks and when to initialize components
- Include JNI/native code documentation if applicable

### iOS (CocoaPods/SPM)

**Framework Packaging:**
- Distributed as Frameworks via CocoaPods (podspec) or Swift Package Manager (Package.swift)
- Build system: Xcode with SwiftPM or CocoaPods
- Minimum deployment target (iOS version requirements)
- Dependencies specified in Podfile or Package.swift

**Framework Architecture:**
- Swift and/or Objective-C implementation
- Optional C/C++ code (via bridging headers)
- Storyboards and XIB files (less common in modern frameworks)
- Info.plist for capabilities, permissions, and metadata

**Platform Lifecycle:**
- UIViewController and SwiftUI lifecycle integration (viewDidLoad, onAppear, etc.)
- AppDelegate lifecycle
- SceneDelegate lifecycle (iOS 13+)
- Background execution (Background Tasks framework)
- Core Location, Core Motion, and other system framework integration

**Documentation Specifics:**
- Document minimum iOS deployment target
- List all required Info.plist keys and values
- Document CocoaPods installation (Podfile changes) AND SPM installation (Xcode UI or Package.swift changes)
- Show UIKit and SwiftUI usage patterns side-by-side if both are supported
- Document module.modulemap if needed for Objective-C interop
- Include framework dependencies (other CocoaPods/SPM packages)

### React Native (npm)

**Framework Packaging:**
- Distributed as npm packages
- Package specified in `package.json` with platform-specific native dependencies
- Metro bundler for JavaScript

**Framework Architecture:**
- JavaScript implementation for the public API
- Native bridge (Objective-C/Swift on iOS, Java/Kotlin on Android)
- Optional Turbo Modules (New Architecture) vs. legacy bridge

**Native Bridge Specifics:**
- JavaScript → native bridge communication (asynchronous, callbacks/promises, events)
- Native module registration (app.json, iOS Turbo Module specs, Android TurboModule specs)
- Callback and Promise-based APIs
- Event emission from native to JavaScript

**Documentation Specifics:**
- Document npm installation and linking (react-native link or Expo/EAS)
- Show package.json requirements and optional peer dependencies
- Document required app.json configuration changes
- For Turbo Modules, document the TypeScript spec and generated scaffolding
- Show complete bridge examples: JavaScript API → native bridge → platform implementation
- Document which operations are asynchronous and how to handle failures
- Include Metro bundler configuration if customization is needed

---

## Phase-by-Phase Extraction Process

### Phase 1: Framework Discovery and Multi-Platform Inventory

#### Phase Identity

**Phase ID:** EXTRACT-001
**Phase Name:** Framework Discovery and Multi-Platform Inventory
**FR Mapping:** None (foundational)

#### Goal

A complete inventory of the framework's public API surface on all supported platforms, organized by category, with source file paths identified for every artifact on every platform.

#### Dependencies

None

#### Plan

1. Identify all supported platforms (Android, iOS, React Native, or subset)
2. For each platform:
   - Read the framework's build configuration (build.gradle.kts, Podspec, package.json)
   - Extract name, version, dependencies, and peer dependencies
   - Read public API exports (public-api.ts for RN, public.kt for Android, umbrella header for iOS)
   - Walk the source directory to create file inventory
   - Record: artifact name, source file path, type (component/service/module/type/enum), platform availability
3. For each public export across all platforms:
   - Verify it exists on every platform OR note which platforms have which APIs
   - Create a platform availability matrix
4. Identify internal artifacts not in the public API (Part A only)
5. Create the `extraction-status.md` file with cross-platform status
6. Create the `platform-matrix.md` showing which APIs exist on which platforms
7. Create the `CHANGE-TRACKER.md` file with platform-aware structure
8. Create the scaffolding structure for Part A and Part B documentation

#### Outcome

- Complete inventory of all framework exports on all platforms
- Platform availability matrix (which APIs exist on which platforms)
- Extraction status tracker created with platform columns
- Change tracker created with platform tracking
- Documentation scaffolding created for both parts

#### Automated Verification (AI Gate)

1. Compare public API exports against inventory on each platform
2. Verify all source file paths in inventory resolve to actual files
3. Verify platform availability matrix is complete (each API has platform coverage noted)
4. Verify scaffolding files exist with correct headers

**Expected:**
- 100% of public exports inventoried on each platform
- All file paths valid on each platform
- Platform matrix complete
- Scaffolding structure matches the template

#### Human Verification (Human Gate)

1. Review inventory for completeness across all platforms
2. Verify platform availability matrix is accurate (check actual code)
3. Confirm framework version and dependency versions are accurate on all platforms
4. Verify Part A vs. Part B classification is consistent across platforms

#### Success Criteria

✅ Public API inventory complete for all platforms
✅ Internal artifacts inventory complete (Part A)
✅ Platform availability matrix created
✅ Extraction status tracker created with platform columns
✅ Change tracker created with platform tracking
✅ Scaffolding structure created for both parts
✅ Framework version and dependencies recorded per platform

---

### Phase 2: Foundation Extraction (Multi-Platform)

#### Phase Identity

**Phase ID:** EXTRACT-002
**Phase Name:** Foundation Extraction (Overview, Environment, Structure, Multi-Platform)
**FR Mapping:** None (foundational)

#### Goal

Template sections 1–4 (Framework Overview, Platform Architecture, Environment and Configuration, Installation and Setup) are fully documented for both Part A and Part B, with clear delineation of platform-specific content.

#### Dependencies

EXTRACT-001 Framework Discovery and Multi-Platform Inventory

#### Plan

1. Read the framework's README and primary documentation to extract the architectural overview
2. For each platform, read platform-specific documentation (if it exists)
3. Read CONTRIBUTING.md and any governance docs for stated philosophy and design principles
4. Extract prerequisite versions from build configs (build.gradle.kts, Podspec, package.json)
5. Extract platform-specific requirements (minSdkVersion for Android, deployment target for iOS)
6. Document installation commands and build configuration for each package manager (Gradle, CocoaPods, SPM, npm)
7. For each platform, extract how the framework is imported and initialized
8. Document platform-specific lifecycle integration (Activity, Fragment, UIViewController, SceneDelegate, React Native hooks)
9. Document required permissions (AndroidManifest.xml, Info.plist) and capabilities
10. Extract the recommended project structure for each platform
11. Extract naming conventions per platform
12. Document the minimal boilerplate app per platform (or multi-platform for React Native)
13. For Part A: additionally document internal architecture per platform and build pipeline details
14. Log all extracted content in the Change Tracker with platform notes

#### Outcome

- Framework Overview documented (both parts, shared content)
- Platform-specific Architecture documented (Part A only)
- Environment and Configuration documented (both parts, platform-specific sections)
- Installation and Setup documented per platform (both parts)
- Lifecycle Integration documented per platform (both parts)
- Minimal boilerplate app documented per platform (both parts)
- Build Pipeline documented per platform (Part A only)

#### Automated Verification (AI Gate)

1. Verify all dependency versions match build configs exactly on each platform
2. Verify required permissions match actual AndroidManifest.xml / Info.plist
3. Verify minimum version requirements are accurate per platform
4. Verify minimal boilerplate app compiles and runs on each platform

**Expected:**
- Zero discrepancies between documented versions and build configs
- Every configuration option has a verified value
- Boilerplate app runs successfully on all target platforms

#### Human Verification (Human Gate)

1. Review framework overview for accuracy
2. Verify platform architecture descriptions match actual implementation
3. Confirm lifecycle integration steps are accurate per platform
4. Verify required permissions and capabilities are complete

#### Success Criteria

✅ Template sections 1–4 complete for Part A (all platforms)
✅ Template sections 1–3 complete for Part B (all platforms)
✅ All versions verified against build configs
✅ Required permissions and capabilities verified
✅ Minimal boilerplate apps work on all platforms
✅ Changes logged in Change Tracker with platform tracking

---

### Phase 3: Design Tokens, Theming, and Platform-Specific Styling

#### Phase Identity

**Phase ID:** EXTRACT-003
**Phase Name:** Design Token and Theming Extraction (Multi-Platform)
**FR Mapping:** None (foundational — design tokens are used by all components)

#### Goal

All design tokens, theming mechanisms, and styling systems are fully documented for all platforms, with platform-specific implementation notes (Android theme resources, iOS appearance API, React Native StyleSheet).

#### Dependencies

EXTRACT-002 Foundation Extraction

#### Plan

1. Read all design token and style files (SCSS, CSS, theme files, Android colors.xml/dimens.xml, iOS Asset Catalog colors)
2. Extract every design token with its default value and platform variants
3. Categorize tokens: colors, spacing, typography, borders/radii, shadows, z-index, breakpoints
4. For each platform, document how tokens are applied (theme context for RN, ColorStateList for Android, appearance override for iOS)
5. Document the theming mechanism on each platform: how themes are applied and switched
6. Document styling approach per platform (SCSS for web, StyleSheet for React Native, XIB/Storyboard or programmatic for iOS, XML for Android)
7. Document utility/helper classes or CSS-in-JS approaches
8. For Part A: additionally document the token build pipeline and how tokens are compiled/distributed across platforms
9. Log all extracted content with platform notes

#### Outcome

- Complete design token reference (all platforms, both parts)
- Platform-specific theming documentation (all platforms, both parts)
- Styling approach per platform (both parts)
- Token build pipeline (Part A only, per platform)

#### Success Criteria

✅ All design tokens documented with verified values
✅ Platform-specific token applications documented
✅ Theming mechanism documented per platform
✅ Changes logged with platform tracking

---

### Phase 4: Shared Types, Interfaces, and DI Token Extraction

#### Phase Identity

**Phase ID:** EXTRACT-004
**Phase Name:** Shared Types, Interfaces, and Cross-Platform Contracts
**FR Mapping:** None (foundational)

#### Goal

Every public interface, type, enum, and contract that exists across platforms is documented with exact type signatures and platform-specific implementations.

#### Dependencies

EXTRACT-002 Foundation Extraction

#### Plan

1. Read all model/type/interface files exported from the public API on all platforms
2. For each cross-platform type, show the definition and any platform-specific variants
3. For Android: document Kotlin data classes, interfaces, and enums
4. For iOS: document Swift structs, classes, and enums
5. For React Native: document TypeScript/JavaScript type definitions
6. For each type: extract every property with its type, optionality, and default value
7. For enums: extract every member with its value (string, numeric)
8. Document how types map across platforms (Kotlin Long → JavaScript number, Swift Codable → JSON)
9. For Part A: additionally document internal types
10. Log all extracted content with platform notes

#### Outcome

- Complete type reference (all platforms, both parts)
- Platform-specific type implementations (all platforms, both parts)
- Type mapping documentation (both parts)

#### Success Criteria

✅ All public types documented
✅ Platform-specific implementations shown
✅ Type signatures verified on all platforms
✅ Changes logged with platform tracking

---

### Phase 5: Component/Class Extraction (Per Platform)

#### Phase Identity

**Phase ID:** EXTRACT-005.X (where X is the component category)
**Phase Name:** Component/Class Extraction — [Category Name]
**FR Mapping:** Maps to whatever functional areas the components serve

#### Goal

Every component/class in the [Category] category is fully documented on all target platforms, with platform-specific implementation notes.

#### Dependencies

EXTRACT-003 Design Token and Theming Extraction
EXTRACT-004 Shared Types and DI Token Extraction

#### Plan

For each component/class across all platforms:

1. Read the component's implementation on each platform (Kotlin Activity/Component, Swift UIViewController, React Native component)
2. Extract: name, purpose, public properties, public methods, lifecycle hooks, events/callbacks
3. For Android (Kotlin): read layout files, styles, state management
4. For iOS (Swift): read storyboards/XIB files or programmatic layout, state management
5. For React Native: read native bridge implementation for each platform
6. Document generic type parameters if applicable
7. Read test files on each platform for expected behaviors
8. Write minimal usage example per platform
9. Write realistic usage example per platform
10. Document edge cases, gotchas, and platform-specific behavior
11. For Part A: additionally document internal state management, private methods, lifecycle internals
12. For React Native: document the complete native bridge (JavaScript → native → platform)
13. Mark as "Completed" in extraction-status.md
14. Log changes with platform tracking

#### Outcome

- Component documented on all platforms (both parts)
- Platform-specific implementation notes (both parts)
- Usage examples per platform (both parts)
- Native bridge documentation for React Native (Part A)
- Edge cases and platform gotchas (both parts)

#### Success Criteria

✅ All components documented on all platforms
✅ Platform-specific behaviors documented
✅ Usage examples work on each platform
✅ Native bridge documented for React Native
✅ Extraction status updated with platform coverage

---

### Phase 6: Service Extraction (Per Platform)

Follow the same structure as Phase 5 but for services/singletons:

**Plan specifics:**
1. Read the service implementation on each platform
2. Extract: public properties (Observables, BehaviorSubjects, state classes), public methods with full signatures
3. For Android: identify service provider scope (Application-scoped, Activity-scoped) and DI pattern
4. For iOS: document shared instance patterns or DI container usage
5. For React Native: document how native modules are accessed and their return types
6. Document if the service is stateful and how state is managed
7. For Part A: document internal state management, private methods, subscription handling per platform

---

### Phase 7: Platform Integration, Permissions, and Lifecycle

#### Phase Identity

**Phase ID:** EXTRACT-007
**Phase Name:** Platform Integration, Permissions, Lifecycle, and Native Capabilities

#### Goal

Complete documentation of how the framework integrates with platform-specific features: lifecycle, permissions, background execution, native capabilities.

#### Plan

1. Document Android-specific integration: Activity/Fragment lifecycle, permissions in AndroidManifest.xml, background work with WorkManager
2. Document iOS-specific integration: UIViewController/SwiftUI lifecycle, Info.plist permissions and capabilities, background tasks with BackgroundTasks
3. Document React Native integration: Lifecycle via useEffect/componentDidMount, native permission requests, bridge to native permission APIs
4. Document required permissions per platform and why they're needed
5. Document background execution capabilities per platform
6. Document app lifecycle events and how to hook into them
7. For Part A: document internal lifecycle hooks and platform-specific initialization

#### Outcome

- Complete lifecycle integration documentation (both parts, per platform)
- Permissions and capabilities reference (both parts, per platform)
- Background execution documentation (both parts, per platform)

---

### Phase 8: Testing, Migration, and Accessibility Extraction

#### Phase Identity

**Phase ID:** EXTRACT-008
**Phase Name:** Testing, Migration, Accessibility, and Reference

#### Plan

1. For Testing: document testing utilities per platform (Android instrumented/unit tests, iOS XCTest, React Native Jest/Detox), test helpers, mocking patterns
2. For Migration: document version upgrade paths, breaking changes, deprecation timelines per platform
3. For Accessibility: document accessibility features, WCAG compliance, testing on each platform
4. For Reference: document all patterns, recipes, and anti-patterns

#### Outcome

- Testing documentation (per platform, both parts)
- Migration guides (per platform, both parts)
- Accessibility documentation (both parts)
- Patterns and recipes (both parts)

---

## Change Tracking for Mobile Framework Documentation

> **Universal Structure and Rules:** See `../_shared/templates/change-tracker-template.md` for the full change tracker template. See `canonical-reverse-engineering-shape.md` § Change Tracking for universal change types, versioning convention, and when to update the tracker.

### Parts Affected Values for Mobile Framework Documentation

This phase produces two documentation parts. When logging changes, use these values in the "Parts Affected" column:

| Value | Meaning |
| --- | --- |
| A | Part A: Full Framework Documentation (for framework developers and maintainers) |
| B | Part B: Implementer Documentation (for mobile app developers consuming the framework) |
| Both | All parts affected |

---

## Scaffolding Approach — Structure Before Content

> **Universal Principle and Process:** See `canonical-reverse-engineering-shape.md` § Scaffolding Approach for why and how scaffolding works. Below is the mobile framework-specific scaffolding prompt.

### Mobile Framework Scaffolding Prompt

```
"We have completed the framework API inventory. Based on the Mobile Framework
Documentation Template and the artifact inventory, propose the scaffolding for:

- Part A (Full Framework Documentation) — file structure and section headers
- Part B (Implementer Documentation) — file structure and section headers

For each file, show:
- File path
- Section headers
- Which platform-specific subsections are needed
- Which inventory items map to each section

Show structure ONLY. Do NOT extract any content yet. Include all platform-specific
sections (Android, iOS, React Native) where behavior or setup differs."
```

This approach lets you:
1. See the complete documentation structure upfront
2. Map all inventoried components to their documentation homes
3. Assign specific sections to team members or AI assistants
4. Prevent AI from generating unsourced content
5. Track extraction progress systematically

---

## Best Practices for Mobile Frameworks

### 1. Platform-Specific Examples Are Essential

**Best Practice:** For every concept, show the implementation on each platform side-by-side or in sequence.

**Example:**
```
## Initializing the Framework

### Android
[Kotlin code example showing how to initialize in Application.onCreate() or as a dependency]

### iOS
[Swift code example showing how to initialize in UIApplicationDelegate or SwiftUI App]

### React Native
[JavaScript code example showing how to initialize in app.json and/or App.tsx]
```

### 2. Document the Async Boundary for React Native

**Best Practice:** Clearly document which operations cross the JavaScript-native boundary and are therefore asynchronous.

**Example:**
```
## Fetching User Profile

### Returns
- On Android/iOS: `User` object
- On React Native: Promise<User> (crosses bridge, async)

### Why the Difference?
The React Native module must serialize the User object across the JavaScript bridge,
making the operation asynchronous. Always await this call.
```

### 3. Build Configuration Changes Must Be Exact

**Best Practice:** Show the exact lines that must be added to build files, using proper syntax highlighting.

**Example - GOOD:**
```gradle
// Add to build.gradle.kts
dependencies {
    implementation("com.example:framework:1.2.3")
}
```

**Example - BAD:**
```
Add the framework to your Gradle dependencies.
```

### 4. Permissions and Capabilities Must Be Explicit

**Best Practice:** List every permission and capability needed, with explanations of why.

**Example:**
```
## Required Permissions

### Android
- `android.permission.CAMERA` — Required for photo capture features
- `android.permission.READ_EXTERNAL_STORAGE` — Required for image selection

### iOS
- `NSCameraUsageDescription` — Required in Info.plist for photo features
- `NSPhotoLibraryUsageDescription` — Required in Info.plist for image selection
```

### 5. Version Compatibility Matrix Is Critical

**Best Practice:** Document which framework versions support which platform versions.

**Example:**
```
## Compatibility

| Framework Version | Min Android | Min iOS | React Native |
|-------------------|-------------|---------|--------------|
| 1.0.x             | API 21      | 12.0    | 0.63+        |
| 2.0.x             | API 24      | 14.0    | 0.67+        |
| 3.0.x             | API 28      | 15.0    | 0.72+        |
```

### 6. Deprecation Must Include Migration Path

**Best Practice:** When documenting deprecated APIs, provide a clear migration path for all platforms.

**Example:**
```
## Deprecated: Old API (Framework 2.0 - End of Life: 2026-12-31)

### What Changed
The `getUserData()` method is deprecated. Use `getUserProfile()` instead.

### Migration

#### Before (Android)
```kotlin
val user = framework.getUserData()
```

#### After (Android)
```kotlin
val user = framework.getUserProfile()
```

#### Before (iOS)
```swift
let user = framework.getUserData()
```

#### After (iOS)
```swift
let user = framework.getUserProfile()
```

#### Before (React Native)
```javascript
const user = await framework.getUserData()
```

#### After (React Native)
```javascript
const user = await framework.getUserProfile()
```
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Assuming APIs Are the Same Across Platforms

**Problem:** Documenting an API without checking if it exists or behaves identically on all platforms.

**Example of Failure:**
- Document "Framework.setTheme(darkMode)" without noting that Android uses a different API or that iOS doesn't support it
- Result: Developers generate code that works on one platform but crashes on another

**Solution:**
- Always verify the API exists on each platform
- Document platform differences explicitly
- Use a platform matrix to show which APIs are available where
- Test the documented API on each platform before documenting

### Pitfall 2: Forgetting the React Native Bridge is Asynchronous

**Problem:** Documenting a React Native API as synchronous when the bridge makes it async.

**Example of Failure:**
- Document "const token = framework.getToken()" without noting it's a Promise
- Result: AI generates code that doesn't await the Promise, causing race conditions

**Solution:**
- For every React Native API that touches native code, explicitly mark it as async
- Show Promise/async-await examples
- Document callback vs. Promise returns
- Explain the serialization boundary

### Pitfall 3: Missing Required Build Configuration

**Problem:** Documenting an API without documenting the build configuration needed to use it.

**Example of Failure:**
- Document a camera component without mentioning AndroidManifest.xml permissions or Gradle dependencies
- Result: Developers get compilation errors or runtime crashes

**Solution:**
- For every feature, document required build configuration on all platforms
- Include exact Gradle, CocoaPods, SPM, and package.json snippets
- Document required permissions and capabilities
- Document required AndroidManifest.xml entries and Info.plist keys
- Test the documented setup on a fresh project

### Pitfall 4: Inconsistent Terminology Across Platforms

**Problem:** Using different names for the same concept across platforms.

**Example of Failure:**
- Call it "Component" on React Native, "Activity" on Android, "UIViewController" on iOS
- Result: Documentation is confusing; AI doesn't recognize they're the same concept

**Solution:**
- Define terminology upfront
- Use consistent names in the conceptual sections
- Map platform-specific terminology to the framework's terminology
- In platform-specific sections, use the platform's native terminology but relate it back to the framework's concept

### Pitfall 5: Incomplete Migration Guides

**Problem:** Documenting breaking changes without showing how to migrate on all platforms.

**Example of Failure:**
- Document "API v1 is deprecated, use v2" without showing migration code on all platforms
- Result: Some teams can migrate easily; others are stuck

**Solution:**
- For every breaking change, provide before/after code on every platform
- Test the migration steps on sample projects
- Provide a migration guide document covering all platforms

### Pitfall 6: Native Implementation Details Leaking into Part B

**Problem:** Documenting internal native implementation details for app developers.

**Example of Failure:**
- Document "The Android implementation uses a Singleton pattern internally"
- Result: App developers might incorrectly assume they can access implementation details; code becomes coupled to internals

**Solution:**
- Only document public APIs in Part B
- Keep native implementation details in Part A
- If internals are important for understanding behavior, explain them from an effect/behavior perspective, not implementation

---

## Prompt Templates and Examples

### Template 1: Framework Discovery (Multi-Platform)

```
We are documenting [Framework Name], which provides [purpose] on Android, iOS,
and React Native. I need to create an inventory of all public APIs across all platforms.

For Android, read:
- [Path to build.gradle.kts or build.gradle]
- [Path to public API file or module exports]
- [Path to AndroidManifest.xml for required permissions]

For iOS, read:
- [Path to Podspec or Package.swift]
- [Path to umbrella header or public API exports]
- [Path to Info.plist template for required capabilities]

For React Native, read:
- [Path to package.json]
- [Path to index.ts or main entry point]
- [Path to native module implementations]

Create a table listing:
- API name
- Android path (Kotlin source file)
- iOS path (Swift source file)
- React Native path (JavaScript + native bridge)
- Type (component, service, utility, enum, type)
- Availability (all platforms, or list specific platforms)
- Purpose (one sentence)
```

### Template 2: Platform-Specific Component Documentation

```
I need to document the [ComponentName] component for the Mobile Framework
across Android, iOS, and React Native.

**For Android (Kotlin):**
Read [path to ComponentName.kt or component file]. Extract:
- All public properties (val, var)
- All public methods and their signatures
- Any lifecycle methods
- Annotations (e.g., @Composable)
- Required manifest permissions
- Required gradle dependencies

**For iOS (Swift):**
Read [path to ComponentName.swift]. Extract:
- All public properties
- All public methods and their signatures
- Any lifecycle methods (@Published, @State, @Environment)
- Required Info.plist keys
- Required CocoaPods/SPM dependencies
- Support for SwiftUI and/or UIKit

**For React Native:**
Read [path to component.tsx] and [path to native module]. Extract:
- All props (and their types)
- All methods and callbacks
- The native bridge (show the JavaScript side and native implementation)
- Asynchronous operations (callbacks, promises)
- Required native permissions per platform

Create documentation showing:
1. Minimal usage example on each platform
2. Realistic usage example on each platform
3. All inputs/props/parameters with types and defaults
4. All outputs/callbacks/events
5. Edge cases and platform-specific gotchas
```

### Template 3: Build Configuration Extraction

```
I need to document the exact build configuration required to use [Feature Name]
in an app using [Framework Name].

**For Android:**
Show the exact lines to add to [app]/build.gradle.kts:
- Required dependencies (including versions)
- Required repositories (if not Maven Central)
- Required buildFeatures
- Required compileOptions or other compiler settings

Show required AndroidManifest.xml entries:
- Permissions
- Features
- Any service or provider registrations

**For iOS:**
Show the exact Podfile additions:
- Pod declaration with version constraints
- Any required subspecs
- CocoaPods configuration (e.g., use_frameworks!)

Show the exact SPM Package.swift additions if SPM is supported.

Show required Info.plist entries:
- Permission strings (NSCameraUsageDescription, etc.)
- Required capabilities
- Other metadata

**For React Native:**
Show the exact package.json changes:
```json
{
  "dependencies": {
    "[framework]": "^X.Y.Z",
    "[any required native dependency]": "^X.Y.Z"
  }
}
```

Show required app.json configuration changes (if any).

Show required linking commands for native dependencies.
```

---

## Quick Reference Checklist

> **Universal Checklist Items:** See `canonical-reverse-engineering-shape.md` § Quick Reference Checklist for the common items that apply to all reverse engineering phases.

Use this checklist to verify that mobile framework documentation is complete and accurate:

### Framework Discovery & Inventory
- [ ] All platforms identified (Android, iOS, React Native)
- [ ] Public API inventoried on each platform
- [ ] Source file paths verified on each platform
- [ ] Platform availability matrix created
- [ ] Internal APIs inventoried (Part A only)

### Foundation Extraction
- [ ] Framework overview describes purpose and supported platforms
- [ ] Platform-specific architecture documented (Part A)
- [ ] Build configuration documented (build.gradle.kts, Podspec/Package.swift, package.json)
- [ ] Installation steps exact and tested on each platform
- [ ] Required permissions listed per platform
- [ ] Required Info.plist/AndroidManifest.xml keys documented
- [ ] Minimal boilerplate app works on all platforms
- [ ] Minimal boilerplate app documented

### Design Tokens & Theming
- [ ] All design tokens listed with verified values
- [ ] Platform-specific token application documented
- [ ] Theming mechanism documented per platform
- [ ] Styling approach documented per platform

### Shared Types & Contracts
- [ ] All public types documented with exact signatures
- [ ] Platform-specific type variants shown
- [ ] Type mapping documented (how types are serialized across platforms)

### Components/Classes (Per Component)
- [ ] Documented on all supported platforms
- [ ] All public properties/inputs documented with types
- [ ] All public methods documented with signatures
- [ ] All outputs/callbacks/events documented with payload types
- [ ] Platform-specific lifecycle hooks documented
- [ ] Minimal usage example per platform
- [ ] Realistic usage example per platform
- [ ] Edge cases and gotchas documented
- [ ] Internal implementation documented (Part A only)

### Services (Per Service)
- [ ] Documented on all supported platforms
- [ ] Public methods and properties listed
- [ ] Return types documented
- [ ] Initialization/registration method documented per platform
- [ ] State management documented
- [ ] Examples per platform

### Platform Integration
- [ ] Lifecycle integration documented per platform
- [ ] Required permissions documented per platform with explanations
- [ ] Required capabilities (iOS) or features (Android) documented
- [ ] Background execution documented per platform
- [ ] Platform-specific APIs and integrations documented

### React Native Specifics
- [ ] Native bridge documented (JavaScript → native → platform)
- [ ] Async boundary clearly marked (bridge crosses are async)
- [ ] Module registration documented (app.json, native side)
- [ ] Permission request pattern documented
- [ ] Error handling across the bridge documented

### Part A Internal Documentation (Framework Maintainers)
- [ ] Internal architecture documented per platform
- [ ] Build pipeline documented (compile, test, publish)
- [ ] Internal state management documented
- [ ] Private APIs and implementation details documented
- [ ] Performance profiling and optimization decisions documented
- [ ] Native dependency trees documented
- [ ] Test infrastructure and fixtures documented

### Part B Implementer Documentation (App Developers)
- [ ] Installation and setup per platform documented
- [ ] Configuration and customization documented
- [ ] All public APIs documented
- [ ] Usage patterns and recipes documented
- [ ] Anti-patterns documented
- [ ] Error handling and debugging documented
- [ ] Testing utilities (for app developers) documented

### Quality & Maintenance
- [ ] Every documented API verified against source code on each platform
- [ ] Default values and type signatures exact
- [ ] Examples tested and working on each platform
- [ ] Build configuration examples tested on fresh projects
- [ ] Permissions and capabilities actually required (not over-documented)
- [ ] Terminology consistent across platforms
- [ ] Platform differences explicitly documented
- [ ] Change tracker updated with all changes and affected platforms
- [ ] Documentation builds and renders correctly (if applicable)

### Accessibility
- [ ] Accessibility features documented per platform
- [ ] WCAG compliance notes documented
- [ ] Testing approach for accessibility documented

### Migration & Versioning
- [ ] Compatibility matrix created (framework version vs. platform versions)
- [ ] Breaking changes documented with migration paths per platform
- [ ] Deprecation timeline and migration path documented
- [ ] Version constraints documented (minSdkVersion, minOSVersion, etc.)

---

## Additional Resources

Core References:
- `canonical-reverse-engineering-shape.md` (universal principles, 7-step workflow, change tracking structure)
- `../_shared/templates/change-tracker-template.md` (change tracker structure and best practices)
- `reverse-engineer-ui-framework-phase.md` (parallel methodology for UI frameworks)
- `ui-framework-doc-template.md` (template structure and patterns)
- `mobile-framework-doc-template.md` (documentation template for mobile frameworks)

For Android library documentation best practices, see:
- [Create an Android library | Android Studio | Android Developers](https://developer.android.com/studio/projects/android-library)
- [Prepare your library for release | Android Studio | Android Developers](https://developer.android.com/build/publish-library/prep-lib-release)

For iOS framework documentation, see:
- [Supporting Both CocoaPods & The Swift Package Manager - QuickBird Studios](https://quickbirdstudios.com/blog/swift-package-manager-cocoapods-support/)

For React Native native modules documentation, see:
- [Native Modules · React Native](https://reactnative.dev/docs/legacy/native-modules-ios)
- [Native Bridging for iOS and Android in React Native | by Rupesh Chaudhari](https://medium.com/simform-engineering/bridging-for-ios-and-android-in-react-native-64b8ce60a8c2)
