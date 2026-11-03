# Implementation progress

**Branch:** `feat/sap-foundation-monitoring`  
**Roadmap:** Official [`PHASES.md`](docs/official-specification/PHASES.md)  
**Current phase:** IMP-03 is in progress; IMP-02 retains the specification and baseline blockers listed below. The draft local CAP domain model and fixture schemas cover all currently specified entities except two unresolved fixture collections. Seed/reset remains blocked pending an authoritative baseline fixture. The IMP-04 load-failure fallback is in feature commit `f7413cb`; status evidence was subsequently pushed. No BTP deployment was performed.

## Foundation verification

Foundation sprint results remain recorded in [`TEST_REPORT.md`](docs/TEST_REPORT.md). The feature branch has a reproducible CAP/npm setup, local SQLite, health/readiness routes, MonitoringService, actual HTTP synthetic message creation/retry, and an HTTP smoke test. The previous Windows npm `EPERM` did not recur in three clean installs; root cause remains unknown. The Python project's existing business logic remains unchanged; only a stale existing test expectation was corrected in the earlier sprint.

## IMP-02 completed in this pass

- Inspected all 28 previously schema-uncovered fixture collections against the authoritative proposed logical and relational specifications. The grouped [schema coverage matrix](docs/IMP-02_SCHEMA_COVERAGE.md) records collection counts, observed fields, references, schema status, and relevant unresolved decisions.
- Added 26 draft entity schemas in [`additional-fixture-entities.schema.json`](docs/official-specification/data/schemas/additional-fixture-entities.schema.json), derived from fields, optionality, relations, and constraints stated in `08_DATA_MODEL_AND_DEMO_DATA.md` and `DATABASE_SCHEMA.md`. State values remain strings where a final lifecycle contract is not approved.
- Extended `scripts/validate_synthetic_fixtures.py` to validate all 26 schema definitions plus existing schemas, schema-backed fixture records, duplicate scalar/composite identifiers, declared/mapped cross-file references, and specification-backed quantity, unit, and date invariants. It currently validates **157 schema-backed records** across **45 of 47 fixture collection types** with no record/schema/reference/duplicate/invariant issues.
- Added parameterized tests for each of the 26 new schemas, alongside invalid-record, broken-reference, duplicate-ID, composite-key, valid-fixture, quantity/unit/date invariant tests.
- Added a draft local CAP domain model in [`db/domain.cds`](db/domain.cds) for **46 specification-backed fixture entity types**, including declared associations, required fields, and documented unique constraints where the specifications identify them. It preserves open status values as strings and does not claim tenant isolation, identity policy, final contracts, HANA readiness, or migration safety. Unsupported `CalculationAssumptions` is not modeled; the documented core ProductionPlan model omits the fixture-only undocumented fields.
- Kept the strict validator fail-closed. It exits 1 and lists exactly two unresolved fixture collection types: `calculationAssumptions` and `productionPlans`.
- No seed/reset implementation was added. The official fixture files contain completed historical events and are not an authoritative baseline selection.

## Exact remaining blockers and needed official inputs

1. **`calculationAssumptions` schema/model:** the official logical model and relational schema do not define this entity. Needed: an approved entity purpose, field/type/requiredness definitions, relationships, and unit/formula semantics (relevant to D-01 and D-14).
2. **`productionPlans` fixture schema:** official specifications define the core plan but not fixture-only `plannedProductionDays` and `apiConsumptionKgPerProductionDay`. Needed: approved field definitions, unit/time basis, and contract version (D-01/D-12). The draft CAP entity contains only documented fields.
3. **Seed/reset baseline:** no baseline fixture or record-selection manifest exists. Needed: owner-approved baseline state listing included/excluded records, state/version/checksum, and reset expectations. The official timeline alone does not authorize loading selected rows from the completed history as the initial state.
4. **Final CAP/persistence readiness:** D-12 API/lifecycle contracts and D-13 physical schema, tenant boundary, and migrations remain unresolved. Needed: owner-approved decisions and validation evidence before finalizing persistence or making multi-tenant/HANA claims. D-11 identity scopes also remain pending; the model's descriptive User/Role/Permission records do not grant access.

No D-01–D-19 decision was resolved. No seed/reset or HANA deployment was attempted. Further IMP-02 work should resume when the listed source inputs are added or approved.

## Current verification

- `.venv\\Scripts\\python.exe -m pytest -q`: **82 passed in 21.52s**, one pandas `read_sql` warning; pytest-asyncio also reports a fixture-scope deprecation at startup.
- `npm test`: **8 passed, 0 failed** including live HTTP smoke behavior and CAP domain model assertions.
- `npm run build`: passed in 28.8s; CAP generated local production build artifacts for the draft model. This is a build result, not deployment evidence.
- `scripts/validate_synthetic_fixtures.py`: **157 schema-backed records passed; 2 collections unmapped; exit 1 by design**.
- `pip check`: no broken requirements. `git diff --check`: exit 0 (Git reports the existing `.gitignore` line-ending conversion notice).


### Final verification update — 2026-11-03

- Added cross-record invariants traceable to the official data model: material/product unit compatibility, inventory batch expiry order, consumption not exceeding batch quantities, fulfillment/delivery totals not exceeding their parent quantity, delivery unit and timestamp order, production period/batch timestamp rules, shipment date order, and nonoverlapping product-material effective intervals.
- Hardened integrity validation so non-object records, nonscalar identifiers, and nonstring references are reported instead of causing lookup failures. Retry logging now falls back to the synthetic message correlation ID when invoked without an HTTP request context.
- Focused validator tests: **36 passed in 2.38s**. Full Python suite: **82 passed, 1 warning in 20.29s** (existing pandas/DB-API `read_sql` warning; pytest-asyncio also emits a fixture-loop-scope deprecation at startup).
- CAP suite: **8 passed, 0 failed**. `npm run build`: **passed**, 28.8s. Strict fixture validation: **157 schema-backed records; no issues printed; exactly two unmapped collections; exit 1 by design**.
- Seed/reset remains intentionally unimplemented until an approved baseline selection is supplied. This work did not modify Python business logic, deploy, or push.

### IMP-03 deterministic demand aggregation

- Added `srv/domain/demand-aggregation.js` for one explicitly selected product, unit, and included-customer set. It sums only synthetic customer assumptions, reconciles an optional aggregate row, and withholds the total for missing/duplicate customer assumptions, duplicate aggregate rows, unit mismatches, non-synthetic records, invalid quantities, or aggregate disagreement.
- The output labels the value as a synthetic estimate and carries source assumption IDs. It does not allocate demand, rank customers, mix units, use actual consumption, or infer calendar/production-day conversions.
- Added tests for fixture reconciliation and invalid/missing/conflicting cases. The official five-customer synthetic fixture reconciles exactly to **25,000 tablet/day**.
- Verification after both IMP-03 helpers: `npm test` passed **19/19**; `npm run build` passed in **16.3s**; `git diff --check` exited 0 with the existing `.gitignore` line-ending notice.
- These are pure domain functions and are not yet CAP API endpoints. D-11/D-12 gate API exposure and identity; D-08 gates customer allocation; D-09 gates any broader supplier eligibility rule. D-01 still gates conversion between calendar and production days.

### IMP-03 unit-aware coverage calculation

- Added `srv/domain/coverage-calculation.js`. It computes inventory quantity ÷ consumption rate as production-day coverage only when units are explicitly `kg` and `kg/production_day`, and includes source references and data-mode/estimate labels.
- It can reproduce the official 30-calendar-day delay minus 20-production-day coverage as a `documented_scenario_comparison_only` value of 10, while explicitly setting `normalized: false` and `forecast: false` and returning the D-01 warning. It does not convert day bases or claim a shortage forecast.
- Input/rate/unit failures are rejected. No live data or external integration is used.
- Final Node suite after the helper updates: `npm test` **23 passed, 0 failed**. CAP production build passed in **30.1s**. `git diff --check` exited 0 with the existing `.gitignore` line-ending notice.

### IMP-04 UI runtime verification status

- The existing test verifies HTTP delivery of the UI shell and action URLs through CAP. A real SAPUI5 browser boot/click check remains **not verified**. Computer-use denied launching Brave (`Computer Use was not approved to use Brave`); the isolated headless Chrome launch attempt was also rejected by command policy. Existing Chrome windows were left untouched.

### IMP-03 provenance hardening — 2026-11-03

- Coverage calculations now require explicit inventory and consumption source references and preserve each input's source status, data mode, and as-of/observation time where supplied. Delay comparisons also require and preserve a source reference.
- Supplier checklist outputs now preserve reviewer, review time, evidence reference, validity date, and data mode for each present check, including unconfirmed states.
- Final `npm test`: **23 passed, 0 failed in 6.76s**. Final `npm run build`: **passed in 31.5s**. `git diff --check`: exit 0 with the existing line-ending notice.
- One intermediate test run failed because an invalid-unit test omitted the new required provenance references and therefore failed earlier than its expected assertion. The fixture was corrected; the final suite passed.

## IMP-04 shell foundation

- Replaced the single-page operations landing view with the official eight-module navigation shell in [`app/ui5/webapp/index.html`](app/ui5/webapp/index.html). The shell provides responsive navigation, hash-based module routing, keyboard-visible focus, app identity, global-search/notification foundations, and explicit unavailable incident/profile/role context.
- Module entries without approved APIs show an empty foundation state. The app does not load completed historical fixture records as its opening baseline. Existing simulated integration monitoring actions remain under Risk, Compliance & Audit.
- Added static structure and inline-script parse tests. `npm test` passed **26/26**. Actual `GET /ui/` against the running CAP server returned **HTTP 200**, with all 8 module entries, SAPUI5 bootstrap, and the no-historical-baseline notice. `npm run build` passed in **29.3s**.
- Browser rendering, screen-reader output, responsive layout, and physical UI button clicks remain **not verified** due the documented computer-use/command-policy restrictions. No role is fabricated and no mock authentication claim is made.

### IMP-04 same-origin CAP API client

- Added [`app/ui5/webapp/api-client.js`](app/ui5/webapp/api-client.js) for the existing monitoring API only. It uses same-origin credentials, validates collection/action response shapes, rejects malformed responses, and surfaces only HTTP status plus response correlation ID for errors. It sends no access tokens or secrets.
- Updated the shell's monitoring view to use this shared client instead of constructing fetch requests inline.
- Extended the CAP HTTP smoke test to load the actual client module and call list, synthetic create, retry, and duplicate retry against an ephemeral CAP HTTP server. It observed the expected 409 and a generated correlation ID.
- Verification: `npm test` passed **29/29** in **7.98s**; `GET /ui/` and `GET /ui/api-client.js` on the existing CAP server both returned HTTP **200**; the production CAP build passed in **32.4s**. Browser rendering/clicks remain unverified.

### IMP-04 frontend routing and contract client

- Split the same-origin monitoring API calls into `app/ui5/webapp/api-client.js`; the shell uses this client for message reads and simulation actions. It validates response shapes, keeps same-origin credentials, and exposes only status plus correlation ID on errors.
- Added `app/ui5/webapp/module-router.js`; all eight official module hashes resolve deterministically, while malformed/unknown routes fall back to Executive Dashboard. The router is independent of application data and rejects prototype property names.
- The HTTP smoke suite executes the frontend API client against the actual ephemeral CAP server: list, create, retry, and repeat retry (409 with request correlation ID). `/ui/`, `/ui/module-router.js`, and `/ui/api-client.js` all returned HTTP 200 on the running CAP server.
- Final `npm test`: **32 passed, 0 failed in 9.21s**. CAP production build: **passed in 31.3s**. `git diff --check`: exit 0 with the existing line-ending notice.
- Browser UI5 runtime rendering and physical navigation/action clicks remain unverified; static route behavior and HTTP client behavior are tested separately.

### IMP-04 shell safety and route-test update

- Added checks that the browser bundle contains no credential assignments and no absolute provider URLs; the only external URL is the SAPUI5 CDN bootstrap. The CAP client uses same-origin routes.
- Added route utility tests for all eight official module IDs, malformed hashes, unknown routes, and prototype-property names.
- Final `npm test`: **33 passed, 0 failed in 9.35s**. This is static and HTTP coverage; it is not browser rendering evidence.
- The shell now pins its SAPUI5 CDN bootstrap to version `1.148.12`; the asset was checked for HTTP 200. This local version choice is not yet confirmed compatible with the intended BTP/Work Zone target. The shell still uses a small hash-route helper rather than a standard UIComponent/manifest app. Browser rendering and navigation/action clicks remain unverified.

## Current checkpoint — 2026-11-03

- **Active phases:** IMP-03 and IMP-04 foundations. IMP-02 remains incomplete only at the two unmapped fixture schemas and approved baseline/decision-dependent persistence work described above.
- Added `@requires: 'authenticated-user'` to the CAP MonitoringService. The monitoring-service unit test confirms the CAP authorization annotation, verifies anonymous action rejection (401), then exercises the simulation as an identified test principal. HTTP smoke coverage verifies anonymous OData reads return 401 and an ephemeral, test-only Basic-auth principal can list/create/retry synthetic messages. Test credentials are generated at runtime and are not stored in files.
- The development mock-auth user context is not yet integrated into the browser shell. Browser-triggered monitoring calls under the current local server configuration still need an end-user identity/session workflow. No D-11 provider, role matrix, or production authentication claim was added.
- Latest verification: `npm test` **33 passed, 0 failed** (9.37s); `npm run build` passed (17.46s); `.venv\\Scripts\\python.exe -m pytest -q` **82 passed** (14.45s, existing pandas DB-API warning and pytest-asyncio loop-scope deprecation); fixture validator reported **157 schema-backed records** and the two expected unmapped collections, exit 1 by design; `git diff --check` exit 0 (existing `.gitignore` line-ending notice).
- Next: continue only with roadmap work whose API/data contracts are specified, keep D-11/D-12 gated where needed, and complete browser verification when an approved supported test path is available. No deployment or push occurred.

## IMP-04 SAPUI5 component scaffold — 2026-11-03

- Converted the existing shell to SAPUI5 `ComponentSupport` with a JSON application manifest, `UIComponent`, XML root view, and MVC controller. The current eight navigation links, custom hash routing, empty-state language, and monitoring list/create/retry actions were moved into the component controller/API client without adding new business endpoints.
- The manifest pins `minUI5Version` to the already-used CDN runtime `1.148.12`. It declares `sap.m` and `sap.ui.core` and supports desktop, tablet, and phone. This runtime choice remains unverified for the eventual Work Zone/BTP target.
- HTTP smoke coverage now checks delivery of `manifest.json`, `Component.js`, and the controller through CAP. Static tests validate the manifest, JS syntax, controller/view wiring, and preserved action calls.
- Verification: `npm test` **33 passed, 0 failed** (8.93s); `npm run build` passed (17.67s); Python **82 passed** (12.91s; one existing pandas DB-API warning plus pytest-asyncio loop-scope deprecation); fixture validation reported 157 schema-backed records and two unmapped collections (expected exit 1); `git diff --check` exited 0 (existing `.gitignore` line-ending notice).
- Browser UI5 boot/render, navigation, responsive layout, accessibility, and physical action clicks remain **not verified**. The test proves static delivery and script/manifest structure only. Authenticated UI session behavior is still gated on the D-11 identity/session configuration.
- Browser verification attempt: the in-app browser refused `http://127.0.0.1:4004/ui/` because the origin approval gate reported that access was declined. No alternate browser or network path was used. Browser evidence requires the user to grant the local origin when prompted.

### IMP-04 manifest-based SAPUI5 routing — 2026-11-03

- Replaced direct `hashchange` handling in the component controller with manifest-configured `sap.m.routing.Router`. The component initializes the router once; home and module patterns target the reusable Module view. The existing route helper still normalizes unknown module names.
- Added route assertions alongside the eight-module and controller tests. Official SAPUI5 documentation describes configuring routes/targets in the manifest and initializing the router from `Component.init`; the implementation follows that pattern.
- Latest `npm test`: **33 passed, 0 failed** (8.97s), including HTTP delivery of the current manifest/component/controller and CAP auth/action smoke requests. `node --check` passed for Component.js and Module.controller.js; Python ElementTree parsed both XML views; `git diff --check` exited 0.
- This does not prove that SAPUI5 booted in a browser. The local-origin browser access was declined and no alternate path was used. Functional browser routing/action acceptance remains unverified.
- Added a manifest bypass target so malformed/unmatched hashes load the module shell and the route helper can fall back to Executive Dashboard, preserving the prior behavior. Final `npm test` after this change: **33 passed, 0 failed** (9.02s); manifest JSON validation passed; `git diff --check` exit 0. The route behavior is covered at helper/static-config level only.
- Extended the CAP HTTP smoke test to pass an actual anonymous 401 response through the frontend API client; it confirms the UI-safe error includes status and request correlation ID while omitting server details. Expanded the credential/provider URL scan to all component/manifest/controller/view assets. Latest `npm test`: **33 passed, 0 failed** (9.19s); `git diff --check` exit 0. No Python files changed in this checkpoint.

### IMP-04 native SAPUI5 shell layout — 2026-11-03

- Replaced the remaining hand-built shell layout with SAPUI5 `sap.tnt.ToolPage`, `ToolHeader`, `SideNavigation`, and `NavigationList` controls. The app title, explicitly unavailable search/notifications/profile context, and all eight roadmap module links are represented in the XML view.
- Added an MVC shell controller to route navigation selections through the manifest router, toggle the standard side navigation, and set the current-page accessibility attribute. The module controller no longer searches for or mutates removed static navigation links.
- Tests now inspect the XML navigation entries and controller routing hooks. This is source/static validation; it does not prove the UI5 runtime rendered or that controls behaved in a browser.
- Verification after the final controller render-sync adjustment: `npm test` **33 passed, 0 failed** (9.55s); `npm run build` passed (29.78s); `node --check` passed for both MVC controllers; Python ElementTree parsed both XML views; `.venv\Scripts\python.exe -m pytest -q` **82 passed, 1 warning** (19.68s); fixture validator reported **157 schema-validated records** and unmapped `calculationAssumptions`, `productionPlans`, exit 1 (expected fail-closed result); `git diff --check` exited 0 with the existing `.gitignore` LF/CRLF notice. Browser UI rendering/interactions remain **NOT VERIFIED** because local-origin browser access was declined earlier. No Python business logic changed.

### IMP-04 route callback verification and unknown-route correction — 2026-11-03

- Extended the HTTP smoke test to request `/ui/controller/App.controller.js` and require HTTP 200 plus its route callback. Added executable controller-callback tests using a small SAPUI5 `Controller.extend` stub: all eight selections, menu toggle, active-item marking, and unknown-module fallback are exercised.
- The stronger callback test exposed a real routing mismatch: the manifest's broad `{module}` pattern matched unsupported module names, but only the page content fell back to the dashboard while the URL/navigation state remained inconsistent. `App.controller.js` now normalizes route arguments through the existing router helper and returns unknown module routes to `home`.
- One intermediate focused test failed due cross-realm object prototypes in the test harness, then a second exposed that the vm stub's global `window` needed the router helper. The test harness was corrected; these were test-harness failures, not application runtime evidence.
- Verification: focused `node --test test/ui-shell.test.js test/http-smoke.test.js` **6 passed, 0 failed**; final `npm test` **34 passed, 0 failed** (9.13s); `node --check app/ui5/webapp/controller/App.controller.js` passed; `git diff --check` exited 0 with the existing `.gitignore` LF/CRLF notice. CAP HTTP smoke and UI actions passed at the API layer. Browser UI5 rendering/navigation clicks remain **NOT VERIFIED**.
- Added the top-bar `No active incident` state required by the UI specification; the app currently has no approved baseline or active incident loaded. Latest full `npm test` after the change: **34 passed, 0 failed** (9.32s); `git diff --check` remains exit 0 with the existing line-ending notice.
- IMP-04 error-state handling now labels HTTP 401 as “Authentication required” and HTTP 403 as “Access denied”, while preserving only the status and correlation reference and discarding server response details. This uses generic HTTP meaning and does not claim a configured login provider or role policy.
- Verification after the error-message change: `npm test` **35 passed, 0 failed** (9.43s), including synthetic 401/403 client tests and the actual anonymous 401 CAP HTTP smoke flow; `git diff --check` exited 0 with the existing `.gitignore` line-ending notice. Python was not rerun because no Python files changed.
- Next safe IMP-04 work: continue shell state/accessibility checks that do not require an identity-provider decision. Authenticated browser session/role presentation remains gated by D-11 and user-granted local-origin browser access; actual UI5 rendering, responsive layout, and accessibility behavior still require browser verification. IMP-05 business-data modules depend on stable API/data contracts and a baseline selection; do not show completed fixtures as baseline.

## Active implementation checkpoint — 2026-11-03

- Branch remains `feat/sap-foundation-monitoring`; changes are local and uncommitted. No deploy or push occurred.
- Most recent verified CAP/UI run: `npm test` **35 passed, 0 failed** (9.43s), including real ephemeral HTTP health/readiness, anonymous 401, authenticated OData/synthetic create/retry, frontend API client, route helper, executable shell controller callback tests, and source/static checks. CAP build last passed in 29.78s before the UI-only tests/error presentation changes; no CAP CDS/runtime service code changed since that build. Python suite last passed **82 tests** before the recent UI-only JavaScript changes; no Python code changed. Fixture validation last reported 157 schema-backed records and failed closed on `calculationAssumptions` and `productionPlans`.
- Current UI client distinguishes authentication required (401) from access denied (403), preserves only HTTP status/correlation ID, and drops server details. An explicit no-active-incident status and honest unavailable profile/search/notification labels are present. Static/callback and API-layer tests do not establish browser rendering or keyboard/screen-reader behavior.
- Strengthened the CAP HTTP smoke path to execute the actual `Module.controller.js` create and retry handlers, passing through the actual browser API client to an ephemeral authenticated CAP server. It verifies the created synthetic row appears, simulated retry updates it, busy state clears, and duplicate retry surfaces HTTP 409 with a correlation reference. Final `npm test`: **35 passed, 0 failed** (8.75s); `git diff --check` exit 0 with existing `.gitignore` line-ending notice. This is controller/API execution, not browser UI verification.
- Fixed the monitor's failed-refresh state: a rejected load now clears previously displayed messages so stale rows are not presented as current, shows a retry-specific no-data message, and clears busy state. A later successful empty load restores the normal empty message and clears the error. Focused `node --test test/http-smoke.test.js`: **1 passed, 0 failed**; final `npm test`: **35 passed, 0 failed** (8.18s); `git diff --check` exit 0 with existing `.gitignore` line-ending notice.
- Guarded overlapping refreshes with a monotonically increasing request generation; only the latest request may update rows, errors, empty-state text, or busy state, and view exit invalidates pending work. Focused HTTP/controller test covers older-first and older-last response order. It also passes a real anonymous CAP 401 through the module controller, confirming an authentication-required message and busy-state cleanup. `node --check` passed; `node --test test/http-smoke.test.js` **1 passed, 0 failed**; final `npm test` **35 passed, 0 failed** (7.50s); `git diff --check` exit 0 with existing line-ending notice.
- Verified the pinned SAPUI5 1.148.12 API and replaced direct DOM `aria-current` mutation with `NavigationList.setSelectedKey`, allowing the native control to own selection semantics. Official API docs list this method in 1.148.12 and show it has existed since 1.62. Focused shell/HTTP tests: **6 passed**; full `npm test`: **35 passed, 0 failed** (7.07s); `git diff --check` passed with the existing line-ending notice. This verifies controller callbacks/configuration, not rendered UI.
- Added a Retry count column to the existing synthetic integration monitor, bound to the already-exposed `Messages.retryCount` field; no service or API contract changed. Existing actual HTTP/controller test confirms the returned message count increments to 1 after retry. `npm test`: **35 passed, 0 failed** (7.17s); `git diff --check` exit 0 with the `.gitignore` line-ending notice.
- Added responsive `sap.m.Table` pop-in rules: Status, Object and Actions remain visible at narrow widths; Direction, Source and Retry count pop in below Tablet; Correlation ID and Updated pop in below Desktop. Replaced the initial source-regex assertions with a controller execution test that captures UI5 constructor settings and checks column/cell alignment. One first test attempt failed because VM-created arrays have cross-realm prototypes; normalized the values before comparison. Focused UI suite **6 passed**; full `npm test` **36 passed, 0 failed** (7.45s); `git diff --check` passed with the existing line-ending notice. Visual viewport rendering remains unverified.
- Remaining IMP-04 acceptance evidence requires (a) an approved, supported browser path to open the local UI origin and inspect layout/navigation/actions/accessibility, and (b) D-11 identity/session and role-scope decisions before implementing an authenticated profile/session flow. The prior browser-origin request was declined; no alternate browser path was used.
- IMP-03 additional domain APIs and IMP-05 data-backed modules must wait for project-owner approval/freezing of API protocol and field/status/pagination/error contracts (D-12), and for an approved baseline selection that excludes post-disruption historical outcomes. IMP-02 seed/reset remains blocked by missing baseline inclusion/state/checksum/reset definition, missing `calculationAssumptions` entity semantics (D-14), undefined `productionPlans` fixture fields (D-12), and D-13 production persistence/tenancy/migration decisions. Do not expose the completed historical scenario as baseline.
- Current next action: continue only UI shell work that can be specified and verified without browser access or identity policy; once those checks are exhausted, wait for the required external evidence/decisions before enabling dependent API, data, or authentication behavior. The active goal remains incomplete; this checkpoint is not a phase-completion claim.


## IMP-04 local monitor filtering

Added a responsive SAPUI5 SearchField that filters the already loaded monitoring rows locally by status, direction, business object, correlation ID, and source. It introduces no endpoint or API contract. CAP message loads retain the active filter; failed loads clear both the full and filtered row sets. The HTTP/controller test exercises case-insensitive correlation filtering, no-match behavior, and clearing the filter against records returned through the real ephemeral CAP HTTP server. A UI controller construction test verifies the filter field and live-change handler are configured. Focused tests passed 7/7; the complete Node suite passed 36/36 in 7.88s. Browser rendering and actual keyboard/pointer interaction remain NOT VERIFIED because local-origin browser access was declined.

- Strengthened the monitor filter regression test to execute the configured SAPUI5 `liveChange` callback and verify the typed query reaches the controller filter method. Focused tests passed **7/7**; final `npm test` passed **36/36** (7.45s); `git diff --check` passed with the existing `.gitignore` LF/CRLF notice. No additional IMP-03/IMP-05 domain endpoint was added because PHASES.md explicitly gates consumers on reviewed API contracts (D-12), a baseline (D-14), and applicable identity/persistence decisions.


### SAPUI5 monitor filter accessible name

Added a visible `sap.m.Label` associated with the monitor SearchField through `Label.setLabelFor(filterField)`. This gives the field a programmatic label instead of relying on its placeholder/tooltip. The test inspects the association and invokes the live-change callback. The pinned SAPUI5 1.148 API documents `sap.m.Label` as providing textual labels for controls and exposes `setLabelFor`; see [SAPUI5 Label API](https://ui5.github.io/typescript/api/sapui5/1.148/sap.m/sap/m/Label/classes/Label.html). Focused UI/HTTP tests passed **7/7**; `node --check` passed; full `npm test` passed **36/36** (7.62s); `git diff --check` passed with the existing `.gitignore` line-ending notice. Browser accessibility-tree output remains NOT VERIFIED.

- Broader regression after the label change: `npm run build` passed (CAP production build completed in **30.55s**); `.venv\Scripts\python.exe -m pytest -q` passed **82 tests** (16.39s; one existing pandas DB-API warning and pytest-asyncio loop-scope deprecation); fixture validation returned **157 schema-validated records** and exit **1** for the two unresolved schema mappings `calculationAssumptions` and `productionPlans` (fail-closed as documented). This work did not touch Python logic.


### IMP-02 typed fixture-reference validation

A model-to-validator audit found that `ImpactEstimate.assumptionRefs` was omitted from array-reference checks, and `Route.waypoints` accepted any known identifier rather than a logistics-location identifier. The authoritative data model identifies assumptions as `CalculationAssumption`/`DemandAssumption` references and route locations as Supplier, Facility, Port, or Warehouse IDs. The validator now checks those exact collection sets while retaining the strict missing-schema failure for `calculationAssumptions` and `productionPlans`; no schema or decision was invented. Added regressions for nonexistent assumption IDs and a product ID incorrectly used as a route waypoint. Focused validator tests: **38 passed**; full Python suite: **84 passed** (15.34s; one existing pandas DB-API warning); full Node/CAP suite: **36 passed** (8.09s); fixture validation: **157 records**, exit **1** for the same two unmapped schemas; `git diff --check` passed with the existing `.gitignore` line-ending notice.

- A second reference audit found shipment `originRef`/`destinationRef` were not checked, although the official logical model defines them as location references and the fixture uses the same supplier/facility/port/warehouse identifiers as routes. These endpoints now receive the same typed-location validation as route endpoints. Added a wrong-type shipment origin regression. Validator-focused tests: **39 passed**; full Python suite after the change: **85 passed** (11.07s; one existing pandas DB-API warning); strict fixture validation remains at **157 schema-validated records** and exits 1 only for the two unmapped collections. `git diff --check` passed with existing `.gitignore` line-ending notice. Full `npm test` was run immediately before this Python-only edit: **36 passed** (8.09s); no JS/CAP files changed in this step.


### IMP-02 demand aggregate invariant

Implemented the documented invariant that a `DemandAssumption` aggregate with no `customerId` equals the sum of included customer-specific assumptions for the same `productId` and unit. Decimal arithmetic avoids float rounding in the comparison. Added fixture-validity and deliberately-mismatched-total tests. Focused validator tests passed **41/41**; full Python suite passed **87/87** (14.72s; one existing pandas DB-API warning); fixture validator reported **157 schema-validated records** and remained fail-closed only for the two unresolved schema mappings; `git diff --check` passed. The last full Node/CAP suite on this tree before this Python-only change passed **36/36** (8.09s).


### IMP-02 declared unique constraints in fixture validation

Aligned dataset validation with the six unique-key constraints already present in the CAP draft model: approval request `idempotencyKey`, inventory batch (`materialId`,`lotCode`), permission (`resource`,`action`), production batch (`productionPlanId`,`batchCode`), recovery plan (`disruptionId`,`version`), and role `name`. Added one collision case for each, keeping primary/composite identifier checks intact. Focused validator tests passed **47/47**; full Python suite **93/93** (12.83s; one existing pandas DB-API warning); Node/CAP suite **36/36** (7.33s); fixture validator reported **157 schema-validated records** and remains fail-closed only for `calculationAssumptions` and `productionPlans`; `git diff --check` passed with the existing line-ending notice.


### IMP-02 actual arrival versus dispatch evidence

Implemented the documented shipment invariant: when dispatch evidence (`ShipmentEvent.eventType == departed`) exists, `actualArrival` cannot be earlier than its event date. The validator uses the latest dispatch event for that shipment; date-only arrival values are compared at day precision. Added a regression that appends a synthetic dispatch event after the recorded actual arrival and verifies rejection. Focused fixture tests: **48 passed**; full Python suite: **94 passed** (13.66s; one existing pandas DB-API warning); fixture validation reports **157 schema-validated records** and remains fail-closed only on the two unresolved schema mappings; `git diff --check` passed. Node/CAP suite most recently passed **36/36** immediately before this Python-only edit.


### IMP-02 audit source-reference integrity

Added cross-file resolution for audit `sourceRefs` arrays. Existing fixture references resolve to current fixture identifiers; a new negative test replaces one with a nonexistent evidence ID and confirms validation rejects it. Focused fixture tests passed **49/49**; full Python suite passed **95/95** (13.39s; one existing pandas DB-API warning); fixture validation reports **157 schema-validated records** and still exits 1 only for the two unresolved schema mappings; `git diff --check` passed. The full Node/CAP suite last passed **36/36** before this Python-only change.


### IMP-02 communication delivery parent cardinality

Added the official invariant that each communication-delivery record has exactly one parent (`emailDraftId` XOR `voiceCallId`). Added regression cases for neither parent and both parents; the original fixture continues to pass this invariant. Focused fixture tests passed **51/51**; full Python suite passed **97/97** (15.24s; one existing pandas DB-API warning); Node/CAP suite passed **36/36** (7.62s); fixture validation reports **157 schema-validated records** and exits nonzero only for the two unresolved record schemas; `git diff --check` passed.


### IMP-02 finite numeric fixture validation

A validator review found Python can decode non-standard `NaN`/`Infinity` constants from JSON and Draft 2020-12 numeric `minimum` checks do not guarantee finite values under that parser. Added recursive finite-number checks for schema-backed and unmapped collections, and made the Decimal helper fail closed on non-finite values so downstream invariants do not compare NaN/Infinity. Two regressions cover NaN in inventory quantity and Infinity in unresolved `calculationAssumptions`. The first focused run exposed that the unresolved-schema path was skipped; the loop was corrected, after which focused tests passed **53/53**. Full Python passed **99/99** (11.10s; one existing pandas DB-API warning); Node/CAP passed **36/36** (7.11s). Fixture validation remains fail-closed on the same two missing schemas with 157 schema-backed records; `git diff --check` passed.

- Extended partial validation for the unresolved `productionPlans` collection using only its specification-backed `plannedQuantity` field: negative values are rejected even though the full collection remains unmapped. Regression passes alongside finite-number and existing checks. Focused validator tests: **54 passed**; full Python suite: **100 passed** (11.19s; one existing pandas DB-API warning); fixture validator still reports 157 schema-backed records and only the two unresolved schemas; `git diff --check` passed. Node/CAP suite was rerun after the finite-number change and passed **36/36** (7.11s); the subsequent change is Python-only.


### IMP-02 strict JSON input parsing

Fixture and schema JSON now reject duplicate object keys and non-standard `NaN`/`Infinity` constants instead of silently normalizing ambiguous input. The validator CLI reports these as concise `input_error` messages and exits 2. Added parser and CLI regressions. Focused fixture tests passed **56/56**; full Python suite passed **102/102** (11.44s; one existing pandas DB-API warning); full Node/CAP suite passed **36/36** (7.04s); fixture validation remains fail-closed at 157 schema-backed records with `calculationAssumptions` and `productionPlans` unresolved; `git diff --check` passed.

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

The feature branch push completed successfully; feature commit `f7413cb9c04e6725e2dc4c9809a10fe28c2f3304` and the following status-evidence commit are on `origin/feat/sap-foundation-monitoring`. The unrelated `docs/sap-integration/` and `docs/sap-architecture/` additions were excluded from the commits because their text describes a separate live S/4HANA Integration Suite deployment and is not evidence for this application.

### IMP-04 SAPUI5 runtime-load failure state

Added a hidden accessible `role="alert"` fallback that becomes visible if the pinned `ui5.sap.com` bootstrap script fails to load. Its message directs the user to check connectivity and states that no operational data/action is available. A unit regression executes the capture-phase load-error handler, verifies unrelated resource errors do not reveal it, and verifies the SAPUI5 bootstrap error does. This improves failure behavior; it does not verify a successful browser render. `npm test`: **37 passed, 0 failed** (6.98s); `npm run build`: **passed** (11.93s).

### Dependency audit finding

Current `npm audit` reports two high findings because `@sap/cds-dk@10.2.0` bundles `body-parser@2.3.0`, affected by GHSA-27r3-jxmh-p828. Production-only audit (`npm audit --omit=dev`) finds **0 vulnerabilities**. `npm audit fix --dry-run` confirms npm cannot update the bundled dependency; npm registry metadata shows 10.2.0 is the latest available CAP 10 CLI in the configured registry. Downgrading to 9.9.7 would cross a major version and is not an acceptable automatic fix for this CAP 10 project. Revisit when SAP publishes a compatible fixed CLI release; do not represent the full dependency audit as clean.

### IMP-10 scenario-test coverage audit

Mapped all 20 official scenario cases (T-01 through T-20) to current evidence in [`TEST_REPORT.md`](docs/TEST_REPORT.md). Only T-03's domain-helper behavior passes at its narrow unit-test scope; T-04/T-05/T-07/T-12/T-13 are partial, and baseline, workflow, agent, communications, emergency-control, and closure scenarios remain blocked or unimplemented. Current full regressions: Node/CAP **37 passed**; Python **102 passed** (one existing pandas DB-API warning); CAP production build passed; strict fixture validation remains fail-closed for the two unmapped collections. This matrix intentionally does not inflate unit or smoke-test evidence into full scenario acceptance.

### IMP-04 archive presentation and production artifact correction — 2026-11-03

Added a user-triggered, read-only historical synthetic fixture archive across the eight module pages, with provenance, fictional-data disclaimers, historical-state warnings, and explicit exclusions for unresolved schema collections and dependent records. The archive is generated deterministically from official source fixtures before start/watch/build/test; it does not change current operational state or implement seed/reset. Fixed the production build so the static SAPUI5 app is copied into `gen/production/app/ui5/webapp`, matching the production server's static-file path.

Verification: `npm test` passed 44/44 (10.03s); `npm run build` passed (18.16s) and the production UI index, archive manifest, and controller were present; Python passed 102/102 (15.34s, one existing pandas DB-API warning). Fixture validation remains fail-closed: 157 records schema-validated; `calculationAssumptions` and `productionPlans` are unmapped. Archive records are historical examples only; baseline selection, seed/reset, unresolved schemas, approved API/security contracts, and SAP-hosted browser demonstration remain blocked by official decisions/configuration. No BTP deployment or push is claimed here.

### IMP-04 shell search and notification affordances — 2026-11-03

Implemented a module-only search in the SAPUI5 shell: a unique module name/ID match navigates to that module; ambiguous and unmatched queries explain the limited search scope. The search does not access business records or bypass unresolved access policy. Replaced the inert disabled notifications button with an explicit disconnected-source notification message. The profile, role, and incident context remain marked unavailable where identity/data services are not connected.

Verification: `npm test` passed **46/46** (8.75s); `npm run build` passed (CAP build 20.30s and postbuild UI copy); the modified `App.view.xml` parsed as well-formed XML; `git diff --check` passed. Automated controller tests do not replace real browser verification. No Python code changed; Python tests were not rerun for this UI-only increment. No deployment was performed.

### IMP-05 partial Digital Twin fixture relationship view — 2026-11-03

Extended the opt-in historical fixture archive with a source-linked Digital Twin view. It resolves entity nodes and route/fulfilment relationships solely from official fixture IDs, reports unresolved references without synthesizing missing nodes, rejects duplicate entity IDs, and expressly avoids inventing coordinates. This is a historical static demonstration view; it is not a live map, CAP-backed operational module, or opening state.

Verification: `npm test` passed **50/50** (9.78s), including model, UI table, and HTTP static delivery checks; `npm run build` passed (CAP build 14.44s plus UI copy); the UI view remains well-formed XML; `git diff --check` passed. The broader IMP-05 exit criteria remain incomplete pending approved data/API contracts, baseline/reset, authorization, and live browser evidence.

### IMP-05 historical collection tables — 2026-11-03

Changed the explicit historical archive from one opaque JSON row list to per-collection tables with columns drawn directly from the source fixture fields, read-only local filtering, and growing rows. Nested values are shown as JSON and source nulls are labelled unavailable; no field semantics, calculations, or state transitions are inferred. Dashboard context remains separate and explicitly historical.

Verification: `npm test` passed **51/51** (9.57s); `npm run build` passed (CAP build 15.09s plus production UI copy); the UI view parses as XML; `git diff --check` passed. Live CAP-backed core modules, state reset, role enforcement, and browser rendering are still outstanding.

### Cross-project verification after IMP-04/05 UI increments — 2026-11-03

Current branch verification: Node/CAP suite **51 passed** (9.57s); CAP production build **passed** (15.09s); Python **102 passed** (15.06s, one existing pandas DB-API warning). Strict fixture validation schema-validated 157 records and returned exit 1 for unresolved schemas `calculationAssumptions` and `productionPlans`. No Python source was changed. This does not clear the IMP-02 baseline/schema blockers or complete later phase exit criteria.

### IMP-04 historical dashboard source-fact view — 2026-11-03

The explicit historical dashboard archive now presents scenario-manifest facts as source field/value rows, then source fixture collections as independently filterable tables. It does not recalculate coverage/gap or imply a current incident; the screen explains D-01's unresolved calendar/production-day basis. The archive client rejects a malformed dashboard `scenarioFacts` object.

Verification: `npm test` passed **52/52** (9.78s); `npm run build` passed (CAP build 12.73s plus UI copy); modified UI XML parsed as well formed; production UI index and Digital Twin script were present; `git diff --check` passed. SAP deployment remains unperformed. Added an SAP BTP setup checklist to `docs/DEPLOYMENT_GUIDE.md`; it documents prerequisites and conditional steps, not a claim of tenant setup.

### Operations-console dashboard and synthetic sample traffic — 2026-11-03

Restyled the SAPUI5 shell with an operations-console title, environment/state badges, module icons, and Fiori-token-based metric cards. The default page reads messages from the CAP MonitoringService endpoint and shows total/failed messages, retries, latest activity, and recent correlation/source details; an unavailable service is shown as unavailable rather than as zero. Added an explicit **Generate sample traffic (8)** action that uses the existing CAP API to create eight locally simulated messages and record four simulated retries. Every generated record remains source-labelled `SIMULATION`; production CAP continues to reject the demo action. No external system is called and no baseline or seed/reset behavior was introduced.

Verification: `npm test` passed **53/53** (11.07s), including CAP HTTP health/ready, OData, synthetic create/retry, UI/static stylesheet delivery, and the eight-message/four-retry generator controller test. `npm run build` passed (CAP production build 21.38s and UI-copy step exit 0). `App.view.xml` parsed as well-formed XML; `git diff --check` passed. A local SAPUI5 visual preview was not verified: starting another server on port 4004 returned `EADDRINUSE`, and browser access to the local origin was declined by the browser security prompt. No claim is made that a live browser or SAP-hosted UI was visually inspected.
