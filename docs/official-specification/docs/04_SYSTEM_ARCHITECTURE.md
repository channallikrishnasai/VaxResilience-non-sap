# System Architecture — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 3 — System Architecture and Technology
**Status:** Conceptual target architecture; no application components, service connectivity, or live integrations are claimed as implemented or verified.
**Related documents:** [Project overview](00_PROJECT_OVERVIEW.md) · [Demonstration scenario](02_DEMO_SCENARIO.md) · [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [Roles and access](USER_ROLES_AND_ACCESS.md) · [User journeys](USER_JOURNEYS.md) · [Technology stack](TECH_STACK.md) · [Integration architecture](INTEGRATION_ARCHITECTURE.md) · [System diagram](diagrams/system-architecture.md)

## 1. Purpose and architecture overview

This document describes the intended component boundaries and information flow for VaxResilience, a pharmaceutical supply-chain control tower built around SAPUI5, SAP CAP on Node.js, a central AI orchestrator with specialized agents, SAP AI Core / Generative AI Hub where verified, SAP HANA Cloud, and SAP BTP Cloud Foundry.

The architecture is a target, not a record of delivered software. The repository is a documentation project; connections, deployment, data storage, SAP services, external providers, and agent implementation have not been verified. A configured SAP technology is not evidence that a tenant, subscription, credential, service binding, or working integration exists.

### Design principles

1. **SAP ecosystem baseline:** SAPUI5 is the frontend; SAP CAP with Node.js is the application backend; SAP HANA Cloud is the planned primary persistence layer; SAP BTP Cloud Foundry is the planned runtime; SAP Build Work Zone is the planned enterprise access surface.
2. **Backend enforcement:** Business operations, authorization, approval checks, integration credentials, and audit recording are controlled server-side. The UI is not a security boundary.
3. **AI as decision support:** The central orchestrator coordinates specialized agents. Agents analyze and prepare; authorized humans decide protected actions. Exact agent count, identities, and protocols remain pending.
4. **Approval before action:** Every protected action in Phase 2 must pass the required human approval before execution. The Supply Chain Head is final approval authority. Tool availability does not grant authorization.
5. **Explicit provenance:** Data is distinguished as verified, synthetic, simulated, estimated, stale, or unavailable. No unavailable external data is silently represented as live.
6. **Auditable outcomes:** Material user, agent, tool, approval, communication, and execution events are recorded with identity/actor, time, action, result, and relevant evidence references.
7. **Adapter isolation:** SAP and external systems are called through backend-controlled adapters so provider changes and simulations do not leak into UI or agent authority.
8. **Fail-safe behaviour:** Failure, uncertainty, stale data, or missing approval blocks protected execution and is surfaced for human review.

## 2. Logical components and responsibilities

| Component | Responsibility | Trust boundary / notes |
|---|---|---|
| SAP Build Work Zone | Planned enterprise entry and access surface for the application. | Availability and identity configuration are unverified; it does not by itself define the application's authorization rules. |
| SAPUI5 frontend | Render the eight modules, user context, source/status labels, recommendations, approval queue, and permitted controls. Send authenticated requests to CAP. | Treat all browser input as untrusted. Do not store service credentials or make direct privileged calls to SAP AI Core, HANA, workflow, voice, or external systems. |
| SAP CAP application services (Node.js) | Expose application APIs; validate inputs; enforce role/scope authorization; apply domain rules; coordinate persistence, approvals, audit, AI, and adapters. | Authoritative policy and execution boundary. Exact service/API contracts are pending Phase 5. |
| Central AI orchestrator | Receive bounded analysis tasks from CAP; coordinate the selected specialized agents; collect decision summaries, evidence references, proposed actions, and task status. | Agent composition and communication protocol are pending. It cannot grant permissions or bypass CAP approval/execution controls. |
| Specialized agents | Perform bounded read/analyze or recommend/prepare tasks through approved tools; return structured results, sources, assumptions, and errors. | Exact count/names are pending. No direct unrestricted database or external-system credentials. No private chain-of-thought disclosure is required. |
| Backend-controlled tools and domain services | Provide narrow, validated operations for reading permitted records, calculating exposure, preparing proposals, checking workflow state, and requesting approved operations. | Tool permission is scoped by principal, task, and action category. Protected tools independently require a current approval. |
| AI Core / Generative AI Hub adapter | Provide a backend abstraction for model/inference requests where the SAP AI service is subscribed, configured, and verified. | Planned target only. Model, endpoint, deployment, data handling, availability, and connectivity are pending verification. |
| Workflow adapter | Start and track approval workflows using SAP Build Process Automation if verified; otherwise use a clearly labelled CAP-based workflow fallback. | Both paths must enforce the same approval policy and audit contract; no workflow bypass. |
| Integration adapters | Isolate HANA access and future ERP, logistics, voice, email, and other external connections; map provider responses to domain records. | Credentials are server-side. Each adapter declares verified/live versus simulated status and explicit failure behaviour. |
| SAP HANA Cloud | Planned primary persistence for authorized operational/demo records, workflow references, and audit records as designed in later phases. | Schema, tenancy, retention, encryption configuration, and connection are not established in this document. |
| Audit and monitoring services | Record decision/execution events and surface application, agent, workflow, and adapter failures to authorized operators. | Audit writes are server-controlled; immutability/search implementation remains a design decision. |

## 3. Frontend architecture

SAPUI5 provides the application shell and pages specified in [DASHBOARD_AND_UI_SPECIFICATION.md](DASHBOARD_AND_UI_SPECIFICATION.md): Executive Dashboard, Supply Chain Digital Twin, AI Command Centre, Inventory & Manufacturing, Customers & Orders, Approvals & Decisions, Risk, Compliance & Audit, and Resilience & Impact Analytics.

The frontend is a presentation and interaction client:

- Establish authenticated user context through the selected enterprise access mechanism, to be decided and verified later.
- Request only the records/actions available to that user; CAP independently enforces authorization.
- Display source, timestamp/freshness, verification status, synthetic/simulated labels, estimates, errors, and approval state.
- Submit user edits as validated proposals or commands; protected business actions are not executed merely by rendering or clicking a recommendation.
- Display an explicit confirmation and resulting server state for consequential human actions.
- Avoid direct browser-to-provider calls for model inference, HANA, workflow execution, voice/email sending, suppliers, or logistics systems.

## 4. SAP CAP backend and domain boundary

SAP CAP on Node.js is the intended application backend and policy enforcement point. Conceptually, CAP responsibilities include:

1. Accept and validate UI requests and authenticated identity claims.
2. Apply role, record-scope, and action authorization before returning data or performing a command.
3. Read/write domain data through the planned persistence boundary.
4. Create incident analyses, recommendations, proposals, and approval records as distinct states.
5. Invoke the central orchestrator for bounded analysis; validate agent output before exposing it or creating a proposal.
6. Route approval-required actions through the configured workflow adapter.
7. Re-check the approved proposal version and all preconditions at execution time.
8. Invoke narrow backend tools/adapters only after authorization and required approval.
9. Record audit events and report explicit success, pending, or failure state.

The exact CAP service model, entity boundaries, API contracts, authorization implementation, transaction strategy, and HANA schema are pending Phase 5 and architecture design. This document does not prescribe endpoint names or claim generated CAP services exist.

## 5. Central orchestrator and specialized agents

The confirmed coordination shape is a **central orchestrator coordinating specialized agents**. The orchestrator accepts a task through CAP, determines bounded work for eligible agents (exact routing design pending), supplies only authorized context/tools, collects their result, and returns a structured outcome to CAP. CAP owns persistence, authorization, approval, and execution policy.

Agent outputs should contain, as applicable:

- Task/status and a concise decision explanation (not private chain-of-thought).
- Recommendation or proposed-action data, clearly marked non-executable.
- Evidence/source references, assumptions, freshness, and uncertainty.
- Tool-call summary and outcome.
- Errors, incomplete checks, and escalation needs.

Agents have three product authority levels from Phase 2: Level 1 Read & Analyse; Level 2 Recommend & Prepare; Level 3 Execute with Permission. Level 3 does not mean autonomous authority. Any execution-capable tool must call backend authorization and approval enforcement, verify the current proposal version, and write an audit event. The Supply Chain Head remains the final approver for all eight protected categories.

Exact agent count/names, model assignments, memory design, agent-to-agent protocol, retry policy, and delegation strategy remain pending. A proposal to use structured messages and bounded task contracts is an architecture recommendation, not a confirmed implementation decision.

## 6. AI service layer

SAP AI Core / Generative AI Hub is the selected/planned AI service layer. When and only when connectivity, model deployment, credentials, data handling, and required service access are verified, the CAP-side AI adapter may submit approved, minimized task context and receive model results. The adapter should normalize provider errors and response metadata and should not grant the model direct authority over enterprise records or action tools.

No model, provider configuration, deployment endpoint, region, performance characteristic, or live SAP AI integration is asserted. If the service is unavailable, the request must fail or use an explicitly configured synthetic/simulated analysis path. The UI must label simulation; it must not present generated fallback content as verified operational fact.

## 7. Data and persistence

SAP HANA Cloud is the planned primary database. The future data design must account for operational records, provenance and freshness, incident context, recommendations/proposal versions, approval and execution state, supplier verification evidence, communication records, and audit events. The final schema, tenant setup, connection, retention, encryption, backup, and search strategy are undecided.

CAP is the intended access boundary to persistent business data. Agents and SAPUI5 should not receive broad HANA credentials or bypass CAP authorization. Audit-record storage must support the project's auditability requirements; technical immutability and retention controls require explicit design in later phases.

## 8. Workflow and approval orchestration

SAP Build Process Automation is the selected workflow technology where available and verified. CAP-based workflow is an explicitly identified fallback if Build Process Automation is unavailable or not connected. The workflow adapter exposes a consistent application contract so the UI and domain services do not depend on unverified vendor connectivity.

Approval processing is separate from AI recommendation and action execution:

1. CAP receives a proposal and classifies its action.
2. For a protected category, CAP creates a pending approval case for the Supply Chain Head and any defined operational review.
3. The approver reviews evidence, assumptions, risks, and the precise proposal version; records approve, reject, modify, or escalation.
4. A modified proposal receives a new version and requires approval again.
5. Before execution, CAP verifies the approval is current, applies authorization and data/business preconditions, then invokes a narrow backend tool.
6. CAP records execution outcome separately from approval and surfaces failures.

The eight protected categories are alternative supplier purchases; inter-warehouse transfers; production schedule changes; customer-order prioritization/reallocation; route/carrier changes; major customer disruption notifications; payments/financial commitments; and supplier approval changes. No fallback workflow can weaken these requirements. Exact delegation, expiry, escalation, and emergency permissions remain pending.

## 9. Communications and external services

Voice and email are in the product scope, but providers are not selected or verified. CAP must mediate communication requests through isolated backend adapters. AI may prepare call questions, summaries, and email drafts; calls require applicable consent and identity safeguards, and email sending must follow human review/approval. Major disruption notices require Supply Chain Head final approval. Unverified delivery dates, quantities, guarantees, and financial commitments must not be sent.

Supplier, ERP, logistics, and shipment information also enters through backend adapters. No SAP IBP, SAP TM, SAP Ariba, supplier, carrier, ERP, map, voice, or mail API is represented as connected. Synthetic adapters can support a demonstration but must identify their simulated status in data and UI.

## 10. Authentication, authorization, audit, and monitoring

Authentication and enterprise identity details are conceptual and pending. SAP Build Work Zone is the planned enterprise access surface, not a confirmed identity provider or complete authorization design. CAP must validate identity and enforce role- and record-scoped permissions on every read and action. The final seven roles and permission baseline are in [USER_ROLES_AND_ACCESS.md](USER_ROLES_AND_ACCESS.md).

Audit events should associate actor (human, agent, or system), incident/task, action, proposal/approval version where relevant, timestamp, result, and evidence references. Material actions include recommendations, tool calls, approvals, rejections/modifications, emergency controls, communications, and execution outcomes. Observability should expose failures and pending states to authorized users without leaking credentials, sensitive data, or private chain-of-thought.

## 11. End-to-end information and action flow

1. A user opens a SAPUI5 module through the planned enterprise access surface.
2. SAPUI5 sends a user-scoped request to CAP; CAP authenticates/authorizes and validates it.
3. CAP reads available records through its persistence/integration boundary and returns data with provenance/status.
4. For an analysis request, CAP sends only authorized, relevant context to the central orchestrator.
5. The orchestrator coordinates one or more bounded specialized agents using permitted backend tools. Agents return explanations, evidence references, proposals, and explicit status/errors.
6. CAP validates the result and stores/returns a non-executable recommendation or proposal.
7. If the proposal is protected, CAP routes it to the approval workflow; the Supply Chain Head makes the final human decision.
8. On approval, a separate execution request re-checks actor authorization, approval version/status, verification prerequisites, and business constraints.
9. CAP invokes the relevant backend-controlled adapter/tool; external changes are not performed directly by the browser or agent.
10. CAP records and returns execution outcome. The UI distinguishes approved, executing, complete, and failed states.

The [system architecture diagram](diagrams/system-architecture.md) illustrates these boundaries. The [supply-chain flow diagram](diagrams/supply-chain-flow.md) separates physical product flow from information and decision support.

## 12. Error handling and fallback behaviour

| Failure | Required behaviour |
|---|---|
| SAP AI Core/model unavailable | Return explicit analysis failure or explicitly labelled simulation; do not claim verified AI analysis. |
| Agent timeout/error/invalid result | Mark task failed or incomplete, preserve error context, and do not create an executable action from malformed output. |
| Workflow provider unavailable | Use CAP workflow only if that fallback is configured, tested, and enforces the same gate; otherwise leave action pending and report unavailability. |
| HANA/persistence unavailable | Do not report writes as successful; preserve safe read-only state only where data freshness and correctness are known. |
| External ERP/logistics/voice/email unavailable | Mark source/communication unavailable; do not fabricate updates or claim delivery/call success. |
| Stale, conflicting, or unverified business data | Surface provenance and warning; prevent dependent protected execution until required checks are resolved. |
| Missing, rejected, expired, or stale approval | Block protected execution and identify the approval state. |
| Audit write failure | Fail closed for protected actions if required audit cannot be recorded; expose and escalate the failure. |

These are architectural requirements. Retry, queueing, idempotency, transaction, and recovery mechanisms require implementation design and testing; do not infer them from this conceptual document.

## 13. Deployment and environment

SAP BTP Cloud Foundry is the selected/planned deployment runtime. SAPUI5, CAP/Node.js services, and any worker/orchestration components would be deployed and configured according to the eventual BTP design. SAP HANA Cloud, AI Core/Generative AI Hub, Build Process Automation, Work Zone, and external services require their own verified service entitlements, bindings, network/security configuration, and operational procedures.

No cloud environment, subscription, service binding, region, topology, availability target, or production deployment is claimed. Detailed deployment and operational architecture remain future design work.

## 14. Decisions and limitations

**Selected baseline:** SAPUI5; SAP CAP; Node.js; SAP AI Core / Generative AI Hub as planned AI services; SAP Build Process Automation where verified; SAP HANA Cloud as planned primary database; SAP BTP Cloud Foundry; SAP Build Work Zone.

**Pending:** exact agents/names/tools; model/provider configuration; agent communication protocol; voice and email providers; ERP/logistics APIs; live integration verification; data schema; API contracts; production identity/authentication; emergency pause/stop/override/resume permissions; and deployment topology.

The architecture is consistent with the product and approval specification, not a commitment that any target service has been provisioned or connected.
