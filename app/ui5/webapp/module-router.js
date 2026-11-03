(function attachVaxResilienceRouter(global) {
  'use strict';

  const moduleNames = Object.freeze({
    'executive-dashboard': 'Executive Dashboard',
    'supply-chain-digital-twin': 'Supply Chain Digital Twin',
    'ai-command-centre': 'AI Command Centre',
    'inventory-manufacturing': 'Inventory & Manufacturing',
    'customers-orders': 'Customers & Orders',
    'approvals-decisions': 'Approvals & Decisions',
    'risk-compliance-audit': 'Risk, Compliance & Audit',
    'resilience-impact-analytics': 'Resilience & Impact Analytics'
  });
  const defaultModule = 'executive-dashboard';

  function fromHash(hash) {
    const match = /^#\/([a-z0-9-]+)\/?$/.exec(String(hash || ''));
    const route = match ? match[1] : '';
    return Object.prototype.hasOwnProperty.call(moduleNames, route) ? route : defaultModule;
  }

  function toHash(moduleId) {
    return `#/${Object.prototype.hasOwnProperty.call(moduleNames, moduleId) ? moduleId : defaultModule}`;
  }

  global.VaxResilienceRouter = Object.freeze({ moduleNames, defaultModule, fromHash, toHash });
})(globalThis);
