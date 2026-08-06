---
slug: read-cicd
sequence: 1
depends-on-prior: false
---

# Step 1 — Read CI/CD + RE deployment

## Goal

Auto-derive everything operational that existing CI/CD configs, infra
files, and RE Part B deployment sections can prove. Build a draft for
all four leaves without inventing content.

## Inputs

- `[[project.repos]]` from `project.toml`.
- For each repo at `<repo.path>`:
  - `.github/workflows/**`, `.gitlab-ci.yml`, `Jenkinsfile`,
    `.circleci/**`, `azure-pipelines.yml`, `bitbucket-pipelines.yml`
  - `Dockerfile`, `docker-compose*.yml`
  - `terraform/**`, `pulumi/**`, `cdk*`, `helm/**`, `k8s/**`,
    `kustomize/**`, `*.yaml` under `deploy/` or `manifests/`
- `<KB>/source-docs/<repo>/part-b/**/deployment*`
- Existing operations leaves at `<KB>/shared/operations/*.md`.

## Procedure

1. **Detect refresh-vs-create.** If any leaf already exists:
   - Interactive: prompt "[r] refresh, [R] replace all, [c] cancel".
   - Non-interactive: default `r`.
2. **Per repo, harvest:**
   - Pipelines (build, test, deploy job names; trigger events; environments
     deployed to; deploy tooling; OIDC vs static creds).
   - Container images (image registry, naming convention, tag policy).
   - Orchestrator (EKS / GKE / AKS / ECS / Fargate / Cloud Run / App
     Service / Cloudflare Pages / Vercel / Netlify / on-prem).
   - Region(s) — from terraform workspaces, helm values, or workflow
     env.
   - Database / cache / queue dependencies (from compose / helm /
     terraform).
   - Secrets-manager binding hints (env names like
     `AWS_SECRET_NAME=…`, `vault://…`, `gcp-secret://…`).
   - Observability hooks (datadog-agent injection, otel-collector
     sidecar, Prometheus annotations).
3. **Build the operations draft (in-memory):**
   ```
   {
     "deployment_topology": {
       "clouds": ["aws", "cloudflare"],
       "regions": ["us-east-1 (primary)", "us-west-2 (standby) [TODO confirm]"],
       "orchestrator": "EKS",
       "release_cadence": "TODO(elicit)",
       "auto_scaling": "TODO(elicit)",
       …
     },
     "environments": {
       "matrix": ["dev", "staging", "prod"],
       "config_layering": "Parameter Store (non-secret) + Secrets Manager (secret)",
       "rotation_cadence": "TODO(elicit)",
       …
     },
     "slos": {
       "availability": null,    # filled in Step 02
       "latency": null,
       …
     },
     "runbooks": {
       "candidates": [
         "deploy-rollback (auto-derivable)",
         "TODO(elicit additional candidates)"
       ],
       "oncall_rotation": "from solution-context/50-ownership-and-raci.md if available"
     }
   }
   ```
4. **Read solution-context cross-references** to seed the SLO and on-
   call sections:
   - `30-constraints-and-compliance.md` § 3 (NFR ceilings) → SLO
     targets.
   - `50-ownership-and-raci.md` § 3 (rotations) → on-call baseline.
   - If either file is missing, log a warning in the draft and proceed.
5. **Print first-pass summary** so the user knows what was auto-filled
   vs. what is TODO before the elicitation step opens.

## Acceptance

- Per-repo harvest completed for every repo in `[[project.repos]]`.
- Operations draft contains entries for every required leaf, with TODO
  markers where elicitation is needed.
- Solution-context cross-references resolved (or missing-warning logged).

## Outputs

- In-memory operations draft. No disk writes.

## Hand-off

`steps/02-elicit-gaps.md`.
