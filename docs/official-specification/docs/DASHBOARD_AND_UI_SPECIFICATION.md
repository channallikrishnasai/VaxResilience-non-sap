# Dashboard and UI Specification — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 2 — Product Requirements and User Experience
**Status:** Intended application structure and interactions; the application is not claimed to be implemented.
**Related documents:** [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [Roles and access](USER_ROLES_AND_ACCESS.md) · [User journeys](USER_JOURNEYS.md)

## 1. Design philosophy

VaxResilience is an enterprise pharmaceutical supply-chain control tower with AI Command Centre capabilities, not a generic chatbot. The UI should communicate operational clarity, reliable source/freshness information, AI transparency, human control, risk awareness, and recovery progress.

Define content, information hierarchy, and behaviour before visual styling. Do not prescribe an unapproved colour palette, design system, pixel geometry, map provider, chart library, or live-data capability. A status must never rely on color alone. Synthetic, simulated, estimated, verified, unverified, and stale data must be distinguishable in labels and text.

## 2. Global application shell

### Sidebar

Show the eight established primary modules, in this order:

1. Executive Dashboard
2. Supply Chain Digital Twin
3. AI Command Centre
4. Inventory & Manufacturing
5. Customers & Orders
6. Approvals & Decisions
7. Risk, Compliance & Audit
8. Resilience & Impact Analytics

The active module is visibly identified. Role-based visibility may hide modules only according to a confirmed access policy; hidden navigation is not a substitute for authorization checks. Collapsible sidebar behaviour is an optional UI recommendation, not a confirmed product requirement.

### Top navigation

Include application identity, global search, notification access, current incident indicator, user profile, and the user's role. Search and notification results must respect access permissions. The incident indicator links to the active incident context; if no incident is active, show an explicit no-active-incident state.

### Shared interface elements

**Required:** page title; clear navigation; source/freshness and incident status where relevant; approval state; filters/search on record lists; clear loading, empty, warning, failed, and stale states; confirmation for consequential controls; and explicit simulated/estimated labels.

**Recommended, subject to usability testing:** breadcrumbs for deep records, saved filters, keyboard shortcuts, collapsible sidebar, and user-selectable table density. These recommendations do not change permissions or business policy.

### Role-aware experience

The landing page and emphasis may vary by role, while using consistent underlying incident facts. The role and access matrix is in [USER_ROLES_AND_ACCESS.md](USER_ROLES_AND_ACCESS.md). Controls must be hidden or disabled according to confirmed authorization and independently protected by backend authorization. A visible recommendation never implies approval or permission to execute.

## 3. Page specifications

Each page below follows the same structure: purpose, users, questions, sections, panels, fields, visualizations, filters, actions, AI, approval, navigation, states, synthetic example, and acceptance criteria.

### Page 1 — Executive Dashboard

1. **Purpose:** Provide a role-aware overview of incident condition, operational exposure, decisions, and recovery.
2. **Primary users:** Supply Chain Head; all seven roles see authorized summaries.
3. **Questions answered:** What is disrupted? What is exposed? What is verified versus estimated? Which decisions need attention? Is recovery progressing?
4. **Key sections:** Incident banner; risk summary; inventory/manufacturing; shipment; customer orders; agent activity; pending approvals; estimated patient impact; recovery milestones.
5. **Cards/panels:** Incident identity/status; supply coverage and potential gap; affected shipment; production exposure; high-level customer exposure; agent status; approval count; recovery progress.
6. **Tables/fields:** Incident ID/name, product, source, reported delay, status, last update; inventory coverage and calculation inputs; order/customer risk summary; approval category/status/age where available; source/freshness.
7. **Charts/visualizations:** Optional exposure timeline or recovery progress visualization; every value has units and distinguishes actual/verified input from estimated result.
8. **Filters/search:** Incident, product, status, time period where available; dashboard filters must not widen user access.
9. **User actions:** Open affected route/inventory/order details; open approval queue; view agent activity; acknowledge an alert if acknowledgement is supported by approved workflow.
10. **AI-assisted interactions:** View recommendation summaries, evidence links, and uncertainty. No action is automatically approved.
11. **Human approval requirements:** Protected actions route to Approvals & Decisions. Dashboard cards never execute them.
12. **Navigation/related pages:** Digital Twin, Inventory & Manufacturing, Customers & Orders, AI Command Centre, Approvals & Decisions, Analytics.
13. **States:** Loading skeleton; no active incident; no data; stale source; partial-data warning; failed data-source indicator; simulated-data and estimate labels.
14. **Synthetic example:** Paracetamol API incident; 30-day reported delay, 20-day API coverage, 10-day potential gap. The separate Hyderabad supplier report of 10 production days is explicitly unverified until checks complete.
15. **Acceptance criteria:** A user can locate incident, affected route, coverage, pending decisions, and recovery links from one view; the 10-day value is labeled potential; patient impact is visibly an estimate from synthetic data; unavailable values are not fabricated.

### Page 2 — Supply Chain Digital Twin

1. **Purpose:** Explain network relationships and where a disruption may propagate.
2. **Primary users:** Supply Chain Head, Logistics Manager, Procurement Manager, and operational reviewers.
3. **Questions answered:** Which supplier, ports, facilities, warehouses, shipments, and customers are connected to the incident? What is disrupted or only proposed?
4. **Key sections:** Interactive geographic map; node/route legend; selected entity detail panel; related impact list.
5. **Cards/panels:** Supplier, port, facility, warehouse, customer, shipment and route details; node status; source/freshness; related incident and exposure links.
6. **Tables/fields:** Node/route name and type, location as available, status, affected product/shipment, last update, verification state, source, relationship.
7. **Charts/visualizations:** Geographic network map with connected routes and affected links; status also conveyed through text/icons/patterns, not color alone.
8. **Filters/search:** Entity type, product, incident, status, and text search; only permitted records appear.
9. **User actions:** Select a node or route to open a detail panel; navigate to shipment, inventory, supplier verification, customer, or related decision; propose but do not execute an alternative.
10. **AI-assisted interactions:** Display route impact and recommendation summary with source, assumptions, and uncertainty.
11. **Human approval requirements:** Changing route/carrier, purchasing from an alternative supplier, or changing supplier status must be handed to human approval.
12. **Navigation/related pages:** Inventory & Manufacturing, Customers & Orders, Risk, Compliance & Audit, Approvals & Decisions.
13. **States:** Map loading; no mapped records; missing coordinates; stale shipment position; unavailable map service; simulated route; candidate route under evaluation.
14. **Synthetic example:** Suzhou/Shanghai region → Shanghai Port → Nhava Sheva Port → Hyderabad facility. The local backup supplier is shown in Hyderabad as under evaluation, not approved. Five customer locations are fictional.
15. **Acceptance criteria:** Users can identify the disrupted route and connected downstream entities; selecting any displayed entity shows its matching record; missing geographic data is not invented; candidate routes cannot be executed from the map.

### Page 3 — AI Command Centre

1. **Purpose:** Provide operational oversight of AI agent activity and human hand-offs.
2. **Primary users:** Supply Chain Head and relevant operational managers; control access remains subject to pending permission decisions.
3. **Questions answered:** What is the agent doing? What did it conclude? What evidence supports it? Is it blocked, failed, or awaiting a person?
4. **Key sections:** Agent overview; activity timeline; task detail; recommendations; tool-call summaries; errors/escalations; control and approval hand-off area.
5. **Cards/panels:** Status, current task, decision explanation, evidence references, proposed action, risk/uncertainty, tool status, failure details, related approval.
6. **Tables/fields:** Agent identifier (final names pending), task, status, start/update time, tool/action summary, result, error, escalation, approval state.
7. **Charts/visualizations:** Timeline/status view; no chart should imply an unapproved action completed.
8. **Filters/search:** Incident, task status, time, agent (once defined), recommendation state.
9. **User actions:** Open supporting records; assign or escalate a human review if allowed; request individual pause/stop or global halt only if authorized; confirm consequential control requests.
10. **AI-assisted interactions:** Recommendations, concise reasoning/decision explanation, evidence citations, tool-call summaries. Do not expose private chain-of-thought.
11. **Human approval requirements:** Every protected proposal hands off to the approval workflow; the command centre must not provide a bypass execution button.
12. **Navigation/related pages:** Approvals & Decisions, Risk, Compliance & Audit, Digital Twin, Inventory & Manufacturing, Customers & Orders.
13. **States:** Idle, analyzing, preparing, awaiting human review, paused, stopped, failed, escalated, stale evidence, and simulated activity. Exact agent set is pending.
14. **Synthetic example:** Analysis identifies a potential 10-day gap based on 30-day delay and 20-day coverage and requests supplier verification; recommendation is not an approval.
15. **Acceptance criteria:** Each activity has status/time and an inspectable explanation/evidence reference; errors are explicit; pause/stop/halt outcomes are audited; controls are available only to authorized users; no private chain-of-thought is required.

### Page 4 — Inventory & Manufacturing

1. **Purpose:** Show material coverage and manufacturing exposure and support proposals for human review.
2. **Primary users:** Warehouse Manager and Factory Manager; Supply Chain Head reviews exposure.
3. **Questions answered:** What stock is available and where? How long may it cover production? What capacity or schedule is exposed? Which verification is incomplete?
4. **Key sections:** API/raw material inventory; coverage calculation; production capacity and schedule; exposure timeline; discrepancies; backup supplier verification.
5. **Cards/panels:** Stock quantity/unit/location; days of coverage; consumption assumptions; capacity; schedule status; production impact; discrepancy; supplier-check completion.
6. **Tables/fields:** Material/product, lot or identifier if available, quantity/unit, location, status, source/time, consumption rate, calculated coverage, schedule period, capacity, verification evidence and state.
7. **Charts/visualizations:** Coverage versus delay timeline; inventory by location; production schedule/capacity view. Inputs and estimates are distinguishable.
8. **Filters/search:** Product/material, facility/warehouse, stock status, date range, verification status.
9. **User actions:** Verify/report discrepancy; prepare allocation or transfer proposal; open supplier evidence; prepare a production schedule proposal.
10. **AI-assisted interactions:** Explain exposure and suggest options with assumptions; proposals do not change stock or schedule.
11. **Human approval requirements:** Warehouse transfer and factory schedule change require Supply Chain Head approval; all applicable protected actions stay pending until approved.
12. **Navigation/related pages:** Digital Twin, Approvals & Decisions, Risk, Compliance & Audit, Analytics.
13. **States:** Loading; no records; stale count; conflicting count; missing consumption basis; discrepancy; waiting for supplier verification; verified/failed check; simulated data.
14. **Synthetic example:** Paracetamol API coverage is 20 production days; 30-day delay creates a potential 10-day exposure. Backup supplier’s reported 10 production days do not count as confirmed coverage before quality, regulatory, quantity, capacity, supplier, and delivery checks.
15. **Acceptance criteria:** The coverage calculation shows inputs and source; proposals are distinguishable from executed changes; unverified supplier stock is never included as guaranteed supply; discrepancies warn affected views.

### Page 5 — Customers & Orders

1. **Purpose:** Help authorized users assess customer delivery exposure and prepare communication/fulfilment options.
2. **Primary users:** Customer / Export Manager; Supply Chain Head and Warehouse Manager support review.
3. **Questions answered:** Which orders may be affected? What dates/quantities are verified? What alternative fulfilment is proposed? Has communication been approved and sent?
4. **Key sections:** Customer list; order list/detail; risk and estimated impact; proposed fulfilment changes; communication history.
5. **Cards/panels:** Customer profile/type/location; open order exposure; delivery risk; inventory context; communication draft/status.
6. **Tables/fields:** Customer, customer type, location, order ID, product, quantity, required delivery date, fulfilment status, risk level, estimated impact, source/time, proposed change, communication state.
7. **Charts/visualizations:** Optional order risk distribution or delivery timeline, with estimates and synthetic status explicit.
8. **Filters/search:** Customer, location, customer type, order status, product, risk, date; results are permission-scoped.
9. **User actions:** Inspect order; prepare fulfilment proposal; prepare email draft; request review; open decision history.
10. **AI-assisted interactions:** Summarize potential order exposure, draft communications, compare fulfilment scenarios with assumptions.
11. **Human approval requirements:** Reallocating/prioritizing orders requires Supply Chain Head approval. AI-drafted email requires human approval before sending; major disruption notice requires final Supply Chain Head approval.
12. **Navigation/related pages:** Executive Dashboard, Inventory & Manufacturing, Approvals & Decisions, Audit, Analytics.
13. **States:** Loading; no matching orders; incomplete order data; stale fulfilment status; estimated impact; pending allocation policy; draft/awaiting approval/sent/failed email.
14. **Synthetic example:** Hospital A—Hyderabad; Hospital B—Bengaluru; Medical Distributor—Mumbai; Export Importer A—Nairobi; Export Importer B—London. The Phase 5 fixture contains one 100,000-tablet order per customer with a 2026-10-15 required date and simulated delivery; these are fictional fixture values, not recurring demand commitments.
15. **Acceptance criteria:** All five entities can be distinguished as fictional; missing scenario order details remain unavailable; proposals do not change allocation; healthcare-first balanced allocation is labelled provisional; messages cannot be sent before approval.

### Page 6 — Approvals & Decisions

1. **Purpose:** Provide the controlled human decision point and a history of proposed, approved, rejected, modified, and executed actions.
2. **Primary users:** Supply Chain Head as final approver; relevant managers provide evidence and operational review.
3. **Questions answered:** What is requested? Who proposed it? What evidence/risk applies? What would approval authorize? What happened after decision?
4. **Key sections:** Pending queue; decision detail; evidence and impact; review/modify/escalate controls; execution status; history.
5. **Cards/panels:** Action category; initiator; action summary; risk; expected impact; verification state; applicable final approver; deadline only if supplied.
6. **Tables/fields:** Decision ID/version, action category, initiator, proposed action, source/evidence, expected impact, risk, reviewer, approval status/time, optional deadline, execution state/result.
7. **Charts/visualizations:** Optional queue by status/category; no visualization may imply completion before execution is confirmed.
8. **Filters/search:** Incident, action category, status, requester, date, approval state.
9. **User actions:** Inspect evidence; approve/reject; modify where allowed; escalate; inspect execution and immutable history. Require confirmation and rationale where the eventual decision policy defines it.
10. **AI-assisted interactions:** AI may provide a recommendation, evidence summary, and impact analysis; no AI approval control.
11. **Human approval requirements:** The Supply Chain Head is final authority for all eight mandatory categories. A decision only authorizes the reviewed proposal version; changed proposals return for review.
12. **Navigation/related pages:** AI Command Centre, Inventory & Manufacturing, Customers & Orders, Risk, Compliance & Audit, Digital Twin.
13. **States:** Empty queue; pending; awaiting evidence; awaiting approval; rejected; modified/re-review; approved/not yet executed; executing; complete; failed; stale proposal.
14. **Synthetic example:** A proposal to buy from the Hyderabad backup supplier shows all verification dimensions and 10 reported production days as unconfirmed until evidence is accepted.
15. **Acceptance criteria:** All eight action categories visibly require human approval; no control executes an unapproved/stale proposal; rejection/modification/escalation does not execute; decision and execution are separate recorded states.

### Page 7 — Risk, Compliance & Audit

1. **Purpose:** Review supply risk, qualification evidence, suspicious-activity alerts, and the history supporting operational decisions.
2. **Primary users:** Compliance / Auditor and Supply Chain Head; relevant managers see scoped evidence.
3. **Questions answered:** What evidence is missing? What was flagged and why? Is a transaction held for verification? Who decided and acted?
4. **Key sections:** Risk alerts; supplier eligibility; quality/regulatory verification; suspicious activity queue; evidence list; audit and decision history.
5. **Cards/panels:** Risk severity and rationale; supplier-check status; alert evidence; transaction reference/state; decision actor/time/result.
6. **Tables/fields:** Alert ID/type, affected record, flag reason, evidence/source/time, verification status, reviewer, disposition; audit actor, action, result, timestamp, incident, decision link.
7. **Charts/visualizations:** Optional risk/alert counts by state; status is also textually identifiable.
8. **Filters/search:** Alert category/severity/status; supplier; incident; actor; action; date.
9. **User actions:** Review evidence; record verification/investigation outcome; escalate; inspect audit trail; place/maintain transaction hold only if authorized by a confirmed workflow.
10. **AI-assisted interactions:** Flag patterns and summarize evidence; AI does not determine guilt or make accusations.
11. **Human approval requirements:** Compliance review does not replace Supply Chain Head final approval for a protected action. Any high-impact corrective action follows its approval gate.
12. **Navigation/related pages:** Approvals & Decisions, Inventory & Manufacturing, Digital Twin, AI Command Centre.
13. **States:** No alerts; pending review; insufficient evidence; awaiting verification; held; escalated; closed with recorded outcome; data source unavailable.
14. **Synthetic example:** Supplier record or invoice/bank detail anomaly is labelled “flagged for verification”; it does not assert fraud.
15. **Acceptance criteria:** The six required suspicious-activity categories are filterable or clearly represented; each flag has evidence/status; language is non-accusatory; audit records cannot be edited by ordinary users.

### Page 8 — Resilience & Impact Analytics

1. **Purpose:** Show exposure, potential customer/patient availability impacts, and recovery progress with transparent assumptions.
2. **Primary users:** Supply Chain Head, Factory Manager, Warehouse Manager, Customer / Export Manager, and authorized reviewers.
3. **Questions answered:** How much coverage remains? What is the potential gap? Which operations/orders may be affected? Is an approved plan improving the situation?
4. **Key sections:** Coverage trends; supply-gap analysis; manufacturing exposure; order/delivery risk; estimated patient impact; recovery milestones; before/after comparison.
5. **Cards/panels:** Coverage, delay, potential gap, production exposure, customer risk, estimate caveat, recovery status, outstanding assumptions.
6. **Tables/fields:** Metric name/value/unit, input sources, calculation time, scenario assumptions, estimate/verification label, baseline and comparison state.
7. **Charts/visualizations:** Coverage and delay timeline; customer risk/fulfilment exposure; recovery milestone comparison. Include axes, units, labels, and uncertainty.
8. **Filters/search:** Incident, product, time window, location, scenario; only approved/available scenarios appear as such.
9. **User actions:** Inspect metric inputs; compare a proposal with baseline; navigate to its source records; export only if later approved by the product/data policy.
10. **AI-assisted interactions:** Explain calculations and scenario implications with cited inputs; do not present a scenario as an outcome.
11. **Human approval requirements:** Analytics are informational; any action based on a recommendation must pass the relevant approval workflow.
12. **Navigation/related pages:** Dashboard, Inventory & Manufacturing, Customers & Orders, Approvals & Decisions, Digital Twin.
13. **States:** Loading; insufficient history; missing inputs; stale data; estimate; synthetic data; proposed versus approved plan; recovery outcome unverified.
14. **Synthetic example:** 30-day delay, 20-day coverage, and 10-day potential gap; no real patient count or verified outcome is implied.
15. **Acceptance criteria:** Every derived metric exposes source assumptions and units; synthetic and estimated labels remain visible in charts and exports if exports are later approved; before/after views distinguish recommendation from observed result.

## 4. Notification and alert specification

Severity describes urgency of attention, not certainty of the underlying impact. A warning can concern a potential event and must say so. No notification itself authorizes action.

| Alert type | Severity | Expected user response |
|---|---|---|
| Critical disruption alert | Critical | Supply Chain Head reviews incident and coordinates relevant managers; open incident details and validate source. |
| High-risk warning | High | Relevant operational manager investigates exposure and records verification or escalation. |
| Pending approval notification | Action required | Supply Chain Head reviews the current proposal version and evidence. |
| Supplier verification alert | High or action required | Procurement Manager and Compliance / Auditor review missing/failed evidence; do not count unverified stock as coverage. |
| Shipment delay notification | High or warning based on stated impact | Logistics Manager validates tracking/source and updates the incident view. |
| Inventory shortage warning | High or critical based on verified exposure | Warehouse Manager/Factory Manager verify stock and production assumptions; Supply Chain Head reviews protected proposals. |
| Agent failure alert | Critical when operations are affected; otherwise warning | Authorized human reviews failure and uses pause/stop/emergency controls only if permitted. |
| Compliance alert | High or action required | Compliance / Auditor reviews evidence and escalates without making an accusation. |
| Recovery milestone notification | Informational | Relevant manager verifies milestone evidence; Supply Chain Head determines incident closure. |

Notification delivery channels, thresholds, deduplication rules, escalation timers, and numerical alert cutoffs are not defined in Phase 2. Do not invent a complex alert engine.

## 5. Shared UI states

| State | Required presentation |
|---|---|
| Loading | Identify the content loading; preserve the page context and avoid showing stale values as current. |
| Empty | Explain that no records match or exist; provide a relevant next step without implying an error. |
| Success | Confirm the specific persisted outcome and show its record/history link. |
| Warning | State the condition, uncertainty, and action needed. |
| Critical | Prominent text and accessible status; identify affected incident and human response path. |
| Failed | Explain what failed, what was not completed, and retry/escalation options; never show success-shaped fallback. |
| Pending approval | Clearly identify approver/action state; execution controls remain unavailable. |
| Awaiting verification | List missing evidence/checks and prevent unverified data from being counted as confirmed. |
| Simulated data | Visible label that the record/integration is synthetic or simulated. |
| Estimated result | Visible “estimate” label, assumptions/source, and a disclaimer that it is not an actual patient outcome. |
| Stale or conflicting data | Show source and last update; identify conflict and block unsupported conclusions. |

## 6. Cross-page interaction

The modules form a connected incident workflow, not isolated dashboards. From an Executive Dashboard disruption alert, the user should be able to inspect the affected Digital Twin route, follow links to inventory/manufacturing exposure, review affected customer orders and estimates, inspect AI evidence, and open the relevant approval record. Each step retains incident context and links back to source records.

Record detail pages should provide related-entity links where a relationship exists. A proposed action should link to the approval record; a decision should link back to its proposal and evidence; execution status should link to the resulting operational record. Access controls apply at every destination. No cross-page transition should bypass a protected-action approval gate.

## 7. Responsive and accessibility considerations

- Desktop-first use for dense operational work; tablet support is desirable where practical.
- Tables must have readable headings, clear units, useful row identification, and a practical narrow-screen alternative.
- Support keyboard navigation and visible focus; do not require pointer-only interaction.
- Use text or icons with color for status; use readable contrast, labels, and semantic structure.
- Provide clear control labels, confirmations for consequential actions, and accessible error descriptions.
- Do not claim formal accessibility certification in this specification.
