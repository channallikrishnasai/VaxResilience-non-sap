/**
 * Aggregate synthetic customer demand for one explicitly selected product/unit
 * and customer set. This is an estimate input, not observed consumption or an
 * allocation policy.
 */
function aggregateSyntheticDemand({ assumptions, productId, unit, includedCustomerIds }) {
  if (!Array.isArray(assumptions)) throw new TypeError('assumptions must be an array');
  if (typeof productId !== 'string' || !productId || typeof unit !== 'string' || !unit) {
    throw new TypeError('productId and unit are required strings');
  }
  if (!Array.isArray(includedCustomerIds) || includedCustomerIds.length === 0 ||
      includedCustomerIds.some((id) => typeof id !== 'string' || !id) ||
      new Set(includedCustomerIds).size !== includedCustomerIds.length) {
    throw new TypeError('includedCustomerIds must be a non-empty list of unique customer IDs');
  }

  const customerIds = new Set(includedCustomerIds);
  const selected = assumptions.filter((row) => row && row.productId === productId &&
    (row.customerId == null || customerIds.has(row.customerId)));
  const problems = [];
  if (selected.some((row) => row.unit !== unit)) problems.push('unit_mismatch');
  if (selected.some((row) => row.dataMode !== 'synthetic')) problems.push('non_synthetic_assumption');
  if (selected.some((row) => !Number.isFinite(row.dailyDemand) || row.dailyDemand < 0)) {
    problems.push('invalid_daily_demand');
  }

  const perCustomer = selected.filter((row) => customerIds.has(row.customerId));
  const aggregates = selected.filter((row) => row.customerId == null);
  const counts = new Map();
  for (const row of perCustomer) counts.set(row.customerId, (counts.get(row.customerId) || 0) + 1);
  if ([...counts.values()].some((count) => count > 1)) problems.push('duplicate_customer_assumption');
  const missingCustomerIds = includedCustomerIds.filter((id) => counts.get(id) !== 1);
  if (missingCustomerIds.length) problems.push('missing_customer_assumptions');
  if (aggregates.length > 1) problems.push('duplicate_aggregate_assumption');

  const customerTotal = perCustomer.reduce((total, row) => total + row.dailyDemand, 0);
  if (!Number.isFinite(customerTotal)) problems.push('aggregate_overflow');
  const aggregate = aggregates.length === 1 ? aggregates[0] : null;
  if (aggregate && Number.isFinite(aggregate.dailyDemand) && aggregate.dailyDemand !== customerTotal) {
    problems.push('aggregate_mismatch');
  }

  return {
    productId,
    unit,
    includedCustomerIds: [...includedCustomerIds],
    customerCount: includedCustomerIds.length,
    dailyDemand: problems.length ? null : customerTotal,
    status: problems.length ? 'unconfirmed' : aggregate ? 'reconciled' : 'computed',
    dataMode: selected.every((row) => row.dataMode === 'synthetic') ? 'synthetic' : 'mixed',
    estimate: true,
    sourceAssumptionIds: selected.map((row) => row.assumptionId).filter((id) => typeof id === 'string'),
    issues: [...new Set(problems)],
    missingCustomerIds
  };
}

module.exports = { aggregateSyntheticDemand };
