# Proposed API Contracts

**Document version:** 1.0
**Project stage:** Phase 5 — Data Model, Database Schema and Integrations
**Status:** Design proposal only. No CAP service, endpoint, identity provider, workflow callback, or external API is implemented or verified.
**Related documents:** [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Data model](08_DATA_MODEL_AND_DEMO_DATA.md) · [Database schema](DATABASE_SCHEMA.md) · [Agent tool specifications](AGENT_TOOL_SPECIFICATIONS.md) · [Workflows and approvals](06_WORKFLOWS_AND_APPROVALS.md) · [Integrations](09_INTEGRATIONS.md)

## 1. Contract conventions

Paths are proposed REST-style resources under `/api/v1`; the actual CAP protocol, OData/REST exposure, service names, identity mechanism, and deployment base path remain unselected. JSON uses `camelCase`, IDs are opaque strings, instants are RFC 3339, and quantities always include units. All records disclose `dataMode` and source/verification state where relevant.

### Request identity and authorization

- Every request requires a verified authenticated principal in the eventual production design. No authentication provider is selected in this phase.
- CAP derives user/service identity, role, organization scope, and permitted action; never trust client-supplied role or `actorId`.
- Agents call only scoped backend tools with server-created task scope. Agent endpoints do not expose approval or direct protected execution.
- Supply Chain Head is final approver for all eight protected categories.
- All contracts are proposed and must be versioned and tested before implementation.

### Response envelope

```json
{
  "data": {},
  "meta": {
    "requestId": "REQ-DEMO-001",
    "correlationId": "COR-DEMO-001",
    "dataMode": "synthetic",
    "sourceStatus": "synthetic",
    "page": { "limit": 50, "nextCursor": null }
  }
}
```

`meta` fields that do not apply may be omitted. Pagination is cursor-based conceptually; cursor encoding is not specified. A response must not imply live connectivity or real delivery when data is simulated.

### Error envelope

```json
{
  "error": {
    "code": "STALE_VERSION",
    "message": "The proposal changed after review.",
    "details": [{ "field": "proposalVersion", "reason": "Refresh and submit a new version." }],
    "retryable": false,
    "correlationId": "COR-DEMO-001"
  }
}
```

Proposed HTTP status mapping: `400` invalid input; `401` unauthenticated; `403` not authorized; `404` absent or not visible; `409` state/version/idempotency conflict; `412` failed precondition/ETag mismatch; `422` business validation; `429` rate limit if later configured; `500` unexpected server failure; `502/503/504` adapter unavailable/timeout. Errors omit credentials, stack traces, inaccessible-record existence, and raw provider payloads. `OUTCOME_UNKNOWN` is a stateful result and must not be collapsed into a confirmed failure.

### Idempotency and concurrency

For `POST` requests that create a workflow case or may initiate an external side effect, clients provide `Idempotency-Key`; CAP scopes it to authenticated actor, operation, and request body. Same key/body returns the original resource/state; same key with different body returns `409 IDEMPOTENCY_CONFLICT`. Use `ETag`/`If-Match` for mutable proposal/draft versions and approval decisions. Side-effect retries require reconciliation of any unknown outcome; HTTP retry alone must never repeat an order, transfer, message, payment, or route change.

## 2. Endpoint catalogue

The request/response descriptions are semantic shapes. Entity fields refer to [08_DATA_MODEL_AND_DEMO_DATA.md](08_DATA_MODEL_AND_DEMO_DATA.md); tool calls must follow [AGENT_TOOL_SPECIFICATIONS.md](AGENT_TOOL_SPECIFICATIONS.md).

| Method and path | Purpose and request / response | Authentication and authorization | Validation, approval, errors and retry |
|---|---|---|---|
| `GET /dashboard/overview` | Role-scoped dashboard totals, active incident, coverage, pending decisions, source/freshness and estimate labels. Query: `incidentId?`. | Authenticated human; CAP scopes role and records. | Read-only, `404` if not visible; stale/missing metrics marked unavailable, not fabricated. |
| `GET /suppliers` | Search suppliers. Query: `q?`, `state?`, `cursor?`, `limit?`. Response: supplier summaries. | Human or scoped agent read. | Validate filters/limit; omit restricted fields. |
| `GET /suppliers/{supplierId}` | Supplier detail and data provenance. | Human/agent with supplier-scope read. | `404` not visible/absent; qualification does not itself authorize purchase. |
| `GET /suppliers/{supplierId}/qualifications` | Per-product/check verification state and evidence references. | Procurement, Compliance / Auditor, Supply Chain Head or scoped agent. | Only evidence-backed states; failed/expired/unverified stay distinct. |
| `GET /suppliers/{supplierId}/status-events` | Append-only supplier state-transition history. | Procurement, Compliance / Auditor, Supply Chain Head or scoped agent. | Events are not qualification evidence; apply record scope and source/data-mode labels. |
| `PUT /suppliers/{supplierId}/qualifications/{qualificationId}` | Submit human verification result/evidence references. | Authorized Procurement/Compliance human per future access policy; agent cannot certify. | `checkState`, reviewer and evidence validated server-side; supplier addition/change still needs Supply Chain Head approval. `If-Match`; audit write required. |
| `POST /supplier-change-proposals` | Draft supplier addition/change; body includes supplier fields, rationale, and evidence refs. | Procurement human or scoped Level 2 agent via CAP. | Creates proposal only; does not mutate approved-supplier master data. Compliance review and Supply Chain Head final approval required before application; `Idempotency-Key`. |
| `GET /products` | Product and material catalog, optional `q`. | Authenticated scoped read. | Expose units/strength; no unsupported product claims. |
| `GET /inventory` | Inventory snapshot. Query: `materialId`, `warehouseId`, `asOf?`. | Authorized human/scoped agent read. | Snapshot time/source required; do not aggregate different snapshots; stale/unknown reported. |
| `GET /purchase-orders` | Scoped purchase order headers/lines. Query: `supplierId?`, `state?`, `incidentId?`, pagination. | Procurement Manager and other confirmed readers. | Exclude restricted commercial fields; records disclose source/data mode. |
| `GET /purchase-orders/{purchaseOrderId}` | Read purchase order and associated approval/execution state. | Procurement Manager and authorized reviewers. | Order status never implies the provider received it unless a verified/simulated event establishes that. |
| `POST /purchase-order-drafts` | Prepare a non-binding purchase-order draft. Body: supplier, material lines, quantity/unit, evidence refs, recovery action ref. | Procurement human or scoped Level 2 agent via CAP. | Draft only; alternative purchase requires all qualification checks and Supply Chain Head final approval before dispatch. `Idempotency-Key`. |
| `GET /shipments` | Shipment list. Query: `incidentId?`, `state?`, `cursor?`, `limit?`. | Logistics and other authorized scoped readers. | No live ETA unless source verified; response includes `sourceStatus`, `observedAt`. |
| `GET /shipments/{shipmentId}/events` | Ordered source-backed shipment event history. | Scoped read. | Events preserve provenance and timestamps; unavailable status explicit. |
| `POST /shipments/{shipmentId}/route-change-proposals` | Prepare route/carrier change proposal. Body: candidate route/carrier refs, rationale, evidence refs. | Logistics human or scoped Level 2 agent via CAP. | Does not update shipment or reserve capacity; Supply Chain Head approval and execution recheck required. `Idempotency-Key`. |
| `GET /production-plans` | Production schedule/read view. Query: `facilityId`, `from?`, `to?`. | Factory Manager and authorized reviewers. | Read-only endpoint; schedule modifications must use proposal/approval workflow. |
| `POST /production-plans/proposals` | Draft production schedule change. Body: facility/product, period, proposed quantity, rationale, evidence refs. | Factory Manager or scoped Level 2 agent via CAP. | Creates new proposal version only; schedule remains unchanged until Supply Chain Head approval and authorized execution. `If-Match`, `Idempotency-Key`. |
| `GET /customers` | Scoped synthetic/operational customer directory. | Customer / Export Manager and permitted reviewers. | No contact PII unless explicitly authorized and required. |
| `GET /customer-orders` | Orders/lines/fulfilments. Query: `customerId?`, `state?`, `from?`, `to?`. | Customer / Export Manager and authorized scoped roles. | Missing dates/quantities remain absent; field authorization applied. |
| `POST /customer-orders/reallocation-proposals` | Draft customer-order prioritization/reallocation scenario. Body: order lines, quantities, rationale, policy ref, evidence refs. | Customer / Export Manager, Warehouse Manager or scoped Level 2 agent via CAP. | No allocation policy is presumed; provisional policy remains proposed. No order changes before Supply Chain Head approval and authorized execution. |
| `POST /financial-commitment-proposals` | Draft payment/financial commitment for review. Body: authorized beneficiary ref, amount/currency/terms when evidenced, rationale, evidence refs. | Authorized human proposal owner; exact finance review role pending. | Never initiates payment; Supply Chain Head final approval required. No payment adapter/tool is defined. |
| `POST /disruptions` | Create incident intake. Body: title, product/supplier/shipment refs, reported delay, source/evidence refs, `dataMode`. | Human or verified source adapter; agent may create scoped analysis only through tool. | Validate all refs, non-negative days and provenance; creates `monitoring`, not an operational action. `Idempotency-Key`. |
| `GET /disruptions/{disruptionId}` | Incident details and source/freshness. | Authorized human/agent scope. | `404` not visible; do not imply source confirmation. |
| `GET /disruptions/{disruptionId}/risk-assessments` | List risk assessments. | Authorized human/scoped agent. | Each assessment includes method, input refs, timestamp, severity and data mode. |
| `POST /disruptions/{disruptionId}/impact-estimates` | Request deterministic estimate. Body: estimate type, input/assumption refs. | Authorized user or agent tool via CAP. | Validate units/method and source; label synthetic estimate; no patient-level output or patient outcome prediction. |
| `POST /recovery-plans` | Create plan draft. Body: disruption ref, summary, actions, assumptions, allocation-policy ref. Response includes plan/version. | Human or orchestrator with scoped Level 2 permission. | Draft only; allocation policy may be `proposed`; no protected side effect. `Idempotency-Key`. |
| `GET /recovery-plans/{planId}` | Read plan, versions, actions and evidence links. | Authorized incident scope. | Return decision/execution state separately. |
| `POST /recovery-plans/{planId}/actions` | Add a recovery-action proposal. Body: action category/type, target ref, details, evidence refs. | Human or scoped specialist through CAP. | Validate protected category and schema; creates new version/draft; never executes. `If-Match`, `Idempotency-Key`. |
| `POST /approval-requests` | Submit a specific proposal version for approval. Body: `recoveryActionId`, `proposalVersion`, `actionCategory`, evidence refs. | Authenticated human or orchestrator allowed to submit; no agent approval privilege. | Protected action requires Supply Chain Head final decision. Verify complete/current proposal; `Idempotency-Key`; `409` stale/conflict. |
| `GET /approval-requests` | Review queue. Query: `state?`, `incidentId?`, `cursor?`, `limit?`. | Supply Chain Head and permitted reviewers. | Queue scoped by authorization; pending vs decision vs execution states distinct. |
| `GET /approval-requests/{requestId}` | Proposal version, evidence, decision history and execution state. | Authorized reviewer. | Immutable version binding; inaccessible references explained safely. |
| `POST /approval-requests/{requestId}/decisions` | Human decision. Body: `decision` (`approve`, `reject`, `request_changes`, `escalate`, `revoke`), `proposalVersion`, `reason?`. | Authenticated Supply Chain Head for final protected approval; other review paths only if later specified. Agents/services cannot decide. | Must match current version; verify role and allowed transition; `If-Match`, `Idempotency-Key`; rejection/change never executes. Append-only decision/audit. |
| `POST /recovery-actions/{actionId}/execute` | Request CAP-controlled dispatch of an approved action. Body: proposal version and approval ref. | Authenticated, action-authorized human/service; never agent-only. | Server rechecks current approval, exact version, evidence, preconditions, idempotency and audit readiness. Only CAP adapter dispatches; `409/412` stale, `OUTCOME_UNKNOWN` reconciliation, no blind retry. |
| `GET /recovery-actions/{actionId}/executions` | Read dispatch, result and verification states. | Authorized operator/reviewer. | Distinguish approved, dispatched, succeeded/failed/unknown and independently verified. |
| `GET /agents` | Agent catalog/status. | Authorized operational viewer. | Names are proposed roles; response explicitly indicates implementation/status. |
| `POST /agent-executions` | Submit bounded analysis task. Body: objective, incident ref, authorized evidence refs, requested agent role(s), allowed tool names. | Human/orchestrator; CAP derives scope and tool allowlist. | Reject client-supplied permissions/role elevation; asynchronous state; `Idempotency-Key`. No side effect beyond analysis/proposal. |
| `GET /agent-executions/{executionId}` | Task progress/result/failure/evidence. | Task owner and authorized reviewers. | No private chain-of-thought; explicit partial/failed states. |
| `GET /tool-invocations` | Search tool invocation summaries by task/incident/state. | Authorized auditor/operator; scoped agent sees only own task. | Redact inputs; no credentials or arbitrary payload retrieval. |
| `GET /voice-calls` | Read call metadata/summary. | Authorized human; sensitive scope limited. | No transcript by default; verbal claims remain unverified until corroborated. |
| `POST /voice-calls` | Human-requested call. Body: recipient ref, purpose, consent reference, incident ref. | Authenticated human, provider/consent verified; agents cannot autonomously initiate. | If provider is unconfigured, return explicit unavailable; no implied call. Do not retry unknown dispatch blindly; idempotency required. |
| `POST /email-drafts` | Prepare email draft. Body: recipient ref, purpose, verified fact refs, draft text. | Authorized human or Level 2 agent via CAP. | Draft only; reject unsupported recipient/commitment data or flag for review. `Idempotency-Key`. |
| `PATCH /email-drafts/{draftId}` | Edit draft content/recipient. | Authorized human. | `If-Match`; increments content version and invalidates prior approval. |
| `POST /email-drafts/{draftId}/send` | Request sending of approved message. Body: approval ref and content version. | CAP adapter only after authenticated human approval; no direct agent send. | Major customer disruption notice requires Supply Chain Head final approval; exact content/recipient match; idempotency and reconciliation mandatory. |
| `GET /communications/{deliveryId}` | Read simulated/live provider outcome where available. | Authorized communication owner/auditor. | `simulated_delivered` never presented as live delivery; unknown remains unknown. |
| `GET /suspicious-activity-alerts` | Read alerts by state/type/incident. | Compliance / Auditor and scoped authorized users. | Neutral wording; alert is not a guilt finding. |
| `POST /suspicious-activity-alerts` | Create evidence-backed flag. Body: subject, allowlisted alert type, neutral rationale, evidence refs. | Scoped agent/human via CAP. | Does not itself place a hold; transaction hold requires separately authorized workflow. `Idempotency-Key`. |
| `GET /audit-events` | Search audit history. Query: incident, actor, resource, time range, cursor. | Authorized Compliance / Auditor, Supply Chain Head and any confirmed scope. | Read-only, filters mandatory for bounded queries, redaction/field access applied; no direct audit writes. |
| `POST /agents/{agentId}/pause` | Request pause/stop. Body: reason, human confirmation ref. | Authenticated human in role confirmed by future emergency policy; not an agent. | Permission pending; explicit confirmed/failed/unknown state; audit failure blocks claimed success. |
| `POST /agents/{agentId}/resume` | Request resume after verification. Body: verification refs and confirmation. | Authorized human after pending policy defines resumer/checklist. | Block until all checks/authority defined; never self-resume. Idempotent request only. |
| `POST /emergency-stop` | Request global agent halt. Body: scope, reason, human confirmation ref. | Authorized human role pending design; never an agent. | Explicit confirmed/failed/unknown outcome, audited; no false halted state; idempotency and reconciliation required. |

## 3. Proposed request/response payload examples

### Approval decision

```json
{
  "decision": "approve",
  "proposalVersion": 1,
  "reason": "Approved for the synthetic demonstration after listed checks."
}
```

CAP obtains `decisionBy` and role from authenticated identity, not from the body. `approval-decision-request.schema.json` defines the proposed JSON Schema. This example records a synthetic scenario only.

### Recovery plan draft

```json
{
  "disruptionId": "DIS-BM-PARA-001",
  "summary": "Evaluate verified synthetic backup supply and monitor the delayed shipment.",
  "allocationPolicyRef": "POLICY-ALLOC-001",
  "actions": [
    {
      "actionType": "alternative_supplier_purchase",
      "targetRef": "SUP-IN-001",
      "evidenceRefs": ["EVD-QUAL-001"],
      "details": { "materialId": "MAT-PARA-API", "quantity": 500, "unit": "kg" }
    }
  ]
}
```

This creates a proposal only. Approval and simulated execution are distinct operations. Request schema is `recovery-plan-request.schema.json`.

## 4. Error, retry, and audit requirements

- Every response includes correlation/request reference and explicit source/data mode where applicable.
- Denied actions return `403` without leaking the existence or contents of inaccessible records.
- `400/422` validation errors identify safe field-level corrections; no partial business mutation occurs.
- `409` signals duplicate-key mismatch/state conflict/stale proposal; `412` indicates failed `If-Match`.
- Adapter timeout after dispatch returns or persists `outcome_unknown`; first reconcile provider/source status before any retry.
- Read-only requests may be retried only under later bounded adapter policy. Do not invent numeric timeout/backoff limits.
- Every material decision/approval/dispatch/verification/control request is linked to an append-only audit event. If required audit persistence fails, protected actions fail closed.
- The exact OAuth/OIDC flows, token claims, CAP service exposure, pagination, rate limits, API versioning/deprecation, CORS, and error-code registry remain pending implementation design.

## 5. Status and implementation limitations

These are proposed contracts for SAPUI5↔CAP and CAP-mediated agent/workflow/adapter interactions. No SAP Build Process Automation callback, SAP HANA persistence, SAP AI Core endpoint, supplier/logistics provider, voice service, email service, or external REST API is verified. See [09_INTEGRATIONS.md](09_INTEGRATIONS.md).
