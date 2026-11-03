# AI Agent Design and Governance

**Document version:** 1.0
**Project stage:** Phase 4 — AI Agent Design, Governance and Workflows
**Status:** Proposed architecture only. No agents, models, prompts, tools, or integrations are claimed implemented.
**Related documents:** [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Integration architecture](INTEGRATION_ARCHITECTURE.md) · [Tool specifications](AGENT_TOOL_SPECIFICATIONS.md) · [Workflows and approvals](06_WORKFLOWS_AND_APPROVALS.md) · [Security and audit](07_SECURITY_AND_AUDIT.md) · [Agent workflow diagram](diagrams/agent-workflow.md)

## 1. Purpose and design stance

This document proposes a small, modular agent team for the confirmed central-orchestrator architecture. The proposed agent names and responsibilities are not final project decisions. Each specialist is a bounded role, not necessarily a separate model, process, or independently deployed service. A single model deployment may support multiple role prompts; deterministic CAP services should handle arithmetic, validation, access control, state transitions, and side effects.

The proposal uses five specialists because the disruption-to-recovery flow has five distinct evidence domains: disruption/risk, supplier/compliance, inventory/manufacturing, logistics, and customer/communications. It avoids one agent per UI page and avoids a free-running autonomous “executor.”

## 2. Authority model

| Level | Allowed behaviour | Prohibited behaviour |
|---|---|---|
| **Level 1 — Read & Analyse** | Retrieve authorized data through scoped tools, calculate via deterministic services, identify gaps, summarize evidence. | Modify operational records, approve actions, or contact parties autonomously. |
| **Level 2 — Recommend & Prepare** | Prepare evidence-backed options, proposals, call scripts, and drafts for human review. | Treat a recommendation, confidence score, tool capability, or verbal response as authorization. |
| **Level 3 — Execute with Permission** | Proposed agents do not hold general Level 3 capability. CAP may execute a specific, explicitly approved action through a protected tool after reauthorization and current-version checks. | Execute any protected action without Supply Chain Head final approval, execute a changed proposal, or invoke emergency control as an agent. |

The Supply Chain Head has final approval authority for all eight protected categories: alternative-supplier purchasing; inter-warehouse inventory transfers; factory schedule changes; customer-order prioritization/reallocation; shipment route/carrier changes; major customer disruption notifications; payments/financial commitments; and approved-supplier additions/changes. Exact operational verifier and emergency permissions remain subject to the existing access design.

## 3. Proposed agent roster

### A-01 — Disruption & Risk Analyst (proposed)

- **Purpose:** Consolidate disruption signals and explain potential network and operational exposure.
- **Responsibilities:** Validate incident evidence provenance; identify affected route/product/entities; distinguish reported facts from estimates; identify conflicts and request verification; summarize risk without claiming certainty.
- **Inputs:** Incident/notification references, shipment status, product/supplier links, timestamps, authorized network context.
- **Outputs:** Incident analysis, affected-entity references, assumptions, uncertainty, missing evidence, escalation recommendation.
- **Tools:** `get_supplier_shipment_status`, `get_inventory_and_coverage`, `calculate_supply_gap`, `create_or_update_incident` (incident proposal/update only), `flag_suspicious_activity` only when relevant evidence supports a neutral flag.
- **Authority:** Level 1; Level 2 for analysis summaries and incident proposals. No protected execution.
- **Dependencies:** CAP-authorized source records; deterministic incident validation and exposure service.
- **Escalation:** Conflicting source reports, possible critical exposure, unsupported timeline, suspicious evidence, or inability to identify affected records.
- **Failure behaviour:** Return incomplete/failed status with source refs and gaps; never infer a live shipment state or manufacture a delivery estimate.
- **Human interaction:** Supply Chain Head and relevant Logistics/Procurement/Factory managers review incident analysis; human confirms material operational facts.

### A-02 — Supplier & Compliance Analyst (proposed)

- **Purpose:** Organize supplier eligibility and suspicious-activity evidence for human review.
- **Responsibilities:** Track quality/regulatory/quantity/capacity/supplier-confirmation/delivery checks; identify missing or conflicting evidence; prepare supplier assessments; flag suspicious patterns neutrally.
- **Inputs:** Supplier record references, qualification evidence, CoA/quality status, regulatory evidence, reported stock, transaction references.
- **Outputs:** Per-check status with source/date, unverified gaps, supplier assessment, neutral alert and evidence references.
- **Tools:** `get_supplier_shipment_status`, `check_backup_supplier_eligibility`, `flag_suspicious_activity`, `get_demand_and_orders` only when required to contextualize supplier transaction evidence.
- **Authority:** Level 1 and Level 2. Cannot qualify/approve a supplier, place a purchase, alter supplier master data, or place a transaction hold directly.
- **Dependencies:** Procurement Manager and Compliance / Auditor provide authorized source evidence; human review verifies regulatory/quality determinations.
- **Escalation:** Missing/expired evidence, unconfirmed stock, bank detail changes, duplicate transactions, unauthorized supplier change, or suspected quality issue.
- **Failure behaviour:** Mark evidence unknown/not verified; keep stock out of confirmed coverage; avoid accusing a person or organization.
- **Human interaction:** Procurement Manager and Compliance / Auditor review checks; Supply Chain Head approves any supplier addition/change or purchase.

### A-03 — Inventory & Manufacturing Planner (proposed)

- **Purpose:** Analyze material coverage and manufacturing exposure and prepare constrained recovery options.
- **Responsibilities:** Summarize inventory/consumption inputs; compare coverage to delay; evaluate capacity/schedule constraints; draft allocation/transfer/schedule proposals without selecting policy.
- **Inputs:** Inventory by authorized location, consumption assumptions, schedule/capacity records, validated disruption and supplier checks.
- **Outputs:** Deterministic calculation references, exposure summary, options, constraints, proposal drafts, missing data.
- **Tools:** `get_inventory_and_coverage`, `calculate_supply_gap`, `get_demand_and_orders`, `analyze_production_capacity`, `estimate_customer_impact`, `prepare_recovery_plan`.
- **Authority:** Level 1 and Level 2 only.
- **Dependencies:** CAP deterministic calculations; Warehouse Manager and Factory Manager verification; policy decision for customer allocation.
- **Escalation:** Inventory discrepancy, missing consumption basis, infeasible capacity, unverified alternate stock, or any proposal requiring protected action.
- **Failure behaviour:** Do not calculate from placeholder values; return unavailable/uncertain result and affected assumptions.
- **Human interaction:** Warehouse Manager and Factory Manager validate operational feasibility; Supply Chain Head approves transfers, schedule changes, and reallocations.

### A-04 — Logistics & Shipment Analyst (proposed)

- **Purpose:** Explain shipment evidence and compare candidate routes/carriers.
- **Responsibilities:** Summarize current shipment evidence and freshness; compare feasible options from available data; identify unknowns, lead-time assumptions, and delivery risks.
- **Inputs:** Shipment/route/carrier records, relevant supplier location, target facility, constraints supplied by authorized users.
- **Outputs:** Evidence-backed comparison, assumptions, missing source data, route/carrier proposal for review.
- **Tools:** `get_supplier_shipment_status`, `compare_route_carrier_options`, `prepare_recovery_plan`.
- **Authority:** Level 1 and Level 2 only.
- **Dependencies:** CAP adapter to verified logistics source or clearly labelled synthetic records; Logistics Manager validates feasibility.
- **Escalation:** No authoritative ETA, stale tracking, contradictory carrier data, route feasibility uncertainty, or proposed route/carrier change.
- **Failure behaviour:** Show last known status and age; no invented ETA or autonomous reroute.
- **Human interaction:** Logistics Manager reviews; Supply Chain Head approves protected route/carrier changes.

### A-05 — Customer Impact & Communications Planner (proposed)

- **Purpose:** Summarize order impact and prepare human-reviewable fulfilment and communication materials.
- **Responsibilities:** Assess synthetic order exposure; report estimated availability impact and assumptions; prepare alternative scenarios without deciding allocation; draft communications from verified facts only.
- **Inputs:** Authorized order/demand references, inventory/production exposure, approved message context, recipient and purpose provided by a human.
- **Outputs:** Customer-impact estimate references, scenario options, draft email or voice-call script, unsupported-data warnings.
- **Tools:** `get_demand_and_orders`, `get_inventory_and_coverage`, `estimate_customer_impact`, `prepare_recovery_plan`, `draft_email`. It cannot directly send email or initiate voice calls.
- **Authority:** Level 1 and Level 2 only.
- **Dependencies:** Deterministic impact calculator, confirmed communication context, human-approved allocation policy (currently pending).
- **Escalation:** Missing order commitments, uncertain healthcare urgency, allocation conflict, major disruption notice, or any unverified delivery/financial commitment.
- **Failure behaviour:** Label metrics as synthetic estimates; do not invent customer details, quantities, delivery dates, promises, or patient outcomes.
- **Human interaction:** Customer / Export Manager reviews drafts; Supply Chain Head makes final protected decisions and approves major disruption notices.

## 4. Orchestrator responsibilities and delegation

The orchestrator is a coordinator, not an additional approver or unrestricted tool user. CAP authenticates the initiating user, determines permitted scope, and submits a bounded task. The orchestrator:

1. Assigns a task ID, purpose, incident reference, deadline, allowed data references, allowed agent roles, and permitted tool set.
2. Selects only the smallest relevant specialist set; independent analyses may run concurrently, while dependent tasks wait for verified inputs.
3. Gives agents evidence references and structured context, not broad database access, secrets, or untrusted instructions as authority.
4. Collects schema-validated results, status, assumptions, source references, confidence/uncertainty, and errors.
5. Detects missing or contradictory evidence and requests a bounded follow-up or escalates to a human.
6. Aggregates results while preserving disagreement and provenance; never averages conflicting facts into false certainty.
7. Returns an explanation, evidence, proposal(s), and state to CAP. CAP persists the result and enforces approval, execution, and audit policy.

### Delegation contract (proposed)

Each task carries `task_id`, `incident_id`, `objective`, `initiating_actor`, `authorized_scope`, `allowed_tools`, `input_refs`, `deadline`, and `correlation_id`. An agent result carries `task_id`, `agent_role`, `status`, `summary`, `evidence_refs`, `assumptions`, `uncertainties`, `confidence` (optional and calibrated), `proposal_refs`, `tool_summaries`, and `escalation`. These are illustrative fields, not implemented API contracts.

Shared state is reference-based and CAP-owned. Store durable state in the planned application data layer, not in an agent's private conversational memory. Agents should receive task-scoped context and return deltas/references. Exact schema and protocol remain pending Phase 5.

## 5. Evidence, confidence, and conflict handling

- Every material claim should cite a source record/evidence reference and timestamp or state that evidence is absent.
- Distinguish supplier-reported, human-verified, externally verified, synthetic, simulated, estimated, stale, and conflicting information.
- Confidence is an explanation aid, not an approval score or execution threshold. Do not invent numeric confidence where the model cannot substantiate it.
- If sources conflict, retain both claims, their provenance, and the discrepancy; request human verification. Do not silently choose the most convenient value.
- Deterministic CAP functions own arithmetic, constraints, eligibility state transitions, permissions, idempotency, and approval state.
- AI output cannot prove quality/regulatory eligibility or patient outcomes.

## 6. Errors, retries, and duplicate/conflicting work

- Each task has a bounded deadline and explicit `succeeded`, `partial`, `failed`, `timed_out`, or `cancelled` outcome.
- Retry only transient, side-effect-free reads under bounded policy; never automatically retry external side effects unless the adapter contract guarantees idempotency and CAP confirms current authorization.
- A tool/action uses a stable request/idempotency key and proposal version. Duplicate submissions return the existing request state rather than creating duplicate purchases, emails, transfers, or approval cases.
- On agent/model/workflow/source outage, preserve partial evidence, identify unavailable work, and escalate; do not report the whole plan as complete.
- Conflicting proposals are surfaced side-by-side with tradeoffs and evidence. The orchestrator does not resolve a business-policy conflict by itself.
- Individual agent pause/stop, global kill switch, and manual override are human-only controls in this proposed design; role and resume permissions remain pending. A stopped task cannot start new tool calls; in-flight work must be reconciled by CAP.

## 7. Deterministic services versus AI

| Function | Preferred implementation | Reason |
|---|---|---|
| 30 − 20 coverage/gap arithmetic; units/ranges | Deterministic CAP domain service | Reproducible, testable arithmetic; AI may explain but not calculate authoritative values. |
| Role checks, approval gates, state transitions, deduplication | CAP/workflow rules | Security and governance must not depend on model interpretation. |
| Supplier checklist completeness, expiration checks | Deterministic rules plus human evidence review | AI can summarize evidence, but cannot certify eligibility. |
| Inventory, demand, route/provider retrieval | Verified adapters or labelled synthetic adapters | Preserve provenance and source status. |
| Summarizing records, identifying missing evidence, drafting alternatives | AI specialist roles | Useful language/reasoning work with human review and cited inputs. |
| Impact and allocation arithmetic | Deterministic service with disclosed assumptions; AI may explain options | Prevent fabricated calculations and keep the allocation policy provisional. |
| Voice/email dispatch and operational writes | CAP adapters after explicit authorization | Side effects require consent, approval, validation, and audit. |

## 8. Proposed prompt files

The reusable prompt templates are intentionally separate from APIs and are not executable implementations:

- Orchestrator: [`prompts/orchestrator/system.md`](../prompts/orchestrator/system.md) and [`prompts/orchestrator/delegation.md`](../prompts/orchestrator/delegation.md).
- Specialist prompts: [Disruption & Risk](../prompts/specialist-agents/disruption-risk-analyst.md), [Supplier & Compliance](../prompts/specialist-agents/supplier-compliance-analyst.md), [Inventory & Manufacturing](../prompts/specialist-agents/inventory-manufacturing-planner.md), [Logistics & Shipment](../prompts/specialist-agents/logistics-shipment-analyst.md), [Customer Impact & Communications](../prompts/specialist-agents/customer-impact-communications-planner.md).
- Communication prompts: [Internal voice](../prompts/communication/internal-voice-call.md), [Supplier voice](../prompts/communication/supplier-voice-call.md), [Customer email](../prompts/communication/customer-email-draft.md), [Internal disruption notice](../prompts/communication/internal-disruption-notice.md).

## 9. Pending decisions

Agent names and boundaries in this document are proposals for stakeholder review. Remaining decisions include model/provider configuration, agent count and deployment topology, task protocol/schema, memory/state management, tool contracts, confidence calibration, exact retry/idempotency policy, human owners for pause/stop/kill/override/resume, transaction-hold authority, final allocation policy, and external voice/email services.
