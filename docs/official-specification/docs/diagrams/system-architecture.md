# System Architecture Diagram

**Status:** Conceptual target architecture; service connectivity and implementation are unverified.
**Related documents:** [System architecture](../04_SYSTEM_ARCHITECTURE.md) · [Technology stack](../TECH_STACK.md) · [Integration architecture](../INTEGRATION_ARCHITECTURE.md)

```mermaid
flowchart LR
    U[Authorized user]
    WZ[SAP Build Work Zone<br/>planned enterprise access]
    UI[SAPUI5 frontend]
    CAP[SAP CAP backend<br/>Node.js<br/>validation and authorization]
    ORCH[Central AI orchestrator]
    AGENTS[Specialized agents<br/>count and names pending]
    TOOLS[Controlled backend tools<br/>domain services and adapters]
    AI[SAP AI Core / Generative AI Hub<br/>planned; connectivity unverified]
    WFAD[Workflow adapter]
    BPA[SAP Build Process Automation<br/>if available and verified]
    CAPWF[CAP-based approval fallback<br/>proposed; policy-equivalent only]
    APPROVER[Supply Chain Head<br/>final approval for protected actions]
    VOICE[Voice adapter<br/>provider pending]
    EMAIL[Email adapter<br/>provider pending]
    EXT[Supplier / ERP / logistics sources<br/>APIs pending verification]
    SIM[Clearly labelled synthetic adapters]
    HANA[SAP HANA Cloud<br/>planned primary persistence]
    AUDIT[Audit and monitoring<br/>technology pending]

    subgraph BTP[SAP BTP Cloud Foundry — planned application deployment environment]
        UI
        CAP
        ORCH
        AGENTS
        TOOLS
        WFAD
        CAPWF
        VOICE
        EMAIL
        SIM
    end
    subgraph SAP_SERVICES[Planned SAP services — availability and connection unverified]
        AI
        BPA
    end
    subgraph DATA[Planned data and audit services]
        HANA
        AUDIT
    end

    U --> WZ --> UI
    UI -->|authenticated requests| CAP
    CAP -->|authorized reads and writes| HANA
    CAP -->|bounded analysis task| ORCH
    ORCH -->|task delegation| AGENTS
    AGENTS -->|permitted tool calls only| TOOLS
    TOOLS -->|model request via adapter| AI
    TOOLS -->|isolated backend adapters| EXT
    TOOLS -->|simulation only; labelled| SIM
    CAP -->|approval request and status| WFAD
    WFAD --> BPA
    WFAD -.->|fallback only if configured and tested| CAPWF
    BPA -->|human review| APPROVER
    CAPWF -->|human review| APPROVER
    APPROVER -->|decision bound to proposal version| CAP
    CAP -->|re-authorize, re-check approval, execute approved action| TOOLS
    TOOLS --> VOICE
    TOOLS --> EMAIL
    CAP -->|audit events and outcomes| AUDIT
    ORCH -->|task status and summaries| AUDIT
    AGENTS -->|activity and errors| AUDIT
    WFAD -->|decision status| AUDIT
    TOOLS -->|execution results| AUDIT
    AUDIT -->|authorized review| UI
    CAP -->|response with source, freshness, and state| UI
```

The SAPUI5 client communicates with the SAP CAP backend; CAP owns authorization, data access, approval enforcement, external adapters, and audit recording. The orchestrator coordinates bounded specialist-agent work and uses controlled backend tools; neither agent tool access nor model output grants authority. A protected action is executed only after the Supply Chain Head approves the current proposal version and CAP revalidates the request. SAP services and external providers shown as planned are not claimed connected. Simulated adapters are isolated and labelled. SAP BTP Cloud Foundry is the planned environment, not a confirmed deployment.
