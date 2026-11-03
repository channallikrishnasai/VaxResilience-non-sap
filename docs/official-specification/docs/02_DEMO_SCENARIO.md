# Demonstration Scenario — VaxResilience

**Document version:** 1.0  
**Last updated:** November 2026  
**Project stage:** Documentation Foundation (Phase 1)

---

## 1. Demonstration Company

### BharatMed Pharmaceuticals

**Location:** Hyderabad, India

**Company Type:** Mid-sized pharmaceutical manufacturer

**Key Products:** Essential medicines including analgesics, antibiotics, and cardiovascular medications

### Important Disclaimer

**BharatMed Pharmaceuticals is a fictional demonstration organization created for this hackathon project.**

This is **not a real pharmaceutical company**. All information about BharatMed, including:
- Company operations and facilities
- Supplier relationships
- Customer organizations
- Inventory levels and production data
- Financial information
- Employee roles and names

...is **synthetic demonstration data** created to showcase VaxResilience capabilities.

**This project does not claim:**
- Access to real pharmaceutical company ERP data
- Real patient records or health information
- Actual supplier databases
- Live shipment tracking information
- Real hospital or distributor relationships

---

## 2. Demonstration Product

### Paracetamol Tablets

**Product category:** Analgesic and antipyretic (pain reliever and fever reducer)

**Form:** Oral tablets, 500mg strength

**Use case:** Essential medicine for pain relief and fever management

**Why this product:**
- Essential medicine with wide usage
- Clear supply chain structure
- Significant patient impact if unavailable
- Realistic demonstration of pharmaceutical supply-chain vulnerabilities

### Critical Input Material

**Active Pharmaceutical Ingredient (API):** Paracetamol API powder

**Source:** Imported from China (main supplier)

**Lead time:** 30-45 days including international shipping

**Synthetic usage rate:** 50 kg API per production day, based on 100,000 synthetic tablets/day at 0.0005 kg API/tablet.

---

## 3. Disruption Event

### The Triggering Incident

**Event:** Chinese API supplier factory experiences a disruption

**Cause:** Factory shutdown due to [equipment failure / regulatory inspection / power outage / maintenance issue]

**Impact:** Production and shipment operations suspended

**Duration:** Expected 30-day delay in scheduled shipment

### Shipment Details

**Affected shipment:**
- **Original delivery date:** 2026-09-01 (synthetic fixture)
- **Revised delivery estimate:** 2026-10-01, 30 calendar days after the original ETA (simulated fixture)
- **Shipment quantity:** 1,500 kg of Paracetamol API on the primary purchase order (synthetic fixture)
- **Shipment route:** Suzhou/Shanghai region → Shanghai Port → Nhava Sheva Port, India → Hyderabad facility

**Notification received:** Day 0 of scenario timeline

---

## 4. Current Inventory Situation

### Available Stock

**Current API inventory at BharatMed:** 20 days of production coverage

**Calculation basis:**
- Current stock quantity: 1,000 kg
- Daily production consumption: 50 kg per production day
- Coverage period: 20 production days

### Supply Exposure

**Expected shipment delay:** 30 days

**Available inventory coverage:** 20 days

**Potential uncovered supply period:** 10 days

**Critical calculation:**
```
Delay (30 days) - Available inventory (20 days) = Exposure gap (10 days)
```

**Important note:** The 10-day potential supply gap is calculated from the synthetic 30-day shipment delay and 20-day inventory coverage figures. This represents the period where production could be affected if no alternative supply is secured.

---

## 5. Alternative Supplier

### Backup Supplier Profile

**Supplier:** Indian API manufacturer

**Location:** Hyderabad, India (local)

**Proximity advantage:** Domestic supplier, shorter lead time than international shipment

**Reported available stock:** 10 production days worth of Paracetamol API

### Critical Verification Requirements

**The 10 production days of available stock from the backup supplier must NOT be treated as automatically usable or guaranteed coverage.**

Before this stock can be used, the following verifications are required:

#### 1. Quality Verification
- API quality specifications match BharatMed requirements
- Certificate of Analysis (CoA) review
- Quality testing if needed
- Stability data verification

#### 2. Regulatory Compliance
- Supplier registered with appropriate regulatory authorities
- GMP certification current and valid
- Import/export licenses (if applicable)
- Product registration status

#### 3. Quantity Verification
- Actual available quantity confirmation
- Reserved vs. available stock clarification

#### 4. Capacity Verification
- Supplier capacity and feasible production/fulfilment quantity
- Lead time and minimum order quantity where applicable

#### 5. Supplier Confirmation
- Supplier willingness to sell
- Commercial terms are not populated in the synthetic fixtures and must not be invented

#### 6. Delivery Feasibility
- Transportation time Hyderabad → BharatMed facility
- Packaging and handling requirements
- Delivery scheduling

**Until all verifications are complete, the backup supplier stock cannot be counted as confirmed coverage for the 10-day gap.**

The Phase 5 fixture records six passed checks, a version-bound Supply Chain Head approval, and a simulated 500 kg receipt for this fictional scenario only. These records are pre-authored demonstration history, not real qualification evidence, a live supplier confirmation, or a live purchase. At the scenario's initial evaluation point, the stock remains unverified until the six checks are recorded.

---

## 6. Affected Supply Chain Route

### Primary International Route

**Main supply path:**

```
Supplier Factory (Suzhou/Shanghai region, China)
    ↓
Shanghai Port (Export)
    ↓ (Ocean freight: 15-20 days)
Nhava Sheva Port, India (Import)
    ↓ (Customs clearance: 3-5 days)
Domestic Transport (Truck/Rail: 2-3 days)
    ↓
BharatMed Manufacturing Facility (Hyderabad)
```

**Normal total transit time:** 30-45 days door-to-door

**Disrupted segment:** Supplier factory (production/shipping suspended)

### Alternative Route (Under Evaluation)

**Backup domestic route:**

```
Indian API Supplier (Hyderabad)
    ↓ (Domestic transport: 1-2 days)
BharatMed Manufacturing Facility (Hyderabad)
```

**Advantage:** Significantly shorter lead time

**Requirements:** Subject to all verification requirements listed above

---

## 7. Customer Organizations

### Five Fictional Customer Entities

All customer organizations are **fictional demonstration entities** created for this scenario.

#### 1. Hospital A
- **Location:** Hyderabad, India
- **Type:** Multi-specialty hospital
- **Relationship:** Direct supply agreement
- **Synthetic demo order:** 100,000 tablets; recurring typical volume is not specified
- **Current order status:** Fulfilled in the synthetic simulation on 2026-10-15

#### 2. Hospital B
- **Location:** Bengaluru, India
- **Type:** General hospital
- **Relationship:** Direct supply agreement
- **Synthetic demo order:** 100,000 tablets; recurring typical volume is not specified
- **Current order status:** Fulfilled in the synthetic simulation on 2026-10-15

#### 3. Medical Distributor
- **Location:** Mumbai, India
- **Type:** Pharmaceutical distributor serving retail pharmacies
- **Relationship:** Distribution agreement
- **Synthetic demo order:** 100,000 tablets; recurring typical volume is not specified
- **Current order status:** Fulfilled in the synthetic simulation on 2026-10-15

#### 4. Export Importer A
- **Location:** Nairobi, Kenya
- **Type:** Import and distribution
- **Relationship:** Export supply agreement
- **Synthetic demo order:** 100,000 tablets; recurring typical volume is not specified
- **Current order status:** Fulfilled in the synthetic simulation on 2026-10-15

#### 5. Export Importer B
- **Location:** London, United Kingdom
- **Type:** Import and distribution
- **Relationship:** Export supply agreement
- **Synthetic demo order:** 100,000 tablets; recurring typical volume is not specified
- **Current order status:** Fulfilled in the synthetic simulation on 2026-10-15

---

## 8. Potential Operational Impact

### Manufacturing Impact

**Without alternative supply:**
- Production continues normally: Days 1-20
- Production impacted or halted: Days 21-30
- Production resumes (if Chinese shipment arrives): Day 31+

**With verified alternative supply:**
- Production continues normally throughout recovery period
- Gradual transition back to primary supplier

### Inventory Allocation Challenge

**Scenario:** If production is impacted during days 21-30, available finished goods inventory must be allocated across customers.

**Allocation considerations:**
- Hospital urgent care requirements
- Contractual delivery commitments
- Customer priority and relationship importance
- Geographic medicine availability concerns
- Export obligations

**Provisional allocation policy (pending confirmation):**
- **Healthcare-first balanced allocation**
- Priority to critical hospital requirements
- Consider delivery deadlines and contractual commitments
- Balance customer importance with available quantities
- Respect operational and logistics constraints

**Important:** The final customer allocation policy has not been explicitly confirmed and requires stakeholder approval before implementation.

### Patient Impact Estimation

**Approach:** Estimate potential medicine availability impact across customer locations based on:
- Available inventory coverage
- Customer consumption patterns
- Delivery commitment timelines
- Healthcare facility urgency levels
- Recovery timeline projections

**Important disclaimers:**
- All patient impact figures are **estimates** derived from operational data
- Based on **synthetic demonstration data** in this project
- **Clearly distinguished from verified facts**
- **Does not claim to predict actual patient outcomes**
- Should not be interpreted as medical predictions

---

## 9. Disruption-to-Recovery Workflow

### Step-by-Step Recovery Process

#### Phase 1: Detection and Analysis (Day 0-1)
1. **Detect disruption** — Receive notification from Chinese supplier
2. **Analyze extent** — Confirm 30-day shipment delay
3. **Calculate exposure** — Determine 20-day inventory coverage, 10-day potential gap
4. **Alert stakeholders** — Notify Supply Chain Head and relevant managers

#### Phase 2: Alternative Supplier Evaluation (Day 1-3)
5. **Identify backup supplier** — Locate Hyderabad-based alternative with reported 10 days stock
6. **Verify quality** — Review quality specifications, CoA, testing requirements
7. **Check regulatory** — Confirm GMP certification, regulatory approvals
8. **Validate capacity** — Verify actual available quantity and delivery capability
9. **Assess logistics** — Calculate delivery timeline and feasibility

#### Phase 3: Recovery Plan Development (Day 3-5)
10. **Prepare purchase recommendation** — Draft procurement proposal for alternative supplier
11. **Calculate inventory allocation** — Determine optimal allocation across customers
12. **Recommend production schedule** — Adjust manufacturing schedule based on available materials
13. **Plan customer communications** — Prepare communications for affected customers
14. **Track delayed shipment** — Continue monitoring Chinese shipment status

#### Phase 4: Human Approval (Day 5-6)
15. **Present recovery plan** — Submit comprehensive plan to Supply Chain Head
16. **Procurement Manager review** — Evaluate supplier recommendation and pricing
17. **Factory Manager review** — Confirm production schedule feasibility
18. **Obtain required approvals** — Secure authorization for:
    - Alternative supplier purchase
    - Inventory allocation decisions
    - Production schedule changes
    - Customer communications

#### Phase 5: Execution (Day 6-10)
19. **Execute approved actions:**
    - Place purchase order with backup supplier
    - Coordinate delivery logistics
    - Implement revised production schedule
    - Allocate inventory per approved plan
20. **Coordinate internal communications** — Conduct AI voice calls with internal stakeholders
21. **Send approved external emails:**
    - Supplier coordination
    - Customer notifications (if required)
    - Hospital communications (if needed)

#### Phase 6: Monitoring and Recovery (Day 10-30)
22. **Monitor inventory** — Track API delivery and consumption
23. **Monitor production** — Verify manufacturing proceeds per schedule
24. **Monitor deliveries** — Ensure customer commitments met
25. **Track Chinese shipment** — Monitor original shipment progress
26. **Adjust as needed** — Respond to any deviations from plan

#### Phase 7: Incident Closure (Day 30+)
27. **Verify recovery** — Confirm supply, manufacturing, and deliveries at acceptable normal levels
28. **Document lessons learned** — Record incident details and improvement opportunities
29. **Close incident** — Mark disruption as recovered

---

## 10. Human Approval Points

### Actions Requiring Explicit Authorization

Throughout the recovery workflow, these eight action categories **always require Supply Chain Head final human approval** before execution:

1. Purchase from an alternative supplier.
2. Transfer inventory between warehouses.
3. Change a factory production schedule.
4. Prioritize or reallocate customer orders.
5. Change shipment routes or carriers.
6. Send a major disruption notification to customers.
7. Approve a payment or financial commitment.
8. Add or change an approved supplier.

Operational managers provide relevant reviews and evidence; those reviews do not replace the Supply Chain Head's final approval.

**AI Role:** Prepare recommendations, draft communications, provide supporting analysis

**Human Role:** Review context, approve/reject/modify actions, provide final authorization

---

## 11. Communication Scenarios

### Internal Voice Calls

**Human-requested AI-assisted calls with:**
- Supply Chain Head — Overall situation briefing and approval coordination
- Procurement Manager — Supplier evaluation and purchase recommendation
- Factory Manager — Production schedule impact and adjustment feasibility
- Logistics Manager — Delivery coordination and tracking

**Call objectives:**
- Gather operational information
- Capture stakeholder input
- Clarify requirements
- Confirm feasibility
- Document responses

**Requirements:**
- Appropriate consent and applicable requirements
- Call summaries for audit trail
- Clear identification as AI system

### External Email Communications

**AI-drafted emails requiring approval:**

**To Chinese supplier:**
- Shipment status inquiry
- Revised delivery timeline request
- Quality documentation coordination

**To Indian backup supplier:**
- Stock availability inquiry
- Quality and regulatory documentation request
- Purchase order (after approval)

**To hospitals (if needed):**
- Potential delivery impact notification
- Revised delivery schedule
- Supply situation transparency

**To distributor and export importers (if needed):**
- Delivery schedule updates
- Allocation decisions
- Availability transparency

**Email workflow:**
1. AI drafts email based on situation and recipient
2. Authorized manager reviews draft
3. Manager approves, modifies, or rejects
4. System sends only after explicit approval

**Constraints:**
- AI never makes unverified delivery commitments
- AI never invents pricing or financial terms
- AI never sends sensitive communications without authorization

---

## 12. Expected Recovered State

### Recovery Success Criteria

**Supply:**
- Alternative supplier API received and verified
- Chinese shipment tracking shows expected arrival
- API inventory coverage restored to acceptable levels

**Manufacturing:**
- Production schedule restored to normal or near-normal
- No unplanned production stoppages
- Raw material inventory adequate for planned production

**Customers:**
- All approved customer deliveries completed
- Customer commitments met or rescheduled with agreement
- No critical hospital stockouts

**Operations:**
- Supply chain operations returned to stable state
- All stakeholder communications completed
- Audit trail complete and accurate

**Metrics:**
- Days to recovery plan approval: Target ≤ 6 days
- Days to execute recovery: Target ≤ 15 days
- Customer orders at risk: 0
- Production days lost: 0 (with successful alternative supply)

---

## 13. Scenario Data Summary

### Key Scenario Parameters

| Parameter | Value | Status | Notes |
|-----------|-------|--------|-------|
| Product | Paracetamol tablets, 500mg | Synthetic demo input | Essential medicine for demonstration |
| Main API source | China (Suzhou/Shanghai region) | Synthetic demo input | International supplier dependency |
| Disruption type | Factory shutdown | Synthetic demo input | Realistic disruption scenario |
| Shipment delay | 30 days | Synthetic demo input | Significant but recoverable delay |
| Available inventory | 20 days coverage | Synthetic demo input | Calculated from stock and consumption |
| Potential supply gap | 10 days | Calculated from scenario inputs | 30 days delay - 20 days inventory |
| Backup supplier location | Hyderabad, India | Fictional demo entity | Domestic alternative advantage |
| Backup available stock | 500 kg / 10 production days | Synthetic fixture reports passed checks and a simulated receipt | Fictional demo state only; six checks and human approval do not qualify a real supplier |
| Customer organizations | 5 fictional entities | Fictional demo entities | 2 hospitals, 1 distributor, 2 export importers |
| Affected route | China → Shanghai Port → Nhava Sheva Port → Hyderabad | Synthetic demo route | Realistic international logistics path |

### Important Calculation

**The scenario's 10-day potential supply gap is calculated as:**

```
Shipment delay (30 days) - Available inventory coverage (20 days) = 10 days exposure
```

The fixture expresses shipment lateness as 30 calendar days and opening inventory coverage as 20 production days. The 10-day result follows the project's documented planning-day comparison; a production calendar/day-basis conversion is not defined. It is an unresolved modelling assumption, not a calendar-aware forecast.

**The backup supplier's reported 500 kg (10 synthetic production days) of stock:**
- **Must not** be treated as guaranteed coverage
- **Must not** be automatically subtracted from the 10-day gap
- **Requires** all six quality, regulatory, quantity, capacity, supplier-confirmation, and delivery checks before it can inform an operational plan
- **May not** cover the full 10-day gap depending on actual availability and lead time

---

## 14. Demonstration Timeline

### Planned Demo Flow (15-20 minutes)

This is the target product flow, not current application behavior. The repository-only walkthrough uses static synthetic records; demonstrate an interactive step only from a separately verified, isolated build.

**Minute 0-2: Normal Operations**
- Show BharatMed's dashboard in normal state
- Display supply chain digital twin
- Show current inventory and production status

**Minute 2-3: Disruption Trigger**
- In a future isolated application build, use a clearly labelled demo control to trigger the synthetic Chinese supplier disruption
- For a static walkthrough, show the pre-authored shipment delay and incident records
- Do not imply real external disruption detection or live notification

**Minute 3-5: AI Analysis**
- Present the documented analysis and synthetic fixture summary; show runtime agent output only if a verified build exists
- Explain the inventory coverage input (20 production days)
- Highlight the documented 10-day potential comparison and its unresolved day-basis assumption
- Trace the disrupted route in the conceptual Digital Twin or fixture

**Minute 5-7: Alternative Supplier Evaluation**
- Show AI identifying Hyderabad backup supplier
- Display quality and regulatory verification process
- Show agent preparing purchase recommendation

**Minute 7-9: Recovery Plan Presentation**
- Show comprehensive recovery plan in AI War Room
- Display inventory allocation recommendations
- Show production schedule adjustments
- Present customer communication drafts

**Minute 9-11: Human Approval**
- Show Supply Chain Head reviewing recommendations
- Demonstrate approval workflow interface
- Show approval granted with audit trail created

**Minute 11-13: Execution**
- Show approved purchase order sent to backup supplier
- Demonstrate AI voice call with Procurement Manager
- Show approved email being sent to Chinese supplier

**Minute 13-15: Monitoring**
- Display updated inventory status
- Show production schedule proceeding
- Show customer delivery status maintained

**Minute 15-17: Recovery Status**
- Show incident progressing toward resolution
- Display complete audit trail
- Show all approvals and actions documented

**Minute 17-20: Q&A and Architecture Overview**
- Explain technical architecture
- Discuss human-in-the-loop governance
- Answer judge questions

---

## 15. Failure Contingency

### Backup Plans

**If live demo encounters technical issues:**

1. **Preloaded scenario** — Have the disruption scenario already loaded and analyzed
2. **Recorded walkthrough** — Video recording of full working demonstration
3. **Static screenshots** — Key screens showing major capabilities
4. **Architecture explanation** — Fall back to architecture and design discussion

**Prepare in advance:**
- Test full demo flow multiple times
- Record successful run as backup
- Create screenshot deck as fallback
- Prepare architecture diagrams for discussion

---

## 16. Data Integrity Statement

### Synthetic Data Declaration

**This demonstration scenario uses entirely synthetic data:**

- BharatMed Pharmaceuticals is a fictional company
- All supplier relationships are fictional
- All customer organizations are fictional
- All inventory levels and consumption rates are synthetic
- All financial values and pricing are synthetic
- All shipment details and tracking are simulated
- All patient impact estimates are calculated from synthetic inputs

**This project does not:**
- Access real pharmaceutical company data
- Use real patient health records
- Connect to actual supplier systems
- Track real shipments
- Make claims about actual medicine availability
- Predict actual patient outcomes

**All scenario data is created for demonstration purposes to showcase VaxResilience capabilities in a realistic pharmaceutical supply-chain context.**

---

## Related Documentation

- [README.md](../README.md) — Project overview
- [docs/00_PROJECT_OVERVIEW.md](00_PROJECT_OVERVIEW.md) — Detailed project overview
- [docs/01_BUSINESS_PROBLEM.md](01_BUSINESS_PROBLEM.md) — Business problem analysis

---

**Document Status:** Phase 1 source scenario; later phases add concrete synthetic fixture values and implementation-ready handover material.
**Current repository status:** See [PROJECT_STATUS.md](PROJECT_STATUS.md).
**Maintained By:** VaxResilience Project Team
