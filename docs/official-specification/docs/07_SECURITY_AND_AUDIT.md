# Security, Governance and Audit

**Document version:** 1.0
**Project stage:** Phase 4 — AI Agent Design, Governance and Workflows
**Status:** Security requirements and proposed controls; implementation, providers, retention, and compliance certification are not verified.
**Related documents:** [System architecture](04_SYSTEM_ARCHITECTURE.md) · [Roles and access](USER_ROLES_AND_ACCESS.md) · [Agent design](05_AGENT_DESIGN.md) · [Workflows and approvals](06_WORKFLOWS_AND_APPROVALS.md) · [Tool specifications](AGENT_TOOL_SPECIFICATIONS.md)

## 1. Security objectives and status

Protect synthetic and future operational data; ensure only an authenticated, authorized human can make decisions within their role; prevent agents/models from bypassing approval; make material actions traceable; and fail safely when identity, source, workflow, or adapter state cannot be verified.

These are design requirements, not claims that authentication, authorization, encryption, immutable audit, a compliance certification, or a specific retention schedule has been implemented. SAP HANA Cloud is the planned persistence baseline, subject to service provisioning and later verification.

## 2. Trust boundaries and threat considerations

| Boundary / threat | Required control direction |
|---|---|
| Browser/client to CAP | Authenticate every request; enforce server-side role, record, field, and action authorization. UI hiding is not security. |
| CAP to data/services | Use backend-only credentials and least-privilege service bindings; validate adapter identity, response shape, freshness, and failure. Never expose secrets to browser or prompts. |
| Model/orchestrator/agent output | Treat output as untrusted data. Schema-validate; constrain to task scope/tools; escape/render safely; never interpret natural language as authorization or executable code. |
| Prompt injection in supplier documents, email, voice transcripts, or records | Treat all retrieved content as data, not instructions. Ignore embedded requests to reveal secrets, change policy, call tools, bypass review, or disclose other records. Cite provenance and flag suspicious content. |
| Tool misuse or confused deputy | CAP independently authorizes actor, resource, action, purpose, and proposal version on every call. Agents do not hold general database, workflow-approval, external-send, payment, or master-data credentials. |
| Duplicate/replayed requests and concurrent decisions | Use request/correlation/idempotency references; version checks and state transitions; reject stale approval and duplicate side effects. Exact mechanisms remain technical-design work. |
| Sensitive data leakage in prompts/logs | Minimize and redact task context; avoid unnecessary customer/contact, commercial, quality, and personal data; do not log credentials, full secrets, or unrelated prompt contents. |
| Unsafe autonomous action | Keep all eight protected categories behind server-side approval enforcement. Model output and specialist recommendations never approve or execute. |
| Fraud/suspicious-activity false accusation | Use neutral “flagged for verification” wording, evidence references, human review, and no autonomous guilt determination. |
| Availability or partial failure | Explicitly report agent, source, workflow, and adapter errors; retain human operating control; do not use success-shaped fabricated data or claim a kill switch succeeded unless confirmed. |

Threat scenarios should be included in later security testing: malicious instructions in source documents; model-generated unsupported commitments; unauthorized cross-role record access; proposal mutation after approval; duplicate send/order due to retry; stale or forged integration data; transcript misattribution; audit alteration; and unavailable emergency controls.

## 3. Identity, access, and authorization requirements

- Authenticate individual human users through a verified enterprise identity configuration; provider and session policy remain undecided.
- Enforce least privilege on each request and tool call using the established role names. Record/field-level access boundaries remain pending; deny access where scope is unknown.
- Distinguish user identity, service identity, agent role, and initiating actor. Agents do not inherit broader privileges from the orchestrator or a user.
- Apply authorization at CAP and again before each protected side effect, independent of UI state and workflow status displayed to the user.
- Only the Supply Chain Head is the final approver for the eight protected categories. Do not infer other approval rights or substitute approvers.
- Individual agent pause/stop, global kill switch, manual override, and resumption are human-only in the proposal. Exact authorized roles, confirmation, and resumption checks are unresolved; fail closed until specified.
- No agent may approve, self-authorize, clear a hold, change access, alter approval history, or use an emergency control.

## 4. Data handling and AI-specific safeguards

1. **Minimize context:** Provide only fields and references required for a task; do not send secrets, credentials, broad exports, or unrelated customer data to a model.
2. **Preserve provenance:** Attach source, observed time, freshness, verification state, and synthetic/simulated/estimated label to material facts and derived results.
3. **Constrain output:** Require structured task results; validate types, allowed identifiers, lengths, and references. Reject malformed or out-of-scope output.
4. **Separate instructions from records:** Retrieved text, attachments, voice transcripts, and email bodies are untrusted evidence. They cannot change system policy or tool permission.
5. **No chain-of-thought requirement:** Provide concise rationale, evidence, assumptions, uncertainty, and tool summaries; do not expose private chain-of-thought.
6. **No fabricated facts or commitments:** Missing data stays missing. No invented ETAs, supplier eligibility, prices, capacity, customer commitments, guarantees, or actual patient outcomes.
7. **Human communication controls:** Identify AI during calls, respect consent and applicable requirements, keep verbal information unverified until corroborated, and require human review/approval before email send.
8. **Synthetic demonstration data:** Label demonstration records. The 30-day delay, 20-day coverage, and 10-day potential gap are scenario inputs; backup supplier’s reported 10 production days are unconfirmed pending checks.

## 5. Tool and side-effect security

- All tools are backend-mediated and purpose-limited. Each call includes the initiating human/service identity, task/incident references, action, authorized scope, and correlation.
- Read-only retrieval uses scoped filters and records freshness/source. Do not let a caller provide an arbitrary database query, URL, recipient, or supplier identity without CAP validation.
- Proposal tools create drafts only. They do not update critical operational records.
- `create_approval_request` may submit a proposal but cannot approve it. Approval decisions originate from an authenticated human action and a verified workflow.
- Side-effect tools are CAP-controlled and inaccessible as direct agent privileges. CAP checks current human approval and exact approved version immediately before dispatch.
- Email/voice tools require verified provider, recipient/contact, consent/authorization, content, and applicable approval. No provider is selected or live.
- Payment, supplier-master change, inventory transfer, production change, order reallocation, and route/carrier change cannot be performed by a model or direct agent call.
- Emergency controls and audit persistence are privileged human/system operations, not general agent tools.
- Record a denied or malformed action attempt when applicable without exposing sensitive data in the error.

## 6. Audit event requirements

Material agent and human activity should be auditable, searchable by authorized reviewers, and protected against ordinary user alteration/deletion. The final storage and immutability mechanism require later design and verification.

### Minimum event fields (proposed)

| Field | Purpose |
|---|---|
| `event_id`, `event_type`, `schema_version` | Unique event identity and stable event classification. |
| `occurred_at`, `recorded_at` | Event time and persistence time; clock source/precision to be designed. |
| `actor_type`, `actor_id`, `role` | Human, agent, service, workflow, or adapter identity; use the initiating human context where relevant. |
| `task_id`, `incident_id`, `correlation_id` | Link event to task, incident, and related workflow/tool events. |
| `action`, `resource_type`, `resource_ref` | What operation and record were involved, using authorized references. |
| `proposal_id`, `proposal_version`, `approval_ref` | Bind decision and execution to the exact reviewed version. |
| `source_refs`, `verification_state`, `data_freshness` | Provenance and state of evidence used. |
| `input_summary`, `output_summary`, `assumptions` | Minimized, redacted decision context, not secrets or unnecessary raw prompt text. |
| `decision`, `decision_reason`, `decision_actor` | Approval/rejection/modification/escalation and human rationale where policy requires. |
| `result_status`, `error_code`, `external_reference` | Actual outcome, explicit failure, and safe provider reference if available. |
| `idempotency_ref`, `retry_of` | Duplicate and retry reconciliation. |
| `sensitivity_class`, `redaction_state` | Apply access controls and demonstrate minimization. |

Record at least task creation/delegation, agent/tool start and result, source failures, recommendation/proposal version, approval/rejection/changes, execution dispatch/acknowledgement/failure/unknown result, verification, communication draft/approval/send result, suspicious-activity flag and disposition, pause/stop/kill/override/resume request and result, and incident closure. Do not log secrets, authentication tokens, full payment credentials, or unrestricted conversation transcripts by default.

## 7. Audit access, retention, and incident response

- Role-scoped access to audit records; Compliance / Auditor access remains subject to confirmed field-level policy.
- Ordinary users and agents cannot edit or delete audit events. Corrections append a superseding/correction event with actor, reason, and reference.
- Search/export, retention duration, archival, legal hold, encryption, backup, tamper evidence, and audit administrator separation are pending security and legal decisions.
- Record security-relevant denial, configuration, and emergency events with minimal sensitive content.
- On suspected compromise or unsafe agent behavior, preserve relevant audit/evidence references, restrict affected agent/tool scope, and route to an authorized human. Do not claim incident response is automated.
- Testing must use synthetic data and non-production communication/payment services; no real calls, emails, patient data, or supplier operations.

## 8. Required security verification before implementation claims

Later implementation must test role-based and record-level denial, all eight approval gates server-side, stale/changed proposal rejection, duplicate/replay behavior, malicious document/voice prompt injection, model/tool schema validation, sensitive-data minimization, explicit failure and unknown side-effect outcomes, audit access/immutability controls, and emergency-control failure reporting. A passing design document is not a security certification or live integration.

## 9. Pending decisions

Authentication and session provider; field/record access matrix; model provider, region, retention and minimization rules; encryption and key management; audit storage/immutability and retention; security monitoring and incident response ownership; transaction-hold authority; emergency-control roles and resumption checks; communication consent, recording, and retention; and applicable legal/regulatory review.
