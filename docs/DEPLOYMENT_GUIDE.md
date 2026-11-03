# Local development and deployment guide

## Local prerequisites

- Node.js 22.12 or later and npm. The installed package metadata currently declares this range for CAP 10.
- Python and the dependencies documented in [`LOCAL_SETUP.md`](../LOCAL_SETUP.md) for the existing Python application. Its streamlit, simulator, ingestion, and ML stack is unchanged.
- Internet access is required to load the SAPUI5 runtime from `https://ui5.sap.com` in the current shell.

## Start CAP locally

```powershell
npm install
npm exec cds -- deploy --to sqlite:db.sqlite
npm run watch
```

`package-lock.json` is tracked. `npm ci` completed once before the authentication dependency was added, but a later clean install hit a Windows `EPERM` while recreating `node_modules`; `npm install` restored the final dependency set successfully. Recheck `npm ci` on the target developer platform before treating clean installs as verified.

CAP's development profile uses local SQLite and mock identities. Open `http://localhost:4004/healthz`, `http://localhost:4004/readyz`, `http://localhost:4004/api/v1/monitoring/Messages`, or `http://localhost:4004/ui/`. The UI's **Create demo failure** control inserts an explicitly synthetic shipment-status event; **Simulate retry** only records a local attempt. No completed disruption scenario is seeded.

For a production build check, run `npm run build`. For the local unit tests, run `npm test`.

## SAP deployment prerequisites

No deployment has been performed. Before a BTP deployment, verify the correct account, subaccount, region, Cloud Foundry org/space, quotas, entitlements, HANA service/binding, identity configuration, Work Zone access, and build/release ownership. The observed local environment did not provide `cf` or `mbt` executables or authenticated org/space evidence. Configure environment-specific bindings through the platform's approved mechanisms; never add credentials or tenant-specific endpoints to Git.

The production profile targets HANA and JWT authentication but is not a complete production deployment configuration. Complete open decisions D-07, D-10, D-11, D-13, D-17 and security review, then add and validate the approved MTA/service descriptors and HANA migration/seed strategy. No deployment command has been run. Never use `cf undeploy`.

## Integrations

Providers are not configured. The local retry operation is simulation-only. Before enabling any external adapter, define provider contracts, server-side secrets, authorization, approval controls, idempotency and reconciliation behavior, consent where applicable, and audit/retention rules. See [`INTEGRATION_REFERENCE.md`](INTEGRATION_REFERENCE.md) and the official decision register.
