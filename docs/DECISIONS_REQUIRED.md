# Decisions required before dependent capabilities are enabled

Implementation-facing detail and current blocked work are indexed in [`OPEN_DECISIONS.md`](OPEN_DECISIONS.md).

No business, governance, identity, or platform decision was made during implementation. All items below retain the official status in the [authoritative decision register](official-specification/docs/11_DECISIONS_AND_OPEN_QUESTIONS.md). “Pending” and “proposed” do not authorize a default.

| ID | Official topic | Current status |
|---|---|---|
| D-01 | Calendar-day vs production-day calculation | Pending |
| D-02 | Final specialist-agent roster | Proposed, not approved |
| D-03 | AI model/provider and deployment | Pending |
| D-04 | Agent communication protocol and orchestration topology | Pending |
| D-05 | Voice provider | Pending |
| D-06 | Email provider | Pending |
| D-07 | SAP service availability and actual integration set | Pending verification |
| D-08 | Customer allocation policy | Pending |
| D-09 | Backup supplier qualification rule | Pending operational specification |
| D-10 | Data retention, audit integrity and privacy | Pending |
| D-11 | Authentication, identity and role authorization | Pending |
| D-12 | Final API contracts and lifecycle rules | Proposed, not frozen |
| D-13 | HANA data model, tenant isolation and migrations | Proposed |
| D-14 | Demo metric and impact methodology | Pending |
| D-15 | Emergency pause/stop, global kill switch, manual override and resume authority | Pending |
| D-16 | Non-major email and voice approval/consent policy | Pending |
| D-17 | BTP deployment configuration and operating model | Pending |
| D-18 | Business model and commercial target | Pending |
| D-19 | Approval lifecycle policy | Pending |

The full source register is preserved unchanged. Resolve each item with its accountable owner and record rationale, affected contracts/tests, and validation evidence before enabling dependent behavior. In particular, no 30-calendar-day versus 20-production-day subtraction, backup-stock usability, customer allocation, autonomous approval, external communication, or live SAP connection is assumed by this code.
