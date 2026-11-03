const test = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');

test('demo failure can be created and retried without external side effects', async () => {
  await cds.deploy('*').to('sqlite::memory:');
  const service = await cds.serve('MonitoringService').from('*');
  assert.equal(service.definition['@requires'], 'authenticated-user');
  cds.context = { user: cds.User.anonymous };
  await assert.rejects(service.send('createDemoFailure', {}), { code: 401 });
  cds.context = { user: new cds.User('foundation-test-user') };

  const created = await service.send('createDemoFailure', {});
  assert.equal(created.status, 'FAILED');
  assert.equal(created.source, 'SIMULATION');

  const retried = await service.send('retryMessage', { ID: created.ID });
  assert.equal(retried.status, 'SIMULATED');
  assert.equal(retried.retryCount, 1);

  const attempts = await cds.db.run(
    SELECT.from('vaxresilience.IntegrationAttempts').where({ message_ID: created.ID })
  );
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].outcome, 'SIMULATED');

  const liveID = cds.utils.uuid();
  await cds.db.run(INSERT.into('vaxresilience.IntegrationMessages').entries({
    ID: liveID,
    correlationId: `live-${liveID}`,
    direction: 'INBOUND',
    businessObject: 'ShipmentStatus',
    source: 'LIVE',
    status: 'FAILED'
  }));
  await assert.rejects(service.send('retryMessage', { ID: liveID }), /Only simulated messages can be retried locally/);
});
