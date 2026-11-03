# VaxResilience — Official Implementation Roadmap

**Project:** VaxResilience — Agentic AI for Resilient Pharmaceutical Supply Chains<br>
**Demonstration organization:** BharatMed Pharmaceuticals, a fictional Hyderabad, India organization<br>
**Roadmap status:** Proposed implementation sequence; no implementation phase is represented as started or complete by this document.<br>
**Documentation baseline:** Six documentation phases are complete. This roadmap defines a separate ten-phase application implementation.

## 1. Purpose

This roadmap is the implementation guide for developers taking the current documentation-and-synthetic-data repository toward a working SAP-based application. It turns the existing requirements, architecture, governance, contracts, fixtures, and handover guidance into ten ordered implementation phases (`IMP-01`–`IMP-10`).

The six documentation phases and ten implementation phases are different numbering systems:

- **Documentation Phases 1–6** describe the repository’s completed specification and handover work.
- **Implementation Phases IMP-01–IMP-10** describe future executable software and operational capabilities.

Documentation completion is not application implementation. Use the existing documents as requirements and proposed designs, then verify every actual service, build, test, and integration before claiming it works.

## 2. Current repository status and baseline

The repository currently contains project documentation, prompt templates, diagrams, static synthetic JSON fixtures, JSON Schemas, and a safe `.env.example`. It does **not** contain a runnable SAPUI5 application, CAP application, CAP CDS model, deployed HANA schema, live AI agents, executable application test suite, or verified external integration.

The documented baseline includes:

| Area | Repository baseline |
|---|---|
| Documentation | Six completed documentation phases covering foundation, product/UX, architecture, agents/governance, data/integration contracts, and demo/testing/deployment handover. |
| Product | Eight application modules and seven business roles. |
| Requirements | 34 functional-requirement rows and 11 non-functional-requirement rows in `docs/03_FUNCTIONAL_REQUIREMENTS.md`. The task brief says nine non-functional requirements; that count conflicts with the current source document and must be reconciled by the product owner rather than silently changed. |
| Workflows and journeys | Fifteen proposed workflows and eleven documented user journeys. |
| Agent design | One central-orchestrator pattern and five proposed specialist roles; the exact roster is not finally approved. |
| Governance | Eight protected action categories require Supply Chain Head final approval. |
| Contracts and data | Proposed CAP/API and HANA designs, 26 Draft 2020-12 JSON Schemas, seven synthetic fixture data files plus `manifest.json`, and an environment example with providers disabled and secrets/endpoints blank. |
| Integrations | SAPUI5, CAP, Node.js, HANA Cloud, AI Core / Generative AI Hub, Build Process Automation, BTP Cloud Foundry, and Work Zone are selected/planned technologies, not verified live services. |

`CONTRIBUTING.md` still presents the older documentation-phase roadmap and describes an obsolete `src/` layout. It is intentionally not changed by this task; update it in a separate documentation-maintenance change so it points to this implementation roadmap and does not imply the old phase status is current.

### Synthetic scenario baseline

Use only fictional records for the hackathon demonstration:

- Product: Paracetamol 500 mg tablets; API: Paracetamol API powder.
- Main source and all organizations/customers are fictional. Main route: Suzhou/Shanghai region → Shanghai Port → Nhava Sheva Port → Hyderabad.
- Main shipment: 30 calendar days between the synthetic original and revised ETA.
- Opening API inventory: 1,000 kg; synthetic consumption: 50 kg per production day; documented coverage input: 20 production days.
- The documented “10-day potential gap” subtracts calendar days from production days without a defined conversion. It is **not** a calendar-aware forecast. Resolve D-01 before treating it as one.
- Backup supplier report: 500 kg, described as 10 synthetic production days. Do not count it as usable coverage without six distinct checks: quality, regulatory, quantity, capacity, supplier confirmation, and delivery feasibility.
- Five fictional customers; the static fixture history contains one synthetic 100,000-tablet order per customer and pre-authored later-stage verification/approval/simulated delivery/closure records.
- `manifest.json` identifies the dataset as synthetic and describes a proposed, unapplied allocation policy. Never seed the completed history as though it were the initial baseline.

The application must provide an isolated, resettable scenario that can start at a chosen state: normal baseline, disruption, analysis, recovery proposal, approval, simulated execution, or recovery/closure. Preserve fixture provenance and label all estimates and simulations. The 250,000-tablet exposure figure is a synthetic estimate, not a patient count or actual outcome.

## 3. Target architecture and confirmed technology baseline

The documented target flow is:

```text
SAP Build Work Zone (planned access)
        ↓
SAPUI5 frontend
        ↓ authenticated, untrusted client requests
SAP CAP on Node.js — domain rules, authorization, approvals, audit
        ├── SAP HANA Cloud (planned persistence)
        ├── Central orchestrator → bounded specialist tasks/tools
        ├── SAP AI Core / Generative AI Hub adapter (planned)
        ├── SAP Build Process Automation adapter (if verified)
        └── isolated, backend-controlled external/synthetic adapters
```

| Layer | Selected baseline | Implementation boundary |
|---|---|---|
| Frontend | SAPUI5 | Presentation and authenticated CAP requests; never a security boundary or credential store. |
| Backend | SAP CAP | Authoritative API, domain logic, authorization, workflow coordination, adapter access, and audit boundary. |
| Runtime | Node.js | CAP runtime; exact version must be chosen from verified tooling/environment compatibility. |
| AI | SAP AI Core / Generative AI Hub | Planned backend-mediated model service; model, account, endpoint, data handling, and connectivity need verification. |
| Workflow | SAP Build Process Automation | Use only if available and verified; any CAP fallback must be explicitly configured, tested, and policy-equivalent. |
| Database | SAP HANA Cloud | Planned primary persistence; schema, tenancy, service binding, migration, backup, and connectivity need verification. |
| Deployment | SAP BTP Cloud Foundry | Planned runtime; account, subaccount, region, org/space, entitlements, and release process need verification. |
| Enterprise access | SAP Build Work Zone | Planned application entry surface; not a substitute for CAP identity and authorization. |

Do not replace SAP technologies with unrelated frameworks without explicit project-owner approval. Use separately identified synthetic/simulated adapters when a service is unavailable. Do not claim SAP IBP, SAP TM, SAP Ariba, HANA, AI Core, Build Process Automation, Work Zone, suppliers, logistics, voice, or email are connected until connectivity and expected behavior have been tested and documented.

## 4. Scope and non-negotiable rules

### Eight application modules

1. Executive Dashboard.
2. Supply Chain Digital Twin.
3. AI Command Centre.
4. Inventory & Manufacturing.
5. Customers & Orders.
6. Approvals & Decisions.
7. Risk, Compliance & Audit.
8. Resilience & Impact Analytics.

### Seven business roles

1. Supply Chain Head.
2. Procurement Manager.
3. Factory Manager.
4. Warehouse Manager.
5. Logistics Manager.
6. Customer / Export Manager.
7. Compliance / Auditor.

Record/field scopes, identity provider, session rules, and any additional operational reviewers remain pending decisions; do not invent permissions.

### Human approval and authority

Supply Chain Head final approval is required for each of these eight categories:

1. Alternative-supplier purchasing.
2. Inter-warehouse inventory transfers.
3. Factory production schedule changes.
4. Customer-order prioritisation or reallocation.
5. Shipment route or carrier changes.
6. Major disruption notifications to customers.
7. Payments and financial commitments.
8. Adding or changing approved suppliers.

AI analyzes, coordinates, recommends, and prepares. It cannot approve its own proposal or independently execute a protected action. Enforce approvals server-side. Bind every decision to the exact proposal version; changed proposals require fresh approval. Approval is not execution, and execution is not verification. Fail closed if authorization, evidence, approval state/version, or required audit cannot be verified.

Three authority levels:

- **Level 1 — Read & Analyse:** authorized retrieval, inspection, deterministic calculations, and evidence analysis.
- **Level 2 — Recommend & Prepare:** proposals, options, drafts, and recovery plans for human review.
- **Level 3 — Execute with Permission:** only a specific CAP-controlled operation after explicit human approval and server-side revalidation; no autonomous agent authority.

Customer allocation remains unresolved. “Healthcare-first balanced” is provisional, not approved or applied. Voice and email are in scope but provider/consent decisions are pending; WhatsApp is not in confirmed scope. Suspicious activity is neutrally flagged for verification; the AI must never accuse a person or organization of fraud.

## 5. Ten-phase overview

| ID | Phase | Primary outcome | Main dependency |
|---|---|---|---|
| **IMP-01** | Implementation Readiness, SAP Environment & Project Bootstrap | Reproducible, safe local SAP CAP project foundation and verified development setup. | Existing documentation and verified development environment. |
| **IMP-02** | Database, CAP Data Model & Synthetic Data Foundation | Validated CAP/HANA data layer, guarded synthetic seeding, and resettable scenario states. | IMP-01. |
| **IMP-03** | Backend Development, Business Logic & API Layer | Validated CAP services, domain rules, and server-side authorization foundation. | IMP-01 and reviewed data/API contracts from IMP-02. |
| **IMP-04** | SAPUI5 Frontend Foundation & Application Shell | Accessible UI5 shell, routes, shared states, and authenticated CAP communication. | IMP-01 and agreed API/UI contracts; mock data is allowed while backend develops. |
| **IMP-05** | Core Supply Chain Modules & Digital Twin | Four operational modules backed by CAP and synthetic data. | IMP-02, IMP-03, and IMP-04. |
| **IMP-06** | Agentic AI, Orchestrator & Specialist Agents | Bounded evidence-linked analysis and recovery recommendations, without protected execution. | IMP-03, approved agent design, and relevant data services. |
| **IMP-07** | Workflow Automation, Human Approvals, Security & Audit | Server-enforced protected-action gates, human workflows, emergency controls, and audit. | IMP-03 authorization foundation; workflow/governance decisions for protected execution. |
| **IMP-08** | External Integrations, Communication & Adapters | Verified backend adapters, or isolated labelled simulations with safe failure behavior. | IMP-03, IMP-07, and verified external-provider decisions. |
| **IMP-09** | Resilience Analytics, Impact Prediction & Decision Intelligence | Traceable deterministic metrics and scenario comparisons under approved policies. | IMP-02, IMP-03, IMP-05, and approved calculation policies. |
| **IMP-10** | End-to-End Testing, Deployment, Final Demo & Handover | Verified isolated release/demo, test evidence, deployment handover, and accurate status. | All phases; tests run continuously throughout. |

Phase completion is evidence-based. If a service or decision is unavailable, complete only the safe scope, identify the block, and keep dependent capabilities disabled.

## 6. Detailed implementation plan

### IMP-01 — Implementation Readiness, SAP Environment & Project Bootstrap

**Objective:** Convert the documentation-only repository into a reproducible SAP development project without claiming unverified service access.

**Why necessary:** There is no application manifest, CAP source, UI5 source, HANA model, or runtime in the baseline. Contributors need a shared supported toolchain, project layout, safe defaults, and repeatable local startup before building features.

**Read first:** [`AGENTS.md`](AGENTS.md), [`README.md`](README.md), [`CONTRIBUTING.md`](CONTRIBUTING.md), [`PROJECT_STATUS.md`](docs/PROJECT_STATUS.md), [`DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md), [`TECH_STACK.md`](docs/TECH_STACK.md), [`INTEGRATION_ARCHITECTURE.md`](docs/INTEGRATION_ARCHITECTURE.md), and [`11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md).

**Technologies:** Git; Node.js/npm; SAP CAP CLI; SAP Cloud Foundry CLI; SAPUI5 tooling; approved SAP Business Application Studio or local SAP environment. HANA/AI/workflow/Work Zone are not prerequisites for a local synthetic skeleton unless explicitly verified as required.

**Implementation sequence:**

1. Inspect the current branch, worktree, remote, repository tree, and applicable documents. Record the actual starting state; do not assume prior implementation.
2. Agree a team setup and verify supported Node.js/npm, CAP CLI, CF CLI, and SAP tooling versions against the actual target SAP environment. Record versions and platform-owner evidence.
3. Verify BTP account/subaccount, region, Cloud Foundry org/space, quotas, entitlements, and service availability with the authorized platform owner. Record each service as verified, unavailable, or pending.
4. Select the compatible runtime/tool versions and local-development approach. Do not invent versions or embed tenant-specific values in source.
5. Bootstrap a conventional SAP CAP structure at repository root (`app/`, `srv/`, `db/` where appropriate), a SAPUI5 application foundation, and test/script directories. Preserve existing `docs/`, `data/`, and `prompts/`.
6. Add the package manifest and lockfile using approved dependencies; add safe `.gitignore`, lint/format/check scripts, and basic static validation. Do not install providers or unrelated frameworks.
7. Establish the local profile as synthetic-only with provider flags off. Preserve `.env.example` as placeholders and add no real credentials.
8. Add health/readiness endpoints that distinguish application liveness from dependency readiness and report unavailable services truthfully.
9. Document clone/setup/start/test steps, branch/PR workflow, and the actual project status. Update status documentation only when that is separately in scope.
10. Demonstrate that a new developer can clone, install from the lockfile, and start the skeleton with no personal undocumented setup.

**Expected files/deliverables:** Runnable CAP/UI5 skeleton; dependency manifest and committed lockfile; `.gitignore`; safe local/environment configuration; health/readiness check; lint/format/validation/test scripts; developer setup instructions; verified service inventory.

**Dependencies and parallel work:** Existing docs and verified dev environment. Platform owners can independently inventory entitlements while the bootstrap owner defines the local skeleton; do not bind code to unverified services.

**Testing/validation:** Fresh-clone setup; deterministic startup/health check; lockfile-based dependency install; lint/format and static checks; ensure disabled provider flags prevent calls; verify no secrets in tracked files or browser artifacts.

**Security/governance:** No service secrets in Git or frontend. Keep providers and protected execution disabled. Work Zone launch or UI role display is not authorization. Follow feature branches and reviewable PRs.

**Exit criteria:** A new developer can clone the repository, configure the approved local environment, install reproducibly, and start the local synthetic-only CAP/UI5 skeleton. Toolchain and service availability evidence is documented.

**Do not start before ready:** Do not create application services dependent on an unselected runtime/tool version, claim a verified BTP/HANA/AI connection without evidence, seed any real tenant, or enable any protected operation.

**Expected result:** A clean, reproducible SAP-aligned development foundation with explicit boundaries between local simulation and verified services.

### IMP-02 — Database, CAP Data Model & Synthetic Data Foundation

**Objective:** Turn the proposed logical data model and static fixtures into a validated CAP data layer with safe persistence and repeatable demo state.

**Why necessary:** Backend and UI work require consistent entities, identifiers, relationships, time/unit semantics, fixture provenance, and a trustworthy reset mechanism.

**Read first:** [`08_DATA_MODEL_AND_DEMO_DATA.md`](docs/08_DATA_MODEL_AND_DEMO_DATA.md), [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md), [`data/schemas/`](data/schemas/), [`data/synthetic/`](data/synthetic/), [`07_SECURITY_AND_AUDIT.md`](docs/07_SECURITY_AND_AUDIT.md), [`11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md), and [`API_CONTRACTS.md`](docs/API_CONTRACTS.md).

**Technologies:** SAP CAP CDS; Node.js; SAP HANA Cloud only after D-07/D-13/environment checks; JSON Schema validation; deterministic synthetic fixture validation and seeding.

**Implementation sequence:**

1. Map logical entities and relationships to reviewed CAP CDS definitions. Resolve naming, status enums, unit/time conventions, ownership, tenant boundaries, and migration approach before freezing schema.
2. Define master entities: organizations, users/roles where approved, suppliers, products/materials, facilities/warehouses, ports/routes, customers, and agents.
3. Define operations: inventory snapshots/batches, purchase orders, shipments/events, production plans/batches/consumption, customer orders/lines/fulfilments/deliveries.
4. Define disruption, evidence, risk/impact, recovery plan/action, supplier qualification, workflow/approval, agent execution/tool invocation, communications, suspicious-activity, and audit entities.
5. Add associations/compositions, uniqueness and referential-integrity rules, controlled enums, row versions, provenance, source status, data mode, and append-only history where required.
6. Validate all 26 Draft 2020-12 schemas and map each synthetic record to its schema. Add cross-file FK, quantity/unit, date/state-transition, data-mode, and uniqueness checks.
7. Implement versioned migrations. Apply first to a disposable local/test schema; configure HANA persistence only after service availability, tenancy/isolation, binding, identity, and D-13 are reviewed.
8. Build an idempotent demo seed path with explicit environment guard, `DATA_MODE=synthetic`, scenario ID, fixture version/checksum, confirmation, and record counts. Refuse non-demo or production targets.
9. Create distinct resettable scenario states: baseline; disruption triggered; analysis complete; proposal prepared; approval complete; simulated execution; recovery/closure. Never silently load later history as the initial baseline.
10. Test seed/reset/rollback and verify fixture provenance survives reads and derived records. Preserve the original static fixture files and their provenance.

**Scenario rules:** Initial state has no fictional post-disruption approval or simulated receipt. Later states may replay fixture events but every replay is explicitly synthetic/simulated. Backup stock remains ineligible until all six checks are independently accepted under approved qualification rules.

**Expected files/deliverables:** CAP CDS model; migration/version strategy; repository fixture validator; guarded idempotent seed/reset scripts; data-layer services; synthetic dataset-state definitions; DB and integrity tests; documented seed evidence.

**Dependencies and parallel work:** IMP-01. API design can review entities concurrently, but frontend/backend must not independently invent entity names, enums, or relationships. D-13 blocks production persistence/tenant claims; D-01 blocks a calendar-aware gap forecast.

**Testing/validation:** Schema-definition and instance validation; cross-file references and invariants; migration/rollback; seed idempotency; reset to every scenario state; production/non-demo seed refusal; tenant/organization isolation tests before any multi-tenant claim.

**Security/governance:** Use synthetic data only. Least-privilege CAP/HANA binding, no direct browser/agent DB access, immutable audit design, and no secret-bearing fixture. Apply a fail-safe seed guard.

**Exit criteria:** The synthetic BharatMed dataset can be loaded, queried, reset to any defined scenario state, and validated through the data layer; all schema and integrity tests pass. Production persistence claims require verified HANA, migration, and isolation evidence.

**Do not start before ready:** Do not implement downstream services against unstable entities/enums; do not seed completed history as baseline; do not treat D-01’s 10-day comparison as normalized; do not enable production HANA writes before D-13.

**Expected result:** An auditable, resettable and schema-validated synthetic data foundation with clear HANA verification status.

### IMP-03 — Backend Development, Business Logic & API Layer

**Objective:** Implement CAP services and deterministic business logic as the authoritative application and policy boundary.

**Why necessary:** UI and agents need stable services, consistent errors, server-owned state, deterministic calculations, and authorization independent of the client/model.

**Read first:** [`04_SYSTEM_ARCHITECTURE.md`](docs/04_SYSTEM_ARCHITECTURE.md), [`API_CONTRACTS.md`](docs/API_CONTRACTS.md), [`AGENT_TOOL_SPECIFICATIONS.md`](docs/AGENT_TOOL_SPECIFICATIONS.md), [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md), [`03_FUNCTIONAL_REQUIREMENTS.md`](docs/03_FUNCTIONAL_REQUIREMENTS.md), [`USER_ROLES_AND_ACCESS.md`](docs/USER_ROLES_AND_ACCESS.md), [`07_SECURITY_AND_AUDIT.md`](docs/07_SECURITY_AND_AUDIT.md), and relevant [`08_DATA_MODEL_AND_DEMO_DATA.md`](docs/08_DATA_MODEL_AND_DEMO_DATA.md) definitions.

**Technologies:** SAP CAP and Node.js; CAP CDS from IMP-02; SAP HANA Cloud only when verified; schema validation; contract and API testing.

**Implementation sequence:**

1. Review and freeze versioned request/response, error, pagination, status, idempotency, and concurrency contracts. Choose CAP-compatible REST/OData exposure through project-owner approval; document any contract deviation.
2. Implement CAP service definitions and domain handlers for dashboard; suppliers/qualification; products/materials/inventory; shipments/events; production/capacity; customers/orders; incidents; risk/impact; recovery plans/actions; approvals; agent tasks/tools; communications; audit.
3. Add consistent response/error envelopes, correlation IDs, schema and business validation, pagination/filtering, safe not-found behavior, concurrency/version checks, and idempotency for create/side-effect flows.
4. Implement deterministic coverage and gap calculation with explicit units/provenance; do not convert the calendar/production-day mismatch into a forecast until D-01 is decided.
5. Implement backup-supplier checklist evaluation as six independent dimensions. Missing, stale, failed, or conflicting evidence keeps supplier eligibility unconfirmed; never infer qualification from a model summary.
6. Implement customer-demand aggregation from synthetic records with reproducible assumptions and explicit estimate labels. Do not apply a customer allocation policy.
7. Implement authenticated-principal context and server-side authorization foundation. Derive role/actor from verified identity, never request-body claims. Deny unknown role/scope.
8. Ensure protected writes create proposals/versions only. Build authorization hooks for every protected category; do not implement a bypass or let the LLM own business state.
9. Add audit/correlation integration points for material reads, decisions, proposals, denials, and results; fail closed if a protected action cannot be audited.
10. Publish API documentation and trace endpoints to requirements, schemas, tests, and implementation evidence.

**Expected files/deliverables:** CAP services and handlers; deterministic domain services; validated API endpoints; identity/authorization foundation; API/contract docs; unit, integration, and negative-authorization tests.

**Dependencies and parallel work:** IMP-01 and reviewed data/API contracts from IMP-02. UI may develop against agreed mocks/contracts under IMP-04. Agents may review tool contracts, but must not build against unstable endpoints or direct DB interfaces.

**Testing/validation:** Contract/schema tests; unit tests for arithmetic, units and eligibility; API input/range/FK validation; role/scope denial; stale version and ETag handling; idempotency replay/body mismatch; pagination bounds; audit write failure; failure envelopes; protected endpoint bypass attempts.

**Security/governance:** CAP—not SAPUI5, workflow display state, or model output—owns authorization and business state. Validate every read/write/tool invocation. No secrets in clients. No protected action mutates operational state without the later IMP-07 execution gate.

**Exit criteria:** APIs can retrieve and manipulate only permitted synthetic business data using validated contracts; deterministic rules are covered; proposals remain proposals; no unauthorized protected action is possible through any endpoint.

**Do not start before ready:** Do not integrate UI/agents to unreviewed API enums; do not implement actual protected dispatch before IMP-07; do not claim verified identity or persistence before service evidence.

**Expected result:** A testable CAP domain/API layer that is safe to consume from UI and bounded agent tools.

### IMP-04 — SAPUI5 Frontend Foundation & Application Shell

**Objective:** Establish the SAPUI5 app structure, common navigation, status language, accessibility, and safe CAP communication.

**Why necessary:** All modules need consistent role-aware presentation and clear provenance/error states; frontend behavior must never substitute for backend authorization.

**Read first:** [`DASHBOARD_AND_UI_SPECIFICATION.md`](docs/DASHBOARD_AND_UI_SPECIFICATION.md), [`USER_ROLES_AND_ACCESS.md`](docs/USER_ROLES_AND_ACCESS.md), [`USER_JOURNEYS.md`](docs/USER_JOURNEYS.md), [`API_CONTRACTS.md`](docs/API_CONTRACTS.md), [`TECH_STACK.md`](docs/TECH_STACK.md), and [`04_SYSTEM_ARCHITECTURE.md`](docs/04_SYSTEM_ARCHITECTURE.md).

**Technologies:** SAPUI5; approved UI5 tooling and component/library versions; authenticated CAP API client; accessibility validation.

**Implementation sequence:**

1. Initialize the SAPUI5 application and component structure using the supported tooling selected in IMP-01.
2. Implement routing, global shell, sidebar navigation for all eight modules, top navigation, application identity, profile/role context, notification and global-search foundations.
3. Create reusable page layouts, cards, tables, dialogs, forms, status labels, source/freshness markers, approval state, and confirmation patterns.
4. Configure frontend models and a typed/validated CAP API communication layer using the agreed contracts. Use contract-compatible mock data only while backend work proceeds.
5. Implement role-aware navigation/presentation from verified user context; do not treat hidden/disabled controls as permission enforcement.
6. Add loading, empty, failed, stale, unavailable, partial, no-permission, synthetic, simulated, estimated, and verified states. Never imply success while a request is pending or failed.
7. Implement session/profile context and integrate the approved identity mechanism only when verified; no credential storage in browser code.
8. Add responsive layouts, keyboard operation, readable tables, semantic labels, sufficient contrast, and status communication not based on color alone.
9. Replace mock endpoints with CAP API responses when contracts are available; retain mocks only as isolated test fixtures.

**Expected files/deliverables:** SAPUI5 app; component/routing structure; shared controls; navigation shell; CAP API client; role-aware presentation; responsive/accessibility baseline and UI tests.

**Dependencies and parallel work:** IMP-01 and agreed UI/API contracts. Can run in parallel with IMP-02/03 using mocks, with a named contract owner maintaining schemas and enums. Integration to real CAP responses follows contract readiness.

**Testing/validation:** Route and module tests; contract/mock parity; session expiration and permission display; loading/error/stale/simulation states; keyboard-only navigation; screen-reader labels; responsive viewport checks; ensure no frontend secrets or direct provider/database calls.

**Security/governance:** UI role state is informative only; CAP reauthorizes every operation. Do not expose service credentials, model endpoints, HANA bindings, or external provider calls. No UI action may directly execute protected work.

**Exit criteria:** An authorized user can launch and navigate the SAPUI5 application and make authenticated requests to CAP; all eight modules have a route/shell entry; UX states and accessibility checks pass.

**Do not start before ready:** Do not build individual operational modules against unapproved data/status contracts; do not add unverified map libraries/providers or client-side security logic.

**Expected result:** A secure-by-boundary, accessible UI foundation ready for the four core operational modules.

### IMP-05 — Core Supply Chain Modules & Digital Twin

**Objective:** Build the core operational control tower and Digital Twin before advanced AI, backed by CAP and resettable synthetic data.

**Why necessary:** Users and reviewers need transparent supply-chain records, baseline state, and disruption context without relying on generative AI.

**Read first:** [`03_FUNCTIONAL_REQUIREMENTS.md`](docs/03_FUNCTIONAL_REQUIREMENTS.md), [`DASHBOARD_AND_UI_SPECIFICATION.md`](docs/DASHBOARD_AND_UI_SPECIFICATION.md), [`USER_JOURNEYS.md`](docs/USER_JOURNEYS.md), [`02_DEMO_SCENARIO.md`](docs/02_DEMO_SCENARIO.md), [`08_DATA_MODEL_AND_DEMO_DATA.md`](docs/08_DATA_MODEL_AND_DEMO_DATA.md), [`diagrams/supply-chain-flow.md`](docs/diagrams/supply-chain-flow.md), and [`API_CONTRACTS.md`](docs/API_CONTRACTS.md).

**Technologies:** SAPUI5; SAP CAP services; HANA if verified or the synthetic data adapter; approved chart/map-independent network visualisation.

**Implementation sequence:**

1. Connect the Executive Dashboard to incident, inventory, shipment, production, order exposure, risk, recovery, and pending-approval APIs. Avoid hardcoded permanent values.
2. Build the Supply Chain Digital Twin with supplier, port, facility, warehouse, customer, route, shipment, and relationship views. Use synthetic network layout when no verified geographic coordinates/map source exists.
3. Build Inventory & Manufacturing: stock/snapshots, coverage inputs, batch/expiry if available, production plans/capacity, discrepancy reporting, and independent supplier-check status.
4. Build Customers & Orders: five fictional profiles, synthetic orders, demand assumptions, fulfilment/delivery states, estimated exposure, and proposal links.
5. Connect every page to CAP APIs; use the documented static dataset only through the isolated demo mode and show source/mode/timestamps.
6. Implement filters, pagination, detail panels, cross-module navigation, loading/empty/error/stale states, and source consistency.
7. Add scenario controls only for safe, deterministic demo transitions; show explicit simulation labels and reset capability.
8. Add proposal entry points for relevant transfer, schedule, order allocation, or route actions, but leave execution to IMP-07.
9. Validate all displayed figures and source links against the scenario manifest/fixture version.

**Expected files/deliverables:** Four operational modules connected to CAP; module-level details, filters, route/node visualization, scenario/reset controls, and UI/API/e2e tests.

**Dependencies and parallel work:** IMP-02, IMP-03, and IMP-04. The UI team can implement page shells in parallel; cross-module entity and status definitions remain owned by the backend/API contract maintainers.

**Testing/validation:** Each view resolves correct fixture records; no hardcoded business values; filtering/pagination remain authorized; missing coordinates are not invented; stale/unverified backup stock is not shown as usable; proposal controls do not mutate operational records; scenario can reset to initial baseline.

**Security/governance:** Keep fictional data clearly labelled. No live map or external records without verified adapter. Protected actions navigate to human workflow and cannot execute from dashboard, map, or detail page.

**Exit criteria:** A developer can navigate the four operational modules, inspect synthetic supply-chain records, understand the disruption and trace each metric to CAP data without AI.

**Do not start before ready:** Do not make AI output necessary for normal dashboard operation; do not display a completed historical fixture as the initial state; do not promote candidate suppliers or apply the proposed allocation policy.

**Expected result:** A deterministic, source-linked core application that makes the disruption understandable without advanced AI.

### IMP-06 — Agentic AI, Orchestrator & Specialist Agents

**Objective:** Implement bounded analysis and evidence-linked recommendations through a CAP-controlled orchestrator and specialist roles.

**Why necessary:** The proposed AI layer should coordinate functional evidence domains while CAP retains deterministic business rules, authorization, persistence, approval, and execution.

**Read first:** [`05_AGENT_DESIGN.md`](docs/05_AGENT_DESIGN.md), [`AGENT_TOOL_SPECIFICATIONS.md`](docs/AGENT_TOOL_SPECIFICATIONS.md), [`04_SYSTEM_ARCHITECTURE.md`](docs/04_SYSTEM_ARCHITECTURE.md), [`06_WORKFLOWS_AND_APPROVALS.md`](docs/06_WORKFLOWS_AND_APPROVALS.md), [`07_SECURITY_AND_AUDIT.md`](docs/07_SECURITY_AND_AUDIT.md), all files in [`prompts/orchestrator/`](prompts/orchestrator/), [`prompts/specialist-agents/`](prompts/specialist-agents/), [`data/schemas/agent-task-request.schema.json`](data/schemas/agent-task-request.schema.json), [`data/schemas/agent-execution.schema.json`](data/schemas/agent-execution.schema.json), and [`11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md).

**Technologies:** SAP AI Core / Generative AI Hub only after service/model verification; CAP/Node.js adapter; structured task/result contracts; synthetic evaluations.

**Proposed five specialist roles (D-02 remains pending):**

1. Disruption & Risk Analyst.
2. Supplier & Compliance Analyst.
3. Inventory & Manufacturing Planner.
4. Logistics & Shipment Analyst.
5. Customer Impact & Communications Planner.

**Implementation sequence:**

1. Resolve D-02 roster and D-03 provider/model/data-handling choices and D-04 orchestration protocol/state/concurrency before final runtime configuration.
2. Implement a CAP-controlled model adapter with server-side credentials, bounded context, provider status/error handling, explicit simulation mode, and response validation.
3. Implement central orchestration task lifecycle, unique task/correlation IDs, deadlines, cancellation, allowed data references, role/tool allowlists, and durable CAP-owned state.
4. Implement bounded delegation to approved roles only. Parallelize independent analyses; serialize dependent work until required evidence is verified.
5. Implement each specialist prompt using existing templates, version them, and constrain output to task/result schemas. Prompts are not permission grants.
6. Route each tool through CAP. Apply user/task/resource scope and independent authorization to every call; never give agents HANA, provider, or unrestricted credentials.
7. Validate output schema, source references, assumptions, freshness, uncertainties, and unsupported claims. Preserve disagreement and partial/failed states.
8. Use deterministic CAP services for arithmetic, eligibility, authorization, state transitions, and side effects; agents may explain calculations but do not become the calculation authority.
9. Build AI Command Centre activity/task/recommendation/error/escalation views. Do not expose private chain-of-thought.
10. Add evaluation cases for prompt injection, hallucinated ETAs/prices/certifications, malformed output, timeout, conflict, and unavailable model.

**Authority restriction:** Start with Level 1 and Level 2 only. Do not enable Level 3 protected execution in this phase; no specialist may approve its own proposal, send external communication, or execute a protected operation.

**Expected files/deliverables:** AI adapter; central orchestrator; approved specialist implementations; structured tool interfaces; Command Centre; prompt/model version controls; agent tests/evaluations and failure dashboards.

**Dependencies and parallel work:** IMP-03, approved agent design, and relevant data services. Prompt evaluation and UI activity prototypes can proceed with stubbed CAP task results; final integration waits for schemas/protocol.

**Testing/validation:** Schema/output tests; role/scope/tool allowlist tests; deterministic calculations cross-check; prompt-injection/unsupported-claim evaluation; partial disagreement; cancellation/timeout; model outage; malformed result; no unauthorized side effects; audit task lineage.

**Security/governance:** Minimize prompts; treat records/documents as untrusted; no secret exposure or cross-tenant context; no self-permission or approval; tool calls never bypass CAP; fail closed for dependent protected actions.

**Exit criteria:** A synthetic disruption request produces bounded specialist analyses with evidence references, uncertainty, source state, errors/conflicts, and a non-executable recovery recommendation; no protected action is performed.

**Do not start before ready:** Do not configure production AI/model use before D-03; do not freeze agent count/protocol before D-02/D-04; do not grant protected execution or autonomous communications.

**Expected result:** An observable, testable analysis layer that augments decisions without owning them.

### IMP-07 — Workflow Automation, Human Approvals, Security & Audit

**Objective:** Implement the governance and authorization layer for protected decisions and any consequential operation.

**Why necessary:** Human approval must be enforced at the server boundary, version-bound, auditable, and distinct from execution/verification. UI controls or agent instructions alone cannot enforce policy.

**Read first:** [`06_WORKFLOWS_AND_APPROVALS.md`](docs/06_WORKFLOWS_AND_APPROVALS.md), [`07_SECURITY_AND_AUDIT.md`](docs/07_SECURITY_AND_AUDIT.md), [`USER_ROLES_AND_ACCESS.md`](docs/USER_ROLES_AND_ACCESS.md), [`AGENT_TOOL_SPECIFICATIONS.md`](docs/AGENT_TOOL_SPECIFICATIONS.md), [`API_CONTRACTS.md`](docs/API_CONTRACTS.md), [`diagrams/agent-workflow.md`](docs/diagrams/agent-workflow.md), and decisions D-08, D-09, D-10, D-11, D-15, and D-19.

**Technologies:** SAP CAP; SAP Build Process Automation if verified; SAP HANA Cloud if verified; approved identity/authorization service; audit subsystem.

**Implementation sequence:**

1. Resolve identity, record/action permissions, approver identity, decision lifecycle, expiration/delegation/escalation, emergency authority, audit retention/integrity, and transaction-hold policy before enabling affected functions.
2. Implement proposal creation/versioning, immutable decision reference, submit/review, approve, reject, request changes, escalate, revoke/cancel, and expiry states exactly as approved policy defines.
3. Bind each decision to category, actor, proposal version/hash, evidence, limits, and authorized Supply Chain Head decision; reject stale or mutated proposals.
4. Implement the approval queue and reviewer-facing evidence/assumption/risk display. Operational reviews supplement, not replace, Supply Chain Head final approval for all eight categories.
5. Use Build Process Automation only after entitlement, workflow, identity mapping, callback and failure behavior are verified. Implement CAP fallback only if explicitly approved and tested to enforce identical policy.
6. Implement CAP pre-execution reauthorization and business precondition checks; approval request is not execution permission on its own.
7. Add idempotency, concurrency/version checks, duplicate/replay protection, dispatch state, `outcome_unknown` reconciliation, and no blind side-effect retry.
8. Implement audit event capture/search for proposals, decisions, denials, agent/tool activity, control events, dispatch, failure, verification, and closure.
9. Implement human-only agent pause/stop, global kill switch, manual override, and resume only after D-15 authority/checklist is resolved. Truthfully represent confirmed/failed/unknown state and in-flight work.
10. Implement suspicious-activity flags with neutral language; only a separately authorized workflow can place a hold.
11. Test every protected category via UI, direct API, agent/tool route, forged client role, stale approval, replay, and audit failure.

**Expected files/deliverables:** Working approval lifecycle and queue; backend authorization; emergency controls; audit subsystem/search; integration adapter or clearly labelled policy-equivalent fallback; security/workflow tests.

**Dependencies and parallel work:** IMP-03 authorization foundation and approved workflow/security design. Audit schema and UI can be built in parallel after event contracts are stable. Protected execution remains disabled until owners approve and tests pass.

**Testing/validation:** Positive and negative tests for all eight categories; Supply Chain Head final authority; changed proposal requires new approval; rejection/modification/expiry/revocation blocks execution; direct API/agent bypass denied; duplicate callback/replay safe; audit write failure fails closed; kill-switch fail/unknown not shown as success; transaction hold requires approved authority.

**Security/governance:** Least privilege, verified human identity, no agent approval, version-bound decisions, append-only audit controls per approved policy, minimal/redacted logs, fail closed on unknown authorization or audit state.

**Exit criteria:** All eight protected categories are blocked without a valid current Supply Chain Head approval. Every decision, execution request, adapter result, and verification state is traceable. Emergency controls are enabled only with verified authority and safe recovery evidence.

**Do not start before ready:** Do not enable protected dispatch, emergency resume, substitute approvers, expiry timers, holds, or weakened CAP fallback based on guessed policy.

**Expected result:** An independently enforced human governance layer that safely gates all consequential operations.

### IMP-08 — External Integrations, Communication & Adapters

**Objective:** Connect only verified external services through backend-controlled adapters; otherwise keep isolated labelled simulations.

**Why necessary:** Supplier, logistics, SAP, voice, and email capabilities create sensitive data flows and external side effects. They require explicit provider verification, provenance, authorization, and reconciliation.

**Read first:** [`09_INTEGRATIONS.md`](docs/09_INTEGRATIONS.md), [`INTEGRATION_ARCHITECTURE.md`](docs/INTEGRATION_ARCHITECTURE.md), [`API_CONTRACTS.md`](docs/API_CONTRACTS.md), [`AGENT_TOOL_SPECIFICATIONS.md`](docs/AGENT_TOOL_SPECIFICATIONS.md), [`07_SECURITY_AND_AUDIT.md`](docs/07_SECURITY_AND_AUDIT.md), all files in [`prompts/communication/`](prompts/communication/), and decisions D-05, D-06, D-07, D-16, D-17.

**Technologies:** CAP-side adapters; verified official SAP APIs/SDKs where approved; provider sandboxes; synthetic adapters when services are unavailable; approved BTP secret bindings.

**Implementation sequence:**

1. Build a per-integration inventory of owner, system of record, entitlement, endpoint, identity, data classes, contract, availability test, failure semantics, and operational support.
2. Resolve and verify D-07 service availability individually. Do not infer access from product names, environment variables, or documentation.
3. Implement adapter interfaces and test doubles in CAP, not in the browser or agent. Keep simulation and live configurations isolated and mode-labelled.
4. For supplier integrations, retrieve status/evidence only from verified sources; preserve freshness and source. Keep all six qualification dimensions distinct and human-verifiable.
5. For logistics, retrieve shipment/route/carrier/ETA evidence only through verified adapters; never invent ETAs or map coordinates.
6. For SAP services, integrate only those individually verified and approved. No presumed IBP/TM/Ariba, ERP, supplier or HANA connection.
7. Resolve D-05/D-16 and implement voice only with human initiation, correct contact, applicable consent, AI disclosure, scoped capture, outcome status, and corroboration of material facts.
8. Resolve D-06/D-16 and implement email draft/review/send with recipient/content version binding, required human approvals, major-notice final Supply Chain Head approval, and provider outcome reconciliation.
9. Keep payment, purchase, route, transfer, schedule, allocation, and supplier-master side effects behind IMP-07 gates. No routine test may send actual communications or perform actual operations.
10. Implement provider timeouts, bounded safe-read retry, idempotency, stale/conflicting data states, monitoring, and `outcome_unknown` reconciliation without blind retries.

**Expected files/deliverables:** Isolated adapters and test doubles; provider contract tests; voice/email approval flows; supplier/logistics interfaces; integration status/monitoring; documented verified-vs-simulated evidence.

**Dependencies and parallel work:** IMP-03, IMP-07, and verified provider decisions. Adapter contracts and synthetic test doubles can be developed in parallel; live binding is gated per provider and must not block simulation-only work.

**Testing/validation:** Contract tests in sandbox; credential redaction; permission/content/recipient checks; provider outage and timeout; duplicate/unknown side effects; source freshness; simulation isolation; no actual calls, emails, purchases, or payments in routine test.

**Security/governance:** Secrets server-side only; least privilege; no raw sensitive payload in logs; consent and human communication review; simulation never reports as live; protected operations revalidate approval at dispatch.

**Exit criteria:** Each enabled provider has tested connectivity, identity, contracts, expected behavior, security and failure path documented. Any unavailable service remains a clearly labelled simulation with no external side effects.

**Do not start before ready:** Do not add real credentials/endpoints before verification and approval; do not send messages or perform supplier/logistics/financial actions from tests; do not enable a live adapter if its failure/retry semantics are unknown.

**Expected result:** A modular integration boundary where verified services and simulations are distinguishable end to end.

### IMP-09 — Resilience Analytics, Impact Prediction & Decision Intelligence

**Objective:** Provide reproducible, traceable supply-chain and impact analytics based on approved deterministic methodology.

**Why necessary:** Decision-makers need usable comparisons, but unqualified arithmetic or inferred patient counts could misstate pharmaceutical availability and business impact.

**Read first:** [`03_FUNCTIONAL_REQUIREMENTS.md`](docs/03_FUNCTIONAL_REQUIREMENTS.md), [`08_DATA_MODEL_AND_DEMO_DATA.md`](docs/08_DATA_MODEL_AND_DEMO_DATA.md), [`11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md), [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md), [`API_CONTRACTS.md`](docs/API_CONTRACTS.md), [`10_DEMO_RUNBOOK.md`](docs/10_DEMO_RUNBOOK.md), and [`DASHBOARD_AND_UI_SPECIFICATION.md`](docs/DASHBOARD_AND_UI_SPECIFICATION.md).

**Technologies:** Deterministic CAP analytics/domain services; HANA-backed queries if verified; SAPUI5 analytics module; synthetic scenario comparison.

**Implementation sequence:**

1. Resolve D-01 day-basis/calendar and formula before using time-based supply-gap forecasts; maintain the existing 30-calendar-day vs 20-production-day caveat until then.
2. Implement inventory coverage and consumption methods with explicit units, as-of time, source status, assumptions, and reproducible formula versions.
3. Implement production exposure using verified or synthetic schedule/capacity constraints; stale/missing constraints yield qualified/unavailable results.
4. Implement order exposure and customer-demand aggregation using source-linked order/demand records; separate observed orders from synthetic assumptions.
5. Implement supplier and shipment risk summaries with no unsupported live status, qualification, or ETA claims.
6. Implement alternative recovery scenario comparison and resilience indicators, preserving dependencies, uncertainty, and conflicting evidence.
7. Implement impact estimate method under D-14. Keep tablet-availability estimates separate from patients; do not infer patient counts or actual clinical outcomes.
8. Keep customer allocation informational until D-08 is resolved and an approved policy is implemented and independently validated.
9. Build Resilience & Impact Analytics views with formula, units, inputs, provenance, estimate labels, assumptions, uncertainty, and unavailable states.
10. Link every displayed KPI to source data, formula implementation, test case, and current policy/decision.

**Expected files/deliverables:** Analytics/domain services; impact-estimation engine; resilience metrics; scenario comparisons; analytics UI; formula, boundary, and regression tests.

**Dependencies and parallel work:** IMP-02, IMP-03, IMP-05, and approved calculation policies. UI visualization work can proceed with synthetic mock results; production formulas wait for D-01/D-14. Do not let AI replace deterministic calculation.

**Testing/validation:** Unit/property tests for units, calendar boundaries and arithmetic; fixture reproduction; missing/stale/conflicting inputs; estimate provenance; data aggregation reconciliation; no allocation application before policy approval; formula version regression.

**Security/governance:** No actual patient outcomes or patient counts. Show uncertainty and synthetic/estimated status. Avoid discriminatory or unsupported allocation decisions; human policy approval required.

**Exit criteria:** Every operational/impact metric is reproducible and traceable to inputs, formula, units, provenance, assumptions, and decision basis; estimates are clearly separated from verified facts.

**Do not start before ready:** Do not present 10 days as calendar-aware forecast before D-01; do not turn synthetic tablet exposure into patients; do not automate allocation before D-08.

**Expected result:** Decision intelligence that is explainable, deterministic where required, and honest about uncertainty.

### IMP-10 — End-to-End Testing, Deployment, Final Demo & Handover

**Objective:** Verify the complete synthetic workflow in an identified isolated environment and hand over a safe, supportable build.

**Why necessary:** A working end-to-end demo requires evidence across data, UI, CAP, agents, approvals, adapters, security, deployment, and recovery—not just a successful presentation path.

**Read first:** [`TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md), [`10_DEMO_RUNBOOK.md`](docs/10_DEMO_RUNBOOK.md), [`DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md), [`PROJECT_STATUS.md`](docs/PROJECT_STATUS.md), [`11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md), [`AGENTS.md`](AGENTS.md), and [`.github/pull_request_template.md`](.github/pull_request_template.md).

**Technologies:** Project-approved SAP build/test/deployment tooling; verified BTP Cloud Foundry; HANA, UI5, CAP, AI/workflow/Work Zone and external integrations only where individually verified; synthetic test services by default.

**Implementation sequence:**

1. Maintain unit, API, DB, UI, agent, security, and integration tests throughout IMP-01–09; IMP-10 is a verification gate, not the first testing phase.
2. Execute all 20 documented scenario cases (`T-01`–`T-20`): normal baseline, delay, coverage/gap, supplier-check failure/success, agent conflict, stale/missing data, unsupported AI claim, reject/modify/expiry, duplicate execution, unauthorized actions, agent/AI/DB/provider failures, suspicious activity, kill switch, and closure verification.
3. Add schema/fixture/invariant tests, accessibility checks, performance measurement with explicit workload assumptions, failure injection, backup/restore and migration rollback evidence.
4. Run all tests in isolated environments with synthetic records, test-only identities, provider sandboxes, and side effects disabled unless an explicitly approved controlled test requires otherwise.
5. Resolve required P0 decisions and verify BTP accounts, entitlements, service bindings, identity, network, operational owners, and cost boundary.
6. Deploy CAP, UI5, and HANA using reviewed artifacts and migrations. Enable AI, workflow, Work Zone, or external adapters one at a time after their individual gates pass.
7. Configure secure environment bindings, health/readiness, monitoring, alert ownership, logging redaction, audit access, backup/restore, rollback, and incident response.
8. Perform smoke, authorization, approval, provider-failure, seed-guard, security, and end-to-end tests on the exact candidate build and environment.
9. Execute all ten runbook steps against resettable synthetic data. Capture screenshots/recording only from the identified build and label simulations.
10. Update project status, limitations, release notes, test evidence, deployment evidence, known decisions, and developer handover. Do not call a document a test report until execution evidence exists.

**Expected files/deliverables:** Test reports; fixed critical defects; reviewed deployment artifacts; verified environment/service evidence; demo recording/screenshots from actual build; updated status; release notes and handover.

**Dependencies and parallel work:** All phases. Testing, docs, and deployment preparation proceed continuously and in parallel with feature work; final end-to-end acceptance waits for integrated candidate build and all applicable gates.

**Testing/validation:** Full test strategy and T-01–T-20; all eight protected-action negative/positive tests; synthetic-only reset; no false live/integration claims; deployment health, rollback and recovery; accessibility and security review.

**Security/governance:** Separate demo and production environments; never seed synthetic history into live operations; maintain server-side authorization, human approval and audit; keep high-impact side effects disabled unless explicitly approved and controlled.

**Exit criteria:** Complete synthetic disruption-to-recovery workflow passes in an identified isolated build; all mandatory approval gates are enforced; service integrations are individually verified or clearly simulated; runbook evidence and handover are accepted; unresolved limitations are explicit.

**Do not start before ready:** Do not claim judge-ready application, deployment, provider integration, production readiness, or patient impact without named build/environment and evidence. Do not conduct live operations in ordinary tests.

**Expected result:** A verified, isolated, supportable demonstration with evidence-backed claims and a complete handover.

## 7. Dependency matrix

| Phase | Required dependency | Key gate |
|---|---|---|
| IMP-01 | Existing documentation and verified development environment. | Tool/runtime compatibility and safe local synthetic profile. |
| IMP-02 | IMP-01. | D-13 before production persistence/tenant claims; D-01 before normalized time forecast. |
| IMP-03 | IMP-01 and reviewed data/API contracts from IMP-02. | Freeze contracts; server authorization foundation before consumers. |
| IMP-04 | IMP-01 and agreed API/UI contracts. | Mock data allowed during backend build; no independently invented enums. |
| IMP-05 | IMP-02, IMP-03, and IMP-04. | Core modules work without AI and use resettable fixtures. |
| IMP-06 | IMP-03, approved agent design, and relevant data services. | D-02/D-03/D-04 for final roster/provider/protocol; protected execution stays off. |
| IMP-07 | IMP-03 authorization foundation; workflow/governance design for protected execution. | D-10/D-11/D-15/D-19 and other applicable policy decisions. |
| IMP-08 | IMP-03, IMP-07, and verified external-provider decisions. | Each adapter is individually verified or remains labelled simulation. |
| IMP-09 | IMP-02, IMP-03, IMP-05, and relevant approved calculation policies. | D-01/D-08/D-14 gate dependent forecasts/allocation/impact metrics. |
| IMP-10 | All phases; testing is continuous. | Candidate build, required decisions, environment evidence, and acceptance tests. |

### Parallel workstreams

| Workstream | Primary phases | Ownership and interfaces |
|---|---|---|
| **A — SAP Platform, Database & Backend** | IMP-01, IMP-02, IMP-03 | Owns toolchain evidence, CDS/data model, migrations, CAP services, authorization foundation, API contract versioning. |
| **B — Frontend & User Experience** | IMP-04, IMP-05 | Owns SAPUI5 shell/modules/accessibility; can use contract-compatible mock data while CAP is built. |
| **C — AI Engineering** | IMP-06 | Owns model evaluation, orchestrator, scoped agents, prompt versions, and structured task/result behavior under CAP authority. |
| **D — Workflow, Security & Integrations** | IMP-07, IMP-08 | Owns human approval, security/audit, emergency controls, verified adapters and communication governance. |
| **E — Analytics, Testing & Deployment** | IMP-09, IMP-10 | Owns deterministic metrics, test strategy execution, cross-phase quality evidence, deployment and handover. |

Teams may work concurrently only after interface contracts and ownership are agreed. Frontend may start with mock responses and replace them when CAP endpoints are stable. API owners must prevent conflicting entity names, field meanings, units, status enums, or error semantics. Dependencies still determine what can be integrated, enabled, and claimed complete.

## 8. Open decisions and implementation gates

The source of truth is [`docs/11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md). This table maps all 19 decisions to implementation gates; it does not resolve them. A “block” applies to the dependent capability, not necessarily every task in a phase. For P0 items, dependent functionality stays disabled until the owner records an approved decision and the implementation evidence passes review.

| ID and subject | Blocks / dependent phases | Keep disabled or provisional until resolved | Approval owner(s) in decision register | Evidence to close |
|---|---|---|---|---|
| **D-01 — Calendar-day vs production-day calculation** | Blocks normalized coverage-gap forecast and impact interpretation; IMP-02, IMP-03, IMP-05, IMP-09. | Keep 30/20/10 as a qualified scenario comparison; no calendar-aware shortage forecast. | Supply Chain Head, Factory Manager, data owner. | Approved day unit/calendar/conversion, formula/version, tests, and recalculated estimates. |
| **D-02 — Final specialist-agent roster** | Blocks final agent responsibilities/evaluation; IMP-06. | Five roles remain proposed; do not claim final deployable agent count. | Project owner and functional leads. | Approved names, responsibilities, owners, overlap/escalation rules, and role-to-runtime decision. |
| **D-03 — AI model/provider and deployment** | Blocks live AI/model integration; IMP-06, IMP-08, IMP-10. | Keep AI provider/model disabled; use only explicitly labelled synthetic analysis. | SAP architect, security/privacy owner, project owner. | Provider/model/version, region, data handling/retention, failure behavior, evaluation criteria, and approved credentials method. |
| **D-04 — Agent communication protocol and orchestration topology** | Blocks final orchestrator transport/state/retry implementation; IMP-06. | Keep task protocol/topology proposed; no independent agent-to-agent calls outside scoped orchestration. | SAP architect / AI technical lead. | Protocol/version, task identity, timeout/cancel, state ownership, concurrency, and failure policy. |
| **D-05 — Voice provider** | Blocks live voice; IMP-08, IMP-10. | No real calls; simulation only. | Project owner, communications owner, security/legal. | Selected provider/sandbox, human initiation, identity disclosure, consent, recording/retention, outcomes, and security evidence. |
| **D-06 — Email provider** | Blocks external email send; IMP-08, IMP-10. | Draft-only or labelled simulated delivery; no real recipient sends. | Project owner, communications owner, security. | Provider/test account, recipient rules, approval path, send/delivery semantics, retries, and unknown-outcome reconciliation. |
| **D-07 — SAP service availability and actual integration set** | Blocks any claim/use of unverified SAP services; IMP-01, IMP-02, IMP-06–08, IMP-10. | Keep provider flags off until each service is verified; do not infer IBP/TM/Ariba or HANA access. | SAP platform owner / SAP architect. | Per-service entitlement, binding, connectivity/expected-behavior test, owner, data handling, and failure behavior. |
| **D-08 — Customer allocation policy** | Blocks actual order prioritization/reallocation; IMP-05, IMP-07, IMP-09. | Keep healthcare-first balanced as provisional and `applied: false`; scenarios only. | Project owner, Supply Chain Head, customer/quality/legal stakeholders. | Approved policy, evidence basis, tie-breakers, exception path, authority, effective date, and tests. |
| **D-09 — Backup supplier qualification rule** | Blocks operational supplier eligibility/purchase; IMP-02, IMP-03, IMP-05, IMP-07, IMP-08. | Six check dimensions remain independent; synthetic passes do not qualify a real supplier. | Procurement Manager, Compliance / Auditor, Quality/regulatory owner. | Required evidence per dimension, expiry, verifier, pass/fail/escalation rules, and any additional checks. |
| **D-10 — Data retention, audit integrity and privacy** | Blocks persistent operational data/audit policy and production deployment; IMP-02, IMP-07, IMP-08, IMP-10. | Keep production data and unapproved retention/export disabled; do not claim immutable audit. | Security/privacy/legal owner, Compliance / Auditor, SAP architect. | Retention/deletion, legal hold, encryption/key management, backup, admin separation, search/export, and incident response policy. |
| **D-11 — Authentication, identity and role authorization** | Blocks authenticated production access and all approval/execution; IMP-01, IMP-03, IMP-04, IMP-07, IMP-08, IMP-10. | No production identity claims; fail closed where identity/scope is unknown. | Identity/security owner, SAP architect, project owner. | Identity provider/claims, MFA/session/revocation/provisioning, record/field scopes, role admin, and approval identity proof. |
| **D-12 — Final API contracts and lifecycle rules** | Blocks frozen API/agent/frontend contracts; IMP-02–06 and IMP-08–10. | Mark current REST-style `/api/v1` as proposed; do not let consumers invent incompatible schemas/enums. | SAP CAP/API lead, product owner, security. | Approved protocol/version, resources, auth scopes, enums/errors, ETag/idempotency and compatibility rules. |
| **D-13 — HANA data model, tenant isolation and migrations** | Blocks production persistence, tenant claims, and persistent deployment; IMP-02, IMP-03, IMP-10. | Local synthetic persistence only; no production HANA binding/data import. | SAP architect, CAP/data lead, security. | Tenant boundaries, key/mapping/migration, audit schema, indexing, backup/restore, and seed-guard evidence. |
| **D-14 — Demo metric and impact methodology** | Blocks validated/user-facing impact claims; IMP-03, IMP-05, IMP-09, IMP-10. | Keep 250,000 tablets as a synthetic scenario estimate; no patient counts/outcomes. | Product/data owner, Supply Chain Head, clinical/quality reviewer as applicable. | Metric definition, baseline, unit/formula/version, uncertainty, source assumptions, and approved user-facing scope. |
| **D-15 — Emergency pause/stop, kill switch, manual override and resume authority** | Blocks emergency-control activation and agent execution with side effects; IMP-06, IMP-07, IMP-10. | Keep pause/stop/kill/override/resume unavailable until authority and verified states exist. | Project owner, Supply Chain Head, security/operations. | Authorized roles, halt scope, in-flight reconciliation, resume authority/checklist, evidence, audit, and failure tests. |
| **D-16 — Non-major email and voice approval/consent policy** | Blocks live communication approval/dispatch policy; IMP-07, IMP-08, IMP-10. | Keep calls/sends simulated or disabled; require human confirmation pending policy. | Communications owner, project owner, legal/security. | Audience/content approval matrix, consent/AI disclosure, transcripts/retention, recipient verification, retries, and escalation. |
| **D-17 — BTP deployment configuration and operating model** | Blocks BTP deployment/release; IMP-01, IMP-08, IMP-10. | Do not deploy to guessed org/space/region or enable unowned services. | SAP platform/DevOps owner, project owner. | Environments/regions/org/space/plans, release pipeline, monitoring, cost owner, backup, rollback, and support rota. |
| **D-18 — Business model and commercial target** | Product-discovery dependency; not a blocker to the core technical foundation. Review at IMP-01/IMP-10 and before commercial claims. | Do not claim validated buyer, pricing, commercial model, or go-to-market. | Project owner / product lead. | Target/buyer/user, value proposition, pricing/licensing, support model, market evidence, and go-to-market decision. |
| **D-19 — Approval lifecycle policy** | Blocks approval lifecycle/dispatch; IMP-03, IMP-07, IMP-08, IMP-10. | No guessed expiry, delegation, escalation timers, reviewer sequence, revocation, or substitute approver; fail closed on stale state. | Project owner, Supply Chain Head, security and workflow owner. | Expiry triggers/duration, revocation/extension, reviewer/delegate model, escalation/transitions, and audit requirements. |

Record a decision in the existing register with approver, date, rationale, affected requirements/contracts/tests, security review, implementation owner, and validation evidence. No implementation default or synthetic fixture resolves a decision.

## 9. Shared development standards

### Architecture and boundaries

- Preserve SAPUI5 → CAP/Node.js → authorized data/services boundaries; HANA is accessed server-side.
- Use a central orchestrator and bounded specialist roles only after design decisions; agents use narrow backend tools.
- Use backend-controlled adapters for AI, workflow, SAP/external providers, voice, and email.
- Keep data, proposal, approval, execution, and verification as distinct states.
- Do not add an unrelated framework/provider without explicit justification and project-owner approval.

### Security and governance

- Enforce authentication, role/resource/action authorization, and version checks server-side for every protected request; frontend visibility is not security.
- Apply least privilege. No secrets in Git, prompts, logs, or browser code. No direct HANA access by UI or agents.
- Treat retrieved content and model/tool output as untrusted. Validate schemas, identifiers, scope, lengths, and business constraints; protect against prompt injection.
- Require human approval for all eight protected categories. No agent self-approval. Recheck approval/version immediately before execution.
- Never blindly retry a side effect. Reconcile unknown external outcomes before an approved retry.
- Fail closed if identity, authorization, evidence, workflow, approval, or required audit state cannot be verified.
- Audit material actions and failures; minimize/redact logs and preserve approved privacy/retention controls.
- Suspicious activity must be neutrally flagged for verification; no autonomous accusation.

### Data and estimates

- Use synthetic demonstration data only in the hackathon environment. Preserve `dataMode`, source status, verification state, observed timestamps, units, and provenance.
- Validate all 26 schemas and cross-record relationships; prevent duplicate/inconsistent records and protect tenant boundaries.
- Do not invent dates, quantities, prices, capacity, supplier qualification, customer commitments, or patient outcomes.
- Never promote simulated or synthetic input to live-verified state.
- Keep the proposed allocation policy unapplied until approved. Treat backup supplier stock as unusable until all six checks pass with appropriate human verification.
- Display formulas, inputs, assumptions, units, uncertainty, and estimate status for every derived metric.

### Engineering and collaboration

- Keep code modular; reuse domain services and components; assign ownership for entity/API/status definitions.
- Validate inputs and return explicit, useful errors; do not use broad catches or success-shaped fallback.
- Add automated tests with each behavior; test approval, rejection, failure, retry, and stale-data paths.
- Add observability for service state, freshness, failures, pending work, audit writes, and unknown outcomes without leaking secrets.
- Version APIs and migrations; document deviations and update related docs when approved behavior changes.
- Keep changes focused. Use feature branches and pull requests; keep `main` stable and reviewable.
- Do not modify real supplier systems, send real email/calls, or make real payments/orders in ordinary test runs.

## 10. Testing and quality requirements

Testing is continuous, not postponed until IMP-10. Use `docs/TESTING_STRATEGY.md` as the detailed test plan; all 20 cases T-01–T-20 remain proposed until executed against an identified build.

| Test level | Minimum verification |
|---|---|
| Unit/domain | Deterministic calculations, units, date rules, schema/business validation, supplier eligibility, policy states, and version transitions. |
| API/backend | Contract/schema, authn/authz, role/record scope, concurrency, idempotency, error envelopes, pagination, and protected-action denial. |
| Data/HANA | Fixture references and invariants, migration/rollback, seed guard, isolation, consistency, backup/restore, and audit persistence. |
| UI/accessibility | SAPUI5 routes, data modes, stale/empty/error/no-access states, keyboard navigation, semantic labels, readable tables, and status not conveyed by color alone. |
| Agent/orchestrator | Bounded tool access, prompt-injection resistance, unsupported claims, malformed results, conflict preservation, timeout/cancel, and no self-approval/side effect. |
| Workflow/security | All eight approvals; rejection/change/expiry/revocation; stale version; direct API/tool bypass; emergency failure truthfulness; audit failure fail-closed. |
| Integration | Provider contract and failure tests, credential redaction, provenance/freshness, consent/recipient/content controls, idempotency, and unknown-result reconciliation. |
| End-to-end/recovery | Resettable synthetic journey, all 20 scenarios, dependency outage injection, no unintended side effect, rollback/restore, and runbook evidence. |

Use isolated synthetic data, non-production identities, and provider sandboxes. Record command, build/version, schema/fixture version, environment, result, reviewer, and evidence link. A design document or static fixture is not a passing application test; no performance target or certification may be invented.

## 11. Git branching and collaboration strategy

`CONTRIBUTING.md` contains legacy phase/layout guidance. Its commit/push examples should be updated separately; follow these safe collaboration rules for implementation:

1. Start from the current `main`; check `git status`, recent history, and open PRs.
2. Create a focused feature branch using project conventions (`feature/`, `fix/`, `docs/`, `refactor/`, or `test/`).
3. Keep each PR to a coherent phase task. Link requirements, decision IDs, and affected contracts.
4. Stage only intended files; inspect the full diff and run relevant tests before requesting review.
5. Use the repository PR template; accurately state tests run, synthetic data, integration status, and known limitations.
6. Resolve review comments, update docs, and verify CI before merge. Do not push directly to `main` unless the project owner explicitly authorizes it.
7. Never commit secrets, real pharmaceutical/supplier/customer data, or private provider configuration.

Independent workstreams must use versioned contracts and named owners. Do not create competing entity names, status enums, or API payloads in parallel.

## 12. Global definition of done

Every implementation phase is complete only when all applicable items are true:

- [ ] Expected working deliverables exist and are reviewable.
- [ ] Unit, integration, negative, and failure-path tests for the phase pass.
- [ ] Data/schema/API/behavior validation passes against the agreed contract.
- [ ] Related documentation, status, and decision references are current.
- [ ] No secrets or real operational/pharmaceutical data were added.
- [ ] Human approval gates and server-side authorization are preserved for protected behavior.
- [ ] Live services are individually verified or visibly labelled proposed/simulated.
- [ ] Build/test/deployment claims cite the exact build, environment, command, and evidence.
- [ ] Unresolved decisions, limitations, and follow-up work are explicit.
- [ ] Changes are focused, diff-reviewed, and accepted through the project collaboration process.

## 13. Final project completion criteria

VaxResilience implementation is complete for the hackathon demonstration only when:

1. The ten implementation phases have delivered an integrated SAPUI5/CAP/Node.js application using the approved architecture and verified environment.
2. Synthetic scenarios can be reset and replayed from the correct initial, intermediate, and final states without contaminating production or live data.
3. All eight modules support the intended journeys and all seven role contexts are enforced by verified server-side identity/authorization.
4. All eight protected actions require current, version-bound Supply Chain Head final approval; rejection, change, stale state, and unauthorized requests cannot execute.
5. Agent/orchestrator work is bounded, evidence-linked, observable, and incapable of self-approval or bypassing CAP policy.
6. All displayed calculations and impact estimates show method, units, inputs, provenance, assumptions, and uncertainty. No patient outcome is claimed.
7. Every integration is individually verified or clearly marked as a simulation; no real voice/email/purchase/financial operation occurs outside approved controlled environments.
8. The 20 documented scenarios and required security, failure, recovery, and accessibility tests pass with recorded evidence.
9. Deployment, monitoring, audit, rollback, backup/restore, emergency control, and support ownership are verified and handed over.
10. The demo runbook has been exercised against a named isolated build and all presentation claims match observed capability.

Until evidence satisfies these criteria, the project status must clearly distinguish what is documented, implemented, tested, simulated, verified, blocked, and pending.

## 14. Repository document reference index

### Foundation and project context

- [`AGENTS.md`](AGENTS.md) — Authoritative project constraints and implementation guidance.
- [`README.md`](README.md) — Product overview, phases 1–6 documentation baseline, and current status.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — Legacy contribution guide; its phase/layout section requires a separate update.
- [`docs/00_PROJECT_OVERVIEW.md`](docs/00_PROJECT_OVERVIEW.md) — Project identity, problem, users, and product context.
- [`docs/01_BUSINESS_PROBLEM.md`](docs/01_BUSINESS_PROBLEM.md) — Supply-chain problem framing.
- [`docs/02_DEMO_SCENARIO.md`](docs/02_DEMO_SCENARIO.md) — Fictional disruption scenario and data caveats.

### Product requirements and experience

- [`docs/03_FUNCTIONAL_REQUIREMENTS.md`](docs/03_FUNCTIONAL_REQUIREMENTS.md) — 34 FR and 11 current NFR rows; reconcile the task brief’s inconsistent NFR count.
- [`docs/USER_ROLES_AND_ACCESS.md`](docs/USER_ROLES_AND_ACCESS.md) — Seven roles, access baseline, and pending scopes.
- [`docs/DASHBOARD_AND_UI_SPECIFICATION.md`](docs/DASHBOARD_AND_UI_SPECIFICATION.md) — Eight modules, page behavior, states, and acceptance criteria.
- [`docs/USER_JOURNEYS.md`](docs/USER_JOURNEYS.md) — Eleven operational journeys.

### Architecture and integration boundaries

- [`docs/04_SYSTEM_ARCHITECTURE.md`](docs/04_SYSTEM_ARCHITECTURE.md) — Target component boundaries and information flow.
- [`docs/TECH_STACK.md`](docs/TECH_STACK.md) — Selected SAP baseline and unverified status.
- [`docs/INTEGRATION_ARCHITECTURE.md`](docs/INTEGRATION_ARCHITECTURE.md) — Integration boundaries and failure rules.
- [`docs/diagrams/system-architecture.md`](docs/diagrams/system-architecture.md) — Conceptual architecture diagram.
- [`docs/diagrams/supply-chain-flow.md`](docs/diagrams/supply-chain-flow.md) — Synthetic supply-chain route diagram.

### Agents, governance, and security

- [`docs/05_AGENT_DESIGN.md`](docs/05_AGENT_DESIGN.md) — Central orchestrator and five proposed specialist roles.
- [`docs/06_WORKFLOWS_AND_APPROVALS.md`](docs/06_WORKFLOWS_AND_APPROVALS.md) — Fifteen proposed workflows and approval lifecycle.
- [`docs/07_SECURITY_AND_AUDIT.md`](docs/07_SECURITY_AND_AUDIT.md) — Security, data handling, audit, and failure requirements.
- [`docs/AGENT_TOOL_SPECIFICATIONS.md`](docs/AGENT_TOOL_SPECIFICATIONS.md) — Scoped tools and protected-action boundary.
- [`docs/diagrams/agent-workflow.md`](docs/diagrams/agent-workflow.md) — Conceptual proposal/approval/execution flow.
- [`prompts/orchestrator/`](prompts/orchestrator/) — Orchestrator prompt templates.
- [`prompts/specialist-agents/`](prompts/specialist-agents/) — Proposed specialist prompt templates.
- [`prompts/communication/`](prompts/communication/) — Communication drafting/call templates.

### Data, contracts, and configuration

- [`docs/08_DATA_MODEL_AND_DEMO_DATA.md`](docs/08_DATA_MODEL_AND_DEMO_DATA.md) — Logical model and synthetic data.
- [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) — Proposed HANA schema; not deployed.
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — Proposed CAP-facing API contracts.
- [`docs/09_INTEGRATIONS.md`](docs/09_INTEGRATIONS.md) — Integration catalogue and current verification state.
- [`data/synthetic/`](data/synthetic/) — Seven fictional fixture files and scenario manifest.
- [`data/schemas/`](data/schemas/) — 26 Draft 2020-12 JSON Schemas.
- [`.env.example`](.env.example) — Safe variable-name inventory; providers are disabled and credentials blank.

### Testing, deployment, and handover

- [`docs/10_DEMO_RUNBOOK.md`](docs/10_DEMO_RUNBOOK.md) — Synthetic-record walkthrough, evidence, and fallbacks.
- [`docs/TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) — Twenty proposed test cases and acceptance criteria.
- [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) — Proposed SAP BTP deployment sequence; no deployment claim.
- [`docs/11_DECISIONS_AND_OPEN_QUESTIONS.md`](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md) — Source of truth for D-01 through D-19.
- [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) — Documentation completion and implementation readiness.
- [`.github/pull_request_template.md`](.github/pull_request_template.md) — Review and evidence checklist.

---

**Roadmap rule:** Build incrementally, keep `main` stable, preserve human authority, and report only what is supported by current implementation and verification evidence.
