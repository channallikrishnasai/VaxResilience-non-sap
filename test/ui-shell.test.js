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

test('shell presents unavailable profile, incident, search, and notification context without inventing a role', () => {
  const controller = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/controller/Module.controller.js'), 'utf8');
  assert.match(appView, /Profile and role unavailable/);
  assert.match(appView, /No active incident/);
  assert.match(appView, /Search unavailable[^\n]+enabled="false"/);
  assert.match(appView, /Notifications unavailable[^\n]+enabled="false"/);
  assert.match(controller, /historical fixture events are not treated as opening state/);
});

test('frontend shell contains no credentials or direct provider endpoints', () => {
  const webapp = path.join(__dirname, '../app/ui5/webapp');
  const apiClient = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/api-client.js'), 'utf8');
  const router = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/module-router.js'), 'utf8');
  const manifest = fs.readFileSync(path.join(webapp, 'manifest.json'), 'utf8');
  const component = fs.readFileSync(path.join(webapp, 'Component.js'), 'utf8');
  const controller = fs.readFileSync(path.join(webapp, 'controller/Module.controller.js'), 'utf8');
  const shellController = fs.readFileSync(path.join(webapp, 'controller/App.controller.js'), 'utf8');
  const views = ['view/App.view.xml', 'view/Module.view.xml']
    .map((file) => fs.readFileSync(path.join(webapp, file), 'utf8')).join('\n');
  const sources = `${html}\n${manifest}\n${component}\n${controller}\n${shellController}\n${views}\n${apiClient}\n${router}`;
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
    _page: page, _loadMessages() {},
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

function loadControllerDefinition(source, routeHelper = loadRouterApi()) {
  let definition;
  const context = {
    sap: { ui: { define: (_dependencies, factory) => {
      const Controller = { extend: (_name, implementation) => implementation };
      definition = factory(Controller);
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
