# Proposed Agent and Approval Workflow

**Status:** Conceptual Phase 4 proposal. Agents, workflow engine, APIs, integrations, and execution are not implemented or verified.
**Related documents:** [Agent design](../05_AGENT_DESIGN.md) · [Workflows and approvals](../06_WORKFLOWS_AND_APPROVALS.md) · [Security and audit](../07_SECURITY_AND_AUDIT.md)

```mermaid
flowchart TD
    H[Authorized human or verified source signal] --> CAP[CAP authenticates, authorizes, scopes task]
    CAP --> ORCH[Central orchestrator creates bounded task]
    ORCH --> D[Disruption and Risk Analyst]
    ORCH --> S[Supplier and Compliance Analyst]
    ORCH --> I[Inventory and Manufacturing Planner]
    ORCH --> L[Logistics and Shipment Analyst]
    ORCH --> C[Customer Impact and Communications Planner]
    D --> TOOLS[Scoped read tools and deterministic CAP services]
    S --> TOOLS
    I --> TOOLS
    L --> TOOLS
    C --> TOOLS
    TOOLS --> E[Evidence, calculations, source status, failures]
    E --> ORCH
    ORCH --> R[Evidence-linked summary and versioned proposal]
    R --> VAL[CAP validates schema, scope, source status, and policy]
    VAL -->|incomplete or conflicting| HUMAN[Authorized human verifies or requests changes]
    HUMAN -->|new evidence / revised scope| CAP
    VAL -->|ready for decision| WF[Approval workflow adapter, if verified]
    WF --> SCH[Supply Chain Head reviews exact proposal version]
    SCH -->|reject / change / escalate| DEC[Record decision; no execution]
    SCH -->|approve current version| AUTH[CAP rechecks identity, role, version, constraints, approval]
    AUTH -->|check fails| BLOCK[Block action; report reason; audit]
    AUTH -->|check passes| EXEC[CAP-controlled authorized adapter]
    EXEC --> OUT[Execution result: success, failure, or unknown]
    OUT --> VERIFY[Human/source verifies operational outcome]
    VERIFY --> AUDIT[Audit decision, tool, result, evidence, and verification]
    DEC --> AUDIT
    BLOCK --> AUDIT
    AUDIT --> UI[Authorized operational review]
    ORCH -. failure, uncertainty, or risk .-> ESC[Escalate to authorized human]
    EXEC -. adapter failure or unknown outcome .-> ESC
```

The specialist roles and approval adapter are proposed. A recommendation, workflow submission, and approval are separate states. The Supply Chain Head is final approver for the eight protected action categories. Only CAP may dispatch an approved, current proposal after its precondition checks; agents do not approve or directly execute protected actions. An unknown adapter outcome must be reconciled before retry. Audit technology and integration status remain unverified.
