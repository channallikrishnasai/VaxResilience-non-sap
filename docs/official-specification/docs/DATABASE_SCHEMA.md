# Proposed SAP HANA Cloud Database Schema

**Document version:** 1.0
**Project stage:** Phase 5 — Data Model, Database Schema and Integrations
**Status:** Logical-to-relational proposal only. No HANA objects, CAP entities, service bindings, or seed process are deployed.
**Related documents:** [Data model and demo data](08_DATA_MODEL_AND_DEMO_DATA.md) · [System architecture](04_SYSTEM_ARCHITECTURE.md) · [API contracts](API_CONTRACTS.md) · [Security and audit](07_SECURITY_AND_AUDIT.md)

## 1. Design and CAP mapping

SAP HANA Cloud is the selected planned persistence technology. This schema is an implementation-neutral relational proposal; exact CAP CDS syntax, generated names, HANA deployment artifacts, tenant model, and migration process require implementation design. Do not execute this document as a deployed schema.

Proposed mapping:

- CAP service entities map to application-owned HANA tables/views through CAP persistence; external reads/writes remain behind adapters.
- Use explicit CAP associations for FKs and compositions for owned children (e.g., order → lines, plan → actions); avoid duplicate embedded copies of mutable master data.
- Master entities are referenced by stable IDs. Snapshots retain source/provenance and observed time.
- Workflow, decision, communication delivery, tool invocation, and audit event records are append-only or versioned. Operational current-state values may be updated only through authorized CAP services and recorded transitions.
- HANA database authorization/service bindings remain server-side. SAPUI5 and agents do not connect directly.

## 2. Type, key, and time conventions

| Logical type | Proposed HANA mapping | Rule |
|---|---|---|
| Opaque ID | `NVARCHAR(64)` | Stable application-generated identifier; primary keys are not sequential business numbers. |
| Short name/code | `NVARCHAR(120)` / `NVARCHAR(40)` | Apply field-specific maximums and uniqueness where noted. |
| Description/summary | `NVARCHAR(1000)` or `NCLOB` | Minimize and redact; avoid storing raw transcripts or prompts. |
| Status/type | `NVARCHAR(40)` | Controlled values validated by CAP; lookup table may be used if lifecycle requires administration. |
| Quantity / ratio | `DECIMAL(18,3)` | Non-negative unless a signed movement delta is explicitly modeled; unit is a separate column. |
| Monetary amount | `DECIMAL(19,4)` | Currency code separately stored (ISO 4217); no invented price values. |
| Date | `DATE` | Local business date where date-only semantics apply. |
| Instant | `TIMESTAMP` | Store UTC; API emits RFC 3339 with `Z`/offset. |
| Boolean | `BOOLEAN` | Use for flags only, not a workflow state. |
| Structured metadata | `NCLOB` containing validated JSON or normalized child rows | Do not use as a substitute for FK-bearing relational fields. Validate JSON in CAP. |

Each mutable table should include `CREATED_AT TIMESTAMP NOT NULL`, `CREATED_BY NVARCHAR(64) NOT NULL`, `UPDATED_AT TIMESTAMP NOT NULL`, `UPDATED_BY NVARCHAR(64) NOT NULL`, and `ROW_VERSION INTEGER NOT NULL`. Immutable records use `RECORDED_AT`, actor, and correlation fields instead of ordinary updates. `DATA_MODE` is `synthetic`, `simulated`, or later `live_verified`; the last value is unavailable until an integration is verified.

## 3. Proposed table catalogue

Abbreviations: `PK` primary key, `FK` foreign key, `NN` not null, `UQ` unique. Unless described as immutable, mutable tables carry the metadata columns above. Common metadata is omitted from each row for readability.

### Master and authorization tables

| Table | Columns (type; nullability; key/constraint) |
|---|---|
| `ORGANIZATION` | `ORGANIZATION_ID NVARCHAR(64) PK`; `LEGAL_NAME NVARCHAR(200) NN`; `DISPLAY_NAME NVARCHAR(200) NN`; `COUNTRY_CODE NVARCHAR(2) NN`; `CITY NVARCHAR(100) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `USER_ACCOUNT` | `USER_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `ROLE_ID NVARCHAR(64) FK NN`; `DISPLAY_NAME NVARCHAR(120) NN`; `ACCOUNT_STATE NVARCHAR(20) NN`; `IS_SYNTHETIC_IDENTITY BOOLEAN NN`. No password/token columns. |
| `ROLE` | `ROLE_ID NVARCHAR(64) PK`; `ROLE_NAME NVARCHAR(80) UQ NN`; `DESCRIPTION NVARCHAR(500) NN`. Seed only seven established roles. |
| `PERMISSION` | `PERMISSION_ID NVARCHAR(64) PK`; `RESOURCE NVARCHAR(80) NN`; `ACTION NVARCHAR(40) NN`; `SCOPE_DESCRIPTION NVARCHAR(500) NN`; `UQ(RESOURCE,ACTION)`. |
| `ROLE_PERMISSION` | `ROLE_ID NVARCHAR(64) FK PK`; `PERMISSION_ID NVARCHAR(64) FK PK`; `GRANT_STATE NVARCHAR(20) NN`; `SCOPE_DESCRIPTION NVARCHAR(500) NN`. Must not encode final protected approval outside explicit policy. |
| `SUPPLIER` | `SUPPLIER_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `SUPPLIER_NAME NVARCHAR(200) NN`; `COUNTRY_CODE NVARCHAR(2) NN`; `CITY NVARCHAR(100) NN`; `SUPPLIER_STATE NVARCHAR(40) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `SUPPLIER_STATUS_EVENT` | `SUPPLIER_STATUS_EVENT_ID NVARCHAR(64) PK`; `SUPPLIER_ID NVARCHAR(64) FK NN`; `PREVIOUS_STATE NVARCHAR(40) NN`; `NEW_STATE NVARCHAR(40) NN`; `CHANGED_AT TIMESTAMP NN`; `REASON NVARCHAR(500) NN`; `DATA_MODE NVARCHAR(20) NN`. Immutable transition history; does not replace qualification evidence. |
| `PRODUCT` | `PRODUCT_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `PRODUCT_NAME NVARCHAR(200) NN`; `STRENGTH NVARCHAR(40) NN`; `DOSAGE_FORM NVARCHAR(60) NN`; `BASE_UNIT NVARCHAR(20) NN`; `PRODUCT_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `MATERIAL` | `MATERIAL_ID NVARCHAR(64) PK`; `MATERIAL_NAME NVARCHAR(200) NN`; `MATERIAL_TYPE NVARCHAR(30) NN`; `BASE_UNIT NVARCHAR(20) NN`; `MATERIAL_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `PRODUCT_MATERIAL` | `PRODUCT_ID NVARCHAR(64) FK PK`; `MATERIAL_ID NVARCHAR(64) FK PK`; `EFFECTIVE_FROM DATE PK`; `QUANTITY_PER_BASE_UNIT DECIMAL(18,6) NN`; `UNIT NVARCHAR(20) NN`; `EFFECTIVE_TO DATE NULL`. |
| `SUPPLIER_QUALIFICATION` | `QUALIFICATION_ID NVARCHAR(64) PK`; `SUPPLIER_ID NVARCHAR(64) FK NN`; `PRODUCT_ID NVARCHAR(64) FK NN`; `CHECK_TYPE NVARCHAR(40) NN`; `CHECK_STATE NVARCHAR(20) NN`; `EVIDENCE_ID NVARCHAR(64) FK NN`; `REVIEWED_BY NVARCHAR(64) FK NULL`; `REVIEWED_AT TIMESTAMP NULL`; `VALID_UNTIL DATE NULL`; `DATA_MODE NVARCHAR(20) NN`; `UQ(SUPPLIER_ID,PRODUCT_ID,CHECK_TYPE,REVIEWED_AT)`. |
| `FACILITY` | `FACILITY_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `FACILITY_NAME NVARCHAR(200) NN`; `CITY NVARCHAR(100) NN`; `COUNTRY_CODE NVARCHAR(2) NN`; `FACILITY_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `WAREHOUSE` | `WAREHOUSE_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `FACILITY_ID NVARCHAR(64) FK NULL`; `WAREHOUSE_NAME NVARCHAR(200) NN`; `CITY NVARCHAR(100) NN`; `COUNTRY_CODE NVARCHAR(2) NN`; `WAREHOUSE_TYPE NVARCHAR(30) NN`; `WAREHOUSE_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `PORT` | `PORT_ID NVARCHAR(64) PK`; `PORT_NAME NVARCHAR(160) NN`; `CITY NVARCHAR(100) NN`; `COUNTRY_CODE NVARCHAR(2) NN`; `PORT_TYPE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `ROUTE` | `ROUTE_ID NVARCHAR(64) PK`; `ROUTE_NAME NVARCHAR(200) NN`; `ORIGIN_REF NVARCHAR(64) NN`; `DESTINATION_REF NVARCHAR(64) NN`; `MODE_SUMMARY NVARCHAR(300) NN`; `ROUTE_STATE NVARCHAR(30) NN`; `WAYPOINTS_JSON NCLOB NN`; `DATA_MODE NVARCHAR(20) NN`. Typed origin/destination references validated by CAP. |
| `CUSTOMER` | `CUSTOMER_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `CUSTOMER_NAME NVARCHAR(160) NN`; `CUSTOMER_TYPE NVARCHAR(30) NN`; `CITY NVARCHAR(100) NN`; `COUNTRY_CODE NVARCHAR(2) NN`; `CUSTOMER_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `DEMAND_ASSUMPTION` | `ASSUMPTION_ID NVARCHAR(64) PK`; `CUSTOMER_ID NVARCHAR(64) FK NULL` (null only for a documented aggregate); `PRODUCT_ID NVARCHAR(64) FK NN`; `DAILY_DEMAND DECIMAL(18,3) NN`; `UNIT NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. Aggregate rows must reconcile with included customer rows. |
| `AGENT` | `AGENT_ID NVARCHAR(64) PK`; `AGENT_NAME NVARCHAR(100) NN`; `AGENT_ROLE NVARCHAR(100) NN`; `AGENT_STATE NVARCHAR(30) NN`; `PROMPT_VERSION NVARCHAR(40) NN`; `IS_PROPOSED BOOLEAN NN`; `DATA_MODE NVARCHAR(20) NN`. |

### Transaction and operations tables

| Table | Columns (type; nullability; key/constraint) |
|---|---|
| `INVENTORY_BATCH` | `BATCH_ID NVARCHAR(64) PK`; `MATERIAL_ID NVARCHAR(64) FK NN`; `LOT_CODE NVARCHAR(80) NN`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `MANUFACTURED_ON DATE NULL`; `EXPIRES_ON DATE NULL`; `QUALITY_STATE NVARCHAR(30) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`; `UQ(MATERIAL_ID,LOT_CODE)`. |
| `INVENTORY_POSITION` | `INVENTORY_ID NVARCHAR(64) PK`; `MATERIAL_ID NVARCHAR(64) FK NN`; `WAREHOUSE_ID NVARCHAR(64) FK NN`; `BATCH_ID NVARCHAR(64) FK NULL`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `AS_OF TIMESTAMP NN`; `COVERAGE_DAYS DECIMAL(10,2) NULL`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. Snapshot rows are not summed across different `AS_OF` values. |
| `PURCHASE_ORDER` | `PURCHASE_ORDER_ID NVARCHAR(64) PK`; `SUPPLIER_ID NVARCHAR(64) FK NN`; `ORDERED_AT TIMESTAMP NN`; `CURRENCY NVARCHAR(3) NN`; `ORDER_STATE NVARCHAR(30) NN`; `APPROVAL_REQUEST_ID NVARCHAR(64) FK NULL`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `PURCHASE_ORDER_LINE` | `PURCHASE_ORDER_LINE_ID NVARCHAR(64) PK`; `PURCHASE_ORDER_ID NVARCHAR(64) FK NN`; `MATERIAL_ID NVARCHAR(64) FK NN`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `UNIT_PRICE DECIMAL(19,4) NULL`; `LINE_STATE NVARCHAR(30) NN`. |
| `SHIPMENT` | `SHIPMENT_ID NVARCHAR(64) PK`; `PURCHASE_ORDER_ID NVARCHAR(64) FK NULL`; `ROUTE_ID NVARCHAR(64) FK NN`; `CARRIER_REF NVARCHAR(64) NULL`; `ORIGIN_REF NVARCHAR(64) NN`; `DESTINATION_REF NVARCHAR(64) NN`; `PLANNED_ARRIVAL DATE NN`; `REVISED_ARRIVAL DATE NULL`; `ACTUAL_ARRIVAL DATE NULL`; `SHIPMENT_STATE NVARCHAR(30) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `SHIPMENT_EVENT` | `SHIPMENT_EVENT_ID NVARCHAR(64) PK`; `SHIPMENT_ID NVARCHAR(64) FK NN`; `EVENT_TYPE NVARCHAR(40) NN`; `EVENT_AT TIMESTAMP NN`; `DESCRIPTION NVARCHAR(500) NN`; `SOURCE_REF NVARCHAR(120) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. Immutable event. |
| `PRODUCTION_PLAN` | `PRODUCTION_PLAN_ID NVARCHAR(64) PK`; `FACILITY_ID NVARCHAR(64) FK NN`; `PRODUCT_ID NVARCHAR(64) FK NN`; `PERIOD_START DATE NN`; `PERIOD_END DATE NN`; `PLANNED_QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `PLAN_STATE NVARCHAR(30) NN`; `APPROVAL_REQUEST_ID NVARCHAR(64) FK NULL`; `DATA_MODE NVARCHAR(20) NN`. |
| `PRODUCTION_BATCH` | `PRODUCTION_BATCH_ID NVARCHAR(64) PK`; `PRODUCTION_PLAN_ID NVARCHAR(64) FK NN`; `BATCH_CODE NVARCHAR(80) NN`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `STARTED_AT TIMESTAMP NN`; `COMPLETED_AT TIMESTAMP NULL`; `BATCH_STATE NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`; `UQ(PRODUCTION_PLAN_ID,BATCH_CODE)`. |
| `PRODUCTION_CONSUMPTION` | `CONSUMPTION_ID NVARCHAR(64) PK`; `PRODUCTION_BATCH_ID NVARCHAR(64) FK NN`; `MATERIAL_ID NVARCHAR(64) FK NN`; `INVENTORY_BATCH_ID NVARCHAR(64) FK NN`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `CONSUMED_AT TIMESTAMP NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `CUSTOMER_ORDER` | `CUSTOMER_ORDER_ID NVARCHAR(64) PK`; `CUSTOMER_ID NVARCHAR(64) FK NN`; `ORDERED_AT TIMESTAMP NN`; `REQUIRED_DELIVERY_DATE DATE NN`; `ORDER_STATE NVARCHAR(30) NN`; `CURRENCY NVARCHAR(3) NULL`; `DATA_MODE NVARCHAR(20) NN`. |
| `ORDER_LINE` | `ORDER_LINE_ID NVARCHAR(64) PK`; `CUSTOMER_ORDER_ID NVARCHAR(64) FK NN`; `PRODUCT_ID NVARCHAR(64) FK NN`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `LINE_STATE NVARCHAR(30) NN`. |
| `ORDER_FULFILMENT` | `FULFILMENT_ID NVARCHAR(64) PK`; `ORDER_LINE_ID NVARCHAR(64) FK NN`; `QUANTITY DECIMAL(18,3) NN`; `WAREHOUSE_ID NVARCHAR(64) FK NN`; `FULFILMENT_STATE NVARCHAR(30) NN`; `APPROVAL_REQUEST_ID NVARCHAR(64) FK NULL`; `DATA_MODE NVARCHAR(20) NN`. |
| `DELIVERY` | `DELIVERY_ID NVARCHAR(64) PK`; `FULFILMENT_ID NVARCHAR(64) FK NN`; `SHIPMENT_ID NVARCHAR(64) FK NULL`; `QUANTITY DECIMAL(18,3) NN`; `UNIT NVARCHAR(20) NN`; `DESPATCHED_AT TIMESTAMP NULL`; `DELIVERED_AT TIMESTAMP NULL`; `DELIVERY_STATE NVARCHAR(30) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. |

### Incident, workflow, AI, communication, and audit tables

| Table | Columns (type; nullability; key/constraint) |
|---|---|
| `DISRUPTION` | `DISRUPTION_ID NVARCHAR(64) PK`; `ORGANIZATION_ID NVARCHAR(64) FK NN`; `TITLE NVARCHAR(200) NN`; `PRODUCT_ID NVARCHAR(64) FK NN`; `SUPPLIER_ID NVARCHAR(64) FK NN`; `SHIPMENT_ID NVARCHAR(64) FK NULL`; `DETECTED_AT TIMESTAMP NN`; `REPORTED_DELAY_DAYS DECIMAL(10,2) NN`; `INCIDENT_STATE NVARCHAR(30) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `EVIDENCE` | `EVIDENCE_ID NVARCHAR(64) PK`; `SUBJECT_TYPE NVARCHAR(50) NN`; `SUBJECT_ID NVARCHAR(64) NN`; `EVIDENCE_TYPE NVARCHAR(50) NN`; `SOURCE_LABEL NVARCHAR(160) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `OBSERVED_AT TIMESTAMP NN`; `VERIFIED_BY NVARCHAR(64) FK NULL`; `VERIFIED_AT TIMESTAMP NULL`; `DATA_MODE NVARCHAR(20) NN`. Artifact content is external/reference-only unless separately approved. |
| `RISK_ASSESSMENT` | `RISK_ASSESSMENT_ID NVARCHAR(64) PK`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `ASSESSED_AT TIMESTAMP NN`; `RISK_TYPE NVARCHAR(40) NN`; `SEVERITY NVARCHAR(20) NN`; `SUMMARY NVARCHAR(1000) NN`; `METHOD NVARCHAR(120) NN`; `INPUT_REFS_JSON NCLOB NN`; `ASSESSMENT_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `IMPACT_ESTIMATE` | `IMPACT_ESTIMATE_ID NVARCHAR(64) PK`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `ESTIMATE_TYPE NVARCHAR(40) NN`; `VALUE DECIMAL(18,3) NN`; `UNIT NVARCHAR(30) NN`; `METHOD NVARCHAR(160) NN`; `INPUT_REFS_JSON NCLOB NN`; `ASSUMPTION_REFS_JSON NCLOB NN`; `ESTIMATE_LABEL NVARCHAR(100) NN`; `CALCULATED_AT TIMESTAMP NN`; `DATA_MODE NVARCHAR(20) NN`. |
| `RECOVERY_PLAN` | `RECOVERY_PLAN_ID NVARCHAR(64) PK`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `VERSION INTEGER NN`; `PLAN_STATE NVARCHAR(30) NN`; `SUMMARY NVARCHAR(1000) NN`; `ALLOCATION_POLICY_REF NVARCHAR(64) NULL`; `CREATED_BY NVARCHAR(64) FK NN`; `DATA_MODE NVARCHAR(20) NN`; `UQ(DISRUPTION_ID,VERSION)`. |
| `RECOVERY_ACTION` | `RECOVERY_ACTION_ID NVARCHAR(64) PK`; `RECOVERY_PLAN_ID NVARCHAR(64) FK NN`; `ACTION_TYPE NVARCHAR(50) NN`; `ACTION_STATE NVARCHAR(40) NN`; `TARGET_REF NVARCHAR(64) NULL`; `PROPOSAL_VERSION INTEGER NN`; `EXECUTION_REF NVARCHAR(64) NULL`; `DATA_MODE NVARCHAR(20) NN`. |
| `APPROVAL_REQUEST` | `APPROVAL_REQUEST_ID NVARCHAR(64) PK`; `RECOVERY_ACTION_ID NVARCHAR(64) FK NN`; `ACTION_CATEGORY NVARCHAR(50) NN`; `PROPOSAL_VERSION INTEGER NN`; `SUBMITTED_BY NVARCHAR(64) FK NN`; `SUBMITTED_AT TIMESTAMP NN`; `APPROVER_ROLE_ID NVARCHAR(64) FK NN`; `REQUEST_STATE NVARCHAR(30) NN`; `IDEMPOTENCY_KEY NVARCHAR(128) UQ NN`. |
| `APPROVAL_DECISION` | `APPROVAL_DECISION_ID NVARCHAR(64) PK`; `APPROVAL_REQUEST_ID NVARCHAR(64) FK NN`; `PROPOSAL_VERSION INTEGER NN`; `DECISION NVARCHAR(30) NN`; `DECISION_BY NVARCHAR(64) FK NN`; `DECIDED_AT TIMESTAMP NN`; `REASON NVARCHAR(1000) NULL`; `EVIDENCE_REFS_JSON NCLOB NN`. Immutable. |
| `AGENT_EXECUTION` | `AGENT_EXECUTION_ID NVARCHAR(64) PK`; `AGENT_ID NVARCHAR(64) FK NN`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `TASK_ID NVARCHAR(64) NN`; `STARTED_AT TIMESTAMP NN`; `COMPLETED_AT TIMESTAMP NULL`; `EXECUTION_STATE NVARCHAR(30) NN`; `SUMMARY NVARCHAR(1000) NN`; `EVIDENCE_REFS_JSON NCLOB NN`; `FAILURE_CODE NVARCHAR(60) NULL`; `DATA_MODE NVARCHAR(20) NN`. |
| `TOOL_INVOCATION` | `TOOL_INVOCATION_ID NVARCHAR(64) PK`; `AGENT_EXECUTION_ID NVARCHAR(64) FK NULL`; `TOOL_NAME NVARCHAR(100) NN`; `REQUEST_REF NVARCHAR(128) NN`; `STARTED_AT TIMESTAMP NN`; `COMPLETED_AT TIMESTAMP NULL`; `RESULT_STATE NVARCHAR(30) NN`; `SOURCE_STATUS NVARCHAR(30) NN`; `IDEMPOTENCY_KEY NVARCHAR(128) NULL`; `DATA_MODE NVARCHAR(20) NN`. |
| `VOICE_CALL` | `VOICE_CALL_ID NVARCHAR(64) PK`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `INITIATED_BY NVARCHAR(64) FK NN`; `RECIPIENT_ROLE NVARCHAR(100) NN`; `PURPOSE NVARCHAR(300) NN`; `CONSENT_STATE NVARCHAR(30) NN`; `CALL_STATE NVARCHAR(30) NN`; `SUMMARY NVARCHAR(2000) NULL`; `VERIFICATION_STATE NVARCHAR(30) NN`; `STARTED_AT TIMESTAMP NULL`; `ENDED_AT TIMESTAMP NULL`; `DATA_MODE NVARCHAR(20) NN`. No phone or raw transcript in demo. |
| `EMAIL_DRAFT` | `EMAIL_DRAFT_ID NVARCHAR(64) PK`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `RECIPIENT_REF NVARCHAR(120) NN`; `PURPOSE NVARCHAR(200) NN`; `CONTENT NCLOB NN`; `CONTENT_VERSION INTEGER NN`; `DRAFT_STATE NVARCHAR(30) NN`; `CREATED_BY NVARCHAR(64) FK NN`; `APPROVAL_REQUEST_ID NVARCHAR(64) FK NULL`; `DATA_MODE NVARCHAR(20) NN`. Each edit increments version. |
| `COMMUNICATION_DELIVERY` | `COMMUNICATION_DELIVERY_ID NVARCHAR(64) PK`; `EMAIL_DRAFT_ID NVARCHAR(64) FK NULL`; `VOICE_CALL_ID NVARCHAR(64) FK NULL`; `DELIVERY_STATE NVARCHAR(30) NN`; `PROVIDER_STATUS_REF NVARCHAR(128) NULL`; `ATTEMPTED_AT TIMESTAMP NULL`; `COMPLETED_AT TIMESTAMP NULL`; `DATA_MODE NVARCHAR(20) NN`. Exactly one communication parent; simulated result is visibly simulated. |
| `SUSPICIOUS_ACTIVITY_ALERT` | `ALERT_ID NVARCHAR(64) PK`; `DISRUPTION_ID NVARCHAR(64) FK NN`; `SUBJECT_TYPE NVARCHAR(50) NN`; `SUBJECT_ID NVARCHAR(64) NN`; `ALERT_TYPE NVARCHAR(50) NN`; `NEUTRAL_RATIONALE NVARCHAR(1000) NN`; `EVIDENCE_REFS_JSON NCLOB NN`; `ALERT_STATE NVARCHAR(30) NN`; `HOLD_STATE NVARCHAR(30) NN`; `DATA_MODE NVARCHAR(20) NN`. Do not encode an accusation or imply a hold without authorized state. |
| `AUDIT_EVENT` | `AUDIT_EVENT_ID NVARCHAR(64) PK`; `EVENT_TYPE NVARCHAR(60) NN`; `ACTOR_TYPE NVARCHAR(20) NN`; `ACTOR_ID NVARCHAR(64) NN`; `ROLE_ID NVARCHAR(64) FK NULL`; `OCCURRED_AT TIMESTAMP NN`; `RECORDED_AT TIMESTAMP NN`; `RESOURCE_TYPE NVARCHAR(60) NN`; `RESOURCE_ID NVARCHAR(64) NN`; `DISRUPTION_ID NVARCHAR(64) FK NULL`; `CORRELATION_ID NVARCHAR(128) NN`; `PROPOSAL_VERSION INTEGER NULL`; `RESULT_STATE NVARCHAR(30) NN`; `SOURCE_REFS_JSON NCLOB NN`; `REDACTION_STATE NVARCHAR(20) NN`; `DATA_MODE NVARCHAR(20) NN`. Append-only; no ordinary `UPDATED_*` columns. |

## 4. Constraints, indexes, and query patterns

### Constraints enforced by CAP and, where supported, database constraints

- All FK references must exist in the same organization/tenant scope; cross-organization references are denied unless an explicit relationship is designed.
- Quantities are finite and non-negative; unit codes are required and compatible for calculations. Financial values require an ISO currency and may remain absent in synthetic scenario data.
- Shipment dates must satisfy `PLANNED_ARRIVAL <= REVISED_ARRIVAL` when both exist; `ACTUAL_ARRIVAL` cannot precede dispatch evidence.
- Inventory snapshots are temporal facts; never sum snapshots from different `AS_OF` instants. Batch quantity and aggregate inventory must reconcile per snapshot if both are supplied.
- Customer fulfilments/deliveries cannot exceed line quantity; production batch completion requires a completed state/time.
- Unique idempotency keys prevent duplicate approval/side-effect requests. An approval binds to one action/proposal version and Supply Chain Head identity/role.
- Changes to protected action content create a new proposal version; stale approvals are not executable.
- Email content changes invalidate the previous approval; voice results remain unverified until corroborated.
- `DATA_MODE` and `SOURCE_STATUS` must propagate to derived records. A synthetic source cannot be silently promoted to `live_verified`.
- Audit rows cannot be updated/deleted by ordinary application identities. Corrections append a related event.

### Index recommendations

Add indexes based on measured query plans, beginning with:

- Unique PKs and declared UQs; FK indexes on frequently joined foreign keys.
- `DISRUPTION(ORGANIZATION_ID, INCIDENT_STATE, DETECTED_AT)`.
- `INVENTORY_POSITION(MATERIAL_ID, WAREHOUSE_ID, AS_OF DESC)`.
- `SHIPMENT(SHIPMENT_STATE, REVISED_ARRIVAL)` and `SHIPMENT_EVENT(SHIPMENT_ID, EVENT_AT)`.
- `CUSTOMER_ORDER(CUSTOMER_ID, ORDER_STATE, REQUIRED_DELIVERY_DATE)`.
- `RECOVERY_PLAN(DISRUPTION_ID, VERSION)` and `RECOVERY_ACTION(RECOVERY_PLAN_ID, ACTION_STATE)`.
- `APPROVAL_REQUEST(REQUEST_STATE, APPROVER_ROLE_ID, SUBMITTED_AT)` and unique `IDEMPOTENCY_KEY`.
- `AGENT_EXECUTION(DISRUPTION_ID, EXECUTION_STATE, STARTED_AT)`.
- `AUDIT_EVENT(DISRUPTION_ID, OCCURRED_AT)`, `(ACTOR_ID, OCCURRED_AT)`, `(RESOURCE_TYPE, RESOURCE_ID, OCCURRED_AT)`, and `CORRELATION_ID`.

Avoid indexing large text/JSON fields without a measured requirement. Audit partitioning/archival is a future HANA operations decision and must preserve authorized search and retention policy.

## 5. Transactions and state transitions

- Treat one CAP request's validated business change plus its audit event as a transaction where persistence semantics permit. If required audit persistence fails, fail closed for protected side effects.
- Keep human approval (workflow decision), external adapter dispatch, and subsequent verification as distinct durable states/transactions; do not claim a distributed transaction across HANA, workflow, and external services.
- Before side effects, CAP checks actor, action category, current proposal version, approval decision, required evidence, domain preconditions, and idempotency key.
- External call timeout may yield `outcome_unknown`. Reconcile provider/source state before retrying; never infer failure or repeat a non-idempotent action.
- Immutable decisions/events use insert-only access. Corrections/revocations add a new row referencing the prior record.

## 6. CAP entities and HANA persistence

The proposed CAP domain boundary mirrors logical entities, not a requirement for one OData service per table. CAP services should expose role-scoped projections/actions, hide internal columns and secrets, and persist via associations/transactions. Example groupings are Master Data, Supply Operations, Incident & Recovery, Approvals, Agent Operations, Communications, and Audit. Generated HANA artifacts and naming depend on CDS definitions and deployment configuration, neither of which exists in this documentation phase.

## 7. Retention, privacy, audit immutability, and demo seeding

- Retention durations, deletion/archive policy, legal holds, encryption/key management, backup, and audit storage/immutability mechanism require security/legal decisions. No duration or certification is assumed.
- Minimize personal and commercial data. Demo users use synthetic role aliases; do not include passwords, emails, phone numbers, patient identifiers, or real addresses.
- Restrict audit read access and redact sensitive fields. Ordinary users and agents cannot update/delete audit events. A privileged database administrator could technically alter rows unless separate tamper-evidence/retention controls are designed and verified; therefore this proposal does not claim cryptographic immutability.
- Seed only via an explicitly selected demo-data process with environment guard, tenant/environment check, idempotent dataset version, and clear `dataMode`. Never seed synthetic fixtures into a live operational tenant.
- The fixture set in `data/synthetic/` is static demonstration history dated September–November 2026. A seed run should reject non-demo mode and report its version and record counts.

## 8. Deployment status and open decisions

SAP HANA Cloud is the selected planned database; no service, table, schema, user, or connection is verified or deployed. Resolve tenant isolation, CAP CDS model, ID generation, data retention, audit security, source references, units/precision, tenant migration/versioning, indexes based on query plans, and transaction/audit implementation before making implementation claims.
