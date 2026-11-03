# CAP to Python integration design (inspection only)

## Observed Python application

The existing Python repository is an operational data/analytics application, not a network API service. Its components include a Streamlit UI; simulator producing Kafka-compatible telemetry to Redpanda; streaming anomaly detection; TimescaleDB/PostgreSQL storage and queries; Dagster batch assets for ingestion/forecasting; Prophet-based shortage forecasts; and Ollama plus ChromaDB retrieval/brief generation. Python entry points are primarily CLI, job, and library functions. No dedicated CAP-consumable service contract or authentication boundary was found. Streamlit is a human UI, not a machine integration API.

## Recommended boundary

Keep CAP as the only browser-facing business API and policy authority. When a product owner approves concrete use cases and request/response schemas, add a separate, private Python service adapter that imports existing Python library functions without changing their business logic. CAP calls that service server-to-server through a fixed internal destination. Do not let the browser, model, or agent call Python directly. Do not expose arbitrary function names, shell commands, SQL, filesystem paths, model names, or tool selection through a generic execution endpoint. Do not connect CAP directly to Python-owned TimescaleDB or Redpanda.

Prefer narrow typed analysis operations with explicit synthetic/live provenance and units. CAP should validate requests before dispatch and validate typed responses again; include correlation ID, schema version, scenario/data mode, freshness, units, and evidence references. Bound body size, allowed fields/ranges, timeout, response size, concurrency, and retry policy. Make analytical reads deterministic/idempotent where possible. A timeout must be represented as unknown/unavailable, not as a successful result. Never allow the Python service to approve or execute procurement, allocation, production, shipment, payment, or customer-notification actions.

Authenticate the service-to-service call with a dedicated workload identity and short-lived OAuth/JWT client credentials validated by Python, or mutually authenticated TLS if that is the approved platform pattern. Keep credentials in server-side secret bindings, rotate them, use TLS, and restrict network ingress to CAP. Apply least privilege and separate identities per environment. CAP remains responsible for end-user identity, role/scope authorization, approvals, proposal version checks, and audit. Python must not trust actor/role claims supplied in the request body. Avoid patient or other sensitive data unless a privacy/data residency review approves it; send synthetic identifiers/references instead of secrets or unnecessary raw records.

Log correlation IDs, operation/version, result status, elapsed time, and safe evidence references on both sides. Redact credentials, prompts, raw payloads, and sensitive values. Test invalid schemas, oversized input/output, auth failures, timeout, service unavailability, replay/idempotency, stale result/freshness, and unexpected response fields before enabling any integration.

## Decisions required before implementation

Agree the first analytical use case, canonical data and unit semantics, allowed data classes, source-of-truth and freshness, error/timeout behavior, service runtime/hosting, identity mechanism, network policy, audit retention, and whether Python is permitted to access CAP data or receives only a bounded request. Resolve relevant official D-01–D-19 decisions and add versioned contracts. Until then the bridge remains a design only; no API, credential, network call, or Python business-logic change is justified.
