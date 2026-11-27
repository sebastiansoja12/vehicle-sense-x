[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Advanced OBD diagnostics — Implementation plan

> superpowers:executing-plans

Goal: expanded scans of real data, emissions monitors, freeze frame, parameter selection, charts and exports.

Extend the existing ELM327 driver. Basic scans stay fast; extended scans read supported standard PIDs, PID 01 readiness and service 02 frame 0. Data always belongs to the selected ECU. Unavailable readings remain unknown.

[Spec](../specs/2026-11-27-advanced-diagnostics.en.md)

## Review cases

An optional version 1 extension preserves old reports and garage schema 3. All new data is validated on import. AI still receives only the existing basic fields. Clearing requires an exact backup of the current report and confirmation. Do not add fabricated sensors, condition scores, universal ABS/airbag coverage, ECU coding or actuator activation. Hardware remains unverified until phone and vehicle testing.

## Tasks

- [x] Write decoder, readiness-bit and service 02 tests; observe failure, implement parsers and extension validation.
- [x] Test and implement PID paging, extended scans, selected Live Data, frame 0 and clear guards.
- [x] Test reports, CSV, a 300-cycle history and scope-aware comparison; connect screens and exports.
- [ ] Run full tests, types, lint, documentation and exports; request review, address findings, commit and push.

`mobile/src/obd/parameters.ts` · `mobile/src/obd/readiness.ts` · `mobile/src/obd/types.ts` · `mobile/src/obd/driver.ts` · `mobile/src/obd/DiagnosticDetails.tsx` · `mobile/src/obd/live-history.ts` · `mobile/src/reports.ts` · `mobile/tests/obd-advanced.test.mjs`
