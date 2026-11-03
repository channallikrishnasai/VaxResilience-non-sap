(function attachVaxResilienceDigitalTwin(global) {
  'use strict';

  const entityDefinitions = Object.freeze([
    ['organizations', 'organizationId', 'Organization', 'displayName', ['city', 'countryCode'], 'dataMode'],
    ['suppliers', 'supplierId', 'Supplier', 'name', ['city', 'countryCode'], 'supplierState'],
    ['ports', 'portId', 'Port', 'portName', ['city', 'countryCode'], 'portType'],
    ['facilities', 'facilityId', 'Facility', 'facilityName', ['city', 'countryCode'], 'facilityState'],
    ['warehouses', 'warehouseId', 'Warehouse', 'warehouseName', ['city', 'countryCode'], 'warehouseState'],
    ['customers', 'customerId', 'Customer', 'customerName', ['city', 'countryCode'], 'customerState']
  ]);

  function build(collections) {
    if (!Array.isArray(collections)) throw new TypeError('Digital Twin collections must be an array');
    const byName = Object.fromEntries(collections.map((collection) => [collection.name, collection.records]));
    const nodes = [];
    const nodeById = new Map();
    for (const [collectionName, idField, type, nameField, locationFields, stateField] of entityDefinitions) {
      for (const record of byName[collectionName] || []) {
        const id = record[idField];
        if (typeof id !== 'string' || !id) continue;
        const node = {
          id,
          type,
          name: String(record[nameField] || id),
          location: locationFields.map((field) => record[field]).filter(Boolean).join(', ') || 'Not specified in source',
          state: String(record[stateField] || record.dataMode || 'Not specified in source')
        };
        if (nodeById.has(id)) throw new Error(`Duplicate Digital Twin node identifier: ${id}`);
        nodes.push(node);
        nodeById.set(id, node);
      }
    }

    const relationships = [];
    const unresolvedReferences = [];
    function addRelationship(sourceId, targetId, relationship, context) {
      const source = nodeById.get(sourceId);
      const target = nodeById.get(targetId);
      if (!source || !target) {
        unresolvedReferences.push({ sourceId, targetId, relationship, context });
        return;
      }
      relationships.push({
        sourceId, sourceName: source.name, targetId, targetName: target.name,
        relationship, context
      });
    }

    for (const route of byName.routes || []) {
      const path = [route.originRef, ...(Array.isArray(route.waypoints) ? route.waypoints : []), route.destinationRef];
      for (let index = 0; index < path.length - 1; index += 1) {
        addRelationship(path[index], path[index + 1], `Route segment ${index + 1}`, `${route.routeId}: ${route.routeName}`);
      }
    }

    const routeIds = new Set((byName.routes || []).map((route) => route.routeId));
    for (const shipment of byName.shipments || []) {
      if (!routeIds.has(shipment.routeId)) {
        unresolvedReferences.push({ sourceId: shipment.shipmentId, targetId: shipment.routeId, relationship: 'Shipment uses route', context: shipment.shipmentState || '' });
      }
    }

    const ordersById = new Map((byName.customerOrders || []).map((record) => [record.customerOrderId, record]));
    const customerByOrderLine = new Map();
    for (const line of byName.orderLines || []) {
      const order = ordersById.get(line.customerOrderId);
      if (order) customerByOrderLine.set(line.orderLineId, order.customerId);
    }
    for (const fulfilment of byName.orderFulfilments || []) {
      const customerId = customerByOrderLine.get(fulfilment.orderLineId);
      if (!customerId) {
        unresolvedReferences.push({ sourceId: fulfilment.warehouseId, targetId: fulfilment.orderLineId, relationship: 'Historical simulated fulfilment', context: fulfilment.fulfilmentId || '' });
        continue;
      }
      addRelationship(fulfilment.warehouseId, customerId, 'Historical simulated fulfilment', fulfilment.fulfilmentId || '');
    }

    return { nodes, relationships, unresolvedReferences };
  }

  global.VaxResilienceDigitalTwin = Object.freeze({ build });
})(globalThis);
