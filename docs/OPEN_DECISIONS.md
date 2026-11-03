# Open decisions

This is the implementation-facing index for the official decision register. The [official source](official-specification/docs/11_DECISIONS_AND_OPEN_QUESTIONS.md) is preserved unchanged; statuses below mirror [`DECISIONS_REQUIRED.md`](DECISIONS_REQUIRED.md). Proposed options are not approvals.

| ID | Topic | Status | Dependent work that remains gated |
|---|---|---|---|
| D-01 | Calendar-day versus production-day calculations | Pending | Coverage/gap formulas, production-plan day fields, impact calculations |
| D-02 | Specialist-agent roster | Proposed, not approved | Agent responsibilities and ownership |
| D-03 | AI provider/model/deployment | Pending | AI Core/model adapter and evaluated agent execution |
| D-04 | Agent communication/orchestration topology | Pending | CAP-to-agent and CAP-to-Python service protocol |
| D-05 | Voice provider | Pending | Live voice calls |
| D-06 | Email provider | Pending | Email dispatch |
| D-07 | SAP service availability/integration set | Pending verification | HANA/SAP service connectivity and external adapters |
| D-08 | Customer allocation policy | Pending | Allocation/re-prioritization rules |
| D-09 | Backup-supplier qualification criteria | Pending operational specification | Supplier eligibility and purchasing recommendation gates |
| D-10 | Retention, audit integrity, privacy | Pending | Retention/deletion controls, audit tamper evidence, sensitive data scope |
| D-11 | Identity and role authorization | Pending | Authenticated business operations and role-scoped access |
| D-12 | API contracts and lifecycle | Proposed, not frozen | Final request/response/error/version/state contracts; full fixture schema for `productionPlans` |
| D-13 | HANA schema, tenancy and migrations | Proposed | Production persistence, isolation guarantees, migration/rollback strategy |
| D-14 | Demo metric and impact methodology | Pending | Validated impact metrics and formula claims; `calculationAssumptions` entity semantics |
| D-15 | Emergency stop/override/resume authority | Pending | Operational kill switch and manual override workflow |
| D-16 | Non-major email/voice approval and consent | Pending | Non-major external communications |
| D-17 | BTP deployment configuration/operating model | Pending | Deployment and operations |
| D-18 | Business/commercial model | Pending | Commercial scope |
| D-19 | Approval lifecycle | Pending | Expiry, rejection, modification and revocation behavior |

## Current IMP-02 input gaps

- `calculationAssumptions` has fixture records but no authoritative entity definition. Needed: purpose, fields, units, formula semantics, references and requiredness.
- The documented `ProductionPlan` does not define fixture fields `plannedProductionDays` and `apiConsumptionKgPerProductionDay`. Needed: typed field definitions, time/unit basis and contract version.
- No approved baseline-selection fixture/manifest exists. Needed: included/excluded record IDs, state version/checksum and reset expectations for a baseline with no post-disruption outcomes.
- D-12 and D-13 remain unresolved, so the draft local CAP model does not claim final API semantics, tenant isolation, migration safety, or HANA deployment readiness.

No D-01–D-19 status was changed by implementation work. Resolve each item with its named owner and record rationale and acceptance evidence in the official register before enabling dependent features.
