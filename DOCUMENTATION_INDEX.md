# VaxResilience documentation index

## Project status and operating guides

- [Implementation progress](IMPLEMENTATION_PROGRESS.md) — evidence-based roadmap status.
- [Architecture](docs/sap-architecture/ARCHITECTURE.md) — target boundaries and current implementation.
- [Decisions required](docs/DECISIONS_REQUIRED.md) — status summary linked to the unchanged authoritative D-01–D-19 register.
- [Integration reference](docs/INTEGRATION_REFERENCE.md) — CAP integration journal and third-party reference patterns.
- [Test report](docs/TEST_REPORT.md) — commands actually run and results.
- [Deployment guide](docs/DEPLOYMENT_GUIDE.md) — local run steps and BTP prerequisites.

## Preserved source material

- [`docs/official-specification/`](docs/official-specification/) contains the official `PHASES.md`, original specification docs, JSON Schemas, synthetic fixtures, prompts, `AGENTS.md`, and source `README.md`. These files are copied without changing their contents. The official roadmap remains authoritative.
- [`docs/sap-integration/`](docs/sap-integration/) contains selected architecture, operations, reliability, security, testing, development, deployment, and limitation references from `kulikovskyi-maksym/sap-integration-operation-console`. Its MIT license and copyright notice are preserved in that directory. These are third-party patterns, not VaxResilience requirements or evidence of a connected SAP system.
- The Python implementation's existing [README](README.md), [architecture documentation](docs/architecture.md), and [local setup guide](LOCAL_SETUP.md) remain in place.

## Source repositories inspected

1. `channallikrishnasai/VaxResilience-non-sap` — primary Python implementation; feature work is on `feat/sap-foundation-monitoring`.
2. `Pavan-Gowda-S/VaxResilience` — official specification and `PHASES.md` roadmap.
3. `kulikovskyi-maksym/sap-integration-operation-console` — technical reference only; no wholesale merge.
