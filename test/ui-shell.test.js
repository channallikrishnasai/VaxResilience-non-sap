const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/index.html'), 'utf8');
const appView = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/view/App.view.xml'), 'utf8');
const appController = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/App.controller.js'), 'utf8');
const expectedModules = [
  'executive-dashboard',
  'supply-chain-digital-twin',
  'ai-command-centre',
  'inventory-manufacturing',
  'customers-orders',
  'approvals-decisions',
  'risk-compliance-audit',
  'resilience-impact-analytics'
];

test('SAPUI5 shell exposes the eight official modules in roadmap order', () => {
  const actual = [...appView.matchAll(/<tnt:NavigationListItem key="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(actual, expectedModules);
  assert.match(appView, /<tnt:ToolPage/);
  assert.match(appView, /<tnt:NavigationList id="moduleNavigation" itemSelect="onNavigationSelect"/);
  assert.match(appView, /<NavContainer id="app"\s*\/>/);
  assert.match(appController, /navTo\('home'/);
  assert.match(appController, /navTo\('module'/);
  assert.match(appController, /toggleSideContentMode\(\)/);
  assert.match(appController, /setSelectedKey\(active\)/);
});

test('shell presents unavailable profile and incident context without inventing a role or notification source', () => {
  const controller = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  assert.match(appView, /Profile and role unavailable/);
  assert.match(appView, /No active incident/);
  assert.match(appView, /SearchField id="moduleSearch"[^\n]+placeholder="Find a module"/);
  assert.match(appView, /business record search is unavailable/);
  assert.match(appView, /Button text="Notifications"[^\n]+press="onNotifications"/);
  assert.match(controller, /historical fixture events are not treated as opening state/);
});

test('shell exposes a visible accessible fallback if the SAPUI5 runtime fails to load', () => {
  const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(inlineScripts.length, 1);
  assert.match(html, /<section id="ui5-load-error" role="alert" hidden>/);
  assert.match(html, /SAPUI5 runtime could not be loaded/);

  let errorHandler;
  const fallback = { hidden: true };
  const context = {
    window: { addEventListener: (name, callback, capture) => {
      assert.equal(name, 'error');
      assert.equal(capture, true);
      errorHandler = callback;
    } },
    document: { getElementById: (id) => id === 'ui5-load-error' ? fallback : null }
  };
  vm.runInNewContext(inlineScripts[0][1], context);
  errorHandler({ target: { id: 'unrelated-script' } });
  assert.equal(fallback.hidden, true);
  errorHandler({ target: { id: 'sap-ui-bootstrap' } });
  assert.equal(fallback.hidden, false);
});

test('frontend shell contains no credentials or direct provider endpoints', () => {
  const webapp = path.join(__dirname, '../app/ui5/webapp');
  const apiClient = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/api-client.js'), 'utf8');
  const router = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/module-router.js'), 'utf8');
  const digitalTwin = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/digital-twin-model.js'), 'utf8');
  const manifest = fs.readFileSync(path.join(webapp, 'manifest.json'), 'utf8');
  const component = fs.readFileSync(path.join(webapp, 'Component.js'), 'utf8');
  const controller = fs.readFileSync(path.join(webapp, 'controller/Module.controller.js'), 'utf8');
  const shellController = fs.readFileSync(path.join(webapp, 'controller/App.controller.js'), 'utf8');
  const views = ['view/App.view.xml', 'view/Module.view.xml']
    .map((file) => fs.readFileSync(path.join(webapp, file), 'utf8')).join('\n');
  const sources = `${html}\n${manifest}\n${component}\n${controller}\n${shellController}\n${views}\n${apiClient}\n${router}\n${digitalTwin}`;
  assert.doesNotMatch(sources, /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]/i);
  const externalUrls = [...sources.matchAll(/https?:\/\/[^\s'"<>]+/g)].map((match) => match[0]);
  assert.deepEqual(externalUrls, ['https://ui5.sap.com/1.148.12/resources/sap-ui-core.js']);
});

test('SAPUI5 component manifest and controller parse and preserve the shell actions', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/manifest.json'), 'utf8'));
  const component = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/Component.js'), 'utf8');
  const controller = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  const shellController = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/App.controller.js'), 'utf8');
  const moduleView = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/view/Module.view.xml'), 'utf8');
  assert.equal(manifest['sap.app'].id, 'vaxresilience');
  assert.equal(manifest['sap.ui5'].rootView.viewName, 'vaxresilience.view.App');
  assert.equal(manifest['sap.ui5'].dependencies.minUI5Version, '1.148.12');
  assert.equal(manifest['sap.ui5'].routing.config.routerClass, 'sap.m.routing.Router');
  assert.equal(manifest['sap.ui5'].routing.config.bypassed.target, 'module');
  assert.deepEqual(manifest['sap.ui5'].routing.routes.map((route) => route.pattern), ['', '{module}']);
  assert.match(html, /module:sap\/ui\/core\/ComponentSupport/);
  assert.match(html, /data-sap-ui-component data-name="vaxresilience"/);
  assert.match(html, /src="\/ui\/archive-client\.js"/);
  assert.doesNotMatch(html, /<script>\s*sap\.ui\.getCore\(\)/);
  assert.doesNotThrow(() => new vm.Script(component));
  assert.doesNotThrow(() => new vm.Script(controller));
  assert.doesNotThrow(() => new vm.Script(shellController));
  assert.match(component, /getRouter\(\)\.initialize\(\)/);
  assert.match(appView, /<tnt:ToolPage/);
  assert.match(appView, /controllerName="vaxresilience\.controller\.App"/);
  assert.match(moduleView, /controllerName="vaxresilience\.controller\.Module"/);
  assert.match(controller, /VaxResilienceApi\.createDemoFailure/);
  assert.match(controller, /VaxResilienceApi\.retryMessage/);
  assert.match(controller, /'Retry count'/);
  assert.match(controller, /new Text\(\{ text: '\{retryCount\}' \}\)/);
  assert.match(controller, /VaxResilienceRouter\.fromHash/);
  assert.match(html, /src="\/ui\/module-router\.js"/);
  assert.match(html, /src="\/ui\/api-client\.js"/);
  assert.match(html, /src="\/ui\/digital-twin-model\.js"/);
});

test('monitor table builds responsive columns with aligned row cells', () => {
  const webapp = path.join(__dirname, '../app/ui5/webapp');
  const source = fs.readFileSync(path.join(webapp, 'controller/Module.controller.js'), 'utf8');
  const captured = { columns: [], tables: [] };
  const makeControl = (name, capture) => function (settings) {
    this.settings = settings || {};
    if (capture) capture(this);
  };
  const Column = makeControl('Column', (control) => captured.columns.push(control));
  const Table = makeControl('Table', (control) => captured.tables.push(control));
  const SearchField = makeControl('SearchField');
  const Label = makeControl('Label', (control) => { control.setLabelFor = (target) => { control.labelFor = target; }; });
  function JSONModel(data) { this.data = data; this.getProperty = (path) => this.data[path.slice(1)]; this.setProperty = (path, value) => { this.data[path.slice(1)] = value; }; }
  const controls = {
    'sap/m/MessageStrip': makeControl('MessageStrip'),
    'sap/m/Title': makeControl('Title'),
    'sap/m/Label': Label,
    'sap/m/Text': makeControl('Text'),
    'sap/m/Table': Table,
    'sap/m/Column': Column,
    'sap/m/ColumnListItem': makeControl('ColumnListItem'),
    'sap/m/ObjectStatus': makeControl('ObjectStatus'),
    'sap/m/Button': makeControl('Button'),
    'sap/m/SearchField': SearchField,
    'sap/m/Toolbar': makeControl('Toolbar'),
    'sap/m/VBox': makeControl('VBox'),
    'sap/m/FlexBox': makeControl('FlexBox'),
    'sap/ui/model/json/JSONModel': JSONModel
  };
  let definition;
  const context = { sap: { ui: { define: (dependencies, factory) => {
    const Controller = { extend: (_name, implementation) => { definition = implementation; return implementation; } };
    factory(Controller, ...dependencies.slice(1).map((dependency) => controls[dependency]));
  } } } };
  vm.runInNewContext(source, context);
  const page = { contents: [], addContent(control) { this.contents.push(control); }, setModel() {} };
  let filterInvocation;
  definition._showIntegrationMonitor.call({
    _page: page, _loadMessages() {}, _openHistoricalArchive() {}, _closeHistoricalArchive() {},
    _applyMessageFilter(model, query) { filterInvocation = { model, query }; }
  });
  const filter = page.contents.find((control) => control instanceof SearchField);
  const filterLabel = page.contents.find((control) => control instanceof Label);
  assert.ok(filter);
  assert.ok(filterLabel);
  assert.equal(filterLabel.settings.text, 'Filter integration messages');
  assert.equal(filterLabel.labelFor, filter);
  assert.equal(filter.settings.placeholder, 'Status, object, correlation ID, or source');
  assert.equal(typeof filter.settings.liveChange, 'function');
  filter.settings.liveChange({ getParameter: () => 'FAILED' });
  assert.equal(filterInvocation.query, 'FAILED');
  assert.equal(filterInvocation.model.getProperty('/filterQuery'), '');

  const table = captured.tables[0].settings;
  const columns = table.columns.map((column) => ({
    label: column.settings.header.settings.text,
    minScreenWidth: column.settings.minScreenWidth,
    demandPopin: column.settings.demandPopin,
    popinDisplay: column.settings.popinDisplay
  }));
  const cellCount = table.items.template.settings.cells.length;
  assert.equal(table.popinLayout, 'GridSmall');
  assert.equal(columns.length, 8);
  assert.equal(cellCount, columns.length);
  assert.deepEqual(JSON.parse(JSON.stringify(columns.map((column) => column.label))), [
    'Status', 'Direction', 'Object', 'Correlation ID', 'Source', 'Retry count', 'Updated', 'Actions'
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(columns.filter((column) => !column.minScreenWidth).map((column) => column.label))), [
    'Status', 'Object', 'Actions'
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(columns.filter((column) => column.minScreenWidth).map((column) => [
    column.label, column.minScreenWidth, column.demandPopin, column.popinDisplay
  ]))), [
    ['Direction', 'Tablet', true, 'Block'],
    ['Correlation ID', 'Desktop', true, 'Block'],
    ['Source', 'Tablet', true, 'Block'],
    ['Retry count', 'Tablet', true, 'Block'],
    ['Updated', 'Desktop', true, 'Block']
  ]);
});

test('shell controller routes module selections, toggles navigation, and marks the active module', () => {
  const routeHelper = loadRouterApi();
  const definition = loadControllerDefinition(appController, routeHelper);
  const calls = [];
  const controller = {
    _router: {
      navTo: (...args) => calls.push(['navTo', ...args])
    },
    byId: (id) => {
      assert.equal(id, 'toolPage');
      return { toggleSideContentMode: () => calls.push(['toggle']) };
    }
  };

  controller.onNavigationSelect = definition.onNavigationSelect;
  controller.onToggleNavigation = definition.onToggleNavigation;
  expectedModules.forEach((key) => controller.onNavigationSelect({
    getParameter: () => ({ getKey: () => key })
  }));
  controller.onNavigationSelect({ getParameter: () => ({ getKey: () => 'unknown' }) });
  controller.onToggleNavigation();

  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['navTo', 'home'],
    ...expectedModules.slice(1).map((key) => ['navTo', 'module', { module: key }]),
    ['toggle']
  ]);

  let selectedKey = null;
  const list = {
    setSelectedKey: (key) => { selectedKey = key; }
  };
  const syncController = {
    byId: () => list,
    _router: { navTo: (...args) => calls.push(['navTo', ...args]) },
    _syncNavigation: definition._syncNavigation
  };
  syncController._syncNavigation({
    getParameter: (name) => name === 'name' ? 'module' : { module: 'risk-compliance-audit' }
  });
  assert.equal(selectedKey, 'risk-compliance-audit');

  syncController._syncNavigation({
    getParameter: (name) => name === 'name' ? 'module' : { module: 'unrecognized-module' }
  });
  assert.equal(selectedKey, 'executive-dashboard');
  assert.deepEqual(JSON.parse(JSON.stringify(calls.at(-1))), ['navTo', 'home', {}, true]);
});

test('global search navigates only to unique module matches and leaves record search unavailable', () => {
  const messages = [];
  const routeHelper = loadRouterApi();
  const definition = loadControllerDefinition(appController, routeHelper, {
    'sap/ui/core/mvc/Controller': { extend: (_name, implementation) => implementation },
    'sap/m/MessageToast': { show: (message) => messages.push(message) }
  });
  const calls = [];
  const controller = {
    _router: { navTo: (...args) => calls.push(args) },
    onNavigationSelect: definition.onNavigationSelect,
    onGlobalSearch: definition.onGlobalSearch
  };

  expectedModules.forEach((moduleId) => definition.onGlobalSearch.call(controller, {
    getParameter: () => routeHelper.moduleNames[moduleId]
  }));
  assert.equal(calls.length, expectedModules.length);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['home'],
    ...expectedModules.slice(1).map((moduleId) => ['module', { module: moduleId }])
  ]);

  definition.onGlobalSearch.call(controller, { getParameter: () => 'inventory' });
  assert.equal(calls.length, expectedModules.length + 1);
  assert.deepEqual(JSON.parse(JSON.stringify(calls.at(-1))), ['module', { module: 'inventory-manufacturing' }]);
  definition.onGlobalSearch.call(controller, { getParameter: () => 'a' });
  assert.equal(calls.length, expectedModules.length + 1);
  assert.match(messages.at(-1), /ambiguous/);
  definition.onGlobalSearch.call(controller, { getParameter: () => 'nonexistent' });
  assert.match(messages.at(-1), /module names only/);
});

test('notification action reports the disconnected state and does not fabricate notifications', () => {
  const messages = [];
  const definition = loadControllerDefinition(appController, loadRouterApi(), {
    'sap/ui/core/mvc/Controller': { extend: (_name, implementation) => implementation },
    'sap/m/MessageToast': { show: (message) => messages.push(message) }
  });
  definition.onNotifications();
  assert.deepEqual(messages, ['Notifications are unavailable because no notification source is connected.']);
});

test('historical archive requires explicit entry and closing returns to the empty foundation', () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  let definition;
  const StubControl = function StubControl() {};
  const context = { sap: { ui: { define: (_dependencies, factory) => {
    const Controller = { extend: (_name, implementation) => implementation };
    definition = factory(Controller, ...Array(13).fill(StubControl), StubControl);
  } } } };
  vm.runInNewContext(source, context);

  const renderCalls = [];
  const controller = {
    _currentModule: 'inventory-manufacturing',
    _renderModule: (...args) => renderCalls.push(args)
  };
  definition._openHistoricalArchive.call(controller);
  assert.equal(controller._archiveOpen, true);
  assert.deepEqual(renderCalls.pop(), ['inventory-manufacturing', true]);
  definition._closeHistoricalArchive.call(controller);
  assert.equal(controller._archiveOpen, false);
  assert.deepEqual(renderCalls.pop(), ['inventory-manufacturing', true]);
});

test('historical archive rendering is read-only, source-labelled, and excludes unresolved collections', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  const captured = { buttons: [], messages: [], tables: [] };
  const control = (capture) => function (settings = {}) {
    this.settings = settings;
    if (capture) capture(this);
  };
  const Text = control();
  Text.prototype.setText = function (text) { this.settings.text = text; captured.text = text; };
  const Button = control((item) => captured.buttons.push(item));
  const MessageStrip = control((item) => captured.messages.push(item));
  const Label = control();
  Label.prototype.setLabelFor = function (target) { this.labelFor = target; };
  const Table = control((item) => {
    captured.tables.push(item);
    item.setModel = (model) => { item.model = model; };
  });
  function JSONModel(data) { this.data = data; }
  const dependencies = {
    'sap/m/MessageStrip': MessageStrip,
    'sap/m/Title': control(),
    'sap/m/Label': Label,
    'sap/m/Text': Text,
    'sap/m/Table': Table,
    'sap/m/Column': control(),
    'sap/m/ColumnListItem': control(),
    'sap/m/ObjectStatus': control(),
    'sap/m/Button': Button,
    'sap/m/SearchField': control(),
    'sap/m/Toolbar': control(),
    'sap/m/VBox': control(),
    'sap/m/FlexBox': control(),
    'sap/ui/model/json/JSONModel': JSONModel
  };
  let definition;
  const context = {
    sap: { ui: { define: (_names, factory) => {
      const Controller = { extend: (_name, implementation) => implementation };
      definition = factory(Controller, ...Object.values(dependencies));
    } } },
    window: { VaxResilienceRouter: loadRouterApi() }
  };
  vm.runInNewContext(source, context);

  const page = { contents: [], addContent(item) { this.contents.push(item); } };
  const record = { routeId: 'ROUTE-SYNTHETIC-1', dataMode: 'synthetic' };
  const controller = {
    _page: page,
    _archiveGeneration: 1,
    _archiveOpen: true,
    _currentModule: 'inventory-manufacturing',
    _showFixtureCollections: definition._showFixtureCollections,
    _closeHistoricalArchive() {},
    window: context.window
  };
  context.window.VaxResilienceArchive = {
    load: async (moduleId) => ({
      manifest: {
        title: 'Fictional disruption scenario', scenarioStart: '2026-09-01', scenarioEnd: '2026-11-02',
        fictionalDisclaimer: 'All records are fictional synthetic demonstration records.', scenarioFacts: {}
      },
      collections: [{ name: 'routes', records: [record] }],
      omittedCollections: ['calculationAssumptions', 'productionPlans']
    })
  };
  await definition._showHistoricalArchive.call(controller, 'inventory-manufacturing');
  assert.doesNotMatch(captured.text, /could not be loaded/, captured.error);

  assert.match(captured.messages[0].settings.text, /not opening or current operational state/);
  assert.equal(captured.messages[0].settings.type, 'Warning');
  assert.match(captured.messages[1].settings.text, /Stock and qualification records/);
  assert.match(captured.messages[2].settings.text, /calculationAssumptions and productionPlans/);
  assert.equal(captured.tables.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(captured.tables[0].model.data.records)), [{ routeId: record.routeId, dataMode: record.dataMode }]);
  assert.deepEqual(captured.buttons.map((button) => button.settings.text), ['Close historical archive']);
});

test('historical Digital Twin renders explicit entity and relationship tables with geography limits', () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  const controls = [];
  const control = function (settings = {}) {
    this.settings = settings;
    controls.push(this);
  };
  control.prototype.setModel = function (model) { this.model = model; };
  function JSONModel(data) { this.data = data; }
  let definition;
  const context = { sap: { ui: { define: (_names, factory) => {
    const Controller = { extend: (_name, implementation) => implementation };
    definition = factory(Controller, ...Array(13).fill(control), JSONModel);
  } } } };
  vm.runInNewContext(source, context);

  const page = { contents: [], addContent(item) { this.contents.push(item); } };
  const network = {
    nodes: [{ id: 'SUP-CN-001', type: 'Supplier', name: 'Fictional supplier', location: 'Suzhou, CN', state: 'suspended' }],
    relationships: [{ sourceId: 'SUP-CN-001', sourceName: 'Fictional supplier', targetId: 'PORT-SHA-001', targetName: 'Shanghai Port', relationship: 'Route segment 1', context: 'Fixture route' }],
    unresolvedReferences: [{ sourceId: 'unknown', targetId: 'unknown-2' }]
  };
  const controller = { _page: page, _archiveTable: definition._archiveTable };
  context.window = { VaxResilienceDigitalTwin: { build: () => network } };
  definition._showHistoricalNetwork.call(controller, []);

  const tables = page.contents.filter((item) => item instanceof control && item.settings.items);
  assert.equal(tables.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(tables.map((table) => table.model.data.records))), [network.nodes, network.relationships]);
  assert.ok(page.contents.some((item) => item.settings && /no geographic coordinates/.test(item.settings.text || '')));
  assert.ok(page.contents.some((item) => item.settings && /1 fixture references could not be resolved/.test(item.settings.text || '')));
});

test('historical fixture collections render source fields and filter rows without mutating records', () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  const controls = [];
  const control = function (settings = {}) {
    this.settings = settings;
    controls.push(this);
  };
  control.prototype.setModel = function (model) { this.model = model; };
  control.prototype.setLabelFor = function (field) { this.labelFor = field; };
  function JSONModel(data) {
    this.data = data;
    this.setData = (next) => { this.data = next; };
  }
  let definition;
  const context = { sap: { ui: { define: (_names, factory) => {
    const Controller = { extend: (_name, implementation) => implementation };
    definition = factory(Controller, ...Array(13).fill(control), JSONModel);
  } } } };
  vm.runInNewContext(source, context);

  const original = [
    { productId: 'PRD-A', displayName: 'Synthetic Medicine A', dataMode: 'synthetic', attributes: ['fictional'] },
    { productId: 'PRD-B', displayName: 'Synthetic Medicine B', dataMode: 'synthetic', attributes: ['fictional'] }
  ];
  const page = { contents: [], addContent(item) { this.contents.push(item); } };
  definition._showFixtureCollections.call({ _page: page }, [{ name: 'products', records: original }]);

  const field = controls.find((item) => item.settings.placeholder === 'Filter historical products');
  const table = controls.find((item) => item.settings.items && item.settings.items.path === '/records');
  assert.ok(field);
  assert.ok(table);
  assert.equal(controls.find((item) => item.settings.text === 'Filter products').labelFor, field);
  assert.equal(table.settings.columns.length, 4);
  assert.equal(table.settings.items.template.settings.cells.length, 4);
  assert.equal(table.model.data.records.length, 2);
  field.settings.liveChange({ getParameter: () => 'medicine b' });
  assert.deepEqual(JSON.parse(JSON.stringify(table.model.data.records.map((record) => record.productId))), ['PRD-B']);
  assert.deepEqual(original.map((record) => record.productId), ['PRD-A', 'PRD-B']);
});

test('historical dashboard displays manifest facts verbatim and explains unresolved day basis', () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  const controls = [];
  const control = function (settings = {}) {
    this.settings = settings;
    controls.push(this);
  };
  control.prototype.setModel = function (model) { this.model = model; };
  function JSONModel(data) { this.data = data; }
  let definition;
  const context = { sap: { ui: { define: (_names, factory) => {
    const Controller = { extend: (_name, implementation) => implementation };
    definition = factory(Controller, ...Array(13).fill(control), JSONModel);
  } } } };
  vm.runInNewContext(source, context);

  const facts = { delayDays: 30, inventoryCoverageDays: 20, potentialGapDays: 10, gapInterpretation: 'Synthetic exposure estimate only.' };
  const page = { contents: [], addContent(item) { this.contents.push(item); } };
  definition._showHistoricalDashboard.call({ _page: page, _archiveTable: definition._archiveTable }, facts);

  const table = controls.find((item) => item.settings.items && item.settings.items.path === '/records');
  assert.ok(table);
  assert.deepEqual(JSON.parse(JSON.stringify(table.model.data.records)), [
    { field: 'delayDays', sourceValue: '30' },
    { field: 'inventoryCoverageDays', sourceValue: '20' },
    { field: 'potentialGapDays', sourceValue: '10' },
    { field: 'gapInterpretation', sourceValue: 'Synthetic exposure estimate only.' }
  ]);
  assert.ok(page.contents.some((item) => item.settings && /not recalculated/.test(item.settings.text || '')));
  assert.ok(page.contents.some((item) => item.settings && /D-01/.test(item.settings.text || '')));
});

test('operations dashboard sample traffic creates eight synthetic API messages and records four simulated retries', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  let definition;
  const ids = [];
  const retries = [];
  const context = {
    sap: { ui: { define: (_dependencies, factory) => {
      const Controller = { extend: (_name, implementation) => implementation };
      definition = factory(Controller, ...Array(13).fill(function StubControl() {}), function JSONModel() {});
    } } },
    window: { VaxResilienceApi: {
      createDemoFailure: async () => {
        const ID = `message-${ids.length + 1}`;
        ids.push(ID);
        return { ID };
      },
      retryMessage: async (ID) => { retries.push(ID); },
      listMessages: async () => ids.map((ID) => ({ ID, status: 'FAILED', retryCount: 0, modifiedAt: 'now' }))
    } }
  };
  vm.runInNewContext(source, context);
  const values = {};
  const model = { setProperty: (key, value) => { values[key] = value; } };
  const busy = [];
  const table = { setBusy: (value) => busy.push(value), setNoDataText() {} };
  await definition._generateDashboardTraffic.call({
    _dashboardGeneration: 0,
    _loadDashboardMessages: definition._loadDashboardMessages
  }, model, table);
  assert.equal(ids.length, 8);
  assert.deepEqual(retries, ['message-2', 'message-4', 'message-6', 'message-8']);
  assert.match(values['/sampleNotice'], /eight clearly labeled synthetic CAP messages/);
  assert.equal(values['/total'], '8');
  assert.deepEqual(busy, [true, true, false]);
});

function loadControllerDefinition(source, routeHelper = loadRouterApi(), overrides = {}) {
  let definition;
  const dependencies = {
    'sap/ui/core/mvc/Controller': { extend: (_name, implementation) => implementation },
    'sap/m/MessageToast': { show: () => {} },
    ...overrides
  };
  const context = {
    sap: { ui: { define: (names, factory) => {
      definition = factory(...names.map((name) => dependencies[name]));
    } } },
    window: { VaxResilienceRouter: routeHelper, location: { hash: '' } }
  };
  vm.runInNewContext(source, context);
  return definition;
}

function loadRouterApi() {
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/module-router.js'), 'utf8'), context);
  return context.VaxResilienceRouter;
}
