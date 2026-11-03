const test = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomBytes } = require('node:crypto');

test('CAP HTTP health, OData, UI shell, and simulation actions work together', async () => {
  cds.env.requires.db.credentials.url = ':memory:';
  const testUser = `api-test-${randomBytes(6).toString('hex')}`;
  const testPassword = randomBytes(24).toString('base64url');
  cds.env.requires.auth.users = { [testUser]: { password: testPassword } };
  require('../server');
  const server = await cds.server({ port: 0, in_memory: true });
  const base = `http://127.0.0.1:${server.address().port}`;
  const authorization = `Basic ${Buffer.from(`${testUser}:${testPassword}`).toString('base64')}`;
  const fetchAsTestUser = (url, options = {}) => fetch(url, {
    ...options,
    headers: { Authorization: authorization, ...options.headers }
  });

  try {
    const health = await fetch(`${base}/healthz`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });
    assert.match(health.headers.get('x-correlation-id'), /^[0-9a-f-]{36}$/i);

    const callerCorrelationId = 'smoke-test:shipment-123';
    const anonymousRead = await fetch(`${base}/api/v1/monitoring/Messages`);
    assert.equal(anonymousRead.status, 401);
    const anonymousApiContext = {
      fetch: (url, options) => fetch(new URL(url, base), options)
    };
    vm.runInNewContext(apiClientSource(), anonymousApiContext);
    await assert.rejects(anonymousApiContext.VaxResilienceApi.listMessages(), (error) => {
      assert.equal(error.status, 401);
      assert.match(error.correlationId, /^[0-9a-f-]{36}$/i);
      assert.match(error.message, /HTTP 401/);
      return true;
    });
    const anonymousModuleController = loadModuleController(anonymousApiContext.VaxResilienceApi);
    const anonymousUiModel = {
      values: { messages: [], allMessages: [], filterQuery: '', error: '' },
      setProperty(path, value) { this.values[path.slice(1)] = value; },
      getProperty(path) { return this.values[path.slice(1)]; }
    };
    const anonymousUiTable = {
      busy: false, noDataText: '',
      setBusy(value) { this.busy = value; },
      setNoDataText(value) { this.noDataText = value; }
    };
    await anonymousModuleController._loadMessages.call(anonymousModuleController, anonymousUiModel, anonymousUiTable);
    assert.match(anonymousUiModel.values.error, /Authentication required \(HTTP 401\)/);
    assert.match(anonymousUiModel.values.error, /request [0-9a-f-]{36}/i);
    assert.equal(anonymousUiTable.busy, false);

    const correlatedRead = await fetchAsTestUser(`${base}/api/v1/monitoring/Messages`, {
      headers: { 'X-Correlation-ID': callerCorrelationId }
    });
    assert.equal(correlatedRead.status, 200);
    assert.equal(correlatedRead.headers.get('x-correlation-id'), callerCorrelationId);

    const readiness = await fetch(`${base}/readyz`);
    assert.equal(readiness.status, 200);
    assert.deepEqual(await readiness.json(), { status: 'ready', database: 'connected' });

    const ui = await fetch(`${base}/ui/`);
    assert.equal(ui.status, 200);
    const html = await ui.text();
    assert.match(html, /id="sap-ui-bootstrap"/);
    assert.match(html, /module:sap\/ui\/core\/ComponentSupport/);
    assert.match(html, /data-sap-ui-component data-name="vaxresilience"/);

    const manifestResponse = await fetch(`${base}/ui/manifest.json`);
    assert.equal(manifestResponse.status, 200);
    assert.equal((await manifestResponse.json())['sap.app'].id, 'vaxresilience');
    const archiveClientResponse = await fetch(`${base}/ui/archive-client.js`);
    assert.equal(archiveClientResponse.status, 200);
    assert.match(await archiveClientResponse.text(), /omittedCollections/);
    const archiveManifestResponse = await fetch(`${base}/ui/demo-archive/manifest.json`);
    assert.equal(archiveManifestResponse.status, 200);
    const archiveManifest = await archiveManifestResponse.json();
    assert.equal(archiveManifest.dataMode, 'synthetic');
    assert.match(archiveManifest.fictionalDisclaimer, /fictional synthetic demonstration records/);
    const archiveOperationsResponse = await fetch(`${base}/ui/demo-archive/operations.json`);
    assert.equal(archiveOperationsResponse.status, 200);
    assert.equal((await archiveOperationsResponse.json()).shipments.length, 2);
    const componentResponse = await fetch(`${base}/ui/Component.js`);
    assert.equal(componentResponse.status, 200);
    const controllerResponse = await fetch(`${base}/ui/controller/Module.controller.js`);
    assert.equal(controllerResponse.status, 200);
    assert.match(await controllerResponse.text(), /VaxResilienceApi\.retryMessage/);
    const shellControllerResponse = await fetch(`${base}/ui/controller/App.controller.js`);
    assert.equal(shellControllerResponse.status, 200);
    assert.match(await shellControllerResponse.text(), /onNavigationSelect/);

    const collection = await fetchAsTestUser(`${base}/api/v1/monitoring/Messages`);
    assert.equal(collection.status, 200);
    assert.deepEqual((await collection.json()).value, []);

    const createdResponse = await fetchAsTestUser(`${base}/api/v1/monitoring/createDemoFailure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': callerCorrelationId },
      body: '{}'
    });
    assert.equal(createdResponse.status, 200, await createdResponse.clone().text());
    const created = await createdResponse.json();
    assert.equal(created.status, 'FAILED');
    assert.equal(created.source, 'SIMULATION');
    assert.equal(created.correlationId, callerCorrelationId);

    const invalidCorrelation = await fetch(`${base}/healthz`, {
      headers: { 'X-Correlation-ID': 'bad id with spaces' }
    });
    assert.equal(invalidCorrelation.status, 200);
    assert.match(invalidCorrelation.headers.get('x-correlation-id'), /^[0-9a-f-]{36}$/i);
    assert.notEqual(invalidCorrelation.headers.get('x-correlation-id'), 'bad id with spaces');

    const retriedResponse = await fetchAsTestUser(`${base}/api/v1/monitoring/retryMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ID: created.ID })
    });
    assert.equal(retriedResponse.status, 200, await retriedResponse.clone().text());
    const retried = await retriedResponse.json();
    assert.equal(retried.status, 'SIMULATED');
    assert.equal(retried.retryCount, 1);

    const repeatRetry = await fetchAsTestUser(`${base}/api/v1/monitoring/retryMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': 'smoke-test:retry-conflict' },
      body: JSON.stringify({ ID: created.ID })
    });
    assert.equal(repeatRetry.status, 409);
    assert.equal(repeatRetry.headers.get('x-correlation-id'), 'smoke-test:retry-conflict');

    const attemptsResponse = await fetchAsTestUser(`${base}/api/v1/monitoring/Attempts`);
    assert.equal(attemptsResponse.status, 200);
    const attempts = (await attemptsResponse.json()).value;
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].outcome, 'SIMULATED');

    const apiSource = apiClientSource();
    const apiContext = {
      fetch: (url, options = {}) => fetch(new URL(url, base), {
        ...options,
        headers: { Authorization: authorization, ...options.headers }
      })
    };
    vm.runInNewContext(apiSource, apiContext);
    const api = apiContext.VaxResilienceApi;
    const existingMessages = await api.listMessages();
    assert.equal(existingMessages.length, 1);
    const frontendCreated = await api.createDemoFailure();
    assert.equal(frontendCreated.source, 'SIMULATION');
    const frontendRetried = await api.retryMessage(frontendCreated.ID);
    assert.equal(frontendRetried.status, 'SIMULATED');
    await assert.rejects(api.retryMessage(frontendCreated.ID), (error) => {
      assert.equal(error.status, 409);
      assert.match(error.correlationId, /^[0-9a-f-]{36}$/i);
      assert.match(error.message, /HTTP 409/);
      return true;
    });
    assert.equal((await api.listMessages()).length, 2);

    const moduleController = loadModuleController(apiContext.VaxResilienceApi);
    const uiModel = {
      values: { messages: [], allMessages: [], filterQuery: '', error: '' },
      setProperty(path, value) { this.values[path.slice(1)] = value; },
      getProperty(path) { return this.values[path.slice(1)]; }
    };
    const uiTable = {
      busy: false, noDataText: '',
      setBusy(value) { this.busy = value; },
      setNoDataText(value) { this.noDataText = value; }
    };
    await moduleController._createDemoFailure.call(moduleController, uiModel, uiTable);
    const controllerCreated = uiModel.values.messages.find((message) => message.ID !== created.ID && message.ID !== frontendCreated.ID);
    assert.ok(controllerCreated);
    assert.equal(controllerCreated.source, 'SIMULATION');
    assert.equal(uiModel.values.error, '');
    assert.equal(uiTable.busy, false);

    const retryEvent = { getSource: () => ({
      getBindingContext: () => ({ getObject: () => controllerCreated })
    }) };
    await moduleController._retryMessage.call(moduleController, retryEvent, uiModel, uiTable);
    const controllerRetried = uiModel.values.messages.find((message) => message.ID === controllerCreated.ID);
    assert.equal(controllerRetried.status, 'SIMULATED');
    assert.equal(controllerRetried.retryCount, 1);
    assert.equal(uiModel.values.error, '');
    assert.equal(uiTable.busy, false);

    await moduleController._retryMessage.call(moduleController, retryEvent, uiModel, uiTable);
    assert.match(uiModel.values.error, /HTTP 409/);
    assert.match(uiModel.values.error, /request [0-9a-f-]{36}/i);

    moduleController._applyMessageFilter(uiModel, controllerCreated.correlationId.toUpperCase());
    assert.equal(uiModel.values.messages.length, 1);
    assert.equal(uiModel.values.messages[0].ID, controllerCreated.ID);
    moduleController._applyMessageFilter(uiModel, 'no-such-message');
    assert.equal(uiModel.values.messages.length, 0);
    moduleController._applyMessageFilter(uiModel, '');
    assert.equal(uiModel.values.messages.length, 3);

    let resolveEmptyMessages;
    const loadingController = loadModuleController({
      listMessages: () => new Promise((resolve) => { resolveEmptyMessages = resolve; })
    });
    const emptyModel = {
      values: { messages: [], allMessages: [], filterQuery: '', error: 'prior error' },
      setProperty(path, value) { this.values[path.slice(1)] = value; },
      getProperty(path) { return this.values[path.slice(1)]; }
    };
    const loadingTable = {
      busy: false, noDataText: '',
      setBusy(value) { this.busy = value; },
      setNoDataText(value) { this.noDataText = value; }
    };
    const emptyLoad = loadingController._loadMessages.call(loadingController, emptyModel, loadingTable);
    assert.equal(loadingTable.busy, true);
    assert.equal(emptyModel.values.error, '');
    resolveEmptyMessages([]);
    await emptyLoad;
    assert.equal(loadingTable.busy, false);
    assert.equal(loadingTable.noDataText, 'No integration messages are available in this local demo.');
    assert.equal(emptyModel.values.messages.length, 0);

    const failingApi = {
      listMessages: async () => { throw new Error('Access denied (HTTP 403) (request req-test-403)'); }
    };
    const failingController = loadModuleController(failingApi);
    const failedLoadModel = {
      values: { messages: [{ ID: 'STALE-ROW' }], allMessages: [], filterQuery: '', error: '' },
      setProperty(path, value) { this.values[path.slice(1)] = value; },
      getProperty(path) { return this.values[path.slice(1)]; }
    };
    const failedLoadTable = {
      busy: false, noDataText: 'old text',
      setBusy(value) { this.busy = value; },
      setNoDataText(value) { this.noDataText = value; }
    };
    await failingController._loadMessages.call(failingController, failedLoadModel, failedLoadTable);
    assert.equal(failedLoadModel.values.messages.length, 0);
    assert.match(failedLoadModel.values.error, /Access denied \(HTTP 403\)/);
    assert.equal(failedLoadTable.noDataText, 'Messages could not be loaded. Use Refresh to retry.');
    assert.equal(failedLoadTable.busy, false);

    failingApi.listMessages = async () => [];
    await failingController._loadMessages.call(failingController, failedLoadModel, failedLoadTable);
    assert.equal(failedLoadModel.values.error, '');
    assert.equal(failedLoadTable.noDataText, 'No integration messages are available in this local demo.');
    assert.equal(failedLoadTable.busy, false);

    const pendingReads = [];
    const raceController = loadModuleController({
      listMessages: () => new Promise((resolve) => pendingReads.push(resolve))
    });
    const raceModel = {
      values: { messages: [], allMessages: [], filterQuery: '', error: '' },
      setProperty(path, value) { this.values[path.slice(1)] = value; },
      getProperty(path) { return this.values[path.slice(1)]; }
    };
    const raceTable = {
      busy: false, setBusy(value) { this.busy = value; }, setNoDataText() {}
    };

    const firstLoad = raceController._loadMessages.call(raceController, raceModel, raceTable);
    const secondLoad = raceController._loadMessages.call(raceController, raceModel, raceTable);
    pendingReads[0]([{ ID: 'OLDER-FIRST' }]);
    await firstLoad;
    assert.equal(raceTable.busy, true);
    assert.equal(raceModel.values.messages.length, 0);
    pendingReads[1]([{ ID: 'LATEST-SECOND' }]);
    await secondLoad;
    assert.equal(raceModel.values.messages[0].ID, 'LATEST-SECOND');
    assert.equal(raceTable.busy, false);

    const thirdLoad = raceController._loadMessages.call(raceController, raceModel, raceTable);
    const fourthLoad = raceController._loadMessages.call(raceController, raceModel, raceTable);
    pendingReads[3]([{ ID: 'LATEST-FOURTH' }]);
    await fourthLoad;
    pendingReads[2]([{ ID: 'OLDER-THIRD' }]);
    await thirdLoad;
    assert.equal(raceModel.values.messages[0].ID, 'LATEST-FOURTH');
    assert.equal(raceTable.busy, false);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await cds.disconnect();
  }
});

function apiClientSource() {
  return fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/api-client.js'), 'utf8');
}

function loadModuleController(api) {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  let definition;
  const context = {
    sap: { ui: { define: (_dependencies, factory) => {
      const Controller = { extend: (_name, implementation) => { definition = implementation; return implementation; } };
      const StubControl = function StubControl() {};
      factory(Controller, ...Array(12).fill(StubControl));
    } } },
    window: { VaxResilienceApi: api }
  };
  vm.runInNewContext(source, context);
  return definition;
}
