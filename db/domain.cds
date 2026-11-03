namespace vaxresilience;

// Draft local domain model reconstructed from the validated CAP CSN build.
// Open lifecycle values remain strings; this does not claim tenant isolation,
// final identity policy, migration safety, or production HANA readiness.

entity AgentExecutions {
  key agentExecutionId : String(64) not null;
  agentId : String(64) not null;
  disruptionId : String(64) not null;
  taskId : String(80) not null;
  startedAt : Timestamp not null;
  completedAt : Timestamp;
  executionState : String(30) not null;
  summary : String(1000) not null;
  evidenceRefs : LargeString not null;
  failureCode : String(60);
  dataMode : String(20) not null;
  agent : Association to Agents on agent.agentId = agentId;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
}

entity Agents {
  key agentId : String(64) not null;
  agentName : String(100) not null;
  agentRole : String(100) not null;
  agentState : String(30) not null;
  promptVersion : String(40) not null;
  isProposed : Boolean not null;
  dataMode : String(20) not null;
}

entity ApprovalDecisions {
  key approvalDecisionId : String(64) not null;
  approvalRequestId : String(64) not null;
  proposalVersion : Integer not null;
  decision : String(30) not null;
  decisionBy : String(64) not null;
  decidedAt : Timestamp not null;
  reason : String(1000);
  decisionEvidenceRefs : LargeString not null;
  dataMode : String(20) not null;
  approvalRequest : Association to ApprovalRequests on approvalRequest.approvalRequestId = approvalRequestId;
  decisionMaker : Association to Users on decisionMaker.userId = decisionBy;
}

@assert.unique: { idempotencyKey: [idempotencyKey] }
entity ApprovalRequests {
  key approvalRequestId : String(64) not null;
  recoveryActionId : String(64) not null;
  actionCategory : String(50) not null;
  proposalVersion : Integer not null;
  submittedBy : String(64) not null;
  submittedAt : Timestamp not null;
  approverRoleId : String(64) not null;
  requestState : String(30) not null;
  idempotencyKey : String(128) not null;
  dataMode : String(20) not null;
  recoveryAction : Association to RecoveryActions on recoveryAction.recoveryActionId = recoveryActionId;
  submitter : Association to Users on submitter.userId = submittedBy;
  approverRole : Association to Roles on approverRole.roleId = approverRoleId;
}

entity AuditEvents {
  key auditEventId : String(64) not null;
  eventType : String(60) not null;
  actorType : String(20) not null;
  actorId : String(64) not null;
  roleId : String(64);
  occurredAt : Timestamp not null;
  recordedAt : Timestamp not null;
  resourceType : String(60) not null;
  resourceId : String(64) not null;
  disruptionId : String(64);
  correlationId : String(128) not null;
  proposalVersion : Integer;
  resultState : String(30) not null;
  sourceRefs : LargeString not null;
  redactionState : String(20) not null;
  dataMode : String(20) not null;
  role : Association to Roles on role.roleId = roleId;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
}

entity CommunicationDeliveries {
  key communicationDeliveryId : String(64) not null;
  emailDraftId : String(64);
  voiceCallId : String(64);
  deliveryState : String(30) not null;
  providerStatusRef : String(128);
  attemptedAt : Timestamp;
  completedAt : Timestamp;
  dataMode : String(20) not null;
  emailDraft : Association to EmailDrafts on emailDraft.emailDraftId = emailDraftId;
  voiceCall : Association to VoiceCalls on voiceCall.voiceCallId = voiceCallId;
}

entity CustomerOrders {
  key customerOrderId : String(64) not null;
  customerId : String(64) not null;
  orderedAt : Timestamp not null;
  requiredDeliveryDate : Date not null;
  orderState : String(30) not null;
  currency : String(3);
  dataMode : String(20) not null;
  customer : Association to Customers on customer.customerId = customerId;
}

entity Customers {
  key customerId : String(64) not null;
  organizationId : String(64) not null;
  customerName : String(160) not null;
  customerType : String(30) not null;
  city : String(100) not null;
  countryCode : String(2) not null;
  customerState : String(20) not null;
  dataMode : String(20) not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
}

entity Deliveries {
  key deliveryId : String(64) not null;
  fulfilmentId : String(64) not null;
  shipmentId : String(64);
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  despatchedAt : Timestamp;
  deliveredAt : Timestamp;
  deliveryState : String(30) not null;
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  fulfilment : Association to OrderFulfilments on fulfilment.fulfilmentId = fulfilmentId;
  shipment : Association to Shipments on shipment.shipmentId = shipmentId;
}

entity DemandAssumptions {
  key assumptionId : String(64) not null;
  customerId : String(64);
  productId : String(64) not null;
  dailyDemand : Decimal(18,3) not null;
  unit : String(30) not null;
  dataMode : String(20) not null;
  customer : Association to Customers on customer.customerId = customerId;
  product : Association to Products on product.productId = productId;
}

entity Disruptions {
  key disruptionId : String(64) not null;
  organizationId : String(64) not null;
  title : String(200) not null;
  productId : String(64) not null;
  supplierId : String(64) not null;
  shipmentId : String(64);
  detectedAt : Timestamp not null;
  reportedDelayDays : Decimal(10,2) not null;
  incidentState : String(30) not null;
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
  product : Association to Products on product.productId = productId;
  supplier : Association to Suppliers on supplier.supplierId = supplierId;
  shipment : Association to Shipments on shipment.shipmentId = shipmentId;
}

entity EmailDrafts {
  key emailDraftId : String(64) not null;
  disruptionId : String(64) not null;
  recipientRef : String(120) not null;
  purpose : String(200) not null;
  content : LargeString not null;
  contentVersion : Integer not null;
  draftState : String(30) not null;
  createdBy : String(64) not null;
  createdAt : Timestamp not null;
  approvalRequestId : String(64);
  dataMode : String(20) not null;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
  creator : Association to Users on creator.userId = createdBy;
  approvalRequest : Association to ApprovalRequests on approvalRequest.approvalRequestId = approvalRequestId;
}

entity Evidence {
  key evidenceId : String(64) not null;
  subjectType : String(50) not null;
  subjectId : String(64) not null;
  evidenceType : String(50) not null;
  sourceLabel : String(160) not null;
  sourceStatus : String(30) not null;
  observedAt : Timestamp not null;
  verifiedBy : String(64);
  verifiedAt : Timestamp;
  dataMode : String(20) not null;
  verifier : Association to Users on verifier.userId = verifiedBy;
}

entity Facilities {
  key facilityId : String(64) not null;
  organizationId : String(64) not null;
  facilityName : String(200) not null;
  city : String(100) not null;
  countryCode : String(2) not null;
  facilityState : String(20) not null;
  dataMode : String(20) not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
}

entity ImpactEstimates {
  key impactEstimateId : String(64) not null;
  disruptionId : String(64) not null;
  estimateType : String(40) not null;
  value : Decimal(18,3) not null;
  unit : String(30) not null;
  method : String(160) not null;
  inputRefs : LargeString not null;
  assumptionRefs : LargeString not null;
  estimateLabel : String(100) not null;
  calculatedAt : Timestamp not null;
  dataMode : String(20) not null;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
}

@assert.unique: { materialLot: [materialId, lotCode] }
entity InventoryBatches {
  key batchId : String(64) not null;
  materialId : String(64) not null;
  lotCode : String(80) not null;
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  manufacturedOn : Date;
  expiresOn : Date;
  qualityState : String(30) not null;
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  material : Association to Materials on material.materialId = materialId;
}

entity InventoryPositions {
  key inventoryId : String(64) not null;
  materialId : String(64) not null;
  warehouseId : String(64) not null;
  batchId : String(64);
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  asOf : Timestamp not null;
  coverageDays : Decimal(10,2);
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  material : Association to Materials on material.materialId = materialId;
  warehouse : Association to Warehouses on warehouse.warehouseId = warehouseId;
  batch : Association to InventoryBatches on batch.batchId = batchId;
}

entity Materials {
  key materialId : String(64) not null;
  materialName : String(200) not null;
  materialType : String(30) not null;
  baseUnit : String(20) not null;
  materialState : String(20) not null;
  dataMode : String(20) not null;
}

entity OrderFulfilments {
  key fulfilmentId : String(64) not null;
  orderLineId : String(64) not null;
  quantity : Decimal(18,3) not null;
  warehouseId : String(64) not null;
  fulfilmentState : String(30) not null;
  approvalRequestId : String(64);
  dataMode : String(20) not null;
  orderLine : Association to OrderLines on orderLine.orderLineId = orderLineId;
  warehouse : Association to Warehouses on warehouse.warehouseId = warehouseId;
  approvalRequest : Association to ApprovalRequests on approvalRequest.approvalRequestId = approvalRequestId;
}

entity OrderLines {
  key orderLineId : String(64) not null;
  customerOrderId : String(64) not null;
  productId : String(64) not null;
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  lineState : String(30) not null;
  customerOrder : Association to CustomerOrders on customerOrder.customerOrderId = customerOrderId;
  product : Association to Products on product.productId = productId;
}

entity Organizations {
  key organizationId : String(64) not null;
  legalName : String(200) not null;
  displayName : String(200) not null;
  countryCode : String(2) not null;
  city : String(100) not null;
  dataMode : String(20) not null;
}

@assert.unique: { permissionResourceAction: [resource, action] }
entity Permissions {
  key permissionId : String(64) not null;
  resource : String(80) not null;
  action : String(40) not null;
  scopeDescription : String(500) not null;
  dataMode : String(20);
}

entity Ports {
  key portId : String(64) not null;
  portName : String(160) not null;
  city : String(100) not null;
  countryCode : String(2) not null;
  portType : String(20) not null;
  dataMode : String(20) not null;
}

entity ProductMaterials {
  key productId : String(64) not null;
  key materialId : String(64) not null;
  key effectiveFrom : Date not null;
  quantityPerBaseUnit : Decimal(18,6) not null;
  unit : String(20) not null;
  effectiveTo : Date;
  dataMode : String(20) not null;
  product : Association to Products on product.productId = productId;
  material : Association to Materials on material.materialId = materialId;
}

@assert.unique: { planBatchCode: [productionPlanId, batchCode] }
entity ProductionBatches {
  key productionBatchId : String(64) not null;
  productionPlanId : String(64) not null;
  batchCode : String(80) not null;
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  startedAt : Timestamp not null;
  completedAt : Timestamp;
  batchState : String(30) not null;
  dataMode : String(20) not null;
  productionPlan : Association to ProductionPlans on productionPlan.productionPlanId = productionPlanId;
}

entity ProductionConsumptions {
  key consumptionId : String(64) not null;
  productionBatchId : String(64) not null;
  materialId : String(64) not null;
  inventoryBatchId : String(64) not null;
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  consumedAt : Timestamp not null;
  dataMode : String(20) not null;
  productionBatch : Association to ProductionBatches on productionBatch.productionBatchId = productionBatchId;
  material : Association to Materials on material.materialId = materialId;
  inventoryBatch : Association to InventoryBatches on inventoryBatch.batchId = inventoryBatchId;
}

entity ProductionPlans {
  key productionPlanId : String(64) not null;
  facilityId : String(64) not null;
  productId : String(64) not null;
  periodStart : Date not null;
  periodEnd : Date not null;
  plannedQuantity : Decimal(18,3) not null;
  unit : String(20) not null;
  planState : String(30) not null;
  approvalRequestId : String(64);
  dataMode : String(20) not null;
  facility : Association to Facilities on facility.facilityId = facilityId;
  product : Association to Products on product.productId = productId;
  approvalRequest : Association to ApprovalRequests on approvalRequest.approvalRequestId = approvalRequestId;
}

entity Products {
  key productId : String(64) not null;
  organizationId : String(64) not null;
  productName : String(200) not null;
  strength : String(40) not null;
  dosageForm : String(60) not null;
  baseUnit : String(20) not null;
  productState : String(20) not null;
  dataMode : String(20) not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
}

entity PurchaseOrderLines {
  key purchaseOrderLineId : String(64) not null;
  purchaseOrderId : String(64) not null;
  materialId : String(64) not null;
  quantity : Decimal(18,3) not null;
  unit : String(20) not null;
  unitPrice : Decimal(19,4);
  lineState : String(30) not null;
  purchaseOrder : Association to PurchaseOrders on purchaseOrder.purchaseOrderId = purchaseOrderId;
  material : Association to Materials on material.materialId = materialId;
}

entity PurchaseOrders {
  key purchaseOrderId : String(64) not null;
  supplierId : String(64) not null;
  orderedAt : Timestamp not null;
  currency : String(3) not null;
  orderState : String(30) not null;
  approvalRequestId : String(64);
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  supplier : Association to Suppliers on supplier.supplierId = supplierId;
  approvalRequest : Association to ApprovalRequests on approvalRequest.approvalRequestId = approvalRequestId;
}

entity RecoveryActions {
  key recoveryActionId : String(64) not null;
  recoveryPlanId : String(64) not null;
  actionType : String(50) not null;
  actionState : String(40) not null;
  targetRef : String(64);
  proposalVersion : Integer not null;
  executionRef : String(64);
  evidenceRefs : LargeString not null;
  dataMode : String(20) not null;
  recoveryPlan : Association to RecoveryPlans on recoveryPlan.recoveryPlanId = recoveryPlanId;
}

@assert.unique: { disruptionVersion: [disruptionId, version] }
entity RecoveryPlans {
  key recoveryPlanId : String(64) not null;
  disruptionId : String(64) not null;
  version : Integer not null;
  planState : String(30) not null;
  summary : String(1000) not null;
  allocationPolicyRef : String(64);
  createdBy : String(64) not null;
  createdAt : Timestamp not null;
  dataMode : String(20) not null;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
  creator : Association to Users on creator.userId = createdBy;
}

entity RiskAssessments {
  key riskAssessmentId : String(64) not null;
  disruptionId : String(64) not null;
  assessedAt : Timestamp not null;
  riskType : String(40) not null;
  severity : String(20) not null;
  summary : String(1000) not null;
  method : String(120) not null;
  inputRefs : LargeString not null;
  assessmentState : String(20) not null;
  dataMode : String(20) not null;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
}

entity RolePermissions {
  key roleId : String(64) not null;
  key permissionId : String(64) not null;
  grantState : String(20) not null;
  scope : String(500) not null;
  dataMode : String(20);
  role : Association to Roles on role.roleId = roleId;
  permission : Association to Permissions on permission.permissionId = permissionId;
}

@assert.unique: { roleName: [name] }
entity Roles {
  key roleId : String(64) not null;
  name : String(80) not null;
  description : String(500) not null;
  dataMode : String(20);
}

entity Routes {
  key routeId : String(64) not null;
  routeName : String(200) not null;
  originRef : String(64) not null;
  destinationRef : String(64) not null;
  waypoints : LargeString not null;
  modeSummary : String(300) not null;
  routeState : String(30) not null;
  dataMode : String(20) not null;
}

entity ShipmentEvents {
  key shipmentEventId : String(64) not null;
  shipmentId : String(64) not null;
  eventType : String(40) not null;
  eventAt : Timestamp not null;
  description : String(500) not null;
  sourceRef : String(120) not null;
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  shipment : Association to Shipments on shipment.shipmentId = shipmentId;
}

entity Shipments {
  key shipmentId : String(64) not null;
  purchaseOrderId : String(64);
  routeId : String(64) not null;
  carrierRef : String(64);
  originRef : String(64) not null;
  destinationRef : String(64) not null;
  plannedArrival : Date not null;
  revisedArrival : Date;
  actualArrival : Date;
  shipmentState : String(30) not null;
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  purchaseOrder : Association to PurchaseOrders on purchaseOrder.purchaseOrderId = purchaseOrderId;
  route : Association to Routes on route.routeId = routeId;
}

entity SupplierQualifications {
  key qualificationId : String(64) not null;
  supplierId : String(64) not null;
  productId : String(64) not null;
  checkType : String(40) not null;
  checkState : String(20) not null;
  evidenceRef : String(64) not null;
  reviewedBy : String(64);
  reviewedAt : Timestamp;
  validUntil : Date;
  dataMode : String(20) not null;
  supplier : Association to Suppliers on supplier.supplierId = supplierId;
  product : Association to Products on product.productId = productId;
  reviewer : Association to Users on reviewer.userId = reviewedBy;
  evidence : Association to Evidence on evidence.evidenceId = evidenceRef;
}

entity SupplierStatusEvents {
  key supplierStatusEventId : String(64) not null;
  supplierId : String(64) not null;
  previousState : String(40) not null;
  newState : String(40) not null;
  changedAt : Timestamp not null;
  reason : String(500) not null;
  dataMode : String(20) not null;
  supplier : Association to Suppliers on supplier.supplierId = supplierId;
}

entity Suppliers {
  key supplierId : String(64) not null;
  organizationId : String(64) not null;
  name : String(200) not null;
  countryCode : String(2) not null;
  city : String(100) not null;
  supplierState : String(40) not null;
  sourceStatus : String(30) not null;
  dataMode : String(20) not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
}

entity SuspiciousActivityAlerts {
  key alertId : String(64) not null;
  disruptionId : String(64) not null;
  subjectType : String(50) not null;
  subjectId : String(64) not null;
  alertType : String(50) not null;
  neutralRationale : String(1000) not null;
  evidenceRefs : LargeString not null;
  alertState : String(30) not null;
  holdState : String(30) not null;
  createdAt : Timestamp not null;
  dataMode : String(20) not null;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
}

entity ToolInvocations {
  key toolInvocationId : String(64) not null;
  agentExecutionId : String(64);
  toolName : String(100) not null;
  requestRef : String(128) not null;
  startedAt : Timestamp not null;
  completedAt : Timestamp;
  resultState : String(30) not null;
  sourceStatus : String(30) not null;
  idempotencyKey : String(128);
  dataMode : String(20) not null;
  agentExecution : Association to AgentExecutions on agentExecution.agentExecutionId = agentExecutionId;
}

entity Users {
  key userId : String(64) not null;
  organizationId : String(64) not null;
  roleId : String(64) not null;
  displayName : String(120) not null;
  accountState : String(20) not null;
  isSyntheticIdentity : Boolean not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
  role : Association to Roles on role.roleId = roleId;
}

entity VoiceCalls {
  key voiceCallId : String(64) not null;
  disruptionId : String(64) not null;
  initiatedBy : String(64) not null;
  recipientRole : String(100) not null;
  purpose : String(300) not null;
  consentState : String(30) not null;
  callState : String(30) not null;
  summary : String(2000);
  verificationState : String(30) not null;
  startedAt : Timestamp;
  endedAt : Timestamp;
  dataMode : String(20) not null;
  disruption : Association to Disruptions on disruption.disruptionId = disruptionId;
  initiator : Association to Users on initiator.userId = initiatedBy;
}

entity Warehouses {
  key warehouseId : String(64) not null;
  organizationId : String(64) not null;
  facilityId : String(64);
  warehouseName : String(200) not null;
  city : String(100) not null;
  countryCode : String(2) not null;
  warehouseType : String(30) not null;
  warehouseState : String(20) not null;
  dataMode : String(20) not null;
  organization : Association to Organizations on organization.organizationId = organizationId;
  facility : Association to Facilities on facility.facilityId = facilityId;
}
