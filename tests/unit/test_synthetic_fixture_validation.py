from __future__ import annotations

import copy
from pathlib import Path

import pytest

from scripts.validate_synthetic_fixtures import (
    DEFAULT_DATA_ROOT,
    SCHEMA_BY_COLLECTION,
    _schema_for,
    _strict_json_loads,
    load_fixtures,
    main,
    validate_dataset,
    validate_record,
)

NEW_SCHEMA_COLLECTIONS = tuple(
    name for name, ref in SCHEMA_BY_COLLECTION.items() if ref.startswith("additional-fixture-entities#")
)


@pytest.fixture
def official_fixtures():
    return load_fixtures(DEFAULT_DATA_ROOT / "synthetic")


def test_schema_backed_records_validate_and_unmapped_types_are_reported(official_fixtures):
    report = validate_dataset(official_fixtures, DEFAULT_DATA_ROOT / "schemas")
    assert report.issues == []
    assert report.validated_records == 157  # Entity records plus the manifest.
    assert report.unmapped_collections
    assert not report.valid  # Full fixture acceptance fails closed without those schemas.


def test_invalid_record_is_rejected_by_its_official_schema():
    import json

    schema = json.loads((DEFAULT_DATA_ROOT / "schemas" / "product.schema.json").read_text(encoding="utf-8"))
    bad = {"productId": "BAD", "dataMode": "live"}
    issues = validate_record(bad, schema, "product")
    assert issues
    assert any("productId" in issue.message or "required" in issue.message for issue in issues)


def test_non_object_record_is_reported_without_crashing(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["products.json"]["products"].append(["not", "an", "object"])
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "schema" and "products[1]" in issue.location for issue in report.issues)


def test_broken_reference_is_reported(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["products.json"]["products"][0]["organizationId"] = "ORG-MISSING"
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "broken_reference" and "ORG-MISSING" in issue.message for issue in report.issues)


def test_duplicate_identifier_is_reported(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["products.json"]["products"].append(copy.deepcopy(mutated["products.json"]["products"][0]))
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "duplicate_identifier" for issue in report.issues)


def test_duplicate_composite_key_is_reported(official_fixtures):
    import copy

    mutated = copy.deepcopy(official_fixtures)
    source = mutated["organization.json"]["rolePermissions"][0]
    mutated["organization.json"]["rolePermissions"].append(copy.deepcopy(source))
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "duplicate_identifier" for issue in report.issues)


def test_fulfilment_total_cannot_exceed_order_line(official_fixtures):
    import copy

    mutated = copy.deepcopy(official_fixtures)
    mutated["customers-orders.json"]["orderFulfilments"][0]["quantity"] = 100001
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "fulfilment_exceeds_order_line" for issue in report.issues)


def test_delivery_unit_must_match_order_line(official_fixtures):
    import copy

    mutated = copy.deepcopy(official_fixtures)
    mutated["customers-orders.json"]["deliveries"][0]["unit"] = "kg"
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "unit_mismatch" and "deliveries" in issue.location for issue in report.issues)


def test_batch_expiry_and_consumption_limits_are_enforced(official_fixtures):
    import copy

    mutated = copy.deepcopy(official_fixtures)
    mutated["operations.json"]["inventoryBatches"][0]["expiresOn"] = "2026-05-01"
    mutated["operations.json"]["productionConsumptions"][0]["quantity"] = 1001
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(issue.code == "batch_expiry_order" for issue in report.issues)
    assert any(issue.code == "consumption_exceeds_inventory_batch" for issue in report.issues)


def test_all_fixture_collection_mappings_have_a_schema_file():
    schema_path = DEFAULT_DATA_ROOT / "schemas" / "additional-fixture-entities.schema.json"
    import json

    bundle = json.loads(schema_path.read_text(encoding="utf-8"))
    assert set(NEW_SCHEMA_COLLECTIONS) == set(bundle["$defs"])


@pytest.mark.parametrize("collection", NEW_SCHEMA_COLLECTIONS)
def test_every_new_schema_validates_all_records_for_its_collection(official_fixtures, collection):
    import json

    schema_dir = DEFAULT_DATA_ROOT / "schemas"
    schema_key = SCHEMA_BY_COLLECTION[collection]
    schema_path = schema_dir / (schema_key.split("#", 1)[0] + ".schema.json")
    loaded = json.loads(schema_path.read_text(encoding="utf-8"))
    schema = _schema_for(schema_key, {schema_path.stem.removesuffix(".schema"): loaded})
    rows = [
        row
        for contents in official_fixtures.values()
        for name, value in contents.items()
        if name == collection and isinstance(value, list)
        for row in value
    ]
    assert rows, collection
    assert all(not validate_record(row, schema, collection) for row in rows)


def test_assumption_refs_must_resolve_to_an_assumption_record(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["incidents-recovery.json"]["impactEstimates"][0]["assumptionRefs"][0] = "ASM-MISSING"
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "broken_reference" and "assumptionRefs" in issue.location and "ASM-MISSING" in issue.message
        for issue in report.issues
    )


def test_route_waypoints_must_resolve_to_typed_logistics_locations(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["operations.json"]["routes"][0]["waypoints"] = ["PROD-PARA-500"]
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "broken_reference" and "routes[0].waypoints" in issue.location
        for issue in report.issues
    )


def test_shipment_endpoints_must_resolve_to_typed_logistics_locations(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["operations.json"]["shipments"][0]["originRef"] = "PROD-PARA-500"
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "broken_reference" and "shipments[0].originRef" in issue.location
        for issue in report.issues
    )


def test_demand_assumption_aggregate_reconciles_customer_rows(official_fixtures):
    report = validate_dataset(official_fixtures, DEFAULT_DATA_ROOT / "schemas")
    assert not any(issue.code == "demand_aggregate_mismatch" for issue in report.issues)


def test_demand_assumption_aggregate_mismatch_is_rejected(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["customers-orders.json"]["demandAssumptions"][-1]["dailyDemand"] = 24999
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "demand_aggregate_mismatch"
        and "DEMAND-SYNTHETIC-001" in issue.location
        for issue in report.issues
    )


@pytest.mark.parametrize(
    ("filename", "collection", "identifier_field"),
    [
        ("incidents-recovery.json", "approvalRequests", "approvalRequestId"),
        ("operations.json", "inventoryBatches", "batchId"),
        ("organization.json", "permissions", "permissionId"),
        ("operations.json", "productionBatches", "productionBatchId"),
        ("incidents-recovery.json", "recoveryPlans", "recoveryPlanId"),
        ("organization.json", "roles", "roleId"),
    ],
)
def test_declared_cap_unique_constraints_are_validated(official_fixtures, filename, collection, identifier_field):
    mutated = copy.deepcopy(official_fixtures)
    records = mutated[filename][collection]
    duplicate = copy.deepcopy(records[0])
    duplicate[identifier_field] = f"{duplicate[identifier_field]}-UNIQUE-TEST"
    records.append(duplicate)
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "duplicate_unique_key" and collection in issue.location
        for issue in report.issues
    )


def test_actual_shipment_arrival_cannot_precede_dispatch_evidence(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["operations.json"]["shipmentEvents"].append({
        "shipmentEventId": "SHE-MAIN-DISPATCH-TEST",
        "shipmentId": "SHIP-MAIN-001",
        "eventType": "departed",
        "eventAt": "2026-10-02T08:00:00Z",
        "description": "Synthetic dispatch event for validation regression.",
        "sourceRef": "PO-MAIN-001",
        "sourceStatus": "synthetic",
        "dataMode": "synthetic",
    })
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "shipment_arrival_before_dispatch"
        and "SHIP-MAIN-001" in issue.location
        for issue in report.issues
    )


def test_audit_source_refs_must_resolve_to_fixture_records(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["agent-activity.json"]["auditEvents"][0]["sourceRefs"] = ["EVD-MISSING"]
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "broken_reference"
        and "auditEvents[0].sourceRefs" in issue.location
        and "EVD-MISSING" in issue.message
        for issue in report.issues
    )


@pytest.mark.parametrize(
    ("email_draft_id", "voice_call_id"),
    [(None, None), ("EMAIL-DRAFT-001", "CALL-PROC-001")],
)
def test_communication_delivery_requires_exactly_one_parent(official_fixtures, email_draft_id, voice_call_id):
    mutated = copy.deepcopy(official_fixtures)
    delivery = mutated["agent-activity.json"]["communicationDeliveries"][0]
    delivery["emailDraftId"] = email_draft_id
    delivery["voiceCallId"] = voice_call_id
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "communication_parent_count"
        and "SIM-EMAIL-001" in issue.location
        for issue in report.issues
    )


def test_non_finite_values_in_schema_backed_records_are_rejected(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["operations.json"]["inventoryPositions"][0]["quantity"] = float("nan")
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "non_finite_number"
        and "inventoryPositions[0].quantity" in issue.location
        for issue in report.issues
    )


def test_non_finite_values_in_unmapped_records_are_rejected(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["products.json"]["calculationAssumptions"][0]["value"] = float("inf")
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "non_finite_number"
        and "calculationAssumptions[0].value" in issue.location
        for issue in report.issues
    )


def test_unmapped_production_plan_still_checks_specified_nonnegative_quantity(official_fixtures):
    mutated = copy.deepcopy(official_fixtures)
    mutated["operations.json"]["productionPlans"][0]["plannedQuantity"] = -1
    report = validate_dataset(mutated, DEFAULT_DATA_ROOT / "schemas")
    assert any(
        issue.code == "negative_quantity"
        and "productionPlans:PLAN-PARA-OCT-001" in issue.location
        for issue in report.issues
    )


def test_strict_json_loader_rejects_duplicate_keys_and_nonstandard_numbers():
    with pytest.raises(ValueError, match="Duplicate JSON object key: item"):
        _strict_json_loads('{"item": 1, "item": 2}')
    with pytest.raises(ValueError, match="Non-standard JSON numeric constant: NaN"):
        _strict_json_loads('{"value": NaN}')


def test_validator_cli_reports_duplicate_keys_as_input_error(tmp_path, monkeypatch, capsys):
    import json
    import sys

    data_root = tmp_path / "data"
    synthetic_dir = data_root / "synthetic"
    schema_dir = data_root / "schemas"
    synthetic_dir.mkdir(parents=True)
    schema_dir.mkdir()
    (synthetic_dir / "manifest.json").write_text(
        json.dumps({"fixtureFiles": ["products.json"]}), encoding="utf-8"
    )
    (synthetic_dir / "products.json").write_text(
        '{"dataMode":"synthetic","products":[{"productId":"A","productId":"B"}]}',
        encoding="utf-8",
    )
    monkeypatch.setattr(sys, "argv", ["validate_synthetic_fixtures", "--data-root", str(data_root)])
    assert main() == 2
    assert "input_error: Duplicate JSON object key: productId" in capsys.readouterr().out
