# Project Overview — VaxResilience

**Document version:** 1.0  
**Last updated:** November 2026  
**Project stage:** Documentation Foundation (Phase 1)

---

## 1. Project Identity

### Name and Title

**Project Name:** VaxResilience

**Full Title:** Agentic AI for Resilient Pharmaceutical Supply Chains

**Project Type:** Enterprise AI / Agentic AI / Pharmaceutical Supply Chain Management

### Vision

To transform pharmaceutical supply-chain resilience by providing an AI-powered platform that helps pharmaceutical companies detect disruptions early, understand their cascading consequences, coordinate recovery operations efficiently, and make informed decisions through specialized AI agents operating under human supervision.

### Mission

VaxResilience aims to reduce the risk of medicine shortages by converting fragmented supply-chain information into coordinated, auditable recovery processes—ensuring that AI analyzes and recommends while authorized humans retain control over critical operational, financial, regulatory, and customer-facing decisions.

---

## 2. Business Context

### The Pharmaceutical Supply Chain Challenge

Pharmaceutical supply chains are complex, interconnected systems with multiple points of vulnerability:

#### Supply-Side Dependencies
- **API suppliers** — Active Pharmaceutical Ingredient sources (often international)
- **Raw material suppliers** — Excipients, packaging materials, solvents
- **Chemical precursors** — Earlier-stage supply chain dependencies

#### Logistics and Infrastructure
- **International shipping routes** — Ocean freight, air cargo
- **Ports and customs** — Import/export processing points
- **Carriers and freight forwarders** — Transportation providers
- **Warehousing and distribution centers** — Storage and fulfillment hubs

#### Manufacturing and Production
- **Manufacturing facilities** — Production capacity and schedules
- **Quality control and regulatory compliance** — Testing and certification requirements
- **Production lead times** — Manufacturing cycle durations
- **Equipment and maintenance** — Operational readiness

#### Distribution and Customers
- **Hospitals and healthcare institutions** — Direct patient care organizations
- **Pharmacies and retail** — Community access points
- **Medical distributors** — Wholesale distribution networks
- **Export customers** — International market obligations

### Why Disruptions Cascade

When a disruption occurs at any point in this network, its impact cascades through the entire system:

1. **Initial disruption** — Supplier factory shutdown, port closure, logistics delay
2. **Immediate impact** — Shipment delays, increased transit times
3. **Manufacturing impact** — Raw material shortages, production schedule delays
4. **Inventory impact** — Stock depletion, allocation pressures
5. **Customer impact** — Order fulfillment challenges, delivery delays
6. **Patient impact** — Potential medicine availability concerns in affected regions

### Current Limitations

Traditional supply-chain management systems provide operational data, but critical gaps remain:

- **Fragmented information** — Data spread across ERP, logistics, inventory, and quality systems
- **Manual coordination** — Decision-makers must manually connect information from different departments
- **Delayed response** — Time spent gathering information and understanding consequences
- **Limited visibility** — Difficulty predicting downstream consequences
- **Reactive rather than proactive** — Problems detected after impact begins
- **Inconsistent communication** — Ad-hoc stakeholder coordination
- **Limited audit trail** — Incomplete record of decisions and rationale

---

## 3. Problem Statement

### Stakeholder Pain Points

**Supply Chain Managers:**
- "By the time I understand the full impact of a disruption, we've already lost valuable response time."
- "I need to manually call five different departments to understand if we can fulfill customer orders."
- "There's no single place to see how a supplier delay will affect production, inventory, and deliveries."

**Procurement Managers:**
- "When I need to find an alternative supplier, I don't have visibility into quality approvals, regulatory compliance, and actual availability."
- "Evaluating backup options requires manual verification across multiple systems."

**Factory Managers:**
- "I learn about raw material shortages too late to adjust production schedules effectively."
- "Coordinating production changes requires multiple approval rounds and extensive communication."

**Customer/Export Managers:**
- "I don't have real-time visibility into which customer orders are at risk."
- "Explaining delays to hospitals and distributors requires information I don't have immediate access to."

**Executives:**
- "I need to trust that critical decisions are being made with the right information and appropriate approval."
- "There's no comprehensive audit trail showing who approved what and why."

### Business Consequences

Supply-chain disruptions without coordinated response lead to:

- **Medicine shortages** — Patients unable to access essential treatments
- **Revenue loss** — Unfulfilled orders and customer dissatisfaction
- **Regulatory scrutiny** — Failure to meet supply obligations
- **Reputation damage** — Loss of customer and stakeholder trust
- **Operational inefficiency** — Reactive firefighting rather than proactive management
- **Compliance risks** — Inadequate documentation of decisions
- **Increased costs** — Premium pricing for expedited alternatives

---

## 4. Proposed Solution

### How VaxResilience Addresses These Problems

VaxResilience introduces an intelligent AI coordination layer over pharmaceutical supply-chain operations, helping decision-makers quickly answer critical questions:

#### Disruption Understanding
- **What exactly has been disrupted?** — Clear identification of affected suppliers, routes, products
- **Which facilities and stakeholders are impacted?** — Comprehensive impact mapping
- **What is the timeline?** — Expected duration and recovery milestones

#### Operational Impact
- **How many days of inventory remain?** — Precise stock coverage calculation
- **When could manufacturing be affected?** — Production schedule risk assessment
- **Which customer orders are at risk?** — Order fulfillment vulnerability analysis

#### Recovery Options
- **Are alternative suppliers available?** — Backup supplier identification and evaluation
- **What are their capabilities?** — Quality, regulatory, capacity, and availability verification
- **What recovery options are operationally feasible?** — Viable action recommendations

#### Decision Support
- **What decisions require human approval?** — Clear escalation and approval workflow
- **Who needs to be involved?** — Stakeholder coordination requirements
- **What are the tradeoffs?** — Transparent pros/cons analysis

#### Verification
- **Has the recovery plan restored normal operations?** — Progress monitoring and validation
- **What was the complete decision history?** — Full audit trail

---

## 5. Target Users and Roles

### Primary User Roles

VaxResilience is designed for seven primary roles within pharmaceutical organizations:

#### 1. Supply Chain Head
**Responsibilities:**
- Overall supply-chain visibility and oversight
- Final approval authority for high-impact decisions
- Recovery plan supervision and validation
- AI agent monitoring and emergency control

**Key Needs:**
- Comprehensive operational dashboard
- Agent activity monitoring
- Approval workflow management
- Complete audit visibility

#### 2. Procurement Manager
**Responsibilities:**
- Supplier evaluation and qualification
- Purchase recommendation review
- Alternative supplier coordination
- Procurement-related approvals and verification

**Key Needs:**
- Supplier qualification visibility
- Purchase recommendation evaluation
- Regulatory and quality verification
- Procurement decision tracking

#### 3. Factory Manager
**Responsibilities:**
- Production capacity management
- Manufacturing schedule coordination
- Raw material requirement planning
- Production recovery oversight

**Key Needs:**
- Inventory-to-production visibility
- Schedule adjustment recommendations
- Capacity planning support
- Production status tracking

#### 4. Warehouse Manager
**Responsibilities:**
- Inventory visibility and tracking
- Stock allocation decisions
- Warehouse transfer coordination
- Inventory verification

**Key Needs:**
- Real-time inventory levels
- Consumption rate tracking
- Allocation recommendations
- Transfer coordination support

#### 5. Logistics Manager
**Responsibilities:**
- Shipment tracking and monitoring
- Route assessment and optimization
- Carrier coordination
- Delivery recovery planning

**Key Needs:**
- Shipment visibility
- Route disruption alerts
- Alternative logistics options
- Carrier performance tracking

#### 6. Customer / Export Manager
**Responsibilities:**
- Customer order management
- Delivery commitment tracking
- Customer communication coordination
- Export obligation fulfillment

**Key Needs:**
- Order-at-risk visibility
- Customer impact assessment
- Communication workflow support
- Delivery timeline tracking

#### 7. Compliance / Auditor
**Responsibilities:**
- Regulatory and quality verification
- Suspicious activity monitoring
- Approval verification
- Audit history review

**Key Needs:**
- Complete audit trail access
- Suspicious activity alerts
- Approval workflow visibility
- Compliance verification tools

### Access Model

The platform combines:
- **Individual role-based logins** — Each user sees role-appropriate information
- **Shared management overview** — Cross-functional visibility where appropriate
- **Hierarchical approval workflows** — Clear escalation paths
- **Audit and compliance access** — Complete transparency for authorized reviewers

---

## 6. Core Capabilities

### 1. Supply Chain Digital Twin

An interactive visual representation of the pharmaceutical supply chain:

**What it shows:**
- API suppliers and manufacturing facilities
- International shipping routes and ports
- Warehouses and distribution centers
- Hospitals and customer organizations
- Current shipments and inventory flows
- Disrupted routes highlighted
- Alternative supplier and route options

**Value:**
- Intuitive understanding of supply network structure
- Visual identification of disruption points
- Impact propagation visibility
- Alternative option exploration

### 2. Patient Impact Predictor

Analytical capability estimating how supply disruptions may affect medicine availability:

**Considers:**
- Available inventory coverage
- Consumption rates and patterns
- Customer demand and delivery commitments
- Product availability timelines
- Healthcare facility urgency levels
- Recovery timeline projections

**Important:**
- All patient impact figures are **estimates** derived from operational data
- Clearly distinguished from verified facts
- Based on synthetic demonstration data in this project
- Does not claim to predict actual patient outcomes

### 3. AI War Room

The central operational command center:

**Displays:**
- Current disruption status and risk levels
- Affected suppliers, shipments, and inventory
- AI agent activity and status
- Recommendations requiring review
- Pending approvals and decisions
- Recovery progress tracking
- Customer communication status
- Complete audit history
- Suspicious activity alerts

**Value:**
- Single pane of glass for disruption management
- Real-time visibility into AI agent operations
- Centralized decision-making hub
- Comprehensive operational awareness

### 4. Multi-Agent AI System

Specialized AI agents coordinated by a central orchestrator:

**Agent Authority Levels:**

**Level 1 — Read & Analyze**
- Retrieve authorized information
- Inspect operational records
- Calculate risks and exposure
- Analyze situation and consequences

**Level 2 — Recommend & Prepare**
- Prepare recovery plan recommendations
- Draft communications (internal and external)
- Propose operational actions
- Calculate allocation scenarios

**Level 3 — Execute with Permission**
- Implement only explicitly approved actions
- Execute under human supervision
- Maintain complete audit trail
- Support monitoring and intervention

**Exact agent architecture** (number of agents, individual responsibilities, tool specifications) will be designed in Phase 4 documentation.

### 5. AI Voice Calling

Two-way AI voice conversations with internal stakeholders:

**Capabilities:**
- Initiate or participate in calls with internal stakeholders
- Ask operational questions and capture responses
- Request missing information
- Handle follow-up questions
- Generate call summaries for audit trail

**Initial Stakeholders:**
- Supply Chain Head
- Procurement Manager
- Factory Manager
- Logistics Manager

**Requirements:**
- Appropriate consent and applicable requirements
- Call transcript retention where permitted
- Clear identification as AI system
- Human ability to end call at any time

### 6. Email Integration

AI-drafted communications requiring human approval:

**Workflow:**
1. AI drafts email based on situation and recipient
2. Authorized human reviews draft
3. Human approves, modifies, or rejects
4. System sends only after approval

**Potential Recipients:**
- Chinese API supplier
- Indian backup supplier
- Hospital customers
- Medical distributors
- Export importers

**Constraints:**
- AI must never make unverified delivery commitments
- AI must never invent pricing or financial terms
- AI must never send sensitive communications without required approval

### 7. Human Oversight and Approval

**Eight action categories that ALWAYS require human approval:**

1. Purchasing from alternative suppliers
2. Transferring inventory between warehouses
3. Changing factory production schedules
4. Prioritizing or reallocating customer orders
5. Changing shipment routes or carriers
6. Sending major disruption notifications to customers
7. Approving payments or financial commitments
8. Adding or changing approved suppliers

**Governance Controls:**
- Agent monitoring and status visibility
- Agent pause/stop capability
- Global kill switch for emergency shutdown
- Manual override of any AI action
- Approval and rejection workflows
- Action modification before approval
- Escalation to higher authority
- Complete audit history
- Fail-safe behavior on system failures

---

## 7. Application Structure

### Eight Primary Modules

#### 1. Executive Dashboard
- Disruption alerts and risk levels
- AI agent activity overview
- Supply-chain health indicators
- Inventory and production status summary
- Customer order status overview
- Pending approval count
- Estimated patient impact metrics
- Supply-chain resilience scores

#### 2. Supply Chain Digital Twin
- Interactive supply network visualization
- Supplier and facility locations
- Shipping routes and transit times
- Disruption indicators
- Alternative route visualization
- Inventory flow representation
- Real-time status updates

#### 3. AI Command Centre (War Room)
- Current disruption details
- AI agent activity monitor
- Recommendation review interface
- Approval workflow management
- Recovery progress tracking
- Communication status
- Audit trail access

#### 4. Inventory & Manufacturing
- Current stock levels by location
- Consumption rates and trends
- Production schedule visibility
- Raw material requirements
- Manufacturing capacity utilization
- Inventory allocation scenarios
- Supply exposure timeline

#### 5. Customers & Orders
- Customer order tracking
- Delivery commitment status
- Order-at-risk identification
- Customer impact assessment
- Communication history
- Export obligation tracking

#### 6. Approvals & Decisions
- Pending approval queue
- Decision review interface
- Approval history
- Rejection and modification tracking
- Escalation management
- Decision rationale capture

#### 7. Risk, Compliance & Audit
- Suspicious activity monitoring
- Regulatory compliance checks
- Quality verification status
- Complete audit trail
- Decision history
- User action tracking
- System event logs

#### 8. Resilience & Impact Analytics
- Patient impact estimates
- Supply-chain resilience metrics
- Recovery timeline projections
- Historical disruption analysis
- Supplier performance tracking
- Risk exposure dashboards

### Navigation Structure

- **Sidebar navigation** — Primary module access
- **Top navigation bar** — User profile, notifications, global search
- **Role-specific views** — Dashboard customization by role
- **Quick action buttons** — Common operations
- **Breadcrumb navigation** — Context awareness
- **Notification center** — Alerts and updates

---

## 8. Technology Overview

### SAP Ecosystem Foundation

| Layer | Technology |
|-------|-----------|
| Frontend | SAPUI5 |
| Backend | SAP Cloud Application Programming Model (CAP) |
| Backend Runtime | Node.js |
| AI Services | SAP AI Core / Generative AI Hub (where verified) |
| Workflow Automation | SAP Build Process Automation (where available) |
| Database | SAP HANA Cloud |
| Deployment | SAP BTP Cloud Foundry |
| Enterprise Access | SAP Build Work Zone |
| Audit Records | SAP HANA Cloud |

### Integration Strategy

**Hybrid approach:**
- Use actual SAP services and integrations where available and tested
- Use clearly labeled synthetic or simulated adapters for demonstration where enterprise APIs are unavailable
- Never represent simulated integrations as live enterprise connections

**Integration categories:**
- **Verified SAP integrations** — Tested and operational
- **Planned SAP integrations** — Specified but pending implementation
- **Simulated adapters** — Demonstration-only placeholders marked clearly in code

---

## 9. Demonstration Context

### Fictional Company: BharatMed Pharmaceuticals

**Location:** Hyderabad, India

**Important:** BharatMed Pharmaceuticals is a **fictional demonstration organization** created for this hackathon project. It is not a real company.

### Demonstration Scenario

**Product:** Paracetamol tablets

**Disruption:** Chinese API supplier factory shutdown causing 30-day shipment delay

**Scenario Parameters:**
- Expected shipment delay: 30 days
- Available inventory coverage: 20 days
- Potential uncovered supply period: 10 days
- Alternative supplier: Hyderabad-based with 10 production days of available stock (subject to verification)

**Affected Route:**
Suzhou/Shanghai, China → Shanghai Port → Nhava Sheva Port, India → Hyderabad facility

**Customer Organizations (all fictional):**
1. Hospital A — Hyderabad, India
2. Hospital B — Bengaluru, India
3. Medical Distributor — Mumbai, India
4. Export Importer A — Nairobi, Kenya
5. Export Importer B — London, United Kingdom

**Data Disclaimer:**
All scenario data, supplier information, customer organizations, stock quantities, shipment details, financial values, and patient impact estimates are synthetic demonstration data created for this project.

---

## 10. Expected Business Value

### Operational Benefits

**Faster Response Time:**
- Early disruption detection
- Automated impact analysis
- Pre-prepared recovery options
- Streamlined approval workflows

**Better Decisions:**
- Comprehensive information visibility
- AI-powered recommendation support
- Clear tradeoff analysis
- Expert coordination

**Reduced Risk:**
- Proactive rather than reactive management
- Alternative supplier pre-qualification
- Patient impact estimation
- Compliance and audit readiness

**Improved Coordination:**
- Centralized command center
- Automated stakeholder communication
- Clear approval workflows
- Real-time progress tracking

### Stakeholder Value

**Supply Chain Teams:**
- Unified operational visibility
- Automated routine analysis
- Recommendation support
- Reduced manual coordination

**Procurement Teams:**
- Faster supplier evaluation
- Regulatory verification support
- Purchase decision confidence

**Manufacturing Teams:**
- Production impact visibility
- Schedule adjustment recommendations
- Capacity planning support

**Executive Leadership:**
- Strategic oversight
- Approval authority preservation
- Audit and compliance confidence
- Risk management visibility

---

## 11. Project Boundaries

### What VaxResilience Is

- An AI-assisted supply-chain resilience platform
- A human-in-the-loop decision support system
- An enterprise coordination tool
- A demonstration of agentic AI in pharmaceutical supply chains

### What VaxResilience Is Not

- Not a fully autonomous supply-chain management system
- Not a replacement for human decision-making
- Not claiming access to real pharmaceutical data
- Not predicting actual patient outcomes
- Not a production-ready enterprise system (hackathon demonstration)

### Known Limitations

- Synthetic demonstration data only
- Simulated integrations where enterprise APIs unavailable
- Provisional customer allocation policy pending confirmation
- Agent architecture design pending Phase 4 specification
- Security implementation details pending Phase 5 specification

---

## 12. Current Project Stage

**Stage:** Documentation Foundation (Phase 1)

### What Exists Now
- Complete project specification and business context
- Demonstration scenario definition
- Technology stack selection
- Human approval and governance framework
- Documentation roadmap

### What's Planned

**Phase 2: Product Requirements and User Experience**
- Detailed functional requirements
- User roles and access control
- Dashboard and UI specifications
- User journey mapping

**Phase 3: Architecture and Technology**
- System architecture design
- Technology stack implementation
- Integration architecture
- Architecture diagrams

**Phase 4: AI Agents and Governance**
- Agent design and responsibilities
- Workflow and approval specifications
- Security and audit implementation
- Agent tool specifications
- Agent prompt engineering

**Phase 5: Data and Integrations**
- Data model and schema design
- Synthetic demonstration data
- API contract specifications
- Integration implementation

**Phase 6: Demonstration and Project Handover**
- Demonstration runbook
- Testing strategy
- Deployment guide
- Project status documentation

---

## 13. Unresolved Decisions

The following decisions remain pending and require explicit resolution:

1. **Customer order allocation policy**
   - Provisional recommendation: healthcare-first balanced allocation
   - Requires final stakeholder confirmation

2. **Exact agent architecture**
   - Number of specialized agents
   - Individual agent names and responsibilities
   - Tool specifications for each agent
   - Agent orchestration pattern

3. **External communication providers**
   - Voice call service selection
   - Email service integration
   - SMS/notification services

4. **SAP integration availability**
   - Which SAP services are verified operational
   - Which require simulated adapters
   - Integration testing and validation plan

5. **Security implementation details**
   - Authentication mechanism selection
   - Authorization and role-based access model
   - Data encryption approach
   - Secret management strategy

These decisions will be addressed in subsequent documentation phases.

---

## 14. Key Principles

### AI Analyzes, Humans Decide

The central principle of VaxResilience is that AI provides analysis, recommendations, and prepares actions, while authorized humans retain control over important operational, financial, regulatory, and customer-facing decisions.

### Synthetic Data, Real Architecture

This demonstration uses synthetic data and clearly labeled estimates. The architecture, workflows, and governance framework are designed for real-world pharmaceutical supply-chain requirements.

### Transparency and Audit

Every AI recommendation, human approval, and executed action is recorded in a complete audit trail for compliance, review, and continuous improvement.

### Human Safety Net

Multiple layers of human oversight ensure that the system operates within authorized boundaries and that critical decisions receive appropriate review and approval.

---

## Related Documentation

- [README.md](../README.md) — Project overview and quick start
- [AGENTS.md](../AGENTS.md) — AI coding agent instructions
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Contribution guidelines
- [docs/01_BUSINESS_PROBLEM.md](01_BUSINESS_PROBLEM.md) — Detailed business problem analysis
- [docs/02_DEMO_SCENARIO.md](02_DEMO_SCENARIO.md) — Demonstration scenario specification

---

**Document Status:** Phase 1 Complete  
**Next Phase:** Product Requirements and User Experience (Phase 2)  
**Maintained By:** VaxResilience Project Team
