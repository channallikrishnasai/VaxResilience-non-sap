"""Validate the official synthetic fixtures against available schemas and IDs.

The official fixture set currently has fewer record schemas than record
collections. Unmapped record collections are reported explicitly so the
validator never treats incomplete schema coverage as a clean full validation.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_ROOT = REPOSITORY_ROOT / "docs" / "official-specification" / "data"

# Fixture collection -> schema filename stem. These are exact entity schemas
# already present in the official specification; no new business enums are inferred.
SCHEMA_BY_COLLECTION = {
    "manifest": "manifest",
    "agentExecutions": "agent-execution",
    "auditEvents": "audit-event",
    "customers": "customer",
    "demandAssumptions": "demand-assumption",
    "customerOrders": "customer-order",
    "disruptions": "disruption",
    "riskAssessments": "risk-assessment",
    "impactEstimates": "impact-estimate",
    "recoveryPlans": "recovery-plan",
    "recoveryActions": "recovery-action",
    "approvalRequests": "approval-request",
    "inventoryPositions": "inventory",
    "shipments": "shipment",
    "productionConsumptions": "production-consumption",
    "products": "product",
    "materials": "material",
    "suppliers": "supplier",
    "supplierStatusEvents": "supplier-status-event",
    "supplierQualifications": "supplier-qualification",
}
SCHEMA_BY_COLLECTION.update({
    "agents": "additional-fixture-entities#/$defs/agents",
    "toolInvocations": "additional-fixture-entities#/$defs/toolInvocations",
    "voiceCalls": "additional-fixture-entities#/$defs/voiceCalls",
    "emailDrafts": "additional-fixture-entities#/$defs/emailDrafts",
    "communicationDeliveries": "additional-fixture-entities#/$defs/communicationDeliveries",
    "suspiciousActivityAlerts": "additional-fixture-entities#/$defs/suspiciousActivityAlerts",
    "orderLines": "additional-fixture-entities#/$defs/orderLines",
    "orderFulfilments": "additional-fixture-entities#/$defs/orderFulfilments",
    "deliveries": "additional-fixture-entities#/$defs/deliveries",
    "evidence": "additional-fixture-entities#/$defs/evidence",
    "approvalDecisions": "additional-fixture-entities#/$defs/approvalDecisions",
    "facilities": "additional-fixture-entities#/$defs/facilities",
    "warehouses": "additional-fixture-entities#/$defs/warehouses",
    "ports": "additional-fixture-entities#/$defs/ports",
    "routes": "additional-fixture-entities#/$defs/routes",
    "inventoryBatches": "additional-fixture-entities#/$defs/inventoryBatches",
    "purchaseOrders": "additional-fixture-entities#/$defs/purchaseOrders",
    "purchaseOrderLines": "additional-fixture-entities#/$defs/purchaseOrderLines",
    "shipmentEvents": "additional-fixture-entities#/$defs/shipmentEvents",
    "productionBatches": "additional-fixture-entities#/$defs/productionBatches",
    "organizations": "additional-fixture-entities#/$defs/organizations",
    "roles": "additional-fixture-entities#/$defs/roles",
    "users": "additional-fixture-entities#/$defs/users",
    "permissions": "additional-fixture-entities#/$defs/permissions",
    "rolePermissions": "additional-fixture-entities#/$defs/rolePermissions",
    "productMaterials": "additional-fixture-entities#/$defs/productMaterials",
})

IDENTITY_BY_COLLECTION = {
    "agents": "agentId",
    "agentExecutions": "agentExecutionId",
    "toolInvocations": "toolInvocationId",
    "voiceCalls": "voiceCallId",
    "emailDrafts": "emailDraftId",
    "communicationDeliveries": "communicationDeliveryId",
    "suspiciousActivityAlerts": "alertId",
    "auditEvents": "auditEventId",
    "customers": "customerId",
    "demandAssumptions": "assumptionId",
    "customerOrders": "customerOrderId",
    "orderLines": "orderLineId",
    "orderFulfilments": "fulfilmentId",
    "deliveries": "deliveryId",
    "evidence": "evidenceId",
    "disruptions": "disruptionId",
    "riskAssessments": "riskAssessmentId",
    "impactEstimates": "impactEstimateId",
    "recoveryPlans": "recoveryPlanId",
    "recoveryActions": "recoveryActionId",
    "approvalRequests": "approvalRequestId",
    "approvalDecisions": "approvalDecisionId",
    "facilities": "facilityId",
    "warehouses": "warehouseId",
    "ports": "portId",
    "routes": "routeId",
    "inventoryBatches": "batchId",
    "inventoryPositions": "inventoryId",
    "purchaseOrders": "purchaseOrderId",
    "purchaseOrderLines": "purchaseOrderLineId",
    "shipments": "shipmentId",
    "shipmentEvents": "shipmentEventId",
    "productionPlans": "productionPlanId",
    "productionBatches": "productionBatchId",
    "productionConsumptions": "consumptionId",
    "organizations": "organizationId",
    "roles": "roleId",
    "users": "userId",
    "permissions": "permissionId",
    "rolePermissions": None,
    "products": "productId",
    "materials": "materialId",
    "productMaterials": None,
    "calculationAssumptions": "assumptionId",
    "suppliers": "supplierId",
    "supplierStatusEvents": "supplierStatusEventId",
    "supplierQualifications": "qualificationId",
}
COMPOSITE_IDENTITY_BY_COLLECTION = {
    "rolePermissions": ("roleId", "permissionId"),
    "productMaterials": ("productId", "materialId", "effectiveFrom"),
}
UNIQUE_KEY_FIELDS_BY_COLLECTION = {
    "approvalRequests": ("idempotencyKey",),
    "inventoryBatches": ("materialId", "lotCode"),
    "permissions": ("resource", "action"),
    "productionBatches": ("productionPlanId", "batchCode"),
    "recoveryPlans": ("disruptionId", "version"),
    "roles": ("name",),
}

# Single-valued references whose targets are present in this fixture set.
REFERENCE_BY_FIELD = {
    "organizationId": "organizations",
    "roleId": "roles",
    "permissionId": "permissions",
    "subjectId": None,
    "initiatedBy": "users",
    "emailDraftId": "emailDrafts",
    "voiceCallId": "voiceCalls",
    "supplierId": "suppliers",
    "productId": "products",
    "materialId": "materials",
    "facilityId": "facilities",
    "warehouseId": "warehouses",
    "batchId": "inventoryBatches",
    "inventoryBatchId": "inventoryBatches",
    "inventoryId": "inventoryPositions",
    "purchaseOrderId": "purchaseOrders",
    "routeId": "routes",
    "shipmentId": "shipments",
    "productionPlanId": "productionPlans",
    "productionBatchId": "productionBatches",
    "customerId": "customers",
    "customerOrderId": "customerOrders",
    "orderLineId": "orderLines",
    "fulfilmentId": "orderFulfilments",
    "disruptionId": "disruptions",
    "recoveryPlanId": "recoveryPlans",
    "recoveryActionId": "recoveryActions",
    "approvalRequestId": "approvalRequests",
    "evidenceRef": "evidence",
    "targetRef": None,
    "agentId": "agents",
    "agentExecutionId": "agentExecutions",
    "verifiedBy": "users",
    "reviewedBy": "users",
    "createdBy": "users",
    "submittedBy": "users",
    "decisionBy": "users",
    "closureDecisionBy": "users",
    "approverRoleId": "roles",
    "permissionId": "permissions",
}

ARRAY_REFERENCE_FIELDS: dict[str, str | tuple[str, ...] | None] = {
    "closureEvidenceRefs": "evidence",
    "inputRefs": None,  # Mixed evidence and operational references are specified.
    "evidenceRefs": None,
    "decisionEvidenceRefs": "evidence",
    "sourceRefs": None,
    "assumptionRefs": ("calculationAssumptions", "demandAssumptions"),
    "waypoints": ("ports", "facilities", "warehouses", "suppliers"),
}


@dataclass(frozen=True)
class ValidationIssue:
    code: str
    location: str
    message: str


@dataclass
class ValidationReport:
    issues: list[ValidationIssue]
    unmapped_collections: list[str]
    validated_records: int

    @property
    def valid(self) -> bool:
        return not self.issues and not self.unmapped_collections


def _strict_json_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON object key: {key}")
        result[key] = value
    return result


def _reject_json_constant(value: str) -> None:
    raise ValueError(f"Non-standard JSON numeric constant: {value}")


def _strict_json_loads(text: str) -> Any:
    return json.loads(
        text,
        object_pairs_hook=_strict_json_object,
        parse_constant=_reject_json_constant,
    )


def load_fixtures(synthetic_dir: Path) -> dict[str, dict[str, list[dict[str, Any]]]]:
    manifest = _strict_json_loads((synthetic_dir / "manifest.json").read_text(encoding="utf-8"))
    fixtures: dict[str, dict[str, list[dict[str, Any]]]] = {}
    missing = [name for name in manifest["fixtureFiles"] if not (synthetic_dir / name).is_file()]
    if missing:
        raise ValueError(f"Manifest references missing fixture files: {missing}")
    for name in manifest["fixtureFiles"]:
        fixtures[name] = _strict_json_loads((synthetic_dir / name).read_text(encoding="utf-8"))
    fixtures["manifest.json"] = {"manifest": [manifest]}
    return fixtures


def _identities(fixtures: dict[str, dict[str, list[dict[str, Any]]]]) -> dict[str, set[str]]:
    identities: dict[str, set[str]] = {}
    for contents in fixtures.values():
        for collection, rows in contents.items():
            key = IDENTITY_BY_COLLECTION.get(collection)
            if not isinstance(key, str):
                continue
            identities.setdefault(collection, set()).update(
                str(row[key]) for row in rows if isinstance(row, dict) and row.get(key) is not None
            )
    return identities


def _non_finite_numeric_issues(value: Any, location: str) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    if isinstance(value, dict):
        for key, nested in value.items():
            issues.extend(_non_finite_numeric_issues(nested, f"{location}.{key}"))
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            issues.extend(_non_finite_numeric_issues(nested, f"{location}[{index}]"))
    elif isinstance(value, (int, float, Decimal)) and not isinstance(value, bool):
        try:
            finite = Decimal(str(value)).is_finite()
        except Exception:
            finite = False
        if not finite:
            issues.append(ValidationIssue("non_finite_number", location, "numeric value must be finite"))
    return issues


def validate_record(record: dict[str, Any], schema: dict[str, Any], location: str) -> list[ValidationIssue]:
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    issues = [
        ValidationIssue("schema", location, error.message)
        for error in sorted(validator.iter_errors(record), key=lambda item: list(item.path))
    ]
    issues.extend(_non_finite_numeric_issues(record, location))
    return issues


def _schema_for(schema_key: str, schemas: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    filename, _, pointer = schema_key.partition("#")
    schema = schemas.get(filename)
    if schema is None:
        return None
    if not pointer:
        return schema
    for part in pointer.strip("/").split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        if not isinstance(schema, dict) or part not in schema:
            return None
        schema = schema[part]
    return schema if isinstance(schema, dict) else None


def _rows_by_collection(
    fixtures: dict[str, dict[str, list[dict[str, Any]]]],
) -> dict[str, list[dict[str, Any]]]:
    collected: dict[str, list[dict[str, Any]]] = {}
    for contents in fixtures.values():
        for collection, rows in contents.items():
            if isinstance(rows, list):
                collected.setdefault(collection, []).extend(row for row in rows if isinstance(row, dict))
    return collected


def _as_datetime(value: str | None) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _as_date(value: str | None) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _as_decimal(value: Any) -> Decimal | None:
    try:
        number = Decimal(str(value)) if value is not None else None
        return number if number is not None and number.is_finite() else None
    except Exception:
        return None


def _business_invariant_issues(
    fixtures: dict[str, dict[str, list[dict[str, Any]]]],
) -> list[ValidationIssue]:
    rows = _rows_by_collection(fixtures)
    issues: list[ValidationIssue] = []

    def add(code: str, collection: str, row: dict[str, Any], message: str) -> None:
        identity = IDENTITY_BY_COLLECTION.get(collection)
        label = row.get(identity, "record") if isinstance(identity, str) else "record"
        issues.append(ValidationIssue(code, f"{collection}:{label}", message))

    def by_id(collection: str, field: str) -> dict[str, dict[str, Any]]:
        return {row[field]: row for row in rows.get(collection, []) if isinstance(row.get(field), str)}

    materials = by_id("materials", "materialId")
    products = by_id("products", "productId")
    inventory_batches = by_id("inventoryBatches", "batchId")
    order_lines = by_id("orderLines", "orderLineId")
    fulfilments = by_id("orderFulfilments", "fulfilmentId")
    plans = by_id("productionPlans", "productionPlanId")

    customer_demand: dict[tuple[str, str], Decimal] = {}
    aggregate_demand: list[dict[str, Any]] = []
    for row in rows.get("demandAssumptions", []):
        product_id, unit = row.get("productId"), row.get("unit")
        quantity = _as_decimal(row.get("dailyDemand"))
        if not isinstance(product_id, str) or not isinstance(unit, str) or quantity is None:
            continue
        if row.get("customerId") is None:
            aggregate_demand.append(row)
        else:
            key = (product_id, unit)
            customer_demand[key] = customer_demand.get(key, Decimal(0)) + quantity
    for row in aggregate_demand:
        product_id, unit = row.get("productId"), row.get("unit")
        quantity = _as_decimal(row.get("dailyDemand"))
        if not isinstance(product_id, str) or not isinstance(unit, str) or quantity is None:
            continue
        expected = customer_demand.get((product_id, unit), Decimal(0))
        if quantity != expected:
            add(
                "demand_aggregate_mismatch", "demandAssumptions", row,
                f"aggregate dailyDemand ({quantity}) must equal included customer demand ({expected}) for product/unit",
            )

    for row in rows.get("communicationDeliveries", []):
        has_email_parent = row.get("emailDraftId") is not None
        has_voice_parent = row.get("voiceCallId") is not None
        if has_email_parent == has_voice_parent:
            add(
                "communication_parent_count", "communicationDeliveries", row,
                "exactly one of emailDraftId or voiceCallId must be present",
            )

    for row in rows.get("inventoryBatches", []):
        manufactured = row.get("manufacturedOn")
        expires = row.get("expiresOn")
        manufactured_date, expires_date = _as_date(manufactured), _as_date(expires)
        if manufactured_date and expires_date and expires_date <= manufactured_date:
            add("batch_expiry_order", "inventoryBatches", row, "expiresOn must be after manufacturedOn")
        material = materials.get(row.get("materialId"))
        if material and row.get("unit") != material.get("baseUnit"):
            add("unit_mismatch", "inventoryBatches", row, "unit must match the material baseUnit")

    for row in rows.get("inventoryPositions", []):
        material = materials.get(row.get("materialId"))
        if material and row.get("unit") != material.get("baseUnit"):
            add("unit_mismatch", "inventoryPositions", row, "unit must match the material baseUnit")
        batch = inventory_batches.get(row.get("batchId"))
        if batch and row.get("materialId") != batch.get("materialId"):
            add("batch_material_mismatch", "inventoryPositions", row, "batch material must match position material")
        if batch and row.get("unit") != batch.get("unit"):
            add("unit_mismatch", "inventoryPositions", row, "unit must match the referenced batch unit")

    for row in rows.get("purchaseOrderLines", []):
        material = materials.get(row.get("materialId"))
        if material and row.get("unit") != material.get("baseUnit"):
            add("unit_mismatch", "purchaseOrderLines", row, "unit must match the material baseUnit")

    for row in rows.get("orderLines", []):
        product = products.get(row.get("productId"))
        if product and row.get("unit") != product.get("baseUnit"):
            add("unit_mismatch", "orderLines", row, "unit must match the product baseUnit")
    fulfilled_by_line: dict[str, Decimal] = {}
    for row in rows.get("orderFulfilments", []):
        line_id = row.get("orderLineId")
        quantity = _as_decimal(row.get("quantity"))
        if line_id in order_lines and quantity is not None:
            fulfilled_by_line[line_id] = fulfilled_by_line.get(line_id, Decimal(0)) + quantity
    for line_id, quantity in fulfilled_by_line.items():
        line_quantity = _as_decimal(order_lines[line_id].get("quantity"))
        if line_quantity is not None and quantity > line_quantity:
            add("fulfilment_exceeds_order_line", "orderLines", order_lines[line_id], "total fulfilment quantity exceeds order line quantity")

    delivered_by_fulfilment: dict[str, Decimal] = {}
    for row in rows.get("deliveries", []):
        fulfilment_id = row.get("fulfilmentId")
        fulfilment = fulfilments.get(fulfilment_id)
        quantity = _as_decimal(row.get("quantity"))
        if fulfilment and quantity is not None:
            delivered_by_fulfilment[fulfilment_id] = delivered_by_fulfilment.get(fulfilment_id, Decimal(0)) + quantity
            line = order_lines.get(fulfilment.get("orderLineId"))
            if line and row.get("unit") != line.get("unit"):
                add("unit_mismatch", "deliveries", row, "delivery unit must match its order-line unit")
        despatched = _as_datetime(row.get("despatchedAt"))
        delivered = _as_datetime(row.get("deliveredAt"))
        if despatched and delivered and delivered < despatched:
            add("delivery_time_order", "deliveries", row, "deliveredAt must not precede despatchedAt")
    for fulfilment_id, quantity in delivered_by_fulfilment.items():
        fulfilment_quantity = _as_decimal(fulfilments[fulfilment_id].get("quantity"))
        if fulfilment_quantity is not None and quantity > fulfilment_quantity:
            add("delivery_exceeds_fulfilment", "orderFulfilments", fulfilments[fulfilment_id], "total delivery quantity exceeds fulfilment quantity")

    consumed_by_batch: dict[str, Decimal] = {}
    for row in rows.get("productionConsumptions", []):
        batch_id = row.get("inventoryBatchId")
        batch = inventory_batches.get(batch_id)
        material = materials.get(row.get("materialId"))
        if batch and row.get("materialId") != batch.get("materialId"):
            add("batch_material_mismatch", "productionConsumptions", row, "consumption material must match inventory batch material")
        expected_unit = batch.get("unit") if batch else material.get("baseUnit") if material else None
        if expected_unit and row.get("unit") != expected_unit:
            add("unit_mismatch", "productionConsumptions", row, "consumption unit must match its material/batch unit")
        quantity = _as_decimal(row.get("quantity"))
        if batch_id in inventory_batches and quantity is not None:
            consumed_by_batch[batch_id] = consumed_by_batch.get(batch_id, Decimal(0)) + quantity
    for batch_id, quantity in consumed_by_batch.items():
        batch_quantity = _as_decimal(inventory_batches[batch_id].get("quantity"))
        if batch_quantity is not None and quantity > batch_quantity:
            add("consumption_exceeds_inventory_batch", "inventoryBatches", inventory_batches[batch_id], "total recorded consumption exceeds batch quantity")

    for row in rows.get("productionPlans", []):
        start = _as_date(row.get("periodStart"))
        end = _as_date(row.get("periodEnd"))
        if start and end and end < start:
            add("production_period_order", "productionPlans", row, "periodEnd must not precede periodStart")
        planned_quantity = _as_decimal(row.get("plannedQuantity"))
        if planned_quantity is not None and planned_quantity < 0:
            add("negative_quantity", "productionPlans", row, "plannedQuantity must be non-negative")
        product = products.get(row.get("productId"))
        if product and row.get("unit") != product.get("baseUnit"):
            add("unit_mismatch", "productionPlans", row, "planned output unit must match product baseUnit")

    for row in rows.get("productionBatches", []):
        started = _as_datetime(row.get("startedAt"))
        completed = _as_datetime(row.get("completedAt"))
        if started and completed and completed < started:
            add("production_batch_time_order", "productionBatches", row, "completedAt must not precede startedAt")
        if row.get("batchState") == "completed_simulated" and not completed:
            add("completed_batch_missing_time", "productionBatches", row, "completed simulated batch requires completedAt")
        plan = plans.get(row.get("productionPlanId"))
        if plan and row.get("unit") != plan.get("unit"):
            add("unit_mismatch", "productionBatches", row, "batch unit must match production plan unit")

    latest_dispatch_by_shipment: dict[str, datetime] = {}
    for event in rows.get("shipmentEvents", []):
        if event.get("eventType") != "departed":
            continue
        shipment_id = event.get("shipmentId")
        dispatched_at = _as_datetime(event.get("eventAt"))
        if not isinstance(shipment_id, str) or dispatched_at is None:
            continue
        previous = latest_dispatch_by_shipment.get(shipment_id)
        if previous is None or dispatched_at > previous:
            latest_dispatch_by_shipment[shipment_id] = dispatched_at

    for row in rows.get("shipments", []):
        planned = row.get("plannedArrival")
        revised = row.get("revisedArrival")
        actual = row.get("actualArrival")
        planned_date, revised_date, actual_date = _as_date(planned), _as_date(revised), _as_date(actual)
        if planned_date and revised_date and revised_date < planned_date:
            add("shipment_date_order", "shipments", row, "revisedArrival must not precede plannedArrival")
        if planned_date and actual_date and actual_date < planned_date:
            add("shipment_date_order", "shipments", row, "actualArrival must not precede plannedArrival")
        shipment_id = row.get("shipmentId")
        dispatched_at = latest_dispatch_by_shipment.get(shipment_id) if isinstance(shipment_id, str) else None
        if actual_date and dispatched_at and actual_date < dispatched_at.date():
            add("shipment_arrival_before_dispatch", "shipments", row, "actualArrival must not precede shipment dispatch evidence")

    for row in rows.get("productMaterials", []):
        end = row.get("effectiveTo")
        effective_start, effective_end = _as_date(row.get("effectiveFrom")), _as_date(end)
        if effective_start and effective_end and effective_end < effective_start:
            add("product_material_date_order", "productMaterials", row, "effectiveTo must not precede effectiveFrom")
    product_material_rows = rows.get("productMaterials", [])
    for index, left in enumerate(product_material_rows):
        left_end = _as_date(left.get("effectiveTo"))
        for right in product_material_rows[index + 1 :]:
            if (left.get("productId"), left.get("materialId")) != (right.get("productId"), right.get("materialId")):
                continue
            right_end = _as_date(right.get("effectiveTo"))
            left_start, right_start = _as_date(left.get("effectiveFrom")), _as_date(right.get("effectiveFrom"))
            if not left_start or not right_start:
                continue
            left_overlaps = right_end is None or left_start <= right_end
            right_overlaps = left_end is None or right_start <= left_end
            if left_overlaps and right_overlaps:
                add("product_material_period_overlap", "productMaterials", right, "effective periods overlap for the same product/material")

    return issues


def validate_dataset(
    fixtures: dict[str, dict[str, list[dict[str, Any]]]], schema_dir: Path
) -> ValidationReport:
    issues: list[ValidationIssue] = []
    schemas: dict[str, dict[str, Any]] = {}
    for path in schema_dir.glob("*.schema.json"):
        schema = _strict_json_loads(path.read_text(encoding="utf-8"))
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:  # schema error types vary by jsonschema release
            issues.append(ValidationIssue("invalid_schema", str(path), str(error)))
        schemas[path.name.removesuffix(".schema.json")] = schema

    identities = _identities(fixtures)
    known_ids = set().union(*identities.values()) if identities else set()
    id_locations: dict[Any, str] = {}
    unique_key_locations: dict[tuple[str, tuple[Any, ...]], str] = {}
    for filename, contents in fixtures.items():
        if filename != "manifest.json" and contents.get("dataMode") != "synthetic":
            issues.append(ValidationIssue("data_mode", filename, "fixture root must be synthetic"))
        for collection, rows in contents.items():
            if not isinstance(rows, list):
                continue
            schema_key = SCHEMA_BY_COLLECTION.get(collection)
            schema = None
            if schema_key:
                schema = _schema_for(schema_key, schemas)
                if schema is None:
                    issues.append(ValidationIssue("missing_schema", f"{filename}:{collection}", schema_key))
                else:
                    for index, row in enumerate(rows):
                        issues.extend(validate_record(row, schema, f"{filename}:{collection}[{index}]"))

            identity_key = IDENTITY_BY_COLLECTION.get(collection)
            for index, row in enumerate(rows):
                location = f"{filename}:{collection}[{index}]"
                if schema is None:
                    issues.extend(_non_finite_numeric_issues(row, location))
                if not isinstance(row, dict):
                    # The schema validator above reports the record-shape error;
                    # don't let cross-file checks crash while inspecting it.
                    continue
                if identity_key:
                    identifier = row.get(identity_key)
                    if identifier is None:
                        issues.append(ValidationIssue("missing_identifier", location, identity_key))
                    elif not isinstance(identifier, (str, int, float, bool)):
                        issues.append(ValidationIssue("invalid_identifier", location, f"{identity_key} must be a scalar identifier"))
                    elif identifier in id_locations:
                        issues.append(ValidationIssue("duplicate_identifier", location, f"{identifier} also at {id_locations[identifier]}"))
                    else:
                        id_locations[identifier] = location
                unique_fields = UNIQUE_KEY_FIELDS_BY_COLLECTION.get(collection)
                if unique_fields:
                    unique_values = tuple(row.get(field) for field in unique_fields)
                    if all(isinstance(value, (str, int, float, bool)) for value in unique_values):
                        unique_key = (collection, unique_values)
                        if unique_key in unique_key_locations:
                            issues.append(ValidationIssue(
                                "duplicate_unique_key", location,
                                f"{unique_fields} duplicates record at {unique_key_locations[unique_key]}",
                            ))
                        else:
                            unique_key_locations[unique_key] = location

                composite_key = COMPOSITE_IDENTITY_BY_COLLECTION.get(collection)
                if composite_key:
                    key_value = tuple(row.get(key_name) for key_name in composite_key)
                    if any(value is None for value in key_value):
                        issues.append(ValidationIssue("missing_identifier", location, ", ".join(composite_key)))
                    elif any(not isinstance(value, (str, int, float, bool)) for value in key_value):
                        issues.append(ValidationIssue("invalid_identifier", location, f"{composite_key} must contain scalar identifiers"))
                    elif key_value in id_locations:
                        issues.append(ValidationIssue("duplicate_identifier", location, f"{key_value} also at {id_locations[key_value]}"))
                    else:
                        id_locations[key_value] = location

                for field, target_collection in REFERENCE_BY_FIELD.items():
                    reference = row.get(field)
                    if reference is None:
                        continue
                    targets = identities.get(target_collection, set()) if target_collection else known_ids
                    if not isinstance(reference, str) or reference not in targets:
                        issues.append(ValidationIssue("broken_reference", f"{location}.{field}", f"{reference} not found in {target_collection}"))

                for field, target_collection in ARRAY_REFERENCE_FIELDS.items():
                    references = row.get(field, [])
                    if references is None:
                        continue
                    if target_collection is None:
                        allowed = known_ids
                    elif isinstance(target_collection, tuple):
                        allowed = set().union(*(identities.get(name, set()) for name in target_collection))
                    else:
                        allowed = identities.get(target_collection, set())
                    for reference in references:
                        if not isinstance(reference, str) or reference not in allowed:
                            issues.append(ValidationIssue("broken_reference", f"{location}.{field}", f"{reference} is not a known reference"))

                if collection in {"routes", "shipments"}:
                    known_locations = (
                        identities.get("ports", set())
                        | identities.get("facilities", set())
                        | identities.get("warehouses", set())
                        | identities.get("suppliers", set())
                    )
                    for field in ("originRef", "destinationRef"):
                        value = row.get(field)
                        if value is not None and (not isinstance(value, str) or value not in known_locations):
                            issues.append(ValidationIssue("broken_reference", f"{location}.{field}", f"{row[field]} is not a known location"))

    all_collections = sorted(
        {collection for contents in fixtures.values() for collection, rows in contents.items() if isinstance(rows, list)}
    )
    unmapped = [collection for collection in all_collections if collection not in SCHEMA_BY_COLLECTION]
    issues.extend(_business_invariant_issues(fixtures))
    validated = sum(
        len(rows)
        for contents in fixtures.values()
        for collection, rows in contents.items()
        if isinstance(rows, list) and collection in SCHEMA_BY_COLLECTION
    )
    return ValidationReport(issues, unmapped, validated)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-root", type=Path, default=DEFAULT_DATA_ROOT)
    args = parser.parse_args()
    try:
        fixtures = load_fixtures(args.data_root / "synthetic")
        report = validate_dataset(fixtures, args.data_root / "schemas")
    except (OSError, ValueError) as error:
        print(f"input_error: {error}")
        return 2
    for issue in report.issues:
        print(f"{issue.code}: {issue.location}: {issue.message}")
    print(f"schema-validated records: {report.validated_records}")
    print(f"unmapped collections (missing record schema): {len(report.unmapped_collections)}")
    for collection in report.unmapped_collections:
        print(f"missing schema mapping: {collection}")
    return 0 if not report.issues and not report.unmapped_collections else 1


if __name__ == "__main__":
    raise SystemExit(main())
