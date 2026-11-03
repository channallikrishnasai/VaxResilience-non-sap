# Test report

Results below distinguish historical failures from final reruns. Commands were run in the Windows workspace on branch `feat/sap-foundation-monitoring`. No BTP deployment occurred. The initial report predates the later verified GitHub push, which is recorded in [`IMPLEMENTATION_PROGRESS.md`](../IMPLEMENTATION_PROGRESS.md).

| Command | Actual output/result | Status |
|---|---|---|
| `npm ci --foreground-scripts` (final sprint, run twice consecutively; then once after test additions) | Every run completed: `added 78 packages, and audited 193 packages`; lockfile hash remained `76E3648427DBF1C4E5BD1FD8AB0ABF248FD71EFD0FAAA509106A7C7538E42F26`. | PASS, reproducible in these runs |
| Earlier `npm ci` (Windows) | Failed once with `EPERM` while recreating `node_modules/@sap/cds`; subsequent `npm install` restored 78 packages. | Historical failure, not reproduced in three later clean installs; cause undiagnosed |
| `npm audit` | Two high advisories in dev-only `@sap/cds-dk@10.2.0` bundled `body-parser@2.3.0`; npm's forced remedy downgrades CAP major. | OPEN dev-tool advisory |
| `npm audit --omit=dev` | `found 0 vulnerabilities`. | PASS |
| `npm exec cds -- deploy --to sqlite:db.sqlite` | `successfully deployed to db.sqlite`. | PASS |
| `npm run start` | CAP 10.2.2 connected to SQLite, loaded `MonitoringService`, and listened at `http://localhost:4004`; mocked auth profile. | PASS |
| PowerShell `Invoke-WebRequest http://localhost:4004/healthz` | HTTP 200; `{"status":"ok"}`. | PASS |
| PowerShell `Invoke-WebRequest http://localhost:4004/readyz` | HTTP 200; `{"status":"ready","database":"connected"}`. | PASS |
| PowerShell GET `http://localhost:4004/api/v1/monitoring/Messages` | HTTP 200; OData response `{"@odata.context":"$metadata#Messages","value":[]}` before demo action. | PASS |
| PowerShell GET `http://localhost:4004/ui/` | HTTP 200; returned the SAPUI5 HTML shell. | PASS, document served |
| PowerShell POST `.../createDemoFailure` | HTTP 200; response status `FAILED`, source `SIMULATION`, synthetic ShipmentStatus message and ID. | PASS |
| PowerShell POST `.../retryMessage` with returned ID | HTTP 200; response status `SIMULATED`, retryCount `1`. | PASS |
| PowerShell GET `.../Attempts`; second POST retry | One `SIMULATED` attempt returned; repeat retry returned HTTP 409. | PASS |
| `node --test test/http-smoke.test.js` | `1` passed, `0` failed; test starts an in-memory CAP server on an ephemeral port and uses actual fetch/HTTP for health, readiness, UI response, OData creation/retry/attempt history. | PASS |
| `npm test` | `tests 7`, `pass 7`, `fail 0`, duration about 3.6 seconds. | PASS |
| Node inline-script compilation of `app/ui5/webapp/index.html` | `inline UI scripts: 1 syntax-valid`. | PASS, syntax only |
| Browser rendering and clicking UI5 controls | Not performed. Computer-use attempt was denied permission to use Google Chrome. HTTP confirms HTML delivery; API actions are independently exercised, but actual browser rendering/button wiring is not verified. | NOT VERIFIED |
| `npm run build` | CAP production build completed; generated HANA `.hdbtable` and service `.hdbview` artifacts under `gen/production`. | PASS (build artifact only, not HANA deployment) |
| `.venv\\Scripts\\python.exe -m pip install --disable-pip-version-check -r requirements-dev.txt` | Installed pinned base + development/testing requirements in ignored isolated `.venv` using Python 3.11.18. | PASS |
| Initial Python `pytest -q` before correcting stale test expectation | 45 passed, 1 failed: `test_alert_visible_in_gold_view` expected `Site de test`; seeded fixture is `India Demo Site`. | FAIL, reproducible test defect corrected |
| `.venv\\Scripts\\python.exe -m pip install --disable-pip-version-check -r requirements-dev.txt` after adding `chardet==5.2.0` | Removed RequestsDependencyWarning caused by unrelated Chroma/testcontainers transitive `chardet==7.7.0`; selected compatible 5.2.0. | PASS |
| `.venv\\Scripts\\python.exe -m pip check` | `No broken requirements found.` | PASS |
| `.venv\\Scripts\\python.exe -m pytest -q` (latest) | `46 passed, 1 warning in 15.53s`; pandas warns that psycopg DB-API is not a formally supported `read_sql` connection. Pytest-asyncio emits an unset fixture-loop-scope deprecation warning at startup. | PASS with warnings |
| Python 2020-12 schema/fixture structure check | All 26 schema definitions pass `Draft202012Validator.check_schema`; all 7 manifest-listed fixture files parse, all are present and labeled `dataMode: synthetic` at root. This does not yet validate every nested record against its entity schema or cross-file foreign keys. | PASS, structural checks only |
| `git diff --check` | Exit code 0; Git emitted only `.gitignore` LF-to-CRLF conversion notice. | PASS |

## UI and integration claim limits

The UI shell is actually served over HTTP and its inline JavaScript parses. Browser rendering, SAPUI5 CDN boot, and physical button clicks were not verified due Chrome computer-use denial. The same action URLs used by the UI were separately exercised over actual HTTP. All actions are local synthetic simulation; no external provider call was made.

Python is currently a Streamlit + Kafka/Redpanda + Timescale/PostgreSQL + Dagster/Prophet + Ollama/Chroma processing application, with no reviewed CAP API boundary. See [`PYTHON_CAP_INTEGRATION_DESIGN.md`](PYTHON_CAP_INTEGRATION_DESIGN.md). No bridge was implemented, and Python business logic was not altered; one stale assertion in an existing integration test was corrected to match its fixture.




## Earlier IMP-02 continuation results (before schema expansion)

| Command | Actual output/result | Status |
|---|---|---|
| `.venv\\Scripts\\python.exe -m pip install -q --disable-pip-version-check -r requirements-dev.txt` | Installed new pinned `jsonschema==4.26.0` development dependency into the existing isolated environment. | PASS |
| `.venv\\Scripts\\python.exe -m pytest -q tests/unit/test_synthetic_fixture_validation.py` | `5 passed`. Covers valid schema-backed data, invalid row, broken FK/reference, duplicate ID, and mapping targets. | PASS |
| `.venv\\Scripts\\python.exe -m pytest -q` | `51 passed, 1 warning in 18.04s`; the remaining test warning is pandas passing a psycopg DB-API connection to `read_sql`. pytest-asyncio emits a fixture-loop-scope deprecation at startup. | PASS |
| `.venv\\Scripts\\python.exe scripts/validate_synthetic_fixtures.py` | `schema-validated records: 61` (60 data records + manifest); no schema, duplicate-ID, synthetic-root, or mapped-reference issue printed; `unmapped collections: 28`, then lists missing record-schema mappings; exit code `1` intentionally fails closed because coverage is incomplete. | PARTIAL / BLOCKED |
| `.venv\\Scripts\\python.exe -m pip check` | `No broken requirements found.` | PASS |
| `git diff --check` | Exit code 0; existing `.gitignore` line-ending conversion notice only. | PASS |

The fixture validator covers 19 collection types with existing matching entity schemas. It performs checks for duplicate IDs and declared/mapped cross-file references over fixture collections, but schema validation cannot cover the 28 unmapped collection types until official entity schemas are supplied. Full seed/reset and full CAP data model were not attempted because the baseline state is not represented as a seedable fixture and D-12/D-13 are unresolved; see `IMPLEMENTATION_PROGRESS.md` for the exact blockers. No seed/reset operation, deploy, push, Python business-logic change, or CAP-Python integration occurred.

During validator development, the first test run exposed a scalar root `dataMode` iteration bug; the next run exposed polymorphic references represented by fixture IDs across entity types. Both implementation defects were corrected before the passing final run above.


A later manifest-validation refinement initially applied the fixture-root dataMode check to the manifest wrapper and caused one test failure; the check was scoped to data files and the final full-suite run passed.


## Current IMP-02 implementation results

| Command | Actual output/result | Status |
|---|---|---|
| `.venv\\Scripts\\python.exe -m pytest -q tests/unit/test_synthetic_fixture_validation.py` | `32 passed in 1.12s`; includes one validation case for each of the 26 new schemas plus valid fixture, invalid record, broken reference, scalar/composite duplicate identifiers, and mapping coverage. | PASS |
| `.venv\\Scripts\\python.exe -m pytest -q` | `78 passed, 1 warning in 17.21s`. The summary warning is pandas using psycopg DB-API with `read_sql`; pytest-asyncio prints a fixture-loop-scope deprecation at startup. | PASS |
| `npm test` | `tests 8`, `pass 8`, `fail 0`, about 3.7 seconds. Includes existing HTTP/OData action smoke test and a test that loads the draft CAP model, checks 46 specification-backed domain entities and representative relationships, and confirms unsupported `CalculationAssumptions`/fixture-only ProductionPlan fields were not invented. | PASS |
| `npm run build` | CAP production-profile model build completed; HANA `.hdbtable` artifacts generated for the draft domain entities and service views generated. | PASS (build only; no HANA deployment) |
| `.venv\\Scripts\\python.exe scripts/validate_synthetic_fixtures.py` | `schema-validated records: 157`; `unmapped collections: 2`: `calculationAssumptions`, `productionPlans`; exit code `1` intentionally fails closed. No errors printed for covered records, schemas, or mapped integrity checks. | PARTIAL / BLOCKED |
| `.venv\\Scripts\\python.exe -m pip check` | `No broken requirements found.` | PASS |
| `git diff --check` | Exit code `0`; Git only reports its `.gitignore` line-ending conversion notice. | PASS |

The coverage matrix is [`IMP-02_SCHEMA_COVERAGE.md`](IMP-02_SCHEMA_COVERAGE.md). Twenty-six of the 28 previously uncovered collection schemas were added only where the official logical/relational specifications define the entity. The other two remain blocked for the exact reasons and required inputs in `IMPLEMENTATION_PROGRESS.md`. The draft CAP model contains the 46 specification-backed entity types without resolving D-01–D-19. Seed/reset remains unimplemented because the baseline record selection is not authoritative. No database contents were reset or seeded.

During schema expansion, an initial strict validation run found that fixture `rolePermissions` records do not all contain `dataMode`; the schema was corrected to make that field optional because the official entity contract does not require it. A test-count assertion was updated after full schema coverage increased from 61 to 157 validated record instances. Final commands above were rerun after those corrections.

A later model-nullability edit initially caused CDS parser errors. I reconstructed `db/domain.cds` from the last successful generated CAP CSN, reapplied required-field constraints and specification-backed unique indexes, then reran the final CAP build and tests listed above successfully. No deployment was made from the invalid intermediate source.

## Final IMP-02 and CAP re-verification — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest -q tests/unit/test_synthetic_fixture_validation.py` | `35 passed in 1.79s`. Includes all 26 added schema checks, valid and invalid records, broken references, scalar/composite duplicate identifiers, and specified cross-record quantity/unit/date invariants. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | `81 passed, 1 warning in 19.58s`. The warning is pandas `read_sql` using a non-SQLAlchemy psycopg DB-API connection. pytest-asyncio also emits a fixture-loop-scope deprecation at startup. | PASS with warnings |
| `.venv\Scripts\python.exe scripts/validate_synthetic_fixtures.py` | Printed `schema-validated records: 157`; printed exactly two unmapped collections: `calculationAssumptions`, `productionPlans`; printed no record/schema/reference/duplicate/invariant errors; exit code `1` by design because the validator fails closed on unmapped collections. | PARTIAL / BLOCKED |
| `npm test` | `tests 8`, `pass 8`, `fail 0`, duration `4146.8822ms`. Actual HTTP smoke test exercised health/readiness, UI shell delivery, OData, synthetic creation, retry and repeat-retry conflict; logs show correlation ID on retry. | PASS |
| `npm run build` | `build completed in 28781 ms`; generated CAP production artifacts, including HANA model artifacts. | PASS (build only; no deployment) |
| `git diff --check` | Exit code `0`; Git emitted only the existing `.gitignore` LF-to-CRLF notice. | PASS |

No seed/reset data mutation was run. No Python business logic was changed. No deployment or push occurred. The schema coverage matrix and the exact official inputs required for unresolved entities and baseline selection are in `IMP-02_SCHEMA_COVERAGE.md` and `IMPLEMENTATION_PROGRESS.md`.

### Python validator hardening rerun — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest -q tests/unit/test_synthetic_fixture_validation.py` | `36 passed in 2.38s`; added malformed non-object record coverage verifies invalid fixture entries are reported instead of crashing validation. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | `82 passed, 1 warning in 20.29s`; existing pandas/psycopg DB-API warning and pytest-asyncio fixture-scope deprecation at startup. | PASS with warnings |

## IMP-03 supplier checklist rule — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| Initial `npm test` after adding supplier checklist cases | `tests 13`, `pass 12`, `fail 1`. The failure was a test assertion targeting the wrong checklist dimension (delivery was removed while capacity was asserted missing); no implementation assertion failed. | FAIL, test corrected |
| Final `npm test` | `tests 13`, `pass 13`, `fail 0`, duration `4292.3513ms`. Covers the CAP HTTP smoke path and existing retry policy plus complete six-check evidence, missing/failed/unverified/expired checks, duplicate records, missing evidence, malformed expiry, and explicit as-of validation. | PASS |
| `git diff --check` | Exit code `0`; Git emitted the existing `.gitignore` LF-to-CRLF notice only. | PASS |

The supplier helper is a pure deterministic domain function and is not yet exposed through CAP. Its `checks_complete` result describes evidence completeness only; D-09 supplier eligibility criteria and D-11/D-12 authorization/API decisions remain open. No purchase or supplier-state mutation is performed.

## IMP-03 deterministic supplier checks and demand aggregation — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| Final `npm test` after adding both IMP-03 domain helpers | `tests 19`, `pass 19`, `fail 0`, duration `5484.9044ms`. Includes six-check supplier evidence completeness and the actual five-customer synthetic demand fixture reconciliation to `25000 tablet/day`, plus missing/duplicate/mismatched and non-synthetic cases. | PASS |
| `npm run build` | `build completed in 16264 ms`; CAP generated production build artifacts for the model and service. | PASS (build only; no deployment) |
| `git diff --check` | Exit code `0`; only the existing `.gitignore` LF-to-CRLF notice. | PASS |

These helpers are deterministic domain functions, not exposed endpoints. Supplier checklist completion does not assert supplier qualification. Demand aggregation produces an explicitly synthetic estimate for an explicit customer set and does not apply allocation policy or forecast conversions.

## IMP-03 coverage calculation — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| Final `npm test` after coverage, demand, and supplier helper changes | `tests 23`, `pass 23`, `fail 0`, duration `6746.7025ms`. Coverage cases verify 1,000 kg ÷ 50 kg/production-day = 20 production days, preserve explicit provenance, and label the documented 30/20 mixed-day comparison as unnormalized and not a forecast. | PASS |
| `npm run build` | `build completed in 30072 ms`; CAP generated production model and service artifacts. This validates the CAP model build, not external deployment or a forecast calculation. | PASS (build only) |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice only. | PASS |

D-01 remains unresolved; the comparison is not converted into a calendar-aware forecast. These pure domain functions are not yet API endpoints; D-11/D-12 identity and contract choices remain open.

## Browser UI verification attempt — 2026-11-03

| Attempt | Actual result | Status |
|---|---|---|
| Computer-use launch of Brave for local UI verification | Tool returned `Computer Use was not approved to use Brave`. | BLOCKED by tool approval |
| Isolated headless Chrome launch for local UI verification | Command policy rejected the process launch before execution. | BLOCKED by command policy |
| Existing automated evidence | HTTP smoke test serves `/ui/` and checks the SAPUI5 bootstrap marker and action names; it separately exercises the CAP endpoints over HTTP. | PASS for document/API only; browser render and clicks remain NOT VERIFIED |

The existing Chrome windows were not touched. No browser UI verification claim is made.

## Current regression checkpoint after IMP-03 domain rules — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest -q` | `82 passed, 1 warning in 21.52s`; pandas warns about psycopg DB-API usage in `read_sql`; pytest-asyncio emits its fixture-loop-scope deprecation at startup. | PASS with warnings |
| `.venv\Scripts\python.exe scripts/validate_synthetic_fixtures.py` | `schema-validated records: 157`; two unmapped collections (`calculationAssumptions`, `productionPlans`); no other errors printed; exit `1` by design. | PARTIAL / BLOCKED |
| `npm test` | `tests 23`, `pass 23`, `fail 0`, duration `6877.4308ms`. | PASS |
| `npm run build` | CAP build completed in `30575ms`, production artifacts generated. | PASS (build only) |
| `git diff --check` | Exit code `0`, with existing `.gitignore` LF-to-CRLF notice. | PASS |

## IMP-03 provenance hardening rerun — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| Intermediate `npm test` after adding required source references | `tests 23`, `pass 22`, `fail 1`. The unit-mismatch test omitted source references, so validation stopped at the required-provenance guard; test fixture corrected. | FAIL, test setup corrected |
| Final `npm test` | `tests 23`, `pass 23`, `fail 0`, duration `6761.6777ms`. Includes source-reference/as-of provenance assertions for coverage and reviewer/evidence provenance assertions for supplier checks. | PASS |
| Final `npm run build` | CAP build completed in `31467ms`; production artifacts generated. | PASS (build only) |
| `git diff --check` | Exit code `0`; `.gitignore` line-ending notice only. | PASS |

## IMP-04 navigation shell — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `npm test` | `tests 26`, `pass 26`, `fail 0`, duration `7401.2447ms`; includes 3 UI-shell checks for the eight official modules in order, accessibility/state scaffolding, and inline JavaScript syntax. | PASS (static/UI code level) |
| `npm run build` | `build completed in 29265 ms`; CAP production build generated model and service artifacts. | PASS (build only) |
| `GET http://127.0.0.1:4004/ui/` against the already-running CAP process | HTTP `200`; response contained **8** `data-module` entries, the SAPUI5 bootstrap marker, and the no-historical-baseline notice. | PASS (HTTP delivery/content) |
| Browser render/button interaction | Not performed. Computer-use rejected Brave and command policy rejected the isolated headless Chrome launch. Existing Chrome windows were left untouched. | NOT VERIFIED |

The shell does not imply authenticated identity or connected module APIs. The monitoring buttons remain actual HTTP-API tested by the CAP smoke test, but their browser click wiring is not yet verified in a real browser.

## Local server reuse note — 2026-11-03

A new `npm run start` attempt exited after CAP reported `EADDRINUSE` on port 4004. The listener was an existing Node process whose command line resolved to this same workspace; `GET /healthz` returned HTTP `200` with `{"status":"ok"}`. I did not terminate or replace that process. The updated `/ui/` page was verified over this existing local server; CAP action tests use isolated in-memory servers.

## IMP-04 same-origin CAP client integration — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| Initial `npm test` after moving endpoint calls into `api-client.js` | `tests 28`, `pass 27`, `fail 1`; stale shell test still expected the API path inline in `index.html`. Assertion updated to check the client delegation. | FAIL, test expectation corrected |
| Final `npm test` | `tests 29`, `pass 29`, `fail 0`, duration `7975.1323ms`. CAP HTTP smoke test now calls the frontend API client over actual HTTP for list/create/retry/repeat-retry. | PASS |
| `GET http://127.0.0.1:4004/ui/` and `/ui/api-client.js` | Both returned HTTP `200`; shell had eight module entries and API client script exposed create/retry handlers. | PASS (HTTP delivery) |
| `npm run build` | CAP production build completed in `32404ms`. | PASS (build only) |
| `git diff --check` | Exit code `0`; only existing `.gitignore` line-ending notice. | PASS |

The client covers only the already implemented monitoring contract. It does not introduce unapproved business endpoints, API tokens, or role claims. Browser UI5 rendering and physical clicks are still not verified.

## IMP-04 frontend routing and CAP client — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| Initial `npm test` after API path extraction | `tests 28`, `pass 27`, `fail 1`; the static shell test expected an endpoint string in the HTML after moving calls to the client module. The stale assertion was corrected. | FAIL, test corrected |
| Final `npm test` | `tests 32`, `pass 32`, `fail 0`, duration `9212.5572ms`. Adds three route utility tests and real HTTP calls through the frontend client inside the CAP smoke test. | PASS |
| Local HTTP GETs | `/ui/`, `/ui/module-router.js`, and `/ui/api-client.js` each returned HTTP `200`; shell reported 8 module entries. | PASS (HTTP content delivery) |
| `npm run build` | CAP production build completed in `31265ms`. | PASS (build only) |
| `git diff --check` | Exit code `0`; existing `.gitignore` line-ending notice. | PASS |

The client is limited to the existing local monitoring service contract; this does not freeze D-12 or implement identity. Browser runtime behavior remains unverified.

## IMP-04 route and frontend safety checks — 2026-11-03

| Command | Actual output/result | Status |
|---|---|---|
| Final `npm test` | `tests 33`, `pass 33`, `fail 0`, duration `9350.7691ms`; includes all eight hash routes, malformed route fallback, same-origin client behavior, no credential assignment/direct provider URL check, and live CAP HTTP API-client calls. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF warning only. | PASS |

The frontend pins its SAPUI5 CDN bootstrap to `1.148.12` (asset availability was checked with HTTP HEAD, status 200). This local runtime choice is not confirmed against the intended BTP/Work Zone target. The shell is not yet packaged as a standard UIComponent/manifest application; browser render/accessibility verification also remains unavailable.

## IMP-03 authenticated-user gate and checkpoint rerun — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --test test/monitoring-service.test.js` | `tests 1`, `pass 1`, `fail 0`; verifies the service `@requires: authenticated-user` annotation, an anonymous synthetic action rejection with code 401, and successful create/retry under a test principal. | PASS |
| First full `npm test` after enabling the gate | `tests 34`, `pass 32`, `fail 2`; the HTTP smoke's unauthenticated OData read returned 401 instead of the old expected 200. | FAIL, exposed expected authorization change |
| `node --test test/http-smoke.test.js` after test-client update | `tests 1`, `pass 1`, `fail 0`; asserts anonymous OData read returns 401, then uses runtime-generated mock Basic-auth credentials to exercise list/create/retry/repeat-retry via HTTP. | PASS |
| Final `npm test` | `tests 33`, `pass 33`, `fail 0`, duration `9372.862ms`. CAP auth and retry conflict logs are expected test output. | PASS |
| `npm run build` | CAP production build completed in `17457 ms`; generated HANA model/service build artifacts only. | PASS (build only; no HANA deployment) |
| `.venv\\Scripts\\python.exe -m pytest -q` | `82 passed, 1 warning in 14.45s`; pandas reports use of a non-SQLAlchemy DB-API connection. Pytest-asyncio emits an unset fixture-loop-scope deprecation at startup. | PASS with existing warnings |
| `.venv\\Scripts\\python.exe scripts\\validate_synthetic_fixtures.py` | `schema-validated records: 157`; `unmapped collections: 2`; names: `calculationAssumptions`, `productionPlans`; exit 1. | EXPECTED FAIL-CLOSED RESULT; unresolved schemas remain blocked |
| `git diff --check` | Exit code `0`; Git emitted the existing `.gitignore` LF-to-CRLF notice. | PASS |
| UI5 bootstrap availability | `HEAD https://ui5.sap.com/1.148.12/resources/sap-ui-core.js` returned HTTP `200` (`application/javascript; charset=UTF-8`). | PASS (asset availability only) |

The service-level authentication gate depends on a verified user context. Production identity-provider configuration and role/record-scope policy remain unresolved under D-11. The browser shell does not yet have an integrated login/profile/session flow; static shell delivery and API client behavior are covered, but browser rendering and button clicks remain NOT VERIFIED. The UI5 pin is a local verified asset choice, not a Work Zone/BTP compatibility approval. No BTP deployment or GitHub push occurred.

## IMP-04 manifest-backed component scaffold — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --test test/ui-shell.test.js` | `tests 4`, `pass 4`, `fail 0`; checks eight module links, honest unavailable states, no credentials/provider URLs, manifest/runtime match, component/controller syntax, and action wiring. | PASS (static checks) |
| First full `npm test` after moving code out of the HTML | One UI-shell static assertion failed because it still looked for the historical-baseline notice in `index.html` after that copy moved into the controller. The assertion was updated to inspect the component controller. | FAIL, test expectation corrected |
| Final `npm test` | `tests 33`, `pass 33`, `fail 0`, duration `8933.229ms`. HTTP smoke verifies HTTP 200 for `/ui/`, `/ui/manifest.json`, `/ui/Component.js`, and `/ui/controller/App.controller.js`, then separately exercises authenticated CAP list/create/retry requests. | PASS (HTTP/static/API; not browser runtime) |
| `npm run build` | CAP production build completed in `17672 ms`; generated HANA artifacts only. | PASS (build only) |
| `.venv\\Scripts\\python.exe -m pytest -q` | `82 passed, 1 warning in 12.91s`; pandas DB-API warning. Pytest-asyncio fixture-loop-scope deprecation appears at startup. | PASS with existing warnings |
| Fixture validation | `schema-validated records: 157`; unmapped collection types: `calculationAssumptions`, `productionPlans`; exit 1. | EXPECTED FAIL-CLOSED RESULT |
| `git diff --check` | Exit code `0`; only the existing `.gitignore` line-ending notice. | PASS |

The shell now has a `ComponentSupport` bootstrap, `manifest.json`, `Component.js`, XML root view, and MVC controller. No browser was launched: SAPUI5 runtime boot, UI rendering, route interaction, accessibility, and physical button clicks remain NOT VERIFIED. The HTML shell, component assets, and API behavior over HTTP are not substitutes for browser evidence.

Additional structural checks: Python `xml.etree.ElementTree` parsed `view/App.view.xml` and printed `XML root view: well-formed`; `node --check` passed for `Component.js` and `controller/App.controller.js` (exit 0).

Browser verification attempt: `cua.createBrowserTab('iab', 'http://127.0.0.1:4004/ui/', { visible: true })` was rejected by the browser security policy: origin approval did not grant access and reported that the user declined permission. No alternate browser, raw CDP, or other network path was attempted. Runtime boot/render and UI interactions therefore remain NOT VERIFIED pending local-origin approval.

## IMP-04 native SAPUI5 shell layout — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `npm test` | `tests 33`, `pass 33`, `fail 0`, duration `9504.1827ms`. This includes the actual CAP HTTP/auth/synthetic-action test and updated static shell assertions. | PASS |
| JavaScript syntax | `node --check app/ui5/webapp/controller/App.controller.js` and `node --check app/ui5/webapp/controller/Module.controller.js` exited 0. | PASS |
| XML syntax | Python ElementTree printed `XML OK` for `view/App.view.xml` and `view/Module.view.xml`. | PASS |
| `npm run build` | CAP production build completed in `29778 ms`. | PASS (build only; no HANA deployment) |
| `.venv\Scripts\python.exe -m pytest -q` | `82 passed, 1 warning in 19.68s`; the warning is the existing pandas DB-API connection warning. Pytest also emits the existing pytest-asyncio loop-scope deprecation at startup. | PASS with existing warnings |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | `schema-validated records: 157`; `unmapped collections: 2`; names: `calculationAssumptions`, `productionPlans`; exit 1. | EXPECTED FAIL-CLOSED RESULT; unmapped schemas remain blocked |

The shell layout now uses native SAPUI5 ToolPage/navigation controls and links selections to manifest routes. A final controller change also re-syncs the active navigation marker after rendering. Final `npm test`: **33 passed, 0 failed** (9.548s); `node --check` passed for both MVC controllers; `git diff --check` exited 0 with the existing `.gitignore` LF/CRLF notice. These checks validate source structure, JavaScript syntax, HTTP delivery/API behavior, and CAP build output only. UI5 browser boot, rendering, responsive behavior, accessibility, navigation clicks, and UI action clicks remain NOT VERIFIED because the local-origin browser approval was declined. No Python business logic, deployment, or push occurred.

## IMP-04 shell controller callback tests and route fallback — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| Focused shell/HTTP checks | Final `node --test test/ui-shell.test.js test/http-smoke.test.js`: `tests 6`, `pass 6`, `fail 0`. Covers callback execution for all eight module links, menu toggle, active module marker, unknown-module fallback, and HTTP delivery of `App.controller.js`. | PASS (controller callbacks/API delivery; not browser runtime) |
| Full `npm test` | `tests 34`, `pass 34`, `fail 0`, duration `9125.4857ms`. CAP auth, health, OData, simulation actions, model tests, and frontend static/controller tests passed. Logged 409 retry conflict responses are expected test output. | PASS |
| `node --check app/ui5/webapp/controller/App.controller.js` | Exit code `0`. | PASS |
| `git diff --check` | Exit code `0`; Git emitted the existing `.gitignore` LF-to-CRLF notice. | PASS |

The callback regression test revealed that unsupported module hashes matched the manifest's `{module}` route, leaving the URL/navigation inconsistent with the dashboard fallback. The shell controller now normalizes the module route through the shared helper and navigates unknown modules to `home`. Two intermediate focused test attempts failed in the vm test harness (cross-realm equality and a missing `window.VaxResilienceRouter` stub); after fixing the harness, focused and full suites passed. No browser boot/render/click check was performed; the earlier local-origin approval denial remains in effect. No Python files or business logic changed in this checkpoint.

The top navigation now explicitly states **No active incident** because no approved baseline or active incident is loaded. The shell static test verifies that label. Latest `npm test` after this change: `tests 34`, `pass 34`, `fail 0`, duration `9320.8939ms`; `git diff --check` exited 0 with the existing `.gitignore` LF-to-CRLF notice. This does not establish browser rendering or interaction behavior.

## IMP-04 authentication/permission error presentation — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| API client tests | Added 401 and 403 cases. They assert distinct safe messages (“Authentication required” / “Access denied”), status plus correlation reference, and omission of CAP response details. | PASS |
| Actual CAP HTTP authorization path | Full suite's anonymous `GET /api/v1/monitoring/Messages` returns HTTP 401 and is passed through the real frontend client; test confirms safe UI-facing status/correlation error. | PASS |
| `npm test` | `tests 35`, `pass 35`, `fail 0`, duration `9429.9693ms`. | PASS |
| `git diff --check` | Exit code `0`; only existing `.gitignore` LF-to-CRLF notice. | PASS |

The UI can now distinguish the generic unauthenticated and forbidden HTTP states. This is not an identity-provider integration, role display, or proof of access policy. Browser rendering remains unverified. Python was not rerun because this change touched only CAP-client presentation and JavaScript tests.

## IMP-04 module action handlers through CAP HTTP — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --test test/http-smoke.test.js` | `tests 1`, `pass 1`, `fail 0`. In addition to direct client calls, the test executes the production `Module.controller.js` create/retry handlers against the real frontend API client and ephemeral CAP HTTP server. It confirms synthetic create/list, retry to `SIMULATED`, busy-state clearing, and duplicate retry 409 with correlation reference. | PASS (controller/API path; not rendered browser UI) |
| `npm test` | `tests 35`, `pass 35`, `fail 0`, duration `8748.8733ms`. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice only. | PASS |

This strengthens evidence for the code path used by UI create/retry controls but does not prove SAPUI5 runtime boot, rendered controls, pointer/keyboard interaction, or visual/accessibility behavior in a browser. Python and CAP service code were unchanged.

## IMP-04 monitor loading, empty, and failed-refresh states — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| Initial regression check | Extended `node --test test/http-smoke.test.js` first failed because an unsuccessful refresh left an old row in the model. This reproduced a stale-data presentation defect. | FAIL (reproduced defect) |
| Fixed-state focused test | Final `node --test test/http-smoke.test.js`: `tests 1`, `pass 1`, `fail 0`. Exercises pending/busy, successful empty state, failed refresh clearing old rows and showing retry text, recovery on next successful load, and busy-state cleanup. | PASS |
| Full Node suite | Final `npm test`: `tests 35`, `pass 35`, `fail 0`, duration `8178.1609ms`. | PASS |
| `git diff --check` | Exit code `0`; `.gitignore` LF-to-CRLF notice only. | PASS |

No CAP service or Python logic changed. This verifies the controller's state transitions with a SAPUI5 stub and actual HTTP action path separately; it does not verify UI5 rendering in a browser.

### Refresh concurrency regression

`Module.controller.js` now sequences message refreshes. Tests resolve overlapping requests in both orders and verify an older result cannot overwrite the latest response or clear its busy state; `onExit` invalidates pending requests. The test also drives a real anonymous CAP 401 through the module controller and checks authentication-required UI state and busy cleanup. `node --check app/ui5/webapp/controller/Module.controller.js` passed, focused `node --test test/http-smoke.test.js` passed (**1/1**), final `npm test` passed (**35/35**, `7502.7269ms`), and `git diff --check` exited `0` with the existing `.gitignore` line-ending notice. This verifies controller behavior only, not browser rendering.

## SAPUI5 native active-navigation selection

The app shell now synchronizes the current module through `NavigationList.setSelectedKey()` instead of writing `aria-current` directly into control DOM. This API is present in the pinned SAPUI5 TypeScript API for version 1.148.12, and was introduced in 1.62. Focused `node --test test/ui-shell.test.js test/http-smoke.test.js`: **6 passed**; full `npm test`: **35 passed, 0 failed** (`7069.6995ms`); `node --check` and `git diff --check` passed. This is API/static/controller evidence, not browser accessibility or rendering verification. [SAPUI5 1.148.12 NavigationList API](https://ui5.github.io/typescript/api/sapui5/1.148/sap.tnt/sap/tnt/NavigationList/classes/NavigationList.html)

## Existing retry count surfaced in monitor

The monitor table now includes a Retry count column bound to the existing `Messages.retryCount` property; CAP's HTTP/controller test observes the value change to `1` after simulated retry. No API or CAP model change was made. `npm test`: **35 passed, 0 failed** (`7167.6751ms`); `git diff --check` exit `0` with the existing `.gitignore` line-ending notice. Rendering remains unverified in a browser.

## IMP-04 responsive monitor table configuration

The monitoring table keeps Status, Object, and Actions visible at narrow widths. Direction, Source, and Retry count move to a block pop-in below Tablet; Correlation ID and Updated move to a block pop-in below Desktop. The implementation uses `sap.m.Column.minScreenWidth`, `demandPopin`, `popinDisplay` and `sap.m.Table.popinLayout`; the SAPUI5 1.148.12 API confirms these properties and values ([Column API](https://ui5.github.io/typescript/api/sapui5/1.148/sap.m/sap/m/Column/classes/Column.html), [Table API](https://ui5.github.io/typescript/api/sapui5/1.148/sap.m/sap/m/Table/classes/Table.html)). The test runs the module controller with SAPUI5 constructor stubs and validates the built column settings, responsive thresholds, all eight matching cells, and the three always-visible columns. An initial cross-realm array comparison failed; the harness was corrected. Focused UI tests **6 passed**; final `npm test` **36 passed, 0 failed** (`7453.8917ms`); `git diff --check` passed with the existing `.gitignore` line-ending notice. Browser viewport rendering remains NOT VERIFIED.

## IMP-04 manifest router extension — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --test test/ui-shell.test.js` | `tests 4`, `pass 4`, `fail 0`; checks native manifest routing configuration, component initialization, route patterns, controller/view declarations, eight module links, and protected client boundaries. | PASS (static) |
| XML and JavaScript syntax checks | Python ElementTree printed `2 XML views: well-formed`; `node --check` passed for `Component.js` and `controller/Module.controller.js`. | PASS (syntax/structure) |
| Final `npm test` after route migration | `tests 33`, `pass 33`, `fail 0`, duration `8966.04ms`. HTTP test served current component files and independently exercised authenticated API requests. | PASS (HTTP/static/API; not browser route execution) |

The manifest now uses `sap.m.routing.Router`, an empty home route plus a module route pattern, and a reusable Module view target. SAPUI5 recommends manifest routes/targets and router initialization from the component; see [official SAPUI5 routing guide](https://ui5.sap.com/1.38.66/docs/guide/cf3c57c89ef0491793d1ce327ab4f9b2.html). Browser route execution, visual rendering, accessibility, and physical action clicks remain NOT VERIFIED due the local-origin approval denial described above.

After adding a bypass target for unmatched routes, `npm test` was rerun: `tests 33`, `pass 33`, `fail 0`, duration `9017.4995ms`. `node -e` JSON parsing printed `manifest JSON: valid`; focused UI test remained `4 passed`. Manifest fallback and helper fallback are structurally checked; browser navigation remains NOT VERIFIED.

## IMP-04 authenticated API error presentation — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --test test/http-smoke.test.js test/ui-shell.test.js` | `tests 5`, `pass 5`, `fail 0`; the HTTP smoke drives an anonymous CAP 401 through the frontend API client and confirms safe status/correlation reporting. | PASS |
| Expanded client asset security scan | Includes HTML, `manifest.json`, `Component.js`, `Module.controller.js`, both XML views, API client, and route helper. It permits only the pinned SAPUI5 bootstrap URL and finds no credential assignments/direct provider URLs. | PASS |
| Final `npm test` | `tests 33`, `pass 33`, `fail 0`, duration `9193.265ms`; CAP HTTP auth/action paths still pass. | PASS |
| `git diff --check` | Exit code `0`; `.gitignore` line-ending conversion notice only. | PASS |

The CAP denial error is presented to UI code as HTTP status plus request correlation ID, with response body details discarded. Authenticated browser session behavior is still unverified and remains gated by D-11; this does not establish role-based authorization or browser runtime operation.


## IMP-04 local monitor filtering

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --test test/ui-shell.test.js test/http-smoke.test.js` | 7 tests, 7 passed, 0 failed. Verified SearchField construction/liveChange wiring and local filter behavior (case-insensitive correlation ID, zero matches, clear-to-all) over CAP HTTP-loaded synthetic messages. | PASS (controller/API; not browser rendering) |
| `npm test` | 36 tests, 36 passed, 0 failed; duration `7877.0852ms`. | PASS |

The filter only searches the currently loaded message list and adds no remote search/API contract. Browser boot/render and user interaction remain NOT VERIFIED.

| `npm test` after liveChange callback assertion | 36 tests, 36 passed, 0 failed; duration `7447.3821ms`. | PASS |
| `git diff --check` | Exit code `0`; pre-existing `.gitignore` LF-to-CRLF notice. | PASS |

The responsive-table/UI-controller test now executes the configured SearchField `liveChange` callback and confirms the entered query is delivered to the filter handler. No browser rendering claim is made.


## SAPUI5 monitor filter accessible label

| Command/check | Actual output/result | Status |
|---|---|---|
| `node --check app/ui5/webapp/controller/Module.controller.js` | Exit code `0`. | PASS (syntax) |
| `node --test test/ui-shell.test.js test/http-smoke.test.js` | 7 tests, 7 passed, 0 failed. The UI controller test asserts the visible Label is associated with the SearchField and invokes the live-change callback; the HTTP test verifies filter behavior on CAP-returned synthetic messages. | PASS (controller/API; not rendered UI) |
| `npm test` | 36 tests, 36 passed, 0 failed; duration `7621.6944ms`. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

The SAPUI5 1.148 Label API describes textual control labels and `setLabelFor`: [official API](https://ui5.github.io/typescript/api/sapui5/1.148/sap.m/sap/m/Label/classes/Label.html). Accessibility tree and screen-reader behavior remain NOT VERIFIED without browser runtime evidence.

| `npm run build` | CAP production build completed successfully in `30550 ms`. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 82 passed, 0 failed, 1 existing pandas DB-API warning; pytest-asyncio also emitted its existing loop-scope deprecation warning; 16.39s. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 records schema-validated; exit `1`; unmapped `calculationAssumptions` and `productionPlans` remain without approved strict schemas. | EXPECTED BLOCKED/FAIL-CLOSED |

These checks ran after the SearchField label change. No Python business logic changed.


## IMP-02 assumption and route reference integrity

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 38 passed, 0 failed in 1.71s. Includes broken assumption-reference and wrong-type route-waypoint cases; existing fixture remains free of reported integrity issues. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 84 passed, 0 failed, one existing pandas DB-API warning, 15.34s. | PASS |
| `npm test` | 36 passed, 0 failed, 8.09s. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 records schema-validated; exit `1` for only the unresolved schema mappings `calculationAssumptions` and `productionPlans`. | EXPECTED BLOCKED/FAIL-CLOSED |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

Reference validation now constrains `assumptionRefs` to calculation/demand assumption collections and `waypoints` to ports, facilities, warehouses, or suppliers, consistent with the documented logical model.


### Additional IMP-02 shipment location reference check

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 39 passed, 0 failed, 1.82s. Includes rejection of a product ID in shipment `originRef`. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` for `calculationAssumptions` and `productionPlans`, the only unmapped schema collections. | EXPECTED BLOCKED/FAIL-CLOSED |
| `.venv\Scripts\python.exe -m pytest -q` | 85 passed, 0 failed; 1 existing pandas DB-API warning; 11.07s. | PASS |
| `npm test` (no JavaScript/CAP changes in this step) | 36 passed, 0 failed; 8.09s, as recorded in the preceding UI label verification. | PASS (current tree before this Python-only validator change) |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

Shipment endpoints now resolve only to known supplier, facility, port, or warehouse IDs, consistent with the typed location references in the official logical data model.


### IMP-02 demand aggregate reconciliation

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 41 passed, 0 failed, 1.93s, including baseline aggregate equality and rejection of a mismatched aggregate. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` solely for unresolved `calculationAssumptions` and `productionPlans` schemas. | EXPECTED BLOCKED/FAIL-CLOSED |
| `.venv\Scripts\python.exe -m pytest -q` | 87 passed, 0 failed; one existing pandas DB-API warning; 14.72s. | PASS |
| `npm test` (no JS/CAP changes in this step) | 36 passed, 0 failed; 8.09s, from the immediately preceding cross-check. | PASS (current JS/CAP sources) |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

The check groups by product and unit and does not infer a demand or allocation policy.


### IMP-02 CAP unique-key fixture validation

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 47 passed, 0 failed, 3.08s; six parametrized regressions cover each declared CAP unique key. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 93 passed, 0 failed; one existing pandas DB-API warning; 12.83s. | PASS |
| `npm test` | 36 passed, 0 failed; 7.33s. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 records schema-validated; exit `1` for the two unresolved schemas only (`calculationAssumptions`, `productionPlans`). | EXPECTED BLOCKED/FAIL-CLOSED |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

The fixture validator now mirrors the unique constraints declared in the draft CAP model and authoritative DB schema; no decision state was changed.


### IMP-02 shipment arrival and dispatch chronology

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 48 passed, 0 failed, 2.96s; negative test confirms actual arrival earlier than dispatch is rejected. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` solely for unresolved `calculationAssumptions` and `productionPlans`. | EXPECTED BLOCKED/FAIL-CLOSED |
| `.venv\Scripts\python.exe -m pytest -q` | 94 passed, 0 failed; one existing pandas DB-API warning; 13.66s. | PASS |
| `npm test` (Python-only change) | 36 passed, 0 failed; 7.33s, run on the current Node/CAP sources immediately before this edit. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

The new chronology check is conditional on a dispatch event being present and does not invent dispatch data for the existing historical records.


### IMP-02 audit source-reference validation

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 49 passed, 0 failed, 3.22s; broken audit `sourceRefs` are rejected. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` for the only two unresolved schemas: `calculationAssumptions` and `productionPlans`. | EXPECTED BLOCKED/FAIL-CLOSED |
| `.venv\Scripts\python.exe -m pytest -q` | 95 passed, 0 failed; one existing pandas DB-API warning; 13.39s. | PASS |
| `npm test` (Python-only change) | 36 passed, 0 failed; latest full Node/CAP run recorded immediately before this validator change. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

Dynamic audit actor/resource references remain polymorphic and are not guessed; this check applies to source-reference values that are IDs in the fixture set.


### IMP-02 communication-delivery parent cardinality

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 51 passed, 0 failed, 3.37s; checks neither-parent and both-parent invalid records. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` only for missing schemas on `calculationAssumptions` and `productionPlans`. | EXPECTED BLOCKED/FAIL-CLOSED |
| `.venv\Scripts\python.exe -m pytest -q` | 97 passed, 0 failed; one existing pandas DB-API warning; 15.24s. | PASS |
| `npm test` | 36 passed, 0 failed; 7.62s. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

Communication-delivery records now require exactly one modeled parent, consistent with the official database schema.


### IMP-02 finite-number validation

| Command/check | Actual output/result | Status |
|---|---|---|
| Initial focused regression run | 52 passed, 1 failed: the new test showed non-finite values in schema-unmapped records were skipped. | FAIL (defect reproduced) |
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` after fix | 53 passed, 0 failed, 3.42s; catches NaN in a schema-backed quantity and Infinity in an unmapped assumption. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 99 passed, 0 failed; one existing pandas DB-API warning; 11.10s. | PASS |
| `npm test` | 36 passed, 0 failed; 7.11s. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` for the two unresolved schemas only (`calculationAssumptions`, `productionPlans`). | EXPECTED BLOCKED/FAIL-CLOSED |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

The finite check runs even for record collections whose full schema remains unresolved.


### Partial validation for unresolved production-plan records

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 54 passed, 0 failed, 3.76s; negative `plannedQuantity` is rejected despite the unresolved collection schema. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 100 passed, 0 failed; one existing pandas DB-API warning; 11.19s. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` remains limited to missing `calculationAssumptions` and `productionPlans` schemas. | EXPECTED BLOCKED/FAIL-CLOSED |
| `npm test` (Python-only validator changes) | 36 passed, 0 failed; 7.11s, recorded after finite-number changes and before this final Python-only invariant. | PASS |
| `git diff --check` | Exit code `0`; existing `.gitignore` line-ending notice. | PASS |

The two unresolved collections remain strict failures; selected fields with authoritative semantics still receive independent invariants.


### IMP-02 strict JSON parsing

| Command/check | Actual output/result | Status |
|---|---|---|
| `.venv\Scripts\python.exe -m pytest tests\unit\test_synthetic_fixture_validation.py -q` | 56 passed, 0 failed, 3.60s; tests duplicate object-key rejection, NaN token rejection, and CLI input-error reporting. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 102 passed, 0 failed; one existing pandas DB-API warning; 11.44s. | PASS |
| `npm test` | 36 passed, 0 failed; 7.04s. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit `1` solely for the two unresolved schemas, `calculationAssumptions` and `productionPlans`. | EXPECTED BLOCKED/FAIL-CLOSED |
| `git diff --check` | Exit code `0`; existing `.gitignore` LF-to-CRLF notice. | PASS |

Both fixture and schema files use strict JSON parsing; no fixture contents or business data were changed.

### Final reproducible install and regression check — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `npm ci` | Added 78 packages; audited 193 packages. npm reported 2 high-severity findings in the full dependency tree. | PASS WITH SECURITY FINDINGS |
| `npm audit --omit=dev` | `found 0 vulnerabilities`. | PASS |
| `npm test` | 36 passed, 0 failed; 7.812s. Includes ephemeral HTTP checks for health/readiness, MonitoringService OData, UI shell delivery, synthetic message creation, and retry. Expected 409 validation cases emit CAP error logs during the passing test. | PASS |
| `npm run build` | CAP production build completed; generated HANA artifacts under ignored `gen/production`. | PASS |
| `.venv\Scripts\python.exe -m pytest -q` | 102 passed, 0 failed, 13.69s; one pre-existing pandas DB-API warning. | PASS |
| `.venv\Scripts\python.exe scripts\validate_synthetic_fixtures.py` | 157 schema-validated records; exit 1 because `calculationAssumptions` and `productionPlans` still have no approved record schemas. | BLOCKED / FAIL-CLOSED |

No BTP deployment or SAP-hosted demo was performed. Cloud Foundry CLI and MBT are unavailable in this environment; deployment target/account and unresolved official decisions remain prerequisites. Local SAPUI5 browser rendering has not been independently verified; the automated CAP HTTP integration test verifies the UI shell response and action wiring only.

### IMP-04 SAPUI5 runtime-load fallback — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `npm test` | 37 passed, 0 failed; 6.98s. Includes regression execution of the SAPUI5 bootstrap error handler and the existing CAP HTTP/UI shell/action integration test. | PASS |
| `npm run build` | CAP production build completed in 11.93s. | PASS |
| Browser rendering | Not exercised; this change only verifies the bootstrap failure handler and delivered HTML structure. | NOT VERIFIED |

The shell now displays a screen-reader-announced load error if the external SAPUI5 bootstrap cannot be fetched. It leaves the existing monitor/API behavior unchanged.

### Dependency security audit — 2026-11-03

| Command/check | Actual output/result | Status |
|---|---|---|
| `npm audit` | 2 high findings: `@sap/cds-dk` bundles `body-parser@2.3.0`, vulnerable per GHSA-27r3-jxmh-p828. | FAIL / UPSTREAM BLOCKER |
| `npm audit --omit=dev` | `found 0 vulnerabilities`. | PASS |
| `npm audit fix --dry-run` | Reports the affected parser is bundled in `@sap/cds-dk` and cannot be updated automatically; proposed automatic fix downgrades the CLI to 9.9.7 (major-version mismatch). | NO SAFE AUTOMATIC FIX |

The package override does not replace dependencies embedded in the CLI tarball. Do not claim the complete dependency tree is vulnerability-free. Reassess against a compatible SAP CAP CLI release with the bundled parser fixed.

The latest verified feature-code push is `f7413cb9c04e6725e2dc4c9809a10fe28c2f3304` on `origin/feat/sap-foundation-monitoring`.
