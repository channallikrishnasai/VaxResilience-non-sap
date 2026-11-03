# Integration Catalogue and Data Exchange

**Document version:** 1.0
**Project stage:** Phase 5 — Data Model, Database Schema and Integrations
**Status:** Proposed integration update built on Phase 3/4. No live service connections, provider endpoints, or operational integrations are verified.
**Related documents:** [Phase 3 integration architecture](INTEGRATION_ARCHITECTURE.md) · [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Agent design](05_AGENT_DESIGN.md) · [Tool specifications](AGENT_TOOL_SPECIFICATIONS.md) · [Data model](08_DATA_MODEL_AND_DEMO_DATA.md) · [API contracts](API_CONTRACTS.md)

## 1. Status vocabulary and scope

| Label | Meaning |
|---|---|
| **Verified** | Connectivity, identity, contract, expected behaviour, security and failure path have been tested and documented. No integration in this repository meets this evidence threshold. |
| **Proposed** | Intended architecture or contract; not connected/tested. |
| **Simulated** | Isolated synthetic fixture/adapter for demonstration; never a live SAP/external integration. |
| **Pending decision** | Provider, endpoint, transport, identity mapping, schema or operational owner remains unselected. |

This catalogue refines `INTEGRATION_ARCHITECTURE.md` using Phase 4 role/tool boundaries and Phase 5 proposed data/API contracts. SAPUI5, SAP CAP, Node.js, SAP HANA Cloud, SAP AI Core / Generative AI Hub, SAP Build Process Automation, SAP BTP Cloud Foundry and SAP Build Work Zone remain selected/planned baseline technologies, not verified services.

## 2. Integration catalogue

| ID | Source → destination | Purpose and data exchanged | Interaction / protocol | Security | Failure, retry, monitoring | Status |
|---|---|---|---|---|---|---|
| INT-01 | SAP Build Work Zone → SAPUI5 / CAP | Launch app and eventual identity/session context. | Enterprise launch and identity hand-off; exact SSO/token protocol is not selected. | Verify issuer, audience, session, claims and role mapping; CAP independently authorizes. | Reject expired/untrusted context; access failures visible; monitor auth errors. No retries for invalid identity. | **Proposed; pending identity design.** |
| INT-02 | SAPUI5 → SAP CAP | Dashboard reads, scoped business reads, proposal/draft submissions, approvals and state. | Proposed JSON REST `/api/v1`; endpoints documented in [API contracts](API_CONTRACTS.md). Actual CAP REST/OData exposure is undecided. | Authenticated human principal; TLS, server-side authorization, input validation, CSRF/session controls depend on selected identity configuration. No client secrets. | Return explicit errors and correlation ID; retry safe reads only; use idempotency/version checks on writes. Monitor latency, auth failures, stale responses. | **Proposed internal app integration.** |
| INT-03 | SAP CAP ↔ SAP HANA Cloud | Persist/read master, operations, incident, workflow, evidence references, communication state and audit. | CAP persistence/DB service binding; exact driver/protocol and CDS artifacts depend on verified SAP setup. | Server-side least-privilege binding, tenant/organization isolation, data minimization, database authorization. Browser/agent never connects directly. | Persistence error explicit; fail closed if required audit cannot be saved; no success claim for uncommitted writes. Monitor availability, transaction errors, capacity. | **Planned; provisioning/connectivity unverified.** |
| INT-04 | SAP CAP → SAP AI Core / Generative AI Hub | Bounded analysis task context; model response/status, metadata and usage as later permitted. | CAP-side adapter request/response; model/API/version, transport and endpoint not selected. | Minimize and redact context; server-side secret binding; verify service, deployment and data handling; schema-validate response; model has no authority. | Timeout/failure explicit; no silent synthetic substitution; if separately enabled, simulated output labelled. Bounded read-only retry only after provider semantics are verified. Monitor model errors/latency without logging sensitive prompt content. | **Planned; no tenant/model/connectivity verified.** |
| INT-05 | SAP CAP/orchestrator ↔ five specialist roles | Bounded tasks/results, evidence refs, uncertainty, proposals and failure state. | Proposed structured task/result contract; no wire protocol or independent agent deployment selected. | CAP-created scope and tool allowlist; no credentials, broad record dumps, self-assigned role or direct DB access. | Partial/failed/timed-out states; dependent task waits for verified input; side-effect retries forbidden. Monitor task age/state, invalid output and failure. | **Proposed; specialist identities remain proposed.** |
| INT-06 | Specialist roles/orchestrator → CAP-controlled tools | Scoped reads, deterministic calculations, verification checklist, proposal preparation, approval state. | Tool names and illustrative request/response in Phase 4 tool specs; all through CAP. | Per-call authorization, typed schema, allowlist, actor/task/correlation, output validation. Approval gates independent of model. | Denied/malformed calls explicit; stale source visible; no blind retries; audit tool summaries. | **Proposed; tools not implemented.** |
| INT-07 | SAP CAP ↔ SAP Build Process Automation | Submit approval case, proposal version, evidence refs; receive decision/state. | Adapter contract proposed; polling/callback/event transport and SAP API are not specified. | Verify service identity, approver identity/role mapping, workflow policy and proposal version. CAP rechecks decision independently. | Provider outage leaves request pending and blocks action; CAP fallback only if explicitly implemented/tested policy-equivalent. Monitor queue age and callback errors. | **Selected where available; availability/connectivity unverified.** |
| INT-08 | SAP CAP → supplier/quality source adapter | Supplier identity/status, quality/regulatory evidence references, quantity/capacity/confirmation status. | No source/API selected; use bounded read/sync contract after verification. | Server-side credentials, access scope, source identity, evidence provenance; don't expose commercial/quality data. | Missing/expired/conflicting evidence remains unknown; reported stock not available coverage. Retry only safe reads under a verified policy. | **Pending; fixture is simulated.** |
| INT-09 | SAP CAP → logistics/shipment adapter | Shipment, route, carrier and ETA observations and timestamps. | No carrier, SAP TM, map, or tracking endpoint selected. | Server-side credentials, validate shipment identity/source/freshness; no user-supplied arbitrary URL. | Stale last-known status explicit; no invented ETA; unknown dispatch outcome reconciled. Monitor source age/error. | **Pending; fixture is simulated.** |
| INT-10 | SAP CAP → voice provider / stakeholder | Human-authorized call initiation, contact reference, purpose, consent state, call result/summary. | Provider, protocol, transcription, callback and recording policy pending. | Human initiated; identity disclosure and consent; minimal information; access-restricted summary; no raw transcript by default. | No consent/provider means unavailable; drops/ambiguity remain incomplete; verbal response is unverified. Never retry a call blindly. | **Pending; no provider.** |
| INT-11 | SAP CAP → email provider / recipients | Exact human-approved draft/recipient version and send outcome. | Provider, SMTP/API and delivery status semantics pending. | Credentials server-side; recipient/content approval bound to version; major disruption notice requires Supply Chain Head approval. | Changed content invalidates approval; unknown send outcome reconciled; no blind resend. Audit draft/decision/result. | **Pending; no provider.** |
| INT-12 | CAP demo-data adapter ↔ JSON fixtures | Load/read fictional organization, suppliers, inventory, scenario, approval, agent activity and audit records. | Static JSON dataset; schema validation plus FK/invariant checks before seed/read. | Only synthetic; explicit demo mode; no live credentials or operational writes; seed guard against non-demo environment. | Invalid fixture is a setup failure, not silent fallback; report schema/version and record counts. | **Simulated; files are committed synthetic fixtures.** |
| INT-13 | CAP application ↔ audit/monitoring | Record events and surface service/agent/workflow failures. | Proposed structured server-side events; concrete SAP observability product/protocol pending. | Minimize/redact, restrict access, separate write/read privileges, protect integrity. | Protected action fails closed if required audit write fails; monitoring outage visible; no credentials/chain-of-thought. | **Required capability; storage/technology pending.** |

### Not claimed

SAP IBP, SAP TM, SAP Ariba, a live ERP/QM/WMS, real supplier, carrier, map service, voice provider, email provider, payment rail, SAP AI endpoint, Build Process Automation workflow, Work Zone identity integration, and HANA deployment are **not verified or claimed connected**. Synthetic records are not operational data.

## 3. Data exchange and transformation

1. **SAPUI5 to CAP:** Client sends a versioned resource/action and user-selected references; CAP derives identity/scope. Response returns normalized entity data, data mode, source status, freshness, and correlation.
2. **CAP to HANA:** CAP maps domain entities to the proposed schema and commits workflow/business records with required audit events according to a future transaction design.
3. **CAP to AI:** CAP sends minimal, authorized context and references, never direct credentials. Model output is treated as untrusted, validated and mapped to an agent result; no source fact is promoted by inference.
4. **Orchestrator to specialists:** Provide task IDs, approved scope/tool allowlist, input references, deadline and expected result fields. Results preserve evidence, assumptions, conflicting claims and task state.
5. **Agent to tool:** CAP validates principal/task/resource/action on every invocation; tool responses include status, source/data mode, evidence references and safe errors.
6. **Workflow boundary:** CAP submits a specific immutable proposal version and interprets returned decision only after validating identity, role, state and version. Workflow-provider acknowledgement is not execution.
7. **Supplier/logistics:** Adapter responses normalize source identifiers, quantities/units, event times, evidence and freshness. No source-specific field is accepted as verified without source status.
8. **Voice/email:** Communications use explicit human authorization and consent/content versions. A simulated delivery state must remain `simulated`, not `sent`/`delivered` as if live.
9. **Audit/monitoring:** CAP emits minimized structured events with actor, timestamp, action, result and correlation; an audit failure blocks protected execution.

## 4. Failure, retries, timeouts, and monitoring

- Define transport timeouts/rate limits only after provider contracts are selected; this document assigns no numeric values.
- Retry transient read-only requests only under bounded, verified adapter policy. Do not automatically retry email, call, purchase, transfer, route change, production change, payment, supplier change, or other side effects.
- On a timeout after side-effect dispatch, store `outcome_unknown`, reconcile external state, and require current authorization before any retry.
- Use request/correlation IDs and idempotency keys at CAP for proposal, workflow request, and dispatch. A duplicate key/body retrieves the existing state; a changed body under same key is rejected.
- Show per-integration mode (`proposed`, `simulated`, or later `verified`), last observation where applicable, and actionable error. Do not show a green/live state solely because configuration values exist.
- Monitor connection health, source freshness, workflow backlog, AI/agent task status, tool failures, authorization denials, audit persistence failures, duplicate/unknown side effects and synthetic-mode isolation.
- Keep secrets in a verified server-side platform binding/secret facility selected at deployment. `.env.example` contains names/placeholders only and does not activate any service.

## 5. Environment configuration reference

The root [`.env.example`](../.env.example) is a safe name/template inventory. Empty provider values are deliberately unconfigured. It must not be copied as evidence that an integration works. **Mandatory** below means required for a documented local synthetic demo configuration only; deployed requirements depend on the verified CAP/BTP setup.

| Category / variables | Requirement class | Guidance |
|---|---|---|
| `APP_ENV`, `APP_PORT`, `CAP_LOG_LEVEL`, `APP_BASE_PATH` | Mandatory for a future local application runtime; not used by this documentation-only repository | Safe development defaults only; actual CAP conventions must be confirmed during implementation. |
| `DATA_MODE`, `DEMO_DATA_ENABLED`, `DEMO_SCENARIO_ID`, `DEMO_SEED_CONFIRMATION` | Mandatory for a synthetic demo setup; environment guard required | Keep mode synthetic; reject seeding outside a confirmed demo environment. |
| `HANA_ENABLED`, `HANA_HOST`, `HANA_PORT`, `HANA_DATABASE`, `HANA_USER`, `HANA_PASSWORD`, `HANA_CREDENTIALS_BINDING` | Provider-dependent and optional until HANA is provisioned/verified | Keep disabled and blank here. In deployment use a platform binding/secret facility; never commit populated credentials. |
| `AI_ENABLED`, `AI_BASE_URL`, `AI_RESOURCE_GROUP`, `AI_CLIENT_ID`, `AI_CLIENT_SECRET`, `AI_AUTH_URL` | Provider-dependent and optional until SAP AI service/model is verified | Keep disabled and blank. No model or endpoint is selected. |
| `WORKFLOW_ENABLED`, `WORKFLOW_BASE_URL`, `WORKFLOW_CLIENT_ID`, `WORKFLOW_CLIENT_SECRET`, `WORKFLOW_CALLBACK_SECRET` | Provider-dependent and optional until SAP Build Process Automation workflow is verified | Keep disabled and blank. Callback secrets must be secret-managed if ever used. |
| `VOICE_ENABLED`, `VOICE_PROVIDER`, `VOICE_BASE_URL`, `VOICE_API_KEY` | Provider-dependent and optional; provider unselected | Keep disabled and blank; no calls can be made from configuration placeholders. |
| `EMAIL_ENABLED`, `EMAIL_PROVIDER`, `EMAIL_BASE_URL`, `EMAIL_API_KEY` | Provider-dependent and optional; provider unselected | Keep disabled and blank; sending requires approved human-reviewed content and verified recipient/provider. |
| `AUTH_MODE`, `AUTH_ISSUER_URL`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET` | Provider-dependent for any non-demo deployment; authentication design pending | `unconfigured` is an explicit safe value, not authentication. A local demo must not imply production authentication. |
| `FEATURE_AGENT_EXECUTION`, `FEATURE_EXTERNAL_COMMUNICATIONS`, `FEATURE_PROTECTED_ACTION_EXECUTION` | Optional feature flags; default disabled | Flags cannot replace authorization/approval. Enabling requires implemented controls, provider verification and tests. |

No value containing credentials, actual service URLs, tenant IDs, private network information, or personal contact details belongs in the committed example. The example makes no claim that any provider is operational.

## 6. Pending verification and design decisions

For every selected SAP service: tenant/subscription, region, service plan, binding, identity, network, entitlement, data handling, contract, operational owner, connectivity test and failure test. Further decisions: AI model/service setup; workflow callback and identity mapping; CAP fallback; external supplier/logistics APIs; voice/email provider and consent/retention; authentication; HANA schema/migrations/tenant isolation; audit immutability and retention; monitoring; and source-of-truth ownership. Until verified, classify interfaces as proposed or simulated.
