# Testing Strategy

**Version:** 1.0<br>
**Project stage:** Phase 6 — Demo, Testing, Deployment and Project Handover<br>
**Status:** Proposed test plan. No application test suite or runtime exists in this documentation-only repository; no application test is claimed passed.<br>
**Related documents:** [Functional requirements](03_FUNCTIONAL_REQUIREMENTS.md) · [User journeys](USER_JOURNEYS.md) · [Data model](08_DATA_MODEL_AND_DEMO_DATA.md) · [API contracts](API_CONTRACTS.md) · [Security and audit](07_SECURITY_AND_AUDIT.md) · [Demo runbook](10_DEMO_RUNBOOK.md)

## 1. Purpose and principles

This plan converts Phase 1–5 requirements into a future verification approach for SAPUI5, SAP CAP on Node.js, SAP HANA Cloud, the proposed agent/orchestrator boundary, workflows, and clearly isolated adapters. It is a test strategy, not evidence of implementation or execution.

- Use only synthetic records and non-production test identities/services. Never use real patient data, contact details, supplier systems, payments, calls, or emails.
- Mark outcomes `synthetic`, `simulated`, `verified`, `stale`, or `unavailable` accurately.
- Treat all model/tool/provider responses as untrusted input. Validate shape, references, scope, and business constraints.
- Test all protected-action gates at the CAP/backend boundary, not only in the UI.
- Separate recommendation, approval, dispatch, external acknowledgement, and verified outcome.
- Do not retry side effects until idempotency and reconciliation behaviour are proved.
- Record test execution evidence, software/build version, data/schema version, environment, and result. A test plan or fixture does not equal a passing test.

## 2. Test levels and scope

| Level | Scope and methods | Required evidence |
|---|---|---|
| Unit | Deterministic calculations, units, date rules, validators, eligibility rules, state transitions, idempotency-key behavior. | Reproducible test report, input/output fixtures, boundary cases. |
| Backend/API | CAP input validation, authentication/authorization, role/record scope, API schemas, error envelopes, concurrency/version checks, audit transaction handling. | Request/response assertions, denied-action evidence, audit references. |
| Database | CDS-to-HANA mappings, FK/unique constraints, migrations, temporal snapshots, transaction boundaries, backup/restore and seed guards. | Disposable test schema, migration/rollback logs, reconciliation report. |
| Agent behaviour | Each proposed role follows its scope, labels evidence, declines unsupported claims, ignores prompt injection, and cannot approve/execute. | Versioned prompt/model/test data, structured result assertions, reviewer notes. |
| Orchestration | Task scope, least relevant delegation, independent parallel tasks, dependency ordering, disagreement preservation, cancellation/timeout/partial result. | Task trace with agent/tool IDs and evidence refs; no unrestricted data. |
| Workflow | Submission, approve/reject/request-changes/escalate/revoke, version binding, expiry policy, execution separation, duplicate callbacks. | State-transition trace and decision audit. |
| Approval/permission | All eight protected categories, role spoofing, direct endpoint/tool bypass, stale version, insufficient evidence, emergency-role policy. | Negative and positive authorization matrix; no unauthorized side effect. |
| Integration | HANA, AI, SAP Build Process Automation, Work Zone, supplier/logistics, voice/email adapters when selected. Contract tests first; sandbox integration only after approval. | Provider/version, configuration reference (no secret), connection/failure evidence, status classification. |
| UI | SAPUI5 module navigation, roles, accessibility, freshness/synthetic/estimate labels, errors, approval controls, keyboard and responsive behavior. | Automated UI report plus human usability/accessibility review. |
| Security | Authentication/session, authorization, data isolation, injection, prompt injection, secret/log leakage, replay, CSRF and audit access. | Security test report and remediation record; no certification implied. |
| Performance | Dashboard/query/task latency, concurrency, pagination, bounded agent work, HANA query plans, provider quotas. | Workload assumptions, measured results, limits and tuning; do not invent SLAs. |
| End-to-end/demo | Runbook Steps 1–10 using a resettable isolated synthetic dataset; human approval and simulated communication/receipt states. | Versioned demo checklist and capture from the actual tested build. |
| Failure/recovery | AI/database/workflow/provider/network outages, malformed data, audit write failure, unknown side-effect outcome, kill-switch failure and restore. | Injected-failure result, recovery actions, confirmed safe state. |

### Suggested environments

1. Local deterministic/unit environment with no external credentials.
2. Isolated integration environment with disposable synthetic data and explicitly test-only services.
3. Demo environment with production side effects disabled by default.
4. Production only after separate security, privacy, operational, and release approvals.

The present repository has no application package manifest, CAP project, deployed HANA model, UI implementation, or automated test runner. Environment setup and test-framework choices remain future implementation work.

## 3. Scenario test cases

Priority: **P0** blocks a safe core demo or protected action; **P1** required for reliable planned capabilities; **P2** future hardening. Every case is **Not run** until a runnable implementation and evidence exist.

| ID | Scenario, preconditions, and steps | Expected result / pass-fail criteria | Priority |
|---|---|---|---|
| T-01 | Normal supply-chain baseline. Seed only the synthetic dataset; open overview, inventory, shipments, production, suppliers, and orders. | The baseline records resolve with units, source mode, and timestamps; unavailable data stays unavailable. Pass only if no record is represented as live. | P0 |
| T-02 | 30-day shipment delay. Load original/revised ETA fixture and inspect incident propagation. | 2026-09-01 to 2026-10-01 is shown as a 30-calendar-day simulated delay, with source and uncertainty. No live alert is claimed. | P0 |
| T-03 | Coverage and gap calculation. Use 1,000 kg, 50 kg/production day, 20 coverage days, and 30 delay days. | Deterministic result is 20 coverage and the documented 10-day potential comparison; units and basis are exposed, not called a confirmed shortage. | P0 |
| T-04 | Backup eligibility failure. Omit or mark failed one of six required qualification checks; attempt purchase proposal/dispatch. | Supplier remains ineligible for the dependent proposal; missing/failed check is named; protected dispatch is blocked and audited. | P0 |
| T-05 | Backup eligibility success. Provide six synthetic evidence-backed checks and a current human approval in an isolated test. | A proposal may proceed only after all checks; fixture success is labelled synthetic; no real supplier qualification or purchase is implied. | P0 |
| T-06 | Conflicting specialist recommendations. Provide different supported route/stock assessments and invoke orchestration. | Results and provenance remain separate; conflict is surfaced for human review; orchestrator does not silently choose or execute. | P1 |
| T-07 | Missing or stale data. Remove inventory/ETA input or age it beyond configured policy. | Dependent metric is unavailable/qualified, source age shown, and protected action blocked if evidence is required. No fabricated fallback. | P0 |
| T-08 | Hallucinated/unsupported recommendation. Return a model result with an invented ETA, price, certification, or commitment. | Output validation flags unsupported claims; no source fact is promoted; no proposal/communication with the unsupported claim is dispatchable. | P0 |
| T-09 | Human rejects approval. Submit a protected current-version proposal and reject as Supply Chain Head. | Immutable rejection and audit state recorded; no execution occurs; retries cannot turn rejection into approval. | P0 |
| T-10 | Human modifies approval proposal. Change quantity, recipient, route, schedule, or content after review. | Modification creates a new proposal/content version; previous approval no longer authorizes it; new review required before dispatch. | P0 |
| T-11 | Expired approval. Configure the approved expiry policy in a test environment, let the approval expire, request execution. | Execution is blocked with an explicit stale/expired state and audit event. Do not choose an expiry duration until D-19 is decided. | P0 |
| T-12 | Duplicate execution request. Repeat identical and changed-body requests using the same idempotency key. | Matching retry returns original state without repeating side effect; changed body is rejected; unknown outcome requires reconciliation. | P0 |
| T-13 | Unauthorized action attempt. Use a non-Supply Chain Head role, spoofed client role, direct API, and agent tool for a protected action. | Server denies all attempts; no side effect occurs; denial is recorded safely without data leakage. | P0 |
| T-14 | Agent failure. Cause timeout, malformed result, or tool denial for one specialist. | Execution is failed/partial with safe error and preserved completed evidence; dependent protected action is blocked; human escalation is visible. | P1 |
| T-15 | AI service outage. Disable or timeout the AI adapter. | No success-shaped answer is returned; the task is unavailable/failed or uses a separately enabled, visibly simulated path; no side effect follows. | P0 |
| T-16 | Database outage. Make persistence unavailable during a read and a protected write/audit commit. | Read freshness/failure is explicit; write is not reported successful; protected action fails closed if state/audit cannot be persisted. | P0 |
| T-17 | Voice/email provider outage. Fail the provider before dispatch and after an ambiguous dispatch. | No consent/provider means no call; email remains unsent until approval. Unknown send/call outcome is reconciled, never blindly retried. | P1 |
| T-18 | Suspicious invoice or bank-account change. Feed a synthetic duplicate invoice/bank-change pattern and insufficient evidence. | Neutral “flagged for verification” alert with evidence and state; no accusation; any hold requires separately authorized workflow. | P1 |
| T-19 | Emergency kill switch. In a dedicated isolated environment, invoke authorized global halt; also simulate failure and unauthorized invocation. | Confirmed/failed/unknown state is truthful, human actor and outcome audited; unauthorized/failed halt never displays as successful; resume remains blocked until policy checks pass. | P0 |
| T-20 | Incident closure verification. Present delayed shipment arrival but missing production/order evidence, then complete synthetic proof and request closure. | Shipment arrival alone cannot close; missing evidence keeps incident open; closure requires authorized human decision, sources, residual risks, and audit. | P0 |

### Additional focused cases

- Validate all 26 Draft 2020-12 schema definitions and each mapped fixture record; run cross-file foreign-key, quantity, version, date, and data-mode checks after any fixture change.
- Verify all eight protected categories at every API/tool boundary, including supplier-master change and financial commitment.
- Verify allocation remains `proposed` and `applied: false` unless a future project-owner decision explicitly changes it.
- Test ordering/replay of approval callbacks, concurrent proposal edits, audit write failure, data isolation, schema migrations, and seed refusal outside demo mode.
- Test keyboard-only interaction, accessible status not conveyed by colour alone, clear loading/empty/stale/failed states, and role-scoped navigation.

## 4. Hackathon demonstration acceptance

The complete demonstration may be called **verified** only when a specific runnable build passes all of the following in a recorded isolated environment:

1. Presenter completes all ten steps in [the runbook](10_DEMO_RUNBOOK.md) using the stated build and fixture/schema version.
2. All organizations, suppliers, customers, orders, quantities, decisions, and communications are synthetic or test-only and visibly labelled.
3. 30/20/10 arithmetic is deterministic and units/day-basis are disclosed; no actual shortage or patient outcome is asserted.
4. The six supplier checks remain independent and failed/missing evidence blocks purchase eligibility.
5. Each protected category is blocked without a current Supply Chain Head approval; changes invalidate old approval.
6. Voice/email and execution outcomes are simulated unless test providers are explicitly verified; no real communication or business transaction is produced.
7. Agent/model/source failures, stale inputs, duplicate requests, and unknown outcomes show truthful states and safe fallbacks.
8. Audit evidence connects proposal, human decision, execution/simulation, verification, and closure without exposing secrets or unnecessary data.
9. Incident closure depends on verified recovery evidence and human decision, not shipment arrival alone.
10. Presenter can identify which components are implemented, tested, simulated, and pending verification without claiming unverified SAP integration.

No pass is recorded by this document. Test results, test data, environment, and reviewer sign-off must be added after execution by the implementation team.
