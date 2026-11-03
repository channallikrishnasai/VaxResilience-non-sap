# Sarvam Voice Agent readiness for the BharatMed demo

## Current implementation status

The AI Command Centre shows the official synthetic internal Procurement Manager call record (`CALL-PROC-001`) as `completed_simulated`. Its verbal summary is unverified. The application does not call Sarvam and does not place phone calls.

The project owner selected Sarvam as the desired voice provider and supplied an API key. A key by itself does not connect this application to a Sarvam Voice Agent or a phone line. No key belongs in this repository, browser code, UI configuration, or chat messages.

Sarvam's documentation describes Voice Agents for telephony and web voice, with 11 Indian languages plus English. Telephony requires a connection and phone number through a provider or a number provisioned by Sarvam. These are vendor-documented capabilities, not verification that this project has access, that an agent is configured, or that a particular deployment meets legal or company policy.

## Needed before implementing or testing live calls

1. Create a Sarvam Voice Agents workspace and a committed agent version for the synthetic supplier-coordination scenario.
2. Configure a telephony connection and an internal test caller number, or choose a browser voice session instead of a phone call.
3. Provide the non-secret identifiers required for the selected channel: organization, workspace, agent/app and committed version; for phone calls also the connection and caller-number identifiers.
4. Store the Voice Agents workspace API key in a local secret store or runtime binding. Do not paste it into source files or the UI.
5. Resolve D-05/D-16 call policy details: human initiation, permitted internal test recipient, consent evidence, AI disclosure, recording/transcription, retention, and how call outcomes are recorded. Confirm D-11 identity/session scope for the caller.
6. Use only the project's fictional scenario and a recipient explicitly approved for the test. No routine tests should dial a number.

Until the above is configured and reviewed, the call UI remains an honest scenario preview. It does not expose a live call action or display the fixture as a Sarvam result.

## Sarvam references

- [Voice Agents overview](https://docs.sarvam.ai/voice-agents/overview)
- [Phone numbers and telephony connections](https://docs.sarvam.ai/voice-agents/deploy/telephony)
- [Create an outbound call API](https://docs.sarvam.ai/voice-agents/api/instant-outbound/create)
- [Web Voice Agents SDK](https://docs.sarvam.ai/voice-agents/deploy/sdks/web)

The web SDK guidance explicitly says to keep the API key server-side and use a backend proxy. The outbound-call API requires organization/workspace context and a configured agent plus telephony connection. No Sarvam endpoint is called by this application yet.
