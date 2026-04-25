---
slug: build-deploy-and-runtime
title: "Build, Deploy, and Runtime"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 350
---

## 25. Build, Deploy, and Runtime

This section documents how the API is built, packaged, deployed, and run in production: the build pipeline, the artifact (container image, ZIP, native binary), the deployment target (k8s, ECS, Lambda, VM), the rollout strategy (blue/green, canary, rolling), and the runtime configuration (replicas, resource requests/limits, autoscaling). The downstream AI uses this to know what changes are deploy-safe, what would require infrastructure changes, and what the rollback story looks like. Extract from the source: the Dockerfile (or equivalent), the CI workflow files (`.github/workflows`, `.gitlab-ci.yml`, etc.), the deploy manifests (k8s YAML, Terraform, Helm chart), and any deploy scripts.

To verify, walk a recent deploy in CI logs and confirm each documented step actually happens. Confirm the documented health check matches what the orchestrator probes. Confirm graceful-shutdown behavior — many APIs claim it but lose in-flight requests because of mismatched timeouts (preStop hook < terminationGracePeriodSeconds < server keep-alive).

Be careful about environment parity: dev, staging, and prod often diverge silently (different Node versions, different DB versions, different feature flags). Note documented divergences explicitly. Be careful about the difference between *build-time* config (baked into the image — language version, dependencies) and *runtime* config (from env/secret manager).

Hallucination risks: do not assume zero-downtime deploys without checking readiness probes and PDBs; do not invent a CI step that isn't in the workflow file; do not document a Helm chart if the team uses raw kubectl manifests.

### Suggested template content

#### 25.1 Build

- **Dockerfile location:** `{{Dockerfile}}` (multi-stage)
- **Base image:** `{{node:20-alpine}}` for runtime, `{{node:20}}` for build
- **Image tag scheme:** `{{<git-sha>}} + <branch>` (e.g., `a1b2c3d-main`)
- **Build args / secrets:** {{e.g., NPM_TOKEN passed via BuildKit secret, never baked in}}

```dockerfile
# Snippet showing the canonical multi-stage build
{{snippet}}
```

#### 25.2 CI Pipeline

Stages, in order:

1. {{Lint}} — `{{pnpm lint}}`
2. {{Type check}} — `{{pnpm typecheck}}`
3. {{Unit tests}} — `{{pnpm test}}`
4. {{Integration tests}} — `{{pnpm test:integration}}` (with services)
5. {{Build image}} — `{{docker buildx}}`
6. {{Image scan}} — `{{trivy / snyk}}`
7. {{Push to registry}} — `{{ghcr.io/...}}`
8. {{Deploy to staging}} (auto on `main`)
9. {{Deploy to prod}} (manual approval / tag)

CI config: `{{.github/workflows/ci.yml}}`

#### 25.3 Deploy Target

- **Platform:** {{e.g., EKS, ECS Fargate, Cloud Run, Lambda}}
- **Manifests:** `{{deploy/k8s/}}` (or `{{terraform/}}`, `{{helm/}}`)
- **Namespaces / environments:** {{dev, staging, prod}}

#### 25.4 Runtime Configuration

| Setting | Dev | Staging | Prod |
|---------|-----|---------|------|
| Replicas | {{1}} | {{2}} | {{6 (HPA 4-20)}} |
| CPU request | {{100m}} | {{500m}} | {{1}} |
| CPU limit | {{500m}} | {{1}} | {{2}} |
| Memory request | {{256Mi}} | {{512Mi}} | {{1Gi}} |
| Memory limit | {{512Mi}} | {{1Gi}} | {{2Gi}} |

#### 25.5 Health Checks

| Probe | Endpoint | Initial Delay | Period | Failure Threshold |
|-------|----------|---------------|--------|-------------------|
| Liveness | `{{/health/live}}` | {{30s}} | {{10s}} | {{3}} |
| Readiness | `{{/health/ready}}` | {{5s}} | {{5s}} | {{2}} |
| Startup | `{{/health/live}}` | {{0s}} | {{5s}} | {{30}} |

#### 25.6 Graceful Shutdown

- **SIGTERM handling:** {{stop accepting new connections, drain for N seconds}}
- **preStop hook:** {{`sleep 5` so LB removes pod before close}}
- **terminationGracePeriodSeconds:** {{30}}

```{{language}}
// Shutdown handler skeleton
{{example}}
```

#### 25.7 Rollout Strategy

- **Strategy:** {{rolling, maxSurge=25%, maxUnavailable=0}} or {{blue/green via Argo Rollouts}}
- **PodDisruptionBudget:** {{minAvailable: 50%}}
- **Rollback:** {{`kubectl rollout undo` / Helm rollback / redeploy previous tag}}

#### 25.8 Local vs Prod Differences (Document Explicitly)

| Aspect | Local | Prod |
|--------|-------|------|
| {{TLS}} | {{plain HTTP}} | {{TLS at ALB}} |
| {{Logger}} | {{pretty}} | {{JSON}} |
| {{Cache}} | {{in-memory}} | {{Redis}} |
| {{Worker}} | {{same process}} | {{separate deployment}} |
