# VaxResilience Demo Runbook

**Version:** 1.0<br>
**Project stage:** Phase 6 — Demo, Testing, Deployment and Project Handover<br>
**Status:** Presentation and walkthrough script. The repository currently contains documentation and static synthetic fixtures, not a runnable application.<br>
**Scenario date range:** 2026-09-01 to 2026-11-02 (fictional fixture history)<br>
**Related documents:** [Project status](PROJECT_STATUS.md) · [Testing strategy](TESTING_STRATEGY.md) · [Decisions and open questions](11_DECISIONS_AND_OPEN_QUESTIONS.md) · [Data model](08_DATA_MODEL_AND_DEMO_DATA.md) · [Agent design](05_AGENT_DESIGN.md) · [Workflow design](06_WORKFLOWS_AND_APPROVALS.md)

## 1. Audience, timing, and honest capability boundary

This runbook gives a presenter a judge-ready story and a repeatable **synthetic-record walkthrough**. It does not assert a working UI, live AI, database, voice call, email, approval workflow, or deployment. At this project stage, steps that name a screen describe the intended SAPUI5 page. If no later implementation is available, show the referenced JSON fixture and conceptual diagram instead; describe it as a static demonstration record, not a live interaction.

Suggested schedule: 2 minutes for the problem and architecture, 10–12 minutes for the ten steps, and 3–5 minutes for judge questions. Use a single clearly labelled synthetic dataset throughout. Do not mix a future live feed into the static fixture walkthrough.

### Opening script (about 60–90 seconds)

> Essential medicines depend on a chain of suppliers, ports, factories, warehouses, and customer orders. When an upstream API shipment is delayed, teams must rapidly assemble evidence from different functions and estimate where supply could be affected. VaxResilience is designed as an SAP-based supply-chain control tower: a central orchestrator coordinates bounded specialist analyses, while deterministic services calculate operational metrics and humans make consequential decisions. In our fictional BharatMed scenario, a 30-calendar-day shipment delay is compared with 20 production days of API coverage to illustrate a 10-day potential gap. The records, organizations, and outcomes are synthetic. Agents may analyze and prepare proposals; the Supply Chain Head must approve each protected action. The application and SAP connections are still planned, so today I will identify which records are static simulation rather than claim a live system.

Agentic coordination is useful here because supplier eligibility, inventory/production, shipment evidence, and customer communications are separate evidence domains. The proposed orchestrator can delegate bounded work, preserve disagreement, and return a connected, evidence-linked summary. It does not replace deterministic calculations, source verification, or human approval.

## 2. Pre-demo checklist

### Before the presentation

- Confirm whether a later runnable application exists in the demonstration environment. This repository alone does not provide one.
- If it does not, plan a **static-record walkthrough** of `data/synthetic/` and `docs/diagrams/supply-chain-flow.md`. Do not show a fabricated UI as though it were running VaxResilience.
- Keep all fixture content visibly labelled fictional, synthetic, simulated, or estimated. The dataset contains historic scenario timestamps; it is not current operational status.
- Open the needed files/pages in advance: `manifest.json`, `operations.json`, `suppliers.json`, `customers-orders.json`, `incidents-recovery.json`, `agent-activity.json`, and the supply-chain/system-architecture diagrams.
- Verify the presentation does not connect to a real supplier, patient/customer account, production tenant, mail service, voice provider, or payment system.
- If a future app has demo controls, verify it is isolated, seeded with synthetic data, and cannot dispatch external side effects. Keep external communications and protected-action execution disabled unless a deliberately approved test environment and test plan exist.
- Prepare screenshots or a recording only if they are captured from an actual, identified build. None is included in this repository. Label any mockup, edited still, or recorded simulation accurately.
- Agree who presents and who answers technical questions; do not expose credentials, private prompts, personal data, or sensitive provider configuration.

### Scenario facts to keep consistent

| Item | Synthetic scenario value | Presentation wording |
|---|---:|---|
| Product | Paracetamol 500 mg tablets | Fictional demonstration product |
| Opening API inventory | 1,000 kg | Synthetic opening snapshot |
| Consumption assumption | 50 kg per production day | Synthetic basis: 100,000 tablets/day × 0.0005 kg/tablet |
| Main shipment | 1,500 kg; original ETA 2026-09-01; revised/actual simulated arrival 2026-10-01 | 30 calendar days late; simulated, not carrier-tracked |
| Coverage and gap | 20 production days; 10 potential days under the documented comparison | Not a confirmed shortage; day-basis limitation is open |
| Backup supplier | 500 kg, stated as 10 production days | Six checks and a purchase approval are recorded only in the synthetic history; not a real qualification |
| Customer demand | 25,000 synthetic tablets/day across five fictional customers | Assumption, not measured customer demand |
| Availability exposure | 250,000 tablets = 10 × 25,000 | Synthetic estimate; not patients or a patient outcome |
| Customer orders | Five orders, each 100,000 tablets; simulated delivery on 2026-10-15 | Static simulated outcomes |

The 30-calendar-day lateness and 20-production-day coverage are not normalized by a defined production calendar. Do not describe the 10-day comparison as a calendar-aware forecast. See decision `D-01` in the open-questions register.

## 3. Ten-step walkthrough

Each screen name below is the intended module from the Phase 2 UI specification. It is an actual screen only if a later implemented build is independently verified.

### Step 1 — Establish normal operations

- **Presenter action:** Open the Executive Dashboard or, for a fixture-only demo, show the pre-incident portion of the scenario timeline.
- **Screen/page:** Executive Dashboard; Inventory & Manufacturing; Customers & Orders.
- **What to explain:** Establish the synthetic baseline before the disruption. The opening inventory snapshot is 1,000 kg, the main fictional purchase order is already planned, and the five customer records are synthetic. “Normal operations” is the scenario's baseline, not a claim about a real plant.
- **Expected visible result:** The baseline values and their units, source mode, and timestamps are visible; no claim of live source freshness is made.
- **Technical evidence:** `data/synthetic/operations.json` (`INV-SNAPSHOT-001`, `PO-MAIN-001`, `SHIP-MAIN-001`); `data/synthetic/customers-orders.json`; `manifest.json`.
- **Potential failure and fallback:** If a working dashboard is unavailable, state that the app is not implemented in this checkout and navigate the JSON records or timeline. Do not substitute a screenshot without provenance.

### Step 2 — Trigger the synthetic disruption

- **Presenter action:** In a future demo build, use only a clearly labelled **Simulate disruption** control. In this repository-only walkthrough, compare the pre-incident baseline with the recorded synthetic delay event.
- **Screen/page:** Executive Dashboard incident banner; shipment detail.
- **What to explain:** A fictional supplier notice moves the ETA from 2026-09-01 to 2026-10-01. This is a simulated fixture event, not real-time disruption detection or a supplier/carrier message.
- **Expected visible result:** A 30-calendar-day delay is shown with `dataMode: simulated`/synthetic provenance and the source event reference.
- **Technical evidence:** `operations.json` (`SHE-MAIN-002`, `SHIP-MAIN-001`); `incidents-recovery.json` (`EVD-DISRUPTION-001`, `DIS-BM-PARA-001`).
- **Potential failure and fallback:** If no event control or service exists, do not claim that a disruption was triggered live. Show the recorded event and explain the intended control.

### Step 3 — Analyze supply exposure

- **Presenter action:** Open the incident analysis and trace its input records. Explain the arithmetic and separate the static agent summary from actual model output.
- **Screen/page:** AI Command Centre; Inventory & Manufacturing; Resilience & Impact Analytics.
- **What to explain:** The documented comparison is 30 days of delay minus 20 days of coverage = 10 potential days. Five agent roles are proposed; the fixture contains simulated execution summaries, not evidence that agents or an AI model ran. The 250,000-tablet exposure is 10 × 25,000 synthetic tablets/day; it is not a patient count. Highlight the unresolved day-basis assumption.
- **Expected visible result:** Formula inputs, units, source references, synthetic/estimated labels, uncertainty, and any missing evidence are visible. No confirmed shortage or patient outcome is asserted.
- **Technical evidence:** `manifest.json`; `products.json` (`ASM-API-CONSUMPTION`); `operations.json` (`INV-SNAPSHOT-001`); `customers-orders.json` (`DEMAND-SYNTHETIC-001`); `incidents-recovery.json` (`RISK-BM-PARA-001`, `IMPACT-BM-PARA-001`); `agent-activity.json`.
- **Potential failure and fallback:** If values or source references conflict in a future build, retain the conflict and mark the result unavailable/qualified. For the static demo, explain the formula from the fixture and do not claim model reasoning was executed.

### Step 4 — Trace the Digital Twin route

- **Presenter action:** Select the disrupted route and trace its nodes from the fictional supplier through the ports to the Hyderabad facility.
- **Screen/page:** Supply Chain Digital Twin; otherwise the conceptual supply-chain-flow diagram.
- **What to explain:** The synthetic route is Suzhou/Shanghai region → Shanghai Port → Nhava Sheva Port → Hyderabad. The local backup source is represented by a separate fictional route. No geographic map service, shipment telemetry, or SAP integration is established.
- **Expected visible result:** Route, ports, facility, shipment, and source statuses are distinguishable; simulated location/status is not represented as a live map.
- **Technical evidence:** `operations.json` (`ROUTE-CN-HYD-001`, `SHIP-MAIN-001`, `ROUTE-HYD-LOCAL-001`); `docs/diagrams/supply-chain-flow.md`.
- **Potential failure and fallback:** Missing map or coordinates means use the conceptual diagram and label it conceptual. Do not invent route positions or transport observations.

### Step 5 — Prepare recovery options

- **Presenter action:** Review the backup-source checks, production assumptions, route records, and customer proposals without applying an allocation policy.
- **Screen/page:** Inventory & Manufacturing; Risk, Compliance & Audit; Customers & Orders; Approvals & Decisions.
- **What to explain:** The synthetic fixture records six independent dimensions—quality, regulatory, quantity, capacity, supplier confirmation, and delivery—as passed for this fictional scenario. It then records a 500 kg backup receipt in simulation. This is pre-authored scenario history, not real qualification. The order fixture has one 100,000-tablet order per fictional customer. No final allocation policy is selected.
- **Expected visible result:** Each check and evidence reference is separately inspectable; simulated receipt and order fulfillment remain separate from proposal/approval; unresolved assumptions remain visible.
- **Technical evidence:** `suppliers.json` qualifications/events; `operations.json` (`SHIP-BACKUP-001`, inventory snapshots, production plan); `customers-orders.json`; `manifest.json` (`POLICY-ALLOC-001`, `applied: false`).
- **Potential failure and fallback:** If any required check is missing, failed, stale, or contradictory in an implemented flow, stop the proposal and escalate. In a static walkthrough, explain that the final fixture state includes six synthetic passes while the opening evaluation state did not.

### Step 6 — Demonstrate the human decision boundary

- **Presenter action:** Open the version-bound purchase approval and show the human decision record. In a future application, demonstrate approval/rejection/modification only in a dedicated isolated test environment.
- **Screen/page:** Approvals & Decisions.
- **What to explain:** Agents may prepare and submit; they cannot approve or dispatch. The Supply Chain Head is final approver for all eight protected categories. A decision applies only to its reviewed proposal version; execution and verification are separate.
- **Expected visible result:** The synthetic purchase request (`APR-PURCHASE-001`) and decision (`DEC-PURCHASE-001`) identify the demo approver and version. This is a static synthetic record, not a live approval action.
- **Technical evidence:** `incidents-recovery.json` approval request/decision; `agent-activity.json` audit event `AUD-003`; `docs/06_WORKFLOWS_AND_APPROVALS.md`.
- **Potential failure and fallback:** If proposal version, actor, or approval state cannot be shown, do not imply an action is authorized. Use the workflow diagram to explain the required gate.

### Step 7 — Show communication governance

- **Presenter action:** Show the synthetic voice summary and approved email record; do not initiate an actual call or send a message for this demo.
- **Screen/page:** AI Command Centre; Customers & Orders; Approvals & Decisions.
- **What to explain:** Voice provider and email provider are unselected. The fixture marks a human-requested internal call as `completed_simulated` and its spoken information `unverified`; it marks the email and delivery as simulated. Human approval is required before AI-drafted email sending; major customer disruption notices require Supply Chain Head final approval.
- **Expected visible result:** Draft, approval, simulated delivery, and verification state are distinct. No external recipient receives anything.
- **Technical evidence:** `agent-activity.json` (`CALL-PROC-001`, `EMAIL-DRAFT-001`, `SIM-EMAIL-001`); `incidents-recovery.json` (`APR-NOTICE-001`, `DEC-NOTICE-001`); `docs/09_INTEGRATIONS.md`.
- **Potential failure and fallback:** If a provider is unavailable, show an explicitly labelled mock/static record or omit the interaction. Never make a real call/email as a fallback.

### Step 8 — Review simulated execution and monitoring

- **Presenter action:** Trace approved purchase to simulated receipt, delayed main shipment arrival, production records, and five simulated deliveries.
- **Screen/page:** Inventory & Manufacturing; shipment detail; Customers & Orders.
- **What to explain:** The fixture contains post-decision outcomes created for the scenario. It does not prove a CAP adapter or external operation executed. Any real side effect in a later build must use an idempotency key, current approval recheck, and reconciliation for an unknown result.
- **Expected visible result:** Order state, fulfillment state, simulated delivery state, inventory snapshots, and shipment arrival are visibly marked simulated.
- **Technical evidence:** `operations.json` (`PO-BACKUP-001`, `SHIP-BACKUP-001`, `SHIP-MAIN-001`, production records); `customers-orders.json` (five `delivered_simulated` records); `agent-activity.json` (`AUD-004`).
- **Potential failure and fallback:** If future execution is unavailable or fails, leave the action pending/failed/unknown as applicable. In this checkout, display the static record and state explicitly that no transaction ran.

### Step 9 — Inspect governance and audit

- **Presenter action:** Follow one recommendation, approval, simulated communication, receipt, and closure through the synthetic audit events. Describe pause/stop and kill-switch requirements without invoking an unimplemented control.
- **Screen/page:** Risk, Compliance & Audit; AI Command Centre.
- **What to explain:** Audit events identify synthetic actors, action references, timestamps, state, and correlation. Audit persistence/immutability is a requirement, not a verified implementation. The fixture does not demonstrate a working pause or global kill switch; emergency-control authority and resume policy are pending.
- **Expected visible result:** Recommendation, approval, simulation, verification, and closure are separate entries. No false “halt confirmed” state is displayed.
- **Technical evidence:** `agent-activity.json` `auditEvents` (`AUD-001`–`AUD-006`); `docs/07_SECURITY_AND_AUDIT.md`; `docs/diagrams/agent-workflow.md`.
- **Potential failure and fallback:** If audit evidence is missing, identify the gap and do not claim complete traceability. Do not test a production kill switch during a presentation.

### Step 10 — Explain recovery and closure

- **Presenter action:** Show the scenario's final recovery state and closure evidence, then distinguish scenario completion from real operational recovery.
- **Screen/page:** Executive Dashboard; Resilience & Impact Analytics; incident history.
- **What to explain:** The synthetic record closes on 2026-11-02 after simulated backup/main receipts, production records, and customer delivery records. In a real implementation, closure requires human review of verified supply, production, delivery, outstanding actions, and residual risks; delayed-shipment arrival alone is insufficient.
- **Expected visible result:** The final closed state is visibly synthetic; the evidence references and remaining limitations are inspectable. The 250,000-tablet estimate remains an exposure estimate, not a shortage or patient outcome.
- **Technical evidence:** `incidents-recovery.json` closure fields and `EVD-BACKUP-RECEIPT`/`EVD-MAIN-RECEIPT`; `agent-activity.json` (`AUD-006`); `docs/USER_JOURNEYS.md` UJ-10.
- **Potential failure and fallback:** If current recovery evidence is stale or incomplete in a future build, keep the incident open or qualified and escalate. Never infer closure from a single shipment event.

## 4. Likely judge questions

| Question | Accurate concise answer |
|---|---|
| How are agents connected? | The documented target has CAP submit a bounded task to a central orchestrator, which delegates to proposed specialist roles through scoped backend tools. No runtime or protocol is implemented yet. |
| Why multiple agents? | The proposed roles divide evidence work across disruption, supplier/compliance, inventory/manufacturing, logistics, and customer communications. This is a design choice pending approval, not a measured advantage in production. |
| How does the orchestrator work? | CAP supplies authorization scope and tool allowlists; the orchestrator delegates only relevant tasks, preserves evidence and disagreement, and returns structured outcomes. CAP owns persistence, authorization, approval, and execution. |
| How do agents access enterprise data? | The design permits only CAP-controlled, task-scoped tools. Agents should not receive direct HANA, browser, or external-provider credentials. No enterprise data connection is verified. |
| How do you prevent hallucinations? | The design uses deterministic calculation/authorization, evidence references, schema and business validation, explicit unknown/stale states, and human review. These controls are requirements; they are not yet implemented or tested end to end. |
| How are approvals enforced? | CAP is intended to recheck actor, category, evidence, current proposal version, and human approval before a side effect. The Supply Chain Head is final approver for all eight protected categories. The enforcement path is documented, not implemented. |
| Can an agent make a purchase independently? | No. An agent may prepare a proposal only. A human must approve the current proposal version; a separate authorized CAP path would be required for execution. No purchasing integration exists. |
| How is patient impact estimated? | This fixture estimates 250,000 tablets of potential customer availability exposure from 10 planning days × 25,000 synthetic tablets/day. It is neither a patient count nor a prediction of outcomes. The production-day/calendar-day basis still needs a decision. |
| How is the backup supplier validated? | Six checks are represented separately: quality, regulatory, quantity, capacity, supplier confirmation, and delivery. The fixture shows synthetic passes and a simulated receipt; it does not qualify a real supplier. |
| What happens when agents disagree or fail? | The design preserves conflicting evidence and returns partial/failed states for human review; it does not silently average claims or continue a dependent protected action. This behaviour still needs executable tests. |
| How is sensitive business data protected? | Intended controls include CAP-side authorization, least privilege, minimized/redacted model context, server-side secrets, and scoped audit access. Identity, encryption, retention, and audit mechanisms remain pending implementation decisions. |
| How are duplicate transactions prevented? | Proposed API contracts use idempotency keys, version checks, and reconciliation of unknown outcomes. These are not deployed controls today. |
| What is integrated with SAP? | No SAP service connection is verified in this repository. SAPUI5, CAP/Node.js, HANA Cloud, AI Core/Generative AI Hub, Build Process Automation, BTP Cloud Foundry, and Work Zone are the selected/planned baseline. |
| Which components are simulated? | The organizations, supplier/customer data, inventory, orders, risks, agent execution summaries, calls, email, receipts, and delivery/closure outcomes in `data/synthetic/` are fictional or simulated. The fixture is not a live SAP or external-system integration. |
| How does the system scale? | No implementation or load testing exists, so no scale claim is supportable. Pagination, measured indexes, bounded task scope, and service sizing are future engineering work. |
| What happens if AI fails? | The target design reports failure or partial results and blocks dependent protected actions. No running AI service is present to demonstrate an outage. |
| How do you measure business impact? | The fixture contains scenario calculations, not validated business KPIs. Future measures need baselines, definitions, and representative evidence before claims are made. |
| What is the business model and target customer? | The documented use case is pharmaceutical manufacturers and supply-chain teams; a commercial model, market validation, pricing, and launch strategy have not been decided. |

## 5. Fallback plan

1. **No application build:** Present this as a design/data walkthrough. Use the static fixture, schema, API proposal, and architecture diagrams. State plainly that the application is not runnable from this repository.
2. **AI/orchestrator unavailable:** Show the static `agent-activity.json` record and explain that it is simulated; do not portray it as a live model response.
3. **Database/network unavailable:** The committed JSON fixtures are the offline fallback. Read-only static files do not demonstrate database persistence.
4. **Voice/email unavailable:** Use the existing simulated call/email records or a clearly labelled mock. Do not connect real recipient accounts, call a person, or send an email.
5. **No screenshot/recording:** No screenshots or recording are committed. If needed, prepare a recording only from a real identified build and label its build, data mode, and capture date.
6. **Dataset cannot be loaded:** Stop the interactive demonstration, use the reviewed static JSON/diagram, and do not manually improvise values. Recheck the 30/20/10 inputs and source labels.
7. **Potential side effect:** Stop the demo if it reaches any real external endpoint or production tenant. Do not proceed until isolation and human authorization are verified.

**Current readiness:** Documentation and static-fixture walkthrough are prepared; an interactive judge demo remains blocked on application implementation and a verified isolated environment.
