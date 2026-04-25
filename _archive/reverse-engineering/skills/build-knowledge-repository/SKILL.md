---
name: build-knowledge-repository
description: >
  Build and maintain the central knowledge repository by aggregating Part B documentation from all
  individual repositories and synthesizing cross-cutting architecture documentation. Use this skill
  whenever the user mentions building a knowledge repository, assembling architecture docs, creating
  the central documentation hub, synthesizing cross-repo documentation, creating C4 diagrams from
  existing docs, or building a dependency map. Trigger for "build the knowledge repo", "assemble the
  architecture docs", "create the central repository", "synthesize the architecture", "what does our
  system look like overall". This skill requires that at least some repositories have been reverse
  engineered and their Part B documents are available.
---

# Build Knowledge Repository

You are guiding the user through assembling and maintaining a central knowledge repository that
aggregates public documentation from all repositories and synthesizes architecture-level understanding.

## Before You Start — Load Context

1. `phases/build-knowledge-repository-phase.md` — The complete assembly process
2. `../_shared/templates/change-tracker-template.md` — Change tracking structure
3. Check which Part B documents are available from individual repositories

## What the Knowledge Repository IS and IS NOT

**IS:** A curated, synthesized collection of public/consumer-facing documentation from all repositories,
plus architecture documentation created through cross-repository synthesis (C4 diagrams, dependency maps,
cross-cutting concerns).

**IS NOT:** A mirror of every repository's internal documentation. Internal details (Part A) stay in
their source repositories.

## The 10 Components

| Component | What It Contains | Source |
| --- | --- | --- |
| Architecture Overview | C4 L1 (System Context) and L2 (Container) diagrams | Synthesized from all Part B docs |
| Service/API Catalog | Registry of all APIs and services | Aggregated from API Part B1/B2 docs |
| Framework/Library Catalog | Registry of all frameworks and libraries | Aggregated from framework Part B docs |
| Application Catalog | Registry of all applications | Aggregated from app Part B docs |
| Aggregated Data Dictionary | Combined data dictionary across databases | Aggregated from database Part B1 docs |
| Cross-Cutting Concerns | Shared patterns: auth, logging, error handling | Synthesized from all Part B docs |
| Dependency Map | Inter-system dependency graph | Synthesized from all Part B docs |
| Architecture Decision Records | Organization-wide ADRs | Created during synthesis |
| Onboarding Guide | New developer orientation | Created from all components |
| Maintenance Guide | Ongoing maintenance procedures | Created from all components |

## Workflow

### Phase 1: Inventory Available Documentation
- Identify which repositories have been reverse engineered
- List all available Part B documents
- Assess gaps — which repositories still need documentation?

### Phase 2: Aggregate Catalogs
- Create the Service/API, Framework/Library, and Application catalogs
- Import entries from each repository's Part B documentation
- Standardize format across all entries

### Phase 3: Synthesize Architecture
- Create C4 Level 1 (System Context) diagram from all services and applications
- Create C4 Level 2 (Container) diagram showing internal components
- Build the dependency map showing inter-system relationships
- Document cross-cutting concerns identified across repositories

### Phase 4: Create Knowledge Documents
- Write Architecture Decision Records for organization-wide decisions
- Create the Onboarding Guide
- Create the Maintenance Guide

### Phase 5: Verification and Ongoing Maintenance
- Verify all aggregated content against source Part B docs
- Establish update cadence and freshness checks
- Log everything in the Change Tracker

## Key Rules

- **Source repos are always the source of truth** — the knowledge repo is downstream
- **Synthesize, don't copy** — architecture diagrams and cross-cutting docs are created through analysis
- **Aggregate faithfully** — catalog entries should match their source Part B docs exactly
- **Track staleness** — flag documents that haven't been updated when their source repo has
