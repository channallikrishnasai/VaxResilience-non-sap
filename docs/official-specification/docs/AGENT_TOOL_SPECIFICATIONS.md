# Proposed Agent Tool Specifications

**Document version:** 1.0
**Project stage:** Phase 4 — AI Agent Design, Governance and Workflows
**Status:** Illustrative tool contracts for future design. No endpoints, functions, providers, or tools are implemented or verified.
**Related documents:** [Agent design](05_AGENT_DESIGN.md) · [Workflows and approvals](06_WORKFLOWS_AND_APPROVALS.md) · [Security and audit](07_SECURITY_AND_AUDIT.md) · [Integration architecture](INTEGRATION_ARCHITECTURE.md)

## 1. Contract conventions

These shapes use JSON-like notation for discussion; they are not OpenAPI, CAP service definitions, or deployable APIs. Exact identifiers, enums, units, pagination, schemas, and service contracts belong to Phase 5.

Every request is evaluated by CAP using a server-derived identity and authorization context. An agent cannot set its own role, actor, permission, approval, or tenant. Tool results must include:

```json
{
  "request_id": "opaque-reference",
  "status": "succeeded | partial | failed | denied",
  "data": {},
  "evidence_refs": [],
  "source_status": "verified | unverified | synthetic | simulated | stale | unavailable",
  "observed_at": "source timestamp when available",
  "warnings": [],
  "error": null
}
```

The example strings are placeholders, not actual IDs, timestamps, or service endpoints. Sensitive data should be minimized/redacted. `partial`, `failed`, and `denied` are explicit outcomes, never empty success responses. Errors use stable safe codes and a human-readable explanation; do not return stack traces, credentials, or unrestricted provider payloads.

## 2. Tool inventory and permission classes

| Tool | Class | Intended agent/user | Effect and boundary | Output `data` shape (illustrative) |
|---|---|---|---|---|
| `get_supplier_shipment_status` | Read | Disruption & Risk; Logistics & Shipment; authorized user | Read scoped supplier/shipment references and source freshness. | `{ "records": [{ "record_ref": "...", "status": "...", "source_ref": "...", "observed_at": "...", "verification_state": "..." }] }` |
| `get_inventory_and_coverage` | Read/calculation | Disruption & Risk; Inventory & Manufacturing; Customer Impact | Retrieve permitted inventory and deterministic coverage inputs/results. | `{ "records": [{ "product_ref": "...", "location_ref": "...", "quantity": 0, "unit": "...", "coverage_days": 0, "input_refs": [] }] }` |
| `get_demand_and_orders` | Read | Inventory & Manufacturing; Customer Impact; authorized user | Retrieve scoped customer/order/demand data; omit inaccessible fields. | `{ "orders": [{ "order_ref": "...", "customer_ref": "...", "product_ref": "...", "quantity": 0, "unit": "...", "commitment_state": "..." }] }` |
| `calculate_supply_gap` | Deterministic calculation | Disruption & Risk; Inventory & Manufacturing | Calculate from explicit input references and units; does not mutate records. | `{ "delay_days": 0, "coverage_days": 0, "potential_gap_days": 0, "formula": "...", "input_refs": [] }` |
| `check_backup_supplier_eligibility` | Read/rule evaluation | Supplier & Compliance; Procurement Manager | Report each verification dimension; never certify supplier or purchase eligibility by AI judgment. | `{ "supplier_ref": "...", "checks": [{ "check_type": "...", "status": "verified | unverified | failed | unavailable", "evidence_refs": [] }], "overall_state": "..." }` |
| `analyze_production_capacity` | Read/calculation | Inventory & Manufacturing; Factory Manager | Evaluate supplied capacity/schedule constraints; no schedule mutation. | `{ "facility_ref": "...", "period_ref": "...", "capacity_state": "...", "constraints": [], "input_refs": [] }` |
| `compare_route_carrier_options` | Read/comparison | Logistics & Shipment; Logistics Manager | Compare only source-supported options; no route/carrier change or reservation. | `{ "options": [{ "option_ref": "...", "source_refs": [], "lead_time_state": "...", "constraints": [] }] }` |
| `estimate_customer_impact` | Deterministic estimate | Customer Impact; authorized user | Produce labelled synthetic/estimated impact using explicit inputs; not patient outcome prediction. | `{ "estimate_label": "synthetic estimate", "method_ref": "...", "results": [], "assumption_refs": [], "not_patient_outcome": true }` |
| `prepare_recovery_plan` | Draft/proposal | All specialists through orchestrator | Create versioned proposal draft; no approval or execution. | `{ "proposal_ref": "...", "proposal_version": 1, "state": "draft", "action_drafts": [], "evidence_refs": [] }` |
| `create_approval_request` | Workflow submission | Orchestrator/authorized user | Submit exact proposal version for review; cannot approve or dispatch. | `{ "approval_ref": "...", "proposal_ref": "...", "proposal_version": 1, "state": "submitted" }` |
| `get_approval_status` | Read | Orchestrator; authorized user | Read access-scoped approval and execution state. | `{ "approval_ref": "...", "proposal_version": 1, "decision_state": "...", "execution_state": "...", "decision_ref": "..." }` |
| `flag_suspicious_activity` | Alert/proposal | Supplier & Compliance; authorized user | Create neutral evidence-linked flag; cannot accuse, adjudicate, or directly hold a transaction. | `{ "alert_ref": "...", "record_ref": "...", "state": "flagged_for_verification", "evidence_refs": [], "hold_state": "not_requested | pending_policy | separately_authorized" }` |
| `create_or_update_incident` | Scoped record write | Disruption & Risk via CAP | Create/update incident analysis fields only; not protected operational records. Exact writable fields pending design. | `{ "incident_ref": "...", "analysis_version": 1, "state": "...", "affected_refs": [], "evidence_refs": [] }` |
| `draft_email` | Draft | Customer Impact; authorized human | Create a non-sending message draft from verified facts. | `{ "draft_ref": "...", "version": 1, "recipient_ref": "...", "state": "draft", "content_ref": "...", "fact_refs": [] }` |
| `initiate_voice_call` | External side effect / human initiated | Authorized human through CAP only | No autonomous agent initiation. Requires verified provider, recipient, consent, purpose, and applicable authorization. | `{ "call_ref": "...", "state": "initiated | failed | unavailable", "provider_ref": "optional" }` |
| `capture_voice_call_result` | Record write | CAP communication adapter; human review | Store permitted summary/status as unverified until corroborated; no direct protected action. | `{ "call_ref": "...", "summary_ref": "...", "verification_state": "unverified", "follow_up_refs": [] }` |
| `send_approved_email` | External side effect / CAP only | CAP after required human approval | Agents cannot invoke. Sends only exact approved content/recipient version after rechecks. | `{ "send_ref": "...", "approval_ref": "...", "state": "sent | failed | outcome_unknown", "provider_ref": "optional" }` |
| `request_agent_pause` | Emergency control / human only | Authorized human through CAP | Agent cannot request its own pause state or assert it succeeded. Permissions pending. | `{ "control_ref": "...", "agent_ref": "...", "state": "confirmed | failed | outcome_unknown" }` |
| `resume_agent` | Emergency control / human only | Authorized human through CAP | Human-only after required verification; exact resumer/checklist pending. | `{ "control_ref": "...", "agent_ref": "...", "state": "resumed | blocked | failed" }` |
| `invoke_global_kill_switch` | Emergency control / human only | Authorized human through CAP | Immediate human intervention request; failure must be explicit. Exact authority pending. | `{ "control_ref": "...", "scope": "...", "state": "confirmed | failed | outcome_unknown" }` |
| `record_audit_event` | System-only | CAP/workflow/adapters | Agents cannot write, edit, or delete audit records directly. CAP records validated events. | `{ "event_ref": "...", "recorded_at": "...", "append_state": "recorded | failed" }` |

No supplier, ERP, logistics, map, voice, email, payment, SAP AI, or workflow provider is selected or claimed connected. A simulated implementation must be isolated and labelled at the tool result and UI.

## 3. Illustrative input schemas

All tools also receive a server-created context: `request_id`, `initiating_actor_ref`, `agent_role` (if applicable), `task_id`, `incident_id`, `authorized_scope`, `correlation_id`. These values are not trusted if echoed or supplied by a model; CAP derives and validates them.

| Tool | Required input shape | Important validation |
|---|---|---|
| `get_supplier_shipment_status` | `{ "record_refs": ["..."], "as_of": "optional timestamp" }` | Each reference must be authorized; freshness and source returned. |
| `get_inventory_and_coverage` | `{ "product_ref": "...", "location_refs": ["..."], "include_calculation": true }` | Units, scope and source; no assumed availability from unverified supplier reports. |
| `get_demand_and_orders` | `{ "product_ref": "...", "customer_refs": ["..."], "time_window": { "from": "...", "to": "..." } }` | Role/field access; no invented customer/order facts. |
| `calculate_supply_gap` | `{ "delay_days": 30, "coverage_days": 20, "input_refs": ["..."] }` | Finite non-negative values and compatible units; output potential gap with input refs. |
| `check_backup_supplier_eligibility` | `{ "supplier_ref": "...", "product_ref": "...", "check_types": ["quality", "regulatory", "quantity", "capacity", "supplier_confirmation", "delivery"] }` | Each check returns independent state/evidence; unknown is not passed. |
| `analyze_production_capacity` | `{ "facility_ref": "...", "product_ref": "...", "period_ref": "...", "material_refs": ["..."] }` | Reads only; missing capacity/material evidence remains unknown. |
| `compare_route_carrier_options` | `{ "shipment_ref": "...", "candidate_refs": ["..."], "constraints": {} }` | Candidates must exist in allowed source; no arbitrary URLs or route mutation. |
| `estimate_customer_impact` | `{ "product_ref": "...", "order_refs": ["..."], "inventory_ref": "...", "assumption_refs": ["..."] }` | Deterministic method/version and estimates label returned; no medical inference. |
| `prepare_recovery_plan` | `{ "incident_ref": "...", "evidence_refs": ["..."], "action_drafts": [], "assumptions": [] }` | Draft only; each action tagged with protected category and proposal version. |
| `create_approval_request` | `{ "proposal_ref": "...", "proposal_version": 1, "action_category": "...", "evidence_refs": ["..."] }` | Authorized submitter; proposal current, complete, immutable for review; no approval field accepted. |
| `get_approval_status` | `{ "approval_ref": "..." }` | Access-scoped; distinguish decision from execution and verification. |
| `flag_suspicious_activity` | `{ "record_ref": "...", "alert_type": "...", "evidence_refs": ["..."], "neutral_rationale": "..." }` | Alert type is allowlisted; no person/organization guilt assertion; no direct hold. |
| `create_or_update_incident` | `{ "incident_ref": "optional", "source_refs": ["..."], "summary": "...", "affected_refs": ["..."], "analysis_state": "..." }` | Only approved incident-analysis fields; role, size, and reference constraints. |
| `draft_email` | `{ "incident_ref": "...", "recipient_ref": "...", "purpose": "...", "verified_fact_refs": ["..."], "draft_text": "..." }` | Save draft only; recipient and all claims subject to human review. |
| `initiate_voice_call` | `{ "recipient_ref": "...", "purpose": "...", "consent_ref": "...", "human_request_ref": "..." }` | Human initiated; provider/consent/recipient verified; no free-form contact details supplied by agent. |
| `capture_voice_call_result` | `{ "call_ref": "...", "summary": "...", "claims": [], "verification_state": "unverified" }` | Adapter/human scoped; transcript minimization and retention policy required. |
| `send_approved_email` | `{ "approval_ref": "...", "proposal_ref": "...", "proposal_version": 1 }` | CAP-only; recipient/content version must match valid approval; no agent permission. |
| `request_agent_pause` | `{ "agent_ref": "...", "reason": "...", "human_confirmation_ref": "..." }` | Authenticated authorized human only; report confirmed state. |
| `resume_agent` | `{ "agent_ref": "...", "verification_refs": ["..."], "human_confirmation_ref": "..." }` | Authenticated human only; policy/authority pending; no agent self-resume. |
| `invoke_global_kill_switch` | `{ "scope": "...", "reason": "...", "human_confirmation_ref": "..." }` | Human-only; exact scope authorization pending; explicit success/failure status. |
| `record_audit_event` | `{ "event_type": "...", "actor_ref": "...", "resource_ref": "...", "result_status": "...", "correlation_id": "..." }` | CAP/system only; append-only semantics required; validate/redact sensitive content. |

The JSON-like examples illustrate semantic fields only. ISO timestamp formats, reference syntax, enumerations, constraints, and output schemas must be specified and versioned before implementation.

## 4. Protected action enforcement matrix

| Protected action | Proposal preparation allowed | Human final approval | Execution path |
|---|---|---|---|
| Alternative-supplier purchase | Specialist may prepare facts/options; Procurement Manager reviews | Supply Chain Head | CAP-only adapter after current-version and supplier-check validation |
| Warehouse inventory transfer | Inventory planner may draft | Supply Chain Head | CAP-only after stock/location/quantity recheck |
| Factory schedule change | Inventory planner may draft | Supply Chain Head | CAP-only after current feasibility recheck |
| Customer-order priority/reallocation | Impact planner may compare scenarios; allocation policy pending | Supply Chain Head | CAP-only after policy and version validation |
| Route/carrier change | Logistics analyst may compare options | Supply Chain Head | CAP-only after shipment/route recheck |
| Major customer disruption notice | Customer planner may draft | Supply Chain Head | `send_approved_email` through CAP only after content/recipient version check |
| Payment/financial commitment | AI may summarize evidence, not initiate payment | Supply Chain Head | No payment tool defined; finance controls/provider remain pending |
| Approved-supplier addition/change | Supplier analyst may summarize checks | Supply Chain Head | CAP-only after human verification; exact workflow remains pending |

If approval, identity, source evidence, current version, idempotency, or downstream result cannot be established, CAP blocks or marks the outcome unknown and escalates. An agent never invokes a protected execution tool directly.

## 5. Error and idempotency semantics

- `DENIED`: authorization or policy check failed; no side effect.
- `INVALID_INPUT`: schema/business validation failed; explain safe corrective action.
- `NOT_FOUND` / `NOT_VISIBLE`: avoid revealing existence of inaccessible resources.
- `SOURCE_UNAVAILABLE`, `SOURCE_STALE`, `PARTIAL_DATA`: preserve data state and do not claim current completeness.
- `CONFLICT` / `STALE_VERSION`: caller must refresh; approval cannot be reused for altered data.
- `DUPLICATE_REQUEST`: return existing state for matching idempotency reference; do not repeat effect.
- `OUTCOME_UNKNOWN`: external call may have succeeded; reconcile before retry.
- `FAILED`: confirmed failure if available; keep error and correlation reference.

Read-only transient calls may be retried under later bounded policy. Side-effect calls require a stable idempotency reference, current approval, and reconciliation before retry. Numeric retry counts, backoff, timeout, rate limits, and data retention are unresolved and must not be invented here.

## 6. Audit and privacy

CAP records tool identity, initiating actor, task/incident/correlation references, validated input summary, evidence/source state, result/error, proposal and approval versions, and side-effect reference where applicable. Redact secrets and minimize personal/commercial content. Audit event persistence is system-only. Refer to [Security and Audit](07_SECURITY_AND_AUDIT.md) for proposed audit fields and pending retention/immutability decisions.
