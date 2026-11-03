# Integration monitoring reference

## Implemented local capability

CAP exposes `MonitoringService` at `/api/v1/monitoring` with read-only `Messages` and `Attempts` collections. In a non-production profile, `createDemoFailure()` inserts a clearly synthetic failed shipment-status message; it is disabled in the production profile. The narrow `retryMessage(ID)` action records a simulated attempt. The CDS model retains direction, business-object type, external ID, correlation ID, status, source mode, payload hash/preview, error summary, retry count, last-attempt time, and attempt history. `/healthz` and `/readyz` distinguish process liveness from database readiness.

The service requires CAP's `authenticated-user` role. Anonymous HTTP requests receive 401; the HTTP integration test supplies an ephemeral development mock user. This is only a basic authenticated-principal gate: D-11 identity provider, role/record scopes, session policy, and production identity configuration remain unresolved. The browser shell does not yet provide a verified login/profile flow.

The only retry path implemented is a local simulation. It rejects missing messages, non-simulated messages, and statuses other than `FAILED`. A successful call records a separate `SIMULATED` attempt, changes the message to `SIMULATED`, and logs only identifiers and attempt count. It makes no HTTP/SAP/provider call. Unit and in-memory CAP service tests cover demo creation, simulated retry history, and rejection of a `LIVE` source. Concurrency/idempotency under a production database and audit-integrity requirements have not yet been established; do not use it for real side effects.

## Patterns studied in the reference repository

The third-party operations console documents stable correlation IDs, separate inbound/outbound processing, an integration journal, explicit failure and retry state, payload hashing, operational logs, and backend-controlled actions. VaxResilience adopts the correlation/journal/attempt separation as a design reference only. It does not import the reference project's SAP S/4HANA, Integration Suite, destination, XSUAA, Cloud Connector, or Fiori Elements connectivity.

Selected source docs and the reference MIT license are preserved in [`sap-integration/`](sap-integration/). Source: [`kulikovskyi-maksym/sap-integration-operation-console`](https://github.com/kulikovskyi-maksym/sap-integration-operation-console). Original documentation is retained with its source attribution. No source application code was merged.

## Not connected

HANA Cloud, SAP Integration Suite, SAP S/4HANA, AI Core, Build Process Automation, Work Zone, supplier/ERP/logistics APIs, email, and voice are not connected. Provider flags/credentials are absent. Email remains draft-only and voice remains unconfigured. A real retry must wait for provider contracts, authorization, approval policy, idempotency, unknown-outcome reconciliation, and audit controls.
