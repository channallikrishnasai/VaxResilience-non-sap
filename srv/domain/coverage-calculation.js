/**
 * Calculate production-day inventory coverage and, when requested, reproduce
 * the documented mixed-basis scenario comparison without presenting it as a
 * normalized shortage forecast (D-01 remains unresolved).
 */
function calculateCoverageAndScenarioComparison({ inventory, consumption, delay }) {
  if (!inventory || !consumption) throw new TypeError('inventory and consumption inputs are required');
  if (!Number.isFinite(inventory.quantity) || inventory.quantity < 0 || inventory.unit !== 'kg') {
    throw new TypeError('inventory must have a non-negative quantity in kg');
  }
  if (!Number.isFinite(consumption.quantity) || consumption.quantity <= 0 || consumption.unit !== 'kg/production_day') {
    throw new TypeError('consumption must have a positive rate in kg/production_day');
  }
  if (typeof inventory.sourceRef !== 'string' || !inventory.sourceRef.trim() ||
      typeof consumption.sourceRef !== 'string' || !consumption.sourceRef.trim()) {
    throw new TypeError('inventory and consumption sourceRef values are required');
  }
  const coverageProductionDays = inventory.quantity / consumption.quantity;
  if (!Number.isFinite(coverageProductionDays)) throw new RangeError('coverage calculation is not finite');

  const result = {
    inventoryQuantity: inventory.quantity,
    inventoryUnit: inventory.unit,
    consumptionRate: consumption.quantity,
    consumptionUnit: consumption.unit,
    coverage: { value: coverageProductionDays, unit: 'production_day' },
    formula: 'inventory.quantity / consumption.quantity',
    estimate: true,
    dataMode: inventory.dataMode === 'synthetic' && consumption.dataMode === 'synthetic' ? 'synthetic' : 'mixed',
    provenance: {
      inventory: {
        ref: inventory.sourceRef,
        sourceStatus: inventory.sourceStatus ?? null,
        dataMode: inventory.dataMode ?? null,
        asOf: inventory.asOf ?? null
      },
      consumption: {
        ref: consumption.sourceRef,
        sourceStatus: consumption.sourceStatus ?? null,
        dataMode: consumption.dataMode ?? null,
        asOf: consumption.asOf ?? null
      }
    }
  };

  if (delay !== undefined && delay !== null) {
    if (!Number.isFinite(delay.quantity) || delay.quantity < 0 || delay.unit !== 'calendar_day') {
      throw new TypeError('delay must have a non-negative quantity in calendar_day');
    }
    if (typeof delay.sourceRef !== 'string' || !delay.sourceRef.trim()) {
      throw new TypeError('delay sourceRef is required');
    }
    result.scenarioComparison = {
      value: Math.max(0, delay.quantity - coverageProductionDays),
      reportedDelay: { value: delay.quantity, unit: 'calendar_day' },
      inventoryCoverage: { value: coverageProductionDays, unit: 'production_day' },
      unitBasis: 'calendar_day_vs_production_day',
      normalized: false,
      forecast: false,
      status: 'documented_scenario_comparison_only',
      warning: 'D-01 is unresolved: this documented numeric comparison does not convert calendar days to production days and is not a shortage forecast.',
      provenance: {
        ref: delay.sourceRef,
        sourceStatus: delay.sourceStatus ?? null,
        dataMode: delay.dataMode ?? null,
        observedAt: delay.observedAt ?? null
      }
    };
  }

  return result;
}

module.exports = { calculateCoverageAndScenarioComparison };
