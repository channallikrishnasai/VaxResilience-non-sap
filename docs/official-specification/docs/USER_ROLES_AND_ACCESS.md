# User Roles and Access — VaxResilience

**Document version:** 1.0
**Project stage:** Phase 2 — Product Requirements and User Experience
**Status:** Role and permission specification; no authentication or authorization implementation is asserted.
**Related documents:** [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [Dashboard and UI specification](DASHBOARD_AND_UI_SPECIFICATION.md) · [User journeys](USER_JOURNEYS.md) · [Project overview](00_PROJECT_OVERVIEW.md)

## 1. Access-control overview

VaxResilience is intended to use individual user accounts with role-based access and a shared management overview. The shared overview supports cross-functional coordination; it does not imply unrestricted access to every record or action. Apply least privilege: users see the information and controls needed for their responsibilities, and server-side authorization must protect data and actions regardless of UI visibility.

The seven primary roles below are the only roles defined by this specification. The Supply Chain Head has final human approval authority for each of the eight protected action categories. Operational managers may prepare proposals, review evidence, and provide subject-matter verification; this does not grant them final authority. A user’s role does not itself establish approval authority for an action that has not been specified.

This document is a proposed baseline for implementation planning, not a finalized authorization policy. Any permission marked **Limited**, **Pending**, or **TBD** requires confirmation before authorization rules are implemented. The matrix does not prescribe an identity provider, authentication protocol, data schema, or organizational hierarchy.

### Permission values and abbreviations

| Code | Permission | Meaning |
|---|---|---|
| V | View | Read permitted module information; sensitive record scope can still be restricted. |
| C | Create | Create a permitted record or draft, not execute a business action. |
| E | Edit | Edit within the user's operational scope; protected action changes remain proposals until approval. |
| R | Recommend | Prepare or submit a recommendation/proposal, not approve it. |
| A | Approve | Final human approval only where explicitly granted. In this specification, `A-Final` belongs to the Supply Chain Head for the eight protected categories. |
| X | Execute | Perform an approved action only after the required approval and all required checks. `X-Approved` is not autonomous authority. |
| U | Audit | Review relevant decision and action history; does not confer edit, approval, or execution authority. |
| — | Not assigned | No permission is established here. This is not a permanent denial policy; confirm scope before granting access. |
| Limited | Limited scope | Role-relevant records only; exact record-level boundaries remain for later design. |
| Pending | Pending decision | Project governance has not established who may perform this permission. Do not infer access. |

`Own scope` and `Read-only` in the matrix further constrain access. Combined codes are permissions that may apply, subject to approval gates. A user may prepare an action (`C/E/R`) but cannot execute it merely because those permissions are present.

## 2. Role profiles

### 2.1 Supply Chain Head

- **Purpose and responsibilities:** Overall supply-chain supervision, disruption monitoring, recovery-plan review, final approval authority, AI monitoring, emergency intervention, and operational decision oversight.
- **Dashboard:** Shared incident overview, risk, inventory and production exposure, customer-order exposure, agent activity, pending decisions, estimated impact, and recovery status.
- **Modules:** Access to the shared management overview and decision, incident, and audit details required for oversight; access to sensitive underlying records remains subject to organization policy.
- **Read:** Cross-functional incident information needed to supervise response.
- **Create/update:** May record review notes and incident decisions; exact record-writing rights beyond approvals require confirmation.
- **Approval:** Final approval for all eight protected action categories.
- **Restricted actions:** No AI recommendation is approval. Global emergency/override permissions and permission to resume agents after a kill switch have pending detailed design.
- **Escalation:** Receives cross-functional escalations; escalates beyond the role through organizational governance, which is not specified here.

### 2.2 Procurement Manager

- **Purpose and responsibilities:** Supplier evaluation, procurement planning, alternative supplier assessment, purchase recommendations, supplier confirmation, procurement verification.
- **Dashboard:** Supplier and purchase-related incident signals, outstanding supplier checks, and relevant decisions.
- **Modules:** Supplier-related detail, AI recommendations, approvals queue for review, risk/compliance evidence, and relevant audit history.
- **Read:** Supplier records and evidence within procurement scope.
- **Create/update:** Prepare supplier assessments, availability requests, purchase proposals, and procurement verification records.
- **Approval:** Provides procurement review; has no final approval authority for the eight protected categories under this specification.
- **Restricted actions:** Cannot purchase from an alternative supplier, add/change an approved supplier, authorize financial commitments, or treat unverified stock as usable without required approval/checks.
- **Escalation:** Escalates supplier eligibility, price, capacity, or commitment uncertainty to the Supply Chain Head and Compliance / Auditor as appropriate.

### 2.3 Factory Manager

- **Purpose and responsibilities:** Manufacturing operations, production schedules/capacity, API/raw-material requirements, manufacturing recovery.
- **Dashboard:** Material coverage, production exposure, capacity, schedule risks, and relevant recovery proposals.
- **Modules:** Read and update permitted manufacturing records; review AI analysis and relevant approval/execution status.
- **Read:** Production and material information within operational scope.
- **Create/update:** Prepare production assessments and proposed schedule changes.
- **Approval:** Provides feasibility review; final approval for protected schedule changes remains with the Supply Chain Head.
- **Restricted actions:** Cannot implement an unapproved schedule change or authorize an unrelated purchase, transfer, or order reallocation.
- **Escalation:** Escalates capacity, quality, material, and schedule feasibility issues to the Supply Chain Head and relevant operational manager.

### 2.4 Warehouse Manager

- **Purpose and responsibilities:** Inventory monitoring, stock verification, warehouse operations, allocation proposals, transfer proposals, discrepancy reporting.
- **Dashboard:** Stock levels/coverage, discrepancy alerts, allocations or transfers awaiting review, and related supply exposure.
- **Modules:** Inventory & Manufacturing, relevant Digital Twin nodes, approval status, and scoped audit information.
- **Read:** Warehouse inventory and movement information in assigned scope.
- **Create/update:** Record verification/discrepancies and prepare allocation/transfer proposals.
- **Approval:** Supplies operational verification; no final approval for inter-warehouse transfers or customer order reallocation.
- **Restricted actions:** Cannot move stock between warehouses or implement reallocation without Supply Chain Head approval; cannot establish allocation policy.
- **Escalation:** Escalates discrepancies, unsafe stock assumptions, and capacity/availability issues.

### 2.5 Logistics Manager

- **Purpose and responsibilities:** Shipment tracking, logistics coordination, route assessment, carrier coordination, delivery monitoring and recovery.
- **Dashboard:** Shipment/route status, delay warnings, affected deliveries, and proposed logistics alternatives.
- **Modules:** Digital Twin, relevant customer delivery details, AI recommendations, approval status, and related audit information.
- **Read:** Shipment and route data within logistics scope.
- **Create/update:** Record tracking updates and prepare route/carrier proposals.
- **Approval:** Provides feasibility review; final approval for protected route/carrier changes remains with Supply Chain Head.
- **Restricted actions:** Cannot change a protected route or carrier without approval; no live carrier integration is assumed.
- **Escalation:** Escalates route, carrier, customs, timing, and data-quality concerns.

### 2.6 Customer / Export Manager

- **Purpose and responsibilities:** Customer orders, delivery coordination, communications, export order management, customer fulfilment visibility.
- **Dashboard:** Customer/order exposure, required delivery dates where available, message drafts/status, and relevant decisions.
- **Modules:** Customers & Orders, role-scoped dashboard, approval status, and relevant incident details.
- **Read:** Customer and order information within assigned scope.
- **Create/update:** Prepare order-risk assessments, proposed fulfilment changes, communication drafts, and communication history.
- **Approval:** Reviews and prepares communications. Major disruption notifications are protected and require Supply Chain Head final approval; all AI-drafted email sending requires human review/approval.
- **Restricted actions:** Cannot prioritize/reallocate orders or send a major disruption notification without approval. Cannot state an unverified delivery date or commitment.
- **Escalation:** Escalates uncertain customer impact, commitments, allocation conflicts, and approval requests.

### 2.7 Compliance / Auditor

- **Purpose and responsibilities:** Regulatory and quality verification, suspicious-activity monitoring, audit history, compliance evidence, transaction review.
- **Dashboard:** Verification gaps, alerts, held transactions, evidence, and audit activity in authorized scope.
- **Modules:** Risk, Compliance & Audit; supplier evidence; relevant decision records; other modules read-only where needed for review.
- **Read:** Authorized compliance evidence, transactions, approvals, and audit records.
- **Create/update:** Record verification results, evidence, and alert/investigation outcomes; do not modify operational source records unless separately authorized.
- **Approval:** Provides compliance review; this role does not replace the Supply Chain Head as final approver for protected action categories.
- **Restricted actions:** Flags suspicious activity and may support a transaction hold where the eventual workflow grants that capability; cannot autonomously accuse a person or organization of fraud.
- **Escalation:** Escalates missing/failed regulatory or quality evidence, suspected irregularities, and approval-control failures to the Supply Chain Head.

## 3. Role-permission matrix

This is a role-responsibility baseline for planning UI and tests, not a final grant of access. `V`, `C`, `E`, `R`, `A`, `X`, and `U` use the definitions above. Any module-specific permission not established by the documented responsibilities is marked **Pending** rather than inferred. In particular, `A-Final` is reserved for the Supply Chain Head for the protected actions.

| Role | Executive Dashboard | Digital Twin | AI Command Centre | Inventory & Manufacturing | Customers & Orders | Approvals & Decisions | Risk, Compliance & Audit | Resilience & Impact Analytics |
|---|---|---|---|---|---|---|---|---|
| Supply Chain Head | V | V | V, A-Final, emergency controls Pending | V, review; E Pending | V, review; E Pending | V, A-Final, R | V, U | V |
| Procurement Manager | V, Limited | V, Limited | V, R, task controls Pending | V, supplier checks; C/E Pending | V, Limited | V, review, R; A-Final No | V, procurement evidence; U Pending | V, supplier-impact scope |
| Factory Manager | V, Limited | V, production nodes | V, R, task controls Pending | V, C, E, R (schedule change requires A-Final) | V, production-linked scope | V, review, R; A-Final No | V, production evidence; U Pending | V, production scope |
| Warehouse Manager | V, Limited | V, warehouse nodes | V, R, task controls Pending | V, C, E, R (transfer requires A-Final) | V, stock-linked scope; E Pending | V, review, R; A-Final No | V, inventory evidence; U Pending | V, stock scope |
| Logistics Manager | V, Limited | V, route/shipment scope, R | V, R, task controls Pending | V, logistics-linked scope | V, delivery-linked scope | V, review, R; A-Final No | V, logistics evidence; U Pending | V, delivery scope |
| Customer / Export Manager | V, Limited | V, customer nodes | V, R; task controls Pending | V, order-linked scope | V, C, E, R (reallocation requires A-Final) | V, prepare/review; A-Final No | V, communication evidence; U Pending | V, customer scope |
| Compliance / Auditor | V, Limited | V, read-only relevant nodes | V, audit-relevant activity; controls Pending | V, read-only relevant records | V, read-only relevant records | V, review; no final approval | V, C, E for compliance evidence, U | V, audit-relevant estimates |

**Matrix cautions**

- `V` does not mean every business record or sensitive field is visible; record- and incident-level boundaries are not yet specified.
- The manager rows indicate operational record preparation/recommendation consistent with their stated responsibilities. Exact create/edit permission boundaries require product/security confirmation.
- No manager receives final approval authority for a protected category in this specification.
- Agent pause/stop, global kill switch, manual override, and resume authority remain subject to the pending emergency-permission design. The role names responsible for emergency control must be approved before enforcement.
- Execution (`X`) is conditional and is not granted as a standing role permission here. It follows required approval, checks, and later technical design.

## 4. Approval authority matrix

For each protected category, the Supply Chain Head is the final authority. A “relevant reviewer” can verify and recommend; it is not an additional final approver unless later confirmed. AI may prepare evidence and proposals but cannot approve. AI execution without human approval is **No** in every row.

| Protected action | Preparing role / department | Relevant reviewer(s) | Final approval authority | AI may prepare? | AI may execute without approval? |
|---|---|---|---|---|---|
| Purchase from an alternative supplier | Procurement Manager | Compliance / Auditor (eligibility), Logistics Manager (delivery), Factory Manager (material fit) | Supply Chain Head | Yes, proposal only | No |
| Transfer inventory between warehouses | Warehouse Manager | Receiving/source warehouse operational verification | Supply Chain Head | Yes, proposal only | No |
| Change factory production schedules | Factory Manager | Warehouse Manager (material availability) | Supply Chain Head | Yes, proposal only | No |
| Prioritize or reallocate customer orders | Customer / Export Manager; Warehouse Manager provides stock information | Relevant operational managers | Supply Chain Head | Yes, scenario/proposal only | No |
| Change shipment routes or carriers | Logistics Manager | Procurement Manager where supplier terms apply | Supply Chain Head | Yes, proposal only | No |
| Send major disruption notification to customers | Customer / Export Manager | Relevant operational managers | Supply Chain Head | Yes, draft only | No |
| Approve payments or financial commitments | Procurement Manager / responsible finance function (finance role not defined) | Procurement Manager and any required organizational reviewer; exact review path pending | Supply Chain Head | Yes, draft/analysis only | No |
| Add or change approved suppliers | Procurement Manager | Compliance / Auditor | Supply Chain Head | Yes, assessment/proposal only | No |

An approval event must identify the action and current proposal version. Revisions require review again. The exact conditions for rejection, expiry, escalation, delegation, and multi-party operational verification beyond the final approval are pending design.

**Email control:** AI-drafted email must be reviewed and approved by a human before sending. Major disruption notices are also in the protected-action matrix above. Detailed approval authority for non-major external emails must be confirmed; do not infer that a role can send unreviewed AI-generated text.

## 5. Agent permission model

Agent authority is distinct from user-role permission and tool capability:

1. **Level 1 — Read & Analyse:** retrieve only authorized information, inspect records, calculate risk, and analyze conditions.
2. **Level 2 — Recommend & Prepare:** prepare recommendations, recovery plans, proposed actions, and communication drafts.
3. **Level 3 — Execute with Permission:** execute only explicitly permitted actions after the required human approval and with an audit trail.

An agent’s technical ability to call a tool does not confer business authorization. The approval service/workflow must enforce protected-action gates independently of the user interface. No protected action may be executed when approval is absent, rejected, stale, or based on a different proposal version. Exact agent identities, tool permissions, and technical enforcement are Phase 4/5 decisions.

## 6. Emergency and override access

- **Individual agent pause/stop:** A human control must exist and its use be auditable. The project has not finalized which roles may invoke it.
- **Global kill switch:** A global emergency halt is required. Authorized roles, trigger safeguards, technical scope, and recovery process are **pending design**.
- **Manual override:** Human ability to override an AI action is required. The exact override rights, scope, and post-override workflow are **pending design**.
- **Escalation:** The Supply Chain Head is the established final approval authority for protected actions. Further escalation hierarchy is not confirmed.
- **Fail-safe:** On uncertain data, agent/system failure, or unavailable integrations, do not present a protected action as completed; preserve human control and display the failure/verification state.
- **Resume:** Do not infer who may resume operations after pause/kill switch. Resume authority and required verification are **pending design**.

## 7. Authentication and account assumptions

The product assumes individual logins, role assignment, role-aware sessions, timely revocation of access when an account/role is no longer authorized, and shared management visibility within approved scope. It must not depend on shared credentials for accountability. Authentication provider, identity federation, session duration, multifactor requirements, account lifecycle, and role-assignment authority are not selected in Phase 2. Implementers must defer these decisions to architecture/security design and avoid embedding an identity provider in this specification.

## 8. Access-control examples

1. **Procurement Manager proposes Indian backup purchase:** May review supplier records, gather quality/regulatory evidence, and prepare a purchase proposal. The 10 production days remain reported/unverified until all checks complete. The proposal goes to the Supply Chain Head; the manager cannot purchase or add the supplier without required approval.
2. **Warehouse Manager identifies stock:** May view and verify assigned warehouse stock, record a discrepancy, and draft an allocation/transfer proposal. The manager cannot move stock or apply customer allocation without approval; the policy remains pending.
3. **Factory Manager reviews schedule:** May inspect capacity/material exposure and prepare a revised schedule proposal. Feasibility review is not approval; a protected schedule change requires Supply Chain Head approval.
4. **Logistics Manager evaluates another route:** May examine available shipment and route evidence and recommend an alternative. Changing route/carrier requires Supply Chain Head approval; map or carrier data cannot be invented.
5. **Customer / Export Manager prepares communications:** May prepare and edit an email draft using verified facts. AI-generated email needs human review/approval before send; a major disruption notice requires the Supply Chain Head’s final approval. Unconfirmed delivery dates/quantities cannot be promised.
6. **Compliance / Auditor flags supplier information:** May record evidence and a suspicious-activity alert and escalate it. The alert must say “flagged for verification,” not accuse a party of fraud. Any transaction hold capability is subject to the eventual workflow authorization.
7. **Supply Chain Head reviews a recovery action:** May inspect proposal version, evidence, uncertainty, operational reviews, and impact, then approve, reject, modify where permitted, or escalate. Approval and execution are distinct audit events; the system may execute only the approved version where Level 3 permission is later enabled.

## 9. Unresolved permissions and decisions

The following remain open and must not be silently encoded as confirmed rules:

- Record-level and field-level access boundaries, including customer and commercially sensitive data.
- Exact create/edit permissions for each operational entity.
- Approval privileges for non-protected routine decisions and non-major emails.
- Delegation, multi-reviewer rules, approval expiry, deadlines, escalation hierarchy, and substitution.
- Who can pause/stop an agent, invoke/rescind the global kill switch, manually override, and resume.
- Transaction-hold authority for suspicious activity.
- Authentication provider, account provisioning, session policy, and role administration.
- Final customer allocation policy; healthcare-first balanced allocation remains provisional.
- The finance review role and its interaction with the established Supply Chain Head final authority.

Resolve these items with the project owner and security/operations stakeholders before implementing authorization policy. Until then, prefer least privilege and fail closed for protected actions.
