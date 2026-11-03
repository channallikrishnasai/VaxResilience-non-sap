# AGENTS.md — AI Coding Agent Instructions for VaxResilience

This document provides authoritative instructions for AI coding agents working on the VaxResilience project. Read this file before implementing any feature, modifying existing code, or making architectural decisions.

## Project Understanding

### What is VaxResilience?

VaxResilience is an enterprise-grade AI-powered pharmaceutical supply-chain resilience platform designed to help pharmaceutical companies detect disruptions, understand their consequences, coordinate recovery operations, and make informed decisions through specialized AI agents under human supervision.

The system acts as an intelligent supply-chain control tower that helps pharmaceutical organizations respond to supply-chain disruptions before they turn into serious medicine shortages.

### Core Philosophy: AI Analyzes, Humans Decide

The central principle of VaxResilience is:

**AI analyses, coordinates, recommends, and prepares actions. Authorized humans retain control over important operational, financial, regulatory, and customer-facing decisions.**

This is not negotiable. The platform is designed around human oversight and approval, not autonomous AI decision-making.

### What We Are Building

VaxResilience is an enterprise application with:

1. **Supply Chain Digital Twin** — Interactive visual representation of the supply network
2. **Patient Impact Predictor** — Analytical capability estimating medicine availability impact
3. **AI War Room** — Central operational command center
4. **Multi-Agent AI System** — Coordinated specialized agents with orchestrator
5. **AI Voice Calling** — Two-way conversations with internal stakeholders
6. **Email Integration** — AI-drafted communications requiring human approval
7. **Human Approval Workflow** — Mandatory authorization for high-impact actions
8. **Complete Audit Trail** — Every action, recommendation, and decision recorded

### Demonstration Context

The project demonstrates the platform using:

- **BharatMed Pharmaceuticals** — A **fictional** demonstration company in Hyderabad, India
- **Synthetic scenario data** — All suppliers, customers, inventory levels, and patient impact estimates are synthetic demonstration data
- **Paracetamol disruption scenario** — Chinese API supplier delay demonstrating the complete recovery workflow

**Never represent this as real pharmaceutical company data, real patient records, or actual supply-chain information.**

## Technology Stack Constraints

### Mandated SAP Ecosystem

VaxResilience is built on the SAP technology stack. Use these technologies as the implementation baseline:

| Layer | Required Technology |
|-------|---------------------|
| Frontend | **SAPUI5** |
| Backend | **SAP Cloud Application Programming Model (CAP)** |
| Backend Runtime | **Node.js** |
| AI Services | **SAP AI Core / Generative AI Hub** (where verified) |
| Workflow Automation | **SAP Build Process Automation** (where available) |
| Database | **SAP HANA Cloud** |
| Deployment | **SAP BTP Cloud Foundry** |
| Enterprise Access | **SAP Build Work Zone** |
| Audit Records | **SAP HANA Cloud** |

### Technology Rules

1. **Do not casually replace SAP technologies** with unrelated frameworks (React, Angular, Express, MongoDB, etc.) unless explicitly approved
2. **If a required SAP service is unavailable**, document the limitation and use a clearly labeled synthetic or simulated adapter
3. **Never falsely claim a live SAP integration** when using a simulated fallback
4. **Distinguish verified integrations from demonstration adapters** in code comments and documentation
5. **Do not assume SAP AI Core is connected** unless connectivity has been verified
6. **Do not claim SAP IBP, SAP TM, SAP Ariba, or other enterprise systems are integrated** unless a working integration is demonstrated

### Integration Strategy

Use a **hybrid approach**:

- **Verified SAP services and integrations** where available and tested
- **Clearly labeled synthetic or simulated adapters** for hackathon demonstration where enterprise APIs are unavailable

Mark simulated integrations with clear comments:

```javascript
// SIMULATION: This adapter simulates SAP IBP integration for demonstration purposes.
// Replace with actual SAP IBP API integration when available.
```

## Coding Agent Behavior

### Before Starting Implementation

1. **Read the relevant documentation** before implementing any feature
   - Check `docs/` for specifications related to your task
   - Review `README.md` for project overview
   - Consult this `AGENTS.md` file for constraints

2. **Inspect the existing repository** before modifying files
   - Run `git status` to understand current state
   - Check existing code structure and patterns
   - Identify related files that may be affected

3. **Verify current project stage**
   - The repository may be at different stages of implementation
   - Do not assume all planned features have been built
   - Check what actually exists before referencing it

### Implementation Standards

1. **Preserve existing architecture and decisions**
   - Follow established code patterns
   - Maintain consistent file structure
   - Respect existing naming conventions

2. **Write maintainable, modular code**
   - Use clear, descriptive names
   - Keep functions focused and single-purpose
   - Avoid deeply nested logic
   - Extract reusable components

3. **Avoid unnecessary dependencies**
   - Prefer built-in capabilities
   - Use existing project dependencies
   - Only add new dependencies when necessary and approved

4. **Explain important implementation decisions**
   - Document non-obvious choices in code comments
   - Update relevant documentation files
   - Note any deviations from specifications

5. **Keep documentation updated alongside code**
   - Update technical documentation when changing architecture
   - Maintain API documentation when changing interfaces
   - Keep README current with actual capabilities

6. **Avoid unrelated refactoring**
   - Focus on the assigned task
   - Do not reorganize unrelated code
   - Do not introduce unnecessary abstraction layers

7. **Never silently change agreed requirements**
   - If a requirement seems problematic, document the concern
   - Propose alternatives explicitly
   - Do not make assumptions that change behavior

### Code Quality Expectations

1. **Follow SAP development best practices**
   - SAPUI5: Use proper model binding, fragments, and component structure
   - CAP: Follow service-oriented architecture, proper entity modeling
   - Node.js: Use async/await, proper error handling

2. **Implement proper error handling**
   - Catch and handle errors gracefully
   - Log errors with sufficient context
   - Provide meaningful error messages to users

3. **Write secure code**
   - Never expose credentials in frontend code
   - Validate all user inputs
   - Use parameterized queries
   - Implement proper authentication and authorization

4. **Consider performance**
   - Optimize database queries
   - Implement pagination for large datasets
   - Use caching where appropriate
   - Minimize network requests

## Safety and Governance Rules

### Mandatory Human Approval

The following **eight action categories ALWAYS require human approval**:

1. Purchasing from alternative suppliers
2. Transferring inventory between warehouses
3. Changing factory production schedules
4. Prioritizing or reallocating customer orders
5. Changing shipment routes or carriers
6. Sending major disruption notifications to customers
7. Approving payments or financial commitments
8. Adding or changing approved suppliers

**Implementation requirement**: Every code path that triggers these actions must include an approval gate. Never implement automatic execution of these actions without the required approval workflow.

### Agent Authority Levels

Implement three levels of agent authority:

**Level 1 — Read & Analyze**
- Agents can retrieve authorized information
- Inspect records and calculate risks
- Analyze situations

**Level 2 — Recommend & Prepare**
- Agents can prepare recommendations
- Draft recovery plans and communications
- Propose operational actions

**Level 3 — Execute with Permission**
- Agents may execute explicitly permitted actions
- Only after the required human approval
- With complete audit trail

### Required Governance Controls

All implementations must support:

1. **Agent monitoring** — Real-time visibility into agent actions
2. **Agent pause/stop** — Ability to halt agent operations
3. **Global kill switch** — Emergency shutdown capability
4. **Manual override** — Human ability to override any AI action
5. **Approval workflow** — Clear approval and rejection paths
6. **Action modification** — Ability to modify proposed actions before approval
7. **Escalation** — Route to escalate decisions to higher authority
8. **Complete audit history** — Every action, recommendation, and approval recorded
9. **Fail-safe behavior** — Graceful degradation when APIs, agents, or data sources fail

### Suspicious Activity Detection

Implement monitoring for:

- Fake or duplicate invoices
- Supplier bank account changes
- Duplicate purchase orders
- Unusual pricing patterns
- Inventory manipulation
- Unauthorized supplier changes

**Important**: The AI must flag suspicious activity and hold affected transactions for verification. Never autonomously accuse an individual or organization of fraud.

### Security Requirements

1. **Never expose secrets or credentials**
   - Use environment variables for configuration
   - Never commit `.env` files
   - Use secure credential management
   - Never log sensitive information

2. **Implement proper authentication**
   - Verify user identity
   - Enforce role-based access control
   - Validate session tokens

3. **Protect sensitive data**
   - Encrypt sensitive data at rest and in transit
   - Implement proper data access controls
   - Comply with data protection requirements

4. **Audit everything**
   - Log all actions to SAP HANA Cloud
   - Record user identity, timestamp, action, and result
   - Make audit logs immutable and searchable

## Integration Rules

### SAP Integration Principles

1. **Prefer verified SAP integrations**
   - Use official SAP SDKs and APIs
   - Follow SAP integration best practices
   - Test connectivity before claiming integration

2. **Clearly distinguish live integrations from simulated adapters**
   - Mark simulated code with clear comments
   - Use separate files/modules for simulations
   - Document what is simulation vs. reality

3. **Use backend-controlled integrations**
   - Never expose integration credentials in frontend
   - Route all external API calls through backend
   - Implement proper error handling for failed integrations

4. **Never expose credentials in frontend code**
   - Keep API keys, tokens, and secrets server-side
   - Use backend proxy for external calls
   - Implement proper CORS and security headers

5. **Do not assume external APIs are available**
   - Implement graceful fallbacks
   - Provide clear error messages
   - Design for intermittent connectivity

### External Communication

1. **Voice calls** — Require appropriate consent and applicable requirements
2. **Email integration** — AI drafts, human approves, system sends
3. **Never make unverified commitments** — No delivery dates, prices, or guarantees without approval

## Documentation Rules

### Documentation Standards

1. **Use clear Markdown**
   - Proper heading hierarchy
   - Tables for structured information
   - Code blocks with language specification
   - Relative links between documents

2. **Keep terminology consistent**
   - Use project glossary terms
   - Avoid synonyms for key concepts
   - Define technical terms on first use

3. **Link related documentation**
   - Cross-reference relevant documents
   - Maintain navigation structure
   - Update table of contents

4. **Record unresolved decisions**
   - Document pending decisions clearly
   - Distinguish recommendations from confirmed decisions
   - Note decision-making authority

5. **Do not invent facts**
   - Base documentation on actual implementation
   - Mark planned features as "planned"
   - Never silently convert proposals into confirmed decisions

### Documentation Maintenance

1. **Update documentation alongside code changes**
   - When changing APIs, update API documentation
   - When adding features, update feature documentation
   - When changing architecture, update architecture documentation

2. **Maintain accurate project status**
   - Reflect actual implementation state
   - Update README with new capabilities
   - Mark completed roadmap items

3. **Document limitations and assumptions**
   - Note synthetic data usage
   - Clarify simulation vs. real integration
   - Document known limitations

## Data and Estimation Handling

### Synthetic Data Requirements

1. **Clearly label all synthetic data**
   - Mark demo datasets as synthetic
   - Distinguish real from simulated information
   - Never represent synthetic data as real

2. **Patient impact estimates**
   - Clearly state these are estimates
   - Show calculation methodology
   - Distinguish estimates from verified facts
   - Never claim to predict actual patient outcomes

3. **Scenario data consistency**
   - Main disruption: 30-day shipment delay
   - Available inventory: 20 days coverage
   - Potential supply gap: 10 days (calculated from above)
   - Backup supplier stock: 10 production days (subject to verification)

### Data Validation

1. **Never assume backup supplier stock is automatically usable**
   - Require quality verification
   - Require regulatory compliance check
   - Require capacity confirmation
   - Require supplier confirmation

2. **Validate all input data**
   - Check data types and ranges
   - Validate business logic constraints
   - Handle missing or invalid data gracefully

3. **Implement data integrity checks**
   - Prevent duplicate records
   - Validate relationships between entities
   - Maintain referential integrity

## Implementation Boundaries

### Current Project Stage

The repository contains the **Documentation Foundation (Phases 1–6)**: product requirements, target architecture, agent/governance design, proposed data/API/integration contracts, synthetic demonstration fixtures, and project handover guidance.

**What exists now**:
- Project specification and business context
- Phase 1–2 scenario, requirements, roles, UI, and user-journey documentation
- Phase 3 architecture and SAP technology baseline
- Phase 4 proposed agent, tool, approval, security, and audit designs
- Phase 5 proposed data model, database/API contracts, integration catalogue, schemas, and synthetic fixtures
- Phase 6 demo runbook, testing strategy, deployment guide, decisions register, and project-status handover

**What's planned but not yet built or verified**:
- SAPUI5/CAP/Node.js application source and runtime
- SAP HANA Cloud schema deployment and persistence
- AI orchestrator, agents, and model connectivity
- SAP Build Process Automation workflows and Work Zone identity/access configuration
- Live supplier, ERP, logistics, voice, or email integrations
- Executable automated tests and a deployable BTP environment

Documentation, synthetic records, and schemas do not demonstrate that an application feature, service connection, test suite, or deployment is implemented.

### Implementation Agent Expectations

Future implementation agents must:

1. **Not assume features are built** until verified
2. **Check actual implementation status** before referencing capabilities
3. **Build incrementally** following the documentation phases
4. **Maintain consistency** with specifications
5. **Update documentation** to reflect actual state

### Unresolved Decisions

The following decisions remain pending and must not be treated as confirmed:

1. **Customer order allocation policy**
   - Provisional recommendation: healthcare-first balanced allocation
   - Requires final confirmation before implementation

2. **Exact agent architecture**
   - Number of specialized agents
   - Agent names and responsibilities
   - Tool specifications for each agent

3. **External communication providers**
   - Voice call service selection
   - Email service integration
   - SMS/notification services

4. **Detailed integration specifications**
   - Which SAP services are verified vs. simulated
   - API contract specifications
   - Error handling strategies

5. **Security implementation details**
   - Authentication mechanism
   - Authorization model
   - Encryption approach

**Do not implement these as if they are confirmed. Reference the pending decision and propose options for approval.**

## Testing Expectations

### Testing Requirements

1. **Write tests for new features**
   - Unit tests for business logic
   - Integration tests for service interactions
   - End-to-end tests for critical workflows

2. **Test approval workflows**
   - Verify approval gates are enforced
   - Test rejection paths
   - Validate audit trail creation

3. **Test error handling**
   - Simulate API failures
   - Test invalid input handling
   - Verify graceful degradation

4. **Test with synthetic data**
   - Use demo scenario data
   - Create additional test scenarios
   - Never use or reference real pharmaceutical data

### Testing Constraints

1. **Do not test with real patient data**
2. **Do not test with real supplier systems**
3. **Do not send actual emails or make actual calls during testing**
4. **Use clearly marked test accounts and services**

## Version Control and Contribution

### Branching Strategy

1. **Use feature branches** for new development
2. **Never push directly to main** unless explicitly approved
3. **Create descriptive branch names** (e.g., `feature/inventory-dashboard`, `fix/approval-workflow`)

### Commit Guidelines

1. **Write clear commit messages**
   - Summarize the nature of changes
   - Focus on "why" rather than "what"
   - Follow repository commit message style

2. **Commit related changes together**
   - Group logically related changes
   - Separate unrelated changes
   - Avoid massive commits

3. **Do not commit secrets**
   - Never commit `.env` files
   - Never commit credentials or tokens
   - Use `.gitignore` properly

### Pull Request Guidelines

1. **Provide clear PR descriptions**
   - Summarize changes
   - Explain motivation
   - List testing performed

2. **Keep PRs focused**
   - One feature or fix per PR
   - Avoid mixing unrelated changes
   - Keep size manageable for review

3. **Update documentation in the same PR**
   - Include documentation changes
   - Update relevant specs
   - Maintain consistency

## Common Pitfalls to Avoid

### Do Not

1. ❌ Implement automatic execution of high-impact actions without approval
2. ❌ Replace SAP technologies with unrelated frameworks
3. ❌ Claim live SAP integrations when using simulations
4. ❌ Represent synthetic data as real pharmaceutical data
5. ❌ Make unverified supplier, delivery, or financial commitments
6. ❌ Expose secrets or credentials anywhere in code
7. ❌ Bypass approval gates or audit requirements
8. ❌ Implement features not specified in documentation
9. ❌ Change requirements without documentation update
10. ❌ Assume features are implemented without verification

### Do

1. ✅ Read relevant documentation before implementing
2. ✅ Implement mandatory approval workflows
3. ✅ Maintain complete audit trails
4. ✅ Use SAP technology stack as specified
5. ✅ Clearly label synthetic data and simulations
6. ✅ Validate all inputs and handle errors gracefully
7. ✅ Update documentation alongside code changes
8. ✅ Follow security best practices
9. ✅ Test thoroughly with synthetic data
10. ✅ Seek clarification on unresolved decisions

## Getting Help

### When Uncertain

1. **Check existing documentation** in `docs/` directory
2. **Review related code** for established patterns
3. **Consult this AGENTS.md** for constraints and requirements
4. **Document the uncertainty** and propose options for decision

### Escalation

If you encounter:
- Conflicting requirements
- Missing specifications
- Technical blockers
- Unclear approval authority
- Security concerns

**Document the issue clearly and escalate for human decision.**

---

**Remember**: VaxResilience is built on the principle that AI analyzes and recommends, but humans decide. Every implementation choice must respect this principle and maintain the human-in-the-loop governance model.

The quality and integrity of this platform matter because it operates in a pharmaceutical supply-chain context where decisions affect medicine availability and patient access to essential treatments.
