# Functional Requirements — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 2 — Product Requirements and User Experience
**Status:** Specification only; the requirements below do not assert that application functionality is implemented.
**Related documents:** [Roles and access](USER_ROLES_AND_ACCESS.md) · [Dashboard and UI specification](DASHBOARD_AND_UI_SPECIFICATION.md) · [User journeys](USER_JOURNEYS.md) · [Project overview](00_PROJECT_OVERVIEW.md) · [Demonstration scenario](02_DEMO_SCENARIO.md)

## 1. Purpose and scope

This document defines testable product behaviour for the eight VaxResilience application modules, communications, and cross-cutting quality expectations. It is the product-level input to later architecture, data, agent, implementation, and test specifications; it does not define APIs, schemas, vendors, or implementation choices reserved for later phases.

The repository currently contains the Phase 1 documentation foundation. Phase 2 documents specify intended capabilities, not delivered software. Every requirement therefore has a **specification status**:

- **Confirmed scope** — required product behaviour established by the project brief and Phase 1 decisions; still not a claim that it is implemented.
- **Proposed** — a product behaviour or interaction proposed to make a confirmed capability usable; subject to product-owner approval.
- **Pending decision** — the requirement cannot be finalized until an identified project decision is made.

Priority is independent of status: **P0** is essential to the core disruption-to-recovery demonstration; **P1** is important to the intended application; **P2** is supporting or a future enhancement.

## 2. Product objectives

VaxResilience is intended to improve pharmaceutical supply-chain visibility; detect and assess disruptions; expose inventory and production risk; estimate downstream customer and patient impact; evaluate recovery options; coordinate specialized AI agents; preserve human control of important decisions; improve communications and auditability; and monitor recovery through a human-confirmed return to acceptable operations.

## 3. Product-wide rules and scenario assumptions

1. AI can analyze authorized information, explain its conclusions, prepare recommendations, and draft communications. It cannot itself authorize a protected action.
2. The eight protected categories are: alternative-supplier purchasing; inter-warehouse inventory transfers; factory production-schedule changes; customer-order prioritization or reallocation; shipment-route or carrier changes; major disruption notices to customers; payments or financial commitments; and adding or changing approved suppliers. Each requires human approval, with the Supply Chain Head as final approval authority.
3. AI execution, where later enabled, must be explicitly permitted and occur only after the required recorded human approval. A recommendation, tool capability, or verbal response is not approval.
4. Demonstration company, supplier, customer, route, stock, and operational data are synthetic. Patient-impact values are estimates, not actual patient outcomes or predictions.
5. Demonstration arithmetic: 30-day shipment delay minus 20 days of API coverage equals a **potential 10-day supply gap**. Backup supplier stock is reported as 10 production days, but is not confirmed or usable until quality, regulatory, quantity, capacity, supplier, and delivery checks are complete.
6. Final customer-allocation policy, AI agent count/names, voice and email providers, authentication architecture, schemas, API contracts, SAP integration details, and emergency override permissions remain pending. The provisional healthcare-first balanced allocation approach is not an approved policy.
7. Voice and email are in scope. WhatsApp is not a confirmed capability.

## 4. Functional requirements by module

Requirement acceptance criteria below are product-level outcomes and are suitable for later test-case derivation. Role names use the seven established roles. “All roles” means only authenticated users with access to the relevant incident and data.

### 4.1 Executive Dashboard (ED)

#### FR-ED-001 — Present incident and operating overview
- **Description / behaviour:** Present active disruption state alongside material supply-chain indicators and link each item to its source module. Distinguish verified operational facts from estimates, assumptions, and synthetic inputs.
- **Roles:** All roles, with role-appropriate information.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Given an active synthetic incident, the dashboard shows its product, affected source, reported delay, last-updated time, and current incident state; every displayed risk estimate is labelled as an estimate and can be traced to its detail view.

#### FR-ED-002 — Summarize operational exposure and recovery
- **Description / behaviour:** Summarize API coverage, manufacturing exposure, shipment state, customer-order exposure, recovery progress, and estimated patient-impact indicators.
- **Roles:** All roles, role-appropriate.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** For the demonstration scenario, the dashboard displays 30 days delay, 20 days coverage, and 10 days potential gap without presenting the gap as a confirmed shortage; unavailable values are marked unavailable rather than fabricated.

#### FR-ED-003 — Surface agent activity and approvals
- **Description / behaviour:** Show agent status/activity summaries and the user's relevant pending approval count, with navigation to AI Command Centre and Approvals & Decisions.
- **Roles:** All roles; approval details restricted by assigned permissions.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** A pending decision is countable once, opens the corresponding decision record, and is not shown as approved or executable while awaiting approval.

#### FR-ED-004 — Tailor dashboard by role
- **Description / behaviour:** Present useful role-specific summaries without changing the underlying incident facts or granting access beyond the user's permissions.
- **Roles:** All roles.
- **Priority / status:** P1 / Confirmed scope.
- **Acceptance criteria:** Switching between the seven role test accounts changes the dashboard emphasis according to the access specification; restricted records remain inaccessible.

### 4.2 Supply Chain Digital Twin (DT)

#### FR-DT-001 — Represent the synthetic network
- **Description / behaviour:** Show supplier, port, manufacturing, warehouse, and customer nodes and their supply relationships, including the primary China-to-Hyderabad route and synthetic customer locations.
- **Roles:** All roles with network access; detail visibility role-scoped.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** The map can identify the supplier region, Shanghai Port, Nhava Sheva Port, Hyderabad facility, warehouses where defined, and five fictional customer locations; undefined location data is not invented.

#### FR-DT-002 — Visualize disruption propagation
- **Description / behaviour:** Indicate the disrupted supplier/route and affected downstream product, facility, inventory, and customer relationships.
- **Roles:** All roles with network access.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Selecting the disrupted route identifies the associated 30-day delay and links to relevant inventory, manufacturing, customer, and incident details; the view distinguishes potential downstream effects from confirmed facts.

#### FR-DT-003 — Inspect nodes and routes
- **Description / behaviour:** Selecting a map node or route opens a detail panel with its available status, timestamp/source, relationships, and relevant next actions.
- **Roles:** All roles, with actions limited by role.
- **Priority / status:** P1 / Proposed.
- **Acceptance criteria:** Selecting any displayed node or route opens its matching record; unavailable fields are explicitly labelled and protected actions are not directly executed from the map.

#### FR-DT-004 — Show alternatives without implying approval
- **Description / behaviour:** Represent the Hyderabad backup supplier and candidate logistics alternatives as under evaluation until relevant checks and approvals are recorded.
- **Roles:** Procurement Manager, Logistics Manager, Compliance / Auditor, Supply Chain Head; other roles may have read access.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Unverified supplier or route options are labelled “under evaluation”; selecting one cannot place an order or change a route without the relevant human approval.

### 4.3 AI Command Centre (AI)

#### FR-AI-001 — Make agent activity observable
- **Description / behaviour:** Show agent status, current task, activity timeline, tool-call summaries, errors, escalations, and timestamps without requiring private chain-of-thought disclosure.
- **Roles:** Supply Chain Head and relevant operational roles; detailed visibility boundaries pending confirmation.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** For each displayed activity, a reviewer can identify status and task outcome; a concise decision explanation and evidence references are available without exposing private chain-of-thought.

#### FR-AI-002 — Present evidence-backed recommendations
- **Description / behaviour:** Show recommendation summary, supporting evidence, assumptions, uncertainty, proposed action, expected impact, and approval category.
- **Roles:** Relevant operational managers; Supply Chain Head.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Every recommendation identifies its evidence or explicitly states evidence is missing; a protected proposal is handed to Approvals & Decisions and cannot be executed from its recommendation card.

#### FR-AI-003 — Pause or stop an agent
- **Description / behaviour:** Provide an authorized control to pause or stop an individual agent and show resulting state and outstanding work.
- **Roles:** Supply Chain Head; detailed operator permissions pending decision.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** A pause/stop request is confirmed, reflected in agent status, prevents subsequent agent work as specified by the eventual design, and creates an audit event; failure is shown explicitly.

#### FR-AI-004 — Provide global emergency control
- **Description / behaviour:** Provide a global kill switch to halt agent operations; access, resumption authority, and exact technical effect require later design.
- **Roles:** Authorized human role(s), pending decision.
- **Priority / status:** P0 / Confirmed scope; permission details pending.
- **Acceptance criteria:** The control requires an explicit confirmation, reports success or failure, records actor/time/reason, and displays the system as halted until an authorized resume decision is made.

#### FR-AI-005 — Hand off protected actions for approval
- **Description / behaviour:** Route each protected proposed action to the human approval workflow with evidence and action-specific review information.
- **Roles:** Agents prepare; operational managers review; Supply Chain Head is final authority.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** All eight protected categories create a pending approval record before execution; absent approval, failed checks, or an expired/stale proposal block execution.

### 4.4 Inventory & Manufacturing (IM)

#### FR-IM-001 — Display inventory and coverage
- **Description / behaviour:** Show available API/raw-material stock by defined location, units where provided, consumption assumptions, and calculated coverage with source and timestamp.
- **Roles:** Warehouse Manager, Factory Manager, Supply Chain Head; other role access limited by policy.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Synthetic Paracetamol API coverage displays 20 days; calculation inputs and timestamp are visible, and missing quantities are not inferred from placeholder values.

#### FR-IM-002 — Show production capacity and exposure
- **Description / behaviour:** Show production schedule, available capacity, material dependencies, and affected production period using available records.
- **Roles:** Factory Manager, Supply Chain Head; Warehouse Manager read/verification as authorized.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** The view identifies possible exposure after the 20-day coverage period under a 30-day delay and labels it potential; it does not silently alter a schedule.

#### FR-IM-003 — Prepare allocation or transfer proposals
- **Description / behaviour:** Allow authorized users and agents to prepare inventory allocation or inter-warehouse transfer proposals with quantities, source/destination, rationale, and impact.
- **Roles:** Warehouse Manager; Factory Manager and Supply Chain Head as reviewers.
- **Priority / status:** P1 / Confirmed scope.
- **Acceptance criteria:** A proposal is visibly pending approval; no stock movement occurs until human approval, and final allocation policy is marked provisional/pending.

#### FR-IM-004 — Track backup supplier verification
- **Description / behaviour:** Track quality, regulatory, quantity, capacity, supplier confirmation, and delivery feasibility as separate evidence-bearing checks.
- **Roles:** Procurement Manager, Compliance / Auditor, Logistics Manager, Supply Chain Head.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** A reported 10 production days remains unconfirmed until all required checks are complete; the UI identifies incomplete, failed, and verified checks and does not count unverified stock as secured coverage.

#### FR-IM-005 — Report discrepancies and stale data
- **Description / behaviour:** Provide a way to flag stock discrepancies and visibly distinguish stale, missing, or conflicting inventory/production data.
- **Roles:** Warehouse Manager, Factory Manager; Supply Chain Head.
- **Priority / status:** P1 / Confirmed scope.
- **Acceptance criteria:** A discrepancy report captures the affected record, reporter, time, and stated variance; affected calculations surface the data-quality warning until resolved.

### 4.5 Customers & Orders (CO)

#### FR-CO-001 — Display customer and order exposure
- **Description / behaviour:** Show customer type/location, order ID, product, quantity, required delivery date, fulfilment state, risk, and available impact estimate.
- **Roles:** Customer / Export Manager, Supply Chain Head; others as authorized.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** The five fictional demonstration customers can be shown; blank scenario quantities/dates remain unavailable rather than populated with invented values.

#### FR-CO-002 — Prepare fulfilment adjustments
- **Description / behaviour:** Compare potential fulfilment alternatives and prepare order priority/reallocation proposals, clearly identifying assumptions and the provisional allocation approach.
- **Roles:** Customer / Export Manager, Warehouse Manager; Supply Chain Head.
- **Priority / status:** P0 / Confirmed scope; final policy pending.
- **Acceptance criteria:** Any order priority or reallocation change is held for Supply Chain Head approval; healthcare-first balanced allocation is labelled proposed, not policy.

#### FR-CO-003 — Maintain communication history
- **Description / behaviour:** Link relevant approved drafts, sent status, delivery result where available, and communication audit references to a customer/order.
- **Roles:** Customer / Export Manager; Supply Chain Head; audit access as authorized.
- **Priority / status:** P1 / Confirmed scope.
- **Acceptance criteria:** A draft is distinct from a sent message; major disruption notices require approval and unsupported delivery commitments are not presented as verified.

### 4.6 Approvals & Decisions (AP)

#### FR-AP-001 — Maintain a protected-action approval queue
- **Description / behaviour:** List pending protected actions with category, initiator, proposed action, reviewer, final approver, state, and available deadline.
- **Roles:** Supply Chain Head; relevant managers; permission boundaries per access specification.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Each of the eight protected categories can be identified in the queue; an unavailable deadline is omitted or marked unavailable, not fabricated.

#### FR-AP-002 — Present decision evidence and impact
- **Description / behaviour:** Provide proposal details, supporting evidence, assumptions, risk, expected impact, verification status, and relevant source records before decision.
- **Roles:** Supply Chain Head and relevant reviewers.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** An approver can open every cited record or see why it is unavailable; unverified backup stock is not described as confirmed supply.

#### FR-AP-003 — Record approve, reject, modify, and escalate outcomes
- **Description / behaviour:** Support approval, rejection, permitted proposal modification, and escalation, recording actor, time, decision, rationale, and version.
- **Roles:** Supply Chain Head final authority; relevant managers may review; modification boundaries pending where unspecified.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Each decision outcome is persisted with identity/time/rationale; an edited proposal is re-presented for approval; rejection or escalation never triggers execution.

#### FR-AP-004 — Track execution and decision history
- **Description / behaviour:** Link approval to subsequent execution state and preserve immutable decision history for review.
- **Roles:** Supply Chain Head, relevant operators, Compliance / Auditor.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** A protected action cannot enter execution without an approved current version; the history shows decision and execution outcome separately.

### 4.7 Risk, Compliance & Audit (RC)

#### FR-RC-001 — Track supplier eligibility evidence
- **Description / behaviour:** Display supplier quality/regulatory status, evidence, dates/status where available, and unresolved checks.
- **Roles:** Compliance / Auditor, Procurement Manager, Supply Chain Head.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Each backup supplier verification dimension is independently visible; absent evidence is “not verified,” not presumed compliant.

#### FR-RC-002 — Flag suspicious activity for human review
- **Description / behaviour:** Flag duplicate invoices, supplier bank-account changes, duplicate purchase orders, unusual pricing, inventory manipulation, and unauthorized supplier changes with evidence references.
- **Roles:** Compliance / Auditor; Procurement Manager and Supply Chain Head as authorized.
- **Priority / status:** P1 / Confirmed scope.
- **Acceptance criteria:** A flag identifies the affected record, reason, and evidence and can hold a transaction for verification; wording does not assert that a person or organization committed fraud.

#### FR-RC-003 — Preserve searchable audit history
- **Description / behaviour:** Record recommendations, tool actions, approvals, rejections, modifications, execution outcomes, overrides, and relevant communications with identity, timestamp, action, and result.
- **Roles:** Compliance / Auditor and Supply Chain Head; access to sensitive fields remains restricted.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** A reviewer can filter history by incident/action/actor/time where records exist; an ordinary user cannot alter or erase an audit event.

#### FR-RC-004 — Manage evidence and verification status
- **Description / behaviour:** Link evidence to supplier checks, risk alerts, decisions, and incident records while showing its source and verification state.
- **Roles:** Compliance / Auditor, Procurement Manager, relevant managers, Supply Chain Head.
- **Priority / status:** P1 / Confirmed scope.
- **Acceptance criteria:** Each evidence item is associated with its subject and verification state; absent or failed evidence remains visible as a limitation.

### 4.8 Resilience & Impact Analytics (RA)

#### FR-RA-001 — Calculate coverage and potential supply gap
- **Description / behaviour:** Calculate coverage and compare it with delay assumptions, showing calculation inputs, units, and uncertainty.
- **Roles:** Supply Chain Head, Factory Manager, Warehouse Manager; role-scoped read access.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** 30 − 20 is shown as a 10-day **potential** gap using synthetic data; if inputs change or are missing, the result updates or is marked unavailable.

#### FR-RA-002 — Estimate customer and patient availability impact
- **Description / behaviour:** Provide downstream impact estimates based on available synthetic inventory, demand, delivery, urgency, and recovery assumptions.
- **Roles:** Supply Chain Head, Customer / Export Manager; relevant managers.
- **Priority / status:** P0 / Confirmed scope.
- **Acceptance criteria:** Every patient-impact output is labelled “estimate” and “synthetic demonstration data”; it cannot be described as actual patient outcomes or a medical prediction.

#### FR-RA-003 — Track recovery and compare scenarios
- **Description / behaviour:** Show recovery milestones, current risks, and before/after indicators for a selected plan, distinguishing planned from verified results.
- **Roles:** Supply Chain Head and relevant managers.
- **Priority / status:** P1 / Proposed.
- **Acceptance criteria:** Comparison identifies baseline, plan assumptions, and observed data separately; an unexecuted recommendation is not shown as achieved recovery.

### 4.9 Communication requirements (cross-module)

#### FR-CM-001 — Coordinate two-way internal voice calls
- **Description / behaviour:** Support an AI-identified call, question generation, response capture, follow-up, summary, and related record update, subject to consent and later provider/legal design.
- **Roles:** Supply Chain Head and relevant operational managers; initial stakeholder set follows Phase 1.
- **Priority / status:** P1 / Confirmed scope; provider pending.
- **Acceptance criteria:** The interaction identifies the AI, supports ending the call, stores a summary/audit reference as permitted, and marks verbal information unverified until required verification occurs.

#### FR-CM-002 — Draft and approve email before sending
- **Description / behaviour:** Draft communications from available business information; allow human review/modification/rejection; send only after applicable human approval and record outcome.
- **Roles:** Relevant manager prepares; Supply Chain Head final approval for major disruption notices and protected commitments.
- **Priority / status:** P0 / Confirmed scope; provider pending.
- **Acceptance criteria:** No draft is sent before approval; drafts do not invent delivery dates, quantities, prices, guarantees, or financial commitments; sending and failure states are auditable.

## 5. Non-functional requirements

These are product quality requirements, not vendor, certification, or numerical SLA commitments.

| ID | Quality area | Requirement and acceptance criteria | Priority / status |
|---|---|---|---|
| NFR-SEC-001 | Security and access | Authenticate individual users and enforce role/data authorization on each protected view and action; unauthorized access is denied and recorded where applicable. | P0 / Confirmed scope; implementation pending |
| NFR-SEC-002 | Human control | Enforce server-side approval gates for all eight protected categories; a UI-only disabled control is not sufficient. Attempts without current approval do not execute. | P0 / Confirmed scope |
| NFR-AUD-001 | Auditability | Preserve identity, timestamp, action, result, decision, and evidence references for material agent and human activity; ordinary users cannot alter records. | P0 / Confirmed scope |
| NFR-REL-001 | Reliability and safe failure | On agent, integration, or source-data failure, show an explicit failure/staleness state and retain human operating control; do not report success-shaped fallback data. | P0 / Confirmed scope |
| NFR-PERF-001 | Performance | Common operational views should remain usable with realistic demonstration data; exact response-time targets require later measurement and approval. | P1 / Proposed |
| NFR-USE-001 | Usability | Present source, freshness, status, action consequence, and approval state clearly; users can follow incident-to-decision paths without relying on color alone. | P0 / Confirmed scope |
| NFR-ACC-001 | Accessibility | Support keyboard navigation, readable tables, sufficient contrast, semantic labels, and non-color status cues; no certification is claimed. | P1 / Confirmed scope |
| NFR-MNT-001 | Maintainability | Keep requirements, interfaces, business rules, and simulation/live integration status traceable and documented; avoid hard-coding unresolved policies. | P1 / Confirmed scope |
| NFR-INT-001 | Integration resilience | Distinguish verified live integrations from simulations; handle unavailable sources with clear status and no fabricated facts. | P0 / Confirmed scope |
| NFR-DATA-001 | Data integrity | Validate types, ranges, relationships, and duplicate records; preserve source and verification state for operational values. | P0 / Confirmed scope |
| NFR-OBS-001 | Observability | Surface system/agent failures, pending work, and integration status to authorized operators with an auditable event trail. | P1 / Confirmed scope |

Authentication provider, security controls, retention periods, encryption implementation, system architecture, and numeric service targets are deferred to later design; no certification is asserted.

## 6. Requirements traceability

Journey links use the journey IDs in [User Journeys](USER_JOURNEYS.md). The acceptance reference is the requirement-specific acceptance criterion above; where a requirement is not central to an existing journey, it is marked “UI/module test.”

| Requirement ID | Application module | Primary role | Acceptance reference | Related journey |
|---|---|---|---|---|
| FR-ED-001 | Executive Dashboard | Supply Chain Head | Active incident facts and labels | UJ-01, UJ-02 |
| FR-ED-002 | Executive Dashboard | Supply Chain Head | Exposure math, estimates, unavailable values | UJ-01, UJ-02 |
| FR-ED-003 | Executive Dashboard | Supply Chain Head | Pending count and route to decision | UJ-01, UJ-06 |
| FR-ED-004 | Executive Dashboard | All roles | Role account view and access boundaries | UJ-01 |
| FR-DT-001 | Supply Chain Digital Twin | Logistics Manager | Required nodes and no invented data | UJ-02 |
| FR-DT-002 | Supply Chain Digital Twin | Supply Chain Head | Impact links and fact/estimate distinction | UJ-02 |
| FR-DT-003 | Supply Chain Digital Twin | Logistics Manager | Matching detail panel | UJ-02, UI/module test |
| FR-DT-004 | Supply Chain Digital Twin | Procurement Manager | Under-evaluation status; no execution | UJ-03 |
| FR-AI-001 | AI Command Centre | Supply Chain Head | Status/task/explanation without chain-of-thought | UJ-02, UJ-11 |
| FR-AI-002 | AI Command Centre | Supply Chain Head | Evidence and approval hand-off | UJ-03, UJ-06 |
| FR-AI-003 | AI Command Centre | Supply Chain Head | Paused state and audit event | UJ-11 |
| FR-AI-004 | AI Command Centre | Authorized operator (pending) | Confirmed halt and recorded event | UJ-11 |
| FR-AI-005 | AI Command Centre | Supply Chain Head | Approval record before execution | UJ-06 |
| FR-IM-001 | Inventory & Manufacturing | Warehouse Manager | 20-day synthetic coverage and inputs | UJ-01, UJ-02 |
| FR-IM-002 | Inventory & Manufacturing | Factory Manager | Potential period; no schedule mutation | UJ-02, UJ-04 |
| FR-IM-003 | Inventory & Manufacturing | Warehouse Manager | Proposal held for approval | UJ-04 |
| FR-IM-004 | Inventory & Manufacturing | Procurement Manager | Six checks and unconfirmed stock | UJ-03 |
| FR-IM-005 | Inventory & Manufacturing | Warehouse Manager | Traceable discrepancy and warning | UJ-04, UI/module test |
| FR-CO-001 | Customers & Orders | Customer / Export Manager | Five customers; no invented placeholders | UJ-05 |
| FR-CO-002 | Customers & Orders | Customer / Export Manager | Provisional allocation; approval gate | UJ-05 |
| FR-CO-003 | Customers & Orders | Customer / Export Manager | Draft/sent distinction and commitments | UJ-08 |
| FR-AP-001 | Approvals & Decisions | Supply Chain Head | Eight categories and truthful deadline | UJ-06 |
| FR-AP-002 | Approvals & Decisions | Supply Chain Head | Evidence accessible; stock caveat | UJ-03, UJ-06 |
| FR-AP-003 | Approvals & Decisions | Supply Chain Head | Versioned decision outcomes | UJ-06 |
| FR-AP-004 | Approvals & Decisions | Supply Chain Head | Approval and execution distinct | UJ-06 |
| FR-RC-001 | Risk, Compliance & Audit | Compliance / Auditor | Independent verification states | UJ-03 |
| FR-RC-002 | Risk, Compliance & Audit | Compliance / Auditor | Evidence, hold, no accusation | UJ-09 |
| FR-RC-003 | Risk, Compliance & Audit | Compliance / Auditor | Search and unalterable history | UJ-06, UJ-09 |
| FR-RC-004 | Risk, Compliance & Audit | Compliance / Auditor | Linked evidence state | UJ-03, UJ-09 |
| FR-RA-001 | Resilience & Impact Analytics | Supply Chain Head | 30 − 20 = potential 10 | UJ-02 |
| FR-RA-002 | Resilience & Impact Analytics | Supply Chain Head | Estimate/synthetic labels | UJ-05 |
| FR-RA-003 | Resilience & Impact Analytics | Supply Chain Head | Baseline/assumption/result separated | UJ-10 |
| FR-CM-001 | AI Command Centre / Audit | Supply Chain Head | AI identity, consent, unverified response | UJ-07 |
| FR-CM-002 | Customers & Orders / Approvals | Relevant manager | Human-approved send; no invented promise | UJ-08 |

## 7. Scope boundaries

### Core demonstration requirements

Incident visibility; synthetic route and disruption view; 30/20/10 exposure calculation; inventory and production status; customer-order exposure; evidence-backed AI recommendation summaries; verified/unverified backup supplier checks; human approvals for all eight protected action categories; audit visibility; and clearly labelled synthetic/estimated information.

### Planned application capabilities

Role-based views, agent coordination and controls, voice coordination, email drafting/sending after human approval, suspicious-activity alerts, analytics, and incident recovery monitoring. They remain planned until verified in implementation.

### Future design or enhancements

Detailed schemas/API contracts, selected AI agents and tools, identity provider, integration providers and live SAP connectivity, external communications provider, quantitative service targets, final allocation policy, and detailed emergency authority.

### Out of scope or not established

Application code in this phase; real patient, supplier, or company data; autonomous high-impact decisions; unverified supplier commitments; claims of actual patient outcomes; WhatsApp (not part of the confirmed communication scope); a named map provider; and any unverified SAP/ERP integration.
