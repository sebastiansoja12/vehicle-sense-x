[Polski](2026-11-28-ecu-identification.md) | [English](2026-11-28-ecu-identification.en.md) | [Deutsch](2026-11-28-ecu-identification.de.md)

# ECU identification · 0.6.0 / 8

Source 0.6.0/build 8 adds a separate full CAN scan with CALID, CVN and controller name. Cockpit, emissions readiness, oil temperature and workshop comparisons from main are preserved.

## Verification

After integration, 356 source tests passed; two additional review regressions bring the source suite to 358. The complete local main workspace with preserved interface edits has 371 passing tests. Types, lint and PL/EN/DE documentation pass. Review fixed mixed pending/NO DATA responses and missing readiness/oil data in basic exports.

The 0.6.0 iOS/Android builds are being verified separately. Existing 0.5.0 packages do not contain ECU identification or later main changes. Physical adapter/phone, native PDF and radio projection tests have not been performed. Signed iOS distribution requires an active Apple Developer account and appropriate CarPlay entitlements.

[Guide and scope](../../mobile/ECU-IDENTIFICATION.en.md)
