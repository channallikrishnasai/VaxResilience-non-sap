# Technology Stack — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 3 — System Architecture and Technology
**Status:** Selected project baseline and planned responsibilities; service provisioning/connectivity and application implementation are unverified.
**Related documents:** [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Integration architecture](INTEGRATION_ARCHITECTURE.md) · [Project overview](00_PROJECT_OVERVIEW.md) · [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md)

## 1. Status and interpretation

The technologies in this document are the selected SAP ecosystem baseline established in project documentation. “Selected” means the architecture choice is documented; it does not mean that a service has been provisioned, configured, connected, or tested. No live integration is claimed.

| Status | Meaning |
|---|---|
| **Selected** | Chosen as the project technology baseline. Implementation and service connectivity may remain incomplete. |
| **Planned / verification required** | Intended for the target design; subscription, tenant, setup, credentials, connectivity, or operational fit has not been verified. |
| **Simulated** | A demonstration adapter or synthetic response, explicitly labelled; not an integration with the corresponding live system. |
| **Pending decision** | Specific product/provider/configuration details are not yet finalized. |

## 2. Selected technology overview

| Layer | Selected technology | Status | Responsibility in VaxResilience |
|---|---|---|---|
| Frontend | SAPUI5 | Selected baseline; implementation unverified | Enterprise UI shell and eight role-aware operational modules. |
| Backend | SAP Cloud Application Programming Model (CAP) | Selected baseline; implementation unverified | Application/domain services, validation, authorization, workflow and adapter coordination, and controlled operations. |
| Backend runtime | Node.js | Selected baseline; implementation unverified | Runtime for CAP services and any later approved backend worker/orchestration components. |
| AI services | SAP AI Core / Generative AI Hub | Planned; tenant, model, and connectivity require verification | Backend-mediated model/inference services for analysis and recommendation, not business authorization. |
| Workflow automation | SAP Build Process Automation | Selected where available; availability/connectivity require verification | Orchestrate human approval workflows; a CAP workflow fallback may be used if verified and policy-equivalent. |
| Database | SAP HANA Cloud | Selected as planned primary database; provisioning/connectivity unverified | Persist application records, workflow state/references, and audit records as defined in a future schema. |
| Deployment | SAP BTP Cloud Foundry | Selected baseline; environment/deployment unverified | Planned application runtime and service-binding environment. |
| Enterprise access | SAP Build Work Zone | Selected access-surface baseline; configuration/identity unverified | Planned enterprise access/launch surface for SAPUI5 application. |

## 3. Technology responsibilities and dependencies

### SAPUI5 — frontend

**What it is:** SAP’s user-interface framework for building enterprise web applications.

**Why selected:** The project specifies SAPUI5 as the frontend baseline and the broader application is designed for SAP enterprise workflows.

**VaxResilience responsibility:** Render Executive Dashboard, Supply Chain Digital Twin, AI Command Centre, Inventory & Manufacturing, Customers & Orders, Approvals & Decisions, Risk, Compliance & Audit, and Resilience & Impact Analytics. Present synthetic/estimated/verified/stale states and require deliberate human interaction for approval.

**Communication:** The browser client calls authenticated application services exposed by CAP. It must not connect directly to HANA, AI Core, workflow engines, or supplier/logistics/communication providers using privileged credentials.

**Dependencies / limitations:** SAPUI5 version, component/library choices, application routing, identity integration, deployment configuration, and accessibility verification are not decided here. Frontend visibility is not an authorization boundary.

### SAP CAP — application backend

**What it is:** SAP’s Cloud Application Programming Model for developing service-oriented applications.

**Why selected:** CAP is the documented SAP application-backend baseline, avoiding an unapproved replacement technology.

**VaxResilience responsibility:** Validate user input, enforce server-side role and record/action authorization, coordinate persistence and external adapters, invoke the orchestrator, route approval cases, verify action preconditions, and audit results.

**Communication:** Serves SAPUI5; connects through configured service abstractions to HANA, AI service adapter, workflow adapter, and external/synthetic adapters. It is the only authorized path to sensitive business actions.

**Dependencies / limitations:** CAP version, project structure, service definitions, APIs, domain model, identity strategy, transaction behavior, and service bindings require later technical design. No CAP service is claimed implemented.

### Node.js — backend runtime

**What it is:** JavaScript runtime used for CAP application services.

**Why selected:** Node.js is the documented runtime for the CAP backend.

**VaxResilience responsibility:** Host CAP services and, if later designed, orchestration/adapter workers under the same backend security and audit controls.

**Communication:** Executes the CAP application code and its approved libraries/connectors within the selected BTP runtime.

**Dependencies / limitations:** Runtime version, package set, worker topology, and operations configuration are pending implementation planning. Do not introduce an unrelated backend framework without authorization.

### SAP AI Core / Generative AI Hub — AI service layer

**What it is:** SAP AI services selected/planned for generative AI model access and related AI workload management.

**Why selected:** The project establishes this as its planned AI service layer, subject to verified availability and connectivity.

**VaxResilience responsibility:** Support bounded analysis, synthesis, and recommendation generation when properly configured. A central application orchestrator coordinates specialized agents; the model service is not the approval authority.

**Communication:** CAP-side adapter submits minimized authorized task context and receives a model response/status. Agent tools remain backend-controlled and separately authorized.

**Dependencies / limitations:** No tenant, model, deployment, endpoint, credentials, region, performance, data-retention behavior, or live connectivity is verified. Exact models/providers and agent-to-agent design are pending. Provide a clearly labelled simulation only where appropriate.

### SAP Build Process Automation — workflow

**What it is:** SAP workflow automation technology selected for human approval orchestration where available.

**Why selected:** Human approval gates are core product governance; this is the selected SAP workflow option.

**VaxResilience responsibility:** Route action-specific proposals to human review, capture decisions, and expose workflow status. It must enforce the same policy for all eight protected categories.

**Communication:** CAP invokes and queries the workflow through a backend adapter; workflow results return to CAP for policy validation, audit, and UI status.

**Dependencies / limitations:** Service availability, entitlement, connection, workflow definitions, identity mapping, and APIs are unverified. If unavailable, a CAP-based workflow is a proposed fallback only when implemented, tested, and demonstrably policy-equivalent. No fallback may bypass final Supply Chain Head approval.

### SAP HANA Cloud — planned primary persistence

**What it is:** SAP’s cloud database service selected as the planned primary database.

**Why selected:** HANA Cloud is the mandated data and audit baseline in the project documentation.

**VaxResilience responsibility:** Persist business and synthetic demonstration data, proposal/approval/execution state, evidence references, communication state, and audit records according to the future schema.

**Communication:** CAP accesses HANA through server-side service bindings and its data-access layer; browser clients and AI agents do not hold broad database credentials.

**Dependencies / limitations:** Tenant, service binding, data model, authorization, retention, encryption, backup, search, and immutable-audit implementation remain unverified or undecided. The database is not claimed connected.

### SAP BTP Cloud Foundry — deployment runtime

**What it is:** Cloud Foundry-based application runtime in SAP Business Technology Platform.

**Why selected:** BTP Cloud Foundry is the documented deployment baseline.

**VaxResilience responsibility:** Host the deployed application components and provide a platform context for configured service bindings and environment configuration.

**Communication:** Application components use configured runtime bindings/credentials to access only approved services; secrets are kept server-side and out of repository/frontend code.

**Dependencies / limitations:** BTP account, subaccount, org/space, region, quotas, build/deployment pipeline, network policy, and service entitlements are not verified.

### SAP Build Work Zone — enterprise access

**What it is:** SAP’s enterprise access and work-zone experience selected as the planned application entry surface.

**Why selected:** It is the documented enterprise-access technology for the project.

**VaxResilience responsibility:** Provide a planned launch/access surface for the SAPUI5 application and integration with the eventual enterprise identity approach.

**Communication:** User navigation/identity context is passed through a future verified configuration to the application; CAP remains responsible for authorization.

**Dependencies / limitations:** Work Zone subscription/configuration, application exposure, identity provider, role claims, and single sign-on are unverified. Work Zone is not by itself a finalized authentication/authorization design.

## 4. Supporting architecture patterns

These are architectural boundaries and recommendations, not additional selected products:

- **Central orchestrator with specialized agents:** confirmed coordination shape; agent identities and protocols are pending.
- **Backend-controlled adapters:** required pattern for AI, workflow, voice, email, supplier, ERP, logistics, and shipment services; no external provider is selected.
- **Simulated adapter:** permitted demonstration substitute where a live service is unavailable. It must be separately identified in code, records, UI, and documentation and must not claim live service.
- **CAP workflow fallback:** possible only if SAP Build Process Automation is unavailable and the fallback is implemented/tested to enforce identical roles, gates, and audit expectations.
- **Audit and observability:** required capabilities; specific SAP monitoring products, telemetry stack, retention, and audit immutability implementation are pending.

## 5. Confirmed choices versus unverified services

### Selected project baseline

SAPUI5, SAP CAP, Node.js, SAP HANA Cloud, SAP BTP Cloud Foundry, and SAP Build Work Zone are selected project technologies. SAP AI Core / Generative AI Hub and SAP Build Process Automation are selected/planned within their stated availability and verification conditions.

### Not verified or not finalized

No evidence in this repository establishes live access to SAP AI Core / Generative AI Hub, Build Process Automation, HANA Cloud, BTP Cloud Foundry, or Work Zone. No SAP IBP, SAP TM, SAP Ariba, supplier, carrier, ERP, map, voice, email, or other external system is claimed integrated. No model/provider configuration, external communication vendor, API endpoint, credentials, or live operational data source is selected.

## 6. Decisions carried forward

Later phases must decide or verify:

- SAP tenant/subscription, region, runtime/service bindings, and connectivity for selected services.
- Model and AI provider configuration and handling constraints.
- Specialized-agent number, names, tool permissions, and communication protocol.
- Workflow implementation and CAP fallback design.
- Voice/email providers and consent, delivery, and retention controls.
- External supplier, logistics, ERP, and shipment API choices.
- Database schema, API contracts, audit retention, and authorization mechanics.
- Production identity/authentication implementation.

See [Integration Architecture](INTEGRATION_ARCHITECTURE.md) for per-connection status, data, and failure handling.
