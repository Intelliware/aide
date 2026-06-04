---
slug: topology-and-boundaries
sequence: 2
depends-on-prior: true
---

# Step 2 — System Topology & Boundaries

## Purpose

Understand the system topology the QE tests will exercise, the boundary of control, and the nature of inputs and outputs.

## Procedure

Attempt to infer the topology from the design package (solution architecture, integration design, deployment sections). If a topology diagram or description exists in the prior packages, render it as an example for the user.

Then ask:

> Please give me a sense of the overall system topology for QE testing purposes.

Elicit the following, presenting guesses from prior packages where possible:

### 2a. Services under test

> Which services are you looking to test against? Which of these are within your boundary of control (you own and can deploy/configure) vs. external (you must mock or stub)?

Present a table with guesses:

| Service | In Scope (own) | Out of Scope (external/mocked) |
|---|---|---|

### 2b. Infrastructure

> What infrastructure pieces do we need to be aware of? (e.g., message brokers, databases, caches, API gateways, load balancers)

### 2c. Inputs and outputs

> What are our inputs/injection points? (how do we send data into the system under test)
> What are our outputs/assertion points? (where do we observe and assert results)

### 2d. Synchronous vs. asynchronous

> Are these interactions synchronous, asynchronous, or a mixture? For each input/output, clarify the nature.

## Acknowledgement checkpoint

Summarize the topology:
- Services in/out of scope
- Infrastructure dependencies
- Input injection points and output assertion points
- Sync/async nature of each

Ask: "Does this topology capture the system correctly?" Wait for confirmation.

## Next

Proceed to `steps/03-technologies.md`.
