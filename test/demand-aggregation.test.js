const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregateSyntheticDemand } = require('../srv/domain/demand-aggregation');
const officialOrders = require('../docs/official-specification/data/synthetic/customers-orders.json');

const customerIds = ['CUST-A', 'CUST-B'];
const assumptions = [
  { assumptionId: 'A', customerId: 'CUST-A', productId: 'PRD-1', dailyDemand: 5000, unit: 'tablet/day', dataMode: 'synthetic' },
  { assumptionId: 'B', customerId: 'CUST-B', productId: 'PRD-1', dailyDemand: 7500, unit: 'tablet/day', dataMode: 'synthetic' },
  { assumptionId: 'TOTAL', customerId: null, productId: 'PRD-1', dailyDemand: 12500, unit: 'tablet/day', dataMode: 'synthetic' }
];

test('reconciles a synthetic aggregate with the explicitly included customer assumptions', () => {
  const result = aggregateSyntheticDemand({ assumptions, productId: 'PRD-1', unit: 'tablet/day', includedCustomerIds: customerIds });
  assert.equal(result.dailyDemand, 12500);
  assert.equal(result.status, 'reconciled');
  assert.equal(result.dataMode, 'synthetic');
  assert.equal(result.estimate, true);
  assert.deepEqual(result.issues, []);
});

test('official synthetic demand assumptions reconcile to the five included customers', () => {
  const demand = officialOrders.demandAssumptions;
  const includedCustomerIds = demand.filter((row) => row.customerId).map((row) => row.customerId);
  const result = aggregateSyntheticDemand({
    assumptions: demand,
    productId: 'PRD-PARA-500',
    unit: 'tablet/day',
    includedCustomerIds
  });
  assert.equal(includedCustomerIds.length, 5);
  assert.equal(result.dailyDemand, 25000);
  assert.equal(result.status, 'reconciled');
});

test('returns a transparent estimate when customer assumptions exist without an aggregate row', () => {
  const result = aggregateSyntheticDemand({
    assumptions: assumptions.slice(0, 2), productId: 'PRD-1', unit: 'tablet/day', includedCustomerIds: customerIds
  });
  assert.equal(result.dailyDemand, 12500);
  assert.equal(result.status, 'computed');
});

test('does not return totals when customer assumptions are missing, duplicated, or disagree', () => {
  const missing = aggregateSyntheticDemand({
    assumptions: assumptions.slice(0, 1), productId: 'PRD-1', unit: 'tablet/day', includedCustomerIds: customerIds
  });
  assert.equal(missing.dailyDemand, null);
  assert.deepEqual(missing.missingCustomerIds, ['CUST-B']);

  const duplicate = aggregateSyntheticDemand({
    assumptions: [...assumptions, { ...assumptions[0], assumptionId: 'A2' }],
    productId: 'PRD-1', unit: 'tablet/day', includedCustomerIds: customerIds
  });
  assert.equal(duplicate.dailyDemand, null);
  assert.ok(duplicate.issues.includes('duplicate_customer_assumption'));

  const mismatch = aggregateSyntheticDemand({
    assumptions: assumptions.map((row) => row.assumptionId === 'TOTAL' ? { ...row, dailyDemand: 1 } : row),
    productId: 'PRD-1', unit: 'tablet/day', includedCustomerIds: customerIds
  });
  assert.equal(mismatch.dailyDemand, null);
  assert.ok(mismatch.issues.includes('aggregate_mismatch'));
});

test('fails closed for unit mismatch and non-synthetic assumptions', () => {
  const result = aggregateSyntheticDemand({
    assumptions: [...assumptions, { ...assumptions[0], assumptionId: 'LIVE', dataMode: 'live', unit: 'kg/day' }],
    productId: 'PRD-1', unit: 'tablet/day', includedCustomerIds: customerIds
  });
  assert.equal(result.dailyDemand, null);
  assert.ok(result.issues.includes('unit_mismatch'));
  assert.ok(result.issues.includes('non_synthetic_assumption'));
});

test('requires an explicit customer set and unit', () => {
  assert.throws(() => aggregateSyntheticDemand({ assumptions, productId: 'PRD-1', unit: 'tablet/day' }), /includedCustomerIds/);
});
