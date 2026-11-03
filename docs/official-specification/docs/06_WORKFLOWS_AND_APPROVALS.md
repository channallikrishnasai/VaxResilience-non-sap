# Workflows and Human Approvals

**Document version:** 1.0
**Project stage:** Phase 4 — AI Agent Design, Governance and Workflows
**Status:** Proposed workflows; no workflow engine, API, provider, or execution path is claimed implemented.
**Related documents:** [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [Roles and access](USER_ROLES_AND_ACCESS.md) · [Agent design](05_AGENT_DESIGN.md) · [Security and audit](07_SECURITY_AND_AUDIT.md) · [Tool specifications](AGENT_TOOL_SPECIFICATIONS.md) · [Workflow diagram](diagrams/agent-workflow.md)

## 1. Non-negotiable approval boundary

AI analyzes, coordinates, recommends, and prepares. Authorized humans decide. The Supply Chain Head is the final approver for every protected category. An approval authorizes only the exact, current, reviewed proposal version; CAP rechecks identity, role, proposal state/version, evidence status, action limits, and approval before any side effect. Approval is not proof of execution, and execution is not proof of verified outcome.

The eight protected categories are:

1. Purchase from an alternative supplier.
2. Transfer inventory between warehouses.
3. Change a factory production schedule.
4. Prioritize or reallocate customer orders.
5. Change shipment route or carrier.
6. Send a major disruption notification to customers.
7. Approve a payment or financial commitment.
8. Add or change an approved supplier.

The customer allocation policy remains pending; “healthcare-first balanced” is provisional only. Do not invent approval deadlines, service-level commitments, delegation, emergency authority, or external provider behavior.

## 2. Common proposal and decision lifecycle

Illustrative state model; final persisted enums and workflow implementation are Phase 5 design work.

```text
PREPARING -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> EXECUTION_QUEUED -> EXECUTING
                         |                 |                              |
                         |                 |                              +-> EXECUTION_FAILED
                         |                 |                                  -> RETRY_REVIEW (human/CAP policy)
                         |                 +-> EXPIRED / REVOKED / CANCELLED
                         +-> NEEDS_CHANGES -> PREPARING (new version)
                         +-> REJECTED
EXECUTING -> EXECUTED_UNVERIFIED -> VERIFIED -> CLOSED
                         \-> OUTCOME_UNKNOWN (reconcile before retry)
```

- **Preparing:** Agent or user drafts; no approval exists.
- **Submitted / under review:** Immutable proposal version and evidence snapshot are reviewable.
- **Needs changes / rejected:** No execution; edits create a new version. Rejection records rationale where policy requires it.
- **Approved:** Decision binds to one version, category, limits, approver, and decision time. A stale/changed proposal is not executable.
- **Execution queued/executing:** CAP verifies the approval again immediately before dispatch and records a unique idempotency key.
- **Execution failed:** Surface failure and preserve result. Retry is not automatic for side effects; first reconcile whether the original action took effect.
- **Executed unverified:** Adapter reported an outcome; operational evidence is not yet independently verified.
- **Verified/closed:** Authorized human or verified source confirms expected outcome; incident closure remains a separate human decision.
- **Expired/revoked/cancelled:** No new execution. Revocation/cancellation of an in-flight action requires adapter-specific reconciliation and a truthful status.

Proposal version, approval, and execution records are append-only references. Duplicate submissions with the same idempotency key return the existing request state. Concurrent edits or decisions use version checks; a stale reviewer cannot approve a changed proposal. Approval expiry duration and reapproval criteria require stakeholder decision; until set, do not infer an expiry window or allow a materially changed approval to execute.

## 3. Workflow catalogue (15 proposed workflows)

Every workflow uses a CAP-controlled task/request ID, incident reference, actor, state, evidence references, timestamps, and audit correlation. The steps below describe intended behavior, not API contracts.

| ID / workflow | Trigger and owner | Proposed flow and human decision | Output and failure path |
|---|---|---|---|
| **WF-01 Incident intake and triage** | Supplier/shipment signal or authorized user; Supply Chain Head owns triage. | CAP records source and freshness; Disruption & Risk Analyst maps affected entities and gaps; authorized manager validates material facts; Supply Chain Head confirms triage priority. | Incident and evidence references. Conflicts or missing source remain explicit; no fabricated status. |
| **WF-02 Exposure and coverage analysis** | Incident accepted; Factory/Warehouse Manager verifies inputs. | Retrieve authorized inventory/delay inputs; deterministic service calculates coverage and potential gap; analyst explains assumptions; manager verifies source values. | For the synthetic scenario: 30-day delay, 20-day coverage, 10-day potential gap. Missing/stale input makes result unavailable or qualified. |
| **WF-03 Backup supplier qualification** | Potential supply gap; Procurement Manager coordinates checks with Compliance / Auditor. | Gather quality, regulatory, actual quantity, capacity, supplier confirmation, price/terms, and delivery feasibility evidence; analyst marks each state; humans verify evidence. | Eligibility assessment, not supplier approval. Reported 10 production days remain unconfirmed until checks pass. |
| **WF-04 Recovery plan preparation** | Sufficient incident context or explicit request; orchestrator coordinates. | Specialists prepare alternatives and dependencies; deterministic services calculate; orchestrator consolidates disagreement; managers review feasibility; Supply Chain Head selects whether to submit proposals. | Versioned plan and individual action proposals. Incomplete evidence is flagged; plan does not authorize actions. |
| **WF-05 Alternative supplier purchase** | Procurement Manager submits a purchase proposal. | Validate supplier checks, quantity/price/terms, and evidence; Procurement Manager reviews; Supply Chain Head makes final approval; CAP rechecks exact proposal version before authorized order dispatch. | Purchase request/outcome and reconciliation. Missing checks, stale approval, rejection, or unknown dispatch outcome blocks repeat submission. |
| **WF-06 Warehouse transfer** | Warehouse Manager proposes inter-warehouse transfer. | Validate source/destination, lot/quantity, availability, and constraints; managers confirm feasibility; Supply Chain Head approves; CAP executes only the approved transfer request. | Transfer result and later receipt verification. No stock mutation on recommendation; discrepancy or timeout requires reconciliation. |
| **WF-07 Production schedule change** | Factory Manager proposes schedule adjustment. | Compare capacity/material constraints; Factory Manager validates feasibility; impacted managers review; Supply Chain Head approves; CAP verifies current approval and schedules the approved version. | Schedule action state and production verification. Failure or constraint change blocks execution and requires a new review. |
| **WF-08 Customer-order priority/reallocation** | Warehouse/Customer Manager requests allocation scenario. | Deterministic service presents scenarios with assumptions; allocation policy is shown as pending/provisional; operational users review; Supply Chain Head decides and approves exact allocation. | Proposal and decision. No autonomous “healthcare-first” choice; missing order or policy data is surfaced. |
| **WF-09 Route/carrier change** | Logistics Manager requests route comparison or change. | Compare only source-supported candidate options; Logistics Manager validates feasibility and constraints; Supply Chain Head approves route/carrier change; CAP dispatches only after revalidation. | Approved route action and observed shipment state. No autonomous rerouting; stale tracking or unknown result requires reconciliation. |
| **WF-10 Major customer disruption notice** | Customer / Export Manager requests notice. | AI drafts from verified facts; manager verifies recipient/content; Supply Chain Head reviews and gives final approval; CAP sends the approved content version through a later verified adapter. | Draft, approval, send/failure status. Edits invalidate approval; no invented date, quantity, guarantee, or commitment. |
| **WF-11 Payment/financial commitment** | Authorized user prepares commitment proposal. | Validate amount/currency/beneficiary/terms from authorized records; Procurement Manager reviews where relevant; Supply Chain Head final approval; CAP dispatches only under verified financial control design. | Decision and financial execution reference. No agent can initiate payment; finance role and detailed controls remain pending. |
| **WF-12 Supplier addition/change** | Procurement Manager submits supplier-master change. | Gather identity, quality/regulatory evidence, conflict checks, and rationale; Compliance / Auditor reviews evidence; Supply Chain Head approves; CAP applies only approved, version-bound change. | Supplier change result and verification. Incomplete evidence or duplicate identity blocks application. |
| **WF-13 Internal voice coordination** | Human requests an internal call; provider/consent setup must be verified. | Confirm contact, purpose, consent and allowed scope; AI identifies itself, gathers facts, and summarizes; a human corroborates material facts before record verification. | Call status and unverified response summary. No consent, wrong contact, ambiguity, or drop is a failed/incomplete call, not confirmation. |
| **WF-14 Approved email communication** | Human requests supplier/customer/internal email draft. | Generate draft; human confirms recipient and content; applicable approver reviews (Supply Chain Head final for major customer disruption notice); CAP sends only approved version and records adapter result. | Draft/approval/send/failure state. No send before approval; modified content requires review. |
| **WF-15 Incident recovery and closure** | Managers report stabilizing operations; Supply Chain Head owns closure. | Verify supplier, received stock, production, shipment, customer delivery, open actions, and risks; AI prepares evidence-linked summary; Supply Chain Head records closure decision. | Recovery/closure decision with remaining risks. Shipment arrival alone is insufficient; stale or missing verification delays closure. |

### Cross-cutting exception workflows

These are controls that can interrupt any catalogue workflow and are not separate protected business actions:

- **Agent pause/stop or global kill switch:** Authorized human control only; exact roles and resume authority remain pending. CAP records request, actor, scope, confirmation, result, and in-flight work. Report failure immediately; do not show a false halted state.
- **Suspicious activity and transaction hold:** AI may flag an affected record and request review. A hold is applied only by a specifically authorized workflow/role once that policy is approved. The alert is neutral (“flagged for verification”), not an accusation. Any consequential follow-up retains its protected-action gate.
- **Source/model/workflow failure:** Mark task partial/failed, preserve completed evidence, block unsafe execution, and notify an authorized operator. No success-shaped fallback.
- **Emergency/manual override:** Human-only and subject to unresolved authority/recording policy. An override never silently bypasses the protected action approval gate; conflicts require escalation.

## 4. Review, approval, and execution rules

1. **Decision authority:** Supply Chain Head is final approver for all eight protected categories. Other reviewer roles supply evidence/feasibility checks and do not replace final approval.
2. **Version binding:** Approval references a proposal ID and immutable version/hash plus relevant limits. Changes to action, recipient, amount, quantity, supplier, route, schedule, allocation, or customer notice content require a new version and review.
3. **Precondition recheck:** CAP re-evaluates identity/role, proposal state, current version, evidence requirements, resource constraints, and authorization immediately before side effect.
4. **No implied approval:** Silence, voice response, model output, automated risk score, prior approval, or a UI state is not authorization.
5. **Explicit human outcome:** Approval, rejection, request for changes, escalation, revocation, and cancellation are distinct; retain actor/time/reason where required by policy.
6. **Execution distinction:** Record dispatch, adapter acknowledgement, business outcome, and verification separately. An adapter timeout may mean unknown outcome, not failed action.
7. **No blind retries:** Read-only transient requests may retry under bounded policy. Side-effect retry requires idempotency plus reconciliation and current authorization.
8. **Fail closed:** If role, evidence, approval, state, version, or service status cannot be verified, no protected side effect occurs.

## 5. Notifications and escalation

Notify the responsible authorized user on new decision request, missing evidence, rejection/changes, execution failure/unknown result, agent/source outage, suspicious activity, and emergency-control failure. Notification channels, timing, escalation SLA, and substitute approvers are not selected. Do not imply a guaranteed delivery channel or response deadline.

## 6. Traceability

Workflows map to the Phase 2 requirements for disruption analysis, supplier verification, recovery planning, approval, communication, suspicious-activity review, recovery tracking, and incident closure. The workflow diagram in [agent-workflow.md](diagrams/agent-workflow.md) illustrates the proposal-to-human-decision-to-authorized-execution boundary; it is conceptual, not an implemented process.
