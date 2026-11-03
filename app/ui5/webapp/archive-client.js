(function attachVaxResilienceArchive(global) {
  'use strict';

  const collectionsByModule = Object.freeze({
    'executive-dashboard': Object.freeze([
      ['incidents-recovery.json', 'disruptions'],
      ['incidents-recovery.json', 'riskAssessments']
    ]),
    'supply-chain-digital-twin': Object.freeze([
      ['organization.json', 'organizations'], ['suppliers.json', 'suppliers'],
      ['operations.json', 'facilities'], ['operations.json', 'warehouses'],
      ['operations.json', 'ports'], ['operations.json', 'routes'], ['operations.json', 'shipments'],
      ['customers-orders.json', 'customers'], ['customers-orders.json', 'customerOrders'],
      ['customers-orders.json', 'orderLines'], ['customers-orders.json', 'orderFulfilments']
    ]),
    'ai-command-centre': Object.freeze([
      ['agent-activity.json', 'agents'], ['agent-activity.json', 'agentExecutions'],
      ['agent-activity.json', 'toolInvocations']
    ]),
    'inventory-manufacturing': Object.freeze([
      ['products.json', 'products'], ['products.json', 'materials'],
      ['operations.json', 'inventoryBatches'], ['operations.json', 'inventoryPositions'],
      ['suppliers.json', 'supplierQualifications']
    ]),
    'customers-orders': Object.freeze([
      ['customers-orders.json', 'customers'], ['customers-orders.json', 'demandAssumptions'],
      ['customers-orders.json', 'customerOrders'], ['customers-orders.json', 'orderLines'],
      ['customers-orders.json', 'orderFulfilments'], ['customers-orders.json', 'deliveries']
    ]),
    'approvals-decisions': Object.freeze([
      ['incidents-recovery.json', 'recoveryPlans'], ['incidents-recovery.json', 'recoveryActions'],
      ['incidents-recovery.json', 'approvalRequests'], ['incidents-recovery.json', 'approvalDecisions']
    ]),
    'risk-compliance-audit': Object.freeze([
      ['suppliers.json', 'supplierQualifications'], ['suppliers.json', 'evidence'],
      ['incidents-recovery.json', 'evidence'], ['incidents-recovery.json', 'riskAssessments'],
      ['agent-activity.json', 'suspiciousActivityAlerts'], ['agent-activity.json', 'auditEvents']
    ]),
    'resilience-impact-analytics': Object.freeze([
      ['customers-orders.json', 'demandAssumptions'], ['operations.json', 'inventoryPositions'],
      ['operations.json', 'shipments']
    ])
  });

  const allowedFiles = Object.freeze([
    'agent-activity.json', 'customers-orders.json', 'incidents-recovery.json',
    'manifest.json', 'operations.json', 'organization.json', 'products.json', 'suppliers.json'
  ]);

  async function load(moduleId, fetchImpl = global.fetch) {
    const selections = collectionsByModule[moduleId];
    if (!selections) throw new TypeError('Unknown archive module');
    if (typeof fetchImpl !== 'function') throw new TypeError('fetch is unavailable');

    const files = [...new Set(['manifest.json', ...selections.map(([file]) => file)])];
    const loaded = await Promise.all(files.map(async (file) => {
      if (!allowedFiles.includes(file)) throw new TypeError('Unapproved archive file');
      const response = await fetchImpl(`/ui/demo-archive/${file}`, { credentials: 'same-origin' });
      if (!response || !response.ok) throw new Error(`Archive unavailable (HTTP ${response ? response.status : 0})`);
      const value = await response.json();
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Archive file has an invalid shape');
      return [file, value];
    }));
    const byFile = Object.fromEntries(loaded);
    const manifest = byFile['manifest.json'];
    if (manifest.dataMode !== 'synthetic' || typeof manifest.fictionalDisclaimer !== 'string' || !manifest.fictionalDisclaimer) {
      throw new TypeError('Archive manifest is not explicitly synthetic and fictional');
    }

    return {
      manifest,
      collections: selections.map(([file, name]) => {
        const records = byFile[file][name];
        if (!Array.isArray(records) || records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))) {
          throw new TypeError(`Archive collection ${name} has an invalid shape`);
        }
        return { file, name, records };
      }),
      omittedCollections: [
        'calculationAssumptions', 'productionPlans', 'productionBatches',
        'productionConsumptions', 'impactEstimates'
      ]
    };
  }

  global.VaxResilienceArchive = Object.freeze({ load, collectionsByModule });
})(globalThis);
