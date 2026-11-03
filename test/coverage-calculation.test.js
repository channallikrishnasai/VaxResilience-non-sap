const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateCoverageAndScenarioComparison } = require('../srv/domain/coverage-calculation');

test('calculates production-day coverage and labels the documented 30/20 comparison as non-forecast', () => {
  const result = calculateCoverageAndScenarioComparison({
    inventory: { quantity: 1000, unit: 'kg', dataMode: 'synthetic', sourceStatus: 'synthetic', asOf: '2026-09-01T00:00:00Z', sourceRef: 'INV-SNAPSHOT-001' },
    consumption: { quantity: 50, unit: 'kg/production_day', dataMode: 'synthetic', sourceStatus: 'synthetic_assumption', sourceRef: 'PHASES.md#synthetic-scenario-baseline' },
    delay: { quantity: 30, unit: 'calendar_day', sourceRef: 'SHIP-EVENT-001', sourceStatus: 'synthetic', observedAt: '2026-09-01T00:00:00Z' }
  });
  assert.deepEqual(result.coverage, { value: 20, unit: 'production_day' });
  assert.equal(result.dataMode, 'synthetic');
  assert.equal(result.provenance.inventory.ref, 'INV-SNAPSHOT-001');
  assert.equal(result.provenance.inventory.asOf, '2026-09-01T00:00:00Z');
  assert.equal(result.provenance.consumption.ref, 'PHASES.md#synthetic-scenario-baseline');
  assert.equal(result.scenarioComparison.value, 10);
  assert.equal(result.scenarioComparison.normalized, false);
  assert.equal(result.scenarioComparison.forecast, false);
  assert.equal(result.scenarioComparison.status, 'documented_scenario_comparison_only');
});

test('coverage can be calculated without converting a calendar-day delay', () => {
  const result = calculateCoverageAndScenarioComparison({
    inventory: { quantity: 500, unit: 'kg', dataMode: 'synthetic', sourceRef: 'INV-TEST' },
    consumption: { quantity: 50, unit: 'kg/production_day', dataMode: 'synthetic', sourceRef: 'RATE-TEST' }
  });
  assert.deepEqual(result.coverage, { value: 10, unit: 'production_day' });
  assert.equal(Object.hasOwn(result, 'scenarioComparison'), false);
});

test('rejects missing or incompatible units and non-positive consumption rates', () => {
  const base = {
    inventory: { quantity: 1000, unit: 'kg', sourceRef: 'INV-TEST' },
    consumption: { quantity: 50, unit: 'kg/production_day', sourceRef: 'RATE-TEST' }
  };
  assert.throws(() => calculateCoverageAndScenarioComparison({ ...base, inventory: { quantity: 1000 } }), /inventory/);
  assert.throws(() => calculateCoverageAndScenarioComparison({ ...base, consumption: { quantity: 0, unit: 'kg/production_day' } }), /consumption/);
  assert.throws(() => calculateCoverageAndScenarioComparison({ ...base, delay: { quantity: 30, unit: 'production_day' } }), /delay/);
});

test('rejects a zero consumption rate rather than returning infinite coverage', () => {
  assert.throws(() => calculateCoverageAndScenarioComparison({
    inventory: { quantity: 100, unit: 'kg' },
    consumption: { quantity: 0, unit: 'kg/production_day' }
  }), /consumption/);
});
