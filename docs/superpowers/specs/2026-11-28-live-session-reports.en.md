[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Live Data session reports

Goal: export the actual latest 300 cycles to JSON and a PDF/HTML summary for a workshop.

Scope covers one vehicle, adapter and ECU scope; missing or changed scopes are not silently combined. Zero is a reading; null is no response, and an absent PID is no recorded sample. Mean is arithmetic, not time weighted. Preserve observation timestamps and explicit pauses. ATRV is adapter voltage, not a battery test.

JSON projects measurement, scaling and scope fields only. No VIN, plates, GPS, DTCs or ECU identification. PDF/HTML contains summary and statistics; complete observations remain in JSON/CSV. A session does not replace a full scan backup before clearing. No import, additional OBD commands, dependencies or data migrations.

Extend the existing buffer and file sharing. Persistent recording would need a new data model; this scope exports existing observations. The user authorized continuous implementation without questions and main only.
