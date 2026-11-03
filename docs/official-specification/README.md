# VaxResilience

**Agentic AI for Resilient Pharmaceutical Supply Chains**

## Overview

VaxResilience is an enterprise-grade AI-powered pharmaceutical supply-chain resilience platform designed to help pharmaceutical companies detect disruptions, understand their consequences, coordinate recovery operations, and make informed decisions through specialized AI agents under human supervision.

The system acts as an intelligent supply-chain control tower that combines real-time visibility, disruption detection, risk analysis, inventory intelligence, patient-impact estimation, and AI-powered recommendations—while keeping authorized humans in control of critical operational, financial, regulatory, and customer-facing decisions.

## The Problem

Pharmaceutical supply chains are complex, interconnected systems with multiple points of vulnerability:

- **API and raw material dependencies** across global suppliers
- **International logistics** through ports, shipping routes, and carriers
- **Manufacturing facilities** with production schedules and capacity constraints
- **Distribution networks** serving hospitals, pharmacies, and export customers
- **Patient access** to essential medicines

When a disruption occurs—such as a supplier factory shutdown, logistics delay, or port closure—the impact cascades through the entire network. Traditional supply-chain management systems provide operational data, but decision-makers must manually connect information from different departments, understand consequences, evaluate alternatives, and coordinate recovery.

This creates delays, fragmented decision-making, and increased risk of medicine shortages.

## The Solution

VaxResilience addresses this challenge by introducing an intelligent AI coordination layer over pharmaceutical supply-chain operations. The platform helps decision-makers quickly answer critical questions:

- What exactly has been disrupted?
- Which suppliers, routes, products, and facilities are affected?
- How many days of inventory remain?
- When could manufacturing be affected?
- Which customer orders are at risk?
- Which hospitals or regions may experience medicine availability issues?
- Are alternative suppliers available and qualified?
- What recovery options are operationally feasible?
- What decisions require human approval?
- Has the recovery plan restored normal operations?

The platform converts fragmented operational information into a coordinated, auditable recovery process.

## Core Capabilities

### 1. Supply Chain Digital Twin
An interactive visual representation of the pharmaceutical supply chain displaying:
- API suppliers and manufacturing facilities
- International shipping routes and ports
- Warehouses and distribution locations
- Hospitals and customer organizations
- Disrupted shipments and alternative routes
- Real-time status indicators

### 2. Patient Impact Predictor
Analytical capability that estimates how supply disruptions may affect medicine availability:
- Available inventory coverage
- Customer demand and consumption patterns
- Delivery commitments and timelines
- Healthcare urgency levels
- Recovery timeline projections

*All patient impact figures are estimates derived from operational data and clearly distinguished from verified facts.*

### 3. AI War Room
The central operational command center displaying:
- Current disruption status and risk levels
- Affected suppliers, shipments, and inventory
- AI agent activity and recommendations
- Pending approvals and decisions
- Recovery progress tracking
- Customer communication status
- Complete audit history

### 4. Multi-Agent AI System
Specialized AI agents coordinated by a central orchestrator:
- **Read & Analyze**: Retrieve information, inspect records, calculate risks
- **Recommend & Prepare**: Draft recovery plans, communications, and proposed actions
- **Execute with Permission**: Implement only explicitly approved actions

### 5. AI Voice Calling
Two-way AI voice conversations with internal stakeholders:
- Supply Chain Head, Procurement Manager, Factory Manager, Logistics Manager
- Capture operational information and stakeholder responses
- Generate call summaries for audit trail

### 6. Email Integration
AI-drafted communications requiring human approval:
- Supplier coordination emails
- Customer disruption notifications
- Hospital and distributor communications

All emails are reviewed and approved by authorized personnel before sending.

### 7. Human Oversight and Approval
The following actions **always require human approval**:
1. Purchasing from alternative suppliers
2. Transferring inventory between warehouses
3. Changing factory production schedules
4. Prioritizing or reallocating customer orders
5. Changing shipment routes or carriers
6. Sending major disruption notifications
7. Approving payments or financial commitments
8. Adding or changing approved suppliers

The Supply Chain Head has final approval authority and can pause, stop, or override any agent action.

## Demonstration Scenario

The project demonstrates the platform using a fictional pharmaceutical company:

**BharatMed Pharmaceuticals** (Hyderabad, India) — *a synthetic demonstration organization*

### Disruption Scenario
- **Product**: Paracetamol tablets
- **Disruption**: Chinese API supplier factory shutdown causing 30-day shipment delay
- **Available inventory**: 20 days of API stock
- **Supply gap**: 10 days of potential uncovered production
- **Alternative supplier**: Fictional Hyderabad-based source with 500 kg (10 synthetic production days); the fixture records six passed checks and a simulated receipt for demonstration only
- **Affected route**: Suzhou/Shanghai, China → Shanghai Port → Nhava Sheva Port, India → Hyderabad facility

### Customer Impact
Five fictional customer organizations:
1. Hospital A — Hyderabad, India
2. Hospital B — Bengaluru, India
3. Medical Distributor — Mumbai, India
4. Export Importer A — Nairobi, Kenya
5. Export Importer B — London, United Kingdom

### Recovery Workflow
1. Detect and analyze the Chinese supplier disruption
2. Calculate inventory coverage and production exposure
3. Evaluate the Indian backup supplier (quality, regulatory, capacity)
4. Prepare purchase recommendation
5. Calculate inventory allocation (provisional approach: healthcare-first balanced allocation)
6. Recommend revised production schedule
7. Track delayed shipment and evaluate alternative routes
8. Prepare revised customer fulfillment plans
9. Present recovery plan to authorized managers
10. Obtain human approvals
11. Execute only approved actions
12. Coordinate internal calls and approved external communications
13. Monitor recovery progress
14. Close incident when operations return to normal

**Important**: All scenario data, customer organizations, stock quantities, and patient impact estimates are synthetic demonstration data created for this project.

## Application Structure

The platform consists of eight primary modules:

1. **Executive Dashboard** — Disruption alerts, agent activity, risk levels
2. **Supply Chain Digital Twin** — Interactive supply network visualization
3. **AI Command Centre** — Central operational control tower
4. **Inventory & Manufacturing** — Stock levels, production schedules
5. **Customers & Orders** — Delivery commitments, fulfillment status
6. **Approvals & Decisions** — Pending actions requiring authorization
7. **Risk, Compliance & Audit** — Suspicious activity monitoring, audit trail
8. **Resilience & Impact Analytics** — Patient impact estimates, resilience metrics

Seven user roles with specific responsibilities:
- Supply Chain Head (final approval authority)
- Procurement Manager
- Factory Manager
- Warehouse Manager
- Logistics Manager
- Customer/Export Manager
- Compliance/Auditor

## Technology Stack

Built on the SAP ecosystem:

| Layer | Technology |
|-------|-----------|
| Frontend | SAPUI5 |
| Backend | SAP Cloud Application Programming Model (CAP) |
| Backend Runtime | Node.js |
| AI Services | SAP AI Core / Generative AI Hub |
| Workflow Automation | SAP Build Process Automation |
| Database | SAP HANA Cloud |
| Deployment | SAP BTP Cloud Foundry |
| Enterprise Access | SAP Build Work Zone |
| Audit Records | SAP HANA Cloud |

### Integration Strategy
The platform uses a hybrid approach:
- **Verified SAP services and integrations** where available and tested
- **Clearly labeled synthetic or simulated adapters** for demonstration purposes where enterprise APIs are unavailable

*This project does not claim access to live enterprise ERP data, real patient records, or actual supplier databases unless independently verified.*

## Documentation

### Phase 1: Project Foundation
- [README.md](README.md) — Project overview (this file)
- [AGENTS.md](AGENTS.md) — AI coding agent instructions
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [docs/00_PROJECT_OVERVIEW.md](docs/00_PROJECT_OVERVIEW.md) — Detailed project overview
- [docs/01_BUSINESS_PROBLEM.md](docs/01_BUSINESS_PROBLEM.md) — Business problem analysis
- [docs/02_DEMO_SCENARIO.md](docs/02_DEMO_SCENARIO.md) — Demonstration scenario specification

### Phase 2: Product Requirements and User Experience
- [docs/03_FUNCTIONAL_REQUIREMENTS.md](docs/03_FUNCTIONAL_REQUIREMENTS.md) — Testable functional and non-functional requirements
- [docs/USER_ROLES_AND_ACCESS.md](docs/USER_ROLES_AND_ACCESS.md) — Role profiles, permission baseline, and approval authority
- [docs/DASHBOARD_AND_UI_SPECIFICATION.md](docs/DASHBOARD_AND_UI_SPECIFICATION.md) — Application shell, eight modules, and UI behaviour
- [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md) — Eleven operational user journeys

### Phase 3: Architecture and Technology
- [docs/04_SYSTEM_ARCHITECTURE.md](docs/04_SYSTEM_ARCHITECTURE.md) — Proposed system boundaries and components
- [docs/TECH_STACK.md](docs/TECH_STACK.md) — SAP technology baseline and implementation constraints
- [docs/INTEGRATION_ARCHITECTURE.md](docs/INTEGRATION_ARCHITECTURE.md) — Proposed integration boundaries and adapters

### Phase 4: AI Agents and Governance
- [docs/05_AGENT_DESIGN.md](docs/05_AGENT_DESIGN.md) — Specialist roles and orchestrator proposal
- [docs/06_WORKFLOWS_AND_APPROVALS.md](docs/06_WORKFLOWS_AND_APPROVALS.md) — Human approval and recovery workflows
- [docs/AGENT_TOOL_SPECIFICATIONS.md](docs/AGENT_TOOL_SPECIFICATIONS.md) — Scoped agent tools and authority boundaries
- [docs/07_SECURITY_AND_AUDIT.md](docs/07_SECURITY_AND_AUDIT.md) — Governance, security, and audit requirements

### Phase 5: Data Model and Integration Contracts
- [docs/08_DATA_MODEL_AND_DEMO_DATA.md](docs/08_DATA_MODEL_AND_DEMO_DATA.md) — Logical model and synthetic scenario records
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — Proposed SAP HANA schema
- [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) — Proposed CAP-facing API contracts
- [docs/09_INTEGRATIONS.md](docs/09_INTEGRATIONS.md) — Integration status, boundaries, and configuration
- [data/synthetic/](data/synthetic/) — Fictional, static demonstration fixtures
- [data/schemas/](data/schemas/) — Draft JSON Schemas for records and API payloads
- [.env.example](.env.example) — Safe configuration template; contains no credentials

### Phase 6: Demo, Testing, Deployment, and Handover
- [docs/10_DEMO_RUNBOOK.md](docs/10_DEMO_RUNBOOK.md) — Judge-ready demonstration script and fallbacks
- [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) — Proposed test plan and acceptance criteria
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — Proposed SAP BTP deployment sequence
- [docs/11_DECISIONS_AND_OPEN_QUESTIONS.md](docs/11_DECISIONS_AND_OPEN_QUESTIONS.md) — Unresolved decisions and owners
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) — Honest project status and handover checklist
- [.github/pull_request_template.md](.github/pull_request_template.md) — Contribution review checklist

## Current Status

**Project Stage**: Documentation Foundation (Phases 1–6)

This repository contains Phase 1–6 project documentation and synthetic fixtures. The application, database, APIs, automated tests, and external integrations are not implemented or deployed.

**What exists now**:
- Complete project specification and business context
- Demonstration scenario definition
- Technology stack selection
- Human approval and governance framework
- Phase 2 functional requirements, role/access baseline, UI specification, and user journeys
- Phase 3 architecture and integration design
- Phase 4 agent, tool, approval, security, and audit design
- Phase 5 logical data model, proposed database/API contracts, integration status, and synthetic fixtures
- Phase 6 demo, testing, deployment, decisions, status, and project handover documentation

**What's planned**:
- Application implementation
- Verified SAP service and external-provider connectivity
- Executable implementation-specific tests and deployment

## Demonstration Plan

The planned demonstration is a complete disruption-to-recovery journey. It is not currently runnable as an application from this documentation-only repository; see [the Phase 6 runbook](docs/10_DEMO_RUNBOOK.md) for a synthetic-fixture walkthrough and capability boundaries.

1. Walk through the synthetic BharatMed baseline and scenario records.
2. Present the pre-authored supplier-delay event; a demo control is future application behavior, not present here.
3. Explain the proposed AI analysis and documented calculation; do not imply a live model ran.
4. Trace the fictional route and inventory exposure using the static fixtures.
5. Review the backup-supplier checks and recovery options as synthetic scenario history.
6. Explain the proposed human approval boundary and protected-action categories.
7. Walk through simulated execution, communications, and audit records.
8. Describe the recovery and closure evidence in the fixture.

Use the [Phase 6 runbook](docs/10_DEMO_RUNBOOK.md) for presenter actions and technical evidence. No runnable app or recorded demo video is included in this repository; use the static fixture walkthrough unless a later build is independently verified.

## Key Principles

### AI Analyzes, Humans Decide
The AI provides analysis, recommendations, and prepares actions. Authorized humans retain control over important operational, financial, regulatory, and customer-facing decisions.

### Synthetic Data, Real Architecture
This demonstration uses synthetic data and clearly labeled estimates. The architecture, workflows, and governance framework are designed for real-world pharmaceutical supply-chain requirements.

### Audit and Accountability
Every AI recommendation, human approval, and executed action is recorded in a complete audit trail for compliance and review.

---

**Project Type**: Hackathon Demonstration / Proof of Concept  
**Company**: BharatMed Pharmaceuticals (Fictional)  
**Data**: Synthetic demonstration dataset  
**License**: See LICENSE file (when added)  
**Contact**: See CONTRIBUTING.md for collaboration guidelines
