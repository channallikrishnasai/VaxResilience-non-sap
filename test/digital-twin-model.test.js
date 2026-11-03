const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const fixtureRoot = path.join(__dirname, '../app/ui5/webapp/demo-archive');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/digital-twin-model.js'), 'utf8'), context);

function sourceCollections() {
  const files = ['organization.json', 'suppliers.json', 'operations.json', 'customers-orders.json'];
  const names = [
    'organizations', 'suppliers', 'facilities', 'warehouses', 'ports', 'routes', 'shipments',
    'customers', 'customerOrders', 'orderLines', 'orderFulfilments'
  ];
  const recordsByName = {};
  for (const file of files) Object.assign(recordsByName, JSON.parse(fs.readFileSync(path.join(fixtureRoot, file), 'utf8')));
  return names.map((name) => ({ name, records: recordsByName[name] }));
}

test('Digital Twin derives fixture nodes and relationships from source references only', () => {
  const network = context.VaxResilienceDigitalTwin.build(sourceCollections());
  assert.equal(network.nodes.length, 13);
  assert.equal(network.relationships.length, 9);
  assert.equal(network.unresolvedReferences.length, 0);
  assert.ok(network.nodes.some((node) => node.id === 'PORT-SHA-001' && node.type === 'Port'));
  assert.ok(network.nodes.some((node) => node.id === 'CUST-HOSP-A' && node.type === 'Customer'));
  assert.ok(network.relationships.some((edge) => edge.sourceId === 'SUP-CN-001' && edge.targetId === 'PORT-SHA-001'));
  assert.ok(network.relationships.some((edge) => edge.sourceId === 'WH-FG-001' && edge.targetId === 'CUST-HOSP-A'));
  assert.ok(network.nodes.every((node) => !Object.hasOwn(node, 'latitude') && !Object.hasOwn(node, 'longitude')));
});

test('Digital Twin exposes dangling fixture references as unresolved and never invents nodes', () => {
  const collections = sourceCollections();
  const routes = collections.find((collection) => collection.name === 'routes').records;
  routes[0].originRef = 'UNLISTED-SUPPLIER';
  const network = context.VaxResilienceDigitalTwin.build(collections);
  assert.equal(network.nodes.some((node) => node.id === 'UNLISTED-SUPPLIER'), false);
  assert.ok(network.unresolvedReferences.some((reference) => reference.sourceId === 'UNLISTED-SUPPLIER'));
});

test('Digital Twin rejects duplicate entity identifiers instead of merging nodes', () => {
  const collections = sourceCollections();
  const suppliers = collections.find((collection) => collection.name === 'suppliers').records;
  suppliers.push({ ...suppliers[0], name: 'duplicate fixture record' });
  assert.throws(() => context.VaxResilienceDigitalTwin.build(collections), /Duplicate Digital Twin node identifier/);
});
