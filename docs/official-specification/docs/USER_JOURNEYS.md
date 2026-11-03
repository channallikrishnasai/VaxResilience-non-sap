# User Journeys — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 2 — Product Requirements and User Experience
**Status:** Intended workflows; this document does not assert that the application or integrations are implemented.
**Related documents:** [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [Roles and access](USER_ROLES_AND_ACCESS.md) · [Dashboard and UI specification](DASHBOARD_AND_UI_SPECIFICATION.md)

## Journey conventions

All records and scenario values below are synthetic demonstration data. “System” means intended VaxResilience behaviour. AI recommendations do not authorize actions. The Supply Chain Head has final approval authority for the eight protected categories described in [Functional Requirements](03_FUNCTIONAL_REQUIREMENTS.md#3-product-wide-rules-and-scenario-assumptions). A voice response, recommendation, verification flag, or approval of a different proposal version is not a substitute for required current human approval.

## UJ-01 — Normal Operations Monitoring

- **Primary user:** Supply Chain Head.
- **Supporting roles:** Procurement Manager, Factory Manager, Warehouse Manager, Logistics Manager, Customer / Export Manager, Compliance / Auditor.
- **Trigger:** Start of a review or a user signing in to inspect operations.
- **Preconditions:** Individual account and role are configured; permitted synthetic operational data is available. Authentication implementation remains for later design.
- **Related requirements:** FR-ED-001–004, FR-IM-001–002, FR-DT-001, FR-CO-001, FR-AI-001, FR-AP-001.
- **Relevant pages:** Executive Dashboard; Inventory & Manufacturing; Digital Twin; Customers & Orders; AI Command Centre; Risk, Compliance & Audit; Approvals & Decisions.

### Steps

1. The Supply Chain Head signs in with an individual account. The system establishes the user's role and only permitted scope.
2. The user opens Executive Dashboard. The system presents incident status or an explicit no-active-incident state, with source and freshness.
3. The user opens Inventory & Manufacturing. The system shows available stock, coverage calculation inputs, and production status; stale, synthetic, or missing values are labelled.
4. The user reviews shipment visibility through the Digital Twin or shipment detail. The system shows route/status source and last update, or reports that tracking data is unavailable.
5. The user opens Customers & Orders. The system shows order status and risk only where data exists; it does not fill scenario placeholders with invented quantities or dates.
6. The user reviews AI Command Centre activity. The system shows task, state, time, explanation, and evidence references without exposing private chain-of-thought.
7. The user reviews Risk, Compliance & Audit for active warnings, missing verification, or suspicious activity flags.
8. The user checks pending approvals. Each pending decision links to its current proposal and evidence; the user reviews or leaves it pending.

- **System response:** Cross-page data is connected to its source, incident, and freshness. A missing integration does not appear as a successful live connection.
- **AI involvement:** AI may analyze permitted data and prepare a summary; no action is taken from the dashboard.
- **Approval gates:** No new protected action is executed. Any decision opened remains subject to its normal gate.
- **Expected outcome:** The Supply Chain Head understands the current operating picture and knows what is verified, estimated, stale, and awaiting action.
- **Failure/exception path:** If a source is unavailable, the system shows its failure/staleness and affected views; conflicting records are flagged. The user escalates rather than relying on an unsupported value.
- **Acceptance criteria:** From the dashboard, the user can reach inventory, shipment, order, agent, risk, and approval details; restricted data stays hidden; estimates and source freshness remain visible after navigation.

## UJ-02 — Chinese Supplier Disruption Detection

- **Primary user:** Supply Chain Head.
- **Supporting roles:** Procurement Manager, Logistics Manager, Factory Manager.
- **Trigger:** A delay notification is entered or the synthetic demonstration disruption is triggered.
- **Preconditions:** Synthetic Paracetamol API scenario exists; source/notification is identified as synthetic or unverified as applicable.
- **Related requirements:** FR-ED-001–003, FR-DT-001–002, FR-AI-001–002, FR-IM-001–002, FR-RA-001.
- **Relevant pages:** Executive Dashboard; Digital Twin; Inventory & Manufacturing; AI Command Centre; Resilience & Impact Analytics.

### Steps

1. The system displays a disruption alert and identifies the triggering source and timestamp.
2. The Supply Chain Head opens incident details and checks the product, affected supplier, and reported delay.
3. The system presents the reported 30-day shipment delay and marks its source/verification state.
4. The user reviews inventory. The system shows 20 days of API coverage with the calculation basis and freshness if available.
5. The system calculates `30 days delay − 20 days coverage = 10 days potential supply gap`; it labels the result potential and based on synthetic assumptions.
6. The user reviews affected product and manufacturing exposure. The system distinguishes possible exposure after day 20 from confirmed production impact.
7. The user opens Digital Twin and inspects the route from the Suzhou/Shanghai region through Shanghai Port and Nhava Sheva Port to Hyderabad.
8. AI prepares an impact analysis with evidence, assumptions, and uncertainty.
9. The system notifies relevant managers according to configured permissions and notification design; channel and thresholds remain pending.

- **System response:** The incident is visible across related pages, with consistent delay, coverage, and gap values and visible source/estimate labels.
- **AI involvement:** AI correlates the available route, inventory, and production records and presents an explanation; it does not state actual shortage or patient outcome.
- **Approval gates:** This journey is analysis only; any later recovery action must enter its action-specific approval workflow.
- **Expected outcome:** The organization understands the disruption and its potential consequences.
- **Failure/exception path:** If delay, coverage, or route inputs are unavailable or conflicting, the system presents the limitation and does not calculate a misleading gap; users request verification.
- **Acceptance criteria:** The 30/20/10 scenario is consistent across views; the 10-day gap is not labelled confirmed; synthetic values and estimates are explicitly disclosed.

## UJ-03 — Alternative Supplier Evaluation

- **Primary user:** Procurement Manager.
- **Supporting roles:** Compliance / Auditor, Supply Chain Head, Logistics Manager, Factory Manager.
- **Trigger:** Potential local supplier identified as a recovery option.
- **Preconditions:** Fictional Hyderabad supplier is represented only as a candidate; reported 10 production days are unverified.
- **Related requirements:** FR-DT-004, FR-AI-002, FR-IM-004, FR-RC-001, FR-RC-004, FR-AP-001–002.
- **Relevant pages:** Inventory & Manufacturing; Digital Twin; Risk, Compliance & Audit; AI Command Centre; Approvals & Decisions.

### Steps

1. The Procurement Manager opens the supplier candidate and confirms that the organization and reported stock are synthetic demonstration records.
2. The user reviews supplier details and the reported availability of 10 production days. The system labels this as reported, not confirmed or secured.
3. Procurement requests or records quality evidence, including relevant specifications and Certificate of Analysis review status.
4. Compliance / Auditor reviews regulatory eligibility and required supporting evidence.
5. Procurement verifies actual quantity, reserved versus available stock, supplier capacity, and commercial confirmation through approved processes.
6. The Logistics Manager reviews delivery feasibility and timing; the Factory Manager may verify material fit or manufacturing constraints.
7. The system records each verification dimension separately as incomplete, failed, or verified, with evidence and responsible reviewer.
8. AI compares available evidence and prepares a recommendation, including unresolved checks and uncertainty.
9. Procurement prepares a purchase proposal only when suitable evidence is available and routes it to the Supply Chain Head.

- **System response:** Incomplete or failed checks remain visible; reported stock is not counted as confirmed coverage. The proposal is tied to the exact evidence and version reviewed.
- **AI involvement:** AI may organize evidence and recommend next checks or options; it cannot qualify the supplier, make a purchase commitment, or approve itself.
- **Approval gates:** Alternative supplier purchase and adding/changing approved supplier require Supply Chain Head final approval. Supplier verification does not substitute for purchase approval.
- **Expected outcome:** A properly evidenced purchase recommendation is prepared, but purchasing does not occur without approval.
- **Failure/exception path:** Missing, expired, failed, or contradictory evidence blocks a “verified” status and proposal execution. Escalate unresolved supplier/compliance questions.
- **Acceptance criteria:** All six checks (quality, regulatory, quantity, capacity, supplier confirmation, delivery feasibility) are represented; the 10 days remain unconfirmed until checked; no order is placed before approval.

## UJ-04 — Inventory and Production Recovery

- **Primary users:** Warehouse Manager and Factory Manager.
- **Supporting role:** Supply Chain Head.
- **Trigger:** Inventory coverage is insufficient to cover the full delay without a recovery plan.
- **Preconditions:** Stock, consumption, and production information is available or its missing state is explicit.
- **Related requirements:** FR-IM-001–005, FR-AP-001–004, FR-AI-005, FR-RA-001.
- **Relevant pages:** Inventory & Manufacturing; Approvals & Decisions; AI Command Centre; Digital Twin; Analytics.

### Steps

1. Warehouse Manager reviews inventory by location and verifies the available quantity and coverage basis.
2. The system identifies the possible supply gap, data freshness, and any discrepancies.
3. Warehouse Manager prepares an allocation proposal, if needed, recording quantity, location, rationale, and affected records.
4. Factory Manager reviews material requirements, capacity, and production exposure.
5. Factory Manager prepares a revised production recommendation, if operationally justified.
6. If a warehouse-to-warehouse transfer is proposed, the system records a separate transfer proposal with source and destination; it is not executed.
7. AI may compare proposals against available evidence and show uncertainty; final customer allocation policy remains pending.
8. The Supply Chain Head reviews each protected action and approves, rejects, modifies where permitted, or escalates it.
9. After approval, an explicitly authorized execution process may apply only the approved version and record result; if execution is not implemented, the system retains an approved/not-executed state.
10. The system updates inventory/manufacturing views only from confirmed execution or verified source data.

- **System response:** Proposed and executed states remain distinct; approvals link to versions; failure to execute is visible.
- **AI involvement:** AI supports exposure analysis and proposal preparation only.
- **Approval gates:** Inventory transfers, production schedule changes, and customer-order reallocations each require Supply Chain Head approval.
- **Expected outcome:** An approved recovery plan is reflected in the system only when execution or source updates are confirmed.
- **Failure/exception path:** Invalid stock, contradictory counts, infeasible capacity, missing approval, or execution failure blocks the affected action and triggers human review.
- **Acceptance criteria:** No movement, schedule change, or allocation occurs before approval; execution status is not inferred from approval alone; changed proposals re-enter review.

## UJ-05 — Customer and Order Impact Assessment

- **Primary user:** Customer / Export Manager.
- **Supporting roles:** Supply Chain Head, Warehouse Manager.
- **Trigger:** Supply disruption may affect customer orders.
- **Preconditions:** Customer/order records are synthetic; availability of quantities and dates is explicit.
- **Related requirements:** FR-CO-001–003, FR-RA-002, FR-IM-001, FR-AP-001–002.
- **Relevant pages:** Customers & Orders; Inventory & Manufacturing; Analytics; Approvals & Decisions.

### Steps

1. The Customer / Export Manager opens affected orders and confirms product, quantity, required delivery date, and fulfilment status where available.
2. The system lists Hospital A (Hyderabad), Hospital B (Bengaluru), Medical Distributor (Mumbai), Export Importer A (Nairobi), and Export Importer B (London) as fictional customers.
3. The manager checks available inventory and source freshness with the Warehouse Manager.
4. The manager reviews healthcare urgency and other order context only where supported by verified scenario data.
5. AI prepares an estimated medicine-availability impact summary with assumptions and uncertainty; it does not claim actual patient outcomes.
6. The manager examines potential fulfilment adjustments, with healthcare-first balanced allocation shown only as a **proposed provisional approach**.
7. The manager prepares a fulfilment proposal and routes it to the Supply Chain Head.
8. The Supply Chain Head reviews the proposal and approves, rejects, modifies where allowed, or escalates it.

- **System response:** The order list distinguishes recorded facts from estimated risk and does not invent missing order values.
- **AI involvement:** AI can summarize impact and compare scenarios; it cannot choose the final allocation.
- **Approval gates:** Prioritizing or reallocating customer orders requires Supply Chain Head approval.
- **Expected outcome:** Managers understand which orders may be affected and can review a proposed fulfilment plan.
- **Failure/exception path:** Missing order dates, quantities, demand, or availability are displayed as unavailable; the allocation policy cannot be treated as approved.
- **Acceptance criteria:** Five customers are identified as fictional; estimates are labelled; allocation remains proposed pending decision and approval; no order changes before approval.

## UJ-06 — Human Approval of Recovery Plan

- **Primary user:** Supply Chain Head.
- **Supporting roles:** Procurement Manager, Factory Manager, Warehouse Manager, Logistics Manager, Customer / Export Manager, Compliance / Auditor.
- **Trigger:** AI or operational managers submit one or more recovery proposals.
- **Preconditions:** Proposals have unique current versions; evidence, assumptions, and verification state are attached where available.
- **Related requirements:** FR-AI-002, FR-AI-005, FR-AP-001–004, FR-RC-003.
- **Relevant pages:** AI Command Centre; Approvals & Decisions; supporting module pages; Risk, Compliance & Audit.

### Steps

1. The Supply Chain Head opens the recovery plan and sees each action separated by category and proposal version.
2. The system shows proposed actions, source evidence, supporting calculations, data freshness, risk, expected impact, and uncertainty.
3. The Supply Chain Head checks backup supplier verification status; unverified stock is not presented as secured supply.
4. Relevant managers provide operational reviews for procurement, production, inventory, routes, or customer impact; these reviews do not replace final approval.
5. The Supply Chain Head reviews each action against its own protected-action category, rather than approving an ambiguous bundle.
6. For each proposal, the Supply Chain Head approves, rejects, modifies where permitted, or escalates it. The system records identity, time, rationale, and exact version.
7. A modified proposal receives a new version and returns for review before any execution.
8. An approved proposal can proceed to execution only if the execution capability is explicitly enabled, permissioned, and the approval remains current.
9. The system records execution separately from approval, including success/failure and resulting record.
10. Compliance / Auditor can inspect the resulting audit history.

- **System response:** The queue identifies eight protected categories; expired or changed proposals are blocked from execution and re-presented.
- **AI involvement:** AI may explain evidence and compare outcomes but cannot approve, modify an approved action silently, or self-execute.
- **Approval gates:** Supply Chain Head remains final human authority for all eight categories; protected external communications require approval too.
- **Expected outcome:** Important decisions remain under authorized human control and their execution is traceable.
- **Failure/exception path:** Missing evidence, unresolved verification, stale proposal version, authorization failure, or execution error prevents/halts the affected action and triggers escalation.
- **Acceptance criteria:** Each decision has an auditable record and proposal version; modifications require re-review; rejected/escalated actions do not execute; all eight categories enforce the gate.

## UJ-07 — Two-Way AI Voice Coordination

- **Primary user:** Supply Chain Head or relevant operational manager.
- **Supporting roles:** Internal stakeholder(s): Supply Chain Head, Procurement Manager, Factory Manager, Logistics Manager.
- **Trigger:** A human-authorized workflow needs missing operational information.
- **Preconditions:** Stakeholder identity and contact method are authorized; appropriate consent and provider/legal requirements are met. Voice provider is undecided.
- **Related requirements:** FR-CM-001, FR-AI-001, FR-RC-003.
- **Relevant pages:** AI Command Centre; related Inventory & Manufacturing, Digital Twin, Risk/Compliance, or Audit records.

### Steps

1. An authorized user reviews the call purpose and selects or confirms the internal stakeholder.
2. The system identifies the AI and initiates a call only through a future approved provider and consent flow.
3. AI asks relevant questions about stock, capacity, or shipment status, using available context without disclosing unauthorized data.
4. The stakeholder responds; AI captures the response and asks a relevant follow-up when information is incomplete.
5. AI summarizes the call and identifies statements that require evidence or verification.
6. The human user reviews the summary and accepts, corrects, or escalates it according to the eventual workflow.
7. Only verified information updates an authoritative operational record; verbal information stays marked unverified until verification.
8. The system records permitted call metadata/summary and links it to the incident with appropriate access controls.

- **System response:** Call state, summary, verification state, and any failure are visible; voice consent and retention rules are respected.
- **AI involvement:** AI asks questions, captures responses, prepares a summary, and flags uncertainty.
- **Approval gates:** The call does not authorize a protected business action; any action derived from information follows the usual approval gate.
- **Expected outcome:** Missing internal information is gathered while preserving its verification status and audit context.
- **Failure/exception path:** No consent, wrong contact, unavailable service, call drop, ambiguous answer, or conflicting information is surfaced; the system does not mark the data confirmed.
- **Acceptance criteria:** AI identifies itself; user can end the call; verbal data remains unverified until checked; a summary and failure/verification state are available for permitted audit.

## UJ-08 — Approved Email Communication

- **Primary user:** Relevant manager, usually Customer / Export Manager or Procurement Manager.
- **Supporting roles:** Supply Chain Head; recipient may be a supplier or customer.
- **Trigger:** A supplier/customer communication is needed for incident coordination.
- **Preconditions:** Recipient and permitted facts are verified; email provider and sending configuration are established later.
- **Related requirements:** FR-CM-002, FR-CO-003, FR-AP-001–003, FR-RC-003.
- **Relevant pages:** Customers & Orders or supplier record; AI Command Centre; Approvals & Decisions; Audit.

### Steps

1. The manager opens the relevant business record and retrieves only information available to their role.
2. AI prepares an email draft using verified facts and clearly identified assumptions.
3. The manager selects/confirms the recipient and reviews all content, including dates, quantities, prices, terms, and commitments.
4. The manager edits or rejects the draft if any content is inaccurate or unsupported.
5. The draft is submitted for the applicable human approval. A major disruption notification to customers is routed to the Supply Chain Head as final approver.
6. The human approver reviews and approves, rejects, or requests changes. A changed draft is reviewed again.
7. The system sends only after approval and reports sent/failed status when the provider supplies that result.
8. The system records draft, approval, final content/version, recipient, time, delivery status where available, and audit reference.

- **System response:** Draft, awaiting approval, approved, sent, and failed states are distinct.
- **AI involvement:** AI drafts and may flag unsupported claims; it never sends without required human approval.
- **Approval gates:** Human review is required for AI-drafted email sending. Major disruption customer communications require Supply Chain Head approval. Other detailed approval boundaries remain pending.
- **Expected outcome:** The communication is accurate, approved, sent through an authorized service, and auditable.
- **Failure/exception path:** Unsupported delivery dates/quantities, financial commitments, missing recipient verification, rejection, provider failure, or changed content blocks sending or marks it failed.
- **Acceptance criteria:** No send occurs before approval; no invented delivery date, quantity, guarantee, or financial commitment appears; final content and outcome are traceable.

## UJ-09 — Compliance and Suspicious Activity Investigation

- **Primary user:** Compliance / Auditor.
- **Supporting roles:** Procurement Manager, Supply Chain Head, relevant transaction owner.
- **Trigger:** An alert flags a suspicious invoice, bank-account change, duplicate purchase order, unusual pricing, inventory manipulation, or supplier change.
- **Preconditions:** Alert source and supporting data are identified; the system has not concluded that fraud occurred.
- **Related requirements:** FR-RC-001–004, FR-AP-002, FR-AI-001.
- **Relevant pages:** Risk, Compliance & Audit; relevant supplier/transaction details; Approvals & Decisions; AI Command Centre.

### Steps

1. Compliance / Auditor opens the alert and reads its neutral status and detection rationale.
2. The system identifies the affected transaction/record and links available supporting evidence with source and timestamp.
3. If an authorized workflow has placed the transaction on hold, the system displays the hold and its authority; otherwise, no hold is implied.
4. The auditor reviews supplier, invoice, bank detail, purchase order, pricing, or inventory evidence relevant to the alert.
5. The auditor requests verification from an appropriate role and records the request and response.
6. If evidence remains insufficient or conflicting, the auditor escalates to the Supply Chain Head and keeps the alert unresolved.
7. The investigation outcome and evidence are recorded, including an outcome that finds no issue or remains inconclusive.
8. The audit history is updated and linked to the alert and affected transaction.

- **System response:** Evidence, review state, hold state, and escalation remain distinct and traceable.
- **AI involvement:** AI may flag patterns and summarize evidence; it does not autonomously accuse a person or organization of fraud.
- **Approval gates:** Any resulting protected action, such as a supplier-status change or financial commitment, follows its mandatory approval gate.
- **Expected outcome:** Suspicious activity is reviewed and documented without an unsupported accusation.
- **Failure/exception path:** Missing evidence, inaccessible records, conflicting values, or inability to hold a transaction is surfaced and escalated; the system does not mark the investigation complete without an outcome.
- **Acceptance criteria:** All six required alert classes can be represented; each alert links evidence and status; language is non-accusatory; transaction hold authority is not inferred.

## UJ-10 — Incident Recovery and Closure

- **Primary user:** Supply Chain Head.
- **Supporting roles:** All relevant managers.
- **Trigger:** Approved recovery actions have been taken and the situation appears to be stabilizing.
- **Preconditions:** Current supplier, inventory, production, shipment, and customer data are available or limitations identified.
- **Related requirements:** FR-ED-002, FR-RA-001–003, FR-AP-004, FR-RC-003.
- **Relevant pages:** Executive Dashboard; Inventory & Manufacturing; Digital Twin; Customers & Orders; Resilience & Impact Analytics; Approvals & Decisions; Audit.

### Steps

1. Procurement confirms supplier status/commitment with evidence; reported stock is not treated as delivered supply.
2. Warehouse Manager verifies received/available inventory and updates or validates the operational record.
3. Factory Manager confirms production status and verifies any schedule changes against their approval and actual execution.
4. Logistics Manager verifies shipment status and arrival/delivery records from available sources.
5. Customer / Export Manager reviews customer delivery status and any remaining communications or commitments.
6. The system presents unresolved risks, stale data, outstanding approvals, and recovery metrics.
7. The Supply Chain Head reviews baseline and current measures, distinguishing estimated projections from observed/verified outcomes.
8. Relevant managers provide an incident review and lessons learned; AI may prepare a summary for human review.
9. The Supply Chain Head decides whether supply, manufacturing, and deliveries have returned to acceptable normal levels and records a closure decision.
10. The system records closure rationale, evidence, remaining risks, and audit history.

- **System response:** Recovery state changes only with supporting status/evidence; closure is a recorded human decision.
- **AI involvement:** AI may aggregate recovery evidence and propose a closure summary; it cannot declare the incident resolved autonomously.
- **Approval gates:** Any remaining protected operational action still requires its own approval; incident closure does not authorize actions.
- **Expected outcome:** Incident closure reflects stabilized supply, manufacturing, and deliveries, not merely arrival of the delayed shipment.
- **Failure/exception path:** Missing or stale evidence, outstanding critical risks, continued production/delivery disruption, or unresolved protected decisions prevents or delays closure; reasons are shown.
- **Acceptance criteria:** Shipment arrival alone is insufficient for closure; the final decision is human-recorded; before/after metrics show baseline, assumptions, and verified state separately.

## UJ-11 — Agent Failure and Emergency Intervention

- **Primary user:** Supply Chain Head.
- **Supporting roles:** Relevant operational managers; Compliance / Auditor may review audit evidence.
- **Trigger:** An agent fails, behaves unexpectedly, encounters inconsistent data, or raises an anomaly.
- **Preconditions:** Agent monitoring is available; exact emergency permissions and resumption authority are pending design.
- **Related requirements:** FR-AI-001, FR-AI-003–005, FR-RC-003, NFR-REL-001.
- **Relevant pages:** AI Command Centre; Approvals & Decisions; Risk, Compliance & Audit; relevant operational pages.

### Steps

1. The system detects or receives an agent error/anomaly and changes its visible task/agent status.
2. It alerts an authorized manager with failure detail, affected task, related data, and any pending proposals/actions.
3. The Supply Chain Head inspects the event and determines whether to request an individual agent pause/stop, if authorized.
4. If the event warrants broader intervention, an authorized person may invoke the global kill switch only after confirming the action; access permissions are pending policy design.
5. The user verifies pending proposals and system state. Unapproved or uncertain actions remain blocked; the user may use manual operational processes outside the AI workflow as authorized by their organization.
6. The Supply Chain Head records or delegates a manual override within permissions that will be defined later; the system records the human action and resulting state.
7. Relevant managers validate affected source data and report discrepancies or required corrections.
8. Compliance / Auditor reviews the resulting audit trail where authorized.
9. The system remains paused until the authorized resumption decision and required verification are complete; the permitted resumer and checks must be defined by later design.
10. After verification, an authorized person resumes only the approved scope; the system records time, actor, scope, and outstanding risks.

- **System response:** Failure is explicit; the system does not continue to show a failed action as successful or silently retry a protected action.
- **AI involvement:** AI may report its failure and evidence; it cannot clear its own incident, override the kill switch, or authorize resumption.
- **Approval gates:** Any pending protected action remains subject to its human approval; pause/stop/override/resume access follows a still-pending emergency permission policy.
- **Expected outcome:** Agent activity is safely halted as needed, actions/data are verified, and any resumption is controlled and audited.
- **Failure/exception path:** If pause/kill switch fails, the interface reports failure immediately and escalates for human intervention; no false halted/safe state is shown.
- **Acceptance criteria:** Agent status and error are visible; pause/stop and global control outcomes are recorded; uncertain actions do not execute; resumption requires verification and authorized human action.

## Cross-journey acceptance

- All seven roles use the exact established role names in [USER_ROLES_AND_ACCESS.md](USER_ROLES_AND_ACCESS.md).
- Each of the eight modules in [DASHBOARD_AND_UI_SPECIFICATION.md](DASHBOARD_AND_UI_SPECIFICATION.md) participates in at least one journey.
- All eight protected action categories remain subject to Supply Chain Head final approval; agents never approve or execute without authorization.
- The scenario consistently uses a 30-day delay, 20-day coverage, and 10-day **potential** gap.
- Backup supplier reported stock remains subject to quality, regulatory, quantity, capacity, supplier confirmation, and delivery feasibility checks.
- Customer-allocation policy remains provisional; voice responses remain unverified until corroborated; email sends require human approval.
- All customer/supplier/operational records and patient-impact estimates in this scenario remain synthetic; estimates are not actual patient outcomes.
