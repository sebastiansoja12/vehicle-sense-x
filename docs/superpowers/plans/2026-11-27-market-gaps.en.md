[Polski](2026-11-27-market-gaps.md) | [English](2026-11-27-market-gaps.en.md) | [Deutsch](2026-11-27-market-gaps.de.md)

# Market research and missing features

> For agentic workers: use superpowers:executing-plans and test-driven-development.

Goal: compare official Car Scanner, OBDeleven, Carista, Carly, Fuelio, Drivvo, FIXD and Smartcar capabilities against VehicleSenseX as of 27 November 2026; implement verifiable gaps and a differentiator without fake data.

Approach: manufacturer documentation without buying hardware or accessing private accounts. Prices and marketing do not prove specific vehicle support. Absence from competitor documentation does not prove worldwide uniqueness.

Task 1: OBD readiness. Test parsing, spark/compression engines, unavailable monitors, MIL, counters, missing data, bad frames, CAN and clear guards before implementation. New mobile/src/obd/readiness.ts; shared byte parser in protocol.ts; optional validated DiagnosticSnapshot readiness; driver.ts requests only advertised PID 01/30/31 in full scans. No extra Live Data requests or swallowed transport errors. Preserve storage/backups, show scope in UI/reports.

Task 2: evidence audit. Test vehicle isolation, date-ordered mileage without within-day assumptions, imports/ECU/statuses and missing post-service readings. Add mobile/src/vehicle-evidence.ts, VehicleEvidenceScreen.tsx and vehicle-evidence.tsx route. Use existing data without new storage. No health score or odometer fraud accusation. Link selected reading IDs to before/after comparison and explain day-level dates.

Task 3: PL/EN/DE market report and docs, full repository tests, types, lint, web/Hermes exports and independent review. No hardware compatibility claims. User authorized decisions and execution without more questions; preserve concurrent changes.
