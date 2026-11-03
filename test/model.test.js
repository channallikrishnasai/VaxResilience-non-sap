const test = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');

test('CAP model exposes the monitoring message and attempt contract', async () => {
  const model = await cds.load('*');
  const messages = model.definitions['vaxresilience.IntegrationMessages'];
  const attempts = model.definitions['vaxresilience.IntegrationAttempts'];
  const retryAction = model.definitions['MonitoringService.retryMessage'];
  const demoAction = model.definitions['MonitoringService.createDemoFailure'];

  assert.ok(messages, 'message persistence entity exists');
  assert.ok(attempts, 'attempt history entity exists');
  assert.ok(messages.elements.correlationId);
  assert.ok(messages.elements.source);
  assert.ok(messages.elements.status);
  assert.ok(attempts.elements.message);
  assert.ok(retryAction);
  assert.equal(retryAction.kind, 'action');
  assert.ok(demoAction);
  assert.equal(demoAction.kind, 'action');
});

test('CAP draft domain model covers specification-backed entities and relations only', async () => {
  const model = await cds.load('*');
  const domainEntities = Object.keys(model.definitions).filter((name) =>
    name.startsWith('vaxresilience.') && !name.endsWith('.IntegrationMessages') && !name.endsWith('.IntegrationAttempts')
  );

  assert.equal(domainEntities.length, 46);
  assert.ok(model.definitions['vaxresilience.Products']);
  assert.ok(model.definitions['vaxresilience.InventoryPositions'].elements.material);
  assert.ok(model.definitions['vaxresilience.ApprovalDecisions'].elements.approvalRequest);
  assert.ok(model.definitions['vaxresilience.CustomerOrders'].elements.customer);
  assert.equal(model.definitions['vaxresilience.CalculationAssumptions'], undefined);
  assert.equal(model.definitions['vaxresilience.ProductionPlans'].elements.plannedProductionDays, undefined);
  assert.equal(model.definitions['vaxresilience.ProductionPlans'].elements.apiConsumptionKgPerProductionDay, undefined);
});
