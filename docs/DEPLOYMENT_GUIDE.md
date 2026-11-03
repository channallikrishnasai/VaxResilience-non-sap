# Local development and deployment guide

## Local prerequisites

- Node.js 22.12 or later and npm. The installed package metadata currently declares this range for CAP 10.
- Python and the dependencies documented in [`LOCAL_SETUP.md`](../LOCAL_SETUP.md) for the existing Python application. Its streamlit, simulator, ingestion, and ML stack is unchanged.
- Internet access is required to load the SAPUI5 runtime from `https://ui5.sap.com` in the current shell.

## Start CAP locally

```powershell
npm ci
npm exec cds -- deploy --to sqlite:db.sqlite
npm run watch
```

`package-lock.json` is tracked. A fresh `npm ci` completed successfully in the current Windows worktree. An earlier clean-install attempt did report `EPERM` while recreating `node_modules`; the cause remains undiagnosed and has not recurred in later clean installs.

CAP's development profile uses local SQLite and mock identities. Open `http://localhost:4004/healthz`, `http://localhost:4004/readyz`, `http://localhost:4004/api/v1/monitoring/Messages`, or `http://localhost:4004/ui/`. The UI's **Create demo failure** control inserts an explicitly synthetic shipment-status event; **Simulate retry** only records a local attempt. No completed disruption scenario is seeded.

For a production build check, run `npm run build`. For the local unit tests, run `npm test`.

## SAP deployment prerequisites

No deployment has been performed. Before a BTP deployment, verify the correct account, subaccount, region, Cloud Foundry org/space, quotas, entitlements, HANA service/binding, identity configuration, Work Zone access, and build/release ownership. The observed local environment did not provide `cf` or `mbt` executables or authenticated org/space evidence. Configure environment-specific bindings through the platform's approved mechanisms; never add credentials or tenant-specific endpoints to Git.

The production profile targets HANA and JWT authentication but is not a complete production deployment configuration. Complete open decisions D-07, D-10, D-11, D-13, D-17 and security review, then add and validate the approved MTA/service descriptors and HANA migration/seed strategy. No deployment command has been run. Never use `cf undeploy`.

## Integrations

Providers are not configured. The local retry operation is simulation-only. Before enabling any external adapter, define provider contracts, server-side secrets, authorization, approval controls, idempotency and reconciliation behavior, consent where applicable, and audit/retention rules. See [`INTEGRATION_REFERENCE.md`](INTEGRATION_REFERENCE.md) and the official decision register.

## Production UI build artifact

`npm run build` runs the archive preparation and CAP production build, then copies `app/ui5/webapp` to `gen/production/app/ui5/webapp`. Confirm this directory contains `index.html` before packaging; the CAP server resolves `/ui` from that path. This local build check does not deploy the application or verify a browser session on SAP BTP.

## SAP BTP Cloud Foundry setup checklist

This repository currently has no `mta.yaml` or `xs-security.json`, and the local environment has no `cf` or `mbt` executable. Do not deploy this branch to a shared or production space yet: D-11 (identity/roles), D-13 (HANA schema/tenancy/migrations), and D-17 (BTP landscape/operations) are still open. This checklist becomes executable after the project owners approve those decisions and the required account entitlements are available.

1. In SAP BTP Cockpit, select the approved subaccount and region, enable Cloud Foundry, identify the target org/space, and verify quota and permissions. Confirm SAP HANA Cloud and the `hdi-shared` entitlement in the subaccount. Record the platform owner and cost/operations owner.
2. Install Node.js 22.12+, Cloud Foundry CLI v8+, Cloud MTA Build Tool (`mbt`), and the CF MultiApps plugin. On Windows, CAP's deployment guide also lists GNU Make as an MBT prerequisite. Verify with `node --version`, `cf --version`, `mbt --version`, and `cf plugins`.
3. After the data/auth decisions are approved, prepare the CAP project from its root using the SAP CAP facets: `npm ci`, `cds add hana`, `cds add xsuaa`, and `cds add mta`. Review every generated descriptor and role/scope before use; do not accept generated roles as business approval. No service credentials belong in Git.
4. In the BTP subaccount, create/start the approved SAP HANA Cloud database and provision the HDI container service instance in the chosen Cloud Foundry space. Confirm the binding names match the reviewed MTA descriptor. Apply the approved schema/migration only after backup and rollback procedures are defined.
5. Authenticate and explicitly target the approved space: `cf login --sso -a <Cloud-Foundry-API-endpoint>`, then `cf target -o <org> -s <space>`. Check the displayed target before creating or deploying anything.
6. Locally run `npm ci`, `npm test`, `npm run build`, then `mbt build -t gen --mtar vaxresilience.mtar`. Inspect the generated archive and descriptor; confirm it contains the CAP server, UI at `app/ui5/webapp`, and only approved bindings. Deploy only the reviewed archive with `cf deploy gen/vaxresilience.mtar` after the release owner authorizes it.
7. Verify the deployed app URL and `/healthz`, `/readyz`, `/ui/`, and authenticated MonitoringService OData endpoint. Exercise UI actions using a synthetic-only isolated dataset. Check server logs, audit behavior, HANA binding, authentication, and role denials. A green build alone is not deployment or acceptance evidence.
8. For SAP Build Work Zone, configure the approved site/content provider and application target mapping after identity/role collections and the deployed URL are verified. Test launch and role access with approved test users. Work Zone is an access surface; CAP still enforces authorization.

Do not run deployment commands against an unverified target. Keep provider flags disabled and demo records clearly identified as synthetic. The current working tree is locally buildable, but the steps above were not executed against an SAP tenant.
