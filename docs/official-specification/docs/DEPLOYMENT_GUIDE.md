# Proposed SAP BTP Deployment Guide

**Version:** 1.0<br>
**Project stage:** Phase 6 — Demo, Testing, Deployment and Project Handover<br>
**Status:** Proposed deployment sequence only. No application, SAP BTP environment, HANA service, service binding, or deployment is verified.<br>
**Related documents:** [Technology stack](TECH_STACK.md) · [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Integration architecture](INTEGRATION_ARCHITECTURE.md) · [Integration catalogue](09_INTEGRATIONS.md) · [Database schema](DATABASE_SCHEMA.md) · [API contracts](API_CONTRACTS.md) · [Open decisions](11_DECISIONS_AND_OPEN_QUESTIONS.md)

## 1. Status and safety boundary

This guide describes a future deployment approach for the selected SAP baseline: SAPUI5, SAP CAP on Node.js, SAP HANA Cloud, SAP AI Core / Generative AI Hub, SAP Build Process Automation, SAP BTP Cloud Foundry, and SAP Build Work Zone. These are documented selections/plans, not evidence that subscriptions, tenants, service instances, credentials, endpoints, or working integrations exist.

The current checkout is documentation, prompts, and static JSON data/schema files; there is no deployable SAPUI5/CAP application, package manifest/lockfile, CAP CDS model, HANA migration, Cloud Foundry manifest, CI pipeline, or runtime. **Do not run deployment commands against a real tenant from this repository.** Complete the open decisions and create/review implementation artifacts before deployment.

### Evidence classes

| Class | Meaning for this guide |
|---|---|
| **Observed in repository** | SAP stack is specified; `.env.example` contains disabled/empty provider configuration; `data/synthetic/` contains static, fictional records. |
| **Not verified** | BTP account/subaccount, Cloud Foundry org/space, region/quotas, service entitlements, HANA, AI Core, Build Process Automation, Work Zone, identity, network, or provider connectivity. |
| **Proposed** | The logical deployment order and gates below. |
| **Simulated** | The committed scenario fixtures and any future explicitly isolated demo adapter. Simulation must remain isolated from live operational actions. |

## 2. Prerequisites and authorization

Before provisioning, the project owner and SAP platform/security owners must verify:

- Authorized BTP global account/subaccount, region, Cloud Foundry org/space, quotas, entitlements, and cost owner.
- Cloud Foundry CLI and supported SAP development tooling versions for the chosen environment; exact versions are not selected here.
- SAP Business Application Studio (BAS) availability or an approved local development environment.
- A selected Node.js runtime version from a future application manifest/lockfile. Do not infer the runtime version from this document.
- SAP CAP/SAPUI5 application structure, test scripts, environment configuration, and build outputs.
- SAP HANA Cloud provisioning, service plan, network access, service identity, backup/recovery arrangement, and tenancy model.
- Authentication/authorization design, Work Zone exposure, role claim mapping, access policies, and secrets management.
- AI Core/model deployment, data handling/retention, resource access and outage behavior, if AI is enabled.
- Build Process Automation availability, workflow definitions, approver identity mapping, callbacks, and CAP policy revalidation.
- Voice/email providers, consent and test recipients, sandbox accounts, delivery semantics, and explicit no-real-side-effect safeguards.
- Security/privacy review and approval for any non-synthetic data. This guide assumes synthetic data only.

Never paste passwords, client secrets, API keys, personal contact data, or provider tokens into source, command history, screenshots, tickets, or logs. Use a verified BTP service binding or approved secrets facility. The repository `.env.example` is a placeholder inventory, not a live configuration.

## 3. Recommended deployment order

### Gate 0 — Resolve decisions and define environments

Resolve decisions D-01 through D-19 in [the decision register](11_DECISIONS_AND_OPEN_QUESTIONS.md) as applicable. Define separate development, integration/test, demo, and production environments; identify accountable owners and cost boundaries. Keep protected action execution, voice, and email disabled by default.

**Exit criteria:** documented environment, identity, data mode, network, owners, rollback, incident response, and service availability evidence. If any required control is unknown, stop before provisioning or importing data.

### Gate 1 — Establish repository and development baseline

1. Clone the approved repository and create a feature branch under the project branching policy.
2. Review `AGENTS.md`, the Phase 1–6 documentation, `README.md`, and project status.
3. Once application source is added and reviewed, install using the committed lockfile (`npm ci` only if a Node package manifest and lockfile exist). This command is **not runnable in the current repository**.
4. Use BAS or a verified local SAP development environment to build the approved CAP/SAPUI5 structure. Do not introduce a replacement framework without project approval.
5. Run static analysis, unit tests, schema validation, and synthetic-only tests before binding to cloud services.

**Example repository commands** (placeholders; do not expose credentials):

```powershell
git clone https://github.com/Pavan-Gowda-S/VaxResilience.git
Set-Location VaxResilience
git status --short
```

### Gate 2 — Verify Cloud Foundry target and service entitlements

After an authorized operator receives the correct API endpoint and access:

```text
cf login -a <verified-cloud-foundry-api-endpoint> --sso
cf target -o <authorized-org> -s <authorized-space>
cf apps
cf services
```

Angle-bracket values are placeholders. Do not guess endpoint, org, space, service plan, instance name, or region. Use the approved account/security flow; do not put a password/token into a script or command line. Confirm the selected target before every deployment.

Provision only required service instances through the approved BTP process after reviewing plan, region, cost, network, and identity requirements. The repository does not specify service instance names or plans. A Cloud Foundry service binding must use least privilege and must not be copied into the browser.

### Gate 3 — Configure HANA Cloud and schema deployment

1. Provision/verify the selected HANA Cloud service and CAP-compatible binding in the intended environment.
2. Finalize CDS model, tenant/organization isolation, key strategy, schema migration/versioning, indexes based on query evidence, audit access, encryption, backup, and restore procedure.
3. Apply migrations to a disposable development/test schema first. Validate foreign keys, uniqueness, state/version rules, and rollback.
4. Load fixtures only through an approved idempotent demo seed path. Require a deliberate demo environment guard, `DATA_MODE=synthetic`, explicit scenario ID, seed confirmation, version/checksum, and record counts.
5. Verify the seed refuses a non-demo or production target. Never seed the static history into a live operational tenant.

An illustrative CAP deployment may eventually use a project-approved command such as `cds deploy --to hana`, but only after a real CAP project, CDS model, compatible tooling, and reviewed target configuration exist. The current repository does not contain those artifacts; do not run the command here.

### Gate 4 — Deploy CAP services

1. Implement CAP services and request contracts from [API_CONTRACTS.md](API_CONTRACTS.md); validate request schemas and ownership/authz for every operation.
2. Configure server-side service bindings, health/readiness checks, structured redacted logs, request/correlation IDs, and safe error mapping.
3. Set per-environment authorization and feature flags. Demo mode is not production authentication.
4. Package/deploy only the reviewed CAP build using the generated project’s Cloud Foundry manifest/buildpack configuration. No application name, route, memory, instance count, or manifest is defined in this guide.
5. Run health checks and API contract, authorization, idempotency, audit-write, and negative protected-action tests.
6. Verify a disabled/missing HANA or workflow binding returns explicit failure and does not report a persisted success.

### Gate 5 — Deploy SAPUI5 frontend

1. Implement the eight modules and UI states defined in `DASHBOARD_AND_UI_SPECIFICATION.md`.
2. Configure the browser application to call only the authenticated CAP boundary. No HANA, AI Core, email, voice, or external supplier credentials in frontend configuration.
3. Build and deploy using the reviewed SAPUI5/BTP approach selected for the project. Build artifact, route, app name, destination, and Work Zone configuration remain pending.
4. Verify accessible labels, keyboard navigation, role-aware presentation, and data-mode/freshness labels.
5. Test API authorization independently of hidden/disabled UI controls.

### Gate 6 — Enable optional SAP/third-party adapters individually

Every adapter begins disabled, with synthetic fixtures as the only data. Enabling one requires a decision owner, verified entitlement/endpoint, approved credentials, data-protection review, contract test, outage test, monitoring, and rollback.

- **SAP AI Core / Generative AI Hub:** select/verify model and deployment; restrict context; schema-validate responses; test outage and unsupported output. No model selection or endpoint is established.
- **SAP Build Process Automation:** implement workflow and identity mapping; CAP independently validates returned decisions and exact proposal version. Do not silently fall back if unavailable.
- **SAP Build Work Zone:** verify app exposure and identity claims/SSO. Work Zone launch does not replace CAP authorization.
- **Supplier/ERP/logistics:** no SAP IBP/TM/Ariba, ERP, carrier, or supplier API is currently verified. Confirm source-of-truth, scopes, freshness, and error semantics before use.
- **Voice/email:** use provider sandboxes and explicit test recipients only. Human request, identity/consent, human review/approval, content/version binding, and outcome reconciliation are required. No actual calls or email sends in routine test runs.
- **Payments and protected operational actions:** no financial/payment adapter is defined. Keep execution disabled until separately designed, security reviewed, approved, and tested.

### Gate 7 — Work Zone and user acceptance

Configure SAP Build Work Zone only after the tenant, identity provider, application exposure, claims, role assignment, and session behavior are verified. Test all seven role personas using synthetic records; verify role boundaries at CAP. Supply Chain Head is the final approver for the eight protected categories. Emergency-control role/resume rules remain pending; do not enable pause/stop/kill/override/resume until decided and tested.

### Gate 8 — Release, monitor, and hand over

- Run the full [testing strategy](TESTING_STRATEGY.md), security review, demo walkthrough, accessibility checks, data-seed guard, and backup/restore drill.
- Review logs for redaction; confirm secrets are absent from browser bundles, repo, and logs.
- Verify health/readiness, CAP/HANA connectivity, workflow queue, AI/agent task status, source freshness, audit persistence, and provider error dashboards with agreed ownership.
- Release from a reviewed branch/build with versioned migration and rollback plan. Record artifact/version, environment, approvals, and smoke-test evidence.
- After release, watch error rates, stale sources, queue/task states, permission denials, and audit failures. Use documented escalation and incident-response ownership.

## 4. Configuration reference

Use the committed [`.env.example`](../.env.example) only as a **variable-name reference**. All provider toggles are false and secrets/endpoints are blank. Actual deployment configuration should be in approved platform bindings or secret storage, not a committed `.env`.

| Area | Current safe/default state | Before enabling |
|---|---|---|
| Demo data | `DATA_MODE=synthetic`; demo enabled in example; `DEMO_SEED_CONFIRMATION=disabled` | Enforce demo-only environment guard, verify schema/FKs, record fixture version/counts. |
| HANA | `HANA_ENABLED=false`; blank credentials | Provisioned instance, least-privilege binding, approved schema/migrations/tenant design, connectivity and outage tests. |
| AI | `AI_ENABLED=false`; blank endpoint/client secrets | Provider/model/data handling approved, secrets bound server-side, output validation and outage tests. |
| Workflow | `WORKFLOW_ENABLED=false` | Verified SAP Build Process Automation workflow or separately approved policy-equivalent CAP fallback; current-version and identity checks. |
| Voice/email | Disabled; providers blank | Provider and sandbox, human initiation/review, consent, recipient/content checks, failure reconciliation and audit. |
| Authentication | `AUTH_MODE=unconfigured` | Approved identity design, issuer/client config, role mapping, session, revocation, and server-side authorization tests. |
| Agent/protected actions | Feature flags false | Implemented guardrails, authorization, approvals, audit, failure path, and explicit deployment approval. Flags alone are not controls. |

Do not treat `.env.example` values as deployable secrets, endpoint names, or evidence of integration.

## 5. Health, rollback, and troubleshooting

### Health and monitoring requirements

The implementation must define non-sensitive readiness/liveness checks for CAP, persistence, workflow, AI adapter, and external adapters. A service being process-up does not prove its dependencies or business path are healthy. Show integration mode and last observation separately from connectivity status. Alert ownership, numeric thresholds, and SLAs remain open.

### Rollback and recovery

- Roll back application artifacts through the environment’s approved release mechanism; retain artifact and schema compatibility evidence.
- Apply backward-compatible database migrations where possible. Restoring HANA requires an authorized backup/restore procedure and reconciliation with workflow/external side effects.
- Do not “roll back” a real purchase, email, transfer, route, or schedule change by replaying an old state. Reconcile with the authoritative provider and require a separately authorized compensating action if appropriate.
- If audit persistence or approval state cannot be trusted, disable protected execution and escalate.
- Synthetic data reseeding is allowed only in an explicitly disposable demo/test environment and must be versioned/idempotent.

### Troubleshooting guide

| Symptom | Safe response |
|---|---|
| `cf login` or target selection fails | Verify BTP access, API endpoint, org/space, entitlement, and operator authorization with the platform owner. Do not guess or store credentials in shell history. |
| HANA connection unavailable | Keep reads/writes explicit as failed/unavailable; do not claim persistence. Check approved binding, network, identity, and service status. Protected action fails closed if durable approval/audit is unavailable. |
| CAP deployment fails | Preserve the deployment log after secret redaction; verify build artifacts, compatible runtime, manifest, and required service bindings. No generic instance names are prescribed here. |
| Work Zone login/role mismatch | Block access; verify issuer/audience/session/claim mapping with identity owner. Do not bypass CAP authorization or use a shared account. |
| AI returns malformed/unsupported result | Reject/mark partial, retain safe error and evidence references, and require human review. Do not transform invalid output into success. |
| Workflow decision appears missing/stale | Keep action pending; reconcile workflow status and exact proposal version before any execution request. |
| Voice/email status is unknown | Do not blindly retry. Query provider/test sandbox state and reconcile; preserve `outcome_unknown` until known. |
| Synthetic fixture fails validation | Stop seeding; report file/schema/version and validation error. Do not silently switch to another dataset or live source. |
| Monitoring or audit write fails | Report degraded state and disable affected protected operations until audit and policy checks are restored. |

## 6. Deployment completion criteria

Deployment may be reported complete only after the exact build and environment are identified, required services are verified, authorization and approval tests pass, synthetic/live mode boundaries are demonstrated, health and monitoring work, rollback/recovery is rehearsed, and an authorized owner accepts the evidence. None of those deployment claims is made by this guide.
