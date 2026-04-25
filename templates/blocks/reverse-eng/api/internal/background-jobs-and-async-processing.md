---
slug: background-jobs-and-async-processing
title: "Background Jobs and Async Processing"
applies-to: [re-api-internal]
requires-decision-from: [code-reader, architect]
optional: true
order-hint: 280
---

## 18. Background Jobs and Async Processing

This section documents how the API offloads work from the request path: scheduled jobs, queued tasks, fire-and-forget background processing, and any worker processes that consume from a broker. Identify the queue runtime in the source (e.g., BullMQ, Sidekiq, Celery, Hangfire, Quartz, AWS SQS + Lambda, RabbitMQ consumers), where jobs are *enqueued* in the API code, and where the corresponding *handlers* live. Document the at-least-once vs at-most-once semantics, retry policy, dead-letter behavior, and how handlers acquire dependencies (DI container, fresh request scope, etc.).

To verify, trace at least one full job lifecycle: enqueue site → broker → handler → success path → failure path. Confirm the documented retry counts and backoff curves by reading the actual job options, not the README. Confirm whether handlers run in the same process as the API or a separate worker — this dramatically affects deployment.

Common confusions: a `setTimeout`/`Task.Run`/`asyncio.create_task` is *not* a durable job — it dies with the process. Don't conflate ad-hoc fire-and-forget with the queue system. Also: scheduled jobs (cron-like) and on-demand queued jobs may share infrastructure but have different failure semantics. Document them separately.

Hallucination risks: do not assume idempotency unless the handler explicitly checks for prior execution (idempotency key, dedupe table, etc.); do not assume jobs run in order unless the queue is explicitly ordered; do not invent a worker process if the codebase actually uses in-process background tasks.

### Suggested template content

#### 18.1 Job Runtime

- **Queue technology:** {{e.g., BullMQ on Redis, RabbitMQ + Quartz, AWS SQS}}
- **Worker deployment:** {{same process / separate worker container / serverless}}
- **Concurrency:** {{e.g., 4 workers × 10 concurrent jobs each}}

#### 18.2 Job Catalog

| Job Name | Trigger | Handler Location | Retry Policy | Idempotent? |
|----------|---------|------------------|--------------|-------------|
| {{e.g., send-welcome-email}} | {{enqueued on user.create}} | `{{src/jobs/sendWelcomeEmail.ts}}` | {{3 retries, exp backoff}} | {{yes — keyed on userId}} |
| {{e.g., nightly-report}} | {{cron 0 2 * * *}} | `{{src/jobs/nightlyReport.ts}}` | {{1 retry}} | {{no — must skip if locked}} |

#### 18.3 Enqueueing a Job

```{{language}}
// Canonical enqueue pattern used in this codebase
{{example: include job name, payload shape, options (delay, attempts, jobId for dedupe)}}
```

#### 18.4 Writing a Handler

```{{language}}
// Canonical handler skeleton — DI, error handling, idempotency check
{{example handler}}
```

#### 18.5 Failure Modes

- **Retry policy:** {{e.g., 3 attempts, exponential backoff starting at 1s}}
- **Dead-letter queue:** {{e.g., `dlq:default` — alerted via PagerDuty after threshold}}
- **Poison-message handling:** {{e.g., move to DLQ after 5 failures, never auto-replay}}

#### 18.6 Local Development

```bash
# How to run the worker locally
{{e.g., pnpm run worker}}
```
