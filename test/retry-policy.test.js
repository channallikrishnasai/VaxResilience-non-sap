const test = require('node:test');
const assert = require('node:assert/strict');
const { nextSimulatedAttempt } = require('../srv/domain/retry-policy');

test('simulated failed messages advance their attempt number', () => {
  assert.equal(nextSimulatedAttempt({ source: 'SIMULATION', status: 'FAILED', retryCount: 2 }), 3);
});

test('retry fails closed when a message is missing', () => {
  assert.throws(() => nextSimulatedAttempt(null), { status: 404 });
});

test('live messages cannot be retried through the local simulation path', () => {
  assert.throws(() => nextSimulatedAttempt({ source: 'LIVE', status: 'FAILED' }), { status: 409 });
});

test('non-failed messages cannot be retried', () => {
  assert.throws(() => nextSimulatedAttempt({ source: 'SIMULATION', status: 'PROCESSED' }), { status: 409 });
});
