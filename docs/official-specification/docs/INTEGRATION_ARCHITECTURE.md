# Integration Architecture — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 3 — System Architecture and Technology
**Status:** Planned integration boundaries; the repository does not establish that any service connection is live or verified.
**Related documents:** [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Technology stack](TECH_STACK.md) · [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [Roles and access](USER_ROLES_AND_ACCESS.md) · [Demonstration scenario](02_DEMO_SCENARIO.md)

## 1. Purpose and integration rules

This document defines the intended source/destination, purpose, information exchange, interaction, security boundary, failure behaviour, and verification state for each integration family. It does not specify API endpoints, payload schemas, providers, credentials, or claimed connectivity; those are decisions for later phases.

1. All privileged data and actions pass through SAP CAP backend services and narrowly scoped adapters.
2. Credentials and service bindings remain server-side; never expose them in SAPUI5 or agent prompts.
3. Enforce user/agent authorization, input validation, and approval requirements at the backend, not by trusting UI state.
4. Preserve source, timestamp, verification status, and whether a value is synthetic, simulated, estimated, or live/verified.
5. The central orchestrator coordinates specialized agents; agents use only explicitly permitted backend tools. Their exact count/names and protocol remain pending.
6. Every protected business action must have current Supply Chain Head approval and an auditable execution result.
7. A simulation must be clearly labelled and must not be presented as a verified external integration.
8. On unavailable, stale, malformed, or conflicting data, show failure/uncertainty; never infer a successful action or fabricate live values.

## 2. Integration status vocabulary

| Status | Meaning |
|---|---|
| **Selected / planned** | Chosen as the target architecture or workflow, but subscription, connection, and operation are not verified. |
| **Verification required** | A real service/API may be used only after its availability, access, contract, and security are verified. |
| **Simulated adapter** | Synthetic local/demo behaviour; not connected to the represented live system. Must be labelled in UI and records. |
| **Pending decision** | Provider, API, protocol, schema, or ownership has not been selected. |

No integration below is labelled “verified” because the repository contains no evidence of live service connectivity.

## 3. Integration catalogue

| ID | Source → destination | Purpose / information exchanged | Expected interaction | Security considerations | Failure handling | Status |
|---|---|---|---|---|---|---|
| INT-01 | SAP CAP → SAP HANA Cloud | Persist/read domain records, synthetic demo data, proposal/workflow state, verification evidence references, communication state, and audit events according to a future schema. | Server-side CAP data-access layer; request/transaction patterns are to be designed with schema and service contracts. | Service binding and least-privilege service identity; authorization in CAP; no browser/agent database credentials; protect sensitive business data. | Explicit read/write error; never claim an unpersisted change succeeded. Fail closed for protected actions if required audit cannot be recorded. | Selected/planned database; connection/schema verification required. |
| INT-02 | SAP CAP AI adapter → SAP AI Core / Generative AI Hub | Send authorized, minimized analysis context and receive model output/status for summaries, evidence synthesis, and recommendations. | Backend request/response through a provider adapter; exact API/model/protocol pending. | Server-side credentials; minimize data; apply role and task authorization; define retention/data-use controls before live use; validate model output. | Show AI unavailable/failed, or use explicit synthetic response only if configured; never represent simulation as verified analysis. | Planned AI layer; connectivity and model configuration unverified. |
| INT-03 | SAP CAP → central AI orchestrator → specialized agents | Dispatch bounded analysis/preparation tasks and collect status, decision explanation, evidence references, proposal, tool summary, and errors. | Orchestrator-mediated task/result exchange; protocol and state model are pending. | CAP authorizes context; orchestrator delegates least privilege; no secrets or unrestricted data in prompts; protect against unauthorized tool invocation. | Task becomes failed/incomplete/awaiting human review; no protected action follows malformed or partial output. | Central orchestrator pattern confirmed; implementation/protocol pending. |
| INT-04 | Specialized agent → backend-controlled domain tools | Read authorized data, calculate exposure, retrieve evidence, or prepare a proposal using narrow backend services. | Tool call through CAP-controlled tool interface; each operation validates caller/task scope. | No direct HANA/external credentials; per-action authorization; human approval check on every protected operation; audit actor/task. | Reject invalid or unauthorized call; return explicit tool error; no side effect on retry unless safe/idempotent behaviour is designed. | Planned tool boundary; tool inventory/contracts pending. |
| INT-05 | SAP CAP workflow adapter ↔ SAP Build Process Automation | Create/advance human approval cases and receive decision/status for proposals, including reviewer and version references. | CAP starts/queries workflow; callback/polling/event pattern not selected. | Verify service identity, approver identity mapping, role claims, workflow access, and policy consistency. | If unavailable, keep proposal pending; use CAP-based fallback only if explicitly configured and tested to enforce same gates/audit. | Selected where available; entitlement/connectivity/workflow definitions unverified. |
| INT-06 | SAP CAP workflow service (fallback) → approver/UI | Provide application-managed approval queue if SAP Build Process Automation is unavailable. Exchange proposal ID/version, evidence references, decision, actor, time, rationale, and state. | CAP-managed request/status interaction; details pending design. | Must preserve Supply Chain Head final authority for all eight protected categories; no weaker permissions than SAP workflow. | If unavailable, block execution and report workflow failure; do not auto-approve or silently fall back. | Proposed fallback, not implementation or default. |
| INT-07 | SAPUI5 → SAP CAP | Exchange authenticated user requests, permitted views, proposal submissions, approval choices, and status responses. | Application service calls; API contracts pending. | TLS and selected identity mechanism to be designed; validate every request server-side; prevent client-side role spoofing. | Show explicit request failure, retain unsaved draft where safe, and never display assumed success. | Planned internal application boundary; APIs and authentication unverified. |
| INT-08 | SAP Build Work Zone → SAPUI5 / CAP access context | Launch the application and provide future enterprise access/identity context. | Configured launch/identity hand-off; exact SSO and claims integration pending. | Verify tenant, identity provider, token validation/audience, session controls, and role assignment. CAP re-authorizes independently. | Deny untrusted/expired identity; provide access error; do not treat Work Zone launch as business authorization. | Selected/planned access surface; configuration and identity unverified. |
| INT-09 | SAP CAP voice adapter ↔ internal stakeholder voice service | Initiate/coordinate two-way calls, capture answers, follow-ups, summaries, and call status for internal stakeholder coordination. | Provider-mediated call/session; provider, protocol, transcription, retention, and recording behaviour pending. | Consent and applicable requirements; AI identity disclosure; authorized contact selection; minimize captured data; restrict transcript/summary access. | Record call failure/drop/uncertainty; verbal statements stay unverified until corroborated; no action is authorized by a call. | Voice capability in product scope; external provider pending; simulation only until verified. |
| INT-10 | SAP CAP email adapter → email service → supplier/customer | Send approved human-reviewed message and receive send/delivery status where available. | CAP queues/submits approved final draft through a provider adapter; provider and status semantics pending. | Protect recipient and message data; server-side credentials; verify recipient; enforce approval on current final content; audit content/version and actor. | Do not retry blindly; mark failed/unknown status explicitly; no unapproved message is sent. | Email capability in product scope; provider pending; simulation only until verified. |
| INT-11 | Supplier/ERP source → CAP integration adapter | Obtain supplier status, eligibility, purchase/order information, quality evidence, and availability when an authorized source exists. | Backend read/synchronization pattern pending source and contract. | No direct browser access; validate source identity and permissions; protect commercial/quality information; provenance and freshness required. | Mark missing/stale/conflicting values; do not treat supplier-reported stock as verified or usable. | External APIs and SAP systems pending; synthetic supplier adapter allowed for demo. |
| INT-12 | Logistics/carrier/shipment source → CAP integration adapter | Obtain shipment status, route, carrier, ETA, and delivery evidence where authorized and available. | Backend polling/event/API interaction to be selected after source verification. | Protect credentials; validate source/time and shipment identity; no assumed carrier access or map-provider integration. | Show last known status and staleness; do not invent an ETA or assert arrival; route changes require approval. | API/provider pending; synthetic tracking adapter allowed for demo. |
| INT-13 | Simulated ERP/supply-chain adapter ↔ CAP | Supply synthetic inventory, orders, supplier, production, shipment, and scenario values for demonstration if no live source is verified. | Deterministic fixtures or explicitly simulated service, labelled in data/UI; actual mechanism pending. | No real patient/company/supplier data; no real credentials; isolate from production actions and label simulation at source. | If fixture unavailable or invalid, show missing/simulation failure; never silently substitute synthetic values into a live context. | Permitted simulation; not live SAP IBP/TM/Ariba/ERP. |
| INT-14 | CAP domain services → audit/monitoring store and authorized viewers | Record agent/user activity, approvals, tool calls, emergency events, communications, integration status, and action outcomes; surface failures. | Server-generated structured events; storage/telemetry product and search interface pending. | Least-privilege access; do not log secrets or excessive sensitive payloads; protect audit integrity. | Protected action cannot proceed if required audit event cannot be committed; alert on monitoring/audit failure. | Audit requirement confirmed; technology and implementation pending. |

## 4. Data and control flows

### 4.1 Read and analysis flow

1. An authenticated user requests incident, inventory, supplier, shipment, or customer data from SAPUI5.
2. CAP validates identity, role, record scope, and request parameters.
3. CAP reads HANA or invokes the appropriate adapter; each returned value retains its source, update time, and verification/simulation state.
4. If analysis is requested, CAP sends only authorized, relevant context to the central orchestrator.
5. The orchestrator delegates bounded tasks to specialized agents; agents call only permitted backend tools.
6. CAP validates the result and stores/returns a recommendation or explanation. It remains non-executable until human approval.

### 4.2 Protected action flow

1. A human or agent prepares a proposal with action category, current version, evidence, assumptions, and expected impact.
2. CAP classifies the action and checks that required evidence/preconditions are represented.
3. For any of the eight protected categories, CAP creates an approval request. The Supply Chain Head is final authority; workflow provider does not change that policy.
4. The approver reviews and decides on the exact proposal version. Modification creates a new version and requires approval again.
5. A separate execution request revalidates identity, permissions, current approval/version, business checks, and required audit availability.
6. CAP invokes the protected backend tool/adapter, records the execution outcome, and reports success or failure.

The eight categories are alternative-supplier purchasing; inter-warehouse stock transfer; factory schedule change; customer-order prioritization/reallocation; shipment route/carrier change; major customer disruption notification; payment/financial commitment; and supplier approval change. No agent, provider, or fallback can bypass the gate.

## 5. Simulation and live-integration separation

- An adapter must declare its operational mode and source provenance, for example **SIMULATION — synthetic demonstration data** or **LIVE — verified source**.
- “Live” may be used only after connection and expected behaviour are tested and documented. A selected product name or credential presence alone is insufficient.
- Synthetic data must never be merged indistinguishably with live values; preserve mode/provenance through CAP responses, derived metrics, AI context, audit records, and UI.
- Simulation adapters must not issue real purchases, transfers, schedule changes, carrier changes, financial transactions, or external communications.
- SAP AI Core, SAP Build Process Automation, SAP HANA Cloud, SAP Build Work Zone, SAP IBP, SAP TM, SAP Ariba, supplier and logistics APIs are not represented as connected by this document.

## 6. Cross-cutting security and operational controls

- Keep all integration secrets in an approved server-side secret/configuration facility; exact facility is a deployment decision.
- Use least-privilege service identities and rotate/revoke credentials under the later security design.
- Validate schemas and trust boundaries even when the calling system is internal or an AI agent.
- Bind approval to action category and immutable proposal version; re-check at execution.
- Record identity, actor type, timestamps, status, result, relevant references, and failure reason without logging credentials or private chain-of-thought.
- Apply timeouts, retry, deduplication, and idempotency according to each provider's verified contract; do not assume their semantics.
- Provide explicit monitoring for adapter availability, stale data, workflow backlog, AI/agent failures, approval state, and audit-write failures.
- Detailed authentication mechanism, encryption configuration, retention, provider list, rate limits, payload schemas, and service-level targets remain pending.

## 7. Pending integration decisions

1. SAP tenants, entitlements, service bindings, regions, connectivity tests, and operational owners for each selected SAP service.
2. AI Core/Generative AI Hub model, deployment, configuration, data handling, and response contract.
3. Workflow provider availability, workflow definition, identity mapping, CAP fallback, and escalation/expiry rules.
4. Voice and email providers, consent/recording policy, status callbacks, and data retention.
5. Supplier/ERP/logistics/shipment APIs and their source-of-truth ownership.
6. HANA schema and CAP API contracts.
7. Specialized agent tools and inter-agent protocol.
8. Authentication, secrets management, encryption, audit storage/immutability, and monitoring implementation.

These decisions should be resolved in the architecture, security, and data/integration phases before any production integration is claimed.
